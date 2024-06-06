import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { City, WeatherService } from '../../../core/weather.service';

@Component({
  selector: 'app-city-card',
  standalone: true,
  imports: [MatCardModule],
  template: `
    <mat-card class="city--card">
      @defer{
      <mat-card-header>
        <mat-card-title>{{ city.name }}</mat-card-title>
        <mat-card-subtitle>{{ city.adminName1 }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <!-- <img
          [src]="getWeatherIcon(city)"
          class="weather-icon"
          alt="Weather Icon"
        /> -->
      </mat-card-content>
      }
    </mat-card>
  `,
  styles: ``,
})
export class CityCardComponent {
  @Input({ required: true }) city!: City;

  constructor(private weatherService: WeatherService) {
  }

  getWeatherIcon(city: City) {
    return this.weatherService.getWeatherIcon(city);
  }
}
