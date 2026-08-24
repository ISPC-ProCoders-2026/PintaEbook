import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { About } from './pages/about/about';
import { NotFound } from './pages/not-found/not-found';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: Home,
    pathMatch: 'full'
  },
  {
    path: 'login', component: Login
  },
  {
    path: 'register', component: Register
  },
  {
    path: 'dashboard', component: Dashboard
  },
  { path: 'about', component: About },
  {
  path: '**',
  component: NotFound
}
];