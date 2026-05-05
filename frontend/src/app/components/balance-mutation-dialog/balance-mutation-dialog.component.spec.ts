import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceMutationDialogComponent } from './balance-mutation-dialog.component';

describe('BalanceMutationDialogComponent', () => {
  let component: BalanceMutationDialogComponent;
  let fixture: ComponentFixture<BalanceMutationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceMutationDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BalanceMutationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
