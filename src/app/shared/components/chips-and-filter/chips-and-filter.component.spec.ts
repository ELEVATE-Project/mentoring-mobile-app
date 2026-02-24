import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { ChipsAndFilterComponent } from './chips-and-filter.component';
import { Subject } from 'rxjs';
import { EventEmitter } from '@angular/core';

describe('ChipsAndFilterComponent', () => {
  let component: ChipsAndFilterComponent;
  let fixture: ComponentFixture<ChipsAndFilterComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let routerEventsSubject: Subject<any>;

  beforeEach(async () => {
    routerEventsSubject = new Subject();
    
    mockRouter = jasmine.createSpyObj('Router', ['navigate'], {
      events: routerEventsSubject.asObservable()
    });

    await TestBed.configureTestingModule({
      declarations: [ ChipsAndFilterComponent ],
      providers: [
        { provide: Router, useValue: mockRouter }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChipsAndFilterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should subscribe to router NavigationEnd events', () => {
      component.searchAndCriteriaData = 'test data';
      
      component.ngOnInit();
      
      routerEventsSubject.next(new NavigationEnd(1, '/test', '/test'));
      
      expect(component.searchAndCriteriaData).toBe('');
    });

    it('should not reset search on non-NavigationEnd events', () => {
      component.searchAndCriteriaData = 'test data';
      
      component.ngOnInit();
      
      routerEventsSubject.next({ type: 'other' });
      
      expect(component.searchAndCriteriaData).toBe('test data');
    });

    it('should handle multiple NavigationEnd events', () => {
      component.searchAndCriteriaData = 'initial data';
      
      component.ngOnInit();
      
      routerEventsSubject.next(new NavigationEnd(1, '/test1', '/test1'));
      expect(component.searchAndCriteriaData).toBe('');
      
      component.searchAndCriteriaData = 'new data';
      routerEventsSubject.next(new NavigationEnd(2, '/test2', '/test2'));
      expect(component.searchAndCriteriaData).toBe('');
    });
  });

  describe('closeCriteriaChip', () => {
    it('should emit empty string through sendChildValue', () => {
      spyOn(component.sendChildValue, 'emit');
      component.searchAndCriteriaData = 'test data';
      
      component.closeCriteriaChip();
      
      expect(component.sendChildValue.emit).toHaveBeenCalledWith('');
    });

    it('should reset searchAndCriteriaData to empty string', () => {
      component.searchAndCriteriaData = 'test data';
      
      component.closeCriteriaChip();
      
      expect(component.searchAndCriteriaData).toBe('');
    });
  });

  describe('removeChip', () => {
    it('should emit correct data object with chipValue and index', () => {
      spyOn(component.removeFilterChip, 'emit');
      const testChipValue = 'test chip';
      const testIndex = 2;
      
      component.removeChip(testChipValue, testIndex);
      
      expect(component.removeFilterChip.emit).toHaveBeenCalledWith({
        chipValue: testChipValue,
        index: testIndex
      });
    });

    it('should handle null chipValue', () => {
      spyOn(component.removeFilterChip, 'emit');
      
      component.removeChip(null, 0);
      
      expect(component.removeFilterChip.emit).toHaveBeenCalledWith({
        chipValue: null,
        index: 0
      });
    });

    it('should handle negative index', () => {
      spyOn(component.removeFilterChip, 'emit');
      
      component.removeChip('chip', -1);
      
      expect(component.removeFilterChip.emit).toHaveBeenCalledWith({
        chipValue: 'chip',
        index: -1
      });
    });
  });

  describe('onClickFilter', () => {
    it('should emit filterClick event', async () => {
      spyOn(component.filterClick, 'emit');
      
      await component.onClickFilter();
      
      expect(component.filterClick.emit).toHaveBeenCalled();
    });

    it('should be async and complete successfully', async () => {
      spyOn(component.filterClick, 'emit');
      
      const result = component.onClickFilter();
      
      expect(result instanceof Promise).toBe(true);
      await expectAsync(result).toBeResolved();
    });
  });

  describe('resetSearch (private method)', () => {
    it('should reset searchAndCriteriaData when called indirectly via navigation', () => {
      component.searchAndCriteriaData = 'some search data';
      component.ngOnInit();
      
      routerEventsSubject.next(new NavigationEnd(1, '/new-route', '/new-route'));
      
      expect(component.searchAndCriteriaData).toBe('');
    });
  });

  describe('Input and Output properties', () => {
    it('should have searchAndCriteriaData input', () => {
      const testData = { search: 'test' };
      component.searchAndCriteriaData = testData;
      
      expect(component.searchAndCriteriaData).toEqual(testData);
    });

    it('should have selectedFilters input', () => {
      const filters = ['filter1', 'filter2'];
      component.selectedFilters = filters;
      
      expect(component.selectedFilters).toEqual(filters);
    });

    it('should have isFilterEnable input', () => {
      component.isFilterEnable = true;
      
      expect(component.isFilterEnable).toBe(true);
    });

    it('should have filterClick output emitter', () => {
      expect(component.filterClick).toBeDefined();
      expect(component.filterClick instanceof EventEmitter).toBe(true);
    });

    it('should have removeFilterChip output emitter', () => {
      expect(component.removeFilterChip).toBeDefined();
      expect(component.removeFilterChip instanceof EventEmitter).toBe(true);
    });

    it('should have sendChildValue output emitter', () => {
      expect(component.sendChildValue).toBeDefined();
      expect(component.sendChildValue instanceof EventEmitter).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle undefined searchAndCriteriaData', () => {
      component.searchAndCriteriaData = undefined;
      
      component.closeCriteriaChip();
      
      expect(component.searchAndCriteriaData).toBe('');
    });

    it('should handle empty string chipValue in removeChip', () => {
      spyOn(component.removeFilterChip, 'emit');
      
      component.removeChip('', 0);
      
      expect(component.removeFilterChip.emit).toHaveBeenCalledWith({
        chipValue: '',
        index: 0
      });
    });
  });
});