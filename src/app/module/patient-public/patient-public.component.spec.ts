import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientPublicComponent } from './patient-public.component';

describe('PatientPublicComponent', () => {
  let component: PatientPublicComponent;
  let fixture: ComponentFixture<PatientPublicComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientPublicComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
