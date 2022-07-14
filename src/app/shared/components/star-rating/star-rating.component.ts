import { Component, Input, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import * as _ from 'lodash-es';

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: StarRatingComponent,
    },
  ],
})
export class StarRatingComponent implements OnInit, ControlValueAccessor {
  @Input() rate=0;
  @Input() numberOfStars: any;
  @Input() label: any;
  @Input() isDisabled=false;
  range: any;
  rating: Set<unknown>;
  touched: boolean = false;

  constructor() { }

  ngOnInit() {
    this.range = [];
    _.range(0, this.numberOfStars).forEach((range) => {
      this.range.push(range);
    });
  }

  onChange = (quantity) => { };

  onTouched = () => { };

  writeValue(quantity: number) {
    this.rate = quantity;
  }

  registerOnChange(onChange: any): void {
    this.onChange = onChange;
  }
  registerOnTouched(onTouched: any): void {
    this.onTouched = onTouched;
  }


  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
  
  onRate(rate) {
      this.rate = rate;
      this.onChange(this.rate);
  }

}
