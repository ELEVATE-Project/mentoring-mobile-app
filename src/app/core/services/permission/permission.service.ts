import { Injectable } from '@angular/core';
import { LocalStorageService } from '../localstorage.service';
import { localKeys } from '../../constants/localStorage.keys';
import { CommonRoutes } from 'src/global.routes';
import { manageSessionAction, manageUserAction, permissions } from '../../constants/permissionsConstant';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {

public userPermissions:any[] = [
    {
      title: 'MANAGE_USER',
      url: CommonRoutes.ADMIN + '/' + CommonRoutes.MANAGE_USER,
      icon: 'people-outline',
      module: permissions.MANAGE_USER,
      request_type: manageUserAction.USER_ACTIONS,
    },
    {
      title: 'MANAGE_SESSION',
      url: CommonRoutes.ADMIN + '/' + CommonRoutes.MANAGE_SESSION,
      icon: 'people-outline',
      module: permissions.MANAGE_SESSION,
      request_type: manageSessionAction.SESSION_ACTIONS,
    },
  ];

  constructor(private localStorage: LocalStorageService){}

  async hasPermission(permissions: any): Promise <boolean> {
    // if(!this.userPermissions.length){
    //   await this.fetchPermissions().then((res) =>{
    //     this.userPermissions = res;
    //   })
    // }
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
  
  // async fetchPermissions():Promise<any []> {
  //   return new Promise((resolve, reject) => {
  //     try {
  //       this.localStorage.getLocalData(localKeys.USER_DETAILS)
  //         .then(async (data) => {
  //           if(data) {
  //             resolve(data?.permissions);
  //           }
  //         })
  //     } catch (error) {}
  //   });
    
  // }
}
