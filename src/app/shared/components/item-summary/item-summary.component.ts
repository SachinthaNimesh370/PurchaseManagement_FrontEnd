import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ItemSummary, PurchaseBillItem } from '../../models/purchase-bill.model';

@Component({
  selector: 'app-item-summary',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <div class="summary-container">
      <div class="summary-card">
        <div class="card-header">
          <div class="header-title">
            <svg class="header-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect width="18" height="18" x="3" y="3" rx="2"></rect>
              <path d="M3 9h18"></path>
              <path d="M9 21V9"></path>
            </svg>
            <span>Summary</span>
          </div>
        </div>

        <div class="card-body">
          <!-- Item Summary Section -->
          <div class="section-box">
            <div class="section-title">
              <span>Item Summary</span>
              <span class="info-circle" title="Calculated from table rows">ⓘ</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Total Items</span>
              <span class="metric-value font-bold text-slate-800" id="totalItemsDisplay">
                {{ summary.totalItems }}
              </span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Total Qty</span>
              <span class="metric-value font-bold text-blue-700" id="totalQuantityDisplay">
                {{ summary.totalQuantity }}
              </span>
            </div>
          </div>

          <!-- Financial Summary Section -->
          <div class="section-box mt-3">
            <div class="section-title">
              <span>Financial Summary</span>
              <span class="info-circle" title="Live financial aggregates">ⓘ</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Gross Total</span>
              <span class="metric-value">{{ grossTotal | number:'1.2-2' }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Item Discount</span>
              <span class="metric-value text-red-600">-{{ totalDiscountAmount | number:'1.2-2' }}</span>
            </div>
            <div class="metric-row">
              <span class="metric-label">Overall Discount (0)</span>
              <span class="metric-value">0.00</span>
            </div>
            <div class="metric-row font-medium">
              <span class="metric-label">Total Before Tax</span>
              <span class="metric-value">{{ totalCostSum | number:'1.2-2' }}</span>
            </div>
          </div>

          <!-- Net Total Banner -->
          <div class="net-total-banner">
            <div class="net-label">Net Total (Cost)</div>
            <div class="net-amount">Rs. {{ totalCostSum | number:'1.2-2' }}</div>
          </div>
          <div class="selling-total-banner">
            <div class="net-label">Expected Total Selling</div>
            <div class="selling-amount">Rs. {{ totalSellingSum | number:'1.2-2' }}</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .summary-container {
      width: 100%;
    }
    .summary-card {
      background: #ffffff;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }
    .card-header {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 0.875rem 1.25rem;
    }
    .header-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #1e293b;
      font-size: 0.9375rem;
    }
    .header-icon {
      width: 1.125rem;
      height: 1.125rem;
      color: #2563eb;
    }
    .card-body {
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .section-box {
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      padding: 0.875rem 1rem;
    }
    .section-title {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8125rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: #475569;
      margin-bottom: 0.625rem;
      padding-bottom: 0.375rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-circle {
      font-size: 0.75rem;
      color: #94a3b8;
      cursor: help;
    }
    .metric-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.875rem;
      padding: 0.25rem 0;
      color: #334155;
    }
    .metric-label {
      color: #64748b;
    }
    .metric-value {
      font-variant-numeric: tabular-nums;
    }
    .net-total-banner {
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
      color: white;
      border-radius: 8px;
      padding: 1rem;
      text-align: right;
    }
    .selling-total-banner {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      color: #1e40af;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      text-align: right;
    }
    .net-label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      opacity: 0.9;
    }
    .net-amount {
      font-size: 1.35rem;
      font-weight: 700;
      margin-top: 0.15rem;
      font-variant-numeric: tabular-nums;
    }
    .selling-amount {
      font-size: 1.1rem;
      font-weight: 700;
      margin-top: 0.15rem;
      font-variant-numeric: tabular-nums;
    }
  `]
})
export class ItemSummaryComponent {
  @Input() summary: ItemSummary = { totalItems: 0, totalQuantity: 0 };
  @Input() items: PurchaseBillItem[] = [];

  get grossTotal(): number {
    return this.items.reduce(
      (sum, item) => sum + (Number(item.standardCost) || 0) * (Number(item.quantity) || 0),
      0
    );
  }

  get totalCostSum(): number {
    return this.items.reduce((sum, item) => sum + (Number(item.totalCost) || 0), 0);
  }

  get totalSellingSum(): number {
    return this.items.reduce((sum, item) => sum + (Number(item.totalSelling) || 0), 0);
  }

  get totalDiscountAmount(): number {
    return this.grossTotal - this.totalCostSum;
  }
}
