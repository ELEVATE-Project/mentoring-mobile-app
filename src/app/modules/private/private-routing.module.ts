import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PrivatePage } from './private.page';
import { CommonRoutes } from 'src/global.routes';
import { PrivateGuard } from 'src/app/core/guards/private.guard';
import { CREATE_SESSION_FORM } from 'src/app/core/constants/formConstant';
import { PAGE_IDS } from 'src/app/core/constants/page.ids';
import { AllowPageAccess } from 'src/app/core/guards/allowPageAccess/allowPageAccess.guard';

const routes: Routes = [
  {
    path: '',
    component: PrivatePage,
    children: [
      {
        path: '',
        loadChildren: () => import('../../pages/tabs/tabs.module').then(m => m.TabsPageModule),
        canActivate: [PrivateGuard]
      },
      {
        path: CommonRoutes.SESSIONS,
        loadChildren: () => import('../../pages/sessions/sessions.module').then(m => m.SessionsPageModule),
        canActivate: [PrivateGuard]
      },
      {
        path: CommonRoutes.FEEDBACK,
        loadChildren: () => import('../../pages/feedback/feedback.module').then(m => m.FeedbackPageModule),
        canActivate: [PrivateGuard]
      },
      {
        path: CommonRoutes.SESSIONS_DETAILS,
        loadChildren: () => import('../../pages/session-detail/session-detail.module').then(m => m.SessionDetailPageModule),
        canActivate: [PrivateGuard]
      },
      {
        path: CommonRoutes.CREATE_SESSION,
        loadChildren: () => import('../../pages/create-session/create-session.module').then(m => m.CreateSessionPageModule),
        canActivate: [PrivateGuard],
      },
      {
        path: CommonRoutes.CREATED_BY_ME,
        loadChildren: () => import('../../pages/created-by-me/created-by-me.module').then(m => m.CreatedByMePageModule),
        canActivate: [PrivateGuard]
      },
      {
        path: CommonRoutes.EDIT_PROFILE,
        loadChildren: () => import('../../pages/edit-profile/edit-profile.module').then(m => m.EditProfilePageModule),
        canActivate: [PrivateGuard, AllowPageAccess],
        data: {
          pageId: PAGE_IDS.editProfile
        }
      },
      {
        path: CommonRoutes.HOME_SEARCH,
        loadChildren: () => import('../../pages/home-search/home-search.module').then(m => m.HomeSearchPageModule),
        canActivate: [PrivateGuard]
      },
      {
        path: CommonRoutes.MENTOR_DETAILS,
        loadChildren: () => import('../../pages/mentor-details/mentor-details.module').then(m => m.MentorDetailsPageModule),
        canActivate: [PrivateGuard]
      },
      {
        path: CommonRoutes.TERMS_AND_CONDITIONS,
        loadChildren: () => import('../../pages/terms-and-conditions/terms-and-conditions.module').then(m => m.TermsAndConditionsPageModule),
        canActivate: [PrivateGuard]
      },
      {
        path: CommonRoutes.HELP,
        loadChildren: () => import('../../pages/help/help.module').then(m => m.HelpPageModule),
        canActivate: [PrivateGuard, AllowPageAccess],
        data: {
          pageId: PAGE_IDS.help
        }
      },
      {
        path: CommonRoutes.FAQ,
        loadChildren: () => import('../../pages/faq/faq.module').then(m => m.FaqPageModule),
        canActivate: [PrivateGuard, AllowPageAccess],
        data: {
          pageId: PAGE_IDS.faq
        }
      },
      {
        path: CommonRoutes.LANGUAGE,
        loadChildren: () => import('../../pages/language/language.module').then(m => m.LanguagePageModule),
        canActivate: [PrivateGuard, AllowPageAccess],
        data: {
          pageId: PAGE_IDS.language
        }
      },
      {
        path: CommonRoutes.HELP_VIDEOS,
        loadChildren: () => import('../../pages/help-video/help-video.module').then(m => m.HelpVideoPageModule),
        canActivate: [PrivateGuard, AllowPageAccess],
        data: {
          pageId: PAGE_IDS.helpVideos
        }
      },
      {
        path: CommonRoutes.MENTOR_QUESTIONNAIRE,
        loadChildren: () => import('../../pages/mentor-questionnaire/mentor-questionnaire.module').then(m => m.MentorQuestionnairePageModule),
        canActivate: [PrivateGuard]
      },
      {
        path: CommonRoutes.ADMIN,
        loadChildren: () => import('../../modules/admin/admin.module').then(m => m.AdminModule),
        canActivate: [PrivateGuard, AllowPageAccess],
        data: {
          pageId: PAGE_IDS.adminWorkspace
        }
      },
      {
        path: CommonRoutes.CHANGE_PASSWORD,
        loadChildren: () => import('../../pages/change-password/change-password.module').then(m => m.ChangePasswordPageModule),
        canActivate: [PrivateGuard, AllowPageAccess],
        data: {
          pageId: PAGE_IDS.changePassword
        }
      },
      {
        path: CommonRoutes.LOGIN_ACTIVITY,
        loadChildren: () => import('../../pages/login-activity/login-activity.module').then(m => m.LoginActivityPageModule),
        canActivate: [PrivateGuard, AllowPageAccess],
        data: {
          pageId: PAGE_IDS.loginActivity
        }
      },
      {
        path: CommonRoutes.MENTOR_SEARCH_DIRECTORY,
        loadChildren: () => import('../../pages/mentor-search-directory/mentor-search-directory.module').then(m => m.MentorSearchDirectoryPageModule),
        canActivate: [PrivateGuard]
      },
      {
        path: '',
        redirectTo: '',
        pathMatch: 'full',
      },
    ]
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PrivatePageRoutingModule { }
