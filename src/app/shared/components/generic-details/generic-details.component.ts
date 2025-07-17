import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-generic-details',
  templateUrl: './generic-details.component.html',
  styleUrls: ['./generic-details.component.scss'],
})
export class GenericDetailsComponent implements OnInit, OnChanges {
  @Input() sessionData: any;
  @Input() isMentor: any;
  @Output() onViewList = new EventEmitter();
  preResources = [];
  postResources = [];
  isImageModalOpen = false;
selectedImageUrl: string | null = null;
  constructor() { }
  
  public isArray(arr:any ) {
    return Array.isArray(arr)
 }

  ngOnInit() {
    const resources = this.sessionData?.data?.resources || [];
    this.preResources = resources.filter(res => res.type === 'pre');
    this.postResources = resources.filter(res => res.type === 'post');
  }


    ngOnChanges(changes: SimpleChanges): void {
    if (changes.sessionData && changes.sessionData.currentValue) {
      const resources = this.sessionData.data.resources || [];
      this.preResources = resources.filter(res => res.type === 'pre');
      this.postResources = resources.filter(res => res.type === 'post');
    }
  }

  onClickViewList(){ 
    this.onViewList.emit()
  }

  getFileType(data: any) {
    if (!data) return 'other';
    const link : string = data.link;
    const extension = link.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    }
    return 'other';
  }

  openImageModal(url: string) {
    this.selectedImageUrl = url;
    this.isImageModalOpen = true;
  }
  
  closeImageModal() {
    this.selectedImageUrl = null;
    this.isImageModalOpen = false;
  }
}
