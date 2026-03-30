import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AttachmentService } from '../attachment/attachment.service';
import { FileUploadService } from './file-upload.service';

describe('FileUploadService', () => {
  let service: FileUploadService;
  let attachmentSpy: jasmine.SpyObj<AttachmentService>;

  beforeEach(() => {
    attachmentSpy = jasmine.createSpyObj('AttachmentService', [
      'cloudImageUpload',
      'getImageUploadUrl'
    ]);

    TestBed.configureTestingModule({
      providers: [
        FileUploadService,
        { provide: AttachmentService, useValue: attachmentSpy }
      ]
    });

    service = TestBed.inject(FileUploadService);
  });

  it('uploadFile should resolve with destination file path after upload', async () => {
    const file = new File(['content'], 'resource.pdf', { type: 'application/pdf' });
    const signedUrl = { destFilePath: 'https://cdn.test/resource.pdf' };
    attachmentSpy.cloudImageUpload.and.returnValue(of({}));

    const result = await service.uploadFile(file, signedUrl);

    expect(attachmentSpy.cloudImageUpload).toHaveBeenCalledWith(file, signedUrl);
    expect(result).toBe('https://cdn.test/resource.pdf');
  });

  it('uploadFile should reject when upload errors', async () => {
    const file = new File(['content'], 'resource.pdf', { type: 'application/pdf' });
    const signedUrl = { destFilePath: 'https://cdn.test/resource.pdf' };
    attachmentSpy.cloudImageUpload.and.returnValue(throwError(() => 'upload failed'));

    await expectAsync(service.uploadFile(file, signedUrl)).toBeRejectedWith('upload failed');
  });

  it('handleFileUploads should transform links, upload files, and preserve existing entries', async () => {
    const file = new File(['content'], 'resource.pdf', { type: 'application/pdf' });
    const signedUrl = { destFilePath: 'https://cdn.test/resource.pdf' };
    attachmentSpy.getImageUploadUrl.and.returnValue(Promise.resolve(signedUrl));
    attachmentSpy.cloudImageUpload.and.returnValue(of({}));

    const result = await service.handleFileUploads([
      {
        name: 'resources',
        type: 'search',
        meta: { addPopupType: 'file' },
        value: [
          { name: 'Google', isLink: true, link: 'https://google.com' },
          { name: 'PDF', file },
          { name: 'Existing', link: 'https://existing.test', type: 'resources', mime_type: 'link' }
        ]
      },
      {
        name: 'ignored',
        type: 'text',
        meta: { addPopupType: 'file' },
        value: [{ name: 'Nope' }]
      }
    ]);

    expect(attachmentSpy.getImageUploadUrl).toHaveBeenCalledWith(file);
    expect(result).toEqual([
      {
        name: 'Google',
        link: 'https://google.com',
        type: 'resources',
        mime_type: 'link'
      },
      {
        name: 'PDF',
        link: 'https://cdn.test/resource.pdf',
        type: 'resources',
        mime_type: 'application/pdf'
      },
      {
        name: 'Existing',
        link: 'https://existing.test',
        type: 'resources',
        mime_type: 'link'
      }
    ]);
  });

  it('handleFileUploads should return an empty list when no uploadable file controls exist', async () => {
    const result = await service.handleFileUploads([
      { type: 'text', meta: {}, value: [] },
      { type: 'search', meta: { addPopupType: 'user' }, value: [{ id: 1 }] }
    ]);

    expect(result).toEqual([]);
    expect(attachmentSpy.getImageUploadUrl).not.toHaveBeenCalled();
  });
});
