import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelPaymentPlanComponent } from './cancel-payment-plan.component';

describe('RecurringPaymentsOperationComponent', () => {
  let component: CancelPaymentPlanComponent;
  let fixture: ComponentFixture<CancelPaymentPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelPaymentPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelPaymentPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
