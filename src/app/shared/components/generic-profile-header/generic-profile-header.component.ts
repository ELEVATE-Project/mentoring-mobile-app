import { Component, Input, OnInit } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { NavController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ToastService, UtilService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';
import { Clipboard } from '@capacitor/clipboard';

@Component({
  selector: 'app-generic-profile-header',
  templateUrl: './generic-profile-header.component.html',
  styleUrls: ['./generic-profile-header.component.scss'],
})
export class GenericProfileHeaderComponent implements OnInit {
  @Input() headerData:any;
  @Input() buttonConfig:any;
  @Input() showRole:any;
  @Input() isMentor: any;
  labels = ["CHECK_OUT_MENTOR","PROFILE_ON_MENTORED_EXPLORE_THE_SESSIONS"];

  public isMobile = /iPhone|iPad|iPod|Android/i.test(window.navigator.userAgent);

  constructor(private navCtrl:NavController, private profileService: ProfileService, private utilService:UtilService,private toast: ToastService, private translateService: TranslateService,private platform: Platform,) { }

  ngOnInit() {
  }

  async action(event) {
    if(this.isMobile && navigator.share && !(event==="edit")){
        this.translateText();
        let shareLink = await this.profileService.shareProfile(this.headerData.id);
        if (shareLink) {
          let url = `/${CommonRoutes.MENTOR_DETAILS}/${shareLink.shareLink}`;
          let link = await this.utilService.getDeepLink(url);
          this.headerData.name = this.headerData.name.trim();
          let params = { link: link, subject: this.headerData?.name, text: this.labels[0] + ` ${this.headerData.name}` + this.labels[1] }
          await this.utilService.shareLink(params);
        } else {
          this.toast.showToast("No link generated!!!", "danger");
        }
    }else {
      if(event==="edit"){
        this.navCtrl.navigateForward(CommonRoutes.EDIT_PROFILE);
      }else{
        await this.copyToClipBoard(window.location.href)
        this.toast.showToast("LINK_COPIED","success")
      }
    }
    //add output event and catch from parent; TODO
  }

  translateText() {
    this.translateService.get(this.labels).subscribe(translatedLabel => {
      let labelKeys = Object.keys(translatedLabel);
      labelKeys.forEach((key) => {
        let index = this.labels.findIndex(
          (label) => label === key
        )
        this.labels[index] = translatedLabel[key];
      })
    })
  }

  copyToClipBoard = async (copyData: any) => {
    await Clipboard.write({
      string: copyData
    }).then(()=>{
      this.toast.showToast('Copied successfully',"success");
    });
  };

}
