import { Component, Input, OnInit } from '@angular/core';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { AttachmentService, HttpService } from 'src/app/core/services';

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
    private attachment : AttachmentService,
    private httpService:HttpService
  ) { }

  ngOnInit() {}
uploadPhoto(){
  this.attachment.selectImage(this.profileImageData.type).then(resp =>{
    if(resp.data){
      // this.upload(resp.data);
      this.getImageUploadUrl(resp.data);
    }
  },error =>{
    console.log(error,"error");
  })
}

upload(data){
  this.attachment.cloudImageUpload(data).then(resp =>{
  },error =>{
    console.log(error,"error upload");
  })
}
async getImageUploadUrl(file){
  let config ={
    url :  urlConstants.API_URLS.GET_IMAGE_UPLOAD_URL+file.name
  }
  let data: any = await this.httpService.get(config);
  console.log(data,"data");
}
}
