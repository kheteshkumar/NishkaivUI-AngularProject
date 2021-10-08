import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientAddFormsComponent } from './patient-add-forms.component';

describe('PatientAddFormsComponent', () => {
  let component: PatientAddFormsComponent;
  let fixture: ComponentFixture<PatientAddFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientAddFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientAddFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
