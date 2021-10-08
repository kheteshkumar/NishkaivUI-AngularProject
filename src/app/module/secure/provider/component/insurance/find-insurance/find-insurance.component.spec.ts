import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindInsuranceComponent } from './find-insurance.component';

describe('FindInsuranceComponent', () => {
  let component: FindInsuranceComponent;
  let fixture: ComponentFixture<FindInsuranceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindInsuranceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
