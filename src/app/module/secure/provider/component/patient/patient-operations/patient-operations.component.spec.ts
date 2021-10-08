import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientOperationsComponent } from './patient-operations.component';

describe('PatientOperationsComponent', () => {
  let component: PatientOperationsComponent;
  let fixture: ComponentFixture<PatientOperationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientOperationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
