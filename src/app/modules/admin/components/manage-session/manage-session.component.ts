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
  columnData = [
    {name:'no',displayName:'No.', sorting:false,type:'text', sortingData:"dont know as of now"},
    {name:'sessionName', displayName:'Session name',type:'text',sorting:true, sortingData:['A-Z','Z-A']},
    {name:'type', displayName:'Type',sorting:false,type:'text', sortingData:"dont know as of now"},
    {name:'mentor',displayName:'Mentor', sorting:false,type:'text', sortingData:"dont know as of now"},
    {name:'date',displayName:'Date', sorting:true, type:'text',sortingData:"dont know as of now"},
    {name:'time', displayName:'Time',sorting:true, type:'text',sortingData:"dont know as of now"},
    {name:'duration',displayName:'Duration(min)', type:'text',sorting:true, sortingData:"dont know as of now"},
    {name:'menteeCount', displayName:'Mentee count',type:'text',sorting:false, sortingData:"dont know as of now"},
    {name:'status',displayName:'Status', sorting:false, type:'text',sortingData:"dont know as of now"},
    {name:'action', displayName:'Actions',sorting:false, type:'button',sortingData:"dont know as of now"},
]
tableData:any = [
  { "no": 1, 
  "sessionName": 'Micro improvements-1',
   "type": 'private' ,
   "mentor": 'Meno"tr name',
   "date": '12-10-1014',
   "time":'10:30',
   "duration":60,
   "menteeCount":25,
   "status":'live',
  },
  { "no": 2, 
  "sessionName": 'Micro improvements-1',
   "type": 'private' ,
   "mentor": 'Meno"tr name',
   "date": '12-10-1014',
   "time":'10:30',
   "duration":60,
   "menteeCount":25,
   "status":'live',
  },
  { "no": 3, 
  "sessionName": 'Micro improvements-1',
   "type": 'private' ,
   "mentor": 'Meno"tr name',
   "date": '12-10-1014',
   "time":'10:30',
   "duration":60,
   "menteeCount":25,
   "status":'upcoming',
  }, { "no": 4, 
  "sessionName": 'Micro improvements-1',
   "type": 'private' ,
   "mentor": 'Meno"tr name',
   "date": '12-10-1014',
   "time":'10:30',
   "duration":60,
   "menteeCount":25,
   "status":'live',
  },
  { "no": 5, 
  "sessionName": 'Micro improvements-1',
   "type": 'private' ,
   "mentor": 'Meno"tr name',
   "date": '12-10-1014',
   "time":'10:30',
   "duration":60,
   "menteeCount":25,
   "status":'completed',
  },
  { "no": 10, 
  "sessionName": 'Micro improvements-1',
   "type": 'private' ,
   "mentor": 'Meno"tr name',
   "date": '12-10-1014',
   "time":'10:30',
   "duration":60,
   "menteeCount":25,
   "status":'upcoming',
  },
   
  // Add more data as needed
 
];

actionButtons={
  'live':['view'],
  'upcoming':['view','edit', 'delete'],
  'completed':['view']
}
  ngOnInit() {
    
    this.tableData.forEach((ele) => {
      ele.action = this.actionButtons[ele.status]
    });
  }

  handleCustomEvent(data: any) {
    this.receivedEventData = data;
  }
}
