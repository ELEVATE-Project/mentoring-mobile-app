import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { SKELETON } from 'src/app/core/constants/skeleton.constant';

@Component({
  selector: 'app-sessions',
  templateUrl: './sessions.html',
  styleUrls: ['./sessions.scss'],
})
export class SessionsPage implements OnInit {
  type: string;
  SKELETON = SKELETON;
  constructor(private activatedRoute: ActivatedRoute, 
    private router : Router) {
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
    label:'SESSIONS_PAGE'
  };
  SESSIONS_DETAILS: any = CommonRoutes.SESSIONS_DETAILS;
  SESSIONS: any = CommonRoutes.SESSIONS;
  page =1;
  limit =10;
  sessions = [{
    _id: 1,
    title: 'Topic, Mentor name',
    subTitle: 'Short description ipsum dolor sit amet, consectetur',
    description: 'Short description ipsum dolor sit amet, consectetur',
    date: '20/11/2021',
    status: 'Live'
  },
  {
    _id: 2,
    title: 'Topic, Mentor name',
    subTitle: 'Short description ipsum dolor sit amet, consectetur',
    description: 'Short description ipsum dolor sit amet, consectetur',
    date: '20/11/2021',
    status: 'Live'
  }, {
    _id: 3,
    title: 'Topic, Mentor name',
    subTitle: 'Short description ipsum dolor sit amet, consectetur',
    description: 'Short description ipsum dolor sit amet, consectetur',
    date: '20/11/2021'
  }, {
    _id: 4,
    title: 'Topic, Mentor name',
    subTitle: 'Short description ipsum dolor sit amet, consectetur',
    description: 'Short description ipsum dolor sit amet, consectetur',
    date: '20/11/2021'
  }
  ];
  ngOnInit() {
  }
  public segmentChanged(ev: any) {
    this.type = ev.target.value;
  }
  getSessions(){
    // TODO api call to get sessions
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
}