import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProviderNotificationsComponent } from './provider-notifications.component';

describe('ProviderNotificationsComponent', () => {
  let component: ProviderNotificationsComponent;
  let fixture: ComponentFixture<ProviderNotificationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProviderNotificationsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProviderNotificationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
