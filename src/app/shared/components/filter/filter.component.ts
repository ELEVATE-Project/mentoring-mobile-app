import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.scss'],
})
export class FilterComponent implements OnInit {

  @Input() filter: any;
  @Input() interface = 'popover';
  @Input() defaultValue;
  @Output() filterChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  compareWith(o1, o2) {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  ionChange(event) {
    this.defaultValue = event.target.value;
    this.filterChange.emit(event);
  }

}
