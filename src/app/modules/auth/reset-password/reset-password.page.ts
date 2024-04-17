import { Component, OnInit, ViewChild } from '@angular/core';
import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import * as _ from 'lodash-es';
import { CommonRoutes } from 'src/global.routes';
import { Router } from '@angular/router';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { ToastService } from 'src/app/core/services';
import { TranslateService } from '@ngx-translate/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
})
export class ResetPasswordPage implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;
  formData: JsonFormData = {
    controls: [
      {
        name: 'email',
        label: 'Email',
        value: '',
        class: 'ion-margin',
        type: 'email',
        errorMessage:{
          required: "Please enter registered email ID",
          email:"Enter a valid email ID"
        },
        position: 'floating',
        validators: {
          required: true,
          email: true
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
          minlength:(environment as any)?.password?.minLength ? "Please enter minimum " + (environment as any)?.password?.minLength+" characters.":"Please enter minimum 8 characters.",
          pattern: (environment as any)?.password?.errorMessage ? (environment as any)?.password?.errorMessage :"Only letters, numbers,!@#%$&()-`.+,/\" are allowed",
        },
        position: 'floating',
        validators: {
          required: true,
          minLength:(environment as any)?.password?.minLength? (environment as any)?.password?.minLength: 8,
          pattern: (environment as any)?.password?.regexPattern ? (environment as any)?.password?.regexPattern :"^[a-zA-Z0-9!@#%$&()\\-`.+,/\"]*$",
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
          minlength:(environment as any)?.password?.minLength ? "Please enter minimum " + (environment as any)?.password?.minLength+" characters.":"Please enter minimum 8 characters.",
          pattern: (environment as any)?.password?.errorMessage ? (environment as any)?.password?.errorMessage :"Only letters, numbers,!@#%$&()-`.+,/\" are allowed",
        },
        position: 'floating',
        validators: {
          required: true,
          minLength:(environment as any)?.password?.minLength? (environment as any)?.password?.minLength: 8,
          pattern: (environment as any)?.password?.regexPattern ? (environment as any)?.password?.regexPattern :"^[a-zA-Z0-9!@#%$&()\\-`.+,/\"]*$",
        },
      },
    ],
  };
  showPassword = false;
  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: '',
    },
    notification: false,
  };
  labels = ["RESET_PASSWORD"]

  constructor(private router: Router, private profileService: ProfileService, private toastService: ToastService, private translateService: TranslateService) { }

  ngOnInit() {
    this.translateText();
  }
  async translateText() {
    this.translateService.setDefaultLang('en');
    this.translateService.get(this.labels).subscribe(translatedLabel => {
      let labelKeys = Object.keys(translatedLabel);
      labelKeys.forEach((key) => {
        let index = this.labels.findIndex(
          (label) => label === key
        )
        this.labels[index] = translatedLabel[key];
      })
    })
  }
  togglePassword() {
    let type = this.showPassword ? 'password' : 'text';
    _.forEach(this.formData.controls, (data) => {
      if (data.type === type) {
        data.type = !this.showPassword ? 'password' : 'text';;
      }
    });
  }

  async onSubmit() {
    let formJson = this.form1.myForm.value;
    if (this.form1.myForm.valid) {
      if (_.isEqual(formJson.password, formJson.newPassword)) {
          this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.OTP}`], { state: { type: "reset-password", email: formJson.email, password: formJson.password } });
      } else {
        this.toastService.showToast('Please enter the same password', 'danger');
      }
    }
  }
}
