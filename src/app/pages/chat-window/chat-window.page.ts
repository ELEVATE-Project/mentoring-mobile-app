import { Component, OnInit } from '@angular/core';

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
  messageSent : boolean = false;
  message : string = "Hi, I would like to connect with you.";
  info ={
    status:'PENDING',
    receiver_user_details: {
      name: "Nevil",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8ZmVtYWxlJTIwcHJvZmlsZXxlbnwwfHwwfHx8MA%3D%3D",
      user_roles: []
      },
      meta: {
        chat: {
        initiated: true,
        room_id: "<rocket.chat rid>"
        },
        connection: {
        initial_message: "I would like to chat with you"
        }
        }
  }
  messages ={
    'PENDING':{
        title: `Your first message to  ${this.info?.receiver_user_details?.name}`,
        subText:"You are allowed to send only one message till your message request is accepted"
    },
    'REQUESTED':{
      title: `Please wait for ${this.info?.receiver_user_details?.name} to respond.`,
      subText:`You can continue your conversation with  ${this.info?.receiver_user_details?.name} once they accept your request.`
  }
  };
  constructor() { }

  ngOnInit() {
    this.getConnectionInfo();
  }

  getConnectionInfo () {

  }
  sendRequest(){
    this.info.status = 'REQUESTED';
    this.message = "";
  }

}
