import { Component, EventEmitter, OnInit, Output, ViewChild, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
//ionic
import { ModalController } from '@ionic/angular';
//service
import { SessionService } from 'src/app/core/services/session/session.service';
import { LocalStorageService, ToastService, UtilService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { FormService } from 'src/app/core/services/form/form.service';
//3rd party
import { Subscription } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
//component
import { FilterPopupComponent } from 'src/app/shared/components/filter-popup/filter-popup.component';

@Component({
  selector: 'app-home-search',
  templateUrl: './home-search.page.html',
  styleUrls: ['./home-search.page.scss'],
  standalone: false
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
  searchText: string;
  results = signal<any[]>([]);
  type: any;
  filterData: any;
  filteredDatas = []
  filterIcon = signal<boolean>(false);
  page = 1;
  setPaginatorToFirstpage: any = false;
  totalCount = signal<any>(null);
  noDataMessage: any;
  createdSessions: any;
  user: any;
  criteriaChip: any;
  chips = signal<any[]>([]);
  criteriaChipName: any;
  overlayChips = signal<any>(null);
  isOpen = false;
  urlQueryData: string;
  pageSize: any = 5;
  isMentor: boolean;
  searchTextSubscription: Subscription;
  criteriaChipSubscription: Subscription;
  showSelectedCriteria: any;
  searchAndCriterias: any;
  private readonly scrollKey = 'home';

  constructor(private modalCtrl: ModalController, private router: Router, private toast: ToastService,
    private sessionService: SessionService,
    private localStorage: LocalStorageService,
    private profileService: ProfileService,
    private location: Location,
    private permissionService: PermissionService,
    private formService: FormService,
    private utilService: UtilService,
    private route: ActivatedRoute,
  ) { }

  async ngOnInit() {
    this.searchAndCriterias = {
      headerData: {
        searchText: '',
        criterias: {
          name: undefined,
          label: undefined
        }
      }
    };

    this.searchTextSubscription = this.utilService.currentSearchText.subscribe(searchText => {
      this.searchText = searchText;
    });
    this.criteriaChipSubscription = this.utilService.currentCriteriaChip.subscribe(selectedCriteria => {
      this.criteriaChip = selectedCriteria ? JSON.parse(selectedCriteria) : "";
      setTimeout(() => {
        this.searchAndCriterias = {
          headerData: {
            searchText: '',
            criterias: this.criteriaChip
          },
        };
      }, 500);

    });
    this.user = this.localStorage.getLocalData(localKeys.USER_DETAILS)
    let roles = await this.localStorage.getLocalData(localKeys.USER_ROLES);
    this.isMentor = roles.includes('mentor') ? true : false;
    this.permissionService.getPlatformConfig().then((config) => {
      this.overlayChips.set(config?.result?.search_config?.search?.session?.fields);
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
      this.searchText = search;
    }

    const config = await this.permissionService.getPlatformConfig();
    this.overlayChips.set(config?.result?.search_config?.search?.session?.fields);

    if (chip) {
      const matchedField = this.overlayChips()?.find(d => d.name === chip);
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
        this.criteriaChip = {
          name: matchedField.name,
          label: matchedField.label
        };
        this.showSelectedCriteria = this.criteriaChip;
      }
    }

    this.fetchSessionList();

    const obj = { filterType: 'session', org: false };
    let data = await this.formService.filterList(obj);
    this.filterData = await this.utilService.transformToFilterData(data, obj);
  }

  search(event) {
    this.searchText = event.searchText;
    this.searchAndCriterias = {
      headerData: event,
    };
    this.showSelectedCriteria = event.criterias;
    this.criteriaChip = event.criterias;
    this.isOpen = false;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: event.searchText,
        chip: event?.criterias?.name
      },
      queryParamsHandling: 'merge',
    });
    this.fetchSessionList()

  }

  eventHandler(event: string) {
    this.criteriaChip = event;
  }

  async onClearSearch($event: string) {
    this.page = 1;
    this.searchAndCriterias.headerData.searchText = '';
    this.searchText = '';
    this.searchAndCriterias.headerData.criterias = undefined;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: '', chip: '' },
      queryParamsHandling: 'merge',
    });
    await this.fetchSessionList();
  }

  async onClickFilter() {
    let modal = await this.modalCtrl.create({
      component: FilterPopupComponent,
      cssClass: 'filter-modal',
      componentProps: { filterData: this.filterData }
    });

    modal.onDidDismiss().then(async (dataReturned) => {
      this.filteredDatas = []
      if (dataReturned?.data?.role === 'closed') {
        this.filterData = dataReturned?.data?.data;
        return;
      }
      if (Object.keys(dataReturned?.data).length === 0) {
        this.chips.set([]);
        this.filteredDatas = [];
        this.urlQueryData = null;
      }
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
    var obj = { page: this.page, limit: this.pageSize, type: this.type, searchText: this.searchText, selectedChip: this.criteriaChip?.name, filterData: this.urlQueryData }
    var response = await this.sessionService.getSessionsList(obj);
    if (response.result.data.length) {
      this.filterIcon.set(true);
    } else {
      if (Object.keys(this.filteredDatas || {}).length === 0 && !this.criteriaChip?.name) {
        this.filterIcon.set(false);
      }
    }
    this.results.set(response.result.data);
    this.totalCount.set(response.result.count);
    this.noDataMessage = obj.searchText ? "SEARCH_RESULT_NOT_FOUND" : "THIS_SPACE_LOOKS_EMPTY"
  }

  onPageChange(event) {
    this.page = event.page,
      this.pageSize = event.pageSize;
    this.fetchSessionList()
  }

  async eventAction(event) {
    this.user = await this.localStorage.getLocalData(localKeys.USER_DETAILS)
    if (this.user.about || environment['isAuthBypassed']) {
      if(event.type !== 'cardSelect') 
        this.sessionService.invalidateSessionCache();
      switch (event.type) {
        case 'cardSelect':
          this.utilService.setSkipScroll(this.scrollKey);
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
            if (this.isMentor) {
              this.createdSessions = await this.sessionService.getAllSessionsAPI(obj);
            }
          })
          break;
      }
    } else {
      this.profileService.upDateProfilePopup()
    }
  }

  locationBack() {
    this.location.back()
  }

  extractLabels(data) {
    this.chips.set([]);
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        this.chips.update(prev => [...prev, ...data[key]]);
      }
    }
  }


  getUrlQueryData() {
    const queryString = Object.keys(this.filteredDatas)
      .map(key => `${key}=${this.filteredDatas[key]}`)
      .join('&');

    this.urlQueryData = queryString;
  }

  removeFilteredData(chip) {
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
  removeChip(event) {
    this.chips.update(prev => {
      const updated = [...prev];
      updated.splice(event.index, 1);
      return updated;
    });
    this.removeFilteredData(event.chipValue);
    this.getUrlQueryData();
    this.fetchSessionList()
  }

  ionViewDidLeave() {
    this.showSelectedCriteria = "";
    this.searchText = "";
    this.criteriaChip = "";
    this.chips.set([]);
    this.utilService.subscribeSearchText('');
    this.utilService.subscribeCriteriaChip('');
    this.urlQueryData = null;
  }

  ngOnDestroy() {
    this.searchTextSubscription.unsubscribe();
    this.criteriaChipSubscription.unsubscribe();
  }
}
