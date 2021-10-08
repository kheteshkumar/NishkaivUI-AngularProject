import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormioRendererComponent } from './formio-renderer.component';

describe('FormioRendererComponent', () => {
  let component: FormioRendererComponent;
  let fixture: ComponentFixture<FormioRendererComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormioRendererComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormioRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
