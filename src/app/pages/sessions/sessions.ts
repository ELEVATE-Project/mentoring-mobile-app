import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { SKELETON } from 'src/app/core/constants/skeleton.constant';
import { HttpService, LoaderService } from 'src/app/core/services';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { SessionService } from 'src/app/core/services/session/session.service';

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
  loading: boolean = false;
  emptyMessage;
  emptyMessageOnSearch: string="NO_DATA_AVAILABLE";

  constructor(private activatedRoute: ActivatedRoute,
    private httpService: HttpService,
    private loaderService: LoaderService,
    private router: Router,
    private sessionService: SessionService) {
    this.activatedRoute.queryParamMap.subscribe(params => {
      this.type = !this.type ? (params.get('type') || "all-sessions") : this.type;
      this.emptyMessage = this.type=='my-sessions' ? 'NO_ACTIVE_MY_SESSIONS' : 'NO_ACTIVE_ALL_SESSIONS';
    });
  }
  public headerConfig: any = {
    menu: false,
    notification: false,
    headerColor: 'primary',
    backButton: true,
    label: 'SESSIONS_PAGE'
  };

  public buttonConfig: any = {
    label: "JOIN"
  };

  SESSIONS_DETAILS: any = CommonRoutes.SESSIONS_DETAILS;
  SESSIONS: any = CommonRoutes.SESSIONS;
  sessions=[];

  ngOnInit() {}

  ionViewWillEnter() {
    this.page =1;
    this.sessions = []
    this.getSessions();
  }
  public segmentChanged(ev: any) {
    this.type = ev.target.value;
    this.emptyMessage = this.type=='my-sessions' ? 'NO_ACTIVE_MY_SESSIONS' : 'NO_ACTIVE_ALL_SESSIONS';
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
    this.loading = true;
    let type = this.type == "all-sessions" ? false : true
    let obj = {
      type: type,
      page:this.page,
      limit: this.limit,
      searchText: this.searchText,
    }
    let data = await this.sessionService.getSessionsList(obj);
    this.sessions = this.sessions.concat(data?.result[0]?.data);
    this.sessionsCount = data?.result[0]?.count;
    this.showLoadMoreButton = (this.sessions?.length === this.sessionsCount) ? false : true;
    this.loading = false;
  }

  onAction(event){
    this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${event.data._id}`]);
  }

  async onJoin(event){
    await this.sessionService.joinSession(event.data.sessionId);
  }
}