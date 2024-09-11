import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { IonContent } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { Chart } from 'chart.js/auto';
import { DASHBOARD } from 'src/app/core/constants/formConstant';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
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
      label: 'THIS_WEEK',
      value: 'WEEKLY'
    },
    {
      label: 'THIS_MONTH',
      value: 'MONTHLY'
    },
    {
      label: 'THIS_QUARTER',
      value: 'QUARTERLY'
    }
  ];
  loading: boolean = false;
  chartData: any;
  completeDashboardForms: any;
  chartCreationJson: any;

  constructor(
    private translate: TranslateService,
    private profile: ProfileService,
    private apiService: HttpService,
    private form: FormService) { }

  async ngOnInit() {
    let data = await this.form.getForm(DASHBOARD);
    this.completeDashboardForms = data.data.fields;
   }

  ionViewWillEnter() {
    this.isMentor = this.profile.isMentor;
    this.segment = this.isMentor ? "mentor" : "mentee";
    this.dataAvailable = true;
    this.getReports();
    this.gotToTop();
  }

  gotToTop() {
    this.content.scrollToTop(1000);
  }

  segmentChanged(ev: any) {
    console.log('Segment changed', ev);
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
    this.chartCreationJson = this.segment === 'mentor' ? JSON.parse(JSON.stringify(this.completeDashboardForms.mentor)) : JSON.parse(JSON.stringify(this.completeDashboardForms.mentee))
    const maxDataValue = Math.max(
      ...(
          this.segment === 'mentor' ?
          [this.chartData.total_session_created, this.chartData.total_session_assigned, this.chartData.total_session_hosted] :
          [this.chartData.total_session_enrolled, this.chartData.total_session_attended]
      )
  );
  this.chartCreationJson.forEach(chart => {
    if (chart.options && chart.options.scales && chart.options.scales.y && chart.options.scales.y.ticks) {
      chart.options.scales.y.ticks.stepSize = this.calculateStepSize(maxDataValue);
    }
    if (chart.data && chart.data.datasets) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = dataset.data.map(item => this.chartData[item] || 0);
      });
    }
  });
    this.chart = new Chart('MyChart', this.chartCreationJson[0]);
    this.dataAvailable = !!(this.chartData?.total_session_created ||this.chartData?.total_session_enrolled ||this.chartData?.total_session_assigned ||this.chartData?.total_session_hosted);
  }

  calculateStepSize(maxDataValue) {
    return Math.ceil(maxDataValue / 5);
  }
}