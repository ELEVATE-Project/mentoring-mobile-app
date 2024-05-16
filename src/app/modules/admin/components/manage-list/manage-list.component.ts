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

  public manageUserUrls: any = {
    downloadCsvApiUrl: urlConstants.API_URLS.ADMIN_DOWNLOAD_SAMPLE_CSV,
    uploadCsvApiUrl: urlConstants.API_URLS.ADMIN_BULK_UPLOAD
  }

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
}
