import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { PublicGuard } from './core/guards/canActivate/public.guard';
import { PrivateGuard } from './core/guards/private.guard';
import { CREATE_SESSION_FORM } from './core/constants/formConstant';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule),
    canActivate: [PrivateGuard]
  },
  {
    path: CommonRoutes.AUTH,
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthPageModule),
    canActivate:[PublicGuard]
  },
  {
    path: CommonRoutes.SESSIONS,
    loadChildren: () => import('./pages/sessions/sessions.module').then(m => m.SessionsPageModule),
    canActivate: [PrivateGuard]
  },
  {
    path: CommonRoutes.FEEDBACK,
    loadChildren: () => import('./pages/feedback/feedback.module').then( m => m.FeedbackPageModule),
    canActivate: [PrivateGuard]
  },
  {
    path: CommonRoutes.SESSIONS_DETAILS,
    loadChildren: () => import('./pages/session-detail/session-detail.module').then( m => m.SessionDetailPageModule),
    canActivate: [PrivateGuard]
  },
  {
    path: CommonRoutes.CREATE_SESSION,
    loadChildren: () => import('./pages/create-session/create-session.module').then( m => m.CreateSessionPageModule),
    canActivate: [PrivateGuard],
  },
  {
    path: CommonRoutes.CREATED_BY_ME,
    loadChildren: () => import('./pages/created-by-me/created-by-me.module').then( m => m.CreatedByMePageModule),
    canActivate: [PrivateGuard]
  },
  {
    path: CommonRoutes.EDIT_PROFILE,
    loadChildren: () => import('./pages/edit-profile/edit-profile.module').then( m => m.EditProfilePageModule),
    canActivate: [PrivateGuard]
  },
  {
    path: CommonRoutes.HOME_SEARCH,
    loadChildren: () => import('./pages/home-search/home-search.module').then( m => m.HomeSearchPageModule),
    canActivate: [PrivateGuard]
  },
  {
    path: CommonRoutes.MENTOR_DETAILS,
    loadChildren: () => import('./pages/mentor-details/mentor-details.module').then( m => m.MentorDetailsPageModule),
    canActivate: [PrivateGuard]
  },
  {
    path: CommonRoutes.TERMS_AND_CONDITIONS,
    loadChildren: () => import('./pages/terms-and-conditions/terms-and-conditions.module').then( m => m.TermsAndConditionsPageModule),
    canActivate: [PrivateGuard]
  },
  {
    path: CommonRoutes.HELP,
    loadChildren: () => import('./pages/help/help.module').then( m => m.HelpPageModule),
    canActivate: [PrivateGuard]
  },
  {
    path: CommonRoutes.FAQ,
    loadChildren: () => import('./pages/faq/faq.module').then( m => m.FaqPageModule),
    canActivate: [PrivateGuard]
  },
  {
    path: CommonRoutes.LANGUAGE,
    loadChildren: () => import('./pages/language/language.module').then( m => m.LanguagePageModule),
    canActivate: [PrivateGuard]
  },
  {
    path: CommonRoutes.HELP_VIDEOS,
    loadChildren: () => import('./pages/help-video/help-video.module').then( m => m.HelpVideoPageModule),
    canActivate: [PrivateGuard]
  },
  {
    path: CommonRoutes.MENTOR_QUESTIONNAIRE,
    loadChildren: () => import('./pages/mentor-questionnaire/mentor-questionnaire.module').then( m => m.MentorQuestionnairePageModule),
    canActivate: [PrivateGuard]
  },
  {
    path: CommonRoutes.ADMIN,
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
    canActivate: [PrivateGuard]
  },
  {
    path: CommonRoutes.CHANGE_PASSWORD,
    loadChildren: () => import('./pages/change-password/change-password.module').then( m => m.ChangePasswordPageModule),
    canActivate: [PrivateGuard]
  },
  {
    path:'**', redirectTo:'',pathMatch:'full'
  }
];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
