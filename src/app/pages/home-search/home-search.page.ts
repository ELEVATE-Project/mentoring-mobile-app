import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { HttpService, LoaderService, LocalStorageService, ToastService } from 'src/app/core/services';
import { AdminWorkapceService } from 'src/app/core/services/admin-workspace/admin-workapce.service';
import { SessionService } from 'src/app/core/services/session/session.service';
import { FilterPopupComponent } from 'src/app/shared/components/filter-popup/filter-popup.component';
import { CommonRoutes } from 'src/global.routes';
import { MatPaginator } from '@angular/material/paginator';
import { paginatorConstants } from 'src/app/core/constants/paginatorConstants';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { Location } from '@angular/common';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { FormService } from 'src/app/core/services/form/form.service';

@Component({
  selector: 'app-home-search',
  templateUrl: './home-search.page.html',
  styleUrls: ['./home-search.page.scss'],
})
export class HomeSearchPage implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Output() toggleOverlayEvent = new EventEmitter<void>();

  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    // label:'MENU'
  };
  searchText:string;
  results=[];
  type:any;
  filterData: any;
  filteredDatas = []
  page = 1;
  setPaginatorToFirstpage:any = false;
  limit = 5;
  totalCount: any;
  noDataMessage: any;
  createdSessions: any;
  user: any;
  criteriaChip: any;
  chips =[]
  criteriaChipName: any;
  params: any;
  overlayChips: any;
  isOpen = false;
  urlQueryData: string;
  pageSize: any;

  constructor(private modalCtrl: ModalController, private adminWorkapceService: AdminWorkapceService,private httpService: HttpService, private router: Router, private toast: ToastService,
    private sessionService: SessionService,
    private localStorage: LocalStorageService,
    private profileService: ProfileService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private permissionService: PermissionService,
    private formService: FormService
  ) { 
    this.activatedRoute.queryParamMap.subscribe(async (params) => {
      this.params = params;
      this.criteriaChip = JSON.parse(params.get('criteriaChip'));
      this.searchText = this.params.get('searchString');
    })
  }

  async ngOnInit() {
    this.user = this.localStorage.getLocalData(localKeys.USER_DETAILS)
    this.fetchSessionList()
    this.permissionService.getPlatformConfig().then((config)=>{
      this.overlayChips = config?.result?.search_config?.search?.session?.fields;
    })
  }

  async ionViewWillEnter() {
    let data = await this.formService.filterList('session');
    this.filterData = this.transformData(data);
  }

  search(event) {
    this.searchText = event;
    this.isOpen = false;
    this.fetchSessionList()
  }

  async onClickFilter() {
    let modal = await this.modalCtrl.create({
      component: FilterPopupComponent,
      cssClass: 'filter-modal',
      componentProps: { filterData: this.filterData }
    });

    modal.onDidDismiss().then(async (dataReturned) => {
      this.filteredDatas = []
      if (dataReturned !== null) {
        if (dataReturned.data.data.selectedFilters) {
          for (let key in dataReturned.data.data.selectedFilters) {
            this.filteredDatas[key] = dataReturned.data.data.selectedFilters[key].slice(0, dataReturned.data.data.selectedFilters[key].length).map(obj => obj.value).join(',').toString()
          }
        }
        this.extractLabels(dataReturned.data.data.selectedFilters);
        this.getUrlQueryData();
      }
      this.page = 1;
      this.setPaginatorToFirstpage = true;
      this.fetchSessionList()
    });
    modal.present()
  }

  async fetchSessionList() {
    var obj={page: this.page, limit: this.limit, type: this.type, searchText : this.searchText, selectedChip : this.criteriaChip?.name, filterData : this.urlQueryData}
    var response = await this.sessionService.getSessionsList(obj);
    this.results = response?.result?.data;
    this.totalCount = response?.result?.count;
    this.noDataMessage = obj.searchText ? "SEARCH_RESULT_NOT_FOUND" : "THIS_SPACE_LOOKS_EMPTY"
  }

  onPageChange(event){
    this.page = event.page,
    this.pageSize = event.pageSize;
    this.fetchSessionList()
  }

  async eventAction(event) {
    this.user = await this.localStorage.getLocalData(localKeys.USER_DETAILS)
    if (this.user.about) {
      switch (event.type) {
        case 'cardSelect':
          this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${event.data.id}`]);
          break;

        case 'joinAction':
          await this.sessionService.joinSession(event.data)
          this.fetchSessionList()
          break;

        case 'enrollAction':
          let enrollResult = await this.sessionService.enrollSession(event.data.id);
          if (enrollResult.result) {
            this.toast.showToast(enrollResult.message, "success")
            this.fetchSessionList()
          }
          break;

        case 'startAction':
          this.sessionService.startSession(event.data.id).then(async () => {
            var obj = { page: this.page, limit: this.limit, searchText: "" };
            if(this.profileService.isMentor){
              this.createdSessions = await this.sessionService.getAllSessionsAPI(obj);
            }
          })
          break;
      }
    } else {
      this.profileService.upDateProfilePopup()
    }
  }

  locationBack(){
    this.location.back()
  }

  extractLabels(data) {
    this.chips = [];
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        this.chips.push(...data[key]);
      }
    }
  }

  removeChip(chip: string, index: number) {
    this.chips.splice(index, 1);
    this.removeFilteredData(chip);
    this.getUrlQueryData();
    this.fetchSessionList()
  }

  closeCriteriaChip(){
    this.criteriaChip = null;
    this.router.navigate(['/' + CommonRoutes.HOME_SEARCH], { queryParams: {searchString : this.searchText} });
    this.fetchSessionList()
  }

  transformData(responseData) {
    const entityTypes = responseData.entity_types;
  
    const filterData = Object.keys(entityTypes).map(type => {
      const entityType = entityTypes[type][0];
      return {
        title: entityType.label,
        name: entityType.value,
        options: entityType.entities.map(entity => ({
          label: entity.label,
          value: entity.value
        })),
        type: "checkbox"
      };
    });
  
    return filterData;
  }

  selectChip(chip) {
    this.criteriaChip = chip;
    this.fetchSessionList()
    this.isOpen = false;
  }

  getUrlQueryData() {
    const queryString = Object.keys(this.filteredDatas)
      .map(key => `${key}=${this.filteredDatas[key]}`)
      .join('&');

    this.urlQueryData = queryString;
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
}
