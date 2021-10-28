import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, LoaderService, LocalStorageService } from 'src/app/core/services';
import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;
  formData: JsonFormData = {
    controls: [
      {
        name: 'name',
        label: 'Name',
        value: '',
        class: 'ion-margin',
        type: 'text',
        position: 'floating',
        validators: {
          required: true,
        },
      },
      {
        name: 'email',
        label: 'Email',
        value: '',
        class: 'ion-margin',
        type: 'text',
        position: 'floating',
        validators: {
          required: true,
        },
      },
      {
        name: 'password',
        label: 'Password',
        value: '',
        class: 'ion-margin',
        type: 'password',
        position: 'floating',
        validators: {
          required: true,
        },
      },
      {
        name: 're-password',
        label: 'Re-enter Password',
        value: '',
        class: 'ion-margin',
        type: 'password',
        position: 'floating',
        validators: {
          required: true,
        },
      },
    ],
  };
  constructor(
    private httpService:HttpService,
    private localStorage: LocalStorageService,
    private navCtrl:NavController,
    private loaderService:LoaderService
  ) {}
  ngOnInit() {}

  async onSubmit() {
    this.form1.onSubmit();
    await this.loaderService.startLoader();
    const config = {
      url:
        urlConstants.API_URLS.CREATE_ACCOUNT,
      payload: this.form1.myForm.value
    };
    this.httpService.post(config)
      .then((data: any) => {
        if (data.responseCode === "OK") {
          this.loaderService.stopLoader();
          this.navCtrl.navigateRoot(`/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`);
        }
        else {
          this.loaderService.stopLoader();
        }
      })
  }

}
