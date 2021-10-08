import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductsBulkUploadComponent } from './products-bulk-upload.component';

describe('ProductsBulkUploadComponent', () => {
  let component: ProductsBulkUploadComponent;
  let fixture: ComponentFixture<ProductsBulkUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProductsBulkUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProductsBulkUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
