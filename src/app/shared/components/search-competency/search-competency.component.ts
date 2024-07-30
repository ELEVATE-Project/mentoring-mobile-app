import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService } from 'src/app/core/services';

@Component({
  selector: 'app-search-competency',
  templateUrl: './search-competency.component.html',
  styleUrls: ['./search-competency.component.scss'],
})
export class SearchCompetencyComponent implements OnInit {

  @Input() data: any;
  selectedOptions: any;
  searchText: string='';
  page=1;
  limit=10;
  entities: any;
  count: any;
  constructor(private modalController: ModalController, private httpService: HttpService) { }

  async ngOnInit() {
    this.selectedOptions = JSON.parse(JSON.stringify(this.data.selectedData));
    this.entities = await this.getEntityList()
  }

  async getEntityList() {
    const config = {
      url: urlConstants.API_URLS.ENTITY_LIST+"entity_type_id="+parseInt(this.data.control.meta.entityId)+'&page='+this.page+'&limit='+this.limit+'&search='+btoa(this.searchText),
      payload: {},
    };
    try {
      const data: any = await this.httpService.post(config);
      this.count = data.result.count;
      return data.result
    }
    catch (error) {
      return null;
    }
  }

  onCheckboxChange(event, selectedOption) {
    if (event.detail.checked) {
      this.selectedOptions.push(selectedOption);
    } else {
      this.selectedOptions = this.selectedOptions.filter(item => item.value !== selectedOption.value);
    }
  }

  isOptionSelected(option: any): boolean {
    return this.selectedOptions.some(selectedOption => selectedOption.value == option.value);
  }

  clearAll(){
    this.selectedOptions = [];
  }

  closePopover() {
    this.modalController.dismiss();
  }

  onSave() {
    this.modalController.dismiss(this.selectedOptions);
  }

  async onSearch() {
    this.entities = await this.getEntityList()
  }

  async loadMore(event){
    this.page = this.page + 1;
    if(this.count > this.entities.data.length){
      let newEntities = await this.getEntityList();
      this.entities.data = this.entities.data.concat(newEntities.data)
      event.target.complete();
    } else {
      event.target.disabled = true;
    }
  }
}
