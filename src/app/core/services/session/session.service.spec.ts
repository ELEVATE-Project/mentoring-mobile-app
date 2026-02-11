import { TestBed } from '@angular/core/testing';
import { SessionService } from './session.service';
import { HttpService, LoaderService, LocalStorageService, ToastService } from '..';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { urlConstants } from '../../constants/urlConstants';
import { JoinDialogBoxComponent } from 'src/app/shared/components/join-dialog-box/join-dialog-box.component';

describe('SessionService', () => {
  let service: SessionService;
  let httpServiceMock: jasmine.SpyObj<HttpService>;
  let loaderServiceMock: jasmine.SpyObj<LoaderService>;
  let toastServiceMock: jasmine.SpyObj<ToastService>;
  let routerMock: jasmine.SpyObj<Router>;
  let modalControllerMock: jasmine.SpyObj<ModalController>;
  let localStorageServiceMock: jasmine.SpyObj<LocalStorageService>;

  beforeEach(() => {
    // Create spy objects
    httpServiceMock = jasmine.createSpyObj('HttpService', ['post', 'get', 'delete']);
    loaderServiceMock = jasmine.createSpyObj('LoaderService', ['startLoader', 'stopLoader']);
    toastServiceMock = jasmine.createSpyObj('ToastService', ['showToast']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    modalControllerMock = jasmine.createSpyObj('ModalController', ['create']);
    localStorageServiceMock = jasmine.createSpyObj('LocalStorageService', ['get', 'set']);

    // Configure loader service to return resolved promises
    loaderServiceMock.startLoader.and.returnValue(Promise.resolve());
    loaderServiceMock.stopLoader.and.returnValue(Promise.resolve());

    TestBed.configureTestingModule({
      providers: [
        SessionService,
        { provide: HttpService, useValue: httpServiceMock },
        { provide: LoaderService, useValue: loaderServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ModalController, useValue: modalControllerMock },
        { provide: LocalStorageService, useValue: localStorageServiceMock }
      ]
    });

    service = TestBed.inject(SessionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createSession', () => {
    it('should create session successfully without query params', async () => {
      const formData = { title: 'Test Session' };
      const mockResponse = { message: 'Session created', result: { id: '123' } };
      httpServiceMock.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createSession(formData);

      expect(loaderServiceMock.startLoader).toHaveBeenCalled();
      expect(httpServiceMock.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.CREATE_SESSION,
        payload: formData
      });
      expect(loaderServiceMock.stopLoader).toHaveBeenCalled();
      expect(toastServiceMock.showToast).toHaveBeenCalledWith('Session created', 'success');
      expect(result).toEqual({ id: '123' });
    });

    it('should create session successfully with query params', async () => {
      const formData = { title: 'Test Session' };
      const queryParams = 'param1=value1';
      const mockResponse = { message: 'Session created', result: { id: '456' } };
      httpServiceMock.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.createSession(formData, queryParams);

      expect(httpServiceMock.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.CREATE_SESSION + '/param1=value1',
        payload: formData
      });
      expect(result).toEqual({ id: '456' });
    });

    it('should handle error during session creation', async () => {
      const formData = { title: 'Test Session' };
      httpServiceMock.post.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.createSession(formData);

      expect(loaderServiceMock.stopLoader).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('getAllSessionsAPI', () => {
    it('should get all sessions with status filter', async () => {
      const obj = { status: 'active', searchText: 'test', page: 1, limit: 10 };
      const mockResponse = { result: [{ id: '1' }, { id: '2' }] };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getAllSessionsAPI(obj);

      expect(httpServiceMock.get).toHaveBeenCalled();
      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    });

    it('should get all sessions without status filter', async () => {
      const obj = { status: null, searchText: 'test', page: 1, limit: 10 };
      const mockResponse = { result: [{ id: '1' }] };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getAllSessionsAPI(obj);

      expect(result).toEqual([{ id: '1' }]);
    });

    it('should return empty array on error', async () => {
      const obj = { status: 'active', searchText: '', page: 1, limit: 10 };
      httpServiceMock.get.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.getAllSessionsAPI(obj);

      expect(result).toEqual([]);
    });
  });

  describe('getSessionsList', () => {
    it('should get sessions list successfully', async () => {
      const obj = { page: 1, limit: 10, searchText: 'test', selectedChip: 'chip1', filterData: 'filter=value' };
      const mockResponse = { data: [{ id: '1' }] };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getSessionsList(obj);

      expect(httpServiceMock.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should handle null searchText and selectedChip', async () => {
      const obj = { page: 1, limit: 10, searchText: null, selectedChip: null, filterData: '' };
      httpServiceMock.get.and.returnValue(Promise.resolve({}));

      const result = await service.getSessionsList(obj);

      expect(result).toEqual({});
    });

    it('should return null on error', async () => {
      const obj = { page: 1, limit: 10, searchText: '', filterData: '' };
      httpServiceMock.get.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.getSessionsList(obj);

      expect(result).toBeNull();
    });
  });

  describe('getSessionDetailsAPI', () => {
    it('should get session details successfully', async () => {
      const sessionId = '123';
      const mockResponse = { result: { id: '123', title: 'Session' } };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getSessionDetailsAPI(sessionId);

      expect(httpServiceMock.get).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.GET_SESSION_DETAILS + sessionId + '?get_mentees=true',
        payload: {}
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return null on error', async () => {
      httpServiceMock.get.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.getSessionDetailsAPI('123');

      expect(result).toBeNull();
    });
  });

  describe('getShareSessionId', () => {
    it('should get share session link successfully', async () => {
      const sessionId = '123';
      const mockResponse = { result: 'share-link-123' };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getShareSessionId(sessionId);

      expect(loaderServiceMock.startLoader).toHaveBeenCalled();
      expect(loaderServiceMock.stopLoader).toHaveBeenCalled();
      expect(result).toBe('share-link-123');
    });

    it('should return null on error', async () => {
      httpServiceMock.get.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.getShareSessionId('123');

      expect(loaderServiceMock.stopLoader).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('enrollSession', () => {
    it('should enroll session successfully', async () => {
      const sessionId = '123';
      const mockResponse = { success: true };
      httpServiceMock.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.enrollSession(sessionId);

      expect(httpServiceMock.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.ENROLL_SESSION + sessionId,
        payload: {}
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return null on error', async () => {
      httpServiceMock.post.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.enrollSession('123');

      expect(result).toBeNull();
    });
  });

  describe('unEnrollSession', () => {
    it('should unenroll session successfully', async () => {
      const sessionId = '123';
      const mockResponse = { success: true };
      httpServiceMock.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.unEnrollSession(sessionId);

      expect(httpServiceMock.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.UNENROLL_SESSION + sessionId,
        payload: {}
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return null on error', async () => {
      httpServiceMock.post.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.unEnrollSession('123');

      expect(result).toBeNull();
    });
  });

  describe('startSession', () => {
    it('should start session and open browser successfully', async () => {
      const sessionId = '123';
      const mockResponse = { responseCode: 'OK', result: { link: 'https://meeting.link' } };
      httpServiceMock.post.and.returnValue(Promise.resolve(mockResponse));
      spyOn(service, 'openBrowser').and.returnValue(Promise.resolve());

      const result = await service.startSession(sessionId);

      expect(loaderServiceMock.startLoader).toHaveBeenCalled();
      expect(loaderServiceMock.stopLoader).toHaveBeenCalled();
      expect(service.openBrowser).toHaveBeenCalledWith('https://meeting.link');
      expect(result).toBe(true);
    });

    it('should return false when response code is not OK', async () => {
      const mockResponse = { responseCode: 'ERROR', result: null };
      httpServiceMock.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.startSession('123');

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      httpServiceMock.post.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.startSession('123');

      expect(loaderServiceMock.stopLoader).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('joinSession', () => {
    it('should join session with sessionId successfully', async () => {
      const sessionData = { sessionId: '123', title: 'Test Session' };
      const mockResponse = { 
        responseCode: 'OK', 
        result: { link: 'https://join.link' } 
      };
      const mockModal = { 
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({})),
        onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({}))
      } as any;
      
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));
      modalControllerMock.create.and.returnValue(Promise.resolve(mockModal as any));

      const result = await service.joinSession(sessionData);

      expect(loaderServiceMock.startLoader).toHaveBeenCalled();
      expect(loaderServiceMock.stopLoader).toHaveBeenCalled();
      expect(modalControllerMock.create).toHaveBeenCalledWith({
        component: JoinDialogBoxComponent,
        componentProps: { data: mockResponse.result, sessionData: sessionData },
        cssClass: 'example-modal'
      });
      expect(result).not.toBeNull();
expect(mockModal.present).toHaveBeenCalled();

    });

    it('should join session with id when sessionId is not present', async () => {
      const sessionData = { id: '456', title: 'Test Session' };
      const mockResponse = { 
        responseCode: 'OK', 
        result: { link: 'https://join.link' } 
      };
      const mockModal = { 
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        dismiss: jasmine.createSpy('dismiss').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({})),
        onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({}))
      };
      
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));
      modalControllerMock.create.and.returnValue(Promise.resolve(mockModal as any));

      const result = await service.joinSession(sessionData);

      expect(httpServiceMock.get).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.JOIN_SESSION + '456',
        payload: {}
      });
      expect(result).not.toBeNull();
    });

    it('should return null when response code is not OK', async () => {
      const sessionData = { sessionId: '123' };
      const mockResponse = { responseCode: 'ERROR' };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.joinSession(sessionData);

      expect(loaderServiceMock.stopLoader).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      const sessionData = { sessionId: '123' };
      httpServiceMock.get.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.joinSession(sessionData);

      expect(loaderServiceMock.stopLoader).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('deleteSession', () => {
    it('should delete session successfully', async () => {
      const sessionId = '123';
      const mockResponse = { success: true, message: 'Deleted' };
      httpServiceMock.delete.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.deleteSession(sessionId);

      expect(loaderServiceMock.startLoader).toHaveBeenCalled();
      expect(httpServiceMock.delete).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.CREATE_SESSION + '/123',
        payload: {}
      });
      expect(loaderServiceMock.stopLoader).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should return null on error', async () => {
      httpServiceMock.delete.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.deleteSession('123');

      expect(loaderServiceMock.stopLoader).toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('openBrowser', () => {
    it('should open browser with default window name', async () => {
      const link = 'https://example.com';
      const browserSpy = jasmine.createSpyObj('Browser', ['open', 'addListener']);
      browserSpy.open.and.returnValue(Promise.resolve());
      (service as any).browser = browserSpy;

      await service.openBrowser(link);

      expect(browserSpy.open).toHaveBeenCalledWith({ 
        url: link, 
        windowName: '_self' 
      });
      expect(browserSpy.addListener).toHaveBeenCalledWith('browserFinished', jasmine.any(Function));
    });

    it('should open browser with custom window name', async () => {
      const link = 'https://example.com';
      const browserSpy = jasmine.createSpyObj('Browser', ['open', 'addListener']);
      browserSpy.open.and.returnValue(Promise.resolve());
      (service as any).browser = browserSpy;

      await service.openBrowser(link, '_blank');

      expect(browserSpy.open).toHaveBeenCalledWith({ 
        url: link, 
        windowName: '_blank' 
      });
    });

    it('should handle when browser.open is not available', async () => {
      (service as any).browser = {};

      await service.openBrowser('https://example.com');

      // Should not throw error
      expect(true).toBe(true);
    });

    it('should handle when browser.addListener is not available', async () => {
      const browserSpy = jasmine.createSpyObj('Browser', ['open']);
      browserSpy.open.and.returnValue(Promise.resolve());
      (service as any).browser = browserSpy;

      await service.openBrowser('https://example.com');

      expect(browserSpy.open).toHaveBeenCalled();
      // Should not throw error
      expect(true).toBe(true);
    });
  });

  describe('submitFeedback', () => {
    it('should submit feedback successfully', async () => {
      const feedbackData = { rating: 5, comment: 'Great session' };
      const sessionId = '123';
      const mockResponse = { success: true };
      httpServiceMock.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.submitFeedback(feedbackData, sessionId);

      expect(httpServiceMock.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.SUBMIT_FEEDBACK + sessionId,
        payload: feedbackData
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return null on error', async () => {
      httpServiceMock.post.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.submitFeedback({}, '123');

      expect(result).toBeNull();
    });
  });

  describe('getUpcomingSessions', () => {
    it('should get upcoming sessions successfully', async () => {
      const userId = '123';
      const mockResponse = { result: { data: [{ id: '1' }, { id: '2' }] } };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getUpcomingSessions(userId);

      expect(httpServiceMock.get).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.UPCOMING_SESSIONS + userId + '?page=1&limit=100',
        payload: {}
      });
      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    });

    it('should return empty array when result.data is undefined', async () => {
      const mockResponse = { result: {} };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getUpcomingSessions('123');

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      httpServiceMock.get.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.getUpcomingSessions('123');

      expect(result).toEqual([]);
    });
  });

  describe('getEnrolledMenteeList', () => {
    it('should get enrolled mentee list successfully', async () => {
      const sessionId = '123';
      const mockResponse = { result: [{ id: '1' }, { id: '2' }] };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getEnrolledMenteeList(sessionId);

      expect(result).toEqual([{ id: '1' }, { id: '2' }]);
    });

    it('should handle empty sessionId', async () => {
      const mockResponse = { result: [] };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getEnrolledMenteeList('');

      expect(result).toEqual([]);
    });

    it('should return empty array on error', async () => {
      httpServiceMock.get.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.getEnrolledMenteeList('123');

      expect(result).toEqual([]);
    });
  });

  describe('sessionActivity', () => {
    it('should get session activity successfully', async () => {
      const mockResponse = { result: [{ id: '1' }] };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.sessionActivity(10, 1);

      expect(httpServiceMock.get).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.LOGIN_ACTIVITY + '?status=&page=1&limit=10',
        payload: {}
      });
      expect(result).toEqual([{ id: '1' }]);
    });

    it('should return empty array on error', async () => {
      httpServiceMock.get.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.sessionActivity(10, 1);

      expect(result).toEqual([]);
    });
  });

  describe('getSessions', () => {
    it('should get sessions with scope', async () => {
      const obj = { page: 1, limit: 10, scope: 'public' };
      const mockResponse = { data: [] };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getSessions(obj);

      expect(httpServiceMock.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should get sessions without scope', async () => {
      const obj = { page: 1, limit: 10 };
      const mockResponse = { data: [] };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getSessions(obj);

      expect(result).toEqual(mockResponse);
    });

    it('should return null on error', async () => {
      httpServiceMock.get.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.getSessions({ page: 1, limit: 10 });

      expect(result).toBeNull();
    });
  });

  describe('requestSession', () => {
    it('should request session successfully', async () => {
      const obj = { title: 'New Session' };
      const mockResponse = { success: true };
      httpServiceMock.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.requestSession(obj);

      expect(httpServiceMock.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.REQUEST_SESSION,
        payload: obj
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return null on error', async () => {
      httpServiceMock.post.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.requestSession({});

      expect(result).toBeNull();
    });
  });

  describe('requestSessionList', () => {
    it('should get request session list successfully', async () => {
      const mockResponse = { data: [] };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.requestSessionList(1);

      expect(httpServiceMock.get).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.REQUEST_SESSION_LIST + '?pageNo=1&pageSize=100&status=REQUESTED,EXPIRED'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return null on error', async () => {
      httpServiceMock.get.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.requestSessionList(1);

      expect(result).toBeNull();
    });
  });

  describe('getReqSessionDetails', () => {
    it('should get request session details successfully', async () => {
      const mockResponse = { result: { id: '123' } };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.getReqSessionDetails('123');

      expect(httpServiceMock.get).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.REQUEST_SESSION_DETAILS + '?request_session_id=123'
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return null on error', async () => {
      httpServiceMock.get.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.getReqSessionDetails('123');

      expect(result).toBeNull();
    });
  });

  describe('requestSessionUserAvailability', () => {
    it('should get user availability successfully', async () => {
      const startDate = 1234567890;
      const endDate = 1234567999;
      const mockResponse = { data: [] };
      httpServiceMock.get.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.requestSessionUserAvailability(startDate, endDate);

      expect(httpServiceMock.get).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should return null on error', async () => {
      httpServiceMock.get.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.requestSessionUserAvailability(123, 456);

      expect(result).toBeNull();
    });
  });

  describe('requestSessionAccept', () => {
    it('should accept request session successfully', async () => {
      const mockResponse = { success: true };
      httpServiceMock.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.requestSessionAccept('123');

      expect(httpServiceMock.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.REQUEST_SESSION_ACCEPT,
        payload: { request_session_id: '123' }
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return null on error', async () => {
      httpServiceMock.post.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.requestSessionAccept('123');

      expect(result).toBeNull();
    });
  });

  describe('requestSessionReject', () => {
    it('should reject request session successfully', async () => {
      const mockResponse = { success: true };
      httpServiceMock.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await service.requestSessionReject(123, 'Not available');

      expect(httpServiceMock.post).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.REQUEST_SESSION_REJECT,
        payload: {
          request_session_id: '123',
          reason: 'Not available'
        }
      });
      expect(result).toEqual(mockResponse);
    });

    it('should return null on error', async () => {
      httpServiceMock.post.and.returnValue(Promise.reject(new Error('API Error')));

      const result = await service.requestSessionReject(123, 'reason');

      expect(result).toBeNull();
    });
  });
});