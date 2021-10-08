import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Header2ButtonsComponent } from './header2-buttons.component';

describe('Header2ButtonsComponent', () => {
  let component: Header2ButtonsComponent;
  let fixture: ComponentFixture<Header2ButtonsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Header2ButtonsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Header2ButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
