import { TestBed } from '@angular/core/testing';

import { DigitalSignatureServiceService } from './digital-signature-service.service';

describe('DigitalSignatureServiceService', () => {
  let service: DigitalSignatureServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DigitalSignatureServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
