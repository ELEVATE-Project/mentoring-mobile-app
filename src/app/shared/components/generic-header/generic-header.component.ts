import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-generic-header',
  templateUrl: './generic-header.component.html',
  styleUrls: ['./generic-header.component.scss'],
})
export class GenericHeaderComponent implements OnInit {
  @Input() label1:any;
  @Input() label2:any;
  constructor() { }

  ngOnInit() {
  }

}
