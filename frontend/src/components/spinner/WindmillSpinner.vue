<script setup lang="ts">
import { ref, onMounted } from 'vue'

const angle = ref(0)

const props = defineProps<{
  rpm: number
}>()

const updateAngle = () => {
  const now = Date.now()
  const elapsed = now - lastTimestamp
  const rotationsPerMillisec = props.rpm / 60 / 1000 // RPM to rotations per millisecond
  angle.value = (angle.value + 360 * rotationsPerMillisec * elapsed) % 360
  lastTimestamp = now
}

let lastTimestamp = Date.now()

onMounted(() => {
  setInterval(updateAngle, 16) // Update approximately every 16ms (roughly 60 FPS)
})
</script>

<template>
  <div class="flex flex-col justify-center items-center">
    <img src="/mill.svg" class="mill" :style="{ transform: `rotate(${angle}deg)` }" />
    <img src="/stand.svg" class="stand" alt="" />
  </div>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.mill {
  width: 700px;
  transform-origin: center center;
  filter: drop-shadow(10px 10px 10px rgb(0 0 0 / 0.4));
}
.stand {
  width: 60px;
  margin-top: -350px;
}
</style>
