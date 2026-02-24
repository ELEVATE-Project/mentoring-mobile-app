import { Injectable } from '@angular/core';
import { LocalStorageService } from '../localstorage.service';
import { localKeys } from '../../constants/localStorage.keys';
import { urlConstants } from '../../constants/urlConstants';
import { HttpService } from '../http/http.service';
import { actions } from '../../constants/permissionsConstant';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {

  userPermissions:any = [];

  constructor(private localStorage: LocalStorageService, private httpService: HttpService){}

  async hasPermission(permissions: any): Promise <boolean> {
    await this.fetchPermissions();
    
    if (!this.userPermissions || !Array.isArray(this.userPermissions)) {
      return undefined;
    }
    
    for (let userPermission of this.userPermissions) {
      if (permissions && userPermission.request_type && userPermission.request_type.length && permissions.module === userPermission.module) {
        const permissionRequired = (permissions?.action?.length) ? (permissions?.action[0]) : actions.GET;
        if (userPermission.request_type.includes(permissionRequired)) {
          return true;
        } else {
          return false;
        }
      }
    }
    
    // Return undefined when no matching module found or permissions is null
    return undefined;
  }
  
  async fetchPermissions(): Promise<any[]> {
    try {
      const data = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
      
      if (data && data.permissions) {
        this.userPermissions = data.permissions;
        return data.permissions;
      } else if (data && !data.permissions) {
        this.userPermissions = undefined;
        return undefined;
      } else {
        return undefined;
      }
    } catch (error) {
      return undefined;
    }
  }
  
  hasAdminAcess(permissionArray, userPermissions): boolean {
    return permissionArray.some(action => userPermissions.some(permission => permission.module === action.module));
  }

  async getPlatformConfig() {
    const config = {
      url: urlConstants.API_URLS.GET_PLATFORM_CONFIG,
      payload: {},
    };
    try {
      const data: any = await this.httpService.get(config);
      this.setConfigInLocal(data.result);
      return data;
    }
    catch (error) {
      return null;
    }
  }

  setConfigInLocal(result: any) {
    this.localStorage.setLocalData(localKeys.MAX_MENTEE_ENROLLMENT_COUNT, result.session_mentee_limit);
    this.localStorage.setLocalData(localKeys.CHAT_CONFIG, result.chat_config);
  }
}