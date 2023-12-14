import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Chart } from 'chart.js/auto';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss']
})
export class DashboardPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild('pieChart') pieChart: ElementRef;
  public chart: any;
  segment: any;
  dataAvailable;
  isMentor:boolean;
  selectedFilter = "WEEKLY";
  filter: any = [
    {
      key: 'WEEKLY',
      value: 'WEEKLY'
    },
    {
      key: 'MONTHLY',
      value: 'MONTHLY'
    },
    {
      key: 'QUARTERLY',
      value: 'QUARTERLY'
    }
  ];
  loading: boolean = false;
  chartData: any;

  constructor(
    private translate: TranslateService,
    private profile: ProfileService,
    private apiService: HttpService) { }

  ngOnInit() {
    this.isMentor = this.profile.isMentor;
    this.segment = this.isMentor ? "mentor" : "mentee";
    this.dataAvailable = true;
    this.getReports();
  }

  ionViewWillEnter() {
    this.gotToTop();
  }

  gotToTop() {
    this.content.scrollToTop(1000);
  }

  segmentChanged(ev: any) {
    this.segment = ev.detail.value;
    this.chart.destroy();
    this.dataAvailable = true;
    this.getReports();
  }

  filterChangeHandler(event: any) {
    this.selectedFilter = event.target.value;
    this.chart.destroy();
    this.dataAvailable = true;
    this.getReports();
  }

  public headerConfig: any = {
    menu: true,
    label:'DASHBOARD_PAGE',
    headerColor: 'primary',
  };

  getReports() {
    const url = this.segment === 'mentor' ? urlConstants.API_URLS.MENTOR_REPORTS : urlConstants.API_URLS.MENTEE_REPORTS;
    const config = {
      url: url+this.selectedFilter.toUpperCase(),
    };
    let texts: any;
    this.translate.get(['TOTAL_SESSION_CREATED', 'TOTAL_SESSION_CONDUCTED', 'TOTAL_SESSION_ENROLLED', 'TOTAL_SESSION_ATTENDED']).subscribe(text => {
      texts = text;
    })
    this.apiService.get(config).then(success => {
      this.chartData = success.result;
      this.createChart();
    }).catch(error => {
    })
  }

  createChart() {
    this.chart = new Chart('MyChart', {
      type: 'pie',
      data: {
        labels: this.segment === 'mentor' ? ['Total sessions created', 'Total sessions conducted'] : ['Total sessions enrolled', 'Total sessions attended'],
        datasets: [{
          label: 'Total',
          data: this.segment === 'mentor' ? [this.chartData.total_session_created, this.chartData.total_session_hosted] : [this.chartData.total_session_enrolled, this.chartData.total_session_attended],
          backgroundColor: [
            '#ffdf00', '#7b7b7b'
          ],
          hoverOffset: 4
        }],
      },
      options: {
        aspectRatio: 1.5,
        responsive: true,
      }
    });
    this.dataAvailable = (this.chartData?.total_session_created == 0 || this.chartData?.total_session_enrolled == 0) ? false : true
  }
}