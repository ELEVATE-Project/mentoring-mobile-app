import * as _ from 'lodash';
import { BIG_NUMBER_DASHBOARD_FORM, DASHBOARD_TABLE_META_KEYS } from 'src/app/core/constants/formConstant';
import { HttpService, UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import * as moment from 'moment';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { Component, ViewChild } from '@angular/core';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-dashboard',
    templateUrl: 'dashboard.page.html',
    styleUrls: ['dashboard.page.scss'],
    standalone: false
})
export class DashboardPage  {
  @ViewChild('libTableRef') libTableRef: any;
  user: any;
  sessions: any;
  filteredCards: any = [];
  bigNumbersConfig: any;
  startDate: moment.Moment;
  endDate: moment.Moment;
  data: any;
  dynamicFormControls: any[] = [];
  filteredFormData: any;
  bigNumberFormData: any;
  result: any;
  selectedRole: any;
  report_code: any;
  session_type: any = 'ALL';
  filterType: any = 'session';
  selectedDuration: any = 'month';
  endDateEpoch: number;
  startDateEpoch: number;
  entityTypes: any = null;
  tableDataDownload: boolean = false;
  loading: boolean = false;
  chartData: any;
  completeDashboardForms: any;
  chartCreationJson: any;
  isMentor: boolean;
  segment: string;
  dataAvailable: boolean;
  chart: any;
  labels = [];
  groupBy: any;
  chartBody: any = {};
  chartBodyConfig :any= {}
  chartBodyPayload: any;
  translatedChartConfig : any;
  scrollLabelForMonth : string;
   metaKeys = _.cloneDeep(DASHBOARD_TABLE_META_KEYS);

  constructor(
    private profile: ProfileService,
    private apiService: HttpService,
    private form: FormService,
    public translate: TranslateService,
    private utilService: UtilService)
     {this.translate.onLangChange.subscribe(() => {
      this.getTranslatedLabel();
    }); }

  
  async ionViewWillEnter() {
    this.isMentor = this.profile.isMentor;
    this.segment = this.isMentor ? "mentor" : "mentee";
    this.dataAvailable = true;
    this.result = await this.reportFilterListApi();
    this.user = await this.getUserRole(this.result);
    const bigNumberResult = await this.form.getForm(BIG_NUMBER_DASHBOARD_FORM);
    this.bigNumberFormData = _.get(bigNumberResult, 'data.fields');
    this.filteredCards = !this.filteredCards.length ? this.bigNumberFormData[this.user[0]] : [];
    this.selectedRole = this.user[0];
    this.filteredFormData = this.bigNumberFormData[this.selectedRole] || [];
    this.updateFormData(this.result);
    this.session_type = 'ALL';
    this.chartBodyConfig = this.filteredFormData;
    this.chartBody = this.chartBodyConfig;
    if(this.user){
      this.initialDuration();
    }
    await this.getTranslatedLabel();
}

  public headerConfig: any = {
    menu: true,
    label: 'DASHBOARD_PAGE',
    headerColor: 'primary',
  };
  async downloadData() {
    this.tableDataDownload = true;
  }

  async initialDuration(){
    this.scrollLabelForMonth = this.translate.instant("SCROLL_TO_EXPLORE_CHART");
    const today = moment();
    this.startDate = today.clone().startOf('month').add(1, 'second');
    this.endDate = today.clone().endOf('month');
    this.groupBy = 'day';
    const startDateEpoch = this.startDate ? this.startDate.unix() : null;
    const endDateEpoch = this.endDate ? this.endDate.unix() : null;
    this.startDateEpoch = startDateEpoch;
    this.endDateEpoch = endDateEpoch;
    this.prepareTableUrl();
    this.prepareChartUrl();

    if( this.filteredCards){
      this.bigNumberCount();
    }
  }

