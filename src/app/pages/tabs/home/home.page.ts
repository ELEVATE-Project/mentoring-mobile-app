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
import { HttpService, LoaderService, UtilService } from 'src/app/core/services';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { SessionService } from 'src/app/core/services/session/session.service';
import { Location } from '@angular/common';

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
  status = "published,live";

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
    private zone:NgZone,
    private sessionService: SessionService,
    private location: Location,
    private utilService: UtilService) {}
    
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
        this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${event.data._id}`]);
        break;

      case 'joinAction':
        this.sessionService.joinSession(event.data.sessionId);
        break;
    }
  }
  viewMore(data){
    this.router.navigate([`/${CommonRoutes.SESSIONS}`], {queryParams:{type:data}});
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
      this.sessions = data.result;
      this.sessionsCount = data.result.count;
    }
    catch (error) {
    }
  }
}
