import { ChangeDetectionStrategy, Component, OnInit, ViewChild, signal } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import * as _ from 'lodash';
import { MENTOR_DIR_CARD_FORM } from 'src/app/core/constants/formConstant';
import { paginatorConstants } from 'src/app/core/constants/paginatorConstants';
import { ToastService, UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { FilterPopupComponent } from 'src/app/shared/components/filter-popup/filter-popup.component';
import { CommonRoutes } from 'src/global.routes';
import { LocalStorageService } from 'src/app/core/services';
import { localKeys } from 'src/app/core/constants/localStorage.keys';

@Component({
    selector: 'app-mentor-search-directory',
    templateUrl: './mentor-search-directory.page.html',
    styleUrls: ['./mentor-search-directory.page.scss'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentorSearchDirectoryPage implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = paginatorConstants.defaultPageSize;
  pageSizeOptions = paginatorConstants.pageSizeOptions;

  public headerConfig = signal({
    menu: true,
    notification: true,
    headerColor: 'primary',
  });

  isOpen = signal(false);
  overlayChips = signal<any>(null);
  filterData = signal<any>(null);
  filteredDatas = signal<any>({});
  filterIcon = signal<boolean>(false);
  selectedChips = signal(false);
  urlQueryData = signal<string | null>(null);
  setPaginatorToFirstpage = signal(false);
  page = signal<number>(1);
  data = signal<any[]>([]);
  isLoaded = signal<boolean>(false);
  totalCount = signal<any>(null);
  limit = signal<any>(null);
  chips = signal<any[]>([]);
  buttonConfig: any;
  searchAndCriterias = signal({
    headerData: {
      searchText: '',
      criterias: {
        name: undefined,
        label: undefined
      }
    }
  });
  valueFromChipAndFilter = signal<string | null>(null);
  mentorForm = signal<any>(null);
  currentUserId = signal<any>(null);

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private modalCtrl: ModalController,
    private permissionService: PermissionService,
    private formService: FormService,
    private utilService: UtilService,
    private toast: ToastService,
    private route: ActivatedRoute,
    private localStorage: LocalStorageService
  ) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.buttonConfig = data.button_config;
    });
  }

  async ionViewWillEnter() {
    let user = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    this.currentUserId.set(user?.id);
    const result = await this.formService.getForm(MENTOR_DIR_CARD_FORM);
    this.mentorForm.set(_.get(result, 'data.fields.controls'));
    const queryParams = this.route.snapshot.queryParams;
    const search = queryParams['search'];
    const chip = queryParams['chip'];

    if (search) {
      this.searchAndCriterias.set({
        ...this.searchAndCriterias(),
        headerData: {
          ...this.searchAndCriterias().headerData,
          searchText: search
        }
      });
    }

    this.getMentors();

    const config = await this.permissionService.getPlatformConfig();
    this.overlayChips.set(config?.result?.search_config?.search?.mentor?.fields);

    if (chip) {
      const matchedField = this.overlayChips()?.find(d => d.name === chip);
      if (matchedField && search) {
        this.searchAndCriterias.set({
          ...this.searchAndCriterias(),
          headerData: {
            ...this.searchAndCriterias().headerData,
            criterias: {
              name: matchedField.name,
              label: matchedField.label
            }
          }
        });
      }
    }

    const obj = { filterType: 'mentor', org: true };
    let data = await this.formService.filterList(obj);
    this.filterData.set(await this.utilService.transformToFilterData(data, obj));
  }

  async onSearch(event) {
    this.searchAndCriterias.set({
      headerData: event,
    });
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
    this.searchAndCriterias.update(current => ({
      ...current,
      headerData: {
        ...current.headerData,
        searchText: '',
        criterias: undefined
      }
    }));

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
      componentProps: { filterData: this.filterData() }
    });

    modal.onDidDismiss().then(async (dataReturned) => {
      if (dataReturned?.data?.role === 'closed') {
        this.filterData.set(dataReturned?.data?.data);
        return;
      }
      if (Object.keys(dataReturned?.data || {}).length === 0) {
        this.chips.set([]);
        this.filteredDatas.set({});
        this.urlQueryData.set(null);
      }
      if (dataReturned.data && dataReturned.data.data) {
        if (dataReturned.data.data.selectedFilters) {
          const newFilteredDatas = {};
          for (let key in dataReturned.data.data.selectedFilters) {
            newFilteredDatas[key] = dataReturned.data.data.selectedFilters[key].slice(0, dataReturned.data.data.selectedFilters[key].length).map(obj => obj.value).join(',').toString();
          }
          this.filteredDatas.set(newFilteredDatas);
          this.selectedChips.set(true);
        }
        this.extractLabels(dataReturned.data.data.selectedFilters);
        this.getUrlQueryData();
      }
      this.page.set(1);
      this.setPaginatorToFirstpage.set(true);
      this.getMentors();
    });
    modal.present();
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
    const currentFiltered = this.filteredDatas();
    const queryString = Object.keys(currentFiltered)
      .map(key => `${key}=${currentFiltered[key]}`)
      .join('&');
    this.urlQueryData.set(queryString);
  }

  eventAction(event) {
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([CommonRoutes.MENTOR_DETAILS, event?.data?.id]);
        break;
      case 'chat':
        this.router.navigate([CommonRoutes.CHAT_REQ, event.data]);
        break;
      case 'requestSession':
        this.router.navigate([CommonRoutes.SESSION_REQUEST], { queryParams: { data: event.data } });
        break;
    }
  }

  eventHandler(event: any) {
    this.valueFromChipAndFilter.set(event);
    this.searchAndCriterias.update(current => ({
      ...current,
      headerData: {
        ...current.headerData,
        criterias: { name: undefined, label: undefined }
      }
    }));
  }

  onPageChange(event) {
    this.page.set(event.pageIndex + 1);
    this.pageSize = this.paginator.pageSize;
    this.getMentors();
  }

  removeFilteredData(chip) {
    const updatedFilterData = this.filterData().map(filter => ({
      ...filter,
      options: filter.options.map(option => (
        option.value === chip ? { ...option, selected: false } : option
      ))
    }));
    this.filterData.set(updatedFilterData);

    const currentFiltered = { ...this.filteredDatas() };
    for (let key in currentFiltered) {
      if (currentFiltered.hasOwnProperty(key)) {
        let values = currentFiltered[key].split(',');
        let chipIndex = values.indexOf(chip);
        if (chipIndex > -1) {
          values.splice(chipIndex, 1);
          let newValue = values.join(',');
          if (newValue === '') {
            delete currentFiltered[key];
          } else {
            currentFiltered[key] = newValue;
          }
        }
      }
    }
    this.filteredDatas.set(currentFiltered);
  }

  async getMentors() {
    const searchData = this.searchAndCriterias().headerData;
    var obj = {
      page: this.page(),
      pageSize: this.pageSize,
      searchText: searchData.searchText?.trim(),
      selectedChip: searchData.criterias?.name,
      urlQueryData: this.urlQueryData()
    };
    let response = await this.profileService.getMentors(true, obj);
    if (response?.result?.data?.length) {
      this.isOpen.set(false);
      
      const processedData = response.result.data.map(mentor => {
        const mentorCopy = { ...mentor };
        if (mentorCopy.id === this.currentUserId()) {
          mentorCopy.buttonConfig = this.buttonConfig.map(btn => ({ ...btn, isHide: true }));
        } else {
          mentorCopy.buttonConfig = this.buttonConfig.map(btn => ({ ...btn }));
        }
        return mentorCopy;
      });

      this.data.set(processedData);
      this.totalCount.set(response.result.count);
    } else {
      this.data.set([]);
      this.totalCount.set(0);
      if (Object.keys(this.filteredDatas() || {}).length === 0 && !searchData.criterias?.name) {
        this.filterIcon.set(false);
      }
    }
    this.filterIcon.set(!!obj.searchText?.trim());
    this.isLoaded.set(true);
  }

  removeChip(event) {
    const current = [...this.chips()];
    current.splice(event.index, 1);
    this.chips.set(current);
    this.removeFilteredData(event.chipValue);
    this.getUrlQueryData();
    this.getMentors();
  }

  ionViewDidLeave() {
    this.searchAndCriterias.set({
      headerData: {
        searchText: '',
        criterias: {
          name: undefined,
          label: undefined
        }
      }
    });
    this.filterIcon.set(false);
    this.chips.set([]);
    this.urlQueryData.set(null);
  }
}
