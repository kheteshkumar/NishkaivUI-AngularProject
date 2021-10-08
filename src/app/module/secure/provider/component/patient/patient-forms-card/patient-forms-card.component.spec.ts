import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientFormsCardComponent } from './patient-forms-card.component';

describe('PatientFormsCardComponent', () => {
  let component: PatientFormsCardComponent;
  let fixture: ComponentFixture<PatientFormsCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientFormsCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientFormsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
