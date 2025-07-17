import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ActionSheetController, ModalController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ToastService, UtilService } from 'src/app/core/services';

@Component({
  selector: 'app-add-link-modal',
  templateUrl: './pre-alert-modal.component.html',
  styleUrls: ['./pre-alert-modal.component.scss'],
})
export class PreAlertModalComponent {
  @ViewChild('fileUpload') fileUpload: ElementRef;
  @Input() data: any;
  @Input() type: 'link' | 'file' = 'link';
  @Input() heading: string = '';

  name: string = '';
  link: string = '';
  showLinkError: boolean = false;
  uploadedFile: File;

  constructor(
    private modalController: ModalController,
    private translateService: TranslateService,
    private toast: ToastService,
    private actionSheetController: ActionSheetController,
    private utilService: UtilService
  ) {}

  onLinkInput() {
    const trimmed = this.link?.trim() || '';
    if (!trimmed) {
      this.showLinkError = false;
      return;
    }
    const urlRegex = /^(https?:\/\/)[\w.-]+(:\d+)?(\/[\w\-./?%&=]*)?$/i;
    this.showLinkError = !urlRegex.test(trimmed);
  }
  

  dismissModal() {
    this.showLinkError = false;
    this.modalController.dismiss();
  }

  saveLink() {
    if (this.type === 'file') {
        const obj = {
          name: this.name, 
          file: this.uploadedFile
        };
        this.modalController.dismiss({
          data: obj,
          success: true,
        });
    } else if(this.type === 'link') {
        const obj = {
          name: this.name,
          link: this.link,
          type: this.data.name,
          isLink: true,
          isNew: true,
        };

        this.modalController.dismiss({
          data: obj,
          success: true,
        });
      } 
  }
  selectFile() {
   this.utilService.uploadFile().then((file: File) => {
     this.uploadedFile = file;
   }).catch((error) => {
     console.error('File upload failed:', error);
   });
  }
  async openFilePicker() {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    if (isMobile) {
        const actionSheet = await this.actionSheetController.create({
            header: 'Select Resource',
            buttons: [
                {
                    text: 'Camera',
                    icon: 'camera',
                    handler: () => {
                      this.openCamera();
                    }
                },
                {
                    text: 'File',
                    icon: 'folder',
                    handler: () => {
                        this.selectFile();
                    }
                },
                {
                    text: 'Cancel',
                    icon: 'close',
                    role: 'cancel'
                }
            ]
        });
        await actionSheet.present();
    } else {
      this.selectFile()
    }
  
  }

  openCamera() {
    this.fileUpload.nativeElement.click();
  }

  uploadCamera(event) {
    const allowedFormats = ['image/jpeg', 'image/png'];
    if (allowedFormats.includes(event.target.files[0].type)) {
      this.uploadedFile = event.target.files[0];
      this.toast.showToast("SUCCESSFULLY_ATTACHED", "success");
      if (this.fileUpload?.nativeElement) {
        this.fileUpload.nativeElement.value = '';
      }
    }
    else {
      this.toast.showToast("PLEASE_UPLOAD_IMAGE_FILE", "danger")
    }
  }

  removeFile() {
    this.uploadedFile = null;
    }
}
