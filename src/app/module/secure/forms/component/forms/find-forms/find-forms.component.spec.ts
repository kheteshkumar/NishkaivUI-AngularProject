import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindFormsComponent } from './find-forms.component';

describe('FindFormsComponent', () => {
  let component: FindFormsComponent;
  let fixture: ComponentFixture<FindFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
