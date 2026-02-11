import 'zone.js';          
import 'zone.js/testing';  

/* input-chip.component.spec.ts */
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { InputChipComponent } from './input-chip.component';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ToastService } from 'src/app/core/services';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('InputChipComponent', () => {
  let component: InputChipComponent;
  let fixture: ComponentFixture<InputChipComponent>;

  // mocks
  let mockAlertController: jasmine.SpyObj<AlertController>;
  let mockTranslate: jasmine.SpyObj<TranslateService>;
  let mockToast: jasmine.SpyObj<ToastService>;

  // alert captured for tests
  let createdAlert: any;

  beforeEach(waitForAsync(async () => {
    mockAlertController = jasmine.createSpyObj('AlertController', ['create']);
    mockTranslate = jasmine.createSpyObj('TranslateService', ['instant']);
    mockToast = jasmine.createSpyObj('ToastService', ['showToast']);

    // Translate.instant should return the key for simplicity
    mockTranslate.instant.and.callFake((key: string) => key);

    // IMPORTANT: preserve opts.buttons when the component passes them
    mockAlertController.create.and.callFake((opts: any) => {
      // If the component supplied buttons in opts, keep them (so their handlers remain).
      // Otherwise, provide a minimal fallback.
      const buttons = opts && opts.buttons ? opts.buttons : [
        { text: mockTranslate.instant('CANCEL'), role: 'cancel' },
        { text: mockTranslate.instant('OK'), handler: (d: any) => true }
      ];

      // capture the same opts object so tests can inspect header/inputs/buttons
      createdAlert = {
        ...opts,
        buttons,
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      };
      return Promise.resolve(createdAlert);
    });

    await TestBed.configureTestingModule({
      declarations: [InputChipComponent],
      providers: [
        { provide: AlertController, useValue: mockAlertController },
        { provide: TranslateService, useValue: mockTranslate },
        { provide: ToastService, useValue: mockToast }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(InputChipComponent);
    component = fixture.componentInstance;

    // default inputs
    component.label = 'Tag';
    component.chips = [
      { label: 'A', value: 'A' },
      { label: 'B', value: 'B' },
    ];
    component.showAddOption = true;
    component.showSelectAll = true;
    // safe default so template checks like validators.required don't throw
    component.validators = {}; // or { required: false } if your template expects that
    component.allowCustomEntities = false;

    // defensive defaults used by the template
    component.selectedChips = new Set();
    component.disabled = false;
    component._selectAll = false;

    // ensure lifecycle runs so lowerCaseLabel is set
    component.ngOnInit();

    fixture.detectChanges();
    await fixture.whenStable();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('ngOnInit should set lowerCaseLabel', () => {
    component.label = 'MyLabel';
    component.ngOnInit();
    expect(component.lowerCaseLabel).toBe('mylabel');
  });

  it('writeValue should populate selectedChips set and set _selectAll when all selected', () => {
    // mark value as selecting the first chip only
    component.writeValue([ component.chips[0] ]);
    expect(component.selectedChips).toBeDefined();
    expect(component.selectedChips.size).toBe(1);
    // now pass both -> should set selectAll true
    component.writeValue([ component.chips[0], component.chips[1] ]);
    expect(component._selectAll).toBeTrue();
  });

  it('registerOnChange and registerOnTouched should set callbacks', () => {
    const changeFn = jasmine.createSpy('onChangeFn');
    const touchedFn = jasmine.createSpy('onTouchedFn');

    component.registerOnChange(changeFn);
    component.registerOnTouched(touchedFn);

    // simulate an internal call
    (component as any).onChange('x');
    (component as any).onTouched();

    expect(changeFn).toHaveBeenCalledWith('x');
    expect(touchedFn).toHaveBeenCalled();
  });

  it('markAsTouched should call onTouched only once', () => {
    const touchedFn = jasmine.createSpy('onTouchedFn');
    component.registerOnTouched(touchedFn);

    component.touched = false;
    component.markAsTouched();
    component.markAsTouched(); // second call should not call again
    expect(touchedFn).toHaveBeenCalledTimes(1);
    expect(component.touched).toBeTrue();
  });

  it('setDisabledState should update disabled flag', () => {
    component.setDisabledState(true);
    // run change detection to let template update/validate
    fixture.detectChanges();
    expect(component.disabled).toBeTrue();

    component.setDisabledState(false);
    fixture.detectChanges();
    expect(component.disabled).toBeFalse();
  });

  it('onChipClick should toggle selection and call onChange with array or "" when empty', () => {
    const changeSpy = jasmine.createSpy('changeSpy');
    component.registerOnChange(changeSpy);

    // ensure initial set
    component.selectedChips = new Set();

    // click to add first chip
    component.onChipClick(component.chips[0]);
    expect(component.selectedChips.has(component.chips[0])).toBeTrue();
    expect(changeSpy).toHaveBeenCalledWith([component.chips[0]]);
    changeSpy.calls.reset();

    // click again to remove it -> should call onChange with ''
    component.onChipClick(component.chips[0]);
    expect(component.selectedChips.has(component.chips[0])).toBeFalse();
    expect(changeSpy).toHaveBeenCalledWith('');
  });

  it('onChipClick should not change selection when disabled', () => {
    const changeSpy = jasmine.createSpy('changeSpy');
    component.registerOnChange(changeSpy);

    component.disabled = true;
    component.selectedChips = new Set();
    fixture.detectChanges();

    component.onChipClick(component.chips[0]);
    expect(component.selectedChips.size).toBe(0);
    expect(changeSpy).not.toHaveBeenCalled();
  });

  it('selectAll should select or clear all chips and call onChange appropriately', () => {
    const changeSpy = jasmine.createSpy('changeSpy');
    component.registerOnChange(changeSpy);

    component.selectedChips = new Set();
    // enable select all toggle -> when _selectAll true, add all
    component._selectAll = true;
    component.selectAll();
    expect(component.selectedChips.size).toBe(component.chips.length);
    // assert exact content
    expect(Array.from(component.selectedChips)).toEqual(component.chips);
    expect(changeSpy).toHaveBeenCalledWith(component.chips);
    changeSpy.calls.reset();

    // disable select all -> clear
    component._selectAll = false;
    component.selectAll();
    expect(component.selectedChips.size).toBe(0);
    expect(changeSpy).toHaveBeenCalledWith('');
  });

  describe('addNewOption alert flow', () => {

    beforeEach(() => {
      // reset toast spy for each test
      mockToast.showToast.calls.reset();
    });

    it('addNewOption should create and present alert', async () => {
      await component.addNewOption();
      expect(mockAlertController.create).toHaveBeenCalled();
      expect(createdAlert.present).toHaveBeenCalled();
      // ensure header uses lowerCaseLabel
      expect(createdAlert.header).toContain(component.lowerCaseLabel || 'tag');
    });

    it('OK handler should add new valid option and call onChipClick', async () => {
      const changeSpy = jasmine.createSpy('changeSpy');
      component.registerOnChange(changeSpy);

      await component.addNewOption(); // creates alert and presents

      // The component supplies buttons in opts, so createdAlert.buttons should be the same array,
      // and the OK button handler will be the component's handler — find it.
      const okButton = createdAlert.buttons.find((b: any) => b && b.text && b.text !== mockTranslate.instant('CANCEL'));
      expect(okButton).toBeDefined();
      expect(typeof okButton.handler).toBe('function');

      // simulate user entering valid input and pressing OK
      const newLabel = 'NewChip';
      const result = okButton.handler({ chip: newLabel });

      // handler for valid input should not return false
      expect(result).not.toBeFalse();
      // handler should have added the chip
      expect(component.chips.some((c: any) => c.value === newLabel)).toBeTrue();
      // since handler calls onChipClick, changeSpy should have been called
      expect(changeSpy).toHaveBeenCalled();
    });

    it('OK handler should show toast and return false for invalid input (special chars or empty)', async () => {
      await component.addNewOption();
      const okButton = createdAlert.buttons.find((b: any) => b && b.text && b.text !== mockTranslate.instant('CANCEL'));
      expect(okButton).toBeDefined();
      expect(typeof okButton.handler).toBe('function');

      // invalid: empty (only whitespace)
      mockToast.showToast.calls.reset();
      const ret1 = okButton.handler({ chip: '   ' });
      expect(mockToast.showToast).toHaveBeenCalledWith('INPUT_CHIP_ERROR_TOAST_MESSAGE', 'danger');
      expect(ret1).toBeFalse();

      // invalid: contains special characters
      mockToast.showToast.calls.reset();
      const ret2 = okButton.handler({ chip: 'abc$%' });
      expect(mockToast.showToast).toHaveBeenCalledWith('INPUT_CHIP_ERROR_TOAST_MESSAGE', 'danger');
      expect(ret2).toBeFalse();
    });
  });
});
