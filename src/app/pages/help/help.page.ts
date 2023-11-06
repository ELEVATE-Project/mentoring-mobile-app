import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, LoaderService, ToastService } from 'src/app/core/services';
import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';
// import { Device } from '@awesome-cordova-plugins/device/ngx';
import { Device } from '@capacitor/device';
import { FormService } from 'src/app/core/services/form/form.service';
import { HELP } from 'src/app/core/constants/formConstant';
import * as _ from 'lodash';
import { App } from '@capacitor/app';
import { TranslateService } from '@ngx-translate/core';
import { AlertController } from '@ionic/angular';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import * as Bowser from "bowser"

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
  metaData:any;
  selectedOption: any;
  helpForms: any;
  userDetails: any;
  message: any;
  public isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);
 

  constructor(private router: Router, private loaderService: LoaderService, private toast: ToastService, private httpService: HttpService,
    // private device: Device, 
    private form: FormService, private translate: TranslateService,private alert: AlertController,private profileService: ProfileService,) { }

  async ngOnInit() {
    const browser = Bowser.getParser(window.navigator.userAgent);
    this.helpForm();
    await  this.profileService.profileDetails().then((userDetails) => {
        this.userDetails = userDetails;
      });
      if(this.isMobile){
        App.getInfo().then(async (data)=>{
          const info = await Device.getInfo();
          this.metaData = {
            deviceName: info.model,
            androidVersion: info.osVersion,
            version: data.version,
            type: '',
          }
        })
      }else{
        this.metaData = {
          type: '',
          browserName:browser.getBrowserName(),
          browserVersion:browser.getBrowserVersion()
        }
      }
   
    
  }

  onSubmit(option: any) {
    this.metaData.type = option.value;
    this.form1.myForm.value.meta_data = this.metaData;
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
        this.translate.get(['DELETE_ALERT_MSG', 'YES', 'NO', 'DELETE_ACCOUNT']).subscribe(text => {
          texts = text;
        })
        const alert = await this.alert.create({
          header: texts['DELETE_ACCOUNT'],
          message: texts['DELETE_ALERT_MSG'],
          buttons: [
            {
              text: texts['YES'],
              cssClass: "alert-button-bg-white",
              role: 'yes',
              handler: () => { }
            },
            {
              text: texts['NO'],
              cssClass: "alert-button",
              role: 'no',
              handler: () => { }
            }
          ]
        });
        await alert.present();
        let data = await alert.onDidDismiss();
      if(data.role == 'yes'){
        this.submitHelpReport();
      }
  }
  async helpForm(){
    const result = await this.form.getForm(HELP);
    this.formData = _.get(result, 'data.fields');
    this.helpForms = _.get(result, 'data.fields.forms');
    this.selectedOption = this.helpForms[0];
    this.message = (this.profileService.isMentor) ? this.selectedOption?.menterMessage : this.selectedOption?.menteeMessage;
  }
  clickOptions(event:any){
    this.selectedOption.form = event.detail.value.form;
    this.message = (this.profileService.isMentor) ? this.selectedOption?.menterMessage : this.selectedOption?.menteeMessage;
    this.form1?.createForm(this.selectedOption.form.controls);
  }
}