import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-mentor-details',
  templateUrl: './mentor-details.page.html',
  styleUrls: ['./mentor-details.page.scss'],
})
export class MentorDetailsPage implements OnInit {

  public headerConfig: any = {
    headerColor: 'white',
    backButton: true,
    label: "MENTORS_PROFILE",
  };
  profileImageData:any = {
    name: 'Mentor Name',
    region: 'COnsultant, Karnataka',
    profile_image:'https://www.whatsappprofiledpimages.com/wp-content/uploads/2021/08/Profile-Photo-Wallpaper.jpg'
  }

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
        key: 'keyAreasOfExpertise',
      },
      {
        title: "Languages",
        key: "medium"
      }
    ],
    data: {
      about: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      yearsOfExperience: 6,
      keyAreasOfExpertise: [
        {
          "value": "educationLeadership",
          "label": "Education Leadership"
        },
        {
          "value": "personalDevelopment",
          "label": "Personal Development"
        },
        {
          "value": "schoolProcesses",
          "label": "School Processes"
        },
      ],
      medium: [
        {
          "value": "English",
          "label": "English"
        },
        {
          "value": "Hindi",
          "label": "Hindi"
        },
      ],
      duration: "",
      date: "",
    },
  };
  constructor() { }

  ngOnInit() {
  }

  action(event){}
}
