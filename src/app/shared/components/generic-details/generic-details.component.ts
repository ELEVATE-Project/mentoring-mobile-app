import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-generic-details',
  templateUrl: './generic-details.component.html',
  styleUrls: ['./generic-details.component.scss'],
})
export class GenericDetailsComponent implements OnInit {
  @Input() sessionData: any;

  constructor() { }
  public isArray(arr:any ) {
    return Array.isArray(arr)
 }

  ngOnInit() {}

}
