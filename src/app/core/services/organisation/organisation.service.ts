import { Injectable } from '@angular/core';
import { urlConstants } from '../../constants/urlConstants';
import { HttpService } from '../http/http.service';
import { ToastService } from '../toast.service';
import { LocalStorageService } from '../localstorage.service';
import { localKeys } from '../../constants/localStorage.keys';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrganisationService {

  constructor(private httpService: HttpService, private toast: ToastService, private localStorage: LocalStorageService, private http: HttpClient) { }

  async requestOrgRole(roleId, formData){
    const config = {
      url: urlConstants.API_URLS.REQUEST_TO_BECOME_MENTOR,
      payload: {
        "role": roleId,
        "form_data": formData
      },
    };
    try {
      let data: any = await this.httpService.post(config);
      await this.localStorage.setLocalData(localKeys.IS_ROLE_REQUESTED, true)
      this.toast.showToast(data.message, "success")
      return data.result
    }
    catch (error) {
    }
  }

  async getRequestedRoleDetails(requestedRole){
    const config = {
      url: urlConstants.API_URLS.LIST_ORG_ROLES,
      payload: {},
    };
    try {
      let data: any = await this.httpService.get(config);
      return data.result.data.find(role => role.title === requestedRole);
    }
    catch (error) {
    }
  }

  async adminRequestList(page, limit, status){
    const config = {
      url: `${urlConstants.API_URLS.ADMIN_MENTOR_REQUEST_LIST}?page=${page}&limit=${limit}`,
      payload: {
        "filters": {
          "status": [
            status 
          ]
        }
      }
    };
    try {
      let data: any = await this.httpService.post(config);
      return data.result
    }
    catch (error) {
    }
  }

  async updateRequest(id,status){
    const config = {
      url: urlConstants.API_URLS.ADMIN_UPDATE_REQUEST,
      payload: {
        "request_id": id,
        "status": status
      },
    };
    try {
      let data: any = await this.httpService.post(config);
      return data
    }
    catch (error) {
    }
  }

  async bulkUpload(path, uploadCsvUrl){
    const config = {
      url: uploadCsvUrl,
      payload: {
        "file_path": path,
      },
    };
    try {
      let data: any = await this.httpService.post(config);
      return data
    }
    catch (error) {
    }
  }

  async getSignedUrl(name){
    const config = {
      url: urlConstants.API_URLS.GET_FILE_UPLOAD_URL+name.replace(" ", "_"),
      payload: {}
    };
    try {
      let data: any = await this.httpService.get(config);
      return data.result
    }
    catch (error) {
    }
  }

  upload(file: any, path: any) {
    var options = {
      headers: {
        "Content-Type": "multipart/form-data"
      },
    };
    return this.http.put(path.signedUrl, file, options);
  }
  
  async downloadCsv(downloadCsvUrl){
    let config = {
      url: downloadCsvUrl,
      payload: {}
    }
    try {
      let data: any = await this.httpService.get(config);
      return data.result
    }
    catch (error) {
    }
    
  }
}
