<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app-wrapper">
    <RouterView />
  </div>
</template>

<style scoped>
#app-wrapper {
  min-height: 100vh;
  background-color: #141414; /* Genel arka plan rengi */
  color: white;
}
</style>