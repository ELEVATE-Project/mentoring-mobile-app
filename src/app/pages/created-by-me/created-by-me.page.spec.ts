import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { SessionService } from 'src/app/core/services/session/session.service';
import { LocalStorageService } from 'src/app/core/services';
import { CreatedByMePage } from './created-by-me.page';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { CommonRoutes } from 'src/global.routes';
import { localKeys } from 'src/app/core/constants/localStorage.keys';

@Pipe({ name: 'translate', standalone: false })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('CreatedByMePage', () => {
  let component: CreatedByMePage;
  let fixture: ComponentFixture<CreatedByMePage>;
  let mockNavController: jasmine.SpyObj<NavController>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockLocalStorageService: jasmine.SpyObj<LocalStorageService>;

  beforeEach(waitForAsync(() => {
    mockNavController = jasmine.createSpyObj('NavController', ['navigateForward']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSessionService = jasmine.createSpyObj('SessionService', ['getAllSessionsAPI', 'startSession']);
    mockLocation = jasmine.createSpyObj('Location', ['back']);
    mockLocalStorageService = jasmine.createSpyObj('LocalStorageService', ['getLocalData']);

    TestBed.configureTestingModule({
      declarations: [CreatedByMePage, MockTranslatePipe],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: NavController, useValue: mockNavController },
        { provide: Router, useValue: mockRouter },
        { provide: SessionService, useValue: mockSessionService },
        { provide: Location, useValue: mockLocation },
        { provide: LocalStorageService, useValue: mockLocalStorageService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(CreatedByMePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ionViewWillEnter', () => {
    it('should reset state and fetch details', () => {
      spyOn(component, 'fetchSessionDetails');
      component.ionViewWillEnter();
      expect(component.page).toBe(1);
      expect(component.loading).toBeTrue();
      expect(component.sessions).toEqual([]);
      expect(component.fetchSessionDetails).toHaveBeenCalled();
    });
  });

  describe('fetchSessionDetails', () => {
    it('should call getAllSessionsAPI with correct params', async () => {
      component.page = 1;
      component.limit = 10;
      component.type = 'published';
      component.searchText = 'test';
      mockSessionService.getAllSessionsAPI.and.returnValue(Promise.resolve({}));

      await component.fetchSessionDetails();

      expect(mockSessionService.getAllSessionsAPI).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        status: 'published',
        searchText: 'test'
      });
      expect(component.loading).toBeFalse();
    });
  });

  describe('segmentChanged', () => {
    it('should update type and refresh page', () => {
      spyOn(component, 'refreshPage');
      const event = { target: { value: 'newType' } };
      component.segmentChanged(event);
      expect(component.type).toBe('newType');
      expect(component.refreshPage).toHaveBeenCalled();
    });
  });

  describe('onSearch', () => {
    it('should update searchText and refresh page', () => {
      spyOn(component, 'refreshPage');
      const event = { target: { value: 'query' } };
      component.onSearch(event);
      expect(component.loading).toBeTrue();
      expect(component.searchText).toBe('query');
      expect(component.refreshPage).toHaveBeenCalled();
    });
  });

  describe('refreshPage', () => {
    it('should reset pagination and fetch details', () => {
      spyOn(component, 'fetchSessionDetails');
      component.refreshPage();
      expect(component.loading).toBeTrue();
      expect(component.sessions).toEqual([]);
      expect(component.page).toBe(1);
      expect(component.fetchSessionDetails).toHaveBeenCalled();
    });
  });

  describe('createSession', () => {
    it('should navigate to create session if user has "about" details', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve({ about: 'bio' }));
      await component.createSession();
      expect(mockLocalStorageService.getLocalData).toHaveBeenCalledWith(localKeys.USER_DETAILS);
      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.CREATE_SESSION]);
    });

    it('should navigate to profile if user details are missing "about"', async () => {
      mockLocalStorageService.getLocalData.and.returnValue(Promise.resolve({ about: null }));
      await component.createSession();
      expect(mockLocalStorageService.getLocalData).toHaveBeenCalledWith(localKeys.USER_DETAILS);
      expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.TABS}/${CommonRoutes.PROFILE}`]);
    });
  });

  describe('goToHome', () => {
    it('should navigate to home', () => {
      component.goToHome();
      expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]);
    });
  });

  describe('loadMore', () => {
    it('should increment page and fetch details', () => {
      spyOn(component, 'fetchSessionDetails');
      component.page = 1;
      component.loadMore();
      expect(component.page).toBe(2);
      expect(component.fetchSessionDetails).toHaveBeenCalled();
    });
  });

  describe('eventAction', () => {
    it('should start session and navigate to home if successful', async () => {
      const event = { data: { _id: '123' } };
      mockSessionService.startSession.and.returnValue(Promise.resolve(true));
      await component.eventAction(event);
      expect(mockSessionService.startSession).toHaveBeenCalledWith('123');
      expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`]);
    });

    it('should not navigate if startSession fails', async () => {
      const event = { data: { _id: '123' } };
      mockSessionService.startSession.and.returnValue(Promise.resolve(false));
      await component.eventAction(event);
      expect(mockSessionService.startSession).toHaveBeenCalledWith('123');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});
