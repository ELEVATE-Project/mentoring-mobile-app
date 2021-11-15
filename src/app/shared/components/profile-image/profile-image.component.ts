import { Component, Input, OnInit } from '@angular/core';
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
  constructor(
    private attachment : AttachmentService
  ) { }

  ngOnInit() {
    console.log(
      this.uploadImage,"uploadImage"
    );
  }
uploadPhoto(){
  this.attachment.selectImage(this.profileImageData.type).then(resp =>{
    if(resp.data){
      this.upload(resp.data)
    }
  },error =>{
    console.log(error,"error");
  })
}

upload(data){
  this.attachment.cloudImageUpload(data).then(resp =>{
    console.log(resp,"resp");
  },error =>{
    console.log(error,"error upload");
  })
}
}
