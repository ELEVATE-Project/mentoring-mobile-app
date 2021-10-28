import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/auth.guard';
import { CommonRoutes } from 'src/global.routes';
import { SessionsPage } from './sessions';

const routes: Routes = [
  {
    path: '',
    component: SessionsPage,
    //canActivate: [AuthGuard]
  },
  {
    path: CommonRoutes.SESSIONS_DETAILS,
    loadChildren: () => import('../session-detail/session-detail.module').then(m => m.SessionDetailPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SessionsPageRoutingModule {}
