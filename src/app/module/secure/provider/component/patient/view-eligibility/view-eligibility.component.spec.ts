import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEligibilityComponent } from './view-eligibility.component';

describe('ViewEligibilityComponent', () => {
  let component: ViewEligibilityComponent;
  let fixture: ComponentFixture<ViewEligibilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewEligibilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewEligibilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
