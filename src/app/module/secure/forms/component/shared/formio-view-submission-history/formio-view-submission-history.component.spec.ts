import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormioViewSubmissionHistoryComponent } from './formio-view-submission-history.component';

describe('FormioViewSubmissionHistoryComponent', () => {
  let component: FormioViewSubmissionHistoryComponent;
  let fixture: ComponentFixture<FormioViewSubmissionHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormioViewSubmissionHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormioViewSubmissionHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
