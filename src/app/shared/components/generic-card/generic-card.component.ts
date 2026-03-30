import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { Router } from '@angular/router';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { LocalStorageService, UtilService } from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';
import { ToastService } from 'src/app/core/services';

@Component({
    selector: 'app-generic-card',
    templateUrl: './generic-card.component.html',
    styleUrls: ['./generic-card.component.scss'],
    standalone: false
})
export class GenericCardComponent implements OnInit {
  chatConfig = signal<string>(null);

  @Input() data: any;
  @Output() onClickEvent = new EventEmitter();
  @Input() buttonConfig: any;
  @Input() meta: any;
  @Input() cardConfig: any;
  @Input() disableButton: boolean;
  @Input() showTag: any;
  @Input() disableNavigation: boolean = false;
  @Input() disabledCheckboxId: string | null = null;
  @Input() selectedList: any;
  @Input() maxCount: any;
  @Input() showCheckbox: any;
  @Input() showSelectAll: any;
  @Input() selectedCount: any;

  constructor(
    private router: Router,
    private localStorage: LocalStorageService,
    private toast: ToastService,
    private utilService: UtilService
  ) {}

  async ngOnInit() {
    const config = await this.localStorage.getLocalData(localKeys['CHAT_CONFIG']);
    this.chatConfig.set(config);
  }

  onCardClick(data) {
    if (!this.disableNavigation) {
      this.utilService.setSkipScroll('mentor-directory');
      this.utilService.setSkipScroll('requests');
      this.router.navigate([
        CommonRoutes.MENTOR_DETAILS,
        data?.id || data?.user_id,
      ]);
    }
  }

  handleButtonClick(action: string, data) {
    let value = {
      data: data.id || data.user_id,
      name: data.name,
      type: action,
      rid: data?.connection_meta?.room_id,
      element: data
    };
    this.onClickEvent.emit(value);
  }

  showButton(event, data) {
    if (event.action === 'chat' && this.chatConfig() != 'true') {
      return false;
    }
    if (!event.hasCondition) {
      return true;
    } else if (event[event.onCheck] == data[event.onCheck]) {
      return true;
    } else {
      return false;
    }
  }

  onCheckboxAction(data: any, event: any) {
    const isChecked = event.detail.checked;
    if (isChecked && this.selectedCount >= this.maxCount) {
      event.target.checked = false;
      this.toast.showToast('SESSION_MENTEE_LIMIT', 'danger');
      return;
    }
    const action = isChecked ? 'ADD' : 'REMOVE';
    let value = {
      data: data.id || data.user_id,
      type: action,
      rid: data?.connection_meta?.room_id,
      element: data
    };
    this.onClickEvent.emit(value);
  }

  isRowInRemoveState(data: any): boolean {
    return data?.action?.some(a => a.action === 'REMOVE') ?? false;
  }
}