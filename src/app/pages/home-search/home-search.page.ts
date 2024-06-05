import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, LoaderService, LocalStorageService, ToastService } from 'src/app/core/services';
import { AdminWorkapceService } from 'src/app/core/services/admin-workspace/admin-workapce.service';
import { SessionService } from 'src/app/core/services/session/session.service';
import { FilterPopupComponent } from 'src/app/shared/components/filter-popup/filter-popup.component';
import { CommonRoutes } from 'src/global.routes';
import { MatPaginator } from '@angular/material/paginator';
import { paginatorConstants } from 'src/app/core/constants/paginatorConstants';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-home-search',
  templateUrl: './home-search.page.html',
  styleUrls: ['./home-search.page.scss'],
})
export class HomeSearchPage implements OnInit {

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  pageSize = paginatorConstants.defaultPageSize;
  pageSizeOptions = paginatorConstants.pageSizeOptions;

  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    // label:'MENU'
  };
  noResults : boolean =  false;
  searchText:string="";
  results=[];
  type:any;
  searching=true;
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
  page = 1;
  setPaginatorToFirstpage:any = false;
  limit = 5;
  sortingData: any;
  totalCount: any;
  actionButtons = {
    'UPCOMING': [{ icon: 'eye', cssColor: 'white-color' , action:'VIEW'}, { icon: 'create', cssColor: 'white-color' ,action:'EDIT'}, { icon: 'trash', cssColor: 'white-color',action:'DELETE' }],
    'LIVE': [{ icon: 'eye', cssColor: 'white-color' ,action:'VIEW'}, { icon: 'create', cssColor: 'white-color' ,action:'EDIT'}],
    'COMPLETED': [{ icon: 'eye', cssColor: 'white-color' ,action:'VIEW'}]
  };
  tableData: any;
  dummyTableData: any = false;
  noDataMessage: any;
  createdSessions: any;
  user: any;
  sessions: any;
  sessionsCount = 0;
  criteriaChip: string;

  constructor(private modalCtrl: ModalController, private adminWorkapceService: AdminWorkapceService,private httpService: HttpService, private router: Router, private toast: ToastService,
    private sessionService: SessionService,
    private localStorage: LocalStorageService,
    private profileService: ProfileService,
    private location: Location,
    private activatedRoute: ActivatedRoute
  ) { 
    this.activatedRoute.queryParamMap.subscribe(async (params) => {
      this.criteriaChip = params.get('chip');
    })
  }

  async ngOnInit() {
    this.type='all-sessions';
    var obj = { page: this.page, limit: this.limit, searchText: "" };
    this.user = this.localStorage.getLocalData(localKeys.USER_DETAILS)
    var response = await this.sessionService.getSessionsList(obj);
    this.results = response?.result?.data;
    this.fetchSessionList();
  }

 chips =[]

  handleInput(event) {
    console.log('event :',event);
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
      this.fetchSessionList()
    });
    modal.present()
  }

  async fetchSessionList() {
    // var obj = { page: this.page, limit: this.limit, status: this.type, order: this.sortingData?.order, sort_by: this.sortingData?.sort_by, searchText: this.searchText, filteredData:this.filteredDatas };
    var obj={page: this.page, limit: this.limit, type: this.type, searchText : this.searchText}
    var response = await this.sessionService.getSessionsList(obj);
    this.totalCount = response.result.count;
    let data = response.result.data
    if (data && data.length) {
      data.forEach((ele) => {
        let currentTimeInSeconds=Math.floor(Date.now()/1000);
        let setButton = (ele?.status?.value == 'PUBLISHED' && ele.end_date > currentTimeInSeconds) ? 'UPCOMING' :(ele?.status?.value == 'LIVE' && ele.end_date > currentTimeInSeconds) ? 'LIVE' : 'COMPLETED';
        let date = ele.start_date;
        ele.start_date = moment.unix(date).format('DD-MMM-YYYY')
        ele.start_time = moment.unix(date).format('h:mm A')
        ele.action = this.actionButtons[setButton]
        ele.status = ele?.status?.label;
        ele.type = ele?.type?.label;
        ele.duration_in_minutes =Math.round(ele?.duration_in_minutes) 
      });
    }
    this.tableData = data;
    this.noDataMessage = this.searchText ? "SEARCH_RESULT_NOT_FOUND" : "THIS_SPACE_LOOKS_EMPTY"
  }

  onPageChange(event){
    this.page = event.pageIndex + 1,
    this.pageSize = this.paginator.pageSize;
  }

  async eventAction(event) {
    if (this.user.about) {
      switch (event.type) {
        case 'cardSelect':
          this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${event.data.id}`]);
          break;

        case 'joinAction':
          await this.sessionService.joinSession(event.data)
          this.getSessions();
          break;

        case 'enrollAction':
          let enrollResult = await this.sessionService.enrollSession(event.data.id);
          if (enrollResult.result) {
            this.toast.showToast(enrollResult.message, "success")
            this.getSessions();
          }
          break;

        case 'startAction':
          this.sessionService.startSession(event.data.id).then(async () => {
            var obj = { page: this.page, limit: this.limit, searchText: "" };
            if(this.profileService.isMentor){
              this.createdSessions = await this.sessionService.getAllSessionsAPI(obj);
            }
          })
          break;
      }
    } else {
      this.profileService.upDateProfilePopup()
    }
  }

  async getSessions() {
    const config = {
      url: urlConstants.API_URLS.HOME_SESSION + this.page + '&limit=' + this.limit,
    };
    try {
      let data: any = await this.httpService.get(config);
      this.sessions = data.result;
      console.log(this.sessions.all_sessions)
      this.sessionsCount = data.result.count;
    }
    catch (error) {
    }
  }

  locationBack(){
    this.location.back()
  }

  extractLabels(data) {
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
  
}
