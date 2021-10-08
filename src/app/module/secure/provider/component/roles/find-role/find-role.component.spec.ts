import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindRoleComponent } from './find-role.component';

describe('FindRoleComponent', () => {
  let component: FindRoleComponent;
  let fixture: ComponentFixture<FindRoleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindRoleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindRoleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
