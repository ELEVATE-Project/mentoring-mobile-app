import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { CHAT_MESSAGES } from 'src/app/core/constants/chatConstants';
import { paginatorConstants } from 'src/app/core/constants/paginatorConstants';
import { ToastService, UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { FilterPopupComponent } from 'src/app/shared/components/filter-popup/filter-popup.component';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-mentor-search-directory',
  templateUrl: './mentor-search-directory.page.html',
  styleUrls: ['./mentor-search-directory.page.scss'],
})
export class MentorSearchDirectoryPage implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = paginatorConstants.defaultPageSize;
  pageSizeOptions = paginatorConstants.pageSizeOptions;

  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    // label:'MENU'
  };
  
  isOpen = false;
  overlayChips = [];
  filterData: any;
  filteredDatas: any[];
  filterIcon: boolean;
  selectedChips: boolean;
  urlQueryData: string;
  setPaginatorToFirstpage: boolean;
  page: any = 1;
  data: any;
  isLoaded: boolean;
  totalCount: any;
  limit: any;
  chips = [];
  buttonConfig: any;
  searchAndCriterias: any = {
    headerData: {
      searchText: '',
      criterias: {
        name: undefined,
        label: undefined
      }
    }
  };
  valueFromChipAndFilter: string;

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private modalCtrl: ModalController,
    private permissionService: PermissionService,
    private formService: FormService,
    private utilService: UtilService,
    private toast: ToastService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.buttonConfig = data.button_config;
    })
   }

async ionViewWillEnter() {
  const queryParams = this.route.snapshot.queryParams;
  const search = queryParams['search'];
  const chip = queryParams['chip'];

  if (search) {
    this.searchAndCriterias = {
      ...this.searchAndCriterias,
      headerData: {
        ...this.searchAndCriterias.headerData,
        searchText: search
      }
    };
  }

  this.getMentors();

  const config = await this.permissionService.getPlatformConfig();
  this.overlayChips = config?.result?.search_config?.search?.mentor?.fields;

  if (chip) {
    const matchedField = this.overlayChips?.find(d => d.name === chip);
    if (matchedField && search) {
      this.searchAndCriterias = {
        ...this.searchAndCriterias,
        headerData: {
          ...this.searchAndCriterias.headerData,
          criterias: {
            name: matchedField.name,
            label: matchedField.label
          }
        }
      };
    }
  }

  const obj = {filterType: 'mentor', org: true};
  let data = await this.formService.filterList(obj);
  this.filterData = await this.utilService.transformToFilterData(data, obj);

}


  async onSearch(event){
    this.searchAndCriterias = {
      headerData: event,
    };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { 
        search: event.searchText, 
        chip: event?.criterias?.name 
      },
      queryParamsHandling: 'merge',
    });
    await this.getMentors();
  }

  async onClearSearch($event: string) {
    this.searchAndCriterias.headerData.searchText = '';
    this.searchAndCriterias.headerData.criterias = undefined;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: '', chip: '' },
      queryParamsHandling: 'merge',
    });
    await this.getMentors();
  }

  async onClickFilter() {
    let modal = await this.modalCtrl.create({
      component: FilterPopupComponent,
      cssClass: 'filter-modal',
      componentProps: { filterData: this.filterData }
    });

    modal.onDidDismiss().then(async (dataReturned) => {
      this.filteredDatas = []
      if (dataReturned.data && dataReturned.data.data) {
        if (dataReturned.data.data.selectedFilters) {
          for (let key in dataReturned.data.data.selectedFilters) {
            this.filteredDatas[key] = dataReturned.data.data.selectedFilters[key].slice(0, dataReturned.data.data.selectedFilters[key].length).map(obj => obj.value).join(',').toString()
          }
          this.selectedChips = true;
        }
        this.extractLabels(dataReturned.data.data.selectedFilters);
        this.getUrlQueryData();
      }
      this.page = 1;
      this.setPaginatorToFirstpage = true;
      this.getMentors()
    });
    modal.present();
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
    const queryString = Object.keys(this.filteredDatas)
      .map(key => `${key}=${this.filteredDatas[key]}`)
      .join('&');

    this.urlQueryData = queryString;
  }

  eventAction(event){
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([CommonRoutes.MENTOR_DETAILS, event?.data?.id]);
        break;
      case 'chat':
        this.router.navigate([CommonRoutes.CHAT_REQ, event.data]);
        break;
      case 'requestSession':
        this.router.navigate([CommonRoutes.SESSION_REQUEST], {queryParams: {data: event.data}});
        break;
    }
  }
  
  eventHandler(event: any) {
    this.valueFromChipAndFilter = event;
    this.searchAndCriterias.headerData.criterias = {name: undefined, label: undefined}
  }

  onPageChange(event){
    this.page = event.pageIndex + 1,
    this.pageSize = this.paginator.pageSize;
    this.getMentors()
  }

  removeFilteredData(chip){
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

  async getMentors(){
    var obj = {
      page: this.page, 
      pageSize: this.pageSize, 
      searchText: this.searchAndCriterias.headerData.searchText?.trim(), 
      selectedChip: this.searchAndCriterias.headerData.criterias?.name, 
      urlQueryData: this.urlQueryData
    };
    let data = await this.profileService.getMentors(true,obj);
    if(data && data.result.data.length){
      this.isOpen = false;
      this.data = data.result.data;
      this.totalCount = data.result.count;
    } else {
       
      this.data = [];
      this.totalCount = [];
     
      if (Object.keys(this.filteredDatas || {}).length === 0 && !this.searchAndCriterias.headerData.criterias?.name) {
        this.filterIcon = false;
      }
    }
    this.filterIcon = !!obj.searchText?.trim();
  }

  removeChip(event) {
    this.chips.splice(event.index, 1);
    this.removeFilteredData(event.chipValue);
    this.getUrlQueryData();
    this.getMentors();
  }
  
  ionViewDidLeave(){
    this.searchAndCriterias = {
      headerData: {
        searchText: '',
        criterias: {
          name: undefined
        }
      }
    };
    this.filterIcon = false;
    this.chips = [];
    this.urlQueryData = null;
  }
}