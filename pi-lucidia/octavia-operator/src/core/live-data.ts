// Copyright (c) 2025-2026 BlackRoad OS, Inc. All Rights Reserved.
import { execSync } from 'node:child_process'
import * as os from 'node:os'

export interface SystemMetrics {
  timestamp: string
  cpu: CpuMetrics
  memory: MemoryMetrics
  disk: DiskMetrics
  network: NetworkMetrics
  process: ProcessMetrics
  load: LoadMetrics
}

export interface CpuMetrics {
  count: number
  model: string
  usagePercent: number
  loadAvg1m: number
  loadAvg5m: number
  loadAvg15m: number
}

export interface MemoryMetrics {
  totalMB: number
  usedMB: number
  freeMB: number
  usagePercent: number
  swapTotalMB: number
  swapUsedMB: number
}

export interface DiskMetrics {
  totalGB: number
  usedGB: number
  availableGB: number
  usagePercent: number
  mountPoint: string
}

export interface NetworkMetrics {
  interfaces: NetworkInterface[]
  openConnections: number
}

export interface NetworkInterface {
  name: string
  address: string
}

export interface ProcessMetrics {
  total: number
  nodeProcesses: number
  pythonProcesses: number
}

export interface LoadMetrics {
  uptime: number
  uptimeHuman: string
}

export interface ServiceProbe {
  name: string
  url: string
  status: 'up' | 'down' | 'degraded'
  latencyMs: number
  error?: string
}

// Keep a previous CPU sample so we can compute utilization from deltas
let previousCpuSample:
  | {
      idle: number
      total: number
    }
  | null = null

function sampleCpuTimes(): { idle: number; total: number } {
  const cpus = os.cpus()
  let totalIdle = 0
  let totalTick = 0

  for (const cpu of cpus) {
    for (const type of Object.keys(cpu.times) as (keyof typeof cpu.times)[]) {
      totalTick += cpu.times[type]
    }
    totalIdle += cpu.times.idle
  }

  return { idle: totalIdle, total: totalTick }
}

function getCpuUsage(): number {
  try {
    const current = sampleCpuTimes()

    // On first call, we don't have a previous sample to compare against.
    if (!previousCpuSample) {
      previousCpuSample = current
      return 0
    }

    const totalDelta = current.total - previousCpuSample.total
    const idleDelta = current.idle - previousCpuSample.idle

    // Update previous sample for the next call before any early returns.
    previousCpuSample = current

    if (totalDelta <= 0) {
      return 0
    }

    const usage = 1 - idleDelta / totalDelta
    return Math.round(usage * 100)
  } catch {
    return 0
  }
}

function getMemory(): MemoryMetrics {
  const totalMB = Math.round(os.totalmem() / 1024 / 1024)
  const freeMB = Math.round(os.freemem() / 1024 / 1024)
  const usedMB = totalMB - freeMB
  let swapTotalMB = 0
  let swapUsedMB = 0
  try {
    const meminfo = execSync('cat /proc/meminfo 2>/dev/null', { encoding: 'utf8', timeout: 2000 })
    const swapTotal = meminfo.match(/SwapTotal:\s+(\d+)/)
    const swapFree = meminfo.match(/SwapFree:\s+(\d+)/)
    if (swapTotal) swapTotalMB = Math.round(parseInt(swapTotal[1]) / 1024)
    if (swapFree && swapTotal) swapUsedMB = swapTotalMB - Math.round(parseInt(swapFree[1]) / 1024)
  } catch {
    // swap info unavailable
  }
  return {
    totalMB,
    usedMB,
    freeMB,
    usagePercent: Math.round((usedMB / totalMB) * 100),
    swapTotalMB,
    swapUsedMB,
  }
}

