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
    private translate: TranslateService,
    private db: DbService
  ) { }

  async createAccount(formData) {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.CREATE_ACCOUNT,
      payload: formData,
    };
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
    await this.localStorage.setLocalData(localKeys.USER_ROLES, this.profileService.getUserRole(this.user))
    await this.profileService.getUserRole(this.user);
    this.profileService.isMentor = (this.user?.user_roles[0]?.title === 'mentor')
    await this.localStorage.setLocalData(localKeys.SELECTED_LANGUAGE, this.user.preferred_language.value);
    this.translate.use(this.user.preferred_language.value)
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
      this.localStorage.delete(localKeys.USER_ROLES);
      this.localStorage.delete(localKeys.TOKEN);
      this.localStorage.delete(localKeys.IS_ROLE_REQUESTED);
      await this.db.clear()
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
      url: urlConstants.API_URLS.GET_PLATFORM_CONFIG
    };
    let data: any = await this.httpService.get(config);
    let result = _.get(data, 'result');
    return result;
  }

}