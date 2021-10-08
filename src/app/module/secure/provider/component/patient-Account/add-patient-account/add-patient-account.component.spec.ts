import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddPatientAccountComponent } from './add-patient-account.component';

describe('AddPatientAccountComponent', () => {
  let component: AddPatientAccountComponent;
  let fixture: ComponentFixture<AddPatientAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddPatientAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddPatientAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
