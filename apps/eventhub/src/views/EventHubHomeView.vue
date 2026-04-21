<script setup lang="ts">
import { computed, ref } from 'vue'

const marketing = import.meta.env.VITE_MARKETING_URL?.trim().replace(/\/$/, '') || ''
const docsHref = computed(() => (marketing ? `${marketing}/docs` : '/docs'))
const homeHref = computed(() => (marketing ? marketing : '/'))
const aboutHref = computed(() => (marketing ? `${marketing}/about` : '/about'))
const featuresHref = computed(() => `${homeHref.value}/#features`)
const governanceHref = computed(() => (marketing ? `${marketing}/governance` : '/governance'))

import EventHubEventCard from '@/components/eventhub/EventHubEventCard.vue'
import { eventHubCategories, eventHubEvents, sourceLabels } from '@/data/eventhub'
import type { EventSource } from '@/types/eventhub'

const search = ref('')
const activeCategory = ref<(typeof eventHubCategories)[number]>('All')
const activeSources = ref<Record<EventSource, boolean>>({
  pypi: true,
  git: true,
  hub: true,
  local: false,
})
const officialOnly = ref(false)
const sortBy = ref<'downloads' | 'alphabetical'>('downloads')

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  let rows = eventHubEvents.filter((e) => activeSources.value[e.source])
  if (activeCategory.value !== 'All') rows = rows.filter((e) => e.category === activeCategory.value)
  if (officialOnly.value) rows = rows.filter((e) => e.verified === 'official')
  if (q) {
    rows = rows.filter((e) => `${e.name} ${e.description} ${e.tags.join(' ')}`.toLowerCase().includes(q))
  }
  if (sortBy.value === 'alphabetical') rows = [...rows].sort((a, b) => a.name.localeCompare(b.name))
  return rows
})

function categoryCount(category: (typeof eventHubCategories)[number]) {
  if (category === 'All') return eventHubEvents.length
  return eventHubEvents.filter((e) => e.category === category).length
}

function sourceDotClass(source: EventSource): string {
  const map: Record<EventSource, string> = {
    pypi: 'var(--cyan)',
    git: 'var(--purple)',
    hub: 'var(--amber)',
    local: 'var(--green)',
  }
  return map[source]
}

</script>

