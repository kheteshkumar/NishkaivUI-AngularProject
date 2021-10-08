import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientInsuranceManagementComponent } from './patient-insurance-management.component';

describe('PatientInsuranceManagementComponent', () => {
  let component: PatientInsuranceManagementComponent;
  let fixture: ComponentFixture<PatientInsuranceManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientInsuranceManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientInsuranceManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
