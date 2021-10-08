import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlLinkFormComponent } from './pl-link-form.component';

describe('PlLinkFormComponent', () => {
  let component: PlLinkFormComponent;
  let fixture: ComponentFixture<PlLinkFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlLinkFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlLinkFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
