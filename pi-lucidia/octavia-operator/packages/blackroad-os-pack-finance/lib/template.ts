/**
 * Template utilities for finance pack.
 */

export function formatCurrency(amount: string, currency: string = 'USD'): string {
  const num = parseFloat(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(num);
}

export function formatPercentage(value: string, decimals: number = 2): string {
  const num = parseFloat(value);
  return `${num.toFixed(decimals)}%`;
}

export function generateReportTemplate(title: string, data: Record<string, string | number>): string {
  const lines = [
    `# ${title}`,
    `Generated: ${new Date().toISOString()}`,
    '',
    '## Summary',
    ...Object.entries(data).map(([key, value]) => `- ${key}: ${value}`),
  ];
  return lines.join('\n');
import fs from "fs";
import Handlebars from "handlebars";

export function renderTemplate(templatePath: string): string {
  const source = fs.readFileSync(templatePath, "utf8");
  const template = Handlebars.compile(source);
  return template({ period: "2025-11", month: "2025-11" });
}

if (require.main === module) {
  const file = process.argv[2];
  if (!file) {
    throw new Error("Template path required");
  }
  const output = renderTemplate(file);
  process.stdout.write(output);
}
