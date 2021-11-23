import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import {
  HttpService,
  LoaderService,
  LocalStorageService,
  ToastService,
} from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';
import { localKeys } from '../../constants/localStorage.keys';
import * as _ from 'lodash-es';
import {Location} from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  constructor(
    private httpService: HttpService,
    private loaderService: LoaderService,
    private router: Router,
    private toast: ToastService,
    private localStorage: LocalStorageService,
    private _location: Location
  ) { }
  async profileUpdate(formData) {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.PROFILE_UPDATE,
      payload: formData,
    };
    try {
      let data: any = await this.httpService.post(config);
       await this.localStorage.delete(localKeys.USER_DETAILS);
      this.loaderService.stopLoader();
      this._location.back();
      this.toast.showToast(data.message, "success");
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }
  async getProfileDetailsAPI() {
    const config = {
      url: urlConstants.API_URLS.PROFILE_DETAILS,
      payload: {}
    };
    try {
      let data: any = await this.httpService.get(config);
      data = _.get(data, 'result');
      this.localStorage.setLocalData(localKeys.USER_DETAILS, data);
      return data;
    }
    catch (error) {
    }
  }

  async profileDetails(showLoader = true): Promise<any> {
    showLoader ? await this.loaderService.startLoader() : null;
    return new Promise((resolve) => {
      try {
      this.localStorage.getLocalData(localKeys.USER_DETAILS)
        .then(async (data) => {
          if (data) {
            showLoader ? this.loaderService.stopLoader() : null;
            resolve(data);
          }
        }).catch (async()=>{
            var res = await this.getProfileDetailsAPI();
            await this.localStorage.setLocalData(localKeys.USER_DETAILS, res);
            data = _.get(data, 'user');
            showLoader ? this.loaderService.stopLoader() : null;
            resolve(data);
          }
        )
      } catch (error) {
        showLoader ? this.loaderService.stopLoader() : showLoader;
      }
    });
  }

  async generateOtp(formData) {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.GENERATE_OTP,
      payload: formData
    };
    try {
      let data: any = await this.httpService.post(config);
      this.loaderService.stopLoader();
      this.toast.showToast(data.message, "success");
      return data;
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }
  async updatePassword(formData) {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.RESET_PASSWORD,
      payload: formData
    };
    try {
      let data: any = await this.httpService.post(config);
      this.loaderService.stopLoader();
      this.toast.showToast(data.message, "success");
      return data;
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }
}
