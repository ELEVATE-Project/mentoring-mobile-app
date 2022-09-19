import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.page.html',
  styleUrls: ['./faq.page.scss'],
})
export class FaqPage implements OnInit {
  public headerConfig: any = {
    backButton: true,
    label: 'FAQ',
  };
  faqArray = [
    {
      "name": "faq1",
      "label": "How do I sign-up on MentorED?",
      "value": "",
      "class": "ion-no-margin",
      "type": "text",
      "position": "floating",
      "validators": {
        "required": true
      },
      "options": [
        {
          "option1": "Once you install the application, open the MentorED app.",
          "option2": "Click on the 'Sign-up' button.",
          "option3": "Select the role you want to sign up for and enter the basic information. You will receive an OTP on the registered email ID.",
          "option4": "Enter the OTP & click on verify."
        }
      ]
    },
    {
      "name": "faq2",
      "label": "What to do if I forget my password?",
      "value": "",
      "class": "ion-no-margin",
      "type": "text",
      "position": "floating",
      "validators": {
        "required": true
      },
      "options": [
        {
          "option1": "On the login page, click on the 'Forgot Password' button.",
          "option2": "Enter your email ID and the new password.",
          "option3": "Click on the Reset password button.",
          "option4": "You will receive an OTP on the registered email ID.",
          "option5": "Once you enter the correct OTP, you will be able to login with the new password."
        }
      ]
    },
    {
      "name": "faq3",
      "label": "How do I complete my profile?",
      "value": "",
      "class": "ion-no-margin",
      "type": "text",
      "position": "floating",
      "validators": {
        "required": true
      },
      "options": [
        {
          "option1": "On the homepage, in the bottom navigation bar click on the  to reach the Profile page.",
          "option2": "Click on the 'Edit' button to fill in or update your details.",
          "option3": "Click on the Submit button to save all your changes."
        }
      ]
    },
    {
      "name": "faq4",
      "label": "How do I create a session?",
      "value": "",
      "class": "ion-no-margin",
      "type": "text",
      "position": "floating",
      "validators": {
        "required": true
      },
      "options": [
        {
          "option1": "On the home page select the 'Created by me' section.",
          "option2": "Click on the 'Create New session' or + icon on the top to create a new session.",
          "option3": "Enter all the profile details.",
          "option4": "Click on publish to make your session active for Mentees to enroll."
        }
      ]
    },
    {
      "name": "faq5",
      "label": "How do I enroll for a session?",
      "value": "",
      "class": "ion-no-margin",
      "type": "text",
      "position": "floating",
      "validators": {
        "required": true
      },
      "options": [
        {
          "option1": "On home page, you will see the upcoming sessions. ",
          "option2": "Click on View More to view all the sessions available. ",
          "option3": "Click on the enroll button to get details about the session. ",
          "option4": "Click on the Enroll button on the bottom bar to register for the session."
        }
      ]
    },
    {
      "name": "faq6",
      "label": "How do I find Mentors on MentorED?",
      "value": "",
      "class": "ion-no-margin",
      "type": "text",
      "position": "floating",
      "validators": {
        "required": true
      },
      "options": [
        {
          "option1": "On the homepage click on the Mentor icon on the bottom navigation bar to see the list of Mentors available on the platform. From the list, you can click on the Mentor tab to learn more about them."
        }
      ]
    },
    {
      "name": "faq7",
      "label": "Cancel / Enroll for a session",
      "value": "",
      "class": "ion-no-margin",
      "type": "text",
      "position": "floating",
      "validators": {
        "required": true
      },
      "options": [
        {
          "option1": "From the My sessions tab on the homepage and click on the session you want to unregister from. Click on the cancel button at the bottom from the session page to cancel your enrollment."
        }
      ]
    },
    {
      "name": "faq8",
      "label": "How do I attend a session?",
      "value": "",
      "class": "ion-no-margin",
      "type": "text",
      "position": "floating",
      "validators": {
        "required": true
      },
      "options": [
        {
          "option1": "Click on the session you want to attend from the My sessions tab.",
          "option2": "Click on the Join button to attend the session."
        }
      ]
    },
    {
      "name": "faq9",
      "label": "What will I be able to see on the Dashboard tab?",
      "value": "",
      "class": "ion-no-margin",
      "type": "text",
      "position": "floating",
      "validators": {
        "required": true
      },
      "options": [
        {
          "option1": "As a Mentor, you will be able to see the number of sessions that you have created on MentorED and the number of sessions you have actually hosted on the platform.",
          "option2": "As a Mentee, you will be able to see the total number of sessions you have registered for and the total number of sessions you have attended among them."
        }
      ]
    }
  ];
  constructor(private router: Router) {}

  ngOnInit() {}
  async goToHome() {
    this.router?.navigate([``]);
  }

}
