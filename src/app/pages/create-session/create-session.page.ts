import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AttachmentService, LoaderService, LocalStorageService, ToastService } from 'src/app/core/services';
import { HttpService } from 'src/app/core/services/http/http.service';
import { SessionService } from 'src/app/core/services/session/session.service';
import {
  DynamicFormComponent,
  JsonFormData,
} from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';
import * as _ from 'lodash-es';
import { Location } from '@angular/common';
import { ActionSheetController, AlertController, ModalController, Platform } from '@ionic/angular';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { TranslateService } from '@ngx-translate/core';
import { CREATE_SESSION_FORM, MANAGERS_CREATE_SESSION_FORM, PLATFORMS } from 'src/app/core/constants/formConstant';
import { FormService } from 'src/app/core/services/form/form.service';
import { map } from 'rxjs/operators';
import { Validators } from '@angular/forms';
import { manageSessionAction, permissions } from 'src/app/core/constants/permissionsConstant';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { SearchPopoverComponent } from 'src/app/shared/components/search-popover/search-popover.component';
import { SearchCompetencyComponent } from 'src/app/shared/components/search-competency/search-competency.component';
import { PreAlertModalComponent } from 'src/app/shared/components/pre-alert-modal/pre-alert-modal.component';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import * as moment from 'moment-timezone';
import { DynamicSelectModalComponent } from 'src/app/dynamic-select-modal/dynamic-select-modal.component';
import { UtilService } from '../../core/services/util/util.service';

@Component({
  selector: 'app-create-session',
  templateUrl: './create-session.page.html',
  styleUrls: ['./create-session.page.scss'],
  standalone: false
})
export class CreateSessionPage implements OnInit {

  timezones: string[] = moment.tz.names(); // All timezones
  selectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  lastUploadedImage: boolean;
  private win: any = window;
  @ViewChild('form1') form1: DynamicFormComponent;
  @ViewChild('platformForm') platformForm: DynamicFormComponent;
  id: any = null;
  localImage;
  path;
  public headerConfig: any = {
    // menu: true,
    backButton: {
      label: '',
    },
    notification: false,
  };
  profileImageData: any = {
    type: 'session',
    haveValidationError: false
  }
  updatedFiles: any = [];
  public formData: JsonFormData;
  showForm: boolean = false;
  isSubmited: boolean;
  isNotCompleted: boolean = true;
  type: any;
  selectedLink: any;
  selectedHint: any;
  meetingPlatforms: any;
  firstStepperTitle: string;
  sessionDetails: any;
  entityNames: any
  entityList: any;
  params: any;
  editSessionDisable: boolean;
  isMobile = window.innerWidth <= 950;
  sessionType: any;
  queryParams: any;
  formConfig: any;
  mentor_id: any;
  isHome: boolean;
  isManagePage: boolean;
  user: any;
  showConnectedMentees: boolean = false;

  constructor(
    private sessionService: SessionService,
    private toast: ToastService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    private localStorage: LocalStorageService,
    private attachment: AttachmentService,
    private api: HttpService,
    private loaderService: LoaderService,
    private translate: TranslateService,
    private alert: AlertController,
    private form: FormService,
    private router: Router,
    private route: ActivatedRoute,
    private modalCtrl: ModalController,
    private permissionService: PermissionService,
    private actionSheetController: ActionSheetController,
    private utilService: UtilService,
    private cdr: ChangeDetectorRef
  ) {
  }
  ngOnInit() {

  }
  async ionViewWillEnter() {
    await this.updateFormConfig();
    this.route.queryParams.subscribe(() => this.updateFormConfig());
    this.user = await this.localStorage.getLocalData(localKeys.USER_DETAILS)
    const platformForm = await this.getPlatformFormDetails();
    const result = await this.form.getForm(this.formConfig);
    this.formData = _.get(result, 'data.fields');
    this.entityNames = await this.form.getEntityNames(this.formData);
    this.entityList = await this.form.getEntities(this.entityNames, 'SESSION');
    this.formData = await this.form.populateEntity(this.formData, this.entityList);
    this.cdr.detectChanges();
    this.permissionService.getPlatformConfig();
    this.activatedRoute.queryParamMap.subscribe(async (params) => {
      this.id = params?.get('id');
      this.headerConfig.label = this.id ? "EDIT_SESSION" : "CREATE_NEW_SESSION";
      this.type = params?.get('type') ? params?.get('type') : 'default';
      this.firstStepperTitle = (this.id) ? "EDIT_SESSION_LABEL" : "CREATE_NEW_SESSION";
      if (this.id) {
        await this.getSessionDetailsUpdate()
      } else {
        this.showForm = true;
      }
    });
    this.profileImageData.isUploaded = true;
    this.cdr.detectChanges();
  }
  async getSessionDetailsUpdate() {
    let data = await this.sessionService.getSessionDetailsAPI(this.id);
    let response = data.result;
    this.sessionDetails = response;
    this.profileImageData.image = response.image[0];
    this.profileImageData.isUploaded = true;
    response.start_date = new Date(response.start_date * 1000).toISOString();
    response.end_date = new Date(response.end_date * 1000).toISOString();
    await this.preFillData(response);
    this.editSessionDisable = (this.sessionDetails?.status?.value == 'LIVE');
    this.cdr.detectChanges();
  }

