import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { AuthService, LocalStorageService } from 'src/app/core/services';
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
        label: 'Email',
        value: '',
        class: 'ion-no-margin',
        type: 'text',
        position: 'floating',
        errorMessage:'Please enter registered email ID',
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
        errorMessage:'Please enter password',
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
  constructor(private authService: AuthService, private router: Router,
              private menuCtrl: MenuController, private activatedRoute: ActivatedRoute,
              private translateService: TranslateService, private localStorage: LocalStorageService) {
    this.menuCtrl.enable(false);
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
        }else if(this.mentorId){
          this.router.navigate([`/${CommonRoutes.MENTOR_DETAILS}/${this.mentorId}`], { replaceUrl: true });
        } else {
          this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`], { replaceUrl: true });
        }
      }
      this.menuCtrl.enable(true);
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
    this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.PERSONA_SELECTION}`]);
  }

}
