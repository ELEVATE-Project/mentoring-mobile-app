import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { replace } from 'lodash';
import { CHAT_MESSAGES } from 'src/app/core/constants/chatConstants';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, ToastService, UtilService } from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';
@Component({
  selector: 'app-chat-request',
  templateUrl: './chat-request.page.html',
  styleUrls: ['./chat-request.page.scss'],
})
export class ChatRequestPage implements OnInit {
  public headerConfig: any = {
    menu: false,
    headerColor: 'primary',
  };
  id;
  messageLimit = CHAT_MESSAGES.MESSAGE_TEXT_LIMIT;

  message: string = 'Hi, I would like to connect with you.';
  info: any = {};
  messages = {};

  constructor(
    private httpService: HttpService,
    private routerParams: ActivatedRoute,
    private toast: ToastService,
    private alert: AlertController,
    private translate: TranslateService,
    private router: Router,
    private utilService: UtilService
  ) {
    routerParams.params.subscribe((parameters) => {
      this.id = parameters?.id;
    });
  }

  ngOnInit() {
    this.getConnectionInfo();
  }

  getConnectionInfo() {
    const payload = {
      url: urlConstants.API_URLS.GET_CHAT_INFO,
      payload: {
        user_id: this.id,
      },
    };
    this.httpService.post(payload).then((resp) => {
      this.info = resp?.result;
      if (resp?.result?.status == 'REQUESTED') {
        this.message = '';
      }
      else if(resp?.result?.status == 'ACCEPTED') {
        this.router.navigate([CommonRoutes.CHAT, resp?.result?.meta.room_id],{queryParams:{id:resp?.result?.id}, replaceUrl: true });
      }
      this.info.status = !resp?.result?.status
        ? 'PENDING'
        : resp?.result?.status;
      if (this.info.created_by === this.info.user_id) {
        this.messages = CHAT_MESSAGES.INITIATOR;
      } else {
        this.messages = CHAT_MESSAGES.RECEIVER;
      }
    });
  }
  sendRequest() {
    if(this.message.length >this.messageLimit){
      this.toast.showToast('MESSAGE_TEXT_LIMIT', 'danger');
      return;
    }
    const payload = {
      url: urlConstants.API_URLS.SEND_REQUEST,
      payload: {
        user_id: this.id,
        message: this.message,
      },
    };
    this.httpService.post(payload).then((resp) => {
      this.info.status = 'REQUESTED';
      this.getConnectionInfo();
    });
  }
  acceptRequest() {
    const payload = {
      url: urlConstants.API_URLS.ACCEPT_MSG_REQ,
      payload: {
        user_id: this.id,
      },
    };
    this.httpService.post(payload).then((resp) => {
      const name = this.info?.user_details?.name || 'the user';
      const message = this.translate.instant('ACCEPTED_MESSAGE_REQ', { name });
      this.toast.showToast(message, 'success');
      this.info.status = 'ACCEPTED';
        this.router.navigate([CommonRoutes.CHAT, resp?.result?.meta.room_id],{replaceUrl: true, queryParams:{id:resp?.result?.id}});
    });
  }

   async rejectConfirmation() {  
    let texts: any;
    this.translate
      .get(['MESSAGE_REQ_REJECT', 'REJECT', 'CANCEL'])
      .subscribe((text) => {
        texts = text;
      });
    let msg = {
      header: texts['REJECT'] + '?',
      message: texts['MESSAGE_REQ_REJECT'],
      cancel: 'CANCEL',
      submit: 'Reject',
    };
    const response:any = await this.utilService.alertPopup(msg);
    if (response) {
     this.rejectRequest();
    } else {
      console.log('User canceled the rejection');
    }
  }
  rejectRequest() {
    const payload = {
      url: urlConstants.API_URLS.REJECT_MSG_REQ,
      payload: {
        user_id: this.id,
      },
    };
    this.httpService.post(payload).then((resp) => {
      this.info.status = 'REJECTED';
      this.messages = CHAT_MESSAGES.RECEIVER;
      this.toast.showToast('REJECTED_MESSAGE_REQ', 'danger');
    });
  }
  goToProfile(){
        this.router.navigate([CommonRoutes.MENTOR_DETAILS, this.id]);
  }
}
