import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { IonicModule, NavController, IonModal } from '@ionic/angular';
import { Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { SessionRequestDetailsPage } from './session-request-details.page';
import { HttpService, ToastService, UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { SessionService } from 'src/app/core/services/session/session.service';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { CommonRoutes } from 'src/global.routes';
import { PLATFORMS } from 'src/app/core/constants/formConstant';

@Pipe({ name: 'translate', standalone: false })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('SessionRequestDetailsPage', () => {
  let component: SessionRequestDetailsPage;
  let fixture: ComponentFixture<SessionRequestDetailsPage>;
  let mockFormService: jasmine.SpyObj<FormService>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockUtilService: jasmine.SpyObj<UtilService>;
  let mockActivatedRoute: any;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockHttpService: jasmine.SpyObj<HttpService>;
  let mockModal: any;

  beforeEach(waitForAsync(() => {
    mockFormService = jasmine.createSpyObj('FormService', ['getForm']);
    mockSessionService = jasmine.createSpyObj('SessionService', ['getReqSessionDetails', 'getSessionDetailsAPI', 'requestSessionUserAvailability', 'requestSessionAccept', 'requestSessionReject', 'createSession', 'startSession']);
    mockToastService = jasmine.createSpyObj('ToastService', ['showToast']);
    mockUtilService = jasmine.createSpyObj('UtilService', ['alertPopup']);
    mockHttpService = jasmine.createSpyObj('HttpService', ['checkNetworkAvailability']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      queryParams: of({ id: '123' })
    };

    mockModal = {
      dismiss: jasmine.createSpy('dismiss')
    };

    TestBed.configureTestingModule({
      declarations: [SessionRequestDetailsPage, MockTranslatePipe],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: FormService, useValue: mockFormService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: ToastService, useValue: mockToastService },
        { provide: UtilService, useValue: mockUtilService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Router, useValue: mockRouter },
        { provide: HttpService, useValue: mockHttpService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionRequestDetailsPage);
    component = fixture.componentInstance;
    component.modal = mockModal as any;
    component.params = { id: '123' };

    // Default mocks/spies
    mockFormService.getForm.and.returnValue(Promise.resolve({ data: { fields: { forms: [{ name: 'zoom', hint: 'zoom_hint', value: 'zoom_val' }] } } }));
    mockSessionService.getReqSessionDetails.and.returnValue(Promise.resolve({ result: { status: 'PENDING', session_id: 'sess_1', start_date: 100 } }));
    mockSessionService.getSessionDetailsAPI.and.returnValue(Promise.resolve({
      result: {
        start_date: 100,
        status: { value: 'PUBLISHED' },
        meeting_info: { value: 'Zoom', platform: 'Zoom', meta: { meetingId: '1', password: 'p' }, link: 'url' }
      }
    }));
    mockSessionService.requestSessionUserAvailability.and.returnValue(Promise.resolve({ result: [] }));

    // Initialize component data to prevent template errors
    component.apiResponse = {
      id: 'req_1',
      session_id: 'sess_1',
      start_date: 100,
      end_date: 200,
      status: 'PENDING',
      agenda: 'Test Agenda',
      created_by: 'user_123',
      requestor_id: 'user_123',
      user_details: {
        user_id: 'user_123',
        name: 'Test User',
        image: 'img.png',
        designation: [{ label: 'dev' }]
      }
    };
    component.userId = 'user_123';
    component.scheduledSessionDetals = []; // Initialize to prevent template error

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ionViewWillEnter', () => {
    it('should initialize and fetch details for PENDING session', fakeAsync(() => {
      mockSessionService.getReqSessionDetails.and.returnValue(Promise.resolve({ result: { status: 'PENDING', session_id: 'sess_1' } }));

      // Reset userId to test initialization logic if needed, or just let ionViewWillEnter overwrite it
      localStorage.setItem('userId', 'user_123'); // Ensure localstorage works as expected by component

      component.ionViewWillEnter();
      tick();
      expect(component.userId).toBeDefined();
      expect(component.params).toEqual({ id: '123' });
      expect(mockSessionService.getReqSessionDetails).toHaveBeenCalledWith('123');
      expect(component.apiResponse).toBeDefined();
    }));

    it('should fetch session details if ACCEPTED', fakeAsync(() => {
      const acceptedResponse = { status: 'ACCEPTED', session_id: 'sess_1' };
      mockSessionService.getReqSessionDetails.and.returnValue(Promise.resolve({ result: acceptedResponse }));
      mockSessionService.getSessionDetailsAPI.and.returnValue(Promise.resolve({ result: { start_date: 2000000000, status: { value: 'PUBLISHED' } } })); // Future date

      component.ionViewWillEnter();
      tick();

      expect(mockSessionService.getSessionDetailsAPI).toHaveBeenCalledWith('sess_1');
      expect(component.isMeetingLinkAdded).toBeTrue();
      expect(component.isEnabled).toBeFalse(); // far future
    }));
  });

  describe('toggleText', () => {
    it('should toggle showFullText', () => {
      component.showFullText = false;
      component.toggleText();
      expect(component.showFullText).toBeTrue();
      component.toggleText();
      expect(component.showFullText).toBeFalse();
    });
  });

  describe('accept', () => {
    it('should accept session and refresh data', fakeAsync(() => {
      mockSessionService.requestSessionAccept.and.returnValue(Promise.resolve({ message: 'Accepted' }));
      mockSessionService.getReqSessionDetails.and.returnValue(Promise.resolve({ result: { status: 'ACCEPTED', session_id: 'sess_1' } }));

      component.accept('req_1');
      tick();

      expect(mockSessionService.requestSessionAccept).toHaveBeenCalledWith('req_1');
      expect(mockToastService.showToast).toHaveBeenCalledWith('Accepted', 'success');
      expect(mockSessionService.requestSessionUserAvailability).toHaveBeenCalled(); // via getAllUpdatedSession
      expect(component.isAccepted).toBeTrue();
    }));
  });

  describe('reject', () => {
    it('should reject session if confirmed', fakeAsync(() => {
      mockHttpService.checkNetworkAvailability.and.returnValue(Promise.resolve(true));
      mockUtilService.alertPopup.and.returnValue(Promise.resolve({ reason: 'Busy' }));
      mockSessionService.requestSessionReject.and.returnValue(Promise.resolve({ message: 'Rejected' }));

      component.reject('req_1', 'User A');
      tick();

      expect(mockUtilService.alertPopup).toHaveBeenCalled();
      expect(mockSessionService.requestSessionReject).toHaveBeenCalledWith('req_1', 'Busy');
      expect(mockToastService.showToast).toHaveBeenCalledWith('Rejected', 'danger');
      expect(component.isRejected).toBeTrue();
    }));

    it('should not reject if cancelled', fakeAsync(() => {
      mockHttpService.checkNetworkAvailability.and.returnValue(Promise.resolve(true));
      mockUtilService.alertPopup.and.returnValue(Promise.resolve(null));

      component.reject('req_1', 'User A');
      tick();

      expect(mockSessionService.requestSessionReject).not.toHaveBeenCalled();
    }));
  });

  describe('addLink', () => {
    it('should open modal and set session id', () => {
      component.addLink(true, 'sess_1');
      expect(component.isModalOpen).toBeTrue();
      expect(component.sessionId).toBe('sess_1');
    });
  });

  describe('addNow', () => {
    it('should create session link and update details if form valid', fakeAsync(() => {
      component.selectedLink = { name: 'Zoom', value: 'zoom' };
      // Mocking form structure
      component.platformForm = {
        myForm: {
          valid: true,
          value: { link: 'http://zoom.us', password: 'pass', meetingId: '123' }
        }
      } as any;
      component.sessionId = 'sess_1';
      component.params = { id: 'req_1' };

      mockSessionService.createSession.and.returnValue(Promise.resolve({}));
      mockSessionService.getReqSessionDetails.and.returnValue(Promise.resolve({
        result: {
          status: 'ACCEPTED',
          session_id: 'sess_1',
          user_details: { user_id: 'user_123', name: 'Test User', designation: [{ label: 'dev' }] },
          mentor_details: { id: 'mentor_1', name: 'Mentor Name', user_id: 'user_123' },
          requestor_id: 'user_123',
          agenda: 'Test Agenda'
        }
      }));

      component.modal = mockModal; // Ensure modal is set

      component.addNow();
      tick(); // resolve createSession
      tick(); // resolve getReqSessionDetails
      tick(); // resolve getSessionDetailsAPI
      fixture.whenStable().then(() => { // wait for promises
        fixture.detectChanges();
      });

      expect(component.meetingInfo).toEqual({
        meeting_info: {
          platform: 'Zoom',
          link: 'http://zoom.us',
          value: 'zoom',
          meta: { password: 'pass', meetingId: '123' }
        }
      });
      expect(mockSessionService.createSession).toHaveBeenCalledWith(component.meetingInfo, 'sess_1');
      expect(component.isMeetingLinkAdded).toBeTrue();
      expect(component.editSessionBtn).toBeTrue();
    }));
  });

  describe('editLink', () => {
    it('should prepopulate form data from existing session details', () => {
      component.meetingPlatforms = [
        {
          name: 'Google Meet',
          value: 'google',
          hint: 'hint',
          form: {
            controls: [
              { name: 'link', value: '' },
              { name: 'meetingId', value: '' },
              { name: 'password', value: '' }
            ]
          }
        }
      ];
      component.sessionDetails = {
        meeting_info: {
          platform: 'Google Meet',
          link: 'http://meet.google.com',
          meta: { meetingId: 'm1', password: 'p1' }
        }
      };

      component.editLink(true, 'sess_1');

      expect(component.isModalOpen).toBeTrue();
      expect(component.selectedLink.name).toBe('Google Meet');
      // Verify controls were updated (by reference)
      const controls = component.meetingPlatforms[0].form.controls;
      expect(controls.find(c => c.name === 'link').value).toBe('http://meet.google.com');
      expect(controls.find(c => c.name === 'meetingId').value).toBe('m1');
    });
  });

  describe('addLater', () => {
    it('should close modal', () => {
      component.modal = mockModal; // Ensure modal is set
      component.addLater();
      expect(mockModal.dismiss).toHaveBeenCalled();
      expect(component.isModalOpen).toBeFalse();
    });
  });

  describe('viewProfile', () => {
    it('should navigate to mentor details', () => {
      component.viewProfile('mentor_1');
      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.MENTOR_DETAILS, 'mentor_1']);
    });
  });

  describe('onStart', () => {
    it('should start session and navigate home', fakeAsync(() => {
      mockSessionService.startSession.and.returnValue(Promise.resolve(true));
      component.onStart({ id: 's1' });
      tick();
      expect(mockSessionService.startSession).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]);
    }));
  });

  describe('formatUnixTime', () => {
    it('should format timestamp correctly', () => {
      // 1672531200 = 2023-01-01 00:00:00 UTC. In +05:30 it is 5:30 AM
      const timestamp = 1672531200;
      // We just check that it returns a string, exact format depends on timezone but moment handles it.
      // For mocking purposes we can rely on moment existing or if it's imported correctly.
      // Since moment is usually global or imported, we test the output structure.
      const result = component.formatUnixTime(timestamp);
      expect(result).toMatch(/\d{1,2}:\d{2} [AP]M/);
    });
  });
});
