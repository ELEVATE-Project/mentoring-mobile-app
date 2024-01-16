import { Component, Input, OnInit, ViewChild, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
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
  @Input() download;
  @Input() totalCount;
  @Output() onClickEvent = new EventEmitter();
  @Output() paginatorChanged = new EventEmitter();
  @Output() onSorting = new EventEmitter();
  
  dataSource: MatTableDataSource<any>;
  displayedColumns:any;
  constructor(public popoverController: PopoverController) { }

  ngOnInit() {
    this.displayedColumns = this.columnData.map(column => column.name);
    this.dataSource = new MatTableDataSource(this.tableData);
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['tableData']) {
      this.dataSource = new MatTableDataSource(this.tableData);
    }
  }

  onCellClick(column: any, columnName: any, element: any) {
    let value = {
      column: column,
      columnName: columnName,
      element: element
    }
    this.onClickEvent.emit(value)
  }

  async onClickSorting(event: any,data: any) {
    this.popoverController.dismiss();
    this.onSorting.emit(data)
  }

  async onClickDownload($event, download) {
    this.onClickEvent.emit(download)
  }

  onPageChange(event: any) {
    let data = {
      page: event.pageIndex + 1,
      pageSize: this.paginator.pageSize
    }
    this.paginatorChanged.emit(data);
  }

}
