import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientClaimsCardComponent } from './patient-claims-card.component';

describe('PatientClaimsCardComponent', () => {
  let component: PatientClaimsCardComponent;
  let fixture: ComponentFixture<PatientClaimsCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientClaimsCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientClaimsCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
