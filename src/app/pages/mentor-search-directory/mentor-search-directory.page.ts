import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { paginatorConstants } from 'src/app/core/constants/paginatorConstants';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, LoaderService } from 'src/app/core/services';
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

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private modalCtrl: ModalController,
    private permissionService: PermissionService,
    private formService: FormService
  ) { }

  async ngOnInit() {
    this.getMentors();
    this.permissionService.getPlatformConfig().then((config)=>{
      this.overlayChips = config?.result?.search_config?.search?.mentor?.fields;
    })
    let data = await this.formService.filterList('profile')
    this.filterData = this.transformData(data)
  }

  onSearch(){
    this.getMentors()
  }
  
  selectChip(chip) {
    this.selectedChipLabel = chip.label;
    this.selectedChipName = chip.name;
    this.isOpen = false;
    this.getMentors()
  }

  closeCriteriaChip(){
    this.selectedChipLabel = "";
    this.selectedChipName = "";
    this.getMentors()
  }

  removeChip(chip: string,index: number) {
    this.chips.splice(index, 1);
    this.removeFilteredData(chip)
    this.getUrlQueryData();
    this.getMentors()
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
        if (dataReturned?.data?.data?.selectedFilters) {
          for (let key in dataReturned?.data?.data?.selectedFilters) {
            this.filteredDatas[key] = dataReturned?.data?.data?.selectedFilters[key].slice(0, dataReturned?.data?.data?.selectedFilters[key].length).map(obj => obj.value).join(',').toString()
          }
          this.selectedChips = true;
        }
        this.extractLabels(dataReturned?.data?.data?.selectedFilters);
        this.getUrlQueryData();
      }
      this.page = 1;
      this.setPaginatorToFirstpage = true;
      this.getMentors()
    });
    modal.present();
  }

  transformData(responseData) {
    const entityTypes = responseData?.entity_types;
  
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
    var obj = {page: this.page, pageSize: this.pageSize, searchText: this.searchText, selectedChip: this.selectedChipName, urlQueryData: this.urlQueryData};
    let data = await this.profileService.getMentors(true,obj);
    this.data = data.result.data;
    this.totalCount = data.result.count;
  }

}
