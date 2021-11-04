import { Injectable } from '@angular/core';
import { HTTP } from '@ionic-native/http/ngx';
import { RequestParams } from '../../interface/request-param';
import {environment} from 'src/environments/environment';
import * as _ from 'lodash-es';
import { UserService } from '../user/user.service';
import { ToastService } from '../toast.service';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  baseUrl;
  userDetail:any={};
  constructor(
    private http: HTTP,
    private userService:UserService,
    private toastService:ToastService
    ) {
    this.baseUrl=environment.baseUrl;
  }

  async setHeaders() {
    let token = await this.userService.getToken();
    const headers = {
      'X-auth-token':  token ? token : "", 
      'Content-Type': 'application/json',
    }
    return headers;
  }

  async post(requestParam: RequestParams) {
    const headers = await this.setHeaders();
    let body = requestParam.payload ? requestParam.payload : {};
    console.log(headers);
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
    const headers = await this.setHeaders();
    console.log(headers);
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


  private handleError(result) {
    console.log(result);
    let msg = JSON.parse(result.error);
    switch (result.status) {
      case 400:
      case 406:
      case 422:    
        this.toastService.showToast(msg ? msg.message : 'Something went wrong', 'danger')
        break
      case 401:
        this.toastService.showToast('Something went wrong', 'danger')
        break
      default:
        this.toastService.showToast(msg ? msg.message : 'Something went wrong', 'danger')
    }
    throw Error(result);
  }

}
