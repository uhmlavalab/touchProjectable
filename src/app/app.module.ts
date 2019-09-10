import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MultiWindowModule } from 'ngx-multi-window';

// Components
import { AppRoutingModule, routingComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { BouncingTitleComponent } from './landing-home/bouncing-title/bouncing-title.component';
import { VideoFeedComponent } from './video-feed/video-feed.component';
import { MapElementComponent } from './map-main/map-element/map-element.component';
import { AddRemoveLayersComponent } from './map-main/interaction-element/add-remove-layers/add-remove-layers.component';
import { LargeYearComponent } from './map-main/large-year/large-year.component';
import { LegendComponent } from './map-main/legend/legend.component';
import { TitleComponent } from './map-main/title/title.component';
import { SecondScreenComponent } from './second-screen/second-screen.component';
import { InteractionElementComponent } from './map-main/interaction-element/interaction-element.component';
import { LineChartComponent } from './charts/line-chart/line-chart.component';
import { PieChartComponent } from './charts/pie-chart/pie-chart.component';
import { LayerPuckComponent } from './map-main/layer-puck/layer-puck.component';
import { YearPuckComponent } from './map-main/year-puck/year-puck.component';
import { AddPuckComponent } from './map-main/add-puck/add-puck.component';
import { ScenarioComponent } from './scenario/scenario.component';

// Directives
import { MapSelectionDirectiveDirective } from './landing-home/map-selection-directive.directive';
import { MapDirective } from './map-main/map-element/map.directive';
import { MapLayerDirective } from './map-main/map-element/map-layer.directive';
import { LegendDirective } from './map-main/legend/legend.directive';
import { CardStyleDirective } from './map-main/interaction-element/card-style.directive';

// Services
import { ArService } from './services/ar.service';
import { PlanService } from './services/plan.service';
import { SoundsService } from './services/sounds.service';
import { WindowRefService } from './services/window-ref.service';


@NgModule({
  declarations: [
    routingComponents,
    AppComponent,
    BouncingTitleComponent,
    MapSelectionDirectiveDirective,
    VideoFeedComponent,
    InteractionElementComponent,
    MapElementComponent,
    AddRemoveLayersComponent,
    LargeYearComponent,
    CardStyleDirective,
    MapDirective,
    MapLayerDirective,
    LegendComponent,
    LegendDirective,
    TitleComponent,
    SecondScreenComponent,
    LineChartComponent,
    PieChartComponent,
    ScenarioComponent,
    LayerPuckComponent,
    YearPuckComponent,
    AddPuckComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DragDropModule,
    MultiWindowModule
  ],
  providers: [
    ArService,
    PlanService,
    SoundsService,
    WindowRefService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
