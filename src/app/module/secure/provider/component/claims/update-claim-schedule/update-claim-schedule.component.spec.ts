import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateClaimScheduleComponent } from './update-claim-schedule.component';

describe('UpdateClaimScheduleComponent', () => {
  let component: UpdateClaimScheduleComponent;
  let fixture: ComponentFixture<UpdateClaimScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateClaimScheduleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateClaimScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
