import { TestBed } from '@angular/core/testing';

import { ReceiptPdfService } from './receipt-pdf.service';

describe('ReceiptPdfService', () => {
  let service: ReceiptPdfService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ReceiptPdfService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
