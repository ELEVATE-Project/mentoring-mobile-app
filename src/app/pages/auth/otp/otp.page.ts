import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService } from 'src/app/core/services';
import { DynamicFormComponent, JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
})
export class OtpPage implements OnInit {
  @ViewChild('form1') form1: DynamicFormComponent;
  resetPasswordData: any;
  formData: JsonFormData = {
    controls: [
      {
        name: 'otp',
        label: 'Enter OTP',
        value: '',
        class: 'ion-margin',
        type: 'number',
        position: 'floating',
        validators: {
          required: true,
        },
      },
    ]
  };  
  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: '',
    },
    notification: false,
    headerColor: 'white',
  };

  constructor(private router:Router, private profileService: ProfileService, private activatedRoute: ActivatedRoute, private localStorage: LocalStorageService){ 
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.resetPasswordData = {email:params.get('email'), password: params.get('password'), otp: Number}
    });
  }

  ngOnInit() {
  }

  async onSubmit(){
    let formJson = this.form1.myForm.value;
    this.resetPasswordData.otp= formJson.otp;
    console.log(this.resetPasswordData);
    let response = await this.profileService.updatePassword(this.resetPasswordData);
    let result = response.result;
    this.localStorage.setLocalData(localKeys.USER_DETAILS, result);
    this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`],{replaceUrl:true});
  }
  async resendOtp(){
    var response = await this.profileService.generateOtp({ email: this.resetPasswordData.email });
  }
}
