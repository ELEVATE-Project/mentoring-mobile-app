import { Component, Input, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import {MatTableModule} from '@angular/material/table';
import { ModalController } from '@ionic/angular';
import { SortingModuleComponent } from '../sorting-module/sorting-module.component';


@Component({
  selector: 'app-generic-table',
  templateUrl: './generic-table.component.html',
  styleUrls: ['./generic-table.component.scss'],
})

export class GenericTableComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @Input() columnData;
  @Input() tableData;
  @Output() onClickEvent = new EventEmitter();
  dataSource: MatTableDataSource<any>;
  displayedColumns:any;
  pageSizeOptions: number[] = [5, 10, 25, 100];
  pageSize = this.pageSizeOptions[0];
 
  constructor(private modalCtrl: ModalController) { }
 

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit() {
    
  this.displayedColumns = this.columnData.map(column => column.name);
    this.dataSource = new MatTableDataSource(this.tableData);
  }

  onCellClick(column:any,element:any){
    let value={
      column: column,
      element: element,
      type:'clickCell'
    }
    this.onClickEvent.emit(value)
  }

  async onClickSorting(event: any, column:any){
    let modal = await this.modalCtrl.create({
            component: SortingModuleComponent,
            cssClass: 'example-modal',
            componentProps: { data:column},

          });
          modal.present().then(() => {
            const modalElement = document.querySelector('ion-modal');
            if (modalElement) {
              const offsetTop = event.clientY - modalElement.clientHeight / 2;
              const offsetLeft = event.clientX - modalElement.clientWidth / 2;
      
              modalElement.style.setProperty('top', offsetTop + 'px');
              modalElement.style.setProperty('left', offsetLeft + 'px');
            }
          });
  }

}
