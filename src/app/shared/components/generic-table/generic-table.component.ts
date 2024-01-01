import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {MatTableModule} from '@angular/material/table';


@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
})

export class GenericTableComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() columnData;
  @Input() tableData;
  dataSource: MatTableDataSource<any>;
  displayedColumns:any;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  pageSize = this.pageSizeOptions[0];
 
  constructor() { }
 

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
    
    console.log(this.columnData)
  console.log(this.tableData)
  // this.columnData = Object.keys(this.tableData[0]);
  // console.log(this.columnData)
  this.displayedColumns = this.columnData.map(column => column.name);
    this.dataSource = new MatTableDataSource(this.tableData);
  }

  onCellClick(column:any,element:any){
    console.log(column.name)
    console.log(element)

  }

  onClickSorting(column:any){
    console.log(column)
  }

}
