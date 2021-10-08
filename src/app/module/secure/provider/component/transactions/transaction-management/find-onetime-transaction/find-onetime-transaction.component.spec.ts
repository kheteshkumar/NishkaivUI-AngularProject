import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindOneTimeTransactionComponent } from './find-onetime-transaction.component';

describe('FindTransactionComponent', () => {
  let component: FindOneTimeTransactionComponent;
  let fixture: ComponentFixture<FindOneTimeTransactionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindOneTimeTransactionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindOneTimeTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
