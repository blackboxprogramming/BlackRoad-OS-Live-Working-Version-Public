<template>
  <pc-card title="Burn Rate">
    <pc-stack gap="sm">
      <pc-text variant="eyebrow">MTD Spend</pc-text>
      <pc-text as="div" class="metric">${{ mtdSpend.toFixed(2) }}</pc-text>
      <pc-progress :value="budgetUsed" :max="100" label="Budget used" />
      <pc-text as="div" class="subtle">Forecast: ${{ forecast.toFixed(2) }} ({{ budgetUsed.toFixed(1) }}% of budget)</pc-text>
    </pc-stack>
  </pc-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  mtdSpend: number;
  budget: number;
  daysElapsed: number;
  daysInMonth: number;
}>();

const burnRate = computed(() => (props.daysElapsed ? props.mtdSpend / props.daysElapsed : 0));
const forecast = computed(() => burnRate.value * props.daysInMonth);
const budgetUsed = computed(() => (props.budget ? (forecast.value / props.budget) * 100 : 0));
</script>

<style scoped>
.metric {
  font-size: 2rem;
  font-weight: 700;
}
.subtle {
  color: #6b7280;
}
</style>
