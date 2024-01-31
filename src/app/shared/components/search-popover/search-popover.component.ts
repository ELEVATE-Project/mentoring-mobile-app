import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import * as _ from 'lodash';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, UtilService } from 'src/app/core/services';

@Component({
  selector: 'app-search-popover',
  templateUrl: './search-popover.component.html',
  styleUrls: ['./search-popover.component.scss'],
})
export class SearchPopoverComponent implements OnInit {
  @Input() data: any;
  showFilterHeader = true
  columnData = [
    { name: 'index_number', displayName: 'No.', type: 'text' },
    { name: 'name', displayName: 'Name', type: 'text', sortingData: [{ sort_by: 'title', order: 'ASC', label: 'A -> Z' }, { sort_by: 'title', order: 'DESC', label: 'Z -> A' }] },
    { name: 'designation', displayName: 'Designation', type: 'array' },
    { name: 'organization', displayName: 'Organisation', type: 'text' },
    { name: 'email', displayName: 'E-mail ID', type: 'text' },
    { name: 'enrollment_type', displayName: 'Enrollment Type', type: 'text' },
    { name: 'action', displayName: 'Actions', type: 'button' }
  ]

  filterData;
  tableData: any;
  page = 1
  limit = 5
  searchText = '';
  count: any;
  actionButtons = {
    'ADD': [{ name: 'add', cssColor: 'white-color' }],
    'REMOVE': [{ name: 'remove', cssColor: 'primary-color' }],
  }
  selectedFilters:any = {};
  selectedList: any=[];
  noDataMessage: string;

  constructor(private popoverController: PopoverController, private util: UtilService, private httpService: HttpService) { }

  async ngOnInit() {
    this.selectedList = this.data.selectedData ? this.data.selectedData : this.selectedList
    if (this.data.viewListMode) {
      this.tableData = this.selectedList
      this.filterData = [];
    } else {
      this.tableData = await this.getMenteelist();
      this.filterData = await this.getFilters();
      this.filterData = this.util.getFormatedFilterData(this.filterData, this.data.control.meta);
    }    
  }

  async getFilters() {
    let url = ''
    if (this.data.control.meta.filters.entity_types && this.data.control.meta.filters.entity_types.length > 0) {
      const entityTypes = this.data.control.meta.filters.entity_types.map((type: any) => type.key).join(',');
      url += `entity_types=${entityTypes}`;
    }
    if (this.data.control.meta.filters.organizations && this.data.control.meta.filters.organizations[0].isEnabled) {
      url += `&organization=true`;
    }
    const config = {
      url: urlConstants.API_URLS.FILTER_LIST + url,
      payload: {},
    };
    try {
      const data: any = await this.httpService.get(config);
      return data.result
    }
    catch (error) {
      return null;
    }
  }

  async getMenteelist() {
    const organizationsQueryParam = this.selectedFilters && this.selectedFilters.organizations
    ? '&organization_ids=' + this.selectedFilters.organizations.map(org => org.id).join(',')
    : '';
    const designationQueryParam = this.selectedFilters && this.selectedFilters.designation
        ? '&designation=' + this.selectedFilters.designation.map(des => des.value).join(',')
        : '';
    const queryString = organizationsQueryParam + designationQueryParam;
    const config = {
      url: urlConstants.API_URLS[this.data.control.meta.url] + this.page + '&limit=' + this.limit + '&search=' + btoa(this.searchText) + queryString,
      payload: {}
    };
    try {
      const data: any = await this.httpService.get(config);
      this.count = data.result.count
      this.noDataMessage = this.searchText ? "SEARCH_RESULT_NOT_FOUND" : "THIS_SPACE_LOOKS_EMPTY"
      let selectedIds =  _.map(this.selectedList, 'id');
      data.result.data.forEach((ele) => {
        ele.action = _.includes(selectedIds, ele.id) ? this.actionButtons.REMOVE : this.actionButtons.ADD;
        ele.organization = ele?.organization?.name;
      });
      return data.result.data
    }
    catch (error) {
      return null;
    }
  }

  closePopover() {
    this.popoverController.dismiss(this.selectedList);
  }

  async filtersChanged(event) {
    this.selectedFilters = event
    this.tableData = await this.getMenteelist()
  }

  async onSearch(){
    this.tableData = await this.getMenteelist()
  }

  onCLickEvent(data: any) {
    switch(data.action){
      case 'add':
        if(!this.data.control.meta .multiSelect){
          this.popoverController.dismiss([{label: data.element.name+', '+data.element.organization, id: data.element.id, data: data.element}])
        } else {
          const index = this.tableData.findIndex(item => item.id === data.element.id);
          this.tableData[index].action = this.actionButtons.REMOVE
          let addedData = data.element
          this.selectedList.push(addedData)
        }
        break;

      case 'remove':
        const index = this.tableData.findIndex(item => item.id === data.element.id);
        if(this.data.viewListMode) {
          this.tableData = this.tableData.filter(obj => obj.id !== data.element.id);
        } else {
          this.tableData[index].action = this.actionButtons.ADD
        }
        this.selectedList = this.selectedList.filter(obj => obj.id !== data.element.id);
      default:
        
    }
  }

 async onPaginatorChange(data:any) {
    this.page = data.page;
    this.limit = data.pageSize 
    this.tableData = await this.getMenteelist()
  }
}
