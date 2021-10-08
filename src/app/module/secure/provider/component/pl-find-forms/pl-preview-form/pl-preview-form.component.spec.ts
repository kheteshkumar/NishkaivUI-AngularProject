import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlPreviewFormComponent } from './pl-preview-form.component';

describe('PlPreviewFormComponent', () => {
  let component: PlPreviewFormComponent;
  let fixture: ComponentFixture<PlPreviewFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlPreviewFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlPreviewFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
