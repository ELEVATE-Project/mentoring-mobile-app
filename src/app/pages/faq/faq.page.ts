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
    { question: 'How do I start creating sessions', answer: 'text' },
    { question: 'I want change my profile picture', answer: 'text' },
    {
      question: 'Where can i search for a specific content in the app',
      answer: 'text',
    },
    { question: 'How can i switch to become a mentor', answer: 'text' },
    { question: 'How will i know if the session has started', answer: 'text' },
    {
      question:
        'Where can i find the other mentor details and sessions conducted by them',
      answer: 'text',
    },
  ];
  constructor(private router: Router) {}

  ngOnInit() {}
  async goToHome() {
    this.router?.navigate([``]);
  }

}
