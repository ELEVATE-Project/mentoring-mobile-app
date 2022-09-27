import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss']
})
export class DashboardPage implements OnInit {
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
  chartData: any = {
    chart: {
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: ['#ffab00', '#BEBEBE']
          }
        ]
      }
    }
  };

  constructor( 
    private translate: TranslateService,
    private profile: ProfileService,
    private apiService: HttpService ) { }

    ngOnInit() {
     
    }

  ionViewWillEnter(){
    this.dataAvailable = false;
    if(typeof this.isMentor === "undefined"){
      this.profile.profileDetails().then(profileDetails => {
        this.isMentor = profileDetails?.isAMentor;
        this.segment= this.isMentor ? "mentor":"mentee";
        this.getReports();
      })
    } else {
      this.getReports();
    }
  }

  segmentChanged(ev: any) {
    console.log('Segment changed', ev);
    this.segment = ev.detail.value;
    this.getReports();
  }

  filterChangeHandler(event: any) {
    console.log('Filter changed', event);
    this.selectedFilter = event.target.value;
    this.getReports();
  }

  public headerConfig: any = {
    menu: true,
    label:'DASHBOARD_PAGE',
    headerColor: 'primary',
  };

  getReports() {
    this.loading = true;
    const url = this.segment === 'mentor' ? urlConstants.API_URLS.MENTOR_REPORTS : urlConstants.API_URLS.MENTEE_REPORTS;
    const config = {
      url: url+this.selectedFilter.toUpperCase(),
    };
    let texts: any;
    this.translate.get(['TOTAL_SESSION_CREATED', 'TOTAL_SESSION_CONDUCTED', 'TOTAL_SESSION_ENROLLED', 'TOTAL_SESSION_ATTENDED']).subscribe(text => {
      texts = text;
    })
    this.apiService.get(config).then(success => {
      let chartObj;
      console.log(success)
        this.chartData.chart.data.labels.length = 0;
        this.chartData.chart.data.datasets[0].data.length = 0;
      if(this.segment === 'mentor'){
        this.chartData.chart.data.labels.push(texts['TOTAL_SESSION_CREATED'], texts['TOTAL_SESSION_CONDUCTED'])
        this.chartData.chart.data.datasets[0].data.push(success.result.totalSessionCreated || 0, success.result.totalsessionHosted || 0);
      } else {
        this.chartData.chart.data.labels.push(texts['TOTAL_SESSION_ENROLLED'], texts['TOTAL_SESSION_ATTENDED'])
        this.chartData.chart.data.datasets[0].data.push(success.result.totalSessionEnrolled || 0, success.result.totalsessionsAttended || 0);
      }
      this.dataAvailable=(this.chartData.chart.data.datasets[0].data[0]===0&&this.chartData.chart.data.datasets[0].data[1]===0) ? false:true;
      this.loading = false;
    }).catch(error => {
      this.loading = false;
    })
  }
}