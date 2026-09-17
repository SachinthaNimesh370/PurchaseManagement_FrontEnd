import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseBillComponent } from './purchase-bill.component';
import { AuthService } from '../../core/services/auth.service';
import { LocationService } from '../../core/services/location.service';
import { PurchaseBillService } from '../../core/services/purchase-bill.service';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { signal } from '@angular/core';

describe('PurchaseBillComponent', () => {
  let component: PurchaseBillComponent;
  let fixture: ComponentFixture<PurchaseBillComponent>;
  let mockAuthService: any;
  let mockLocationService: any;
  let mockPurchaseBillService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockAuthService = {
      currentUser: signal('test@enhanzer.com'),
      logout: vi.fn()
    };
    mockLocationService = {
      getLocationNames: vi.fn().mockReturnValue(of(['Head Office', 'Block C']))
    };
    mockPurchaseBillService = {
      getAll: vi.fn().mockReturnValue(of({ items: [], summary: { totalItems: 0, totalQuantity: 0 } })),
      getAllowedItems: vi.fn().mockReturnValue(of(['Mango', 'Apple', 'Banana', 'Orange'])),
      create: vi.fn()
    };
    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [PurchaseBillComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: LocationService, useValue: mockLocationService },
        { provide: PurchaseBillService, useValue: mockPurchaseBillService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseBillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component and load batches & fruits', () => {
    expect(component).toBeTruthy();
    expect(mockLocationService.getLocationNames).toHaveBeenCalled();
    expect(component.batchOptions()).toEqual(['Head Office', 'Block C']);
  });

  it('should calculate live previews correctly based on form inputs', () => {
    // Set exact values from the assignment worked example:
    // Standard Cost: 100, Standard Price: 150, Qty: 5, Discount: 20
    // Total Cost should be 400, Total Selling should be 750, Margin should be 50
    component.billForm.patchValue({
      standardCost: 100,
      standardPrice: 150,
      quantity: 5,
      discount: 20
    });

    expect(component.previewTotalCost()).toBe(400);
    expect(component.previewTotalSelling()).toBe(750);
    expect(component.previewMargin()).toBe(50);
  });

  it('should validate form and prevent submission if item or batch is missing', () => {
    component.billForm.patchValue({
      item: '',
      batch: ''
    });

    component.onAdd();

    expect(mockPurchaseBillService.create).not.toHaveBeenCalled();
    expect(component.billForm.invalid).toBe(true);
  });

  it('should call create service, append item to table and recalculate summary on valid submission', () => {
    const mockCreatedItem = {
      id: 1,
      item: 'Mango',
      batch: 'Head Office',
      standardCost: 100,
      standardPrice: 150,
      quantity: 5,
      discount: 20,
      totalCost: 400,
      totalSelling: 750
    };

    mockPurchaseBillService.create.mockReturnValue(of(mockCreatedItem));

    component.billForm.patchValue({
      item: 'Mango',
      batch: 'Head Office',
      standardCost: 100,
      standardPrice: 150,
      quantity: 5,
      discount: 20
    });

    component.onAdd();

    expect(mockPurchaseBillService.create).toHaveBeenCalledWith({
      item: 'Mango',
      batch: 'Head Office',
      standardCost: 100,
      standardPrice: 150,
      quantity: 5,
      discount: 20
    });

    // Check items signal and summary signal
    expect(component.items().length).toBe(1);
    expect(component.items()[0].item).toBe('Mango');
    expect(component.summary().totalItems).toBe(1);
    expect(component.summary().totalQuantity).toBe(5);
  });

  it('should logout and navigate to login on logout()', () => {
    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
