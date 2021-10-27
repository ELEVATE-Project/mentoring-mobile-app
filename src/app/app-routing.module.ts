import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.module').then(m => m.TabsPageModule)
  },
  {
    path: CommonRoutes.callAuth,
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthPageModule)
  },
  {
    path: CommonRoutes.callSessions,
    loadChildren: () => import('./pages/sessions/sessions.module').then(m => m.SessionsPageModule)
  },
  {
    path: CommonRoutes.feedBack,
    loadChildren: () => import('./pages/feedback/feedback.module').then( m => m.FeedbackPageModule)
  },
  {
    path: CommonRoutes.CreateSession,
    loadChildren: () => import('./pages/create-session/create-session.module').then( m => m.CreateSessionPageModule)
  },
  {
    path: CommonRoutes.CreateByMe,
    loadChildren: () => import('./pages/created-by-me/created-by-me.module').then( m => m.CreatedByMePageModule)
  }


];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
