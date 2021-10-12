import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
 
  public appPages = [
    { title: 'LABELS.CREATED_SESSIONS', url: '', icon: 'person-add' },
    { title: 'LABELS.LANGUAGE', url: '', icon: 'language' },
    { title: 'LABELS.SETTINGS', url: '', icon: 'settings' },
    { title: 'LABELS.HELP', url: '', icon: 'help-circle' }
  ];
  constructor(
    private translate :TranslateService,
    private platform : Platform
  ) {
    this.initializeApp();
  }


  initializeApp() {
    this.platform.ready().then(() => {
      this.languageSetting();
    });
  }
  languageSetting() {
        this.translate.use('en');
  }
}
