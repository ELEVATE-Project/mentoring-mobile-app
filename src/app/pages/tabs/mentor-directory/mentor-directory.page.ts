import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import {
  HttpService,
  LoaderService,
  ToastService
} from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-mentor-directory',
  templateUrl: './mentor-directory.page.html',
  styleUrls: ['./mentor-directory.page.scss'],
})
export class MentorDirectoryPage implements OnInit {
  page = 1; //todo: Enable pagenation
  limit = 100;
  searchText: string = '';
  public headerConfig: any = {
    menu: true,
    label: 'MENTORS_DIRECTORY',
    headerColor: 'primary',
    notification: false,
  };

  mentors = [];
  mentorsCount;
  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private httpService: HttpService
  ) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    this.page = 1;
    this.mentors = [];
    this.searchText = '';
    this.getMentors();
  }

  async getMentors() {
    await this.loaderService.startLoader();
    const config = {
      url: urlConstants.API_URLS.MENTORS_DIRECTORY + this.page + '&limit=' + this.limit + '&search=' + this.searchText,
      payload: {}
    };
    try {
      let data: any = await this.httpService.get(config);
      this.loaderService.stopLoader();
      console.log(data.result, "data.result");
      this.mentors = this.mentors.concat(data.result.data);
      this.mentorsCount = data.result.count;
    }
    catch (error) {
      this.loaderService.stopLoader();
    }
  }
  eventAction(event) {
    console.log(event, "event");
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([CommonRoutes.MENTOR_DETAILS,event?.data?._id]);
        break;
    }
  }
  loadMore() {
    this.page = this.page + 1;
    this.getMentors();
  }
  onSearch() {
    this.page = 1;
    this.getMentors();
    this.mentors = [];
  }
}
