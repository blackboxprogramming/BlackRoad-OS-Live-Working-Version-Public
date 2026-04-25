// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { Command } from 'commander'
import chalk from 'chalk'
import { collectSystemMetrics, probeAllServices } from '../../core/live-data.js'
import { analyzeBottlenecks } from '../../core/bottlenecks.js'
import type { Bottleneck, BottleneckReport } from '../../core/bottlenecks.js'
import type { SystemMetrics, ServiceProbe } from '../../core/live-data.js'
import { brand } from '../../formatters/brand.js'
import { logger } from '../../core/logger.js'

function bar(pct: number, width: number = 20): string {
  const filled = Math.round((pct / 100) * width)
  const empty = width - filled
  let color = chalk.green
  if (pct >= 90) color = chalk.red
  else if (pct >= 70) color = chalk.yellow
  return color('█'.repeat(filled)) + chalk.gray('░'.repeat(empty))
}

function severityIcon(sev: 'critical' | 'warning' | 'info'): string {
  switch (sev) {
    case 'critical':
      return chalk.red('■ CRITICAL')
    case 'warning':
      return chalk.yellow('▲ WARNING ')
    case 'info':
      return chalk.cyan('● INFO    ')
  }
}

function scoreColor(score: number): string {
  if (score >= 80) return chalk.green(`${score}`)
  if (score >= 50) return chalk.yellow(`${score}`)
  return chalk.red(`${score}`)
}

function serviceStatus(probe: ServiceProbe): string {
  const latency = `${probe.latencyMs}ms`
  switch (probe.status) {
    case 'up':
      return `${chalk.green('●')} ${probe.name.padEnd(14)} ${chalk.green('UP')}     ${chalk.gray(latency)}`
    case 'degraded':
      return `${chalk.yellow('●')} ${probe.name.padEnd(14)} ${chalk.yellow('DEGRADED')} ${chalk.gray(latency)}`
    case 'down':
      return `${chalk.red('●')} ${probe.name.padEnd(14)} ${chalk.red('DOWN')}   ${chalk.gray(latency)}`
  }
}

function renderMetrics(metrics: SystemMetrics): void {
  const p = brand.hotPink
  const w = chalk.bold.white
  const g = chalk.gray

  console.log(p('┌──────────────────────────────────────────────────────────────────┐'))
  console.log(p('│') + `  ${brand.logo()}  ${w('LIVE SYSTEM METRICS')}              ${g(metrics.timestamp.slice(11, 19))}  ` + p('│'))
  console.log(p('├──────────────────────────────────────────────────────────────────┤'))
  console.log(p('│') + `  ${w('CPU')}   ${bar(metrics.cpu.usagePercent)} ${chalk.cyan(`${metrics.cpu.usagePercent}%`)}  ${g(`${metrics.cpu.count} cores`)}            ` + p('│'))
  console.log(p('│') + `  ${w('MEM')}   ${bar(metrics.memory.usagePercent)} ${chalk.cyan(`${metrics.memory.usagePercent}%`)}  ${g(`${metrics.memory.usedMB}/${metrics.memory.totalMB}MB`)}       ` + p('│'))
  console.log(p('│') + `  ${w('DISK')}  ${bar(metrics.disk.usagePercent)} ${chalk.cyan(`${metrics.disk.usagePercent}%`)}  ${g(`${metrics.disk.usedGB}/${metrics.disk.totalGB}GB`)}         ` + p('│'))
  console.log(p('│') + `  ${w('LOAD')}  ${g(`1m:`)} ${chalk.cyan(String(metrics.cpu.loadAvg1m))}  ${g(`5m:`)} ${chalk.cyan(String(metrics.cpu.loadAvg5m))}  ${g(`15m:`)} ${chalk.cyan(String(metrics.cpu.loadAvg15m))}      ` + p('│'))
  console.log(p('│') + `  ${w('NET')}   ${g('connections:')} ${chalk.cyan(String(metrics.network.openConnections))}  ${g('uptime:')} ${chalk.cyan(metrics.load.uptimeHuman)}           ` + p('│'))

  if (metrics.memory.swapTotalMB > 0) {
    const swapPct = Math.round((metrics.memory.swapUsedMB / metrics.memory.swapTotalMB) * 100)
    console.log(p('│') + `  ${w('SWAP')}  ${bar(swapPct)} ${chalk.cyan(`${swapPct}%`)}  ${g(`${metrics.memory.swapUsedMB}/${metrics.memory.swapTotalMB}MB`)}      ` + p('│'))
  }

  console.log(p('│') + `  ${w('PROC')}  ${g('total:')} ${chalk.cyan(String(metrics.process.total))}  ${g('node:')} ${chalk.cyan(String(metrics.process.nodeProcesses))}  ${g('python:')} ${chalk.cyan(String(metrics.process.pythonProcesses))}       ` + p('│'))
  console.log(p('└──────────────────────────────────────────────────────────────────┘'))
}

