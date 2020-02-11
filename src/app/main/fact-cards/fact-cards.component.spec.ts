import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FactCardsComponent } from './fact-cards.component';

describe('FactCardsComponent', () => {
  let component: FactCardsComponent;
  let fixture: ComponentFixture<FactCardsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FactCardsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FactCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
