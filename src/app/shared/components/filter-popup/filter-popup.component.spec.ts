import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalController } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { FilterPopupComponent } from './filter-popup.component';

describe('FilterPopupComponent', () => {
  let component: FilterPopupComponent;
  let fixture: ComponentFixture<FilterPopupComponent>;
  let modalCtrl: jasmine.SpyObj<ModalController>;

  const mockFilterData = [
    {
      name: 'Category1',
      options: [
        { id: 1, name: 'Option1', selected: false },
        { id: 2, name: 'Option2', selected: true }
      ]
    },
    {
      name: 'Category2',
      options: [
        { id: 3, name: 'Option3', selected: true },
        { id: 4, name: 'Option4', selected: false }
      ]
    }
  ];

  beforeEach(async () => {
    const modalCtrlSpy = jasmine.createSpyObj('ModalController', ['dismiss']);

    await TestBed.configureTestingModule({
      declarations: [FilterPopupComponent],
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: ModalController, useValue: modalCtrlSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterPopupComponent);
    component = fixture.componentInstance;
    modalCtrl = TestBed.inject(ModalController) as jasmine.SpyObj<ModalController>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize initialFilterData when filterData is provided', () => {
      component.filterData = mockFilterData;
      component.ngOnInit();
      
      expect(component.initialFilterData).toEqual(mockFilterData);
      expect(component.initialFilterData).not.toBe(mockFilterData); // Deep copy check
    });

    it('should not initialize initialFilterData when filterData is null', () => {
      component.filterData = null;
      component.ngOnInit();
      
      expect(component.initialFilterData).toBeUndefined();
    });

    it('should not initialize initialFilterData when filterData is undefined', () => {
      component.filterData = undefined;
      component.ngOnInit();
      
      expect(component.initialFilterData).toBeUndefined();
    });

    it('should create a deep copy of filterData', () => {
      component.filterData = mockFilterData;
      component.ngOnInit();
      
      // Modify original data
      component.filterData[0].options[0].selected = true;
      
      // Initial data should remain unchanged
      expect(component.initialFilterData[0].options[0].selected).toBe(false);
    });
  });

  describe('filtersChanged', () => {
    it('should update selectedFilters with the provided data', () => {
      const testData = { category: 'test', value: 'data' };
      component.filtersChanged(testData);
      
      expect(component.selectedFilters).toEqual(testData);
    });

    it('should handle null data', () => {
      component.filtersChanged(null);
      
      expect(component.selectedFilters).toBeNull();
    });

    it('should handle undefined data', () => {
      component.filtersChanged(undefined);
      
      expect(component.selectedFilters).toBeUndefined();
    });

    it('should overwrite previous selectedFilters', () => {
      component.selectedFilters = { old: 'data' };
      const newData = { new: 'data' };
      
      component.filtersChanged(newData);
      
      expect(component.selectedFilters).toEqual(newData);
    });
  });

  describe('closePopup', () => {
    it('should dismiss modal with initial filter data and closed role', () => {
      component.initialFilterData = mockFilterData;
      component.closePopup();
      
      expect(modalCtrl.dismiss).toHaveBeenCalledWith({
        role: 'closed',
        data: mockFilterData
      });
    });

    it('should dismiss modal with undefined data when initialFilterData is not set', () => {
      component.initialFilterData = undefined;
      component.closePopup();
      
      expect(modalCtrl.dismiss).toHaveBeenCalledWith({
        role: 'closed',
        data: undefined
      });
    });
  });

  describe('onClickApply', () => {
    beforeEach(() => {
      component.filterData = JSON.parse(JSON.stringify(mockFilterData));
    });

    it('should dismiss modal with selected filters organized by category', () => {
      component.onClickApply();
      
      const dismissCall = modalCtrl.dismiss.calls.mostRecent().args[0];
      expect(modalCtrl.dismiss).toHaveBeenCalled();
      expect(dismissCall.data.selectedFilters.Category1).toBeDefined();
      expect(dismissCall.data.selectedFilters.Category1.length).toBe(1);
      expect(dismissCall.data.selectedFilters.Category1[0].id).toBe(2);
      expect(dismissCall.data.selectedFilters.Category1[0].name).toBe('Option2');
      expect(dismissCall.data.selectedFilters.Category1[0].selected).toBe(true);
      expect(dismissCall.data.selectedFilters.Category1[0].categoryName).toBe('Category1');
      
      expect(dismissCall.data.selectedFilters.Category2).toBeDefined();
      expect(dismissCall.data.selectedFilters.Category2.length).toBe(1);
      expect(dismissCall.data.selectedFilters.Category2[0].id).toBe(3);
      expect(dismissCall.data.selectedFilters.Category2[0].name).toBe('Option3');
      expect(dismissCall.data.selectedFilters.Category2[0].selected).toBe(true);
      expect(dismissCall.data.selectedFilters.Category2[0].categoryName).toBe('Category2');
    });

    it('should use selectedFilters property if it is a non-empty object', () => {
      const customFilters = { customCategory: [{ id: 5, name: 'Custom' }] };
      component.selectedFilters = customFilters;
      
      component.onClickApply();
      
      expect(modalCtrl.dismiss).toHaveBeenCalledWith({
        data: {
          selectedFilters: customFilters
        }
      });
    });

    it('should not use selectedFilters if it is null', () => {
      component.selectedFilters = null;
      component.onClickApply();
      
      const dismissCall = modalCtrl.dismiss.calls.mostRecent().args[0];
      expect(dismissCall.data.selectedFilters).not.toBeNull();
      expect(dismissCall.data.selectedFilters.Category1).toBeDefined();
    });

    it('should not use selectedFilters if it is undefined', () => {
      component.selectedFilters = undefined;
      component.onClickApply();
      
      const dismissCall = modalCtrl.dismiss.calls.mostRecent().args[0];
      expect(dismissCall.data.selectedFilters).toBeDefined();
    });

    it('should not use selectedFilters if it is an empty object', () => {
      component.selectedFilters = {};
      component.onClickApply();
      
      const dismissCall = modalCtrl.dismiss.calls.mostRecent().args[0];
      expect(dismissCall.data.selectedFilters.Category1).toBeDefined();
    });

    it('should not use selectedFilters if it is not an object (string)', () => {
      component.selectedFilters = 'string value';
      component.onClickApply();
      
      const dismissCall = modalCtrl.dismiss.calls.mostRecent().args[0];
      expect(dismissCall.data.selectedFilters.Category1).toBeDefined();
    });

    it('should not use selectedFilters if it is not an object (number)', () => {
      component.selectedFilters = 123;
      component.onClickApply();
      
      const dismissCall = modalCtrl.dismiss.calls.mostRecent().args[0];
      expect(dismissCall.data.selectedFilters.Category1).toBeDefined();
    });

    it('should handle categories with no selected options', () => {
      component.filterData = [
        {
          name: 'EmptyCategory',
          options: [
            { id: 1, name: 'Option1', selected: false },
            { id: 2, name: 'Option2', selected: false }
          ]
        }
      ];
      
      component.onClickApply();
      
      expect(modalCtrl.dismiss).toHaveBeenCalledWith({
        data: {
          selectedFilters: {}
        }
      });
    });

    it('should handle all options selected in a category', () => {
      component.filterData = [
        {
          name: 'FullCategory',
          options: [
            { id: 1, name: 'Option1', selected: true },
            { id: 2, name: 'Option2', selected: true }
          ]
        }
      ];
      
      component.onClickApply();
      
      const dismissCall = modalCtrl.dismiss.calls.mostRecent().args[0];
      expect(dismissCall.data.selectedFilters.FullCategory.length).toBe(2);
    });

    it('should add categoryName to each selected option', () => {
      component.onClickApply();
      
      const dismissCall = modalCtrl.dismiss.calls.mostRecent().args[0];
      const category1Options = dismissCall.data.selectedFilters.Category1;
      
      expect(category1Options[0].categoryName).toBe('Category1');
    });

    it('should handle empty filterData array', () => {
      component.filterData = [];
      component.onClickApply();
      
      expect(modalCtrl.dismiss).toHaveBeenCalledWith({
        data: {
          selectedFilters: {}
        }
      });
    });

    it('should handle multiple selected options in same category', () => {
      component.filterData = [
        {
          name: 'MultiSelect',
          options: [
            { id: 1, name: 'Option1', selected: true },
            { id: 2, name: 'Option2', selected: true },
            { id: 3, name: 'Option3', selected: true }
          ]
        }
      ];
      
      component.onClickApply();
      
      const dismissCall = modalCtrl.dismiss.calls.mostRecent().args[0];
      expect(dismissCall.data.selectedFilters.MultiSelect.length).toBe(3);
    });
  });

  describe('ionViewWillLeave', () => {
    it('should reset selectedFilters to null', () => {
      component.selectedFilters = { some: 'data' };
      component.ionViewWillLeave();
      
      expect(component.selectedFilters).toBeNull();
    });

    it('should reset selectedFilters even if it was already null', () => {
      component.selectedFilters = null;
      component.ionViewWillLeave();
      
      expect(component.selectedFilters).toBeNull();
    });

    it('should reset selectedFilters even if it was undefined', () => {
      component.selectedFilters = undefined;
      component.ionViewWillLeave();
      
      expect(component.selectedFilters).toBeNull();
    });
  });
});