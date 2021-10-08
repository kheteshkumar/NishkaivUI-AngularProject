import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlAddFormComponent } from './pl-add-form.component';

describe('PlAddFormComponent', () => {
  let component: PlAddFormComponent;
  let fixture: ComponentFixture<PlAddFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlAddFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlAddFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