  async calculateDuration(){
    const today = moment();
    const firstDayOfYear = moment().startOf('year');
    const lastDayOfYear = moment().endOf('year');
  
    switch (this.selectedDuration) {
      case 'week':
        this.startDate = today.clone().startOf('week').add(1, 'second');
        this.endDate = today.clone().endOf('week');
        this.groupBy = 'day';
        break;
      case 'month':
        this.startDate = today.clone().startOf('month').add(1, 'second');
        this.endDate = today.clone().endOf('month');
        this.groupBy = 'day';
        break;
      case 'quarter':
        this.startDate = today.clone().startOf('quarter').add(1, 'second');
        this.endDate = today.clone().endOf('quarter');
        this.groupBy = 'month';
        console.log(this.startDate, 'start date', this.endDate, 'end date', today, 'todayy')
        break;
      case 'year':
        this.startDate = firstDayOfYear.clone().date(1).add(1, 'second');
        this.endDate = lastDayOfYear.clone();
        this.groupBy = 'month';
        break;
      default:
        this.startDate = null;
        this.endDate = null;
    }

   
    const startDateEpoch = this.startDate ? this.startDate.unix() : null;
    const endDateEpoch = this.endDate ? this.endDate.unix() : null;
    this.startDateEpoch = startDateEpoch;
    this.endDateEpoch = endDateEpoch;
      setTimeout(() => {
       this.bigNumberCount();
       this.prepareChartUrl();
      },100);
  }

  async handleRoleChange(e) {
    this.selectedRole = e.detail.value;
    this.session_type = 'ALL';
    this.selectedDuration = 'month';
    this.filteredFormData = this.bigNumberFormData[this.selectedRole] || [];
    this.filteredCards = this.filteredFormData|| [];
    this.chartBodyConfig = this.filteredCards;
    this.chartBody  = this.chartBodyConfig;
    await this.getTranslatedLabel();
    if(this.filteredCards){
      this.bigNumberCount();
    }
   
    this.updateFormData(this.result);
    this.chartBodyConfig = await this.filteredFormData;
    this.chartBody = this.chartBodyConfig;
    this.calculateDuration();
    setTimeout(() => { 
      this.prepareChartUrl();
      this.prepareTableUrl();
      },100)
  }

  async bigNumberCount(){
    for (let element of this.filteredCards[this.session_type].bigNumbers) {
      this.report_code = element.Url;
      element.data.forEach(async (el:any) => {
        let value   =  await this.preparedUrl(el.value);
        if(value){
          el.value = value[el.key] || 0;
        }
      })
    }
  }
  

  handleFormControlChange(value: any,event: any) {
    if(value === 'duration'){
      this.selectedDuration = event.detail.value ? event.detail.value : null;
      this.calculateDuration();
    }else if(value === 'type'){
      this.session_type = event.detail.value ? event.detail.value : null;
    }else{
      if(!this.entityTypes){
        this.entityTypes = {};
      }
      if(event.detail.value.length){
        this.entityTypes[value] = event.detail.value;
      }else{
        delete this.entityTypes[value];
      }
    }
   
    this.bigNumberCount();
    setTimeout(() => {  
    this.prepareChartUrl();
    },100)
  }

  async updateFormData(formData){
      const roleData = this.bigNumberFormData[this.selectedRole];
      const firstObject = this.transformData(roleData, formData);
      this.dynamicFormControls = firstObject.form.controls;
  }
  
  getTranslatedLabel() {
    const rawConfig = this.chartBody?.[this.session_type]?.chartConfig;
    if (rawConfig) {
      this.translatedChartConfig = rawConfig.map(item => {
        const key = Object.keys(item).find(k => k !== 'backgroundColor')!; // get the dynamic key
        const translationKey = item[key];
        return {
          [key]: this.translate.instant(translationKey),
          backgroundColor: item.backgroundColor
        };
      });
    }
    for (const key in DASHBOARD_TABLE_META_KEYS) {
      if (DASHBOARD_TABLE_META_KEYS.hasOwnProperty(key)) {
        this.metaKeys[key] = this.translate.instant(DASHBOARD_TABLE_META_KEYS[key]);
      }
    }
  }
  
