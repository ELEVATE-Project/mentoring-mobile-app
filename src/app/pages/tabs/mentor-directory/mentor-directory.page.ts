import { ChangeDetectionStrategy, Component, OnInit, ViewChild, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import * as _ from 'lodash';
import { MENTOR_DIR_CARD_FORM } from 'src/app/core/constants/formConstant';
import { urlConstants } from 'src/app/core/constants/urlConstants';
import { CacheService, HttpService, LoaderService, ToastService, UtilService } from 'src/app/core/services';
import { FormService } from 'src/app/core/services/form/form.service';
import { CommonRoutes } from 'src/global.routes';
import { LocalStorageService } from 'src/app/core/services';
import { localKeys } from 'src/app/core/constants/localStorage.keys';

@Component({
    selector: 'app-mentor-directory',
    templateUrl: './mentor-directory.page.html',
    styleUrls: ['./mentor-directory.page.scss'],
    standalone: false,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentorDirectoryPage implements OnInit {
  private readonly scrollKey = 'mentor-directory';
  private readonly CACHE_TTL = {
    mentorsDirectory: 180,
  };
  @ViewChild(IonContent) content: IonContent;

  page = signal(1);
  limit = signal(100);
  searchText = signal('');
  public headerConfig = signal({
    menu: true,
    headerColor: 'primary',
    notification: false,
  });

  mentors = signal<any[]>([]);
  mentorForm = signal<any>(null);
  mentorsCount = signal<any>(null);
  isLoaded = signal<boolean>(false);
  
  buttonConfig: any;
  currentUserId = signal<any>(null);
  isInfiniteScrollDisabled = signal<boolean>(false);
  loading = signal<boolean>(false);

  constructor(
    private router: Router,
    private loaderService: LoaderService,
    private httpService: HttpService,
    private route: ActivatedRoute,
    private toast: ToastService,
    private form: FormService,
    private localStorage: LocalStorageService,
    private cacheService: CacheService,
    private utilService: UtilService

  ) {}

  ngOnInit() {
    this.route.data.subscribe((data) => {
      this.buttonConfig = data.button_config;
    });
  }

  async ionViewWillEnter() {
    if (this.loading()) {
      this.utilService.handleScrollOnEnter(this.scrollKey, this.content);
      return;
    }
    this.loading.set(true);
    let user = await this.localStorage.getLocalData(localKeys.USER_DETAILS);
    this.currentUserId.set(user.id);
    const result = await this.form.getForm(MENTOR_DIR_CARD_FORM);
    this.mentorForm.set(_.get(result, 'data.fields.controls'));
    this.page.set(1);
    this.mentors.set([]);
    this.isInfiniteScrollDisabled.set(false);
    await this.getMentors();
    this.loading.set(false);
    this.utilService.handleScrollOnEnter(this.scrollKey, this.content);
  }

  async getMentors(showLoader = true, isLoadMore: boolean = false) {
    showLoader ? await this.loaderService.startLoader() : '';
    const searchText = this.searchText();
    const config = {
      url:
        urlConstants.API_URLS.MENTORS_DIRECTORY_LIST +
        this.page() +
        '&limit=' +
        this.limit() +
        '&search=' +
        btoa(searchText) +
        '&directory=true',
      payload: {},
    };
    try {
    const cacheKey = `MENTOR_DIRECTORY_CACHE_KEY`;

    let data: any = this.cacheService.get(cacheKey);

    if (!data) {
      data = await this.httpService.get(config);
      this.cacheService.set(cacheKey, data, this.CACHE_TTL.mentorsDirectory);
    }
      const newMentorsData = data.result.data;
      // Map button configurations
      const processedMentors = newMentorsData.map(group => ({
        ...group,
        values: group.values.map(mentor => {
          const mentorCopy = { ...mentor };
          if (mentorCopy.id === this.currentUserId()) {
            mentorCopy.buttonConfig = this.buttonConfig.map(btn => ({ ...btn, isHide: true }));
          } else {
            mentorCopy.buttonConfig = this.buttonConfig.map(btn => ({ ...btn }));
          }
          return mentorCopy;
        })
      }));

      if (isLoadMore) {
        this.mentors.set([...this.mentors(), ...processedMentors]);
      } else {
        this.mentors.set(processedMentors);
        this.mentorsCount.set(data.result.count);
      }

      this.isLoaded.set(true);
      showLoader ? await this.loaderService.stopLoader() : '';
      
      const currentMentors = this.mentors();
      let totalValues = currentMentors.reduce((acc, mentor) => acc + (mentor.values?.length || 0), 0);
      this.isInfiniteScrollDisabled.set((totalValues >= this.mentorsCount()) || (newMentorsData.length === 0));

    } catch (error) {
      this.isLoaded.set(true);
      this.isInfiniteScrollDisabled.set(true);
      showLoader ? await this.loaderService.stopLoader() : '';
    }
  }

  eventAction(event) {
    this.utilService.setSkipScroll(this.scrollKey);
    switch (event.type) {
      case 'cardSelect':
        this.router.navigate([CommonRoutes.MENTOR_DETAILS, event?.data?.id]);
        break;
      case 'chat':
        this.router.navigate([CommonRoutes.CHAT_REQ, event.data], { queryParams: { id: event.data.id } });
        break;
      case 'requestSession':
        this.router.navigate([CommonRoutes.SESSION_REQUEST], { queryParams: { data: event.data } });
        break;
    }
  }

  async loadMore(event) {
    if (!this.isInfiniteScrollDisabled()) {
      this.page.set(this.page() + 1);
      await this.getMentors(false, true);
    }
    event.target.complete();
  }

  onSearch() {
    this.router.navigate(['/' + CommonRoutes.MENTOR_SEARCH_DIRECTORY], {
      queryParams: { search: this.searchText() },
    });
  }
}
