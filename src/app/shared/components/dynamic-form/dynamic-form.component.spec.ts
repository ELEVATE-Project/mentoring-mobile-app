import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick
} from '@angular/core/testing';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  CUSTOM_ELEMENTS_SCHEMA
} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { By } from '@angular/platform-browser';

import { DynamicFormComponent, JsonFormData } from './dynamic-form.component';
import { OWL_DATE_TIME_FORMATS } from '@danielmoncada/angular-datetime-picker';
import { AttachmentService, ToastService } from 'src/app/core/services';

// ---- Stubs for child components ----

@Component({
  selector: 'app-search-and-select',
  template: ''
})
class SearchAndSelectComponentStub {
  @Input() formControlName!: string;
  @Input() control: any;
  @Input() uniqueId: any;
  @Input() sessionId: any;
  @Output() showSelectionPopover = new EventEmitter<any>();
}

@Component({
  selector: 'app-input-chip',
  template: ''
})
class InputChipStub {
  @Input() formControlName!: string;
  @Input() label!: string;
  @Input() chips: any[] = [];
  @Input() showSelectAll!: boolean;
  @Input() showAddOption!: boolean;
  @Input() validators: any;
  @Input() allowCustomEntities!: boolean;
}

@Component({
  selector: 'app-star-rating',
  template: ''
})
class StarRatingStub {
  @Input() formControlName!: string;
  @Input() label!: string;
  @Input() numberOfStars!: number;
}

const TEST_DATE_FORMATS = {
  fullPickerInput: {},
  datePickerInput: {},
  timePickerInput: {},
  monthYearLabel: {},
  dateA11yLabel: {},
  monthYearA11yLabel: {}
};

