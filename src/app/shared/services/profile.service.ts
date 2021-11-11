import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, LoaderService, ToastService } from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private httpService: HttpService, private loaderService: LoaderService, private router: Router, private toast: ToastService) { }
  async profileUpdate(formData) {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.PROFILE_UPDATE,
      payload: formData
    };
    try {
      let data: any = await this.httpService.post(config);
      console.log(data);
      this.loaderService.stopLoader();
      this.router.navigate([CommonRoutes.TABS+'/'+CommonRoutes.PROFILE], { queryParams: formData });
      this.toast.showToast(data.message, "success");
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }
  async profileDetails() {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.PROFILE_DETAILS,
      payload: {}
    };
    try {
      let data: any = await this.httpService.get(config);
      this.loaderService.stopLoader();
      return data;
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }
  async generateOtp(formData){
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.GENERATE_OTP,
      payload: formData
    };
    try {
      let data: any = await this.httpService.post(config);
      console.log(data);
      this.loaderService.stopLoader();
      this.toast.showToast(data.message, "success");
      return data;
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }
  async updatePassword(formData){
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.RESET_PASSWORD,
      payload: formData
    };
    try {
      let data: any = await this.httpService.post(config);
      console.log(data);
      this.loaderService.stopLoader();
      this.toast.showToast(data.message, "success");
      return data;
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }
}
