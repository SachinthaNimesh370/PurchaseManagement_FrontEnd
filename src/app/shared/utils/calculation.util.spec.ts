import { describe, it, expect } from 'vitest';
import {
  calculateTotalCost,
  calculateTotalSelling,
  calculateItemSummary
} from './calculation.util';

describe('Calculation Utilities', () => {
  describe('calculateTotalCost', () => {
    it('should calculate Total Cost matching the exact worked example from assignment PDF', () => {
      // Worked example in PDF: Standard Cost = 100, Quantity = 5, Discount = 20%
      // Total Cost = (100 * 5) - 20% of 500 = 500 - 100 = 400
      const totalCost = calculateTotalCost(100, 5, 20);
      expect(totalCost).toBe(400);
    });

    it('should calculate Total Cost with 0% discount', () => {
      const totalCost = calculateTotalCost(50, 4, 0);
      expect(totalCost).toBe(200);
    });

    it('should calculate Total Cost with 100% discount', () => {
      const totalCost = calculateTotalCost(50, 4, 100);
      expect(totalCost).toBe(0);
    });

    it('should return 0 when quantity is 0 or negative', () => {
      expect(calculateTotalCost(100, 0, 10)).toBe(0);
      expect(calculateTotalCost(100, -2, 10)).toBe(0);
    });

    it('should handle fractional numbers and round to 2 decimal places', () => {
      // 33.33 * 3 = 99.99, discount 15% = 14.9985, net = 84.9915 -> 84.99
      const totalCost = calculateTotalCost(33.33, 3, 15);
      expect(totalCost).toBe(84.99);
    });
  });

  describe('calculateTotalSelling', () => {
    it('should calculate Total Selling matching the exact worked example from assignment PDF', () => {
      // Worked example in PDF: Standard Price = 150, Quantity = 5 -> Total Selling = 750
      const totalSelling = calculateTotalSelling(150, 5);
      expect(totalSelling).toBe(750);
    });

    it('should return 0 when quantity is 0 or price is negative', () => {
      expect(calculateTotalSelling(150, 0)).toBe(0);
      expect(calculateTotalSelling(-50, 5)).toBe(0);
    });
  });

  describe('calculateItemSummary', () => {
    it('should calculate Total Items and Total Quantity matching assignment table example', () => {
      // Example in PDF:
      // Mango: Qty 5
      // Apple: Qty 3
      // Banana: Qty 2
      // Total Items = 3, Total Quantity = 10
      const items = [
        { quantity: 5 },
        { quantity: 3 },
        { quantity: 2 }
      ];
      const summary = calculateItemSummary(items);
      expect(summary.totalItems).toBe(3);
      expect(summary.totalQuantity).toBe(10);
    });

    it('should return zeros for empty array', () => {
      const summary = calculateItemSummary([]);
      expect(summary.totalItems).toBe(0);
      expect(summary.totalQuantity).toBe(0);
    });
  });
});
