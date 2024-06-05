import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonInfiniteScroll, ModalController } from '@ionic/angular';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import {
  HttpService,
  LoaderService,
  ToastService
} from 'src/app/core/services';
import { FilterPopupComponent } from 'src/app/shared/components/filter-popup/filter-popup.component';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-mentor-directory',
  templateUrl: './mentor-directory.page.html',
  styleUrls: ['./mentor-directory.page.scss'],
})
export class MentorDirectoryPage implements OnInit {
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(IonContent) infinitescroll: IonInfiniteScroll;

  page = 1; //todo: Enable pagenation
  limit = 50;
  searchText: string = '';
  public headerConfig: any = {
    menu: true,
    // label: 'MENTORS_DIRECTORY',
    headerColor: 'primary',
    notification: false,
  };

  mentors = [];
  mentorsCount;
  isLoaded: boolean = false;
  filterData =
    [
      {
        "title": "Categories",
        "name": "categories",
        "options": [
          {
            "label": "Communication",
            "value": "communication"
          },
          {
            "label": "Educational leadership",
            "value": "educational_leadership"
          },
          {
            "label": "Professional development",
            "value": "professional_development"
          }
        ],
        "type": "checkbox"
      },
      {
        "title": "Recommended For",
        "name": "recommended_for",
        "options": [
          {
            "label": "Block education officer",
            "value": "beo"
          },
          {
            "label": "Cluster officials",
            "value": "co"
          },
          {
            "label": "District education officer",
            "value": "deo"
          },
          {
            "label": "Head master",
            "value": "hm"
          },
          {
            "label": "Teacher",
            "value": "te"
          }
        ],
        "type": "checkbox"
      },
      {
        "title": "Medium",
        "name": "medium",
        "options": [
          {
            "label": "English",
            "value": "en_in"
          },
          {
            "label": "Hindi",
            "value": "hi"
          }
        ],
        "type": "checkbox"
      },
      {
        "title": "Type",
        "name": "type",
        "options": [
          {
            "label": "Public",
            "value": "PUBLIC"
          },
          {
            "label": "Private",
            "value": "PRIVATE"
          }
        ],
        "type": "checkbox"
      }
    ]
  filteredDatas = []
  chips =[]
  setPaginatorToFirstpage: boolean;
  criteriaData = []
  isOpen = false;
  selectedChipIndex: any;
  overlayChips= ['Session title', 'Session discription', 'Session discription for', 'chip 4', 'Session title', 'Session discription', 'Session discription for',]

  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private httpService: HttpService,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
  ) {
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe((queryParams) => {
      this.searchText = queryParams.get('search');
      this.searchText = this.searchText === null ? '' : this.searchText;
    });
  }

  ionViewWillEnter() {
    this.page = 1;
    this.mentors = [];
    this.searchText = '';
    this.getMentors();
    this.gotToTop();
  }

  gotToTop() {
    this.content.scrollToTop(1000);
  }

  async getMentors(showLoader = true) {
    showLoader ? await this.loaderService.startLoader() : '';
    const config = {
      url: urlConstants.API_URLS.MENTORS_DIRECTORY_LIST + this.page + '&limit=' + this.limit + '&search=' + btoa(this.searchText) + '&directory=true',
      payload: {}
    };
    try {
      let data: any = await this.httpService.get(config);
      this.isLoaded = true
      showLoader ? await this.loaderService.stopLoader() : '';
      if (this.mentors.length && this.mentors[this.mentors.length - 1].key == data.result.data[0]?.key) {
        this.mentors[this.mentors.length - 1].values = this.mentors[this.mentors.length - 1].values.concat(data.result.data[0].values)
        data.result.data.shift();
        this.mentors = this.mentors.concat(data.result.data);

      } else {
        this.mentors = this.mentors.concat(data.result.data);
      }
      this.infinitescroll.disabled = this.mentorsCount == 0 ? true : false;
      this.mentorsCount = data.result.count;
    }
    catch (error) {
      this.isLoaded = true
      showLoader ? await this.loaderService.stopLoader() : '';
    }
  }
  eventAction(event){
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([CommonRoutes.MENTOR_DETAILS, event?.data?.id]);
        break;
    }
  }
  async loadMore(event) {
    this.page = this.page + 1;
    await this.getMentors(false);
    event.target.complete();
  }
  onSearch(){
    this.isLoaded = false;
    this.page = 1;
    if (this.searchText) {
      this.router.navigate([CommonRoutes.TABS + '/' + CommonRoutes.MENTOR_DIRECTORY], { queryParams: { search: this.searchText } });
     } 
    this.getMentors();
    this.mentors = [];
  }

  async onClickFilter() {
    let modal = await this.modalCtrl.create({
      component: FilterPopupComponent,
      cssClass: 'filter-modal',
      componentProps: { filterData: this.filterData }
    });

    modal.onDidDismiss().then(async (dataReturned) => {
      this.filteredDatas = []
      if (dataReturned !== null) {
        if (dataReturned.data.data.selectedFilters) {
          for (let key in dataReturned.data.data.selectedFilters) {
            this.filteredDatas[key] = dataReturned.data.data.selectedFilters[key].slice(0, dataReturned.data.data.selectedFilters[key].length).map(obj => obj.value).join(',').toString()
          }
        }
        this.extractLabels(dataReturned.data.data.selectedFilters);
      }
      this.page = 1;
      this.setPaginatorToFirstpage = true
      // this.fetchSessionList()
    });
    modal.present()
  }

  extractLabels(data) {
    console.log(data)
    this.chips = [];
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        data[key].forEach((item: any) => {
          this.chips.push(item.label);
        });
      }
    }
  }
  
  removeChip(index: number) {
    this.chips.splice(index, 1);
  }

  selectChip(chip : string) {
    console.log( chip)
    this.selectedChipIndex = chip;
  }
}
