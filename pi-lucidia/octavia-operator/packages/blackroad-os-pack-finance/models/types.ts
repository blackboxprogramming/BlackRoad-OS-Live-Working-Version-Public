/**
 * TypeScript models for finance pack.
 */

export interface LedgerEntry {
  id: string;
  timestamp: string;
  account: string;
  description: string;
  amount: string;
  currency: string;
  entryType: 'debit' | 'credit';
  category?: string;
  tags?: string[];
  metadata?: Record<string, string>;
}

export interface BudgetModel {
  id: string;
  name: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  allocated: string;
  spent: string;
  currency: string;
  remaining?: string;
  utilization?: string;
  categories?: Record<string, string>;
}

export interface ForecastResult {
  period: string;
  predicted: string;
  confidence: number;
  trend: 'up' | 'down' | 'stable';
  factors?: string[];
}
