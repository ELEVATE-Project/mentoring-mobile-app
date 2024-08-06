import { Injectable, Injector } from '@angular/core';
import { RequestParams } from '../../interface/request-param';
import * as _ from 'lodash-es';
import { UserService } from '../user/user.service';
import { NetworkService } from '../network.service';
import { ToastService } from '../toast.service';
import { LoaderService } from '../loader/loader.service';
import { LocalStorageService } from '../localstorage.service';
import { urlConstants } from '../../constants/urlConstants';
import { localKeys } from '../../constants/localStorage.keys';
import { AuthService } from '../auth/auth.service';
import { AlertController, ModalController } from '@ionic/angular';
import { FeedbackPage } from 'src/app/pages/feedback/feedback.page';
import { CapacitorHttp } from '@capacitor/core';
import { TranslateService } from '@ngx-translate/core';


@Injectable({
  providedIn: 'root',
})
export class HttpService {
  baseUrl;
  isFeedbackTriggered = false;
  isAlertOpen: any = false;
  extraHeaders

  constructor(
    private userService: UserService,
    private network: NetworkService,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private localStorage: LocalStorageService,
    private injector: Injector,
    private modalController: ModalController,
    private translate: TranslateService,
    private alert: AlertController,
  ) {  
    this.baseUrl = window['env']['baseUrl'];
  }

  async setHeaders() {
    let token;
    if(!window['env']['isAuthBypassed']) {
      token = await this.getToken();
    }
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const acceptLanguage = await this.localStorage.getLocalData(localKeys.SELECTED_LANGUAGE);
    const headers = {
      'x-authenticated-user-token': token ? token : "",
      'Content-Type': 'application/json',
      'timeZone': timezone,
      'accept-language':acceptLanguage
    }
    this.extraHeaders = JSON.parse(localStorage.getItem('headers'))
    if(this.extraHeaders) {
      Object.keys(this.extraHeaders).forEach(key => {
        headers[key] = this.extraHeaders[key];
      });
    }
    console.log(JSON.stringify(headers))
    return headers;
  }

  async post(requestParam: RequestParams) {
    if (!this.checkNetworkAvailability()) {
      throw Error(null);
    }
    let defaultHeaders = await this.setHeaders();
    const headers = requestParam.headers ?  { ...requestParam.headers, ...defaultHeaders } : defaultHeaders;
    let body = requestParam.payload ? requestParam.payload : {};
    const options = {
      url: this.baseUrl + requestParam.url,
      headers: headers,
      data: body,
    };
    return CapacitorHttp.post(options)
      .then((data: any) => {
        let result: any = data.data;
        if (result.responseCode === "OK") {
          return result;
        } else {
          this.handleError(data)
        }
      });
  }

  async get(requestParam: RequestParams) {
    if (!this.checkNetworkAvailability()) {
      throw Error(null);
    }
    const headers = requestParam.headers ? requestParam.headers : await this.setHeaders();
    const options = {
      url: this.baseUrl + requestParam.url,
      headers: headers,
      params: {},
    };
    return CapacitorHttp.get(options)
      .then((data: any) => {
        let result: any = data.data;
        if(result?.meta?.data?.length && !this.isFeedbackTriggered){
          this.isFeedbackTriggered = true;
          this.openModal(result?.meta?.data[0]);
        }
        if (result.responseCode === "OK") {
          return result;
        } else {
          this.handleError(data)
          return data;
        }
      });
  }

  async delete(requestParam: RequestParams) {
    if (!this.checkNetworkAvailability()) {
      throw Error(null);
    }
    const headers = requestParam.headers ? requestParam.headers : await this.setHeaders();
    const options = {
      url: this.baseUrl + requestParam.url,
      headers: headers,
      data: '',
    };
    return CapacitorHttp.delete(options)
      .then((data: any) => {
        let result: any = data.data;
        if (result.responseCode === "OK") {
          return result;
        } else {
          this.handleError(data)
        }
      });
  }

