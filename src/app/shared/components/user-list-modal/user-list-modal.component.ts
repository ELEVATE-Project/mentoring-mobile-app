import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { UtilService } from 'src/app/core/services';

@Component({
  selector: 'app-user-list-modal',
  templateUrl: './user-list-modal.component.html',
  styleUrls: ['./user-list-modal.component.scss'],
})
export class UserListModalComponent implements OnInit {
  @Input() data: any;

  constructor(private modal: ModalController, private utilService: UtilService) { }

  ngOnInit() {}

  closeModal(){
    this.modal.dismiss()
  }

  snakeToNormalText(roles){
    let result =this.utilService.snakeToNormal(roles);
    return result
  }
}
