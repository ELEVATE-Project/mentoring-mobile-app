import { Injectable } from '@angular/core';
import { LocalStorageService } from '../localstorage.service';
import { localKeys } from '../../constants/localStorage.keys';
import { actions } from '../../constants/permissionsConstant';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {

  userPermissions:any = [];

  constructor(private localStorage: LocalStorageService){}

  async hasPermission(permissions: any): Promise <boolean> {
    await this.fetchPermissions();
    for (let userPermission of this.userPermissions) {
      if (permissions && userPermission.request_type.length && permissions.module === userPermission.module) {
        const permissionRequired = (permissions?.action?.length) ? (permissions?.action[0]) : actions.GET;
        if (userPermission.request_type.includes(permissionRequired)) {
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
}
