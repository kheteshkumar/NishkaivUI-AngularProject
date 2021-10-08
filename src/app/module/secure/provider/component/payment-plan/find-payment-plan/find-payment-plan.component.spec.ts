import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindPaymentPlanComponent } from './find-payment-plan.component';

describe('FindPaymentPlanComponent', () => {
  let component: FindPaymentPlanComponent;
  let fixture: ComponentFixture<FindPaymentPlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindPaymentPlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindPaymentPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
