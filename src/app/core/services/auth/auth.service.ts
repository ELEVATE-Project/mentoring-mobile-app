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

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  baseUrl: any;
  user: any;
  constructor(
    private localStorage: LocalStorageService,
    private httpService: HttpService,
    private loaderService: LoaderService,
    private router: Router,
    private toast: ToastService,
    private userService: UserService,
    private profileService: ProfileService,
    private translate: TranslateService
  ) { }

  async createAccount(formData) {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.CREATE_ACCOUNT,
      payload: formData,
    };
    try {
      let data: any = await this.httpService.post(config);
      this.setUserInLocal(data);
      this.loaderService.stopLoader();
      return data.result.user;
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }

  async loginAccount(formData) {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.ACCOUNT_LOGIN,
      payload: formData,
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
    this.profileService.isMentor = (this.user?.user_roles[0]?.title === 'mentor')
    this.userService.userEvent.next(this.user);
    await this.localStorage.setLocalData(localKeys.USER_DETAILS, this.user);
    if(this.user.languages){
      await this.localStorage.setLocalData(localKeys.SELECTED_LANGUAGE, this.user.languages[0].value);
      this.translate.use(this.user.languages[0].value)
    }
    return this.user;
  }

  async logoutAccount(skipApiCall?: boolean) {
    const config = {
      url: urlConstants.API_URLS.LOGOUT_ACCOUNT,
      payload: {
        'X-auth-token': _.get(this.userService.token, 'access_token'),
        'refresh_token': _.get(this.userService.token, 'refresh_token'),
      },
    };
    try {
      if (!skipApiCall) {
        await this.httpService.post(config);
      }
      this.localStorage.delete(localKeys.USER_DETAILS);
      this.localStorage.delete(localKeys.TOKEN);
      this.userService.token = null;
      this.userService.userEvent.next(null);
      this.router.navigate([`/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`], {
        replaceUrl: true
      });
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

  async getMailInfo(){
    const config = {
      url: urlConstants.API_URLS.GET_MAIL_INFO
    };
    let data: any = await this.httpService.post(config);
    let result = _.get(data, 'result');
    return result;
  }

}