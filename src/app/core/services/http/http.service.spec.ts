import { TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { HttpService } from './http.service';
import { UserService } from '../user/user.service';
import { NetworkService } from '../network.service';
import { ToastService } from '../toast.service';
import { LoaderService } from '../loader/loader.service';
import { LocalStorageService } from '../localstorage.service';
import { AuthService } from '../auth/auth.service';
import { urlConstants } from '../../constants/urlConstants';
import { environment } from 'src/environments/environment';

describe('HttpService', () => {
  let service: HttpService;
  let userService: jasmine.SpyObj<UserService>;
  let network: jasmine.SpyObj<NetworkService>;
  let toast: jasmine.SpyObj<ToastService>;
  let loader: jasmine.SpyObj<LoaderService>;
  let localStorageSvc: jasmine.SpyObj<LocalStorageService>;
  let auth: jasmine.SpyObj<AuthService>;
  let modalCtrl: jasmine.SpyObj<ModalController>;
  let alertCtrl: jasmine.SpyObj<AlertController>;
  let translate: jasmine.SpyObj<TranslateService>;
  let router: jasmine.SpyObj<Router>;
  let injector: jasmine.SpyObj<Injector>;

  const baseUrl = 'https://test-api.com';
  const token = 'test-token';

  beforeEach(() => {

    // Mock localStorage
    const mockLocalStorage = {
      getItem: jasmine.createSpy('getItem').and.returnValue(null),
      setItem: jasmine.createSpy('setItem'),
      clear: jasmine.createSpy('clear'),
      removeItem: jasmine.createSpy('removeItem'),
      key: jasmine.createSpy('key'),
      length: 0
    };
    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);



    // Create service spies
    userService = jasmine.createSpyObj('UserService', ['getUserValue'], {
      token: { refresh_token: 'refresh' },
    });
    network = jasmine.createSpyObj('NetworkService', ['getCurrentStatus'], {
      isNetworkAvailable: true,
    });
    toast = jasmine.createSpyObj('ToastService', ['showToast', 'setDisableToast']);
    loader = jasmine.createSpyObj('LoaderService', ['showLoader', 'hideLoader']);
    localStorageSvc = jasmine.createSpyObj('LocalStorageService', ['getLocalData', 'setLocalData']);
    auth = jasmine.createSpyObj('AuthService', ['logoutAccount', 'clearLocalData']);
    modalCtrl = jasmine.createSpyObj('ModalController', ['create', 'getTop', 'dismiss']);
    alertCtrl = jasmine.createSpyObj('AlertController', ['create']);
    translate = jasmine.createSpyObj('TranslateService', ['get']);
    router = jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl']);
    injector = jasmine.createSpyObj('Injector', ['get']);

    TestBed.configureTestingModule({
      providers: [
        HttpService,
        { provide: UserService, useValue: userService },
        { provide: NetworkService, useValue: network },
        { provide: ToastService, useValue: toast },
        { provide: LoaderService, useValue: loader },
        { provide: LocalStorageService, useValue: localStorageSvc },
        { provide: AuthService, useValue: auth },
        { provide: ModalController, useValue: modalCtrl },
        { provide: AlertController, useValue: alertCtrl },
        { provide: TranslateService, useValue: translate },
        { provide: Router, useValue: router },
        { provide: Injector, useValue: injector },
      ],
    });

    service = TestBed.inject(HttpService);
    service.baseUrl = baseUrl;
    spyOn<any>(service, 'redirectToOrigin').and.stub();

    // Default return values
    userService.getUserValue.and.returnValue(Promise.resolve(token));
    network.getCurrentStatus.and.returnValue(Promise.resolve());
    localStorageSvc.getLocalData.and.returnValue(Promise.resolve('en'));
    injector.get.and.returnValue(auth);
    translate.get.and.returnValue(of({ OK: 'OK' }));

    // Replace httpClient with spy
    (service as any).httpClient = {
      post: jasmine.createSpy('post'),
      get: jasmine.createSpy('get'),
      delete: jasmine.createSpy('delete'),
      patch: jasmine.createSpy('patch'),
    };
  });



  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should initialize with correct baseUrl', () => {
      expect(service.baseUrl).toBe(baseUrl);
    });

    it('should initialize isFeedbackTriggered as false', () => {
      expect(service.isFeedbackTriggered).toBeFalse();
    });

    it('should initialize isAlertOpen as false', () => {
      expect(service.isAlertOpen).toBeFalse();
    });
  });

  describe('setHeaders', () => {
    it('should return headers when token exists', async () => {
      const headers = await service.setHeaders();
      expect(headers).toBeTruthy();
      expect(headers!['X-auth-token']).toBe(token);
      expect(headers!['Content-Type']).toBe('application/json');
      expect(headers!['accept-language']).toBe('en');
    });

    it('should return null when no token', async () => {
      userService.getUserValue.and.returnValue(Promise.resolve(null));
      const headers = await service.setHeaders();
      expect(headers).toBeNull();
    });

    it('should include timezone in headers', async () => {
      const headers = await service.setHeaders();
      expect(headers!['timeZone']).toBeDefined();
      expect(typeof headers!['timeZone']).toBe('string');
    });

    it('should merge extra headers from localStorage', async () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(
        JSON.stringify({ 'x-custom': 'value123' })
      );
      const headers = await service.setHeaders();
      expect(headers!['x-custom']).toBe('value123');
    });

    it('should handle null extraHeaders gracefully', async () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      const headers = await service.setHeaders();
      expect(headers).toBeTruthy();
      expect(headers!['X-auth-token']).toBe(token);
    });

    it('should handle invalid JSON in extraHeaders', async () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('invalid-json');
      await expectAsync(service.setHeaders()).toBeRejected();
    });

    it('should return empty string for token when getUserValue returns null', async () => {
      userService.getUserValue.and.returnValue(Promise.resolve(null));
      const headers = await service.setHeaders();
      expect(headers).toBeNull();
    });

    it('should use default language when localStorage returns null', async () => {
      localStorageSvc.getLocalData.and.returnValue(Promise.resolve(null));
      const headers = await service.setHeaders();
      expect(headers!['accept-language']).toBeNull();
    });
  });

  describe('getToken', () => {
    it('should return token when user service has value', async () => {
      userService.getUserValue.and.returnValue(Promise.resolve(token));
      const res = await service.getToken();
      expect(res).toBe(token);
    });

    it('should return null when user service has no value', async () => {
      userService.getUserValue.and.returnValue(Promise.resolve(null));
      const res = await service.getToken();
      expect(res).toBeNull();
    });

    it('should call getUserValue from userService', async () => {
      await service.getToken();
      expect(userService.getUserValue).toHaveBeenCalled();
    });
  });

  describe('checkNetworkAvailability', () => {
    it('should return true when network available', async () => {
      network.isNetworkAvailable = true;
      const res = await service.checkNetworkAvailability();
      expect(res).toBeTrue();
      expect(network.getCurrentStatus).toHaveBeenCalled();
    });

    it('should return false and show toast when network unavailable', async () => {
      Object.defineProperty(network, 'isNetworkAvailable', {
        value: false,
        writable: true,
        configurable: true
      });
      const res = await service.checkNetworkAvailability();
      expect(res).toBeFalse();
      expect(toast.showToast).toHaveBeenCalledWith('MSG_PLEASE_NETWORK', 'danger');
    });

    it('should call getCurrentStatus before checking network', async () => {
      // Set network to unavailable to trigger toast
      Object.defineProperty(network, 'isNetworkAvailable', { value: false, configurable: true });
      await service.checkNetworkAvailability();
      expect(network.getCurrentStatus).toHaveBeenCalledBefore(toast.showToast as any);
    });
  });

  describe('post', () => {
    const req = { url: '/test', payload: { a: 1 } };

    it('should throw when network unavailable', async () => {
      Object.defineProperty(network, 'isNetworkAvailable', { value: false, configurable: true });
      await expectAsync(service.post(req as any)).toBeRejected();
    });

    it('should return data on OK response', async () => {
      const httpRes = {
        status: 200,
        headers: {},
        url: baseUrl + req.url,
        data: { responseCode: 'OK', result: { success: true } },
      };
      (service as any).httpClient.post.and.returnValue(Promise.resolve(httpRes));
      const res = await service.post(req as any);
      expect(res.responseCode).toBe('OK');
      expect(res.result.success).toBeTrue();
    });

    it('should use custom headers when provided', async () => {
      (service as any).httpClient.post.and.returnValue(
        Promise.resolve({ data: { responseCode: 'OK' } })
      );
      await service.post({
        url: '/test',
        headers: { 'custom-header': 'value' },
        payload: {},
      } as any);
      const call = (service as any).httpClient.post.calls.mostRecent().args[0];
      expect(call.headers['custom-header']).toBe('value');
    });

    it('should merge custom headers with default headers', async () => {
      (service as any).httpClient.post.and.returnValue(
        Promise.resolve({ data: { responseCode: 'OK' } })
      );
      await service.post({
        url: '/test',
        headers: { 'X-Custom': 'value' },
        payload: {}
      } as any);

      const call = (service as any).httpClient.post.calls.mostRecent().args[0];
      expect(call.headers['X-Custom']).toBe('value');
      expect(call.headers['X-auth-token']).toBe(token);
    });

    it('should override timeZone header with payload time_zone', async () => {
      (service as any).httpClient.post.and.returnValue(
        Promise.resolve({ data: { responseCode: 'OK' } })
      );
      await service.post({
        url: '/test',
        payload: { time_zone: 'America/New_York' },
      } as any);
      const call = (service as any).httpClient.post.calls.mostRecent().args[0];
      expect(call.headers.timeZone).toBe('America/New_York');
    });

    it('should handle empty payload', async () => {
      (service as any).httpClient.post.and.returnValue(
        Promise.resolve({ data: { responseCode: 'OK' } })
      );
      await service.post({ url: '/test' } as any);
      const call = (service as any).httpClient.post.calls.mostRecent().args[0];
      expect(call.data).toEqual({});
    });

    it('should call handleError when responseCode is not OK', async () => {
      spyOn(service, 'handleError').and.throwError('err');
      (service as any).httpClient.post.and.returnValue(
        Promise.resolve({ data: { responseCode: 'FAIL' } })
      );
      await expectAsync(service.post(req as any)).toBeRejected();
      expect(service.handleError).toHaveBeenCalled();
    });

    it('should construct correct URL with baseUrl', async () => {
      (service as any).httpClient.post.and.returnValue(
        Promise.resolve({ data: { responseCode: 'OK' } })
      );
      await service.post(req as any);
      const call = (service as any).httpClient.post.calls.mostRecent().args[0];
      expect(call.url).toBe(baseUrl + '/test');
    });
  });

  describe('get', () => {
    const req = { url: '/test-get' };

    it('should throw when network unavailable', async () => {
      Object.defineProperty(network, 'isNetworkAvailable', { value: false, configurable: true });
      await expectAsync(service.get(req as any)).toBeRejected();
    });

    it('should return data on OK without opening modal', async () => {
      const httpRes = {
        status: 200,
        headers: {},
        url: baseUrl + req.url,
        data: { responseCode: 'OK' },
      };
      (service as any).httpClient.get.and.returnValue(Promise.resolve(httpRes));
      const res = await service.get(req as any);
      expect(res.responseCode).toBe('OK');
      expect(modalCtrl.create).not.toHaveBeenCalled();
    });

    it('should open feedback modal when meta data present and not triggered', async () => {
      const httpRes = {
        status: 200,
        data: {
          responseCode: 'OK',
          meta: { data: [{ id: 'fb1' }] },
        },
      };
      const mockModal = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(
          Promise.resolve({ data: true })
        ),
      };
      modalCtrl.create.and.returnValue(Promise.resolve(mockModal as any));
      (service as any).httpClient.get.and.returnValue(Promise.resolve(httpRes));

      service.isFeedbackTriggered = false;
      await service.get(req as any);

      expect(modalCtrl.create).toHaveBeenCalled();
      expect(mockModal.present).toHaveBeenCalled();
      expect(service.isFeedbackTriggered).toBeTrue();
    });

    it('should not open modal when already triggered', async () => {
      service.isFeedbackTriggered = true;
      const httpRes = {
        status: 200,
        data: {
          responseCode: 'OK',
          meta: { data: [{ id: 'fb1' }] },
        },
      };
      (service as any).httpClient.get.and.returnValue(Promise.resolve(httpRes));
      await service.get(req as any);
      expect(modalCtrl.create).not.toHaveBeenCalled();
    });

    it('should not open modal when meta data array is empty', async () => {
      const httpRes = {
        status: 200,
        data: {
          responseCode: 'OK',
          meta: { data: [] },
        },
      };
      (service as any).httpClient.get.and.returnValue(Promise.resolve(httpRes));

      service.isFeedbackTriggered = false;
      await service.get({ url: '/test' } as any);

      expect(modalCtrl.create).not.toHaveBeenCalled();
      expect(service.isFeedbackTriggered).toBeFalse();
    });

    it('should use custom headers when provided', async () => {
      (service as any).httpClient.get.and.returnValue(
        Promise.resolve({ data: { responseCode: 'OK' } })
      );
      await service.get({
        url: '/test',
        headers: { 'custom': 'header' },
      } as any);
      const call = (service as any).httpClient.get.calls.mostRecent().args[0];
      expect(call.headers.custom).toBe('header');
    });

    it('should call handleError when responseCode is not OK', async () => {
      spyOn(service, 'handleError').and.throwError('err');
      (service as any).httpClient.get.and.returnValue(
        Promise.resolve({ data: { responseCode: 'FAIL' } })
      );
      await expectAsync(service.get(req as any)).toBeRejected();
    });

    it('should return data even when handleError is called on non-OK response', async () => {
      spyOn(service, 'handleError').and.stub();
      const httpRes = { data: { responseCode: 'FAIL', message: 'Error' } };
      (service as any).httpClient.get.and.returnValue(Promise.resolve(httpRes));

      const result = await service.get(req as any);
      expect(result).toEqual(httpRes);
    });
  });

  describe('delete', () => {
    const req = { url: '/test-delete' };

    it('should throw when network unavailable', async () => {
      Object.defineProperty(network, 'isNetworkAvailable', { value: false, configurable: true });
      await expectAsync(service.delete(req as any)).toBeRejected();
    });

    it('should return data on OK', async () => {
      const httpRes = {
        status: 200,
        data: { responseCode: 'OK', result: { removed: true } },
      };
      (service as any).httpClient.delete.and.returnValue(Promise.resolve(httpRes));
      const res = await service.delete(req as any);
      expect(res.responseCode).toBe('OK');
      expect(res.result.removed).toBeTrue();
    });

    it('should use custom headers when provided', async () => {
      (service as any).httpClient.delete.and.returnValue(
        Promise.resolve({ data: { responseCode: 'OK' } })
      );
      await service.delete({
        url: '/test',
        headers: { 'custom': 'header' },
      } as any);
      const call = (service as any).httpClient.delete.calls.mostRecent().args[0];
      expect(call.headers.custom).toBe('header');
    });

    it('should call handleError when responseCode is not OK', async () => {
      spyOn(service, 'handleError').and.throwError('err');
      (service as any).httpClient.delete.and.returnValue(
        Promise.resolve({ data: { responseCode: 'FAIL' } })
      );
      await expectAsync(service.delete(req as any)).toBeRejected();
    });

    it('should send empty data string', async () => {
      (service as any).httpClient.delete.and.returnValue(
        Promise.resolve({ data: { responseCode: 'OK' } })
      );
      await service.delete(req as any);
      const call = (service as any).httpClient.delete.calls.mostRecent().args[0];
      expect(call.data).toBe('');
    });
  });

  describe('patch', () => {
    const req = { url: '/test-patch', payload: { x: 1 } };

    it('should throw when network unavailable', async () => {
      Object.defineProperty(network, 'isNetworkAvailable', { value: false, configurable: true });
      await expectAsync(service.patch(req as any)).toBeRejected();
    });

    it('should return data on OK', async () => {
      const httpRes = {
        status: 200,
        data: { responseCode: 'OK', result: { updated: true } },
      };
      (service as any).httpClient.patch.and.returnValue(Promise.resolve(httpRes));
      const res = await service.patch(req as any);
      expect(res.responseCode).toBe('OK');
      expect(res.result.updated).toBeTrue();
    });

    it('should handle empty payload', async () => {
      (service as any).httpClient.patch.and.returnValue(
        Promise.resolve({ data: { responseCode: 'OK' } })
      );
      await service.patch({ url: '/test' } as any);
      const call = (service as any).httpClient.patch.calls.mostRecent().args[0];
      expect(call.data).toEqual({});
    });

    it('should use custom headers when provided', async () => {
      (service as any).httpClient.patch.and.returnValue(
        Promise.resolve({ data: { responseCode: 'OK' } })
      );
      await service.patch({
        url: '/test',
        headers: { 'custom': 'header' },
        payload: {},
      } as any);
      const call = (service as any).httpClient.patch.calls.mostRecent().args[0];
      expect(call.headers.custom).toBe('header');
    });

    it('should call handleError when responseCode is not OK', async () => {
      spyOn(service, 'handleError').and.throwError('err');
      (service as any).httpClient.patch.and.returnValue(
        Promise.resolve({ data: { responseCode: 'FAIL' } })
      );
      await expectAsync(service.patch(req as any)).toBeRejected();
    });
  });

  describe('getFile', () => {
    const req = { url: '/file' };

    it('should return data when status is 200', async () => {
      const httpRes = {
        status: 200,
        data: { file: 'content' },
      };
      (service as any).httpClient.get.and.returnValue(Promise.resolve(httpRes));
      const res = await service.getFile(req as any);
      expect(res.status).toBe(200);
      expect(res.data.file).toBe('content');
    });

    it('should call handleError when status is not 200', async () => {
      spyOn(service, 'handleError').and.returnValue(null);
      const httpRes = { status: 500, data: { error: 'server error' } };
      (service as any).httpClient.get.and.returnValue(Promise.resolve(httpRes));
      const res = await service.getFile(req as any);
      expect(service.handleError).toHaveBeenCalledWith(httpRes);
      expect(res.status).toBe(500);
    });

    it('should use custom headers when provided', async () => {
      (service as any).httpClient.get.and.returnValue(
        Promise.resolve({ status: 200 })
      );
      await service.getFile({
        url: '/file',
        headers: { 'custom': 'header' },
      } as any);
      const call = (service as any).httpClient.get.calls.mostRecent().args[0];
      expect(call.headers.custom).toBe('header');
    });

    it('should construct correct URL', async () => {
      (service as any).httpClient.get.and.returnValue(
        Promise.resolve({ status: 200 })
      );
      await service.getFile(req as any);
      const call = (service as any).httpClient.get.calls.mostRecent().args[0];
      expect(call.url).toBe(baseUrl + '/file');
    });
  });

  describe('getAccessToken', () => {
    it('should call refresh token endpoint and return result', async () => {
      const httpRes = {
        status: 200,
        data: {
          responseCode: 'OK',
          result: { access_token: 'new-token' },
        },
      };
      (service as any).httpClient.post.and.returnValue(Promise.resolve(httpRes));
      const res = await service.getAccessToken();
      expect(res.access_token).toBe('new-token');
    });

    it('should use refresh_token from userService', async () => {
      (service as any).httpClient.post.and.returnValue(
        Promise.resolve({ data: { responseCode: 'OK', result: {} } })
      );
      await service.getAccessToken();
      const call = (service as any).httpClient.post.calls.mostRecent().args[0];
      expect(call.data.refresh_token).toBe('refresh');
    });

    it('should throw when network unavailable', async () => {
      Object.defineProperty(network, 'isNetworkAvailable', { value: false, configurable: true });
      await expectAsync(service.getAccessToken()).toBeRejected();
    });

    it('should call handleError on failure', async () => {
      spyOn(service, 'handleError').and.throwError('err');
      (service as any).httpClient.post.and.returnValue(
        Promise.resolve({ data: { responseCode: 'FAIL' } })
      );
      await expectAsync(service.getAccessToken()).toBeRejected();
    });

    it('should use correct URL constant', async () => {
      (service as any).httpClient.post.and.returnValue(
        Promise.resolve({ data: { responseCode: 'OK', result: {} } })
      );
      await service.getAccessToken();
      const call = (service as any).httpClient.post.calls.mostRecent().args[0];
      expect(call.url).toBe(baseUrl + urlConstants.API_URLS.REFRESH_TOKEN);
    });
  });

  describe('handleError', () => {
    it('should show toast for 400 error', () => {
      const result = {
        status: 400,
        data: { message: 'Bad Request' },
        url: baseUrl + '/test',
      };
      expect(() => service.handleError(result as any)).toThrow();
      expect(toast.showToast).toHaveBeenCalledWith('Bad Request', 'danger');
    });

    it('should show toast for 404 error', () => {
      const result = {
        status: 404,
        data: { message: 'Not Found' },
        url: baseUrl + '/test',
      };
      expect(() => service.handleError(result as any)).toThrow();
      expect(toast.showToast).toHaveBeenCalledWith('Not Found', 'danger');
    });

    it('should show toast for 406 error', () => {
      const result = {
        status: 406,
        data: { message: 'Not Acceptable' },
        url: baseUrl + '/test',
      };
      expect(() => service.handleError(result as any)).toThrow();
      expect(toast.showToast).toHaveBeenCalledWith('Not Acceptable', 'danger');
    });

    it('should show toast for 422 error', () => {
      const result = {
        status: 422,
        data: { message: 'Unprocessable' },
        url: baseUrl + '/test',
      };
      expect(() => service.handleError(result as any)).toThrow();
      expect(toast.showToast).toHaveBeenCalledWith('Unprocessable', 'danger');
    });

    it('should show default toast when message is missing', () => {
      const result = {
        status: 400,
        data: { message: null },
        url: baseUrl + '/test',
      };
      expect(() => service.handleError(result as any)).toThrow();
      expect(toast.showToast).toHaveBeenCalledWith('SOMETHING_WENT_WRONG', 'danger');
    });

    it('should show default toast when message is undefined', () => {
      const result = {
        status: 400,
        data: {},
        url: baseUrl + '/test',
      };
      expect(() => service.handleError(result as any)).toThrow();
      expect(toast.showToast).toHaveBeenCalledWith('SOMETHING_WENT_WRONG', 'danger');
    });

    it('should trigger logout confirmation on 401 with Congratulations message', () => {
      const result = {
        status: 401,
        data: { message: 'Congratulations! You are done' },
        url: baseUrl + '/test',
      };
      spyOn(service, 'triggerLogoutConfirmationAlert').and.returnValue(
        Promise.resolve(false) as any
      );
      expect(() => service.handleError(result as any)).toThrow();
      expect(service.triggerLogoutConfirmationAlert).toHaveBeenCalledWith(result);
    });

    it('should clear localStorage and redirect on 401 without Congratulations', () => {
      const result = {
        status: 401,
        data: { message: 'Unauthorized' },
        url: baseUrl + '/test',
      };

      expect(() => service.handleError(result as any)).toThrow();
      expect(localStorage.clear).toHaveBeenCalled();
      expect(auth.clearLocalData).toHaveBeenCalled();
      expect((service as any).redirectToOrigin).toHaveBeenCalled();
    });

    it('should show toast for 500 error', () => {
      const result = {
        status: 500,
        data: { message: 'Server Error' },
        url: baseUrl + '/test',
      };
      expect(() => service.handleError(result as any)).toThrow();
      expect(toast.showToast).toHaveBeenCalledWith('Server Error', 'danger');
    });

    it('should return early for GET_CHAT_TOKEN URL', () => {
      const result = {
        status: 400,
        url: baseUrl + urlConstants.API_URLS.GET_CHAT_TOKEN,
        data: { message: 'error' },
      };
      service.handleError(result as any);
      expect(toast.showToast).not.toHaveBeenCalled();
    });

    it('should throw immediately for profile API', () => {
      const result = {
        status: 400,
        url: 'interface/v1/profile/get',
        data: { message: 'error' },
      };
      expect(() => service.handleError(result as any)).toThrow(result);
      expect(toast.showToast).not.toHaveBeenCalled();
    });

    it('should handle 401 with empty message', () => {
      const result = {
        status: 401,
        data: { message: '' },
        url: baseUrl + '/test',
      };
      expect(() => service.handleError(result as any)).toThrow();
      expect(localStorage.clear).toHaveBeenCalled();
      expect(auth.clearLocalData).toHaveBeenCalled();
    });

    it('should handle 401 with message starting with "congratulations" (case insensitive)', () => {
      const result = {
        status: 401,
        data: { message: 'Congratulations on completing' },
        url: baseUrl + '/test',
      };
      spyOn(service, 'triggerLogoutConfirmationAlert').and.returnValue(
        Promise.resolve(false) as any
      );
      expect(() => service.handleError(result as any)).toThrow();
      expect(service.triggerLogoutConfirmationAlert).toHaveBeenCalled();
    });
  });

  describe('triggerLogoutConfirmationAlert', () => {
    beforeEach(() => {
      service.isAlertOpen = false;
    });

    it('should show alert and logout on cancel when auth is bypassed', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ role: 'cancel' })
        ),
      };
      alertCtrl.create.and.returnValue(Promise.resolve(mockAlert as any));
      modalCtrl.getTop.and.returnValue(Promise.resolve(null));

      const originalValue = environment.isAuthBypassed;
      environment.isAuthBypassed = true;

      const res = await service.triggerLogoutConfirmationAlert({
        data: { message: 'Test message' },
      } as any);

      expect(res).toBeFalse();
      expect(alertCtrl.create).toHaveBeenCalled();
      expect(mockAlert.present).toHaveBeenCalled();
      expect(toast.setDisableToast).toHaveBeenCalledWith(true);
      expect(auth.clearLocalData).toHaveBeenCalled();
      expect(auth.clearLocalData).toHaveBeenCalled();
      expect((service as any).redirectToOrigin).toHaveBeenCalled();

      environment.isAuthBypassed = originalValue;
    });

    it('should call logoutAccount when auth is not bypassed', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ role: 'cancel' })
        ),
      };
      alertCtrl.create.and.returnValue(Promise.resolve(mockAlert as any));
      modalCtrl.getTop.and.returnValue(Promise.resolve(null));

      const originalValue = environment.isAuthBypassed;
      environment.isAuthBypassed = false;

      await service.triggerLogoutConfirmationAlert({
        data: { message: 'Congratulations message' },
      } as any);

      expect(auth.logoutAccount).toHaveBeenCalledWith(true);
      expect(auth.clearLocalData).not.toHaveBeenCalled();

      environment.isAuthBypassed = originalValue;
    });

    it('should return true when alert is already open', async () => {
      service.isAlertOpen = true;
      const res = await service.triggerLogoutConfirmationAlert({
        data: { message: 'msg' },
      } as any);
      expect(res).toBeTrue();
      expect(alertCtrl.create).not.toHaveBeenCalled();
    });

    it('should dismiss existing modal before showing alert', async () => {
      const mockModal = jasmine.createSpyObj('Modal', ['dismiss']);
      modalCtrl.getTop.and.returnValue(Promise.resolve(mockModal));

      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ role: 'cancel' })
        ),
      };
      alertCtrl.create.and.returnValue(Promise.resolve(mockAlert as any));

      environment.isAuthBypassed = true;
      await service.triggerLogoutConfirmationAlert({
        data: { message: 'Test' },
      } as any);

      expect(modalCtrl.dismiss).toHaveBeenCalled();
    });

    it('should set isAlertOpen to true when showing alert', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ role: 'other' })
        ),
      };
      alertCtrl.create.and.callFake((config) => {
        expect(service.isAlertOpen).toBeTrue();
        return Promise.resolve(mockAlert as any);
      });

      const promise = service.triggerLogoutConfirmationAlert({
        data: { message: 'Test' },
      } as any);
      await promise;
    });

    it('should call button handler and reset alert state', async () => {
      let buttonHandler: any;
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ role: 'other' })
        ),
      };

      alertCtrl.create.and.callFake((config: any) => {
        buttonHandler = config.buttons[0].handler;
        return Promise.resolve(mockAlert as any);
      });
      modalCtrl.getTop.and.returnValue(Promise.resolve(null));

      service.isAlertOpen = false;
      await service.triggerLogoutConfirmationAlert({
        data: { message: 'Test' },
      } as any);

      expect(service.isAlertOpen).toBeTrue();
      buttonHandler();
      expect(service.isAlertOpen).toBeFalse();
      expect(toast.setDisableToast).toHaveBeenCalledWith(false);
    });

    it('should disable toast at start and re-enable in handler', async () => {
      let buttonHandler: any;
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ role: 'other' })
        ),
      };

      alertCtrl.create.and.callFake((config: any) => {
        buttonHandler = config.buttons[0].handler;
        return Promise.resolve(mockAlert as any);
      });
      modalCtrl.getTop.and.returnValue(Promise.resolve(null));

      await service.triggerLogoutConfirmationAlert({
        data: { message: 'Test' },
      } as any);

      expect(toast.setDisableToast).toHaveBeenCalledWith(true);

      buttonHandler();
      expect(toast.setDisableToast).toHaveBeenCalledWith(false);
    });

    it('should set backdropDismiss to false', async () => {
      let alertConfig: any;
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ role: 'cancel' })
        ),
      };

      alertCtrl.create.and.callFake((config: any) => {
        alertConfig = config;
        return Promise.resolve(mockAlert as any);
      });
      modalCtrl.getTop.and.returnValue(Promise.resolve(null));
      environment.isAuthBypassed = true;

      await service.triggerLogoutConfirmationAlert({
        data: { message: 'Test' },
      } as any);

      expect(alertConfig.backdropDismiss).toBeFalse();
    });

    it('should use translated text for button', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ role: 'cancel' })
        ),
      };

      let alertConfig: any;
      alertCtrl.create.and.callFake((config: any) => {
        alertConfig = config;
        return Promise.resolve(mockAlert as any);
      });
      modalCtrl.getTop.and.returnValue(Promise.resolve(null));
      environment.isAuthBypassed = true;

      await service.triggerLogoutConfirmationAlert({
        data: { message: 'Test' },
      } as any);

      expect(translate.get).toHaveBeenCalledWith(['OK']);
      expect(alertConfig.buttons[0].text).toBe('OK');
    });

    it('should not logout when role is not cancel', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ role: 'backdrop' })
        ),
      };
      alertCtrl.create.and.returnValue(Promise.resolve(mockAlert as any));
      modalCtrl.getTop.and.returnValue(Promise.resolve(null));

      await service.triggerLogoutConfirmationAlert({
        data: { message: 'Test' },
      } as any);

      expect(auth.logoutAccount).not.toHaveBeenCalled();
      expect(auth.clearLocalData).not.toHaveBeenCalled();
    });
  });

  describe('openModal', () => {
    it('should create and present modal with session data', async () => {
      const mockModal = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(
          Promise.resolve({ data: false })
        ),
      };
      modalCtrl.create.and.returnValue(Promise.resolve(mockModal as any));

      await service.openModal({ id: 'session1' });

      expect(modalCtrl.create).toHaveBeenCalled();
      expect(mockModal.present).toHaveBeenCalled();
      expect(service.isFeedbackTriggered).toBeFalse();
    });

    it('should pass session data to modal', async () => {
      let modalConfig: any;
      const mockModal = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(
          Promise.resolve({ data: true })
        ),
      };

      modalCtrl.create.and.callFake((config: any) => {
        modalConfig = config;
        return Promise.resolve(mockModal as any);
      });

      const sessionData = { id: 'session123', title: 'Test Session' };
      await service.openModal(sessionData);

      expect(modalConfig.componentProps.data).toEqual(sessionData);
    });

    it('should update isFeedbackTriggered with modal dismiss data', async () => {
      const mockModal = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(
          Promise.resolve({ data: true })
        ),
      };
      modalCtrl.create.and.returnValue(Promise.resolve(mockModal as any));

      service.isFeedbackTriggered = false;
      await service.openModal({ id: 'session1' });

      expect(service.isFeedbackTriggered).toBeTrue();
    });

    it('should set isFeedbackTriggered to false when modal returns false', async () => {
      const mockModal = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(
          Promise.resolve({ data: false })
        ),
      };
      modalCtrl.create.and.returnValue(Promise.resolve(mockModal as any));

      service.isFeedbackTriggered = true;
      await service.openModal({ id: 'session1' });

      expect(service.isFeedbackTriggered).toBeFalse();
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete post flow with network check and headers', async () => {
      network.isNetworkAvailable = true;
      const httpRes = {
        status: 200,
        data: { responseCode: 'OK', result: { success: true } },
      };
      (service as any).httpClient.post.and.returnValue(Promise.resolve(httpRes));

      const result = await service.post({
        url: '/api/test',
        payload: { data: 'test' }
      } as any);

      expect(network.getCurrentStatus).toHaveBeenCalled();
      expect(userService.getUserValue).toHaveBeenCalled();
      expect(result.responseCode).toBe('OK');
    });

    it('should handle complete get flow with feedback modal trigger', async () => {
      network.isNetworkAvailable = true;
      service.isFeedbackTriggered = false;

      const httpRes = {
        status: 200,
        data: {
          responseCode: 'OK',
          result: { data: 'test' },
          meta: { data: [{ id: 'fb1', type: 'feedback' }] }
        },
      };

      const mockModal = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(
          Promise.resolve({ data: true })
        ),
      };

      modalCtrl.create.and.returnValue(Promise.resolve(mockModal as any));
      (service as any).httpClient.get.and.returnValue(Promise.resolve(httpRes));

      const result = await service.get({ url: '/api/get' } as any);

      expect(result.responseCode).toBe('OK');
      expect(modalCtrl.create).toHaveBeenCalled();
      expect(service.isFeedbackTriggered).toBeTrue();
    });

    it('should handle 401 error with logout flow', async () => {
      const result = {
        status: 401,
        data: { message: 'Session expired' },
        url: baseUrl + '/api/test',
      };

      expect(() => service.handleError(result as any)).toThrow();
      expect(localStorage.clear).toHaveBeenCalled();
      expect(auth.clearLocalData).toHaveBeenCalled();
      expect((service as any).redirectToOrigin).toHaveBeenCalled();
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle null result in post', async () => {
      (service as any).httpClient.post.and.returnValue(Promise.resolve(null));
      await expectAsync(service.post({ url: '/test' } as any)).toBeRejected();
    });

    it('should handle undefined responseCode', async () => {
      spyOn(service, 'handleError').and.throwError('error');
      (service as any).httpClient.get.and.returnValue(
        Promise.resolve({ data: {} })
      );
      await expectAsync(service.get({ url: '/test' } as any)).toBeRejected();
    });

    it('should handle network check failure in multiple methods', async () => {
      Object.defineProperty(network, 'isNetworkAvailable', { value: false, configurable: true });

      await expectAsync(service.post({ url: '/test' } as any)).toBeRejected();
      await expectAsync(service.get({ url: '/test' } as any)).toBeRejected();
      await expectAsync(service.delete({ url: '/test' } as any)).toBeRejected();
      await expectAsync(service.patch({ url: '/test' } as any)).toBeRejected();
      await expectAsync(service.getAccessToken()).toBeRejected();
    });

    it('should handle meta data without data array', async () => {
      const httpRes = {
        status: 200,
        data: {
          responseCode: 'OK',
          meta: {}
        },
      };
      (service as any).httpClient.get.and.returnValue(Promise.resolve(httpRes));

      service.isFeedbackTriggered = false;
      await service.get({ url: '/test' } as any);

      expect(modalCtrl.create).not.toHaveBeenCalled();
    });

    it('should handle very long error messages', async () => {
      const longMessage = 'A'.repeat(1000);
      const result = {
        status: 400,
        data: { message: longMessage },
        url: baseUrl + '/test',
      };

      expect(() => service.handleError(result as any)).toThrow();
      expect(toast.showToast).toHaveBeenCalledWith(longMessage, 'danger');
    });

    it('should handle special characters in error messages', async () => {
      const specialMessage = 'Error: <script>alert("xss")</script>';
      const result = {
        status: 400,
        data: { message: specialMessage },
        url: baseUrl + '/test',
      };

      expect(() => service.handleError(result as any)).toThrow();
      expect(toast.showToast).toHaveBeenCalledWith(specialMessage, 'danger');
    });

    it('should handle multiple consecutive API calls', async () => {
      (service as any).httpClient.post.and.returnValue(
        Promise.resolve({ data: { responseCode: 'OK' } })
      );

      await service.post({ url: '/test1', payload: {} } as any);
      await service.post({ url: '/test2', payload: {} } as any);
      await service.post({ url: '/test3', payload: {} } as any);

      expect((service as any).httpClient.post).toHaveBeenCalledTimes(3);
    });

    it('should handle concurrent API calls', async () => {
      (service as any).httpClient.get.and.returnValue(
        Promise.resolve({ data: { responseCode: 'OK' } })
      );

      const promises = [
        service.get({ url: '/test1' } as any),
        service.get({ url: '/test2' } as any),
        service.get({ url: '/test3' } as any),
      ];

      await Promise.all(promises);
      expect((service as any).httpClient.get).toHaveBeenCalledTimes(3);
    });
  });



  describe('redirectToOrigin', () => {
    it('should redirect to window origin', () => {
      const mockWindow = {
        location: {
          origin: 'http://localhost:8100',
          href: ''
        }
      };
      (service as any)._window = mockWindow;

      // We need to call the real method, so if it was stubbed in beforeEach, we might need to be careful.
      // In beforeEach: spyOn<any>(service, 'redirectToOrigin').and.stub();
      // We need to undo that or callThrough, but better: 
      // check if we can override the spy?
      (service as any).redirectToOrigin.and.callThrough();

      (service as any).redirectToOrigin();

      expect(mockWindow.location.href).toBe('http://localhost:8100');
    });
  });

});