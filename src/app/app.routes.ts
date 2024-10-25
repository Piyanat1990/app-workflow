import { Routes } from '@angular/router';
import { loggedInGuard } from './auth/guards/logged-in.guard';
import { HomeComponent } from './budget/pages/home/home.component';

export const routes: Routes = [
  {
    path: 'budget',
    loadChildren: () => import('./budget/budget.routes'),
    canActivate: [loggedInGuard]
  },
  { path: 'auth', loadChildren: () => import('./auth/auth.routes') },
  { path: '', component: HomeComponent, title: 'Home' }
];
