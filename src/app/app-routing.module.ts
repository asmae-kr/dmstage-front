import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DemandeFormComponent } from './pages/demande-form/demande-form.component';
import { MesDemandesComponent } from './pages/mes-demandes/mes-demandes.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { ProfileComponent } from './pages/profile/profile.component';

import { HomeComponent } from './pages/home/home.component';  // Import ici !

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },

  { path: 'profile', component: ProfileComponent },
  { path: 'demande-form', component: DemandeFormComponent, canActivate: [AuthGuard] },
  { path: 'mes-demandes', component: MesDemandesComponent, canActivate: [AuthGuard] },

  { path: 'admin', component: AdminDashboardComponent, canActivate: [AdminGuard] },

  // Par défaut, redirection vers login (page d’accueil)
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
