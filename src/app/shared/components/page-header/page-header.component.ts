import { Location } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { PAGE_IDS } from 'src/app/core/constants/page.ids';
import { environment } from 'src/environments/environment';
import { CommonRoutes } from 'src/global.routes';
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent implements OnInit {
  @Input() config: any;
  @Output() actionEvent = new EventEmitter();

  constructor(private location:NavController,
    private router : Router
  ) {}

  routes =[
     { title: 'MENTORS', action: "mentor-directory", icon: 'people', class:"hide-on-small-screen", url: CommonRoutes.TABS+'/'+CommonRoutes.MENTOR_DIRECTORY, pageId: PAGE_IDS.mentorDirectory},
     { title: 'DASHBOARD', action: "dashboard", icon: 'stats-chart', class:"hide-on-small-screen", url: CommonRoutes.TABS+'/'+CommonRoutes.DASHBOARD, pageId: PAGE_IDS.dashboard },
     { title: 'HELP', action: "help", icon: 'help-circle', url: CommonRoutes.HELP, pageId: PAGE_IDS.help},
     { title: 'FAQ', action: "faq", icon: 'alert-circle', url: CommonRoutes.FAQ, pageId: PAGE_IDS.faq},
     { title: 'HELP_VIDEOS', action: "help videos", icon: 'videocam',url: CommonRoutes.HELP_VIDEOS, pageId: PAGE_IDS.helpVideos },
     { title: 'LANGUAGE', action: "selectLanguage", icon: 'language', url: CommonRoutes.LANGUAGE, pageId: PAGE_IDS.language },
     { title: 'CHANGE_PASSWORD', action: 'change-password', icon: 'key', url: CommonRoutes.CHANGE_PASSWORD, pageId: PAGE_IDS.changePassword},
     { title: 'LOGIN_ACTIVITY', action: 'login-activity', icon: 'time', url: CommonRoutes.LOGIN_ACTIVITY, pageId: PAGE_IDS.loginActivity},
     {title: 'ADMIN_WORKSPACE', action: "admin", icon: 'briefcase' ,class:'', url: CommonRoutes.ADMIN+'/'+CommonRoutes.ADMIN_DASHBOARD, pageId: PAGE_IDS.adminWorkspace}
   ];
  ngOnInit() {}
  onAction(event) {
    this.actionEvent.next(event);
  }

  onBack() {
    const currentUrl = this.router.url;
    console.log(currentUrl,"currentUrl --->", this.router.url);
    console.log(window.location.origin,"window.location.origin; --->");
    if (currentUrl === `/${CommonRoutes.TABS}/${CommonRoutes.HOME}`) {
      const baseUrl = window.location.origin;
      window.location.href = `${baseUrl}/home`;
    } else {
      this.location.pop();
    }
  }
}
