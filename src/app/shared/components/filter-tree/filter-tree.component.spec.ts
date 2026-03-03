import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterTreeComponent } from './filter-tree.component';
import { EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('FilterTreeComponent', () => {
  let component: FilterTreeComponent;
  let fixture: ComponentFixture<FilterTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FilterTreeComponent ],
      imports: [FormsModule],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterTreeComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize readOnly as false', () => {
    expect(component.readOnly()).toBe(false);
  });

  describe('ngOnInit', () => {
    it('should not modify filterData when eventData is undefined', () => {
      fixture.componentRef.setInput('filterData', [
        {
          name: 'type',
          options: [
            { label: 'Option 1', selected: true, readOnly: true }
          ]
        }
      ]);
      fixture.componentRef.setInput('eventData', undefined);

      component.ngOnInit();

      expect(component.filterData()[0].options[0].selected).toBe(true);
    });

    it('should not modify filterData when eventData.sessionType is undefined', () => {
      fixture.componentRef.setInput('filterData', [
        {
          name: 'type',
          options: [
            { label: 'Option 1', selected: true, readOnly: true }
          ]
        }
      ]);
      fixture.componentRef.setInput('eventData', {});

      component.ngOnInit();

      expect(component.filterData()[0].options[0].selected).toBe(true);
    });

    it('should reset type filter options when eventData.sessionType exists', () => {
      spyOn(component.filtersChanged, 'emit');
      fixture.componentRef.setInput('filterData', [
        {
          name: 'type',
          options: [
            { label: 'Option 1', selected: true, readOnly: true },
            { label: 'Option 2', selected: true, readOnly: true }
          ]
        }
      ]);
      fixture.componentRef.setInput('eventData', { sessionType: 'virtual' });

      component.ngOnInit();

      expect(component.filterData()[0].options[0].selected).toBe(false);
      expect(component.filterData()[0].options[0].readOnly).toBe(false);
      expect(component.filterData()[0].options[1].selected).toBe(false);
      expect(component.filterData()[0].options[1].readOnly).toBe(false);
      expect(component.filtersChanged.emit).toHaveBeenCalled();
    });

    it('should not modify non-type filters when eventData.sessionType exists', () => {
      fixture.componentRef.setInput('filterData', [
        {
          name: 'category',
          options: [
            { label: 'Cat 1', selected: true, readOnly: true }
          ]
        },
        {
          name: 'type',
          options: [
            { label: 'Type 1', selected: true, readOnly: true }
          ]
        }
      ]);
      fixture.componentRef.setInput('eventData', { sessionType: 'virtual' });

      component.ngOnInit();

      expect(component.filterData()[0].options[0].selected).toBe(true);
      expect(component.filterData()[1].options[0].selected).toBe(false);
    });

    it('should handle filterData being undefined', () => {
      fixture.componentRef.setInput('filterData', undefined);
      fixture.componentRef.setInput('eventData', { sessionType: 'virtual' });

      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should handle empty filterData array', () => {
      fixture.componentRef.setInput('filterData', []);
      fixture.componentRef.setInput('eventData', { sessionType: 'virtual' });

      expect(() => component.ngOnInit()).not.toThrow();
    });

    it('should call onFilterChange for each option in type filter', () => {
      spyOn(component, 'onFilterChange');
      fixture.componentRef.setInput('filterData', [
        {
          name: 'type',
          options: [
            { label: 'Option 1', selected: true },
            { label: 'Option 2', selected: true }
          ]
        }
      ]);
      fixture.componentRef.setInput('eventData', { sessionType: 'virtual' });

      component.ngOnInit();

      expect(component.onFilterChange).toHaveBeenCalledTimes(2);
    });
  });

  describe('clearAll', () => {
    it('should clear all selected options in filterData', () => {
      spyOn(component, 'onFilterChange');
      fixture.componentRef.setInput('filterData', [
        {
          name: 'category',
          options: [
            { label: 'Option 1', selected: true, value: 1 },
            { label: 'Option 2', selected: true, value: 2 }
          ]
        },
        {
          name: 'type',
          options: [
            { label: 'Type 1', selected: true, value: 3 }
          ]
        }
      ]);

      component.clearAll();

      expect(component.filterData()[0].options[0].selected).toBe(false);
      expect(component.filterData()[0].options[1].selected).toBe(false);
      expect(component.filterData()[1].options[0].selected).toBe(false);
    });

    it('should preserve other properties when clearing selections', () => {
      fixture.componentRef.setInput('filterData', [
        {
          name: 'category',
          options: [
            { label: 'Option 1', selected: true, value: 1, customProp: 'test' }
          ]
        }
      ]);

      component.clearAll();

      expect(component.filterData()[0].options[0].label).toBe('Option 1');
      expect(component.filterData()[0].options[0].value).toBe(1);
      expect(component.filterData()[0].options[0].customProp).toBe('test');
    });

    it('should call onFilterChange after clearing', () => {
      spyOn(component, 'onFilterChange');
      fixture.componentRef.setInput('filterData', [
        {
          name: 'category',
          options: [{ label: 'Option 1', selected: true }]
        }
      ]);

      component.clearAll();

      expect(component.onFilterChange).toHaveBeenCalled();
    });

    it('should handle undefined filterData', () => {
      fixture.componentRef.setInput('filterData', undefined);
      spyOn(component, 'onFilterChange');

      expect(() => component.clearAll()).not.toThrow();
      expect(component.onFilterChange).toHaveBeenCalled();
    });

    it('should handle null filterData', () => {
      fixture.componentRef.setInput('filterData', null);
      spyOn(component, 'onFilterChange');

      expect(() => component.clearAll()).not.toThrow();
      expect(component.onFilterChange).toHaveBeenCalled();
    });

    it('should handle empty filterData array', () => {
      fixture.componentRef.setInput('filterData', []);
      spyOn(component, 'onFilterChange');

      component.clearAll();

      expect(component.onFilterChange).toHaveBeenCalled();
    });

    it('should handle filters with no options', () => {
      fixture.componentRef.setInput('filterData', [
        { name: 'category', options: [] }
      ]);
      spyOn(component, 'onFilterChange');

      component.clearAll();

      expect(component.onFilterChange).toHaveBeenCalled();
    });
  });

  describe('onFilterChange', () => {
    it('should emit empty object when no filters are selected', () => {
      spyOn(component.filtersChanged, 'emit');
      fixture.componentRef.setInput('filterData', [
        {
          name: 'category',
          options: [
            { label: 'Option 1', selected: false }
          ]
        }
      ]);

      component.onFilterChange();

      expect(component.filtersChanged.emit).toHaveBeenCalledWith({});
    });

    it('should emit selected options grouped by category', () => {
      spyOn(component.filtersChanged, 'emit');
      fixture.componentRef.setInput('filterData', [
        {
          name: 'category',
          options: [
            { label: 'Option 1', selected: true, value: 1 },
            { label: 'Option 2', selected: false, value: 2 },
            { label: 'Option 3', selected: true, value: 3 }
          ]
        }
      ]);

      component.onFilterChange();

      const expectedOutput = {
        category: [
          { label: 'Option 1', selected: true, value: 1, categoryName: 'category' },
          { label: 'Option 3', selected: true, value: 3, categoryName: 'category' }
        ]
      };
      expect(component.filtersChanged.emit).toHaveBeenCalledWith(expectedOutput);
    });

    it('should handle multiple categories with selected options', () => {
      spyOn(component.filtersChanged, 'emit');
      fixture.componentRef.setInput('filterData', [
        {
          name: 'category',
          options: [
            { label: 'Cat 1', selected: true, value: 1 }
          ]
        },
        {
          name: 'type',
          options: [
            { label: 'Type 1', selected: true, value: 2 }
          ]
        }
      ]);

      component.onFilterChange();

      const emittedValue = (component.filtersChanged.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedValue.category).toBeDefined();
      expect(emittedValue.category.length).toBe(1);
      expect(emittedValue.type).toBeDefined();
      expect(emittedValue.type.length).toBe(1);
    });

    it('should add categoryName property to selected options', () => {
      spyOn(component.filtersChanged, 'emit');
      fixture.componentRef.setInput('filterData', [
        {
          name: 'status',
          options: [
            { label: 'Active', selected: true }
          ]
        }
      ]);

      component.onFilterChange();

      const emittedValue = (component.filtersChanged.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedValue.status[0].categoryName).toBe('status');
    });

    it('should handle mix of selected and unselected across multiple categories', () => {
      spyOn(component.filtersChanged, 'emit');
      fixture.componentRef.setInput('filterData', [
        {
          name: 'category1',
          options: [
            { label: 'C1-O1', selected: true },
            { label: 'C1-O2', selected: false }
          ]
        },
        {
          name: 'category2',
          options: [
            { label: 'C2-O1', selected: false },
            { label: 'C2-O2', selected: true }
          ]
        },
        {
          name: 'category3',
          options: [
            { label: 'C3-O1', selected: false }
          ]
        }
      ]);

      component.onFilterChange();

      const emittedValue = (component.filtersChanged.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(Object.keys(emittedValue).length).toBe(2);
      expect(emittedValue.category1.length).toBe(1);
      expect(emittedValue.category2.length).toBe(1);
      expect(emittedValue.category3).toBeUndefined();
    });

    it('should preserve original option properties', () => {
      spyOn(component.filtersChanged, 'emit');
      fixture.componentRef.setInput('filterData', [
        {
          name: 'test',
          options: [
            { label: 'Test', selected: true, value: 123, customField: 'custom' }
          ]
        }
      ]);

      component.onFilterChange();

      const emittedValue = (component.filtersChanged.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedValue.test[0].label).toBe('Test');
      expect(emittedValue.test[0].value).toBe(123);
      expect(emittedValue.test[0].customField).toBe('custom');
    });

    it('should handle undefined filterData gracefully', () => {
      spyOn(component.filtersChanged, 'emit');
      fixture.componentRef.setInput('filterData', undefined);

      expect(() => component.onFilterChange()).toThrow();
    });
  });

  describe('isCheckboxDisabled', () => {
    it('should always return false', () => {
      const filter = { name: 'test', options: [] };
      const sessionType = 'virtual';

      const result = component.isCheckboxDisabled(filter, sessionType);

      expect(result).toBe(false);
    });

    it('should return false for any filter input', () => {
      expect(component.isCheckboxDisabled(null, '')).toBe(false);
      expect(component.isCheckboxDisabled({}, 'any')).toBe(false);
      expect(component.isCheckboxDisabled(undefined, undefined)).toBe(false);
    });
  });

  describe('Input and Output properties', () => {
    it('should have enableFilterHeader input', () => {
      fixture.componentRef.setInput('enableFilterHeader', true);
      expect(component.enableFilterHeader()).toBe(true);
    });

    it('should have enableFilterLabel input', () => {
      fixture.componentRef.setInput('enableFilterLabel', false);
      expect(component.enableFilterLabel()).toBe(false);
    });

    it('should have filterData input', () => {
      const data = [{ name: 'test', options: [] }];
      fixture.componentRef.setInput('filterData', data);
      expect(component.filterData()).toEqual(data);
    });

    it('should have eventData input', () => {
      const data = { sessionType: 'virtual' };
      fixture.componentRef.setInput('eventData', data);
      expect(component.eventData()).toEqual(data);
    });

    it('should have filtersChanged output emitter', () => {
      expect(component.filtersChanged).toBeDefined();
      expect(component.filtersChanged instanceof EventEmitter).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle filterData with empty options array', () => {
      spyOn(component.filtersChanged, 'emit');
      fixture.componentRef.setInput('filterData', [
        { name: 'empty', options: [] }
      ]);

      component.onFilterChange();

      expect(component.filtersChanged.emit).toHaveBeenCalledWith({});
    });

    it('should handle multiple selected options in same category', () => {
      spyOn(component.filtersChanged, 'emit');
      fixture.componentRef.setInput('filterData', [
        {
          name: 'multi',
          options: [
            { label: 'A', selected: true },
            { label: 'B', selected: true },
            { label: 'C', selected: true }
          ]
        }
      ]);

      component.onFilterChange();

      const emittedValue = (component.filtersChanged.emit as jasmine.Spy).calls.mostRecent().args[0];
      expect(emittedValue.multi.length).toBe(3);
    });

    it('should create new objects when clearing to avoid mutations', () => {
      fixture.componentRef.setInput('filterData', [
        {
          name: 'test',
          options: [
            { label: 'Original', selected: true, id: 1 }
          ]
        }
      ]);
      const originalOption = component.filterData()[0].options[0];

      component.clearAll();

      expect(component.filterData()[0].options[0]).not.toBe(originalOption);
      expect(component.filterData()[0].options[0].selected).toBe(false);
    });
  });
});