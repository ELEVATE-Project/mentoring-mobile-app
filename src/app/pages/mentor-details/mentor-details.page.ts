import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService } from 'src/app/core/services';

@Component({
  selector: 'app-mentor-details',
  templateUrl: './mentor-details.page.html',
  styleUrls: ['./mentor-details.page.scss'],
})
export class MentorDetailsPage implements OnInit {
  mentorId;
  public headerConfig: any = {
    headerColor: 'white',
    backButton: true,
    label: "MENTORS_PROFILE",
  };

  detailData = {
    form: [
      {
        title: 'About',
        key: 'about',
      },
      {
        title: 'Years of Experience',
        key: 'yearsOfExperience',
      },
      {
        title: 'Key  Areas of Expertise',
        key: 'areasOfExpertise',
      },
      {
        title: "Languages",
        key: "medium"
      },
      {
        title:"Designation",
        key:"designation"
      }
    ],
    data: {},
  };
  constructor(
    private routerParams : ActivatedRoute,
    private httpService :  HttpService
  ) {
    routerParams.params.subscribe(params =>{
      this.mentorId = params.id;
      this.getMentor();
    })
   }

  ngOnInit() {
  }
  async getMentor(){
    const config = {
      url: urlConstants.API_URLS.PROFILE_DETAILS+'/'+this.mentorId,
      payload: {}
    };
    try {
      let data: any = await this.httpService.get(config);
      this.detailData.data = data.result;
    }
    catch (error) {
    }
  }

  action(e){

  }
}
