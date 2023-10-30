import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { ToastService, UtilService } from "src/app/core/services";
import { OrganisationService } from "src/app/core/services/organisation/organisation.service";
import { SessionService } from "src/app/core/services/session/session.service";
import { CommonRoutes } from "src/global.routes";

@Component({
  selector: "app-admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent implements OnInit {

  type = 'manage-user'
  page=1;
  limit=50;
  status='REQUESTED'
  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    label:'ADMIN_DASHBOARD'
  };
  requestList: any;

  constructor(private organisation: OrganisationService, private util: UtilService, private sessionService: SessionService, private toast: ToastService, private router: Router) {
  }
    async ngOnInit() {
      this.requestList = await this.organisation.adminRequestList(this.page,this.limit, this.status)
    }

    segmentChanged(event){
      this.type = event.target.value;
    }

    async acceptRequest(id,status){
      let message = {
        header: 'ACCEPT_REQUEST',
        message: 'ACCEPT_REQUEST_CONFIRMATION',
        cancel: 'NO',
        submit: 'YES'
      }
      this.util.alertPopup(message).then(async (data)=>{
        if(data){
          let result = await this.organisation.updateRequest(id,status)
          this.toast.showToast(result.message, "success")
          this.requestList = await this.organisation.adminRequestList(this.page,this.limit, this.status)
        }
      })
    }

    rejectRequest(id, status){
      let message = {
        header: 'REJECT_REQUEST',
        message: 'REJECT_REQUEST_CONFIRMATION',
        cancel: 'NO',
        submit: 'YES'
      }
      this.util.alertPopup(message).then(async (data)=>{
        if(data){
          let result = await this.organisation.updateRequest(id,status)
          this.toast.showToast(result.message, "success")
          this.requestList = await this.organisation.adminRequestList(this.page,this.limit, this.status)
        }
      })
    }

    viewRequest(request){
      let componenProps ={
        readonly: true,
        data: request.meta
      }
      this.util.openModal(componenProps).then((data)=>{
      })
    }

    downloadCSV(){
      this.sessionService.openBrowser('https://drive.google.com/file/d/1ZDjsc7YLZKIwxmao-8PdEvnHppkMkXIE/view?usp=sharing')
    }

    async uploadCSV(event){
      let signedUrl = await this.organisation.getSignedUrl(event.target.files[0].name)
      return this.organisation.upload(event.target.files[0], signedUrl).subscribe(async () => {
        let data = await this.organisation.bulkUpload(signedUrl.filePath);
        this.toast.showToast(data.message, 'success');
      })
    }
  }
