import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { paginatorConstants } from 'src/app/core/constants/paginatorConstants';

@Component({
  selector: 'app-generic-search',
  templateUrl: './generic-search.component.html',
  styleUrls: ['./generic-search.component.scss'],
})
export class GenericSearchComponent implements OnInit {

  @Input() results: any;
  @Input() totalCount: any;
  @Input() searchValue: any;
  @Output() onPageChangeEvent = new EventEmitter();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Output() onClickEvent = new EventEmitter();
  pageSize = paginatorConstants.defaultPageSize;
  pageSizeOptions = paginatorConstants.pageSizeOptions;
  createdSessions: any;
  user: any;
  sessions: any;
  page = 1;
  limit = 5;

  constructor() { }

  async ngOnInit() { }

  async onPageChange(event) {
    this.page = event.pageIndex + 1,
    this.pageSize = this.paginator.pageSize;
    let value = {
      page: this.page,
      pageSize: this.pageSize,
      pageOption: this.pageSizeOptions
    }
    this.onPageChangeEvent.emit(value)
  }
  async eventAction(event) {
    let value = {
      data: event.data,
      type: event.type,
    }
    this.onClickEvent.emit(value);
  }


}
