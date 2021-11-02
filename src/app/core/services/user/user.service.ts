import { Injectable } from '@angular/core';
import { localKeys } from '../../constants/localStorage.keys';
import { LocalStorageService } from '../localstorage.service';
import * as _ from 'lodash-es';
import jwt_decode from "jwt-decode";
import * as moment from 'moment';
import { urlConstants } from '../../constants/urlConstants';
import { HTTP } from '@ionic-native/http/ngx';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  userDetail:any;
  baseUrl:any;
  constructor(
    private localStorage: LocalStorageService,
    private http: HTTP,
    private router: Router) { 
      this.baseUrl = environment.baseUrl;
    }

  async getUserValue() {
    return this.localStorage
      .getLocalData(localKeys.USER_DETAILS)
      .then((data: any) => {
        this.userDetail=data;
        return data;
      })
      .catch((error) => { });
  }

  async getToken() {
    let token = _.get(this.userDetail, 'access_token');
    if (!token) {
      return null;
    }
    let isValidToken = this.validateToken(token);
    if (!isValidToken) {
      let data: any = await this.getAccessToken();
      let access_token=_.get(data, 'result.access_token');
      if (!access_token) {
        this.logoutAccount();
      }
      this.userDetail['access_token'] = access_token;
      this.localStorage.setLocalData(localKeys.USER_DETAILS, this.userDetail);
      let userToken = 'bearer ' + _.get(this.userDetail, 'access_token');
      return userToken;
    }
    else {
      let userToken = 'bearer ' + _.get(this.userDetail, 'access_token');
      return userToken;
    }
  }

  validateToken(token){
    const tokenDecoded: any = jwt_decode(token);
    const tokenExpiryTime = moment(tokenDecoded.exp * 1000);
    const currentTime = moment(Date.now());
    const duration = moment.duration(tokenExpiryTime.diff(currentTime));
    const hourDifference = duration.asHours();
    if (hourDifference < 2) {
      return false;
    }
    else{
      return true;
    }
  }

  checkTokenValidation() {
    let token = this.getToken();
    if (token) {
      if (!this.validateToken(token)) {
        this.getAccessToken().then((result) => {
          return result;
        });
      } else {
        return true;
      }
    }
    return false;
  }

  async getAccessToken() {
    const headers = {};
    let body = {
      refreshToken: _.get(this.userDetail, 'refresh_token')
    };
    let url = urlConstants.API_URLS.REFRESH_TOKEN;
    let data:any= await this.http.post(this.baseUrl + url, body, headers);
    let result:any=JSON.parse(data.data);
    if (result.responseCode === "OK") {
      return result;
    }
  }

  async logoutAccount() {
    let token = await this.getToken();
    const headers = {
      'X-auth-token': token ? token : "",
    };
    let body = {
      refreshToken: _.get(this.userDetail, 'refresh_token')
    };
    let url = urlConstants.API_URLS.LOGOUT_ACCOUNT;
    let data: any = await this.http.post(this.baseUrl + url, body, headers)
    try {
      this.localStorage.delete(localKeys.USER_DETAILS);
      this.userDetail = [];
      this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`]);
    }
    catch (error) {
      console.log(error);
    }
  }
  
}
