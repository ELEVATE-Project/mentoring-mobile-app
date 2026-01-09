import 'zone.js';          
import 'zone.js/testing';  

import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { PreAlertModalComponent } from './pre-alert-modal.component';
import { ModalController, ActionSheetController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ToastService, UtilService } from 'src/app/core/services';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { of } from 'rxjs';

// --- Mock pipe to stub ngx-translate pipe usage in template ---
@Pipe({ name: 'translate' })
class MockTranslatePipe implements PipeTransform {
  transform(value: any, ...args: any[]) {
    // return key directly or a mock string; keeps template stable in unit tests
    return value ?? 'mock-translation';
  }
}
// --- End mock pipe ---

describe('PreAlertModalComponent', () => {
  let component: PreAlertModalComponent;
  let fixture: ComponentFixture<PreAlertModalComponent>;
  let modalControllerSpy: jasmine.SpyObj<ModalController>;
  let utilServiceSpy: jasmine.SpyObj<UtilService>;
  let actionSheetControllerSpy: jasmine.SpyObj<ActionSheetController>;
  let translateServiceSpy: jasmine.SpyObj<TranslateService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;

  beforeEach(waitForAsync(() => {
    modalControllerSpy = jasmine.createSpyObj('ModalController', ['dismiss']);
    utilServiceSpy = jasmine.createSpyObj('UtilService', ['uploadFile']);
    actionSheetControllerSpy = jasmine.createSpyObj('ActionSheetController', ['create']);

    // Keep translate spy in case the component calls TranslateService directly
    translateServiceSpy = jasmine.createSpyObj('TranslateService', ['instant', 'get']);
    translateServiceSpy.get.and.returnValue(of('mock translation'));

    toastServiceSpy = jasmine.createSpyObj('ToastService', ['presentToast']);

    TestBed.configureTestingModule({
      // No TranslateModule.forRoot() — we use MockTranslatePipe to satisfy template pipe usage
      declarations: [PreAlertModalComponent, MockTranslatePipe],
      providers: [
        { provide: ModalController, useValue: modalControllerSpy },
        { provide: UtilService, useValue: utilServiceSpy },
        { provide: ActionSheetController, useValue: actionSheetControllerSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(PreAlertModalComponent);
    component = fixture.componentInstance;

    // minimal input used by template to prevent undefined errors
    component.data = { name: 'TestType' };

    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onLinkInput', () => {
    it('should reset error if input is empty', () => {
      component.link = '   ';
      component.showLinkError = true;

      component.onLinkInput();

      expect(component.showLinkError).toBeFalse();
    });

    it('should set error to false for valid https url', () => {
      component.link = 'https://google.com';
      component.onLinkInput();
      expect(component.showLinkError).toBeFalse();
    });

    it('should set error to false for valid http url', () => {
      component.link = 'http://example.com/path?query=1';
      component.onLinkInput();
      expect(component.showLinkError).toBeFalse();
    });

    it('should set error to true for invalid url (missing protocol)', () => {
      component.link = 'www.google.com';
      component.onLinkInput();
      expect(component.showLinkError).toBeTrue();
    });

    it('should set error to true for invalid url string', () => {
      component.link = 'not-a-url';
      component.onLinkInput();
      expect(component.showLinkError).toBeTrue();
    });
  });

  describe('dismissModal', () => {
    it('should reset error and dismiss modal', () => {
      component.showLinkError = true;

      component.dismissModal();

      expect(component.showLinkError).toBeFalse();
      expect(modalControllerSpy.dismiss).toHaveBeenCalled();
    });
  });

  describe('saveLink', () => {
    it('should dismiss with FILE object when type is "file"', () => {
      component.type = 'file';
      const mockFile = new File([''], 'test-file.png');
      component.uploadedFile = mockFile;
      component.name = 'Custom Name';

      component.saveLink();

      expect(modalControllerSpy.dismiss).toHaveBeenCalledWith({
        data: {
          name: 'Custom Name',
          file: mockFile
        },
        success: true
      });
    });

    it('should use filename if name input is empty when saving file', () => {
      component.type = 'file';
      const mockFile = new File([''], 'original.png');
      component.uploadedFile = mockFile;
      component.name = '';

      component.saveLink();

      expect(modalControllerSpy.dismiss).toHaveBeenCalledWith(jasmine.objectContaining({
        data: jasmine.objectContaining({
          name: 'original.png'
        })
      }));
    });

    it('should dismiss with LINK object when type is "link"', () => {
      component.type = 'link';
      component.link = 'https://test.com';
      component.name = 'Link Name';
      component.data = { name: 'Category1' };

      component.saveLink();

      expect(modalControllerSpy.dismiss).toHaveBeenCalledWith({
        data: {
          name: 'Link Name',
          link: 'https://test.com',
          type: 'Category1',
          isLink: true,
          isNew: true
        },
        success: true
      });
    });

    it('should use link url as name if name input is empty', () => {
      component.type = 'link';
      component.link = 'https://test.com';
      component.name = '';

      component.saveLink();

      expect(modalControllerSpy.dismiss).toHaveBeenCalledWith(jasmine.objectContaining({
        data: jasmine.objectContaining({
          name: 'https://test.com'
        })
      }));
    });
  });

  describe('selectFile', () => {
    it('should call utilService.uploadFile and set uploadedFile on success', fakeAsync(() => {
      const mockFile = new File(['content'], 'test.pdf');
      utilServiceSpy.uploadFile.and.returnValue(Promise.resolve(mockFile));

      component.allowedFileTypes = ['pdf'];
      component.maxSize = 5;
      component.errorMsg = 'Error';

      component.selectFile();
      tick(); // resolve promise

      expect(utilServiceSpy.uploadFile).toHaveBeenCalledWith(['pdf'], 5, 'Error');
      expect(component.uploadedFile).toBe(mockFile);
    }));

    it('should log error if upload fails', fakeAsync(() => {
      spyOn(console, 'error');
      utilServiceSpy.uploadFile.and.returnValue(Promise.reject('Upload Failed'));

      component.selectFile();
      tick();

      expect(console.error).toHaveBeenCalledWith('File upload failed:', 'Upload Failed');
      expect(component.uploadedFile).toBeUndefined();
    }));
  });

  describe('removeFile', () => {
    it('should set uploadedFile to null', () => {
      component.uploadedFile = new File([''], 'test.png');
      component.removeFile();
      expect(component.uploadedFile).toBeNull();
    });
  });

  describe('openFilePicker', () => {
    // ensure no lingering spies between tests
    beforeEach(() => {
      // Nothing here for now; userAgent stubs are created per-test below with spyOnProperty
    });

    it('should call selectFile directly on Desktop (non-mobile)', async () => {
      // Stub userAgent getter
      const uaSpy = spyOnProperty(navigator, 'userAgent', 'get').and.returnValue('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');

      spyOn(component, 'selectFile');

      await component.openFilePicker();

      expect(component.selectFile).toHaveBeenCalled();
      expect(actionSheetControllerSpy.create).not.toHaveBeenCalled();

      // restore
      uaSpy.and.callThrough();
    });

    it('should open ActionSheet on Mobile', async () => {
      const uaSpy = spyOnProperty(navigator, 'userAgent', 'get').and.returnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X)');

      const actionSheetSpyObj = jasmine.createSpyObj('HTMLIonActionSheetElement', ['present']);
      actionSheetControllerSpy.create.and.returnValue(Promise.resolve(actionSheetSpyObj));

      await component.openFilePicker();

      expect(actionSheetControllerSpy.create).toHaveBeenCalled();
      expect(actionSheetSpyObj.present).toHaveBeenCalled();

      uaSpy.and.callThrough();
    });

    it('should trigger selectFile when "File" button is clicked in ActionSheet', async () => {
      const uaSpy = spyOnProperty(navigator, 'userAgent', 'get').and.returnValue('Android');

      const actionSheetSpyObj = jasmine.createSpyObj('HTMLIonActionSheetElement', ['present']);
      actionSheetControllerSpy.create.and.returnValue(Promise.resolve(actionSheetSpyObj));
      spyOn(component, 'selectFile');

      await component.openFilePicker();

      // verify the create() config and invoke the "File" handler
      const createArgs = actionSheetControllerSpy.create.calls.mostRecent().args[0];
      const fileButton = createArgs.buttons?.find((b: any) => b.text === 'File') as any;

      if (fileButton && fileButton.handler) {
        fileButton.handler();
      }

      expect(component.selectFile).toHaveBeenCalled();

      uaSpy.and.callThrough();
    });
  });
});
