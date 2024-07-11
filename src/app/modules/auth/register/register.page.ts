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
        errorMessage:{
          required: "Enter your name",
          pattern: "This field can only contain alphabets"
        },
        validators: {
          required: true,
          pattern:'^[a-zA-Z ]*$',
        },
      },
      {
        name: 'email',
        label: 'Email',
        value: '',
        class: 'ion-margin',
        type: 'email',
        position: 'floating',
        errorMessage:{
          required: "Please enter registered email ID",
          email:"Enter a valid email ID"
        },
        validators: {
          required: true,
          email: true
        },
      },
      {
        name: 'password',
        label: 'Password',
        value: '',
        class: 'ion-margin',
        type: 'password',
        position: 'floating',
        errorMessage:{
          required: "Enter password",
          minlength:window['env']?.password?.minLength ? "Please enter minimum " + window['env']?.password?.minLength +" characters." : "Please enter minimum 8 characters.",
          pattern: window['env']?.password?.errorMessage ? window['env']?.password?.errorMessage :"Only letters, numbers,!@#%$&()-`.+,/\" are allowed",
        },
        validators: {
          required: true,
          minLength:window['env']?.password?.minLength ? window['env']?.password?.minLength: 8,
          pattern: window['env']?.password?.regexPattern ? window['env']?.password?.regexPattern :"^[a-zA-Z0-9!@#%$&()\\-`.+,/\"]*$",
        },
      },
      {
        name: 'cPassword',
        label: 'Confirm password',
        value: '',
        class: 'ion-margin',
        type: 'password',
        position: 'floating',
        errorMessage:{
          required: "Re-enter password",
          minlength:window['env']?.password?.minLength ? "Please enter minimum " + window['env']?.password.minLength+" characters.":"Please enter minimum 8 characters.",
          pattern: window['env']?.password?.errorMessage ? window['env']?.password.errorMessage :"Only letters, numbers,!@#%$&()-`.+,/\" are allowed",
        },
        validators: {
          required: true,
          minLength: window['env']?.password?.minLength ? window['env']?.password.minLength:8,
          pattern: window['env']?.password?.regexPattern ? window['env']?.password.regexPattern :"^[a-zA-Z0-9!@#%$&()\\-`.+,/\"]*$",
        }
      }
    ]
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
    });
  }
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

  async onSubmit() {
    this.form1.onSubmit();
    this.createUser();
  }

  async createUser() {
    let formJson = this.form1.myForm.value;
    if (_.isEqual(formJson.password, formJson.cPassword)) {
        this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.OTP}`], { state: { type: "signup", formData: formJson } });
    } else {
      this.toastService.showToast('Password does not match.', 'danger');
    }
  }
  ionViewDidLeave() {
    if (this.userType == "mentor") {
      this.formData.controls.pop();
    }
  }
  onLogin(){
    this.router.navigate([`${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`]);
  }
}
