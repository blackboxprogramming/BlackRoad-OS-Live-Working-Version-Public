# 🥧⚡ Pi Task Management - Complete Guide

**Run your project tasks on Raspberry Pis remotely!**

---

## �� What You Can Do Now

### **Deploy & Run in One Command**
Deploy your code to a Pi and run tasks automatically:
```bash
br pi task deploy pi1 ./my-app /home/pi/apps/my-app build
```

### **Detect Tasks Automatically**
See what tasks are available on any project:
```bash
br pi task detect pi1 /home/pi/my-app
```

### **Run Tasks Remotely**
Execute npm scripts, make targets, cargo commands, etc:
```bash
br pi task run pi1 /home/pi/my-app test
br pi task run pi1 /home/pi/my-app start
```

### **Background Execution**
Run long-running tasks as daemons:
```bash
br pi task background pi1 /home/pi/server start
```

### **Track Everything**
View history of all tasks run on your Pis:
```bash
br pi task logs pi1
```

---

## 🚀 QUICK START

### 1. Deploy a Node.js App

```bash
# Your local project structure:
my-app/
├── package.json
├── src/
└── ...

# Deploy and run
br pi task deploy pi1 ./my-app /home/pi/apps/my-app build
```

**What happens:**
1. 🚀 Code copied to Pi via SCP
2. 📦 `npm install` runs automatically
3. ⚡ `npm run build` executes
4. ✅ Success/failure reported

### 2. Detect Available Tasks

```bash
br pi task detect pi1 /home/pi/apps/my-app
```

**Output:**
```
📦 Node.js Project (npm)

▸ start
▸ build
▸ test
▸ deploy
```

### 3. Run Specific Tasks

```bash
# Run tests
br pi task run pi1 /home/pi/my-app test

# Start the server
br pi task run pi1 /home/pi/my-app start
```

### 4. Run in Background

```bash
# Start a server that keeps running
br pi task background pi1 /home/pi/server start

# Output:
✓ Task started in background
Logs: /tmp/br-task-start.log on pi1
Check: br pi exec pi1 'tail -f /tmp/br-task-start.log'
```

---

## 📋 PROJECT TYPE SUPPORT

### **Node.js / npm**
```bash
# Detects package.json
# Runs: npm run <task>
# Auto-installs: npm install

br pi task run pi1 /home/pi/app start
br pi task run pi1 /home/pi/app test
```

### **Python**
```bash
# Detects setup.py or pyproject.toml
# Auto-installs: pip3 install -r requirements.txt

br pi task run pi1 /home/pi/app install
br pi task run pi1 /home/pi/app test
```

### **Rust / Cargo**
```bash
# Detects Cargo.toml
# Runs: cargo <task>
# Auto-builds: cargo build

br pi task run pi1 /home/pi/app build
br pi task run pi1 /home/pi/app test
```

### **Go**
```bash
# Detects go.mod
# Runs: go <task>

br pi task run pi1 /home/pi/app build
br pi task run pi1 /home/pi/app test
```

### **Makefile**
```bash
# Detects Makefile
# Runs: make <target>

br pi task run pi1 /home/pi/app all
br pi task run pi1 /home/pi/app clean
```

---

## 🎨 REAL-WORLD WORKFLOWS

### **Development Workflow**

```bash
# 1. Develop locally
vim my-app/src/index.js

# 2. Deploy & test on Pi
br pi task deploy pi1 ./my-app /home/pi/apps/my-app test

# 3. If tests pass, start it
br pi task background pi1 /home/pi/apps/my-app start

# 4. Check logs
br pi exec pi1 "tail -f /tmp/br-task-start.log"
```

### **CI/CD Pipeline**

```bash
#!/bin/bash
# deploy-to-pis.sh

# Deploy to all Pis
for pi in pi1 pi2 pi3; do
  echo "Deploying to $pi..."
  br pi task deploy $pi ./dist /home/pi/production build
  
  if [ $? -eq 0 ]; then
    # Start the service
    br pi task background $pi /home/pi/production start
    echo "✓ $pi deployed and started"
  else
    echo "✗ $pi deployment failed"
    exit 1
  fi
done

echo "✓ All Pis updated!"
```

### **Multi-Pi App Deployment**

```bash
# Build once locally
npm run build

# Deploy to staging Pi
br pi task deploy staging-pi ./dist /opt/app build
br pi task run staging-pi /opt/app test

# If tests pass, deploy to production Pis
br pi task deploy prod-pi1 ./dist /opt/app start
br pi task deploy prod-pi2 ./dist /opt/app start
br pi task deploy prod-pi3 ./dist /opt/app start

# Check status
br pi all "ps aux | grep node"
```

### **Background Service Management**

