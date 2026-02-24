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
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class HttpService {
  baseUrl;
  isFeedbackTriggered = false;
  isAlertOpen: any = false;
  extraHeaders;
  private httpClient = CapacitorHttp;

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
    private router : Router,
    private toast: ToastService
  ) {
    this.baseUrl = environment['baseUrl'];
  }

  async setHeaders() {
    let token = await this.getToken();
    if(!token) {
      return null;
    }
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const acceptLanguage = await this.localStorage.getLocalData(localKeys.SELECTED_LANGUAGE);
    const headers = {
      'X-auth-token': token ? token : "",
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
    return headers;
  }

  async post(requestParam: RequestParams) {
    if (!(await this.checkNetworkAvailability())) {

      throw Error(null);
    }

    let defaultHeaders = await this.setHeaders();
    const headers = requestParam.headers ?  { ...requestParam.headers, ...defaultHeaders } : defaultHeaders;
    let body = requestParam.payload ? requestParam.payload : {};
    if (body?.time_zone) {
      headers.timeZone = body.time_zone;
    }
    const options = {
      url: this.baseUrl + requestParam.url,
      headers: headers,
      data: body,
    };
    return this.httpClient.post(options)
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
    if (!(await this.checkNetworkAvailability())) {
      throw Error(null);
    }
    const headers = requestParam.headers ? requestParam.headers : await this.setHeaders();
    const options = {
      url: this.baseUrl + requestParam.url,
      headers: headers,
      params: {},
    };
    return this.httpClient.get(options)
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
    if (!(await this.checkNetworkAvailability())) {
      throw Error(null);
    }
    const headers = requestParam.headers ? requestParam.headers : await this.setHeaders();
    const options = {
      url: this.baseUrl + requestParam.url,
      headers: headers,
      data: '',
    };
    return this.httpClient.delete(options)
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
    if (!(await this.checkNetworkAvailability())) {
      throw Error(null);
    }
    let body = requestParam.payload ? requestParam.payload : {};
    const headers = requestParam.headers ? requestParam.headers : await this.setHeaders();
    const options = {
      url: this.baseUrl + requestParam.url,
      headers: headers,
      data: body,
    };
    return this.httpClient.patch(options)
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


  async getToken() {
    const token = await this.userService.getUserValue();
    //need to verify token validity
    if (!token) {
      return null;
    }

    // these are commented because of old mentor flow changes
    // if (!isValidToken) {
    //   let data: any = await this.getAccessToken();
    //   let access_token = _.get(data, 'access_token');
    //   if (!access_token) {
    //       let authService = this.injector.get(AuthService);
    //     await authService.logoutAccount();
    //   }
    //   this.userService.token['access_token'] = access_token;
    //   await this.localStorage.setLocalData(localKeys.TOKEN, this.userService.token);
    // }
    return token;
  }

  async getAccessToken() {
    if (!(await this.checkNetworkAvailability())) {
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
    return this.httpClient.post(options)
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
    if (result.url.includes(urlConstants.API_URLS.GET_CHAT_TOKEN)) {
      return;
    }
    if(result.url.includes("interface/v1/profile/get")) {
      throw result;
    }
    switch (result.status) {
      case 400:
      case 406:
      case 422:
      case 404:
        this.toastService.showToast(msg ? msg : 'SOMETHING_WENT_WRONG', 'danger')
        break
      case 401:
        let auth = this.injector.get(AuthService);
        if (result.data.message && result.data.message.startsWith('Congratulations')) {
          this.triggerLogoutConfirmationAlert(result);
        } else {
          localStorage.clear();
          auth.clearLocalData();
          this.redirectToOrigin();
        }
        break;
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
    this.toast.setDisableToast(true);
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
              this.toast.setDisableToast(false);
            },
          },
        ],
        backdropDismiss: false
      });
      await alert.present();
      let data = await alert.onDidDismiss();
      if (data.role == 'cancel') {
        let auth = this.injector.get(AuthService);
        if(environment.isAuthBypassed) {
          auth.clearLocalData();
          this.redirectToOrigin();
        } else {
          auth.logoutAccount(true);
        }
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
    return this.httpClient.get(options)
      .then((data: any) => {
        if (data.status == 200) {
          return data;
        } else {
          this.handleError(data)
          return data;
        }
      });
  }

  _window = window;

  private redirectToOrigin(): void {
    this._window.location.href = this._window.location.origin;
  }
}
