import { Component, OnInit } from "@angular/core";
import { OrganisationService } from "src/app/core/services/organisation/organisation.service";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent implements OnInit {

  type = 'manage-user'
  page=1;
  limit=50;
  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    label:'ADMIN_DASHBOARD'
  };
  requestList: any;

  constructor(private organisation: OrganisationService) {
  }
    async ngOnInit() {
      this.requestList = await this.organisation.adminRequestList(this.page,this.limit)
    }

    segmentChanged(event){
      this.type = event.target.value;
    }

    acceptRequest(){

    }
    rejectRequest(){
      
    }
    viewRequest(){
      
    }
  }
