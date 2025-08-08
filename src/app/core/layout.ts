import { Component } from '@angular/core';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Sidbar } from './sidbar/sidbar';

@Component({
  selector: 'app-layout',
  imports: [Header,Footer,Sidbar],
  template: `
    <app-header></app-header>
    <app-sidbar></app-sidbar>
    <main>
    <ng-content></ng-content>
    </main>
    <app-footer></app-footer>

  `,
  styles: `
  main{
  }

  `
})
export class Layout {

}
