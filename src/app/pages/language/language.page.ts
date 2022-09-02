import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService } from 'src/app/core/services';
import { languagesList } from 'src/app/core/constants/languageConstant';
import { ProfileService } from 'src/app/core/services/profile/profile.service';

@Component({
  selector: 'app-language',
  templateUrl: './language.page.html',
  styleUrls: ['./language.page.scss'],
})
export class LanguagePage implements OnInit {

  public headerConfig: any = {
    backButton: {
      label: 'LANGUAGE',
      color: 'primary'
    },
    notification: false,
    signupButton: false
  };
  languagesList=languagesList;
  selectedLanguage: any;

  constructor(private localStorage: LocalStorageService,
              private translate: TranslateService,
              private profile: ProfileService) { }

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

  ngOnDestroy(){
    //TODO: call profile update API
    //this.profile.profileUpdate({preferredLanguage:this.selectedLanguage});
  }

}