function getDisk(): DiskMetrics {
  try {
    const df = execSync('df -BG / 2>/dev/null | tail -1', { encoding: 'utf8', timeout: 2000 })
    const parts = df.trim().split(/\s+/)
    const totalGB = parseInt(parts[1]) || 0
    const usedGB = parseInt(parts[2]) || 0
    const availableGB = parseInt(parts[3]) || 0
    const usagePercent = parseInt(parts[4]) || 0
    return { totalGB, usedGB, availableGB, usagePercent, mountPoint: parts[5] ?? '/' }
  } catch {
    return { totalGB: 0, usedGB: 0, availableGB: 0, usagePercent: 0, mountPoint: '/' }
  }
}

function getNetwork(): NetworkMetrics {
  const ifaces = os.networkInterfaces()
  const interfaces: NetworkInterface[] = []
  for (const [name, addrs] of Object.entries(ifaces)) {
    if (addrs) {
      for (const addr of addrs) {
        if (!addr.internal && addr.family === 'IPv4') {
          interfaces.push({ name, address: addr.address })
        }
      }
    }
  }
  let openConnections = 0
  try {
    const out = execSync('ss -tun state established 2>/dev/null | wc -l', { encoding: 'utf8', timeout: 2000 })
    openConnections = Math.max(0, parseInt(out.trim()) - 1)
  } catch {
    // not available
  }
  return { interfaces, openConnections }
}

function getProcesses(): ProcessMetrics {
  let total = 0
  let nodeProcesses = 0
  let pythonProcesses = 0
  try {
    total = parseInt(execSync('ps aux 2>/dev/null | wc -l', { encoding: 'utf8', timeout: 2000 }).trim()) - 1
    nodeProcesses = parseInt(execSync('ps aux 2>/dev/null | grep -c "[n]ode"', { encoding: 'utf8', timeout: 2000 }).trim())
    pythonProcesses = parseInt(execSync('ps aux 2>/dev/null | grep -c "[p]ython"', { encoding: 'utf8', timeout: 2000 }).trim())
  } catch {
    // process listing unavailable
  }
  return { total, nodeProcesses, pythonProcesses }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (days > 0) return `${days}d ${hours}h ${mins}m`
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

export function collectSystemMetrics(): SystemMetrics {
  const cpus = os.cpus()
  const loadAvg = os.loadavg()

  return {
    timestamp: new Date().toISOString(),
    cpu: {
      count: cpus.length,
      model: cpus[0]?.model ?? 'unknown',
      usagePercent: getCpuUsage(),
      loadAvg1m: Math.round(loadAvg[0] * 100) / 100,
      loadAvg5m: Math.round(loadAvg[1] * 100) / 100,
      loadAvg15m: Math.round(loadAvg[2] * 100) / 100,
    },
    memory: getMemory(),
    disk: getDisk(),
    network: getNetwork(),
    process: getProcesses(),
    load: {
      uptime: os.uptime(),
      uptimeHuman: formatUptime(os.uptime()),
    },
  }
}

export async function probeService(name: string, url: string, timeoutMs: number = 5000): Promise<ServiceProbe> {
  const start = Date.now()
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const res = await fetch(url, { signal: controller.signal })
    clearTimeout(timer)
    const latencyMs = Date.now() - start
    if (res.ok) {
      return { name, url, status: 'up', latencyMs }
    }
    return { name, url, status: 'degraded', latencyMs, error: `HTTP ${res.status}` }
  } catch (err) {
    return { name, url, status: 'down', latencyMs: Date.now() - start, error: String(err) }
  }
}

export async function probeAllServices(): Promise<ServiceProbe[]> {
  const services = [
    { name: 'Gateway', url: (process.env['BLACKROAD_GATEWAY_URL'] ?? 'http://127.0.0.1:8787') + '/v1/health' },
    { name: 'Ollama', url: (process.env['OLLAMA_URL'] ?? 'http://localhost:11434') + '/api/tags' },
    { name: 'GitHub API', url: 'https://api.github.com' },
  ]

  return Promise.all(services.map((s) => probeService(s.name, s.url)))
}
