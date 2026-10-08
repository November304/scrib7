import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api, ApiError } from '@/api'
import { socket } from '@/services/socket'
import type { User } from '@/types'

export const useAuthStore = defineStore('auth', () => {
    const user = ref<User | null>(null)
    const loaded = ref(false)

    // Le JWT est dans un cookie httpOnly : on ne peut pas le lire, on demande au serveur
    async function fetchMe() {
        try {
            user.value = await api<User>('/auth/me')
        } catch (err) {
            if (!(err instanceof ApiError && err.status === 401)) throw err
            user.value = null
        } finally {
            loaded.value = true
        }
    }

    async function login(username: string, password: string) {
        user.value = await api<User>('/auth/login', {
            method: 'POST',
            body: { username, password },
        })
    }

    async function register(username: string, password: string) {
        user.value = await api<User>('/auth/register', {
            method: 'POST',
            body: { username, password },
        })
    }

    async function loginAsGuest(username: string) {
        user.value = await api<User>('/auth/guest', { method: 'POST', body: { username } })
    }

    async function logout() {
        await api('/auth/logout', { method: 'POST' })
        socket.disconnect()
        user.value = null
    }

    return { user, loaded, fetchMe, login, register, loginAsGuest, logout }
})
