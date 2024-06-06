import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Observable, filter, interval, map, startWith, tap } from 'rxjs';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { City, WeatherService } from '../core/weather.service';
import { CityCardComponent } from './components/city-card/city-card.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, SidebarComponent, CityCardComponent],
  template: `
    <main
      id="container"
      [ngStyle]="{
        'background-image': 'url(' + (backgroundImage$ | async) + ')'
      }"
    >
      <span class="overlay"></span>
      <app-sidebar>
        <section class="main--dashboard-content">
          <div class="main--title">
            <img src="assets/logo.png" />
            <h1>Forecaster</h1>
            @if (selectedCity$ | async; as city) {
              <app-city-card [city]="city" />
            }
          </div>
        </section>
      </app-sidebar>
    </main>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent {
  backgroundImage$: Observable<string>;
  selectedCity$: Observable<City | null>;

  private backgroundMap: Record<string, string> = {
    morning: 'assets/bg_01.jpg',
    afternoon: 'assets/bg_02.jpg',
    evening: 'assets/bg_03.jpg',
    night: 'assets/bg_04.jpg',
  };

  private timeRangeMap = [
    { start: 6, end: 12, key: 'morning' },
    { start: 12, end: 18, key: 'afternoon' },
    { start: 18, end: 21, key: 'evening' },
    { start: 21, end: 24, key: 'night' },
    { start: 0, end: 6, key: 'night' },
  ];

  constructor(private weatherService: WeatherService) {
    this.backgroundImage$ = interval(3600000).pipe(
      // Check every hour (3600000 milliseconds)
      startWith(0), // Immediately emit once
      map(() => this.getBackgroundImage())
    );
    this.selectedCity$ = this.weatherService.selectedCity$.pipe(
      tap(console.log),
      filter(city => city !== null)
    );
  }

  getBackgroundImage(): string {
    const hour = new Date().getHours();
    const currentTimeRange = this.timeRangeMap.find(
      (range) => hour >= range.start && hour < range.end
    );
    return this.backgroundMap[currentTimeRange?.key || 'night'];
  }
}
