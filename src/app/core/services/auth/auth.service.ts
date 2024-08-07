import { Injectable } from '@angular/core';
import { localKeys } from '../../constants/localStorage.keys';
import { LocalStorageService } from '../localstorage.service';
import { HttpService } from '../http/http.service';
import { urlConstants } from '../../constants/urlConstants';
import * as _ from 'lodash-es';
import { LoaderService } from '../loader/loader.service';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { ToastService } from '../toast.service';
import { UserService } from '../user/user.service';
import { ProfileService } from '../profile/profile.service';
import { TranslateService } from '@ngx-translate/core';
import { DbService } from '../db/db.service';
import { UtilService } from '../util/util.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl: any;
  user: any;
  deviceInfo: string;
  constructor(
    private localStorage: LocalStorageService,
    private httpService: HttpService,
    private loaderService: LoaderService,
    private router: Router,
    private toast: ToastService,
    private userService: UserService,
    private profileService: ProfileService,
    private translate: TranslateService,
    private db: DbService,
    private util: UtilService
  ) { }

  async createAccount(formData) {
    this.deviceInfo = await this.util?.deviceDetails();
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.CREATE_ACCOUNT,
      payload: formData,
      headers:  {'device-info': this.deviceInfo}
    }
    try {
      let data: any = await this.httpService.post(config);
      await this.setUserInLocal(data);
      let user = await this.profileService.getProfileDetailsFromAPI();
      this.userService.userEvent.next(user);
      this.loaderService.stopLoader();
      return data.result.user;
    }
    catch (error) {
      this.loaderService.stopLoader();
      return null
    }
  }

  async loginAccount(formData,captchaToken:any) {
    this.deviceInfo = await this.util?.deviceDetails();
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.ACCOUNT_LOGIN,
      payload: formData,
      headers: captchaToken ?  {'captcha-token': captchaToken, 'device-info': this.deviceInfo}:{ 'device-info': this.deviceInfo}
    };
    try {
      const data: any = await this.httpService.post(config);
      this.setUserInLocal(data);
      this.loaderService.stopLoader();
      return data.result.user
    }
    catch (error) {
      this.loaderService.stopLoader();
      return null;
    }
  }
  async setUserInLocal(data) {
    const result = _.pick(data.result, ['refresh_token', 'access_token']);
    if (!result.access_token) { throw Error(); };
    this.userService.token = result;
    await this.localStorage.setLocalData(localKeys.TOKEN, result);
    this.user = data.result.user;
    await this.localStorage.setLocalData(localKeys.USER_ROLES, this.profileService.getUserRole(this.user))
    await this.profileService.getUserRole(this.user);
    this.profileService.isMentor = (this.user?.user_roles[0]?.title === 'mentor')
    await this.localStorage.setLocalData(localKeys.SELECTED_LANGUAGE, this.user.preferred_language.value);
    this.translate.use(this.user.preferred_language.value)
    return this.user;
  }

  async logoutAccount(skipApiCall?: boolean, userSessionId?: any) {
    const config: any = {
      url: urlConstants.API_URLS.LOGOUT_ACCOUNT,
      payload: {
        'X-auth-token': _.get(this.userService.token, 'access_token'),
        'refresh_token': _.get(this.userService.token, 'refresh_token')
      }
    };
    if(userSessionId){
      config.payload.userSessionIds = [userSessionId]
    }
    try {
      if (!skipApiCall) {
        await this.httpService.post(config);
      }
      if(!userSessionId){
        await this.clearLocalData()
      }
    }
    catch (error) {
    }
  }

  async acceptTermsAndConditions() {
    const config = {
      url: urlConstants.API_URLS.TERMS_CONDITIONS,
      payload: {},
    };
    try {
      let data = await this.httpService.post(config);
    }
    catch (error) {
    }
  }

  async changePassword(formData){
    const config = {
      url: urlConstants.API_URLS.CHANGE_PASSWORD,
      payload: formData,
    };
    try {
      let data = await this.httpService.post(config);
      if(data && data.message){
        await this.clearLocalData();
        this.toast.showToast(data.message, "success");
      }
    }
    catch (error) {
    }
  }

  async clearLocalData(){
    this.localStorage.delete(localKeys.USER_DETAILS);
    this.localStorage.delete(localKeys.USER_ROLES);
    this.localStorage.delete(localKeys.TOKEN);
    this.localStorage.delete(localKeys.IS_ROLE_REQUESTED);
    await this.db.clear()
    this.userService.token = null;
    this.userService.userEvent.next(null);
    this.router.navigate([environment.unauthorizedRedirectUrl], {
      replaceUrl: true
    });
    this.translate.use("en")
  }
}