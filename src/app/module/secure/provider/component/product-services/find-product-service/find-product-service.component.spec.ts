import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindProductServiceComponent } from './find-product-service.component';

describe('FindProductServiceComponent', () => {
  let component: FindProductServiceComponent;
  let fixture: ComponentFixture<FindProductServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindProductServiceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindProductServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
