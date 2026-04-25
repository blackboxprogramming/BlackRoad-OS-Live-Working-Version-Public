import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type WindowState = {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isOpen: boolean;
  isMaximized: boolean;
  zIndex: number;
};

export type LucidiaStats = {
  status: string;
  activeAgents: number;
  totalAgents: number;
  memoryJournals: number;
  eventBusRate: number;
  uptime: number;
};

export type RoadChainStats = {
  currentBlock: number;
  networkHashrate: string;
  activeNodes: number;
  yourHashrate: string;
  shares: string;
  dailyEarnings: string;
};

export type WalletStats = {
  balanceRC: number;
  balanceUSD: number;
};

export type MinerStats = {
  hashRate: string;
  sharesAccepted: number;
  poolName: string;
};

export type WindowId =
  | 'lucidia'
  | 'agents'
  | 'roadchain'
  | 'wallet'
  | 'terminal'
  | 'roadmail'
  | 'social'
  | 'blackstream'
  | 'roadview'
  | 'pi'
  | 'miner'
  | 'roadcraft';

const API_BASE = '/api/br95';

const WINDOW_PRESETS: Record<WindowId, WindowState> = {
  lucidia: { id: 'lucidia', position: { x: 60, y: 90 }, size: { width: 680, height: 420 }, isOpen: false, isMaximized: false, zIndex: 10 },
  agents: { id: 'agents', position: { x: 120, y: 120 }, size: { width: 760, height: 460 }, isOpen: false, isMaximized: false, zIndex: 10 },
  roadchain: { id: 'roadchain', position: { x: 180, y: 80 }, size: { width: 760, height: 440 }, isOpen: false, isMaximized: false, zIndex: 10 },
  wallet: { id: 'wallet', position: { x: 220, y: 130 }, size: { width: 520, height: 380 }, isOpen: false, isMaximized: false, zIndex: 10 },
  terminal: { id: 'terminal', position: { x: 140, y: 180 }, size: { width: 720, height: 420 }, isOpen: false, isMaximized: false, zIndex: 10 },
  roadmail: { id: 'roadmail', position: { x: 80, y: 80 }, size: { width: 640, height: 380 }, isOpen: false, isMaximized: false, zIndex: 10 },
  social: { id: 'social', position: { x: 160, y: 90 }, size: { width: 640, height: 380 }, isOpen: false, isMaximized: false, zIndex: 10 },
  blackstream: { id: 'blackstream', position: { x: 200, y: 100 }, size: { width: 720, height: 420 }, isOpen: false, isMaximized: false, zIndex: 10 },
  roadview: { id: 'roadview', position: { x: 120, y: 70 }, size: { width: 820, height: 460 }, isOpen: false, isMaximized: false, zIndex: 10 },
  pi: { id: 'pi', position: { x: 220, y: 140 }, size: { width: 540, height: 320 }, isOpen: false, isMaximized: false, zIndex: 10 },
  miner: { id: 'miner', position: { x: 260, y: 120 }, size: { width: 560, height: 320 }, isOpen: false, isMaximized: false, zIndex: 10 },
  roadcraft: { id: 'roadcraft', position: { x: 300, y: 160 }, size: { width: 600, height: 360 }, isOpen: false, isMaximized: false, zIndex: 10 },
};

