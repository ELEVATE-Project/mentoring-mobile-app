import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent implements OnInit {
  ogArrObj = {
    data: {
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
    },
    form: [
      {
        title: 'Designation',
        key: 'designation',
      },
      {
        title: 'Organization',
        key: 'organizations',
      }
    ]
  }

  filtersData = _.cloneDeep(this.ogArrObj);

  constructor() { }

  ngOnInit() {
    // let result = this.flat(this.filtersData.data);
  }

  // updateItem() {
  //   if(obj.entity_types) {
  //     updatedObj = [
  //       ...obj.entity_types,
  //      ]
  //     delete obj.entity_types;
  //     updatedObj.push(obj.)
  //   }
  //   return updatedObj
  // }
  
  // flat(data) {
  //   var result = [];
  //   for (const key in data) {
  //     console.log(key, data[key])
  //     let keys = Object.keys(key)
  //   }
  //   data.forEach(function (a) {
  //       result.push(a);
  //       if (Array.isArray(a.children)) {
  //           result = result.concat(this.flat(a.children));
  //       }
  //   });
  //   return result;
  // }


  clearAll() {

    // for (const key in this.filtersData.data) {
    //   this.filtersData.data[key].forEach( data => data.isSelected = false )
    // }

    this.filtersData = _.cloneDeep(this.ogArrObj)
  }
}
