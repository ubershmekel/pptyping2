<template>
  <RouterView />
</template>

<script setup lang="ts">
import { watchEffect } from "vue";
import { RouterView } from "vue-router";
import { useProfile } from "./composables/useProfile";

const { profile } = useProfile();

// Keep team class on <body> in sync with the active team.
watchEffect(() => {
  document.body.classList.remove("team-pokemon", "team-mlp");
  document.body.classList.add(`team-${profile.value.activeTeam}`);
});
</script>
