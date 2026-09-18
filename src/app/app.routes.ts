import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { About } from './pages/about/about';
import { NotFound } from './pages/not-found/not-found';
import { Dashboard } from './pages/dashboard/dashboard';
import { Credits } from './pages/credits/credits';
import { AdminMetrics } from './shared/components-privado/admin-metrics/admin-metrics';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { guestGuard } from './guards/guest.guard';

export const routes: Routes = [
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
    path: 'register',
    component: Register,
    canActivate: [guestGuard]
  },
  {
    path: 'dashboard',
    // Child routes added under Dashboard inherit this protection.
    canActivateChild: [authGuard],
    children: [
      { path: '', component: Dashboard },
      // Keeps direct access to a future dashboard sub-route private as well.
      { path: '**', component: Dashboard }
    ]
  },
  {
    path: 'admin/metrics',
    component: AdminMetrics,
    canActivate: [adminGuard]
  },
  {
    path: 'credits', component: Credits
  },
  { path: 'about', component: About },
  {
  path: '**',
  component: NotFound
}
];