  async getPlatformFormDetails() {
    let form = await this.form.getForm(PLATFORMS);
    this.meetingPlatforms = form.data.fields.forms;
    this.selectedLink = this.meetingPlatforms[0];
    this.selectedHint = this.meetingPlatforms[0].hint;
  }

  async canPageLeave() {
    if (this.type == 'default') {
      if (!this.form1?.myForm.pristine || this.profileImageData.haveValidationError) {
        let texts: any;
        this.translate.get(['SESSION_FORM_UNSAVED_DATA', 'EXIT', 'CANCEL', 'EXIT_HEADER_LABEL']).subscribe(text => {
          texts = text;
        })
        const alert = await this.alert.create({
          header: texts['EXIT_HEADER_LABEL'],
          message: texts['SESSION_FORM_UNSAVED_DATA'],
          buttons: [
            {
              text: texts['EXIT'],
              cssClass: "alert-button-bg-white",
              role: 'exit',
              handler: () => { }
            },
            {
              text: texts['CANCEL'],
              cssClass: "alert-button-red",
              role: 'cancel',
              handler: () => { }
            }
          ]
        });
        await alert.present();
        let data = await alert.onDidDismiss();
        if (data.role == 'exit') {
          return true
        }
        return false
      } else {
        return true;
      }
    }
    return true
  }

  async handleFileUploads() {
    for (const control of this.formData.controls) {
      if (control.type === 'search' && control.meta?.addPopupType === 'file' && control.value?.length) {
        for (const file of control.value) {
          if (file?.isLink && file.link) {
            this.updatedFiles.push({
              "name": file.name,
              "link": file.link,
              "type": control.name,
              "mime_type": "link",
            });
          } else if (file.file instanceof File && file.file.name) {
            const signedUrl = await this.attachment.getImageUploadUrl(file.file);
            const uploadedFileUrl = await this.uploadFile(file.file, signedUrl);
            this.updatedFiles.push({
              "name": file.name,
              "link": uploadedFileUrl,
              "type": control.name,
              "mime_type": file.file.type,
            });
          }
          else if (file.name) {
            this.updatedFiles.push(file);
          }
        }
      }
    }
  }



  async uploadFile(file: File, signedUrl: any) {
    return new Promise((resolve, reject) => {
      this.attachment.cloudImageUpload(file, signedUrl).subscribe({
        next: () => resolve(signedUrl.destFilePath),
        error: (err) => reject(err)
      });
    });
  }

