import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthService, LocalStorageService } from 'src/app/core/services';
import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';
import { environment } from 'src/environments/environment';

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
          minlength: "Password should contain minimum of 8 characters"
        },
        validators: {
          required: true,
          minLength: 8,
        },
      },
    ],
  };
  id: any;
  userDetails: any;
  public headerConfig: any = {
    backButton: {
      label: '',
      color: 'primary'
    },
    notification: false,
    signupButton: true
  };
  labels = ["LOGIN_TO_MENTOR_ED"];
  mentorId: any;
  supportInfo: any;
  privacyPolicyUrl =environment.privacyPolicyUrl;
  termsOfServiceUrl = environment.termsOfServiceUrl;
  constructor(private authService: AuthService, private router: Router,
              private menuCtrl: MenuController, private activatedRoute: ActivatedRoute,
              private translateService: TranslateService, private localStorage: LocalStorageService) {
    this.menuCtrl.enable(false);
  }
  @HostListener('document:keydown.enter', ['$event'])
    onEnterKey(event: KeyboardEvent) {
      let currentState = this.router.routerState.snapshot.url;
      if (event.key === 'Enter' && currentState == '/auth/login') {
        this.onSubmit();
      }
  }

  ngOnInit() {
    this.translateText();
    this.getMailInfo();
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

  ionViewWillEnter() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.id = params.sessionId ? params.sessionId : this.id;
      this.mentorId = params.mentorId? params.mentorId:this.mentorId;
    });
  }

  async onSubmit() {
    this.form1.onSubmit();
    if (this.form1.myForm.valid) {
      this.userDetails = await this.authService.loginAccount(this.form1.myForm.value);
      if (this.userDetails !== null) {
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
  getMailInfo(){
    this.authService.getMailInfo().then((result:any) =>{
      this.supportInfo = result
    })
}
}
