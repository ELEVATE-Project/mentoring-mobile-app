import { Injectable } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor(
    private socialSharing: SocialSharing
  ) {}

  shareLink(text,subject,link) {
    this.socialSharing.share(text,subject,null,link);
  }

  shareFile(text,file) {
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
