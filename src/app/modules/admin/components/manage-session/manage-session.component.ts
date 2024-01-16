import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LineElement } from 'chart.js/dist';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { AdminWorkapceService } from 'src/app/core/services/admin-workspace/admin-workapce.service';
import { CommonRoutes } from 'src/global.routes';

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
    label:'MANAGE_SESSION'
  };
  receivedEventData:any;
  constructor(private adminWorkapceService: AdminWorkapceService, private router: Router,) { }
  headingText="SESSION_LIST"
  download = "DOWNLOAD";
  page = 1;
  limit = 5;
  searchText: string = '';
  type = "";
  totalCount:any;
  sortingData :any;
  columnData = [
    {name:'index_number',displayName:'No.',type:'text'},
    {name:'title', displayName:'Session name',type:'text',sortingData:[{sort_by:'title', order:'ASC', label:'A -> Z'},{sort_by:'title', order:'DESC', label:'Z -> A'}]},
    {name:'type', displayName:'Type',type:'text'},
    {name:'mentor_name',displayName:'Mentor',type:'text'},
    {name:'start_date',displayName:'Date',  type:'text',sortingData:[{sort_by:'start_date', order:'DESC', label:'Latest'},{sort_by:'start_date', order:'ASC', label:'Oldest'}]},
    {name:'start_time', displayName:'Time', type:'text'},
    {name:'duration_in_minutes',displayName:'Duration(min)', type:'text'},
    {name:'mentee_count', displayName:'Mentee count',type:'text'},
    {name:'status',displayName:'Status', type:'text',},
    {name:'action', displayName:'Actions',type:'button'}
]
tableData:any;
dummyTableData:any= false;

actionButtons={
  'ACTIVE':['view'],
  'PUBLISHED':['view','edit', 'delete'],
  'COMPLETED':['view']
}
  async ngOnInit() {
    this.fetchSessionList()
  }

  async ionViewWillEnter() {
    this.fetchSessionList()
  }

  onCLickEvent(data: any) {
    this.receivedEventData = data;
    if(this.receivedEventData?.column?.name == 'mentor_name'){
       this.router.navigate([CommonRoutes.MENTOR_DETAILS,this.receivedEventData.element.mentor_id]);
    }else if(this.receivedEventData == 'DOWNLOAD'){
    }else if(this.receivedEventData?.columnName == 'view'){
      this.router.navigate([CommonRoutes.SESSIONS_DETAILS,this.receivedEventData.element.id]);
    }else{
      this.router.navigate([CommonRoutes.SESSIONS_DETAILS,this.receivedEventData.element.id]);
    }
  }

  onPaginatorChange(data:any) {
    this.page = data.page;
    this.limit = data.pageSize 
    this.fetchSessionList()
  }

  onSorting(data:any){
   this.sortingData = data;
      this.fetchSessionList()
  }

  async fetchSessionList() { 
    var obj = { page: this.page, limit: this.limit, status: this.type, order:this.sortingData?.order, sort_by:this.sortingData?.sort_by , searchText: this.searchText };
    var response = await this.adminWorkapceService.createdSessinBySessionManager(obj);
    this.totalCount = response.count;
    
    let data  = response.data
    if(data.length>0){
      data.forEach((ele) => {
        ele.action = this.actionButtons[ele?.status?.value]
        ele.status = ele?.status?.label;
        ele.type = ele?.type?.label;
      });
    }
    this.tableData = data;
  }
}
