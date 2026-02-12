import {
  Component,
  Input,
  OnInit,
  Output,
  EventEmitter,
  ViewChild,
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
  @Input() data: any;
  @Input() isEnrolled;
  @Input() showBanner: boolean = false;
  @Output() onClickEvent = new EventEmitter();
  @ViewChild(IonModal) modal: IonModal;

  startDate;
  isCreator: boolean;
  isConductor: boolean;
  buttonConfig;
  userData: any;
  endDate;
  isModalOpen = false;
  meetingPlatform: any;

  constructor(
    private router: Router,
    private sessionService: SessionService,
    private toast: ToastService,
    private localStorage: LocalStorageService
  ) {}

  async ngOnInit() {
    App.addListener('appStateChange', (state: AppState) => {
      if (state.isActive == true) {
        this.setButtonConfig(this.isCreator, this.isConductor);
      }
    });
    this.meetingPlatform = this.data?.meeting_info;
    this.isCreator = await this.checkIfCreator();
    this.isConductor = await this.checkIfConductor();
    this.setButtonConfig(this.isCreator, this.isConductor);
    this.startDate =
      this.data.start_date > 0
        ? new Date(this.data.start_date * 1000)
        : this.startDate;
    this.endDate =
      this.data.end_date > 0
        ? new Date(this.data.start_date * 1000)
        : this.endDate;
  }

  setButtonConfig(isCreator: boolean, isConductor: boolean) {
  const now = Math.floor(Date.now() / 1000);
  const start = this.data?.start_date;
  const platform = this.data?.meeting_info?.platform;

  if (isConductor) {
      this.buttonConfig = { label: 'START', type: 'startAction' };
    } else {
      this.buttonConfig =
        (!isCreator && !isConductor && this.data.is_enrolled) || this.isEnrolled
          ? { label: 'JOIN', type: 'joinAction' }
          : { label: 'ENROLL', type: 'enrollAction' };
    }

  let enabled = true;

  if (start) {
    const diff = start - now;
    if (diff > 600) {
      enabled = false;
    }
  }

  if (platform === 'OFF') {
    enabled = false;
  }

  this.buttonConfig.isEnabled = enabled;
}


 async checkIfCreator() {
  this.userData = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
  if (!this.userData || !this.data?.created_by) {
    return false;
  }
  return this.data.created_by === this.userData.id;
}

async checkIfConductor() {
  this.userData = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
  if (!this.userData || !this.data?.mentor_id) {
    return false;
  }
  return this.data.mentor_id === this.userData.id;
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
