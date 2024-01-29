import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MenuController, NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { AuthService, LocalStorageService, ToastService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';

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
      'width': '46px',
      'height': '46px',
      'border-radius': '8px'
    }
  };
  resetPasswordData = { email: null, password: null, otp: null };
  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: '',
    },
    notification: false,
  };
  otp: any;
  isEnabled: boolean = false;
  actionType;
  enableResendOtp: boolean = false;
  timeLimit = 60;
  countDownTimer;
  labels;
  signupData: any;
  checked: boolean = false;
  privacyPolicyUrl =environment.privacyPolicyUrl;
  termsOfServiceUrl = environment.termsOfServiceUrl;

  constructor(private router: Router, private profileService: ProfileService,private location: Location, private activatedRoute: ActivatedRoute, private localStorage: LocalStorageService, private translateService: TranslateService, private authService: AuthService, private toast: ToastService, private menuCtrl: MenuController, private nav: NavController) {
    if(!this.router.getCurrentNavigation()?.extras.state){
      this.location.back();
    }
    this.actionType=this.router.getCurrentNavigation().extras.state?.type;
    if(this.actionType != 'signup'){
      this.checked = true;
    }
    this.resetPasswordData.email = this.actionType == "reset-password" ? this.router.getCurrentNavigation().extras.state?.email : null;
    this.resetPasswordData.password = this.actionType == "reset-password" ? this.router.getCurrentNavigation().extras.state?.password : null;
    this.signupData = this.actionType == "signup" ? this.router.getCurrentNavigation().extras.state?.formData : null;
    this.menuCtrl.enable(false);
  }

  ngOnInit() {
    this.labels = this.actionType == 'signup' ? ['VERIFY_ACCOUNT'] : ['ENTER_OTP'];
    this.translateText();
    this.startCountdown();
  }

  async translateText() {
    this.translateService.setDefaultLang('en');
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

  startCountdown() {
    this.countDownTimer = this.timeLimit;
    let counter = 0;
    const interval = setInterval(() => {
      this.countDownTimer--;
      counter++;
      if (counter == this.timeLimit) {
        clearInterval(interval);
        this.countDownTimer = null;
        this.enableResendOtp = true;
      }
    }, 1000);
  }

  async onSubmit() {
    if (this.actionType == "signup") {
      this.signupData.otp = this.otp;
      this.signupData.has_accepted_terms_and_conditions = this.checked;
      let result = await this.authService.createAccount(this.signupData);
      if (result) {
        this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`], { replaceUrl: true });
        this.menuCtrl.enable(true);
      }
    } else {
      this.resetPasswordData.otp = this.otp;
      let response = await this.profileService.updatePassword(this.resetPasswordData);
      if (response) {
        this.router.navigate([`${CommonRoutes.TABS}/${CommonRoutes.HOME}`], { replaceUrl: true })
        this.menuCtrl.enable(true);
      }
    }
  }

  async resendOtp() {
    this.enableResendOtp = false;
    var response = this.actionType == "signup" ? await this.profileService.registrationOtp(this.signupData) : await this.profileService.generateOtp({ email: this.resetPasswordData.email, password:  this.resetPasswordData.password});
    if (response) {
      this.toast.showToast(response.message, "success");
      this.startCountdown();
    }
  }

  onOtpChange(otp) {
    this.otp = otp;
    this.isEnabled = this.otp.length == 6 ? true : false;
  }
  checkboxClick(e){
   this.checked = e.detail.checked
  }

}
