// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import type { SystemMetrics, ServiceProbe } from './live-data.js'

export type Severity = 'critical' | 'warning' | 'info'

export interface Bottleneck {
  id: string
  severity: Severity
  category: 'cpu' | 'memory' | 'disk' | 'network' | 'service' | 'process' | 'load'
  title: string
  detail: string
  metric: string
  threshold: string
  recommendation: string
}

export interface BottleneckReport {
  timestamp: string
  score: number // 0-100 health score
  bottlenecks: Bottleneck[]
  summary: string
}

const THRESHOLDS = {
  cpu: { warning: 70, critical: 90 },
  memory: { warning: 75, critical: 90 },
  disk: { warning: 80, critical: 95 },
  swap: { warning: 50, critical: 80 },
  loadPerCore: { warning: 0.8, critical: 1.5 },
  openConnections: { warning: 500, critical: 1000 },
  serviceLatencyMs: { warning: 1000, critical: 3000 },
} as const

function analyzeCpu(metrics: SystemMetrics): Bottleneck[] {
  const results: Bottleneck[] = []
  const { usagePercent, loadAvg1m, count } = metrics.cpu
  const loadPerCore = loadAvg1m / count

  if (usagePercent >= THRESHOLDS.cpu.critical) {
    results.push({
      id: 'cpu-critical',
      severity: 'critical',
      category: 'cpu',
      title: 'CPU critically overloaded',
      detail: `CPU usage at ${usagePercent}% across ${count} cores`,
      metric: `${usagePercent}%`,
      threshold: `>${THRESHOLDS.cpu.critical}%`,
      recommendation: 'Identify CPU-heavy processes. Consider scaling horizontally or offloading inference to GPU.',
    })
  } else if (usagePercent >= THRESHOLDS.cpu.warning) {
    results.push({
      id: 'cpu-warning',
      severity: 'warning',
      category: 'cpu',
      title: 'CPU usage elevated',
      detail: `CPU usage at ${usagePercent}% across ${count} cores`,
      metric: `${usagePercent}%`,
      threshold: `>${THRESHOLDS.cpu.warning}%`,
      recommendation: 'Monitor trending. If sustained, review agent task distribution.',
    })
  }

  if (loadPerCore >= THRESHOLDS.loadPerCore.critical) {
    results.push({
      id: 'load-critical',
      severity: 'critical',
      category: 'load',
      title: 'System load critically high',
      detail: `Load average ${loadAvg1m} on ${count} cores (${loadPerCore.toFixed(2)}/core)`,
      metric: `${loadPerCore.toFixed(2)}/core`,
      threshold: `>${THRESHOLDS.loadPerCore.critical}/core`,
      recommendation: 'System is oversubscribed. Reduce concurrent agent count or add compute capacity.',
    })
  } else if (loadPerCore >= THRESHOLDS.loadPerCore.warning) {
    results.push({
      id: 'load-warning',
      severity: 'warning',
      category: 'load',
      title: 'System load above optimal',
      detail: `Load average ${loadAvg1m} on ${count} cores (${loadPerCore.toFixed(2)}/core)`,
      metric: `${loadPerCore.toFixed(2)}/core`,
      threshold: `>${THRESHOLDS.loadPerCore.warning}/core`,
      recommendation: 'Consider distributing work across Pi cluster nodes.',
    })
  }

  return results
}

