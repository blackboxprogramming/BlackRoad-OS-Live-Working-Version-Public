/**
 * Audit agent for financial compliance and verification.
 */

import { LedgerEntry } from '../models/types';

export class Audit {
  agentId = 'agent.audit';
  displayName = 'Audit';
  packId = 'pack.finance';

  /**
   * Verify ledger entries for compliance.
   */
  verifyEntries(entries: LedgerEntry[]): {
    passed: boolean;
    issues: string[];
    verified: number;
  } {
    const issues: string[] = [];
    let verified = 0;

    for (const entry of entries) {
      // Check required fields
      if (!entry.id || !entry.account || !entry.description) {
        issues.push(`Entry ${entry.id || 'unknown'} missing required fields`);
        continue;
      }

      // Check amount validity
      const amount = parseFloat(entry.amount);
      if (isNaN(amount) || amount < 0) {
        issues.push(`Entry ${entry.id} has invalid amount: ${entry.amount}`);
        continue;
      }

      // Check currency code
      if (entry.currency && entry.currency.length !== 3) {
        issues.push(`Entry ${entry.id} has invalid currency code: ${entry.currency}`);
        continue;
      }

      verified++;
    }

    return {
      passed: issues.length === 0,
      issues,
      verified,
    };
  }

  /**
   * Check for duplicate entries.
   */
  detectDuplicates(entries: LedgerEntry[]): string[] {
    const seen = new Map<string, number>();
    const duplicates: string[] = [];

    for (const entry of entries) {
      const key = `${entry.timestamp}-${entry.account}-${entry.amount}`;
      const count = seen.get(key) || 0;
      seen.set(key, count + 1);

      if (count > 0) {
        duplicates.push(`Duplicate entry: ${entry.id} (${key})`);
      }
    }

    return duplicates;
  }
}
