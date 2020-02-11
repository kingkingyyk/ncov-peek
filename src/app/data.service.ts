import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  static SOURCE_CODE_REPO_URL = "https://github.com/kingkingyyk/ncov-peek.git";
  static DATA_SOURCE_REPO_URL = "https://github.com/CSSEGISandData/2019-nCoV";
  static CONFIRMED_URL = 'https://raw.githubusercontent.com/CSSEGISandData/2019-nCoV/master/time_series/time_series_2019-ncov-Confirmed.csv';
  static RECOVERED_URL = 'https://raw.githubusercontent.com/CSSEGISandData/2019-nCoV/master/time_series/time_series_2019-ncov-Recovered.csv';
  static DEATH_URL = 'https://raw.githubusercontent.com/CSSEGISandData/2019-nCoV/master/time_series/time_series_2019-ncov-Deaths.csv';
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
