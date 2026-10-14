import { dashboardSectionGuard } from './guards/dashboard-section.guard';
import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { About } from './pages/about/about';
import { NotFound } from './pages/not-found/not-found';
import { Credits } from './pages/credits/credits';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { BillingPackages, BillingResult } from './pages/billing-result/billing-result';

export const routes: Routes = [
  { path: 'billing', component: BillingPackages, canActivate: [authGuard] },
  { path: 'billing/result/:outcome', component: BillingResult, canActivate: [authGuard] },
  {
    path: '',
    component: Home,
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login,
    canActivate: [guestGuard]
  },
  {
    path: 'auth/forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password').then(m => m.ForgotPassword)
  },
  {
    path: 'register',
    component: Register,
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    // Child routes added under Dashboard inherit this protection.
    canActivateChild: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard), canActivate: [dashboardSectionGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange' },
      // Keeps direct access to a future dashboard sub-route private as well.
      { path: '**', loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard), canActivate: [dashboardSectionGuard], runGuardsAndResolvers: 'paramsOrQueryParamsChange' }
    ]
  },
  {
    path: 'admin/metrics',
    redirectTo: '/dashboard?section=metrics',
    pathMatch: 'full'
  },
  {
    path: 'admin/purchases',
    redirectTo: '/dashboard?section=purchases',
    pathMatch: 'full'
  },
  {
    path: 'purchases',
    redirectTo: '/dashboard?section=purchase-history',
    pathMatch: 'full'
  },
  {
    path: 'credits',
    component: Credits
  },
  { path: 'about', component: About },
  {
  path: '**',
  component: NotFound
}
];
