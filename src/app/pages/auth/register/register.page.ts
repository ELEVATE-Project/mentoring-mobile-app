import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService, ToastService } from 'src/app/core/services';
import {
  DynamicFormComponent,
  JsonFormData,
} from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import * as _ from 'lodash-es';

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
        },
      },
    ],
  };
  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: '',
    },
    notification: false,
    headerColor: 'white',
  };
  
  //to be removed
  isAMentor=false;
  secretCode;

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) {}
  ngOnInit() {}

  async onSubmit() {
    this.form1.onSubmit();
    let formJson = this.form1.myForm.value;

    //to be removed
    if(this.isAMentor){
      this.form1.myForm.value.isAMentor = this.isAMentor;
      this.form1.myForm.value.secretCode = this.secretCode;
    }
    if (this.form1.myForm.valid) {
      if (_.isEqual(formJson.password, formJson.cPassword)) {
        this.authService.createAccount(this.form1.myForm.value);
      } else {
        this.toastService.showToast('Password Mismatch', 'danger');
      }
    }
  }

  //to be removed
  signUpAsMentor(){
    this.isAMentor = this.isAMentor ? false:true;
  }
}
