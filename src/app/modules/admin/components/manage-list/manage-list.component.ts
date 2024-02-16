import { Component, OnInit } from '@angular/core';
import * as _ from 'lodash';
import { MENTOR_QUESTIONNAIRE, SAMPLE_CSV_DOWNLOAD_URL } from 'src/app/core/constants/formConstant';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { HttpService, ToastService, UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { OrganisationService } from 'src/app/core/services/organisation/organisation.service';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { SessionService } from 'src/app/core/services/session/session.service';

@Component({
  selector: 'app-manage-list',
  templateUrl: './manage-list.component.html',
  styleUrls: ['./manage-list.component.css']
})
export class ManageListComponent implements OnInit {

  type = 'manage-user'
  page=1;
  limit=50;
  status='REQUESTED';
  entityNames:any;
  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    label:'MANAGE_USER'
  };
  requestList: any;
  formData: any;
  constructor(private organisation: OrganisationService, private util: UtilService, private toast: ToastService, private form: FormService, private sessionService: SessionService, private profileService:ProfileService, private http: HttpService) { }

  async ngOnInit() {
    this.requestList = await this.organisation.adminRequestList(this.page,this.limit, this.status)
  }

  segmentChanged(event){
      this.type = event.target.value;
    }

    async acceptRequest(id,status){
      let message = {
        header: 'ACCEPT_REQUEST',
        message: 'ACCEPT_REQUEST_CONFIRMATION',
        cancel: 'NO',
        submit: 'YES'
      }
      this.util.alertPopup(message).then(async (data)=>{
        if(data){
          let result = await this.organisation.updateRequest(id,status)
          this.toast.showToast(result.message, "success")
          this.requestList = await this.organisation.adminRequestList(this.page,this.limit, this.status)
        }
      })
    }

    rejectRequest(id, status){
      let message = {
        header: 'REJECT_REQUEST',
        message: 'REJECT_REQUEST_CONFIRMATION',
        cancel: 'NO',
        submit: 'YES'
      }
      this.util.alertPopup(message).then(async (data)=>{
        if(data){
          let result = await this.organisation.updateRequest(id,status)
          this.toast.showToast(result.message, "success")
          this.requestList = await this.organisation.adminRequestList(this.page,this.limit, this.status)
        }
      })
    }

    async viewRequest(request){
      let form = await this.form.getForm(MENTOR_QUESTIONNAIRE)
      this.formData = _.get(form, 'data.fields');
      this.entityNames = await this.form.getEntityNames(this.formData)
      this.profileService.prefillData(request.meta,this.entityNames,this.formData,false)
      request.meta.form = this.formData
      let componenProps ={
        readonly: true,
        data: request.meta,
      }
      this.util.openModal(componenProps).then((data)=>{
      })
    }
    async downloadCSV(){
      let config = {
        url: urlConstants.API_URLS.ADMIN_DOWNLOAD_SAMPLE_CSV,
        payload: {}
      }
      this.http.get(config).then(async (response)=>{
        await this.sessionService.openBrowser(response.result,"_blank")
      })
    }
  
    async uploadCSV(event){
      let file= event.target.files[0];
      if(file.type != 'text/csv'){
        this.toast.showToast('PLEASE_UPLOAD_CSV_FILE', 'danger')
        event.target.value='';
      }else{
        let signedUrl = await this.organisation.getSignedUrl(event.target.files[0].name)
        this.organisation.upload(event.target.files[0], signedUrl).subscribe(async () => {
          let data = await this.organisation.bulkUpload(signedUrl.filePath);
          if(data){
            this.toast.showToast(data.message, 'success');
            event.target.value='';
          }
          (error) => event.target.value='';
        })
      }
    }
}
