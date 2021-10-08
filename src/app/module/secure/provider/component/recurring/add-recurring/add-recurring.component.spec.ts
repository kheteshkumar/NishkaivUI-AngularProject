import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddRecurringComponent } from './add-recurring.component';

describe('AddRecurringComponent', () => {
  let component: AddRecurringComponent;
  let fixture: ComponentFixture<AddRecurringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddRecurringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddRecurringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
