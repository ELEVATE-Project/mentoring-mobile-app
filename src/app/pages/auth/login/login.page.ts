import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
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
  constructor(private authService: AuthService,private router:Router) { }
  
  ngOnInit() { }

  async onSubmit() {
    this.form1.onSubmit();
    if(this.form1.myForm.valid){
    this.authService.loginAccount(this.form1.myForm.value);
    }
  }

  goToForgotPassword(){
    this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.RESET_PASSWORD}`]);
  }

  goToSignup(){
    this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.REGISTER}`]);
  }

}
