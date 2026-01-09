import { Location } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { PAGE_IDS } from 'src/app/core/constants/page.ids';
import { UtilService } from 'src/app/core/services';
import { environment } from 'src/environments/environment';
import { CommonRoutes } from 'src/global.routes';
import { PopoverController } from '@ionic/angular';
import { PopoverMenuComponent } from 'src/app/popover-menu/popover-menu.component';
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent implements OnInit {
  @Input() config: any;
  @Output() actionEvent = new EventEmitter();
  hasBadge: boolean;

  constructor(private location:NavController,
    private router : Router,
    private utilService: UtilService,
    private popoverCtrl: PopoverController
  ) {}

  routes =[
     { title: 'MENTORS', action: "mentor-directory", icon: 'people', class:"hide-on-small-screen", url: CommonRoutes.TABS+'/'+CommonRoutes.MENTOR_DIRECTORY, pageId: PAGE_IDS.mentorDirectory},
     { title: 'DASHBOARD', action: "dashboard", icon: 'stats-chart', class:"hide-on-small-screen", url: CommonRoutes.TABS+'/'+CommonRoutes.DASHBOARD, pageId: PAGE_IDS.dashboard },
     { title: 'HELP', action: "help", icon: 'help-circle', url: CommonRoutes.HELP, pageId: PAGE_IDS.help},
     { title: 'FAQ', action: "faq", icon: 'alert-circle', url: CommonRoutes.FAQ, pageId: PAGE_IDS.faq},
     { title: 'HELP_VIDEOS', action: "help videos", icon: 'videocam',url: CommonRoutes.HELP_VIDEOS, pageId: PAGE_IDS.helpVideos },
     { title: 'LANGUAGE', action: "selectLanguage", icon: 'language', url: CommonRoutes.LANGUAGE, pageId: PAGE_IDS.language },
     { title: 'BLOCKED_USERS', action: "blocked-users", icon: 'blocked-users', url: CommonRoutes.BLOCKED_USERS, pageId: PAGE_IDS.blockedUsers },
     { title: 'CHANGE_PASSWORD', action: 'change-password', icon: 'key', url: CommonRoutes.CHANGE_PASSWORD, pageId: PAGE_IDS.changePassword},
     { title: 'LOGIN_ACTIVITY', action: 'login-activity', icon: 'time', url: CommonRoutes.LOGIN_ACTIVITY, pageId: PAGE_IDS.loginActivity},
     {title: 'ADMIN_WORKSPACE', action: "admin", icon: 'briefcase' ,class:'', url: CommonRoutes.ADMIN+'/'+CommonRoutes.ADMIN_DASHBOARD, pageId: PAGE_IDS.adminWorkspace}
   ];
  ngOnInit() {
    this.utilService.hasBadge$.subscribe((flag) => {
      this.hasBadge = flag;
    });
  }
  onAction(event) {
    this.actionEvent.next(event);
  }

  onBack() {
    const currentUrl = this.router.url;
    if (currentUrl === `/${CommonRoutes.TABS}/${CommonRoutes.HOME}`) {
      this.redirectToHome();
    } else {
      this.location.pop();
    }
    
  }
  async openPopover(ev: Event) {
    const popover = await this.popoverCtrl.create({
      component: PopoverMenuComponent,
      event: ev,
      translucent: true,
       componentProps: {
        actions: this.config?.actions || []
      },
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data) {
      this.handleAction(data);
    }
  }

  handleAction(event: string) {
    switch(event) {

      case "block":
        this.actionEvent.next(event);
        break;

      case "share":
        this.actionEvent.next(event);
        break;
    }
  }
  redirectToHome() {
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/home`;
  }
}
