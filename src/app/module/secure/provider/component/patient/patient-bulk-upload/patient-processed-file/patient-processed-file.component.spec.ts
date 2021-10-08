import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessedFileComponent } from './processed-file.component';

describe('ProcessedFileComponent', () => {
  let component: ProcessedFileComponent;
  let fixture: ComponentFixture<ProcessedFileComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProcessedFileComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProcessedFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
