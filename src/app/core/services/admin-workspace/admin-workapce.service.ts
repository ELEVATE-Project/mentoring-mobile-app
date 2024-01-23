import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
import { urlConstants } from '../../constants/urlConstants';
import * as _ from 'lodash-es';
import { UtilService } from '../util/util.service';
import { SessionService } from '../session/session.service';
import { ToastService } from '../toast.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminWorkapceService {
  constructor(private httpService: HttpService,private utilService:UtilService, private sessionService:SessionService,private toast:ToastService, private router:Router) { }

  async createdSessionBySessionManager(obj:any) {
    const config = {
          url:  `${urlConstants.API_URLS.CREATED_SESSION_BY_SESSION_MANAGER}${obj.page}&limit=${obj?.limit}&order=${obj?.order || ''}&sort_by=${obj?.sort_by || ''}&status=${obj?.filteredData?.status || ''}&type=${obj?.filteredData?.type || ''}&search=${btoa(obj?.searchText)}`
        };
    try {
      let result = await this.httpService.get(config);
      result = _.get(result, 'result');
      return result;
    }
    catch (error) {
      return false
    }
  }
  deleteSession(id:any): Promise<any> {
    return new Promise((resolve, reject) => {
      let msg = {
        header: 'DELETE_SESSION',
        message: 'DELETE_CONFIRM_MSG',
        cancel: "DON'T_DELETE",
        submit: 'YES_DELETE'
      }
      this.utilService.alertPopup(msg).then(async data => {
        if (data) {
          let result = await this.sessionService.deleteSession(id);
          if (result?.responseCode == "OK") {
          this.toast.showToast(result.message, "success");
          resolve(result); 
          }else{
            reject(result)
          }
        }
      }).catch(error => { 
        reject(error)
      })
      
    });
  }
  

  // async downloadcreatedSessionsBySessionManager(obj:any){
  //   const config = {
  //     url:  `${urlConstants.API_URLS.DOWNLOAD_CREATED_SESSION_LIST_BY_SESSION_MANAGER}&order=${obj?.order || ''}&sort_by=${obj?.sort_by || ''}&status=${obj?.filteredData?.status || ''}&type=${obj?.filteredData?.type || ''}`
  //   };
  //   this.httpService.get(config).then(async (response)=>{
  //     console.log(response)
  //     // await this.sessionService.openBrowser(response,"_blank")
  //   })
  //   try {
  //     let result = await this.httpService.get(config);
  //     console.log(result)
  //     return result;
  //   }
  //   catch (error) {
  //     return false
  //   }

  // }
}
