import 'zone.js';          
import 'zone.js/testing';  

/* session-request.page.spec.ts - Clean and Complete Test Suite */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { SessionRequestPage } from './session-request.page';
import { Router, ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { of } from 'rxjs';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Services tokens / paths — adjust if your project uses different paths
import { ToastService } from 'src/app/core/services';
import { UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { SessionService } from 'src/app/core/services/session/session.service';
// Assuming CommonRoutes is available or defined
const CommonRoutes = { TABS: 'tabs', REQUESTS: 'requests' }; 

// ---- Mocks / stubs ----
class MockRouter {
  navigate = jasmine.createSpy('navigate');
}

class MockToastService {
  showToast = jasmine.createSpy('showToast');
}

class MockFormService {
  getForm = jasmine.createSpy('getForm').and.returnValue(Promise.resolve({ data: { fields: { foo: 'bar' } } }));
}

class MockSessionService {
  requestSession = jasmine.createSpy('requestSession').and.returnValue(Promise.resolve({ message: 'requested' }));
}

class MockModalController {
  create = jasmine.createSpy('create').and.callFake(() => {
    return Promise.resolve({
      onDidDismiss: () => Promise.resolve({ data: null }), // Default returns null data
      present: () => Promise.resolve()
    });
  });
}

class MockUtilService {
  convertDatesToTimezone = jasmine.createSpy('convertDatesToTimezone').and.callFake((start, end, tz) => {
    // Return epoch ms numbers for simplicity
    return {
      eventStartEpochInSelectedTZ: 1609459200000, // Jan 1, 2021 00:00:00 UTC (in ms)
      eventEndEpochInSelectedTZ: 1609462800000 // +1 hour (in ms)
    };
  });
}

// Minimal stub of DynamicFormComponent for the ViewChild
class DummyForm {
  myForm = {
    get valid() { return true; }, 
    getRawValue: () => ({ 
      start_date: '2021-01-01T00:00:00', 
      end_date: '2021-01-01T01:00:00',
      some_field: 'value'
    }),
    value: { agenda: 'Test Agenda' },
    markAsPristine: jasmine.createSpy('markAsPristine')
  };

  onSubmit = jasmine.createSpy('onSubmit');
  reset = jasmine.createSpy('reset');
}

describe('SessionRequestPage', () => {
  let component: SessionRequestPage;
  let fixture: ComponentFixture<SessionRequestPage>;

  let mockRouter: MockRouter;
  let mockToast: MockToastService;
  let mockFormService: MockFormService;
  let mockSessionService: MockSessionService;
  let mockModalCtrl: MockModalController;
  let mockUtil: MockUtilService;

  beforeEach(waitForAsync(async () => {
    mockRouter = new MockRouter();
    mockToast = new MockToastService();
    mockFormService = new MockFormService();
    mockSessionService = new MockSessionService();
    mockModalCtrl = new MockModalController();
    mockUtil = new MockUtilService();

    await TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({})
      ],
      declarations: [SessionRequestPage],
      providers: [
        { provide: Router, useValue: mockRouter },
        {
          provide: ActivatedRoute,
          useValue: {
            // Mock queryParams for requestee_id
            queryParams: of({ data: 42 }) 
          }
        },
        { provide: ToastService, useValue: mockToast },
        { provide: FormService, useValue: mockFormService },
        { provide: SessionService, useValue: mockSessionService },
        { provide: ModalController, useValue: mockModalCtrl },
        { provide: UtilService, useValue: mockUtil },
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionRequestPage);
    component = fixture.componentInstance;

    // Attach a dummy form to the ViewChild
    component.form1 = new DummyForm() as any;

    // Reset spies and set default form validity before each test
    mockRouter.navigate.calls.reset();
    mockToast.showToast.calls.reset();
    (component.form1.reset as jasmine.Spy).calls.reset();
    (component.form1.myForm.markAsPristine as jasmine.Spy).calls.reset();
    spyOnProperty(component.form1.myForm, 'valid', 'get').and.returnValue(true);
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- ionViewWillEnter Tests (100% Coverage) ---
  it('ionViewWillEnter should set ids.requestee_id and fetch formData', async () => {
    (mockFormService.getForm as jasmine.Spy).and.returnValue(Promise.resolve({ data: { fields: { foo: 'bar' } } }));

    await component.ionViewWillEnter();

    expect(component.ids.requestee_id).toBe(42);
    expect(mockFormService.getForm).toHaveBeenCalled();
    expect(component.formData.foo).toBe('bar');
  });

  // --- onDynamicSelectClicked Tests (100% Coverage) ---
  it('onDynamicSelectClicked should open modal and set selectedTimezone when dismissed with data', async () => {
    const newTimezone = 'Asia/Kolkata';
    (mockModalCtrl.create as jasmine.Spy).and.returnValue(Promise.resolve({
      onDidDismiss: () => Promise.resolve({ data: newTimezone }),
      present: () => Promise.resolve()
    } as any));

    component.selectedTimezone = 'UTC';
    await component.onDynamicSelectClicked();

    expect(component.selectedTimezone).toBe(newTimezone);
  });

  it('onDynamicSelectClicked should not change selectedTimezone when dismissed without data', async () => {
    const originalTimezone = component.selectedTimezone; 
    // Mock returns { data: null } by default, hitting the 'if (result.data)' false branch

    await component.onDynamicSelectClicked();

    expect(component.selectedTimezone).toBe(originalTimezone);
  });

  // --- onSubmit Tests (100% Coverage) ---
  
  it('onSubmit should call form1.onSubmit() only if isSubmited is false', () => {
    // 1. Initial call (isSubmited: false)
    component.isSubmited = false;
    component.onSubmit();
    expect(component.form1.onSubmit).toHaveBeenCalledTimes(1);
    
    // 2. Second call (isSubmited: true, after successful submission)
    component.isSubmited = true;
    component.onSubmit();
    expect(component.form1.onSubmit).toHaveBeenCalledTimes(1); 
  });

  it('onSubmit should not call requestSession when form is invalid', () => {
    spyOnProperty(component.form1.myForm, 'valid', 'get').and.returnValue(false);
    component.onSubmit();
    expect(mockSessionService.requestSession).not.toHaveBeenCalled();
    expect(mockUtil.convertDatesToTimezone).not.toHaveBeenCalled();
  });

  it('onSubmit success path: should call requestSession, navigate, show toast, reset form, and set isSubmited', async () => {
    component.isSubmited = false;
    component.ids = { requestee_id: 100 };
    component.selectedTimezone = 'Europe/Berlin';

    const successMessage = 'Request successful';
    (mockSessionService.requestSession as jasmine.Spy).and.returnValue(Promise.resolve({ message: successMessage }));

    component.onSubmit();

    // Await the promise resolution
    await (mockSessionService.requestSession as jasmine.Spy).calls.mostRecent().returnValue;

    // Assert service calls
    expect(mockUtil.convertDatesToTimezone).toHaveBeenCalledWith(
      jasmine.any(String), jasmine.any(String), 'Europe/Berlin'
    );
    expect(mockSessionService.requestSession).toHaveBeenCalled();
    
    // Assert post-success actions
    expect(mockRouter.navigate).toHaveBeenCalledWith([`/${CommonRoutes.TABS}/${CommonRoutes.REQUESTS}`]);
    expect(mockToast.showToast).toHaveBeenCalledWith(successMessage, 'success');
    expect(component.isSubmited).toBeTrue();
    expect(component.form1.reset).toHaveBeenCalled();
    expect(component.form1.myForm.markAsPristine).toHaveBeenCalled();
  });


  // Test Case for Error Path (100% Coverage on the .catch block)
  it('onSubmit error path: should handle rejection and prevent success side effects', async () => {
    component.isSubmited = false;
    
    // Arrange: Make requestSession return a rejected promise
    (mockSessionService.requestSession as jasmine.Spy).and.returnValue(Promise.reject('Network Error'));

    component.onSubmit();

    // The .catch block in the component is empty: `.catch((err) => {})`. 
    // We await to ensure the rejection is processed, even if it does nothing visible.
    try {
        await (mockSessionService.requestSession as jasmine.Spy).calls.mostRecent().returnValue;
    } catch (e) {
        // Expected to catch the rejection
    }
    
    // Assertions: only the preparation steps should run
    expect(mockSessionService.requestSession).toHaveBeenCalled();
    expect(mockUtil.convertDatesToTimezone).toHaveBeenCalled();
    expect(component.form1.myForm.markAsPristine).toHaveBeenCalled(); 
    
    // Assert that success actions did NOT run
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockToast.showToast).not.toHaveBeenCalled();
    expect(component.isSubmited).toBeFalse(); 
    expect(component.form1.reset).not.toHaveBeenCalled();
  });
});