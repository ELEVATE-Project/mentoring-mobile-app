import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-persona-selection-card',
  templateUrl: './persona-selection-card.component.html',
  styleUrls: ['./persona-selection-card.component.scss'],
})
export class PersonaSelectionCardComponent implements OnInit {
  @Input() personaList;
  @Output() onClickEvent = new EventEmitter();
  personaListCount: number;
  userType="";

  constructor() { }

  ngOnInit() {
    this.personaListCount = this.personaList.length - 1;
  }
  async onSelect(event){
    this.userType = event.name
    this.onClickEvent.emit(event);
  }
}