function analyzeMemory(metrics: SystemMetrics): Bottleneck[] {
  const results: Bottleneck[] = []
  const { usagePercent, usedMB, totalMB, swapTotalMB, swapUsedMB } = metrics.memory

  if (usagePercent >= THRESHOLDS.memory.critical) {
    results.push({
      id: 'mem-critical',
      severity: 'critical',
      category: 'memory',
      title: 'Memory critically low',
      detail: `${usedMB}MB / ${totalMB}MB used (${usagePercent}%)`,
      metric: `${usagePercent}%`,
      threshold: `>${THRESHOLDS.memory.critical}%`,
      recommendation: 'Kill non-essential processes. Reduce Ollama model context size or unload unused models.',
    })
  } else if (usagePercent >= THRESHOLDS.memory.warning) {
    results.push({
      id: 'mem-warning',
      severity: 'warning',
      category: 'memory',
      title: 'Memory usage elevated',
      detail: `${usedMB}MB / ${totalMB}MB used (${usagePercent}%)`,
      metric: `${usagePercent}%`,
      threshold: `>${THRESHOLDS.memory.warning}%`,
      recommendation: 'Monitor memory-hungry processes. Consider smaller quantized models.',
    })
  }

  if (swapTotalMB > 0) {
    const swapPercent = Math.round((swapUsedMB / swapTotalMB) * 100)
    if (swapPercent >= THRESHOLDS.swap.critical) {
      results.push({
        id: 'swap-critical',
        severity: 'critical',
        category: 'memory',
        title: 'Swap usage critically high',
        detail: `${swapUsedMB}MB / ${swapTotalMB}MB swap used (${swapPercent}%)`,
        metric: `${swapPercent}%`,
        threshold: `>${THRESHOLDS.swap.critical}%`,
        recommendation: 'System is thrashing. Free memory immediately or add RAM.',
      })
    } else if (swapPercent >= THRESHOLDS.swap.warning) {
      results.push({
        id: 'swap-warning',
        severity: 'warning',
        category: 'memory',
        title: 'Swap usage elevated',
        detail: `${swapUsedMB}MB / ${swapTotalMB}MB swap used (${swapPercent}%)`,
        metric: `${swapPercent}%`,
        threshold: `>${THRESHOLDS.swap.warning}%`,
        recommendation: 'Memory pressure is high. Consider reducing agent concurrency.',
      })
    }
  }

  return results
}

function analyzeDisk(metrics: SystemMetrics): Bottleneck[] {
  const results: Bottleneck[] = []
  const { usagePercent, usedGB, totalGB, mountPoint } = metrics.disk

  if (usagePercent >= THRESHOLDS.disk.critical) {
    results.push({
      id: 'disk-critical',
      severity: 'critical',
      category: 'disk',
      title: 'Disk space critically low',
      detail: `${usedGB}GB / ${totalGB}GB used on ${mountPoint} (${usagePercent}%)`,
      metric: `${usagePercent}%`,
      threshold: `>${THRESHOLDS.disk.critical}%`,
      recommendation: 'Purge old logs, prune Docker images, remove unused model files from R2 cache.',
    })
  } else if (usagePercent >= THRESHOLDS.disk.warning) {
    results.push({
      id: 'disk-warning',
      severity: 'warning',
      category: 'disk',
      title: 'Disk space running low',
      detail: `${usedGB}GB / ${totalGB}GB used on ${mountPoint} (${usagePercent}%)`,
      metric: `${usagePercent}%`,
      threshold: `>${THRESHOLDS.disk.warning}%`,
      recommendation: 'Clean up temp files, rotate logs, archive old memory journals.',
    })
  }

  return results
}

function analyzeNetwork(metrics: SystemMetrics): Bottleneck[] {
  const results: Bottleneck[] = []
  const { openConnections } = metrics.network

  if (openConnections >= THRESHOLDS.openConnections.critical) {
    results.push({
      id: 'conn-critical',
      severity: 'critical',
      category: 'network',
      title: 'Connection count critically high',
      detail: `${openConnections} established connections`,
      metric: `${openConnections}`,
      threshold: `>${THRESHOLDS.openConnections.critical}`,
      recommendation: 'Possible connection leak. Check agent WebSocket connections and gateway pooling.',
    })
  } else if (openConnections >= THRESHOLDS.openConnections.warning) {
    results.push({
      id: 'conn-warning',
      severity: 'warning',
      category: 'network',
      title: 'Connection count elevated',
      detail: `${openConnections} established connections`,
      metric: `${openConnections}`,
      threshold: `>${THRESHOLDS.openConnections.warning}`,
      recommendation: 'Review connection pooling. Enable keep-alive where appropriate.',
    })
  }

  if (metrics.network.interfaces.length === 0) {
    results.push({
      id: 'net-no-interface',
      severity: 'warning',
      category: 'network',
      title: 'No external network interfaces detected',
      detail: 'No IPv4 network interfaces found (excluding loopback)',
      metric: '0 interfaces',
      threshold: '>=1',
      recommendation: 'Check network configuration. Agent mesh requires network connectivity.',
    })
  }

  return results
}

