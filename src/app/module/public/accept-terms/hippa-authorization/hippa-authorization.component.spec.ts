import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HippaAuthorizationComponent } from './hippa-authorization.component';

describe('HippaAuthorizationComponent', () => {
  let component: HippaAuthorizationComponent;
  let fixture: ComponentFixture<HippaAuthorizationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HippaAuthorizationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HippaAuthorizationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
