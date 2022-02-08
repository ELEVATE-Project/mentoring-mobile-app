import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-generic-header',
  templateUrl: './generic-header.component.html',
  styleUrls: ['./generic-header.component.scss'],
})
export class GenericHeaderComponent implements OnInit {
  @Input() labels;
  constructor() { }

  ngOnInit() {
    const match = this.labels.find(element => {
      if (element.includes("MentorED")) {
        let breakPoint = element.indexOf("ED");
        const leftPart = element.substr(0, breakPoint);
        const rightPart = element.substr(breakPoint);
        this.labels[this.labels.indexOf(element)] = leftPart+"<span class='text-green'>"+rightPart+"</span>" 
      }
    });
  }
}
