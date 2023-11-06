import { Component, Input, OnInit, EventEmitter, Output, ViewChild, ElementRef } from '@angular/core';
import { AttachmentService } from 'src/app/core/services';


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
    private attachment : AttachmentService
  ) { }

  ngOnInit() {}
  uploadPhoto(){
    this.attachment.selectImage(this.profileImageData).then(resp => {
      switch (resp.data) {
        case 'CAMERA':
          console.log("1")
          this.fileUpload.nativeElement.setAttribute('capture', 'environment');
          this.fileUpload.nativeElement.click();
          break

        case 'PHOTOLIBRARY':
          console.log("2")
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
      console.log(error,"error");
    })
  }

  upload(event) {
    this.imageUploadEvent.emit(event)
  }
}
