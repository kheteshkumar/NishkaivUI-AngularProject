import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientVisitsCardComponent } from './patient-visits-card.component';

describe('PatientVisitsCardComponent', () => {
  let component: PatientVisitsCardComponent;
  let fixture: ComponentFixture<PatientVisitsCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientVisitsCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientVisitsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
