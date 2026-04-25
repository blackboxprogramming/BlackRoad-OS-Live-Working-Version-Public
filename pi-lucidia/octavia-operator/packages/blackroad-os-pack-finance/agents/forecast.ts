/**
 * Forecast agent for financial predictions.
 */

import { ForecastResult } from '../models/types';

export interface TimeSeriesData {
  timestamp: string;
  value: string;
}

export class Forecast {
  agentId = 'agent.forecast';
  displayName = 'Forecast';
  packId = 'pack.finance';

  /**
   * Generate simple moving average forecast.
   */
  simpleMovingAverage(data: TimeSeriesData[], window: number = 3): ForecastResult {
    if (data.length < window) {
      throw new Error(`Insufficient data: need at least ${window} points`);
    }

    const recentData = data.slice(-window);
    const sum = recentData.reduce((acc, d) => acc + parseFloat(d.value), 0);
    const average = sum / window;

    const trend = this.detectTrend(data);

    return {
      period: 'next',
      predicted: average.toFixed(2),
      confidence: 0.7,
      trend,
      factors: ['moving_average', `window_${window}`],
    };
  }

  private detectTrend(data: TimeSeriesData[]): 'up' | 'down' | 'stable' {
    if (data.length < 2) return 'stable';

    const recent = parseFloat(data[data.length - 1].value);
    const previous = parseFloat(data[data.length - 2].value);
    const threshold = 0.05; // 5% change threshold

    const change = (recent - previous) / previous;

    if (change > threshold) return 'up';
    if (change < -threshold) return 'down';
    return 'stable';
  }
}

// CLI interface
if (require.main === module) {
  const forecast = new Forecast();
  console.log('Forecast agent initialized:', forecast.agentId);
  // TODO(forecast): Add CLI commands for forecasting operations
import fs from "fs";
import path from "path";
import { spawnSync } from "child_process";

// Minimal ARIMA-style forecast stub; replace with proper model when dependency is available.
export function forecastCashFlow(series: number[], months: number): number[] {
  if (!series.length) return Array(months).fill(0);
  const avg = series.reduce((a, b) => a + b, 0) / series.length;
  return Array.from({ length: months }).map((_, idx) => avg * (1 + idx * 0.02));
}

export function renderForecastTable(values: number[]): string {
  const rows = values.map((value, i) => `M${i + 1}\t${value.toFixed(2)}`);
  return ["# Cash-Flow Forecast", ...rows].join("\n");
}

export function writeForecastReport(outputDir: string, data: number[]): string {
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, "forecast.txt");
  fs.writeFileSync(filePath, renderForecastTable(data));
  return filePath;
}

export function runCli(series: number[], months: number): void {
  const data = forecastCashFlow(series, months);
  console.log(renderForecastTable(data));
}

export function runPostbuildBeacon(scriptPath = "scripts/postbuild.py"): void {
  const result = spawnSync("python", [scriptPath]);
  if (result.status !== 0) {
    throw new Error(`Beacon generation failed: ${result.stderr.toString()}`);
  }
}

if (require.main === module) {
  runCli([1200, 1350, 980], 6);
}
