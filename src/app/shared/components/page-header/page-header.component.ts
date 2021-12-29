import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss'],
})
export class PageHeaderComponent implements OnInit {
  @Input() config: any;
  @Output() actionEvent = new EventEmitter();

  constructor() {}

  ngOnInit() {}

  onAction(event) {
    this.actionEvent.next(event);
  }
}
