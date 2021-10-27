import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';

const routes: Routes = [
  {
    path: CommonRoutes.LOGIN,
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: CommonRoutes.REGISTER,
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: CommonRoutes.RESET_PASSWORD,
    loadChildren: () => import('./reset-password/reset-password.module').then( m => m.ResetPasswordPageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthPageRoutingModule {}
