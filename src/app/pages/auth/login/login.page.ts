import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { AuthService } from 'src/app/core/services';
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
  constructor(private authService: AuthService, private router: Router, private menuCtrl: MenuController, private activatedRoute: ActivatedRoute) {
    this.menuCtrl.enable(false);
  }

  ngOnInit() { }

  ionViewWillEnter() {
    this.activatedRoute.queryParams.subscribe(params => {
      this.id = params.sessionId ? params.sessionId : this.id;
    });
  }

  async onSubmit() {
    this.form1.onSubmit();
    if (this.form1.myForm.valid) {
      this.userDetails = await this.authService.loginAccount(this.form1.myForm.value);
      if (this.userDetails !== null) {
        if (this.id) {
          if (this.userDetails?.hasAcceptedTAndC) {
            this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${this.id}`], { replaceUrl: true });
          } else {
            this.router.navigate([`/${CommonRoutes.TERMS_AND_CONDITIONS}`], { queryParams:{sessionId : this.id}});
          }
        } else {
          if (this.userDetails?.hasAcceptedTAndC) {
            this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`], { replaceUrl: true });
          } else {
            this.router.navigate([`/${CommonRoutes.TERMS_AND_CONDITIONS}`]);
          }
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

  goToForgotPassword(){
    this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.RESET_PASSWORD}`]);
  }

  goToSignup(){
    this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.PERSONA_SELECTION}`]);
  }

}