function renderServices(probes: ServiceProbe[]): void {
  const p = brand.hotPink
  console.log(p('┌──────────────────────────────────────────────────────────────────┐'))
  console.log(p('│') + `  ${chalk.bold.white('SERVICE HEALTH')}                                                ` + p('│'))
  console.log(p('├──────────────────────────────────────────────────────────────────┤'))
  for (const probe of probes) {
    console.log(p('│') + `  ${serviceStatus(probe)}                              ` + p('│'))
  }
  console.log(p('└──────────────────────────────────────────────────────────────────┘'))
}

function renderBottleneck(b: Bottleneck): void {
  console.log(`  ${severityIcon(b.severity)}  ${chalk.bold(b.title)}`)
  console.log(`              ${chalk.gray(b.detail)}`)
  console.log(`              ${chalk.gray('metric:')} ${chalk.cyan(b.metric)}  ${chalk.gray('threshold:')} ${chalk.yellow(b.threshold)}`)
  console.log(`              ${chalk.gray('fix:')} ${b.recommendation}`)
  console.log()
}

function renderReport(report: BottleneckReport): void {
  const p = brand.hotPink

  console.log(p('┌──────────────────────────────────────────────────────────────────┐'))
  console.log(p('│') + `  ${chalk.bold.white('BOTTLENECK ANALYSIS')}          Score: ${scoreColor(report.score)}/100                ` + p('│'))
  console.log(p('├──────────────────────────────────────────────────────────────────┤'))

  if (report.bottlenecks.length === 0) {
    console.log(p('│') + `  ${chalk.green('✓ No bottlenecks detected. All systems nominal.')}                ` + p('│'))
  }

  console.log(p('└──────────────────────────────────────────────────────────────────┘'))

  if (report.bottlenecks.length > 0) {
    console.log()
    for (const b of report.bottlenecks) {
      renderBottleneck(b)
    }
  }

  console.log(chalk.gray(`  ${report.summary}`))
  console.log()
}

export const bottlenecksCommand = new Command('bottlenecks')
  .description('Analyze system bottlenecks with live data')
  .option('--json', 'Output as JSON')
  .option('--watch', 'Continuously monitor (refresh every 5s)')
  .option('--interval <seconds>', 'Watch interval in seconds', '5')
  .action(async (opts: { json?: boolean; watch?: boolean; interval?: string }) => {
    const run = async () => {
      const metrics = collectSystemMetrics()
      const probes = await probeAllServices()
      const report = analyzeBottlenecks(metrics, probes)

      if (opts.json) {
        console.log(JSON.stringify({ metrics, probes, report }, null, 2))
        return report
      }

      renderMetrics(metrics)
      console.log()
      renderServices(probes)
      console.log()
      renderReport(report)
      return report
    }

    if (opts.watch) {
      const rawInterval = parseInt(opts.interval ?? '5', 10)
      const intervalSec = Number.isFinite(rawInterval) && rawInterval > 0 ? rawInterval : 5
      logger.info(`Watching bottlenecks every ${intervalSec}s. Press Ctrl+C to stop.`)
      console.log()

      // Disable cursor for cleaner output
      process.stdout.write('\x1B[?25l')
      process.on('SIGINT', () => {
        process.stdout.write('\x1B[?25h')
        process.exit(0)
      })

      while (true) {
        // Clear screen
        process.stdout.write('\x1B[2J\x1B[H')
        await run()
        await new Promise((resolve) => setTimeout(resolve, intervalSec * 1000))
      }
    } else {
      await run()
    }
  })
