import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentPlanReportHeaderComponent } from './payment-plan-report.component';

describe('PaymentPlanReportHeaderComponent', () => {
  let component: PaymentPlanReportHeaderComponent;
  let fixture: ComponentFixture<PaymentPlanReportHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaymentPlanReportHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaymentPlanReportHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
