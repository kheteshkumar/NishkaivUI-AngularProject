import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddClaimsComponent } from './add-claims.component';

describe('AddClaimsComponent', () => {
  let component: AddClaimsComponent;
  let fixture: ComponentFixture<AddClaimsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddClaimsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddClaimsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
