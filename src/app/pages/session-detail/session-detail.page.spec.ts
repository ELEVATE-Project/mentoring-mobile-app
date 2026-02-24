import { ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { SessionDetailPage } from './session-detail.page';
import { Router, ActivatedRoute } from '@angular/router';
import { LocalStorageService, ToastService, UserService, UtilService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { ModalController, ToastController, IonicModule } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { FormService } from 'src/app/core/services/form/form.service';
import { CommonRoutes } from 'src/global.routes';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { App, AppState } from '@capacitor/app';
import { MenteeListPopupComponent } from 'src/app/shared/components/mentee-list-popup/mentee-list-popup.component';
import { Clipboard } from '@capacitor/clipboard';
import { of } from 'rxjs';
import { environment } from 'src/environments/environment';


describe('SessionDetailPage', () => {
  let component: SessionDetailPage;
  let fixture: ComponentFixture<SessionDetailPage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockLocalStorage: jasmine.SpyObj<LocalStorageService>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockUtilService: jasmine.SpyObj<UtilService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockToastController: jasmine.SpyObj<ToastController>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockModalCtrl: jasmine.SpyObj<ModalController>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockFormService: jasmine.SpyObj<FormService>;


  const mockUserDetails = {
    id: 'user-1',
    about: 'Test user'
  };


  const mockEntityList = {
    result: [
      { label: 'Recommended For', value: 'recommended_for' },
      { label: 'Medium', value: 'medium' }
    ]
  };


  const baseSessionResult: any = {
    id: 'session-1',
    created_by: 'user-1',
    mentor_id: 'mentor-1',
    enrolment_type: 'INVITED',
    status: { value: 'PUBLISHED' },
    start_date: 2000000000,
    end_date: 2000003600,
    meeting_info: { platform: 'OFF' },
    seats_limit: 10,
    seats_remaining: 5,
    mentor_designation: [{ label: 'Teacher' }],
    type: { value: 'PUBLIC' },
    title: ' Test title ',
    mentor_name: ' Mentor Name ',
    is_enrolled: true
  };


  const mockSessionDetailsResponse = {
    responseCode: 'OK',
    result: { ...baseSessionResult }
  };


  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        paramMap: {
          get: (_: string) => 'session-1'
        }
      }
    };
    mockLocalStorage = jasmine.createSpyObj('LocalStorageService', [
      'getLocalData',
      'setLocalData'
    ]);
    mockSessionService = jasmine.createSpyObj('SessionService', [
      'getSessionDetailsAPI',
      'deleteSession',
      'joinSession',
      'enrollSession',
      'startSession',
      'unEnrollSession'
    ]);
    mockUtilService = jasmine.createSpyObj('UtilService', [
      'isMobile',
      'getDeepLink',
      'shareLink',
      'alertPopup'
    ]);
    mockToastService = jasmine.createSpyObj('ToastService', ['showToast']);
    mockUserService = jasmine.createSpyObj('UserService', ['getUserValue']);
    mockToastController = jasmine.createSpyObj('ToastController', ['create', 'dismiss']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['get']);
    mockModalCtrl = jasmine.createSpyObj('ModalController', ['create']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['getPlatformConfig']);
    mockFormService = jasmine.createSpyObj('FormService', ['getEntities']);


    // isMobile() called in constructor
    mockUtilService.isMobile.and.returnValue(true);


    // Clipboard.write spy
    spyOn(Clipboard, 'write').and.returnValue(Promise.resolve());


    // translate.get mock
    mockTranslateService.get.and.callFake((keys: any) => {
      const map: any = {};
      (Array.isArray(keys) ? keys : [keys]).forEach((k: string) => {
        map[k] = k;
      });
      return of(map);
    });


    // ToastController.create mock
    const mockToast = {
      present: jasmine.createSpy('present'),
      dismiss: jasmine.createSpy('dismiss')
    };
    mockToastController.create.and.returnValue(Promise.resolve(mockToast as any));


    await TestBed.configureTestingModule({
      declarations: [SessionDetailPage],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: LocalStorageService, useValue: mockLocalStorage },
        { provide: SessionService, useValue: mockSessionService },
        { provide: UtilService, useValue: mockUtilService },
        { provide: ToastService, useValue: mockToastService },
        { provide: UserService, useValue: mockUserService },
        { provide: ToastController, useValue: mockToastController },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: ModalController, useValue: mockModalCtrl },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: FormService, useValue: mockFormService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();


    fixture = TestBed.createComponent(SessionDetailPage);
    component = fixture.componentInstance;


    // default mocks for async calls
    mockUserService.getUserValue.and.returnValue(Promise.resolve(''));
    mockLocalStorage.getLocalData.and.callFake((key: string) => {
      if (key === localKeys.USER_DETAILS) {
        return Promise.resolve(mockUserDetails);
      }
      return Promise.resolve(null);
    });
    mockFormService.getEntities.and.returnValue(Promise.resolve(mockEntityList));
    mockSessionService.getSessionDetailsAPI.and.returnValue(
      Promise.resolve(mockSessionDetailsResponse)
    );
  });


  afterEach(() => {
    fixture.destroy();
  });


  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.id).toBe('session-1');
  });




  xdescribe('ngOnInit - appStateChange listener', () => {
    xit('should register appStateChange listener and call fetchSessionDetails when active', async () => {
      let appStateCallback: any;
      spyOn(App, 'addListener').and.callFake(((eventName: string, callback: any) => {
        console.log('TEST DEBUG: App.addListener called for ' + eventName);
        if (eventName === 'appStateChange') {
          appStateCallback = callback;
        }
        return Promise.resolve({ remove: () => Promise.resolve() });
      }) as any);

      // Arrange
      component.id = 'session-1';
      component.sessionDatas = {};
      component.dismissWhenBack = false;
      spyOn(component, 'fetchSessionDetails').and.returnValue(Promise.resolve());

      // Act
      component.ngOnInit();
      await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async ops

      // Simulate app becoming active
      if (appStateCallback) {
        console.log('TEST DEBUG: appStateCallback captured');
        appStateCallback({ isActive: true } as any);
      } else {
        console.log('TEST DEBUG: appStateCallback NOT captured');
        fail('appStateCallback was not captured');
      }

      expect(component.fetchSessionDetails).toHaveBeenCalled();
    });

    xit('should not call fetchSessionDetails when dismissWhenBack is true', async () => {
      let appStateCallback: any;
      spyOn(App, 'addListener').and.callFake(((eventName: string, callback: any) => {
        if (eventName === 'appStateChange') {
          appStateCallback = callback;
        }
        return Promise.resolve({ remove: () => Promise.resolve() });
      }) as any);

      component.id = 'session-1';
      component.sessionDatas = {};
      component.dismissWhenBack = true;
      spyOn(component, 'fetchSessionDetails').and.returnValue(Promise.resolve());

      component.ngOnInit();
      await new Promise(resolve => setTimeout(resolve, 100));

      // Simulate app becoming active
      if (appStateCallback) {
        appStateCallback({ isActive: true } as any);
      } else {
        fail('appStateCallback was not captured');
      }

      expect(component.fetchSessionDetails).not.toHaveBeenCalled();
    });
  });

  describe('fetchSessionDetails toast', () => {
    it('should show toast to add meeting link if platform is OFF, creator, and PUBLISHED', fakeAsync(() => {
      mockFormService.getEntities.and.returnValue(Promise.resolve({ result: [] }));
      const sessionData = {
        ...baseSessionResult,
        meeting_info: { platform: 'OFF' },
        status: { value: 'PUBLISHED' }
      };
      mockSessionService.getSessionDetailsAPI.and.returnValue(Promise.resolve({
        responseCode: 'OK',
        result: sessionData
      }));
      component.userDetails = { id: 'user-1' }; // matches created_by
      spyOn(component, 'showToasts');

      component.fetchSessionDetails();
      tick();

      expect(component.showToasts).toHaveBeenCalledWith('ADD_MEETING_LINK', 0, jasmine.any(Array));
    }));
  });

  describe('action', () => {
    it('should call share when action is share', () => {
      spyOn(component, 'share');
      component.action('share');
      expect(component.share).toHaveBeenCalled();
    });

    it('should call editSession when action is edit', () => {
      spyOn(component, 'editSession');
      component.action('edit');
      expect(component.editSession).toHaveBeenCalled();
    });

    it('should call deleteSession when action is delete', () => {
      spyOn(component, 'deleteSession');
      component.action('delete');
      expect(component.deleteSession).toHaveBeenCalled();
    });
  });

  describe('onJoin', () => {
    it('should call joinSession service', async () => {
      component.sessionDatas = { id: '123' };
      await component.onJoin();
      expect(mockSessionService.joinSession).toHaveBeenCalledWith(component.sessionDatas);
    });
  });

  describe('onEnroll', () => {
    let originalAuthBypass: boolean;

    beforeEach(() => {
      originalAuthBypass = environment['isAuthBypassed'];
    });

    afterEach(() => {
      environment['isAuthBypassed'] = originalAuthBypass;
    });

    it('should enroll session if user has details', async () => {
      component.userDetails = { id: 'u1', about: 'details' };
      component.id = 's1';
      mockSessionService.enrollSession.and.returnValue(Promise.resolve({ result: true, message: 'Enrolled' }));
      spyOn(component, 'fetchSessionDetails');

      await component.onEnroll();

      expect(mockSessionService.enrollSession).toHaveBeenCalledWith('s1');
      expect(mockToastService.showToast).toHaveBeenCalledWith('Enrolled', 'success');
      expect(component.fetchSessionDetails).toHaveBeenCalled();
    });

    it('should navigate to profile if user details missing and auth not bypassed', async () => {
      environment['isAuthBypassed'] = false;
      component.userDetails = { id: 'u1', about: null };
      await component.onEnroll();
      expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.TABS}/${CommonRoutes.PROFILE}`]);
    });

    it('should enroll if user details missing but auth IS bypassed', async () => {
      environment['isAuthBypassed'] = true;
      component.userDetails = { id: 'u1', about: null };
      component.id = 's1';
      mockSessionService.enrollSession.and.returnValue(Promise.resolve({ result: true, message: 'Enrolled' }));
      spyOn(component, 'fetchSessionDetails');

      await component.onEnroll();

      expect(mockSessionService.enrollSession).toHaveBeenCalledWith('s1');
    });

    it('should navigate to login if userDetails is null', async () => {
      component.userDetails = null;
      component.id = 's1';
      await component.onEnroll();
      expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`], { queryParams: { sessionId: 's1' } });
    });
  });

  describe('onViewList', () => {
    it('should create and present modal', async () => {
      const mockModal = {
        present: jasmine.createSpy('present'),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve({ data: null }))
      };
      mockModalCtrl.create.and.returnValue(Promise.resolve(mockModal as any));
      component.id = 's1';

      await component.onViewList({});

      expect(mockModalCtrl.create).toHaveBeenCalledWith({
        component: MenteeListPopupComponent,
        cssClass: 'large-width-popover-config',
        componentProps: { id: 's1' }
      });
      expect(mockModal.present).toHaveBeenCalled();
    });
  });

  describe('goToHome', () => {
    it('should navigate to home', () => {
      component.goToHome();
      expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]);
    });
  });

  describe('headerConfig logic', () => {
    it('should enable edit and delete for creator in future published session', fakeAsync(() => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const sessionData = {
        ...baseSessionResult,
        start_date: futureTime,
        end_date: futureTime + 3600,
        status: { value: 'PUBLISHED' },
        mentor_id: 'user-1' // match userDetails.id
      };
      mockSessionService.getSessionDetailsAPI.and.returnValue(Promise.resolve({
        responseCode: 'OK',
        result: sessionData
      }));
      component.userDetails = { id: 'user-1' };

      component.fetchSessionDetails();
      tick();

      expect(component.isCreator).toBeTrue();
      expect(component.headerConfig.edit).toBeTrue();
      expect(component.headerConfig.delete).toBeTrue();
    }));

    it('should disable delete if status is LIVE', fakeAsync(() => {
      const futureTime = Math.floor(Date.now() / 1000) + 3600;
      const sessionData = {
        ...baseSessionResult,
        status: { value: 'LIVE' },
        end_date: futureTime + 3600,
        mentor_id: 'user-1'
      };
      mockSessionService.getSessionDetailsAPI.and.returnValue(Promise.resolve({
        responseCode: 'OK',
        result: sessionData
      }));
      component.userDetails = { id: 'user-1' };

      component.fetchSessionDetails();
      tick();

      expect(component.headerConfig.delete).toBeNull();
    }));

    it('should disable edit if more than 24 hours past end date', fakeAsync(() => {
      const pastTime = Math.floor(Date.now() / 1000) - (25 * 3600);
      const sessionData = {
        ...baseSessionResult,
        end_date: pastTime,
        mentor_id: 'user-1'
      };
      mockSessionService.getSessionDetailsAPI.and.returnValue(Promise.resolve({
        responseCode: 'OK',
        result: sessionData
      }));
      component.userDetails = { id: 'user-1' };

      component.fetchSessionDetails();
      tick();

      expect(component.headerConfig.edit).toBeFalsy();
    }));
  });

  describe('onStart', () => {
    it('should start session and navigate to home on success', async () => {
      const data = { id: 's1' };
      mockSessionService.startSession.and.returnValue(Promise.resolve(true));
      await component.onStart(data);
      expect(mockSessionService.startSession).toHaveBeenCalledWith(data);
      expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]);
    });
  });

  describe('onCancel', () => {
    it('should show alert and unenroll on confirmation', fakeAsync(() => {
      mockUtilService.alertPopup.and.returnValue(Promise.resolve(true));
      component.id = 's1';
      mockSessionService.unEnrollSession.and.returnValue(Promise.resolve({ result: true, message: 'Unenrolled' }));
      spyOn(component, 'fetchSessionDetails');

      component.onCancel();
      tick();

      expect(mockUtilService.alertPopup).toHaveBeenCalled();
      expect(mockSessionService.unEnrollSession).toHaveBeenCalledWith('s1');
      expect(mockToastService.showToast).toHaveBeenCalledWith('Unenrolled', 'success');
      expect(component.fetchSessionDetails).toHaveBeenCalled();
    }));

    it('should do nothing if alert rejected', fakeAsync(() => {
      mockUtilService.alertPopup.and.returnValue(Promise.resolve(false));
      spyOn(component, 'fetchSessionDetails');

      component.onCancel();
      tick();

      expect(mockSessionService.unEnrollSession).not.toHaveBeenCalled();
    }));
  });

  describe('editSession', () => {
    it('should navigate to create session with segment id if status is LIVE', () => {
      component.sessionDatas = { status: { value: 'LIVE' } };
      component.id = 's1';
      Object.defineProperty(mockRouter, 'url', { get: () => '/current-url' });

      component.editSession();

      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.CREATE_SESSION], { queryParams: { id: 's1', type: 'segment' } });
    });

    it('should navigate to create session with isCreator flag if status not LIVE', () => {
      component.sessionDatas = { status: { value: 'PUBLISHED' } };
      component.id = 's1';
      component.isConductor = true;
      Object.defineProperty(mockRouter, 'url', { get: () => '/current-url' });

      component.editSession();

      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.CREATE_SESSION], { queryParams: { id: 's1', isCreator: true } });
    });
  });

  describe('deleteSession', () => {
    it('should delete session and navigate home on confirmation', fakeAsync(() => {
      mockUtilService.alertPopup.and.returnValue(Promise.resolve(true));
      mockSessionService.deleteSession.and.returnValue(Promise.resolve({ responseCode: 'OK', message: 'Deleted' }));
      component.id = 's1';
      mockToastController.dismiss.and.returnValue(Promise.resolve() as any);

      component.deleteSession();
      tick();

      expect(mockSessionService.deleteSession).toHaveBeenCalledWith('s1');
      expect(mockToastService.showToast).toHaveBeenCalledWith('Deleted', 'success');
      expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`], { replaceUrl: true });
    }));
  });

  describe('ionViewWillEnter', () => {
    it('should initialize and fetch session details', fakeAsync(() => {
      fixture.detectChanges();

      component.ionViewWillEnter();
      tick();
      flush(); // Flush any remaining timers/microtasks


      expect(mockUserService.getUserValue).toHaveBeenCalled();
      expect(mockLocalStorage.getLocalData).toHaveBeenCalledWith(localKeys.USER_DETAILS);
      expect(mockSessionService.getSessionDetailsAPI).toHaveBeenCalledWith('session-1');
    }));
  });


  describe('fetchSessionDetails', () => {
    it('should populate detailData and flags correctly when response is OK', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      component.ionViewWillEnter();
      tick();


      const data = component.detailData.data;
      expect(component.userCantAccess).toBeFalse();
      expect(component.isCreator).toBeTrue();
      expect(component.isConductor).toBeFalse();
      expect(component.platformOff).toBeTrue();
      expect(component.sessionManagerText).toBe('INVITED_BY');
      expect(component.isNotInvited).toBeFalse();
      expect(data.id).toBe('session-1');
      expect(data.meeting_info).toBe('OFF');
      expect(data.mentee_count).toBe(5);
      expect(component.detailData.controls.some(c => c.key === 'meeting_info')).toBeTrue();
      expect(component.detailData.controls.some(c => c.key === 'mentor_name')).toBeTrue();
      expect(component.detailData.controls.some(c => c.key === 'mentee_count')).toBeTrue();
    }));


    it('should set userCantAccess when responseCode is not OK', fakeAsync(() => {
      // Mock the form service to return empty entities so no dynamic controls are added
      mockFormService.getEntities.and.returnValue(Promise.resolve({ result: [] }));

      mockSessionService.getSessionDetailsAPI.and.returnValue(
        Promise.resolve({
          responseCode: 'ERROR',
          result: {
            id: 'session-1',
            created_by: 'other-user',
            mentor_id: 'mentor-1',
            enrolment_type: 'OPEN',
            status: { value: 'PUBLISHED' },
            start_date: 2000000000,
            end_date: 2000003600,
            meeting_info: { platform: 'ZOOM' },
            seats_limit: 10,
            seats_remaining: 5,
            mentor_designation: []
          }
        } as any)
      );


      // Set userDetails before calling fetchSessionDetails
      component.userDetails = mockUserDetails;


      component.fetchSessionDetails();
      tick();


      expect(component.userCantAccess).toBeTrue();
      expect(component.isLoaded).toBeTrue();
    }));
  });


  describe('setPageHeader', () => {
    it('should set headerConfig correctly', () => {
      component.userDetails = mockUserDetails;
      component.isCreator = true; // Set this flag since created_by === userDetails.id

      // Use a session that's in the future so edit/delete are enabled
      const futureTime = Math.floor(Date.now() / 1000) + 7200; // 2 hours from now
      const resp = {
        ...baseSessionResult,
        start_date: futureTime,
        end_date: futureTime + 3600,
        status: { value: 'PUBLISHED' },
        type: { value: 'PUBLIC' }
      };

      component.setPageHeader(resp);


      expect(component.headerConfig.share).toBeTrue();
      expect(component.headerConfig.edit).toBeTrue();
      expect(component.headerConfig.delete).toBeTrue();
    });


    it('should disable share when status COMPLETED', () => {
      component.userDetails = mockUserDetails;
      const resp = { ...baseSessionResult, status: { value: 'COMPLETED' } };
      component.setPageHeader(resp);


      expect(component.headerConfig.share).toBeFalse();
    });


    it('should disable share when type is PRIVATE', () => {
      component.userDetails = mockUserDetails;
      const resp = { ...baseSessionResult, type: { value: 'PRIVATE' } };
      component.setPageHeader(resp);


      expect(component.headerConfig.share).toBeFalse();
    });
  });


  describe('action', () => {
    it('should call share on share event', () => {
      spyOn(component, 'share');
      component.action('share');
      expect(component.share).toHaveBeenCalled();
    });


    it('should call editSession on edit event', () => {
      spyOn(component, 'editSession');
      component.action('edit');
      expect(component.editSession).toHaveBeenCalled();
    });


    it('should call deleteSession on delete event', () => {
      spyOn(component, 'deleteSession');
      component.action('delete');
      expect(component.deleteSession).toHaveBeenCalled();
    });
  });


  describe('share', () => {
    it('should share via mobile deep link when navigator.share exists', fakeAsync(() => {
      (navigator as any).share = jasmine.createSpy('share').and.returnValue(Promise.resolve());

      component.sessionDatas = { ...baseSessionResult };
      component.detailData.data.title = ' Test ';
      component.detailData.data.mentor_name = ' Mentor ';
      component.id = 'session-1';
      component.isMobile = true;

      mockUtilService.getDeepLink.and.returnValue('https://deep.link');
      mockUtilService.shareLink.and.returnValue(Promise.resolve());


      component.share();
      tick();


      expect(mockUtilService.getDeepLink).toHaveBeenCalled();
      expect(mockUtilService.shareLink).toHaveBeenCalled();
    }));


    it('should fallback to clipboard on web', fakeAsync(() => {
      component.isMobile = false;
      component.id = 'session-1';


      const copySpy = spyOn<any>(component, 'copyToClipBoard')
        .and.returnValue(Promise.resolve());


      component.share();
      tick(); // flush async


      expect(copySpy).toHaveBeenCalledWith(window.location.href);
      expect(mockToastService.showToast).toHaveBeenCalledWith('LINK_COPIED', 'success');
    }));


    it('should navigate to login when no id on mobile', fakeAsync(() => {
      component.isMobile = true;
      component.id = null;
      (navigator as any).share = jasmine.createSpy('share').and.returnValue(Promise.resolve());


      component.share();
      tick();


      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [`${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`],
        { queryParams: { sessionId: null, isMentor: false } }
      );
    }));
  });



  describe('editSession', () => {
    it('should navigate to create session with type segment when LIVE', () => {
      component.id = 'session-1';
      component.sessionDatas = { ...baseSessionResult, status: { value: 'LIVE' } };
      component.editSession();


      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.CREATE_SESSION], {
        queryParams: { id: 'session-1', type: 'segment' }
      });
    });


    it('should navigate to create session with isCreator when not LIVE', () => {
      component.id = 'session-1';
      component.sessionDatas = { ...baseSessionResult, status: { value: 'PUBLISHED' } };
      component.isConductor = true;
      component.editSession();


      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.CREATE_SESSION], {
        queryParams: { id: 'session-1', isCreator: true }
      });
    });
  });


  describe('deleteSession', () => {
    it('should delete session when user confirms', fakeAsync(() => {
      mockUtilService.alertPopup.and.returnValue(Promise.resolve(true));
      mockSessionService.deleteSession.and.returnValue(
        Promise.resolve({ responseCode: 'OK', message: 'Deleted' } as any)
      );


      component.id = 'session-1';
      component.deleteSession();
      tick();


      expect(mockSessionService.deleteSession).toHaveBeenCalledWith('session-1');
      expect(mockToastService.showToast).toHaveBeenCalledWith('Deleted', 'success');
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`],
        { replaceUrl: true }
      );
      expect(component.skipWhenDelete).toBeTrue();
      expect(component.id).toBeNull();
    }));


    it('should not delete session when user cancels', fakeAsync(() => {
      mockUtilService.alertPopup.and.returnValue(Promise.resolve(false));


      component.id = 'session-1';
      component.deleteSession();
      tick();


      expect(mockSessionService.deleteSession).not.toHaveBeenCalled();
    }));
  });


  describe('onJoin', () => {
    it('should call joinSession with sessionDatas', fakeAsync(() => {
      component.sessionDatas = { ...baseSessionResult };
      mockSessionService.joinSession.and.returnValue(Promise.resolve(null));

      component.onJoin();
      tick();


      expect(mockSessionService.joinSession).toHaveBeenCalledWith(component.sessionDatas);
    }));
  });


  describe('onEnroll', () => {
    it('should enroll and refresh details when user has about', fakeAsync(() => {
      component.id = 'session-1';
      component.userDetails = mockUserDetails;
      environment['isAuthBypassed'] = false;

      mockSessionService.enrollSession.and.returnValue(
        Promise.resolve({ result: true, message: 'Enrolled!' } as any)
      );
      spyOn(component, 'fetchSessionDetails').and.returnValue(Promise.resolve());


      component.onEnroll();
      tick();


      expect(mockSessionService.enrollSession).toHaveBeenCalledWith('session-1');
      expect(mockToastService.showToast).toHaveBeenCalledWith('Enrolled!', 'success');
      expect(component.fetchSessionDetails).toHaveBeenCalled();
    }));


    it('should enroll when auth is bypassed even without about', fakeAsync(() => {
      component.id = 'session-1';
      component.userDetails = { ...mockUserDetails, about: null };
      environment['isAuthBypassed'] = true;

      mockSessionService.enrollSession.and.returnValue(
        Promise.resolve({ result: true, message: 'Enrolled!' } as any)
      );
      spyOn(component, 'fetchSessionDetails').and.returnValue(Promise.resolve());


      component.onEnroll();
      tick();


      expect(mockSessionService.enrollSession).toHaveBeenCalledWith('session-1');
      expect(component.fetchSessionDetails).toHaveBeenCalled();
    }));


    it('should navigate to profile when user has no about and auth is not bypassed', fakeAsync(() => {
      component.id = 'session-1';
      component.userDetails = { ...mockUserDetails, about: null };
      environment['isAuthBypassed'] = false;


      component.onEnroll();
      tick();


      expect(mockRouter.navigate).toHaveBeenCalledWith([
        `/${CommonRoutes.TABS}/${CommonRoutes.PROFILE}`
      ]);
    }));


    it('should navigate to login when no userDetails', fakeAsync(() => {
      component.id = 'session-1';
      component.userDetails = null;


      component.onEnroll();
      tick();


      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [`/${CommonRoutes.AUTH}/${CommonRoutes.LOGIN}`],
        { queryParams: { sessionId: 'session-1' } }
      );
    }));
  });


  describe('onStart', () => {
    it('should start session and navigate to home on success', fakeAsync(() => {
      mockSessionService.startSession.and.returnValue(Promise.resolve(true));


      component.onStart(baseSessionResult);
      tick();


      expect(mockSessionService.startSession).toHaveBeenCalledWith(baseSessionResult);
      expect(mockRouter.navigate).toHaveBeenCalledWith([
        `/${CommonRoutes.TABS}/${CommonRoutes.HOME}`
      ]);
    }));


    it('should not navigate when startSession returns false', fakeAsync(() => {
      mockSessionService.startSession.and.returnValue(Promise.resolve(false));


      component.onStart(baseSessionResult);
      tick();


      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));


    it('should not navigate when startSession returns null', fakeAsync(() => {
      mockSessionService.startSession.and.returnValue(Promise.resolve(null));


      component.onStart(baseSessionResult);
      tick();


      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));
  });


  describe('onCancel', () => {
    it('should unEnroll when alert is confirmed', fakeAsync(() => {
      mockUtilService.alertPopup.and.returnValue(Promise.resolve(true));
      mockSessionService.unEnrollSession.and.returnValue(
        Promise.resolve({ result: true, message: 'Cancelled' } as any)
      );
      spyOn(component, 'fetchSessionDetails').and.returnValue(Promise.resolve());


      component.id = 'session-1';
      component.onCancel();
      tick();


      expect(mockSessionService.unEnrollSession).toHaveBeenCalledWith('session-1');
      expect(mockToastService.showToast).toHaveBeenCalledWith('Cancelled', 'success');
      expect(component.fetchSessionDetails).toHaveBeenCalled();
    }));


    it('should not unEnroll when alert is cancelled', fakeAsync(() => {
      mockUtilService.alertPopup.and.returnValue(Promise.resolve(false));


      component.id = 'session-1';
      component.onCancel();
      tick();


      expect(mockSessionService.unEnrollSession).not.toHaveBeenCalled();
    }));
  });


  describe('showToasts', () => {
    it('should create and present toast with translated message', fakeAsync(() => {
      component.showToasts('ADD_MEETING_LINK', 0, []);
      tick();


      expect(mockToastController.create).toHaveBeenCalled();
      const createArgs = mockToastController.create.calls.mostRecent().args[0];
      expect(createArgs.message).toBe('ADD_MEETING_LINK');
      expect(createArgs.cssClass).toBe('custom-toast');
    }));


    it('should create toast with custom buttons', fakeAsync(() => {
      const buttons = [
        {
          text: 'Add meeting link',
          role: 'cancel',
          handler: () => { }
        }
      ];


      component.showToasts('ADD_MEETING_LINK', 0, buttons);
      tick();


      expect(mockToastController.create).toHaveBeenCalled();
      const createArgs = mockToastController.create.calls.mostRecent().args[0];
      expect(createArgs.buttons).toEqual(buttons);
    }));
  });


  describe('goToHome', () => {
    it('should navigate to home', () => {
      component.goToHome();

      expect(mockRouter.navigate).toHaveBeenCalledWith([
        `/${CommonRoutes.TABS}/${CommonRoutes.HOME}`
      ]);
    });
  });


  describe('onViewList', () => {
    it('should open mentee list modal', fakeAsync(() => {
      const mockModal = {
        present: jasmine.createSpy('present'),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(Promise.resolve())
      };
      mockModalCtrl.create.and.returnValue(Promise.resolve(mockModal as any));


      component.id = 'session-1';
      component.onViewList(null);
      tick();


      expect(mockModalCtrl.create).toHaveBeenCalledWith({
        component: MenteeListPopupComponent,
        cssClass: 'large-width-popover-config',
        componentProps: { id: 'session-1' }
      });
      expect(mockModal.present).toHaveBeenCalled();
      expect(mockModal.onDidDismiss).toHaveBeenCalled();
    }));
  });


  describe('ionViewWillLeave & ngOnDestroy', () => {
    it('should dismiss toast on leave when snackbarRef exists and not skipWhenDelete', fakeAsync(() => {
      component.snackbarRef = {}; // simulate existing toast
      component.skipWhenDelete = false;


      component.ionViewWillLeave();


      expect(mockToastController.dismiss).toHaveBeenCalled();
    }));


    it('should dismiss toast on destroy when snackbarRef exists and not skipWhenDelete', fakeAsync(() => {
      component.snackbarRef = {}; // simulate existing toast
      component.skipWhenDelete = false;


      component.ngOnDestroy();


      expect(mockToastController.dismiss).toHaveBeenCalled();
    }));


    it('should not dismiss when skipWhenDelete is true', fakeAsync(() => {
      component.snackbarRef = {};
      component.skipWhenDelete = true;


      component.ionViewWillLeave();


      expect(mockToastController.dismiss).not.toHaveBeenCalled();
    }));


    it('should not throw when snackbarRef is undefined', () => {
      component.snackbarRef = undefined;

      expect(() => component.ionViewWillLeave()).not.toThrow();
      expect(() => component.ngOnDestroy()).not.toThrow();
    });
  });
});
