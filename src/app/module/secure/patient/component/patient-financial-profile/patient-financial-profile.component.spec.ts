import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientFinancialProfileComponent } from './patient-financial-profile.component';

describe('PatientActivityComponent', () => {
  let component: PatientFinancialProfileComponent;
  let fixture: ComponentFixture<PatientFinancialProfileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientFinancialProfileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientFinancialProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
