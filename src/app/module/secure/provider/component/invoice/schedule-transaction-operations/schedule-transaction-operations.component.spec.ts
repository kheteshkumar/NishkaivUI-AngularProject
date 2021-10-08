import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleTransactionOperationsComponent } from './schedule-transaction-operations.component';

describe('ScheduleTransactionOperationsComponent', () => {
  let component: ScheduleTransactionOperationsComponent;
  let fixture: ComponentFixture<ScheduleTransactionOperationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleTransactionOperationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleTransactionOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
