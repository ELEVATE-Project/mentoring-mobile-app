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
  message : string = "Hi, I would like to connect with you."
  constructor() { }

  ngOnInit() {
  }

  sendRequest(){
    console.log(this.message,"message");
    this.messageSent = true;
  }

}
