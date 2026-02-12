import { Component, Input, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { FILTER_ROLES, MENTOR_CONNECTION_CARD_FORM } from 'src/app/core/constants/formConstant';
import {
  NO_RESULT_FOUND_FOR_MENTEE,
  NO_RESULT_FOUND_FOR_MENTOR,
} from 'src/app/core/constants/genericConstants';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { paginatorConstants } from 'src/app/core/constants/paginatorConstants';
import { HttpService, LocalStorageService, ToastService, UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { FilterPopupComponent } from 'src/app/shared/components/filter-popup/filter-popup.component';
import { SearchbarComponent } from 'src/app/shared/components/searchbar/searchbar.component';
import { CommonRoutes } from 'src/global.routes';

@Component({
    selector: 'app-generic-list',
    templateUrl: './generic-list.page.html',
    styleUrls: ['./generic-list.page.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class GenericListPage implements OnInit {

  @ViewChild('subscribe') searchbarComponent: SearchbarComponent;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = paginatorConstants.defaultPageSize;
  pageSizeOptions = paginatorConstants.pageSizeOptions;

  public headerConfig: any = {
    menu: true,
    color: 'primary',
    headerColor: 'primary',
  };

  overlayChips: any;
  routeData: any;
  searchAndCriterias: any;
  filteredDatas: any[];
  filterData: any[];
  selectedChips: boolean;
  chips: any[];
  page: number = 1;
  setPaginatorToFirstpage: boolean;
  urlQueryData: string;
  responseData: any;
  searchText: any;
  totalCount: any;
  isLoaded: boolean;
  criteriaChipEvent: any;
  enableExploreButton: boolean = false;
  valueFromChipAndFilter: any;
  buttonConfig: any;
  noResult: any;
  isMentor: boolean;
  filterIcon: boolean;
  filterChipsSelected: boolean = false;
  selectedCriteria: any;
  mentorForm: any

  constructor(
    private route: ActivatedRoute,
    private httpService: HttpService,
    private modalCtrl: ModalController,
    private utilService: UtilService,
    private formService: FormService,
    private permissionService: PermissionService,
    private localStorage: LocalStorageService,
    private router: Router,
    private profileService: ProfileService,
    private toast: ToastService,
  ) {}

  ngOnInit() {}

  async ionViewWillEnter() {
    let roles = await this.localStorage.getLocalData(localKeys.USER_ROLES);
    this.isMentor = roles.includes('mentor')?true:false;
    const result = await this.formService.getForm(MENTOR_CONNECTION_CARD_FORM);
    this.mentorForm = _.get(result, 'data.fields.controls');
    this.route.data.subscribe((data) => {
      this.routeData = data;
      this.action(this.routeData);
      this.buttonConfig = this.routeData?.button_config;
    });
    this.filterListData(this.routeData.filterType);
    this.getData();
    if (!this.searchText && this.isMentor && !this.totalCount) {
      this.noResult = NO_RESULT_FOUND_FOR_MENTOR;
      this.enableExploreButton = false;
    } else if (!this.searchText && !this.isMentor && !this.totalCount) {
      this.noResult = NO_RESULT_FOUND_FOR_MENTEE;
      this.enableExploreButton = true;
    } else {
      this.noResult = this.routeData?.noDataFound;
      this.enableExploreButton = false;
    }
  }

  searchResults(event) {
    this.searchText= event.searchText;
    this.searchAndCriterias = {
      headerData: event,
    };

    this.selectedCriteria = event?.criterias?.name;
    this.getData();
  }
  async getData() {
    let response = await this.httpService.get({
      url:
        this.routeData.url +
        (this.page ? this.page : '') +
        '&limit=' +
        (this.pageSize ? this.pageSize : '') +
        '&search=' +
        (this.searchText ? btoa(this.searchText) : '') +
        '&' +
        (this.urlQueryData ? this.urlQueryData : '') +
        '&search_on=' +
        (this.selectedCriteria ? this.selectedCriteria : ''),
    });
    this.isLoaded = true;
    this.responseData = response.result.data;
    this.totalCount = response?.result?.count;
    if (this.searchText && !this.responseData.length) {
      this.noResult = this.routeData?.noDataFound;
      this.enableExploreButton = false;
    } 
    if(this.responseData.length) {
      this.filterIcon = true;
    } else {
      if(Object.keys(this.filteredDatas || {}).length === 0
      && !this.selectedCriteria) {
        this.filterIcon = false;
      } 
    }
  }

  async onClickFilter() {
    let modal = await this.modalCtrl.create({
      component: FilterPopupComponent,
      cssClass: 'filter-modal',
      componentProps: { filterData: this.filterData },
    });

    modal.onDidDismiss().then(async (dataReturned) => {
      this.filteredDatas = [];
        if(dataReturned?.data?.role === 'closed'){
        this.filterData = dataReturned?.data?.data;
        return;
      }
       if(Object.keys(dataReturned?.data).length === 0){
            this.chips = [];
            this.filteredDatas = [];
            this.urlQueryData = ''; 
      }
      if (dataReturned.data && dataReturned.data.data) {
        if (dataReturned.data.data.selectedFilters) {
          for (let key in dataReturned.data.data.selectedFilters) {
            this.filteredDatas[key] = dataReturned.data.data.selectedFilters[
              key
            ]
              .slice(0, dataReturned.data.data.selectedFilters[key].length)
              .map((obj) => obj.value)
              .join(',')
              .toString();
          }
          if (dataReturned.data.data.selectedFilters.roles) {
            this.filterChipsSelected = true;
          } else {
            this.filterChipsSelected = false;
          }
          this.selectedChips = true;
        }
        this.extractLabels(dataReturned.data.data.selectedFilters);
        this.getUrlQueryData();
      }
        this.page = 1;
        this.setPaginatorToFirstpage = true;
        this.getData();
    });
    modal.present();
  }

  async filterListData(filterType) {
    const obj = { filterType: filterType, org: true };
    let data = await this.formService.filterList(obj);
    this.filterData = await this.utilService.transformToFilterData(data, obj);
    const filterRoles = this.isMentor ? FILTER_ROLES : '';
    filterRoles ? this.filterData.unshift(filterRoles) : '';
  }
  extractLabels(data) {
    this.chips = [];
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        this.chips.push(...data[key]);
      }
    }
  }

  getUrlQueryData() {
    const params = Object.entries(this.filteredDatas)
      .filter(([_, value]) => value !== true && value !== false)
      .map(([key, value]) => `${key}=${value}`);
  
    this.urlQueryData = params.join('&');
  }
  

  removeChip(event) {
    this.chips.splice(event.index, 1);
    this.removeFilteredData(event.chipValue);
    this.getUrlQueryData();
    this.getData();
  }

    removeFilteredData(chip){
      this.filterData.map((filter) => {
        filter.options.map((option) => {
          if (option.value === chip) {
            option.selected = false;
          }
        });
        return filter;
      })
    for (let key in this.filteredDatas) {
      if (this.filteredDatas.hasOwnProperty(key)) {

          let values = this.filteredDatas[key].split(',');
          let chipIndex = values.indexOf(chip);

          if (chipIndex > -1) {
              values.splice(chipIndex, 1);

              let newValue = values.join(',');

              if (newValue === '') {
                delete this.filteredDatas[key];
            } else {
                this.filteredDatas[key] = newValue;
            }
          }
      }
    }
  }

  onPageChange(event) {
    (this.page = event.pageIndex + 1),
      (this.pageSize = this.paginator.pageSize);
    this.getData();
  }

  action(event) {
    if (event && event.filterType) {
      this.permissionService.getPlatformConfig().then((config) => {
        this.overlayChips =
          config?.result?.search_config?.search[event.filterType]?.fields;
      });
    }
  }

  eventAction(event : any) {
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([CommonRoutes.MENTOR_DETAILS, event?.data?.id]);
        break;
      case 'chat':
        if (!event.rid) {
          return;
        }
        this.router.navigate([CommonRoutes.CHAT, event.rid],{queryParams:{id:event.data}});
        break;
      case 'requestSession':
        this.router.navigate([CommonRoutes.SESSION_REQUEST], {queryParams: {data: event.data}});
        break;
        case 'unblock':
        this.onUnblock(event)
        break;
    }
  }

  eventHandler(event: string) {
    this.valueFromChipAndFilter = event;
  }

  goToHome(){
    this.router.navigate([CommonRoutes.HOME]);
  }


    async onClearSearch($event: string) {
    this.page = 1;
    this.searchText = '';
    this.searchAndCriterias.headerData.searchText = '';
    this.searchAndCriterias.headerData.criterias = undefined;
    await  this.getData();
  }
  

    async onUnblock(user: any) {
    const userId = user.data;
    const result = await this.utilService.alertPopup({
    header: "CONFIRM_UNBLOCK_HEADER",   
    message: "CONFIRM_UNBLOCK_MESSAGE", 
    cancel: "CANCEL",
    submit: "UNBLOCK",
  },
   {name: user.name}
  );

  if (result) {
    // const payload = {
    //       url:,
    //       payload: {user_id: userId},
    //       };
    //     this.httpService.post(payload)
        this.toast.showToast("UNBLOCK_TOAST_MESSAGE", "success")
        this.router.navigate([CommonRoutes.MENTOR_DETAILS, userId]);
            }  else {
                    console.log("User cancelled unblock.");
                    }
}  
}
