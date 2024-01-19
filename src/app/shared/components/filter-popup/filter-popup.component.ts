import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-filter-popup',
  templateUrl: './filter-popup.component.html',
  styleUrls: ['./filter-popup.component.scss'],
})
export class FilterPopupComponent implements OnInit {
  @Input() filterData: any;
  selectedFilters:any;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {}
  
  filtersChanged(data:any){
      this.selectedFilters = data;
  }
  closePopup(){
    this.modalCtrl.dismiss({});
  }

  onClickApply(){
    const dataToSendBack = {
      selectedFilters: this.selectedFilters
    };
    this.modalCtrl.dismiss({
      data: dataToSendBack
    });
  }
}
