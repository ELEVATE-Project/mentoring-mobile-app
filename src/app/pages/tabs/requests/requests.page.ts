import { Component, OnInit, ViewChild, signal } from '@angular/core';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { MENTOR_REQ_CARD_FORM } from 'src/app/core/constants/formConstant';
import * as _ from 'lodash';
import { IonContent } from '@ionic/angular';
//service
import { SessionService } from 'src/app/core/services/session/session.service';
import { FormService } from 'src/app/core/services/form/form.service';
import { CacheService, HttpService } from 'src/app/core/services';
import { LocalStorageService } from 'src/app/core/services';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { UtilService } from 'src/app/core/services';

@Component({
    selector: 'app-requests',
    templateUrl: './requests.page.html',
    styleUrls: ['./requests.page.scss'],
    standalone: false
})
export class RequestsPage implements OnInit {
  private readonly scrollKey = 'requests';
  private readonly CACHE_TTL = {
    messageRequests: 60,
  };
  @ViewChild(IonContent) content: IonContent;
  private readonly messageRequestCachePrefix = 'messageRequests_';
  public headerConfig: any = {
    menu: true,
    label: 'REQUESTS',
    headerColor: 'primary',
    notification: false,
  };

  segmentType = signal<'slot-requests' | 'message-requests'>('slot-requests');
  buttonConfig = signal<any>(null);
  data = signal<any[]>([]);
  noResult = signal<string>('');
  routeData = signal<any>(null);
  slotBtnConfig = signal<any>(null);
  slotRequests = signal<any[]>([]);
  mentorForm = signal<any>(null);
  isInfiniteScrollDisabled = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isDataAvailable = signal<boolean>(false);
  showMessageRequests = signal<boolean>(true);

  expiryTag = {
    label: 'EXPIRED',
    cssClass: 'expired-tag'
  };
  page = 1;
  
  constructor(
    private httpService: HttpService,
    private route: ActivatedRoute,
    private router: Router,
    private sessionService: SessionService,
    private form: FormService,
    private localStorage: LocalStorageService,
    private cacheService: CacheService,
    private utilService: UtilService,
  ) {}

  async ionViewWillEnter() {
    if (this.isLoading()) return;
    const chatConfig = await this.localStorage.getLocalData(localKeys.CHAT_CONFIG);
    const isEnabled = String(chatConfig) === 'true';
    this.showMessageRequests.set(isEnabled);
    if (!this.showMessageRequests()) {
      this.segmentType.set('slot-requests');
    }

    this.isDataAvailable.set(false);
    this.isLoading.set(true);

    const result = await this.form.getForm(MENTOR_REQ_CARD_FORM);
    this.mentorForm.set(_.get(result, 'data.fields.controls'));

    this.route.data.subscribe((data) => {
      this.routeData.set(data);
      this.buttonConfig.set(data?.button_config);
      this.slotBtnConfig.set(data?.slotButtonConfig);
    });

    this.page = 1;
    this.slotRequests.set([]);
    this.data.set([]);
    this.isInfiniteScrollDisabled.set(false);

    if (this.segmentType() === 'slot-requests') {
      await this.slotRequestData();
    } else {
      await this.pendingRequest();
    }
    this.isLoading.set(false);
    this.utilService.handleScrollOnEnter(this.scrollKey, this.content);
  }

  ngOnInit() {}

  async segmentChanged(event: any) {
    this.segmentType.set(event.target.value);
    if (!this.showMessageRequests() && this.segmentType() === 'message-requests') {
      this.segmentType.set('slot-requests');
    }
    this.page = 1;
    this.isInfiniteScrollDisabled.set(false);
    this.noResult.set('');
    this.slotRequests.set([]);
    this.data.set([]);
    this.isDataAvailable.set(false);

    if (this.segmentType() === 'slot-requests') {
      await this.slotRequestData();
    } else {
      await this.pendingRequest();
    }
  }

  async pendingRequest(isLoadMore: boolean = false) {
    const cacheKey = `${this.messageRequestCachePrefix}${this.page}`;
    const config = {
      url: urlConstants.API_URLS.CONNECTION_REQUEST +
        '?pageNo=' + this.page +
        '&pageSize=100',
    };

    try {
      let response: any = this.cacheService.get(cacheKey);
      if (!response) {
        response = await this.httpService.get(config);
        if (response) this.cacheService.set(cacheKey, response, this.CACHE_TTL.messageRequests);
      }
      this.isDataAvailable.set(true);
      const newData = response?.result?.data || [];

      if (isLoadMore) {
        this.data.update(prev => [...prev, ...newData]);
      } else {
        this.data.set(newData);
      }

      const totalCount = response?.result?.count || 0;
      this.isInfiniteScrollDisabled.set(this.data().length >= totalCount);

      if (this.data().length === 0 && this.page === 1) {
        this.noResult.set(this.routeData()?.noDataFound?.noMessage);
      } else {
        this.noResult.set('');
      }

      return response;
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      this.isInfiniteScrollDisabled.set(true);
      return error;
    }
  }

  async slotRequestData(isLoadMore: boolean = false) {
    try {
      const res = await this.sessionService.requestSessionList(this.page);
      this.isDataAvailable.set(true);

      let data: any[];
      if (isLoadMore) {
        data = [...this.slotRequests(), ...(res?.result?.data || [])];
      } else {
        data = res?.result?.data || [];
      }

      const totalCount = res?.result?.count || 0;
      this.isInfiniteScrollDisabled.set(data.length >= totalCount);

      if (data.length === 0 && this.page === 1) {
        this.noResult.set(this.routeData()?.noDataFound?.noSession);
        return;
      }

      const formattedData = data.map(value => ({
        ...value,
        meta: this.getMeta(value),
        showTag: this.isSessionExpired(value) ? this.expiryTag : '',
        disableButton: this.isSessionExpired(value)
      }));

      this.slotRequests.set(formattedData);

    } catch (error) {
      console.error('Error fetching session list:', error);
      this.isInfiniteScrollDisabled.set(true);
    }
  }

  getMeta(value: any) {
    return {
      isSent: value?.requestee_id === value?.user_details?.user_id,
      message: value?.meta?.message,
      timeStamp: '',
      resp: value
    };
  }

  getMessageRequestMeta(value: any) {
    return {
      isSent: value?.created_by === value?.user_id,
      message: value?.meta?.message,
      timeStamp: ''
    };
  }

  isSessionExpired(meta: any): boolean {
    const endDate = meta?.end_date;
    if (!endDate) return false;
    return Date.now() > endDate * 1000;
  }

  onCardClick(event: any, data?: any) {
    this.utilService.setSkipScroll(this.scrollKey);
    switch (event.type) {
      case 'viewMessage':
        this.router.navigate([CommonRoutes.CHAT_REQ, event.data]);
        break;
      case 'viewDetails':
        this.router.navigate([CommonRoutes.SESSION_REQUEST_DETAILS], { queryParams: { id: data } });
        break;
    }
  }

  async loadMore($event: any) {
    this.page = this.page + 1;

    if (this.segmentType() === 'slot-requests') {
      await this.slotRequestData(true);
    } else {
      await this.pendingRequest(true);
    }

    $event.target.complete();
  }
}
