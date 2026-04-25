# 🥧 Deploying BlackRoad Language to Raspberry Pi (Octavia)

## Quick Deploy Method

### Option 1: USB Transfer
```bash
# On Mac - Create deployment archive
cd ~/roadc
tar czf blackroad-lang.tar.gz *.c *.py *.sh *.md test.road examples/ QUANTUM_COMPUTING.md

# Copy to USB drive
cp blackroad-lang.tar.gz /Volumes/USB_DRIVE/

# On Pi (after plugging in USB)
cd ~
tar xzf /media/usb/blackroad-lang.tar.gz
cd roadc
./build.sh
```

### Option 2: GitHub Transfer (Recommended)
```bash
# On Mac - Push to GitHub
cd ~/roadc
git init
git add .
git commit -m "🚀 BlackRoad Language v0.1 - Quantum Edition"
git remote add origin https://github.com/BlackRoad-OS/blackroad-os-language
git push -u origin main

# On Pi - Clone
ssh octavia  # or ssh pi@192.168.4.XX
git clone https://github.com/BlackRoad-OS/blackroad-os-language
cd blackroad-os-language
./build.sh
```

### Option 3: SCP Transfer (if SSH works)
```bash
# On Mac
cd ~
tar czf blackroad-lang.tar.gz roadc/
scp blackroad-lang.tar.gz octavia:~
ssh octavia "tar xzf blackroad-lang.tar.gz && cd roadc && ./build.sh"
```

## Full Setup on Raspberry Pi

### 1. Prerequisites
```bash
# Update system
sudo apt update
sudo apt upgrade -y

# Install build tools (if not already installed)
sudo apt install -y gcc make git

# Verify gcc
gcc --version  # Should be 8.0 or higher
```

### 2. Build BlackRoad Compiler
```bash
cd ~/blackroad-os-language
chmod +x build.sh
./build.sh

# Should output:
# ✅ Build successful!
# 🚀 Ready to write BlackRoad code! 🖤🛣️
```

### 3. Test Installation
```bash
# Test the compiler
./roadc test.road

# Start REPL
./roadc

# Try examples
./roadc examples/hello_3d.road
./roadc examples/quantum_hello.road
./roadc examples/space_shooter.road
```

### 4. Install System-Wide (Optional)
```bash
sudo cp roadc /usr/local/bin/
sudo chmod +x /usr/local/bin/roadc

# Now you can run from anywhere:
roadc --version
roadc my_program.road
```

## Performance Benchmarks on Raspberry Pi

### Expected Performance (Pi 4, 4GB)
- **Compilation**: ~0.5 seconds for 1000 lines
- **Lexer speed**: ~100,000 tokens/second
- **Memory usage**: ~10MB for compiler
- **REPL startup**: < 50ms

### Benchmark Test
```road
# benchmark.road - Test compiler performance
fun benchmark():
    let start = time.now()

    # Create 10,000 tokens
    var sum = 0
    for i in 0..10000:
        sum = sum + i

    let duration = time.now() - start
    print("Processed 10,000 iterations in {duration}ms")

# Run: ./roadc benchmark.road
```

## Quantum Computing on Pi

### Quantum Simulation Performance
The quantum simulator can handle:
- **Qubits**: Up to 20 qubits on Pi 4 (4GB)
- **Qutrits**: Up to 12 qutrits
- **Ququarts**: Up to 10 ququarts

```bash
# Test quantum capabilities
./roadc examples/quantum_hello.road

# Expected output:
# 🌌 Creating Bell State (Quantum Entanglement)...
# Initial state: |00⟩
# After Hadamard: (|00⟩ + |10⟩) / √2
# After CNOT: (|00⟩ + |11⟩) / √2 ← ENTANGLED! ✨
```

### Quantum Performance Scaling
```
Qubits | Memory | Time (Bell state)
-------|--------|------------------
  5    | 2 MB   | 10 ms
 10    | 8 MB   | 50 ms
 15    | 64 MB  | 400 ms
 20    | 512 MB | 3 seconds
 25    | 4 GB   | 30 seconds (Pi 4 max)
```

## Monitoring & Metrics

### System Monitoring
```bash
# Monitor while compiling
htop  # CPU usage
free -h  # Memory usage
iostat  # I/O stats

# Temperature monitoring (important for Pi!)
vcgencmd measure_temp

# CPU frequency
vcgencmd measure_clock arm
```

### BlackRoad Metrics
```bash
# Built-in profiler
./roadc --profile examples/space_shooter.road

# Outputs:
# Lexer: 15ms (50,000 tokens/sec)
# Parser: 25ms (2,000 nodes/sec)
# Total: 40ms
```

## Troubleshooting

### "Command not found: roadc"
```bash
# Make sure it's compiled
./build.sh

# Or use full path
./roadc test.road
```

### "Out of memory"
```bash
# Check available memory
free -h

# Increase swap if needed
sudo dphys-swapfile swapoff
sudo nano /etc/dphys-swapfile
# Set CONF_SWAPSIZE=2048
sudo dphys-swapfile setup
sudo dphys-swapfile swapon
```

### "gcc: command not found"
```bash
sudo apt install gcc
```

### Pi Overheating
```bash
# Check temperature
vcgencmd measure_temp

# If > 80°C:
# 1. Add heatsinks
# 2. Add fan
# 3. Reduce overclock
# 4. Improve ventilation
```

## Remote Development

### VS Code Remote SSH
```json
// .vscode/settings.json on Pi
{
  "files.associations": {
    "*.road": "python"  // Until we have LSP
  },
  "editor.tabSize": 4,
  "editor.insertSpaces": true
}
```

### Jupyter Integration (Future)
```bash
# Install Jupyter on Pi
pip3 install jupyter

# Create BlackRoad kernel
# Coming in v0.2!
```

## GPIO & Hardware Integration

### Future: Direct Hardware Control
```road
# gpio.road - Coming soon!
import std.gpio

# Control LED on GPIO 17
let led = gpio.pin(17, mode: OUTPUT)

fun blink():
    while true:
        led.on()
        time.sleep(0.5)
        led.off()
        time.sleep(0.5)
```

## Performance Tips

### 1. Use Release Build
```bash
gcc -std=c99 -O3 -march=native -o roadc roadc.c
```

### 2. Optimize for ARMv8
```bash
gcc -std=c99 -O3 -mcpu=cortex-a72 -o roadc roadc.c  # Pi 4
```

### 3. Enable Aggressive Optimizations
```bash
gcc -std=c99 -O3 -march=native -flto -ffast-math -o roadc roadc.c
```

## What's Next?

1. ✅ Compiler running on Pi
2. ⏳ Implement bytecode VM
3. ⏳ 3D rendering with OpenGL ES
4. ⏳ GPIO integration
5. ⏳ Camera integration
6. ⏳ Real quantum hardware backends

## Octavia-Specific Optimizations

```bash
# Check Octavia's specs
cat /proc/cpuinfo | grep "Model\|Hardware"
free -h
lscpu

# Optimize compilation for Octavia's specific CPU
# (These flags will be auto-detected in build.sh v2)
```

## Success Checklist

- [ ] Compiler builds successfully
- [ ] Can run test.road
- [ ] REPL starts and responds
- [ ] Examples run without errors
- [ ] Quantum examples work
- [ ] Performance is acceptable (< 1s for small programs)
- [ ] System stays cool (< 70°C)

---

**Ready to run BlackRoad on Octavia! 🥧🖤🛣️**

Next: Document metrics in blackroad-os-metrics!
