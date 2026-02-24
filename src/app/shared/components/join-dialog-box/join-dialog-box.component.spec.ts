import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { JoinDialogBoxComponent } from './join-dialog-box.component';
import { ToastService } from 'src/app/core/services';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'translate' })
class MockTranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

class MockModalController {
  dismiss = jasmine.createSpy('dismiss');
}

class MockToastService {
  showToast = jasmine.createSpy('showToast');
}

describe('JoinDialogBoxComponent', () => {
  let component: JoinDialogBoxComponent;
  let fixture: ComponentFixture<JoinDialogBoxComponent>;
  let modalCtrl: MockModalController;
  let toastService: MockToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [JoinDialogBoxComponent, MockTranslatePipe],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: ModalController, useClass: MockModalController },
        { provide: ToastService, useClass: MockToastService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinDialogBoxComponent);
    component = fixture.componentInstance;
    modalCtrl = TestBed.inject(ModalController) as any;
    toastService = TestBed.inject(ToastService) as any;

    // Mock component properties
    component.browser = jasmine.createSpyObj('Browser', ['open', 'addListener']);
    (component.browser.open as jasmine.Spy).and.returnValue(Promise.resolve());
    (component.browser.addListener as jasmine.Spy).and.returnValue(Promise.resolve() as any);

    component.clipboard = jasmine.createSpyObj('Clipboard', ['write']);
    (component.clipboard.write as jasmine.Spy).and.returnValue(Promise.resolve());


    component.sessionData = {
      start_date: 1672531200,
      end_date: 1672534800, // Example timestamp
      meeting_info: { platform: 'Zoom' }
    };
    component.data = {
      link: 'https://example.com'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize data on ngOnInit', () => {
    expect(component.startDate).toBeDefined();
    expect(component.endDate).toBeDefined();
    expect(component.meetingPlatform).toEqual({ platform: 'Zoom' });
  });

  it('should open browser on openBrowser call', async () => {
    await component.openBrowser('https://test.com');
    expect(component.browser.open).toHaveBeenCalledWith({ url: 'https://test.com', windowName: '_self' });
    expect(component.browser.addListener).toHaveBeenCalled();
  });

  it('should dismiss modal on cancel', () => {
    component.cancel();
    expect(modalCtrl.dismiss).toHaveBeenCalledWith(null, 'cancel');
  });

  it('should dismiss modal and open browser on onButtonClick', () => {
    const openSpy = spyOn(component, 'openBrowser');
    component.onButtonClick();
    expect(modalCtrl.dismiss).toHaveBeenCalled();
    expect(openSpy).toHaveBeenCalledWith('https://example.com');
  });

  it('should copy to clipboard', async () => {
    await component.copyToClipBoard('some-text');
    expect(component.clipboard.write).toHaveBeenCalledWith({ string: 'some-text' });
    expect(toastService.showToast).toHaveBeenCalledWith('Copied successfully', 'success');
  });

  it('should not initialize startDate and endDate if sessionData is invalid', () => {
    component.startDate = 'initial';
    component.endDate = 'initial';
    component.sessionData = {
      start_date: 0,
      end_date: 0,
      meeting_info: { platform: 'Zoom' }
    };
    component.ngOnInit();
    expect(component.startDate).toBe('initial');
    expect(component.endDate).toBe('initial');
  });
});
