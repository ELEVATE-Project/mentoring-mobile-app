import { Component, Input, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
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

  constructor(private navCtrl:NavController, private profileService: ProfileService, private utilService:UtilService,private toast: ToastService) { }

  ngOnInit() {
  }

  async action(event) {
    if(event==="edit"){
      this.navCtrl.navigateForward(CommonRoutes.EDIT_PROFILE);
    }else{
      let shareLink = await this.profileService.shareProfile(this.headerData._id);
      if (shareLink) {
        let url = `/${CommonRoutes.MENTOR_DETAILS}/${shareLink.shareLink}`;
        let link = await this.utilService.getDeepLink(url);
        this.headerData.name = this.headerData.name.trim();
        let params = { link: link, subject: this.headerData?.name, text: " Check out Mentor " + `${this.headerData.name} ` + "'s profile on MentorED. Explore the sessions planned by him. Click on the Link" }
        this.utilService.shareLink(params);
      } else {
        this.toast.showToast("No link generated!!!", "danger");
      }
    }
    //add output event and catch from parent; TODO
  }

}
