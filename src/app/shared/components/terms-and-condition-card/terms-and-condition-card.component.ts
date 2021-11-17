import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-terms-and-condition-card',
  templateUrl: './terms-and-condition-card.component.html',
  styleUrls: ['./terms-and-condition-card.component.scss'],
})
export class TermsAndConditionCardComponent implements OnInit {
  @ViewChild("expandWrapper", { read: ElementRef }) expandWrapper: ElementRef;
  @Input("expanded") expanded: boolean;
  @Input("expandHeight") expandHeight: string;
  @Input("item") item: any;

  constructor(public renderer: Renderer2) { }

  ngOnInit() {}
  ngAfterViewInit() {
    this.renderer.setStyle(this.expandWrapper.nativeElement, "max-height", this.expandHeight);
  }

}
