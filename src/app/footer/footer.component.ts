import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  sourceCodeURL : string;
  dataSourceURL : string;

  constructor() { }

  ngOnInit(): void {
    this.sourceCodeURL = DataService.SOURCE_CODE_REPO_URL;
    this.dataSourceURL = DataService.DATA_SOURCE_REPO_URL;
  }

}
