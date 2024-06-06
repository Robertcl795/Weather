import { Component, EventEmitter, Output } from '@angular/core';
import { City, WeatherService } from '../../../core/weather.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  Observable,
  debounceTime,
  distinctUntilChanged,
  map,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-city-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    CommonModule,
    MatInputModule,
    MatAutocompleteModule,
  ],
  template: `
    <mat-form-field>
      <mat-label>Search City</mat-label>
      <input
        type="text"
        matInput
        [formControl]="cityControl"
        placeholder="Search City"
        [matAutocomplete]="auto"
      />
      <mat-autocomplete #auto="matAutocomplete" (optionSelected)="selectCity($event.option.value)">
        <mat-option *ngFor="let city of filteredCities$ | async" [value]="city">
          {{ city.name + ', ' + city.adminName1 + ', ' + city.countryCode}}
        </mat-option>
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: [
    `
      :host,
      mat-form-field {
        width: 100%;
      }
    `,
  ],
})
export class SearchComponent {
  @Output() citySelected = new EventEmitter<City>();

  cityControl = new FormControl();
  filteredCities$: Observable<any[]>;

  constructor(private weatherService: WeatherService) {
    this.filteredCities$ = this.cityControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(), // Only emit when the value has changed
      switchMap((value) => this.searchCities(value))
    );
  }

  searchCities(value: string): Observable<any[]> {
    return this.weatherService
      .searchCities(value)
      .pipe(
        map(({ geonames }: any) => geonames.map((city: any) => city))
      );
  }

  selectCity(city: City) {
    this.citySelected.emit(city);
    this.cityControl.reset();
  }
}
