import { Component, Input, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { UtilService } from 'src/app/core/services';

@Component({
  selector: 'app-search-popover',
  templateUrl: './search-popover.component.html',
  styleUrls: ['./search-popover.component.scss'],
})
export class SearchPopoverComponent implements OnInit {
  @Input() control: any;

  columnData = [
    {name:'no',displayName:'No.', sorting:false, sortingData:"dont know as of now"},
    {name:'sessionName', displayName:'Session name',sorting:true, sortingData:"dont know as of now"},
    {name:'type', displayName:'Type',sorting:false, sortingData:"dont know as of now"},
    {name:'mentor',displayName:'Mentor', sorting:false, sortingData:"dont know as of now"},
    {name:'date',displayName:'Date', sorting:true, sortingData:"dont know as of now"},
    {name:'time', displayName:'Time',sorting:true, sortingData:"dont know as of now"},
    {name:'duration',displayName:'Duration(min)', sorting:true, sortingData:"dont know as of now"},
    {name:'menteeCount', displayName:'Mentee count',sorting:false, sortingData:"dont know as of now"},
    {name:'status',displayName:'Status', sorting:false, sortingData:"dont know as of now"},
    {name:'action', displayName:'Actions',sorting:false, sortingData:"dont know as of now"},
]

filterData:any = {
  "organizations": [
      {
          "id": 1,
          "name": "Default",
          "code": "default",
          "description": "Default organization description"
      },
      {
          "id": 15,
          "name": "navadhiti",
          "code": "nav",
          "description": "navadhiti organisation"
      }
  ],
  "entity_types": [
      {
          "designation": [
              {
                  "label": "Designation",
                  "entities": [
                      {
                          "id": 1,
                          "entity_type_id": 1,
                          "value": "hm",
                          "label": "HM",
                          "status": "ACTIVE",
                          "type": "SYSTEM",
                          "created_by": 0,
                          "updated_by": null,
                          "created_at": "2023-12-28T18:55:06.629Z",
                          "updated_at": "2023-12-28T18:55:06.629Z",
                          "deleted_at": null
                      },
                      {
                          "id": 2,
                          "entity_type_id": 1,
                          "value": "deo",
                          "label": "DEO",
                          "status": "ACTIVE",
                          "type": "SYSTEM",
                          "created_by": 0,
                          "updated_by": null,
                          "created_at": "2023-12-28T18:55:06.629Z",
                          "updated_at": "2023-12-28T18:55:06.629Z",
                          "deleted_at": null
                      }
                  ]
              }
          ]
      }
  ]
}



// filterData = {
//   data: {
//     "organizations": [
//       {
//         "id": 1,
//         "name": "Default",
//         "code": "default",
//         "description": "Default organization description"
//       },
//       {
//         "id": 15,
//         "name": "navadhiti",
//         "code": "nav",
//         "description": "navadhiti organisation"
//       }
//     ],
//     "designation": [
//       {
//         "id": 1,
//         "entity_type_id": 1,
//         "value": "hm",
//         "label": "HM",
//         "status": "ACTIVE",
//         "type": "SYSTEM",
//         "created_by": 0,
//         "updated_by": null,
//         "created_at": "2023-12-28T18:55:06.629Z",
//         "updated_at": "2023-12-28T18:55:06.629Z",
//         "deleted_at": null
//       },
//       {
//         "id": 2,
//         "entity_type_id": 1,
//         "value": "deo",
//         "label": "DEO",
//         "status": "ACTIVE",
//         "type": "SYSTEM",
//         "created_by": 0,
//         "updated_by": null,
//         "created_at": "2023-12-28T18:55:06.629Z",
//         "updated_at": "2023-12-28T18:55:06.629Z",
//         "deleted_at": null
//       }
//     ]
//   },
//   form: [
//     {
//       title: 'Designation',
//       key: 'designation',
//     },
//     {
//       title: 'Organization',
//       key: 'organizations',
//     }
//   ]
// }
  tableData: { no: number; sessionName: string; type: string; mentor: string; date: string; time: string; duration: number; menteeCount: number; status: string; action: string; }[];
  constructor(private popoverController: PopoverController, private util: UtilService) { }

  ngOnInit() {
    console.log(this.control)
    this.filterData = this.util.getFormatedFilterData(this.filterData, this.control.meta)
    
    this.tableData = [
      { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      }, { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
       { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
      { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
      { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
      { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
      { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
      { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
      { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
      { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
      { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
      { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
      { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
      { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
      { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
      { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      }, { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
      { "no": 1, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
      { "no": 10, 
      "sessionName": 'Micro improvements-1',
       "type": 'private' ,
       "mentor": 'Meno"tr name',
       "date": '12-10-1014',
       "time":'10:30',
       "duration":60,
       "menteeCount":25,
       "status":'live',
       "action":'live'
      },
       
      // Add more data as needed
     
    ];
  }

  closePopover(event){
    
    this.popoverController.dismiss(this.control.meta.multiSelect?[{name:"afnan", organisation: "tunerlabs"}]:'afnan', this.control.meta.searchType);
  }

  filtersChanged(event){
    // integrate mentor/mentee list api here
    console.log(event)
  }

}
