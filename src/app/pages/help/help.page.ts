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
  metaData: { deviceName: string; androidVersion: string; version: string};

  constructor(private router: Router, private loaderService: LoaderService, private toast: ToastService, private httpService: HttpService, private device: Device, 
    private form: FormService,) { }

  ngOnInit() {
    App.getInfo().then((data)=>{
      this.metaData = {
        deviceName: this.device.model,
        androidVersion: this.device.version,
        version: data.version
      }
      this.helpForm();
    })
    
  }

  onSubmit() {
    this.form1.myForm.value.metaData = this.metaData;
    this.submitHelpReport()
    this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`])
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
  }
  async helpForm(){
    const result = await this.form.getForm(HELP);
    this.formData = _.get(result, 'result.data.fields');
  }
}