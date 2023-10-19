import { Injectable } from '@angular/core';
import { urlConstants } from '../../constants/urlConstants';
import { HttpService } from '../http/http.service';
import { ToastService } from '../toast.service';
import { LocalStorageService } from '../localstorage.service';
import { localKeys } from '../../constants/localStorage.keys';

@Injectable({
  providedIn: 'root'
})
export class OrganisationService {

  constructor(private httpService: HttpService, private toast: ToastService, private localStorage: LocalStorageService) { }

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
      return data.result.find(role => role.title === requestedRole);
    }
    catch (error) {
    }
  }

  async adminRequestList(page, limit){
    const config = {
      url: `${urlConstants.API_URLS.ADMIN_MENTOR_REQUEST_LIST}?page=${page}&limit=${limit}`,
      payload: {},
    };
    try {
      let data: any = await this.httpService.post(config);
      return data.result
    }
    catch (error) {
    }
  }
}
