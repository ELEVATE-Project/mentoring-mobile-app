import { Routes } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { PublicGuard } from './core/guards/canActivate/public.guard';
import { PrivateGuard } from 'src/app/core/guards/private.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./modules/private/private.module').then(
        (m) => m.PrivatePageModule
      ),
  },
  {
    path: CommonRoutes.AUTH,
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthPageModule),
    canActivate: [PublicGuard],
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];