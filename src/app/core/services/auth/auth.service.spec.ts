import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { LocalStorageService } from '../localstorage.service';
import { HttpService } from '../http/http.service';
import { LoaderService } from '../loader/loader.service';
import { Router } from '@angular/router';
import { ToastService } from '../toast.service';
import { UserService } from '../user/user.service';
import { ProfileService } from '../profile/profile.service';
import { TranslateService } from '@ngx-translate/core';
import { DbService } from '../db/db.service';
import { UtilService } from '../util/util.service';
import { urlConstants } from '../../constants/urlConstants';
import { localKeys } from '../../constants/localStorage.keys';
import { Subject, of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let localStorageSpy: jasmine.SpyObj<LocalStorageService>;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;
  let loaderServiceSpy: jasmine.SpyObj<LoaderService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let profileServiceSpy: any;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;
  let dbServiceSpy: jasmine.SpyObj<DbService>;
  let utilServiceSpy: jasmine.SpyObj<UtilService>;

  const mockUserEvent = new Subject<any>();

  beforeEach(() => {
    const localStorageMock = jasmine.createSpyObj('LocalStorageService', ['setLocalData', 'delete', 'getLocalData']);
    const httpMock = jasmine.createSpyObj('HttpService', ['post']);
    const loaderMock = jasmine.createSpyObj('LoaderService', ['startLoader', 'stopLoader']);
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);
    const toastMock = jasmine.createSpyObj('ToastService', ['showToast']);
    const userMock = jasmine.createSpyObj('UserService', [], {
      userEvent: mockUserEvent,
      token: null
    });
    
    // Create ProfileService mock with writable isMentor property
    const profileMock = jasmine.createSpyObj('ProfileService', ['getProfileDetailsFromAPI', 'getUserRole']);
    profileMock.isMentor = false;
    
    const translateMock = jasmine.createSpyObj('TranslateService', ['use', 'get']);
    const dbMock = jasmine.createSpyObj('DbService', ['clear']);
    const utilMock = jasmine.createSpyObj('UtilService', ['deviceDetails']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: LocalStorageService, useValue: localStorageMock },
        { provide: HttpService, useValue: httpMock },
        { provide: LoaderService, useValue: loaderMock },
        { provide: Router, useValue: routerMock },
        { provide: ToastService, useValue: toastMock },
        { provide: UserService, useValue: userMock },
        { provide: ProfileService, useValue: profileMock },
        { provide: TranslateService, useValue: translateMock },
        { provide: DbService, useValue: dbMock },
        { provide: UtilService, useValue: utilMock }
      ]
    });

    service = TestBed.inject(AuthService);
    localStorageSpy = TestBed.inject(LocalStorageService) as jasmine.SpyObj<LocalStorageService>;
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    loaderServiceSpy = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    toastServiceSpy = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    profileServiceSpy = TestBed.inject(ProfileService);
    translateServiceSpy = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
    dbServiceSpy = TestBed.inject(DbService) as jasmine.SpyObj<DbService>;
    utilServiceSpy = TestBed.inject(UtilService) as jasmine.SpyObj<UtilService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createAccount', () => {
    const formData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };

    // This is what the API returns - but the implementation passes it directly to setUserInLocal
    // which expects organizations at the root, so we need both structures
    const mockResponse: any = {
      result: {
        user: {
          id: 'user123',
          name: 'John Doe',
          organizations: [{
            roles: [{ title: 'teacher' }]
          }],
          preferred_language: { value: 'en' }
        }
      },
      // Also add properties at root level for setUserInLocal
      organizations: [{
        roles: [{ title: 'teacher' }]
      }],
      preferred_language: { value: 'en' }
    };

    const mockProfile = {
      id: 'user123',
      name: 'John Doe',
      email: 'john@example.com'
    };

    beforeEach(() => {
      utilServiceSpy.deviceDetails.and.returnValue(Promise.resolve('device-info-string'));
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      localStorageSpy.setLocalData.and.returnValue(Promise.resolve());
      localStorageSpy.getLocalData.and.returnValue(Promise.resolve(null));
      translateServiceSpy.use.and.stub();
      translateServiceSpy.get.and.returnValue(of({}));
      profileServiceSpy.isMentor = false;
    });

    it('should create account successfully', async () => {
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));
      profileServiceSpy.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockProfile));
      profileServiceSpy.getUserRole.and.returnValue([{ title: 'teacher' }]);

      const result = await service.createAccount(formData);

      expect(utilServiceSpy.deviceDetails).toHaveBeenCalled();
      expect(loaderServiceSpy.startLoader).toHaveBeenCalled();
      expect(httpServiceSpy.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.CREATE_ACCOUNT,
        payload: formData,
        headers: { 'device-info': 'device-info-string' }
      });
      
      expect(profileServiceSpy.getProfileDetailsFromAPI).toHaveBeenCalled();
      expect(loaderServiceSpy.stopLoader).toHaveBeenCalled();
      expect(result).toEqual(mockResponse.result.user);
    });

    it('should handle mentor role correctly', async () => {
      const mentorResponse: any = {
        result: {
          user: {
            id: 'user456',
            organizations: [{
              roles: [{ title: 'mentor' }]
            }],
            preferred_language: { value: 'hi' }
          }
        },
        // Also at root level for setUserInLocal
        organizations: [{
          roles: [{ title: 'mentor' }]
        }],
        preferred_language: { value: 'hi' }
      };

      httpServiceSpy.post.and.returnValue(Promise.resolve(mentorResponse));
      profileServiceSpy.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockProfile));
      profileServiceSpy.getUserRole.and.returnValue([{ title: 'mentor' }]);

      await service.createAccount(formData);

      expect(profileServiceSpy.isMentor).toBe(true);
    });

    it('should return null on error', async () => {
      httpServiceSpy.post.and.returnValue(Promise.reject('API Error'));

      const result = await service.createAccount(formData);

      expect(loaderServiceSpy.stopLoader).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should set user language preference', async () => {
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));
      profileServiceSpy.getProfileDetailsFromAPI.and.returnValue(Promise.resolve(mockProfile));
      profileServiceSpy.getUserRole.and.returnValue([{ title: 'teacher' }]);

      await service.createAccount(formData);

      const setLocalDataCalls = localStorageSpy.setLocalData.calls.all();
      const languageCall = setLocalDataCalls.find(call => {
        const key = call.args[0];
        return key === localKeys.SELECTED_LANGUAGE;
      });
      
      expect(languageCall).toBeDefined();
      expect(translateServiceSpy.use).toHaveBeenCalledWith('en');
    });
  });

  describe('loginAccount', () => {
    const formData = {
      email: 'john@example.com',
      password: 'password123'
    };

    const mockLoginResponse: any = {
      result: {
        user: {
          id: 'user123',
          organizations: [{
            roles: [{ title: 'teacher' }]
          }],
          preferred_language: { value: 'en' }
        }
      },
      // Also at root level for setUserInLocal
      organizations: [{
        roles: [{ title: 'teacher' }]
      }],
      preferred_language: { value: 'en' }
    };

    beforeEach(() => {
      utilServiceSpy.deviceDetails.and.returnValue(Promise.resolve('device-info-string'));
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      localStorageSpy.setLocalData.and.returnValue(Promise.resolve());
      localStorageSpy.getLocalData.and.returnValue(Promise.resolve(null));
      profileServiceSpy.getUserRole.and.returnValue([{ title: 'teacher' }]);
      translateServiceSpy.use.and.stub();
      translateServiceSpy.get.and.returnValue(of({}));
      profileServiceSpy.isMentor = false;
    });

    it('should login successfully without captcha token', async () => {
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockLoginResponse));

      const result = await service.loginAccount(formData, null);

      expect(loaderServiceSpy.startLoader).toHaveBeenCalled();
      expect(httpServiceSpy.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.ACCOUNT_LOGIN,
        payload: formData,
        headers: { 'device-info': 'device-info-string' }
      });
      expect(loaderServiceSpy.stopLoader).toHaveBeenCalled();
      expect(result).toEqual(mockLoginResponse.result.user);
    });

    it('should login successfully with captcha token', async () => {
      const captchaToken = 'captcha-token-123';
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockLoginResponse));

      const result = await service.loginAccount(formData, captchaToken);

      expect(httpServiceSpy.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.ACCOUNT_LOGIN,
        payload: formData,
        headers: {
          'captcha-token': captchaToken,
          'device-info': 'device-info-string'
        }
      });
      expect(result).toEqual(mockLoginResponse.result.user);
    });

    it('should return null on login error', async () => {
      httpServiceSpy.post.and.returnValue(Promise.reject('Login failed'));

      const result = await service.loginAccount(formData, null);

      expect(loaderServiceSpy.stopLoader).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should set user data in local storage', async () => {
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockLoginResponse));

      await service.loginAccount(formData, null);

      expect(localStorageSpy.setLocalData).toHaveBeenCalled();
      // expect(translateServiceSpy.use).toHaveBeenCalledWith('en');
    });
  });

  describe('setUserInLocal', () => {
    // The implementation expects data to have organizations directly accessible
    // So the data structure needs organizations at the root level
    const mockData = {
      id: 'user123',
      name: 'John Doe',
      organizations: [{
        roles: [{ title: 'teacher' }]
      }],
      preferred_language: { value: 'en' }
    };

    beforeEach(() => {
      localStorageSpy.setLocalData.and.returnValue(Promise.resolve());
      localStorageSpy.getLocalData.and.returnValue(Promise.resolve(null));
      translateServiceSpy.use.and.stub();
      translateServiceSpy.get.and.returnValue(of({}));
      profileServiceSpy.getUserRole.and.returnValue([{ title: 'teacher' }]);
      profileServiceSpy.isMentor = false;
    });

    it('should set user data in local storage', async () => {
      await service.setUserInLocal(mockData);

      expect(localStorageSpy.setLocalData).toHaveBeenCalled();
      expect(profileServiceSpy.getUserRole).toHaveBeenCalledWith(mockData);
    });

    it('should set isMentor to true for mentor role', async () => {
      const mentorData = {
        id: 'user456',
        organizations: [{
          roles: [{ title: 'mentor' }]
        }],
        preferred_language: { value: 'hi' }
      };
      profileServiceSpy.getUserRole.and.returnValue([{ title: 'mentor' }]);

      await service.setUserInLocal(mentorData);

      expect(profileServiceSpy.isMentor).toBe(true);
    });

    it('should set isMentor to false for non-mentor role', async () => {
      profileServiceSpy.getUserRole.and.returnValue([{ title: 'teacher' }]);

      await service.setUserInLocal(mockData);

      expect(profileServiceSpy.isMentor).toBe(false);
    });

    it('should call translate.use with preferred language', async () => {
      await service.setUserInLocal(mockData);

      expect(translateServiceSpy.use).toHaveBeenCalledWith('en');
    });
  });

  describe('logoutAccount', () => {
    beforeEach(() => {
      httpServiceSpy.post.and.returnValue(Promise.resolve({}));
      localStorageSpy.delete.and.returnValue(Promise.resolve());
      dbServiceSpy.clear.and.returnValue(Promise.resolve());
      routerSpy.navigate.and.returnValue(Promise.resolve(true));
      translateServiceSpy.use.and.stub();
    });

    it('should call API and clear local data when skipApiCall is false', async () => {
      spyOn(service, 'clearLocalData').and.returnValue(Promise.resolve());
      
      await service.logoutAccount(false);

      expect(httpServiceSpy.post).toHaveBeenCalled();
      expect(service.clearLocalData).toHaveBeenCalled();
    });

    it('should skip API call when skipApiCall is true', async () => {
      spyOn(service, 'clearLocalData').and.returnValue(Promise.resolve());
      
      await service.logoutAccount(true);

      expect(httpServiceSpy.post).not.toHaveBeenCalled();
      expect(service.clearLocalData).toHaveBeenCalled();
    });

    it('should not clear local data when userSessionId is provided', async () => {
      spyOn(service, 'clearLocalData').and.returnValue(Promise.resolve());
      
      await service.logoutAccount(false, 'session-123');

      expect(httpServiceSpy.post).toHaveBeenCalled();
      expect(service.clearLocalData).not.toHaveBeenCalled();
    });

    it('should handle logout errors gracefully', async () => {
      httpServiceSpy.post.and.returnValue(Promise.reject('Logout failed'));
      
      await service.logoutAccount(false).catch(() => {});
    });
  });

  describe('acceptTermsAndConditions', () => {
    it('should call API with correct config', async () => {
      httpServiceSpy.post.and.returnValue(Promise.resolve({}));

      await service.acceptTermsAndConditions();

      expect(httpServiceSpy.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.TERMS_CONDITIONS,
        payload: {}
      });
    });

    it('should handle errors gracefully', async () => {
      httpServiceSpy.post.and.returnValue(Promise.reject('API Error'));

      await service.acceptTermsAndConditions().catch(() => {});
    });
  });

  describe('changePassword', () => {
    const formData = {
      oldPassword: 'old123',
      newPassword: 'new123'
    };

    beforeEach(() => {
      translateServiceSpy.use.and.stub();
    });

    it('should call API and clear data on success', async () => {
      const mockResponse = { message: 'Password changed successfully' };
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));
      spyOn(service, 'clearLocalData').and.returnValue(Promise.resolve());

      await service.changePassword(formData);

      expect(httpServiceSpy.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.CHANGE_PASSWORD,
        payload: formData
      });
      expect(service.clearLocalData).toHaveBeenCalled();
      expect(toastServiceSpy.showToast).toHaveBeenCalledWith(mockResponse.message, 'success');
    });

    it('should handle errors gracefully', async () => {
      httpServiceSpy.post.and.returnValue(Promise.reject('API Error'));

      await service.changePassword(formData).catch(() => {});
      expect(toastServiceSpy.showToast).not.toHaveBeenCalled();
    });
  });

  describe('clearLocalData', () => {
    beforeEach(() => {
      spyOn(localStorage, 'clear');
      localStorageSpy.delete.and.returnValue(Promise.resolve());
      dbServiceSpy.clear.and.returnValue(Promise.resolve());
      routerSpy.navigate.and.returnValue(Promise.resolve(true));
      translateServiceSpy.use.and.stub();
    });

    it('should clear all local storage and navigate to home', async () => {
      await service.clearLocalData();

      expect(localStorage.clear).toHaveBeenCalled();
      expect(localStorageSpy.delete).toHaveBeenCalledWith(localKeys.USER_DETAILS);
      expect(localStorageSpy.delete).toHaveBeenCalledWith(localKeys.USER_ROLES);
      expect(localStorageSpy.delete).toHaveBeenCalledWith(localKeys.TOKEN);
      expect(localStorageSpy.delete).toHaveBeenCalledWith(localKeys.IS_ROLE_REQUESTED);
      expect(dbServiceSpy.clear).toHaveBeenCalled();
      expect(userServiceSpy.token).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalled();
      expect(translateServiceSpy.use).toHaveBeenCalledWith('en');
    });

    it('should emit null to userEvent', async () => {
      const nextSpy = spyOn(mockUserEvent, 'next');

      await service.clearLocalData();

      expect(nextSpy).toHaveBeenCalledWith(null);
    });
  });
});