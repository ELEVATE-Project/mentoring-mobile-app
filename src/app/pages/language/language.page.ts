import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService } from 'src/app/core/services';

@Component({
  selector: 'app-language',
  templateUrl: './language.page.html',
  styleUrls: ['./language.page.scss'],
})
export class LanguagePage implements OnInit {

  languagesList=[{label:"ENGLISH",value:"en"},{label:"HINDI",value:"hi"}]

  public headerConfig: any = {
    backButton: {
      label: 'LANGUAGE',
      color: 'primary'
    },
    notification: false,
    signupButton: false
  };
  selectedLanguage: any;

  constructor(private localStorage: LocalStorageService, private translate: TranslateService) { }

  ngOnInit() {
    this.localStorage.getLocalData(localKeys.SELECTED_LANGUAGE).then(data =>{
      this.selectedLanguage = data;
    })
  }

  onCardClick(event){
    this.selectedLanguage=event.value;
    this.setLanguage(event.value)
  }

  setLanguage(lang){
    this.localStorage.setLocalData(localKeys.SELECTED_LANGUAGE,lang).then(() =>{
      this.translate.use(lang);
    }).catch(error => {
      this.translate.use("en")
    })
  }

}
