import { Component, Input, OnInit, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { PopoverController } from '@ionic/angular';
import { paginatorConstants } from 'src/app/core/constants/paginatorConstants';
import { ToastService } from 'src/app/core/services';

@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
})

export class GenericTableComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() columnData;
  @Input() tableData;
  @Input() headingText;
  @Input() totalCount;
  @Input() noDataMessage;
  @Input() showPaginator
  @Input() setPaginatorToFirstpage
  @Output() onClickEvent = new EventEmitter();
  @Output() paginatorChanged = new EventEmitter();
  @Output() onSorting = new EventEmitter();
  @Output() onSelectAllChange =new EventEmitter<boolean>();
  @Output() onSelectAllXChange =new EventEmitter<boolean>()
  @Input () maxCount;
  @Input () selectedCount
  @Input() disabledCheckboxId: string | null = null;
  @Input () selectedList
  @Input () showSelectAll
  @Input () showCheckbox

  pageSize = paginatorConstants.defaultPageSize;
  pageSizeOptions = paginatorConstants.pageSizeOptions;
  
  dataSource: MatTableDataSource<any>;
  displayedColumns:any;
  constructor(public popoverController: PopoverController,
              private toast: ToastService
  ) { }

  actionButtons = {
     REMOVE: 'REMOVE', 
     ADD: 'ADD'    
            };
selectAllXActive : boolean;

  ngOnInit() {
    this.displayedColumns = ['select', ...this.columnData.map(column => column.name)];
    this.dataSource = new MatTableDataSource(this.tableData);
  }
  ngOnChanges(changes: SimpleChanges) {
    if(this.setPaginatorToFirstpage){
      this.paginator.firstPage();
    }
    if (changes['tableData']) {
      this.dataSource = new MatTableDataSource(this.tableData);
    }
    if(this.selectedCount === this.totalCount || this.selectedCount >= this.maxCount){
      this.selectAllXActive = true;
    } 
    else{
      this.selectAllXActive = false;
    }
  } 
  onCellClick(action: any, columnName?: any, element?: any) {
    let value = {
      action:action,
      columnName: columnName,
      element: element
    }
    this.onClickEvent.emit(value)
  }

  async onClickSorting(event: any,data: any) {
    this.popoverController.dismiss();
    this.onSorting.emit(data)
  }

  onPageChange(event: any) {
    let data = {
      page: event.pageIndex + 1,
      pageSize: this.paginator.pageSize
    }
    this.paginatorChanged.emit(data);
     this.isAllSelected()
  }

  onSelectAllChangeClick(event: any){
    if(event.detail.checked){
    if(this.selectedCount >= this.maxCount){
      
       this.toast.showToast('SESSION_MENTEE_LIMIT', 'danger');
        event.target.checked = false;
    }
  }
     this.onSelectAllChange.emit(event.detail.checked)
     if(!this.isAllSelected()){
      event.target.checked = false;
     }
    this.isAllSelected()
    
  }

    isAllSelected(): boolean {
  if (!this.tableData || this.tableData.length === 0) {
    return false;
  }
  
  for (const item of this.tableData) {
    
    if (item.enrolled_type === 'ENROLLED') {
      continue;
    }
    const hasRemoveAction =
      item.action?.some(a => a.action === 'REMOVE') ?? false;

    if (!hasRemoveAction) {
      return false;
    }
    if( this.tableData.length > this.maxCount  && this.selectedCount == this.maxCount){
      return true;
    }
  }
  return true;
}

 isRowInRemoveState(element: any): boolean {
  return element?.action?.some(a => a.action === 'REMOVE') ?? false;
         
}

onCheckboxAction(row: any, event: any) {
  const isChecked = event.detail.checked;
  if (isChecked && this.selectedCount >= this.maxCount) {
    event.target.checked = false;
    this.toast.showToast('SESSION_MENTEE_LIMIT', 'danger');
    return;
  }
  
  const action = isChecked ? 'ADD' : 'REMOVE';
  this.onCellClick(action, null, row);
  this.isAllSelected();
}

  onToggleSelectAllX(){
    this.selectAllXActive = !this.selectAllXActive
    this.onSelectAllXChange.emit(this.selectAllXActive)
  }

  isCheckboxDisabled(element: any): boolean {
  if (this.disabledCheckboxId === element.id) {
    return true;
  }
  const isSelected = this.selectedList.some(item => item.id === element.id);
  if (isSelected) {
    return false; 
  }
  const selectedCount = this.selectedList.length;
  const maxCountReached = this.maxCount && selectedCount >= this.maxCount;
  if (maxCountReached) {
    return true;
  }
  return false;
}
}