<template>
  <div>
    <section id="hero" class="z1">
      <div class="hero-bg-text">EventHub</div>
      <div class="hero-inner">
        <p class="hero-badge"><span class="badge-dot"></span>Volnux Event Registry — beta</p>
        <h1 class="hero-title">
          Every workflow<br />
          starts with an <em>event.</em>
        </h1>
        <p class="hero-desc">
          EventHub is the open registry for Volnux EventBase components. Find, publish, and pull versioned events from
          PyPI, Git, or the community hub — directly referenced in your Pointy-lang workflows.
        </p>
        <div class="hero-search">
          <input v-model="search" type="text" placeholder="Search events — e.g. PostgresExtract, GPT4Transform, S3Load…" />
          <button type="button">Search</button>
        </div>
        <div class="hero-stats">
          <div>
            <p class="hero-stat-value">2<span>,</span>847</p>
            <p class="hero-stat-label">published events</p>
          </div>
          <div>
            <p class="hero-stat-value">641</p>
            <p class="hero-stat-label">publishers</p>
          </div>
          <div>
            <p class="hero-stat-value">1<span>.</span>2M</p>
            <p class="hero-stat-label">monthly pulls</p>
          </div>
          <div>
            <p class="hero-stat-value">98<span>%</span></p>
            <p class="hero-stat-label">verified events</p>
          </div>
        </div>
      </div>
    </section>

    <div id="categories" class="z1">
      <div class="cat-scroll">
        <button
          v-for="category in eventHubCategories"
          :key="category"
          type="button"
          class="cat-btn"
          :class="{ active: activeCategory === category }"
          @click="activeCategory = category"
        >
          {{ category }} <span class="cat-count">{{ categoryCount(category) }}</span>
        </button>
      </div>
    </div>

    <div id="registry" class="z1">
      <aside class="sidebar">
        <div class="sidebar-section">
          <p class="sidebar-label">Source</p>
          <label v-for="(label, source) in sourceLabels" :key="source" class="filter-option" :class="{ active: activeSources[source] }">
            <input v-model="activeSources[source]" type="checkbox" />
            <span class="filter-dot" :style="{ background: sourceDotClass(source as EventSource) }"></span>
            {{ label }}
            <span
              class="source-badge"
              :style="{
                color: sourceDotClass(source as EventSource),
                borderColor:
                  source === 'pypi'
                    ? 'rgba(0,229,255,0.3)'
                    : source === 'git'
                      ? 'rgba(123,97,255,0.3)'
                      : source === 'hub'
                        ? 'rgba(255,184,48,0.3)'
                        : 'rgba(0,255,148,0.3)',
                background:
                  source === 'pypi'
                    ? 'rgba(0,229,255,0.05)'
                    : source === 'git'
                      ? 'rgba(123,97,255,0.05)'
                      : source === 'hub'
                        ? 'rgba(255,184,48,0.05)'
                        : 'rgba(0,255,148,0.05)',
              }"
              >{{ source }}</span
            >
          </label>
        </div>

        <div class="sidebar-section">
          <p class="sidebar-label">Verified</p>
          <label class="filter-option">
            <input v-model="officialOnly" type="checkbox" />
            <span style="font-size: 0.75rem; color: var(--green)">✓</span>
            Official only
          </label>
        </div>
      </aside>

      <main>
        <div class="registry-header">
          <p class="registry-count">Showing <strong>{{ filtered.length }}</strong> events</p>
          <select v-model="sortBy" class="sort-select">
            <option value="downloads">Most downloaded</option>
            <option value="alphabetical">Alphabetical</option>
          </select>
        </div>

        <div class="events-grid">
          <EventHubEventCard v-for="event in filtered" :key="event.slug" :event="event" />
        </div>
      </main>
    </div>

    <section id="publish" class="z1">
      <div class="publish-inner">
        <div>
          <p class="eyebrow" style="justify-content: flex-start">Publishing</p>
          <h2 class="publish-title">
            Your events.<br />
            The <em>whole</em> ecosystem.
          </h2>
          <p class="publish-desc">
            Any Python class that inherits from
            <code class="eh-code-inline">EventBase</code> can be published to EventHub. Once published, it becomes
            instantly referenceable in any Pointy-lang workflow across the entire Volnux mesh — no deployment, no shared
            codebase, no coordination overhead.
          </p>
          <div class="publish-steps">
            <div class="publish-step">
              <div class="step-num">01</div>
              <div>
                <strong>Inherit EventBase</strong>
                <p>
                  Subclass <code class="eh-code-inline">EventBase</code> and implement the
                  <code class="eh-code-inline">__call__</code> coroutine. That's the entire interface contract.
                </p>
              </div>
            </div>
            <div class="publish-step">
              <div class="step-num">02</div>
              <div>
                <strong>Publish to PyPI, Git, or EventHub</strong>
                <p>Push to your preferred source. EventHub picks up verified publishers automatically.</p>
              </div>
            </div>
            <div class="publish-step">
              <div class="step-num">03</div>
              <div>
                <strong>Reference by name in Pointy-lang</strong>
                <p>Anyone on the Volnux mesh can now pull and execute your event with a single annotation.</p>
              </div>
            </div>
          </div>
          <a href="#" class="eh-publish-cta">Publish your first event →</a>
        </div>

        <div>
          <div class="publish-code">
            <div class="code-bar">
              <span class="code-dot-r"></span>
              <span class="code-dot-y"></span>
              <span class="code-dot-g"></span>
              <span class="code-filename">my_event.py</span>
            </div>
            <div class="code-body">
              <span class="c-cm"># 1. Inherit EventBase</span><br />
              <span class="c-kw">from</span> <span class="c-nd">volnux.events</span> <span class="c-kw">import</span>
              <span class="c-fn">EventBase</span><br />
              <span class="c-kw">from</span> <span class="c-nd">volnux.result</span> <span class="c-kw">import</span>
              <span class="c-fn">EventResult</span><br />
              <br />
              <span class="c-dec">@hub.publish</span><span class="c-str">(name="MyTransform", version="1.0.0")</span><br />
              <span class="c-kw">class</span> <span class="c-fn">MyTransform</span>(<span class="c-fn">EventBase</span>):<br />
              &nbsp;&nbsp;<span class="c-kw">async def</span> <span class="c-fn">__call__</span>(<span class="c-nd">self</span>,
              <span class="c-nd">record</span>: <span class="c-fn">dict</span>) <span class="c-kw">-></span>
              <span class="c-fn">EventResult</span>:<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span class="c-cm"># your logic here</span><br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span class="c-nd">result</span> = <span class="c-kw">await</span>
              <span class="c-nd">self</span>.<span class="c-fn">process</span>(<span class="c-nd">record</span>)<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span class="c-kw">return</span> <span class="c-fn">EventResult</span>(<span class="c-nd">content</span>=<span class="c-nd">result</span>)<br />
            </div>
          </div>

          <div class="publish-code" style="margin-top: 1rem">
            <div class="code-bar">
              <span class="code-dot-r"></span>
              <span class="code-dot-y"></span>
              <span class="code-dot-g"></span>
              <span class="code-filename">pipeline.pointy</span>
            </div>
            <div class="code-body">
              <span class="c-cm"># 3. Reference anywhere in Pointy-lang</span><br />
              <span style="color: var(--green)">hub</span><span style="color: var(--amber)">:MyTransform@v1.0.0</span><br />
              &nbsp;&nbsp;<span style="color: var(--cyan)">-></span>
              <span style="color: var(--green)">pypi</span><span style="color: var(--amber)">:SnowflakeLoad@v1.0.4</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section id="how" class="z1">
      <div class="how-header reveal">
        <p class="eyebrow">How it works</p>
        <h2 class="how-title">Runtime assembly, not deployment.</h2>
      </div>
      <div class="how-grid reveal">
        <div class="how-card">
          <p class="how-num">01</p>
          <h3>Author once</h3>
          <p>
            Write a Python class that inherits <code class="eh-code-inline">EventBase</code> and implement a single async
            coroutine. No framework lock-in, no decorators, no boilerplate beyond the interface contract.
          </p>
        </div>
        <div class="how-card">
          <p class="how-num">02</p>
          <h3>Publish anywhere</h3>
          <p>
            Push to PyPI, tag a Git release, or register on EventHub. Version pins ensure reproducible execution. The
            Volnux resolver fetches exactly the version you specify at runtime.
          </p>
          <div class="how-pointy">
            <span style="color: var(--green)">pypi</span><span style="color: var(--amber)">:MyEvent@v2.1.0</span><br />
            <span style="color: var(--green)">git</span><span style="color: var(--amber)"
              >:OrgEvent[version=<span style="color: var(--pink)">"v3.1"</span>]</span
            ><br />
            <span style="color: var(--green)">hub</span><span style="color: var(--amber)">:CommunityEvent@latest</span>
          </div>
        </div>
        <div class="how-card">
          <p class="how-num">03</p>
          <h3>Run without deployment</h3>
          <p>
            The Volnux runtime resolves and fetches your event at execution time — on any node in the mesh. No shared
            codebase. No deployment pipeline. No coordination. Reference it in Pointy-lang and it just runs.
          </p>
        </div>
      </div>
    </section>

    <footer class="z1">
      <div class="footer-inner">
        <p>© 2026 Volnux · EventHub registry</p>
        <div class="footer-links">
          <a :href="homeHref">Home</a>
          <a :href="aboutHref">About</a>
          <a :href="featuresHref">Features</a>
          <a :href="governanceHref">Governance</a>
          <a :href="docsHref">Docs</a>
          <a href="mailto:hello@volnux.ai">Contact Us</a>
        </div>
        <p class="mono">eventhub v0.1-beta</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.eh-code-inline {
  font-family: 'DM Mono', monospace;
  color: var(--cyan);
  font-size: 0.85em;
}
</style>
