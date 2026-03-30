import { Component, OnInit, signal, computed, ViewChild, ViewEncapsulation } from '@angular/core';
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
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from 'src/app/shared/shared.module';
import { OverlayModule } from '@angular/cdk/overlay';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-generic-list',
  templateUrl: './generic-list.page.html',
  styleUrls: ['./generic-list.page.scss'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    SharedModule,
    OverlayModule,
    MatPaginatorModule,
    TranslateModule,
  ],
})
export class GenericListPage implements OnInit {

  @ViewChild('subscribe') searchbarComponent: SearchbarComponent;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  pageSize = paginatorConstants.defaultPageSize;
  pageSizeOptions = paginatorConstants.pageSizeOptions;

  headerConfig = signal<any>({
    menu: true,
    color: 'primary',
    headerColor: 'primary',
  });

  overlayChips = signal<any>(undefined);
  routeData = signal<any>(undefined);
  searchAndCriterias = signal<any>(undefined);
  filteredDatas = signal<any[]>([]);
  filterData = signal<any[]>([]);
  selectedChips = signal<boolean>(false);
  chips = signal<any[]>([]);
  page = signal<number>(1);
  setPaginatorToFirstpage = signal<boolean>(false);
  urlQueryData = signal<string>('');
  responseData = signal<any>(undefined);
  searchText = signal<any>(undefined);
  totalCount = signal<any>(undefined);
  isLoaded = signal<boolean>(false);
  enableExploreButton = signal<boolean>(false);
  valueFromChipAndFilter = signal<any>(undefined);
  buttonConfig = signal<any>(undefined);
  noResult = signal<any>(undefined);
  isMentor = signal<boolean>(false);
  filterIcon = signal<boolean>(false);
  filterChipsSelected = signal<boolean>(false);
  selectedCriteria = signal<any>(undefined);
  mentorForm = signal<any>(undefined);

