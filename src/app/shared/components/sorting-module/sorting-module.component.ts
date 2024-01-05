import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-sorting-module',
  templateUrl: './sorting-module.component.html',
  styleUrls: ['./sorting-module.component.scss'],
})
export class SortingModuleComponent implements OnInit {
 data:any;
 sortingData:any
 items: string[] = ['Item 1', 'Item 2', 'Item 3'];
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    this.sortingData = this.data.sortingData
  }

}
