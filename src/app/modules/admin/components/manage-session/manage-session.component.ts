import { Component, OnInit } from '@angular/core';
import { LineElement } from 'chart.js/dist';

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
  constructor() { }
  headingText="SESSION_LIST"
  columnData = [
    {name:'index_number',displayName:'No.',type:'text'},
    {name:'title', displayName:'Session name',type:'text',sorting:true, sortingData:['A -> Z','Z -> A']},
    {name:'type', displayName:'Type',type:'object'},
    {name:'mentor_name',displayName:'Mentor',type:'text'},
    {name:'start_date',displayName:'Date',  type:'text',sorting:true,sortingData:['Latest','Oldest']},
    {name:'start_time', displayName:'Time', type:'text'},
    {name:'duration_in_minutes',displayName:'Duration(min)', type:'text'},
    {name:'mentee_count', displayName:'Mentee count',type:'text'},
    {name:'status',displayName:'Status', type:'object',},
    {name:'action', displayName:'Actions',type:'button'}
]
tableData:any = [
      {
          "id": 6,
          "index_number": 1,
          "title": "Test 1",
          "type": {
              "value": "PUBLIC",
              "label": "Public"
          },
          "mentor_name": "Nevil",
          "start_date": "06-Jan-2024",
          "start_time": "09:51 PM",
          "duration_in_minutes": 60,
          "status": {
              "value": "COMPLETED",
              "label": "Completed"
          },
          "mentee_count": 0,
          "mentor_organization_id": 1
      },
      {
          "id": 9,
          "index_number": 2,
          "title": "Nevil",
          "type": {
              "value": "PUBLIC",
              "label": "Public"
          },
          "mentor_name": "Nevil M",
          "start_date": "05-Dec-2023",
          "start_time": "04:30 PM",
          "duration_in_minutes": 60.2,
          "status": {
              "value": "ACTIVE",
              "label": "Active"
          },
          "mentee_count": 0,
          "mentor_organization_id": 1
      },
      {
          "id": 10,
          "index_number": 3,
          "title": "Introduction to Python",
          "type": {
              "value": "PRIVATE",
              "label": "Private"
          },
          "mentor_name": "Nevil M",
          "start_date": "05-Dec-2023",
          "start_time": "04:30 PM",
          "duration_in_minutes": 60.2,
          "status": {
              "value": "PUBLISHED",
              "label": "Published"
          },
          "mentee_count": 0,
          "mentor_organization_id": 1
      },
      {
          "id": 13,
          "index_number": 4,
          "title": "Introduction to Python",
          "type": {
              "value": "PUBLIC",
              "label": "Public"
          },
          "mentor_name": "Nevil M",
          "start_date": "05-Dec-2023",
          "start_time": "04:30 PM",
          "duration_in_minutes": 60.2,
          "status": {
              "value": "PUBLISHED",
              "label": "Published"
          },
          "mentee_count": 0,
          "mentor_organization_id": 1
      },
      {
          "id": 11,
          "index_number": 5,
          "title": "Introduction to Python",
          "type": {
              "value": "PUBLIC",
              "label": "Public"
          },
          "mentor_name": "Nevil M",
          "start_date": "05-Dec-2023",
          "start_time": "04:30 PM",
          "duration_in_minutes": 60.2,
          "status": {
              "value": "PUBLISHED",
              "label": "Published"
          },
          "mentee_count": 0,
          "mentor_organization_id": 1
      },
      {
          "id": 12,
          "index_number": 6,
          "title": "Introduction to Python",
          "type": {
              "value": "PUBLIC",
              "label": "Public"
          },
          "mentor_name": "Nevil M",
          "start_date": "05-Dec-2023",
          "start_time": "04:30 PM",
          "duration_in_minutes": 60.2,
          "status": {
              "value": "PUBLISHED",
              "label": "Published"
          },
          "mentee_count": 0,
          "mentor_organization_id": 1
      },
      {
          "id": 15,
          "index_number": 7,
          "title": "Introduction to Python",
          "type": {
              "value": "PUBLIC",
              "label": "Public"
          },
          "mentor_name": "Nevil M",
          "start_date": "05-Dec-2023",
          "start_time": "04:30 PM",
          "duration_in_minutes": 60.2,
          "status": {
              "value": "PUBLISHED",
              "label": "Published"
          },
          "mentee_count": 0,
          "mentor_organization_id": 1
      },
      {
          "id": 14,
          "index_number": 8,
          "title": "Introduction to Python",
          "type": {
              "value": "PUBLIC",
              "label": "Public"
          },
          "mentor_name": "Nevil M",
          "start_date": "05-Dec-2023",
          "start_time": "04:30 PM",
          "duration_in_minutes": 60.2,
          "status": {
              "value": "PUBLISHED",
              "label": "Published"
          },
          "mentee_count": 0,
          "mentor_organization_id": 1
      }
  ]

actionButtons={
  'ACTIVE':['view'],
  'PUBLISHED':['view','edit', 'delete'],
  'COMPLETED':['view']
}
  ngOnInit() {
    
    this.tableData.forEach((ele) => {
      ele.action = this.actionButtons[ele.status.value]
    });
  }

  handleCustomEvent(data: any) {
    this.receivedEventData = data;
  }
}
