
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { FilterComponent } from './filter.component';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [FilterComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('compareWith', () => {
    it('should return true if objects have the same id', () => {
      const o1 = { id: 1, name: 'A' };
      const o2 = { id: 1, name: 'B' };
      expect(component.compareWith(o1, o2)).toBeTrue();
    });

    it('should return false if objects have different ids', () => {
      const o1 = { id: 1, name: 'A' };
      const o2 = { id: 2, name: 'B' };
      expect(component.compareWith(o1, o2)).toBeFalse();
    });

    it('should return true if primitive values are equal', () => {
      expect(component.compareWith('A', 'A')).toBeTrue();
      expect(component.compareWith(1, 1)).toBeTrue();
    });

    it('should return false if primitive values are different', () => {
      expect(component.compareWith('A', 'B')).toBeFalse();
      expect(component.compareWith(1, 2)).toBeFalse();
    });

    it('should handle null or undefined values', () => {
      expect(component.compareWith(null, null)).toBeTrue();
      expect(component.compareWith(undefined, undefined)).toBeTrue();
      expect(component.compareWith(null, 'A')).toBeFalse();
      expect(component.compareWith('A', null)).toBeFalse();
    });
  });

  describe('ionChange', () => {
    it('should update defaultValue and emit filterChange event', () => {
      spyOn(component.filterChange, 'emit');
      const event = { target: { value: 'newValue' } };

      component.ionChange(event);

      expect(component.defaultValue).toBe('newValue');
      expect(component.filterChange.emit).toHaveBeenCalledWith(event);
    });
  });
});