function analyzeServices(probes: ServiceProbe[]): Bottleneck[] {
  const results: Bottleneck[] = []

  for (const probe of probes) {
    if (probe.status === 'down') {
      results.push({
        id: `svc-down-${probe.name.toLowerCase().replace(/\s+/g, '-')}`,
        severity: 'critical',
        category: 'service',
        title: `${probe.name} is unreachable`,
        detail: probe.error ?? 'Connection failed',
        metric: 'DOWN',
        threshold: 'UP',
        recommendation: `Check if ${probe.name} is running. Verify ${probe.url} is accessible.`,
      })
    } else if (probe.status === 'degraded') {
      results.push({
        id: `svc-degraded-${probe.name.toLowerCase().replace(/\s+/g, '-')}`,
        severity: 'warning',
        category: 'service',
        title: `${probe.name} returning errors`,
        detail: probe.error ?? `Responded in ${probe.latencyMs}ms`,
        metric: probe.error ?? 'DEGRADED',
        threshold: 'HTTP 200',
        recommendation: `Investigate ${probe.name} logs for errors.`,
      })
    } else if (probe.latencyMs >= THRESHOLDS.serviceLatencyMs.critical) {
      results.push({
        id: `svc-slow-${probe.name.toLowerCase().replace(/\s+/g, '-')}`,
        severity: 'warning',
        category: 'service',
        title: `${probe.name} responding slowly`,
        detail: `Response time: ${probe.latencyMs}ms`,
        metric: `${probe.latencyMs}ms`,
        threshold: `<${THRESHOLDS.serviceLatencyMs.critical}ms`,
        recommendation: `High latency on ${probe.name}. Check network path and service load.`,
      })
    }
  }

  return results
}

function computeHealthScore(bottlenecks: Bottleneck[]): number {
  let score = 100
  for (const b of bottlenecks) {
    switch (b.severity) {
      case 'critical':
        score -= 25
        break
      case 'warning':
        score -= 10
        break
      case 'info':
        score -= 2
        break
    }
  }
  return Math.max(0, score)
}

function buildSummary(score: number, bottlenecks: Bottleneck[]): string {
  const critical = bottlenecks.filter((b) => b.severity === 'critical').length
  const warnings = bottlenecks.filter((b) => b.severity === 'warning').length

  if (bottlenecks.length === 0) {
    return 'No bottlenecks detected. All systems nominal.'
  }
  const parts: string[] = []
  if (critical > 0) parts.push(`${critical} critical`)
  if (warnings > 0) parts.push(`${warnings} warning${warnings > 1 ? 's' : ''}`)
  return `Health score: ${score}/100. Found ${parts.join(', ')}. Top priority: ${bottlenecks[0].title}`
}

export function analyzeBottlenecks(metrics: SystemMetrics, probes: ServiceProbe[]): BottleneckReport {
  const bottlenecks: Bottleneck[] = [
    ...analyzeCpu(metrics),
    ...analyzeMemory(metrics),
    ...analyzeDisk(metrics),
    ...analyzeNetwork(metrics),
    ...analyzeServices(probes),
  ].sort((a, b) => {
    const order: Record<Severity, number> = { critical: 0, warning: 1, info: 2 }
    return order[a.severity] - order[b.severity]
  })

  const score = computeHealthScore(bottlenecks)

  return {
    timestamp: metrics.timestamp,
    score,
    bottlenecks,
    summary: buildSummary(score, bottlenecks),
  }
}
