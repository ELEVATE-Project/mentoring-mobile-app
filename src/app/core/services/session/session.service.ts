import { Injectable } from '@angular/core';
import { HttpService, LoaderService, ToastService } from '..';
import { urlConstants } from '../../constants/urlConstants';
import * as _ from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private loaderService:LoaderService, private httpService: HttpService, private toast: ToastService) { }

  async createSession(formData){
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.CREATE_SESSION,
      payload: formData
    };
    try {
      let result = await this.httpService.post(config);
      this.loaderService.stopLoader();
      this.toast.showToast(result.message, "success");
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }
  async getSessionsAPI(page,limit,status,searchText){
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.GET_SESSIONS_LIST+page+'&limit='+limit+'&status='+status+'&search='+searchText,
      payload: {}
    };
    try {
      let data = await this.httpService.get(config);
      let result = _.get(data, 'result');
      this.loaderService.stopLoader();
      return result;
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }
}
