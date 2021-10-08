import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientViewFormsSubHistoryComponent } from './patient-view-forms-sub-history.component';

describe('PatientViewFormsSubHistoryComponent', () => {
  let component: PatientViewFormsSubHistoryComponent;
  let fixture: ComponentFixture<PatientViewFormsSubHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PatientViewFormsSubHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PatientViewFormsSubHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
