import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { AttachmentService } from 'src/app/core/services';


@Component({
  selector: 'app-profile-image',
  templateUrl: './profile-image.component.html',
  styleUrls: ['./profile-image.component.scss'],
})
export class ProfileImageComponent implements OnInit {
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
  this.attachment.selectImage(this.profileImageData.type).then(resp => {
    if(resp.data){
      // this.upload(resp.data);
      resp.data.type == "removeCurrentPhoto" ? this.imageRemoveEvent.emit(resp.data): this.imageUploadEvent.emit(resp.data);
    }
  },error =>{
    console.log(error,"error");
  })
}
}
