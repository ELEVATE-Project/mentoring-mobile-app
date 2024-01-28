import { Component, Input, OnInit } from '@angular/core';
import { AdminWorkapceService } from 'src/app/core/services/admin-workspace/admin-workapce.service';
import { SessionService } from 'src/app/core/services/session/session.service';

@Component({
  selector: 'app-mentee-list-popup',
  templateUrl: './mentee-list-popup.component.html',
  styleUrls: ['./mentee-list-popup.component.scss'],
})
export class MenteeListPopupComponent implements OnInit {
  @Input() id;
  headingText = "MENTEE_LIST"
  columnData = [
    { name: 'index_number', displayName: 'No.', type: 'text' },
    { name: 'name', displayName: 'Name', type: 'text' },
    { name: 'designation', displayName: 'Designation', type: 'array' },
    { name: 'organization', displayName: 'Organization', type: 'text' },
    { name: 'email', displayName: 'Email Id', type: 'text'},
    { name: 'type', displayName: 'Enrollment type', type: 'text' },
   
  ]
  download= "DOWNLOAD"
  enrolledMenteeList:any;
  totalCount:any;
  page:any;
  limit:any
 
  constructor(private sessionService: SessionService,private adminWorkapceService: AdminWorkapceService) { }

  ngOnInit() {
    this.fetchMenteeList()
  }

  async ionViewWillEnter() {
    this.fetchMenteeList()
  }
  onClickDownload(){
     this.adminWorkapceService.downloadMenteeList(this.id);
  }

  async fetchMenteeList(){
    let data = await this.sessionService.getEnrolledMenteeList(this.id)
    if (data) {
      data.forEach((ele) => {
        ele.organization = ele?.organization?.label;
      });
    }
    this.enrolledMenteeList = data;
  }

  // onPaginatorChange(data: any) {
  //   this.page = data.page;
  //   this.limit = data.pageSize
  //   this.fetchMenteeList()
  // }

}
