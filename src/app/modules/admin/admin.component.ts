import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ToastService, UtilService } from "src/app/core/services";
import { FormService } from "src/app/core/services/form/form.service";
import { SessionService } from "src/app/core/services/session/session.service";
import { CommonRoutes } from "src/global.routes";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent implements OnInit {

  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    label:'ADMIN_WORKSPACE'
  };

  actionsArray: any[] = [
    { title: 'MANAGE_USER', url: CommonRoutes.ADMIN+'/'+CommonRoutes.MANAGE_USER, icon: 'people-outline' },
  ];

  constructor(private router: Router) {
  }
    ngOnInit() {}

    cardSelected(action){
      this.router.navigate([action.url])
    }
  }
