import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LocationService } from '../../core/services/location.service';
import { PurchaseBillService } from '../../core/services/purchase-bill.service';
import {
  PurchaseBillItem,
  PurchaseBillRequest,
  ItemSummary
} from '../../shared/models/purchase-bill.model';
import {
  calculateTotalCost,
  calculateTotalSelling,
  calculateItemSummary
} from '../../shared/utils/calculation.util';
import { ItemTableComponent } from '../../shared/components/item-table/item-table.component';
import { ItemSummaryComponent } from '../../shared/components/item-summary/item-summary.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-purchase-bill',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ItemTableComponent,
    ItemSummaryComponent
  ],
  templateUrl: './purchase-bill.component.html',
  styleUrl: './purchase-bill.component.css'
})
export class PurchaseBillComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  readonly authService = inject(AuthService);
  private readonly locationService = inject(LocationService);
  private readonly purchaseBillService = inject(PurchaseBillService);
  private readonly router = inject(Router);

  // Component states using Angular Signals
  readonly items = signal<PurchaseBillItem[]>([]);
  readonly summary = signal<ItemSummary>({ totalItems: 0, totalQuantity: 0 });
  readonly batchOptions = signal<string[]>([]);
  readonly allowedFruits = signal<string[]>([
    'Mango',
    'Apple',
    'Banana',
    'Orange',
    'Grapes',
    'Kiwi',
    'Strawberry'
  ]);

  // Loading & notification states
  readonly isLoadingLocations = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  // Active navigation tabs for UI fidelity
  readonly activeMainTab = signal<string>('Details');
  readonly activeSubTab = signal<string>('Items');

  // Autocomplete UI helper state
  readonly isItemDropdownOpen = signal<boolean>(false);
  readonly filteredFruits = computed(() => {
    const query = (this.billForm?.get('item')?.value || '').toLowerCase().trim();
    if (!query) {
      return this.allowedFruits();
    }
    return this.allowedFruits().filter((fruit) =>
      fruit.toLowerCase().includes(query)
    );
  });

  // Reactive Form
  billForm: FormGroup = this.fb.group({
    item: ['', [Validators.required]],
    batch: ['', [Validators.required]],
    standardCost: [100, [Validators.required, Validators.min(0)]],
    standardPrice: [150, [Validators.required, Validators.min(0)]],
    quantity: [5, [Validators.required, Validators.min(1)]],
    discount: [20, [Validators.required, Validators.min(0), Validators.max(100)]]
  });

  // Live calculated preview values
  readonly previewTotalCost = signal<number>(400);
  readonly previewTotalSelling = signal<number>(750);
  readonly previewMargin = signal<number>(50);

  ngOnInit(): void {
    this.setupCalculationWatchers();
    this.updateLivePreview();
    this.loadLocations();
    this.loadAllowedItems();
    this.loadExistingBills();
  }

  private setupCalculationWatchers(): void {
    this.billForm.valueChanges.subscribe(() => {
      this.updateLivePreview();
    });
  }

  private updateLivePreview(): void {
    const { standardCost, standardPrice, quantity, discount } = this.billForm.value;

    const cost = Number(standardCost) || 0;
    const price = Number(standardPrice) || 0;
    const qty = Number(quantity) || 0;
    const disc = Number(discount) || 0;

    const totalCost = calculateTotalCost(cost, qty, disc);
    const totalSelling = calculateTotalSelling(price, qty);
    const margin = price >= cost ? price - cost : 0;

    this.previewTotalCost.set(totalCost);
    this.previewTotalSelling.set(totalSelling);
    this.previewMargin.set(margin);
  }

  loadLocations(): void {
    this.isLoadingLocations.set(true);
    this.locationService.getLocationNames().subscribe({
      next: (names) => {
        this.isLoadingLocations.set(false);
        this.batchOptions.set(names);
        if (names.length > 0 && !this.billForm.get('batch')?.value) {
          this.billForm.patchValue({ batch: names[0] });
        }
      },
      error: () => {
        this.isLoadingLocations.set(false);
      }
    });
  }

  loadAllowedItems(): void {
    this.purchaseBillService.getAllowedItems().subscribe({
      next: (fruits) => {
        if (fruits && fruits.length > 0) {
          this.allowedFruits.set(fruits);
        }
      }
    });
  }

  loadExistingBills(): void {
    this.purchaseBillService.getAll().subscribe({
      next: (res) => {
        if (res?.items) {
          this.items.set(res.items);
          this.summary.set(res.summary || calculateItemSummary(res.items));
        }
      },
      error: (err) => {
        console.warn('Could not load existing purchase bills from server:', err);
      }
    });
  }

  selectItem(fruit: string): void {
    this.billForm.patchValue({ item: fruit });
    this.isItemDropdownOpen.set(false);
  }

  onItemInputFocus(): void {
    this.isItemDropdownOpen.set(true);
  }

  onItemInputBlur(): void {
    // Small timeout to allow click on dropdown option
    setTimeout(() => {
      this.isItemDropdownOpen.set(false);
    }, 200);
  }

  onAdd(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);

    if (this.billForm.invalid) {
      this.billForm.markAllAsTouched();
      return;
    }

    const { item, batch, standardCost, standardPrice, quantity, discount } = this.billForm.value;

    const request: PurchaseBillRequest = {
      item: String(item).trim(),
      batch: String(batch).trim(),
      standardCost: Number(standardCost),
      standardPrice: Number(standardPrice),
      quantity: Number(quantity),
      discount: Number(discount)
    };

    this.isSaving.set(true);

    this.purchaseBillService.create(request).subscribe({
      next: (createdItem) => {
        this.isSaving.set(false);
        this.successMessage.set(`Added "${createdItem.item}" successfully!`);

        // Append to items signal
        const updatedItems = [...this.items(), createdItem];
        this.items.set(updatedItems);

        // Recalculate item summary immediately
        this.summary.set(calculateItemSummary(updatedItems));

        // Reset item field for subsequent entry, retain batch and typical defaults
        this.billForm.patchValue({
          item: '',
          quantity: 1,
          discount: 0
        });
        this.billForm.get('item')?.markAsUntouched();
        this.billForm.get('quantity')?.markAsUntouched();
        this.billForm.get('discount')?.markAsUntouched();

        // Auto-dismiss success notification
        setTimeout(() => {
          this.successMessage.set(null);
        }, 4000);
      },
      error: (err: HttpErrorResponse) => {
        this.isSaving.set(false);
        const msg =
          err.error?.message ||
          'Failed to add item to server. Please check your inputs.';
        this.errorMessage.set(msg);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
