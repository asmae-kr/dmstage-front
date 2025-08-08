import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Layout } from './core/layout';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule,Layout],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'dmstage-front';
  
  constructor(private router: Router) {}

  ngOnInit() {
    // Redirection par défaut vers la page d'accueil
    if (this.router.url === '/') {
      this.router.navigate(['/login']);
    }
  }
}