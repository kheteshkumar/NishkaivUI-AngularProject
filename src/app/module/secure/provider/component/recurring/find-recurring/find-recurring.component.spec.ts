import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindRecurringComponent } from './find-recurring.component';

describe('FindRecurringComponent', () => {
  let component: FindRecurringComponent;
  let fixture: ComponentFixture<FindRecurringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindRecurringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindRecurringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
