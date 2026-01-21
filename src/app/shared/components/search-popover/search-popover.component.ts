import { Component, Input, OnInit } from '@angular/core';
import { ModalController, Platform } from '@ionic/angular';
import * as _ from 'lodash';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, LocalStorageService, ToastService, UtilService } from 'src/app/core/services';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search-popover',
  templateUrl: './search-popover.component.html',
  styleUrls: ['./search-popover.component.scss'],
})
export class SearchPopoverComponent implements OnInit {
  @Input() data: any;
  showFilterHeader = true
  columnData = [
    { name: 'name', displayName: 'Name', type: 'text' },
    { name: 'designation', displayName: 'Designation', type: 'array' },
    { name: 'organization', displayName: 'Organisation', type: 'text' },
    { name: 'email', displayName: 'E-mail ID', type: 'text' },
    { name: 'type', displayName: 'Enrollment type', type: 'text' },
    { name: 'action', displayName: 'Actions', type: 'button' }
  ]

  filterData;
  tableData: any;
  page = 1
  limit = 5
  searchText = '';
  count: any;
  maxCount;
  countSelectedList:any = 0 ;
  user;
  sortingData;
  setPaginatorToFirstpage:any = false;
  actionButtons = {
    'ADD': [{ name: 'ADD', cssColor: 'white-color' }],
    'REMOVE': [{ name: 'REMOVE', cssColor: 'primary-color' }],
  }  
  selectedFilters:any = {};
  selectedList: any=[];
  noDataMessage: string;
  showPaginator: boolean= true;
  disabledCheckboxId: string | null = null;
  showSelectAll : boolean = false;
  showCheckbox : boolean= false;
  isSelectAllActive: boolean= false;
  source: any;
   sorting : any;
  
  constructor(private platform: Platform, private modalController: ModalController, private toast: ToastService, private localStorage: LocalStorageService, private util: UtilService, private httpService: HttpService, private route: ActivatedRoute) { 
    this.platform.backButton.subscribeWithPriority(10, () => {
      this.handleBackButton();
    });
    window.addEventListener('popstate', () => {
      this.handleBackButton();
    });
  }

  async handleBackButton() {
    const modal = await this.modalController.getTop();
    if (modal) {
      await modal.dismiss();
    }
  }

