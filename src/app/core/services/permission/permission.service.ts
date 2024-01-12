import { Injectable } from '@angular/core';
import { permissions, actions } from 'src/app/core/constants/permissionsConstant';

@Injectable({
  providedIn: 'root',
})
export class PermissionService {
  public userPermissions: any = [
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
    for (let userPermission of this.userPermissions) {
      if (permissions && userPermission.action.length && permissions.module === userPermission.module) {
        if (userPermission.action.includes(actions.ALL) || permissions.action.every((value) => userPermission.action.includes(value))) {
          return true;
        } else {
          return false;
        }
      }
    }
  }
}
