import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
})
export class StarRatingComponent implements OnInit {
  rate=0;
  @Output() starRating = new EventEmitter();
  constructor() { }

  ngOnInit() {}

  onRate(rate) {
    this.rate = rate;
    this.starRating.emit(this.rate);
  }

}
