import { Injectable } from '@angular/core';
import { CommonRoutes } from 'src/global.routes';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  public permissions: any = [
    {
      module: 'manage-sessions',
      action: ['ALL', 'CREATE', 'GET', 'EDIT', 'UPDATE'],
    },
    {
      module: 'mentor-listing',
      action: ['GET'],
    },
  ];

  actionsArray: any[] = [];

  fetchPermissions(){
    // api call here
  }

  storePassedObject(passedData:any) {
    console.log(passedData)
    this.actionsArray = passedData.filter(action =>
      this.hasPermission(action.permission)
    );
    return this.actionsArray
  }

  hasPermission(module: any): boolean {
    console.log(module)
    // Check if there is a corresponding entry in permissions array with a matching module
    return this.permissions.some(permission => permission.module === module);
  }

}
