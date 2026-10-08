import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        { path: '/', name: 'home', component: HomeView, meta: { requiresAuth: true } },
        { path: '/login', name: 'login', component: LoginView },
        {
            // /room/new crée une salle, /room/ABCDE rejoint une salle existante
            path: '/room/:code',
            name: 'room',
            component: () => import('@/views/RoomView.vue'),
            meta: { requiresAuth: true },
        },
        { path: '/:pathMatch(.*)*', redirect: '/' },
    ],
})

router.beforeEach(async (to) => {
    const auth = useAuthStore()
    if (!auth.loaded) await auth.fetchMe()
    if (to.meta.requiresAuth && !auth.user) {
        // On garde la destination pour que les liens d'invitation marchent après connexion
        return { name: 'login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : {} }
    }
    if (to.name === 'login' && auth.user) return { name: 'home' }
})

export default router
