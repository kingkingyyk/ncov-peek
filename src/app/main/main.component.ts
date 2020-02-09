import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { DataService } from '../data.service';
import { UiService } from '../ui.service';
import { GoogleChartComponent } from 'angular-google-charts';
import { MatSidenav } from '@angular/material/sidenav';
import { Title } from '@angular/platform-browser';

class Utils {
  
  static parseTimestamp(s: string) : Date {
    let split = s.split(' ');
    let date = split[0].split('/');
    let time = split[1].split(':');
    let ampm = null;
    if (split.length > 2) ampm = split[2];
    let month = parseInt(date[0]) - 1;
    let day = parseInt(date[1]);
    let year = parseInt(date[2]);
    if (year<2000) year+=2000;

    let hour = parseInt(time[0]);
    let min = parseInt(time[1]);
    if (ampm === "PM") hour += 12;

    return new Date(year, month, day, hour, min, 0, 0);
  }

  static parseDate(s : string) : Date {
    let date = s.split('/');
    let month = parseInt(date[0]) - 1;
    let day = parseInt(date[1]);
    let year = parseInt(date[2]);
    if (year<2000) year+=2000;
    return new Date(year, month, day, 0, 0, 0, 0);
  }
}
class Country {
  timeSeriesMap: object;
  timeSeries: TimeSeriesData[];
  timeSeriesChartData : object[];
  firstConfirmedDate : Date;
  locations : string[];

  constructor(public name: string) {
    this.clearData();
  }

  clearData() : void {
    this.timeSeriesMap = {};
    this.timeSeries = [];
    this.locations = [];
    this.firstConfirmedDate = new Date();
  }

  updateFirstConfirmedDate(date : string) {
    if (this.firstConfirmedDate.getTime() > Utils.parseDate(date).getTime()) this.firstConfirmedDate=Utils.parseDate(date);
  }
  addLocation(loc : string) { if (this.locations.indexOf(loc)<0 && loc.length>0 && loc!==this.name) this.locations.push(loc); }
  addConfirmedCount(timestamp: Date, num: number): void { this.getTimeSeriesDataObject(timestamp.toString()).addConfirmedCount(num); }
  addDeathCount(timestamp: Date, num: number): void { this.getTimeSeriesDataObject(timestamp.toString()).addDeathCount(num); }
  addRecoveredCount(timestamp: Date, num: number): void { this.getTimeSeriesDataObject(timestamp.toString()).addRecoveredCount(num); }

  getTimeSeriesDataObject(timestamp: string): TimeSeriesData {
    let dat = null;
    if (timestamp in this.timeSeriesMap) dat = this.timeSeriesMap[timestamp];
    else {
      dat = new TimeSeriesData(new Date(timestamp));
      this.timeSeriesMap[timestamp] = dat;
    }
    return dat;
  }

  syncData() {
    let keys = Object.keys(this.timeSeriesMap);
    keys.sort((a, b) => Date.parse(a) - Date.parse(b));
    this.timeSeries = []
    for (let key of keys) this.timeSeries.push(this.timeSeriesMap[key]);
    for (let i=1;i<this.timeSeries.length;i++) {
      let data = this.timeSeries[i]
      if (data.confirmedCount==0) data.confirmedCount=this.timeSeries[i-1].confirmedCount;
      if (data.deathCount==0) data.deathCount=this.timeSeries[i-1].deathCount;
      if (data.recoveredCount==0) data.recoveredCount=this.timeSeries[i-1].recoveredCount;
    }

    this.timeSeriesChartData = [];
    for (let i=0;i<this.timeSeries.length;i++) {
      let ts = this.timeSeries[i];
      this.timeSeriesChartData.push([ts.timestamp, ts.confirmedCount, ts.deathCount, ts.recoveredCount]);
    }
  }

  toTimeSeries() : object[] {
    return this.timeSeriesChartData;
  }

  latestData() {
    return this.timeSeries[this.timeSeries.length-1];
  }
}

class TimeSeriesData {
  confirmedCount = 0;
  deathCount = 0;
  recoveredCount = 0;

  constructor(public timestamp : Date) {}

  addConfirmedCount(num: number): void { this.confirmedCount += num; }
  addDeathCount(num: number): void { this.deathCount += num; }
  addRecoveredCount(num: number): void { this.recoveredCount += num; }

  get deathRate() : string {
    return ((this.deathCount * 100) / this.confirmedCount).toFixed(1);
  }

