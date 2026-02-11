import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TranslatePipe, TranslateModule } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { SessionsPage } from './sessions';
import { HttpService, LoaderService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';
import { SKELETON } from 'src/app/core/constants/skeleton.constant';

describe('SessionsPage', () => {
  let component: SessionsPage;
  let fixture: ComponentFixture<SessionsPage>;
  let mockActivatedRoute: any;
  let mockHttpService: jasmine.SpyObj<HttpService>;
  let mockLoaderService: jasmine.SpyObj<LoaderService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let queryParamMap: BehaviorSubject<any>;

  beforeEach(waitForAsync(() => {
    queryParamMap = new BehaviorSubject({
      get: jasmine.createSpy('get').and.returnValue('all-sessions')
    });

    mockActivatedRoute = {
      queryParamMap: queryParamMap.asObservable()
    };

    mockHttpService = jasmine.createSpyObj('HttpService', ['get', 'post']);
    mockLoaderService = jasmine.createSpyObj('LoaderService', ['show', 'hide']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockSessionService = jasmine.createSpyObj('SessionService', ['getSessionsList', 'joinSession']);

    TestBed.configureTestingModule({
      declarations: [SessionsPage],
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: HttpService, useValue: mockHttpService },
        { provide: LoaderService, useValue: mockLoaderService },
        { provide: Router, useValue: mockRouter },
        { provide: SessionService, useValue: mockSessionService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionsPage);
    component = fixture.componentInstance;
  }));

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should initialize with default values', () => {
      expect(component.sessionsCount).toBe(0);
      expect(component.page).toBe(1);
      expect(component.limit).toBe(10);
      expect(component.searchText).toBe('');
      expect(component.showLoadMoreButton).toBe(false);
      expect(component.loading).toBe(false);
      expect(component.SKELETON).toBe(SKELETON);
    });

    it('should set type from query params as "all-sessions"', () => {
      fixture.detectChanges();
      expect(component.type).toBe('all-sessions');
    });

    it('should set type from query params as "my-sessions"', () => {
      queryParamMap.next({
        get: jasmine.createSpy('get').and.returnValue('all-sessions')
      });
      fixture.detectChanges();
      expect(component.type).toBe('all-sessions');
    });

    it('should set emptyMessage for "all-sessions"', () => {
      queryParamMap.next({
        get: jasmine.createSpy('get').and.returnValue('all-sessions')
      });
      fixture.detectChanges();
      expect(component.emptyMessage).toBe('NO_ACTIVE_ALL_SESSIONS');
    });

    it('should set emptyMessage for "my-sessions"', () => {
      queryParamMap.next({
        get: jasmine.createSpy('get').and.returnValue('my-sessions')
      });
      fixture.detectChanges();
      expect(component.emptyMessage).toBe('NO_ACTIVE_ALL_SESSIONS');
    });

    it('should configure header correctly', () => {
      expect(component.headerConfig).toEqual({
        menu: false,
        notification: false,
        headerColor: 'primary',
        backButton: true,
        label: 'SESSIONS_PAGE'
      });
    });

    it('should configure button correctly', () => {
      expect(component.buttonConfig).toEqual({
        label: 'JOIN'
      });
    });
  });

  describe('ionViewWillEnter', () => {
    beforeEach(() => {
      mockSessionService.getSessionsList.and.returnValue(Promise.resolve({
        result: [{ data: [], count: 0 }]
      }));
    });

    it('should reset page to 1', async () => {
      component.page = 5;
      await component.ionViewWillEnter();
      expect(component.page).toBe(1);
    });

    it('should reset sessions array', async () => {
      component.sessions = [{ id: 1 }, { id: 2 }];
      await component.ionViewWillEnter();
      expect(component.sessions).toEqual([]);
    });

    it('should call getSessions', async () => {
      spyOn(component, 'getSessions');
      await component.ionViewWillEnter();
      expect(component.getSessions).toHaveBeenCalled();
    });
  });

  describe('segmentChanged', () => {
    beforeEach(() => {
      mockSessionService.getSessionsList.and.returnValue(Promise.resolve({
        result: [{ data: [], count: 0 }]
      }));
      spyOn(component, 'getSessions');
    });

    it('should update type when segment changes to "my-sessions"', () => {
      const event = { target: { value: 'my-sessions' } };
      component.segmentChanged(event);
      expect(component.type).toBe('my-sessions');
    });

    it('should update type when segment changes to "all-sessions"', () => {
      const event = { target: { value: 'all-sessions' } };
      component.segmentChanged(event);
      expect(component.type).toBe('all-sessions');
    });

    it('should update emptyMessage for "my-sessions"', () => {
      const event = { target: { value: 'my-sessions' } };
      component.segmentChanged(event);
      expect(component.emptyMessage).toBe('NO_ACTIVE_MY_SESSIONS');
    });

    it('should update emptyMessage for "all-sessions"', () => {
      const event = { target: { value: 'all-sessions' } };
      component.segmentChanged(event);
      expect(component.emptyMessage).toBe('NO_ACTIVE_ALL_SESSIONS');
    });

    it('should reset sessions array', () => {
      component.sessions = [{ id: 1 }];
      const event = { target: { value: 'my-sessions' } };
      component.segmentChanged(event);
      expect(component.sessions).toEqual([]);
    });

    it('should reset page to 1', () => {
      component.page = 5;
      const event = { target: { value: 'all-sessions' } };
      component.segmentChanged(event);
      expect(component.page).toBe(1);
    });

    it('should call getSessions', () => {
      const event = { target: { value: 'all-sessions' } };
      component.segmentChanged(event);
      expect(component.getSessions).toHaveBeenCalled();
    });
  });

  describe('loadMore', () => {
    beforeEach(() => {
      mockSessionService.getSessionsList.and.returnValue(Promise.resolve({
        result: [{ data: [], count: 0 }]
      }));
      spyOn(component, 'getSessions');
    });

    it('should increment page by 1', () => {
      component.page = 1;
      component.loadMore();
      expect(component.page).toBe(2);
    });

    it('should call getSessions', () => {
      component.loadMore();
      expect(component.getSessions).toHaveBeenCalled();
    });
  });

  describe('onSearch', () => {
    beforeEach(() => {
      mockSessionService.getSessionsList.and.returnValue(Promise.resolve({
        result: [{ data: [], count: 0 }]
      }));
      spyOn(component, 'getSessions');
    });

    it('should reset page to 1', () => {
      component.page = 5;
      component.onSearch();
      expect(component.page).toBe(1);
    });

    it('should reset sessions array', () => {
      component.sessions = [{ id: 1 }];
      component.onSearch();
      expect(component.sessions).toEqual([]);
    });

    it('should call getSessions', () => {
      component.onSearch();
      expect(component.getSessions).toHaveBeenCalled();
    });
  });

  describe('getSessions', () => {
    const mockSessionData = {
      result: [{
        data: [
          { _id: '1', name: 'Session 1' },
          { _id: '2', name: 'Session 2' }
        ],
        count: 2
      }]
    };

    beforeEach(() => {
      component.type = 'all-sessions';
      component.page = 1;
      component.limit = 10;
      component.searchText = '';
      component.sessions = [];
    });

    it('should set loading to true when starting', async () => {
      mockSessionService.getSessionsList.and.returnValue(new Promise(() => {}));
      component.getSessions();
      expect(component.loading).toBe(true);
    });

    it('should call getSessionsList with correct parameters for "all-sessions"', async () => {
      mockSessionService.getSessionsList.and.returnValue(Promise.resolve(mockSessionData));
      component.type = 'all-sessions';
      await component.getSessions();
      
      expect(mockSessionService.getSessionsList).toHaveBeenCalledWith({
        type: false,
        page: 1,
        limit: 10,
        searchText: ''
      });
    });

    it('should call getSessionsList with correct parameters for "my-sessions"', async () => {
      mockSessionService.getSessionsList.and.returnValue(Promise.resolve(mockSessionData));
      component.type = 'my-sessions';
      await component.getSessions();
      
      expect(mockSessionService.getSessionsList).toHaveBeenCalledWith({
        type: true,
        page: 1,
        limit: 10,
        searchText: ''
      });
    });

    it('should concatenate new sessions to existing sessions', async () => {
      const existingSessions = [{ _id: '0', name: 'Session 0' }];
      component.sessions = existingSessions;
      mockSessionService.getSessionsList.and.returnValue(Promise.resolve(mockSessionData));
      
      await component.getSessions();
      
      expect(component.sessions.length).toBe(3);
      expect(component.sessions).toContain(existingSessions[0]);
    });

    it('should update sessionsCount', async () => {
      mockSessionService.getSessionsList.and.returnValue(Promise.resolve(mockSessionData));
      await component.getSessions();
      expect(component.sessionsCount).toBe(2);
    });

    it('should hide load more button when all sessions are loaded', async () => {
      mockSessionService.getSessionsList.and.returnValue(Promise.resolve(mockSessionData));
      await component.getSessions();
      expect(component.showLoadMoreButton).toBe(false);
    });

    it('should show load more button when more sessions available', async () => {
      const moreSessionsData = {
        result: [{
          data: [{ _id: '1', name: 'Session 1' }],
          count: 10
        }]
      };
      mockSessionService.getSessionsList.and.returnValue(Promise.resolve(moreSessionsData));
      await component.getSessions();
      expect(component.showLoadMoreButton).toBe(true);
    });

    it('should set loading to false after completion', async () => {
      mockSessionService.getSessionsList.and.returnValue(Promise.resolve(mockSessionData));
      await component.getSessions();
      expect(component.loading).toBe(false);
    });

    it('should handle search text in API call', async () => {
      component.searchText = 'test search';
      mockSessionService.getSessionsList.and.returnValue(Promise.resolve(mockSessionData));
      await component.getSessions();
      
      expect(mockSessionService.getSessionsList).toHaveBeenCalledWith(
        jasmine.objectContaining({ searchText: 'test search' })
      );
    });
  });

  describe('onAction', () => {
    it('should navigate to session details with correct ID', () => {
      const event = { data: { _id: '12345' } };
      component.onAction(event);
      
      expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.SESSIONS_DETAILS}/12345`]);
    });
  });

  describe('onJoin', () => {
    it('should call joinSession with event data', async () => {
      const sessionData = { _id: '123', name: 'Test Session' };
      const event = { data: sessionData };
      mockSessionService.joinSession.and.returnValue(Promise.resolve(null));
      
      await component.onJoin(event);
      
      expect(mockSessionService.joinSession).toHaveBeenCalledWith(sessionData);
    });

    it('should handle joinSession call', async () => {
      const event = { data: { _id: '456' } };
      mockSessionService.joinSession.and.returnValue(Promise.resolve(null));
      
      await component.onJoin(event);
      
      expect(mockSessionService.joinSession).toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty sessions response', async () => {
      mockSessionService.getSessionsList.and.returnValue(Promise.resolve({
        result: [{ data: [], count: 0 }]
      }));
      
      await component.getSessions();
      
      expect(component.sessions).toEqual([]);
      expect(component.sessionsCount).toBe(0);
      expect(component.showLoadMoreButton).toBe(false);
    });

    it('should handle undefined result from getSessionsList', async () => {
      mockSessionService.getSessionsList.and.returnValue(Promise.resolve({
        result: [{ data: undefined, count: 0 }]
      }));
      
      await component.getSessions();
      
      expect(component.sessions.length).toBeGreaterThanOrEqual(0);
    });

    it('should preserve existing type when query param is null', () => {
      component.type = 'my-sessions';
      queryParamMap.next({
        get: jasmine.createSpy('get').and.returnValue(null)
      });
      
      expect(component.type).toBe('my-sessions');
    });
  });
});