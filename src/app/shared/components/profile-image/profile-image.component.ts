import { Component, Input, OnInit, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { AttachmentService, ToastService, UtilService } from 'src/app/core/services';

@Component({
  selector: 'app-profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.scss'],
})
export class ProfileImageComponent implements OnInit {
  @ViewChild('fileUpload') fileUpload: ElementRef;
  @Input() profileImageData;
  @Input() showProfileDetails: any;
  @Input() username: any;
  @Input() uploadImage: boolean = false;
  @Output() imageUploadEvent = new EventEmitter();
  @Output() imageRemoveEvent = new EventEmitter();
  isMobile = this.utilService.isMobile();

  constructor(
    private attachment: AttachmentService,
    private toast: ToastService,
    private utilService: UtilService,
  ) { }

  ngOnInit() { }

  async uploadPhoto(source: string) {
    switch (source) {
      case 'CAMERA':
        this.fileUpload.nativeElement.setAttribute('capture', 'environment');
        this.fileUpload.nativeElement.click();
        break;

      case 'ADD_PHOTO':
        this.fileUpload.nativeElement.removeAttribute('capture');
        this.fileUpload.nativeElement.click();
        break;

      case 'REMOVE_PHOTO':
        this.imageRemoveEvent.emit(this.profileImageData.data)
        break;

      default:
        break;
    }
  }

  upload(event) {
    const allowedFormats = ['image/jpeg', 'image/png'];
    if (allowedFormats.includes(event.target.files[0].type)) {
      this.toast.showToast("SUCCESSFULLY_ATTACHED", "success")
      this.imageUploadEvent.emit(event)
    }
    else {
      this.toast.showToast("PLEASE_UPLOAD_IMAGE_FILE", "danger")
    }
  }
}
