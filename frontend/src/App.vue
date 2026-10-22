<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import UserAvatar from '@/components/UserAvatar.vue'

const auth = useAuthStore()
const router = useRouter()

async function logout() {
    await auth.logout()
    router.push({ name: 'login' })
}
</script>

<template>
    <header class="topbar">
        <RouterLink to="/" class="logo">
            <img src="/logo.svg" alt="" width="36" height="36" />
            <span class="wordmark">Scrib<span class="seven">7</span></span>
        </RouterLink>
        <div v-if="auth.user" class="user">
            <UserAvatar :user="auth.user" :size="32" />
            <span class="hand name">{{ auth.user.username }}</span>
            <button class="btn ghost small" @click="logout">Déconnexion</button>
        </div>
    </header>
    <main>
        <RouterView />
    </main>
</template>

<style scoped>
.topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    max-width: 1280px;
    margin: 0 auto 1.5rem;
    padding: 0.75rem 1rem;
}
.logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--fs-mark);
    font-weight: 800;
    line-height: 1;
    color: var(--ink);
    text-decoration: none;
    white-space: nowrap;
}
.logo img {
    filter: drop-shadow(0 2px 2px rgb(60 40 20 / 0.3));
}
/* Le 7 encré dans un petit tampon rouge rond */
.seven {
    display: inline-grid;
    place-items: center;
    width: 1.35em;
    height: 1.35em;
    margin-left: 0.08em;
    font-size: 0.8em;
    color: var(--red);
    background: var(--paper) url('/assets/scrapbook/stamp-ring.svg') 0 0 / 100%;
    border-radius: 50%;
    rotate: -8deg;
}
.user {
    display: flex;
    align-items: center;
    gap: 0.6rem;
}
.name {
    font-size: var(--fs-lead);
    font-weight: 700;
}
main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem 2.5rem;
}
@media (min-width: 1000px) {
    .topbar,
    main {
        padding-inline: 1.5rem;
    }
}
@media (max-width: 480px) {
    .logo {
        font-size: var(--fs-title);
    }
    .logo img {
        display: none;
    }
    .name {
        max-width: 8ch;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
}
</style>
