import { Component, OnInit, computed } from '@angular/core';
import { PAGE_IDS } from 'src/app/core/constants/page.ids';
import { PrivateService } from 'src/app/core/services/appinit.service';

@Component({
  selector: 'app-private',
  templateUrl: './private.page.html',
  styleUrls: ['./private.page.scss'],
  standalone: false
})
export class PrivatePage implements OnInit {
  PAGE_IDS = PAGE_IDS;

  roleLabel = computed(() =>
    this.privateService.isMentor() ? 'MENTOR' : 'MENTEE'
  );

  constructor(
    public privateService: PrivateService
  ) { }

  async ngOnInit() {
    await this.privateService.initializeApp();
  }

  isCustomIcon(icon: string | undefined): boolean {
    return icon ? /\.(svg|png|jpg|jpeg|gif)$/.test(icon) : false;
  }
}
