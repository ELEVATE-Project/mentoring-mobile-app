import { Component, OnInit } from "@angular/core";
import { AlertController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { ToastService } from "src/app/core/services";
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

  constructor(private organisation: OrganisationService, private translate: TranslateService, private alert: AlertController, private toast: ToastService) {
  }
    async ngOnInit() {
      this.requestList = await this.organisation.adminRequestList(this.page,this.limit)
    }

    segmentChanged(event){
      this.type = event.target.value;
    }

    async acceptRequest(id,status){
      this.confirmPopup().then(async (data)=>{
        if(data){
          let data = await this.organisation.updateRequest(id,status)
          this.toast.showToast(data.message, "success")
          this.requestList = await this.organisation.adminRequestList(this.page,this.limit)
        }
      })
    }

    rejectRequest(id, status){
      
    }
    viewRequest(id, status){
      
    }
    async confirmPopup(){
      let texts: any;
      this.translate
        .get(['UPDATE_REQUEST_CONFIRMATION', 'YES', 'NO', 'UPDATE_REQUEST'])
        .subscribe((text) => {
          texts = text;
        });
      const alert = await this.alert.create({
        header: texts['UPDATE_REQUEST'],
        message: texts['UPDATE_REQUEST_CONFIRMATION'],
        buttons: [
          {
            text: texts['NO'],
            cssClass: 'alert-button-bg-white',
            role: 'no',
            handler: () => {},
          },
          {
            text: texts['YES'],
            role: 'yes',
            cssClass: 'alert-button-red',
            handler: () => {},
          },
        ],
      });
      await alert.present();
      let data = await alert.onDidDismiss();
      if (data.role == 'yes') {
        return true;
      }
    }
  }
