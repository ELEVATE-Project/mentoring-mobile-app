import { Injectable } from '@angular/core';
import { permissions, actions } from 'src/app/core/constants/permissionsConstant';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  public apiPermissions: any = [
    {
      module: permissions.MANAGE_SESSION,
      action: [
        actions.ALL,
        actions.CREATE,
        actions.GET,
        actions.EDIT,
        actions.UPDATE,
      ],
    },
    {
      module: permissions.MANAGE_USER,
      action: [actions.GET],
    },
  ];

  fetchPermissions() {
    // api call here
  }

  hasPermission(permissions: any): boolean {
    for (let apiPermission of this.apiPermissions) {
      if (permissions.module === apiPermission.module && apiPermission.action) {
        if (apiPermission.action.includes(actions.ALL)) {
          return true;
        } else {
          if (permissions.action.every((value) => apiPermission.action.includes(value))) {
            return true;
          } else {
            return false;
          }
        }
      }
    }
  }
}
