import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CHAT_LIB_META_KEYS } from 'src/app/core/constants/formConstant';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, ToastService } from 'src/app/core/services';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { CommonRoutes } from 'src/global.routes';
import { TranslateService } from '@ngx-translate/core';
import { RocketChatApiService } from 'sl-chat-library';

@Component({
    selector: 'app-chat-window',
    templateUrl: './chat-window.page.html',
    styleUrls: ['./chat-window.page.scss'],
    standalone: false
})
export class ChatWindowPage implements OnInit, OnDestroy {
  private readonly routerParams = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly profileService = inject(ProfileService);
  private readonly router = inject(Router);
  private readonly apiServer = inject(HttpService);
  private readonly toastService = inject(ToastService);
  private readonly translate = inject(TranslateService);
  private readonly rocket = inject(RocketChatApiService);

  readonly showChat = signal(false);
  public headerConfig: any = {
    menu: false,
    headerColor: 'primary',
  };
  readonly rid = signal<string | null>(null);
  readonly id = signal<string | null>(null);
  readonly translations = signal<Record<string, string>>({});

  constructor() {
    this.routerParams.params.subscribe((parameters) => {
      this.rid.set(parameters?.id ?? null);
      void this.initializeChat();
    });

    this.routerParams.queryParams.subscribe((parameters) => {
      this.id.set(parameters?.id ?? null);
    });
  }

  async ngOnInit(): Promise<void> {
    if (!this.rid()) {
      return;
    }

    await this.initializeChat();
  }

  private async initializeChat(): Promise<void> {
    if (!this.rid()) {
      return;
    }

    await this.profileService.getChatToken();
    this.showChat.set(true);
    const keys = Object.values(CHAT_LIB_META_KEYS);
    this.translate.get(keys).subscribe(res => {
      this.translations.set(res);
    });
  }

  onBack(): void {
    this.location.back();
  }

  async onClickProfile(externalId: string): Promise<void> {
    const resp = await this.apiServer.post({
      url: urlConstants.API_URLS.GETUSERIDBYRID,
      payload: { external_user_id: externalId }
    });
    if (resp?.result?.user_id) {
      this.router.navigate([CommonRoutes.MENTOR_DETAILS, resp?.result?.user_id]);
    }
  }

  limitExceeded(_event: unknown): void {
    this.toastService.showToast('MESSAGE_TEXT_LIMIT','danger');
  }

  ngOnDestroy(): void {
    if (this.rid()) {
      this.rocket.isWebSocketInitialized = false;
    }
  }

  ionViewWillLeave(): void {
    if (this.rid()) {
      this.rocket.isWebSocketInitialized = false;
    }
  }
}
