import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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

  constructor(private router:Router, private profileService: ProfileService, private activatedRoute: ActivatedRoute, private localStorage: LocalStorageService){ 
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.resetPasswordData = {email:params.get('email'), password: params.get('password'), otp: Number};
      this.actionType = params.get('type');
    });
  }

  ngOnInit() {
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
    var response = await this.profileService.generateOtp({ email: this.resetPasswordData.email });
  }

  onOtpChange(otp) {
    this.otp = otp;
    this.isEnabled= this.otp.length==6?true:false;
  }
}
