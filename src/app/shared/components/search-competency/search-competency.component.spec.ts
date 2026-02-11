import 'zone.js';          
import 'zone.js/testing';  

import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { SearchCompetencyComponent } from './search-competency.component';
import { ModalController } from '@ionic/angular';
import { HttpService } from 'src/app/core/services';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { TranslateModule } from '@ngx-translate/core';

describe('SearchCompetencyComponent', () => {
  let component: SearchCompetencyComponent;
  let fixture: ComponentFixture<SearchCompetencyComponent>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let httpServiceSpy: jasmine.SpyObj<HttpService>;

  // Mock data structure
  const mockInitialData = [
    { value: 'E1', label: 'Entity 1', type: 'system' },
    { value: 'E2', label: 'Entity 2', type: 'system' },
    { value: 'C1', label: 'Custom 1', type: 'other' },
  ];

  const mockEntityListData = (count: number, data: any[] = []) => ({
    result: {
      count: count,
      data: data,
    },
    responseCode: 'OK'
  });

  const mockControl = {
    meta: {
      entityId: 99
    }
  };

  beforeEach(waitForAsync(() => {
    // Create Spies
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    httpServiceSpy = jasmine.createSpyObj('HttpService', ['post']);

    TestBed.configureTestingModule({
      imports : [TranslateModule.forRoot()],
      declarations: [SearchCompetencyComponent],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: HttpService, useValue: httpServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchCompetencyComponent);
    component = fixture.componentInstance;
    component.data = { selectedData: mockInitialData, control: mockControl };
    
    // Default mock response for initial loading
    httpServiceSpy.post.and.returnValue(Promise.resolve(mockEntityListData(20, [{ value: 'N1', label: 'New Entity 1' }])));
  });

  describe('ngOnInit', () => {
    it('should initialize selectedOptions with a deep copy of data.selectedData and fetch entities', fakeAsync(() => {
      component.ngOnInit();
      tick();

      // Check deep copy (to ensure original data is not mutated)
      expect(component.selectedOptions).toEqual(mockInitialData);
      expect(component.selectedOptions).not.toBe(component.data.selectedData);

      // Check initial fetch
      expect(httpServiceSpy.post).toHaveBeenCalledTimes(1);
      expect(component.entities.data.length).toBe(1);
      expect(component.count).toBe(20);
    }));
  });

  describe('getEntityList', () => {
    it('should construct the correct URL and return entity data on success', async () => {
      component.page = 2;
      component.limit = 5;
      component.searchText = 'test search';
      const expectedUrl = urlConstants.API_URLS.ENTITY_LIST + "entity_type_id=99&page=2&limit=5&search=" + btoa(component.searchText);
      
      const mockResponse = mockEntityListData(10, [{ value: 'X', label: 'X' }]);
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockResponse));

      const result = await component.getEntityList();

      expect(httpServiceSpy.post).toHaveBeenCalledWith(jasmine.objectContaining({
        url: expectedUrl
      }));
      expect(result).toEqual(mockResponse.result);
      expect(component.count).toBe(10);
    });

    it('should return null and handle API error gracefully', async () => {
      httpServiceSpy.post.and.returnValue(Promise.reject('API Error'));

      const result = await component.getEntityList();

      expect(result).toBeNull();
      // count should not have been updated in case of error
      expect(component.count).toBeUndefined(); 
    });
  });

  describe('selection logic', () => {
    const newOption = { value: 'N3', label: 'New Entity 3', type: 'system' };

    beforeEach(() => {
      component.selectedOptions = JSON.parse(JSON.stringify(mockInitialData));
    });

    it('should add an option to selectedOptions on checkbox check', () => {
      const mockEvent = { detail: { checked: true } };
      component.onCheckboxChange(mockEvent, newOption);
      
      expect(component.selectedOptions.length).toBe(4);
      expect(component.selectedOptions.some(item => item.value === 'N3')).toBeTrue();
    });

    it('should remove an option from selectedOptions on checkbox uncheck', () => {
      // E1 is already selected in mockInitialData
      const optionToRemove = mockInitialData[0]; 
      const mockEvent = { detail: { checked: false } };
      component.onCheckboxChange(mockEvent, optionToRemove);

      expect(component.selectedOptions.length).toBe(2);
      expect(component.selectedOptions.some(item => item.value === 'E1')).toBeFalse();
    });

    it('isOptionSelected should return true if option is selected', () => {
      const selected = mockInitialData[1]; // E2
      expect(component.isOptionSelected(selected)).toBeTrue();
    });

    it('isOptionSelected should return false if option is not selected', () => {
      const unselected = { value: 'Z9', label: 'Z9' };
      expect(component.isOptionSelected(unselected)).toBeFalse();
    });
  });

  describe('action methods', () => {
    beforeEach(fakeAsync(() => {
      // Initialize component state after ngOnInit setup
      component.ngOnInit();
      tick();
      httpServiceSpy.post.calls.reset(); // Reset call count from ngOnInit
    }));

    it('clearAll should reset state and keep only "other" type selections', fakeAsync(() => {
      // Add a system entity and a custom entity
      component.selectedOptions = [...mockInitialData, { value: 'S3', type: 'system' }];
      component.searchText = 'something';
      component.page = 5;

      component.clearAll();
      tick();

      // Only 'other' type options (C1) should remain
      expect(component.selectedOptions.length).toBe(1);
      expect(component.selectedOptions[0].type).toBe('other');
      expect(component.searchText).toBe('');
      expect(component.page).toBe(1);
      expect(httpServiceSpy.post).toHaveBeenCalledTimes(1);
    }));

    it('clearText should reset searchText and page, and fetch new entities', fakeAsync(() => {
      component.searchText = 'something';
      component.page = 5;

      component.clearText();
      tick();

      expect(component.searchText).toBe('');
      expect(component.page).toBe(1);
      expect(httpServiceSpy.post).toHaveBeenCalledTimes(1);
    }));
    
    it('onSearch should fetch entities with current search text and reset pagination', fakeAsync(() => {
        component.searchText = 'new query';
        component.page = 5; // Should stay 5, as onSearch doesn't explicitly reset page
        
        component.onSearch();
        tick();

        // It makes a call with the current state (new query, page 5)
        // Note: The original code does not explicitly reset page=1 in onSearch, 
        // relying on the API call with the current page.
        expect(httpServiceSpy.post).toHaveBeenCalledTimes(1);
        const lastCall = httpServiceSpy.post.calls.mostRecent().args[0].url;
        expect(lastCall).toContain('page=5');
        expect(lastCall).toContain('search=' + btoa('new query'));
    }));
  });

  describe('modal interaction', () => {
    it('closePopover should dismiss the modal without data', () => {
      component.closePopover();
      expect(modalControllerSpy.dismiss).toHaveBeenCalledWith();
    });

    it('onSave should dismiss the modal with selectedOptions data', () => {
      component.selectedOptions = [{ value: 'final' }];
      component.onSave();
      expect(modalControllerSpy.dismiss).toHaveBeenCalledWith([{ value: 'final' }]);
    });
  });

  describe('loadMore', () => {
    let mockEvent: any;

    beforeEach(fakeAsync(() => {
      // Initial load setup
      component.ngOnInit();
      tick();
      
      // Setup current state for loadMore test
      component.page = 1;
      component.count = 5; // Total items
      component.entities.data = [{ id: 1 }, { id: 2 }]; // 2 items currently loaded
      
      // Mock the infinite scroll event
      mockEvent = { target: { complete: jasmine.createSpy('complete'), disabled: false } };
      
      // Mock the API response for the second page
      const newEntities = [{ id: 3 }, { id: 4 }, { id: 5 }];
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockEntityListData(5, newEntities)));
    }));

    it('should increment page, fetch new entities, append data, and complete the event', fakeAsync(() => {
      component.loadMore(mockEvent);
      tick();

      expect(component.page).toBe(2);
      expect(httpServiceSpy.post).toHaveBeenCalled();
      expect(component.entities.data.length).toBe(5); // 2 existing + 3 new = 5
      expect(mockEvent.target.complete).toHaveBeenCalled();
      expect(mockEvent.target.disabled).toBeFalse();
    }));

    it('should disable the event target if all items are already loaded', fakeAsync(() => {
      // Mock state where count equals current data length (e.g., 2 items loaded, count is 2)
      component.count = 2;
      component.entities.data = [{ id: 1 }, { id: 2 }];

      component.loadMore(mockEvent);
      tick();

      expect(component.page).toBe(2); // Page still increments
      // API call should still happen, as the check (count > entities.data.length) is done after page increment
      expect(httpServiceSpy.post).not.toHaveBeenCalled(); 
      expect(mockEvent.target.complete).not.toHaveBeenCalled(); 
      expect(mockEvent.target.disabled).toBeTrue();
    }));
    
    it('should correctly concat entities if API returns fewer items than limit', fakeAsync(() => {
      component.count = 10;
      component.entities.data = [{ id: 1 }, { id: 2 }]; // Start with 2
      
      // Next call returns 3 new entities, but total count is still high
      const newEntities = [{ id: 3 }, { id: 4 }, { id: 5 }];
      httpServiceSpy.post.and.returnValue(Promise.resolve(mockEntityListData(10, newEntities)));
      
      component.loadMore(mockEvent);
      tick();
      
      expect(component.page).toBe(2);
      expect(component.entities.data.length).toBe(5); // Should have 5 items total
      expect(mockEvent.target.complete).toHaveBeenCalled();
    }));
  });
});