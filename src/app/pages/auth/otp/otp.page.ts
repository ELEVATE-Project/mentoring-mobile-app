import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
})
export class OtpPage implements OnInit {
  @ViewChild('ngOtpInput', { static: false }) ngOtpInputRef: any;
  config = {
    allowNumbersOnly: true,
    length: 6,
    inputStyles: {
      'width': '50px',
      'height': '50px',
      'border-radius': '10px'
    }
  };
  resetPasswordData: any;
  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: '',
    },
    notification: false,
  };
  otp: any;
  isEnabled:boolean=false;
  actionType;
  enableResendOtp: boolean =false;
  timeLimit=60;
  countDownTimer;
  labels;

  constructor(private router:Router, private profileService: ProfileService, private activatedRoute: ActivatedRoute, private localStorage: LocalStorageService, private translateService: TranslateService){ 
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.resetPasswordData = {email:params.get('email'), password: params.get('password'), otp: Number};
      this.actionType = params.get('type');
    });
  }

  ngOnInit() {
    this.labels = this.actionType=='signup'?['VERIFY_ACCOUNT']:['ENTER_OTP'];
    this.translateText();
    this.startCountdown();
  }

  async translateText() {
    this.translateService.get(this.labels).subscribe(translatedLabel => {
      let labelKeys = Object.keys(translatedLabel);
      labelKeys.forEach((key)=>{
        let index = this.labels.findIndex(
          (label) => label === key
        )
        this.labels[index]=translatedLabel[key];
      })
    })
  }

  startCountdown() {
    this.countDownTimer= this.timeLimit;
    let counter=0;
    const interval = setInterval(() => {
      this.countDownTimer--;
      counter++;
      if (counter==this.timeLimit) {
        clearInterval(interval);
        this.countDownTimer=null;
        this.enableResendOtp=true;
      }
    }, 1000);
  }

  async onSubmit(){
    if(this.actionType!="signup"){
    this.resetPasswordData.otp= this.otp;
    let response = await this.profileService.updatePassword(this.resetPasswordData);
    let result = response.result;
    this.localStorage.setLocalData(localKeys.USER_DETAILS, result);
    this.router.navigate([`/${CommonRoutes.TERMS_AND_CONDITIONS}`],{replaceUrl:true});
    } else {
      this.router.navigate([`/${CommonRoutes.TERMS_AND_CONDITIONS}`],{replaceUrl:true});
    }
  }
  async resendOtp(){
    this.enableResendOtp=false;
    //var response = await this.profileService.generateOtp({ email: this.resetPasswordData.email });
    this.startCountdown();
  }

  onOtpChange(otp) {
    this.otp = otp;
    this.isEnabled= this.otp.length==6?true:false;
  }
}