  get recoveryRate() : string {
    return ((this.recoveredCount * 100) / this.confirmedCount).toFixed(1);
  }
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  static STATE_COL = "Province/State";
  static FIRST_CONFIRM_COL = "First confirmed date in country";
  static REFRESH_SECONDS = 60;
  confirmedData: object[][];
  deathData: object[][];
  recoveredData: object[][];
  loaded = false;
  countryDataMap: {};
  @ViewChild('sidenav', {static: false}) sideNav: MatSidenav;

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
        this.onWindowResize(null);
      }
    });
  }

  parseTSV(str : string) : [][] {
    let data = [];
    for (let line of str.split('\n')) data.push(line.split('\t'));
    return data;
  }

  fetchData() {
    this.service.getConfirmedData().subscribe((data: string) => {
      this.confirmedData = this.parseTSV(data);
      this.verifyAndParseData();
    });
    this.service.getDeathData().subscribe((data: string) => {
      this.deathData = this.parseTSV(data);
      this.verifyAndParseData();
    });
    this.service.getRecoveredData().subscribe((data: string) => {
      this.recoveredData = this.parseTSV(data);
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
        this.onWindowResize(null);
      }, 300);
    }
  }

  isNumeric(value) {
    return /^-{0,1}\d+$/.test(value);
  }

  parseConfirmed() {
    let colTitles = this.confirmedData[0];
    for (let row=1;row<this.confirmedData.length;row++) {
      let countryData = this.confirmedData[row];
      let country = this.getCountryData(countryData[1].toString());
      for (let col=0;col<countryData.length;col++) {
        if (this.isNumeric(colTitles[col].toString().charAt(0))) {
          if (this.isNumeric(countryData[col].toString())) country.addConfirmedCount(Utils.parseTimestamp(colTitles[col].toString()), parseInt(countryData[col].toString()));
          else country.addConfirmedCount(Utils.parseTimestamp(colTitles[col].toString()), 0);
        }
        else if (colTitles[col].toString() === MainComponent.FIRST_CONFIRM_COL) country.updateFirstConfirmedDate(countryData[col].toString());
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
          let ts = Utils.parseTimestamp(colTitles[col].toString());
          if (this.isNumeric(countryData[col].toString())) country.addDeathCount(ts, parseInt(countryData[col].toString()));
          else country.addDeathCount(Utils.parseTimestamp(colTitles[col].toString()), 0);
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
          let ts = Utils.parseTimestamp(colTitles[col].toString());
          if (this.isNumeric(countryData[col].toString())) country.addRecoveredCount(ts, parseInt(countryData[col].toString()));
          else country.addRecoveredCount(Utils.parseTimestamp(colTitles[col].toString()), 0);
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

  @ViewChild('chart') chart: GoogleChartComponent;
  selectedCountry: Country;
  chartData = [];
  columnNames = ["Time", "Confirmed", "Death", "Recovered"];
  chartOption = {
    backgroundColor: 'transparent',
    titleTextStyle: {
      color: 'white'
    },
    animation: {
      duration: 300,
      easing: 'out',
    },
    hAxis: {
      title: 'Time',
      textStyle: {
        color: 'white'
      },
      titleTextStyle: {
        color: 'white'
      },
      gridlines: {
        color: '#303030'
      },
      format: 'dd MMM'
    },
    vAxis: {
      title: 'Amount',
      textStyle: {
        color: 'white'
      },
      titleTextStyle: {
        color: 'white'
      },
      gridlines: {
        color: '#303030'
      },
      viewWindow: {
          max: new Date()
      }
    },
    legend: {
      position: 'top',
      alignment: 'start',
      maxLines: 3,
      textStyle: {
        color: 'white'
      }
    },
    lineWidth: 5,
    width: 1000,
    height: 400,
  };

  drawChart(country: Country) {
    this.selectedCountry = country;
    this.titleService.setTitle('nCov Peek - '+this.selectedCountry.name);
    this.chartData = country.toTimeSeries();
    this.autoHideSideNav();
    this.onWindowResize(null);
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    let margin = 250;
    if (this.sideNav && !this.sideNav.opened) margin = 60;
    this.chartOption.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - margin;
  }

  autoHideSideNav() {
    if (this.sideNav) {
      let windowWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      if (windowWidth <= 800) this.sideNav.close();
    }
  }
}
