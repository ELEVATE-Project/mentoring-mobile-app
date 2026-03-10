import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { CHAT_MESSAGES } from 'src/app/core/constants/chatConstants';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, ToastService, UtilService } from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';

@Component({
    selector: 'app-chat-request',
    templateUrl: './chat-request.page.html',
    styleUrls: ['./chat-request.page.scss'],
    standalone: false
})
export class ChatRequestPage implements OnInit {
  readonly headerConfig = {
    menu: false,
    headerColor: 'primary',
  };

  readonly messageLimit = CHAT_MESSAGES.MESSAGE_TEXT_LIMIT;

  id = signal<string | undefined>(undefined);
  message = signal<string>('Hi, I would like to connect with you.');
  info = signal<any>({});
  messages = signal<any>({});

  // Computed signals for derived state
  readonly status = computed(() => this.info()?.status);
  readonly userDetails = computed(() => this.info()?.user_details);
  readonly profileImage = computed(() => this.userDetails()?.image || 'assets/prof-img/user.png');
  readonly statusMessage = computed(() => this.messages()?.[this.status()]);
  readonly hasResolvedParticipantRole = computed(() => {
    const i = this.info();
    return !!(i?.created_by && i?.user_id);
  });
  readonly isInitiator = computed(() => {
    const i = this.info();
    return i?.created_by && i?.user_id && i.created_by === i.user_id;
  });
  readonly showCurrentStatusActions = computed(() =>
    this.hasResolvedParticipantRole() && this.status() !== 'REJECTED' && !this.isInitiator()
  );
  readonly showMessageInput = computed(() => {
    return this.status() === 'PENDING' || (this.isInitiator() && this.status() !== 'ACCEPTED');
  });
  readonly messageInfoBottom = computed(() => {
    const i = this.info();
    return i?.hasOwnProperty?.('created_by') && i.created_by !== i.user_id ? '20px' : '100px';
  });

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
      this.id.set(parameters?.id);
    });
  }

  ngOnInit() {
    this.getConnectionInfo();
  }

  getConnectionInfo() {
    const payload = {
      url: urlConstants.API_URLS.GET_CHAT_INFO,
      payload: {
        user_id: this.id(),
      },
    };
    this.httpService.post(payload)
      .then((resp) => {
        const result = resp?.result;
        if (!result) {
          this.info.update(() => null);
          return;
        }
        const infoData = { ...result };
        infoData.status = result.status ?? 'PENDING';

        if (infoData.status === 'REQUESTED') {
          this.message.set('');
        } else if (infoData.status === 'ACCEPTED') {
          const roomId = result.meta?.room_id;
          if (roomId) {
            this.router.navigate(
              [CommonRoutes.CHAT, roomId],
              { queryParams: { id: result.id }, replaceUrl: true }
            );
          }
        }

        if (infoData.created_by && infoData.user_id) {
          this.messages.update(() =>
            infoData.created_by === infoData.user_id
              ? CHAT_MESSAGES.INITIATOR
              : CHAT_MESSAGES.RECEIVER
          );
          } else {
            this.messages.update(() => CHAT_MESSAGES.RECEIVER);
          }

        this.info.update(() => infoData);
      })
      .catch((err) => {
        console.error('getConnectionInfo error', err);
      });
  }

  sendRequest() {
    if (this.message().trim() === '') {
      return;
    }
    if (this.message().length > this.messageLimit) {
      this.toast.showToast('MESSAGE_TEXT_LIMIT', 'danger');
      return;
    }
    const payload = {
      url: urlConstants.API_URLS.SEND_REQUEST,
      payload: {
        user_id: this.id(),
        message: this.message(),
      },
    };
    this.httpService.post(payload).then((resp) => {
      this.info.update((prev) => ({ ...prev, status: 'REQUESTED' }));
      this.getConnectionInfo();
    });
  }

  acceptRequest() {
    const payload = {
      url: urlConstants.API_URLS.ACCEPT_MSG_REQ,
      payload: {
        user_id: this.id(),
      },
    };
    this.httpService.post(payload)
      .then((resp) => {
        const currentInfo = this.info() ?? {};
        const name = currentInfo.user_details?.name ?? 'the user';
        const message = this.translate.instant('ACCEPTED_MESSAGE_REQ', { name });
        this.toast.showToast(message, 'success');
        this.info.update((prev) => ({ ...prev, status: 'ACCEPTED' }));
        const roomId = resp?.result?.meta?.room_id;
        const connId = resp?.result?.id ?? null;
        if (roomId) {
          this.router.navigate([CommonRoutes.CHAT, roomId], {
            replaceUrl: true,
            queryParams: { id: connId },
          });
        }
      })
      .catch((err) => {
        console.error('acceptRequest error', err);
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
    const response: any = await this.utilService.alertPopup(msg);
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
        user_id: this.id(),
      },
    };
    this.httpService.post(payload).then((resp) => {
      this.info.update((prev) => ({ ...prev, status: 'REJECTED' }));
      this.messages.update(() => CHAT_MESSAGES.RECEIVER);
      this.toast.showToast('REJECTED_MESSAGE_REQ', 'danger');
    });
  }

  goToProfile() {
    this.router.navigate([CommonRoutes.MENTOR_DETAILS, this.id()]);
  }
}
