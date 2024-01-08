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

  fetchPermissions() {
    // api call here
  }

  hasPermission(adminPermissions: any): boolean {
    for (let permission of this.permissions) {
      if (
        adminPermissions.module === permission.module &&
        permission.action.length
      ) {
        return true;
      }
    }
  }
}