  async patch(requestParam: RequestParams) {
    if (!this.checkNetworkAvailability()) {
      throw Error(null);
    }
    let body = requestParam.payload ? requestParam.payload : {};
    const headers = requestParam.headers ? requestParam.headers : await this.setHeaders();
    const options = {
      url: this.baseUrl + requestParam.url,
      headers: headers,
      data: body,
    };
    return CapacitorHttp.patch(options)
      .then((data: any) => {
        let result: any = data.data;
        if (result.responseCode === "OK") {
          return result;
        } else {
          this.handleError(data)
        }
      });
  }

  //network check
  async checkNetworkAvailability() {
    await this.network.getCurrentStatus()
    if (!this.network.isNetworkAvailable) {
      this.toastService.showToast('MSG_PLEASE_NETWORK', 'danger')
      return false;
    } else {
    return true;
    }
  }

  //token validation and logout 

  async getToken() {
    let token = _.get(this.userService.token, 'access_token');
    if (!token) {
      return null;
    }
    let isValidToken = this.userService.validateToken(token);
    if (!isValidToken) {
      let data: any = await this.getAccessToken();
      let access_token = _.get(data, 'access_token');
      if (!access_token) {
        let authService = this.injector.get(AuthService);
        await authService.logoutAccount();
      }
      this.userService.token['access_token'] = access_token;
      await this.localStorage.setLocalData(localKeys.TOKEN, this.userService.token);
    }
    let userToken = 'bearer ' + _.get(this.userService.token, 'access_token');
    return userToken;
  }

  async getAccessToken() {
    if (!this.checkNetworkAvailability()) {
      throw Error(null);
    }
    const options = {
      url: this.baseUrl + urlConstants.API_URLS.REFRESH_TOKEN,
      headers: {
        'Content-Type': 'application/json',
      },
      data: {
        refresh_token: _.get(this.userService.token, 'refresh_token')
      },
    };
    return CapacitorHttp.post(options)
      .then((data: any) => {
        let result: any = data.data;
        if (result.responseCode === "OK") {
          return result.result
        } else {
          this.handleError(data)
        }
      });
  }

  public handleError(result) {
    let msg = result.data.message;
    switch (result.status) {
      case 400:
      case 406:
      case 422:
      case 404:
        this.toastService.showToast(msg ? msg : 'SOMETHING_WENT_WRONG', 'danger')
        break
      case 401:
          this.triggerLogoutConfirmationAlert(result)

        break
      default:
        this.toastService.showToast(msg ? msg : 'SOMETHING_WENT_WRONG', 'danger')
    }
    throw Error(result);
  }

  async openModal(sessionData) {
    const modal = await this.modalController.create({
      component: FeedbackPage,
      componentProps: {
        data: sessionData,
      }
    });
    await modal.present();
    const isModelClosed = await modal.onWillDismiss();
    this.isFeedbackTriggered = isModelClosed.data;
  }

  async triggerLogoutConfirmationAlert(result) {
    if(await this.modalController.getTop()) {
      await this.modalController.dismiss()
    }
    let msg = result.data.message;
    if (result && !this.isAlertOpen) {
      let texts: any;
      this.translate
        .get(['OK'])
        .subscribe((text) => {
          texts = text;
        });
        this.isAlertOpen = true;
      const alert = await this.alert.create({
        message: msg,
        buttons: [
          {
            text: texts['OK'],
            role: 'cancel',
            cssClass: 'alert-button-red',
            handler: () => {
              this.isAlertOpen = false;
            },
          },
        ],
        backdropDismiss: false
      });
      await alert.present();
      let data = await alert.onDidDismiss();
      if (data.role == 'cancel') {
        let auth = this.injector.get(AuthService);
        auth.logoutAccount(true);
      }
      return false;
    } else {
      return true;
    }
  }

 async getFile(requestParam: RequestParams){
    
    const headers = requestParam.headers ? requestParam.headers : await this.setHeaders();
    const options = {
      url: this.baseUrl + requestParam.url,
      headers: headers,
      params: {},
    };
    return CapacitorHttp.get(options)
      .then((data: any) => {
        if (data.status == 200) {
          return data;
        } else {
          this.handleError(data)
          return data;
        }
      });
  }
}
