import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
  styleUrls: ['dashboard.page.scss']
})
export class DashboardPage {
  segment: any = 'mentee';
  dataAvailable = true;
  isMentor = false;
  data: any = {
    chart: {
      data: {
        labels: ['Total Session Enrolled', 'Total Session Attended'],
        datasets: [
          {
            data: [61, 39],
            backgroundColor: ['#ffab00', 'blue']
          }
        ]
      }
    }
  };

  constructor( private translate: TranslateService ) { }

  segmentChanged(ev: any) {
    console.log('Segment changed', ev);
    this.segment = ev.detail.value;
  }

  profileImageData: Object = {
    name: 'Username',
    region: "Karnataka",
    profile_image: null,
  }
  detailData = {
    form: [
      {
        title: 'About',
        key: 'about',
      },
      {
        title: 'Designation',
        key: 'designation',
      },
      {
        title: 'Year Of Experience',
        key: 'yearOfExperience',
      },
      {
        title: "key Areas Of Expertise",
        key: "keyAreasOfExpertise"
      },
      {
        title: "Languages",
        key: "languages"
      }
    ],
    data: {
      about: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      designation: '',
      yearOfExperience: '',
      keyAreasOfExpertise: [
        {
          "value": "Mathematics",
          "label": "Mathematics"
        },
        {
          "value": "Computer Science",
          "label": "Computer Science"
        },
      ],
      languages: [
        {
        "value": "English",
           "label": "English"
        },
         {
           "value": "Hindi",
           "label": "Hindi"
         },
       ],
    },
  };
  public headerConfig: any = {
    menu: false,
    notification: false,
    backButton: true,
    label:'DASHBOARD_PAGE',
    headerColor: 'white',
  };
}
