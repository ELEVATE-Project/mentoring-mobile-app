import 'zone.js';          
import 'zone.js/testing';  

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { ProfileImageComponent } from './profile-image.component';
import { AttachmentService, ToastService, UtilService } from 'src/app/core/services';
import { ElementRef } from '@angular/core';

describe('ProfileImageComponent', () => {
  let component: ProfileImageComponent;
  let fixture: ComponentFixture<ProfileImageComponent>;
  let mockAttachmentService: any;
  let mockToastService: any;
  let mockUtilService: any;
  let mockNativeElement: any;

  beforeEach(waitForAsync(() => {
    mockAttachmentService = {};
    mockToastService = {
      showToast: jasmine.createSpy('showToast')
    };
    mockUtilService = {
      isMobile: jasmine.createSpy('isMobile').and.returnValue(true)
    };

    TestBed.configureTestingModule({
      declarations: [ProfileImageComponent],
      imports: [IonicModule.forRoot()],
      providers: [
        { provide: AttachmentService, useValue: mockAttachmentService },
        { provide: ToastService, useValue: mockToastService },
        { provide: UtilService, useValue: mockUtilService }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileImageComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();

    // Mock ElementRef for fileUpload after detectChanges to avoid it being overwritten
    mockNativeElement = {
      value: 'some value',
      setAttribute: jasmine.createSpy('setAttribute'),
      removeAttribute: jasmine.createSpy('removeAttribute'),
      click: jasmine.createSpy('click')
    };
    component.fileUpload = { nativeElement: mockNativeElement } as ElementRef;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should clear file input', () => {
    component.clearFileInput();
    expect(mockNativeElement.value).toBe('');
  });

  it('should handle uploadPhoto with CAMERA source', () => {
    component.uploadPhoto('CAMERA');
    expect(mockNativeElement.setAttribute).toHaveBeenCalledWith('capture', 'environment');
    expect(mockNativeElement.click).toHaveBeenCalled();
  });

  it('should handle uploadPhoto with ADD_PHOTO source', () => {
    component.uploadPhoto('ADD_PHOTO');
    expect(mockNativeElement.removeAttribute).toHaveBeenCalledWith('capture');
    expect(mockNativeElement.click).toHaveBeenCalled();
  });

  it('should handle uploadPhoto with REMOVE_PHOTO source', () => {
    spyOn(component.imageRemoveEvent, 'emit');
    component.uploadPhoto('REMOVE_PHOTO');
    expect(component.imageRemoveEvent.emit).toHaveBeenCalled();
    expect(mockToastService.showToast).toHaveBeenCalledWith("REMOVE_CURRENT_PHOTO", "success");
  });

  it('should emit successfully attached event on valid upload', () => {
    spyOn(component.imageUploadEvent, 'emit');
    const event = {
      target: {
        files: [{ type: 'image/jpeg' }]
      }
    };
    component.upload(event);
    expect(mockToastService.showToast).toHaveBeenCalledWith("SUCCESSFULLY_ATTACHED", "success");
    expect(component.imageUploadEvent.emit).toHaveBeenCalledWith(event);
  });

  it('should show error toast on invalid upload', () => {
    spyOn(component.imageUploadEvent, 'emit');
    const event = {
      target: {
        files: [{ type: 'application/pdf' }]
      }
    };
    component.upload(event);
    expect(mockToastService.showToast).toHaveBeenCalledWith("PLEASE_UPLOAD_IMAGE_FILE", "danger");
    expect(component.imageUploadEvent.emit).not.toHaveBeenCalled();
  });
});