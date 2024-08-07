import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-no-data-found',
  templateUrl: './no-data-found.component.html',
  styleUrls: ['./no-data-found.component.scss'],
})
export class NoDataFoundComponent implements OnInit {
@Input() messageHeader;
@Input() messageDescription;
@Input() image = '../../../../assets/no-data/sad-face-2691.svg'
  constructor() { }

  ngOnInit() {}

}
