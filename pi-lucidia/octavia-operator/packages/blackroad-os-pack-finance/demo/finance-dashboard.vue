<template>
  <pc-page title="Finance Ops Dashboard">
    <pc-grid cols="3" gap="lg">
      <BurnRateCard :mtdSpend="3210.5" :budget="10000" :daysElapsed="12" :daysInMonth="30" />
      <pc-card title="Invoices">
        <pc-text>Latest invoice posted to #billing.</pc-text>
      </pc-card>
      <pc-card title="Alerts">
        <pc-text>Cost Watcher streaming anomalies from CloudWatch.</pc-text>
      </pc-card>
    </pc-grid>
  </pc-page>
</template>

<script setup lang="ts">
import BurnRateCard from '../widgets/BurnRateCard.vue';
</script>
