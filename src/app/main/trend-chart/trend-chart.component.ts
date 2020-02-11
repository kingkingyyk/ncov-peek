import { Component, OnInit, ViewChild, Input, HostListener, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { GoogleChartComponent } from 'angular-google-charts';
import { Country } from 'src/app/objects';
import { MatSidenav } from '@angular/material/sidenav';

@Component({
  selector: 'trend-chart',
  templateUrl: './trend-chart.component.html',
  styleUrls: ['./trend-chart.component.css']
})
export class TrendChartComponent implements OnInit {
  @ViewChild('chart') chart: GoogleChartComponent;
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
    colors: ['#ff9800', '#e91e63', '#4caf50'],
    lineWidth: 5,
    width: 1000,
    height: 400,
  };
  @Input() sideNav : MatSidenav;
  @Input() country : Country;

  constructor(private changeDetector: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.country) {
      this.country = changes.country.currentValue;
      this.chartData = this.country.toTimeSeries();
    }
  }

  ngOnInit(): void {
    this.chartData = this.country.toTimeSeries();
  }

  @HostListener('window:resize', ['$event'])
  onWindowResize(event: any) {
    let margin = 250;
    if (this.sideNav && !this.sideNav.opened) margin = 60;
    this.chartOption.width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - margin;
  }

}
