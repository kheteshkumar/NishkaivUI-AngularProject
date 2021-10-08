import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAddInsuranceComponent } from './patient-add-insurance.component';

describe('PatientAddInsuranceComponent', () => {
  let component: PatientAddInsuranceComponent;
  let fixture: ComponentFixture<PatientAddInsuranceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientAddInsuranceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAddInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
