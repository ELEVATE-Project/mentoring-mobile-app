import { Injectable } from '@angular/core';
import { HttpService, LoaderService, ToastService } from '..';
import { urlConstants } from '../../constants/urlConstants';
import * as _ from 'lodash-es';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private loaderService:LoaderService, private httpService: HttpService, private toast: ToastService) { }

  async createSession(formData, id?:string){
    await this.loaderService.startLoader();
    const config = {
      url: id==null ? urlConstants.API_URLS.CREATE_SESSION : urlConstants.API_URLS.CREATE_SESSION+`/${id}`,
      payload: formData
    };
    try {
      let result = await this.httpService.post(config);
      let msg = result?.message;
      result = _.get(result, 'result');
      this.loaderService.stopLoader();
      this.toast.showToast(msg, "success");
      return result;
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }

  async getAllSessionsAPI(obj){
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.GET_SESSIONS_LIST+obj.page+'&limit='+obj.limit+'&status='+obj.status+'&search='+obj.searchText,
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
      let res = []
      return res;
    }
  }

  async getSessionDetailsAPI(id){
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.GET_SESSION_DETAILS+id,
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

  async getShareSessionId(id){
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.GET_SHARE_SESSION_LINK+id,
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

  async enrollSession(id){
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.ENROLL_SESSION+id,
      payload: {}
    };
    try {
      let data = await this.httpService.post(config);
      this.loaderService.stopLoader();
      return data;
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }

  async startSession(id){
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.START_SESSION+id,
      payload: {}
    };
    try {
      let data = await this.httpService.post(config);
      this.loaderService.stopLoader();
      return data;
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }
}
