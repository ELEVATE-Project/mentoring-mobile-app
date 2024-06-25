import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { paginatorConstants } from 'src/app/core/constants/paginatorConstants';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, LoaderService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
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
  urlFilterData: string;
  setPaginatorToFirstpage: boolean;
  page: any = 1;
  data: any;
  isLoaded: boolean;
  // mentors = [];
  totalCount: any;
  limit: any;
  flatChips = [];

  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private httpService: HttpService,
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
    this.flatChips.splice(index, 1);
    this.removeFilteredData(chip)
    this.getFilteredData();
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
        this.getFilteredData();
      }
      this.page = 1;
      this.setPaginatorToFirstpage = true;
      this.getMentors()
    });
    modal.present();
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

  extractLabels(data) {
    this.flatChips = [];
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        this.flatChips.push(...data[key]);
      }
    }
  }

  getFilteredData() {
    const queryString = Object.keys(this.filteredDatas)
      .map(key => `${key}=${this.filteredDatas[key]}`)
      .join('&');

    this.urlFilterData = queryString;
    console.log(this.filteredDatas, this.urlFilterData)
  }

  async getMentors(showLoader = true){
    showLoader ? await this.loaderService.startLoader() : '';
    const config = {
      url: urlConstants.API_URLS.MENTORS_DIRECTORY_LIST  + this.page + '&limit=' + this.pageSize + '&search=' + btoa(this.searchText) + '&directory=false'+ '&search_on=' + (this.selectedChipName? this.selectedChipName : '') + '&' + (this.urlFilterData ? this.urlFilterData: ''),
      payload: {}
    };
    try {
      let data: any = await this.httpService.get(config);
      this.data = data.result.data;
      this.totalCount = data.result.count;
      this.isLoaded = true
      showLoader ? await this.loaderService.stopLoader() : '';
      // this.mentors = this.mentors.concat(data.result.data);
    }
    catch (error) {
      this.isLoaded = true
      showLoader ? await this.loaderService.stopLoader() : '';
    }
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

}
