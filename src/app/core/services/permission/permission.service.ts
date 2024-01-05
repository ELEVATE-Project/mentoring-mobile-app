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

  hasPermission(module: string): boolean {
    // Check if there is a corresponding entry in permissions array with a matching module
    return this.permissions.some(permission => permission.module === module);
  }

}
