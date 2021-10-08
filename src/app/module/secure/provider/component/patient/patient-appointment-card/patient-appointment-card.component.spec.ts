import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAppointmentCardComponent } from './patient-appointment-card.component';

describe('PatientAppointmentCardComponent', () => {
  let component: PatientAppointmentCardComponent;
  let fixture: ComponentFixture<PatientAppointmentCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientAppointmentCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAppointmentCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
