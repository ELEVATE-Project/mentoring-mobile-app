import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, LoaderService, ToastService } from 'src/app/core/services';
import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';
import { Device } from '@awesome-cordova-plugins/device/ngx';

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
  formData: JsonFormData = {
    controls: [
      {
        "name": "description",
        "label": "Tell us here",
        "value": "",
        "class": "ion-margin",
        "type": "text",
        "position": "floating",
        "validators": {}
      },
    ]
  };
  metaData: { deviceName: string; androidVersion: string; };

  constructor(private router: Router, private loaderService: LoaderService, private toast: ToastService, private httpService: HttpService, private device: Device) { }

  ngOnInit() {
    this.metaData = {
      deviceName: this.device.model,
      androidVersion: this.device.version
    }
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
}