```bash
# Start multiple services
br pi task background pi1 /home/pi/api start
br pi task background pi1 /home/pi/worker start
br pi task background pi1 /home/pi/scheduler start

# Check what's running
br pi exec pi1 "ps aux | grep node"

# View logs
br pi exec pi1 "tail -100 /tmp/br-task-start.log"

# Stop services (manual)
br pi exec pi1 "pkill -f 'npm run start'"
```

---

## 📊 TASK HISTORY

View all tasks executed on your Pis:

```bash
# All tasks on a Pi
br pi task logs pi1

# Specific task history
br pi task logs pi1 build
```

**Output:**
```
📜 Task History on pi1:

✓ build - 2026-01-27 22:30:00 to 2026-01-27 22:30:15
✓ test - 2026-01-27 22:25:00 to 2026-01-27 22:25:10
✗ deploy - 2026-01-27 22:20:00 to 2026-01-27 22:20:05
```

---

## 💡 PRO TIPS

### **1. Use SSH Keys**
Set up passwordless SSH for smooth task execution:
```bash
ssh-copy-id pi@raspberrypi.local
```

### **2. Check Before Deploy**
Detect tasks before running:
```bash
br pi task detect pi1 /home/pi/app
```

### **3. Background for Servers**
Always use `background` for long-running processes:
```bash
br pi task background pi1 /home/pi/server start
```

### **4. Monitor with Logs**
Watch background tasks:
```bash
br pi exec pi1 "tail -f /tmp/br-task-start.log"
```

### **5. Deploy Pipeline**
Use `task deploy` for complete pipeline:
```bash
# Copies code + installs deps + runs task
br pi task deploy pi1 ./app /home/pi/app start
```

---

## 🔧 ADVANCED USAGE

### **Custom Task Runners**

If your project doesn't match standard patterns, use `exec`:
```bash
br pi exec pi1 "cd /home/pi/app && ./custom-build.sh"
```

### **Environment Variables**

Set environment before running tasks:
```bash
br pi exec pi1 "cd /home/pi/app && NODE_ENV=production npm start"
```

### **Health Checks**

Monitor your deployed apps:
```bash
# Check if service is running
br pi exec pi1 "curl localhost:3000/health"

# Check process
br pi exec pi1 "ps aux | grep my-app"
```

### **Batch Task Execution**

Run tasks on all Pis:
```bash
# Update all Pis
for pi in $(br pi list | grep "●" | awk '{print $2}'); do
  br pi task deploy $pi ./app /home/pi/app build
done
```

---

## 🎯 USE CASES

### **IoT Sensor Network**
Deploy data collection scripts to multiple Pis:
```bash
br pi task deploy sensor1 ./collector /opt/sensors start
br pi task deploy sensor2 ./collector /opt/sensors start
br pi task deploy sensor3 ./collector /opt/sensors start
```

### **Home Automation**
Run home automation tasks:
```bash
br pi task background home-pi /opt/homeassistant start
br pi task background music-pi /opt/mopidy start
```

### **Cluster Computing**
Distribute computation across Pis:
```bash
br pi task run worker1 /opt/compute process-batch-1
br pi task run worker2 /opt/compute process-batch-2
br pi task run worker3 /opt/compute process-batch-3
```

### **Web Hosting**
Deploy and manage web apps:
```bash
# Deploy frontend
br pi task deploy web-pi ./frontend /var/www/app build

# Deploy backend
br pi task background api-pi ./backend /opt/api start
```

---

## 🐛 TROUBLESHOOTING

### **Task Not Found**
```bash
# Check what tasks are available
br pi task detect pi1 /home/pi/app
```

### **Permission Issues**
```bash
# Run with sudo if needed
br pi exec pi1 "cd /home/pi/app && sudo npm start"
```

### **Background Task Not Running**
```bash
# Check process
br pi exec pi1 "ps aux | grep node"

# Check logs
br pi exec pi1 "cat /tmp/br-task-start.log"
```

### **Deployment Fails**
```bash
# Check path exists
br pi exec pi1 "ls -la /home/pi/apps"

# Check permissions
br pi exec pi1 "ls -la /home/pi/apps/my-app"
```

---

## 🎉 SUMMARY

You can now:
- ✅ Deploy code to Pis
- ✅ Run npm/make/cargo/go tasks remotely
- ✅ Detect available tasks automatically
- ✅ Run tasks in background
- ✅ Track task execution history
- ✅ Build complete CI/CD pipelines
- ✅ Manage entire Pi fleets

**Your Raspberry Pis are now fully integrated into your development workflow!** 🚀🥧✨

---

**Last Updated**: 2026-01-27  
**Feature**: br pi task  
**Status**: ✅ Production Ready
