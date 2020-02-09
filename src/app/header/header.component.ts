import { Component, OnInit } from '@angular/core';
import { UiService } from '../ui.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private navBarToggle: UiService) { }

  ngOnInit(): void {}
  toggleSideNav() {
    this.navBarToggle.toggle();
  }
}
