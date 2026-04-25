#!/usr/bin/env python3
"""
BLACKROAD QUANTUM CLUSTER BENCHMARK SUITE
Performance testing across distributed heterogeneous hardware
"""

import numpy as np
import time
import socket
import json
from datetime import datetime

class QuantumBenchmark:
    def __init__(self):
        self.hostname = socket.gethostname()
        self.results = []
        print(f"\n{'='*70}")
        print(f"🚀 BLACKROAD QUANTUM CLUSTER BENCHMARK")
        print(f"{'='*70}\n")
        print(f"Node: {self.hostname}")

    def benchmark_qudit_speed(self):
        """Qudit creation speed"""
        print(f"\n📊 BENCHMARK: Qudit Creation Speed\n")
        dimensions = [2,3,4,5,7,11,13,17,19,23,29,31,37,43,47,53,59,61,67,71]
        results = []
        for d in dimensions:
            start = time.perf_counter()
            state = np.zeros(d, dtype=complex)
            state[0] = 1.0
            H = np.ones((d, d), dtype=complex) / np.sqrt(d)
            state = H @ state
            elapsed = time.perf_counter() - start
            print(f"  d={d:3d}: {elapsed*1000:.3f} ms ({int(1/elapsed):,} qudits/sec)")
            results.append({'d': d, 'qudits_per_sec': int(1/elapsed)})
        self.results.append({'test': 'qudit_speed', 'data': results})
        return results

    def benchmark_entanglement(self):
        """Entanglement generation throughput"""
        print(f"\n📊 BENCHMARK: Entanglement Throughput\n")
        test_cases = [(2,3,1000), (3,5,500), (5,7,200), (7,11,100), (11,13,50)]
        results = []
        for d1, d2, count in test_cases:
            start = time.perf_counter()
            dim = d1 * d2
            for _ in range(count):
                state = np.zeros(dim, dtype=complex)
                for k in range(min(d1, d2)):
                    state[k * d2 + k] = 1.0 / np.sqrt(min(d1, d2))
            elapsed = time.perf_counter() - start
            throughput = int(count / elapsed)
            print(f"  ({d1},{d2}): {count} pairs in {elapsed:.3f}s = {throughput:,} pairs/sec")
            results.append({'dims': (d1,d2), 'pairs_per_sec': throughput})
        self.results.append({'test': 'entanglement', 'data': results})
        return results

    def benchmark_qft(self):
        """QFT performance"""
        print(f"\n📊 BENCHMARK: Quantum Fourier Transform\n")
        dimensions = [4, 8, 16, 32, 64, 128, 256, 512]
        results = []
        for d in dimensions:
            try:
                state = np.random.rand(d) + 1j * np.random.rand(d)
                state /= np.linalg.norm(state)
                start = time.perf_counter()
                omega = np.exp(2j * np.pi / d)
                QFT = np.array([[omega**(j*k)/np.sqrt(d) for k in range(d)] for j in range(d)])
                result = QFT @ state
                elapsed = time.perf_counter() - start
                print(f"  QFT-{d:4d}: {elapsed*1000:.2f} ms")
                results.append({'d': d, 'time_ms': elapsed*1000})
            except MemoryError:
                break
        self.results.append({'test': 'qft', 'data': results})
        return results

    def benchmark_grover(self):
        """Grover's quantum search"""
        print(f"\n📊 BENCHMARK: Grover's Search Algorithm\n")
        results = []
        for N in [4, 8, 16, 32, 64, 128]:
            iterations = int(np.pi * np.sqrt(N) / 4)
            target = np.random.randint(0, N)
            start = time.perf_counter()
            state = np.ones(N, dtype=complex) / np.sqrt(N)
            for _ in range(iterations):
                oracle = np.eye(N, dtype=complex)
                oracle[target, target] = -1
                state = oracle @ state
                diffusion = 2 * np.outer(np.ones(N), np.ones(N)) / N - np.eye(N)
                state = diffusion @ state
            probabilities = np.abs(state) ** 2
            success = (np.argmax(probabilities) == target)
            elapsed = time.perf_counter() - start
            print(f"  N={N:3d}: {iterations} iter, success={success}, {elapsed*1000:.2f}ms")
            results.append({'N': N, 'success': success, 'time_ms': elapsed*1000})
        self.results.append({'test': 'grover', 'data': results})
        return results

    def benchmark_massive_hilbert(self):
        """Largest Hilbert space"""
        print(f"\n📊 BENCHMARK: Massive Hilbert Space Limits\n")
        results = []
        for d in range(100, 1100, 100):
            try:
                start = time.perf_counter()
                state = np.zeros(d, dtype=complex)
                state[0] = 1.0
                H = np.ones((d, d), dtype=complex) / np.sqrt(d)
                state = H @ state
                elapsed = time.perf_counter() - start
                memory_mb = (state.nbytes + H.nbytes) / (1024**2)
                print(f"  d={d:4d}: {elapsed*1000:.2f} ms, {memory_mb:.1f} MB")
                results.append({'d': d, 'time_ms': elapsed*1000, 'memory_mb': memory_mb})
            except MemoryError:
                print(f"  d={d:4d}: MEMORY LIMIT REACHED")
                break
        self.results.append({'test': 'massive_hilbert', 'data': results})
        return results

    def run_all(self):
        print(f"Starting benchmark suite on {self.hostname}...\n")
        self.benchmark_qudit_speed()
        self.benchmark_entanglement()
        self.benchmark_qft()
        self.benchmark_grover()
        self.benchmark_massive_hilbert()
        print(f"\n{'='*70}")
        print(f"✅ ALL BENCHMARKS COMPLETE")
        print(f"{'='*70}\n")
        return self.results

if __name__ == '__main__':
    bench = QuantumBenchmark()
    results = bench.run_all()
    output = {'timestamp': datetime.now().isoformat(), 'node': socket.gethostname(), 'benchmarks': results}
    print("\nBENCHMARK_JSON_START")
    print(json.dumps(output, indent=2))
    print("BENCHMARK_JSON_END\n")
    print(f"🚀 Quantum benchmarks complete on {socket.gethostname()}!\n")
