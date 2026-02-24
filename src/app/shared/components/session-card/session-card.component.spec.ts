import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule, IonModal } from '@ionic/angular';
import { SessionCardComponent } from './session-card.component';
import { LocalStorageService, ToastService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { CommonRoutes } from 'src/global.routes';
import { App } from '@capacitor/app';
import { TranslateModule } from '@ngx-translate/core';

describe('SessionCardComponent', () => {
  let component: SessionCardComponent;
  let fixture: ComponentFixture<SessionCardComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockLocalStorageService: jasmine.SpyObj<LocalStorageService>;

  const mockUserData = {
    id: 'user123',
    name: 'Test User'
  };

  const mockSessionData = {
    id: 'session123',
    start_date: Math.floor(Date.now() / 1000) + 300,
    end_date: Math.floor(Date.now() / 1000) + 3600,
    created_by: 'user123',
    mentor_id: 'mentor123',
    is_enrolled: false,
    meeting_info: {
      platform: 'ZOOM'
    }
  };

  beforeEach(waitForAsync(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSessionService = jasmine.createSpyObj('SessionService', ['getSession']);
    mockToastService = jasmine.createSpyObj('ToastService', ['showToast']);
    mockLocalStorageService = jasmine.createSpyObj('LocalStorageService', ['getLocalData']);

    TestBed.configureTestingModule({
      declarations: [SessionCardComponent],
      imports: [IonicModule.forRoot(), TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: SessionService, useValue: mockSessionService },
        { provide: ToastService, useValue: mockToastService },
        { provide: LocalStorageService, useValue: mockLocalStorageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionCardComponent);
    component = fixture.componentInstance;
  }));

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      fixture.componentRef.setInput('data', { ...mockSessionData });
    });

    it('should initialize component with session data', async () => {
      await component.ngOnInit();
      
      expect(component.meetingPlatform()).toEqual(mockSessionData.meeting_info);
      expect(component.startDate()).toBeDefined();
      expect(component.endDate()).toBeDefined();
    });

    it('should set isCreator to true when user is creator', async () => {
      await component.ngOnInit();
      
      expect(component.isCreator()).toBe(true);
    });

    it('should set isConductor to false when user is not conductor', async () => {
      await component.ngOnInit();
      
      expect(component.isConductor()).toBe(false);
    });

    it('should handle null start_date', async () => {
      fixture.componentRef.setInput('data', { ...mockSessionData, start_date: 0 });
      await component.ngOnInit();
      
      expect(component.startDate()).toBeUndefined();
    });

    it('should handle null end_date', async () => {
      fixture.componentRef.setInput('data', { ...mockSessionData, end_date: 0 });
      await component.ngOnInit();
      
      expect(component.endDate()).toBeUndefined();
    });

    it('should add app state change listener', async () => {
      const addListenerSpy = spyOn(App, 'addListener').and.returnValue(
        Promise.resolve({ remove: () => Promise.resolve() })
      );
      await component.ngOnInit();
    });

    it('should update currentTime when app becomes active', async () => {
      let stateChangeCallback: any;
      spyOn(App, 'addListener').and.callFake((event: string, callback: any) => {
        if (event === 'appStateChange') {
          stateChangeCallback = callback;
        }
        return Promise.resolve({ remove: () => Promise.resolve() });
      });

      await component.ngOnInit();

      if (stateChangeCallback) {
        const timeBefore = component.currentTime();
        stateChangeCallback({ isActive: true });
        expect(component.currentTime()).toBeGreaterThanOrEqual(timeBefore);
      }
    });
  });

  describe('isCreator (computed)', () => {
    it('should return true when user is creator', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      fixture.componentRef.setInput('data', { ...mockSessionData, created_by: 'user123' });
      
      await component.ngOnInit();
      
      expect(component.isCreator()).toBe(true);
    });

    it('should return false when user is not creator', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      fixture.componentRef.setInput('data', { ...mockSessionData, created_by: 'otherUser' });
      
      await component.ngOnInit();
      
      expect(component.isCreator()).toBe(false);
    });

    it('should return false when currentUser is null', () => {
      fixture.componentRef.setInput('data', { ...mockSessionData });
      
      expect(component.isCreator()).toBe(false);
    });

    it('should return false when created_by is missing', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      fixture.componentRef.setInput('data', { ...mockSessionData, created_by: null });
      
      await component.ngOnInit();
      
      expect(component.isCreator()).toBe(false);
    });
  });

  describe('isConductor (computed)', () => {
    it('should return true when user is conductor', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve({ id: 'mentor123' }));
      fixture.componentRef.setInput('data', { ...mockSessionData, mentor_id: 'mentor123' });
      
      await component.ngOnInit();
      
      expect(component.isConductor()).toBe(true);
    });

    it('should return false when user is not conductor', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      fixture.componentRef.setInput('data', { ...mockSessionData, mentor_id: 'mentor123' });
      
      await component.ngOnInit();
      
      expect(component.isConductor()).toBe(false);
    });

    it('should return false when currentUser is null', () => {
      fixture.componentRef.setInput('data', { ...mockSessionData });
      
      expect(component.isConductor()).toBe(false);
    });

    it('should return false when mentor_id is missing', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      fixture.componentRef.setInput('data', { ...mockSessionData, mentor_id: null });
      
      await component.ngOnInit();
      
      expect(component.isConductor()).toBe(false);
    });
  });

  describe('buttonConfig (computed)', () => {
    it('should set START button for conductor', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve({ id: 'mentor123' }));
      fixture.componentRef.setInput('data', { ...mockSessionData, mentor_id: 'mentor123' });

      await component.ngOnInit();
      
      expect(component.buttonConfig().label).toBe('START');
      expect(component.buttonConfig().type).toBe('startAction');
    });

    it('should set JOIN button for enrolled user', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      fixture.componentRef.setInput('isEnrolled', true);
      fixture.componentRef.setInput('data', { ...mockSessionData, created_by: 'other', mentor_id: 'other' });

      await component.ngOnInit();
      
      expect(component.buttonConfig().label).toBe('JOIN');
      expect(component.buttonConfig().type).toBe('joinAction');
    });

    it('should set JOIN button when data.is_enrolled is true', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      fixture.componentRef.setInput('data', { ...mockSessionData, is_enrolled: true, created_by: 'other', mentor_id: 'other' });

      await component.ngOnInit();
      
      expect(component.buttonConfig().label).toBe('JOIN');
      expect(component.buttonConfig().type).toBe('joinAction');
    });

    it('should set ENROLL button for non-enrolled user', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      fixture.componentRef.setInput('isEnrolled', false);
      fixture.componentRef.setInput('data', { ...mockSessionData, created_by: 'other', mentor_id: 'other' });

      await component.ngOnInit();
      
      expect(component.buttonConfig().label).toBe('ENROLL');
      expect(component.buttonConfig().type).toBe('enrollAction');
    });

    it('should disable button when session starts in more than 10 minutes', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      fixture.componentRef.setInput('data', { ...mockSessionData, start_date: Math.floor(Date.now() / 1000) + 700 });

      await component.ngOnInit();
      
      expect(component.buttonConfig().isEnabled).toBe(false);
    });

    it('should enable button when session starts within 10 minutes', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve({ id: 'mentor123' }));
      fixture.componentRef.setInput('data', { ...mockSessionData, start_date: Math.floor(Date.now() / 1000) + 500, mentor_id: 'mentor123' });

      await component.ngOnInit();
      
      expect(component.buttonConfig().isEnabled).toBe(true);
    });

    it('should disable button when platform is OFF', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      fixture.componentRef.setInput('data', { ...mockSessionData, meeting_info: { platform: 'OFF' }, created_by: 'other', mentor_id: 'other' });

      await component.ngOnInit();
      
      expect(component.buttonConfig().isEnabled).toBe(false);
    });

    it('should handle missing start_date', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      fixture.componentRef.setInput('data', { ...mockSessionData, start_date: null });

      await component.ngOnInit();
      
      expect(component.buttonConfig()).toBeDefined();
    });
  });

  describe('onCardClick', () => {
    it('should emit cardSelect event with correct data', () => {
      spyOn(component.onClickEvent, 'emit');
      const testData = { id: 'test123' };
      
      component.onCardClick(testData);
      
      expect(component.onClickEvent.emit).toHaveBeenCalledWith({
        data: testData,
        type: 'cardSelect'
      });
    });
  });

  describe('onButtonClick', () => {
    it('should emit button click event with correct data and type', () => {
      spyOn(component.onClickEvent, 'emit');
      const testData = { id: 'test123' };
      const type = 'startAction';
      
      component.onButtonClick(testData, type);
      
      expect(component.onClickEvent.emit).toHaveBeenCalledWith({
        data: testData,
        type: type
      });
    });

    it('should handle different action types', () => {
      spyOn(component.onClickEvent, 'emit');
      const testData = { id: 'test123' };
      
      component.onButtonClick(testData, 'joinAction');
      
      expect(component.onClickEvent.emit).toHaveBeenCalledWith({
        data: testData,
        type: 'joinAction'
      });
    });
  });

  describe('clickOnAddMeetingLink', () => {
    it('should navigate to create session with correct params', () => {
      const cardData = { id: 'session123' };
      
      component.clickOnAddMeetingLink(cardData);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [CommonRoutes.CREATE_SESSION],
        {
          queryParams: { id: 'session123', type: 'segment' }
        }
      );
    });

    it('should handle card data with different id', () => {
      const cardData = { id: 'differentId' };
      
      component.clickOnAddMeetingLink(cardData);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [CommonRoutes.CREATE_SESSION],
        {
          queryParams: { id: 'differentId', type: 'segment' }
        }
      );
    });
  });

  describe('Input properties', () => {
    it('should accept data input', () => {
      fixture.componentRef.setInput('data', mockSessionData);
      expect(component.data()).toEqual(mockSessionData);
    });

    it('should accept isEnrolled input', () => {
      fixture.componentRef.setInput('isEnrolled', true);
      expect(component.isEnrolled()).toBe(true);
    });

    it('should have default showBanner value', () => {
      expect(component.showBanner()).toBe(false);
    });

    it('should accept showBanner input', () => {
      fixture.componentRef.setInput('showBanner', true);
      expect(component.showBanner()).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined meeting_info', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      fixture.componentRef.setInput('data', { ...mockSessionData, meeting_info: undefined });
      
      await component.ngOnInit();
      
      expect(component.meetingPlatform()).toBeUndefined();
    });

    it('should handle session with past start time', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      fixture.componentRef.setInput('data', {
        ...mockSessionData,
        start_date: Math.floor(Date.now() / 1000) - 100,
        created_by: 'other',
        mentor_id: 'other'
      });

      await component.ngOnInit();
      
      expect(component.buttonConfig().isEnabled).toBe(true);
    });

    it('should prioritize conductor button over enrolled status', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve({ id: 'mentor123' }));
      fixture.componentRef.setInput('isEnrolled', true);
      fixture.componentRef.setInput('data', { ...mockSessionData, mentor_id: 'mentor123' });

      await component.ngOnInit();
      
      expect(component.buttonConfig().label).toBe('START');
      expect(component.buttonConfig().type).toBe('startAction');
    });
  });
});
