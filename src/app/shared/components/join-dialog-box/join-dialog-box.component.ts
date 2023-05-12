import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import * as moment from 'moment';
import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { ToastService } from 'src/app/core/services';

@Component({
  selector: 'app-join-dialog-box',
  templateUrl: './join-dialog-box.component.html',
  styleUrls: ['./join-dialog-box.component.scss'],
})
export class JoinDialogBoxComponent implements OnInit {
  data;
  sessionData;
  startDate: any;
  endDate: any;
  meetingPlatform: any;

  constructor(private modalCtrl: ModalController, private inAppBrowser: InAppBrowser, private toast: ToastService) { }

  ngOnInit() {
    this.startDate = (this.sessionData.startDate>0)?moment.unix(this.sessionData.startDate).toLocaleString():this.startDate;
    this.endDate = (this.sessionData.endDate>0)?moment.unix(this.sessionData.endDate).toLocaleString():this.endDate;
    this.meetingPlatform = (this.sessionData.meetingInfo);
  }
  openBrowser(link) {
    let browser = this.inAppBrowser.create(link, `_system`);
    browser.on('exit').subscribe(() => {
    }, err => {
      console.error(err);
    });
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }
  onButtonClick(){
    this.openBrowser(this.data.link);
  }
  copyToClipBoard(copyData:any) {
    console.log('copyclipboard',copyData)
    navigator.clipboard.writeText(copyData).then(() => {
      this.toast.showToast('Copied successfully.', "success")
    },() => {
      console.error('Failed to copy');
    });
  }
}
