import { Component, Input, OnInit } from '@angular/core';
import { SKELETON } from 'src/app/core/constants/skeleton.constant';

@Component({
    selector: 'app-skeleton',
    templateUrl: './skeleton.component.html',
    styleUrls: ['./skeleton.component.scss'],
    standalone: false
})
export class SkeletonComponent implements OnInit {
@Input() type:any;
@Input() repetition:any;
SKELETON= SKELETON;
repetitionArray;
  constructor() {}
  ngOnInit() {
    this.repetitionArray=new Array(this.repetition);
  }
}
