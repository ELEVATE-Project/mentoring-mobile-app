import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
// import { InAppBrowser } from '@awesome-cordova-plugins/in-app-browser/ngx';
import { Browser } from '@capacitor/browser';
import { ToastService } from 'src/app/core/services';
import { Clipboard } from '@capacitor/clipboard';

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

  constructor(private modalCtrl: ModalController,
    //  private inAppBrowser: InAppBrowser,
     private toast: ToastService) { }

  ngOnInit() {
    this.startDate = (this.sessionData.start_date>0)?new Date(this.sessionData.start_date * 1000):this.startDate;
    this.endDate = (this.sessionData.end_date>0)?new Date(this.sessionData.start_date * 1000):this.endDate;
    this.meetingPlatform = (this.sessionData.meeting_info);
  }
  async openBrowser(link) {
    await Browser.open({  url: link, windowName:"_self" });
    Browser.addListener('browserFinished', () => {
      console.log("exit");
    });
    // let browser = this.inAppBrowser.create(link, `_system`);
    // browser.on('exit').subscribe(() => {
    // }, err => {
    //   console.error(err);
    // });
  }

  cancel(){
    return this.modalCtrl.dismiss(null, 'cancel');
  }
  onButtonClick(){
    this.modalCtrl.dismiss();
    this.openBrowser(this.data.link);
  }
  
  copyToClipBoard = async (copyData: any) => {
    await Clipboard.write({
      string: copyData
    }).then(()=>{
      this.toast.showToast('Copied successfully',"success");
    });
  };
}