  showSearchRow = computed(() =>
    (this.responseData()?.length && !this.searchText() && this.routeData()) ||
    this.searchAndCriterias() ||
    (!this.filterChipsSelected() && !this.responseData()?.length)
  );

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
    this.isMentor.set(roles.includes('mentor') ? true : false);
    const result = await this.formService.getForm(MENTOR_CONNECTION_CARD_FORM);
    this.mentorForm.set(_.get(result, 'data.fields.controls'));
    this.route.data.subscribe((data) => {
      this.routeData.set(data);
      this.action(data);
      this.buttonConfig.set(data?.button_config);
    });
    this.filterListData(this.routeData()?.filterType);
    this.getData();
    if (!this.searchText() && this.isMentor() && !this.totalCount()) {
      this.noResult.set(NO_RESULT_FOUND_FOR_MENTOR);
      this.enableExploreButton.set(false);
    } else if (!this.searchText() && !this.isMentor() && !this.totalCount()) {
      this.noResult.set(NO_RESULT_FOUND_FOR_MENTEE);
      this.enableExploreButton.set(true);
    } else {
      this.noResult.set(this.routeData()?.noDataFound);
      this.enableExploreButton.set(false);
    }
  }

  searchResults(event) {
    this.searchText.set(event.searchText);
    this.searchAndCriterias.set({ headerData: event });
    this.selectedCriteria.set(event?.criterias?.name);
    this.getData();
  }

  async getData() {
    let response = await this.httpService.get({
      url:
        this.routeData().url +
        (this.page() ? this.page() : '') +
        '&limit=' +
        (this.pageSize ? this.pageSize : '') +
        '&search=' +
        (this.searchText() ? btoa(this.searchText()) : '') +
        '&' +
        (this.urlQueryData() ? this.urlQueryData() : '') +
        '&search_on=' +
        (this.selectedCriteria() ? this.selectedCriteria() : ''),
    });
    this.isLoaded.set(true);
    this.responseData.set(response.result.data);
    this.totalCount.set(response?.result?.count);
    if (this.searchText() && !this.responseData().length) {
      this.noResult.set(this.routeData()?.noDataFound);
      this.enableExploreButton.set(false);
    }
    if (this.responseData().length) {
      this.filterIcon.set(true);
    } else {
      if (Object.keys(this.filteredDatas() || {}).length === 0 && !this.selectedCriteria()) {
        this.filterIcon.set(false);
      }
    }
  }

  async onClickFilter() {
    let modal = await this.modalCtrl.create({
      component: FilterPopupComponent,
      cssClass: 'filter-modal',
      componentProps: { filterData: this.filterData() },
    });

    modal.onDidDismiss().then(async (dataReturned) => {
      this.filteredDatas.set([]);
      if (dataReturned?.data?.role === 'closed') {
        this.filterData.set(dataReturned?.data?.data);
        return;
      }
      if (Object.keys(dataReturned?.data).length === 0) {
        this.chips.set([]);
        this.filteredDatas.set([]);
        this.urlQueryData.set('');
      }
      if (dataReturned.data && dataReturned.data.data) {
        if (dataReturned.data.data.selectedFilters) {
          const updatedFiltered: any[] = [];
          for (let key in dataReturned.data.data.selectedFilters) {
            updatedFiltered[key] = dataReturned.data.data.selectedFilters[key]
              .slice(0, dataReturned.data.data.selectedFilters[key].length)
              .map((obj) => obj.value)
              .join(',')
              .toString();
          }
          this.filteredDatas.set(updatedFiltered);
          if (dataReturned.data.data.selectedFilters.roles) {
            this.filterChipsSelected.set(true);
          } else {
            this.filterChipsSelected.set(false);
          }
          this.selectedChips.set(true);
        }
        this.extractLabels(dataReturned.data.data.selectedFilters);
        this.getUrlQueryData();
      }
      this.page.set(1);
      this.setPaginatorToFirstpage.set(true);
      this.getData();
    });
    modal.present();
  }

  async filterListData(filterType) {
    const obj = { filterType: filterType, org: true };
    let data = await this.formService.filterList(obj);
    const transformed = await this.utilService.transformToFilterData(data, obj);
    this.filterData.set(transformed);
    const filterRoles = this.isMentor() ? FILTER_ROLES : '';
    if (filterRoles) {
      this.filterData.update(fd => [filterRoles, ...fd]);
    }
  }

  extractLabels(data) {
    const newChips = [];
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        newChips.push(...data[key]);
      }
    }
    this.chips.set(newChips);
  }

  getUrlQueryData() {
    const params = Object.entries(this.filteredDatas())
      .filter(([_, value]) => value !== true && value !== false)
      .map(([key, value]) => `${key}=${value}`);
    this.urlQueryData.set(params.join('&'));
  }

  removeChip(event) {
    const updated = [...this.chips()];
    updated.splice(event.index, 1);
    this.chips.set(updated);
    this.removeFilteredData(event.chipValue);
    this.getUrlQueryData();
    this.getData();
  }

  removeFilteredData(chip) {
    this.filterData.update(fd =>
      fd.map((filter) => {
        filter.options.map((option) => {
          if (option.value === chip) {
            option.selected = false;
          }
        });
        return filter;
      })
    );
    const updatedFiltered = { ...this.filteredDatas() } as any;
    for (let key in updatedFiltered) {
      if (updatedFiltered.hasOwnProperty(key)) {
        let values = updatedFiltered[key].split(',');
        let chipIndex = values.indexOf(chip);
        if (chipIndex > -1) {
          values.splice(chipIndex, 1);
          let newValue = values.join(',');
          if (newValue === '') {
            delete updatedFiltered[key];
          } else {
            updatedFiltered[key] = newValue;
          }
        }
      }
    }
    this.filteredDatas.set(updatedFiltered);
  }

  onPageChange(event) {
    this.page.set(event.pageIndex + 1);
    this.pageSize = this.paginator.pageSize;
    this.getData();
  }

  action(event) {
    if (event && event.filterType) {
      this.permissionService.getPlatformConfig().then((config) => {
        this.overlayChips.set(
          config?.result?.search_config?.search[event.filterType]?.fields
        );
      });
    }
  }

  eventAction(event: any) {
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([CommonRoutes.MENTOR_DETAILS, event?.data?.id]);
        break;
      case 'chat':
        if (!event.rid) {
          return;
        }
        this.router.navigate([CommonRoutes.CHAT, event.rid], { queryParams: { id: event.data } });
        break;
      case 'requestSession':
        this.router.navigate([CommonRoutes.SESSION_REQUEST], { queryParams: { data: event.data } });
        break;
      case 'unblock':
        this.onUnblock(event);
        break;
    }
  }

  eventHandler(event: string) {
    this.valueFromChipAndFilter.set(event);
  }

  goToHome() {
    this.router.navigate([CommonRoutes.HOME]);
  }

  async onClearSearch($event: string) {
    this.page.set(1);
    this.searchText.set('');
    const sa = this.searchAndCriterias();
    if (sa?.headerData) {
      sa.headerData.searchText = '';
      sa.headerData.criterias = undefined;
      this.searchAndCriterias.set({ ...sa });
    }
    await this.getData();
  }

  async onUnblock(user: any) {
    const userId = user.data;
    const result = await this.utilService.alertPopup(
      {
        header: 'CONFIRM_UNBLOCK_HEADER',
        message: 'CONFIRM_UNBLOCK_MESSAGE',
        cancel: 'CANCEL',
        submit: 'UNBLOCK',
      },
      { name: user.name }
    );

    if (result) {
      this.toast.showToast('UNBLOCK_TOAST_MESSAGE', 'success');
      this.router.navigate([CommonRoutes.MENTOR_DETAILS, userId]);
    } else {
      console.log('User cancelled unblock.');
    }
  }
}
