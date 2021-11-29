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
  showLoadMoreButton: boolean = false;

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

  ngOnInit() {}

  ionViewWillEnter() {
    this.sessions = []
    this.getSessions();
  }
  public segmentChanged(ev: any) {
    this.type = ev.target.value;
    this.sessions = [];
    this.page = 1;
    this.getSessions();
  }
  loadMore() {
    this.page = this.page + 1;
    this.getSessions();
  }
  onSearch() {
    this.page = 1;
    this.sessions = [];
    this.getSessions();
  }

  async getSessions() {
    await this.loaderService.startLoader();
    let type = this.type == "all-sessions" ? false : true
    const config = {
      //sessions?enrolled=true/false&page=1&limit=5&search=:search
      url: urlConstants.API_URLS.SESSIONS + type + '&page=' + this.page + '&limit=' + this.limit + '&search=' + this.searchText,
    };
    try {
      let data: any = await this.httpService.get(config);
      this.loaderService.stopLoader();
      this.sessions = this.sessions.concat(data?.result[0]?.data);
      this.sessionsCount = data?.result[0]?.count;
      this.showLoadMoreButton = (this.sessions?.length === this.sessionsCount) ? false : true;
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }
  ionViewWillLeave(){
    this.sessionsCount=0;
    this.sessions=[];
  }
}