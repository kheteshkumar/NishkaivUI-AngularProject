import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadAttachmentComponent } from './upload-attachment.component';

describe('UploadAttachmentComponent', () => {
  let component: UploadAttachmentComponent;
  let fixture: ComponentFixture<UploadAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadAttachmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
