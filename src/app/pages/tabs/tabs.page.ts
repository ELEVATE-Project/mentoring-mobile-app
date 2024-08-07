import { Component } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { PAGE_IDS } from 'src/app/core/constants/page.ids';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  private activeTab?: HTMLElement;
  subscription: any;
  PAGE_IDS = PAGE_IDS
  constructor() {}
  tabChange(tabsRef: IonTabs) {
    this.activeTab = tabsRef?.outlet?.activatedView?.element;
  }
  ionViewWillLeave() {
    this.propagateToActiveTab('ionViewWillLeave');
  }

  ionViewDidLeave() {
    this.propagateToActiveTab('ionViewDidLeave');
  }

  ionViewWillEnter() {
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
}
