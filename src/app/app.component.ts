import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  public appPages = [
    { title: 'Created Sessions', url: '', icon: 'person-add' },
    { title: 'Language', url: '', icon: 'language' },
    { title: 'Settings', url: '', icon: 'settings' },
    { title: 'Help', url: '', icon: 'help-circle' }
  ];
  constructor() {}
}
