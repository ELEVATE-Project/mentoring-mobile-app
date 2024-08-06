import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { LocalStorageService, ToastService, UtilService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { FilterPopupComponent } from 'src/app/shared/components/filter-popup/filter-popup.component';
import { CommonRoutes } from 'src/global.routes';
import { MatPaginator } from '@angular/material/paginator';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { Location } from '@angular/common';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { FormService } from 'src/app/core/services/form/form.service';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

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
  totalCount: any;
  noDataMessage: any;
  createdSessions: any;
  user: any;
  criteriaChip: any;
  chips =[]
  criteriaChipName: any;
  overlayChips: any;
  isOpen = false;
  urlQueryData: string;
  pageSize: any =5;
  searchTextSubscription: Subscription;
  criteriaChipSubscription: Subscription;
  showSelectedCriteria: any;

  constructor(private modalCtrl: ModalController, private router: Router, private toast: ToastService,
    private sessionService: SessionService,
    private localStorage: LocalStorageService,
    private profileService: ProfileService,
    private location: Location,
    private permissionService: PermissionService,
    private formService: FormService,
    private utilService: UtilService,
  ) {  }

  async ngOnInit() {
    this.searchTextSubscription = this.utilService.currentSearchText.subscribe(searchText => {
      this.searchText = searchText;
    });
    this.criteriaChipSubscription = this.utilService.currentCriteriaChip.subscribe(selectedCriteria => {
      this.criteriaChip = selectedCriteria ? JSON.parse(selectedCriteria) : "";
    });
    this.user = this.localStorage.getLocalData(localKeys.USER_DETAILS)
    this.fetchSessionList()
    this.permissionService.getPlatformConfig().then((config)=>{
      this.overlayChips = config?.result?.search_config?.search?.session?.fields;
    })
  }

  async ionViewWillEnter() {
    this.showSelectedCriteria = this.criteriaChip? this.criteriaChip : "";
    const obj = {filterType: 'session', org: false};
    let data = await this.formService.filterList(obj);
    this.filterData = await this.utilService.transformToFilterData(data, obj);
  }

  search(event) {
    if (event.length >= 3) {
      this.searchText = event;
      this.showSelectedCriteria = this.criteriaChip;
      this.isOpen = false;
      this.fetchSessionList()
    } else {
      this.toast.showToast("ENTER_MIN_CHARACTER","danger");
    }
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
    var obj={page: this.page, limit: this.pageSize, type: this.type, searchText : this.searchText, selectedChip : this.criteriaChip?.name, filterData : this.urlQueryData}
    var response = await this.sessionService.getSessionsList(obj);
    this.results = response.result.data;
    this.totalCount = response.result.count;
    this.noDataMessage = obj.searchText ? "SEARCH_RESULT_NOT_FOUND" : "THIS_SPACE_LOOKS_EMPTY"
  }

  onPageChange(event){
    this.page = event.page,
    this.pageSize = event.pageSize;
    this.fetchSessionList()
  }

  async eventAction(event) {
    this.user = await this.localStorage.getLocalData(localKeys.USER_DETAILS)
    if (this.user.about || window['env']['isAuthBypassed']) {
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
            var obj = { page: this.page, limit: this.pageSize, searchText: "" };
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
    this.showSelectedCriteria = null;
    this.router.navigate(['/' + CommonRoutes.HOME_SEARCH], { queryParams: {searchString : this.searchText} });
  }

  selectChip(chip) {
    if (this.criteriaChip === chip) {
      this.criteriaChip = null;
    } else {
      this.criteriaChip = chip;
    }
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

  ionViewDidLeave(){
    this.showSelectedCriteria = "";
    this.searchText = "";
    this.criteriaChip = "";
    this.chips = [];
    this.utilService.subscribeSearchText('');
    this.utilService.subscribeCriteriaChip('');
    this.urlQueryData = null;
  }
  
  ngOnDestroy() {
    this.searchTextSubscription.unsubscribe();
    this.criteriaChipSubscription.unsubscribe();
  }
}
