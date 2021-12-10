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
  segment: any = 'mentee';
  dataAvailable = true;
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
            backgroundColor: ['#ffab00', 'blue']
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
    if(typeof this.isMentor === "undefined"){
      this.profile.profileDetails(false).then(profileDetails => {
        this.isMentor = profileDetails?.isAMentor;
        this.getReports();
      })
    } else {
      console.log("in else");
      this.getReports();
    }
  }

  // setChartData({labels = [], values = []}) {
  //   this.chartData = {
  //     chart: {
  //       data: {
  //         labels: labels,
  //         datasets: [
  //           {
  //             data: values,
  //             backgroundColor: ['#ffab00', 'blue']
  //           }
  //         ]
  //       }
  //     }
  //   };
  // }

  segmentChanged(ev: any) {
    console.log('Segment changed', ev);
    this.segment = ev.detail.value;
    this.getReports();
  }

  filterChangeHandler(event: any) {
    console.log('Filter changed', event);
    this.selectedFilter = event.target.value;
  }

  public headerConfig: any = {
    menu: true,
    label:'DASHBOARD_PAGE',
    headerColor: 'white',
  };

  getReports() {
    this.loading = true;
    const url = this.segment === 'mentor' ? urlConstants.API_URLS.MENTOR_REPORTS : urlConstants.API_URLS.MENTEE_REPORTS;
    const config = {
      url: url+this.selectedFilter,
    };
    console.log(config);
    this.apiService.get(config).then(success => {
      let chartObj;
      // this.chartData.chart.data.labels.length = 0;
      // this.chartData.chart.data.datasets.data.length = 0;
      if(this.segment === 'mentor'){
        this.chartData.chart.data.labels.push("Total Sessions Created", "Total Sessions Hosted")
        this.chartData.chart.data.datasets.data.push(success.result.totalSessionCreated || 0, success.result.totalsessionHosted || 0);
        // chartObj = {
        //   labels:["Total Sessions Created", "Total Sessions Hosted"],
        //   values: [success.result.totalSessionCreated || 0, success.result.totalsessionHosted | 0]
        // }
      } else {
        this.chartData.chart.data.labels.push("Total Sessions Enrolled", "Total Sessions Attended")
        this.chartData.chart.data.datasets.data.push(success.result.totalSessionEnrolled || 0, success.result.totalsessionsAttended || 0)
        // chartObj = {
        //   labels:["Total Sessions Enrolled", "Total Sessions Attended"],
        //   values: [success.result.totalSessionEnrolled || 0, success.result.totalsessionsAttended || 0]
        // }
      }
      // this.setChartData(chartObj);
      this.loading = false;
    }).catch(error => {
      this.loading = false;
    })
  }
}