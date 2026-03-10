import { Component, OnInit, input, computed, ChangeDetectionStrategy, signal } from '@angular/core';
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
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenericProfileHeaderComponent implements OnInit {
  headerData = input<any>();
  buttonConfig = input<any>();
  showRole = input<any>();
  isMentorInput = input<any>(undefined, { alias: 'isMentor' });
  userNotFound = input<any>();
  isblocked = input<any>();
  
  labels = signal(['CHECK_OUT_MENTOR', 'PROFILE_ON_MENTORED_EXPLORE_THE_SESSIONS']);

  public isMobile: boolean;
  chatConfig = signal<string>('');
  clipboard = Clipboard;

  roles = computed(() => {
    const data = this.headerData();
    return data?.organizations?.[0]?.roles?.filter((role: any) => role["title"] === "mentor") || [];
  });

  isMentor = computed(() => {
    const inputVal = this.isMentorInput();
    if (inputVal !== undefined) return inputVal;
    return !!(this.roles()?.length && this.roles().some((role: any) => role.title === 'mentor'));
  });

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
    const chatConfigValue = await this.localStorage.getLocalData(localKeys['CHAT_CONFIG']);
    this.chatConfig.set(chatConfigValue);
  }

  async action(event) {
    const header = this.headerData();
    const meta = this.buttonConfig()?.meta;
    switch (event) {
      case 'edit':
        this.router.navigate([`/${CommonRoutes.EDIT_PROFILE}`], {replaceUrl:true});
        break;

      case 'role':
        if (header?.about != null || environment['isAuthBypassed']) {
          this.router.navigate([`/${CommonRoutes.MENTOR_QUESTIONNAIRE}`]);
        } else {
          this.profileService.upDateProfilePopup();
        }
        break;

      case 'share':
        if (this.isMobile && navigator.share && meta) {
          this.translateText();
          let url = `/mentoring/${CommonRoutes.MENTOR_DETAILS}/${meta.id}`;
          let link = await this.utilService.getDeepLink(url);
          const name = (header?.name || '').trim();
          let params = {
            link: link,
            subject: name,
            text: this.labels()[0] + ` ${name}` + this.labels()[1],
          };
          await this.utilService.shareLink(params);
        } else {
          await this.copyToClipBoard(window.location.href);
          this.toast.showToast('PROFILE_LINK_COPIED', 'success');
        }
        break;
      case 'requestSession':
        this.router.navigate([`/${CommonRoutes.SESSION_REQUEST}`], {queryParams: {data: header?.id}});
        break;
      case 'chat':
        header?.is_connected
          ? this.router.navigate([
            `/${CommonRoutes.CHAT}`,
            header?.connection_details?.room_id,
          ],{queryParams: {id: header?.id}})
          : this.router.navigate([
            `/${CommonRoutes.CHAT_REQ}`,
            header?.id,
          ]);
    }
  }

  translateText() {
    this.translateService.get(this.labels()).subscribe((translatedLabel) => {
      let labelKeys = Object.keys(translatedLabel);
      const newLabels = [...this.labels()];
      labelKeys.forEach((key) => {
        let index = newLabels.findIndex((label) => label === key);
        if (index !== -1) {
          newLabels[index] = translatedLabel[key];
        }
      });
      this.labels.set(newLabels);
    });
  }

  copyToClipBoard = async (copyData: any) => {
    await this.clipboard.write({
      string: copyData,
    }).then(() => {
      this.toast.showToast('COPIED', 'success');
    });
  };

  async viewRoles(){
    const roles = this.headerData()?.organizations?.[0]?.roles || [];
    const titlesArray = roles.map(item => item.title);
    this.profileService.viewRolesModal(titlesArray);
  }
}