  async onSubmit() {
    if (!this.isSubmited) {
      this.form1.onSubmit();

    }
    if (this.form1.myForm.valid) {
      await this.handleFileUploads();
      const form = Object.assign({}, { ...this.form1.myForm.getRawValue(), ...this.form1.myForm.value });
      const convertedTimezones = this.utilService.convertDatesToTimezone(
        form.start_date,
        form.end_date,
        this.selectedTimezone
      );
      form.start_date = convertedTimezones.eventStartEpochInSelectedTZ / 1000;
      form.end_date = convertedTimezones.eventEndEpochInSelectedTZ / 1000;
      form.time_zone = this.selectedTimezone;
      _.forEach(this.entityNames, (entityKey) => {
        const control = this.formData.controls.find(obj => obj.name === entityKey);
        if (control) {
          form[entityKey] = control.multiple && control.type === 'chip'
            ? _.map(form[entityKey], 'value')
            : form[entityKey];
        }
      });
      if (this.profileImageData.image && !this.profileImageData.isUploaded) {
        const signedUrl = await this.attachment.getImageUploadUrl(this.localImage);
        const updatedUrl = await this.uploadFile(this.localImage, signedUrl);
        this.profileImageData.image = updatedUrl;
        form.image = [updatedUrl];
        this.profileImageData.isUploaded = true;
      }
      if (!this.profileImageData.image) {
        form.image = [];
      }
      form.mentor_id = form?.mentor_id ?? this.user.id;
      form.resources = this.updatedFiles;
      this.form1.myForm.markAsPristine();
      if (this.isManagePage) {
        form.managerFlow = true;
      }
      const result = await this.sessionService.createSession(form, this.id);
      if (result) {
        this.sessionDetails = _.isEmpty(result) ? this.sessionDetails : result;
        this.isSubmited = true;
        this.firstStepperTitle = this.id ? "EDIT_SESSION_LABEL" : "CREATE_NEW_SESSION";
        this.headerConfig.label = this.id ? "EDIT_SESSION" : "CREATE_NEW_SESSION";
        if (!this.id && result.id) {
          this.router.navigate([CommonRoutes.CREATE_SESSION], { queryParams: { id: result.id, type: 'segment' }, replaceUrl: true });
        } else {
          this.type = 'segment';
          this.cdr.detectChanges();
        }
      } else {
        this.profileImageData.image = this.lastUploadedImage;
        this.profileImageData.isUploaded = false;
      }
      if (!this.isNotCompleted)
        this.router.navigate([`/${"session-detail"}/${this.id}`], { replaceUrl: true })
    } else {
      this.toast.showToast("Please fill all the mandatory fields", "danger");
    }
  }

  resetForm() {
    this.form1.reset();
  }

