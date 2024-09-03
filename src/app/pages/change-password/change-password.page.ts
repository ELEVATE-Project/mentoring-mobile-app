import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { AuthService, ToastService } from 'src/app/core/services';
import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.page.html',
  styleUrls: ['./change-password.page.scss'],
})
export class ChangePasswordPage implements OnInit {

@ViewChild('form1') form1: DynamicFormComponent;

public headerConfig: any = {
  backButton: true,
  label: "CHANGE_PASSWORD",
  color: 'primary'
};

  formData: JsonFormData = {
    controls: [
      {
        name: 'oldPassword',
        label: 'Old password',
        value: '',
        class: 'ion-margin',
        type: 'password',
        errorMessage:{
          required: "Enter old password",
        },
        position: 'floating',
        validators: {
          required: true,
        },
      },
      {
        name: 'password',
        label: 'Enter new password',
        value: '',
        class: 'ion-margin',
        type: 'password',
        errorMessage:{
          required: "Enter new password",
          minlength:window['env']?.password?.minLength ? "Please enter minimum " + window['env']?.password?.minLength+" characters.":"Please enter minimum 8 characters.",
          pattern: window['env']?.password?.errorMessage ? window['env']?.password?.errorMessage :"Only letters, numbers,!@#%$&()-`.+,/\" are allowed",
        },
        position: 'floating',
        validators: {
          required: true,
          minLength:window['env']?.password?.minLength? window['env']?.password?.minLength: 8,
          pattern: window['env']?.password?.regexPattern ? window['env']?.password?.regexPattern :"^[a-zA-Z0-9!@#%$&()\\-`.+,/\"]*$",
        },
      },
      {
        name: 'newPassword',
        label: 'Confirm new password',
        value: '',
        class: 'ion-margin',
        type: 'password',
        errorMessage:{
          required: "Re-enter new password",
          minlength:window['env']?.password?.minLength ? "Please enter minimum " + window['env']?.password?.minLength+" characters.":"Please enter minimum 8 characters.",
          pattern: window['env']?.password?.errorMessage ? window['env']?.password?.errorMessage :"Only letters, numbers,!@#%$&()-`.+,/\" are allowed",
        },
        position: 'floating',
        validators: {
          required: true,
          minLength:window['env']?.password?.minLength? window['env']?.password?.minLength: 8,
          pattern: window['env']?.password?.regexPattern ? window['env']?.password?.regexPattern :"^[a-zA-Z0-9!@#%$&()\\-`.+,/\"]*$",
        },
      },
    ],
  };

  constructor(
    private toastService: ToastService,
    private authService:AuthService,) { }

  ngOnInit() {
  }

  async onSubmit(){
    let formJson = this.form1.myForm.value;
    if (this.form1.myForm.valid) {
      if (_.isEqual(formJson.password, formJson.newPassword)){
        this.authService.changePassword({oldPassword: formJson.oldPassword, newPassword: formJson.newPassword});
      }else {
        this.toastService.showToast('ENTER_SAME_PASSWORD', 'danger');
      }
    }
  }

}
