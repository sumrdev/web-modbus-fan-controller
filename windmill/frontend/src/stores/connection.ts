import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useConnectionStore = defineStore('connection', () => {
  const connection = ref(false)
  return { connection }
})
