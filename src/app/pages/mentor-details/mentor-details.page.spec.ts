import { ComponentFixture, TestBed, fakeAsync, tick, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { MentorDetailsPage } from './mentor-details.page';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import {
  HttpService,
  LocalStorageService,
  ToastService,
  UserService,
  UtilService,
} from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { Location } from '@angular/common';
import { CommonRoutes } from 'src/global.routes';

import { Clipboard } from '@capacitor/clipboard';
import { localKeys } from 'src/app/core/constants/localStorage.keys';

describe('MentorDetailsPage', () => {
  let component: MentorDetailsPage;
  let fixture: ComponentFixture<MentorDetailsPage>;
  let httpService: jasmine.SpyObj<HttpService>;
  let router: jasmine.SpyObj<Router>;
  let sessionService: jasmine.SpyObj<SessionService>;
  let userService: jasmine.SpyObj<UserService>;
  let localStorage: jasmine.SpyObj<LocalStorageService>;
  let toast: jasmine.SpyObj<ToastService>;
  let utilService: jasmine.SpyObj<UtilService>;
  let location: jasmine.SpyObj<Location>;
  let activatedRoute: any;

  beforeEach(waitForAsync(() => {
    activatedRoute = {
      params: of({ id: '123' }),
    };

    TestBed.configureTestingModule({
      declarations: [MentorDetailsPage],
      imports: [IonicModule.forRoot()],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: activatedRoute,
        },
        {
          provide: HttpService,
          useValue: jasmine.createSpyObj('HttpService', ['get']),
        },
        {
          provide: Router,
          useValue: jasmine.createSpyObj('Router', ['navigate']),
        },
        {
          provide: SessionService,
          useValue: jasmine.createSpyObj('SessionService', ['joinSession', 'enrollSession']),
        },
        {
          provide: UserService,
          useValue: jasmine.createSpyObj('UserService', ['getUserValue']),
        },
        {
          provide: LocalStorageService,
          useValue: jasmine.createSpyObj('LocalStorageService', ['getLocalData']),
        },
        {
          provide: ToastService,
          useValue: jasmine.createSpyObj('ToastService', ['showToast']),
        },
        {
          provide: UtilService,
          useValue: jasmine.createSpyObj('UtilService', ['isMobile', 'getDeepLink', 'shareLink', 'alertPopup']),
        },
        {
          provide: Location,
          useValue: jasmine.createSpyObj('Location', ['back']),
        },
        {
          provide: NavController,
          useValue: jasmine.createSpyObj('NavController', ['navigateForward']),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MentorDetailsPage);
    component = fixture.componentInstance;
    httpService = TestBed.inject(HttpService) as jasmine.SpyObj<HttpService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    sessionService = TestBed.inject(SessionService) as jasmine.SpyObj<SessionService>;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    localStorage = TestBed.inject(LocalStorageService) as jasmine.SpyObj<LocalStorageService>;
    toast = TestBed.inject(ToastService) as jasmine.SpyObj<ToastService>;
    utilService = TestBed.inject(UtilService) as jasmine.SpyObj<UtilService>;
    location = TestBed.inject(Location) as jasmine.SpyObj<Location>;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ionViewWillEnter', () => {
    it('should initialize component properties and call necessary methods', fakeAsync(() => {
      const user = { id: '456' };
      localStorage.getLocalData.and.returnValue(Promise.resolve(user));
      utilService.isMobile.and.returnValue(true);
      spyOn(component, 'getMentor');
      spyOn(component, 'getUpcomingSessions');

      component.ionViewWillEnter();
      tick();

      expect(component.isMobile).toBe(true);
      expect(component.isLoading).toBe(false);
      expect(component.isUpcomingSession).toBe(false);
      expect(localStorage.getLocalData).toHaveBeenCalledWith(localKeys.USER_DETAILS);
      expect(component.mentorId).toBe('123');
      expect(component.getMentor).toHaveBeenCalled();
      expect(component.currentUserId).toBe('456');
      expect(component.page).toBe(1);
      expect(component.upcomingSessions).toEqual([]);
    }));
  });

  describe('getMentor', () => {
    it('should fetch mentor details and update component properties', fakeAsync(() => {
      const mentorDetails = {
        result: {
          displayProperties: [],
          organization: { name: 'Test Org' },
          is_mentor: true,
        },
      };
      spyOn(component, 'getMentorDetails').and.returnValue(Promise.resolve(mentorDetails));
      spyOn(component, 'updateButtonConfig');

      component.getMentor();
      tick();

      expect(component.getMentorDetails).toHaveBeenCalled();
      expect(component.updateButtonConfig).toHaveBeenCalled();
      expect(component.isloaded).toBe(true);
      expect(component.detailData.controls).toEqual([]);
      expect(component.detailData.data).toEqual(mentorDetails.result);
      expect(component.detailData.data.organizationName).toBe('Test Org');
      expect(component.headerConfig.share).toBe(true);
    }));
  });

  describe('getUpcomingSessions', () => {
    it('should fetch upcoming sessions and update component properties', fakeAsync(() => {
      const sessions = { result: { data: [{ id: 1 }], count: 1 } };
      httpService.get.and.returnValue(Promise.resolve(sessions));

      component.getUpcomingSessions();
      tick();

      expect(httpService.get).toHaveBeenCalled();
      expect(component.isUpcomingSession).toBe(true);
      expect(component.upcomingSessions).toEqual([{ id: 1 }]);
      expect(component.totalCount).toBe(1);
      expect(component.disableInfiniteScroll).toBe(true);
    }));

    it('should handle error while fetching upcoming sessions', fakeAsync(() => {
      httpService.get.and.returnValue(Promise.reject(new Error('Error')));

      component.getUpcomingSessions();
      tick();

      expect(httpService.get).toHaveBeenCalled();
      expect(component.disableInfiniteScroll).toBe(true);
    }));
  });

  describe('getMentorDetails', () => {
    it('should fetch mentor details successfully', fakeAsync(() => {
      const mentorData = { result: { id: '123' } };
      httpService.get.and.returnValue(Promise.resolve(mentorData));

      let result;
      component.getMentorDetails().then(res => result = res);
      tick();

      expect(httpService.get).toHaveBeenCalled();
      expect(component.userCanAccess).toBe(true);
      expect(result).toEqual(mentorData);
    }));

    it('should handle 404 error', fakeAsync(() => {
      httpService.get.and.returnValue(Promise.reject({ status: 404 }));

      component.getMentorDetails();
      tick();

      expect(httpService.get).toHaveBeenCalled();
      expect(component.userNotFound).toBe(true);
    }));

    it('should handle 403 error', fakeAsync(() => {
      httpService.get.and.returnValue(Promise.reject({ status: 403 }));

      component.getMentorDetails();
      tick();

      expect(httpService.get).toHaveBeenCalled();
      expect(component.userCantAccess).toBe(true);
    }));

    it('should handle other errors', fakeAsync(() => {
      httpService.get.and.returnValue(Promise.reject({ status: 500 }));

      component.getMentorDetails();
      tick();

      expect(httpService.get).toHaveBeenCalled();
      expect(toast.showToast).toHaveBeenCalledWith('SOMETHING_WENT_WRONG', 'danger');
      expect(location.back).toHaveBeenCalled();
    }));
  });

  describe('goToHome', () => {
    it('should navigate to home page', () => {
      component.goToHome();
      expect(router.navigate).toHaveBeenCalledWith([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]);
    });
  });

  describe('segmentChanged', () => {
    it('should change segment and fetch upcoming sessions if segment is "upcoming"', fakeAsync(() => {
      spyOn(component, 'getUpcomingSessions');
      const event = { detail: { value: 'upcoming' } };

      component.segmentChanged(event);
      tick();

      expect(component.segmentValue).toBe('upcoming');
      expect(component.isUpcomingSession).toBe(false);
      expect(component.page).toBe(1);
      expect(component.upcomingSessions).toEqual([]);
      expect(component.getUpcomingSessions).toHaveBeenCalled();
    }));
  });

  describe('action', () => {
    it('should call share method when action is "share"', () => {
      spyOn(component, 'share');
      component.action('share');
      expect(component.share).toHaveBeenCalled();
    });
  });

  describe('share', () => {

    it('should copy to clipboard on web', fakeAsync(() => {
      component.isMobile = false;
      spyOn(component, 'copyToClipBoard');

      component.share();
      tick();

      expect(component.copyToClipBoard).toHaveBeenCalledWith(window.location.href);
      expect(toast.showToast).toHaveBeenCalledWith('PROFILE_LINK_COPIED', 'success');
    }));
  });

  describe('onAction', () => {
    it('should navigate to session details on cardSelect', () => {
      const event = { type: 'cardSelect', data: { id: '456' } };
      component.onAction(event);
      expect(router.navigate).toHaveBeenCalledWith([`/${CommonRoutes.SESSIONS_DETAILS}/456`], { replaceUrl: true });
    });

    it('should join session and refresh upcoming sessions on joinAction', fakeAsync(() => {
      const event = { type: 'joinAction', data: { id: '456' } };
      sessionService.joinSession.and.returnValue(Promise.resolve(null));
      spyOn(component, 'getUpcomingSessions');

      component.onAction(event);
      tick();

      expect(sessionService.joinSession).toHaveBeenCalledWith(event.data);
      expect(component.page).toBe(1);
      expect(component.isUpcomingSession).toBe(false);
      expect(component.upcomingSessions).toEqual([]);
      expect(component.getUpcomingSessions).toHaveBeenCalled();
    }));

    it('should enroll session and refresh upcoming sessions on enrollAction', fakeAsync(() => {
      const event = { type: 'enrollAction', data: { id: '456' } };
      sessionService.enrollSession.and.returnValue(Promise.resolve({ result: true, message: 'Enrolled' }));
      spyOn(component, 'getUpcomingSessions');

      component.onAction(event);
      tick();

      expect(sessionService.enrollSession).toHaveBeenCalledWith(event.data.id);
      expect(toast.showToast).toHaveBeenCalledWith('Enrolled', 'success');
      expect(component.page).toBe(1);
      expect(component.isUpcomingSession).toBe(false);
      expect(component.upcomingSessions).toEqual([]);
      expect(component.getUpcomingSessions).toHaveBeenCalled();
    }));
  });

  describe('updateButtonConfig', () => {
    it('should show chat and request session buttons for mentors', () => {
      component.mentorProfileData = { result: { is_mentor: true, id: '123' } };
      component.currentUserId = '456';
      component.updateButtonConfig();
      expect(component.buttonConfig.buttons.length).toBe(2);
      expect(component.buttonConfig.buttons[0].label).toBe('CHAT');
      expect(component.buttonConfig.buttons[1].label).toBe('REQUEST_SESSION');
    });

    it('should show only chat button for non-mentors', () => {
      component.mentorProfileData = { result: { is_mentor: false, id: '123' } };
      component.currentUserId = '456';
      component.updateButtonConfig();
      expect(component.buttonConfig.buttons.length).toBe(1);
      expect(component.buttonConfig.buttons[0].label).toBe('CHAT');
    });

    it('should hide buttons for own profile', () => {
      component.mentorProfileData = { result: { is_mentor: true, id: '123' } };
      component.currentUserId = '123';
      component.updateButtonConfig();
      expect(component.buttonConfig.buttons.every(btn => btn.isHide)).toBe(true);
    });
  });

  describe('loadMore', () => {
    it('should increment page and fetch more sessions', fakeAsync(() => {
      component.page = 1;
      spyOn(component, 'getUpcomingSessions');
      const event = { target: { complete: jasmine.createSpy() } };

      component.loadMore(event);
      tick();

      expect(component.page).toBe(2);
      expect(component.getUpcomingSessions).toHaveBeenCalledWith(true);
      expect(event.target.complete).toHaveBeenCalled();
    }));
  });

  describe('block', () => {
    it('should show alert and block user if confirmed', fakeAsync(() => {
      utilService.alertPopup.and.returnValue(Promise.resolve(true));
      component.mentorName = 'Mentor Name';
      component.mentorId = '123';

      component.block('123');
      tick();

      expect(utilService.alertPopup).toHaveBeenCalled();
      expect(toast.showToast).toHaveBeenCalledWith("BLOCK_TOAST_MESSAGE", "success", 5000, [], undefined, { name: 'Mentor Name' });
      expect(component.isdisabled).toBe(true);
    }));

    it('should show alert and NOT block user if cancelled', fakeAsync(() => {
      utilService.alertPopup.and.returnValue(Promise.resolve(false));
      component.mentorName = 'Mentor Name';

      component.block('123');
      tick();

      expect(utilService.alertPopup).toHaveBeenCalled();
      expect(toast.showToast).not.toHaveBeenCalled();
      expect(component.isdisabled).toBeUndefined();
    }));
  });

  describe('unblock', () => {
    it('should unblock user', () => {
      component.isdisabled = true;
      component.unblock();
      expect(component.isdisabled).toBe(false);
    });
  });

  describe('action', () => {
    it('should call block method when action is "block"', () => {
      spyOn(component, 'block');
      component.action('block');
      expect(component.block).toHaveBeenCalledWith(component.mentorId);
    });
  });

  describe('share (mobile)', () => {
    it('should share link using utilService on mobile', fakeAsync(() => {
      component.isMobile = true;
      component.buttonConfig.meta.id = '123';
      utilService.getDeepLink.and.returnValue('deep-link');
      // Mocking navigator.share
      const originalShare = navigator.share;
      (navigator as any).share = jasmine.createSpy('share').and.returnValue(Promise.resolve());

      component.share();
      tick();

      expect(utilService.getDeepLink).toHaveBeenCalled();
      expect(utilService.shareLink).toHaveBeenCalled();

      // Restore navigator.share
      if (originalShare) {
        (navigator as any).share = originalShare;
      } else {
        delete (navigator as any).share;
      }
    }));
  });

  describe('ionViewWillEnter edge case', () => {
    it('should not do anything if isLoading is true', fakeAsync(() => {
      component.isLoading = true;
      component.ionViewWillEnter();
      tick();
      expect(localStorage.getLocalData).not.toHaveBeenCalled();
    }));
    it('should call getUpcomingSessiosn if is_mentor is true', fakeAsync(() => {
      const user = { id: '456' };
      localStorage.getLocalData.and.returnValue(Promise.resolve(user));
      spyOn(component, 'getMentor');
      spyOn(component, 'getUpcomingSessions');
      component.mentorProfileData = { result: { is_mentor: true } };

      component.ionViewWillEnter();
      tick();

      expect(component.getUpcomingSessions).toHaveBeenCalled();
    }));
  });
});
