import { FacilityModule } from './facility.module';

describe('FacilityModule', () => {
  let facilityModule: FacilityModule;

  beforeEach(() => {
    facilityModule = new FacilityModule();
  });

  it('should create an instance', () => {
    expect(facilityModule).toBeTruthy();
  });
});
