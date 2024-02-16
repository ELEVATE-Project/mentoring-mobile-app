import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-filter-tree',
  templateUrl: './filter-tree.component.html',
  styleUrls: ['./filter-tree.component.scss'],
})
export class FilterTreeComponent implements OnInit {
  @Input() enableFilterHeader:any
  @Input() filterData: any;
  @Output() filtersChanged = new EventEmitter<any>();

  ogArrObj: any;

  constructor() { }

  ngOnInit() {
    this.ogArrObj = _.cloneDeep(this.filterData);
  }


  clearAll() {
    this.filterData = _.cloneDeep(this.ogArrObj)
    this.filtersChanged.emit([])
  }

  onFilterChange() {
    const selectedOptionsByCategory = {};
    this.filterData.forEach(category => {
      const selectedOptions = category.options.filter(option => option.selected);
      if (selectedOptions.length > 0) {
        const optionsWithCategory = selectedOptions.map(option => ({ ...option, categoryName: category.name }));
        selectedOptionsByCategory[category.name] = selectedOptionsByCategory[category.name] || [];
        selectedOptionsByCategory[category.name].push(...optionsWithCategory);
      }
    });
    this.filtersChanged.emit(selectedOptionsByCategory);
  }

}

