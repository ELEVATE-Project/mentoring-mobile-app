import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { SKELETON } from 'src/app/core/constants/skeleton.constant';
import { HttpService, LoaderService } from 'src/app/core/services';
import { urlConstants } from 'src/app/core/constants/urlConstants';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.html',
  styleUrls: ['./sessions.scss'],
})
export class SessionsPage implements OnInit {
  type: string;
  sessionsCount = 0;
  page = 1;
  limit = 10;
  searchText: string='';
  SKELETON = SKELETON;
  constructor(private activatedRoute: ActivatedRoute,
    private httpService: HttpService,
    private loaderService: LoaderService,
    private router: Router) {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.type = params.get('type');
      this.type = this.type ? this.type : "all-sessions";
    });
  }
  public headerConfig: any = {
    menu: false,
    notification: false,
    headerColor: 'primary',
    backButton: true,
    label: 'SESSIONS_PAGE'
  };
  SESSIONS_DETAILS: any = CommonRoutes.SESSIONS_DETAILS;
  SESSIONS: any = CommonRoutes.SESSIONS;

  sessions=[];
  ngOnInit() {
  }
  ionViewWillEnter() {
    this.getSessions();
  }
  public segmentChanged(ev: any) {
    this.type = ev.target.value;
  }
  eventAction(event) {
    console.log(event, "event");
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([`${CommonRoutes.SESSIONS}/${CommonRoutes.SESSIONS_DETAILS}`]);
        break;
    }
  }
  loadMore() {
    this.page = this.page + 1;
    this.getSessions();
  }
  onSearch() {
    this.page = 1;
    this.getSessions();
    this.sessions = [];
  }

  async getSessions() {
    await this.loaderService.startLoader();
    let type = this.type == "all-sessions" ? false : true
    console.log(urlConstants.API_URLS.SESSIONS + type + '&page=' + this.page + '&limit=' + this.limit + '&search=' + this.searchText, "url")

    const config = {
      //sessions?enrolled=true/false&page=1&limit=5&search=:search
      url: urlConstants.API_URLS.SESSIONS + type + '&page=' + this.page + '&limit=' + this.limit + '&search=' + this.searchText,
    };
    try {
      let data: any = await this.httpService.get(config);
      this.loaderService.stopLoader();
      this.sessions = this.sessions.concat(data.result[0].data);
      this.sessionsCount = data.result.count;
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }
}