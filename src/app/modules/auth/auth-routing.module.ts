import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PAGE_IDS } from 'src/app/core/constants/page.ids';
import { AllowPageAccess } from 'src/app/core/guards/allowPageAccess/allowPageAccess.guard';
import { CommonRoutes } from 'src/global.routes';

const routes: Routes = [
  {
    path: CommonRoutes.LANDING_PAGE,
    loadChildren: () => import('./landing/landing.module').then( m => m.LandingPageModule),
    canActivate: [AllowPageAccess],
    data: {
      pageId: PAGE_IDS.landing
    }
  },
  {
    path: CommonRoutes.LOGIN,
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule),
    canActivate: [AllowPageAccess],
    data: {
      pageId: PAGE_IDS.login
    }
  },
  {
    path: CommonRoutes.REGISTER,
    loadChildren: () => import('./register/register.module').then( m => m.RegisterPageModule),
    canActivate: [AllowPageAccess],
    data: {
      pageId: PAGE_IDS.register
    }
  },
  {
    path: CommonRoutes.RESET_PASSWORD,
    loadChildren: () => import('./reset-password/reset-password.module').then( m => m.ResetPasswordPageModule),
    canActivate: [AllowPageAccess],
    data: {
      pageId: PAGE_IDS.resetPassword
    }
  },
  {
    path: CommonRoutes.OTP,
    loadChildren: () => import('./otp/otp.module').then( m => m.OtpPageModule),
    canActivate: [AllowPageAccess],
    data: {
      pageId: PAGE_IDS.otp
    }
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
    canActivate: [AllowPageAccess],
    data: {
      pageId: PAGE_IDS.landing
    }
  },
  {
    path: CommonRoutes.LANDING_PAGE,
    loadChildren: () => import('./landing/landing.module').then( m => m.LandingPageModule),
    canActivate: [AllowPageAccess],
    data: {
      pageId: PAGE_IDS.landing
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthPageRoutingModule {}
