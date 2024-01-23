import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LineElement } from 'chart.js/dist';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { AdminWorkapceService } from 'src/app/core/services/admin-workspace/admin-workapce.service';
import { CommonRoutes } from 'src/global.routes';
import { ModalController } from '@ionic/angular';
import { FilterPopupComponent } from 'src/app/shared/components/filter-popup/filter-popup.component';

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
  constructor(private adminWorkapceService: AdminWorkapceService, private router: Router, private modalCtrl: ModalController) { }
  headingText = "SESSION_LIST"
  download = "DOWNLOAD";
  page = 1;
  limit = 5;
  searchText: string = '';
  type = "";
  totalCount: any;
  sortingData: any;
  columnData = [
    { name: 'index_number', displayName: 'No.', type: 'text' },
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
            "value": "UPCOMING"
          },
          {
            "label": "Live",
            "value": "LIVE"
          },
          {
            "label": "Completed",
            "value": "COMPLETED"
          },
          {
            "label": "Deleted",
            "value": "DELETED"
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
  filteredDatas = []
  actionButtons = {
    'ACTIVE': [{ name: 'VIEW', cssColor: 'white-color' }],
    'PUBLISHED': [{ name: 'VIEW', cssColor: 'white-color' }, { name: 'EDIT', cssColor: 'white-color' }, { name: 'DELETE', cssColor: 'white-color' }],
    'COMPLETED': [{ name: 'VIEW', cssColor: 'white-color' }]
  }

  async ngOnInit() {
    this.fetchSessionList()
  }

  async ionViewWillEnter() {
    this.fetchSessionList()
  }

  onCLickEvent(data: any) {
    this.receivedEventData = data;
    switch (this.receivedEventData.action) {
      case 'mentor_name':
        this.router.navigate([CommonRoutes.MENTOR_DETAILS, this.receivedEventData.element.mentor_id]);
        break;
      case "EDIT":
        this.router.navigate([`${CommonRoutes.ADMIN}/${CommonRoutes.MANAGERS_SESSION}`], { queryParams: { id: this.receivedEventData.element.id }});
        break;
      case 'DELETE':

      default:
        this.router.navigate([CommonRoutes.SESSIONS_DETAILS, this.receivedEventData.element.id]);
    }
  }

  onPaginatorChange(data: any) {
    this.page = data.page;
    this.limit = data.pageSize
    this.fetchSessionList()
  }

  onSorting(data: any) {
    this.sortingData = data;
    this.fetchSessionList()
  }

  onSearch() {
    this.page = 1;
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
      if (dataReturned !== null) {
        if (dataReturned.data.data.selectedFilters) {
          for (let key in dataReturned.data.data.selectedFilters) {
            this.filteredDatas[key] = dataReturned.data.data.selectedFilters[key].slice(0, dataReturned.data.data.selectedFilters[key].length).map(obj => obj.value).join(',').toString()
          }
        }
      }
      this.fetchSessionList()
    });
    modal.present()
  }
  // async onClickDownload() {
  //   var obj = { status: this.type, order: this.sortingData?.order, sort_by: this.sortingData?.sort_by, searchText: this.searchText, filteredData:this.filteredDatas };
  //    this.adminWorkapceService.downloadcreatedSessionsBySessionManager(obj);
  // }
  async fetchSessionList() {
    var obj = { page: this.page, limit: this.limit, status: this.type, order: this.sortingData?.order, sort_by: this.sortingData?.sort_by, searchText: this.searchText, filteredData:this.filteredDatas };
    var response = await this.adminWorkapceService.createdSessionBySessionManager(obj);
    this.totalCount = response.count;
    let data = response.data
    if (data && data.length) {
      data.forEach((ele) => {
        ele.action = this.actionButtons[ele?.status?.value]
        ele.status = ele?.status?.label;
        ele.type = ele?.type?.label;
      });
    }
    this.tableData = data;
    this.noDataMessage = this.searchText ? "SEARCH_RESULT_NOT_FOUND" : "THIS_SPACE_LOOKS_EMPTY"
  }

  createSession(){
    this.router.navigate([`${CommonRoutes.ADMIN}/${CommonRoutes.MANAGERS_SESSION}`]);
  }

}
