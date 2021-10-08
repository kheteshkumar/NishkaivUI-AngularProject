import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlSendEmailComponent } from './pl-send-email.component';

describe('PlSendEmailComponent', () => {
  let component: PlSendEmailComponent;
  let fixture: ComponentFixture<PlSendEmailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlSendEmailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlSendEmailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
