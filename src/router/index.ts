import { createRouter, createWebHistory } from "vue-router";
import { useProfile } from "../composables/useProfile";
import { activeProgress } from "../state/gameState";
import { MAX_LEVEL } from "../data/levels";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      component: () => import("../screens/MainMenu.vue"),
    },
    {
      path: "/team-select",
      component: () => import("../screens/TeamSelect.vue"),
    },
    {
      path: "/level-select",
      component: () => import("../screens/LevelSelect.vue"),
    },
    {
      path: "/settings",
      component: () => import("../screens/Settings.vue"),
    },
    {
      path: "/debug-particles",
      component: () => import("../screens/DebugParticles.vue"),
    },
    {
      path: "/cutscene/:index",
      component: () => import("../screens/Cutscene.vue"),
      beforeEnter: (to) => {
        const idx = parseInt(to.params.index as string, 10);
        if (isNaN(idx) || idx < 0 || idx > 5) return "/";
      },
    },
    {
      path: "/level/:number",
      component: () => import("../screens/LevelFlow.vue"),
      beforeEnter: (to) => {
        const n = parseInt(to.params.number as string, 10);
        if (isNaN(n) || n < 1 || n > MAX_LEVEL) return "/";
      },
    },
    // Unknown routes → main menu
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

// ─── Global guards ────────────────────────────────────────────────────────────

const GAMEPLAY_PATHS = ["/level-select", "/cutscene", "/level"];

router.beforeEach((to) => {
  const { profile } = useProfile();

  // Guard: no team selected → team-select
  if (!profile.value.teamSelected) {
    const isGameplay = GAMEPLAY_PATHS.some(
      (p) => to.path === p || to.path.startsWith(p + "/"),
    );
    if (isGameplay) return "/team-select";
  }

  // Guard: locked level → level-select with attempted query param
  if (to.path.startsWith("/level/")) {
    const n = parseInt(to.params.number as string, 10);
    if (!isNaN(n) && n > activeProgress(profile.value).highestUnlockedLevel) {
      return { path: "/level-select", query: { attempted: String(n) } };
    }
  }
});

export default router;
