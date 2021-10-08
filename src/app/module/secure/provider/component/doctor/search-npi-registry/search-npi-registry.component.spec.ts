import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchNpiRegistryComponent } from './search-npi-registry.component';

describe('SearchNpiRegistryComponent', () => {
  let component: SearchNpiRegistryComponent;
  let fixture: ComponentFixture<SearchNpiRegistryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchNpiRegistryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchNpiRegistryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
