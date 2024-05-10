import { Component, OnInit, ViewChild } from '@angular/core';
import {
  AuthService,
  HttpService,
  LocalStorageService,
  UtilService,
} from 'src/app/core/services';
import { MenuController } from '@ionic/angular';
import * as moment from 'moment';
import { SessionService } from 'src/app/core/services/session/session.service';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import jwt_decode from 'jwt-decode'; 
import { paginatorConstants } from 'src/app/core/constants/paginatorConstants';
import { MatPaginator } from '@angular/material/paginator';

@Component({
  selector: 'app-login-activity',
  templateUrl: './login-activity.page.html',
  styleUrls: ['./login-activity.page.scss'],
})
export class LoginActivityPage implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize = paginatorConstants.defaultPageSize;
  pageSizeOptions = paginatorConstants.pageSizeOptions;

  public headerConfig: any = {
    backButton: true,
    label: 'LOGIN_ACTIVITY',
    color: 'primary',
  };
  loginTimes: any;
  response: any;
  sessionId: any;
  sessionData: any;
  totalCount: any;
  page : any = 1;

  constructor(
    private authService: AuthService,
    private utilService: UtilService,
    public menuCtrl: MenuController,
    public sessionService: SessionService,
    public http: HttpService,
    private localStorage: LocalStorageService,
  ) {}

  async ngOnInit() {
    this.sessionActivities();
    let token = await this.localStorage.getLocalData(localKeys.TOKEN);
    this.sessionData = jwt_decode(token.access_token);
    this.sessionId = this.sessionData?.data?.session_id;
  }

  async sessionActivities(){
    this.response = await this.sessionService.sessionActivity(this.pageSize, this.page);
    this.totalCount = this.response?.count;
  }

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

  logoutInactive(id) {
    this.authService.logoutAccount(false,id);
    this.sessionActivities();
  }

  convertEpochToRealTime(epochTime: number): string {
    return moment.unix(epochTime).format('h:mm A [on] DD MMMM YYYY');
  }
  onPageChange(event){
    this.page = event.pageIndex + 1,
    this.pageSize = this.paginator.pageSize;
    this.sessionActivities();
  }
}
