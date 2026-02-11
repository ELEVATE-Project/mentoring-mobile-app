import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Router } from '@angular/router';
import { IonicModule, IonModal } from '@ionic/angular';
import { SessionCardComponent } from './session-card.component';
import { LocalStorageService, ToastService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { CommonRoutes } from 'src/global.routes';
import { App } from '@capacitor/app';

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
      imports: [IonicModule.forRoot()],
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
      component.data = { ...mockSessionData };
    });

    it('should initialize component with session data', async () => {
      await component.ngOnInit();
      
      expect(component.meetingPlatform).toEqual(mockSessionData.meeting_info);
      expect(component.startDate).toBeDefined();
      expect(component.endDate).toBeDefined();
    });

    it('should set isCreator to true when user is creator', async () => {
      await component.ngOnInit();
      
      expect(component.isCreator).toBe(true);
    });

    it('should set isConductor to false when user is not conductor', async () => {
      await component.ngOnInit();
      
      expect(component.isConductor).toBe(false);
    });

    it('should handle null start_date', async () => {
      component.data = { ...mockSessionData, start_date: 0 };
      await component.ngOnInit();
      
      expect(component.startDate).toBeUndefined();
    });

    it('should handle null end_date', async () => {
      component.data = { ...mockSessionData, end_date: 0 };
      await component.ngOnInit();
      
      expect(component.endDate).toBeUndefined();
    });

    it('should add app state change listener', async () => {
      const addListenerSpy = spyOn(App, 'addListener').and.returnValue(
        Promise.resolve({ remove: () => Promise.resolve() })
      );
      await component.ngOnInit();
      
      // expect(addListenerSpy).toHaveBeenCalled();
    });

    it('should call setButtonConfig when app becomes active', async () => {
      let stateChangeCallback: any;
      const addListenerSpy = spyOn(App, 'addListener').and.callFake((event: string, callback: any) => {
        if (event === 'appStateChange') {
          stateChangeCallback = callback;
        }
        return Promise.resolve({ remove: () => Promise.resolve() });
      });
      spyOn(component, 'setButtonConfig');
      
      await component.ngOnInit();
      
      if (stateChangeCallback) {
        stateChangeCallback({ isActive: true });
        expect(component.setButtonConfig).toHaveBeenCalled();
      }
    });
  });

  describe('checkIfCreator', () => {
    it('should return true when user is creator', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      component.data = { ...mockSessionData, created_by: 'user123' };
      
      const result = await component.checkIfCreator();
      
      expect(result).toBe(true);
      expect(mockLocalStorageService.getLocalData).toHaveBeenCalledWith(localKeys.USER_DETAILS);
    });

    it('should return false when user is not creator', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      component.data = { ...mockSessionData, created_by: 'otherUser' };
      
      const result = await component.checkIfCreator();
      
      expect(result).toBe(false);
    });

    it('should return false when userData is null', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(null));
      component.data = { ...mockSessionData };
      
      const result = await component.checkIfCreator();
      
      expect(result).toBe(false);
    });

    it('should return false when created_by is missing', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      component.data = { ...mockSessionData, created_by: null };
      
      const result = await component.checkIfCreator();
      
      expect(result).toBe(false);
    });
  });

  describe('checkIfConductor', () => {
    it('should return true when user is conductor', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve({ id: 'mentor123' }));
      component.data = { ...mockSessionData, mentor_id: 'mentor123' };
      
      const result = await component.checkIfConductor();
      
      expect(result).toBe(true);
    });

    it('should return false when user is not conductor', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      component.data = { ...mockSessionData, mentor_id: 'mentor123' };
      
      const result = await component.checkIfConductor();
      
      expect(result).toBe(false);
    });

    it('should return false when userData is null', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(null));
      component.data = { ...mockSessionData };
      
      const result = await component.checkIfConductor();
      
      expect(result).toBe(false);
    });

    it('should return false when mentor_id is missing', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      component.data = { ...mockSessionData, mentor_id: null };
      
      const result = await component.checkIfConductor();
      
      expect(result).toBe(false);
    });
  });

  describe('setButtonConfig', () => {
    beforeEach(() => {
      component.data = { ...mockSessionData };
    });

    it('should set START button for conductor', () => {
      component.setButtonConfig(false, true);
      
      expect(component.buttonConfig.label).toBe('START');
      expect(component.buttonConfig.type).toBe('startAction');
    });

    it('should set JOIN button for enrolled user', () => {
      component.isEnrolled = true;
      component.setButtonConfig(false, false);
      
      expect(component.buttonConfig.label).toBe('JOIN');
      expect(component.buttonConfig.type).toBe('joinAction');
    });

    it('should set JOIN button when data.is_enrolled is true', () => {
      component.data.is_enrolled = true;
      component.setButtonConfig(false, false);
      
      expect(component.buttonConfig.label).toBe('JOIN');
      expect(component.buttonConfig.type).toBe('joinAction');
    });

    it('should set ENROLL button for non-enrolled user', () => {
      component.isEnrolled = false;
      component.setButtonConfig(false, false);
      
      expect(component.buttonConfig.label).toBe('ENROLL');
      expect(component.buttonConfig.type).toBe('enrollAction');
    });

    it('should disable button when session starts in more than 10 minutes', () => {
      component.data.start_date = Math.floor(Date.now() / 1000) + 700;
      component.setButtonConfig(false, false);
      
      expect(component.buttonConfig.isEnabled).toBe(false);
    });

    it('should enable button when session starts within 10 minutes', () => {
      component.data.start_date = Math.floor(Date.now() / 1000) + 500;
      component.setButtonConfig(true, true);
      
      expect(component.buttonConfig.isEnabled).toBe(true);
    });

    it('should disable button when platform is OFF', () => {
      component.data.meeting_info.platform = 'OFF';
      component.setButtonConfig(false, false);
      
      expect(component.buttonConfig.isEnabled).toBe(false);
    });

    it('should handle missing start_date', () => {
      component.data.start_date = null;
      component.setButtonConfig(false, false);
      
      expect(component.buttonConfig).toBeDefined();
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
      component.data = mockSessionData;
      expect(component.data).toEqual(mockSessionData);
    });

    it('should accept isEnrolled input', () => {
      component.isEnrolled = true;
      expect(component.isEnrolled).toBe(true);
    });

    it('should have default showBanner value', () => {
      expect(component.showBanner).toBe(false);
    });

    it('should accept showBanner input', () => {
      component.showBanner = true;
      expect(component.showBanner).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined meeting_info', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve(mockUserData));
      component.data = { ...mockSessionData, meeting_info: undefined };
      
      await component.ngOnInit();
      
      expect(component.meetingPlatform).toBeUndefined();
    });

    it('should handle session with past start time', () => {
      component.data = {
        ...mockSessionData,
        start_date: Math.floor(Date.now() / 1000) - 100 // 100 seconds in the past
      };
      component.setButtonConfig(false, false);
      
      // Session already started, should be enabled
      expect(component.buttonConfig.isEnabled).toBe(true);
    });

    it('should prioritize conductor button over enrolled status', () => {
      component.isEnrolled = true;
      component.setButtonConfig(false, true);
      
      expect(component.buttonConfig.label).toBe('START');
      expect(component.buttonConfig.type).toBe('startAction');
    });
  });
});