import { Injectable } from '@angular/core';
import { LocalStorageService } from '../localstorage.service';
import { localKeys } from '../../constants/localStorage.keys';
import { urlConstants } from '../../constants/urlConstants';
import { HttpService } from '../http/http.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {

  userPermissions:any = [];

  constructor(private localStorage: LocalStorageService, private httpService: HttpService){}

  async hasPermission(permissions: any): Promise <boolean> {
    await this.fetchPermissions();
    for (let userPermission of this.userPermissions) {
      if (permissions && userPermission.request_type.length && permissions.module === userPermission.module) {
        if (permissions.action.every((value: any) => userPermission.request_type.includes(value))) {
          return true;
        } else {
          return false;
        }
      }
    }
  }
  
  async fetchPermissions():Promise<any []> {
    return new Promise((resolve, reject) => {
      try {
        this.localStorage.getLocalData(localKeys.USER_DETAILS)
          .then(async (data) => {
            if(data) {
              this.userPermissions = data?.permissions;
              resolve(data?.permissions);
            }
          })
      } catch (error) {}
    });
    
  }
  hasAdminAcess(permissionArray,userPermissions): boolean {
    return permissionArray.some(action => userPermissions.some(permission => permission.module === action.module));
  }

  async getPlatformConfig() {
    const config = {
      url: urlConstants.API_URLS.GET_PLATFORM_CONFIG,
      payload: {},
    };
    try {
      const data: any = await this.httpService.get(config);
      this.setConfigInLocal(data.result)
    }
    catch (error) {
      return null;
    }
  }

  setConfigInLocal(result: any) {
    this.localStorage.setLocalData(localKeys.MAX_MENTEE_ENROLLMENT_COUNT, result.session_mentee_limit);
  }
}
