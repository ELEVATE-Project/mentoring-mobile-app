import { Injectable } from '@angular/core';
import { AttachmentService } from '../attachment/attachment.service';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private attachment: AttachmentService) {}

  async uploadFile(file: File, signedUrl: any): Promise<string> {
    return new Promise((resolve, reject) => {
      this.attachment.cloudImageUpload(file, signedUrl).subscribe({
        next: () => resolve(signedUrl.destFilePath),
        error: (err) => reject(err)
      });
    });
  }

  async handleFileUploads(controls: any[]): Promise<any[]> {
    const updatedFiles: any[] = [];
    for (const control of controls) {
      if (control.type === 'search' && control.meta?.addPopupType === 'file' && control.value?.length) {
        for (const file of control.value) {
          if (file?.isLink && file.link) {
            updatedFiles.push({
              "name": file.name,
              "link": file.link,
              "type": control.name,
              "mime_type": "link",
            });
          } else if (file.file instanceof File && file.file.name) {
            const signedUrl = await this.attachment.getImageUploadUrl(file.file);
            const uploadedFileUrl = await this.uploadFile(file.file, signedUrl);
            updatedFiles.push({
              "name": file.name,
              "link": uploadedFileUrl,
              "type": control.name,
              "mime_type": file.file.type,
            });
          }
          else if (file.name) {
            updatedFiles.push(file);
          }
        }
      }
    }
    return updatedFiles;
  }
}
