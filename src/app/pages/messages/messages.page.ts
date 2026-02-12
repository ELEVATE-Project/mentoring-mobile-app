import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { FrontendChatLibraryService } from 'sl-chat-library';
import { ToastService, UtilService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';

@Component({
    selector: 'app-messages',
    templateUrl: './messages.page.html',
    styleUrls: ['./messages.page.scss'],
    standalone: false
})
export class MessagesPage implements OnInit {
  showChat: any;
  public headerConfig: any = {
    menu: true,
    headerColor: 'primary',
    notification: false,
    label:'MESSAGES'
  };
  isLoaded: boolean = false;
  translatedMessages = {
    "placeholder": "",
    "noData":""
  }
  constructor(
    private route: Router,
    private profileService: ProfileService,
    private chatService: FrontendChatLibraryService,
    private toast: ToastService,
    private translate: TranslateService
  ) {this.translateAllMessages() }
  ngOnInit(): void {
      
  }

  async ionViewWillEnter() {
    this.isLoaded = false;
    this.translateAllMessages()
    this.showChat = await this.profileService.getChatToken();
    this.isLoaded = true;
  }

  translateAllMessages() {
    const translationKeys = ["MESSAGE_SEARCH_PLACEHOLDER","SEARCH_RESULT_MESSGAGE_NOT_FOUND"];
    this.translate.get(translationKeys).subscribe((translations: any) => {
    this.translatedMessages = {
      placeholder: translations['MESSAGE_SEARCH_PLACEHOLDER'],
      noData: translations['SEARCH_RESULT_MESSGAGE_NOT_FOUND']
    };
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
    this.showChat = null
 }
}

