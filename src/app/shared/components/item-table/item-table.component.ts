import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { PurchaseBillItem } from '../../models/purchase-bill.model';

@Component({
  selector: 'app-item-table',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  template: `
    <div class="table-card">
      <div class="table-header">
        <h3 class="table-title">Added Purchase Items</h3>
        <span class="badge">{{ items.length }} {{ items.length === 1 ? 'item' : 'items' }}</span>
      </div>

      <div class="table-wrapper">
        <table class="items-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th>Batch</th>
              <th class="text-right">Standard Cost</th>
              <th class="text-right">Standard Price</th>
              <th class="text-right">Margin</th>
              <th class="text-center">Qty</th>
              <th class="text-center">Free Qty</th>
              <th class="text-right">Discount</th>
              <th class="text-right">Total Cost</th>
              <th class="text-right">Total Selling</th>
            </tr>
          </thead>
          <tbody>
            @for (row of items; track row.id || $index) {
              <tr class="table-row">
                <td class="text-muted">{{ $index + 1 }}</td>
                <td class="font-medium text-slate-800">{{ row.item }}</td>
                <td>
                  <span class="batch-badge">{{ row.batch }}</span>
                </td>
                <td class="text-right">{{ row.standardCost | number:'1.2-2' }}</td>
                <td class="text-right">{{ row.standardPrice | number:'1.2-2' }}</td>
                <td class="text-right text-emerald-600 font-medium">
                  {{ (row.standardPrice - row.standardCost) | number:'1.2-2' }}
                </td>
                <td class="text-center font-bold text-slate-900">{{ row.quantity }}</td>
                <td class="text-center text-muted">0</td>
                <td class="text-right">{{ row.discount | number:'1.2-2' }}%</td>
                <td class="text-right font-semibold text-slate-900">{{ row.totalCost | number:'1.2-2' }}</td>
                <td class="text-right font-semibold text-blue-700">{{ row.totalSelling | number:'1.2-2' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="11" class="empty-state">
                  <div class="empty-content">
                    <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="m21 16-4 4-4-4"></path>
                      <path d="M17 20V4"></path>
                      <path d="m3 8 4-4 4 4"></path>
                      <path d="M7 4v16"></path>
                    </svg>
                    <p class="empty-text">No purchase items added yet.</p>
                    <span class="empty-hint">Fill out the form above and click "+ Add" to add items.</span>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .table-card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
      overflow: hidden;
      margin-top: 1.5rem;
    }
    .table-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
    }
    .table-title {
      font-size: 1rem;
      font-weight: 600;
      color: #1e293b;
      margin: 0;
    }
    .badge {
      background: #e2e8f0;
      color: #475569;
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.25rem 0.625rem;
      border-radius: 9999px;
    }
    .table-wrapper {
      overflow-x: auto;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
      text-align: left;
    }
    .items-table th {
      background: #f1f5f9;
      color: #475569;
      font-weight: 600;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #cbd5e1;
      white-space: nowrap;
    }
    .items-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #f1f5f9;
      white-space: nowrap;
    }
    .table-row:hover {
      background-color: #f8fafc;
    }
    .text-right {
      text-align: right;
    }
    .text-center {
      text-align: center;
    }
    .text-muted {
      color: #94a3b8;
    }
    .batch-badge {
      background: #eff6ff;
      color: #2563eb;
      font-weight: 500;
      padding: 0.15rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8125rem;
      border: 1px solid #bfdbfe;
    }
    .empty-state {
      padding: 3rem 1rem !important;
      text-align: center;
    }
    .empty-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .empty-icon {
      width: 2.5rem;
      height: 2.5rem;
      color: #94a3b8;
    }
    .empty-text {
      color: #475569;
      font-weight: 500;
      margin: 0;
    }
    .empty-hint {
      color: #94a3b8;
      font-size: 0.8125rem;
    }
  `]
})
export class ItemTableComponent {
  @Input() items: PurchaseBillItem[] = [];
}
