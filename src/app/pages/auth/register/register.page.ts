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
  secretCode: string="";
  isChecked: any;

  constructor(
    private authService: AuthService,
    private toastService: ToastService
  ) { }
  ngOnInit() { }

  ionViewWillEnter() {
    this.isChecked = false;
  }

  async onSubmit() {
    this.form1.onSubmit();

    //to be removed
    if (this.secretCode !== "" && this.isChecked == true) {
      this.form1.myForm.value.isAMentor = this.isChecked;
      this.form1.myForm.value.secretCode = this.secretCode;
      if(this.secretCode == "4567" && this.form1.myForm.valid){
        this.createUser();
      } else {
        this.toastService.showToast("Please enter the correct secret code", "danger");
      }
    } else if(this.isChecked==true && this.secretCode == ""){
      this.toastService.showToast("Please enter the secret code", "danger");
    } else {
      this.createUser();
    }
  }
  createUser(){
    let formJson = this.form1.myForm.value;
    if (_.isEqual(formJson.password, formJson.cPassword)) {
      this.authService.createAccount(this.form1.myForm.value);
    } else {
      this.toastService.showToast('Password Mismatch', 'danger');
    }
  }
  signUpAsMentor(event) {
    this.secretCode = "";
    this.isChecked = event?true:false;
  }
}
