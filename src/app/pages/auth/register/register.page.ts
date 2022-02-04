import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthService, ToastService } from 'src/app/core/services';
import {
  DynamicFormComponent,
  JsonFormData,
} from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import * as _ from 'lodash-es';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';

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

  constructor(
    private authService: AuthService,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.activatedRoute.queryParams.subscribe(params => {
      this.userType = params.userType;
      if(this.userType=="mentor"){
      this.formData.controls.push(this.secretCodeControl);
      this.isAMentor=true;
      }
    });
  }
  ngOnInit() { }

  ionViewWillEnter() {
  }

  async onSubmit() {
    this.form1.onSubmit();
    if(this.userType=="mentor"){
      if(this.form1.myForm.value.secretCode!=="4567"){
        this.toastService.showToast("Incorrect code. Please try again", "danger");
      } else {
        this.createUser();
      }
    } else {
      this.createUser();
    }
  }

  async createUser() {
    let formJson = this.form1.myForm.value;
    if (_.isEqual(formJson.password, formJson.cPassword)) {
      //let result = await this.authService.createAccount(this.form1.myForm.value);
      //if(result){
      this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.OTP}`], {queryParams:{type:"signup"}});
      //}
    } else {
      this.toastService.showToast('Password Mismatch', 'danger');
    }
  }
  ionViewDidLeave() {
    this.formData.controls.pop();
  }
}
