import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ActionSheetController, Platform, ToastController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import { AttachmentService } from './attachment.service';
import { HttpService } from '../http/http.service';
import { UtilService } from '../util/util.service';
import { FILE_EXTENSION_HEADERS } from '../../constants/file-extensions';
import { urlConstants } from '../../constants/urlConstants';

describe('AttachmentService', () => {
  let service: AttachmentService;
  let mockActionSheetController: jasmine.SpyObj<ActionSheetController>;
  let mockToastController: jasmine.SpyObj<ToastController>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockHttpService: jasmine.SpyObj<HttpService>;
  let mockUtilService: jasmine.SpyObj<UtilService>;
  let mockHttpClient: jasmine.SpyObj<HttpClient>;
  let mockActionSheet: jasmine.SpyObj<any>;
  let mockToast: jasmine.SpyObj<any>;

  beforeEach(() => {
    mockActionSheet = jasmine.createSpyObj('ActionSheet', ['present', 'onDidDismiss', 'dismiss']);
    mockActionSheet.onDidDismiss.and.returnValue(Promise.resolve({ data: 'test' }));

    mockToast = jasmine.createSpyObj('Toast', ['present']);

    mockActionSheetController = jasmine.createSpyObj('ActionSheetController', ['create', 'dismiss']);
    mockActionSheetController.create.and.returnValue(Promise.resolve(mockActionSheet));

    mockToastController = jasmine.createSpyObj('ToastController', ['create']);
    mockToastController.create.and.returnValue(Promise.resolve(mockToast));

    mockTranslateService = jasmine.createSpyObj('TranslateService', ['get']);
    mockTranslateService.get.and.callFake((keys: string[]) => {
      const translations = {};
      keys.forEach(key => translations[key] = `translated_${key}`);
      return of(translations);
    });

    mockHttpService = jasmine.createSpyObj('HttpService', ['get']);
    mockHttpService.get.and.returnValue(Promise.resolve({ result: { signedUrl: 'test-url' } }));

    mockUtilService = jasmine.createSpyObj('UtilService', ['getActionSheetButtons']);
    mockUtilService.getActionSheetButtons.and.returnValue([
      { text: 'Camera', action: 'camera', type: 'camera' },
      { text: 'Remove', action: 'remove' },
      { text: 'Cancel', action: 'cancel' }
    ]);

    mockHttpClient = jasmine.createSpyObj('HttpClient', ['put']);
    mockHttpClient.put.and.returnValue(of({}));

    TestBed.configureTestingModule({
      providers: [
        AttachmentService,
        { provide: ActionSheetController, useValue: mockActionSheetController },
        { provide: ToastController, useValue: mockToastController },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: HttpService, useValue: mockHttpService },
        { provide: UtilService, useValue: mockUtilService },
        { provide: HttpClient, useValue: mockHttpClient }
      ]
    });

    service = TestBed.inject(AttachmentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getActionSheetButtons', () => {
    it('should return action sheet buttons with handlers', () => {
      const profileImageData = { hasImage: true };
      const buttons = service.getActionSheetButtons(profileImageData);

      expect(buttons).toBeDefined();
      expect(buttons.length).toBe(3);
      expect(buttons[0].text).toBe('Camera');
      expect(typeof buttons[0].handler).toBe('function');
    });

    it('should handle camera action', async () => {
      const profileImageData = { hasImage: true };
      const buttons = service.getActionSheetButtons(profileImageData);

      const result = await buttons[0].handler();

      expect(mockActionSheetController.dismiss).toHaveBeenCalledWith('camera');
      expect(result).toBe(false);
    });

    it('should handle remove action', async () => {
      const profileImageData = { hasImage: true };
      const buttons = service.getActionSheetButtons(profileImageData);

      const result = await buttons[1].handler();

      expect(mockActionSheetController.dismiss).toHaveBeenCalledWith('removeCurrentPhoto');
      expect(mockToastController.create).toHaveBeenCalled();
      expect(result).toBe(false);
    });

    it('should handle cancel action', async () => {
      const profileImageData = { hasImage: true };
      const buttons = service.getActionSheetButtons(profileImageData);

      const result = await buttons[2].handler();

      expect(mockActionSheetController.dismiss).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('removeCurrentPhoto', () => {
    it('should dismiss action sheet and show success toast', () => {
      service.removeCurrentPhoto();

      expect(mockTranslateService.get).toHaveBeenCalledWith(['REMOVE_CURRENT_PHOTO']);
      expect(mockActionSheetController.dismiss).toHaveBeenCalledWith('removeCurrentPhoto');
      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'translated_REMOVE_CURRENT_PHOTO',
        position: 'top',
        duration: 3000,
        color: 'success'
      });
    });
  });

  describe('selectImage', () => {
    it('should create and present action sheet', async () => {
      const profileImageData = { hasImage: true };

      const result = await service.selectImage(profileImageData);

      expect(mockTranslateService.get).toHaveBeenCalledWith([
        'ERROR_WHILE_STORING_FILE',
        'SUCCESSFULLY_ATTACHED'
      ]);
      expect(mockActionSheetController.create).toHaveBeenCalled();
      expect(mockActionSheet.present).toHaveBeenCalled();
      expect(result).toEqual({ data: 'test' });
    });
  });

  describe('presentToast', () => {
    it('should create and present toast with default color', async () => {
      await service.presentToast('Test message');

      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'Test message',
        position: 'top',
        duration: 3000,
        color: 'danger'
      });
      expect(mockToast.present).toHaveBeenCalled();
    });

    it('should create and present toast with custom color', async () => {
      await service.presentToast('Test message', 'success');

      expect(mockToastController.create).toHaveBeenCalledWith({
        message: 'Test message',
        position: 'top',
        duration: 3000,
        color: 'success'
      });
      expect(mockToast.present).toHaveBeenCalled();
    });
  });

  describe('mimeType', () => {
    it('should return correct MIME type for known extensions', () => {
      expect(service.mimeType('test.jpg')).toBe('image/jpeg');
      expect(service.mimeType('test.png')).toBe('image/png');
      expect(service.mimeType('test.pdf')).toBe('application/pdf');
      expect(service.mimeType('test.mp3')).toBe('audio/mpeg');
    });

    it('should return undefined for unknown extensions', () => {
      expect(service.mimeType('test.unknown')).toBeUndefined();
    });

    it('should handle files without extensions', () => {
      expect(service.mimeType('test')).toBeUndefined();
    });
  });

  describe('cloudImageUpload', () => {
    it('should upload file to cloud with correct headers', () => {
      const fileDetails = new FormData();
      const uploadUrl = { signedUrl: 'https://test.com/upload' };

      const result = service.cloudImageUpload(fileDetails, uploadUrl);

      expect(mockHttpClient.put).toHaveBeenCalledWith(uploadUrl.signedUrl, fileDetails, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-ms-blob-type': 'BlockBlob'
        }
      });
      expect(result).toBeDefined();
    });
  });

  describe('getImageUploadUrl', () => {
    it('should get upload URL for file', async () => {
      const file = { name: 'test file.jpg' };

      const result = await service.getImageUploadUrl(file);

      expect(mockHttpService.get).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.GET_FILE_UPLOAD_URL + 'test_file.jpg'
      });
      expect(result).toEqual({ signedUrl: 'test-url' });
    });

    it('should replace spaces with underscores in filename', async () => {
      const file = { name: 'test file with spaces.jpg' };

      await service.getImageUploadUrl(file);

      expect(mockHttpService.get).toHaveBeenCalledWith({
        url: urlConstants.API_URLS.GET_FILE_UPLOAD_URL + 'test_file_with_spaces.jpg'
      });
    });
  });
});
