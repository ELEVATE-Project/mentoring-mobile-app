
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, PopoverController } from '@ionic/angular';
import { PopoverMenuComponent } from './popover-menu.component';

describe('PopoverMenuComponent', () => {
  let component: PopoverMenuComponent;
  let fixture: ComponentFixture<PopoverMenuComponent>;
  let popoverControllerSpy: jasmine.SpyObj<PopoverController>;

  beforeEach(waitForAsync(() => {
    popoverControllerSpy = jasmine.createSpyObj('PopoverController', ['dismiss']);

    TestBed.configureTestingModule({
      declarations: [PopoverMenuComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: PopoverController, useValue: popoverControllerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PopoverMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onSelect', () => {
    it('should dismiss the popover with the selected action', () => {
      const action = 'edit';
      component.onSelect(action);
      expect(popoverControllerSpy.dismiss).toHaveBeenCalledWith(action);
    });
  });
});
