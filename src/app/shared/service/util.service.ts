import { Injectable } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  text: string = 'Mentor App';
  link: string = 'https://driftycode.com/sessions';
  constructor(
    private socialSharing: SocialSharing
  ) {}

  shareLink() {
    this.socialSharing.share(this.text, null, null, this.link);
  }

  shareFile(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let base64: any = reader.result;
      this.socialSharing
        .share(this.text, file.name, base64, '')
        .then(() => {
          console.log('share Success');
        })
        .catch(() => {
          console.log('share Failure');
        });
    };
  }
}
