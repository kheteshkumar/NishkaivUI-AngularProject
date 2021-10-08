import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindNoteComponent } from './find-note.component';

describe('FindNoteComponent', () => {
  let component: FindNoteComponent;
  let fixture: ComponentFixture<FindNoteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindNoteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindNoteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