export function useWindowManager() {
  const [windowStates, setWindowStates] = useState<Record<WindowId, WindowState>>(WINDOW_PRESETS);
  const [openWindows, setOpenWindows] = useState<WindowId[]>([]);
  const [activeWindow, setActiveWindow] = useState<WindowId | null>(null);
  const [roadMenuOpen, setRoadMenuOpen] = useState(false);
  const [shellReady, setShellReady] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  const zIndexRef = useRef(10);
  const dragRef = useRef<{ id: WindowId; offsetX: number; offsetY: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuButtonRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<NodeJS.Timeout | null>(null);

  const [lucidiaStats, setLucidiaStats] = useState<LucidiaStats>({
    status: 'OPERATIONAL',
    activeAgents: 1000,
    totalAgents: 1000,
    memoryJournals: 1000,
    eventBusRate: 847,
    uptime: 99.95,
  });

  const [roadchainStats, setRoadchainStats] = useState<RoadChainStats>({
    currentBlock: 1247891,
    networkHashrate: '847.3 TH/s',
    activeNodes: 2847,
    yourHashrate: '1.2 GH/s',
    shares: '8,423 accepted',
    dailyEarnings: '47.23 RC',
  });

  const [walletStats, setWalletStats] = useState<WalletStats>({
    balanceRC: 1247.89,
    balanceUSD: 18705,
  });

  const [minerStats, setMinerStats] = useState<MinerStats>({
    hashRate: '1.2 GH/s',
    sharesAccepted: 8423,
    poolName: 'BR‑Global‑01',
  });

  useEffect(() => {
    const timer = setTimeout(() => setShellReady(true), 2400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!roadMenuOpen) return;
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || menuButtonRef.current?.contains(target)) {
        return;
      }
      setRoadMenuOpen(false);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [roadMenuOpen]);

  const focusWindow = useCallback((id: WindowId) => {
    setWindowStates((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const nextZ = ++zIndexRef.current;
      return { ...prev, [id]: { ...current, zIndex: nextZ } };
    });
    setActiveWindow(id);
  }, []);

  const openWindow = useCallback((id: WindowId) => {
    setWindowStates((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const nextZ = ++zIndexRef.current;
      return { ...prev, [id]: { ...current, isOpen: true, zIndex: nextZ } };
    });
    setActiveWindow(id);
    setOpenWindows((prev) => (prev.includes(id) ? prev : [...prev, id]));
    setRoadMenuOpen(false);
  }, []);

  const closeWindow = useCallback((id: WindowId) => {
    setWindowStates((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, isOpen: false } };
    });
    setOpenWindows((prev) => prev.filter((win) => win !== id));
    setActiveWindow((prev) => (prev === id ? null : prev));
  }, []);

  const minimizeWindow = useCallback((id: WindowId) => {
    setWindowStates((prev) => {
      const current = prev[id];
      if (!current) return prev;
      return { ...prev, [id]: { ...current, isOpen: false } };
    });
    setActiveWindow((prev) => (prev === id ? null : prev));
  }, []);

  const maximizeWindow = useCallback((id: WindowId) => {
    setWindowStates((prev) => {
      const current = prev[id];
      if (!current) return prev;
      const nextZ = ++zIndexRef.current;
      return { ...prev, [id]: { ...current, isMaximized: !current.isMaximized, zIndex: nextZ } };
    });
    setActiveWindow(id);
  }, []);

  const startDrag = useCallback((id: WindowId, event: React.MouseEvent) => {
    event.preventDefault();
    setWindowStates((prev) => {
      const current = prev[id];
      if (!current || current.isMaximized) return prev;
      dragRef.current = {
        id,
        offsetX: event.clientX - current.position.x,
        offsetY: event.clientY - current.position.y,
      };
      const nextZ = ++zIndexRef.current;
      return { ...prev, [id]: { ...current, zIndex: nextZ } };
    });
    setActiveWindow(id);
  }, []);

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      if (!dragRef.current) return;
      setWindowStates((prev) => {
        const current = prev[dragRef.current!.id];
        if (!current || current.isMaximized) return prev;
        const nextPosition = {
          x: event.clientX - dragRef.current!.offsetX,
          y: event.clientY - dragRef.current!.offsetY,
        };
        return { ...prev, [current.id]: { ...current, position: nextPosition } };
      });
    };

    const handleUp = () => {
      dragRef.current = null;
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, []);

  const toggleRoadMenu = useCallback(() => {
    setRoadMenuOpen((prev) => !prev);
  }, []);

  const taskbarToggle = useCallback(
    (id: WindowId) => {
      if (windowStates[id]?.isOpen && activeWindow === id) {
        minimizeWindow(id);
      } else {
        openWindow(id);
      }
    },
    [activeWindow, minimizeWindow, openWindow, windowStates],
  );

  const clockText = useMemo(() => clock.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), [clock]);

  const fetchLucidia = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/lucidia`);
      const data = await response.json();
      setLucidiaStats((prev) => ({
        status: data.status ? String(data.status).toUpperCase() : prev.status,
        activeAgents: data.active_agents ?? prev.activeAgents,
        totalAgents: data.total_agents ?? prev.totalAgents,
        memoryJournals: data.memory_journals ?? prev.memoryJournals,
        eventBusRate: data.event_bus_rate ?? prev.eventBusRate,
        uptime: data.system_health ?? prev.uptime,
      }));
    } catch (error) {
      console.error('Failed to fetch Lucidia stats:', error);
    }
  }, []);

  const fetchRoadchain = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/roadchain`);
      const data = await response.json();
      setRoadchainStats((prev) => ({
        currentBlock: data.current_block ?? prev.currentBlock,
        networkHashrate: data.network_hashrate ?? prev.networkHashrate,
        activeNodes: data.active_nodes ?? prev.activeNodes,
        yourHashrate: data.your_hashrate ?? prev.yourHashrate,
        shares: prev.shares,
        dailyEarnings: prev.dailyEarnings,
      }));
    } catch (error) {
      console.error('Failed to fetch RoadChain stats:', error);
    }
  }, []);

  const fetchWallet = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/wallet`);
      const data = await response.json();
      setWalletStats((prev) => ({
        balanceRC: data.balance_rc ?? prev.balanceRC,
        balanceUSD: data.balance_usd ?? prev.balanceUSD,
      }));
    } catch (error) {
      console.error('Failed to fetch Wallet stats:', error);
    }
  }, []);

  const fetchMiner = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/miner`);
      const data = await response.json();
      setMinerStats((prev) => ({
        hashRate: data.hash_rate ?? prev.hashRate,
        sharesAccepted: data.shares_accepted ?? prev.sharesAccepted,
        poolName: data.pool_name ?? prev.poolName,
      }));
    } catch (error) {
      console.error('Failed to fetch Miner stats:', error);
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (typeof window === 'undefined') return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}${API_BASE}/ws`;

    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        switch (message.type) {
          case 'miner_update':
            setMinerStats((prev) => ({
              ...prev,
              hashRate: message.data?.hash_rate ?? prev.hashRate,
              sharesAccepted: message.data?.shares_accepted ?? prev.sharesAccepted,
            }));
            break;
          case 'roadchain_update':
            setRoadchainStats((prev) => ({
              ...prev,
              currentBlock: message.data?.current_block ?? prev.currentBlock,
              activeNodes: message.data?.active_nodes ?? prev.activeNodes,
            }));
            break;
          case 'wallet_update':
            setWalletStats((prev) => ({
              ...prev,
              balanceRC: message.data?.balance_rc ?? prev.balanceRC,
              balanceUSD: message.data?.balance_usd ?? prev.balanceUSD,
            }));
            break;
          default:
            break;
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    socket.onclose = () => {
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
      reconnectRef.current = setTimeout(connectWebSocket, 5000);
    };

    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }, []);

  useEffect(() => {
    if (!shellReady) return;

    let lucidiaInterval: NodeJS.Timeout | null = null;
    const startApis = () => {
      fetchLucidia();
      fetchRoadchain();
      fetchWallet();
      fetchMiner();
      connectWebSocket();
      lucidiaInterval = setInterval(fetchLucidia, 30000);
    };

    const timer = setTimeout(startApis, 3000);

    return () => {
      clearTimeout(timer);
      if (lucidiaInterval) {
        clearInterval(lucidiaInterval);
      }
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
      wsRef.current?.close();
    };
  }, [connectWebSocket, fetchLucidia, fetchMiner, fetchRoadchain, fetchWallet, shellReady]);

  return {
    windowStates,
    openWindows,
    activeWindow,
    roadMenuOpen,
    shellReady,
    clockText,
    lucidiaStats,
    roadchainStats,
    walletStats,
    minerStats,
    menuRef,
    menuButtonRef,
    openWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    startDrag,
    focusWindow,
    toggleRoadMenu,
    taskbarToggle,
  };
}
