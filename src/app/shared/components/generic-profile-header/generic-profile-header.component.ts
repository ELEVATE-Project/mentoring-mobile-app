import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { ToastService, UtilService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-generic-profile-header',
  templateUrl: './generic-profile-header.component.html',
  styleUrls: ['./generic-profile-header.component.scss'],
})
export class GenericProfileHeaderComponent implements OnInit {
  @Input() headerData:any;
  @Input() buttonConfig:any;
  @Input() showRole:any;
  labels = ["CHECK_OUT_MENTOR","PROFILE_ON_MENTORED_EXPLORE_THE_SESSIONS"];

  constructor(private navCtrl:NavController, private profileService: ProfileService, private utilService:UtilService,private toast: ToastService, private translateService: TranslateService) { }

  ngOnInit() {
  }

  async action(event) {
    if(event==="edit"){
      this.navCtrl.navigateForward(CommonRoutes.EDIT_PROFILE);
    }else{
      this.translateText();
      let shareLink = await this.profileService.shareProfile(this.headerData._id);
      if (shareLink) {
        let url = `/${CommonRoutes.MENTOR_DETAILS}/${shareLink.shareLink}`;
        let link = await this.utilService.getDeepLink(url);
        this.headerData.name = this.headerData.name.trim();
        let params = { link: link, subject: this.headerData?.name, text: this.labels[0] + ` ${this.headerData.name}` + this.labels[1] }
        this.utilService.shareLink(params);
      } else {
        this.toast.showToast("No link generated!!!", "danger");
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

}
