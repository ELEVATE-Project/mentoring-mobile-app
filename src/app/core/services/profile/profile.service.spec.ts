import { TestBed } from '@angular/core/testing';
import { ProfileService } from './profile.service';
import { HttpService } from '../http/http.service';
import { LoaderService } from '../loader/loader.service';
import { Router } from '@angular/router';
import { ToastService } from '../toast.service'; 
import { LocalStorageService } from '../localstorage.service';
import { Location } from '@angular/common';
import { UtilService } from '../util/util.service';
import { UserService } from '../user/user.service';
import { Injector } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { FormService } from '../form/form.service';
import { ModalController } from '@ionic/angular';
import { FrontendChatLibraryService } from 'sl-chat-library';
import { of, Subject } from 'rxjs';
import { localKeys } from '../../constants/localStorage.keys';
import { HttpResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';

describe('ProfileService', () => {
  let service: ProfileService;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;
  let loaderServiceSpy: jasmine.SpyObj<LoaderService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let localStorageServiceSpy: jasmine.SpyObj<LocalStorageService>;
  let locationSpy: jasmine.SpyObj<Location>;
  let utilServiceSpy: jasmine.SpyObj<UtilService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let injectorSpy: jasmine.SpyObj<Injector>;
  let formServiceSpy: jasmine.SpyObj<FormService>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let chatServiceSpy: jasmine.SpyObj<FrontendChatLibraryService>;

  const mockUserDetails = {
    name: 'Test User',
    email: 'test@example.com',
    organizations: [
      {
        roles: [
          { title: 'mentor' },
          { title: 'admin' }
        ]
      }
    ]
  };

  const mockProfileData = {
    _id: '123',
    name: 'Updated User',
    organizations: [
      {
        roles: [
          { title: 'mentee' }
        ]
      }
    ]
  };

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpService', ['patch', 'post', 'get', 'setHeaders']);
    const loaderSpy = jasmine.createSpyObj('LoaderService', ['startLoader', 'stopLoader']);
    const routerSpyObj = jasmine.createSpyObj('Router', ['navigate']);
    const toastSpy = jasmine.createSpyObj('ToastService', ['showToast']);
    const localStorageSpy = jasmine.createSpyObj('LocalStorageService', ['getLocalData', 'setLocalData']);
    const locSpy = jasmine.createSpyObj('Location', ['back']);
    const utilSpy = jasmine.createSpyObj('UtilService', ['alertPopup', 'deviceDetails']);
    const userSpy = jasmine.createSpyObj('UserService', [], {
      userEvent: new Subject()
    });
    const injSpy = jasmine.createSpyObj('Injector', ['get']);
    const formSpy = jasmine.createSpyObj('FormService', ['formatEntityOptions']);
    const modalSpy = jasmine.createSpyObj('ModalController', ['create']);
    const chatSpy = jasmine.createSpyObj('FrontendChatLibraryService', ['setConfig']);

    TestBed.configureTestingModule({
      providers: [
        ProfileService,
        { provide: HttpService, useValue: httpSpy },
        { provide: LoaderService, useValue: loaderSpy },
        { provide: Router, useValue: routerSpyObj },
        { provide: ToastService, useValue: toastSpy },
        { provide: LocalStorageService, useValue: localStorageSpy },
        { provide: Location, useValue: locSpy },
        { provide: UtilService, useValue: utilSpy },
        { provide: UserService, useValue: userSpy },
        { provide: Injector, useValue: injSpy },
        { provide: FormService, useValue: formSpy },
        { provide: ModalController, useValue: modalSpy },
        { provide: FrontendChatLibraryService, useValue: chatSpy }
      ]
    });

    service = TestBed.inject(ProfileService);
    httpServiceSpy = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    loaderServiceSpy = TestBed.inject(LoaderService) as jasmine.SpyObj<LoaderService>;
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    toastServiceSpy = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    localStorageServiceSpy = TestBed.inject(LocalStorageService) as jasmine.SpyObj<LocalStorageService>;
    locationSpy = TestBed.inject(Location) as jasmine.SpyObj<Location>;
    utilServiceSpy = TestBed.inject(UtilService) as jasmine.SpyObj<UtilService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    injectorSpy = TestBed.inject(Injector) as jasmine.SpyObj<Injector>;
    formServiceSpy = TestBed.inject(FormService) as jasmine.SpyObj<FormService>;
    modalControllerSpy = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
    chatServiceSpy = TestBed.inject(FrontendChatLibraryService) as jasmine.SpyObj<FrontendChatLibraryService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('profileUpdate', () => {
    it('should update profile successfully with toast', async () => {
      const formData = { name: 'Updated Name' };
      const mockResponse = { message: 'Profile updated successfully' };
      
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      httpServiceSpy.patch.and.returnValue(Promise.resolve(mockResponse));
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(mockUserDetails));
      spyOn(service, 'getProfileDetailsFromAPI').and.returnValue(Promise.resolve(mockProfileData));
      localStorageServiceSpy.setLocalData.and.returnValue(Promise.resolve());

      const result = await service.profileUpdate(formData);

      expect(loaderServiceSpy.startLoader).toHaveBeenCalled();
      expect(httpServiceSpy.patch).toHaveBeenCalled();
      expect(toastServiceSpy.showToast).toHaveBeenCalledWith(mockResponse.message, 'success');
      expect(loaderServiceSpy.stopLoader).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should update profile successfully without toast', async () => {
      const formData = { name: 'Updated Name' };
      const mockResponse = { message: 'Profile updated successfully' };
      
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      httpServiceSpy.patch.and.returnValue(Promise.resolve(mockResponse));
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(mockUserDetails));
      spyOn(service, 'getProfileDetailsFromAPI').and.returnValue(Promise.resolve(mockProfileData));
      localStorageServiceSpy.setLocalData.and.returnValue(Promise.resolve());

      const result = await service.profileUpdate(formData, false);

      expect(toastServiceSpy.showToast).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should handle profile update error', async () => {
      const formData = { name: 'Updated Name' };
      
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      httpServiceSpy.patch.and.returnValue(Promise.reject('Error'));

      const result = await service.profileUpdate(formData);

      expect(loaderServiceSpy.stopLoader).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });
  });

  describe('profileDetails', () => {
    it('should return profile details successfully', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(mockUserDetails));
      spyOn(service, 'getUserRole').and.returnValue(['mentor', 'admin', 'mentee']);

      const result = await service.profileDetails();

      expect(localStorageServiceSpy.getLocalData).toHaveBeenCalledWith(localKeys.USER_DETAILS);
      expect(result).toEqual(mockUserDetails);
    });

    it('should call profileDetails without loader', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.resolve(mockUserDetails));
      spyOn(service, 'getUserRole').and.returnValue(['mentor']);

      await service.profileDetails(false);

      expect(localStorageServiceSpy.getLocalData).toHaveBeenCalled();
    });

    it('should handle error when getting local data', async () => {
      localStorageServiceSpy.getLocalData.and.returnValue(Promise.reject('Error'));

      // The promise won't resolve due to error, just verify the call was made
      const promise = service.profileDetails();
      
      await new Promise(resolve => setTimeout(resolve, 50));
      
      expect(localStorageServiceSpy.getLocalData).toHaveBeenCalledWith(localKeys.USER_DETAILS);
    });
  });

  describe('generateOtp', () => {
    it('should generate OTP successfully with captcha token', async () => {
      const formData = { email: 'test@example.com' };
      const captchaToken = 'test-token';
      const mockResponse = { message: 'OTP sent successfully' };
      
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.generateOtp(formData, captchaToken);

      expect(httpServiceSpy.post).toHaveBeenCalled();
      expect(toastServiceSpy.showToast).toHaveBeenCalledWith(mockResponse.message, 'success');
      expect(result).toEqual(mockResponse);
    });

    it('should generate OTP successfully without captcha token', async () => {
      const formData = { email: 'test@example.com' };
      const mockResponse = { message: 'OTP sent successfully' };
      
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.generateOtp(formData, null);

      expect(result).toEqual(mockResponse);
    });

    it('should handle generateOtp error', async () => {
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      httpServiceSpy.post.and.returnValue(Promise.reject('Error'));

      const result = await service.generateOtp({}, null);

      expect(loaderServiceSpy.stopLoader).toHaveBeenCalled();
    });
  });

  describe('updatePassword', () => {
    it('should update password successfully', async () => {
      const formData = { password: 'newPassword' };
      const mockResponse = { message: 'Password updated', result: { token: 'abc' } };
      const mockAuthService = jasmine.createSpyObj('AuthService', ['setUserInLocal']);
      
      utilServiceSpy.deviceDetails.and.returnValue(Promise.resolve('device-info'));
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));
      injectorSpy.get.and.returnValue(mockAuthService);
      mockAuthService.setUserInLocal.and.returnValue({ user: 'data' });
      spyOn(service, 'getProfileDetailsFromAPI').and.returnValue(Promise.resolve(mockUserDetails));

      const result = await service.updatePassword(formData);

      expect(httpServiceSpy.post).toHaveBeenCalled();
      expect(toastServiceSpy.showToast).toHaveBeenCalledWith(mockResponse.message, 'success');
      expect(result).toEqual({ user: 'data' });
    });

    it('should handle updatePassword error', async () => {
      utilServiceSpy.deviceDetails.and.returnValue(Promise.resolve('device-info'));
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      httpServiceSpy.post.and.returnValue(Promise.reject('Error'));

      const result = await service.updatePassword({});

      expect(loaderServiceSpy.stopLoader).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('registrationOtp', () => {
    it('should send registration OTP successfully', async () => {
      const formData = { email: 'test@example.com' };
      const captchaToken = 'token';
      const mockResponse = { message: 'OTP sent' };
      
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.registrationOtp(formData, captchaToken);

      expect(result).toEqual(mockResponse);
    });

    it('should handle registrationOtp error', async () => {
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      httpServiceSpy.post.and.returnValue(Promise.reject('Error'));

      await service.registrationOtp({}, null);

      expect(loaderServiceSpy.stopLoader).toHaveBeenCalled();
    });
  });

  describe('shareProfile', () => {
    it('should share profile successfully', async () => {
      const mockResponse = { result: { shareUrl: 'http://example.com' } };
      
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.shareProfile('123');

      expect(result).toEqual(mockResponse.result);
    });

    it('should handle shareProfile error', async () => {
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      httpServiceSpy.get.and.returnValue(Promise.reject('Error'));

      await service.shareProfile('123');

      expect(loaderServiceSpy.stopLoader).toHaveBeenCalled();
    });
  });

  describe('getProfileDetailsFromAPI', () => {
    it('should get profile details from API successfully', async () => {
      const mockResponse = { result: mockUserDetails };
      
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));
      spyOn(service, 'getUserRole').and.returnValue(['mentor', 'mentee']);
      localStorageServiceSpy.setLocalData.and.returnValue(Promise.resolve());

      const result = await service.getProfileDetailsFromAPI();

      expect(httpServiceSpy.get).toHaveBeenCalled();
      expect(result).toEqual(mockUserDetails);
    });

    it('should handle getProfileDetailsFromAPI error', async () => {
      httpServiceSpy.get.and.returnValue(Promise.reject('Error'));

      const result = await service.getProfileDetailsFromAPI();

      expect(result).toBeUndefined();
    });
  });

  describe('getUserRole', () => {
    it('should return roles including mentee for mentor user', () => {
      const result = service.getUserRole(mockUserDetails);

      expect(result).toContain('mentee');
      expect(result).toContain('mentor');
      expect(service.isMentor).toBe(true);
    });

    it('should add mentee role if not present', () => {
      const user = {
        organizations: [
          {
            roles: [
              { title: 'admin' }
            ]
          }
        ]
      };

      const result = service.getUserRole(user);

      expect(result).toContain('mentee');
      expect(service.isMentor).toBe(false);
    });

    it('should handle case insensitive mentor role', () => {
      const user = {
        organizations: [
          {
            roles: [
              { title: 'MENTOR' }
            ]
          }
        ]
      };

      service.getUserRole(user);

      expect(service.isMentor).toBe(true);
    });

    it('should return undefined for null userDetails', () => {
      const result = service.getUserRole(null);

      expect(result).toBeUndefined();
    });

    it('should return undefined for undefined userDetails', () => {
      const result = service.getUserRole(undefined);

      expect(result).toBeUndefined();
    });
  });

  describe('upDateProfilePopup', () => {
    it('should show alert and navigate on cancel', async () => {
      utilServiceSpy.alertPopup.and.returnValue(Promise.resolve(false));

      await service.upDateProfilePopup();

      expect(routerSpy.navigate).toHaveBeenCalled();
    });

    it('should show alert with custom message', async () => {
      const customMsg = { header: 'TEST', message: 'TEST MESSAGE', cancel: 'OK', submit: 'CANCEL' };
      utilServiceSpy.alertPopup.and.returnValue(Promise.resolve(true));

      await service.upDateProfilePopup(customMsg);

      expect(utilServiceSpy.alertPopup).toHaveBeenCalledWith(customMsg);
    });

    it('should handle alert popup error', async () => {
      utilServiceSpy.alertPopup.and.returnValue(Promise.reject('Error'));

      await service.upDateProfilePopup();

      expect(utilServiceSpy.alertPopup).toHaveBeenCalled();
    });
  });

  describe('prefillData', () => {
    beforeEach(() => {
      // Mock environment
      environment.isAuthBypassed = false;
    });

    it('should prefill form data with about field', async () => {
      const requestDetails = { about: 'Test', name: 'John' };
      const entityNames = ['entity1'];
      const formData = {
        controls: [
          {
            type: 'chip',
            name: 'name',
            value: '',
            options: [],
            meta: { showAddOption: { showAddButton: false } }
          }
        ]
      };

      formServiceSpy.formatEntityOptions.and.returnValue(Promise.resolve({ name: 'John Doe' }));

      await service.prefillData(requestDetails, entityNames, formData, true);

      expect(formServiceSpy.formatEntityOptions).toHaveBeenCalled();
      expect(formData.controls[0].value).toBe('John Doe');
    });

    it('should prefill form data without about field', async () => {
      environment.isAuthBypassed = false;
      const requestDetails = { name: 'John' };
      const entityNames = ['entity1'];
      const formData = {
        controls: [
          {
            type: 'text',
            name: 'name',
            value: '',
            options: []
          }
        ]
      };

      await service.prefillData(requestDetails, entityNames, formData, false);

      expect(formData.controls[0].value).toBe('John');
    });
  });

  describe('viewRolesModal', () => {
    it('should create and present roles modal', async () => {
      const userRoles = ['mentor', 'admin'];
      const mockModal = {
        present: jasmine.createSpy('present')
      };
      
      modalControllerSpy.create.and.returnValue(Promise.resolve(mockModal as any));

      await service.viewRolesModal(userRoles);

      expect(modalControllerSpy.create).toHaveBeenCalled();
      expect(mockModal.present).toHaveBeenCalled();
    });

    it('should add mentee role if not present in modal', async () => {
      const userRoles = ['mentor'];
      const mockModal = {
        present: jasmine.createSpy('present')
      };
      
      modalControllerSpy.create.and.returnValue(Promise.resolve(mockModal as any));

      await service.viewRolesModal(userRoles);

      expect(userRoles).toContain('mentee');
    });
  });

  describe('getMentors', () => {
    it('should get mentors list successfully with loader', async () => {
      const obj = { page: 1, pageSize: 10, searchText: 'test', selectedChip: 'all' };
      const mockResponse = { result: [] };
      
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getMentors(true, obj);

      expect(loaderServiceSpy.startLoader).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should get mentors without loader', async () => {
      const obj = { page: 1, pageSize: 10, searchText: '' };
      const mockResponse = { result: [] };
      
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getMentors(false, obj);

      expect(loaderServiceSpy.startLoader).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should handle getMentors error', async () => {
      const obj = { page: 1, pageSize: 10, searchText: '' };
      
      loaderServiceSpy.startLoader.and.returnValue(Promise.resolve());
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());
      httpServiceSpy.get.and.returnValue(Promise.reject('Error'));

      const result = await service.getMentors(true, obj);

      expect(loaderServiceSpy.stopLoader).toHaveBeenCalled();
      expect(result).toBe('Error');
    });
  });

  describe('updateLanguage', () => {
    it('should update language successfully with toast', async () => {
      const formData = { language: 'en' };
      const mockResponse = { message: 'Language updated' };
      
      httpServiceSpy.patch.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateLanguage(formData);

      expect(toastServiceSpy.showToast).toHaveBeenCalledWith(mockResponse.message, 'success');
      expect(result).toEqual(mockResponse);
    });

    it('should update language without toast', async () => {
      const formData = { language: 'en' };
      const mockResponse = { message: 'Language updated' };
      
      httpServiceSpy.patch.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.updateLanguage(formData, false);

      expect(toastServiceSpy.showToast).not.toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should handle updateLanguage error', async () => {
      httpServiceSpy.patch.and.returnValue(Promise.reject('Error'));
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());

      await service.updateLanguage({});

      expect(loaderServiceSpy.stopLoader).toHaveBeenCalled();
    });
  });

  describe('getChatToken', () => {
    it('should get chat token successfully', async () => {
      const mockResponse = {
        result: {
          auth_token: 'test-token',
          user_id: '123'
        }
      };
      
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));
      httpServiceSpy.setHeaders.and.returnValue(Promise.resolve(HttpResponse as any));

      const result = await service.getChatToken();

      expect(chatServiceSpy.setConfig).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return false when no result', async () => {
      const mockResponse = { result: null };
      
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getChatToken();

      expect(result).toBe(false);
    });

    it('should handle getChatToken error', async () => {
      httpServiceSpy.get.and.returnValue(Promise.reject('Error'));
      loaderServiceSpy.stopLoader.and.returnValue(Promise.resolve());

      const result = await service.getChatToken();

      expect(loaderServiceSpy.stopLoader).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('getTheme', () => {
    it('should get and apply theme successfully', async () => {
      const mockResponse = {
        result: {
          primaryColor: '#000000',
          secondaryColor: '#ffffff',
          backgroundColor: '#f0f0f0'
        }
      };
      
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      await service.getTheme();

      expect(httpServiceSpy.get).toHaveBeenCalled();
    });

    it('should handle getTheme error silently', async () => {
      httpServiceSpy.get.and.returnValue(Promise.reject('Error'));

      await service.getTheme();

      expect(httpServiceSpy.get).toHaveBeenCalled();
    });
  });

  describe('getRequestCount', () => {
    it('should get request count successfully', async () => {
      const mockResponse = { count: 5 };
      
      httpServiceSpy.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getRequestCount();

      expect(result).toEqual(mockResponse);
    });

    it('should handle getRequestCount error', async () => {
      httpServiceSpy.get.and.returnValue(Promise.reject('Error'));

      const result = await service.getRequestCount();

      expect(result).toBeUndefined();
    });
  });
});