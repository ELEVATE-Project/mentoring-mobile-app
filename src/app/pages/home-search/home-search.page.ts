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
      url: urlConstants.API_URLS.MENTORS_DIRECTORY_LIST+'&search=' + btoa(this.searchText)+ '&directory=true',
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
    this.results = data?.result?.data;
    this.noResults = (this.results.length)?false:true;
    this.searching = false;
  }

  checkInput(event: any){
    if(event.keyCode == 13){
      this.search();
    }
  }
  cancelSearch(event: any){
    this.searching = true
    this.results = []
  }
  trimLeft(inputString: string): string {
    return this.searchText = inputString.replace(/^\s+/, '');
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

  async onSessionAction(event){
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${event.data.id}`])
        break;

      case 'joinAction':
        this.sessionService.joinSession(event.data)
        this.search();
        break;

      case 'enrollAction':
        console.log("enrolled")
        let enrollResult = await this.sessionService.enrollSession(event.data.id);
        if(enrollResult.result){
          this.toast.showToast(enrollResult.message, "success")
          this.search();
        }
        break;

      case 'startAction':
        this.sessionService.startSession(event.data._id);
        this.search();
        break;
    }
  }

  eventAction(event){
    console.log(event)
    this.router.navigate([`/${CommonRoutes.MENTOR_DETAILS}/${event.data.id}`])
  }

}
