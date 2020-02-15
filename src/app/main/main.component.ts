import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { UiService } from '../ui.service';

import { MatSidenav } from '@angular/material/sidenav';
import { Title } from '@angular/platform-browser';
import { Country, Utils } from '../objects';
import { TrendChartComponent } from './trend-chart/trend-chart.component';


@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  static STATE_COL = "Province/State";
  static REFRESH_SECONDS = 60;
  confirmedData: object[][];
  deathData: object[][];
  recoveredData: object[][];
  loaded = false;
  countryDataMap: {};
  selectedCountry: Country;
  @ViewChild('sidenav', {static: false}) sideNav: MatSidenav;
  @ViewChild('chart', {static : false}) chart : TrendChartComponent;

  constructor(private service: DataService,
              private navBarToggle: UiService,
              private titleService: Title) { }

  ngOnInit(): void {
    this.titleService.setTitle('nCov Peek');

    this.confirmedData = null;
    this.deathData = null;
    this.recoveredData = null;
    this.countryDataMap = {};
    this.fetchData();
    setInterval(()=> this.fetchData(), MainComponent.REFRESH_SECONDS * 1000);

    this.navBarToggle.currentMessage.subscribe(() => {
      if (this.sideNav) {
        this.sideNav.toggle();
        if (this.chart) this.chart.onWindowResize(null);
      }
    });
  }

  fetchData() {
    this.service.getConfirmedData().subscribe((data: string) => {
      this.confirmedData = Utils.parseCSV(data);
      this.verifyAndParseData();
    });
    this.service.getDeathData().subscribe((data: string) => {
      this.deathData = Utils.parseCSV(data);
      this.verifyAndParseData();
    });
    this.service.getRecoveredData().subscribe((data: string) => {
      this.recoveredData = Utils.parseCSV(data);
      this.verifyAndParseData();
    });
  }

  getCountryData(country: string): Country {
    let dat = null;
    if (country in this.countryDataMap) dat = this.countryDataMap[country];
    else {
      dat = new Country(country);
      this.countryDataMap[country] = dat;
    }
    return dat;
  }

  cleanupCountryDataMap() {
    for (let countryName of Object.keys(this.countryDataMap)) this.countryDataMap[countryName].clearData();
  }

  verifyAndParseData() {
    if (this.confirmedData && this.deathData && this.recoveredData) {
      this.cleanupCountryDataMap();
      //Parse time series data;
      this.parseConfirmed();
      this.parseDeath();
      this.parseRecovered();
      this.syncCountryData();
      //Calc world
      this.calculateWorld();
      //UI stuffs.
      this.loaded = true;
      if (this.selectedCountry == null) this.drawChart(this.countryDataMap['World']);
      else this.drawChart(this.selectedCountry);
      setTimeout(() => {
        this.autoHideSideNav();
        if(this.chart) this.chart.onWindowResize(null);
      }, 300);
    }
  }

  isNumeric(value) {
    return !isNaN(parseFloat(value));
  }

  parseConfirmed() {
    let colTitles = this.confirmedData[0];
    for (let row=1;row<this.confirmedData.length;row++) {
      let countryData = this.confirmedData[row];
      let country = this.getCountryData(countryData[1].toString());
      for (let col=0;col<countryData.length;col++) {
        let ts = colTitles[col].toString().toString();
        if (this.isNumeric(ts.charAt(0))) {
          if (this.isNumeric(countryData[col].toString())) country.addConfirmedCount(Utils.parseDate(ts), parseInt(countryData[col].toString()));
          else country.addConfirmedCount(Utils.parseDate(colTitles[col].toString()), 0);
        }
        else if (colTitles[col].toString() === MainComponent.STATE_COL) country.addLocation(countryData[col].toString());
      }
    }
  }

  parseDeath() {
    let colTitles = this.deathData[0];
    for (let row=1;row<this.deathData.length;row++) {
      let countryData = this.deathData[row];
      let country = this.getCountryData(countryData[1].toString());
      for (let col=0;col<countryData.length;col++) {
        if (this.isNumeric(colTitles[col].toString().charAt(0))) {
          let ts = Utils.parseDate(colTitles[col].toString());
          if (this.isNumeric(countryData[col].toString())) country.addDeathCount(ts, parseInt(countryData[col].toString()));
          else country.addDeathCount(Utils.parseDate(colTitles[col].toString()), 0);
        }
        else if (colTitles[col].toString() === MainComponent.STATE_COL) country.addLocation(countryData[col].toString());
      }
    }
  }

  parseRecovered() {
    let colTitles = this.recoveredData[0];
    for (let row=1;row<this.recoveredData.length;row++) {
      let countryData = this.recoveredData[row];
      let country = this.getCountryData(countryData[1].toString());
      for (let col=0;col<countryData.length;col++) {
        if (this.isNumeric(colTitles[col].toString().charAt(0))) {
          let ts = Utils.parseDate(colTitles[col].toString());
          if (this.isNumeric(countryData[col].toString())) country.addRecoveredCount(ts, parseInt(countryData[col].toString()));
          else country.addRecoveredCount(Utils.parseDate(colTitles[col].toString()), 0);
        }
        else if (colTitles[col].toString() === MainComponent.STATE_COL) country.addLocation(countryData[col].toString());
      }
    }
  }

  syncCountryData() {
    for (let countryName of Object.keys(this.countryDataMap)) this.countryDataMap[countryName].syncData();
  }

  calculateWorld() {
    let world = new Country('World');
    for (let countryName of Object.keys(this.countryDataMap)) {
      for (let timeSeriesData of this.countryDataMap[countryName].timeSeries) {
        world.addConfirmedCount(timeSeriesData.timestamp, timeSeriesData.confirmedCount);
        world.addDeathCount(timeSeriesData.timestamp, timeSeriesData.deathCount);
        world.addRecoveredCount(timeSeriesData.timestamp, timeSeriesData.recoveredCount);
      }
    }
    world.syncData();
    this.countryDataMap['World'] = world;
  }

  drawChart(country: Country) {
    this.selectedCountry = country;
    this.titleService.setTitle('COVID-19 Peek - '+this.selectedCountry.name);
    this.autoHideSideNav();
    if (this.chart) this.chart.onWindowResize(null);
  }

  autoHideSideNav() {
    if (this.sideNav) {
      let windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      if (windowWidth <= 800) this.sideNav.close();
    }
  }
}
