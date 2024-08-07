import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
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
  searchText: string = '';
  isOpen = false;
  overlayChips = [];
  selectedChipLabel: any;
  selectedChipName: any;
  filterData: any;
  filteredDatas: any[];
  selectedChips: boolean;
  urlQueryData: string;
  setPaginatorToFirstpage: boolean;
  page: any = 1;
  data: any;
  isLoaded: boolean;
  totalCount: any;
  limit: any;
  chips = [];
  showSelectedCriteria: any;

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private modalCtrl: ModalController,
    private permissionService: PermissionService,
    private formService: FormService,
    private utilService: UtilService,
    private toast: ToastService
  ) { }

  ngOnInit() { }

  async ionViewWillEnter() {
    this.getMentors();
    this.permissionService.getPlatformConfig().then((config)=>{
      this.overlayChips = config?.result?.search_config?.search?.mentor?.fields;
    });
    const obj = {filterType: 'mentor', org: true};
    let data = await this.formService.filterList(obj);
    this.filterData = await this.utilService.transformToFilterData(data, obj);
  }

  onSearch(event){
    if (event.length >= 3) {
      this.searchText = event;
      this.showSelectedCriteria = this.selectedChipLabel;
      this.getMentors();
    } else {
      this.toast.showToast("ENTER_MIN_CHARACTER","danger");
    }
  }
  
  selectChip(chip) {
    if (this.selectedChipLabel === chip.label) {
      this.selectedChipLabel = null;
      this.selectedChipName = null;
    } else {
      this.selectedChipLabel = chip.label;
      this.selectedChipName = chip.name;
    }
  }

  closeCriteriaChip(){
    this.selectedChipLabel = "";
    this.selectedChipName = "";
    this.showSelectedCriteria = "";
  }

  removeChip(chip: string,index: number) {
    this.chips.splice(index, 1);
    this.removeFilteredData(chip)
    this.getUrlQueryData();
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
    }
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
    var obj = {page: this.page, pageSize: this.pageSize, searchText: this.searchText.trim(), selectedChip: this.selectedChipName, urlQueryData: this.urlQueryData};
    let data = await this.profileService.getMentors(true,obj);
    if(data && data.result){
      this.isOpen = false;
      this.data = data.result.data;
      this.totalCount = data.result.count;
    }
  }

  ionViewDidLeave(){
    this.searchText = "";
    this.showSelectedCriteria = "";
    this.selectedChipLabel = null;
    this.selectedChipName = null;
    this.chips = [];
    this.urlQueryData = null;
  }

}
