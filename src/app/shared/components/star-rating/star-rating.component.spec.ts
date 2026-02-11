import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { StarRatingComponent } from './star-rating.component';

describe('StarRatingComponent', () => {
  let component: StarRatingComponent;
  let fixture: ComponentFixture<StarRatingComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [StarRatingComponent],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(StarRatingComponent);
    component = fixture.componentInstance;
    component.numberOfStars = 5; // Set default input
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should populate range based on numberOfStars', () => {
    component.ngOnInit();
    expect(component.range.length).toBe(5);
    expect(component.range).toEqual([0, 1, 2, 3, 4]);
  });

  it('onRate should update rate and call onChange', () => {
    spyOn(component, 'onChange');
    component.onRate(3);
    expect(component.rate).toBe(3);
    expect(component.onChange).toHaveBeenCalledWith(3);
  });

  it('should implement ControlValueAccessor methods', () => {
    const fn = () => { };
    component.registerOnChange(fn);
    expect(component.onChange).toBe(fn);

    component.registerOnTouched(fn);
    expect(component.onTouched).toBe(fn);

    component.writeValue(3);
    // writeValue is empty in component, just calling it to cover lines
  });

  it('markAsTouched should call onTouched if not already touched', () => {
    spyOn(component, 'onTouched');
    component.touched = false;
    component.markAsTouched();
    expect(component.onTouched).toHaveBeenCalled();
    expect(component.touched).toBeTrue();

    component.onTouched = jasmine.createSpy('onTouched');
    component.markAsTouched();
    expect(component.onTouched).not.toHaveBeenCalled();
  });
});
