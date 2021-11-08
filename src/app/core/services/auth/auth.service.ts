import { Injectable } from '@angular/core';
import { localKeys } from '../../constants/localStorage.keys';
import { LocalStorageService } from '../localstorage.service';
import { HttpService } from '../http/http.service';
import { urlConstants } from '../../constants/urlConstants';
import * as _ from 'lodash-es';
import { LoaderService } from '../loader/loader.service';
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
    private loaderService: LoaderService,
    private router: Router) {
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
      this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`],{replaceUrl:true});
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
      this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`],{replaceUrl:true});
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }

  async profileUpdate(formData) {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.PROFILE_UPDATE,
      payload: formData
    };
    try {
      let data: any = await this.httpService.post(config);
      let result = data.result;
      this.loaderService.stopLoader();
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }

  async profileDetails(formData) {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.PROFILR_DETAILS,
      payload: formData
    };
    try {
      let data: any = await this.httpService.get(config);
      let result = data.result;
      this.loaderService.stopLoader();
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }

}
