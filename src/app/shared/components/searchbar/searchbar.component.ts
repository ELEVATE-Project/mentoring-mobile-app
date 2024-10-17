import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToastService, UtilService } from 'src/app/core/services';

@Component({
  selector: 'app-searchbar',
  templateUrl: './searchbar.component.html',
  styleUrls: ['./searchbar.component.scss'],
})
export class SearchbarComponent implements OnInit {
  @Input() receivedData: any;
  @Input() data: any;
  @Input() overlayChip: any;
  @Output() outputData = new EventEmitter();
  @Input() valueFromParent: string;
  isOpen = false;
  criteriaChipSubscription: any;
  criteriaChip: any;
  showSelectedCriteria: any;
  searchText: any;
  selectedChipLabel: any;

  constructor(
    private utilService: UtilService,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.criteriaChipSubscription = this.utilService.currentCriteriaChip.subscribe(selectedCriteria => {
      this.criteriaChip = selectedCriteria ? JSON.parse(selectedCriteria) : "";
    });
    this.showSelectedCriteria = this.criteriaChip? this.criteriaChip : "";
  }
  ngOnChanges(){
    this.criteriaChip = this.valueFromParent;
  }
  selectChip(chip) {
    if (this.criteriaChip === chip) {
      this.criteriaChip = null;
    } else {
      this.criteriaChip = chip;
    }
  }

  async onSearch(event){
    if (event.length >= 3) {
      this.searchText = event ? event : "";
      this.showSelectedCriteria = this.criteriaChip;
      const emitData = {
        searchText: this.searchText.trim(),
        criterias: this.showSelectedCriteria
      }
      this.outputData.emit(emitData);
    } else {
      this.toast.showToast("ENTER_MIN_CHARACTER","danger");
    }
    this.isOpen = false;
  }
}
