import { Component, OnInit, Input } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
    selector: 'app-popover-menu',
    templateUrl: './popover-menu.component.html',
    styleUrls: ['./popover-menu.component.scss'],
    standalone: false
})
export class PopoverMenuComponent implements OnInit {
   @Input() actions: string[] = [];

  constructor(private popoverCtrl :PopoverController) {}

  ngOnInit() {}
 
  onSelect(action: string) {
    this.popoverCtrl.dismiss(action); 
  }
}
