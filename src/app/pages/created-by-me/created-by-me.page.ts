import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-created-by-me',
  templateUrl: './created-by-me.page.html',
  styleUrls: ['./created-by-me.page.scss'],
})
export class CreatedByMePage implements OnInit {
  page = 1;
  limit = 10;
  status:string ='';
  searchText: string='';
  type: string;
  sessions: any;
  mentorsCount;
  public headerConfig: any = {
    menu: false,
    notification: false,
    headerColor: 'white',
    backButton: {
      label: 'Created by me',
    },
  };
  
  constructor(private navCtrl:NavController, private router:Router, private sessionService: SessionService) {}
  ionViewWillEnter() {
    this.type="all-sessions";
  }

  ngOnInit() {
    this.fetchSessionDetails();
  }

  async fetchSessionDetails(){
    var response = await this.sessionService.getSessionsAPI(this.page,this.limit,this.status,this.searchText);
    this.mentorsCount =  response[0]?.count;
    this.sessions=response[0]?.data;
  }

  public segmentChanged(ev: any) {
    this.type = ev.target.value;
  }

  createSession(){
    this.navCtrl.navigateForward([CommonRoutes.CREATE_SESSION]);
  }

  goToHome(){
    this.router.navigate([`/${CommonRoutes.TABS}/${CommonRoutes.HOME}`], { replaceUrl: true });
  }

  loadMore(){
    this.page = this.page + 1;
    this.fetchSessionDetails();
  }

}
