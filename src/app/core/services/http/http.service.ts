import { Injectable, Injector } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { RequestParams } from '../../interface/request-param';
import { environment } from 'src/environments/environment';
import * as _ from 'lodash-es';
import { UserService } from '../user/user.service';
import { NetworkService } from '../network.service';
import { ToastService } from '../toast.service';
import { LoaderService } from '../loader/loader.service';
import { LocalStorageService } from '../localstorage.service';
import { urlConstants } from '../../constants/urlConstants';
import { localKeys } from '../../constants/localStorage.keys';
import { AuthService } from '../auth/auth.service';
import { ModalController } from '@ionic/angular';
import { FeedbackPage } from 'src/app/pages/feedback/feedback.page';
import { CapacitorHttp } from '@capacitor/core';


@Injectable({
  providedIn: 'root',
})
export class HttpService {
  baseUrl;
  isFeedbackTriggered = false;
  constructor(
    private http: HTTP,
    private userService: UserService,
    private network: NetworkService,
    private toastService: ToastService,
    private loaderService: LoaderService,
    private localStorage: LocalStorageService,
    private injector: Injector,
    private modalController: ModalController,
  ) {
    this.baseUrl = environment.baseUrl;
  }

  async setHeaders() {
    let token = await this.getToken();
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const acceptLanguage = await this.localStorage.getLocalData(localKeys.SELECTED_LANGUAGE);
    const headers = {
      'X-auth-token': token ? token : "",
      'Content-Type': 'application/json',
      'timeZone': timezone,
      'accept-language':acceptLanguage
    }
    return headers;
  }

  async post(requestParam: RequestParams) {
    if (!this.checkNetworkAvailability()) {
      throw Error(null);
    }
    const headers = requestParam.headers ? requestParam.headers : await this.setHeaders();
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
      data: '',
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

  //network check
  checkNetworkAvailability() {
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
        authService.logoutAccount();
      }
      this.userService.token['access_token'] = access_token;
      this.localStorage.setLocalData(localKeys.TOKEN, this.userService.token);
    }
    let userToken = 'bearer ' + _.get(this.userService.token, 'access_token');
    return userToken;
  }

  async getAccessToken() {
    const config = {
      url: urlConstants.API_URLS.REFRESH_TOKEN,
      payload: {
        refreshToken: _.get(this.userService.token, 'refresh_token')
      },
      headers: {}
    };
    try {
      let data: any = await this.post(config);
      let result = data.result;
      return result;
    }
    catch (error) {
    }
  }

  public handleError(result) {
    let msg = result.data.message;
    switch (result.status) {
      case 400:
      case 406:
      case 422:
        this.toastService.showToast(msg ? msg : 'SOMETHING_WENT_WRONG', 'danger')
        break
      case 401:
        let auth = this.injector.get(AuthService);
        this.localStorage.getLocalData(localKeys.USER_DETAILS).then(async (data)=>{
          if(data._id){
            await auth.logoutAccount(true);
            this.toastService.showToast(msg ? msg : 'SOMETHING_WENT_WRONG', 'danger')
          }
        })
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
}
