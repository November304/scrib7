<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const messages = ref([])
const input = ref('')
let ws

onMounted(() => {
  ws = new WebSocket('ws://localhost:3000')
  ws.onopen = () => messages.value.push('✅ Connecté')
  ws.onmessage = (e) => messages.value.push(e.data)
  ws.onclose = () => messages.value.push('❌ Déconnecté')
})

onUnmounted(() => ws?.close())

function send() {
  if (!input.value) return
  ws.send(input.value)
  input.value = ''
}
</script>

<template>
  <input v-model="input" @keyup.enter="send" placeholder="Écris un message" />
  <button @click="send">Envoyer</button>
  <ul>
    <li v-for="(m, i) in messages" :key="i">{{ m }}</li>
  </ul>
</template>