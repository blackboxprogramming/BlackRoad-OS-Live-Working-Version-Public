/**
 * Mock Data Generator
 * Comprehensive fake dataset for all BlackRoad OS apps
 * TODO: Replace with real API calls in production
 */

const MockData = {
    // Prism Console - Agent Run Logs
    agentRuns: [
        { id: 'run_001', agent: 'ComplianceAgent', status: 'success', timestamp: '2025-11-16 09:23:15', duration: '2.3s', message: 'FINRA review completed' },
        { id: 'run_002', agent: 'MinerHealthCheck', status: 'success', timestamp: '2025-11-16 09:22:00', duration: '1.1s', message: 'All miners operational' },
        { id: 'run_003', agent: 'DataSyncAgent', status: 'running', timestamp: '2025-11-16 09:21:45', duration: '15.2s', message: 'Syncing identity ledger...' },
        { id: 'run_004', agent: 'PortfolioRebalance', status: 'failed', timestamp: '2025-11-16 09:20:30', duration: '0.8s', message: 'API timeout exceeded' },
        { id: 'run_005', agent: 'PiMonitor', status: 'success', timestamp: '2025-11-16 09:19:12', duration: '0.5s', message: 'All Pi devices responding' },
        { id: 'run_006', agent: 'RunbookSync', status: 'success', timestamp: '2025-11-16 09:18:00', duration: '3.2s', message: 'Updated 5 runbooks' },
        { id: 'run_007', agent: 'AuditLogger', status: 'success', timestamp: '2025-11-16 09:17:30', duration: '1.4s', message: 'Logged 47 events' },
        { id: 'run_008', agent: 'ChainValidator', status: 'success', timestamp: '2025-11-16 09:16:15', duration: '5.7s', message: 'RoadChain validated' },
        { id: 'run_009', agent: 'BackupAgent', status: 'success', timestamp: '2025-11-16 09:15:00', duration: '12.3s', message: 'Backup completed' },
        { id: 'run_010', agent: 'AlertProcessor', status: 'success', timestamp: '2025-11-16 09:14:22', duration: '0.3s', message: 'Processed 3 alerts' }
    ],

    // Miners Dashboard - Mining Operations
    miners: [
        { id: 'miner_01', name: 'BlackRoad-Alpha', status: 'online', hashrate: '450 TH/s', temp: 62, power: 3200, uptime: '45d 12h', location: 'Datacenter A' },
        { id: 'miner_02', name: 'BlackRoad-Beta', status: 'online', hashrate: '430 TH/s', temp: 58, power: 3100, uptime: '45d 11h', location: 'Datacenter A' },
        { id: 'miner_03', name: 'BlackRoad-Gamma', status: 'online', hashrate: '465 TH/s', temp: 64, power: 3250, uptime: '38d 6h', location: 'Datacenter B' },
        { id: 'miner_04', name: 'BlackRoad-Delta', status: 'offline', hashrate: '0 TH/s', temp: 0, power: 0, uptime: '0d 0h', location: 'Datacenter B' },
        { id: 'miner_05', name: 'BlackRoad-Epsilon', status: 'online', hashrate: '455 TH/s', temp: 61, power: 3180, uptime: '22d 3h', location: 'Datacenter C' },
        { id: 'miner_06', name: 'BlackRoad-Zeta', status: 'warning', hashrate: '380 TH/s', temp: 71, power: 3050, uptime: '15d 18h', location: 'Datacenter C' }
    ],

    // Pi Ops - Raspberry Pi Devices
    piDevices: [
        { id: 'pi_001', hostname: 'pi-gate-01', ip: '192.168.1.101', status: 'online', cpu: 23, memory: 45, disk: 38, uptime: '89d 14h', role: 'Gateway' },
        { id: 'pi_002', hostname: 'pi-monitor-01', ip: '192.168.1.102', status: 'online', cpu: 12, memory: 28, disk: 22, uptime: '89d 14h', role: 'Monitor' },
        { id: 'pi_003', hostname: 'pi-sensor-01', ip: '192.168.1.103', status: 'online', cpu: 8, memory: 18, disk: 15, uptime: '67d 3h', role: 'Sensor' },
        { id: 'pi_004', hostname: 'pi-relay-01', ip: '192.168.1.104', status: 'warning', cpu: 78, memory: 82, disk: 91, uptime: '34d 22h', role: 'Relay' },
        { id: 'pi_005', hostname: 'pi-backup-01', ip: '192.168.1.105', status: 'online', cpu: 15, memory: 32, disk: 67, uptime: '12d 8h', role: 'Backup' },
        { id: 'pi_006', hostname: 'pi-edge-01', ip: '192.168.1.106', status: 'offline', cpu: 0, memory: 0, disk: 0, uptime: '0d 0h', role: 'Edge Node' }
    ],

    // Runbooks - Operational Procedures
    runbooks: [
        { id: 'rb_001', title: 'Emergency Miner Shutdown', category: 'Operations', lastUpdated: '2025-11-10', author: 'OpsTeam', content: '# Emergency Miner Shutdown\n\n## When to Use\n- Temperature exceeds 80°C\n- Power fluctuations detected\n- Network instability\n\n## Steps\n1. Navigate to Miners Dashboard\n2. Select affected miner\n3. Click "Emergency Stop"\n4. Wait for confirmation\n5. Investigate root cause' },
        { id: 'rb_002', title: 'FINRA Compliance Review Workflow', category: 'Compliance', lastUpdated: '2025-11-08', author: 'ComplianceTeam', content: '# FINRA Compliance Review\n\n## Overview\nAll marketing materials require FINRA 2210 review.\n\n## Process\n1. Submit content to Compliance Hub\n2. Automated pre-check runs\n3. Manual review by compliance officer\n4. Revisions if needed\n5. Final approval and archival' },
        { id: 'rb_003', title: 'Pi Device Provisioning', category: 'Infrastructure', lastUpdated: '2025-11-05', author: 'InfraTeam', content: '# Pi Device Setup\n\n## Initial Setup\n1. Flash SD card with BlackRoad OS image\n2. Configure network settings\n3. Install monitoring agent\n4. Register with central dashboard\n5. Run health checks' },
        { id: 'rb_004', title: 'Identity Ledger Backup', category: 'Security', lastUpdated: '2025-11-01', author: 'SecurityTeam', content: '# SHA∞ Ledger Backup\n\n## Frequency\nDaily at 03:00 UTC\n\n## Process\n1. Initiate snapshot\n2. Encrypt with GPG\n3. Upload to secure storage\n4. Verify integrity\n5. Rotate old backups' },
        { id: 'rb_005', title: 'AUM Reconciliation', category: 'Finance', lastUpdated: '2025-10-28', author: 'FinanceTeam', content: '# Assets Under Management Reconciliation\n\n## Monthly Process\n1. Export portfolio data\n2. Cross-reference with custodian reports\n3. Identify discrepancies\n4. Resolve variances\n5. Generate final report' }
    ],

    // Compliance Hub - Audit Logs & Reviews
    complianceQueue: [
        { id: 'comp_001', type: 'Marketing Review', content: 'Q4 2025 Investment Newsletter', status: 'pending', submittedBy: 'Marketing', submittedAt: '2025-11-15 14:30', priority: 'high' },
        { id: 'comp_002', type: 'SEC Filing', content: 'Form ADV Amendment', status: 'in_review', submittedBy: 'Legal', submittedAt: '2025-11-14 09:00', priority: 'critical' },
        { id: 'comp_003', type: 'Client Communication', content: 'Fee Schedule Update Email', status: 'approved', submittedBy: 'ClientServices', submittedAt: '2025-11-13 16:45', priority: 'medium' },
        { id: 'comp_004', type: 'Social Media Post', content: 'LinkedIn market commentary', status: 'rejected', submittedBy: 'Marketing', submittedAt: '2025-11-12 11:20', priority: 'low' },
        { id: 'comp_005', type: 'Website Update', content: 'New strategy page content', status: 'pending', submittedBy: 'Marketing', submittedAt: '2025-11-11 10:15', priority: 'medium' }
    ],

    auditLogs: [
        { id: 'audit_001', event: 'User Login', user: 'john.doe@blackroad.io', timestamp: '2025-11-16 09:15:23', ip: '203.0.113.42', result: 'success' },
        { id: 'audit_002', event: 'Portfolio Access', user: 'jane.smith@blackroad.io', timestamp: '2025-11-16 09:12:10', ip: '203.0.113.43', result: 'success' },
        { id: 'audit_003', event: 'Configuration Change', user: 'admin@blackroad.io', timestamp: '2025-11-16 08:45:33', ip: '203.0.113.1', result: 'success' },
        { id: 'audit_004', event: 'Failed Login Attempt', user: 'unknown', timestamp: '2025-11-16 08:22:15', ip: '198.51.100.88', result: 'failure' },
        { id: 'audit_005', event: 'Data Export', user: 'compliance@blackroad.io', timestamp: '2025-11-16 07:30:00', ip: '203.0.113.44', result: 'success' }
    ],

    // Finance & AUM - Portfolio Data
    portfolios: [
        { id: 'port_001', name: 'Conservative Growth', aum: 12500000, accounts: 45, ytdReturn: 8.2, benchmark: 'AGG', allocation: { equities: 40, bonds: 50, alternatives: 10 } },
        { id: 'port_002', name: 'Balanced Strategy', aum: 28750000, accounts: 89, ytdReturn: 11.5, benchmark: '60/40', allocation: { equities: 60, bonds: 35, alternatives: 5 } },
        { id: 'port_003', name: 'Aggressive Growth', aum: 15300000, accounts: 32, ytdReturn: 18.7, benchmark: 'S&P 500', allocation: { equities: 85, bonds: 10, alternatives: 5 } },
        { id: 'port_004', name: 'Income Focus', aum: 9200000, accounts: 67, ytdReturn: 5.4, benchmark: 'Barclays Agg', allocation: { equities: 20, bonds: 70, alternatives: 10 } },
        { id: 'port_005', name: 'Alternative Strategies', aum: 22100000, accounts: 15, ytdReturn: 14.3, benchmark: 'HFRI', allocation: { equities: 30, bonds: 20, alternatives: 50 } }
    ],

    annuityProducts: [
        { id: 'ann_001', carrier: 'MetLife', product: 'Guaranteed Income Plus', currentValue: 450000, guaranteedRate: 3.5, riders: ['Death Benefit', 'LTC'] },
        { id: 'ann_002', carrier: 'Prudential', product: 'FlexGuard Annuity', currentValue: 780000, guaranteedRate: 4.2, riders: ['Income Rider'] },
        { id: 'ann_003', carrier: 'Jackson National', product: 'Perspective II', currentValue: 320000, guaranteedRate: 3.8, riders: ['GMWB'] }
    ],

    marketSnapshot: {
        sp500: { value: 5928.45, change: 0.82, changePercent: 1.4 },
        nasdaq: { value: 18932.12, change: -23.45, changePercent: -0.12 },
        dow: { value: 43821.09, change: 156.33, changePercent: 0.36 },
        vix: { value: 14.23, change: -0.45, changePercent: -3.07 },
        gold: { value: 2638.50, change: 12.30, changePercent: 0.47 },
        bitcoin: { value: 91234.78, change: 1823.45, changePercent: 2.04 }
    },

    // Identity Ledger (SHA∞) - Hashed Identities
    identityHashes: Array.from({ length: 200 }, (_, i) => ({
        id: `sha_${String(i + 1).padStart(3, '0')}`,
        hash: `SHA∞_${Math.random().toString(36).substring(2, 15).toUpperCase()}_${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
        timestamp: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        depth: Math.floor(Math.random() * 10) + 1,
        verified: Math.random() > 0.1,
        eventType: ['registration', 'verification', 'update', 'access'][Math.floor(Math.random() * 4)]
    })),

    // Research Lab (Lucidia) - Experiments
    experiments: [
        { id: 'exp_001', title: 'Quantum Portfolio Optimization', status: 'active', progress: 67, researcher: 'Dr. Chen', startDate: '2025-09-15', description: 'Applying quantum annealing to portfolio allocation' },
        { id: 'exp_002', title: 'SHA∞ Fractal Depth Analysis', status: 'active', progress: 42, researcher: 'Dr. Patel', startDate: '2025-10-01', description: 'Exploring recursive hash patterns' },
        { id: 'exp_003', title: 'Neural Market Prediction', status: 'completed', progress: 100, researcher: 'AI Team', startDate: '2025-07-20', description: 'Transformer-based market forecasting' },
        { id: 'exp_004', title: 'Decentralized Identity Protocol', status: 'active', progress: 88, researcher: 'Security Team', startDate: '2025-08-10', description: 'Zero-knowledge proof integration' },
        { id: 'exp_005', title: 'Edge Computing for Mining', status: 'planning', progress: 15, researcher: 'Infrastructure', startDate: '2025-11-01', description: 'Pi-based distributed mining nodes' }
    ],

    // System Events
    systemEvents: [
        { timestamp: '2025-11-16 09:23:45', level: 'info', source: 'OS', message: 'System boot completed' },
        { timestamp: '2025-11-16 09:22:10', level: 'info', source: 'WindowManager', message: 'Desktop initialized' },
        { timestamp: '2025-11-16 09:21:33', level: 'warning', source: 'MinerMonitor', message: 'Miner Delta offline' },
        { timestamp: '2025-11-16 09:20:55', level: 'info', source: 'PiOps', message: 'All Pi devices synced' },
        { timestamp: '2025-11-16 09:19:12', level: 'error', source: 'API', message: 'Portfolio service timeout' },
        { timestamp: '2025-11-16 09:18:00', level: 'info', source: 'Compliance', message: 'Daily review queue updated' }
    ],

    // Notifications
    notifications: [
        { id: 'notif_001', type: 'warning', title: 'Miner Offline', message: 'BlackRoad-Delta has stopped responding', timestamp: '2025-11-16 09:21:33', read: false },
        { id: 'notif_002', type: 'error', title: 'Agent Run Failed', message: 'PortfolioRebalance agent encountered an error', timestamp: '2025-11-16 09:20:30', read: false },
        { id: 'notif_003', type: 'info', title: 'Backup Complete', message: 'Daily backup finished successfully', timestamp: '2025-11-16 03:00:15', read: true },
        { id: 'notif_004', type: 'success', title: 'Compliance Approved', message: 'Fee Schedule Update Email has been approved', timestamp: '2025-11-15 16:52:00', read: true }
    ],

    // Chaos Inbox capture items
    captureItems: [
        { id: 1, type: 'note', raw_content: 'Call back Jamie re: brand refresh', source: 'mobile', tags: ['marketing'], status: 'inbox', created_at: '2025-11-12' },
        { id: 2, type: 'link', raw_content: 'https://example.com/roadchain-deck', source: 'web_capture', tags: ['roadchain'], status: 'clustered', created_at: '2025-11-10' },
        { id: 3, type: 'idea', raw_content: 'Course outline: GPU confidence bootcamp', source: 'manual', tags: ['education', 'hardware'], status: 'resurfaced', created_at: '2025-11-01' },
        { id: 4, type: 'screenshot', raw_content: 'Screenshot: confusing AWS invoice UI', source: 'desktop', tags: ['compliance'], status: 'inbox', created_at: '2025-10-28' }
    ],

    captureClusters: [
        { id: 1, name: 'Hardware & PiOps', description: 'Troubleshooting notes and hardware tasks', item_ids: [3, 4] },
        { id: 2, name: 'Marketing & Brand', description: 'Content drafts and approvals', item_ids: [1, 2] }
    ],

    // Unified identity profile
    identityProfile: {
        name: 'BlackRoad Pilot',
        legal_name: 'BlackRoad Pilot',
        email: 'pilot@blackroad.io',
        phone: '+1-555-123-4567',
        address: '1 Infinite Road, Neo City',
        timezone: 'UTC',
        pronouns: 'they/them',
        avatar_url: '',
        external_ids: { github: 'pilot', discord: 'pilot#0001' }
    },

    // Creator workspace
    creativeProjects: [
        { id: 1, title: 'RoadStudio Lite Launch Video', type: 'video', status: 'in_production', description: '3 minute walkthrough for creators', links_to_assets: ['https://drive.example.com/video'], revenue_streams: { youtube: 200 }, notes: 'Need new b-roll of OS desktop' },
        { id: 2, title: 'GPU Confidence Course', type: 'course', status: 'drafting', description: 'Micro-course to make GPUs less scary', links_to_assets: ['notion://gpu-course-outline'], revenue_streams: { preorders: 12 }, notes: 'Pair with PiOps demo' }
    ],

    // Corporate Departments
    departments: [
        { id: 'dept_hr', name: 'Human Resources', icon: '👥', color: '#5AF' },
        { id: 'dept_legal', name: 'Legal', icon: '⚖️', color: '#A0F' },
        { id: 'dept_finance', name: 'Finance Admin', icon: '💰', color: '#0FA' },
        { id: 'dept_infra', name: 'Infrastructure', icon: '🔧', color: '#FA0' },
        { id: 'dept_agents', name: 'Agent Operations', icon: '🤖', color: '#F55' }
    ],

    // Engineering Diagnostics
    diagnostics: {
        osVersion: '0.1.0-alpha',
        buildDate: '2025-11-16',
        uptime: '2h 15m 33s',
        activeWindows: 0,
        registeredApps: 12,
        eventBusMessages: 247,
        memoryUsage: '45.2 MB',
        theme: 'tealOS'
    }
};

// Utility function to get random subset
MockData.getRandomSubset = function(array, count) {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

// Make globally available
window.MockData = MockData;
