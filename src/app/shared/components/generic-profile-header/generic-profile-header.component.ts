import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  LocalStorageService,
  ToastService,
  UtilService,
} from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';
import { Clipboard } from '@capacitor/clipboard';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-generic-profile-header',
  templateUrl: './generic-profile-header.component.html',
  styleUrls: ['./generic-profile-header.component.scss'],
})
export class GenericProfileHeaderComponent implements OnInit {
  @Input() headerData: any;
  @Input() buttonConfig: any;
  @Input() showRole: any;
  @Input() isMentor: any;
  @Input() userNotFound?: any;
  labels = ['CHECK_OUT_MENTOR', 'PROFILE_ON_MENTORED_EXPLORE_THE_SESSIONS'];

  public isMobile: any;
  roles: any;

  constructor(
    private router: Router,
    private localStorage: LocalStorageService,
    private profileService: ProfileService,
    private utilService: UtilService,
    private toast: ToastService,
    private translateService: TranslateService
  ) {
    this.isMobile = utilService.isMobile();
  }

  async ngOnInit() {
    this.roles = this.headerData.organizations?.length && this.headerData.organizations[0].roles.filter((role: any) => role["title"] === "mentor");
    this.isMentor =this.roles?.length && this.roles .some((role: any) => role.title === 'mentor');
  }

  async action(event) {
    switch (event) {
      case 'edit':
        this.router.navigate([`/${CommonRoutes.EDIT_PROFILE}`], {replaceUrl:true});
        break;

      case 'role':
        if (this.headerData?.about != null || environment['isAuthBypassed']) {
          this.router.navigate([`/${CommonRoutes.MENTOR_QUESTIONNAIRE}`]);
        } else {
          this.profileService.upDateProfilePopup();
        }
        break;

      case 'share':
        if (this.isMobile && navigator.share && this.buttonConfig.meta) {
          this.translateText();
          let url = `/${CommonRoutes.MENTOR_DETAILS}/${this.buttonConfig.meta.id}`;
          let link = await this.utilService.getDeepLink(url);
          this.headerData.name = this.headerData.name.trim();
          let params = {
            link: link,
            subject: this.headerData?.name,
            text: this.labels[0] + ` ${this.headerData.name}` + this.labels[1],
          };
          await this.utilService.shareLink(params);
        } else {
          await this.copyToClipBoard(window.location.href);
          this.toast.showToast('PROFILE_LINK_COPIED', 'success');
        }
        break;
      case 'requestSession':
        this.router.navigate([`/${CommonRoutes.SESSION_REQUEST}`], {queryParams: {data: this.headerData.id}});
        break;
      case 'chat':
        this.headerData.is_connected
          ? this.router.navigate([
              `/${CommonRoutes.CHAT}`,
              this.headerData.connection_details?.room_id,
            ],{queryParams: {id: this.headerData.id}})
          : this.router.navigate([
              `/${CommonRoutes.CHAT_REQ}`,
              this.headerData.id,
            ]);
    }
  }

  translateText() {
    this.translateService.get(this.labels).subscribe((translatedLabel) => {
      let labelKeys = Object.keys(translatedLabel);
      labelKeys.forEach((key) => {
        let index = this.labels.findIndex((label) => label === key);
        this.labels[index] = translatedLabel[key];
      });
    });
  }

  copyToClipBoard = async (copyData: any) => {
    await Clipboard.write({
      string: copyData,
    }).then(() => {
      this.toast.showToast('COPIED', 'success');
    });
  };

  async viewRoles(){
    const titlesArray = this.headerData.organizations[0].roles.map(item => item.title);
    this.profileService.viewRolesModal(titlesArray);
  }
}
