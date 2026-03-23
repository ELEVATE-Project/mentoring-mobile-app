import * as _ from 'lodash';
import { BIG_NUMBER_DASHBOARD_FORM, DASHBOARD_TABLE_META_KEYS } from 'src/app/core/constants/formConstant';
import { HttpService, UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import moment from 'moment-timezone';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { Component, ViewChild, computed, signal } from '@angular/core';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { environment } from 'src/environments/environment';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-dashboard',
    templateUrl: 'dashboard.page.html',
    styleUrls: ['dashboard.page.scss'],
    standalone: false
})
export class DashboardPage {
  @ViewChild('libTableRef') libTableRef: any;

  user = signal<any>(null);
  isMentor = signal<boolean>(false);
  selectedRole = signal<string>('');
  session_type = signal<string>('ALL');
  selectedDuration = signal<string>('month');
  filterType = signal<string>('session');
  entityTypes = signal<any>(null);
  loading = signal<boolean>(false);
  tableDataDownload = signal<boolean>(false);
  dataAvailable = signal<boolean>(false);


  filteredCards = signal<any>([]);
  bigNumberFormData = signal<any>(null);
  filteredFormData = signal<any>(null);
  dynamicFormControls = signal<any[]>([]);
  translatedChartConfig = signal<any>(null);
  chartBody = signal<any>({});
  chartBodyConfig = signal<any>({});
  chartBodyPayload = signal<any>(null);
  metaKeys = signal<any>(_.cloneDeep(DASHBOARD_TABLE_META_KEYS));
  scrollLabelForMonth = signal<string>('');

  result: any;
  report_code: any;
  startDate: moment.Moment;
  endDate: moment.Moment;
  startDateEpoch: number;
  endDateEpoch: number;
  groupBy: any;

  segment = computed(() => this.isMentor() ? 'mentor' : 'mentee');
  isOrgAdmin = computed(() => this.selectedRole() === 'org_admin');

  public headerConfig: any = {
    menu: true,
    label: 'DASHBOARD_PAGE',
    headerColor: 'primary',
  };

  constructor(
    private profile: ProfileService,
    private apiService: HttpService,
    private form: FormService,
    public translate: TranslateService,
    private utilService: UtilService
  ) {
    this.translate.onLangChange.subscribe(() => {
      this.getTranslatedLabel();
    });
  }

  async ionViewWillEnter() {
    this.isMentor.set(this.profile.isMentor);
    this.dataAvailable.set(true);
    this.result = await this.reportFilterListApi();
    this.user.set(await this.getUserRole(this.result));
    const bigNumberResult = await this.form.getForm(BIG_NUMBER_DASHBOARD_FORM);
    this.bigNumberFormData.set(_.get(bigNumberResult, 'data.fields'));
    const bigFormData = this.bigNumberFormData();
    const firstRole = this.user()[0];
    this.filteredCards.set(!this.filteredCards().length ? bigFormData[firstRole] : []);
    this.selectedRole.set(firstRole);
    this.filteredFormData.set(bigFormData[firstRole] || []);
    this.updateFormData(this.result);
    this.session_type.set('ALL');
    this.chartBodyConfig.set(this.filteredFormData());
    this.chartBody.set(this.chartBodyConfig());
    if (this.user()) {
      this.initialDuration();
    }
    await this.getTranslatedLabel();
  }

  async downloadData() {
    this.tableDataDownload.set(true);
  }

  async initialDuration() {
    this.scrollLabelForMonth.set(this.translate.instant('SCROLL_TO_EXPLORE_CHART'));
    const today = moment();
    this.startDate = today.clone().startOf('month').add(1, 'second');
    this.endDate = today.clone().endOf('month');
    this.groupBy = 'day';
    this.startDateEpoch = this.startDate ? this.startDate.unix() : null;
    this.endDateEpoch = this.endDate ? this.endDate.unix() : null;
    this.prepareTableUrl();
    this.prepareChartUrl();
    if (this.filteredCards()) {
      this.bigNumberCount();
    }
  }

