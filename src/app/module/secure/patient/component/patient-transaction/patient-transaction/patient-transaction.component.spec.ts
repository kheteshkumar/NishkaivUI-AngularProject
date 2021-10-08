import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientTransactionComponent } from './patient-transaction.component';

describe('FindTransactionComponent', () => {
  let component: PatientTransactionComponent;
  let fixture: ComponentFixture<PatientTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
