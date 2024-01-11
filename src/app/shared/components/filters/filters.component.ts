import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
})
export class FiltersComponent implements OnInit {
  @Input() filterData: any;
  @Output() filtersChanged = new EventEmitter<any[]>();

  ogArrObj: any;

  constructor() { }

  ngOnInit() {
    console.log(this.filterData)
    this.ogArrObj = _.cloneDeep(this.filterData);
  }


  clearAll() {

    // for (const key in this.filtersData.data) {
    //   this.filtersData.data[key].forEach( data => data.isSelected = false )
    // }

    this.filterData = _.cloneDeep(this.ogArrObj)
    this.filtersChanged.emit([])
  }

  onFilterChange(event) {
    console.log(event)
    const selectedOptions = this.filterData.flatMap(category =>
      category.options.filter(option => option.selected === true)
    );
    console.log(this.filterData)
    this.filtersChanged.emit(selectedOptions)
  }
}
