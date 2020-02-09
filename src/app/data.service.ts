import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  static SOURCE_CODE_REPO_URL = "https://github.com/kingkingyyk/ncov-peek.git";
  static DATA_SOURCE_REPO_URL = "https://docs.google.com/spreadsheets/d/1UF2pSkFTURko2OvfHWWlFpDFAr1UxCBA4JLwlSP6KFo/htmlview?sle=true#";
  static CONFIRMED_URL = 'https://docs.google.com/spreadsheets/d/1UF2pSkFTURko2OvfHWWlFpDFAr1UxCBA4JLwlSP6KFo/export?format=tsv&id=1UF2pSkFTURko2OvfHWWlFpDFAr1UxCBA4JLwlSP6KFo&gid=0';
  static RECOVERED_URL = 'https://docs.google.com/spreadsheets/d/1UF2pSkFTURko2OvfHWWlFpDFAr1UxCBA4JLwlSP6KFo/export?format=tsv&id=1UF2pSkFTURko2OvfHWWlFpDFAr1UxCBA4JLwlSP6KFo&gid=1940183135';
  static DEATH_URL = 'https://docs.google.com/spreadsheets/d/1UF2pSkFTURko2OvfHWWlFpDFAr1UxCBA4JLwlSP6KFo/export?format=tsv&id=1UF2pSkFTURko2OvfHWWlFpDFAr1UxCBA4JLwlSP6KFo&gid=1056055583';
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
