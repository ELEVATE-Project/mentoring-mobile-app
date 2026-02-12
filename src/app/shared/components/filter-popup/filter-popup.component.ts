import { Component, Input, OnInit} from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-filter-popup',
    templateUrl: './filter-popup.component.html',
    styleUrls: ['./filter-popup.component.scss'],
    standalone: false
})
export class FilterPopupComponent implements OnInit {
  @Input() filterData: any;
  selectedFilters: any;
  initialFilterData: any;


  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    if (this.filterData) {
      this.initialFilterData = JSON.parse(JSON.stringify(this.filterData));
    }
  }
  
  filtersChanged(data: any) {
    this.selectedFilters = data;
  }

  closePopup() {
    this.modalCtrl.dismiss({
      role: 'closed',
      data: this.initialFilterData
    });
  }

  onClickApply() {
    const selectedOptionsByCategory = {};
    this.filterData.forEach(category => {
      const selectedOptions = category.options.filter(option => option.selected);
      if (selectedOptions.length > 0) {
        const optionsWithCategory = selectedOptions.map(option => ({ ...option, categoryName: category.name }));
        selectedOptionsByCategory[category.name] = selectedOptionsByCategory[category.name] || [];
        selectedOptionsByCategory[category.name].push(...optionsWithCategory);
      }
    });
    const dataToSendBack = {
      selectedFilters: (
        this.selectedFilters &&                     
        typeof this.selectedFilters === 'object' && 
        Object.keys(this.selectedFilters).length > 0
      ) ? this.selectedFilters : selectedOptionsByCategory
    };
    this.modalCtrl.dismiss({
      data: dataToSendBack
    });
  }

  ionViewWillLeave() {
    this.selectedFilters = null;
  }
}