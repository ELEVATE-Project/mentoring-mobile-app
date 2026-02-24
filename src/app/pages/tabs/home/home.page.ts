import { HttpClient } from '@angular/common/http';
import { Component, OnInit, ViewChild, signal, computed } from '@angular/core';
import { JsonFormData } from 'src/app/shared/components/dynamic-form/dynamic-form.component';
import { CommonRoutes } from 'src/global.routes';
import { ModalController, NavController, IonContent } from '@ionic/angular';
import { SKELETON } from 'src/app/core/constants/skeleton.constant';
import { Router } from '@angular/router';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import { ProfileService } from 'src/app/core/services/profile/profile.service';
import { HttpService, LoaderService, LocalStorageService, ToastService, UserService, UtilService } from 'src/app/core/services';
import { SessionService } from 'src/app/core/services/session/session.service';
import { TermsAndConditionsPage } from '../../terms-and-conditions/terms-and-conditions.page';
import { Capacitor } from '@capacitor/core';
import { PermissionService } from 'src/app/core/services/permission/permission.service';
import { environment } from 'src/environments/environment';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CdkConnectedOverlay } from '@angular/cdk/overlay';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage {
  public formData: JsonFormData;
  user = signal<any>(null);
  public isLoading = signal<boolean>(false);
  SESSIONS: string = CommonRoutes.SESSIONS;
  SKELETON = SKELETON;
  page = 1;
  limit = 100;
  sessions = signal<any>(null);
  sessionsCount = 0;
  isNativeApp = Capacitor.isNativePlatform()
  status = "PUBLISHED,LIVE";
  showBecomeMentorCard = signal<boolean>(false);
  @ViewChild(IonContent) content: IonContent;
  @ViewChild(CdkConnectedOverlay) connectedOverlay: CdkConnectedOverlay;
  sessionForm: FormGroup;

  public headerConfig: any = {
    menu: true,
    notification: true,
    headerColor: 'primary',
    // label:'MENU'
  };
  public segmentButtons = [{ name: "all-sessions", label: "ALL_SESSIONS" }, { name: "created-sessions", label: "MY_MENTORING_SESSIONS" }, { name: "my-sessions", label: "ENROLLED_SESSIONS" }]
  public mentorSegmentButton = ["created-sessions"]
  selectedSegment = signal<string>("all-sessions");
  createdSessions = signal<any>(null);
  isMentor = signal<boolean>(false);
  userEventSubscription: any;
  isOpen = false;
  chips = signal<any[]>([]);
  criteriaChip: any;
  searchText: string;
  isCreatedSessions = signal<boolean>(false);
  isEnrolledSession = signal<boolean>(false);

  allSessionsCount = signal<number>(0);
  createdSessionsCount = signal<number>(0);
  enrolledSessionsCount = signal<number>(0);

  constructor(
    private router: Router,
    private profileService: ProfileService,
    private sessionService: SessionService,
    private modalController: ModalController,
    private userService: UserService,
    private localStorage: LocalStorageService,
    private toast: ToastService,
    private permissionService: PermissionService,
    private utilService: UtilService,
    private fb: FormBuilder) {
    this.sessionForm = this.fb.group({
      date: [''],
      time: [''],
      duration: [''],
      link: ['']
    });
  }



  gotToTop() {
    this.content.scrollToTop(1000);
  }
  async ionViewWillEnter() {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.isCreatedSessions.set(false);
    this.isEnrolledSession.set(false);
    this.page = 1;
    this.sessions.set(null);
    this.createdSessions.set(null);
    await this.getUser();
    let roles = await this.localStorage.getLocalData(localKeys.USER_ROLES);
    this.isMentor.set(roles?.includes('mentor') ? true : false);
    this.gotToTop();
    let isRoleRequested = await this.localStorage.getLocalData(localKeys.IS_ROLE_REQUESTED);;
    let isBecomeMentorTileClosed = await this.localStorage.getLocalData(localKeys.IS_BECOME_MENTOR_TILE_CLOSED);
    this.showBecomeMentorCard.set((isRoleRequested || this.isMentor() || isBecomeMentorTileClosed) ? false : true);
    if (!this.userEventSubscription) {
      this.userEventSubscription = this.userService.userEventEmitted$.subscribe(data => {
        if (data) {
          this.user.set(data);
        }
      });
    }
    if (this.user() && !this.user().profile_mandatory_fields.length) {
      await this.loadSegmentData(this.selectedSegment());
    }
    if (this.chips().length == 0) {
      this.permissionService.getPlatformConfig().then((config) => {
        this.chips.set(config.result.search_config.search.session.fields);
      });
    }

    this.isLoading.set(false);
  }

  async loadSegmentData(segmentName: string, isLoadMore: boolean = false) {
    this.isCreatedSessions.set(false);
    this.isEnrolledSession.set(false);
    switch (segmentName) {
      case 'all-sessions':
        await this.getSessions('all', isLoadMore);
        break;
      case 'created-sessions':
        if (this.isMentor()) {
          var obj = { page: this.page, limit: this.limit, searchText: "" };
          let data = await this.sessionService.getAllSessionsAPI(obj);
          if (!data || !data.data || data.data.length === 0) {
            this.isCreatedSessions.set(true);
          }
          if (isLoadMore && this.createdSessions()?.data) {
            this.createdSessions.update(prev => ({ ...prev, data: [...prev.data, ...data.data] }));
          } else {
            this.createdSessions.set(data);
          }
          this.createdSessionsCount.set(data?.count || 0);
        } else {
          this.createdSessions.set({ data: [] });
          this.createdSessionsCount.set(0);
        }
        break;
      case 'my-sessions':
        await this.getSessions('my', isLoadMore);
        break;
    }
  }
  async eventAction(event) {
    if (this.user()?.about || environment['isAuthBypassed']) {
      switch (event.type) {
        case 'cardSelect':
          this.router.navigate([`/${CommonRoutes.SESSIONS_DETAILS}/${event.data.id}`]);
          break;

        case 'joinAction':
          await this.sessionService.joinSession(event.data)
          this.page = 1;
          await this.loadSegmentData(this.selectedSegment());
          break;

        case 'enrollAction':
          let enrollResult = await this.sessionService.enrollSession(event.data.id);
          if (enrollResult.result) {
            this.toast.showToast(enrollResult.message, "success")
            this.page = 1;
            await this.loadSegmentData(this.selectedSegment());
          }
          break;

        case 'startAction':
          this.sessionService.startSession(event.data.id).then(async () => {
            this.page = 1;
            await this.loadSegmentData(this.selectedSegment());
          })
          break;
      }
    } else {
      this.profileService.upDateProfilePopup()
    }
  }
  viewMore(data) {
    this.router.navigate([`/${CommonRoutes.SESSIONS}`], { queryParams: { type: data } });
  }

  search(event: string) {
    this.isOpen = false;
    if (event && event.length >= 3) {
      this.searchText = event ? event : "";
      this.utilService.subscribeSearchText(this.searchText);
      this.utilService.subscribeCriteriaChip(JSON.stringify(this.criteriaChip))
      this.router.navigate([`/${CommonRoutes.HOME_SEARCH}`], {
        queryParams: {
          search: this.searchText,
          chip: this.criteriaChip?.name
        }
      });
    } else {
      this.toast.showToast("ENTER_MIN_CHARACTER", "danger");
    }
  }
  async getUser() {
    let data = await this.profileService.getProfileDetailsFromAPI();
    this.user.set(data);
    if (!this.user()?.terms_and_conditions) {
      // this.openModal();
    }
  }

  async getSessions(scope: string = 'all', isLoadMore: boolean = false) {
    var obj = { page: this.page, limit: this.limit, scope: scope };
    let data = await this.sessionService.getSessions(obj);

    if (scope === 'all') {
      if (isLoadMore && this.sessions()?.all_sessions) {
        this.sessions.update(prev => ({ ...prev, all_sessions: [...prev.all_sessions, ...(data.result.all_sessions || [])] }));
      } else {
        this.sessions.set(data.result);
      }
      this.allSessionsCount.set(data.result.allSessions_count || 0);
    } else if (scope === 'my') {
      if (isLoadMore && this.sessions()?.my_sessions) {
        this.sessions.update(prev => ({ ...prev, my_sessions: [...prev.my_sessions, ...(data.result.my_sessions || [])] }));
      } else {
        this.sessions.set(data.result);
      }
      if (!this.sessions()?.my_sessions || this.sessions()?.my_sessions.length === 0) {
        this.isEnrolledSession.set(true);
      }
      this.enrolledSessionsCount.set(data.result.my_sessions_count || 0);
    }
  }

  async openModal() {
    const modal = await this.modalController.create({
      component: TermsAndConditionsPage,
      backdropDismiss: false,
    });
    return await modal.present();
  }
  async segmentChanged(event) {
    this.selectedSegment.set(event.name);
    this.page = 1;
    await this.loadSegmentData(this.selectedSegment());
  }
  async createSession() {
    if (this.user()?.about != null || environment['isAuthBypassed']) {
      this.router.navigate([`${CommonRoutes.CREATE_SESSION}`], { queryParams: { source: 'home' } });
    } else {
      this.profileService.upDateProfilePopup()
    }
  }

  async becomeMentor() {
    if (this.user()?.about != null || environment['isAuthBypassed']) {
      this.router.navigate([`/${CommonRoutes.MENTOR_QUESTIONNAIRE}`]);
    } else {
      this.profileService.upDateProfilePopup()
    }
  }

  async closeCard() {
    this.showBecomeMentorCard.set(false);
    await this.localStorage.setLocalData(localKeys.IS_BECOME_MENTOR_TILE_CLOSED, true)
  }

  async loadMore(event) {
    this.page++;
    await this.loadSegmentData(this.selectedSegment(), true);
    event.target.complete();
  }

  isInfiniteScrollDisabled = computed(() => {
    switch (this.selectedSegment()) {
      case 'all-sessions':
        const allSessionsLength = this.sessions()?.all_sessions?.length || 0;
        return allSessionsLength >= this.allSessionsCount() || allSessionsLength === 0;

      case 'created-sessions':
        const createdSessionsLength = this.createdSessions()?.data?.length || 0;
        return createdSessionsLength >= this.createdSessionsCount() || createdSessionsLength === 0;

      case 'my-sessions':
        const enrolledSessionsLength = this.sessions()?.my_sessions?.length || 0;
        return enrolledSessionsLength >= this.enrolledSessionsCount() || enrolledSessionsLength === 0;
      default:
        return true;
    }
  });

  ngOnDestroy(): void {
    if (this.userEventSubscription) {
      this.userEventSubscription.unsubscribe();
    }
  }

  selectChip(chip: any) {
    if (this.criteriaChip === chip) {
      this.criteriaChip = null;
    } else {
      this.criteriaChip = chip;
    }
  }

  ionViewWillLeave() {
    this.isOpen = false;
    this.isLoading.set(false);
    if (this.connectedOverlay && this.connectedOverlay.overlayRef) {
      this.connectedOverlay.overlayRef.detach();
    }
  }

  ionViewDidLeave() {
    this.criteriaChip = '';
    this.searchText = '';
    this.page = 1;
  }
}
