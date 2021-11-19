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
  searchText: string='';
  type=1;
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
    this.fetchSessionDetails();
  }

  ngOnInit() {
  }

  async fetchSessionDetails(){
    const status = this.type==1 ? "published" : "completed";
    var response = await this.sessionService.getAllSessionsAPI(this.page,this.limit,status,this.searchText);
    this.mentorsCount =  response?.count;
    this.sessions=response?.data;
    console.log(response)
  }

  public segmentChanged(ev: any) {
    this.type = ev.target.value;
    this.fetchSessionDetails();
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
  eventAction(event){
    console.log(event);
    this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}`], { queryParams: {id: event.data._id, showEditButton: event.showEditButton}});
  }

}
