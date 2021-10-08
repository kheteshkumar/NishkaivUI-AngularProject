import { TestBed } from '@angular/core/testing';

import { CustomPlanService } from './custom-plan.service';

describe('CustomPlanService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CustomPlanService = TestBed.get(CustomPlanService);
    expect(service).toBeTruthy();
  });
});
