<script setup lang="ts">
defineProps<{
  step: number
}>()
</script>

<template>
  <div class="relative min-h-[240px]">
    <div v-if="step === 0" class="mesh-topology">
      <p class="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-mesh-muted2">Node discovery — broadcast phase</p>
      <svg class="block w-full" viewBox="0 0 340 240" aria-hidden="true">
        <circle cx="170" cy="120" r="30" fill="none" stroke="rgba(0,229,255,0.15)" stroke-width="1" stroke-dasharray="4 4">
          <animate attributeName="r" values="30;90" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0" dur="2.5s" repeatCount="indefinite" />
        </circle>
        <circle cx="170" cy="120" r="30" fill="none" stroke="rgba(0,229,255,0.1)" stroke-width="1">
          <animate attributeName="r" values="30;90" dur="2.5s" begin="0.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.6;0" dur="2.5s" begin="0.8s" repeatCount="indefinite" />
        </circle>
        <g opacity="0">
          <animate attributeName="opacity" values="0;1" dur="0.3s" begin="0.6s" fill="freeze" />
          <circle cx="60" cy="60" r="12" fill="rgba(123,97,255,0.15)" stroke="#7b61ff" stroke-width="1.5" />
          <text x="60" y="64" text-anchor="middle" font-family="DM Mono, monospace" font-size="8" fill="#7b61ff">N2</text>
          <line x1="72" y1="68" x2="155" y2="110" stroke="rgba(123,97,255,0.3)" stroke-width="1" stroke-dasharray="3 3" />
        </g>
        <g opacity="0">
          <animate attributeName="opacity" values="0;1" dur="0.3s" begin="0.9s" fill="freeze" />
          <circle cx="290" cy="50" r="12" fill="rgba(0,255,148,0.15)" stroke="#00ff94" stroke-width="1.5" />
          <text x="290" y="54" text-anchor="middle" font-family="DM Mono, monospace" font-size="8" fill="#00ff94">N3</text>
          <line x1="278" y1="58" x2="185" y2="108" stroke="rgba(0,255,148,0.3)" stroke-width="1" stroke-dasharray="3 3" />
        </g>
        <g opacity="0">
          <animate attributeName="opacity" values="0;1" dur="0.3s" begin="1.1s" fill="freeze" />
          <circle cx="50" cy="195" r="12" fill="rgba(255,159,67,0.15)" stroke="#ff9f43" stroke-width="1.5" />
          <text x="50" y="199" text-anchor="middle" font-family="DM Mono, monospace" font-size="8" fill="#ff9f43">N4</text>
          <line x1="62" y1="187" x2="155" y2="130" stroke="rgba(255,159,67,0.3)" stroke-width="1" stroke-dasharray="3 3" />
        </g>
        <g opacity="0">
          <animate attributeName="opacity" values="0;1" dur="0.3s" begin="1.3s" fill="freeze" />
          <circle cx="295" cy="195" r="12" fill="rgba(0,229,255,0.1)" stroke="rgba(0,229,255,0.4)" stroke-width="1" />
          <text x="295" y="199" text-anchor="middle" font-family="DM Mono, monospace" font-size="8" fill="rgba(0,229,255,0.5)">N5</text>
          <line x1="283" y1="187" x2="185" y2="130" stroke="rgba(0,229,255,0.2)" stroke-width="1" stroke-dasharray="3 3" />
        </g>
        <circle cx="170" cy="120" r="18" fill="rgba(0,229,255,0.1)" stroke="#00e5ff" stroke-width="1.5" />
        <circle cx="170" cy="120" r="5" fill="#00e5ff" />
        <text x="170" y="148" text-anchor="middle" font-family="DM Mono, monospace" font-size="8" fill="rgba(0,229,255,0.6)">NEW NODE</text>
      </svg>
    </div>

    <div v-else-if="step === 1" class="mesh-topology">
      <p class="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-mesh-muted2">mTLS mutual authentication</p>
      <svg class="block w-full" viewBox="0 0 340 200" aria-hidden="true">
        <circle cx="80" cy="100" r="28" fill="rgba(0,229,255,0.08)" stroke="#00e5ff" stroke-width="1.5" />
        <text x="80" y="96" text-anchor="middle" font-family="DM Mono, monospace" font-size="9" fill="#00e5ff">NODE A</text>
        <text x="80" y="108" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="rgba(0,229,255,0.5)">cert ✓</text>
        <circle cx="260" cy="100" r="28" fill="rgba(123,97,255,0.08)" stroke="#7b61ff" stroke-width="1.5" />
        <text x="260" y="96" text-anchor="middle" font-family="DM Mono, monospace" font-size="9" fill="#7b61ff">NODE B</text>
        <text x="260" y="108" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="rgba(123,97,255,0.5)">cert ✓</text>
        <circle r="5" fill="#00e5ff" opacity="0.9">
          <animateMotion dur="1.2s" repeatCount="indefinite" begin="0s">
            <mpath href="#handshake-path-ab" />
          </animateMotion>
        </circle>
        <circle r="5" fill="#7b61ff" opacity="0.9">
          <animateMotion dur="1.2s" repeatCount="indefinite" begin="0.6s">
            <mpath href="#handshake-path-ba" />
          </animateMotion>
        </circle>
        <defs>
          <path id="handshake-path-ab" d="M108 90 Q170 60 232 90" />
          <path id="handshake-path-ba" d="M232 110 Q170 140 108 110" />
        </defs>
        <path d="M108 90 Q170 60 232 90" fill="none" stroke="rgba(0,229,255,0.15)" stroke-width="1" stroke-dasharray="4 4" />
        <path d="M232 110 Q170 140 108 110" fill="none" stroke="rgba(123,97,255,0.15)" stroke-width="1" stroke-dasharray="4 4" />
        <rect x="154" y="88" width="32" height="24" rx="3" fill="rgba(0,255,148,0.08)" stroke="rgba(0,255,148,0.3)" stroke-width="1" />
        <text x="170" y="104" text-anchor="middle" font-family="DM Mono, monospace" font-size="10" fill="#00ff94">🔒</text>
        <text x="170" y="175" text-anchor="middle" font-family="DM Mono, monospace" font-size="8" fill="rgba(0,229,255,0.4)">TLS 1.3 — mutual certificate verification</text>
      </svg>
    </div>

    <div v-else-if="step === 2" class="mesh-topology">
      <p class="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-mesh-muted2">Pointy-lang dispatch routing</p>
      <svg class="block w-full" viewBox="0 0 340 220" aria-hidden="true">
        <circle cx="60" cy="110" r="22" fill="rgba(0,229,255,0.08)" stroke="#00e5ff" stroke-width="1.5" />
        <text x="60" y="107" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="#00e5ff">COORD</text>
        <text x="60" y="117" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="rgba(0,229,255,0.5)">node</text>
        <circle cx="210" cy="55" r="22" fill="rgba(123,97,255,0.08)" stroke="#7b61ff" stroke-width="1.5" />
        <text x="210" y="52" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="#7b61ff">REMOTE</text>
        <text x="210" y="62" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="rgba(123,97,255,0.5)">warehouse</text>
        <circle cx="210" cy="165" r="22" fill="rgba(0,255,148,0.08)" stroke="#00ff94" stroke-width="1.5" />
        <text x="210" y="162" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="#00ff94">CELERY</text>
        <text x="210" y="172" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="rgba(0,255,148,0.5)">worker</text>
        <line x1="82" y1="98" x2="188" y2="67" stroke="rgba(123,97,255,0.25)" stroke-width="1" stroke-dasharray="5 3" />
        <line x1="82" y1="122" x2="188" y2="153" stroke="rgba(0,255,148,0.25)" stroke-width="1" stroke-dasharray="5 3" />
        <circle r="4" fill="#7b61ff">
          <animateMotion dur="1.5s" repeatCount="indefinite">
            <mpath href="#route-a" />
          </animateMotion>
        </circle>
        <circle r="4" fill="#00ff94">
          <animateMotion dur="1.5s" repeatCount="indefinite" begin="0.75s">
            <mpath href="#route-b" />
          </animateMotion>
        </circle>
        <defs>
          <path id="route-a" d="M82 98 L188 67" />
          <path id="route-b" d="M82 122 L188 153" />
        </defs>
        <rect x="240" y="42" width="85" height="16" rx="2" fill="rgba(123,97,255,0.08)" stroke="rgba(123,97,255,0.2)" stroke-width="0.5" />
        <text x="282" y="53" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="rgba(123,97,255,0.7)">[node="warehouse"]</text>
        <rect x="240" y="152" width="85" height="16" rx="2" fill="rgba(0,255,148,0.08)" stroke="rgba(0,255,148,0.2)" stroke-width="0.5" />
        <text x="282" y="163" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="rgba(0,255,148,0.7)">[executor="celery"]</text>
      </svg>
    </div>

    <div v-else class="mesh-topology">
      <p class="mb-6 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-mesh-muted2">Failure detection and rehydration</p>
      <svg class="block w-full" viewBox="0 0 340 220" aria-hidden="true">
        <circle cx="170" cy="80" r="22" fill="rgba(255,80,80,0.06)" stroke="rgba(255,80,80,0.4)" stroke-width="1.5" stroke-dasharray="4 4" />
        <text x="170" y="77" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="rgba(255,80,80,0.6)">NODE C</text>
        <text x="170" y="87" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="rgba(255,80,80,0.4)">DEAD</text>
        <line x1="158" y1="68" x2="182" y2="92" stroke="rgba(255,80,80,0.4)" stroke-width="1.5" />
        <line x1="182" y1="68" x2="158" y2="92" stroke="rgba(255,80,80,0.4)" stroke-width="1.5" />
        <circle cx="60" cy="160" r="22" fill="rgba(0,229,255,0.08)" stroke="#00e5ff" stroke-width="1.5" />
        <text x="60" y="157" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="#00e5ff">WATCH</text>
        <text x="60" y="167" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="rgba(0,229,255,0.5)">DOG</text>
        <circle cx="280" cy="160" r="22" fill="rgba(0,255,148,0.08)" stroke="#00ff94" stroke-width="1.5" />
        <text x="280" y="157" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="#00ff94">NODE D</text>
        <text x="280" y="167" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="rgba(0,255,148,0.5)">HEALTHY</text>
        <line x1="78" y1="148" x2="152" y2="98" stroke="rgba(0,229,255,0.2)" stroke-width="1" stroke-dasharray="3 3" />
        <path
          d="M82 155 Q170 200 258 165"
          fill="none"
          stroke="#00ff94"
          stroke-width="1.5"
          stroke-dasharray="6 3"
          marker-end="url(#arr-green)"
        />
        <defs>
          <marker id="arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M1 1L8 5L1 9" fill="none" stroke="#00ff94" stroke-width="2" />
          </marker>
          <path id="ping-path" d="M78 148 L152 98" />
        </defs>
        <rect x="140" y="192" width="60" height="16" rx="2" fill="rgba(0,255,148,0.08)" stroke="rgba(0,255,148,0.25)" stroke-width="0.5" />
        <text x="170" y="203" text-anchor="middle" font-family="DM Mono, monospace" font-size="7" fill="rgba(0,255,148,0.7)">REHYDRATE ✓</text>
        <circle r="3" fill="#00e5ff" opacity="0.8">
          <animateMotion dur="1s" repeatCount="indefinite">
            <mpath href="#ping-path" />
          </animateMotion>
          <animate attributeName="opacity" values="0.8;0" dur="1s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  </div>
</template>
