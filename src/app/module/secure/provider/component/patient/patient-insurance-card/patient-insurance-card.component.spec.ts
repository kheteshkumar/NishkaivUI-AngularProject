import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientInsuranceCardComponent } from './patient-insurance-card.component';

describe('PatientInsuranceCardComponent', () => {
  let component: PatientInsuranceCardComponent;
  let fixture: ComponentFixture<PatientInsuranceCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientInsuranceCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientInsuranceCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
