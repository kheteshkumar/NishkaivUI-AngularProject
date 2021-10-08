import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindAllTransactionComponent } from './find-all-transaction.component';

describe('FindAllTransactionComponent', () => {
  let component: FindAllTransactionComponent;
  let fixture: ComponentFixture<FindAllTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindAllTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindAllTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
