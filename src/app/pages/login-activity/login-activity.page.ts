import { Component, OnInit } from '@angular/core';
import {
  AuthService,
  LocalStorageService,
  UtilService,
} from 'src/app/core/services';
import { MenuController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';

@Component({
  selector: 'app-login-activity',
  templateUrl: './login-activity.page.html',
  styleUrls: ['./login-activity.page.scss'],
})
export class LoginActivityPage implements OnInit {
  public headerConfig: any = {
    backButton: true,
    label: 'LOGIN_ACTIVITY',
    color: 'primary',
  };
  loginTimes: any;

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    public menuCtrl: MenuController,
    private localStorage: LocalStorageService,
    private translate: TranslateService
  ) {}

  public datas: any = [
    {
      id: 1,
      device_info: {
        browserName: 'Chrome',
        browserVersion: '122.0.0.0',
        osName: 'Linux',
        platformType: 'desktop',
        type: '',
      },
      status: 'ACTIVE',
      login_time: 1710933392,
    },
    {
      id: 1,
      device_info: {
        browserName: 'Mozila',
        browserVersion: '122.0.0.0',
        osName: 'Linux',
        platformType: 'desktop',
        type: '',
      },
      status: 'ACTIVE',
      login_time: 1710933392,
    },
    {
      id: 2,
      device_info: {
        browserName: 'Chrome',
        browserVersion: '122.0.0.0',
        osName: 'Android',
        platformType: 'mobile',
        type: '',
      },
      status: 'ACTIVE',
      login_time: 1710933393,
    },
    {
      id: 3,
      device_info: {
        browserName: 'Chrome',
        browserVersion: '122.0.0.0',
        osName: 'macOS',
        platformType: 'desktop',
        type: '',
      },
      status: 'INACTIVE',
      login_time: null,
    },
  ];
  public sessionId = 1;
  ngOnInit() {}

  logout() {
    let msg = {
      header: 'LOGOUT',
      message: 'LOGOUT_CONFIRM_MESSAGE',
      cancel: 'CANCEL',
      submit: 'LOGOUT',
    };
    this.utilService
      .alertPopup(msg)
      .then(async (data) => {
        if (data) {
          await this.authService.logoutAccount();
        }
      })
      .catch((error) => {});
  }
  logoutInactive() {
    console.log('inactive');
  }

  convertEpochToRealTime(epochTime: number): string {
    return moment.unix(epochTime).format('YYYY-MM-DD HH:mm:ss');
  }
}
