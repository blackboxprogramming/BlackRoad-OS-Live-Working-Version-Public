#!/usr/bin/env bash
# Test Module: Hardware Detection
# Validates Pi model, temperature, throttling, USB, I2C devices

set -euo pipefail

output_result() {
  local status=$1
  local message=$2
  local details=${3:-"{}"}
  echo "{\"test\": \"hardware\", \"status\": \"$status\", \"message\": \"$message\", \"details\": $details}"
}

if [[ "${DRY_RUN:-false}" == "true" ]]; then
  output_result "DRY_RUN" "Would check hardware status"
  exit 0
fi

HOSTNAME=$(hostname)

# Detect Pi model
PI_MODEL="unknown"
PI_RAM="unknown"
if [[ -f /proc/cpuinfo ]]; then
  PI_MODEL=$(grep "Model" /proc/cpuinfo | cut -d':' -f2 | xargs || echo "unknown")
fi
if [[ -f /proc/meminfo ]]; then
  PI_RAM=$(grep MemTotal /proc/meminfo | awk '{printf "%.0fMB", $2/1024}')
fi

# CPU temperature
CPU_TEMP="unknown"
if [[ -f /sys/class/thermal/thermal_zone0/temp ]]; then
  CPU_TEMP=$(awk '{printf "%.1f°C", $1/1000}' /sys/class/thermal/thermal_zone0/temp)
  CPU_TEMP_VALUE=$(awk '{printf "%.0f", $1/1000}' /sys/class/thermal/thermal_zone0/temp)
fi

# Throttling / undervoltage detection
THROTTLE_STATUS="unknown"
THROTTLE_HEX="0x0"
if command -v vcgencmd &>/dev/null; then
  THROTTLE_HEX=$(vcgencmd get_throttled | cut -d'=' -f2)
  if [[ "$THROTTLE_HEX" == "0x0" ]]; then
    THROTTLE_STATUS="ok"
  else
    THROTTLE_STATUS="throttled_or_undervolt"
  fi
fi

# USB devices
USB_DEVICES=$(lsusb 2>/dev/null | wc -l || echo 0)
USB_LIST=$(lsusb 2>/dev/null | tail -n +2 || echo "")

# Check for specific known devices
PRINTER_DETECTED="false"
if [[ "$HOSTNAME" == "aria" ]]; then
  if echo "$USB_LIST" | grep -iq "printer"; then
    PRINTER_DETECTED="true"
  fi
fi

# I2C devices (OLED displays)
I2C_DEVICES=0
I2C_LIST=""
if command -v i2cdetect &>/dev/null; then
  # Check i2c-1 bus (common on Pi)
  if [[ -e /dev/i2c-1 ]]; then
    I2C_DEVICES=$(sudo i2cdetect -y 1 2>/dev/null | grep -oE '\b[0-9a-fA-F]{2}\b' | wc -l || echo 0)
    I2C_LIST=$(sudo i2cdetect -y 1 2>/dev/null | grep -oE '\b[0-9a-fA-F]{2}\b' | tr '\n' ',' || echo "")
  fi
fi

# HDMI displays
HDMI_STATUS="unknown"
HDMI_DISPLAYS=0
if command -v tvservice &>/dev/null; then
  if tvservice -s 2>/dev/null | grep -q "HDMI"; then
    HDMI_STATUS="connected"
    HDMI_DISPLAYS=1
  else
    HDMI_STATUS="disconnected"
  fi
fi

DETAILS=$(cat <<EOF
{
  "hostname": "$HOSTNAME",
  "pi_model": "$PI_MODEL",
  "ram": "$PI_RAM",
  "cpu_temp": "$CPU_TEMP",
  "throttle_status": "$THROTTLE_STATUS",
  "throttle_hex": "$THROTTLE_HEX",
  "usb_device_count": $USB_DEVICES,
  "printer_detected": $PRINTER_DETECTED,
  "i2c_device_count": $I2C_DEVICES,
  "i2c_addresses": "$I2C_LIST",
  "hdmi_status": "$HDMI_STATUS",
  "hdmi_displays": $HDMI_DISPLAYS
}
EOF
)

# Determine status
if [[ "$THROTTLE_STATUS" == "throttled_or_undervolt" ]]; then
  output_result "WARN" "CPU throttling or undervoltage detected" "$DETAILS"
elif [[ ${CPU_TEMP_VALUE:-0} -gt 80 ]]; then
  output_result "WARN" "CPU temperature high (${CPU_TEMP})" "$DETAILS"
elif [[ "$HOSTNAME" == "aria" && "$PRINTER_DETECTED" == "false" ]]; then
  output_result "WARN" "Printer not detected on aria" "$DETAILS"
else
  output_result "PASS" "Hardware nominal" "$DETAILS"
fi
