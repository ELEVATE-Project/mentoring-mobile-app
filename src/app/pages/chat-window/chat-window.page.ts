import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, ToastService } from 'src/app/core/services';

@Component({
  selector: 'app-chat-window',
  templateUrl: './chat-window.page.html',
  styleUrls: ['./chat-window.page.scss'],
})
export class ChatWindowPage implements OnInit {
  public headerConfig: any = {
    menu: false,
    headerColor: 'primary',
  };
  isRequested:string;
  id;

  message : string = "Hi, I would like to connect with you.";
  info :any ={};
  messages ={};
  constructor(
    private httpService : HttpService,
    private routerParams : ActivatedRoute,
    private toast : ToastService
  ) { 
    routerParams.params.subscribe(parameters =>{
      console.log(parameters,"parameters");
      this.id = parameters?.id;
    })
  }

  ngOnInit() {
    this.getConnectionInfo();
  }

  getConnectionInfo () {
    const payload ={
      url : urlConstants.API_URLS.GET_CHAT_INFO,
      payload:{
        user_id : this.id
      }
    }
    this.httpService.post(payload).then(resp =>{
      console.log(resp,"resp");
      this.info = resp?.result;
      if(resp?.result?.status && resp?.result?.status == 'REQUESTED'){
        this.isRequested = resp?.result?.status;
        this.message = '';
      }else{
        this.info.status =  'PENDING';
      }
      this.messages= {
        'PENDING':{
            title: `FIRST_MSG_REQ_INFO_TITLE`,
            subText:"FIRST_MSG_REQ_INFO_SUBTITLE"
        },
        'REQUESTED':{
          title: `MULTIPLE_MSG_REQ_TITLE`,
          subText:`MULTIPLE_MSG_REQ_SUBTITLE`
      }}
    console.log(this.info.user_details?.name,"resp info");
    })
  }
  sendRequest(){
    console.log(this.isRequested,'this.isRequested');
    if(this.isRequested == 'REQUESTED'){
      this.toast.showToast('MULTIPLE_MESSAGE_REQ','danger')
      return;
    }
    const payload ={
      url : urlConstants.API_URLS.SEND_REQUEST,
      payload:{
        user_id : this.id, 
        message : this.message
      }
    }
    this.httpService.post(payload).then(resp =>{
      console.log(resp,"resp");
    })
  }
  acceptRequest(){
    const payload ={
      url : urlConstants.API_URLS.ACCEPT_MSG_REQ,
      payload:{
        user_id : this.id
      }
    }
    this.httpService.post(payload).then(resp =>{
      console.log(resp,"resp");
    })
  }
  rejectRequest(){
    const payload ={
      url : urlConstants.API_URLS.REJECT_MSG_REQ,
      payload:{
        user_id : this.id
      }
    }
    this.httpService.post(payload).then(resp =>{
    })
  }
}
