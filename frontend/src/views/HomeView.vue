<script setup lang="ts">
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/toast/use-toast'
import { cn } from '@/lib/utils'
import { computed, onMounted, reactive, ref, watch, type Ref } from 'vue'
import { useAxios } from '@vueuse/integrations/useAxios.mjs'
import { useConnectionStore } from '@/stores/connection'
import Toaster from '@/components/ui/toast/Toaster.vue'

import { DonutChart } from '@/components/ui/chart-donut'
import WindmillSpinner from '@/components/spinner/WindmillSpinner.vue'
const { toast } = useToast()
const { data: conn, execute: execConn } = useAxios()
const { data: speedData, execute: execSpeed } = useAxios()
const { data: initConn, execute: execInitConn } = useAxios()
const { data, execute } = useAxios()
const ip = ref('')
const targetSpeed = ref([0])
const actualSpeed = ref(0)
const rpm = computed(() => {
  return Math.floor(actualSpeed.value)
})
const firmware: Ref<string> = ref('')
const deviceName: Ref<string> = ref('')
const modelName: Ref<string> = ref('')
const mac: Ref<string> = ref('')
const port = ref(502)
const connection = ref(false)
const c = useConnectionStore()
const serverMessage = ref('')
let ws: WebSocket

const connect = async () => {
  if (connection.value) {
    connection.value = false
    ip.value = ''
    targetSpeed.value[0] = 0
    clearDeviceInfo()
    return
  }
  await execConn(`/api/connection`, {
    params: {
      ip: ip.value,
      port: port.value
    },
    method: 'POST'
  })
  connection.value = conn.value.connected
  if (connection.value) {
    ip.value = conn.value.ip
    toast({ title: `Connected to ${ip.value}`, description: 'Enjoy' })
    await getDeviceInfo()
    return
  }
  toast({ title: `Failed to connect to ${ip.value}`, description: 'Enjoy' })
}

const getDeviceInfo = async () => {
  await execute(`/api/firmware`)
  firmware.value = data.value.firmware
  await execute(`/api/model`)
  modelName.value = data.value.model
  await execute(`/api/mac-address`)
  mac.value = data.value.mac
  await execute(`/api/device-name`)
  deviceName.value = data.value.deviceName
}

const clearDeviceInfo = () => {
  firmware.value = ''
  modelName.value = ''
  mac.value = ''
  deviceName.value = ''
}

const setSpeed = async () => {
  try {
    console.log(targetSpeed.value[0])
    await execSpeed(`api/speed`, {
      method: 'POST',
      data: {
        speed: targetSpeed.value[0] * 24
      }
    })
    actualSpeed.value = speedData.value.speed / 24
    console.log(actualSpeed.value)
  } catch (error) {
    ;() => {}
  }
}

const rpmData = computed(() => {
  return [
    {
      name: 'Blank',
      rpm: 30
    },
    {
      name: 'Speed',
      rpm: rpm.value
    },
    {
      name: 'Filler',
      rpm: 30 - rpm.value
    }
  ]
})

onMounted(async () => {
  await execInitConn(`/api/connection`)
  connection.value = initConn.value.connected
  if (!connection.value) return
  ip.value = initConn.value.ip

  getDeviceInfo()
})

watch(connection, () => {
  c.connection = connection.value
})

const connectWebSocket = () => {
  ws = new WebSocket('ws://localhost:3000')

  ws.onopen = () => {
    console.log('Connected to WebSocket server')
  }

  ws.onmessage = (event) => {
    console.log('Received:', event.data)
    serverMessage.value = event.data
  }

  ws.onclose = () => {
    console.log('Disconnected from WebSocket server')
  }
}
</script>

<template>
  <div class="flex flex-row w-full overflow-hidden">
    <div class="flex flex-col w-1/3">
      <div class="w-full mt-6 ml-6">
        <img src="/txone.png" class="w-[300px]" alt="" />
      </div>
      <Card class="w-full mt-6 ml-6">
        <CardHeader>
          <CardTitle>
            <div class="flex justify-between">
              Speed Controller
              <Button v-if="connection" style="background: hsl(0, 84.2%, 60.2%)"
                ><b>STOP</b></Button
              >
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-4">
            <Label>Set Windmill Speed</Label>
            <Slider
              :default-value="[0]"
              :max="128"
              :step="1"
              :class="cn('w-full', $attrs.class ?? '')"
              class="mb-12 z-10"
              v-model="targetSpeed"
              :disabled="!connection"
              @update:model-value="setSpeed"
            ></Slider>
            <Separator orientation="horizontal" />
            <Label>Pitch Control Monitoring</Label>
            <DonutChart
              :colors="['transparent', '#6D28D9', '#1F2937']"
              index="name"
              :category="'rpm'"
              :data="rpmData"
              title="test"
            />
            <div class="w-full flex justify-center mt-[-100px]">
              <CardTitle>{{ rpm }} rpm</CardTitle>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card class="w-full mt-6 ml-6">
        <CardHeader>
          <CardTitle><p>PLC Information</p></CardTitle>
        </CardHeader>
        <CardContent>
          <div class="grid items-center w-full gap-4">
            <div class="flex flex-col space-y-1.5">
              <Label for="name">Firmware: {{ firmware != '' ? firmware : 'Not connected' }}</Label>
            </div>
            <div class="flex flex-col space-y-1.5">
              <Label for="name"
                >Device Name: {{ deviceName != '' ? deviceName : 'Not connected' }}</Label
              >
            </div>
            <div class="flex flex-col space-y-1.5">
              <Label for="framework"
                >Model Name: {{ modelName != '' ? modelName : 'Not connected' }}</Label
              >
            </div>
            <div class="flex flex-col space-y-1.5">
              <Label for="framework">MAC Adress: {{ mac != '' ? mac : 'Not connected' }}</Label>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card class="w-full mt-6 ml-6">
        <CardHeader>
          <CardTitle>Connection Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-4">
            <div class="flex w-full items-center gap-1.5">
              <Input id="ip" type="url" placeholder="IP-address" v-model="ip" />
              <Input id="ip" type="url" class="w-1/5" placeholder="PORT" v-model="port" />
            </div>
            <div class="flex items-center space-x-2">
              <Switch id="connection" :checked="connection" @update:checked="connect" />
              <Label for="connection-label">{{ connection ? 'Connected' : 'Disconnected' }}</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    <div>
      <Separator class="ml-24" orientation="vertical" />
    </div>
    <div class="w-2/3">
      <WindmillSpinner :rpm="rpm" />
    </div>
    <Toaster />
  </div>
</template>
