import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule, AlertController, ModalController } from '@ionic/angular';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SearchAndSelectComponent } from './search-and-select.component';
import { HttpService, ToastService } from 'src/app/core/services';
import { of, throwError } from 'rxjs';

describe('SearchAndSelectComponent', () => {
  let component: SearchAndSelectComponent;
  let fixture: ComponentFixture<SearchAndSelectComponent>;
  let mockAlertController: jasmine.SpyObj<AlertController>;
  let mockModalController: jasmine.SpyObj<ModalController>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockHttpService: jasmine.SpyObj<HttpService>;

  beforeEach(async () => {
    mockAlertController = jasmine.createSpyObj('AlertController', ['create']);
    mockModalController = jasmine.createSpyObj('ModalController', ['create']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['instant']);
    mockToastService = jasmine.createSpyObj('ToastService', ['showToast']);
    mockHttpService = jasmine.createSpyObj('HttpService', ['get']);

    await TestBed.configureTestingModule({
      declarations: [SearchAndSelectComponent],
      imports: [
        IonicModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: AlertController, useValue: mockAlertController },
        { provide: ModalController, useValue: mockModalController },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: ToastService, useValue: mockToastService },
        { provide: HttpService, useValue: mockHttpService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchAndSelectComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    fixture.destroy();
  });

  describe('Component Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy();
    });

    it('should initialize with default values', () => {
      expect(component.touched).toBe(false);
      expect(component.selectedData).toEqual([]);
      expect(component.icon).toEqual({ name: 'add-outline', color: 'dark' });
    });

    it('should set originalLabel on ngOnInit', () => {
      component.control = { label: 'Test Label', meta: {} };
      component.ngOnInit();
      expect(component.originalLabel).toBe('Test Label');
    });

    it('should set isMobile based on window width on ngOnInit', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(800);
      component.control = { label: 'Test', meta: {} };
      component.ngOnInit();
      expect(component.isMobile).toBe(true);
    });

    it('should set isMobile to false when window width > 950', () => {
      spyOnProperty(window, 'innerWidth').and.returnValue(1200);
      component.control = { label: 'Test', meta: {} };
      component.ngOnInit();
      expect(component.isMobile).toBe(false);
    });

    it('should set allowCustomEntities from control meta', () => {
      component.control = { label: 'Test', meta: { allow_custom_entities: true } };
      component.ngOnInit();
      expect(component.allowCustomEntities).toBe(true);
    });

    it('should handle control meta that exists but has no allow_custom_entities', () => {
      component.control = { label: 'Test', meta: { someOtherProp: 'value' } };
      component.ngOnInit();
      expect(component.allowCustomEntities).toBeUndefined();
    });
  });

  describe('ControlValueAccessor Implementation', () => {
    it('should register onChange callback', () => {
      const mockFn = jasmine.createSpy('onChange');
      component.registerOnChange(mockFn);
      expect(component.onChange).toBe(mockFn);
    });

    it('should register onTouched callback', () => {
      const mockFn = jasmine.createSpy('onTouched');
      component.registerOnTouched(mockFn);
      expect(component.onTouched).toBe(mockFn);
    });

    it('should write value and populate selectedData', () => {
      const testData = [
        { id: '1', value: 'Option 1', name: 'Option 1' },
        { id: '2', value: 'Option 2', name: 'Option 2' }
      ];
      component.control = { 
        name: 'test', 
        meta: { searchData: testData } 
      };
      
      component.writeValue(testData);
      
      expect(component.selectedData).toEqual(testData);
      expect(component.selectedChips).toEqual(['1', '2']);
      expect(component.icon).toEqual({ name: 'close-circle-sharp', color: 'light' });
    });

    it('should set icon to addIconDark when no data selected', () => {
      component.control = { name: 'test', meta: {} };
      component.writeValue([]);
      expect(component.icon).toEqual({ name: 'add-outline', color: 'dark' });
    });

    it('should handle mentees control specifically', () => {
      const testData = [{ id: '1', value: 'Mentee 1', name: 'Mentee 1' }];
      component.control = { 
        name: 'mentees', 
        meta: { searchData: testData } 
      };
      
      component.writeValue(testData);
      
      expect(component.selectedData[0].isDisabled).toBe(true);
    });

    it('should handle undefined searchData in meta', () => {
      component.control = { 
        name: 'test', 
        meta: {} 
      };
      
      component.writeValue([]);
      
      expect(component.selectedData).toEqual([]);
    });
  });

  describe('markAsTouched', () => {
    it('should call onTouched and set touched to true', () => {
      spyOn(component, 'onTouched');
      component.markAsTouched();
      
      expect(component.onTouched).toHaveBeenCalled();
      expect(component.touched).toBe(true);
    });

    it('should not call onTouched if already touched', () => {
      component.touched = true;
      spyOn(component, 'onTouched');
      
      component.markAsTouched();
      
      expect(component.onTouched).not.toHaveBeenCalled();
    });
  });

  describe('handleCloseIconClick', () => {
    beforeEach(() => {
      component.control = { name: 'test', meta: {} };
      component.selectedData = [
        { id: '1', value: 'Item 1' },
        { id: '2', value: 'Item 2' },
        { id: '3', value: 'Item 3' }
      ];
      spyOn(component, 'onChange');
    });

    it('should remove item from selectedData', () => {
      const event = new Event('click');
      spyOn(event, 'stopPropagation');
      const removedItem = { id: '2', value: 'Item 2' };
      
      component.handleCloseIconClick(event, removedItem);
      
      expect(component.selectedData.length).toBe(2);
      expect(component.selectedData).not.toContain(removedItem);
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should call onChange with updated values', () => {
      const event = new Event('click');
      const removedItem = { id: '2', value: 'Item 2' };
      
      component.handleCloseIconClick(event, removedItem);
      
      expect(component.onChange).toHaveBeenCalledWith(['Item 1', 'Item 3']);
    });

    it('should disable mentee control when mentor_id is removed', () => {
      component.control = { name: 'mentor_id', meta: {} };
      const menteeControl = { disabled: false };
      (SearchAndSelectComponent as any).menteeControlRef = menteeControl;
      
      const event = new Event('click');
      const removedItem = { id: '1', value: 'Item 1' };
      
      component.handleCloseIconClick(event, removedItem);
      
      expect(menteeControl.disabled).toBe(true);
    });

    it('should handle removal when item has only value property', () => {
      component.selectedData = [
        { value: 'Item 1' },
        { value: 'Item 2' }
      ];
      
      const event = new Event('click');
      const removedItem = { value: 'Item 2' };
      
      component.handleCloseIconClick(event, removedItem);
      
      expect(component.selectedData.length).toBe(1);
      expect(component.selectedData[0].value).toBe('Item 1');
    });
  });

  describe('removeFile', () => {
    beforeEach(() => {
      mockTranslateService.instant.and.returnValue('Translation');
    });

    it('should remove file without API call for non-pre/post controls', () => {
      const files = [
        { name: 'file1.pdf', id: '1' },
        { name: 'file2.pdf', id: '2' }
      ];
      component.control = {
        name: 'documents',
        value: files,
        setValue: jasmine.createSpy('setValue')
      };
      
      component.removeFile(files[0], 0);
      
      expect(component.control.setValue).toHaveBeenCalledWith([files[1]]);
      expect(mockToastService.showToast).toHaveBeenCalled();
    });

    it('should call API for pre controls with id', fakeAsync(() => {
      const files = [{ name: 'file1.pdf', id: '123' }];
      component.control = {
        name: 'pre',
        value: files,
        setValue: jasmine.createSpy('setValue')
      };
      component.sessionId = 'session-123';
      
      mockHttpService.get.and.returnValue(Promise.resolve({ responseCode: 'OK' }));
      
      component.removeFile(files[0], 0);
      tick();
      
      expect(mockHttpService.get).toHaveBeenCalled();
      expect(mockToastService.showToast).toHaveBeenCalledWith('Translation', 'success');
    }));

    it('should call API for post controls with id', fakeAsync(() => {
      const files = [{ name: 'file1.pdf', id: '123' }];
      component.control = {
        name: 'post',
        value: files,
        setValue: jasmine.createSpy('setValue')
      };
      component.sessionId = 'session-123';
      
      mockHttpService.get.and.returnValue(Promise.resolve({ responseCode: 'OK' }));
      
      component.removeFile(files[0], 0);
      tick();
      
      expect(mockHttpService.get).toHaveBeenCalled();
      expect(mockToastService.showToast).toHaveBeenCalledWith('Translation', 'success');
    }));

    it('should show error toast when API call fails', fakeAsync(() => {
      const files = [{ name: 'file1.pdf', id: '123' }];
      component.control = {
        name: 'post',
        value: files,
        setValue: jasmine.createSpy('setValue')
      };
      component.sessionId = 'session-123';
      
      mockHttpService.get.and.returnValue(Promise.resolve({ responseCode: 'ERROR' }));
      
      component.removeFile(files[0], 0);
      tick();
      
      expect(mockToastService.showToast).toHaveBeenCalledWith('Translation', 'danger');
    }));

    it('should handle API error exception', fakeAsync(() => {
      const files = [{ name: 'file1.pdf', id: '123' }];
      component.control = {
        name: 'pre',
        value: files,
        setValue: jasmine.createSpy('setValue')
      };
      component.sessionId = 'session-123';
      
      mockHttpService.get.and.returnValue(Promise.reject('Network error'));
      
      component.removeFile(files[0], 0);
      tick();
      
      expect(mockToastService.showToast).toHaveBeenCalledWith('Translation', 'danger');
    }));

    it('should handle file without setValue method', () => {
      const files = [
        { name: 'file1.pdf', id: '1' },
        { name: 'file2.pdf', id: '2' }
      ];
      component.control = {
        name: 'documents',
        value: files
      };
      
      component.removeFile(files[0], 0);
      
      expect(component.control.value.length).toBe(1);
      expect(component.control.value[0].name).toBe('file2.pdf');
    });
  });

  describe('showPopover', () => {
    it('should emit showSelectionPopover event', () => {
      spyOn(component.showSelectionPopover, 'emit');
      component.control = { meta: { addPopupType: 'select' } };
      component.uniqueId = 'unique-123';
      
      component.showPopover();
      
      expect(component.showSelectionPopover.emit).toHaveBeenCalledWith({
        type: 'select',
        id: 'unique-123'
      });
    });

    it('should mark component as touched', () => {
      spyOn(component, 'markAsTouched');
      component.control = { meta: { addPopupType: 'select' } };
      
      component.showPopover();
      
      expect(component.markAsTouched).toHaveBeenCalled();
    });
  });

  describe('viewSelectedList', () => {
    it('should emit showSelectionPopover with view type', () => {
      spyOn(component.showSelectionPopover, 'emit');
      component.control = { meta: { addPopupType: 'select' } };
      component.uniqueId = 'unique-456';
      
      component.viewSelectedList();
      
      expect(component.showSelectionPopover.emit).toHaveBeenCalledWith({
        type: 'select view',
        id: 'unique-456'
      });
    });

    it('should mark component as touched', () => {
      spyOn(component, 'markAsTouched');
      component.control = { meta: { addPopupType: 'select' } };
      
      component.viewSelectedList();
      
      expect(component.markAsTouched).toHaveBeenCalled();
    });
  });

  describe('addNewOption', () => {
    it('should create alert with correct configuration', async () => {
      component.control = { label: 'Skills', meta: {} };
      mockTranslateService.instant.and.returnValue('Translated');
      
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      };
      mockAlertController.create.and.returnValue(Promise.resolve(mockAlert as any));
      
      await component.addNewOption();
      
      expect(mockAlertController.create).toHaveBeenCalled();
      const createConfig = mockAlertController.create.calls.mostRecent().args[0];
      expect(createConfig.header).toBe('Add Skills');
      expect(createConfig.inputs.length).toBe(1);
      expect(createConfig.inputs[0].name).toBe('name');
      expect(mockAlert.present).toHaveBeenCalled();
    });


    it('should update icon after adding option', fakeAsync(() => {
      component.control = { label: 'Skills', meta: {} };
      component.selectedData = [];
      component.selectedChips = [];
      
      let okHandler: any;
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      };
      
      mockAlertController.create.and.callFake((config: any) => {
        okHandler = config.buttons.find((btn: any) => btn.text === 'Translated').handler;
        return Promise.resolve(mockAlert as any);
      });
      
      mockTranslateService.instant.and.returnValue('Translated');
      
      component.addNewOption();
      tick();
      
      // Call the OK handler
      okHandler({ name: 'New Skill' });
      
      expect(component.icon).toEqual({ name: 'add-outline', color: 'dark' });
    }));

    it('should handle cancel button click', async () => {
      component.control = { label: 'Skills', meta: {} };
      component.selectedData = [];
      
      let cancelHandler: any;
      const mockAlert = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve())
      };
      
      mockAlertController.create.and.callFake((config: any) => {
        cancelHandler = config.buttons.find((btn: any) => btn.role === 'cancel').handler;
        return Promise.resolve(mockAlert as any);
      });
      
      mockTranslateService.instant.and.returnValue('Translated');
      
      await component.addNewOption();
      
      const initialLength = component.selectedData.length;
      cancelHandler();
      
      expect(component.selectedData.length).toBe(initialLength);
    });
  });

  describe('addLink', () => {
    it('should create modal with correct configuration', async () => {
      const testData = { value: [] };
      
      const mockModal = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ data: null })
        )
      };
      
      mockModalController.create.and.returnValue(Promise.resolve(mockModal as any));
      
      await component.addLink(testData);
      
      expect(mockModalController.create).toHaveBeenCalled();
      const callArgs = mockModalController.create.calls.mostRecent().args[0];
      expect(callArgs.cssClass).toBe('pre-custom-modal');
      expect(callArgs.componentProps).toEqual({
        data: testData,
        type: 'link',
        heading: 'ADD_LINK_POPUP'
      });
      expect(callArgs.backdropDismiss).toBe(false);
      expect(mockModal.present).toHaveBeenCalled();
    });

    it('should add link to data.value on successful dismiss', async () => {
      const testData = { value: [] };
      const newLink = { url: 'https://example.com', label: 'Example' };
      
      const mockModal = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ 
            data: { 
              success: true, 
              data: newLink 
            } 
          })
        )
      };
      
      mockModalController.create.and.returnValue(Promise.resolve(mockModal as any));
      
      await component.addLink(testData);
      
      expect(testData.value.length).toBe(1);
      expect(testData.value[0]).toEqual(newLink);
    });

    it('should not add link if modal dismissed without success', async () => {
      const testData = { value: [] };
      
      const mockModal = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ data: null })
        )
      };
      
      mockModalController.create.and.returnValue(Promise.resolve(mockModal as any));
      
      await component.addLink(testData);
      
      expect(testData.value.length).toBe(0);
    });

    it('should initialize value array if undefined', async () => {
      const testData: any = {};
      
      const mockModal = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ data: null })
        )
      };
      
      mockModalController.create.and.returnValue(Promise.resolve(mockModal as any));
      
      await component.addLink(testData);
      
      expect(testData.value).toEqual([]);
    });

    it('should not add link if success is false', async () => {
      const testData = { value: [] };
      
      const mockModal = {
        present: jasmine.createSpy('present').and.returnValue(Promise.resolve()),
        onDidDismiss: jasmine.createSpy('onDidDismiss').and.returnValue(
          Promise.resolve({ 
            data: { 
              success: false, 
              data: { url: 'test' } 
            } 
          })
        )
      };
      
      mockModalController.create.and.returnValue(Promise.resolve(mockModal as any));
      
      await component.addLink(testData);
      
      expect(testData.value.length).toBe(0);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle control with empty meta object', () => {
      component.control = { label: 'Test', meta: {} };
      expect(() => component.ngOnInit()).not.toThrow();
      expect(component.allowCustomEntities).toBeUndefined();
    });

    it('should handle empty selectedData array in handleCloseIconClick', () => {
      component.control = { name: 'test', meta: {} };
      component.selectedData = [];
      const event = new Event('click');
      
      expect(() => component.handleCloseIconClick(event, { id: '1' })).not.toThrow();
      expect(component.selectedData.length).toBe(0);
    });

    it('should handle undefined control.value in removeFile', () => {
      component.control = {
        name: 'documents',
        value: undefined
      };
      
      expect(() => component.removeFile({ id: '1' }, 0)).not.toThrow();
    });

    it('should handle writeValue with null value', () => {
      component.control = { name: 'test', meta: {} };
      
      expect(() => component.writeValue(null as any)).not.toThrow();
    });

    it('should handle showPopover when meta.addPopupType is undefined', () => {
      component.control = { meta: {} };
      spyOn(component, 'markAsTouched');
      spyOn(component.showSelectionPopover, 'emit');
      
      component.showPopover();
      
      expect(component.markAsTouched).toHaveBeenCalled();
      expect(component.showSelectionPopover.emit).toHaveBeenCalledWith({
        type: undefined,
        id: component.uniqueId
      });
    });
  });

  describe('Integration Tests', () => {
    it('should handle full workflow of adding and removing items', () => {
      component.control = { 
        name: 'test', 
        meta: { searchData: [] } 
      };
      component.writeValue([]);
      
      // Add item
      component.selectedData = [{ id: '1', value: 'Item 1' }];
      component.onChange(component.selectedData.map(d => d.value));
      
      // Remove item
      const event = new Event('click');
      component.handleCloseIconClick(event, component.selectedData[0]);
      
      expect(component.selectedData.length).toBe(0);
    });

    it('should properly update icon based on selectedData length', () => {
      component.control = { name: 'test', meta: {} };
      
      // Empty data
      component.writeValue([]);
      expect(component.icon.name).toBe('add-outline');
      
      // With data
      const testData = [{ id: '1', value: 'Item 1' }];
      component.control.meta.searchData = testData;
      component.writeValue(testData);
      expect(component.icon.name).toBe('close-circle-sharp');
    });

    it('should handle multiple file removals in sequence', () => {
      const files = [
        { name: 'file1.pdf', id: '1' },
        { name: 'file2.pdf', id: '2' },
        { name: 'file3.pdf', id: '3' }
      ];
      component.control = {
        name: 'documents',
        value: [...files],
        setValue: jasmine.createSpy('setValue')
      };
      
      component.removeFile(files[0], 0);
      expect(component.control.setValue).toHaveBeenCalledWith([files[1], files[2]]);
      
      // Update control.value for next removal
      component.control.value = [files[1], files[2]];
      component.removeFile(files[1], 0);
      expect(component.control.setValue).toHaveBeenCalledWith([files[2]]);
    });
  });
});