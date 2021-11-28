import { HttpClient } from '@angular/common/http';
import { Component, NgZone, OnInit } from '@angular/core';
import { JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';
import { Deeplinks } from '@ionic-native/deeplinks/ngx';
import { NavController, Platform } from '@ionic/angular';
import { SKELETON } from 'src/app/core/constants/skeleton.constant';
import { Router } from '@angular/router';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { HttpService, LoaderService } from 'src/app/core/services';
import { urlConstants } from 'src/app/core/constants/urlConstants';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public formData: JsonFormData;
  user;
  SESSIONS: string = CommonRoutes.SESSIONS;
  SKELETON = SKELETON;
  page = 1;
  limit = 5;
  sessions;
  sessionsCount = 0;

public headerConfig: any = {
  menu: true,
  notification: true,
  headerColor: 'primary',
  // label:'MENU'
};
  constructor(
    private http: HttpClient,
    private router: Router,
    private navController: NavController,
    private deeplinks: Deeplinks,
    private profileService: ProfileService,
    private loaderService: LoaderService,
    private httpService: HttpService,
    private platform: Platform,
    private zone:NgZone) {}
    
  ngOnInit() {
    this.getUser();
    this.setupDeepLinks();
  }

  setupDeepLinks() {
    this.deeplinks.route({
      '/sessions/details/:id': '',
    }).subscribe(match=>{
      this.zone.run(()=>{
        this.router.navigateByUrl(match.$link.path);
      })  
    })
  }
  ionViewWillEnter() {
    this.getSessions();
  }
  eventAction(event){
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}`]);
    }
  }
  viewMore(){
    this.router.navigate([`/${CommonRoutes.SESSIONS}`]);
  }

  search(){
    this.router.navigate([`/${CommonRoutes.HOME_SEARCH}`]);
  }
  getUser() {
    this.profileService.profileDetails(false).then(data => {
      this.user = data
    })
  }

  async getSessions() {
    const config = {
      url: urlConstants.API_URLS.HOME_SESSION + this.page + '&limit=' + this.limit,
    };
    try {
      let data: any = await this.httpService.get(config);
      console.log(data.result, "data.result");
      this.sessions = data.result;
      console.log(this.sessions, this.sessions.allSessions, "this.sessions");
      this.sessionsCount = data.result.count;
    }
    catch (error) {
    }
  }
}
