import {  Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-chips-and-filter',
  templateUrl: './chips-and-filter.component.html',
  styleUrls: ['./chips-and-filter.component.scss'],
})
export class ChipsAndFilterComponent implements OnInit {
  @Input() searchAndCriteriaData: any;
  @Output() filterClick = new EventEmitter();
  @Output() removeFilterChip = new EventEmitter();
  @Input() selectedFilters:  any;
  @Output() sendChildValue = new EventEmitter();
  @Input() isFilterEnable: any;

  constructor(private router: Router) { }
 
  ngOnInit() { 
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.resetSearch();
      });
  }

  closeCriteriaChip(){
    this.sendChildValue.emit('');
    this.searchAndCriteriaData = '';
  }

  removeChip(chipValue,index){
    let data = {
      chipValue: chipValue,
      index: index
    }
    this.removeFilterChip.emit(data)

  }

  async onClickFilter() {
    this.filterClick.emit()
  }

  private resetSearch() {
    this.searchAndCriteriaData = '';
  }

}