  async preFillData(data) {
    let existingData = await this.form.formatEntityOptions(data, this.entityNames)


    for (let j = 0; j < this?.meetingPlatforms?.length; j++) {
      if (existingData.meeting_info.platform == this?.meetingPlatforms[j].name) {
        this.selectedLink = this?.meetingPlatforms[j];
        this.selectedHint = this.meetingPlatforms[j].hint;
        let obj = this?.meetingPlatforms[j]?.form?.controls.find((link: any) => link?.name == 'link');
        let meetingId = this?.meetingPlatforms[j]?.form?.controls.find((meetingId: any) => meetingId?.name == 'meetingId')
        let password = this?.meetingPlatforms[j]?.form?.controls.find((password: any) => password?.name == 'password')
        if (obj && existingData?.meeting_info?.link) {
          obj.value = existingData?.meeting_info?.link;
        }
        if (existingData?.meeting_info?.meta?.meetingId) {
          meetingId.value = existingData?.meeting_info?.meta?.meetingId;
          password.value = existingData?.meeting_info?.meta?.password;
        }
      }
    }

    for (let i = 0; i < this.formData.controls.length; i++) {
      this.formData.controls[i].value =
        existingData[this.formData.controls[i].name];
      this.formData.controls[i].disabled = this.formData.controls[i].name !== "post" && existingData.status.value === "COMPLETED" ? true : false;
      this.isNotCompleted = existingData.status.value !== "COMPLETED";
      if (
        this.formData.controls[i].name == "post" && existingData.status.value !== "COMPLETED"
      ) {
        this.formData.controls[i].disabled = true;
      }
      if (this.formData.controls[i].type == 'search' && this.formData.controls[i].meta.addPopupType !== 'file') {
        this.formData.controls[i].id = this.id;
        if (this.formData.controls[i].meta.multiSelect) {
          this.formData.controls[i] = {
            ...this.formData.controls[i],
            meta: {
              ...this.formData.controls[i].meta,
              searchData: existingData[this.formData.controls[i].name]
            }
          };

          this.formData.controls[i].value = this.formData.controls[i].meta.searchData ? this.formData.controls[i].meta.searchData.map(obj => obj.id || obj.value) : [];
        } else {
          if (existingData[this.formData.controls[i].name]) {
            this.formData.controls[i] = {
              ...this.formData.controls[i],
              meta: {
                ...this.formData.controls[i].meta,
                searchData: [{
                  label: `${existingData.mentor_name}, ${existingData.organization}`,
                  id: existingData[this.formData.controls[i].name]
                }]
              }
            };
          }
        }
        if (!this.formData.controls[i].meta.disableIfSelected && existingData.status.value !== "COMPLETED") {
          this.formData.controls[i].disabled = false;
        }
        if (this.formData.controls[i].meta.disableIfSelected && this.formData.controls[i].value && existingData.status.value !== "COMPLETED" && this.formData.controls[i].meta.addPopupType !== 'file') {
          if (this.formData.controls[i].name === 'mentor_id') {
            if (existingData[this.formData.controls[i].name]) {
              this.formData.controls[i].disabled = true;
            }
          } else {
            this.formData.controls[i].disabled = true;
          }
        }
      } else if (this.formData.controls[i].type === 'search' && this.formData.controls[i].meta.addPopupType === 'file') {
        const controlName = this.formData.controls[i].name;
        if (existingData.resources?.length) {
          const filteredResources = existingData.resources
            .filter(resource => resource.type === controlName)
            .map(resource =>
            ({
              label: resource.name,
              id: resource.id,
              type: resource.type,
              link: resource.link
            })
            );
          if (filteredResources) {
            this.formData.controls[i].value = filteredResources.map(r => r);

            this.formData.controls[i] = {
              ...this.formData.controls[i],
              meta: {
                ...this.formData.controls[i].meta,
                searchData: filteredResources
              }
            };
          }
        }
        this.formData.controls[i].id = this.id;
        if (!this.formData.controls[i].meta.disableIfSelected && existingData.status.value !== "COMPLETED" && this.formData.controls[i].meta.addPopupType !== 'file') {
          this.formData.controls[i].disabled = false;
        }
        if (this.formData.controls[i].meta.disableIfSelected && this.formData.controls[i].value?.length && existingData.status.value !== "COMPLETED") {
          this.formData.controls[i].disabled = true;
        }
      }
      let dependedChildIndex = this.formData.controls.findIndex(formControl => formControl.name === this.formData.controls[i].dependedChild)
      if (existingData['mentor_id']) {
        this.mentor_id = existingData['mentor_id'];
      }
      if (this.formData.controls[i].dependedChild && this.formData.controls[i].name === 'type') {
        if (existingData[this.formData.controls[i].name].value) {
          this.formData.controls[i].disabled = true;
          this.sessionType = existingData[this.formData.controls[i].name].value;
          this.formData.controls[dependedChildIndex].validators['required'] = existingData[this.formData.controls[i].name].value == 'PUBLIC' ? false : true
        }
      }
      if (this.formData.controls[i]?.name === "mentees") {
        const { isCreator } = this.route.snapshot.queryParams;
        if (!this.mentor_id) {
          this.formData.controls[i].disabled = true;
        }
        if (isCreator === 'true' && this.sessionType === 'PUBLIC') {
          this.formData.controls[i].showField = false;
        }
      }
      this.formData.controls[i].options = _.unionBy(
        this.formData.controls[i].options,
        this.formData.controls[i].value, 'value'
      );
    }
    this.formData.controls = [...this.formData.controls];
    this.showForm = true;
  }

  async imageUploadEvent(event) {
    this.localImage = event.target.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(event.target.files[0]);
    reader.onload = (file: any) => {
      this.profileImageData.image = this.lastUploadedImage = file.target.result
      this.profileImageData.isUploaded = false;
      this.profileImageData.haveValidationError = true;
      this.cdr.detectChanges();
    }
  }

  imageRemoveEvent(event) {
    this.profileImageData.image = '';
    this.form1.myForm.value.image = '';
    this.form1.myForm.markAsDirty();
    this.profileImageData.isUploaded = true;
    this.profileImageData.haveValidationError = false;
  }
  async segmentChanged(event) {
    this.type = event.target.value;
    if (this.id) {
      this.getSessionDetailsUpdate();
    }
  }
  isValid(event) {
    this.isSubmited = event;
  }
  clickOptions(event: any) {
    this.selectedHint = event.detail.value.hint;
  }
  setItLater() {
    this.id ? this.router.navigate([`/${"session-detail"}/${this.id}`], { replaceUrl: true }) : this.location.back();

  }
  onSubmitLink() {
    if (this.platformForm.myForm.valid) {
      let meetingInfo = {
        'meeting_info': {
          'platform': this.selectedLink.name,
          'link': this.platformForm.myForm.value?.link,
          'value': this.selectedLink.value,
          "meta": {
            "password": this.platformForm.myForm.value?.password,
            "meetingId": this.platformForm.myForm.value?.meetingId
          }

        }
      }
      this.sessionService.createSession(meetingInfo, this.id).then(() => {
        this.router.navigate([`/${"session-detail"}/${this.id}`], { replaceUrl: true })
      })
    }
  }

