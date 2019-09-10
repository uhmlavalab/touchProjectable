import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LandingHomeComponent } from './landing-home/landing-home.component';
import { MapMainComponent } from './map-main/map-main.component';
import { SecondScreenComponent } from './second-screen/second-screen.component';

const routes: Routes = [
  { path: '', component: LandingHomeComponent },
  { path: 'map-main', component: MapMainComponent },
  { path: 'second-screen', component: SecondScreenComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [
    RouterModule,
  ]
})

export class AppRoutingModule { }
export const routingComponents = [LandingHomeComponent, MapMainComponent, SecondScreenComponent];
