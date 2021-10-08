import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientBulkUploadComponent } from './patient-bulk-upload.component';

describe('PatientBulkUploadComponent', () => {
  let component: PatientBulkUploadComponent;
  let fixture: ComponentFixture<PatientBulkUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientBulkUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientBulkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
