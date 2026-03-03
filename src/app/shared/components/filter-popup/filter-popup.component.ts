import { Component, Input, OnInit, signal } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-filter-popup',
  templateUrl: './filter-popup.component.html',
  styleUrls: ['./filter-popup.component.scss'],
  standalone: false
})
export class FilterPopupComponent implements OnInit {
  @Input() filterData: any;
  selectedFilters = signal<any>(null);
  initialFilterData = signal<any>(null);


  constructor(private modalCtrl: ModalController) { }

  ngOnInit() {
    if (this.filterData) {
      this.initialFilterData.set(JSON.parse(JSON.stringify(this.filterData)));
    }
  }

  filtersChanged(data: any) {
    this.selectedFilters.set(data);
  }

  closePopup() {
    this.modalCtrl.dismiss({
      role: 'closed',
      data: this.initialFilterData()
    });
  }

  onClickApply() {
    const selectedOptionsByCategory = {};
    this.filterData?.forEach(category => {
      const selectedOptions = category?.options?.filter(option => option.selected);
      if (selectedOptions?.length > 0) {
        const optionsWithCategory = selectedOptions.map(option => ({ ...option, categoryName: category.name }));
        selectedOptionsByCategory[category.name] = selectedOptionsByCategory[category.name] || [];
        selectedOptionsByCategory[category.name].push(...optionsWithCategory);
      }
    });
    const currentFilters = this.selectedFilters();
    const dataToSendBack = {
      selectedFilters: (
        currentFilters &&
        typeof currentFilters === 'object' &&
        Object.keys(currentFilters).length > 0
      ) ? currentFilters : selectedOptionsByCategory
    };

    this.modalCtrl.dismiss({
      data: dataToSendBack
    });
  }
  ionViewWillLeave() {
    this.selectedFilters.set(null);
  }
}