  compareWithFn(o1, o2) {
    return o1 === o2;
  };

  formValueChanged(event) {
    const formRawValue = this.form1.myForm.getRawValue();
    let dependedControlIndex = this.formData.controls.findIndex(formControl => formControl.name === event.dependedChild)
    let dependedControl = this.form1.myForm.get(event.dependedChild)
    this.sessionType = event?.value;
    if (event.value === "PUBLIC") {
      if (this.isHome) {
        this.setControlValidity(dependedControlIndex, dependedControl, false, true, false);
        return;
      }
      if ((typeof formRawValue?.mentor_id === 'string' && formRawValue?.mentor_id)) {
        this.setControlValidity(dependedControlIndex, dependedControl, false, false);
        return;
      }
      this.setControlValidity(dependedControlIndex, dependedControl, false, true);
    } else {
      if ((typeof formRawValue?.mentor_id === 'string' && formRawValue?.mentor_id) || this.isHome) {
        this.setControlValidity(dependedControlIndex, dependedControl, true, false);
        return;
      }
      this.setControlValidity(dependedControlIndex, dependedControl, true, true);
    }
    this.formData.controls.forEach(control => {
      if (control.name === "mentor_id") {
        control.disabled = false;
      }
    });

  }

  setControlValidity(index, control, required, disabled, showField = true) {
    this.formData.controls[index].validators['required'] = required;
    this.formData.controls[index].disabled = disabled;
    this.formData.controls[index].showField = showField;
    control.setValidators(required ? [Validators.required] : null);
    control.updateValueAndValidity();
  }

  eventHandler(event) {
    switch (event.type) {
      case 'addUser':
        this.showAddUserPopup(event)
        break;

      case 'addCompetency':
        this.showCompetencyPopup(event)
        break;

      case 'addUser view':
        this.viewSelectedUsers(event)
        break;

      case 'addCompetency view':
        this.viewSelectedCompetencies(event)
        break;
      case 'file':
        this.showResourcesPopup(event)
        break;
    }
  }
  handleSelectedFile(file) {
    // Handle file upload logic here
  }

  async onDynamicSelectClicked() {
    const modal = await this.modalCtrl.create({
      component: DynamicSelectModalComponent,
      componentProps: {
        items: this.timezones ? this.timezones : [],
        selectedItem: this.selectedTimezone,
        title: 'SELECT_TIMEZONE'
      }
    });

    modal.onDidDismiss().then((result) => {
      if (result.data) {
        this.selectedTimezone = result.data;
      }
    });

    return await modal.present();
  }
  async showResourcesPopup(event) {
    const modal = await this.modalCtrl.create({
      component: PreAlertModalComponent,
      cssClass: 'pre-custom-modal',
      componentProps: {
        data: event.formControl.control,
        type: 'file',
        heading: 'ADD_FILE',
        allowedFileTypes: event.formControl.control.validators.allowedFileTypes,
        maxSize: event.formControl.control.validators.maxSize,
        errorMsg: event.formControl.control.errorMessage
      },
      backdropDismiss: false
    });

    modal.onDidDismiss().then((result) => {
      if (result.data && result.data.success) {
        event.formControl.control.value = event.formControl.control.value || [];
        event.formControl.control.value.push(result.data.data);
        this.cdr.detectChanges();
      }
    });

    return await modal.present();
  }

  async showCompetencyPopup(event) {
    const popover = await this.modalCtrl.create({
      component: SearchCompetencyComponent,
      cssClass: 'small-width-popover-config',
      backdropDismiss: false,
      componentProps: {
        data: {
          selectedData: event.formControl.selectedData,
          control: event.formControl.control,
          showFilter: false,
          showSearch: true,
          viewListMode: false,
          isMobile: this.isMobile
        }
      }
    });

    popover.onDidDismiss().then((data) => {
      if (data.data) {
        event.formControl.selectedData = data.data;
        const values = event.formControl.control.meta.multiSelect ? data.data.map(obj => obj.value) : data.data[0].value;
        event.formControl.onChange(values);
        event.formControl.icon = event.formControl.selectedData.length ? event.formControl.closeIconLight : event.formControl.addIconDark
        this.cdr.detectChanges();
      }
    });
    await popover.present();
  }