describe('DynamicFormComponent', () => {
  let component: DynamicFormComponent;
  let fixture: ComponentFixture<DynamicFormComponent>;

  const mockToastService = jasmine.createSpyObj<ToastService>('ToastService', [
    'showToast'
  ]);
  const mockAttachmentService = jasmine.createSpyObj(
    'AttachmentService',
    ['upload']
  ) as jasmine.SpyObj<AttachmentService>;

  const mockJsonFormData: JsonFormData = {
    controls: [
      {
        name: 'firstName',
        label: 'First Name',
        value: '',
        type: 'text',
        class: 'col-12',
        position: 'left',
        validators: {
          required: true,
          maxLength: 10
        },
        errorMessage: {
          required: 'First name is required'
        },
        showField: true
      },
      {
        name: 'password',
        label: 'Password',
        value: '',
        type: 'password',
        class: 'col-12',
        position: 'left',
        validators: {
          required: true
        },
        errorMessage: {},
        showField: true
      },
      {
        name: 'role',
        label: 'Role',
        value: null,
        type: 'select',
        class: 'col-12',
        position: 'left',
        validators: {
          required: true
        },
        options: [
          { label: 'Teacher', value: 'teacher' },
          { label: 'Admin', value: 'admin' }
        ],
        errorMessage: {
          required: 'Role is required'
        },
        multiple: false,
        showField: true
      },
      {
        name: 'startDate',
        label: 'Start Date',
        value: null,
        type: 'date',
        class: 'col-12',
        position: 'left',
        validators: {
          required: true
        },
        errorMessage: {},
        showField: true
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        DynamicFormComponent,
        SearchAndSelectComponentStub,
        InputChipStub,
        StarRatingStub
      ],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        IonicModule.forRoot()
      ],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        { provide: AttachmentService, useValue: mockAttachmentService },
        { provide: OWL_DATE_TIME_FORMATS, useValue: TEST_DATE_FORMATS }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(DynamicFormComponent);
    component = fixture.componentInstance;
    component.jsonFormData = JSON.parse(JSON.stringify(mockJsonFormData));
  });

  function init() {
    spyOn(component.formValid, 'emit');
    fixture.detectChanges();
  }

  it('should create', () => {
    init();
    expect(component).toBeTruthy();
  });

  it('should build form controls based on jsonFormData and emit formValid', fakeAsync(() => {
    spyOn(component.formValid, 'emit');
    fixture.detectChanges();
    tick();

    expect(component.myForm.contains('firstName')).toBeTrue();
    expect(component.myForm.contains('password')).toBeTrue();
    expect(component.myForm.contains('role')).toBeTrue();
    expect(component.myForm.contains('startDate')).toBeTrue();

    expect(component.formValid.emit).toHaveBeenCalledWith(component.myForm.valid);
  }));

  it('should apply required and maxLength validators for firstName', fakeAsync(() => {
    init();
    tick();
    const firstNameControl = component.myForm.get('firstName')!;

    firstNameControl.setValue('');
    expect(firstNameControl.invalid).toBeTrue();
    expect(firstNameControl.errors?.['required']).toBeTrue();

    firstNameControl.setValue('thisislongerthan10');
    expect(firstNameControl.invalid).toBeTrue();
    expect(firstNameControl.errors?.['maxlength']).toBeTruthy();

    firstNameControl.setValue('John');
    expect(firstNameControl.valid).toBeTrue();
  }));

  it('should sort select options by label on init', () => {
    init();

    const roleConfig = component.jsonFormData.controls.find(
      c => c.name === 'role'
    );
    expect(roleConfig).toBeTruthy();
    const options = (roleConfig!.options || []) as any[];

    expect(options[0].label).toBe('Admin');
    expect(options[1].label).toBe('Teacher');
  });

  it('should initialize select value as empty string when value is null and multiple=false', fakeAsync(() => {
    init();
    tick();
    const roleFormControl = component.myForm.get('role')!;
    expect(roleFormControl.value).toBe('');
  }));

  it('compareWith should compare flattened values correctly', () => {
    init();
    expect(component.compareWith(['a'], ['a'])).toBeTrue();
    expect(component.compareWith('a', ['a'])).toBeTrue();
    expect(component.compareWith(['a', 'b'], ['a', 'b'])).toBeTrue();
    expect(component.compareWith(['a'], ['b'])).toBeFalse();
  });

  it('hideShowPassword should toggle password field type and set showPasswordIcon', () => {
    init();
    const pwdConfig = component.jsonFormData.controls.find(
      c => c.name === 'password'
    )!;
    expect(pwdConfig.type).toBe('password');

    component.hideShowPassword(pwdConfig);
    expect(pwdConfig.type).toBe('text');
    expect(pwdConfig.showPasswordIcon).toBeTrue();

    component.hideShowPassword(pwdConfig);
    expect(pwdConfig.type).toBe('password');
    expect(pwdConfig.showPasswordIcon).toBeTrue();
  });

  it('dateSelected should not allow date before currentDate', fakeAsync(() => {
    spyOn(component.formValid, 'emit');
    fixture.detectChanges();
    tick();

    const controlConfig = component.jsonFormData.controls.find(
      c => c.name === 'startDate'
    )!;
    const formControl = component.myForm.get('startDate')!;
    const today = new Date(2020, 0, 2);
    const yesterday = new Date(2020, 0, 1);

    component.currentDate = today;

    const event: any = { value: yesterday };

    component.dateSelected(event, controlConfig);

    expect(formControl.value).toEqual(today);
  }));

  it('selectionChanged should update jsonFormData and emit formValueChanged', () => {
    init();

    spyOn(component.formValueChanged, 'emit');
    const control = component.jsonFormData.controls.find(
      c => c.name === 'role'
    )!;
    const event: any = { detail: { value: 'admin' } };

    component.selectionChanged(control, event);

    const updated = component.jsonFormData.controls.find(
      c => c.name === 'role'
    )!;
    expect(updated.value).toBe('admin');
    expect(component.formValueChanged.emit).toHaveBeenCalledWith(control);
  });

  it('removeSpace should trim only leading spaces', () => {
    init();
    const event: any = { target: { value: '   hello world  ' } };
    component.removeSpace(event);
    expect(event.target.value).toBe('hello world  ');
  });

  it('onEnterPress should emit onEnter when form is valid', fakeAsync(() => {
    init();
    tick();
    spyOn(component.onEnter, 'emit');

    component.myForm.get('firstName')!.setValue('John');
    component.myForm.get('password')!.setValue('1234');
    component.myForm.get('role')!.setValue('admin');
    component.myForm.get('startDate')!.setValue(new Date());

    expect(component.myForm.valid).toBeTrue();

    const keyboardEvent = new KeyboardEvent('keyup', { key: 'Enter' });
    component.onEnterPress(keyboardEvent);

    expect(component.onEnter.emit).toHaveBeenCalledWith(keyboardEvent);
  }));

  it('onEnterPress should NOT emit onEnter when form is invalid', fakeAsync(() => {
    init();
    tick();
    spyOn(component.onEnter, 'emit');

    component.myForm.get('firstName')!.setValue('');
    expect(component.myForm.valid).toBeFalse();

    const keyboardEvent = new KeyboardEvent('keyup', { key: 'Enter' });
    component.onEnterPress(keyboardEvent);

    expect(component.onEnter.emit).not.toHaveBeenCalled();
  }));

  it('openDynamicSelectModal should emit dynamicSelectClicked', () => {
    init();
    spyOn(component.dynamicSelectClicked, 'emit');

    component.openDynamicSelectModal();

    expect(component.dynamicSelectClicked.emit).toHaveBeenCalled();
  });

  it('uploadPhoto with REMOVE_PHOTO should clear control value', fakeAsync(() => {
    init();
    tick();
    const control = component.jsonFormData.controls.find(
      c => c.name === 'firstName'
    )!;
    component.myForm.get('firstName')!.setValue('some value');

    component.uploadPhoto('REMOVE_PHOTO', control);

    expect(component.myForm.get('firstName')!.value).toBe('');
  }));

  it('isFormValid should return form statusChanges observable', () => {
    init();
    const status$ = component.isFormValid();
    expect(status$).toBe(component.myForm.statusChanges);
  });

  it('should initialize multiple select with empty array when value is null', fakeAsync(() => {
    component.jsonFormData = {
      controls: [
        {
          name: 'skills',
          label: 'Skills',
          value: null,
          type: 'select',
          class: 'col-12',
          position: 'left',
          validators: {},
          options: [
            { label: 'JavaScript', value: 'js' },
            { label: 'TypeScript', value: 'ts' }
          ],
          multiple: true,
          showField: true
        }
      ]
    };
    
    fixture.detectChanges();
    tick();

    const skillsControl = component.myForm.get('skills')!;
    expect(Array.isArray(skillsControl.value)).toBeTrue();
    expect(skillsControl.value).toEqual([]);
  }));

  it('should apply min validator', fakeAsync(() => {
    component.jsonFormData = {
      controls: [
        {
          name: 'age',
          label: 'Age',
          value: '',
          type: 'number',
          class: 'col-12',
          position: 'left',
          validators: { min: 18 },
          showField: true
        }
      ]
    };
    
    fixture.detectChanges();
    tick();

    const ageControl = component.myForm.get('age')!;
    ageControl.setValue(15);
    expect(ageControl.invalid).toBeTrue();
    expect(ageControl.errors?.['min']).toBeTruthy();

    ageControl.setValue(20);
    expect(ageControl.valid).toBeTrue();
  }));

  it('should apply max validator', fakeAsync(() => {
    component.jsonFormData = {
      controls: [
        {
          name: 'score',
          label: 'Score',
          value: '',
          type: 'number',
          class: 'col-12',
          position: 'left',
          validators: { max: 100 },
          showField: true
        }
      ]
    };
    
    fixture.detectChanges();
    tick();

    const scoreControl = component.myForm.get('score')!;
    scoreControl.setValue(150);
    expect(scoreControl.invalid).toBeTrue();
    expect(scoreControl.errors?.['max']).toBeTruthy();

    scoreControl.setValue(90);
    expect(scoreControl.valid).toBeTrue();
  }));

  it('should apply requiredTrue validator', fakeAsync(() => {
    component.jsonFormData = {
      controls: [
        {
          name: 'acceptTerms',
          label: 'Accept Terms',
          value: false,
          type: 'checkbox',
          class: 'col-12',
          position: 'left',
          validators: { requiredTrue: true },
          showField: true
        }
      ]
    };
    
    fixture.detectChanges();
    tick();

    const termsControl = component.myForm.get('acceptTerms')!;
    termsControl.setValue(false);
    expect(termsControl.invalid).toBeTrue();

    termsControl.setValue(true);
    expect(termsControl.valid).toBeTrue();
  }));

  it('should apply email validator', fakeAsync(() => {
    component.jsonFormData = {
      controls: [
        {
          name: 'email',
          label: 'Email',
          value: '',
          type: 'email',
          class: 'col-12',
          position: 'left',
          validators: { email: true },
          showField: true
        }
      ]
    };
    
    fixture.detectChanges();
    tick();

    const emailControl = component.myForm.get('email')!;
    emailControl.setValue('invalid-email');
    expect(emailControl.invalid).toBeTrue();

    emailControl.setValue('valid@email.com');
    expect(emailControl.valid).toBeTrue();
  }));

  it('should apply minLength validator', fakeAsync(() => {
    component.jsonFormData = {
      controls: [
        {
          name: 'username',
          label: 'Username',
          value: '',
          type: 'text',
          class: 'col-12',
          position: 'left',
          validators: { minLength: 5 },
          showField: true
        }
      ]
    };
    
    fixture.detectChanges();
    tick();

    const usernameControl = component.myForm.get('username')!;
    usernameControl.setValue('abc');
    expect(usernameControl.invalid).toBeTrue();

    usernameControl.setValue('abcdef');
    expect(usernameControl.valid).toBeTrue();
  }));

  it('should apply pattern validator', fakeAsync(() => {
    component.jsonFormData = {
      controls: [
        {
          name: 'phone',
          label: 'Phone',
          value: '',
          type: 'text',
          class: 'col-12',
          position: 'left',
          validators: { pattern: '^[0-9]{10}$' },
          showField: true
        }
      ]
    };
    
    fixture.detectChanges();
    tick();

    const phoneControl = component.myForm.get('phone')!;
    phoneControl.setValue('abc');
    expect(phoneControl.invalid).toBeTrue();

    phoneControl.setValue('1234567890');
    expect(phoneControl.valid).toBeTrue();
  }));

  it('should apply nullValidator', fakeAsync(() => {
    component.jsonFormData = {
      controls: [
        {
          name: 'optional',
          label: 'Optional',
          value: '',
          type: 'text',
          class: 'col-12',
          position: 'left',
          validators: { nullValidator: true },
          showField: true
        }
      ]
    };
    
    fixture.detectChanges();
    tick();

    const optionalControl = component.myForm.get('optional')!;
    expect(optionalControl.valid).toBeTrue();
  }));

  it('should handle disabled controls', fakeAsync(() => {
    component.jsonFormData = {
      controls: [
        {
          name: 'readonly',
          label: 'Readonly',
          value: 'test',
          type: 'text',
          class: 'col-12',
          position: 'left',
          validators: {},
          disabled: true,
          showField: true
        }
      ]
    };
    
    fixture.detectChanges();
    tick();

    const readonlyControl = component.myForm.get('readonly')!;
    expect(readonlyControl.disabled).toBeTrue();
  }));

  it('should disable form when readonly input is true', fakeAsync(() => {
    component.readonly = true;
    fixture.detectChanges();
    tick();

    expect(component.myForm.disabled).toBeTrue();
  }));

  it('should handle state/district/block/cluster/school control values with label', fakeAsync(() => {
    component.jsonFormData = {
      controls: [
        {
          name: 'state',
          label: 'State',
          value: { label: 'Karnataka', value: 'KA' },
          type: 'text',
          class: 'col-12',
          position: 'left',
          validators: {},
          showField: true
        }
      ]
    };
    
    spyOn(component.formValid, 'emit');
    fixture.detectChanges();
    tick();

    const stateControl = component.myForm.get('state')!;
    expect(stateControl.value).toBe('Karnataka');
  }));

  it('should handle professional_role control value with label', fakeAsync(() => {
    component.jsonFormData = {
      controls: [
        {
          name: 'professional_role',
          label: 'Professional Role',
          value: { label: 'Developer', value: 'dev' },
          type: 'text',
          class: 'col-12',
          position: 'left',
          validators: {},
          showField: true
        }
      ]
    };
    
    spyOn(component.formValid, 'emit');
    fixture.detectChanges();
    tick();

    const roleControl = component.myForm.get('professional_role')!;
    expect(roleControl.value).toBe('Developer');
  }));

  it('should reset form when reset is called', fakeAsync(() => {
    init();
    tick();
    
    component.myForm.get('firstName')!.setValue('John');
    component.reset();
    
    expect(component.myForm.get('firstName')!.value).toBeNull();
  }));

  it('should call onSubmit', () => {
    init();
    spyOn(component, 'isFormValid');
    component.onSubmit();
    expect(component.isFormValid).toHaveBeenCalled();
  });

  it('uploadPhoto with ADD_PHOTO should trigger file input click', fakeAsync(() => {
    const control = { name: 'photo' };
    component.jsonFormData = {
      controls: [
        {
          name: 'photo',
          label: 'Photo',
          value: '',
          type: 'file',
          class: 'col-12',
          position: 'left',
          validators: {},
          showField: true
        }
      ]
    };
    
    fixture.detectChanges();
    tick();

    const fileInput = document.createElement('input');
    fileInput.id = 'photo-file';
    fileInput.type = 'file';
    document.body.appendChild(fileInput);
    
    spyOn(fileInput, 'click');
    spyOn(document, 'querySelector').and.returnValue(fileInput);

    component.uploadPhoto('ADD_PHOTO', control);

    expect(document.querySelector).toHaveBeenCalledWith('#photo-file');
    expect(fileInput.click).toHaveBeenCalled();

    document.body.removeChild(fileInput);
  }));

  it('upload should read file and set form control value', fakeAsync(() => {
    const control = { name: 'photo' };
    component.jsonFormData = {
      controls: [
        {
          name: 'photo',
          label: 'Photo',
          value: '',
          type: 'file',
          class: 'col-12',
          position: 'left',
          validators: {},
          showField: true
        }
      ]
    };
    
    fixture.detectChanges();
    tick();

    const mockFile = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const mockEvent = {
      target: {
        files: [mockFile]
      }
    };

    const mockReader = {
      onload: null as any,
      readAsDataURL: jasmine.createSpy('readAsDataURL').and.callFake(function() {
        this.onload();
      }),
      result: 'data:image/jpeg;base64,mockdata'
    };

    spyOn(window as any, 'FileReader').and.returnValue(mockReader);

    component.upload(mockEvent, control);

    expect(mockReader.readAsDataURL).toHaveBeenCalledWith(mockFile);
    expect(component.myForm.get('photo')!.value).toBe('data:image/jpeg;base64,mockdata');
  }));

  it('clearFileInput should clear file input value', () => {
    const control = { name: 'photo' };
    const fileInput = document.createElement('input');
    fileInput.id = 'photo-file';
    fileInput.type = 'file';
    document.body.appendChild(fileInput);

    spyOn(document, 'querySelector').and.returnValue(fileInput);

    component.clearFileInput(control);

    expect(document.querySelector).toHaveBeenCalledWith('#photo-file');
    expect(fileInput.value).toBe('');

    document.body.removeChild(fileInput);
  });

  it('dateSelected should update dependent child date when event value is greater', fakeAsync(() => {
    component.jsonFormData = {
      controls: [
        {
          name: 'startDate',
          label: 'Start Date',
          value: null,
          type: 'date',
          class: 'col-12',
          position: 'left',
          validators: {},
          dependedChild: 'endDate',
          showField: true
        },
        {
          name: 'endDate',
          label: 'End Date',
          value: new Date(2020, 0, 1),
          type: 'date',
          class: 'col-12',
          position: 'left',
          validators: {},
          showField: true
        }
      ]
    };
    
    fixture.detectChanges();
    tick();

    const startControl = component.jsonFormData.controls[0];
    const laterDate = new Date(2020, 0, 10);
    component.currentDate = new Date(2020, 0, 1);

    const event: any = { value: laterDate };

    component.dateSelected(event, startControl);

    expect(component.myForm.get('endDate')!.value).toEqual(laterDate);
  }));

  it('dateInputClick should set selected date and open picker', fakeAsync(() => {
    const control = { name: 'startDate' };
    const mockDatetimePicker = {
      _selected: null,
      open: jasmine.createSpy('open')
    };

    component.jsonFormData = {
      controls: [
        {
          name: 'startDate',
          label: 'Start Date',
          value: new Date(2020, 0, 1),
          type: 'date',
          class: 'col-12',
          position: 'left',
          validators: {},
          showField: true
        }
      ]
    };
    
    fixture.detectChanges();
    tick();

    const testDate = new Date(2020, 0, 5);
    component.myForm.get('startDate')!.setValue(testDate);

    component.dateInputClick(control, mockDatetimePicker);
    
    expect(mockDatetimePicker._selected).toBe(testDate);
    
    tick(500);
    expect(mockDatetimePicker.open).toHaveBeenCalled();
  }));

  it('searchEventEmitter should emit custom event with form control', fakeAsync(() => {
    init();
    tick();

    const mockComponent = new SearchAndSelectComponentStub();
    mockComponent.uniqueId = 'test-id';
    
    component.searchAndSelectComponents = {
      find: jasmine.createSpy('find').and.returnValue(mockComponent)
    } as any;

    spyOn(component.customEventEmitter, 'emit');

    const event = { id: 'test-id', data: 'test' };
    component.searchEventEmitter(event);

    expect(component.customEventEmitter.emit).toHaveBeenCalledWith({
      id: 'test-id',
      data: 'test',
      formControl: mockComponent
    });
  }));

  it('searchEventEmitter should not emit when component not found', fakeAsync(() => {
    init();
    tick();

    component.searchAndSelectComponents = {
      find: jasmine.createSpy('find').and.returnValue(undefined)
    } as any;

    spyOn(component.customEventEmitter, 'emit');

    const event = { id: 'unknown-id', data: 'test' };
    component.searchEventEmitter(event);

    expect(component.customEventEmitter.emit).not.toHaveBeenCalled();
  }));

  it('should handle select with value.value property', fakeAsync(() => {
    component.jsonFormData = {
      controls: [
        {
          name: 'category',
          label: 'Category',
          value: { value: 'tech', label: 'Technology' },
          type: 'select',
          class: 'col-12',
          position: 'left',
          validators: {},
          multiple: false,
          showField: true
        }
      ]
    };
    
    fixture.detectChanges();
    tick();

    const categoryControl = component.myForm.get('category')!;
    expect(categoryControl.value).toBe('tech');
  }));
});