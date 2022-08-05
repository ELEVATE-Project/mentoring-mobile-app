import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, LoaderService, ToastService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-home-search',
  templateUrl: './home-search.page.html',
  styleUrls: ['./home-search.page.scss'],
})
export class HomeSearchPage implements OnInit {
  public headerConfig: any = {
    backButton: true,
    label: "SEARCH",
  };
  noResults : boolean =  false;
  searchText:string="";
  results=[];
  type:any;
  searching=true;
  constructor(private sessionService:SessionService, private loaderService: LoaderService,private httpService: HttpService, private router: Router, private toast: ToastService) { }

  ngOnInit() {
    this.type='all-sessions';
  }
  async getMentorList() {
    const config = {
      url: urlConstants.API_URLS.MENTORS_DIRECTORY+'&search=' + this.searchText,
      payload: {}
    };
    try {
      let data: any = await this.httpService.get(config);
      this.results = data?.result?.data;
      this.noResults = (this.results.length)?false:true;
      this.searching = false;
    }
    catch (error) {
    }
  }

  async getSessionsList() {
    let obj={
      page: "",
      limit: "",
      type: "",
      searchText : this.searchText,
    }
    let data = await this.sessionService.getSessionsList(obj);
    this.results = data?.result[0]?.data;
    this.noResults = (this.results.length)?false:true;
    this.searching = false;
  }

  checkInput(){
    this.searchText=this.searchText.replace(/^ +/gm, '')
  }

  search(){
    if(this.searchText!=""){
      switch(this.type) {
        case 'all-sessions':
          this.getSessionsList();
          break;
        case 'mentor-profile':
          this.getMentorList();
          break;
      }
    } else {
      this.toast.showToast("Please provide a valid text for search","danger")
    }
  }

  segmentChanged(event){
    this.results=[]
    this.type = event.target.value;
    if(this.searchText !== "")
    this.search();
  }

  onSessionAction(event){
    this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${event.data._id}`])
  }

  eventAction(event){
    this.router.navigate([CommonRoutes.MENTOR_DETAILS,event.data._id]);
  }

}
