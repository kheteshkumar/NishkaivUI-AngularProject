import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
import { AuthGuard } from './services/session/auth.guard';
import { PUBLIC_ROUTES } from './module/public/public.routes';
import { PublicComponent } from './module/public/public.component';
import { SECURE_ROUTES } from './module/secure/secure.routes';
import { SecureComponent } from './module/secure/secure.component';
import { PatientPublicComponent } from './module/patient-public/patient-public.component';
import { PATIENT_PUBLIC_ROUTES } from './module/patient-public/patient-public.routes';

/****** provider route starts ******/
let routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full', data: { breadcrumb: 'login' } },
  { path: '', component: PublicComponent, data: { title: 'Public Views' }, children: PUBLIC_ROUTES },
  {
    path: '', component: SecureComponent, canActivate: [AuthGuard],
    data: { title: 'Secure Views' }, children: SECURE_ROUTES
  },
  { path: '**', redirectTo: 'login' },
];
/****** provider route ends ******/

/****** patient route starts ******/
// let routes: Routes = [
//       { path: '', redirectTo: 'login', pathMatch: 'full', data: { breadcrumb: 'login' } },
//       { path: '', component: PatientPublicComponent, data: { title: 'Public Views' }, children: PATIENT_PUBLIC_ROUTES },
//       {
//         path: '', component: SecureComponent, canActivate: [AuthGuard],
//         data: { title: 'Secure Views' }, children: SECURE_ROUTES
//       },
//       { path: '**', redirectTo: 'login' },
//     ];
/****** patient route ends ******/

// if (window.location.host.includes('login.') || window.location.host.includes('logindev.') || window.location.host.includes('localhost:')) {
if (window.location.host.includes('login.') || window.location.host.includes('logindev.')) {
  routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full', data: { breadcrumb: 'login' } },
    { path: '', component: PatientPublicComponent, data: { title: 'Public Views' }, children: PATIENT_PUBLIC_ROUTES },
    {
      path: '', component: SecureComponent, canActivate: [AuthGuard],
      data: { title: 'Secure Views' }, children: SECURE_ROUTES
    },
    { path: '**', redirectTo: 'login' },
  ];
}

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true, preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})

export class AppRoutingModule { }
