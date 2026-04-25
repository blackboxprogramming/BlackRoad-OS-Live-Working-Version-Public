#!/usr/bin/env python3
"""
BLACKROAD SUPERCOMPUTING BENCHMARK
Comprehensive benchmarks for supercomputing capabilities
Tests CPU, memory, I/O, matrix ops, FFT, parallel processing
"""

import numpy as np
import time
import socket
import multiprocessing as mp
import os
import json
from typing import Dict, List

# Module-level functions for multiprocessing (must be picklable)
def cpu_intensive_task(n):
    """CPU-intensive computation"""
    total = 0.0
    for i in range(n):
        total += np.sqrt(i) * np.sin(i) * np.cos(i)
    return total

def estimate_pi(n_samples):
    """Monte Carlo π estimation"""
    x = np.random.rand(n_samples)
    y = np.random.rand(n_samples)
    inside = (x**2 + y**2) <= 1.0
    return 4.0 * np.sum(inside) / n_samples

class SupercomputingBenchmark:
    def __init__(self):
        self.node = socket.gethostname()
        self.results = {}
        self.cpu_count = mp.cpu_count()

        print(f"\n{'='*70}")
        print(f"💻 BLACKROAD SUPERCOMPUTING BENCHMARK")
        print(f"{'='*70}\n")
        print(f"Node: {self.node}")
        print(f"CPUs: {self.cpu_count} cores\n")

    def benchmark_cpu_single_core(self):
        """Single-core CPU performance"""
        print("⚡ SINGLE-CORE CPU PERFORMANCE\n")

        # Integer operations
        start = time.perf_counter()
        total = 0
        for i in range(10_000_000):
            total += i * i
        elapsed = time.perf_counter() - start

        int_ops = 10_000_000 / elapsed
        print(f"  Integer ops: {int_ops:,.0f} ops/sec")
        print(f"  Time: {elapsed:.3f} seconds\n")

        # Floating point operations
        start = time.perf_counter()
        total = 0.0
        for i in range(10_000_000):
            total += np.sqrt(i) * np.sin(i)
        elapsed = time.perf_counter() - start

        float_ops = 10_000_000 / elapsed
        print(f"  Float ops: {float_ops:,.0f} ops/sec")
        print(f"  Time: {elapsed:.3f} seconds\n")

        # Prime number calculation (CPU-intensive)
        def is_prime(n):
            if n < 2:
                return False
            for i in range(2, int(np.sqrt(n)) + 1):
                if n % i == 0:
                    return False
            return True

        start = time.perf_counter()
        primes = [i for i in range(1, 10000) if is_prime(i)]
        elapsed = time.perf_counter() - start

        print(f"  Prime calculation: {len(primes)} primes found")
        print(f"  Time: {elapsed:.3f} seconds")
        print(f"  Primes/sec: {len(primes)/elapsed:,.0f}\n")

        self.results['cpu_single_core'] = {
            'int_ops_per_sec': int_ops,
            'float_ops_per_sec': float_ops,
            'primes_per_sec': len(primes)/elapsed
        }

    def benchmark_cpu_multi_core(self):
        """Multi-core CPU performance"""
        print("🚀 MULTI-CORE CPU PERFORMANCE\n")

        # Single-threaded
        start = time.perf_counter()
        result_single = cpu_intensive_task(1_000_000)
        single_time = time.perf_counter() - start

        print(f"  Single-threaded: {single_time:.3f} seconds")

        # Multi-threaded
        start = time.perf_counter()
        with mp.Pool(processes=self.cpu_count) as pool:
            chunk_size = 1_000_000 // self.cpu_count
            results = pool.map(cpu_intensive_task, [chunk_size] * self.cpu_count)
        multi_time = time.perf_counter() - start

        speedup = single_time / multi_time
        efficiency = (speedup / self.cpu_count) * 100

        print(f"  Multi-threaded ({self.cpu_count} cores): {multi_time:.3f} seconds")
        print(f"  Speedup: {speedup:.2f}x")
        print(f"  Parallel efficiency: {efficiency:.1f}%\n")

        self.results['cpu_multi_core'] = {
            'single_time': single_time,
            'multi_time': multi_time,
            'speedup': speedup,
            'efficiency': efficiency
        }

    def benchmark_memory_bandwidth(self):
        """Memory bandwidth testing"""
        print("💾 MEMORY BANDWIDTH\n")

        sizes = [1_000_000, 10_000_000, 100_000_000]

        for size in sizes:
            # Allocate arrays
            a = np.random.rand(size)
            b = np.random.rand(size)

            # Vector addition (memory-bound)
            start = time.perf_counter()
            c = a + b
            elapsed = time.perf_counter() - start

            # Calculate bandwidth (bytes/sec)
            # Read a, read b, write c = 3 * size * 8 bytes
            bytes_transferred = 3 * size * 8
            bandwidth = bytes_transferred / elapsed / 1e9  # GB/s

            print(f"  Size: {size:,} elements ({size*8/1e6:.1f} MB)")
            print(f"  Time: {elapsed*1000:.2f} ms")
            print(f"  Bandwidth: {bandwidth:.2f} GB/s\n")

        # Matrix copy (larger data)
        matrix_size = 5000
        matrix = np.random.rand(matrix_size, matrix_size)

        start = time.perf_counter()
        matrix_copy = matrix.copy()
        elapsed = time.perf_counter() - start

        bytes_transferred = matrix_size * matrix_size * 8 * 2  # read + write
        bandwidth = bytes_transferred / elapsed / 1e9

        print(f"  Matrix copy ({matrix_size}×{matrix_size}):")
        print(f"  Time: {elapsed*1000:.2f} ms")
        print(f"  Bandwidth: {bandwidth:.2f} GB/s\n")

        self.results['memory_bandwidth'] = {
            'max_bandwidth_gb_s': bandwidth
        }

    def benchmark_nvme_io(self):
        """NVMe I/O performance (if available)"""
        print("📁 DISK I/O PERFORMANCE\n")

        # Try NVMe first, fall back to /tmp
        test_paths = ["/mnt/nvme", "/tmp"]
        test_file = None

        for path in test_paths:
            if os.path.exists(path):
                try:
                    test_path = os.path.join(path, "benchmark_test.dat")
                    # Test if we can write
                    with open(test_path, 'wb') as f:
                        f.write(b'test')
                    os.remove(test_path)
                    test_file = test_path
                    print(f"  Using: {path}\n")
                    break
                except (PermissionError, OSError):
                    continue

        if test_file is None:
            print(f"  No writable disk path found, skipping\n")
            return

        # Write test
        sizes = [1, 10, 100, 1000]  # MB

        write_speeds = []
        read_speeds = []

        for size_mb in sizes:
            size_bytes = size_mb * 1024 * 1024
            data = np.random.bytes(size_bytes)

            # Write
            start = time.perf_counter()
            with open(test_file, 'wb') as f:
                f.write(data)
                f.flush()
                os.fsync(f.fileno())
            write_time = time.perf_counter() - start
            write_speed = size_mb / write_time

            # Read
            start = time.perf_counter()
            with open(test_file, 'rb') as f:
                _ = f.read()
            read_time = time.perf_counter() - start
            read_speed = size_mb / read_time

            print(f"  {size_mb} MB:")
            print(f"    Write: {write_speed:.2f} MB/s ({write_time*1000:.2f} ms)")
            print(f"    Read:  {read_speed:.2f} MB/s ({read_time*1000:.2f} ms)\n")

            write_speeds.append(write_speed)
            read_speeds.append(read_speed)

        # Cleanup
        if os.path.exists(test_file):
            os.remove(test_file)

        self.results['nvme_io'] = {
            'max_write_speed_mb_s': max(write_speeds),
            'max_read_speed_mb_s': max(read_speeds)
        }

    def benchmark_matrix_operations(self):
        """Matrix operations (BLAS/LAPACK style)"""
        print("🔢 MATRIX OPERATIONS (Linear Algebra)\n")

        sizes = [100, 500, 1000, 2000]

        for n in sizes:
            # Matrix multiplication (most important benchmark)
            A = np.random.rand(n, n)
            B = np.random.rand(n, n)

            start = time.perf_counter()
            C = A @ B
            elapsed = time.perf_counter() - start

            # Calculate GFLOPS
            # Matrix multiply: 2n³ operations
            ops = 2 * n**3
            gflops = ops / elapsed / 1e9

            print(f"  Matrix multiply ({n}×{n}):")
            print(f"    Time: {elapsed*1000:.2f} ms")
            print(f"    Performance: {gflops:.2f} GFLOPS\n")

        # Large matrix operations
        n = 5000
        print(f"  Large matrix operations ({n}×{n}):\n")

        # Matrix creation
        start = time.perf_counter()
        M = np.random.rand(n, n)
        elapsed = time.perf_counter() - start
        print(f"    Creation: {elapsed*1000:.2f} ms")

        # Matrix transpose
        start = time.perf_counter()
        MT = M.T
        elapsed = time.perf_counter() - start
        print(f"    Transpose: {elapsed*1000:.2f} ms")

        # Matrix inverse (expensive!)
        n_small = 1000
        M_small = np.random.rand(n_small, n_small)
        start = time.perf_counter()
        M_inv = np.linalg.inv(M_small)
        elapsed = time.perf_counter() - start
        print(f"    Inverse ({n_small}×{n_small}): {elapsed*1000:.2f} ms")

        # Eigenvalues
        start = time.perf_counter()
        eigenvalues = np.linalg.eigvals(M_small)
        elapsed = time.perf_counter() - start
        print(f"    Eigenvalues ({n_small}×{n_small}): {elapsed*1000:.2f} ms")

        # SVD (Singular Value Decomposition)
        start = time.perf_counter()
        U, S, Vh = np.linalg.svd(M_small)
        elapsed = time.perf_counter() - start
        print(f"    SVD ({n_small}×{n_small}): {elapsed*1000:.2f} ms\n")

        self.results['matrix_operations'] = {
            'max_gflops': gflops
        }

    def benchmark_fft(self):
        """FFT (Fast Fourier Transform) performance"""
        print("🌊 FFT PERFORMANCE\n")

        sizes = [1024, 4096, 16384, 65536, 262144, 1048576]

        for size in sizes:
            signal = np.random.rand(size)

            # Forward FFT
            start = time.perf_counter()
            fft_result = np.fft.fft(signal)
            elapsed = time.perf_counter() - start

            # Theoretical complexity: O(N log N)
            ops = size * np.log2(size)
            mops = ops / elapsed / 1e6

            print(f"  FFT size {size:>8,}:")
            print(f"    Time: {elapsed*1000:>8.2f} ms")
            print(f"    MOPS: {mops:>8.2f}\n")

        # 2D FFT (image processing)
        sizes_2d = [128, 256, 512, 1024]

        for size in sizes_2d:
            image = np.random.rand(size, size)

            start = time.perf_counter()
            fft_2d = np.fft.fft2(image)
            elapsed = time.perf_counter() - start

            ops = size * size * np.log2(size * size)
            mops = ops / elapsed / 1e6

            print(f"  2D FFT {size}×{size}:")
            print(f"    Time: {elapsed*1000:>8.2f} ms")
            print(f"    MOPS: {mops:>8.2f}\n")

        self.results['fft'] = {
            'max_mops': mops
        }

    def benchmark_scientific_computing(self):
        """Scientific computing workloads"""
        print("🔬 SCIENTIFIC COMPUTING\n")

        # Monte Carlo simulation (embarrassingly parallel)
        print("  Monte Carlo π estimation:")

        n_samples = 10_000_000

        # Single-threaded
        start = time.perf_counter()
        pi_estimate = estimate_pi(n_samples)
        single_time = time.perf_counter() - start

        print(f"    Samples: {n_samples:,}")
        print(f"    Estimate: {pi_estimate:.10f}")
        print(f"    Error: {abs(pi_estimate - np.pi):.10f}")
        print(f"    Time (single): {single_time:.3f} seconds")

        # Multi-threaded
        start = time.perf_counter()
        with mp.Pool(processes=self.cpu_count) as pool:
            chunk_size = n_samples // self.cpu_count
            results = pool.map(estimate_pi, [chunk_size] * self.cpu_count)
        pi_estimate_parallel = np.mean(results)
        multi_time = time.perf_counter() - start

        speedup = single_time / multi_time

        print(f"    Time (multi): {multi_time:.3f} seconds")
        print(f"    Speedup: {speedup:.2f}x\n")

        # Numerical integration
        print("  Numerical integration:")

        def integrate_function(n_points):
            x = np.linspace(0, np.pi, n_points)
            y = np.sin(x)
            integral = np.trapz(y, x)
            return integral

        n_points = 10_000_000

        start = time.perf_counter()
        integral = integrate_function(n_points)
        elapsed = time.perf_counter() - start

        print(f"    ∫sin(x)dx from 0 to π")
        print(f"    Points: {n_points:,}")
        print(f"    Result: {integral:.10f}")
        print(f"    Expected: 2.0")
        print(f"    Error: {abs(integral - 2.0):.10f}")
        print(f"    Time: {elapsed:.3f} seconds\n")

        self.results['scientific_computing'] = {
            'monte_carlo_speedup': speedup,
            'pi_error': abs(pi_estimate - np.pi)
        }

    def run_all_benchmarks(self):
        """Run complete benchmark suite"""
        print(f"\n{'='*70}")
        print("RUNNING COMPREHENSIVE SUPERCOMPUTING BENCHMARKS")
        print(f"{'='*70}\n")

        start_total = time.perf_counter()

        self.benchmark_cpu_single_core()
        print(f"{'='*70}\n")

        self.benchmark_cpu_multi_core()
        print(f"{'='*70}\n")

        self.benchmark_memory_bandwidth()
        print(f"{'='*70}\n")

        self.benchmark_nvme_io()
        print(f"{'='*70}\n")

        self.benchmark_matrix_operations()
        print(f"{'='*70}\n")

        self.benchmark_fft()
        print(f"{'='*70}\n")

        self.benchmark_scientific_computing()
        print(f"{'='*70}\n")

        elapsed_total = time.perf_counter() - start_total

        print(f"\n{'='*70}")
        print(f"🏆 BENCHMARK COMPLETE - {self.node}")
        print(f"{'='*70}\n")
        print(f"Total time: {elapsed_total:.3f} seconds")
        print(f"Benchmarks run: {len(self.results)}")
        print(f"\n✅ Supercomputing benchmark complete!\n")

        return self.results

if __name__ == '__main__':
    benchmark = SupercomputingBenchmark()
    results = benchmark.run_all_benchmarks()

    # Save results
    with open('/tmp/supercomputing_benchmark_results.json', 'w') as f:
        json.dump({
            'node': socket.gethostname(),
            'results': results
        }, f, indent=2, default=str)

    print(f"Results saved to /tmp/supercomputing_benchmark_results.json\n")
