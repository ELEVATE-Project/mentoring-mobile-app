import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FrontendChatLibraryService } from 'sl-chat-library';
import { ToastService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
    selector: 'app-messages',
    templateUrl: './messages.page.html',
    styleUrls: ['./messages.page.scss'],
    standalone: false
})
export class MessagesPage implements OnInit {
  private readonly route = inject(Router);
  private readonly profileService = inject(ProfileService);
  private readonly chatService = inject(FrontendChatLibraryService);
  private readonly toast = inject(ToastService);
  private readonly translate = inject(TranslateService);

  readonly showChat = signal<boolean | null>(null);
  public headerConfig: any = {
    menu: true,
    headerColor: 'primary',
    notification: false,
    label:'MESSAGES'
  };
  readonly isLoaded = signal(false);
  readonly translatedMessages = signal({
    placeholder: '',
    noData: ''
  });

  constructor() {
    this.translateAllMessages();
  }

  ngOnInit(): void {
  }

  async ionViewWillEnter() {
    this.isLoaded.set(false);
    this.translateAllMessages();
    this.showChat.set(await this.profileService.getChatToken());
    this.isLoaded.set(true);
  }

  translateAllMessages() {
    const translationKeys = ['MESSAGE_SEARCH_PLACEHOLDER', 'SEARCH_RESULT_MESSGAGE_NOT_FOUND'];
    this.translate.get(translationKeys).subscribe((translations: any) => {
      this.translatedMessages.set({
        placeholder: translations['MESSAGE_SEARCH_PLACEHOLDER'],
        noData: translations['SEARCH_RESULT_MESSGAGE_NOT_FOUND']
      });
    });
  }

  onSelect(data: any) {
    this.route.navigate([CommonRoutes.CHAT, data]);
  }

  messageBadge(event: any) {
    this.chatService.messageBadge(event); 
  }

  showToast(event: any) {
    this.toast.showToast(event.message, event.type);
  }

  ionViewWillLeave() {
    this.showChat.set(null);
  }
}
