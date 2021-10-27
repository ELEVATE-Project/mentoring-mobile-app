import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-created-by-me',
  templateUrl: './created-by-me.page.html',
  styleUrls: ['./created-by-me.page.scss'],
})
export class CreatedByMePage implements OnInit {
  type: string;
  sessions: any;
  public headerConfig: any = {
    menu: false,
    notification: false,
    headerColor: 'white',
    backButton: {
      label: 'Created by me',
    },
  };
  
  constructor(private navCtrl:NavController) {}
  ionViewWillEnter() {
    this.type="all-sessions";
    this.sessions = [
      {
        _id: 1,
        title: 'Topic, Mentor name',
        subTitle: 'Completed',
        description: 'Completed',
        date: '20/11/2021',
        status: 'Live',
      },
      {
        _id: 2,
        title: 'Topic, Mentor name',
        subTitle: 'Completed',
        description: 'Completed',
        date: '20/11/2021',
        status: 'Live',
      },
      {
        _id: 3,
        title: 'Topic, Mentor name',
        subTitle: 'Completed',
        description: 'Completed',
        date: '20/11/2021',
      },
      {
        _id: 4,
        title: 'Topic, Mentor name',
        subTitle: 'Completed',
        description: 'Completed',
        date: '20/11/2021',
      },
    ];
  }

  ngOnInit() {}
  public segmentChanged(ev: any) {
    this.type = ev.target.value;
  }

  createSession(){
    this.navCtrl.navigateForward([CommonRoutes.CREATESESSION]);
  }

}
