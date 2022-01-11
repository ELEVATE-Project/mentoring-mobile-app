import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { IonTabs, Platform } from '@ionic/angular';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  private activeTab?: HTMLElement;
  subscription: any;
  constructor(private platform: Platform, private router: Router) { }
  tabChange(tabsRef: IonTabs) {
    this.activeTab = tabsRef.outlet.activatedView.element;
  }
  ionViewWillLeave() {
    this.propagateToActiveTab('ionViewWillLeave');
    this.subscription.unsubscribe();
  }

  ionViewDidLeave() {
    this.propagateToActiveTab('ionViewDidLeave');
  }

  ionViewWillEnter() {
    this.propagateToActiveTab('ionViewWillEnter');
  }

  ionViewDidEnter() {
    this.propagateToActiveTab('ionViewDidEnter');
    this.subscription = this.platform.backButton.subscribeWithPriority(9999, () => {
      this.router.navigate(["/"]);
    })
  }
  private propagateToActiveTab(eventName: string) {
    if (this.activeTab) {
      this.activeTab.dispatchEvent(new CustomEvent(eventName));
    }
  }
}
