import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindFacilityComponent } from './find-facility.component';

describe('FindFacilityComponent', () => {
  let component: FindFacilityComponent;
  let fixture: ComponentFixture<FindFacilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindFacilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindFacilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
