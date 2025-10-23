import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import {
  HttpService,
  LoaderService
} from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-mentor-directory',
  templateUrl: './mentor-directory.page.html',
  styleUrls: ['./mentor-directory.page.scss'],
})
export class MentorDirectoryPage implements OnInit {
  @ViewChild(IonContent) content: IonContent

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
  filterData : any;
  filteredDatas = []
  chips =[]
  setPaginatorToFirstpage: boolean;
  criteriaData = []
  isOpen = false;
  selectedChipLabel: any;
  overlayChips = [];
  selectedChipName: any;
  urlFilterData: string;
  directory: boolean = true;
  selectedChips: boolean = false;
  data: any;
  isInfiniteScrollDisabled: boolean = false;

  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private httpService: HttpService
  ) {
  }

  ngOnInit() {}

  async ionViewWillEnter() {
    this.isLoaded = false;
    this.page = 1;
    this.mentors = [];
    this.getMentors();
    this.isInfiniteScrollDisabled = false;
    this.gotToTop();
  }

  gotToTop() {
    this.content.scrollToTop(1000);
  }

 
   async getMentors(showLoader = true ,isLoadMore: boolean =false) {
    showLoader ? await this.loaderService.startLoader() : '';
  const config = {
      url: urlConstants.API_URLS.MENTORS_DIRECTORY_LIST + this.page + '&limit=' + this.limit + '&search=' + btoa(this.searchText) + '&directory=' + this.directory + '&search_on=' + (this.selectedChipName? this.selectedChipName : '') + '&' + (this.urlFilterData ? this.urlFilterData: ''),
      payload: {}
    };
    try {
      let data: any = await this.httpService.get(config);
      this.data = data.result.data;
      this.isLoaded = true;
      showLoader ? await this.loaderService.stopLoader() : '';
      if (isLoadMore) {
        this.mentors = [...this.mentors, ...data.result.data];
      } else {
        this.mentors = data.result.data;
      }
      let totalValues = this.mentors.reduce((acc, mentor) => acc + (mentor.values?.length || 0), 0);
      this.isInfiniteScrollDisabled = (totalValues >= this.mentorsCount) ;


    } catch (error) {
      this.isLoaded = true;
      this.isInfiniteScrollDisabled = true; 
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
    if (this.data && !this.isInfiniteScrollDisabled) {
      this.page = this.page + 1;
      await this.getMentors(false, true);
    }
    event.target.complete();
  }
  onSearch(){
    this.router.navigate(['/' + CommonRoutes.MENTOR_SEARCH_DIRECTORY], { queryParams: { search: this.searchText} });
  }
  
}
