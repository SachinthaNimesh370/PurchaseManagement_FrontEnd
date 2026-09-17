import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { PurchaseBillComponent } from './features/purchase-bill/purchase-bill.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Login - Enhanzer Purchase Management'
  },
  {
    path: 'purchase-bill',
    component: PurchaseBillComponent,
    canActivate: [authGuard],
    title: 'Purchase Bill - Enhanzer Purchase Management'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
