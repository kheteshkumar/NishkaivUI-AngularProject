import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { WeatherService } from 'src/app/services/test/weather.service';
import { Testdata } from './dashboard_test';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  select: any;
  // currentWeather = weather;
  lineChart : any = [];
  barChart = [];
  constructor(private weather: WeatherService) { }

  ngOnInit() {
    // this.weather.dailyForecast()
    // .subscribe(res1 => {
    const res = Testdata.weather;
    const temp_max = res['list'].map(res1 => res1.main.temp_max);
    const temp_min = res['list'].map(res1 => res1.main.temp_min);
    const alldates = res['list'].map(res1 => res1.dt);

    const weatherDates = [];
    alldates.forEach((res1) => {
      const jsdate = new Date(res1 * 1000);
      weatherDates.push(jsdate.toLocaleTimeString('en', { year: 'numeric', month: 'short', day: 'numeric' }));
    });
    // });
    this.lineChart = new Chart('canvas', {
      type: 'line',
      data: {
        labels: weatherDates,
        datasets: [
          {
            data: temp_max,
            borderColor: '#3cba9f',
            fill: false
          },
          {
            data: temp_min,
            borderColor: '#ffcc00',
            fill: false
          },
        ]
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            display: true
          }],
          yAxes: [{
            display: true
          }],
        }
      }
    });

    this.lineChart = new Chart('canvas1', {
      type: 'bar',
      data: {
        labels: ['2006', '2007', '2008', '2009', '2010', '2011', '2012'],
        datasets: [{
          data: [65, 59, 80, 81, 56, 55, 40],
          label: 'Series A',
          backgroundColor: 'silver',
        }, {
          data: [28, 48, 40, 19, 86, 27, 90],
          label: 'Series B',
          backgroundColor: 'grey',
        }],
      },
      options: {
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            display: true
          }],
          yAxes: [{
            display: true
          }],
        }
      }
    });

  }

}
