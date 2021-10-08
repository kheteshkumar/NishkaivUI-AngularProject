import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindNotificationComponent } from './find-notification.component';

describe('FindNotificationComponent', () => {
  let component: FindNotificationComponent;
  let fixture: ComponentFixture<FindNotificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindNotificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindNotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
