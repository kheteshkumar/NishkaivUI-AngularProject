import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LinkAttachmentToProviderComponent } from './link-attachment-to-provider.component';

describe('LinkAttachmentToProviderComponent', () => {
  let component: LinkAttachmentToProviderComponent;
  let fixture: ComponentFixture<LinkAttachmentToProviderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LinkAttachmentToProviderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LinkAttachmentToProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
