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
        <RouterLink to="/" class="logo">Scrib<span>7</span></RouterLink>
        <div v-if="auth.user" class="user">
            <UserAvatar :user="auth.user" :size="32" />
            <span>{{ auth.user.username }}</span>
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
    margin: 0 auto;
    padding: 0.75rem 1rem;
}
.logo {
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--text);
    text-decoration: none;
    letter-spacing: -0.02em;
}
.logo span {
    color: var(--accent);
}
.user {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 600;
}
main {
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem 2rem;
}
</style>
