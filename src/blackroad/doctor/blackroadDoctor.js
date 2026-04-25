#!/usr/bin/env node
// BlackRoad OS — Doctor
// One command that tells the truth about launch readiness.
//
// Usage:
//   npm run doctor
//   node src/blackroad/doctor/blackroadDoctor.js
//   node src/blackroad/doctor/blackroadDoctor.js --write-report
//
// BLACKROAD DOCTOR RULE
// One command should tell the truth. Not vibes. Not "200 means done."
// Not fake green lights. If it blocks launch, it goes on top.

import { runAllChecks } from './runLaunchChecks.js';
import { generateReport, writeReport } from './launchReport.js';
import { formatTerminalOutput } from './launchSummary.js';

// Run
const checkResults = runAllChecks();
const report = generateReport(checkResults);

// Output
console.log(formatTerminalOutput(report));

// Write report if requested
if (process.argv.includes('--write-report')) {
  const paths = writeReport(report);
  console.log(`Reports written:`);
  console.log(`  ${paths.reportPath}`);
  console.log(`  ${paths.launchPath}`);
}

// Exit code
const exitCode = report.priorityZero.length > 0 ? 2 : (report.summary.failures > 0 ? 1 : 0);
process.exit(exitCode);
