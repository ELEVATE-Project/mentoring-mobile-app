import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
})
export class OtpPage implements OnInit {
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

  constructor(private router:Router) { }

  ngOnInit() {
  }

  onSubmit(){
    this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`])
  }

}
