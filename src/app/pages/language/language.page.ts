import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService, ToastService } from 'src/app/core/services';
import { languagesList } from 'src/app/core/constants/languageConstant';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
@Component({
    selector: 'app-language',
    templateUrl: './language.page.html',
    styleUrls: ['./language.page.scss'],
    standalone: false
})
export class LanguagePage  {
  public headerConfig: any = {
    // backButton: {
    //   label: 'LANGUAGE',
    //   color: 'primary'
    // },
    backButton: false,
    label: 'LANGUAGE',
    notification: false,
    signupButton: false
  };
  languagesList=languagesList;
  selectedLanguage: any;
  constructor(private localStorage: LocalStorageService,
              private translate: TranslateService,
              private toast: ToastService,
              private profile: ProfileService) { }
  ionViewWillEnter() {
    this.localStorage.getLocalData(localKeys.SELECTED_LANGUAGE).then(data =>{
      this.selectedLanguage = data;
    })
  }
  onCardClick(event){
    this.selectedLanguage=event;
  }
  onSubmit(){
    let showProfileUpdateToast = false;
    this.profile.updateLanguage({preferred_language:this.selectedLanguage.value}, showProfileUpdateToast).then((result)=>{
      if(result){
        this.setLanguage(this.selectedLanguage);
      }
    })
  }
  setLanguage(lang){
    this.localStorage.setLocalData(localKeys.SELECTED_LANGUAGE,lang).then(() =>{
      this.translate.use(lang.value);
      this.toast.showToast("LANGUAGE_CHANGED_SUCCESSFULLY","success");
    }).catch(error => {
      this.toast.showToast("ERROR_LANGUAGE_CHANGE","danger");
    })
  }
}