import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService, ToastService } from 'src/app/core/services';
import {
  DynamicFormComponent,
  JsonFormData,
} from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import * as _ from 'lodash-es';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { TranslateService } from '@ngx-translate/core';
import { ProfileService } from 'src/app/core/services/profile/profile.service';

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
          pattern:'^[a-zA-Z0-9 ]*$',
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
          minLength: 8,
        },
      },
      {
        name: 'cPassword',
        label: 'Confirm Password',
        value: '',
        class: 'ion-margin',
        type: 'password',
        position: 'floating',
        validators: {
          required: true,
          minLength: 8,
        }
      }
    ]
  };

  secretCodeControl = {
    name: 'secretCode',
    label: 'Secret code',
    value: '',
    class: 'ion-margin',
    type: 'secretCode',
    position: 'floating',
    validators: {
      required: true,
    },
  };
  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: '',
    },
    notification: false,
  };

  //to be removed
  secretCode: string = "";
  userType: any;
  isAMentor: boolean;
  labels = ["SIGN_UP_TO_MENTOR_ED"]

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private profileService: ProfileService
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.userType = params.userType;
      if (this.userType == "mentor") {
        this.formData.controls.push(this.secretCodeControl);
        this.isAMentor = true;
      }
    });
  }
  ngOnInit() {
    this.translateText();
  }

  async translateText() {
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

  async onSubmit() {
    this.form1.onSubmit();
    this.createUser();
  }

  async createUser() {
    let formJson = this.form1.myForm.value;
    formJson.isAMentor = this.isAMentor ? this.isAMentor : false;
    if (_.isEqual(formJson.password, formJson.cPassword)) {
      let result = await this.profileService.registrationOtp(formJson);
      if (result) {
        this.toastService.showToast(result.message, "success")
        this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.OTP}`], { state: { type: "signup", formData: formJson } });
      }
    } else {
      this.toastService.showToast('Password Mismatch', 'danger');
    }
  }
  ionViewDidLeave() {
    if (this.userType == "mentor") {
      this.formData.controls.pop();
    }
  }
}
