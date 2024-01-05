import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent implements OnInit {
  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    label: 'ADMIN_WORKSPACE',
  };
  
  actionsArrays: any[] = [
    {
      title: 'MANAGE_USER',
      url: CommonRoutes.ADMIN + '/' + CommonRoutes.MANAGE_USER,
      icon: 'people-outline',
      permission: 'mentor-listing',
      actions: ['GET'],
    },
    {
      title: 'MANAGE_SESSION',
      url: CommonRoutes.ADMIN + '/' + CommonRoutes.MANAGE_SESSION,
      icon: 'people-outline',
      permission: 'manage-sessions',
      actions: ['ALL', 'CREATE', 'GET', 'EDIT', 'UPDATE'],
    },
  ];

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
  }

  cardSelected(action) {
    this.router.navigate([action.url]);
  }
}
