import { Injectable } from '@angular/core';
import { localKeys } from '../../constants/localStorage.keys';
import { LocalStorageService } from '../localstorage.service';
import { HttpService } from '../http/http.service';
import { urlConstants } from '../../constants/urlConstants';
import * as _ from 'lodash-es';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl: any;
  constructor(
    private localStorage: LocalStorageService,
    private httpService: HttpService,
    private router: Router) {
  }

  async createAccount(formData) {
    const config = {
      url: urlConstants.API_URLS.CREATE_ACCOUNT,
      payload: formData
    };
    await this.httpService.post(config)
    try {
      this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`]);
    }
    catch (error) {
      console.log(error);
    }
  }

  async loginAccount(formData) {
    const config = {
      url: urlConstants.API_URLS.ACCOUNT_LOGIN,
      payload: formData
    };
    let data: any = await this.httpService.post(config);
    try {
      let result = data.result;
      this.localStorage.setLocalData(localKeys.USER_DETAILS, result);
      this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]);
    }
    catch (error) {
      console.log(error);
    }
  }

}
