import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringOperationsComponent } from './recurring-operations.component';

describe('RecurringOperationsComponent', () => {
  let component: RecurringOperationsComponent;
  let fixture: ComponentFixture<RecurringOperationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringOperationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringOperationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
