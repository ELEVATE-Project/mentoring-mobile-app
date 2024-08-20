import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-filter-tree',
  templateUrl: './filter-tree.component.html',
  styleUrls: ['./filter-tree.component.scss'],
})
export class FilterTreeComponent implements OnInit {
  @Input() enableFilterHeader:any;
  @Input() enableFilterLabel: any;
  @Input() filterData: any;
  @Output() filtersChanged = new EventEmitter<any>();


  constructor() { }

  ngOnInit() { }


  clearAll() {
    if (this.filterData) {
      this.filterData.forEach(filter => 
        filter.options = filter.options.map(option => ({ ...option, selected: false }))
      );
    }
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

