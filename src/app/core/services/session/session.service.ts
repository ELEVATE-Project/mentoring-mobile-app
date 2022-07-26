import { Injectable } from '@angular/core';
import { HttpService, LoaderService, ToastService } from '..';
import { urlConstants } from '../../constants/urlConstants';
import * as _ from 'lodash-es';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(private loaderService: LoaderService, private httpService: HttpService, private toast: ToastService, private inAppBrowser: InAppBrowser, private router: Router) { }


  async createSession(formData, id?: string) {
    await this.loaderService.startLoader();
    const config = {
      url: id == null ? urlConstants.API_URLS.CREATE_SESSION : urlConstants.API_URLS.CREATE_SESSION + `/${id}`,
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

  async getAllSessionsAPI(obj) {
    //await this.loaderService.startLoader();
    let params;
   if(obj.status){
     params ='&status=' + obj.status + '&search=' + obj.searchText
    }else{
      params ='&search=' + obj.searchText
    }
    const config = {
      url: urlConstants.API_URLS.GET_SESSIONS_LIST + obj.page + '&limit=' + obj.limit +params,
      payload: {}
    };
    try {
      let data = await this.httpService.get(config);
      let result = _.get(data, 'result');
      //this.loaderService.stopLoader();
      return result;
    }
    catch (error) {
     // this.loaderService.stopLoader();
      let res = []
      return res;
    }
  }

async getSessionsList(obj) {
  const config = {
    url: urlConstants.API_URLS.SESSIONS + obj?.type + '&page=' + obj?.page + '&limit=' + obj?.limit + '&search=' + obj?.searchText,
  };
  try {
    let data: any = await this.httpService.get(config);
    return data;
  }
  catch (error) {
  }
}

  async getSessionDetailsAPI(id) {
    //await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.GET_SESSION_DETAILS + id,
      payload: {}
    };
    try {
      let data = await this.httpService.get(config);
      let result = _.get(data, 'result');
      //this.loaderService.stopLoader();
      return result;
    }
    catch (error) {
      //this.loaderService.stopLoader();
    }
  }

  async getShareSessionId(id) {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.GET_SHARE_SESSION_LINK + id,
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

  async enrollSession(id) {
    const config = {
      url: urlConstants.API_URLS.ENROLL_SESSION + id,
      payload: {}
    };
    try {
      let data = await this.httpService.post(config);
      return data;
    }
    catch (error) {
    }
  }

  async unEnrollSession(id) {
    const config = {
      url: urlConstants.API_URLS.UNENROLL_SESSION + id,
      payload: {}
    };
    try {
      let data = await this.httpService.post(config);
      return data;
    }
    catch (error) {
    }
  }

  async startSession(id) {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.START_SESSION + id,
      payload: {}
    };
    try {
      let data = await this.httpService.get(config);
      this.loaderService.stopLoader();
      if (data.responseCode == "OK") {
        this.openBrowser(data.result.link);
        return true;
      } else {
        return false;
      }
    }
    catch (error) {
      this.loaderService.stopLoader();
      return false;
    }
  }

  async joinSession(id) {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.JOIN_SESSION + id,
      payload: {}
    };
    try {
      let data = await this.httpService.get(config);
      this.loaderService.stopLoader();
      if (data.responseCode == "OK") {
        this.openBrowser(data.result.link);
      }
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }

  async deleteSession(id) {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.CREATE_SESSION + `/${id}`,
      payload: {}
    };
    try {
      let data = await this.httpService.delete(config);
      this.loaderService.stopLoader();
      return data;
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }

  openBrowser(link) {
    let browser = this.inAppBrowser.create(link, `_system`);
    browser.on('exit').subscribe(() => {
    }, err => {
      console.error(err);
    });
  }

  async submitFeedback(feedbackData, sessionId) {
    const config = {
      url: urlConstants.API_URLS.SUBMIT_FEEDBACK + sessionId,
      payload: feedbackData
    };
    try {
      let data = await this.httpService.post(config);
      return data;
    }
    catch (error) {
    }
  }

  async getUpcomingSessions(id){
    const config = {
      url: urlConstants.API_URLS.UPCOMING_SESSIONS + id + "?page=1&limit=100",
      payload: {}
    };
    try {
      let data = await this.httpService.post(config);
      return data.result[0].data;
    }
    catch (error) {
    }
  }

}
