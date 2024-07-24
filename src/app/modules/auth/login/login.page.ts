import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthService, LocalStorageService, UserService, UtilService } from 'src/app/core/services';
import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { RecaptchaComponent } from 'ng-recaptcha';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;
  @ViewChild(RecaptchaComponent) captchaComponent: RecaptchaComponent;
  formData: JsonFormData = {
    controls: [
      {
        name: 'email',
        label: 'Email',
        value: '',
        class: 'ion-no-margin',
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
        },
        validators: {
          required: true,
        },
      },
    ],
  };
  siteKey = window['env']?.recaptchaSiteKey ? window['env']?.recaptchaSiteKey.recaptchaSiteKey  :""
  id: any;
  userDetails: any;
  recaptchaResolved: boolean = this.siteKey ? false : true;
  public headerConfig: any = {
    backButton: {
      label: '',
      color: 'primary'
    },
    notification: false,
    signupButton: true
  };
  captchaToken:any="";
  labels = ["LOGIN_TO_MENTOR_ED"];
  mentorId: any;
  supportEmail: any = window['env'].supportEmail;
  privacyPolicyUrl = window['env'].privacyPolicyUrl;
  termsOfServiceUrl = window['env'].termsOfServiceUrl;
  constructor(private authService: AuthService, private router: Router,private utilService: UtilService,
              private menuCtrl: MenuController, private activatedRoute: ActivatedRoute,private profileService: ProfileService,
              private translateService: TranslateService, private localStorage: LocalStorageService, private userService: UserService) {
    this.menuCtrl.enable(false);
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

  ionViewWillEnter() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.id = params.sessionId ? params.sessionId : this.id;
      this.mentorId = params.mentorId? params.mentorId:this.mentorId;
    });
  }

  async onSubmit() {
    this.form1.onSubmit();
    if (this.form1.myForm.valid) {
      this.userDetails = await this.authService.loginAccount(this.form1.myForm.value,this.captchaToken);
      if(this.userDetails === null && this.captchaToken){
        this.captchaComponent.reset();
      }else if (this.userDetails !== null) {
        this.utilService.ionMenuShow(true)
        let user = await this.profileService.getProfileDetailsFromAPI();
        this.userService.userEvent.next(user);
        if (this.id) {
          this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${this.id}`], { replaceUrl: true });
          this.menuCtrl.enable(true);
        }else if(this.mentorId){
          this.router.navigate([`/${CommonRoutes.MENTOR_DETAILS}/${this.mentorId}`], { replaceUrl: true });
          this.menuCtrl.enable(true);
        } else {
          this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`], { replaceUrl: true });
          this.menuCtrl.enable(true);
        }
      }
      
    }
  }

  action(event) {
    switch (event) {
      case 'signup':
        this.goToSignup();
        break;
    }
  }

  goToForgotPassword() {
    this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.RESET_PASSWORD}`]);
  }

  goToSignup() {
    this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.REGISTER}`]);
  }


onCaptchaResolved(token: string) {
  this.captchaToken = token
  this.recaptchaResolved = token?  true: false;
}
}
