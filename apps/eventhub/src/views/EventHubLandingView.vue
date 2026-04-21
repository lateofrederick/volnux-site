<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

const marketing = import.meta.env.VITE_MARKETING_URL?.trim().replace(/\/$/, '') || ''
const docsHref = computed(() => (marketing ? `${marketing}/docs` : '/docs'))
</script>

<template>
  <div class="eh-landing">
    <section id="hero" class="z1 eh-landing-hero">
      <div class="hero-bg-text">EventHub</div>
      <div class="hero-inner">
        <p class="hero-badge"><span class="badge-dot"></span>Volnux Event Registry</p>
        <h1 class="hero-title">
          Discover, publish, and<br />
          resolve <em>versioned events.</em>
        </h1>
        <p class="hero-desc">
          EventHub is the registry where Pointy-lang workflows pull EventBase components from PyPI, Git, or the community
          hub — with pins, provenance, and compatibility signals so production runs stay reproducible.
        </p>
        <div class="eh-landing-actions">
          <RouterLink to="/browse" class="eh-btn eh-btn-primary">Browse registry (preview)</RouterLink>
          <a :href="docsHref" class="eh-btn eh-btn-outline">Read the docs →</a>
        </div>
        <p class="eh-landing-note mono">
          The live event catalogue and detail pages are in development — the preview registry remains available from this
          build.
        </p>
      </div>
    </section>

    <section class="z1 eh-landing-grid">
      <div class="eh-landing-inner">
        <article class="eh-card">
          <p class="eh-card-k mono">01</p>
          <h3>Discover</h3>
          <p>Search curated and community events with source-aware filters — PyPI, Git, hub, and local — aligned with how
            the runtime resolves them.</p>
        </article>
        <article class="eh-card">
          <p class="eh-card-k mono">02</p>
          <h3>Publish</h3>
          <p>Ship immutable references your teams can trust: semantic versions, checksums, and clear compatibility bands
            for downstream workflows.</p>
        </article>
        <article class="eh-card">
          <p class="eh-card-k mono">03</p>
          <h3>Resolve</h3>
          <p>Pointy-lang references resolve at execution time. EventHub is the catalogue those references point to — no
            shared monorepo required.</p>
        </article>
      </div>
    </section>

    <section class="z1 eh-landing-cta">
      <div class="eh-landing-inner eh-landing-cta-inner">
        <h2 class="serif">Ready when you are</h2>
        <p class="mono eh-cta-copy">Open the preview registry, or jump back to the platform for the full Volnux story.</p>
        <div class="eh-landing-actions">
          <RouterLink to="/browse" class="eh-btn eh-btn-primary">Go to registry preview</RouterLink>
          <a href="/" target="_parent" rel="noopener noreferrer" class="eh-btn eh-btn-outline">Volnux home →</a>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.eh-landing {
  padding-top: 56px;
}

.eh-landing-hero {
  min-height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 5rem 0 4rem;
}

.eh-landing-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 1.75rem;
}

.eh-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.85rem 1.35rem;
  font-family: 'DM Mono', monospace;
  font-size: 0.78rem;
  text-decoration: none;
  border-radius: 2px;
  transition:
    background 0.2s,
    color 0.2s,
    border-color 0.2s;
}

.eh-btn-primary {
  background: var(--amber);
  color: var(--ink);
  border: 1px solid var(--amber);
  font-weight: 500;
}

.eh-btn-primary:hover {
  background: #ffc84a;
}

.eh-btn-outline {
  border: 1px solid var(--rule2);
  color: var(--fog2);
  background: transparent;
}

.eh-btn-outline:hover {
  border-color: var(--cyan);
  color: var(--cyan);
}

.eh-landing-note {
  margin-top: 1.5rem;
  max-width: 520px;
  font-size: 0.72rem;
  color: var(--fog);
  line-height: 1.6;
}

.eh-landing-grid {
  padding: 4rem 0;
  border-top: 1px solid var(--rule);
}

.eh-landing-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2.5rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 960px) {
  .eh-landing-inner {
    grid-template-columns: 1fr;
  }
}

.eh-card {
  padding: 1.75rem;
  border: 1px solid var(--rule);
  border-radius: 6px;
  background: rgba(24, 27, 34, 0.55);
}

.eh-card-k {
  font-size: 0.7rem;
  color: var(--cyan);
  margin-bottom: 0.75rem;
  letter-spacing: 0.12em;
}

.eh-card h3 {
  font-family: 'Syne', sans-serif;
  font-size: 1.35rem;
  color: var(--white);
  margin-bottom: 0.75rem;
}

.eh-card p {
  font-size: 0.9rem;
  color: var(--fog2);
  line-height: 1.75;
}

.eh-landing-cta {
  padding: 4rem 0 5rem;
  border-top: 1px solid var(--rule);
}

.eh-landing-cta-inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.eh-landing-cta h2 {
  font-size: clamp(2rem, 4vw, 2.75rem);
  color: var(--white);
}

.eh-cta-copy {
  max-width: 520px;
  color: var(--fog2);
  font-size: 0.8rem;
}
</style>