  async ngOnInit() {
    
    if(this.data.viewListMode){
      this.showPaginator= false;
    }
     this.source = this.route.snapshot.queryParamMap.get('source');
     if(this.data.control.name ==="mentees" && !this.data.viewListMode){
      this.showCheckbox = true;
      this.showSelectAll = true; 
    }
    
    this.maxCount = await this.localStorage.getLocalData(localKeys[this.data.control.meta.maxCount])
    this.user = await this.localStorage.getLocalData(localKeys.USER_DETAILS)
    this.selectedList = this.data.selectedData ? this.data.selectedData : this.selectedList
     this.countSelectedList = this.selectedList.length
    if (this.data.viewListMode) {
      this.selectedList.forEach((ele) => {
        ele.organization = (typeof ele.organization === 'object' && ele.organization !== null) ? ele.organization.name : ele.organization;
        ele.action = ele.type=='ENROLLED' ? [] : this.actionButtons.REMOVE;
      });
      this.tableData = this.selectedList
      this.filterData = [];
    } else {
      this.tableData = await this.getMenteelist();
      this.filterData = this.data.isMobile ? [] : await this.getFilters();
      this.filterData = this.data.isMobile ? [] : this.util.getFormatedFilterData(this.filterData, this.data.control.meta);
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
      url: urlConstants.API_URLS.FILTER_LIST + url + '&filter_type=' + this.data.control.meta.filterType,
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
    let queryString = organizationsQueryParam + designationQueryParam;
    if(this.data.control.id){
      queryString = queryString + '&session_id=' + this.data.control.id
    }
    if( this.source == "home") {
       this.sorting = `&order=${this.sortingData?.order || ''}&sort_by=${this.sortingData?.sort_by || 'name'}&mentorId=${this.data?.mentorId ? this.data?.mentorId :  this.user.id}`;
    }
    else{
     this.sorting = `&order=${this.sortingData?.order || ''}&sort_by=${this.sortingData?.sort_by || ''}&mentorId=${this.data?.mentorId ? this.data?.mentorId :  this.user.id}`;
    }
    queryString = queryString + this.sorting
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
        ele.action = _.includes(selectedIds, ele.id) ? (ele.enrolled_type === 'ENROLLED' ? [] : this.actionButtons.REMOVE) : this.actionButtons.ADD;
        ele.type = ele?.enrolled_type
        ele.organization = ele?.organization?.name;
      });
      return data.result.data
    }
    catch (error) {
      return error;
    }
  }

  closePopover() {
    this.modalController.dismiss(this.selectedList);
  }

  async filtersChanged(event) {
    this.selectedFilters = event
    this.page=1;
    this.setPaginatorToFirstpage= true
    this.tableData = await this.getMenteelist()
  }

  async onSearch(){
    this.page=1;
    this.setPaginatorToFirstpage= true
    this.tableData = await this.getMenteelist()
  }

  onButtonCLick(data: any) {
    switch(data.action){
      case 'ADD':
        this.countSelectedList = (this.user.id == data.element.id) ?this.countSelectedList : this.countSelectedList+1
        if(!this.data.control.meta.multiSelect){
          this.modalController.dismiss([{label: data.element.name+', '+data.element.organization, id: data.element.id, data: data.element}])
        } else {
          if(this.maxCount && this.maxCount>=this.countSelectedList){
            const index = this.tableData.findIndex(item => item.id === data.element.id);
            this.tableData[index].action = this.actionButtons.REMOVE

            let addedData = data.element
            this.selectedList.push(addedData)
            this.selectedList = [...this.selectedList]; 
            this.disabledCheckboxId = null;
          } else {
            this.toast.showToast('SESSION_MENTEE_LIMIT', 'danger')
          }
        }
        break;

      case 'REMOVE':
        this.countSelectedList = (this.user.id == data.element.id) ?this.countSelectedList : this.countSelectedList-1
        const index = this.tableData.findIndex(item => item.id === data.element.id);
        if(this.data.viewListMode) {
          this.tableData = this.tableData.filter(obj => obj.id !== data.element.id);
        } else {
          this.tableData[index].action = this.actionButtons.ADD
        }
        this.selectedList = this.selectedList.filter(obj => obj.id !== data.element.id);
      default:
        
    }
    if (this.selectedList.length) {
      const sessionManager = this.selectedList.some(element => this.user.id === element.id);
      this.countSelectedList = sessionManager ? this.selectedList.length - 1 : this.selectedList.length;
    }
  }

  async onPaginatorChange(data:any) {
    this.setPaginatorToFirstpage= false;
    if(this.data.isMobile){
      this.page = this.page+1;
      this.limit = data.pageSize 
      this.tableData = this.tableData.concat(await this.getMenteelist())
    } else {
      this.page = data.page;
      this.limit = data.pageSize 
      this.tableData = await this.getMenteelist()
    }
  }

  onSorting(data: any) {
    this.page=1;
    this.setPaginatorToFirstpage= true
    this.sortingData = data;
    this.getMenteelist()
  }

   onSelectAll(isChecked : boolean){
    this.isSelectAllActive= isChecked
    switch(isChecked) {

     case true:

  let currentCount = this.countSelectedList;

  for (const element of this.tableData) {
      
      const alreadySelected = this.selectedList.some(item => item.id === element.id);
      if (alreadySelected) continue;

      if (element.enrolled_type === 'ENROLLED') continue; 

      const proposedCount = (this.user.id === element.id) 
          ? currentCount 
          : currentCount + 1; 

      if (this.maxCount && proposedCount > this.maxCount) {
          this.toast.showToast('SESSION_MENTEE_LIMIT', 'danger');
          break; 
      }
      const index = this.tableData.findIndex(item => item.id === element.id);
      if (index !== -1) {
          this.tableData[index].action = this.actionButtons.REMOVE;
      }
      this.selectedList.push(element);
      currentCount = proposedCount;
  }

  this.countSelectedList = currentCount;
  this.tableData = [...this.tableData]; 

  break;
    
     case false:
  const hasInvalid = this.tableData.some(
    el => this.selectedList.findIndex(item => item.id === el.id) === -1
  );

  if (hasInvalid) {
    break; 
  }

  for (const element of this.tableData) {
    const selectedIndex = this.selectedList.findIndex(
      item => item.id === element.id
    );

    const tableIndex = this.tableData.findIndex(
      item => item.id === element.id
    );

    if (tableIndex !== -1) {
      this.tableData[tableIndex].action = this.actionButtons.ADD;
    }

    this.selectedList.splice(selectedIndex, 1);

    if (this.user.id !== element.id) {
      this.countSelectedList -= 1;
    }
  }

  this.tableData = [...this.tableData];
  break;
  }
}

async onSelectAllX(isChecked: boolean) {
  if (!isChecked) {
    this.selectedList = [];
    this.countSelectedList = 0;
    this.page = 1;
    this.setPaginatorToFirstpage = true;
    this.tableData = await this.getMenteelist();
    return;
  }
  
  const originalPage = this.page;
  const originalLimit = this.limit;
  this.page = 1;
  this.limit = this.count;
  const allMentees = await this.getMenteelist();
  
  const hasSessionManager = this.selectedList.some(item => item.id === this.user.id);
  let currentCount = hasSessionManager ? this.selectedList.length - 1 : this.selectedList.length;
  let limitReached = false;
  for (const mentee of allMentees) {
    if (this.selectedList.some(item => String(item.id) === String(mentee.id)) || mentee.enrolled_type === 'ENROLLED') continue;
   
    const newCount = mentee.id === this.user.id ? currentCount : currentCount + 1;
    if (this.maxCount && newCount > this.maxCount) {
      limitReached = true;
      break;
    }
    this.selectedList.push(mentee);
    currentCount = newCount;
  }
  
    this.page = originalPage;
    this.limit = originalLimit;
    this.setPaginatorToFirstpage = true;
    this.tableData = await this.getMenteelist();
  
  
  this.countSelectedList = currentCount;

  if (limitReached) {
    this.toast.showToast('SESSION_MENTEE_LIMIT', 'danger');
  }
}
}
