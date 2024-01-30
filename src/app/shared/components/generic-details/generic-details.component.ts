import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-generic-details',
  templateUrl: './generic-details.component.html',
  styleUrls: ['./generic-details.component.scss'],
})
export class GenericDetailsComponent implements OnInit {
  @Input() sessionData: any;
  @Input() isMentor: any;
  @Output() onViewList = new EventEmitter();

  constructor() { }
  public isArray(arr:any ) {
    return Array.isArray(arr)
 }

  ngOnInit() {}

  onClickViewList(){
    this.onViewList.emit()
  }
}
