import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPaymentPlanComponent } from './patient-payment-plan.component';

describe('PatientPaymentPlanComponent', () => {
  let component: PatientPaymentPlanComponent;
  let fixture: ComponentFixture<PatientPaymentPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientPaymentPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPaymentPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
