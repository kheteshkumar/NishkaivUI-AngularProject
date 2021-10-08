import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddProductServiceComponent } from './add-product-service.component';

describe('AddProductServiceComponent', () => {
  let component: AddProductServiceComponent;
  let fixture: ComponentFixture<AddProductServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddProductServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProductServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
