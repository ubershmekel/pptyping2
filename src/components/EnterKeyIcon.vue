<template>
  <span class="enter-key-icon" v-html="svg" aria-hidden="true" />
</template>

<script setup lang="ts">
import svg from "../assets/keyboard/enter-key.svg?raw";
</script>

<style scoped>
.enter-key-icon {
  display: flex;
  width: 2em;
  height: 2em;
}

.enter-key-icon :deep(svg) {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
