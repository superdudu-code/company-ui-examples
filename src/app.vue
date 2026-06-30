<script setup lang="ts">
import { NConfigProvider, zhCN, dateZhCN } from "naive-ui"
import { pcNaiveThemeOverrides } from "@puture-ui/ui/theme"
</script>

<template>
  <NConfigProvider
    :theme-overrides="pcNaiveThemeOverrides"
    :locale="zhCN"
    :date-locale="dateZhCN"
    inline-theme-disabled
  >
    <RouterView />
  </NConfigProvider>
</template>
