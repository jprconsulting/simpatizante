import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ContentComponent } from './components/content/content.component';
import { FooterComponent } from './components/footer/footer.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { RouterModule } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { NoResultsComponent } from './components/no-results/no-results.component';
import { HasClaimDirective } from './directives/has-claim.directive';

@NgModule({
  declarations: [
    SidebarComponent,
    NavbarComponent,
    ContentComponent,
    FooterComponent,
    PageHeaderComponent,
    NotFoundComponent,
    NoResultsComponent,
    HasClaimDirective
  ],
  exports: [
    SidebarComponent,
    NavbarComponent,
    ContentComponent,
    FooterComponent,
    PageHeaderComponent,
    NotFoundComponent,
    NoResultsComponent,
    HasClaimDirective
  ],
  imports: [
    CommonModule,
    RouterModule
  ]
})
export class SharedModule { }
