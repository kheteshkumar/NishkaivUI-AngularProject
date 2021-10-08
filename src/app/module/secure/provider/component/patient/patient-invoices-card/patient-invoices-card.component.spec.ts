import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientInvoicesCardComponent } from './patient-invoices-card.component';

describe('PatientInvoicesCardComponent', () => {
  let component: PatientInvoicesCardComponent;
  let fixture: ComponentFixture<PatientInvoicesCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientInvoicesCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientInvoicesCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
