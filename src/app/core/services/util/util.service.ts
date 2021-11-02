import { Injectable } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { ISocialSharing } from '../../interface/soical-sharing-interface';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor(
    private socialSharing: SocialSharing
  ) {}

  shareLink(param:ISocialSharing) {
    let {text,subject,link} = param;
    this.socialSharing.share(text,subject,null,link);
  }

  shareFile(param:ISocialSharing) {
    let {file,text} = param;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let base64: any = reader.result;
      this.socialSharing
        .share(text, file.name, base64,null)
        .then(() => {
        })
        .catch(() => {
        });
    };
  }
}
