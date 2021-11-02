import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService} from 'src/app/core/services';
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
  constructor(private authService: AuthService) { }
  
  ngOnInit() { }

  async onSubmit() {
    this.form1.onSubmit();
    this.authService.loginAccount(this.form1.myForm.value);
  }
}
