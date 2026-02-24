import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import * as _ from 'lodash';
import { CHAT_MESSAGES } from 'src/app/core/constants/chatConstants';
import { MENTOR_DIR_CARD_FORM } from 'src/app/core/constants/formConstant';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, LoaderService, ToastService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { CommonRoutes } from 'src/global.routes';
import { LocalStorageService } from 'src/app/core/services';
import { localKeys } from 'src/app/core/constants/localStorage.keys';

@Component({
    selector: 'app-mentor-directory',
    templateUrl: './mentor-directory.page.html',
    styleUrls: ['./mentor-directory.page.scss'],
    standalone: false
})
export class MentorDirectoryPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;

  page = 1;
  limit = 100;
  searchText: string = '';
  public headerConfig: any = {
    menu: true,
    headerColor: 'primary',
    notification: false,
  };

  mentors = [];
  mentorForm: any;
  mentorsCount;
  isLoaded: boolean = false;
  filterData: any;
  filteredDatas = [];
  chips = [];
  setPaginatorToFirstpage: boolean;
  criteriaData = [];
  isOpen = false;
  selectedChipLabel: any;
  overlayChips = [];
  selectedChipName: any;
  urlFilterData: string;
  directory: boolean = true;
  selectedChips: boolean = false;
  data: any;
  buttonConfig: any;
  currentUserId: any;
  isInfiniteScrollDisabled: boolean = false;
  loading: boolean =false;

  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private httpService: HttpService,
    private route: ActivatedRoute,
    private toast: ToastService,
    private form: FormService,
    private localStorage: LocalStorageService,
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.buttonConfig = data.button_config;
    });
  }

  async ionViewWillEnter() {
    if(this.loading) {
      this.gotToTop();
      return;
    }
    this.loading =true;
    let user = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    this.currentUserId= user.id;
    const result = await this.form.getForm(MENTOR_DIR_CARD_FORM);
    this.mentorForm = _.get(result, 'data.fields.controls');
    this.page = 1;
    this.mentors = [];
    this.isInfiniteScrollDisabled = false;
    this.getMentors();  
    this.gotToTop();
  }

  gotToTop() {
    this.content.scrollToTop(1000);
  }

  async getMentors(showLoader = true, isLoadMore: boolean = false) {
    showLoader ? await this.loaderService.startLoader() : '';
    const config = {
      url:
        urlConstants.API_URLS.MENTORS_DIRECTORY_LIST +
        this.page +
        '&limit=' +
        this.limit +
        '&search=' +
        btoa(this.searchText) +
        '&directory=' +
        this.directory +
        '&search_on=' +
        (this.selectedChipName ? this.selectedChipName : '') +
        '&' +
        (this.urlFilterData ? this.urlFilterData : ''),
      payload: {},
    };
    try {
      let data: any = await this.httpService.get(config);
      this.data = data.result.data;
      this.isLoaded = true;
      showLoader ? await this.loaderService.stopLoader() : '';
      if (isLoadMore) {
        this.mentors = [...this.mentors, ...data.result.data];
      } else {
        this.mentors = data.result.data;
        this.mentorsCount = data.result.count;
      }
      let totalValues = this.mentors.reduce((acc, mentor) => acc + (mentor.values?.length || 0), 0);
      this.isInfiniteScrollDisabled = (totalValues >= this.mentorsCount) || (data.result.data.length === 0);

      for (const group of this.mentors) {
        group.values.forEach(mentor => {
            mentor.buttonConfig = this.buttonConfig.map(btn => ({ ...btn }));

            if (mentor.id === this.currentUserId) {
              mentor.buttonConfig = this.buttonConfig.map(btn => ({
                ...btn,
                isHide: true
              }));
          }
        });
      }

    } catch (error) {
      this.isLoaded = true;
      this.isInfiniteScrollDisabled = true; 
      showLoader ? await this.loaderService.stopLoader() : '';
    }
  }
  eventAction(event) {
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([CommonRoutes.MENTOR_DETAILS, event?.data?.id]);
        break;
      case 'chat':
        this.router.navigate([CommonRoutes.CHAT_REQ, event.data],{queryParams:{id:event.data.id}});
        break;
      case 'requestSession':
        this.router.navigate([CommonRoutes.SESSION_REQUEST], {queryParams: {data: event.data}});
        break;
    }
  }
  async loadMore(event) {
    if (this.data && !this.isInfiniteScrollDisabled) {
      this.page = this.page + 1;
      await this.getMentors(false, true);
    }
    event.target.complete();
  }
  onSearch() {
    this.router.navigate(['/' + CommonRoutes.MENTOR_SEARCH_DIRECTORY], {
      queryParams: { search: this.searchText },
    });
  }
}