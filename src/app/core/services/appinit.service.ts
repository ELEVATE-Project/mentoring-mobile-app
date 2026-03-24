import { ChangeDetectorRef, Injectable, NgZone, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, MenuController, Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core';
import { localKeys } from 'src/app/core/constants/localStorage.keys';
import {
    AuthService,
    DbService,
    LocalStorageService,
    NetworkService,
    UserService,
    UtilService,
} from '.';
import { ProfileService } from './profile/profile.service';
import { CommonRoutes } from 'src/global.routes';
import { App, URLOpenListenerEvent } from '@capacitor/app';
import { environment } from 'src/environments/environment';
import { Location } from '@angular/common';
import * as _ from 'lodash-es';
import { PermissionService } from './permission/permission.service';
import { permissionModule } from 'src/app/core/constants/permissionsConstant';
import { PAGE_IDS } from 'src/app/core/constants/page.ids';
import {
    FrontendChatLibraryService,
    RocketChatApiService,
} from 'sl-chat-library';
import { APP_PAGES, ADMIN_PAGE } from '../../modules/private/pages.constants';

@Injectable({
    providedIn: 'root'
})
export class PrivateService {
    user = signal<any>(null);
    isMentor = signal<boolean>(false);
    adminAccess = signal<boolean>(false);
    userRoles = signal<any>(null);

    private readonly allAppPages = signal(_.cloneDeep(APP_PAGES));
    public appPages = signal(_.cloneDeep(APP_PAGES));
    public adminPage = ADMIN_PAGE;
    chatConfig: any;

    actionsArrays: any[] = permissionModule.MODULES;
    userEventSubscription: any;
    backButtonSubscription: any;

    constructor(
        private translate: TranslateService,
        private platform: Platform,
        private localStorage: LocalStorageService,
        public menuCtrl: MenuController,
        private userService: UserService,
        private utilService: UtilService,
        private db: DbService,
        private router: Router,
        private network: NetworkService,
        private authService: AuthService,
        private profile: ProfileService,
        private zone: NgZone,
        private _location: Location,
        private alert: AlertController,
        private permissionService: PermissionService,
        private chatService: FrontendChatLibraryService,
        private rocketChatService: RocketChatApiService
    ) { }

    async initializeApp() {
        await this.platform.ready();
        this.network.netWorkCheck();
        this.applyTheme();

        await new Promise<void>((resolve) => {
            setTimeout(async () => {
                this.languageSetting();
                this.setHeader();
                const userDetails = await this.localStorage.getLocalData(
                    localKeys.USER_DETAILS
                );

                if (userDetails) {
                    this.profile.getUserRole(userDetails);
                    this.isMentor.set(this.profile.isMentor);
                    this.adminAccess.set(userDetails.permissions
                        ? this.permissionService.hasAdminAcess(
                            this.actionsArrays,
                            userDetails?.permissions
                        )
                        : false);
                }
                await this.permissionService.getPlatformConfig();
                await this.profile.getChatToken();
                this.getUser();
                resolve();
            }, 0);
        });

        this.db.init();
        
        await new Promise<void>((resolve) => {
            setTimeout(async () => {
                this.userRoles.set(await this.localStorage.getLocalData(
                    localKeys.USER_ROLES
                ));
                resolve();
            }, 1000);
        });

        setTimeout(() => {
            document
                .querySelector('ion-menu')
                ?.shadowRoot?.querySelector('.menu-inner')
                ?.setAttribute('style', 'border-radius:8px 8px 0px 0px');
        }, 2000);

        this.userEventSubscription = this.userService.userEventEmitted$.subscribe(
            (data) => {
                if (data) {
                    this.isMentor.set(this.profile.isMentor);
                    this.user.set(data);
                    this.adminAccess.set(data.permissions
                        ? this.permissionService.hasAdminAcess(
                            this.actionsArrays,
                            data?.permissions
                        )
                        : false);
                }
            }
        );

        App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
            this.zone.run(() => {
                const domain = window.location.origin;
                const slug = event.url.split(domain).pop();
                if (slug) {
                    this.router.navigateByUrl(slug);
                }
            });
        });

        this.subscribeBackButton();
        await this.checkBadges();
        this.chatConfig = await this.localStorage.getLocalData(localKeys['CHAT_CONFIG']);
        this.syncVisibleAppPages();
    }

    private isChatEnabled(): boolean {
        const isEnabled = String(this.chatConfig) === 'true';
        return false;
    }

    private syncVisibleAppPages(): void {
        const isChatEnabled = this.isChatEnabled();
        const pages = this.allAppPages().map((page: any) => {
            if ([PAGE_IDS.myConnections, PAGE_IDS.messages].includes(page.pageId)) {
                return {
                    ...page,
                    showTab: isChatEnabled,
                };
            }

            return {
                ...page,
                showTab: page.showTab ?? true,
            };
        });

        this.appPages.set(pages);
    }

    applyTheme() {
        let theme: any = localStorage.getItem('theme');
        if (theme) {
            try {
                theme = JSON.parse(theme);
                document.documentElement.style.setProperty('--ion-color-primary', theme.primaryColor);
                document.documentElement.style.setProperty('--ion-color-secondary', theme.secondaryColor);
            } catch (error) {
                console.error("Error parsing theme from localStorage:", error);
            }
        }
    }

    async checkBadges() {
        if (this.isMentor()) {
            const response = await this.profile.getRequestCount();
            const { result = {} } = response || {};
            const { sessionRequestCount = 0, connectionRequestCount = 0 } = result || {};
            if (sessionRequestCount > 0 || connectionRequestCount > 0) {
                this.appPages.update(pages => {
                    const page = pages.find(p => p.pageId === PAGE_IDS.requests);
                    if (page) {
                        page.badge = true;
                    }
                    return [...pages];
                });
            }
            this.updateBadgeFlag();
        }
        await this.rocketChatService.initializeWebSocketAndCheckUnread();

        if (this.chatService.initialBadge) {
            this.appPages.update(pages => {
                const page = pages.find(p => p.pageId === PAGE_IDS.messages);
                if (page) {
                    page.badge = this.chatService.initialBadge;
                }
                return [...pages];
            });
        }
        this.updateBadgeFlag();

        this.chatService.showBadge.subscribe((resp: boolean) => {
            this.appPages.update(pages => {
                const page = pages.find(p => p.pageId === PAGE_IDS.messages);
                if (page) {
                    page.badge = resp;
                }
                return [...pages];
            });
            this.updateBadgeFlag();
        });
    }

    updateBadgeFlag() {
        const hasBadge = this.appPages().some(p => p.badge);
        this.utilService.setHasBadge(hasBadge);
    }

    subscribeBackButton() {
        this.backButtonSubscription =
            this.platform.backButton.subscribeWithPriority(10, async () => {
                if (this._location.isCurrentPathEqualTo('/tabs/home')) {
                    let texts: any;
                    this.translate
                        .get(['EXIT_CONFIRM_MESSAGE', 'CANCEL', 'CONFIRM'])
                        .subscribe((text) => {
                            texts = text;
                        });
                    const alert = await this.alert.create({
                        message: texts['EXIT_CONFIRM_MESSAGE'],
                        buttons: [
                            {
                                text: texts['CANCEL'],
                                role: 'cancel',
                                cssClass: 'alert-button-bg-white',
                                handler: () => { },
                            },
                            {
                                text: texts['CONFIRM'],
                                role: 'confirm',
                                cssClass: 'alert-button',
                                handler: () => {
                                    navigator['app'].exitApp();
                                },
                            },
                        ],
                    });
                    await alert.present();
                } else {
                    this._location.back();
                }
            });
    }

    setHeader() {
        this.userService.getUserValue();
    }

    languageSetting() {
        this.localStorage
            .getLocalData(localKeys.SELECTED_LANGUAGE)
            .then((data) => {
                if (data) {
                    this.translate.use(data);
                } else {
                    this.setLanguage('en');
                }
            })
            .catch((error) => {
                this.setLanguage('en');
            });
    }

    setLanguage(lang) {
        this.localStorage
            .setLocalData(localKeys.SELECTED_LANGUAGE, lang)
            .then((data) => {
                this.translate.use(lang);
            })
            .catch((error) => {
                this.translate.use(lang);
            });
    }

    logout() {
        let msg = {
            header: 'LOGOUT',
            message: 'LOGOUT_CONFIRM_MESSAGE',
            cancel: 'CANCEL',
            submit: 'LOGOUT',
        };
        this.utilService
            .alertPopup(msg)
            .then(async (data) => {
                if (data) {
                    await this.localStorage.setLocalData(
                        localKeys.SELECTED_LANGUAGE,
                        'en'
                    );
                    this.translate.use('en');
                    await this.authService.logoutAccount();
                    this.menuCtrl.enable(false);
                }
            })
            .catch((error) => { });
    }

    getUser() {
        this.applyTheme();
        this.profile.getProfileDetailsFromAPI().then(profileDetails => {
            if (profileDetails?.organizations && profileDetails?.organizations.length == 1) {
                this.authService.setUserInLocal(profileDetails);
            } else if (profileDetails?.organizations && profileDetails?.organizations.length > 1) {
                // this.showOrganizationModal(profileDetails?.result?.user?.organizations);
            }
            this.adminAccess.set(profileDetails?.permissions ? this.permissionService.hasAdminAcess(this.actionsArrays, profileDetails?.permissions) : false);
            this.user.set(profileDetails);
            if (profileDetails?.profile_mandatory_fields && profileDetails?.profile_mandatory_fields.length > 0 || !profileDetails?.about) {
                this.router.navigate([`/${CommonRoutes.EDIT_PROFILE}`], { replaceUrl: true, queryParams: { redirectUrl: '/tabs/home' } });
            }
            this.isMentor.set(this.profile.isMentor);
        })
    }

    async viewRoles() {
        const userRoles = await this.localStorage.getLocalData(
            localKeys.USER_ROLES
        );
        this.profile.viewRolesModal(userRoles);
    }

    goToProfilePage() {
        this.menuCtrl.toggle();
        this.router.navigate([`${CommonRoutes.TABS}/${CommonRoutes.PROFILE}`]);
    }

    async menuItemAction(menu) {
        this.router.navigate([menu.url]);
    }
}
