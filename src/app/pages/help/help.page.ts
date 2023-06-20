import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, LoaderService, ToastService } from 'src/app/core/services';
import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';
import { Device } from '@awesome-cordova-plugins/device/ngx';
import { FormService } from 'src/app/core/services/form/form.service';
import { HELP } from 'src/app/core/constants/formConstant';
import * as _ from 'lodash';
import { App } from '@capacitor/app';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';
import { ProfileService } from 'src/app/core/services/profile/profile.service';

@Component({
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;
  public headerConfig: any = {
    backButton: true,
    label: "HELP"
  };
  public formData: JsonFormData;
  metaData: { deviceName: string; androidVersion: string; version: string; type: string};
  selectedOption: any;
  helpForms: any;
  userDetails: any;
  message: any;

  constructor(private router: Router, private loaderService: LoaderService, private toast: ToastService, private httpService: HttpService, private device: Device, 
    private form: FormService, private translate: TranslateService,private alert: AlertController,private profileService: ProfileService,) { }

  async ngOnInit() {
    this.helpForm();
    await  this.profileService.profileDetails().then((userDetails) => {
        this.userDetails = userDetails;
      });
    App.getInfo().then((data)=>{
      this.metaData = {
        deviceName: this.device.model,
        androidVersion: this.device.version,
        version: data.version,
        type: ''
      }
    })
    
  }

  onSubmit(option: any) {
    this.metaData.type = option.value;
    this.form1.myForm.value.metaData = this.metaData;
    this.form1.myForm.value.description = this.form1.myForm.value.description ? this.form1.myForm.value.description: option.value;
    (option.buttonText == "DELETE_ACCOUNT") ? this.deteteAccount(): this.submitHelpReport();
  }
  async submitHelpReport() {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.REPORT_ISSUE,
      payload: this.form1.myForm.value
    };
    try {
      let result = await this.httpService.post(config);
      result?this.toast.showToast(result.message, "success"):this.toast.showToast(result.message, "danger");
      this.loaderService.stopLoader();
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
    this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`])
  }
  async deteteAccount(){
    let texts: any;
        this.translate.get(['DELETE_ALERT_MSG', 'YES', 'NO']).subscribe(text => {
          texts = text;
        })
        const alert = await this.alert.create({
          message: texts['DELETE_ALERT_MSG'],
          buttons: [
            {
              text: texts['YES'],
              cssClass: "alert-button",
              handler: () => { }
            },
            {
              text: texts['NO'],
              cssClass: "alert-button-no",
              role: 'no',
              handler: () => { }
            }
          ]
        });
        await alert.present();
        let data = await alert.onDidDismiss();
      if(data.role == 'no'){
        await this.loaderService.startLoader();
        const config = {
          url: urlConstants.API_URLS.REPORT_ISSUE,
          payload: this.form1.myForm.value
        };
        try {
          let result = await this.httpService.post(config);
          result?this.toast.showToast(result.message, "success"):this.toast.showToast(result.message, "danger");
          this.loaderService.stopLoader();
        }
        catch (error) {
          this.loaderService.stopLoader();
        }
        this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`])
      }
  }
  async helpForm(){
    const result = await this.form.getForm(HELP);
    this.formData = _.get(result, 'result.data.fields');
    this.helpForms = _.get(result, 'result.data.fields.forms');
    this.selectedOption = this.helpForms[0];
    this.message = (this.userDetails?.isAMentor) ? this.selectedOption?.menterMessage : this.selectedOption?.menteeMessage;
  }
  clickOptions(event:any){
    this.selectedOption = event.detail.value;
    this.message = (this.userDetails.isAMentor) ? this.selectedOption?.menterMessage : this.selectedOption?.menteeMessage;
  }
}