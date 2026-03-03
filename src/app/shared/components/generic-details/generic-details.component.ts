import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UtilService } from 'src/app/core/services';

@Component({
    selector: 'app-generic-details',
    templateUrl: './generic-details.component.html',
    styleUrls: ['./generic-details.component.scss'],
    standalone: false
})
export class GenericDetailsComponent implements OnInit, OnChanges {
  @Input() sessionData: any;
  @Input() isMentor: any;
  @Output() onViewList = new EventEmitter();
  preResources: any[] = [];
  postResources: any[] = [];
  isImageModalOpen = false;
  selectedImageUrl: string | null = null;
  constructor(private utilService: UtilService) { }
  
  public isArray(arr:any ) {
    return Array.isArray(arr)
 }

  ngOnInit() {
    if (this.sessionData?.controls) {
      this.sessionData.controls = this.sessionData.controls.sort((a, b) =>
        (a.sequence ?? Infinity) - (b.sequence ?? Infinity)
      );
    }
    this.updateResources();
  }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes.sessionData && changes.sessionData.currentValue) {
      this.updateResources();
    }
  }

  get hasPreResources(): boolean {
    return this.preResources.length > 0;
  }

  get showPostResources(): boolean {
    return this.postResources.length > 0 && this.sessionData?.data?.status?.value === 'COMPLETED';
  }

  private updateResources(): void {
    const resources = this.sessionData?.data?.resources || [];
    this.preResources = resources.filter(res => res.type === 'pre');
    this.postResources = resources.filter(res => res.type === 'post');
  }

  onClickViewList(){ 
    this.onViewList.emit()
  }

  getFileType(data: any) {
    const link: string | undefined = data?.link;
    if (!link) return 'other';
    const normalizedLink = link.split('#')[0].split('?')[0];
    const extension = normalizedLink.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    }
    return 'other';
  }

  async downloadFile($event: Event, resource: any) {
      if (resource?.mime_type ==='link') {
      return; 
      }
    $event.preventDefault()
    await this.utilService.downloadFile(resource.link, resource.name, resource.mime_type);
  }

  openImageModal(url: string) {
    this.selectedImageUrl = url;
    this.isImageModalOpen = true;
  }
  
  closeImageModal() {
    this.selectedImageUrl = null;
    this.isImageModalOpen = false;
  }

  shouldShowControl(item: any): boolean {
    const menteeForm = this.sessionData?.menteeForm || [];
    const isInMenteeForm = menteeForm.includes(item?.title);
    const allowedByRole = !isInMenteeForm || !this.isMentor;
    const isVisible = item?.visible !== undefined ? item.visible : true;
    const isMainVisibility = item?.visibility === 'main' || !item?.visibility;
    return allowedByRole && isVisible && isMainVisibility;
  }
}
