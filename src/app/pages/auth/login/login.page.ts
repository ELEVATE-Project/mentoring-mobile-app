import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController } from '@ionic/angular';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { AuthService, HttpService, LoaderService, LocalStorageService } from 'src/app/core/services';
import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;
  formData: JsonFormData = {
    controls: [
      {
        name: 'email',
        label: 'Email:',
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
        label: 'Password:',
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
  REGISTER: string = CommonRoutes.REGISTER;
  AUTH: string = CommonRoutes.AUTH;
  constructor(
    private httpService:HttpService,
    private localStorage: LocalStorageService,
    private navCtrl:NavController,
    private loaderService:LoaderService,
    private authService:AuthService
    ) { }
  ngOnInit() { }

  async onSubmit() {
    this.form1.onSubmit();
    await this.loaderService.startLoader();
    const config = {
      url:
        urlConstants.API_URLS.ACCOUNT_LOGIN,
      payload: this.form1.myForm.value
    };
    this.httpService.post(config)
      .then((data: any) => {
        if (data.responseCode === "OK") {
          let result = data.result;
          this.localStorage.setLocalData(localKeys.USER_DETAILS,JSON.stringify(result));
          this.authService.userSubject.next(result);
          this.authService.authState.next(true);
          this.loaderService.stopLoader();
          this.navCtrl.navigateRoot(['/tabs/home']);
        }
        else {
          this.loaderService.stopLoader();
        }
      })
  }
}
