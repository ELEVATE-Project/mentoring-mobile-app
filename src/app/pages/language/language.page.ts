import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService, ToastService } from 'src/app/core/services';
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
              private toast: ToastService,
              private profile: ProfileService) { }

  ngOnInit() {
    this.localStorage.getLocalData(localKeys.SELECTED_LANGUAGE).then(data =>{
      this.selectedLanguage = data.value;
    })
  }

  onCardClick(event){
    this.selectedLanguage=event.value;
  }

  onSubmit(){
    this.setLanguage(this.selectedLanguage);
    let showProfileUpdateToast = false;
    this.profile.profileUpdate({preferred_language:this.selectedLanguage}, showProfileUpdateToast).then(()=>{
      this.toast.showToast("LANGUAGE_CHANGED_SUCCESSFULLY","success");
    })
  }

  setLanguage(lang){
    this.localStorage.setLocalData(localKeys.SELECTED_LANGUAGE,lang).then(() =>{
      this.translate.use(lang);
    }).catch(error => {
      this.toast.showToast("ERROR_LANGUAGE_CHANGE","danger");
    })
  }

}
