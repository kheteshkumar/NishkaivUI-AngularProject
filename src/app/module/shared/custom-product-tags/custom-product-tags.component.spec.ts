import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomProductTagsComponent } from './custom-product-tags.component';

describe('CustomProductTagsComponent', () => {
  let component: CustomProductTagsComponent;
  let fixture: ComponentFixture<CustomProductTagsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomProductTagsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomProductTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
