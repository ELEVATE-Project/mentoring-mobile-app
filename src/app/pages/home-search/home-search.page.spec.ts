import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { HomeSearchPage } from './home-search.page';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { SessionService } from 'src/app/core/services/session/session.service';
import { LocalStorageService, ToastService, UtilService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { FormService } from 'src/app/core/services/form/form.service';
import { of, BehaviorSubject, Subscription } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { environment } from 'src/environments/environment';

describe('HomeSearchPage', () => {
  let component: HomeSearchPage;
  let fixture: ComponentFixture<HomeSearchPage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockLocation: jasmine.SpyObj<Location>;
  let mockModalCtrl: jasmine.SpyObj<ModalController>;
  let mockSessionService: jasmine.SpyObj<SessionService>;
  let mockLocalStorage: jasmine.SpyObj<LocalStorageService>;
  let mockToast: jasmine.SpyObj<ToastService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockFormService: jasmine.SpyObj<FormService>;
  let mockUtilService: any;

  const mockSearchTextSubject = new BehaviorSubject<string>('');
  const mockCriteriaChipSubject = new BehaviorSubject<string>('');

  const mockPlatformConfig = {
    result: {
      search_config: {
        search: {
          session: {
            fields: [
              { name: 'title', label: 'Title' },
              { name: 'category', label: 'Category' }
            ]
          }
        }
      }
    }
  };

  const mockSessionListResponse = {
    result: {
      data: [{ id: '1', title: 'Test Session' }],
      count: 1
    }
  };

  beforeEach(waitForAsync(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      snapshot: {
        queryParams: {}
      }
    };
    mockLocation = jasmine.createSpyObj('Location', ['back']);
    mockModalCtrl = jasmine.createSpyObj('ModalController', ['create']);
    mockSessionService = jasmine.createSpyObj('SessionService', [
      'getSessionsList',
      'joinSession',
      'enrollSession',
      'startSession',
      'getAllSessionsAPI'
    ]);
    mockLocalStorage = jasmine.createSpyObj('LocalStorageService', ['getLocalData']);
    mockToast = jasmine.createSpyObj('ToastService', ['showToast']);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['upDateProfilePopup']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['getPlatformConfig']);
    mockFormService = jasmine.createSpyObj('FormService', ['filterList']);
    mockUtilService = {
      currentSearchText: mockSearchTextSubject.asObservable(),
      currentCriteriaChip: mockCriteriaChipSubject.asObservable(),
      subscribeSearchText: jasmine.createSpy('subscribeSearchText'),
      subscribeCriteriaChip: jasmine.createSpy('subscribeCriteriaChip'),
      transformToFilterData: jasmine.createSpy('transformToFilterData').and.returnValue(Promise.resolve([]))
    };

    TestBed.configureTestingModule({
      declarations: [HomeSearchPage],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: Location, useValue: mockLocation },
        { provide: ModalController, useValue: mockModalCtrl },
        { provide: SessionService, useValue: mockSessionService },
        { provide: LocalStorageService, useValue: mockLocalStorage },
        { provide: ToastService, useValue: mockToast },
        { provide: ProfileService, useValue: mockProfileService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: FormService, useValue: mockFormService },
        { provide: UtilService, useValue: mockUtilService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeSearchPage);
    component = fixture.componentInstance;
    
    // Initialize subscriptions to empty subscriptions to prevent ngOnDestroy errors
    component.searchTextSubscription = new Subscription();
    component.criteriaChipSubscription = new Subscription();
    
    // Default mock returns
    mockPermissionService.getPlatformConfig.and.returnValue(Promise.resolve(mockPlatformConfig));
    mockSessionService.getSessionsList.and.returnValue(Promise.resolve(mockSessionListResponse));
    mockFormService.filterList.and.returnValue(Promise.resolve([]));
  }));

  afterEach(() => {
    fixture.destroy();
    mockSearchTextSubject.next('');
    mockCriteriaChipSubject.next('');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      mockLocalStorage.getLocalData.calls.reset();
    });

    it('should initialize searchAndCriterias', async () => {
      mockLocalStorage.getLocalData.and.returnValues(
        Promise.resolve({ about: 'test' }),      // First call for USER_DETAILS
        Promise.resolve(['user'])                // Second call for USER_ROLES
      );
      
      await component.ngOnInit();
      expect(component.searchAndCriterias).toEqual({
        headerData: {
          searchText: '',
          criterias: {
            name: undefined,
            label: undefined
          }
        }
      });
    });

    it('should subscribe to search text changes', async () => {
      mockLocalStorage.getLocalData.and.returnValues(
        Promise.resolve({ about: 'test' }),
        Promise.resolve(['user'])
      );
      
      await component.ngOnInit();
      mockSearchTextSubject.next('test search');
      expect(component.searchText).toBe('test search');
    });

    it('should subscribe to criteria chip changes', fakeAsync(() => {
      mockLocalStorage.getLocalData.and.returnValues(
        Promise.resolve({ about: 'test' }),
        Promise.resolve(['user'])
      );
      
      const testCriteria = { name: 'title', label: 'Title' };
      
      component.ngOnInit();
      tick();
      
      mockCriteriaChipSubject.next(JSON.stringify(testCriteria));
      tick(600);
      
      expect(component.criteriaChip).toEqual(testCriteria);
    }));

    it('should set isMentor to true when user has mentor role', async () => {
      mockLocalStorage.getLocalData.and.returnValues(
        Promise.resolve({ about: 'test' }),
        Promise.resolve(['mentor', 'user'])
      );
      
      await component.ngOnInit();
      expect(component.isMentor).toBe(true);
    });

    it('should set isMentor to false when user does not have mentor role', async () => {
      mockLocalStorage.getLocalData.and.returnValues(
        Promise.resolve({ about: 'test' }),
        Promise.resolve(['user'])
      );
      
      await component.ngOnInit();
      expect(component.isMentor).toBe(false);
    });

    it('should load overlay chips from platform config', async () => {
      mockLocalStorage.getLocalData.and.returnValues(
        Promise.resolve({ about: 'test' }),
        Promise.resolve(['user'])
      );
      
      await component.ngOnInit();
      expect(component.overlayChips).toBeDefined();
      expect(component.overlayChips.length).toBe(2);
    });
  });

  describe('ionViewWillEnter', () => {
    beforeEach(() => {
      component.searchAndCriterias = {
        headerData: {
          searchText: '',
          criterias: {
            name: undefined,
            label: undefined
          }
        }
      };
      component.overlayChips = mockPlatformConfig.result.search_config.search.session.fields;
    });

    it('should load search text from query params', async () => {
      mockActivatedRoute.snapshot.queryParams = { search: 'test query' };
      await component.ionViewWillEnter();
      expect(component.searchText).toBe('test query');
      expect(component.searchAndCriterias.headerData.searchText).toBe('test query');
    });

    it('should load chip from query params and match with overlayChips', async () => {
      mockActivatedRoute.snapshot.queryParams = { 
        search: 'test', 
        chip: 'title' 
      };
      await component.ionViewWillEnter();
      expect(component.criteriaChip).toEqual({ name: 'title', label: 'Title' });
      expect(component.showSelectedCriteria).toEqual({ name: 'title', label: 'Title' });
    });

    it('should call fetchSessionList', async () => {
      spyOn(component, 'fetchSessionList');
      await component.ionViewWillEnter();
      expect(component.fetchSessionList).toHaveBeenCalled();
    });

    it('should load filter data', async () => {
      await component.ionViewWillEnter();
      expect(mockFormService.filterList).toHaveBeenCalledWith({
        filterType: 'session',
        org: false
      });
    });
  });

  describe('search', () => {
    beforeEach(() => {
      component.searchAndCriterias = {
        headerData: {
          searchText: '',
          criterias: undefined
        }
      };
    });

    it('should update search parameters and navigate', () => {
      const event = {
        searchText: 'new search',
        criterias: { name: 'category', label: 'Category' }
      };
      spyOn(component, 'fetchSessionList');
      
      component.search(event);

      expect(component.searchText).toBe('new search');
      expect(component.criteriaChip).toEqual(event.criterias);
      expect(component.isOpen).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalled();
      expect(component.fetchSessionList).toHaveBeenCalled();
    });

    it('should handle search without criterias', () => {
      const event = {
        searchText: 'search only',
        criterias: undefined
      };
      spyOn(component, 'fetchSessionList');
      
      component.search(event);

      expect(component.searchText).toBe('search only');
      expect(component.criteriaChip).toBeUndefined();
    });
  });

  describe('onClearSearch', () => {
    beforeEach(() => {
      component.searchAndCriterias = {
        headerData: {
          searchText: 'test',
          criterias: { name: 'title', label: 'Title' }
        }
      };
    });

    it('should clear search text and criterias', async () => {
      component.searchText = 'test';
      component.page = 5;
      spyOn(component, 'fetchSessionList');

      await component.onClearSearch('');

      expect(component.page).toBe(1);
      expect(component.searchText).toBe('');
      expect(component.searchAndCriterias.headerData.searchText).toBe('');
      expect(component.searchAndCriterias.headerData.criterias).toBeUndefined();
      expect(mockRouter.navigate).toHaveBeenCalled();
      expect(component.fetchSessionList).toHaveBeenCalled();
    });
  });

  describe('onClickFilter', () => {
    it('should open filter modal', async () => {
      const mockModal = {
        present: jasmine.createSpy('present'),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ data: {} })
        )
      };
      mockModalCtrl.create.and.returnValue(Promise.resolve(mockModal as any));

      await component.onClickFilter();

      expect(mockModalCtrl.create).toHaveBeenCalled();
      expect(mockModal.present).toHaveBeenCalled();
    });

    it('should handle modal dismiss with closed role', async () => {
      const mockModal = {
        present: jasmine.createSpy('present'),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ 
            data: { 
              role: 'closed', 
              data: { filters: [] } 
            } 
          })
        )
      };
      mockModalCtrl.create.and.returnValue(Promise.resolve(mockModal as any));

      await component.onClickFilter();

      expect(component.filterData).toBeDefined();
    });

    it('should handle modal dismiss with filter data', async () => {
      spyOn(component, 'extractLabels');
      spyOn(component, 'getUrlQueryData');
      spyOn(component, 'fetchSessionList');

      const mockModal = {
        present: jasmine.createSpy('present'),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({
            data: {
              data: {
                selectedFilters: {
                  category: [{ value: 'tech', label: 'Technology' }]
                }
              }
            }
          })
        )
      };
      mockModalCtrl.create.and.returnValue(Promise.resolve(mockModal as any));

      await component.onClickFilter();

      expect(component.extractLabels).toHaveBeenCalled();
      expect(component.getUrlQueryData).toHaveBeenCalled();
      expect(component.fetchSessionList).toHaveBeenCalled();
      expect(component.page).toBe(1);
      expect(component.setPaginatorToFirstpage).toBe(true);
      expect(component.filteredDatas['category']).toBe('tech');
    });

    it('should clear filters when empty data returned', async () => {
      const mockModal = {
        present: jasmine.createSpy('present'),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ data: {} })
        )
      };
      mockModalCtrl.create.and.returnValue(Promise.resolve(mockModal as any));

      await component.onClickFilter();

      expect(component.chips).toEqual([]);
      expect(component.filteredDatas).toEqual([]);
      expect(component.urlQueryData).toBeNull();
    });
  });

  describe('fetchSessionList', () => {
    it('should fetch sessions successfully', async () => {
      await component.fetchSessionList();

      expect(mockSessionService.getSessionsList).toHaveBeenCalled();
      expect(component.results.length).toBe(1);
      expect(component.totalCount).toBe(1);
      expect(component.filterIcon).toBe(true);
    });

    it('should set filterIcon to false when no data and no filters', async () => {
      mockSessionService.getSessionsList.and.returnValue(
        Promise.resolve({
          result: {
            data: [],
            count: 0
          }
        })
      );
      component.filteredDatas = [];
      component.criteriaChip = undefined;

      await component.fetchSessionList();

      expect(component.filterIcon).toBe(false);
    });

    it('should set correct noDataMessage based on search text', async () => {
      component.searchText = 'test';
      await component.fetchSessionList();
      expect(component.noDataMessage).toBe('SEARCH_RESULT_NOT_FOUND');

      component.searchText = '';
      await component.fetchSessionList();
      expect(component.noDataMessage).toBe('THIS_SPACE_LOOKS_EMPTY');
    });
  });

  describe('onPageChange', () => {
    it('should update page and fetch sessions', () => {
      spyOn(component, 'fetchSessionList');
      const event = { page: 2, pageSize: 10 };

      component.onPageChange(event);

      expect(component.page).toBe(2);
      expect(component.pageSize).toBe(10);
      expect(component.fetchSessionList).toHaveBeenCalled();
    });
  });

  describe('eventAction', () => {
    beforeEach(() => {
      mockLocalStorage.getLocalData.calls.reset();
    });

    it('should navigate to session details on cardSelect', async () => {
      mockLocalStorage.getLocalData.and.returnValue(Promise.resolve({ about: 'test user' }));
      const event = { type: 'cardSelect', data: { id: '123' } };
      
      await component.eventAction(event);
      
      expect(mockRouter.navigate).toHaveBeenCalled();
    });

    it('should join session on joinAction', async () => {
      mockLocalStorage.getLocalData.and.returnValue(Promise.resolve({ about: 'test user' }));
      mockSessionService.joinSession.and.returnValue(Promise.resolve(null));
      spyOn(component, 'fetchSessionList');
      const event = { type: 'joinAction', data: { id: '123' } };

      await component.eventAction(event);

      expect(mockSessionService.joinSession).toHaveBeenCalledWith(event.data);
      expect(component.fetchSessionList).toHaveBeenCalled();
    });

    it('should enroll in session on enrollAction', async () => {
      mockLocalStorage.getLocalData.and.returnValue(Promise.resolve({ about: 'test user' }));
      mockSessionService.enrollSession.and.returnValue(
        Promise.resolve({ result: true, message: 'Enrolled successfully' })
      );
      spyOn(component, 'fetchSessionList');
      const event = { type: 'enrollAction', data: { id: '123' } };

      await component.eventAction(event);

      expect(mockSessionService.enrollSession).toHaveBeenCalledWith('123');
      expect(mockToast.showToast).toHaveBeenCalledWith('Enrolled successfully', 'success');
      expect(component.fetchSessionList).toHaveBeenCalled();
    });

    it('should start session on startAction for mentor', async () => {
      mockLocalStorage.getLocalData.and.returnValue(Promise.resolve({ about: 'test user' }));
      component.isMentor = true;
      mockSessionService.startSession.and.returnValue(Promise.resolve(true));
      mockSessionService.getAllSessionsAPI.and.returnValue(Promise.resolve([]));
      const event = { type: 'startAction', data: { id: '123' } };

      await component.eventAction(event);

      expect(mockSessionService.startSession).toHaveBeenCalledWith('123');
      expect(mockSessionService.getAllSessionsAPI).toHaveBeenCalled();
    });

   it('should show profile popup when user has no about section', async () => {
      // Temporarily set isAuthBypassed to false to test profile popup logic
      const originalIsAuthBypassed = environment['isAuthBypassed'];
      environment['isAuthBypassed'] = false;
      
      // Mock user without about section
      mockLocalStorage.getLocalData.and.returnValue(Promise.resolve({ about: '' }));
      
      const event = { type: 'cardSelect', data: { id: '123' } };

      await component.eventAction(event);

      expect(mockProfileService.upDateProfilePopup).toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      
      // Restore original value
      environment['isAuthBypassed'] = originalIsAuthBypassed;
    });
  });

  describe('locationBack', () => {
    it('should call location.back()', () => {
      component.locationBack();
      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  describe('extractLabels', () => {
    it('should extract labels from filter data', () => {
      const data = {
        category: [{ value: 'tech', label: 'Technology' }],
        level: [{ value: 'beginner', label: 'Beginner' }]
      };

      component.extractLabels(data);

      expect(component.chips.length).toBe(2);
      expect(component.chips).toContain(data.category[0]);
      expect(component.chips).toContain(data.level[0]);
    });

    it('should clear existing chips before extracting', () => {
      component.chips = [{ value: 'old', label: 'Old' }];
      const data = {
        category: [{ value: 'tech', label: 'Technology' }]
      };

      component.extractLabels(data);

      expect(component.chips.length).toBe(1);
      expect(component.chips[0]).toEqual(data.category[0]);
    });
  });

  describe('getUrlQueryData', () => {
    it('should generate URL query string from filtered data', () => {
      component.filteredDatas = [];
      component.filteredDatas['category'] = 'tech,science';
      component.filteredDatas['level'] = 'beginner';

      component.getUrlQueryData();

      expect(component.urlQueryData).toContain('category=tech,science');
      expect(component.urlQueryData).toContain('level=beginner');
    });

    it('should handle empty filtered data', () => {
      component.filteredDatas = [];

      component.getUrlQueryData();

      expect(component.urlQueryData).toBe('');
    });
  });

  describe('removeFilteredData', () => {
    it('should remove chip from filter data', () => {
      component.filterData = [{
        options: [
          { value: 'tech', selected: true },
          { value: 'science', selected: true }
        ]
      }];
      component.filteredDatas = [];
      component.filteredDatas['category'] = 'tech,science';

      component.removeFilteredData('tech');

      expect(component.filterData[0].options[0].selected).toBe(false);
      expect(component.filteredDatas['category']).toBe('science');
    });

    it('should delete key when removing last value', () => {
      component.filterData = [{
        options: [{ value: 'tech', selected: true }]
      }];
      component.filteredDatas = [];
      component.filteredDatas['category'] = 'tech';

      component.removeFilteredData('tech');

      expect(component.filteredDatas['category']).toBeUndefined();
    });

    it('should handle multiple keys in filteredDatas', () => {
      component.filterData = [{
        options: [
          { value: 'tech', selected: true },
          { value: 'beginner', selected: true }
        ]
      }];
      component.filteredDatas = [];
      component.filteredDatas['category'] = 'tech,science';
      component.filteredDatas['level'] = 'beginner';

      component.removeFilteredData('beginner');

      expect(component.filteredDatas['category']).toBe('tech,science');
      expect(component.filteredDatas['level']).toBeUndefined();
    });
  });

  describe('removeChip', () => {
    it('should remove chip and update filters', () => {
      component.chips = [
        { value: 'tech', label: 'Technology' },
        { value: 'science', label: 'Science' }
      ];
      spyOn(component, 'removeFilteredData');
      spyOn(component, 'getUrlQueryData');
      spyOn(component, 'fetchSessionList');

      const event = { index: 0, chipValue: 'tech' };
      component.removeChip(event);

      expect(component.chips.length).toBe(1);
      expect(component.removeFilteredData).toHaveBeenCalledWith('tech');
      expect(component.getUrlQueryData).toHaveBeenCalled();
      expect(component.fetchSessionList).toHaveBeenCalled();
    });
  });

  describe('eventHandler', () => {
    it('should update criteria chip', () => {
      const newCriteria = 'test criteria';
      component.eventHandler(newCriteria);
      expect(component.criteriaChip).toBe(newCriteria);
    });
  });

  describe('ionViewDidLeave', () => {
    it('should clear all search data', () => {
      component.showSelectedCriteria = 'test';
      component.searchText = 'test';
      component.criteriaChip = 'test';
      component.chips = [{ value: 'test', label: 'Test' }];
      component.urlQueryData = 'test=data';

      component.ionViewDidLeave();

      expect(component.showSelectedCriteria).toBe('');
      expect(component.searchText).toBe('');
      expect(component.criteriaChip).toBe('');
      expect(component.chips).toEqual([]);
      expect(component.urlQueryData).toBeNull();
      expect(mockUtilService.subscribeSearchText).toHaveBeenCalledWith('');
      expect(mockUtilService.subscribeCriteriaChip).toHaveBeenCalledWith('');
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from all subscriptions', async () => {
      mockLocalStorage.getLocalData.and.returnValues(
        Promise.resolve({ about: 'test' }),
        Promise.resolve(['user'])
      );
      
      await component.ngOnInit();
      
      expect(component.searchTextSubscription).toBeDefined();
      expect(component.criteriaChipSubscription).toBeDefined();
      
      spyOn(component.searchTextSubscription, 'unsubscribe').and.callThrough();
      spyOn(component.criteriaChipSubscription, 'unsubscribe').and.callThrough();

      component.ngOnDestroy();

      expect(component.searchTextSubscription.unsubscribe).toHaveBeenCalled();
      expect(component.criteriaChipSubscription.unsubscribe).toHaveBeenCalled();
    });
  });
});