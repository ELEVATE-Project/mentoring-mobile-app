import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash-es';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
})
export class StarRatingComponent implements OnInit {
  rate=0;
  @Input() numberOfStars: any;
  @Output() starRating = new EventEmitter();
  range: any;
  constructor() { }

  ngOnInit() {
    this.range = [];
    _.range(0, this.numberOfStars).forEach((range) => {
      this.range.push(range);
    });
  }

  onRate(rate) {
    this.rate = rate;
    this.starRating.emit(this.rate);
  }

}
