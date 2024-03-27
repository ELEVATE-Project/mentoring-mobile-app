import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login-activity',
  templateUrl: './login-activity.page.html',
  styleUrls: ['./login-activity.page.scss'],
})
export class LoginActivityPage implements OnInit {

  public headerConfig: any = {
    backButton: true,
    label: "LOGIN_ACTIVITY",
    color: 'primary'
  };

  constructor() { }
  isSessionActive: boolean = false;

  ngOnInit() {
    this.isSessionActive = !this.isSessionActive;
  }
  public datas: any =  [
      { 
       id:"1",
       Device_info: {
         },
       Status:"inactive",
       login_time:1710933392
                
      },
      { 
        id:"2",
        Device_info: {
          },
        Status:"active",
        login_time:1710933392
                 
       },
       { 
        id:"3",
        Device_info: {
          },
        Status:"active/inactive",
        login_time:1710933392
                 
       },
      ]


}
