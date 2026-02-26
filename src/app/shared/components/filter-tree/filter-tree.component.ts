import { Component, EventEmitter, input, OnInit, Output, signal } from '@angular/core';

@Component({
  selector: 'app-filter-tree',
  templateUrl: './filter-tree.component.html',
  styleUrls: ['./filter-tree.component.scss'],
  standalone: false
})
export class FilterTreeComponent implements OnInit {
  enableFilterHeader = input<any>();
  enableFilterLabel = input<any>();
  filterData = input<any>();
  @Output() filtersChanged = new EventEmitter<any>();
  eventData = input<any>();
  readOnly = signal<boolean>(false);


  constructor() { }

  ngOnInit() {
    if (this.eventData()?.sessionType) {
      this.filterData()?.forEach(filter => {
        if (filter?.name === "type") {
          filter.options.forEach(option => {
            option.selected = false;
            this.onFilterChange();
            option.readOnly = false;
          });
        }
      });
    }
  }

  clearAll() {
    if (this.filterData()) {
      this.filterData().forEach(filter => {
        filter.options = filter.options.map(option => ({ ...option, selected: false }));
      });
    }
    this.onFilterChange();
  }

  onFilterChange() {
    const selectedOptionsByCategory = {};
    this.filterData().forEach(category => {
      const selectedOptions = category?.options.filter(option => option.selected);
      if (selectedOptions?.length > 0) {
        const optionsWithCategory = selectedOptions.map(option => ({ ...option, categoryName: category.name }));
        selectedOptionsByCategory[category.name] = selectedOptionsByCategory[category.name] || [];
        selectedOptionsByCategory[category.name].push(...optionsWithCategory);
      }
    });
    this.filtersChanged.emit(selectedOptionsByCategory);
  }
  isCheckboxDisabled(filter: any, sessionType: string): boolean {
    return false;
  }
}

