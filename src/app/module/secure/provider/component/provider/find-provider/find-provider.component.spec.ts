import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FindProviderComponent } from './find-provider.component';

describe('FindProviderComponent', () => {
  let component: FindProviderComponent;
  let fixture: ComponentFixture<FindProviderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FindProviderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FindProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