  async calculateDuration() {
    const today = moment();
    const firstDayOfYear = moment().startOf('year');
    const lastDayOfYear = moment().endOf('year');

    switch (this.selectedDuration()) {
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

    this.startDateEpoch = this.startDate ? this.startDate.unix() : null;
    this.endDateEpoch = this.endDate ? this.endDate.unix() : null;
    setTimeout(() => {
      this.bigNumberCount();
      this.prepareChartUrl();
    }, 100);
  }

  async handleRoleChange(e: any) {
    this.selectedRole.set(e.detail.value);
    this.session_type.set('ALL');
    this.selectedDuration.set('month');
    this.filteredFormData.set(this.bigNumberFormData()[this.selectedRole()] || []);
    this.filteredCards.set(this.filteredFormData() || []);
    this.chartBodyConfig.set(this.filteredCards());
    this.chartBody.set(this.chartBodyConfig());
    await this.getTranslatedLabel();
    if (this.filteredCards()) {
      this.bigNumberCount();
    }
    this.updateFormData(this.result);
    this.chartBodyConfig.set(this.filteredFormData());
    this.chartBody.set(this.chartBodyConfig());
    this.calculateDuration();
    setTimeout(() => {
      this.prepareChartUrl();
      this.prepareTableUrl();
    }, 100);
  }

  async bigNumberCount() {
    const cards = this.filteredCards();
    const sessionType = this.session_type();
    for (let element of cards[sessionType].bigNumbers) {
      this.report_code = element.Url;
      element.data.forEach(async (el: any) => {
        let value = await this.preparedUrl(el.value);
        if (value) {
          el.value = value[el.key] || 0;
        }
      });
    }
  }

  handleFormControlChange(value: any, event: any) {
    if (value === 'duration') {
      this.selectedDuration.set(event.detail.value ? event.detail.value : null);
      this.calculateDuration();
    } else if (value === 'type') {
      this.session_type.set(event.detail.value ? event.detail.value : null);
    } else {
      if (!this.entityTypes()) {
        this.entityTypes.set({});
      }
      const current = { ...this.entityTypes() };
      if (event.detail.value.length) {
        current[value] = event.detail.value;
      } else {
        delete current[value];
      }
      this.entityTypes.set(current);
    }
    this.bigNumberCount();
    setTimeout(() => {
      this.prepareChartUrl();
    }, 100);
  }

  async updateFormData(formData: any) {
    const roleData = this.bigNumberFormData()[this.selectedRole()];
    const firstObject = this.transformData(roleData, formData);
    this.dynamicFormControls.set(firstObject.form.controls);
  }

  getTranslatedLabel() {
    const rawConfig = this.chartBody()?.[this.session_type()]?.chartConfig;
    if (rawConfig) {
      this.translatedChartConfig.set(rawConfig.map(item => {
        const key = Object.keys(item).find(k => k !== 'backgroundColor')!;
        const translationKey = item[key];
        return {
          [key]: this.translate.instant(translationKey),
          backgroundColor: item.backgroundColor
        };
      }));
    }
    const updated = _.cloneDeep(DASHBOARD_TABLE_META_KEYS);
    for (const key in DASHBOARD_TABLE_META_KEYS) {
      if (DASHBOARD_TABLE_META_KEYS.hasOwnProperty(key)) {
        updated[key] = this.translate.instant(DASHBOARD_TABLE_META_KEYS[key]);
      }
    }
    this.metaKeys.set(updated);
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
      return control;
    });
    return updatedFirstObj;
  }

  async reportFilterListApi() {
    const config = {
      url: urlConstants.API_URLS.DASHBOARD_REPORT_FILTER + 'filter_type=' + this.filterType() + '&' + 'report_filter=' + true,
      payload: {},
    };
    try {
      let data: any = await this.apiService.get(config);
      return data.result;
    } catch (error) {}
  }

  async reportData(url: string, body?: any) {
    const config = { url, payload: body };
    try {
      let data: any = await this.apiService.post(config);
      return data.result;
    } catch (error) {}
  }

  getUserRole(userDetails: any) {
    const roles = userDetails.roles.map(function(item) {
      return item['title'];
    });
    if (!roles.includes('mentee')) {
      roles.unshift('mentee');
    }
    return roles;
  }

  calculateStepSize(maxDataValue: number) {
    return Math.ceil(maxDataValue / 5);
  }

  async preparedUrl(value?: any) {
    const queryParams = `&report_role=${this.selectedRole()}` +
      `&session_type=${this.session_type()}` +
      `&start_date=${this.startDateEpoch || ''}` +
      `&end_date=${this.endDateEpoch || ''}` +
      `&group_by=${this.groupBy}`;
    const params = `${urlConstants.API_URLS.DASHBOARD_REPORT_DATA}` +
      `report_code=${this.report_code}${queryParams}`;
    this.chartBodyPayload.set(this.entityTypes() ? { entityTypes: this.entityTypes() } : {});
    const resp = await this.reportData(params, this.chartBodyPayload());
    if (value) {
      return resp.data;
    }
  }

  async prepareTableUrl() {
    const configuredTableUrl = this.chartBodyConfig().tableUrl;
    const queryParams = `&report_role=${this.selectedRole()}` +
      `&start_date=${this.startDateEpoch || ''}` +
      `&session_type=${this.session_type()}` +
      `&end_date=${this.endDateEpoch || ''}`;
    const tableUrl = !configuredTableUrl
      ? `${environment.baseUrl}${urlConstants.API_URLS.DASHBOARD_REPORT_DATA}` +'report_code='+ this.chartBody().table_report_code +queryParams
      : configuredTableUrl 
    const headers = await this.apiService.setHeaders();
    this.chartBody.update(current => ({
      ...current,
      tableUrl,
      headers
    }));
  }

  async prepareChartUrl() {

    const configuredChartUrl = this.chartBodyConfig()?.chartUrl;;
    const queryParams = `&report_role=${this.selectedRole()}` +
      `&session_type=${this.session_type()}` +
      `&start_date=${this.startDateEpoch || ''}` +
      `&end_date=${this.endDateEpoch || ''}` +
      `&group_by=${this.groupBy}`;
    const chartUrl = !configuredChartUrl
      ? `${environment.baseUrl}${urlConstants.API_URLS.DASHBOARD_REPORT_DATA}` + 'report_code=' + this.chartBody()?.report_code + queryParams
      : configuredChartUrl || '';
    this.chartBodyPayload.set(this.entityTypes() ? { entityTypes: this.entityTypes() } : {});
    const headers = await this.apiService.setHeaders();
    this.chartBody.update(current => ({
      ...current,
      chartUrl,
      headers
    }));
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
