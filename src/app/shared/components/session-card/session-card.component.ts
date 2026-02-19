import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
  signal,
  input,
  computed
} from '@angular/core';
import { Router } from '@angular/router';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService, ToastService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { CommonRoutes } from 'src/global.routes';
import { IonModal } from '@ionic/angular';
import { App, AppState } from '@capacitor/app';

@Component({
  selector: 'app-session-card',
  templateUrl: './session-card.component.html',
  styleUrls: ['./session-card.component.scss'],
  standalone: false
})
export class SessionCardComponent implements OnInit {
  data = input<any>();
  isEnrolled = input<any>();
  showBanner = input<boolean>(false);
  @Output() onClickEvent = new EventEmitter();
  @ViewChild(IonModal) modal: IonModal;

  currentUser = signal<any>(null);
  currentTime = signal<number>(Math.floor(Date.now() / 1000));

  startDate = computed(() => {
    const d = this.data();
    return d?.start_date > 0 ? new Date(d.start_date * 1000) : undefined;
  });

  endDate = computed(() => {
    const d = this.data();
    return d?.end_date > 0 ? new Date(d.end_date * 1000) : undefined;
  });

  isCreator = computed(() => {
    const user = this.currentUser();
    const d = this.data();
    return (user && d?.created_by) ? d.created_by === user.id : false;
  });

  isConductor = computed(() => {
    const user = this.currentUser();
    const d = this.data();
    return (user && d?.mentor_id) ? d.mentor_id === user.id : false;
  });

  meetingPlatform = computed(() => {
    return this.data()?.meeting_info;
  });

  buttonConfig = computed(() => {
    const d = this.data();
    const isConductor = this.isConductor();
    const isCreator = this.isCreator();
    const isEnrolled = this.isEnrolled();
    const now = this.currentTime();

    if (!d) return null;

    let config: any = {};

    if (isConductor) {
      config = { label: 'START', type: 'startAction' };
    } else {
      config = (!isCreator && !isConductor && d.is_enrolled) || isEnrolled
        ? { label: 'JOIN', type: 'joinAction' }
        : { label: 'ENROLL', type: 'enrollAction' };
    }

    let enabled = true;
    const start = d?.start_date;
    if (start) {
      const diff = start - now;
      if (diff > 600) {
        enabled = false;
      }
    }

    if (d?.meeting_info?.platform === 'OFF') {
      enabled = false;
    }

    config.isEnabled = enabled;
    return config;
  });

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private toast: ToastService,
    private localStorage: LocalStorageService
  ) { }

  async ngOnInit() {
    App.addListener('appStateChange', (state: AppState) => {
      if (state.isActive) {
        this.currentTime.set(Math.floor(Date.now() / 1000));
      }
    });

    const user = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    this.currentUser.set(user);

    this.currentTime.set(Math.floor(Date.now() / 1000));
  }

  onCardClick(data) {
    let value = {
      data: data,
      type: 'cardSelect',
    };
    this.onClickEvent.emit(value);
  }

  onButtonClick(data, type) {
    let value = {
      data: data,
      type: type,
    };
    this.onClickEvent.emit(value);
  }

  clickOnAddMeetingLink(cardData: any) {
    let id = cardData.id;
    this.router.navigate([CommonRoutes.CREATE_SESSION], {
      queryParams: { id: id, type: 'segment' },
    });
  }
}
