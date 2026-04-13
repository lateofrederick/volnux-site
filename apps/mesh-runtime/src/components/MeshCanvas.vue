<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

type Node = {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  color: string
  pulse: number
  pulseSpeed: number
  active: boolean
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const COLORS = ['#00e5ff', '#7b61ff', '#00ff94', '#ff9f43']
const NODE_COUNT = 55
const MAX_DIST = 180

let ctx: CanvasRenderingContext2D | null = null
let W = 0
let H = 0
let nodes: Node[] = []
let raf = 0
const mouse = { x: -9999, y: -9999 }

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  W = canvas.width = window.innerWidth
  H = canvas.height = window.innerHeight
}

function initNodes() {
  nodes = Array.from({ length: NODE_COUNT }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    r: Math.random() * 2.5 + 1.5,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.02,
    active: Math.random() > 0.7,
  }))
}

function draw() {
  const c = ctx
  if (!c) return
  c.clearRect(0, 0, W, H)

  nodes.forEach((n) => {
    n.x += n.vx
    n.y += n.vy
    n.pulse += n.pulseSpeed

    if (n.x < -20) n.x = W + 20
    if (n.x > W + 20) n.x = -20
    if (n.y < -20) n.y = H + 20
    if (n.y > H + 20) n.y = -20

    const dx = n.x - mouse.x
    const dy = n.y - mouse.y
    const d = Math.sqrt(dx * dx + dy * dy)
    if (d < 120 && d > 0) {
      n.vx += (dx / d) * 0.04
      n.vy += (dy / d) * 0.04
    }

    const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy)
    if (speed > 0.8) {
      n.vx *= 0.9
      n.vy *= 0.9
    }
  })

  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i]!
      const b = nodes[j]!
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < MAX_DIST) {
        const alpha = (1 - dist / MAX_DIST) * 0.18
        const rgb = hexToRgb(a.color)
        c.beginPath()
        c.moveTo(a.x, a.y)
        c.lineTo(b.x, b.y)
        c.strokeStyle = `rgba(${rgb},${alpha})`
        c.lineWidth = 0.6
        c.stroke()

        if (a.active && Math.random() < 0.0004) {
          const t = (Date.now() % 2000) / 2000
          const px = a.x + (b.x - a.x) * t
          const py = a.y + (b.y - a.y) * t
          c.beginPath()
          c.arc(px, py, 1.5, 0, Math.PI * 2)
          c.fillStyle = `rgba(${rgb},0.8)`
          c.fill()
        }
      }
    }
  }

  nodes.forEach((n) => {
    const pAlpha = Math.sin(n.pulse) * 0.5 + 0.5
    const rgb = hexToRgb(n.color)

    if (n.active) {
      c.beginPath()
      c.arc(n.x, n.y, n.r * 3.5 + pAlpha * 4, 0, Math.PI * 2)
      c.fillStyle = `rgba(${rgb},${0.04 * pAlpha})`
      c.fill()

      c.beginPath()
      c.arc(n.x, n.y, n.r * 2.2, 0, Math.PI * 2)
      c.strokeStyle = `rgba(${rgb},${0.2 * pAlpha})`
      c.lineWidth = 0.8
      c.stroke()
    }

    c.beginPath()
    c.arc(n.x, n.y, n.r, 0, Math.PI * 2)
    c.fillStyle = n.active ? `rgba(${rgb},${0.7 + pAlpha * 0.3})` : `rgba(${rgb},0.25)`
    c.fill()
  })

  raf = requestAnimationFrame(draw)
}

function onMove(e: MouseEvent) {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

onMounted(() => {
  ctx = canvasRef.value?.getContext('2d') ?? null
  resize()
  initNodes()
  draw()
  window.addEventListener('resize', resize)
  window.addEventListener('mousemove', onMove)
})

onUnmounted(() => {
  cancelAnimationFrame(raf)
  window.removeEventListener('resize', resize)
  window.removeEventListener('mousemove', onMove)
})
</script>

<template>
  <canvas id="mesh-canvas" ref="canvasRef" class="pointer-events-none fixed inset-0 z-0" aria-hidden="true" />
</template>
