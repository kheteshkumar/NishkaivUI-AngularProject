import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PlGetFormUrlComponent } from './pl-get-form-url.component';

describe('PlGetFormUrlComponent', () => {
  let component: PlGetFormUrlComponent;
  let fixture: ComponentFixture<PlGetFormUrlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PlGetFormUrlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PlGetFormUrlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
