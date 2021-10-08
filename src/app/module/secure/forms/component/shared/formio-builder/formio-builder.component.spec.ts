import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormioBuilderComponent } from './formio-builder.component';

describe('FormioBuilderComponent', () => {
  let component: FormioBuilderComponent;
  let fixture: ComponentFixture<FormioBuilderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FormioBuilderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormioBuilderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
