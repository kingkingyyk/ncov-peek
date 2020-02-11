import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Country } from 'src/app/objects';

@Component({
  selector: 'fact-cards',
  templateUrl: './fact-cards.component.html',
  styleUrls: ['./fact-cards.component.css']
})
export class FactCardsComponent implements OnInit {
  @Input() country : Country;

  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.country) {
      this.country = changes.country.currentValue;
    }
  }

}
