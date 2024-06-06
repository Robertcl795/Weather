import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, OperatorFunction, forkJoin } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { environment } from '../environments/environment';

export interface Coordinates {
    lat: number;
    long: number;
}

export interface WeatherInfo {
    cod: number;
    coord: Coordinates
    id: number;
    main: {
        feelslike: number;
        humidity: number;
        pressure: number;
        temp: number;
            temp_max: number;
            temp_min: number;
    }
    name: string;
    weather: {
        id: number;
        main: string;
        description: string;
        icon: string;
    }[];
    wind: {
        speed: number;
        deg: number;
        gust: number;
    }
}

export interface Forecast {
    city: {
        coord: Coordinates;
    }
    list: WeatherInfo[];
}

export interface City {
    name: string;
    countryName: string;
    countryCode: string;
    weatherInfo: WeatherInfo;
    adminName1: string;
}

function isNotNull<T>(value: T | null): value is T {
    return value !== null;
  }

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private openWeatherMapApiKey  = environment.apiKey;
  private openWeatherMapApiUrl = 'https://api.openweathermap.org/data/2.5';
  private geoNamesApiUrl = 'http://api.geonames.org/searchJSON';
  private geoNamesUsername = environment.username;


  private _selectedCity = new BehaviorSubject<City|null>(null);
  private _cities = new BehaviorSubject<City[]>([]);

  public selectedCity$ = this._selectedCity.asObservable();
  public cities$ = this._cities.asObservable();

  currentWeather$?: Observable<any>;
  forecast$?: Observable<any[]>;


  constructor(private http: HttpClient) {

    this.selectedCity$.pipe(
        filter(isNotNull),
        switchMap((city: City) => forkJoin([
            this.getWeatherByCity(city.name),
            this.getForecastByCity(city.name)
        ])),
        map(([weather, forecast]) => {
            
        })
    );
  }

  /**========================================================================
   *                           HTTP METHODS
   *========================================================================**/
  searchCities(query: string): Observable<any> {
    const params = new HttpParams()
      .set('q', query)
      .set('maxRows', '10') // Maximum number of rows to return
      .set('username', this.geoNamesUsername);

    return this.http.get(this.geoNamesApiUrl, { params });
  }

  getWeatherByCity(cityName: string): Observable<any> {
    const params = new HttpParams()
      .set('q', cityName)
      .set('appid', this.openWeatherMapApiKey);

    return this.http.get(`${this.openWeatherMapApiUrl}/weather`, { params });
  }

  getForecastByCity(cityName: string): Observable<any> {
    const params = new HttpParams()
      .set('q', cityName)
      .set('appid', this.openWeatherMapApiKey);

    return this.http.get(`${this.openWeatherMapApiUrl}/forecast`, { params });
  }

  getWeatherIcon(city: City): string {
    const iconCode = city?.weatherInfo?.['weather'][0]?.icon;
    return `https://openweathermap.org/img/wn/${iconCode}.png`;
  }

  /**========================================================================
   *                           ACTION METHODS
   *========================================================================**/
  selectCity(city: City) {
    const cities = this._cities.value;
    if (city && !cities.find((c) => c['name'] === city['name'])) {
      this._cities.next([...cities, city]);
      this._selectedCity.next(city);
    }
  }

  removeCity(city: City) {
    const cities = this._cities.value;
    const updatedCities = cities.filter((c) => c['name'] !== city['name']);
    this._cities.next(updatedCities);
  }

  /**========================================================================
   *                           CUSTOM OPERATORS
   *========================================================================**/

  filterWeatherData(weatherServiceFunction: any): OperatorFunction<any, any> {
    return (source: Observable<any>) =>
      source.pipe(
        filter((city) => !!city?.['name']),
        switchMap((city) =>
          weatherServiceFunction.call(this, city?.['name'])
        )
      );
  }
}