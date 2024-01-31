import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';

const routes: Routes = [
  {
    path: CommonRoutes.LANDING_PAGE,
    loadChildren: () => import('./landing/landing.module').then( m => m.LandingPageModule)
  },
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
    path: CommonRoutes.OTP,
    loadChildren: () => import('./otp/otp.module').then( m => m.OtpPageModule)
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: CommonRoutes.LANDING_PAGE,
    loadChildren: () => import('./landing/landing.module').then( m => m.LandingPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthPageRoutingModule {}
