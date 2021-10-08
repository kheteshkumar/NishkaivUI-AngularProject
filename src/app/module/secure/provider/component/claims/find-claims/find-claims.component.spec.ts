import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindClaimsComponent } from './find-claims.component';

describe('FindClaimsComponent', () => {
  let component: FindClaimsComponent;
  let fixture: ComponentFixture<FindClaimsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindClaimsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
