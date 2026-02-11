import 'zone.js';          
import 'zone.js/testing';  

import 'zone.js';
import 'zone.js/testing';

/* mentor-directory.page.spec.ts */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MentorDirectoryPage } from './mentor-directory.page';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs'; 
import { NO_ERRORS_SCHEMA } from '@angular/core';
// Import dependencies needed for the component file (even if not used in test)
import * as _ from 'lodash'; 
import { IonContent } from '@ionic/angular';

// import service tokens exactly as used in your component
import { HttpService, LoaderService, ToastService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { LocalStorageService } from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';
import { TranslateModule } from '@ngx-translate/core';

// Mock values used in the component file (assuming these constants/keys exist)
const localKeys = { USER_DETAILS: 'user_details' };
const MENTOR_DIR_CARD_FORM = 'mentor_dir_card_form';
const urlConstants = { API_URLS: { MENTORS_DIRECTORY_LIST: 'api/mentors/' } };

jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;

class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockLoaderService {
  startLoader = jasmine.createSpy('startLoader').and.returnValue(Promise.resolve());
  stopLoader = jasmine.createSpy('stopLoader').and.returnValue(Promise.resolve());
}

class MockHttpService {
  get = jasmine.createSpy('get').and.callFake((config) => {
    // default implementation returns an empty page
    return Promise.resolve({
      result: {
        data: [],
        count: 0
      }
    });
  });
}

class MockToastService {
  show = jasmine.createSpy('show');
}

class MockFormService {
  getForm = jasmine.createSpy('getForm').and.callFake((formName) => {
    return Promise.resolve({ data: { fields: { controls: [] } } });
  });
}

class MockLocalStorageService {
  getLocalData = jasmine.createSpy('getLocalData').and.callFake((key) => {
    // return a user object
    return Promise.resolve({ id: 42, name: 'current-user' });
  });
}

describe('MentorDirectoryPage', () => {
  let component: MentorDirectoryPage;
  let fixture: ComponentFixture<MentorDirectoryPage>;
  let router: MockRouter;
  let loaderService: MockLoaderService;
  let httpService: MockHttpService;
  let toastService: MockToastService;
  let formService: MockFormService;
  let localStorage: MockLocalStorageService;

  beforeEach(waitForAsync(async () => {
    router = new MockRouter();
    loaderService = new MockLoaderService();
    httpService = new MockHttpService();
    toastService = new MockToastService();
    formService = new MockFormService();
    localStorage = new MockLocalStorageService();

    await TestBed.configureTestingModule({

      imports: [
        TranslateModule.forRoot({
        })
      ],
      declarations: [MentorDirectoryPage],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ button_config: [{ id: 'btn1', label: 'Connect' }] }),
            snapshot: { queryParams: {} }
          }
        },
        { provide: LoaderService, useValue: loaderService },
        { provide: HttpService, useValue: httpService },
        { provide: ToastService, useValue: toastService },
        { provide: FormService, useValue: formService },
        { provide: LocalStorageService, useValue: localStorage },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MentorDirectoryPage);
    component = fixture.componentInstance;

    // stub IonContent ViewChild so scrollToTop won't throw
    (component as any).content = { scrollToTop: jasmine.createSpy('scrollToTop') } as any;

    // ensure template-bound properties are initialized before change detection
    component.buttonConfig = [{ id: 'btn1', label: 'Connect' }];
    component.searchText = '';
    component.mentorForm = {};
    component.mentors = [];
    component.loading = false; // Reset loading state

    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should read button_config from route data', () => {
    component.ngOnInit();
    expect(component.buttonConfig).toBeDefined();
    expect(Array.isArray(component.buttonConfig)).toBeTrue();
    expect(component.buttonConfig.length).toBeGreaterThan(0);
  });
  
  // --- BRANCH COVERAGE: ionViewWillEnter 'this.loading' check ---
  it('ionViewWillEnter should skip initialization and only scroll if this.loading is true', async () => {
    spyOn(component, 'getMentors').and.returnValue(Promise.resolve());
    component.loading = true; // Set state to hit the branch
    (component as any).content = { scrollToTop: jasmine.createSpy('scrollToTop') } as any;

    await component.ionViewWillEnter();

    expect((component as any).content.scrollToTop).toHaveBeenCalled();
    expect(localStorage.getLocalData).not.toHaveBeenCalled();
    expect(component.getMentors).not.toHaveBeenCalled();
  });

  it('ionViewWillEnter should fetch user, form, initialize and call getMentors and gotToTop (Success Path)', async () => {
    spyOn(component, 'getMentors').and.returnValue(Promise.resolve());
    (component as any).content = { scrollToTop: jasmine.createSpy('scrollToTop') } as any;
    component.loading = false; // Ensure it proceeds

    await component.ionViewWillEnter();

    expect(component.loading).toBeTrue(); // Should set loading = true at start
    expect(localStorage.getLocalData).toHaveBeenCalledWith(localKeys.USER_DETAILS);
    expect(formService.getForm).toHaveBeenCalledWith(MENTOR_DIR_CARD_FORM);
    expect(component.currentUserId).toBe(42);
    expect(component.page).toBe(1);
    expect(component.mentors).toEqual([]);
    expect(component.isInfiniteScrollDisabled).toBeFalse();
    expect(component.getMentors).toHaveBeenCalled();
    expect((component as any).content.scrollToTop).toHaveBeenCalled();
  });

  it('ionViewWillEnter should handle localStorage error gracefully', async () => {
    (localStorage.getLocalData as jasmine.Spy).and.returnValue(Promise.reject(new Error('User Fetch Fail')));
    spyOn(component, 'getMentors').and.returnValue(Promise.resolve());
    component.loading = false;

    await component.ionViewWillEnter();

    expect(localStorage.getLocalData).toHaveBeenCalled();
    // currentUserId will be undefined/null, but execution continues
    expect(component.getMentors).toHaveBeenCalled();
  });
  
  // --- BRANCH COVERAGE: getMentors when showLoader is FALSE ---
  it('getMentors should NOT call startLoader/stopLoader when showLoader is false', async () => {
    const mockData = { result: { data: [{ values: [{ id: 1 }] }], count: 1 } };
    (httpService.get as jasmine.Spy).and.returnValue(Promise.resolve(mockData));

    await component.getMentors(false, false); // showLoader=false

    expect(loaderService.startLoader).not.toHaveBeenCalled();
    expect(loaderService.stopLoader).not.toHaveBeenCalled();
    expect(component.isLoaded).toBeTrue();
  });
  
  // --- BRANCH COVERAGE: getMentors when isLoadMore is FALSE (Initial Load / Refresh) ---
  it('getMentors should REPLACE mentors and set mentorsCount when isLoadMore is false', async () => {
    component.mentors = [{ values: [{ id: 99 }] }]; // existing data
    const mockData = { result: { data: [{ values: [{ id: 1 }] }], count: 5 } };
    (httpService.get as jasmine.Spy).and.returnValue(Promise.resolve(mockData));

    await component.getMentors(false, false); // isLoadMore=false

    expect(component.mentors.length).toBe(1); // Replaced, not appended
    expect(component.mentorsCount).toBe(5); // Should set the count
    expect(component.isInfiniteScrollDisabled).toBeFalse(); // 1 < 5
  });

  // --- BRANCH COVERAGE: getMentors when total values < count (Infinite Scroll NOT Disabled) ---
  it('getMentors should NOT disable infinite scroll when total values < count', async () => {
    // totalValues = 2, count = 5 -> isInfiniteScrollDisabled false
    const mockData = {
      result: {
        data: [{ values: [{ id: 1 }, { id: 2 }] }],
        count: 5 
      }
    };
    (httpService.get as jasmine.Spy).and.returnValue(Promise.resolve(mockData));

    await component.getMentors(true, false);

    expect(component.isInfiniteScrollDisabled).toBeFalse();
  });
  
  // --- BRANCH COVERAGE: getMentors when total values == count (Infinite Scroll Disabled) ---
  it('getMentors should disable infinite scroll when total values == count', async () => {
    // totalValues = 2, count = 2 -> isInfiniteScrollDisabled true
    const mockData = {
      result: {
        data: [{ values: [{ id: 1 }, { id: 2 }] }],
        count: 2
      }
    };
    (httpService.get as jasmine.Spy).and.returnValue(Promise.resolve(mockData));

    await component.getMentors(true, false);

    expect(component.isInfiniteScrollDisabled).toBeTrue();
  });

  // --- BRANCH COVERAGE: getMentors when data array is empty (Infinite Scroll Disabled) ---
  it('getMentors should disable infinite scroll when returned data array is empty', async () => {
    // data.result.data.length === 0 -> isInfiniteScrollDisabled true
    const mockData = {
      result: {
        data: [], 
        count: 10
      }
    };
    (httpService.get as jasmine.Spy).and.returnValue(Promise.resolve(mockData));
    
    await component.getMentors(true, false);

    expect(component.isInfiniteScrollDisabled).toBeTrue();
    expect(component.mentors.length).toBe(0);
  });
  
  // --- BRANCH COVERAGE: getMentors buttonConfig mapping for currentUserId ---
  it('getMentors should hide buttons for current user and show for others', async () => {
    const mockData = {
      result: {
        data: [{ values: [{ id: 42, name: 'Current User' }, { id: 99, name: 'Other User' }] }],
        count: 2
      }
    };
    (httpService.get as jasmine.Spy).and.returnValue(Promise.resolve(mockData));
    component.currentUserId = 42;
    component.buttonConfig = [{ id: 'btn', label: 'Test' }];

    await component.getMentors(false, false);

    const currentUser = component.mentors[0].values.find(m => m.id === 42);
    const otherUser = component.mentors[0].values.find(m => m.id === 99);

    // Current User: button should have isHide: true
    expect(currentUser.buttonConfig.some(b => b.isHide)).toBeTrue();
    
    // Other User: button should NOT have isHide: true (default behavior)
    expect(otherUser.buttonConfig.every(b => b.isHide !== true)).toBeTrue();
  });


  it('getMentors should append mentors on load more', async () => {
    const first = { result: { data: [{ values: [{ id: 1 }] }], count: 2 } };
    const second = { result: { data: [{ values: [{ id: 2 }] }], count: 2 } };
    (httpService.get as jasmine.Spy).and.returnValues(Promise.resolve(first), Promise.resolve(second));

    // initial fetch
    await component.getMentors(false, false);
    expect(component.mentors.length).toBe(1);

    // load more (isLoadMore true)
    await component.getMentors(false, true);
    expect(component.mentors.length).toBe(2);
    expect(component.mentors.some(g => g.values.some(m => m.id === 2))).toBeTrue();
  });

  // --- BRANCH COVERAGE: getMentors Error Handling ---
  it('getMentors should handle error, set isLoaded and disable scroll', async () => {
    (httpService.get as jasmine.Spy).and.returnValue(Promise.reject(new Error('boom')));
    
    // Initial load error (showLoader=true)
    await component.getMentors(true, false);

    expect(loaderService.startLoader).toHaveBeenCalled();
    expect(loaderService.stopLoader).toHaveBeenCalled();
    expect(component.isLoaded).toBeTrue();
    expect(component.isInfiniteScrollDisabled).toBeTrue();
    
    // Load more error (showLoader=false)
    (httpService.get as jasmine.Spy).and.returnValue(Promise.reject(new Error('boom')));
    component.isLoaded = false;
    component.isInfiniteScrollDisabled = false;
    await component.getMentors(false, true);
    
    expect(loaderService.startLoader.calls.count()).toBe(1); // Only called once in the first block
    expect(component.isLoaded).toBeTrue();
    expect(component.isInfiniteScrollDisabled).toBeTrue();
  });


  it('eventAction should navigate for cardSelect', () => {
    component.eventAction({ type: 'cardSelect', data: { id: 11 } } as any);
    expect(router.navigate).toHaveBeenCalledWith([CommonRoutes.MENTOR_DETAILS, 11]);
  });

  it('eventAction should navigate for chat', () => {
    component.eventAction({ type: 'chat', data: { id: 22 } } as any);
    expect(router.navigate).toHaveBeenCalledWith([CommonRoutes.CHAT_REQ, { id: 22 }], { queryParams: { id: 22 } });
  });

  it('eventAction should navigate for requestSession', () => {
    component.eventAction({ type: 'requestSession', data: 33 } as any);
    expect(router.navigate).toHaveBeenCalledWith([CommonRoutes.SESSION_REQUEST], { queryParams: { data: 33 } });
  });

  // --- BRANCH COVERAGE: eventAction default case (unmatched type) ---
  it('eventAction should do nothing for an unknown type (default case)', () => {
    const initialCalls = router.navigate.calls.count();
    component.eventAction({ type: 'unknownAction', data: {} } as any);
    expect(router.navigate.calls.count()).toBe(initialCalls); 
  });

  it('loadMore should increment page, call getMentors and complete event when not disabled', async () => {
    const mockEvent: any = { target: { complete: jasmine.createSpy('complete') } };
    spyOn(component, 'getMentors').and.returnValue(Promise.resolve());

    component.data = { result: { data: [{ values: [] }] } }; // ensures this.data is true
    component.isInfiniteScrollDisabled = false;
    component.page = 1;

    await component.loadMore(mockEvent);

    expect(component.page).toBe(2);
    expect(component.getMentors).toHaveBeenCalledWith(false, true); 
    expect(mockEvent.target.complete).toHaveBeenCalled();
  });

  // --- BRANCH COVERAGE: loadMore when disabled ---
  it('loadMore should NOT increment page or call getMentors if data is missing or infinite scroll is disabled', async () => {
    const mockEvent: any = { target: { complete: jasmine.createSpy('complete') } };
    spyOn(component, 'getMentors').and.returnValue(Promise.resolve());

    // Case 1: Infinite Scroll Disabled
    component.isInfiniteScrollDisabled = true;
    component.data = {};
    component.page = 1;
    await component.loadMore(mockEvent);
    expect(component.page).toBe(1);

    // Case 2: Data is missing (component.data is falsy)
    component.isInfiniteScrollDisabled = false;
    component.data = undefined;
    await component.loadMore(mockEvent);
    expect(component.page).toBe(1);
    
    expect(component.getMentors).not.toHaveBeenCalled();
    expect(mockEvent.target.complete).toHaveBeenCalledTimes(2); // Should complete event in both cases
  });


  it('onSearch should navigate to mentor search directory with query param', () => {
    component.searchText = 'hello';
    component.onSearch();
    expect(router.navigate).toHaveBeenCalledWith(['/' + CommonRoutes.MENTOR_SEARCH_DIRECTORY], {
      queryParams: { search: 'hello' }
    });
  });

});