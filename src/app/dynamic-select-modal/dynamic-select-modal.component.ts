import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
    selector: 'app-dynamic-select-modal',
    templateUrl: './dynamic-select-modal.component.html',
    styleUrls: ['./dynamic-select-modal.component.scss'],
    standalone: false
})
export class DynamicSelectModalComponent implements OnInit {
  @Input() items: string[] = [];           
  @Input() selectedItem: string = '';      
  @Input() title: string = 'Select Item';  
  searchTerm: string = '';
  filteredItems: string[] = [];

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.filteredItems = this.items;
  }

  filterItems(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredItems = this.items.filter(item =>
      item.toLowerCase().includes(searchTerm)
    );
  }

  selectItem(item: string) {
    this.modalController.dismiss(item);
  }

  dismiss() {
    this.modalController.dismiss();
  }
}
