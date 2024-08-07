import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { CommonRoutes } from 'src/global.routes';
import { PublicGuard } from './core/guards/canActivate/public.guard';
import { PrivateGuard } from 'src/app/core/guards/private.guard';

const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./modules/private/private.module').then( m => m.PrivatePageModule)
  },
  {
    path: CommonRoutes.AUTH,
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthPageModule),
    canActivate:[PublicGuard]
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