  transformData(firstObj: any, secondObj: any): any {
    const updatedFirstObj = JSON.parse(JSON.stringify(firstObj));
    updatedFirstObj.form.controls = updatedFirstObj.form.controls.map((control: any) => {
      const matchingEntityType = secondObj.entityTypes.find(
        (entityType) => entityType.value === control.value
    );
      if (matchingEntityType) {
        return {
            ...control,
            entities: matchingEntityType.entities || [],
            type: 'select',
            label: matchingEntityType.label,
          };
      }
      return control
    });

    return updatedFirstObj;
  }

  async reportFilterListApi() {
    const config = {
      url: urlConstants.API_URLS.DASHBOARD_REPORT_FILTER + 'filter_type=' + this.filterType + '&' + 'report_filter=' + true,
      payload: {},
    };
    try {
      let data: any = await this.apiService.get(config);
      return data.result
    }
    catch (error) {
    }
  }

  async reportData(url, body?){
    const config = {
      url: url,
      payload: body,
    };
    try {
      let data: any = await this.apiService.post(config);
      return data.result
    }
    catch (error) {
    }
  }
  getUserRole(userDetails) {
    var roles = userDetails.roles.map(function(item) {
      return item['title'];
    });
    if (!roles.includes("mentee")) {
      roles.unshift("mentee");
    }
    return roles
  }

  calculateStepSize(maxDataValue) {
    return Math.ceil(maxDataValue / 5);
  }



  async preparedUrl(value?) {
    const queryParams = `&report_role=${this.selectedRole}` +
      `&session_type=${this.session_type}` +
      `&start_date=${this.startDateEpoch || ''}` +
      `&end_date=${this.endDateEpoch || ''}` +
      `&group_by=${this.groupBy}`;
    const params = `${urlConstants.API_URLS.DASHBOARD_REPORT_DATA}` +
      `report_code=${this.report_code}${queryParams}`;
    this.chartBodyPayload =  this.entityTypes ? { entityTypes: this.entityTypes}: {};
    const resp = await this.reportData(params, this.chartBodyPayload);
    if (value) {
      return resp.data;
    }
  }
  async prepareTableUrl(){
    this.chartBody.tableUrl = "";
    const queryParams = `&report_role=${this.selectedRole}` +
    `&start_date=${this.startDateEpoch || ''}` +
    `&session_type=${this.session_type}` +
    `&end_date=${this.endDateEpoch || ''}`;
  this.chartBody.tableUrl = this.chartBodyConfig.tableUrl;
  this.chartBody.tableUrl =  `${environment.baseUrl}${urlConstants.API_URLS.DASHBOARD_REPORT_DATA}` +'report_code='+ this.chartBody.table_report_code +queryParams;
  this.chartBody.headers = await this.apiService.setHeaders();
  }
  async prepareChartUrl(){
    this.chartBody.chartUrl ="";
    this.chartBodyPayload = "";
    const queryParams = `&report_role=${this.selectedRole}` +
    `&session_type=${this.session_type}` +
    `&start_date=${this.startDateEpoch || ''}` +
    `&end_date=${this.endDateEpoch || ''}` +
    `&group_by=${this.groupBy}`;
  this.chartBody.chartUrl = this.chartBodyConfig.chartUrl;
  this.chartBodyPayload = this.entityTypes ? { entityTypes: this.entityTypes} : {};
  setTimeout(() => {
  this.chartBody.chartUrl = `${environment.baseUrl}${urlConstants.API_URLS.DASHBOARD_REPORT_DATA}` + 'report_code='+ this.chartBody.report_code + queryParams;
  }, 10);
  this.chartBody.headers = await this.apiService.setHeaders();
  }
  async downloadCSV(data: { url: string; fileName: string }) {
  await this.utilService.downloadFile(data.url, data.fileName);
}

ionViewWillLeave() {
  if (this.libTableRef && this.libTableRef.showPopup) {
    this.libTableRef.closePopup();
  }
}
}

