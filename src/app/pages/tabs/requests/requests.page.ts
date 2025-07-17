import { Component, OnInit } from '@angular/core';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService } from 'src/app/core/services';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { SessionService } from 'src/app/core/services/session/session.service';

@Component({
  selector: 'app-requests',
  templateUrl: './requests.page.html',
  styleUrls: ['./requests.page.scss'],
})
export class RequestsPage implements OnInit {
  public headerConfig: any = {
    menu: true,
    label: 'REQUESTS',
    headerColor: 'primary',
    notification: false,
  };
  segmentType = 'slot-requests';
  buttonConfig: any;
  data: any;
  noResult: any;
  routeData: any;
  slotBtnConfig: any;
  slotRequests: any;

  constructor(
    private httpService: HttpService,
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService
  ) {}

  ionViewWillEnter(){
    this.route.data.subscribe((data) => {
      this.routeData = data;
      this.buttonConfig = this.routeData?.button_config;
      this.slotBtnConfig = this.routeData.slotButtonConfig;
    });
    this.sessionService.requestSessionList().then((res) => {
        this.slotRequests = res?.result?.data ?? [];
        if (!this.slotRequests.length) {
          this.noResult = { subHeader: this.routeData?.noDataFound.noSession };
        }
      })
      .catch((error) => {
        console.error('Error fetching session list:', error);
      });
      this.pendingRequest();

  }
  ngOnInit() {
  }

 segmentChanged(event: any) {
  this.segmentType = event.target.value;
  if (this.segmentType === 'slot-requests') {
    if (!this.slotRequests?.length) {
      this.noResult = { subHeader: this.routeData?.noDataFound.noSession }
    }
  } else {
    if (!this.data?.length) {
      this.noResult = { subHeader: this.routeData?.noDataFound.noMessage };
    }
  }
}


  async pendingRequest() {
    const config = {
      url: urlConstants.API_URLS.CONNECTION_REQUEST,
    };
    try {
      let data: any = await this.httpService.get(config);
      this.data = data ? data.result.data : '';
      return data;
    } catch (error) {
      return error;
    }
  }

  onCardClick(event, data?) {
    switch (event.type) {
      case 'viewMessage':
        this.router.navigate([CommonRoutes.CHAT_REQ, event.data]);
        break;
      case 'viewDetails':
        this.router.navigate([CommonRoutes.SESSION_REQUEST_DETAILS], {queryParams: {id: data}});
        break;
    }
  }

  ionViewWillLeave() {
    this.noResult = {};
    this.segmentType = 'slot-requests';
  }
}
