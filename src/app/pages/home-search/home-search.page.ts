import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-home-search',
  templateUrl: './home-search.page.html',
  styleUrls: ['./home-search.page.scss'],
})
export class HomeSearchPage implements OnInit {
  public headerConfig: any = {
    headerColor: 'white',
    backButton: true,
    label: "SEARCH",
  };
  noResults : boolean =  false;
  searchText:string;
  results;
  constructor() { }

  ngOnInit() {
  }

  search(){
    this.results =
      [{
        _id:1,
        title:'Topic, Mentor name',
        subTitle: 'Short description ipsum dolor sit amet, consectetur',
        description:'Short description ipsum dolor sit amet, consectetur',
        date:'20/11/2021',
        status:'Live',
        image:'shapes-sharp',
        type:'session'
      },
      {
        _id:2,
        title:'Topic, Mentor name',
        subTitle: 'Short description ipsum dolor sit amet, consectetur',
        description:'Short description ipsum dolor sit amet, consectetur',
        date:'20/11/2021',
        image:'shapes-sharp',
        status:'Live',
        type:'session'
      },{
        _id:3,
        title:'Topic, Mentor name',
        subTitle: 'Short description ipsum dolor sit amet, consectetur',
        description:'Short description ipsum dolor sit amet, consectetur',
        date:'20/11/2021',
        image:'shapes-sharp'
      },{
        _id:4,
        title:'Topic, Mentor name',
        subTitle: 'Short description ipsum dolor sit amet, consectetur',
        description:'Short description ipsum dolor sit amet, consectetur',
        date:'20/11/2021',
        image:'shapes-sharp'
      }
    ];

    if(!this.results){
      this.noResults = true;

    }
  }
}
