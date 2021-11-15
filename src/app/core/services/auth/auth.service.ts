import { Injectable } from '@angular/core';
import { localKeys } from '../../constants/localStorage.keys';
import { LocalStorageService } from '../localstorage.service';
import { HttpService } from '../http/http.service';
import { urlConstants } from '../../constants/urlConstants';
import * as _ from 'lodash-es';
import { LoaderService } from '../loader/loader.service';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { ToastService } from '../toast.service';
import { UserService } from '../user/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl: any;
  constructor(
    private localStorage: LocalStorageService,
    private httpService: HttpService,
    private loaderService: LoaderService,
    private router: Router,
    private toast: ToastService,
    private userService:UserService) {
  }

  async createAccount(formData) {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.CREATE_ACCOUNT,
      payload: formData
    };
    try {
      await this.httpService.post(config);
      this.loaderService.stopLoader();
      this.toast.showToast('SIGNUP_MESSAGE', 'sucess')
      this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`], { replaceUrl: true });
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }

  async loginAccount(formData) {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.ACCOUNT_LOGIN,
      payload: formData
    };
    try {
      let data: any = await this.httpService.post(config);
      console.log(data)
      let result = data.result;
      this.localStorage.setLocalData(localKeys.USER_DETAILS, result);
      this.loaderService.stopLoader();
      this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`], { replaceUrl: true });
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }

  async logoutAccount() {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.LOGOUT_ACCOUNT,
      payload: {
        refreshToken: _.get(this.userService.userDetail, 'refresh_token')
      }
    };
    try {
      await this.httpService.post(config)
      this.localStorage.delete(localKeys.USER_DETAILS);
      this.userService.userDetail = [];
      await this.loaderService.stopLoader();
      this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`], {
        replaceUrl: true
      });
    }
    catch (error) {
      await this.loaderService.stopLoader();
    }
  }

}