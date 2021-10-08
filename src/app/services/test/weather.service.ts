import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  constructor(private http: HttpClient) { }

  dailyForecast() {
    return this.http.get('https://reqres.in/api/users?page=2')
    .pipe(map(result => result));

  }
}
