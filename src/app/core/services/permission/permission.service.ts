import { Injectable } from '@angular/core';
import { LocalStorageService } from '../localstorage.service';
import { localKeys } from '../../constants/localStorage.keys';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {

  userPermissions:any = [];

  constructor(private localStorage: LocalStorageService){}

  async hasPermission(permissions: any): Promise <boolean> {
    if(!this.userPermissions.length){
      await this.fetchPermissions().then((res) =>{
        this.userPermissions = res;
      })
    }
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
              this.userPermissions = data.permissions;
              resolve(this.userPermissions);
            }
          })
      } catch (error) {
        console.log(error)
      }
    });
    
  }
}
