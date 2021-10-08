import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlViewSubmissionsComponent } from './pl-view-submissions.component';

describe('PlViewSubmissionsComponent', () => {
  let component: PlViewSubmissionsComponent;
  let fixture: ComponentFixture<PlViewSubmissionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlViewSubmissionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlViewSubmissionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
