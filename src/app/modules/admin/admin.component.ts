import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { permissions } from 'src/app/core/constants/permissionsConstant';

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
      permission: permissions.MANAGE_USER,
      actions: ['GET'],
    },
    {
      title: 'MANAGE_SESSION',
      url: CommonRoutes.ADMIN + '/' + CommonRoutes.MANAGE_SESSION,
      icon: 'people-outline',
      permission: permissions.MANAGE_SESSION,
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
