import { Component, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {MatTableModule} from '@angular/material/table';
import { PopoverController } from '@ionic/angular';

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
  @Output() onClickEvent = new EventEmitter();
  dataSource: MatTableDataSource<any>;
  displayedColumns:any;
  pageSize = 5
 
  constructor(public popoverController: PopoverController) { }
 

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
    
  this.displayedColumns = this.columnData.map(column => column.name);
    this.dataSource = new MatTableDataSource(this.tableData);
  }

  onCellClick(column:any,element:any){
    let value={
      column: column,
      element: element,
      type:'clickCell'
    }
    this.onClickEvent.emit(value)
  }

  async onClickSorting(event: any, column:any,data:any){
    this.popoverController.dismiss();
  }

  onPageChange(event:any){

  }

}
