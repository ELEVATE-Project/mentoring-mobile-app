import { ChangeDetectionStrategy, Component, OnInit, Output, EventEmitter, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NavController, PopoverController } from '@ionic/angular';
import { UtilService } from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';
import { PopoverMenuComponent } from 'src/app/popover-menu/popover-menu.component';

@Component({
    selector: 'app-page-header',
    templateUrl: './page-header.component.html',
    styleUrls: ['./page-header.component.scss'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PageHeaderComponent implements OnInit {
  config = input<any>();
  actionEvent = output<any>();
  hasBadge = toSignal(this.utilService.hasBadge$, { initialValue: false });

  constructor(private location: NavController,
    private router: Router,
    private utilService: UtilService,
    private popoverCtrl: PopoverController
  ) {}

  ngOnInit() {
  }

  onAction(event: string) {
    this.actionEvent.emit(event);
  }

  onBack() {
    const currentUrl = this.router.url;
    if (currentUrl === `/${CommonRoutes.TABS}/${CommonRoutes.HOME}`) {
      this.redirectToHome();
    } else {
      this.location.pop();
    }
  }

  async openPopover(ev: Event) {
    const popover = await this.popoverCtrl.create({
      component: PopoverMenuComponent,
      event: ev,
      translucent: true,
       componentProps: {
        actions: this.config()?.actions || []
      },
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data) {
      this.handleAction(data);
    }
  }

  handleAction(event: string) {
    switch(event) {
      case "block":
      case "share":
        this.actionEvent.emit(event);
        break;
    }
  }

  redirectToHome() {
    const baseUrl = window.location.origin;
    window.location.href = `${baseUrl}/home`;
  }
}
