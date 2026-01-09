import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ModelComponent } from './model.component';
import { UtilService } from 'src/app/core/services';
import { DynamicFormComponent } from '../dynamic-form/dynamic-form.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('ModelComponent', () => {
  let component: ModelComponent;
  let fixture: ComponentFixture<ModelComponent>;
  let mockUtilService: any;

  beforeEach(waitForAsync(() => {
    mockUtilService = {
      modal: {
        dismiss: jasmine.createSpy('dismiss')
      }
    };

    TestBed.configureTestingModule({
      declarations: [ModelComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: UtilService, useValue: mockUtilService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(ModelComponent);
    component = fixture.componentInstance;
    component.data = {
      form: {
        controls: [
          { name: 'field1' },
          { name: 'field2' }
        ]
      },
      field1: 'value1'
    };
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize formData on init', () => {
    expect(component.formData).toEqual(component.data.form);
  });

  it('should fill form values', () => {
    const mockControls = {
      field1: { setValue: jasmine.createSpy('setValue') },
      field2: { setValue: jasmine.createSpy('setValue') }
    };
    component.form1 = {
      myForm: {
        controls: mockControls
      }
    } as any;

    component.fillFormValues();

    expect(mockControls.field1.setValue).toHaveBeenCalledWith('value1');
    expect(mockControls.field2.setValue).not.toHaveBeenCalled(); // field2 is not in data
  });

  it('should fill form values on formValid', () => {
    spyOn(component, 'fillFormValues');
    component.formValid();
    expect(component.fillFormValues).toHaveBeenCalled();
  });

  it('should dismiss modal on closeModal', () => {
    component.closeModal();
    expect(mockUtilService.modal.dismiss).toHaveBeenCalled();
  });
});
