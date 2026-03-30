import { Component, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService, ToastService } from 'src/app/core/services';
import { languagesList } from 'src/app/core/constants/languageConstant';
import { ProfileService } from 'src/app/core/services/profile/profile.service';

interface LanguageOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-language',
  templateUrl: './language.page.html',
  styleUrls: ['./language.page.scss'],
  standalone: false
})
export class LanguagePage {
  private readonly localStorage = inject(LocalStorageService);
  private readonly translate = inject(TranslateService);
  private readonly toast = inject(ToastService);
  private readonly profile = inject(ProfileService);

  public readonly headerConfig: {
    backButton: boolean;
    label: string;
    notification: boolean;
    signupButton: boolean;
  } = {
    // backButton: {
    //   label: 'LANGUAGE',
    //   color: 'primary'
    // },
    backButton: false,
    label: 'LANGUAGE',
    notification: false,
    signupButton: false
  };

  public readonly languagesList: LanguageOption[] = languagesList as LanguageOption[];
  public readonly selectedLanguage = signal<LanguageOption | null>(null);

  async ionViewWillEnter(): Promise<void> {
    this.selectedLanguage.set(
      await this.localStorage.getLocalData(localKeys.SELECTED_LANGUAGE)
    );
  }

  onCardClick(language: LanguageOption): void {
    this.selectedLanguage.set(language);
  }

  async onSubmit(): Promise<void> {
    const selectedLanguage = this.selectedLanguage();
    if (!selectedLanguage) {
      return;
    }

    const showProfileUpdateToast = false;
    const result = await this.profile.updateLanguage(
      { preferred_language: selectedLanguage.value },
      showProfileUpdateToast
    );

    if (result) {
      await this.setLanguage(selectedLanguage);
    }
  }

  async setLanguage(lang: LanguageOption): Promise<void> {
    try {
      await this.localStorage.setLocalData(localKeys.SELECTED_LANGUAGE, lang);
      this.translate.use(lang.value);
      this.toast.showToast('LANGUAGE_CHANGED_SUCCESSFULLY', 'success');
    } catch {
      this.toast.showToast('ERROR_LANGUAGE_CHANGE', 'danger');
    }
  }
}
