import { Injectable, Injector } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { RequestParams } from '../../interface/request-param';
import {environment} from 'src/environments/environment';
import * as _ from 'lodash-es';
import { UserService } from '../user/user.service';
import { NetworkService } from '../network.service';
import { ToastService } from '../toast.service';
import { LoaderService } from '../loader/loader.service';
import { LocalStorageService } from '../localstorage.service';
import { urlConstants } from '../../constants/urlConstants';
import { localKeys } from '../../constants/localStorage.keys';
import {AuthService} from '../auth/auth.service';


@Injectable({
  providedIn: 'root',
})
export class HttpService {
  baseUrl;
  userDetail:any={};
  constructor(
    private http: HTTP,
    private userService:UserService,
    private network:NetworkService,
    private toastService:ToastService,
    private loaderService: LoaderService,
    private localStorage: LocalStorageService,
    private injector: Injector
    ) {
    this.baseUrl=environment.baseUrl;
    this.http.setDataSerializer('json');
    this.http.setRequestTimeout(60);
  }

  async setHeaders() {
    let token = await this.getToken();
    const headers = {
      'X-auth-token':  token ? token : "", 
      'Content-Type': 'application/json',
    }
    return headers;
  }

  async post(requestParam: RequestParams) {
    if(!this.checkNetworkAvailability()){
      throw Error(null);
    }
    const headers = requestParam.headers ? requestParam.headers : await this.setHeaders();
    let body = requestParam.payload ? requestParam.payload : {};
    return this.http.post(this.baseUrl + requestParam.url, body, headers)
      .then((data: any) => {
        let result: any = JSON.parse(data.data);
        if (result.responseCode === "OK") {
          return result;
        }
      }, error => {
        return this.handleError(error);
      });
  }

  async get(requestParam: RequestParams) {
    if(!this.checkNetworkAvailability()){
      throw Error(null);
    }
    const headers = requestParam.headers ? requestParam.headers : await this.setHeaders();
    return this.http.get(this.baseUrl + requestParam.url, '', headers)
      .then((data: any) => {
        let result: any = JSON.parse(data.data);
        if (result.responseCode === "OK") {
          return result;
        }
      }, error => {
        return this.handleError(error);
      });
  }

  //network check
  checkNetworkAvailability(){
    if(!this.network.isNetworkAvailable){
      this.toastService.showToast('MSG_PLEASE_NETWORK','danger')
      return false;
    }
    return true;
  }

  //token validation and logout 

  async getToken() {
    let token = _.get(this.userService.userDetail, 'access_token');
    if (!token) {
      return null;
    }
    let isValidToken = this.userService.validateToken(token);
    if (!isValidToken) {
      let data: any = await this.getAccessToken();
      let access_token=_.get(data, 'result.access_token');
      if (!access_token) {
        let authService=this.injector.get(AuthService);
        authService.logoutAccount();
      }
      this.userService.userDetail['access_token'] = access_token;
      this.localStorage.setLocalData(localKeys.USER_DETAILS, this.userDetail);
    }
    let userToken = 'bearer ' + _.get(this.userService.userDetail, 'access_token');
    return userToken;
  }

  async getAccessToken() {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.REFRESH_TOKEN,
      payload: {
        refreshToken: _.get(this.userService.userDetail, 'refresh_token')
      }
    };
    try {
      let data: any = await this.post(config);
      let result = data.result;
      return result;
    }
    catch (error) {
      await this.loaderService.stopLoader();
    }
  }

  public handleError(result) {
    console.log(result);
    let msg = JSON.parse(result.error);
    switch (result.status) {
      case 400:
      case 406:
      case 422:    
        this.toastService.showToast(msg ? msg.message : 'SOMETHING_WENT_WRONG', 'danger')
        break
      case 401:
        this.toastService.showToast('SOMETHING_WENT_WRONG', 'danger')
        break
      default:
        this.toastService.showToast(msg ? msg.message : 'SOMETHING_WENT_WRONG', 'danger')
    }
    throw Error(result);
  }

}
