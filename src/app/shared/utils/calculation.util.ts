import { ItemSummary } from '../models/purchase-bill.model';

/**
 * Pure calculation functions for Purchase Bill domain.
 * Kept strictly pure so live form preview and table additions never drift apart.
 */

/**
 * Calculates the Total Cost:
 * Gross = Standard Cost * Quantity
 * Discount Amount = Gross * (Discount % / 100)
 * Total Cost = Gross - Discount Amount
 */
export function calculateTotalCost(
  standardCost: number,
  quantity: number,
  discountPercentage: number
): number {
  const cost = Number(standardCost) || 0;
  const qty = Number(quantity) || 0;
  const discount = Number(discountPercentage) || 0;

  if (cost < 0 || qty <= 0) {
    return 0;
  }

  const gross = cost * qty;
  const discountRate = Math.min(Math.max(discount, 0), 100) / 100;
  const discountAmount = gross * discountRate;
  const totalCost = gross - discountAmount;

  return Math.round((totalCost + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates the Total Selling:
 * Total Selling = Standard Price * Quantity
 */
export function calculateTotalSelling(
  standardPrice: number,
  quantity: number
): number {
  const price = Number(standardPrice) || 0;
  const qty = Number(quantity) || 0;

  if (price < 0 || qty <= 0) {
    return 0;
  }

  const totalSelling = price * qty;
  return Math.round((totalSelling + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates summary metrics for a collection of items:
 * Total Items = count of items
 * Total Quantity = sum of Quantity across all items
 */
export function calculateItemSummary(
  items: Array<{ quantity: number; totalCost?: number; totalSelling?: number }>
): ItemSummary {
  if (!items || items.length === 0) {
    return {
      totalItems: 0,
      totalQuantity: 0
    };
  }

  const totalItems = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  return {
    totalItems,
    totalQuantity
  };
}
