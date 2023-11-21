import { Component, Input, OnInit, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { AttachmentService, ToastService } from 'src/app/core/services';


@Component({
  selector: 'app-profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.scss'],
})
export class ProfileImageComponent implements OnInit {
  @ViewChild ('fileUpload') fileUpload: ElementRef;
  @Input() profileImageData;
  @Input() showProfileDetails: any;
  @Input() username: any;
  @Input() uploadImage : boolean = false;
  @Output() imageUploadEvent = new EventEmitter();
  @Output() imageRemoveEvent = new EventEmitter();
  constructor(
    private attachment : AttachmentService,
    private toast: ToastService
  ) { }

  ngOnInit() {}
  uploadPhoto(){
    this.attachment.selectImage(this.profileImageData).then(resp => {
      switch (resp.data) {
        case 'CAMERA':
          this.fileUpload.nativeElement.setAttribute('capture', 'environment');
          this.fileUpload.nativeElement.click();
          break

        case 'PHOTOLIBRARY':
          this.fileUpload.nativeElement.removeAttribute('capture');
          this.fileUpload.nativeElement.click();
          break
        
        case 'removeCurrentPhoto':
          this.imageRemoveEvent.emit(resp.data)
          break

        default:
          break
      }
    },error =>{
      this.toast.showToast("ERROR_WHILE_STORING_FILE", "danger")
      console.log(error,"error");
    })
  }

  upload(event) {
    this.toast.showToast("SUCCESSFULLY_ATTACHED", "success")
    this.imageUploadEvent.emit(event)
  }
}
