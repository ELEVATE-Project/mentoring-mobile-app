
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { SearchbarComponent } from './searchbar.component';
import { ToastService } from 'src/app/core/services';
import { SimpleChanges, SimpleChange } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { OverlayModule } from '@angular/cdk/overlay';

describe('SearchbarComponent', () => {
  let component: SearchbarComponent;
  let fixture: ComponentFixture<SearchbarComponent>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(waitForAsync(() => {
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showToast']);

    TestBed.configureTestingModule({
      declarations: [SearchbarComponent],
      imports: [
        IonicModule.forRoot(),
        TranslateModule.forRoot(),
        FormsModule,
        OverlayModule
      ],
      providers: [
        { provide: ToastService, useValue: toastServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set searchText from parentSearchText if available', () => {
      component.parentSearchText = 'initial search';
      component.ngOnInit();
      expect(component.searchText).toBe('initial search');
    });

    it('should not set searchText if parentSearchText is not available', () => {
      component.parentSearchText = undefined;
      component.ngOnInit();
      expect(component.searchText).toBeUndefined();
    });
  });

  describe('ngOnChanges', () => {
    it('should update searchText if parentSearchText is provided and searchText is empty', () => {
      component.parentSearchText = 'new search';
      component.searchText = '';
      component.ngOnChanges({});
      expect(component.searchText).toBe('new search');
    });

    it('should update searchText if parentSearchText change is detected', () => {
      const changes: SimpleChanges = {
        parentSearchText: new SimpleChange(null, 'changed text', false)
      };
      component.ngOnChanges(changes);
      expect(component.searchText).toBe('changed text');
    });

    it('should update criteriaChip if valueFromParent change is detected', () => {
      const changes: SimpleChanges = {
        valueFromParent: new SimpleChange(null, 'chip val', false)
      };
      component.ngOnChanges(changes);
      expect(component.criteriaChip).toBe('chip val');
    });
  });

  describe('selectChip', () => {
    it('should select chip if it is different from current', () => {
      component.criteriaChip = 'old';
      component.selectChip('new');
      expect(component.criteriaChip).toBe('new');
    });

    it('should deselect chip if it is same as current', () => {
      component.criteriaChip = 'same';
      component.selectChip('same');
      expect(component.criteriaChip).toBeNull();
    });
  });

  describe('onSearch', () => {
    it('should emit empty search text if searchText length is 0', () => {
      spyOn(component.outputData, 'emit');
      component.searchText = '';
      component.criteriaChip = 'some chip';

      component.onSearch();

      expect(component.outputData.emit).toHaveBeenCalledWith({
        searchText: '',
        criterias: 'some chip'
      });
    });

    it('should emit search text if length is >= 3', () => {
      spyOn(component.outputData, 'emit');
      component.searchText = 'test search';
      component.criteriaChip = 'some chip';

      component.onSearch();

      expect(component.outputData.emit).toHaveBeenCalledWith({
        searchText: 'test search',
        criterias: 'some chip'
      });
      expect(component.isOpen).toBeFalse();
    });

    it('should show toast if search text length is > 0 and < 3', () => {
      spyOn(component.outputData, 'emit');
      component.searchText = 'ab';

      component.onSearch();

      expect(component.outputData.emit).not.toHaveBeenCalled();
      expect(toastServiceSpy.showToast).toHaveBeenCalledWith("ENTER_MIN_CHARACTER", "danger");
      expect(component.isOpen).toBeFalse();
    });
  });

  describe('onClearSearch', () => {
    it('should reset search logic', () => {
      spyOn(component.clearText, 'emit');
      component.isOpen = true;
      component.criteriaChip = 'value';

      component.onClearSearch();

      expect(component.isOpen).toBeFalse();
      expect(component.clearText.emit).toHaveBeenCalledWith('');
      expect(component.criteriaChip).toBeUndefined();
    });
  });
});
