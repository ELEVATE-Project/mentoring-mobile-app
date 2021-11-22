import { Component, Input, OnInit, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { ToastService } from 'src/app/core/services';
import { CommonRoutes } from 'src/global.routes';

@Component({
  selector: 'app-session-card-template',
  templateUrl: './session-card-template.component.html',
  styleUrls: ['./session-card-template.component.scss'],
})
export class SessionCardTemplateComponent implements OnInit {
  @Input() data: any;
  @Input() showEnroll;
  @Input() showStart:boolean;
  @Input() showEdit;
  @Input() status:any;
  @Input() buttonConfig:any;
  @Output() onClickEvent = new EventEmitter();
  constructor(private router: Router, private toast:ToastService) { }

  ngOnInit() { }

  onAction(data, type) {
    let value = {
      data: data,
      type: type,
    }
    this.toast.showToast("Will be implemented!!","success")
    // this.onClickEvent.emit(value)
  }

  onCardClick(data){
    this.status=="completed" ? this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}`], { queryParams: {id: data._id}}) : this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}`], { queryParams: {id: data._id, status: this.status}})
  }
}
