import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { RequestParams } from '../interface/request-param';
import {environment} from 'src/environments/environment';
import { AuthService } from './auth.service';
import * as _ from 'lodash-es';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  baseUrl;
  userDetail:any={};
  constructor(
    private http: HTTP,
    private authService:AuthService) {
    this.baseUrl=environment.baseUrl;
  }

  setHeaders() {
    this.authService.user.subscribe((data) => this.userDetail = data);
    const headers = {
      'X-auth-token': _.get(this.userDetail,'access_token') ? 'bearer '+ _.get(this.userDetail,'access_token')  : '',
      'Content-Type': 'application/json',
    }
    return headers;
  }


  post(requestParam: RequestParams) {
    const headers = this.setHeaders();
    let body = requestParam.payload ? requestParam.payload : {};
    return this.http.post(this.baseUrl + requestParam.url, body, headers).then(
      data => {
        return JSON.parse(data.data);
      }, error => {
        console.log(error);
      });
  }

}
