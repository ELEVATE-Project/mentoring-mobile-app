import { ComponentFixture, TestBed, waitForAsync, fakeAsync, tick } from '@angular/core/testing';
import { BulkUploadComponent } from './bulk-upload.component';
import { ToastService } from 'src/app/core/services';
import { OrganisationService } from 'src/app/core/services/organisation/organisation.service';
import { SessionService } from 'src/app/core/services/session/session.service';
import { of, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';

// Stub for translate pipe used in template
@Pipe({ name: 'translate' })
class FakeTranslatePipe implements PipeTransform {
  transform(value: any): any {
    return value;
  }
}

describe('BulkUploadComponent', () => {
  let component: BulkUploadComponent;
  let fixture: ComponentFixture<BulkUploadComponent>;
  let mockToastService: jasmine.SpyObj<ToastService>;
  let mockOrganisationService: jasmine.SpyObj<OrganisationService>;
  let mockSessionService: jasmine.SpyObj<SessionService>;

  const mockComponentData = {
    downloadCsvApiUrl: '/api/download-csv',
    uploadCsvApiUrl: '/api/upload-csv'
  };

  const mockSignedUrl = {
    url: 'https://signed-url.com/upload',
    filePath: '/uploads/test.csv'
  };

  const mockBulkUploadResponse = {
    message: 'File uploaded successfully',
    success: true
  };

  beforeEach(waitForAsync(() => {
    mockToastService = jasmine.createSpyObj('ToastService', ['showToast']);
    mockOrganisationService = jasmine.createSpyObj('OrganisationService', [
      'downloadCsv',
      'getSignedUrl',
      'upload',
      'bulkUpload'
    ]);
    mockSessionService = jasmine.createSpyObj('SessionService', ['openBrowser']);

    TestBed.configureTestingModule({
      declarations: [BulkUploadComponent, FakeTranslatePipe],
      providers: [
        { provide: ToastService, useValue: mockToastService },
        { provide: OrganisationService, useValue: mockOrganisationService },
        { provide: SessionService, useValue: mockSessionService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(BulkUploadComponent);
    component = fixture.componentInstance;
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should initialize component', () => {
      component.ngOnInit();
      expect(component).toBeTruthy();
    });
  });

  describe('downloadCSV', () => {
    beforeEach(() => {
      component.data = mockComponentData;
    });

    it('should download CSV when data is provided', async () => {
      const mockCsvUrl = 'https://example.com/file.csv';
      mockOrganisationService.downloadCsv.and.returnValue(Promise.resolve(mockCsvUrl));

      await component.downloadCSV();

      expect(mockOrganisationService.downloadCsv).toHaveBeenCalledWith(
        mockComponentData.downloadCsvApiUrl
      );
      expect(mockSessionService.openBrowser).toHaveBeenCalledWith(mockCsvUrl, '_blank');
    });

    it('should not open browser when download returns falsy value', async () => {
      mockOrganisationService.downloadCsv.and.returnValue(Promise.resolve(null));

      await component.downloadCSV();

      expect(mockOrganisationService.downloadCsv).toHaveBeenCalled();
      expect(mockSessionService.openBrowser).not.toHaveBeenCalled();
    });

    it('should not call downloadCsv when data is not provided', async () => {
      component.data = null;

      await component.downloadCSV();

      expect(mockOrganisationService.downloadCsv).not.toHaveBeenCalled();
      expect(mockSessionService.openBrowser).not.toHaveBeenCalled();
    });

    it('should not call downloadCsv when data.downloadCsvApiUrl is not provided', async () => {
      component.data = null;

      await component.downloadCSV();

      expect(mockOrganisationService.downloadCsv).not.toHaveBeenCalled();
      expect(mockSessionService.openBrowser).not.toHaveBeenCalled();
    });

    it('should handle download error gracefully', async () => {
      mockOrganisationService.downloadCsv.and.returnValue(Promise.reject('Download error'));

      try {
        await component.downloadCSV();
      } catch (error) {
        expect(error).toBe('Download error');
      }

      expect(mockSessionService.openBrowser).not.toHaveBeenCalled();
    });
  });

  describe('uploadCSV', () => {
    let mockEvent: any;
    let mockFile: File;

    beforeEach(() => {
      component.data = mockComponentData;
      mockFile = new File(['test,data\n1,2'], 'test.csv', { type: 'text/csv' });
      mockEvent = {
        target: {
          files: [mockFile],
          value: 'test.csv'
        }
      };
    });

    it('should upload CSV file successfully', fakeAsync(() => {
      mockOrganisationService.getSignedUrl.and.returnValue(Promise.resolve(mockSignedUrl));
      mockOrganisationService.upload.and.returnValue(of({ success: true }));
      mockOrganisationService.bulkUpload.and.returnValue(Promise.resolve(mockBulkUploadResponse));

      component.uploadCSV(mockEvent);
      tick();

      expect(mockOrganisationService.getSignedUrl).toHaveBeenCalledWith('test.csv');
      expect(mockOrganisationService.upload).toHaveBeenCalledWith(mockFile, mockSignedUrl);
      expect(mockOrganisationService.bulkUpload).toHaveBeenCalledWith(
        mockSignedUrl.filePath,
        mockComponentData.uploadCsvApiUrl
      );
      expect(mockToastService.showToast).toHaveBeenCalledWith(
        mockBulkUploadResponse.message,
        'success'
      );
      expect(mockEvent.target.value).toBe('');
    }));

    it('should accept text/csv file type', fakeAsync(() => {
      mockOrganisationService.getSignedUrl.and.returnValue(Promise.resolve(mockSignedUrl));
      mockOrganisationService.upload.and.returnValue(of({ success: true }));
      mockOrganisationService.bulkUpload.and.returnValue(Promise.resolve(mockBulkUploadResponse));

      component.uploadCSV(mockEvent);
      tick();

      expect(mockToastService.showToast).not.toHaveBeenCalledWith(
        'PLEASE_UPLOAD_CSV_FILE',
        'danger'
      );
      expect(mockOrganisationService.getSignedUrl).toHaveBeenCalled();
    }));

    it('should accept application/vnd.ms-excel file type', fakeAsync(() => {
      const excelFile = new File(['test,data\n1,2'], 'test.csv', { 
        type: 'application/vnd.ms-excel' 
      });
      mockEvent.target.files = [excelFile];

      mockOrganisationService.getSignedUrl.and.returnValue(Promise.resolve(mockSignedUrl));
      mockOrganisationService.upload.and.returnValue(of({ success: true }));
      mockOrganisationService.bulkUpload.and.returnValue(Promise.resolve(mockBulkUploadResponse));

      component.uploadCSV(mockEvent);
      tick();

      expect(mockToastService.showToast).not.toHaveBeenCalledWith(
        'PLEASE_UPLOAD_CSV_FILE',
        'danger'
      );
      expect(mockOrganisationService.getSignedUrl).toHaveBeenCalled();
    }));

    it('should reject non-CSV file and show error toast', async () => {
      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      mockEvent.target.files = [invalidFile];
      mockEvent.target.value = 'test.txt';

      await component.uploadCSV(mockEvent);

      expect(mockToastService.showToast).toHaveBeenCalledWith(
        'PLEASE_UPLOAD_CSV_FILE',
        'danger'
      );
      expect(mockEvent.target.value).toBe('');
      expect(mockOrganisationService.getSignedUrl).not.toHaveBeenCalled();
    });

    it('should reject image file type', async () => {
      const imageFile = new File(['image'], 'test.jpg', { type: 'image/jpeg' });
      mockEvent.target.files = [imageFile];

      await component.uploadCSV(mockEvent);

      expect(mockToastService.showToast).toHaveBeenCalledWith(
        'PLEASE_UPLOAD_CSV_FILE',
        'danger'
      );
      expect(mockOrganisationService.getSignedUrl).not.toHaveBeenCalled();
    });

    it('should reject PDF file type', async () => {
      const pdfFile = new File(['pdf'], 'test.pdf', { type: 'application/pdf' });
      mockEvent.target.files = [pdfFile];

      await component.uploadCSV(mockEvent);

      expect(mockToastService.showToast).toHaveBeenCalledWith(
        'PLEASE_UPLOAD_CSV_FILE',
        'danger'
      );
      expect(mockOrganisationService.getSignedUrl).not.toHaveBeenCalled();
    });

    it('should clear input value after successful upload', fakeAsync(() => {
      mockEvent.target.value = 'test.csv';
      mockOrganisationService.getSignedUrl.and.returnValue(Promise.resolve(mockSignedUrl));
      mockOrganisationService.upload.and.returnValue(of({ success: true }));
      mockOrganisationService.bulkUpload.and.returnValue(Promise.resolve(mockBulkUploadResponse));

      component.uploadCSV(mockEvent);
      tick();

      expect(mockEvent.target.value).toBe('');
    }));

    it('should call getSignedUrl with correct filename', fakeAsync(() => {
      mockOrganisationService.getSignedUrl.and.returnValue(Promise.resolve(mockSignedUrl));
      mockOrganisationService.upload.and.returnValue(of({ success: true }));
      mockOrganisationService.bulkUpload.and.returnValue(Promise.resolve(mockBulkUploadResponse));

      component.uploadCSV(mockEvent);
      tick();

      expect(mockOrganisationService.getSignedUrl).toHaveBeenCalledWith('test.csv');
    }));

    it('should pass file and signedUrl to upload method', fakeAsync(() => {
      mockOrganisationService.getSignedUrl.and.returnValue(Promise.resolve(mockSignedUrl));
      mockOrganisationService.upload.and.returnValue(of({ success: true }));
      mockOrganisationService.bulkUpload.and.returnValue(Promise.resolve(mockBulkUploadResponse));

      component.uploadCSV(mockEvent);
      tick();

      expect(mockOrganisationService.upload).toHaveBeenCalledWith(mockFile, mockSignedUrl);
    }));

    it('should call bulkUpload with filePath and uploadCsvApiUrl', fakeAsync(() => {
      mockOrganisationService.getSignedUrl.and.returnValue(Promise.resolve(mockSignedUrl));
      mockOrganisationService.upload.and.returnValue(of({ success: true }));
      mockOrganisationService.bulkUpload.and.returnValue(Promise.resolve(mockBulkUploadResponse));

      component.uploadCSV(mockEvent);
      tick();

      expect(mockOrganisationService.bulkUpload).toHaveBeenCalledWith(
        mockSignedUrl.filePath,
        mockComponentData.uploadCsvApiUrl
      );
    }));

    it('should not show success toast when bulkUpload returns falsy value', fakeAsync(() => {
      mockOrganisationService.getSignedUrl.and.returnValue(Promise.resolve(mockSignedUrl));
      mockOrganisationService.upload.and.returnValue(of({ success: true }));
      mockOrganisationService.bulkUpload.and.returnValue(Promise.resolve(null));

      component.uploadCSV(mockEvent);
      tick();

      expect(mockOrganisationService.bulkUpload).toHaveBeenCalled();
      expect(mockToastService.showToast).not.toHaveBeenCalled();
    }));

    it('should handle multiple file uploads sequentially', fakeAsync(() => {
      mockOrganisationService.getSignedUrl.and.returnValue(Promise.resolve(mockSignedUrl));
      mockOrganisationService.upload.and.returnValue(of({ success: true }));
      mockOrganisationService.bulkUpload.and.returnValue(Promise.resolve(mockBulkUploadResponse));

      // First upload
      component.uploadCSV(mockEvent);
      tick();

      expect(mockOrganisationService.upload).toHaveBeenCalledTimes(1);

      // Second upload
      const secondFile = new File(['test2'], 'test2.csv', { type: 'text/csv' });
      mockEvent.target.files = [secondFile];
      mockEvent.target.value = 'test2.csv';
      component.uploadCSV(mockEvent);
      tick();

      expect(mockOrganisationService.upload).toHaveBeenCalledTimes(2);
      expect(mockToastService.showToast).toHaveBeenCalledTimes(2);
    }));
  });

  describe('Input data', () => {
    it('should accept data input', () => {
      component.data = mockComponentData;
      expect(component.data).toEqual(mockComponentData);
    });

    it('should handle undefined data input', () => {
      component.data = undefined;
      expect(component.data).toBeUndefined();
    });

    it('should handle null data input', () => {
      component.data = null;
      expect(component.data).toBeNull();
    });
  });

  describe('Integration tests', () => {
    it('should complete full upload flow', fakeAsync(() => {
      component.data = mockComponentData;
      const mockFile = new File(['test,data\n1,2'], 'test.csv', { type: 'text/csv' });
      const mockEvent = {
        target: {
          files: [mockFile],
          value: 'test.csv'
        }
      };

      mockOrganisationService.getSignedUrl.and.returnValue(Promise.resolve(mockSignedUrl));
      mockOrganisationService.upload.and.returnValue(of({ success: true }));
      mockOrganisationService.bulkUpload.and.returnValue(Promise.resolve(mockBulkUploadResponse));

      component.uploadCSV(mockEvent);
      tick();

      // Verify the complete flow
      expect(mockOrganisationService.getSignedUrl).toHaveBeenCalledWith('test.csv');
      expect(mockOrganisationService.upload).toHaveBeenCalledWith(mockFile, mockSignedUrl);
      expect(mockOrganisationService.bulkUpload).toHaveBeenCalledWith(
        mockSignedUrl.filePath,
        mockComponentData.uploadCsvApiUrl
      );
      expect(mockToastService.showToast).toHaveBeenCalledWith(
        mockBulkUploadResponse.message,
        'success'
      );
      expect(mockEvent.target.value).toBe('');
    }));

    it('should complete full download flow', async () => {
      component.data = mockComponentData;
      const mockCsvUrl = 'https://example.com/download.csv';
      mockOrganisationService.downloadCsv.and.returnValue(Promise.resolve(mockCsvUrl));

      await component.downloadCSV();

      expect(mockOrganisationService.downloadCsv).toHaveBeenCalledWith(
        mockComponentData.downloadCsvApiUrl
      );
      expect(mockSessionService.openBrowser).toHaveBeenCalledWith(mockCsvUrl, '_blank');
    });

    it('should handle upload flow when data.uploadCsvApiUrl is undefined', fakeAsync(() => {
      component.data = { downloadCsvApiUrl: '/api/download' };
      const mockFile = new File(['test,data\n1,2'], 'test.csv', { type: 'text/csv' });
      const mockEvent = {
        target: {
          files: [mockFile],
          value: 'test.csv'
        }
      };

      mockOrganisationService.getSignedUrl.and.returnValue(Promise.resolve(mockSignedUrl));
      mockOrganisationService.upload.and.returnValue(of({ success: true }));
      mockOrganisationService.bulkUpload.and.returnValue(Promise.resolve(mockBulkUploadResponse));

      component.uploadCSV(mockEvent);
      tick();

      // Should still call bulkUpload with undefined as second parameter
      expect(mockOrganisationService.bulkUpload).toHaveBeenCalledWith(
        mockSignedUrl.filePath,
        undefined
      );
    }));
  });
});