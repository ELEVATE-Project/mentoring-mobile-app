import 'zone.js';          
import 'zone.js/testing';  

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, ElementRef } from '@angular/core';
import { ProfileImageComponent } from './profile-image.component';
import { AttachmentService, ToastService, UtilService } from 'src/app/core/services';

describe('ProfileImageComponent', () => {
  let component: ProfileImageComponent;
  let fixture: ComponentFixture<ProfileImageComponent>;
  let attachmentServiceSpy: jasmine.SpyObj<AttachmentService>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let utilServiceSpy: jasmine.SpyObj<UtilService>;

  // Mock ElementRef for @ViewChild('fileUpload')
  const mockFileUpload = {
    nativeElement: {
      value: 'some/path/to/file.jpg',
      setAttribute: jasmine.createSpy('setAttribute'),
      removeAttribute: jasmine.createSpy('removeAttribute'),
      click: jasmine.createSpy('click'),
    },
  } as unknown as ElementRef;

  beforeEach(waitForAsync(() => {
    // Create Spies for dependencies
    attachmentServiceSpy = jasmine.createSpyObj('AttachmentService', ['someMethod']); // Mock any methods used in the future
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['showToast']);
    utilServiceSpy = jasmine.createSpyObj('UtilService', ['isMobile']);
    
    // Set the default return value for isMobile
    utilServiceSpy.isMobile.and.returnValue(false);

    TestBed.configureTestingModule({
      declarations: [ProfileImageComponent],
      providers: [
        { provide: AttachmentService, useValue: attachmentServiceSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: UtilService, useValue: utilServiceSpy },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileImageComponent);
    component = fixture.componentInstance;
    
    // Manually set the ViewChild mock object
    component.fileUpload = mockFileUpload;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.isMobile).toBeFalse(); // Check initialization from utilService
  });

  it('should initialize isMobile property correctly (mobile case)', () => {
    // Re-instantiate the component after changing the spy return value
    utilServiceSpy.isMobile.and.returnValue(true);
    const mobileFixture = TestBed.createComponent(ProfileImageComponent);
    const mobileComponent = mobileFixture.componentInstance;
    mobileFixture.detectChanges();
    expect(mobileComponent.isMobile).toBeTrue();
  });

  describe('clearFileInput', () => {
    it('should clear the nativeElement value if fileUpload exists', () => {
      // Re-assigning the mock just before the test runs to prevent undefined issues
      component.fileUpload = mockFileUpload; 
      
      component.clearFileInput();
      expect(component.fileUpload.nativeElement.value).toEqual('');
    });

    it('should not throw error if fileUpload is undefined', () => {
      component.fileUpload = undefined;
      // Expect no exception to be thrown
      expect(() => component.clearFileInput()).not.toThrow();
    });
  });

  describe('uploadPhoto', () => {
    beforeEach(() => {
      // Reset spies before each uploadPhoto test
      mockFileUpload.nativeElement.setAttribute.calls.reset();
      mockFileUpload.nativeElement.removeAttribute.calls.reset();
      mockFileUpload.nativeElement.click.calls.reset();
    });

    it('should set capture="environment" and click for CAMERA source', async () => {
      await component.uploadPhoto('CAMERA');
      expect(mockFileUpload.nativeElement.setAttribute).toHaveBeenCalledWith('capture', 'environment');
      expect(mockFileUpload.nativeElement.click).toHaveBeenCalled();
    });

    it('should remove capture attribute and click for ADD_PHOTO source', async () => {
      await component.uploadPhoto('ADD_PHOTO');
      expect(mockFileUpload.nativeElement.removeAttribute).toHaveBeenCalledWith('capture');
      expect(mockFileUpload.nativeElement.click).toHaveBeenCalled();
    });

    it('should emit imageRemoveEvent and show success toast for REMOVE_PHOTO source', async () => {
      spyOn(component.imageRemoveEvent, 'emit');
      await component.uploadPhoto('REMOVE_PHOTO');
      expect(component.imageRemoveEvent.emit).toHaveBeenCalled();
      expect(toastServiceSpy.showToast).toHaveBeenCalledWith('REMOVE_CURRENT_PHOTO', 'success');
    });

    it('should do nothing for default case', async () => {
      await component.uploadPhoto('OTHER');
      expect(mockFileUpload.nativeElement.click).not.toHaveBeenCalled();
      expect(toastServiceSpy.showToast).not.toHaveBeenCalled();
    });
  });

  describe('upload', () => {
    let imageUploadEventSpy: jasmine.Spy;

    beforeEach(() => {
      imageUploadEventSpy = spyOn(component.imageUploadEvent, 'emit');
    });

    it('should emit event and show success toast for allowed image/jpeg format', () => {
      const mockEvent = {
        target: {
          files: [{ type: 'image/jpeg', name: 'photo.jpeg' }]
        }
      } as unknown as Event;

      component.upload(mockEvent);

      expect(toastServiceSpy.showToast).toHaveBeenCalledWith('SUCCESSFULLY_ATTACHED', 'success');
      expect(imageUploadEventSpy).toHaveBeenCalledWith(mockEvent);
    });

    it('should emit event and show success toast for allowed image/png format', () => {
      const mockEvent = {
        target: {
          files: [{ type: 'image/png', name: 'photo.png' }]
        }
      } as unknown as Event;

      component.upload(mockEvent);

      expect(toastServiceSpy.showToast).toHaveBeenCalledWith('SUCCESSFULLY_ATTACHED', 'success');
      expect(imageUploadEventSpy).toHaveBeenCalledWith(mockEvent);
    });

    it('should show danger toast and NOT emit event for disallowed file format (pdf)', () => {
      const mockEvent = {
        target: {
          files: [{ type: 'application/pdf', name: 'document.pdf' }]
        }
      } as unknown as Event;

      component.upload(mockEvent);

      expect(toastServiceSpy.showToast).toHaveBeenCalledWith('PLEASE_UPLOAD_IMAGE_FILE', 'danger');
      expect(imageUploadEventSpy).not.toHaveBeenCalled();
    });
    
    it('should show danger toast and NOT emit event for disallowed file format (gif)', () => {
      const mockEvent = {
        target: {
          files: [{ type: 'image/gif', name: 'animated.gif' }]
        }
      } as unknown as Event;

      component.upload(mockEvent);

      expect(toastServiceSpy.showToast).toHaveBeenCalledWith('PLEASE_UPLOAD_IMAGE_FILE', 'danger');
      expect(imageUploadEventSpy).not.toHaveBeenCalled();
    });
  });
});