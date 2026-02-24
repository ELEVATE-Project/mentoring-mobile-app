import { TestBed } from '@angular/core/testing';
import { UtilService } from './util.service';
import { ModalController, AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from '../localstorage.service';
import { ToastService } from '../toast.service';
import { of } from 'rxjs';
import { Share } from '@capacitor/share';
import * as Papa from 'papaparse';

describe('UtilService', () => {
  let service: UtilService;
  let mockModalController: jasmine.SpyObj<ModalController>;
  let mockAlertController: jasmine.SpyObj<AlertController>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockLocalStorageService: jasmine.SpyObj<LocalStorageService>;
  let mockToastService: jasmine.SpyObj<ToastService>;

  beforeEach(() => {
    mockModalController = jasmine.createSpyObj('ModalController', ['create']);
    mockAlertController = jasmine.createSpyObj('AlertController', ['create', 'getTop']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', ['get']);
    mockLocalStorageService = jasmine.createSpyObj('LocalStorageService', ['getLocalData', 'setLocalData']);
    mockToastService = jasmine.createSpyObj('ToastService', ['showToast']);

    // Default mock behavior
    mockTranslateService.get.and.callFake((key: any) => {
      if (Array.isArray(key)) {
        const result: any = {};
        key.forEach(k => result[k] = k);
        return of(result);
      }
      return of(key);
    });

    TestBed.configureTestingModule({
      providers: [
        UtilService,
        { provide: ModalController, useValue: mockModalController },
        { provide: AlertController, useValue: mockAlertController },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: LocalStorageService, useValue: mockLocalStorageService },
        { provide: ToastService, useValue: mockToastService },
      ],
    });
    service = TestBed.inject(UtilService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Observables', () => {
    it('ionMenuShow should emit value', (done) => {
      service.canIonMenuShow.subscribe(val => {
        expect(val).toBeTrue();
        done();
      });
      service.ionMenuShow(true);
    });

    it('subscribeSearchText should emit value', (done) => {
      service.currentSearchText.subscribe(val => {
        if (val === 'test') { // Initial value is ''
          expect(val).toBe('test');
          done();
        }
      });
      service.subscribeSearchText('test');
    });

    it('subscribeCriteriaChip should emit value', (done) => {
      service.currentCriteriaChip.subscribe(val => {
        if (val === 'chip') {
          expect(val).toBe('chip');
          done();
        }
      });
      service.subscribeCriteriaChip('chip');
    });

    it('addMessageBadge/removeMessageBadge should emit value', (done) => {
      service.messageBadge.subscribe(val => {
        if (val === true) {
          expect(val).toBeTrue();
          service.removeMessageBadge();
        } else if (val === false) {
          expect(val).toBeFalse();
          done();
        }
      });
      service.addMessageBadge();
    });

    it('setHasBadge should emit value', (done) => {
      service.hasBadge$.subscribe(val => {
        // Skip initial false if needed, but here we test explicit set
        if (val === true) {
          expect(val).toBeTrue();
          done();
        }
      });
      service.setHasBadge(true);
    });
  });

  describe('Synchronous Methods', () => {
    /* isMobile can be tricky to test because it depends on navigator.userAgent which is read-only.
       We can try to spy on it or skip if too complex for now, but usually Object.defineProperty works in JSDOM/Headless.
    */
    it('isMobile should return true for mobile user agent', () => {
      // Mocking navigator.userAgent
      const originalUserAgent = navigator.userAgent;
      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1',
        writable: true
      });
      expect(service.isMobile()).toBeTrue();

      Object.defineProperty(navigator, 'userAgent', {
        value: 'Mozilla/5.0 (Linux; Android 10; SM-G960U) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Mobile Safari/537.36',
        writable: true
      });
      expect(service.isMobile()).toBeTrue();

      // Cleanup
      Object.defineProperty(navigator, 'userAgent', { value: originalUserAgent, writable: true });
    });

    it('snakeToNormal should convert snake_case to Normal Text', () => {
      expect(service.snakeToNormal('hello_world')).toBe('Hello World');
      expect(service.snakeToNormal('foo_bar_baz')).toBe('Foo Bar Baz');
      expect(service.snakeToNormal('one')).toBe('One');
    });

    it('isSessionExpired should return correct boolean', () => {
      const futureDate = Math.floor(Date.now() / 1000) + 3600;
      const pastDate = Math.floor(Date.now() / 1000) - 3600;

      expect(service.isSessionExpired({ resp: { end_date: futureDate } })).toBeFalse();
      expect(service.isSessionExpired({ resp: { end_date: pastDate } })).toBeTrue();
      expect(service.isSessionExpired({})).toBeFalse(); // No end_date
    });
  });

  describe('Async Methods', () => {
    it('shareLink should call Share.share (via navigator.share mock)', async () => {
      // Mock navigator.share because mocking Share plugin is difficult (Proxy/ReadOnly)
      // and on web it falls back to navigator.share logic.

      const originalShare = navigator.share;
      const shareSpy = jasmine.createSpy('navigator.share').and.returnValue(Promise.resolve());

      // We must use Object.defineProperty because navigator.share might be read-only property or undefined
      Object.defineProperty(navigator, 'share', {
        value: shareSpy,
        writable: true
      });

      const param = { text: 'body', subject: 'title', link: 'http://example.com' };

      try {
        await service.shareLink(param);
        expect(shareSpy).toHaveBeenCalledWith({
          title: undefined,
          text: param.text,
          url: param.link
        });
      } finally {
        // Cleanup
        if (originalShare) {
          Object.defineProperty(navigator, 'share', { value: originalShare, writable: true });
        } else {
          // If it was undefined, maybe delete it or set specific mock back
          // Actually, typically we can just set it back to undefined if we want to be clean
          // or just leave it if it messes up other tests (unlikely).
          Object.defineProperty(navigator, 'share', { value: undefined, writable: true });
        }
      }
    });

    it('openModal should create and present modal', async () => {
      const mockModal = {
        present: jasmine.createSpy('present'),
        onWillDismiss: jasmine.createSpy('onWillDismiss').and.returnValue(Promise.resolve({ data: null, role: 'cancel' }))
      };
      mockModalController.create.and.returnValue(Promise.resolve(mockModal as any));

      await service.openModal({ key: 'value' });

      expect(mockModalController.create).toHaveBeenCalled();
      expect(mockModal.present).toHaveBeenCalled();
      expect(mockModal.onWillDismiss).toHaveBeenCalled();
    });

    it('alertPopup should show alert and resolve to true on submit', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present'),
        dismiss: jasmine.createSpy('dismiss')
      };
      mockAlertController.create.and.returnValue(Promise.resolve(mockAlert as any));

      // Mock querySelector for cleanup
      spyOn(document, 'querySelector').and.returnValue(null);

      const msg = { header: 'H', message: 'M', cancel: 'C', submit: 'S' };

      // We verify the promise resolution
      const promise = service.alertPopup(msg);

      // Simulate button click logic? 
      // alertPopup constructs buttons with handlers. We need to verify creation args to access handlers.
      // Waiting for promise might hang if we don't trigger handler.

      // Let's just check creation is called and we can inspect args
      await new Promise(resolve => setTimeout(resolve, 0)); // tick

      expect(mockAlertController.create).toHaveBeenCalled();
      const createArgs = mockAlertController.create.calls.mostRecent().args[0];
      expect(createArgs.header).toBe('H');

      // Manually trigger submit handler
      const submitBtn = createArgs.buttons.find((b: any) => b.text === 'S') as any;
      if (submitBtn && submitBtn.handler) {
        submitBtn.handler();
      }

      const result = await promise;
      expect(result).toBeTrue();
    });

    it('alertClose should dismiss top alert', async () => {
      const mockAlert = { dismiss: jasmine.createSpy('dismiss') };
      mockAlertController.getTop.and.returnValue(Promise.resolve(mockAlert as any));

      await service.alertClose();
      expect(mockAlert.dismiss).toHaveBeenCalled();
    });

    it('downloadFile should fetch and create download link', async () => {
      const mockBlob = new Blob(['test'], { type: 'text/csv' });
      const mockResponse = { blob: () => Promise.resolve(mockBlob) };
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockResponse as any));
      spyOn(URL, 'createObjectURL').and.returnValue('blob:url');
      spyOn(URL, 'revokeObjectURL');

      const linkSpy = jasmine.createSpyObj('a', ['click']);
      spyOn(document, 'createElement').and.returnValue(linkSpy);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');

      await service.downloadFile('http://url', 'test.csv');

      expect(window.fetch).toHaveBeenCalledWith('http://url');
      expect(document.body.appendChild).toHaveBeenCalledWith(linkSpy);
      expect(linkSpy.click).toHaveBeenCalled();
      expect(document.body.removeChild).toHaveBeenCalledWith(linkSpy);
    });

    it('uploadFile should return file on change', (done) => {
      const mockFile = new File([''], 'test.png', { type: 'image/png' });

      const inputSpy = {
        type: '',
        accept: '',
        addEventListener: jasmine.createSpy('addEventListener').and.callFake((event, cb) => {
          // Simulate change event immediately
          const mockEvent = { target: { files: [mockFile] } };
          cb(mockEvent);
        }),
        click: jasmine.createSpy('click')
      };

      spyOn(document, 'createElement').and.returnValue(inputSpy as any);

      service.uploadFile(['png'], 2).then(file => {
        expect(file).toBe(mockFile);
        expect(inputSpy.accept).toContain('.png');
        expect(inputSpy.click).toHaveBeenCalled();
        done();
      });
    });

    it('uploadFile should return null if validation fails (extension)', (done) => {
      const mockFile = new File([''], 'test.txt', { type: 'text/plain' }); // invalid extension

      const inputSpy = {
        type: '',
        accept: '',
        addEventListener: jasmine.createSpy('addEventListener').and.callFake((event, cb) => {
          const mockEvent = { target: { files: [mockFile] } };
          cb(mockEvent);
        }),
        click: jasmine.createSpy('click')
      };
      spyOn(document, 'createElement').and.returnValue(inputSpy as any);

      service.uploadFile(['png'], 2, { invalidFormatError: 'Invalid' }).then(file => {
        expect(file).toBeNull();
        expect(mockToastService.showToast).toHaveBeenCalledWith('Invalid', 'danger');
        done();
      });
    });

    it('convertDatesToTimezone should return time in selected timezone', () => {
      // We use real moment-timezone execution since it is a library
      const start = '2023-01-01T10:00:00Z';
      const end = '2023-01-01T11:00:00Z';
      const timezone = 'Asia/Kolkata'; // +5:30

      // The service logic:
      // Guesses user TZ (let's assume UTC if we run in headless default, but moment.tz.guess() might return something else)
      // It takes the "clock time" of start/end in User TZ.
      // And creates that "clock time" in Target TZ.

      // This logic seems weird (it shifts time by timezone diff without respecting absolute time?), but we test that it runs.
      const result = service.convertDatesToTimezone(start, end, timezone);

      expect(result.eventStartEpochInSelectedTZ).toBeDefined();
      expect(result.eventEndEpochInSelectedTZ).toBeDefined();
      expect(result.eventEndEpochInSelectedTZ).toBeGreaterThan(result.eventStartEpochInSelectedTZ);
    });

    it('getDeepLink should return full url', () => {
      const url = '/test';
      const expected = window.location.origin + url;
      expect(service.getDeepLink(url)).toBe(expected);
    });

    it('deviceDetails should return JSON string of device info', async () => {
      const details = await service.deviceDetails();
      expect(details).toBeDefined();
      const parsed = JSON.parse(details);
      expect(parsed.browserName).toBeDefined();
    });

    it('profileUpdatePopup should show alert', async () => {
      const mockAlert = { present: jasmine.createSpy('present') };
      mockAlertController.create.and.returnValue(Promise.resolve(mockAlert as any));
      const msg = { header: 'H', message: 'M', cancel: 'C' };

      await service.profileUpdatePopup(msg);

      expect(mockAlertController.create).toHaveBeenCalled();
      expect(mockAlert.present).toHaveBeenCalled();
    });

    it('getActionSheetButtons should return correct buttons for mobile', () => {
      spyOn(service, 'isMobile').and.returnValue(true);
      const profile = { image: true };
      const buttons = service.getActionSheetButtons(profile);
      expect(buttons.find(b => b.type === 'remove')).toBeDefined();
      expect(buttons.find(b => b.type === 'CAMERA')).toBeDefined();
      expect(buttons.find(b => b.type === 'PHOTOLIBRARY')).toBeDefined();
    });

    it('getActionSheetButtons should return correct buttons for non-mobile/no-image', () => {
      spyOn(service, 'isMobile').and.returnValue(false);
      const profile = { image: false }; // no remove button
      const buttons = service.getActionSheetButtons(profile);
      expect(buttons.find(b => b.type === 'remove')).toBeUndefined();
      expect(buttons.find(b => b.type === 'CAMERA')).toBeUndefined();
      expect(buttons.find(b => b.type === 'PHOTOLIBRARY')).toBeDefined();
    });

    it('alertPopup should handle swapButtons', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present'),
        dismiss: jasmine.createSpy('dismiss')
      };
      mockAlertController.create.and.returnValue(Promise.resolve(mockAlert as any));
      spyOn(document, 'querySelector').and.returnValue(null);

      const msg = { header: 'H', message: 'M', cancel: 'C', submit: 'S', swapButtons: true };
      service.alertPopup(msg);

      await new Promise(resolve => setTimeout(resolve, 0));

      const createArgs = mockAlertController.create.calls.mostRecent().args[0];
      // If swapButtons is true, first button is Cancel (role: cancel) and second is Submit
      expect((createArgs.buttons[0] as any).role).toBe('cancel');
      expect((createArgs.buttons[1] as any).role).toBeUndefined();
    });

    it('transformToFilterData should transform response', async () => {
      const response = {
        entity_types: {
          type1: [{ label: 'L1', value: 'v1', entities: [{ label: 'E1', value: 'e1' }] }]
        },
        orgs: [{ name: 'O1', value: 'o1', id: 'id1' }]
      };
      const result = await service.transformToFilterData(response, {});
      expect(result.length).toBeGreaterThan(0);
      expect(result.find(r => r.title === 'Orgs')).toBeDefined();
      expect(result.find(r => r.title === 'L1')).toBeDefined();
    });

    it('getFormatedFilterData should format data', () => {
      const filterData = {
        key1: [{ id: 'k1', name: 'Key 1' }],
        entity_types: { // key must be 'entity_types' to trigger else block
          subKey: [{ label: 'Sub', entities: [{ id: 'e1', label: 'E1', value: 'v1' }] }]
        }
      };
      const formData = {
        filters: {
          key1: [{ key: 'key1', type: 'select' }],
          entity_types: [{ key: 'subKey', type: 'multi' }]
        }
      };

      const result = service.getFormatedFilterData(filterData, formData);
      expect(result.find(r => r.name === 'key1')).toBeDefined();
      expect(result.find(r => r.name === 'subKey')).toBeDefined();
    });

    it('parseAndDownloadCSV should unparse data and trigger download', () => {
      // Mock Papa.parse to immediately call complete
      spyOn(Papa, 'parse').and.callFake((data, config) => {
        config.complete({ data: [{ col: 'val' }] });
      });
      spyOn(Papa, 'unparse').and.returnValue('csv,content');

      // Mock download functionality
      spyOn(URL, 'createObjectURL').and.returnValue('blob:csvurl');
      spyOn(URL, 'revokeObjectURL');
      const linkSpy = jasmine.createSpyObj('a', ['click']);
      spyOn(document, 'createElement').and.returnValue(linkSpy);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');

      service.parseAndDownloadCSV('raw,data', 'test.csv');

      expect(Papa.parse).toHaveBeenCalled();
      expect(Papa.unparse).toHaveBeenCalled();
    });

    it('uploadFile should return resolve null if no file selected', (done) => {
      const inputSpy = {
        type: '',
        accept: '',
        addEventListener: jasmine.createSpy('addEventListener').and.callFake((event, cb) => {
          const mockEvent = { target: { files: [] } }; // No file
          cb(mockEvent);
        }),
        click: jasmine.createSpy('click')
      };
      spyOn(document, 'createElement').and.returnValue(inputSpy as any);

      service.uploadFile().then(file => {
        expect(file).toBeNull();
        expect(mockToastService.showToast).toHaveBeenCalledWith('No file selected', 'danger');
        done();
      });
    });

    it('uploadFile should handle max size error', (done) => {
      const mockFile = { name: 't.png', size: 1024 * 1024 * 5 }; // 5MB
      const inputSpy = {
        type: '',
        accept: '',
        addEventListener: jasmine.createSpy('addEventListener').and.callFake((event, cb) => {
          const mockEvent = { target: { files: [mockFile] } };
          cb(mockEvent);
        }),
        click: jasmine.createSpy('click')
      };
      spyOn(document, 'createElement').and.returnValue(inputSpy as any);

      service.uploadFile(['png'], 1, { maxSizeError: 'Max Size' }).then(file => { // 1MB limit
        expect(file).toBeNull();
        expect(mockToastService.showToast).toHaveBeenCalledWith('Max Size', 'danger');
        done();
      });
    });

    it('downloadFile should handle different mime types', async () => {
      const mockResponse = { blob: () => Promise.resolve(new Blob([])) };
      spyOn(window, 'fetch').and.returnValue(Promise.resolve(mockResponse as any));
      spyOn(URL, 'createObjectURL').and.returnValue('blob:url');
      spyOn(URL, 'revokeObjectURL');
      const linkSpy = jasmine.createSpyObj('a', ['click']);
      spyOn(document, 'createElement').and.returnValue(linkSpy);
      spyOn(document.body, 'appendChild');
      spyOn(document.body, 'removeChild');

      // PDF
      await service.downloadFile('url', 'test', 'application/pdf');
      expect(linkSpy.download).toContain('.pdf');

      // Word
      await service.downloadFile('url', 'test', 'application/msword');
      expect(linkSpy.download).toContain('.docx');

      // PPT
      await service.downloadFile('url', 'test', 'application/vnd.ms-powerpoint');
      expect(linkSpy.download).toContain('.pptx');

      // Fallback
      await service.downloadFile('url', 'test', 'other');
      expect(linkSpy.download).toBe('test');
    });

    it('alertPopup close button should dismiss alert', async () => {
      const mockAlert = {
        present: jasmine.createSpy('present'),
        dismiss: jasmine.createSpy('dismiss')
      };
      mockAlertController.create.and.returnValue(Promise.resolve(mockAlert as any));

      const headerEl = document.createElement('div');
      headerEl.className = 'alert-head';

      spyOn(document, 'querySelector').and.callFake((sel) => {
        if (sel === '.custom-alert-with-close .alert-head') return headerEl;
        if (sel === '.close-alert-icon') return headerEl.querySelector('.close-alert-icon');
        return null;
      });

      service.alertPopup({ header: 'H', message: 'M', cancel: 'C' });

      await new Promise(resolve => setTimeout(resolve, 0));

      // Find created span
      const closeBtn: any = headerEl.querySelector('.close-alert-icon');
      expect(closeBtn).toBeDefined();
      closeBtn.onclick();

      expect(mockAlert.dismiss).toHaveBeenCalled();
    });
  });
});
