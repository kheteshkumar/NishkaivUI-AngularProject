import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindTransactionComponent } from './find-transaction.component';

describe('FindTransactionComponent', () => {
  let component: FindTransactionComponent;
  let fixture: ComponentFixture<FindTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
