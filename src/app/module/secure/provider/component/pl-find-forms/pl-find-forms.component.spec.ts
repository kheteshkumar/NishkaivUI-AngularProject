import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlFindFormsComponent } from './pl-find-forms.component';

describe('PlFindFormsComponent', () => {
  let component: PlFindFormsComponent;
  let fixture: ComponentFixture<PlFindFormsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlFindFormsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlFindFormsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
