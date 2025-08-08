import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DemandeFormComponent } from './pages/demande-form/demande-form.component';
import { MesDemandesComponent } from './pages/mes-demandes/mes-demandes.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { AdminDemandesComponent } from './pages/admin-demandes/admin-demandes.component'; 
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'demande-form', component: DemandeFormComponent },
  { path: 'mes-demandes', component: MesDemandesComponent },
  { path: 'admin-dashboard', component: AdminDashboardComponent },
  { path: 'admin/demandes', component: AdminDemandesComponent }, 
  { path: 'admin', redirectTo: '/admin/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];