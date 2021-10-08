import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicePaymentScheduleComponent } from './invoice-payment-schedule.component';

describe('InvoicePaymentScheduleComponent', () => {
  let component: InvoicePaymentScheduleComponent;
  let fixture: ComponentFixture<InvoicePaymentScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InvoicePaymentScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicePaymentScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
