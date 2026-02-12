import { Component } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { PAGE_IDS } from 'src/app/core/constants/page.ids';
import { LocalStorageService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-tabs',
    templateUrl: 'tabs.page.html',
    styleUrls: ['tabs.page.scss'],
    standalone: false
})
export class TabsPage {
  private activeTab?: HTMLElement;
  subscription: any;
  user: any;
  PAGE_IDS = PAGE_IDS;
  customIcon: string ;
  constructor(
    private localStorage : LocalStorageService,
    public profile: ProfileService,

  ) {}
  tabChange(tabsRef: IonTabs) {
    this.activeTab = tabsRef?.outlet?.activatedView?.element;
    (tabsRef.outlet.activatedView.stackId == 'requests') ? this.customIcon= '/assets/images/request_icon_solid_color.svg' : this.customIcon = '/assets/images/request_icon_dark.svg';
  }
  ionViewWillLeave() {
    this.propagateToActiveTab('ionViewWillLeave');
  }

  ionViewDidLeave() {
    this.propagateToActiveTab('ionViewDidLeave');
  }

async ionViewWillEnter() {
  const userDetails = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
  if (userDetails) {
    this.user = userDetails;
    this.profile.getUserRole(userDetails);
  } else {
    const profileDetails = await this.profile.getProfileDetailsFromAPI();
    this.user = profileDetails;
    this.profile.getUserRole(profileDetails);
  }
  this.propagateToActiveTab('ionViewWillEnter');
}


  ionViewDidEnter() {
    this.propagateToActiveTab('ionViewDidEnter');
  }
  private propagateToActiveTab(eventName: string) {
    if (this.activeTab) {
      this.activeTab.dispatchEvent(new CustomEvent(eventName));
    }
  }
  // allowTemplateView(page) {
  //   return !environment.restictedPages.includes(page);
  // }

  isCustomIcon(icon: string): boolean {
    return icon ? /\.(svg|png|jpg|jpeg|gif)$/.test(icon) : false;
  }
}
