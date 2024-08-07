import { Component, Input, OnInit } from '@angular/core';
import { ToastService } from 'src/app/core/services';
import { OrganisationService } from 'src/app/core/services/organisation/organisation.service';
import { SessionService } from 'src/app/core/services/session/session.service';

@Component({
  selector: 'app-bulk-upload',
  templateUrl: './bulk-upload.component.html',
  styleUrls: ['./bulk-upload.component.scss'],
})
export class BulkUploadComponent implements OnInit {

  @Input() data: any;
  uploadData: any;

  constructor(
    private toast: ToastService,
    private organisation: OrganisationService,
    private sessionService:SessionService
  ) { }

  ngOnInit() {}

async downloadCSV(){
  if(this.data){
      let response = await this.organisation.downloadCsv(this.data?.downloadCsvApiUrl);
      if(response){this.sessionService.openBrowser(response,"_blank")}
    }
  }

async uploadCSV(event){
    let file= event.target.files[0];
    if(file.type != 'text/csv'){
      this.toast.showToast('PLEASE_UPLOAD_CSV_FILE', 'danger')
      event.target.value='';
    }else{
      let signedUrl = await this.organisation.getSignedUrl(event.target.files[0].name);
      this.organisation.upload(event.target.files[0], signedUrl).subscribe(async () => {
        let data = await this.organisation.bulkUpload(signedUrl.filePath,this.data?.uploadCsvApiUrl);
        if(data){
          this.toast.showToast(data.message, 'success');
          event.target.value='';
        }
        (error) => event.target.value='';
      })
    }
  }

}
