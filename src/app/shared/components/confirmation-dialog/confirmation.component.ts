import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirmation-dialog',
  templateUrl: './confirmationdialog.component.html',
  styleUrls: ['./confirmationdialog.component.scss'],
})
export class ConfirmationDialogComponent implements OnInit{

  @Output() buttonClick = new EventEmitter()

  constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {dialogRef.disableClose = true;}
    ngOnInit() {
    }
    onCancel(){
      this.dialogRef.close();
    }

  onButtonText() {
    this.buttonClick.emit();
  }
}
