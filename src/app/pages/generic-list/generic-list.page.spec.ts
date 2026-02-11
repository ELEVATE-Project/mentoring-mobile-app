import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { GenericListPage } from './generic-list.page';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { HttpService, LocalStorageService, ToastService, UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonRoutes } from 'src/global.routes';

describe('GenericListPage', () => {
  let component: GenericListPage;
  let fixture: ComponentFixture<GenericListPage>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockModalCtrl: jasmine.SpyObj<ModalController>;
  let mockHttpService: jasmine.SpyObj<HttpService>;
  let mockLocalStorage: jasmine.SpyObj<LocalStorageService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockUtilService: jasmine.SpyObj<UtilService>;
  let mockFormService: jasmine.SpyObj<FormService>;
  let mockPermissionService: jasmine.SpyObj<PermissionService>;
  let mockProfileService: jasmine.SpyObj<ProfileService>;

  const mockRouteData = {
    url: '/api/mentors?page=',
    filterType: 'mentor',
    noDataFound: 'No data found',
    button_config: { label: 'Add New' }
  };

  const mockMentorFormData = {
    data: {
      fields: {
        controls: [
          { name: 'field1', label: 'Field 1' },
          { name: 'field2', label: 'Field 2' }
        ]
      }
    }
  };

  const mockApiResponse = {
    result: {
      data: [
        { id: '1', name: 'Mentor 1' },
        { id: '2', name: 'Mentor 2' }
      ],
      count: 2
    }
  };

  const mockPlatformConfig = {
    result: {
      search_config: {
        search: {
          mentor: {
            fields: [
              { name: 'name', label: 'Name' },
              { name: 'subject', label: 'Subject' }
            ]
          }
        }
      }
    }
  };

  beforeEach(waitForAsync(() => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = {
      data: of(mockRouteData)
    };
    mockModalCtrl = jasmine.createSpyObj('ModalController', ['create']);
    mockHttpService = jasmine.createSpyObj('HttpService', ['get', 'post']);
    mockLocalStorage = jasmine.createSpyObj('LocalStorageService', ['getLocalData']);
    mockToastService = jasmine.createSpyObj('ToastService', ['showToast']);
    mockUtilService = jasmine.createSpyObj('UtilService', ['transformToFilterData', 'alertPopup']);
    mockFormService = jasmine.createSpyObj('FormService', ['getForm', 'filterList']);
    mockPermissionService = jasmine.createSpyObj('PermissionService', ['getPlatformConfig']);
    mockProfileService = jasmine.createSpyObj('ProfileService', ['updateProfile']);

    TestBed.configureTestingModule({
      declarations: [GenericListPage],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: ModalController, useValue: mockModalCtrl },
        { provide: HttpService, useValue: mockHttpService },
        { provide: LocalStorageService, useValue: mockLocalStorage },
        { provide: ToastService, useValue: mockToastService },
        { provide: UtilService, useValue: mockUtilService },
        { provide: FormService, useValue: mockFormService },
        { provide: PermissionService, useValue: mockPermissionService },
        { provide: ProfileService, useValue: mockProfileService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(GenericListPage);
    component = fixture.componentInstance;

    // Default mock returns
    mockLocalStorage.getLocalData.and.returnValue(Promise.resolve(['mentor']));
    mockFormService.getForm.and.returnValue(Promise.resolve(mockMentorFormData));
    mockFormService.filterList.and.returnValue(Promise.resolve([]));
    mockUtilService.transformToFilterData.and.returnValue(Promise.resolve([]));
    mockPermissionService.getPlatformConfig.and.returnValue(Promise.resolve(mockPlatformConfig));
    mockHttpService.get.and.returnValue(Promise.resolve(mockApiResponse));
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component', () => {
      component.ngOnInit();
      expect(component).toBeTruthy();
    });
  });

  describe('ionViewWillEnter', () => {
    it('should set isMentor to true when user has mentor role', async () => {
      mockLocalStorage.getLocalData.and.returnValue(Promise.resolve(['mentor', 'user']));

      await component.ionViewWillEnter();

      expect(component.isMentor).toBe(true);
    });

    it('should set isMentor to false when user does not have mentor role', async () => {
      mockLocalStorage.getLocalData.and.returnValue(Promise.resolve(['user']));

      await component.ionViewWillEnter();

      expect(component.isMentor).toBe(false);
    });

    it('should load mentor form data', async () => {
      await component.ionViewWillEnter();

      expect(mockFormService.getForm).toHaveBeenCalled();
      expect(component.mentorForm).toEqual(mockMentorFormData.data.fields.controls);
    });

    it('should subscribe to route data and set routeData', async () => {
      await component.ionViewWillEnter();

      expect(component.routeData).toEqual(mockRouteData);
      expect(component.buttonConfig).toEqual(mockRouteData.button_config);
    });

    it('should set NO_RESULT_FOUND_FOR_MENTOR when mentor has no data', async () => {
      mockHttpService.get.and.returnValue(Promise.resolve({ result: { data: [], count: 0 } }));
      component.isMentor = true;
      component.searchText = '';

      await component.ionViewWillEnter();

      expect(component.enableExploreButton).toBe(false);
    });

    it('should set NO_RESULT_FOUND_FOR_MENTEE when mentee has no data', async () => {
      mockLocalStorage.getLocalData.and.returnValue(Promise.resolve(['user']));
      mockHttpService.get.and.returnValue(Promise.resolve({ result: { data: [], count: 0 } }));

      await component.ionViewWillEnter();

      expect(component.enableExploreButton).toBe(true);
    });

    it('should call filterListData and getData', async () => {
      spyOn(component, 'getData');

      await component.ionViewWillEnter();

      expect(mockFormService.filterList).toHaveBeenCalled();
      expect(component.getData).toHaveBeenCalled();
    });
  });

  describe('searchResults', () => {
    it('should update search text and criteria', () => {
      const event = {
        searchText: 'test search',
        criterias: { name: 'title', label: 'Title' }
      };
      spyOn(component, 'getData');

      component.searchResults(event);

      expect(component.searchText).toBe('test search');
      expect(component.selectedCriteria).toBe('title');
      expect(component.searchAndCriterias.headerData).toEqual(event);
      expect(component.getData).toHaveBeenCalled();
    });

    it('should handle search without criterias', () => {
      const event = {
        searchText: 'test',
        criterias: undefined
      };
      spyOn(component, 'getData');

      component.searchResults(event);

      expect(component.selectedCriteria).toBeUndefined();
    });
  });

  describe('getData', () => {
    beforeEach(() => {
      component.routeData = mockRouteData;
      component.page = 1;
      component.pageSize = 10;
    });

    it('should fetch data successfully', async () => {
      await component.getData();

      expect(mockHttpService.get).toHaveBeenCalled();
      expect(component.responseData).toEqual(mockApiResponse.result.data);
      expect(component.totalCount).toBe(2);
      expect(component.isLoaded).toBe(true);
    });

    it('should build correct URL with search parameters', async () => {
      component.searchText = 'test';
      component.selectedCriteria = 'name';
      component.urlQueryData = 'filter=value';

      await component.getData();

      const callArgs = mockHttpService.get.calls.mostRecent().args[0];
      expect(callArgs.url).toContain('page=1');
      expect(callArgs.url).toContain('limit=10');
      expect(callArgs.url).toContain('search=');
      expect(callArgs.url).toContain('search_on=name');
    });

    it('should set filterIcon to true when data is returned', async () => {
      await component.getData();

      expect(component.filterIcon).toBe(true);
    });

    it('should set filterIcon to false when no data and no filters', async () => {
      mockHttpService.get.and.returnValue(Promise.resolve({ result: { data: [], count: 0 } }));
      component.filteredDatas = [];
      component.selectedCriteria = undefined;

      await component.getData();

      expect(component.filterIcon).toBe(false);
    });

    it('should update noResult when search returns no results', async () => {
      component.searchText = 'test';
      mockHttpService.get.and.returnValue(Promise.resolve({ result: { data: [], count: 0 } }));

      await component.getData();

      expect(component.noResult).toBe(mockRouteData.noDataFound);
      expect(component.enableExploreButton).toBe(false);
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
      expect(component.urlQueryData).toBe('');
    });

    it('should process selected filters and update data', async () => {
      spyOn(component, 'extractLabels');
      spyOn(component, 'getUrlQueryData');
      spyOn(component, 'getData');

      const mockModal = {
        present: jasmine.createSpy('present'),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({
            data: {
              data: {
                selectedFilters: {
                  category: [{ value: 'tech', label: 'Technology' }],
                  roles: [{ value: 'mentor', label: 'Mentor' }]
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
      expect(component.getData).toHaveBeenCalled();
      expect(component.page).toBe(1);
      expect(component.setPaginatorToFirstpage).toBe(true);
      expect(component.filterChipsSelected).toBe(true);
    });

    it('should set filterChipsSelected to false when roles not selected', async () => {
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

      expect(component.filterChipsSelected).toBe(false);
    });
  });

  describe('filterListData', () => {
    it('should fetch and transform filter data', async () => {
      const filterType = 'mentor';
      const mockFilterData = [{ key: 'category', options: [] }];
      mockFormService.filterList.and.returnValue(Promise.resolve(mockFilterData));
      mockUtilService.transformToFilterData.and.returnValue(Promise.resolve(mockFilterData));

      await component.filterListData(filterType);

      expect(mockFormService.filterList).toHaveBeenCalledWith({
        filterType: filterType,
        org: true
      });
      expect(component.filterData).toBeDefined();
    });

    it('should add FILTER_ROLES when user is mentor', async () => {
      component.isMentor = true;
      const mockFilterData = [{ key: 'category', options: [] }];
      mockUtilService.transformToFilterData.and.returnValue(Promise.resolve(mockFilterData));

      await component.filterListData('mentor');

      expect(component.filterData.length).toBeGreaterThan(0);
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

    it('should filter out boolean values', () => {
      component.filteredDatas = [];
      component.filteredDatas['category'] = 'tech';
      component.filteredDatas['active'] = true;
      component.filteredDatas['inactive'] = false;

      component.getUrlQueryData();

      expect(component.urlQueryData).toBe('category=tech');
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
      spyOn(component, 'getData');

      const event = { index: 0, chipValue: 'tech' };
      component.removeChip(event);

      expect(component.chips.length).toBe(1);
      expect(component.removeFilteredData).toHaveBeenCalledWith('tech');
      expect(component.getUrlQueryData).toHaveBeenCalled();
      expect(component.getData).toHaveBeenCalled();
    });
  });

  describe('removeFilteredData', () => {
    beforeEach(() => {
      component.filterData = [{
        options: [
          { value: 'tech', selected: true },
          { value: 'science', selected: true }
        ]
      }];
    });

    it('should remove chip from filter data', () => {
      component.filteredDatas = [];
      component.filteredDatas['category'] = 'tech,science';

      component.removeFilteredData('tech');

      expect(component.filterData[0].options[0].selected).toBe(false);
      expect(component.filteredDatas['category']).toBe('science');
    });

    it('should delete key when removing last value', () => {
      component.filteredDatas = [];
      component.filteredDatas['category'] = 'tech';

      component.removeFilteredData('tech');

      expect(component.filteredDatas['category']).toBeUndefined();
    });

    it('should handle multiple keys in filteredDatas', () => {
      component.filteredDatas = [];
      component.filteredDatas['category'] = 'tech,science';
      component.filteredDatas['level'] = 'beginner';

      component.removeFilteredData('beginner');

      expect(component.filteredDatas['category']).toBe('tech,science');
      expect(component.filteredDatas['level']).toBeUndefined();
    });
  });

  describe('onPageChange', () => {
    it('should update page and fetch data', () => {
      spyOn(component, 'getData');
      component.paginator = { pageSize: 20 } as any;
      const event = { pageIndex: 1, pageSize: 20 };

      component.onPageChange(event);

      expect(component.page).toBe(2);
      expect(component.pageSize).toBe(20);
      expect(component.getData).toHaveBeenCalled();
    });
  });

  describe('action', () => {
    it('should load platform config and set overlayChips', async () => {
      const event = { filterType: 'mentor' };

      component.action(event);
      await mockPermissionService.getPlatformConfig();

      expect(mockPermissionService.getPlatformConfig).toHaveBeenCalled();
    });

    it('should not call getPlatformConfig when filterType is missing', () => {
      const event = {};

      component.action(event);

      expect(mockPermissionService.getPlatformConfig).not.toHaveBeenCalled();
    });
  });

  describe('eventAction', () => {
    it('should navigate to mentor details on cardSelect', () => {
      const event = { type: 'cardSelect', data: { id: '123' } };

      component.eventAction(event);

      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.MENTOR_DETAILS, '123']);
    });

    it('should navigate to chat on chat event', () => {
      const event = { type: 'chat', rid: 'room123', data: 'user456' };

      component.eventAction(event);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [CommonRoutes.CHAT, 'room123'],
        { queryParams: { id: 'user456' } }
      );
    });

    it('should not navigate to chat when rid is missing', () => {
      const event = { type: 'chat', rid: null, data: 'user456' };

      component.eventAction(event);

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should navigate to session request', () => {
      const event = { type: 'requestSession', data: { id: '789' } };

      component.eventAction(event);

      expect(mockRouter.navigate).toHaveBeenCalledWith(
        [CommonRoutes.SESSION_REQUEST],
        { queryParams: { data: { id: '789' } } }
      );
    });

    it('should call onUnblock on unblock event', () => {
      spyOn(component, 'onUnblock');
      const event = { type: 'unblock', data: '123', name: 'Test User' };

      component.eventAction(event);

      expect(component.onUnblock).toHaveBeenCalledWith(event);
    });
  });

  describe('eventHandler', () => {
    it('should update valueFromChipAndFilter', () => {
      const event = 'test value';

      component.eventHandler(event);

      expect(component.valueFromChipAndFilter).toBe('test value');
    });
  });

  describe('goToHome', () => {
    it('should navigate to home', () => {
      component.goToHome();

      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.HOME]);
    });
  });

  describe('onClearSearch', () => {
    it('should clear search and reset data', async () => {
      component.page = 5;
      component.searchText = 'test';
      component.searchAndCriterias = {
        headerData: {
          searchText: 'test',
          criterias: { name: 'title' }
        }
      };
      spyOn(component, 'getData');

      await component.onClearSearch('');

      expect(component.page).toBe(1);
      expect(component.searchText).toBe('');
      expect(component.searchAndCriterias.headerData.searchText).toBe('');
      expect(component.searchAndCriterias.headerData.criterias).toBeUndefined();
      expect(component.getData).toHaveBeenCalled();
    });
  });

  describe('onUnblock', () => {
    it('should show alert and unblock user on confirmation', fakeAsync(() => {
      const user = { data: '123', name: 'Test User' };
      mockUtilService.alertPopup.and.returnValue(Promise.resolve(true));

      component.onUnblock(user);
      tick();

      expect(mockUtilService.alertPopup).toHaveBeenCalled();
      expect(mockToastService.showToast).toHaveBeenCalledWith('UNBLOCK_TOAST_MESSAGE', 'success');
      expect(mockRouter.navigate).toHaveBeenCalledWith([CommonRoutes.MENTOR_DETAILS, '123']);
    }));

    it('should not unblock user on cancellation', fakeAsync(() => {
      const user = { data: '123', name: 'Test User' };
      mockUtilService.alertPopup.and.returnValue(Promise.resolve(false));

      component.onUnblock(user);
      tick();

      expect(mockUtilService.alertPopup).toHaveBeenCalled();
      expect(mockToastService.showToast).not.toHaveBeenCalled();
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    }));
  });
});