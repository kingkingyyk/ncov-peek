import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  static SOURCE_CODE_REPO_URL = "https://github.com/kingkingyyk/ncov-peek.git";
  static DATA_SOURCE_REPO_URL = "https://github.com/CSSEGISandData/COVID-19";
  static CONFIRMED_URL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv'
  static RECOVERED_URL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv';
  static DEATH_URL = 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv';
  constructor(private http: HttpClient) { }
  getConfirmedData() {
    return this.http.get(DataService.CONFIRMED_URL, { responseType: 'text' });
  }
  getDeathData() {
    return this.http.get(DataService.DEATH_URL, { responseType: 'text' });
  }
  getRecoveredData() {
    return this.http.get(DataService.RECOVERED_URL, { responseType: 'text' });
  }
}
