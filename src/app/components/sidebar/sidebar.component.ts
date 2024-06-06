import { Component } from '@angular/core';
import { SearchComponent } from '../search/search.component';
import {
  BehaviorSubject,
  Observable,
  map,
  switchMap,
  filter,
  tap,
  OperatorFunction,
  combineLatest,
} from 'rxjs';
import { City, WeatherService } from '../../../core/weather.service';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    SearchComponent,
    CommonModule,
    MatSidenavModule,
    MatCardModule,
    MatIconModule,
  ],
  template: `
    <mat-sidenav-container>
      <mat-sidenav #sidenav mode="side" opened fixedInViewport="true">
        <div class="sidebar--content">
          <app-city-search
            (citySelected)="onSelectCity($event)"
          ></app-city-search>

          <mat-card
            *ngFor="let city of cities$ | async"
            (click)="onSelectCity(city)"
          >
            <mat-card-content class="card-content">
              <!-- Weather Icon -->
              <img
                [src]="getWeatherIcon(city)"
                class="weather-icon"
                alt="Weather Icon"
              />

              <!-- City Name, State -->
              <span>{{ city['name'] }}, {{ city['countryName'] }}</span>
            </mat-card-content>
            <mat-card-actions>
              <!-- Remove Button -->
              <button mat-button (click)="onRemoveCity(city)">
                <mat-icon>delete</mat-icon>
              </button>
            </mat-card-actions>
          </mat-card>
        </div>
      </mat-sidenav>
      <mat-sidenav-content>
        <ng-content />
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [
    `
      :host .mat-drawer {
        background-color: rgba(0, 0, 0, 0.5);
      }

      :host .mat-drawer-container {
        background-color: rgba(0, 0, 0, 0);
      }
      .sidebar--content {
        display: flex;
        flex-direction: column;
        justify-content: start;
        align-items: center;
        margin: 1rem;
      }
    `,
  ],
})
export class SidebarComponent {

  public selectedCity$;
  public cities$;

  constructor(private weatherService: WeatherService) {
    this.selectedCity$ = this.weatherService.selectedCity$;
    this.cities$ = this.weatherService.cities$.pipe(
      switchMap(cities => {
        const cityDataObservables = cities.map(city =>
          combineLatest([
            this.weatherService.getWeatherByCity(city.name),
            this.weatherService.getForecastByCity(city.name)
          ]).pipe(
            map(([weatherInfo, forecast]) => ({ ...city, weatherInfo, forecast }))
          )
        );
        return combineLatest(cityDataObservables);
      })
    );;
  }

  private citySearch$ = new BehaviorSubject<string>('');

  onSearchChange(searchTerm: string) {
    this.citySearch$.next(searchTerm);
  }

  onSelectCity(city: City) {
    this.weatherService.selectCity(city)
  }
  
  onRemoveCity(city: City) {
    this.weatherService.removeCity(city)
  }

  getWeatherIcon(city: City) {
    return this.weatherService.getWeatherIcon(city);
  }

  
}