  async showAddUserPopup(event) {
    const popover = await this.modalCtrl.create({
      component: SearchPopoverComponent,
      cssClass: 'large-width-popover-config',
      backdropDismiss: false,
      componentProps: {
        data: {
          selectedData: event.formControl.selectedData,
          control: event.formControl.control,
          showFilter: true,
          showSearch: true,
          viewListMode: false,
          isMobile: this.isMobile,
          sessionType: this.sessionType,
          mentorId: this.mentor_id,
          formConfig: this.isHome,
          isCreator: this.route.snapshot.queryParams.isCreator,
          showConnectedMentees: this.showConnectedMentees
        }
      }
    });

    popover.onDidDismiss().then((data) => {
      if (data.data[0]?.data?.is_mentor) {
        this.mentor_id = data.data[0]?.id;
        this.formData.controls.forEach(control => {
          if (control.name === "mentees") {
            control.disabled = false;
          }
        });
      }
      if (data.data) {
        event.formControl.selectedData = data.data;
        const values = event.formControl.control.meta.multiSelect ? data.data.map(obj => obj.id) : data.data[0].id;
        event.formControl.onChange(values);
        event.formControl.icon = event.formControl.selectedData.length ? event.formControl.closeIconLight : event.formControl.addIconDark
        this.cdr.detectChanges();
      }
    });
    await popover.present();
  }

  async viewSelectedUsers(event) {
    const popover = await this.modalCtrl.create({
      component: SearchPopoverComponent,
      cssClass: 'large-width-popover-config',
      backdropDismiss: false,
      componentProps: {
        data: {
          selectedData: event.formControl.selectedData,
          control: event.formControl.control,
          showFilter: false,
          showSearch: false,
          viewListMode: true,
          isMobile: this.isMobile,
          disablePaginator: true
        }
      }
    });

    popover.onDidDismiss().then((data) => {
      if (data.data) {
        event.formControl.selectedData = data.data
        const values = event.formControl.selectedData.length
          ? (event.formControl.control.meta.multiSelect ? event.formControl.selectedData.map(obj => obj.id) : event.formControl.selectedData[0].id)
          : (event.formControl.control.meta.multiSelect ? [] : '');
        event.formControl.onChange(values);
        event.formControl.icon = event.formControl.selectedData.length ? event.formControl.closeIconLight : event.formControl.addIconDark
        this.cdr.detectChanges();
      }
    });
    await popover.present();
  }

  async viewSelectedCompetencies(event) {
    const popover = await this.modalCtrl.create({
      component: SearchCompetencyComponent,
      cssClass: 'small-width-popover-config',
      backdropDismiss: false,
      componentProps: {
        data: {
          selectedData: event.formControl.selectedData,
          control: event.formControl.control,
          showFilter: false,
          showSearch: false,
          viewListMode: true,
          isMobile: this.isMobile
        }
      }
    });

    popover.onDidDismiss().then((data) => {
      if (data.data) {
        event.formControl.selectedData = data.data
        const values = event.formControl.selectedData.length
          ? (event.formControl.control.meta.multiSelect ? event.formControl.selectedData.map(obj => obj.value) : event.formControl.selectedData[0].value)
          : (event.formControl.control.meta.multiSelect ? [] : '');
        event.formControl.onChange(values);
        event.formControl.icon = event.formControl.selectedData.length ? event.formControl.closeIconLight : event.formControl.addIconDark
        this.cdr.detectChanges();
      }
    });
    await popover.present();
  }

  async updateFormConfig() {
    const { source, isCreator } = this.route.snapshot.queryParams;
    this.isHome = source === 'home';
    this.isManagePage = source === 'manage';

    const hasPermission = await this.permissionService.hasPermission({
      module: permissions.MANAGE_SESSION,
      action: manageSessionAction.SESSION_ACTIONS,
    });
    if (
      (this.isManagePage && hasPermission) ||
      (!this.isHome && isCreator != 'true' && hasPermission)
    ) {
      this.showConnectedMentees = false;
      this.formConfig = MANAGERS_CREATE_SESSION_FORM;
    } else {
      this.showConnectedMentees = true;
      this.formConfig = CREATE_SESSION_FORM;
    }
  }

  async modalDismiss() {
    const topModal = await this.modalCtrl.getTop();
    if (topModal) {
      this.modalCtrl.dismiss();
    }
  }

  ionViewWillLeave() {
    this.formData = null;
    this.sessionType = '';
    this.modalDismiss();
  }
}