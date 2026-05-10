import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDetailModalComponent } from './transaction-detail-modal.component';

describe('TransactionDetailModalComponent', () => {
  let component: TransactionDetailModalComponent;
  let fixture: ComponentFixture<TransactionDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionDetailModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TransactionDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
