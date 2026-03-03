import { Component, Input, OnInit, signal } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService } from 'src/app/core/services';

@Component({
    selector: 'app-search-competency',
    templateUrl: './search-competency.component.html',
    styleUrls: ['./search-competency.component.scss'],
    standalone: false
})
export class SearchCompetencyComponent implements OnInit {

  @Input() data: any;
  selectedOptions = signal<any[]>([]);
  searchText: string='';
  page=1;
  limit=10;
  entities = signal<any>(null);
  count = signal<any>(null);
  constructor(private modalController: ModalController, private httpService: HttpService) { }

  async ngOnInit() {
    this.selectedOptions.set(JSON.parse(JSON.stringify(this.data.selectedData)));
    this.entities.set(await this.getEntityList());
  }

  async getEntityList() {
    const config = {
      url: urlConstants.API_URLS.ENTITY_LIST+"entity_type_id="+parseInt(this.data.control.meta.entityId)+'&page='+this.page+'&limit='+this.limit+'&search='+btoa(this.searchText),
      payload: {},
    };
    try {
      const data: any = await this.httpService.post(config);
      this.count.set(data.result.count);
      return data.result
    }
    catch (error) {
      return null;
    }
  }

  onCheckboxChange(event, selectedOption) {
    if (event.detail.checked) {
      this.selectedOptions.update(prev => [...prev, selectedOption]);
    } else {
      this.selectedOptions.update(prev => prev.filter(item => item.value !== selectedOption.value));
    }
  }

  isOptionSelected(option: any): boolean {
    return this.selectedOptions().some(selectedOption => selectedOption.value == option.value);
  }

  async clearAll(){
    this.selectedOptions.update(prev => prev.filter(option => option.type === 'other'));
    this.searchText = '';
    this.page = 1;
    this.entities.set(await this.getEntityList());
  }

  async clearText(){
    this.searchText = '';
    this.page = 1;
    this.entities.set(await this.getEntityList());
  }

  closePopover() {
    this.modalController.dismiss();
  }

  onSave() {
    this.modalController.dismiss(this.selectedOptions());
  }

  async onSearch() {
    this.entities.set(await this.getEntityList());
  }

  async loadMore(event){
    this.page = this.page + 1;
    const currentEntities = this.entities();
    if(this.count() > currentEntities.data.length){
      let newEntities = await this.getEntityList();
      this.entities.set({ ...currentEntities, data: currentEntities.data.concat(newEntities.data) });
      event.target.complete();
    } else {
      event.target.disabled = true;
    }
  }
}
