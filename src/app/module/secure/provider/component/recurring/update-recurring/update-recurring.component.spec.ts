import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {UpdateRecurringComponent } from './update-recurring.component';

describe('AddFacilityComponent', () => {
  let component: UpdateRecurringComponent;
  let fixture: ComponentFixture<UpdateRecurringComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateRecurringComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateRecurringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
