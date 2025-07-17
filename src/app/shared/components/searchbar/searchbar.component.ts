import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { ToastService } from 'src/app/core/services';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
})
export class SearchbarComponent implements OnInit {
  searchText: any;
  @Input() parentSearchText: string;
  @Input() data: any;
  @Input() overlayChip: any;
  @Output() outputData = new EventEmitter();
  @Input() valueFromParent: any;

  @Output() clearText = new EventEmitter<string>();
  @Input() placeholder: string;
  isOpen = false;
  criteriaChipSubscription: any;
  criteriaChip: any;
  showSelectedCriteria: any;



  constructor(
    private toast: ToastService,
  ) { }

  ngOnInit() {
    if(this.parentSearchText) 
    this.searchText = this.parentSearchText;
  }
  ngOnChanges(changes: SimpleChanges){
    if(this.parentSearchText && !this.searchText) {
      this.searchText = this.parentSearchText;
    }if (changes['parentSearchText']) {
    this.searchText = changes['parentSearchText'].currentValue;
  } if(changes['valueFromParent'])
    this.criteriaChip = changes['valueFromParent'].currentValue;
  }
  selectChip(chip) {
    if (this.criteriaChip === chip) {
      this.criteriaChip = null;
    } else {
      this.criteriaChip = chip;
    }
  }

   onSearch(){
    if(this.searchText.length === 0) {
      const emitData = {
        searchText: '',
        criterias: this.criteriaChip
      }
      this.outputData.emit(emitData);
      return;
    }
    if (this.searchText.length >= 3) {
      this.searchText = this.searchText ? this.searchText : "";
      const emitData = {
        searchText: this.searchText.trim(),
        criterias: this.criteriaChip
      }
      this.outputData.emit(emitData);
    } else {
      this.toast.showToast("ENTER_MIN_CHARACTER","danger");
    }
    this.isOpen = false;
  }

  onClearSearch() {
    this.isOpen =false;
    this.clearText.emit('')
    this.criteriaChip= undefined;
    }
}
