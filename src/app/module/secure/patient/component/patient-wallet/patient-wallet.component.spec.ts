import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientWalletComponent } from './patient-wallet.component';

describe('PatientWalletComponent', () => {
  let component: PatientWalletComponent;
  let fixture: ComponentFixture<PatientWalletComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientWalletComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientWalletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
