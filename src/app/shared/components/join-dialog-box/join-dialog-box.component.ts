import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Browser } from '@capacitor/browser';
import { ToastService } from 'src/app/core/services';
import { Clipboard } from '@capacitor/clipboard';

@Component({
    selector: 'app-join-dialog-box',
    templateUrl: './join-dialog-box.component.html',
    styleUrls: ['./join-dialog-box.component.scss'],
    standalone: false
})
export class JoinDialogBoxComponent implements OnInit {
  data;
  sessionData;
  startDate: any;
  endDate: any;
  meetingPlatform: any;
  browser = Browser;
  clipboard = Clipboard;

  constructor(private modalCtrl: ModalController,
    private toast: ToastService) { }

  ngOnInit() {
    this.startDate = (this.sessionData.start_date>0)?new Date(this.sessionData.start_date * 1000):this.startDate;
    this.endDate = (this.sessionData.end_date>0)?new Date(this.sessionData.end_date * 1000):this.endDate;
    this.meetingPlatform = (this.sessionData.meeting_info);
  }
  async openBrowser(link) {
    await this.browser.open({ url: link, windowName:"_self" });
    this.browser.addListener('browserFinished', () => {
      console.log("exit");
    });
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }
  onButtonClick(){
    this.modalCtrl.dismiss();
    this.openBrowser(this.data.link);
  }

  copyToClipBoard = async (copyData: any) => {
    await this.clipboard.write({
      string: copyData
    }).then(()=>{
      this.toast.showToast('Copied successfully',"success");
    });
  };
}
