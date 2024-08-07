import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminWorkapceService } from 'src/app/core/services/admin-workspace/admin-workapce.service';
import { CommonRoutes } from 'src/global.routes';
import { ModalController } from '@ionic/angular';
import { FilterPopupComponent } from 'src/app/shared/components/filter-popup/filter-popup.component';
import { MenteeListPopupComponent } from 'src/app/shared/components/mentee-list-popup/mentee-list-popup.component';
import *  as moment from 'moment';
import { urlConstants } from 'src/app/core/constants/urlConstants';

@Component({
  selector: 'app-manage-session',
  templateUrl: './manage-session.component.html',
  styleUrls: ['./manage-session.component.scss'],
})
export class ManageSessionComponent implements OnInit {
  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    // label: 'MANAGE_SESSION'
  };
  receivedEventData: any;

  public manageSessionUrls: any = {
    downloadCsvApiUrl: urlConstants.API_URLS.SESSION_DOWNLOAD_CSV,
    uploadCsvApiUrl: urlConstants.API_URLS.SESSION_BULK_UPLOAD
  }

  constructor(private adminWorkapceService: AdminWorkapceService, private router: Router, private modalCtrl: ModalController) { }
  headingText = "SESSION_LIST"
  download = "DOWNLOAD";
  page = 1;
  limit = 5;
  searchText: string = '';
  type = "";
  totalCount: any;
  sortingData: any;
  setPaginatorToFirstpage:any = false;
  columnData = [
    { name: 'id', displayName: 'Session Id', type: 'text'},
    { name: 'title', displayName: 'Session name', type: 'text', sortingData: [{ sort_by: 'title', order: 'ASC', label: 'A -> Z' }, { sort_by: 'title', order: 'DESC', label: 'Z -> A' }] },
    { name: 'type', displayName: 'Type', type: 'text' },
    { name: 'mentor_name', displayName: 'Mentor', type: 'text' },
    { name: 'start_date', displayName: 'Date', type: 'text', sortingData: [{ sort_by: 'start_date', order: 'DESC', label: 'Latest' }, { sort_by: 'start_date', order: 'ASC', label: 'Oldest' }] },
    { name: 'start_time', displayName: 'Time', type: 'text' },
    { name: 'duration_in_minutes', displayName: 'Duration(min)', type: 'text' },
    { name: 'mentee_count', displayName: 'Mentee count', type: 'text' },
    { name: 'status', displayName: 'Status', type: 'text', },
    { name: 'action', displayName: 'Actions', type: 'button' }
  ]
  filterData =
    [
      {
        "title": "Status",
        "name": "status",
        "options": [
          {
            "label": "Upcoming",
            "value": "PUBLISHED"
          },
          {
            "label": "Live",
            "value": "LIVE"
          },
          {
            "label": "Completed",
            "value": "COMPLETED"
          }
        ],
        "type": "checkbox"
      },
      {
        "title": "Type",
        "name": "type",
        "options": [
          {
            "label": "Public",
            "value": "PUBLIC"
          },
          {
            "label": "Private",
            "value": "PRIVATE"
          }
        ],
        "type": "checkbox"
      }
    ]
  tableData: any;
  dummyTableData: any = false;
  noDataMessage: any;
  segmentType = 'manage-session';
  filteredDatas = []
  actionButtons = {
    'UPCOMING': [{ icon: 'eye', cssColor: 'white-color' , action:'VIEW'}, { icon: 'create', cssColor: 'white-color' ,action:'EDIT'}, { icon: 'trash', cssColor: 'white-color',action:'DELETE' }],
    'LIVE': [{ icon: 'eye', cssColor: 'white-color' ,action:'VIEW'}, { icon: 'create', cssColor: 'white-color' ,action:'EDIT'}],
    'COMPLETED': [{ icon: 'eye', cssColor: 'white-color' ,action:'VIEW'}]
  };

  async ngOnInit() {
    this.fetchSessionList()
  }

  async ionViewWillEnter() {
    this.fetchSessionList()
  }

  async onCLickEvent(data: any) {
    this.receivedEventData = data;
    switch (this.receivedEventData.action) {
      case 'mentor_name':
        this.router.navigate([CommonRoutes.MENTOR_DETAILS, this.receivedEventData.element.mentor_id]);
        break;
      case "mentee_count":
        let modal = await this.modalCtrl.create({
          component: MenteeListPopupComponent, 
          cssClass: 'large-width-popover-config',
          componentProps: { id:this.receivedEventData.element.id }
        });
    
        modal.onDidDismiss().then(async (dataReturned) => {
       
        });
        modal.present()
        break;

      case "EDIT":
        (this.receivedEventData?.element?.status=='Live') ? this.router.navigate([CommonRoutes.CREATE_SESSION], { queryParams: { id: this.receivedEventData.element.id , type: 'segment'} }) : this.router.navigate([CommonRoutes.CREATE_SESSION], { queryParams: { id: this.receivedEventData.element.id } });
        break;
      case 'DELETE':
        await this.adminWorkapceService.deleteSession(this.receivedEventData.element.id)
        .then((data) => {
          if(data?.responseCode == "OK"){
            this.fetchSessionList()
          }
        })
        .catch((error) => {
        });
        break;
      default:
        this.router.navigate([`${CommonRoutes.SESSIONS_DETAILS}`, this.receivedEventData.element.id]);
    }
  }

  onPaginatorChange(data: any) {
    this.setPaginatorToFirstpage= false;
    this.page = data.page;
    this.limit = data.pageSize
    this.fetchSessionList()
  }

  onSorting(data: any) {
    this.sortingData = data;
    this.page=1;
    this.setPaginatorToFirstpage= true
    this.fetchSessionList()
  }

  onSearch() {
    this.page = 1;
    this.setPaginatorToFirstpage = true
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
      if (dataReturned.data && dataReturned.data.data) {
        if (dataReturned.data.data.selectedFilters) {
          for (let key in dataReturned.data.data.selectedFilters) {
            this.filteredDatas[key] = dataReturned.data.data.selectedFilters[key].slice(0, dataReturned.data.data.selectedFilters[key].length).map(obj => obj.value).join(',').toString()
          }
        }
      }
      this.page = 1;
      this.setPaginatorToFirstpage = true
      this.fetchSessionList()
    });
    modal.present()
  }
  async onClickDownload() {
    var obj = { status: this.type, order: this.sortingData?.order, sort_by: this.sortingData?.sort_by, searchText: this.searchText, filteredData:this.filteredDatas };
     this.adminWorkapceService.downloadcreatedSessionsBySessionManager(obj);
  }
  async fetchSessionList() {
    var obj = { page: this.page, limit: this.limit, status: this.type, order: this.sortingData?.order, sort_by: this.sortingData?.sort_by, searchText: this.searchText, filteredData:this.filteredDatas };
    var response = await this.adminWorkapceService.createdSessionBySessionManager(obj);
    this.totalCount = response.count;
    let data = response.data
    if (data && data.length) {
      data.forEach((ele) => {
        let currentTimeInSeconds=Math.floor(Date.now()/1000);
        let setButton = (ele?.status?.value == 'PUBLISHED' && ele.end_date > currentTimeInSeconds) ? 'UPCOMING' :(ele?.status?.value == 'LIVE' && ele.end_date > currentTimeInSeconds) ? 'LIVE' : 'COMPLETED';
        let date = ele.start_date;
        ele.start_date = moment.unix(date).format('DD-MMM-YYYY')
        ele.start_time = moment.unix(date).format('h:mm A')
        ele.action = this.actionButtons[setButton]
        ele.status = ele?.status?.label;
        ele.type = ele?.type?.label;
        ele.duration_in_minutes =Math.round(ele?.duration_in_minutes) 
      });
    }
    this.tableData = data;
    this.noDataMessage = this.searchText ? "SEARCH_RESULT_NOT_FOUND" : "SEARCH_RESULT_NOT_FOUND"
  }

  createSession(){
      this.router.navigate([`${CommonRoutes.CREATE_SESSION}`]); 
  } 
  segmentChanged(event){
    this.segmentType = event.target.value;
  }
}
