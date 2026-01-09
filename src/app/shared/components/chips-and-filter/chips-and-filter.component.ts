import {  Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
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
  @Output() onSelectAllChange =new EventEmitter<boolean>();
  @Output() onSelectAllXChange =new EventEmitter<boolean>()
  @Input() isFilterEnable: any;
  @Input () selectedCount
  @Input() totalCount
  @Input() tableData;
  @Input() maxCount
  @Input() showSelectAll
    
  selectAllXActive : boolean;
  disableCheckbox : boolean;

  constructor(private router: Router) { }
 
  ngOnInit() { 
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.resetSearch();
      });
  }  
  
  ngOnChanges(changes: SimpleChanges) {
     if(this.selectedCount === this.totalCount || this.selectedCount == this.maxCount){
      this.selectAllXActive = true;
    } 
    else{
      this.selectAllXActive = false;
    }
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
  
  onSelectAllChangeClick(event: any){
    this.onSelectAllChange.emit(event.detail.checked)
  }

    isAllSelected(): boolean {
  if (!this.tableData || this.tableData.length === 0) {
    return false;
  }
  
  for (const item of this.tableData) {
    
    if (item.enrolled_type === 'ENROLLED') {
      continue;
    }
    
    const hasRemoveAction = item.action?.some(a => a.action === 'REMOVE') ?? false;
    if (!hasRemoveAction) {
      return false;
    } 
    if(this.selectedCount == this.maxCount){
      return true;
    }
  }
  return true;
}

 onToggleSelectAllX(){
    this.selectAllXActive = !this.selectAllXActive
    this.onSelectAllXChange.emit(this.selectAllXActive)
  }
}
