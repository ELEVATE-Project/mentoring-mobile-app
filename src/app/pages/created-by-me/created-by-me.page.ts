import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';
import { Location } from '@angular/common';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService } from 'src/app/core/services';

@Component({
  selector: 'app-created-by-me',
  templateUrl: './created-by-me.page.html',
  styleUrls: ['./created-by-me.page.scss'],
})
export class CreatedByMePage implements OnInit {
  page = 1;
  limit = 10;
  searchText: string = '';
  type = "published,live";
  sessions = [];
  sessionsCount;
  buttonConfig = {
    label: "START",
    value: "start"
  };
  public headerConfig: any = {
    menu: false,
    notification: false,
    headerColor: 'white',
    backButton: {
      label: 'Created by me',
    },
  };
  showLoadMoreButton: boolean = false;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private sessionService: SessionService,
    private _location: Location,
    private localStorage: LocalStorageService) { }

  ionViewWillEnter() {
    this.sessions = [];
    this.fetchSessionDetails();
  }

  ngOnInit() {
  }

  async fetchSessionDetails() {
    var obj = { page: this.page, limit: this.limit, status: this.type, searchText: this.searchText };
    var response = await this.sessionService.getAllSessionsAPI(obj);
    if (response?.data) {
      this.sessions = this.sessions.concat(response?.data);
      this.sessionsCount = response?.count;
      this.showLoadMoreButton = (this.sessions?.length === this.sessionsCount) ? false : true;
    }
  }

  public segmentChanged(ev: any) {
    this.type = ev.target.value;
    this.refreshPage();
  }

  public onSearch(ev) {
    this.searchText = ev.target.value;
    this.refreshPage();
  }

  public refreshPage() {
    this.sessions = [];
    this.page = 1;
    this.fetchSessionDetails();
  }

  async createSession() {
    let userDetails = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    if (userDetails?.about) {
      this.navCtrl.navigateForward([CommonRoutes.CREATE_SESSION]);
    } else {
      this.navCtrl.navigateForward([`/${CommonRoutes.TABS}/${CommonRoutes.PROFILE}`]);
    }
  }

  goToHome() {
    this._location.back();
  }

  loadMore() {
    this.page = this.page + 1;
    this.fetchSessionDetails();
  }
}
