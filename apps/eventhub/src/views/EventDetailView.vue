<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

import EventHubCodeBlock from '@/components/eventhub/EventHubCodeBlock.vue'
import { findEventBySlug, relatedEvents } from '@/data/eventhub'
import type { EventHubChangelogEntry } from '@/types/eventhub'

const route = useRoute()
const activeTab = ref<'overview' | 'parameters' | 'examples' | 'changelog'>('overview')

const event = computed(() => findEventBySlug(String(route.params.slug ?? '')))
const related = computed(() => (event.value ? relatedEvents(event.value.slug) : []))

const usedWithList = computed(() => event.value?.detail.usedWithCards ?? null)

const relatedCards = computed(() => {
  const ev = event.value
  if (!ev) return []
  if (usedWithList.value?.length) {
    return usedWithList.value.map((c) => ({
      slug: c.slug,
      icon: c.icon,
      name: c.name,
      desc: c.description,
      dl: c.downloadsLine,
    }))
  }
  return related.value.map((row) => ({
    slug: row.slug,
    icon: row.icon,
    name: row.name,
    desc: row.description,
    dl: `${row.downloadsMonthly} · ${row.source}`,
  }))
})

function copyInstall(refValue: string) {
  void navigator.clipboard.writeText(refValue)
}

function changelogTagClass(tag: EventHubChangelogEntry['tag']) {
  const map: Record<EventHubChangelogEntry['tag'], string> = {
    feature: 'cl-tag--feat',
    fix: 'cl-tag--fix',
    breaking: 'cl-tag--break',
    perf: 'cl-tag--perf',
  }
  return map[tag]
}

function compatBadgeClass(version: string) {
  return ['0.8.x', '0.9.x', '0.10.x'].includes(version) ? 'compat-badge ok' : 'compat-badge'
}
</script>

<template>
  <div>
    <template v-if="!event">
      <div class="page-wrap z1">
        <main>
          <h1 style="margin-bottom: 1rem; font-family: 'DM Mono', monospace; font-size: 1.5rem; color: var(--white)">
            Event not found
          </h1>
          <RouterLink to="/" class="ver-nav-link" style="display: inline-flex">← Back to EventHub</RouterLink>
        </main>
      </div>
    </template>

    <template v-else>
      <div class="version-bar z1">
        <div class="version-inner">
          <button type="button" class="ver-tab active">
            {{ event.version }} <span class="ver-badge ver-badge--latest">latest</span>
          </button>
          <div class="ver-spacer"></div>
          <div class="ver-nav">
            <button
              type="button"
              class="ver-nav-link"
              :class="{ active: activeTab === 'overview' }"
              @click="activeTab = 'overview'"
            >
              Overview
            </button>
            <button
              type="button"
              class="ver-nav-link"
              :class="{ active: activeTab === 'parameters' }"
              @click="activeTab = 'parameters'"
            >
              Parameters
            </button>
            <button
              type="button"
              class="ver-nav-link"
              :class="{ active: activeTab === 'examples' }"
              @click="activeTab = 'examples'"
            >
              Examples
            </button>
            <button
              type="button"
              class="ver-nav-link"
              :class="{ active: activeTab === 'changelog' }"
              @click="activeTab = 'changelog'"
            >
              Changelog
            </button>
          </div>
        </div>
      </div>

      <div class="page-wrap z1">
        <main>
          <div class="event-header fade-up d1">
            <div class="event-header-top">
              <div class="event-icon-lg">{{ event.icon }}</div>
              <div class="event-title-block">
                <h1>{{ event.name }} <span>@{{ event.version }}</span></h1>
                <div class="event-publisher">
                  <div class="publisher-avatar">V</div>
                  {{ event.detail.publisher }}
                  <span v-if="event.verified === 'official'" class="verified-badge">✓ official</span>
                </div>
              </div>
            </div>
            <p class="event-desc-main">{{ event.description }}</p>
            <div class="event-tags-row">
              <span
                v-for="tag in event.tags"
                :key="tag"
                class="tag"
                :class="
                  event.tagAccent != null && Object.prototype.hasOwnProperty.call(event.tagAccent, tag)
                    ? event.tagAccent[tag] ?? ''
                    : 'tag--cyan'
                "
              >
                {{ tag }}
              </span>
            </div>
          </div>

          <div class="content-tabs fade-up d2">
            <button type="button" class="ctab" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">
              Overview
            </button>
            <button type="button" class="ctab" :class="{ active: activeTab === 'parameters' }" @click="activeTab = 'parameters'">
              Parameters
            </button>
            <button type="button" class="ctab" :class="{ active: activeTab === 'examples' }" @click="activeTab = 'examples'">
              Examples
            </button>
            <button type="button" class="ctab" :class="{ active: activeTab === 'changelog' }" @click="activeTab = 'changelog'">
              Changelog
            </button>
          </div>

          <!-- Overview -->
          <div v-if="activeTab === 'overview'" class="fade-up d3">
            <template v-if="event.detail.overviewSections?.length">
              <div v-for="(section, si) in event.detail.overviewSections" :key="si" class="doc-section">
                <h2>{{ section.heading }}</h2>
                <template v-for="(item, ii) in section.content" :key="ii">
                  <p v-if="item.type === 'p'" v-html="item.html"></p>
                  <h3 v-else-if="item.type === 'h3'">{{ item.text }}</h3>
                  <EventHubCodeBlock v-else-if="item.type === 'code'" :language="item.language" :code="item.code" />
                </template>
              </div>
            </template>
            <template v-else>
              <div class="doc-section">
                <h2>What it does</h2>
                <p v-for="text in event.detail.overview" :key="text">{{ text }}</p>
                <EventHubCodeBlock language="python" :code="event.detail.interfaceCode" />
              </div>
            </template>
          </div>

          <!-- Parameters -->
          <div v-else-if="activeTab === 'parameters'" class="fade-up d3">
            <div class="doc-section" id="parameters">
              <h2>{{ event.detail.parametersHeading ?? 'Parameters' }}</h2>
              <table class="param-table">
                <thead>
                  <tr>
                    <th>Parameter</th>
                    <th>Type</th>
                    <th>Required</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="param in event.detail.parameters" :key="param.name">
                    <td><span class="param-name">{{ param.name }}</span></td>
                    <td><span class="param-type">{{ param.type }}</span></td>
                    <td>
                      <span v-if="param.required" class="param-required">required</span>
                      <span v-else class="param-optional">optional</span>
                    </td>
                    <td>
                      <div v-if="param.descriptionCellHtml" v-html="param.descriptionCellHtml"></div>
                      <template v-else>
                        <p class="param-desc">{{ param.description }}</p>
                        <p v-if="param.defaultValue" class="param-default">
                          default:
                          <code style="font-family: 'DM Mono', monospace; font-size: 0.8em; color: var(--fog2)">{{
                            param.defaultValue
                          }}</code>
                        </p>
                      </template>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Examples -->
          <div v-else-if="activeTab === 'examples'" class="fade-up d3">
            <div class="doc-section" id="examples">
              <h2 v-if="event.detail.examplesHeading">{{ event.detail.examplesHeading }}</h2>
              <template v-for="example in event.detail.usageExamples" :key="example.title">
                <h3>{{ example.title }}</h3>
                <EventHubCodeBlock :language="example.language" :code="example.code" />
              </template>
            </div>
          </div>

          <!-- Changelog -->
          <div v-else class="fade-up d3">
            <div class="doc-section" id="changelog">
              <h2>{{ event.detail.changelogHeading ?? 'Version history' }}</h2>
              <div v-for="entry in event.detail.changelog" :key="entry.version" class="changelog-item">
                <div>
                  <p class="cl-version">{{ entry.version }}</p>
                  <p class="cl-date">{{ entry.date }}</p>
                </div>
                <div>
                  <span class="cl-tag" :class="changelogTagClass(entry.tag)">{{ entry.tag }}</span>
                  <ul class="cl-entries">
                    <li v-for="(item, idx) in entry.items" :key="idx">
                      <span v-if="entry.itemsAreHtml" v-html="item"></span>
                      <template v-else>{{ item }}</template>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div class="doc-section fade-up d4">
            <h2>{{ event.detail.relatedSectionTitle ?? 'Related events' }}</h2>
            <div class="related-grid">
              <RouterLink
                v-for="card in relatedCards"
                :key="card.slug"
                :to="{ name: 'eventhub-detail', params: { slug: card.slug } }"
                class="related-card"
              >
                <div class="related-icon related-icon--amber">{{ card.icon }}</div>
                <p class="related-name">{{ card.name }}</p>
                <p v-if="card.desc" class="related-desc">{{ card.desc }}</p>
                <p v-if="card.dl" class="related-dl"><span>↓</span>{{ card.dl }}</p>
              </RouterLink>
            </div>
          </div>
        </main>

        <aside class="sidebar fade-up d2">
          <div class="sidebar-card">
            <div class="sidebar-card-header">{{ event.detail.sidebarInstallTitle ?? 'Install references' }}</div>
            <div class="sidebar-card-body">
              <template v-if="event.detail.installSnippets?.length">
                <button
                  v-for="(snip, idx) in event.detail.installSnippets"
                  :key="idx"
                  type="button"
                  class="install-snippet"
                  :style="idx > 0 ? 'margin-top:0.5rem' : undefined"
                  title="Click to copy"
                  @click="copyInstall(snip.copyText)"
                >
                  <span class="copy-hint">click to copy</span>
                  <span class="prefix">$ </span>
                  <span class="source" :style="snip.source === 'hub' ? { color: 'var(--amber)' } : undefined">{{ snip.source }}</span>
                  <span class="pkg">{{ snip.pkg }}</span>
                  <span class="ver">{{ snip.ver }}</span>
                </button>
              </template>
              <template v-else>
                <button
                  v-for="refValue in event.detail.installRefs"
                  :key="refValue"
                  type="button"
                  class="install-snippet"
                  style="width: 100%; margin-bottom: 0.5rem; text-align: left; cursor: pointer"
                  @click="copyInstall(refValue)"
                >
                  <span class="copy-hint">click to copy</span>
                  <span class="mono" style="font-size: 0.72rem; color: var(--silver)">{{ refValue }}</span>
                </button>
              </template>
            </div>
          </div>

          <div class="sidebar-card">
            <div class="sidebar-card-header">Statistics</div>
            <div class="sidebar-card-body">
              <div class="stats-grid">
                <div v-for="stat in event.stats" :key="stat.label" class="stat-cell">
                  <div class="stat-val">{{ stat.value }}</div>
                  <div class="stat-lbl">{{ stat.label }}</div>
                </div>
              </div>
              <template v-if="event.detail.downloadChartBars?.length">
                <p
                  style="
                    font-family: 'DM Mono', monospace;
                    font-size: 0.65rem;
                    color: var(--fog);
                    margin-bottom: 0.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                  "
                >
                  Downloads — last 12 weeks
                </p>
                <div class="dl-chart">
                  <div
                    v-for="(h, bi) in event.detail.downloadChartBars"
                    :key="bi"
                    class="dl-bar"
                    :class="{ peak: bi === 6 || bi === event.detail.downloadChartBars!.length - 1 }"
                    :style="{ height: h }"
                  ></div>
                </div>
              </template>
            </div>
          </div>

          <div class="sidebar-card">
            <div class="sidebar-card-header">Package info</div>
            <div class="sidebar-card-body">
              <div class="meta-row">
                <span class="meta-key">publisher</span>
                <span class="meta-val">{{ event.detail.publisher }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">licence</span>
                <span class="meta-val">{{ event.detail.license }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">published</span>
                <span class="meta-val">{{ event.detail.published }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">python</span>
                <span class="meta-val">{{ event.detail.python }}</span>
              </div>
              <div class="meta-row">
                <span class="meta-key">source</span>
                <span class="meta-val"
                  ><a :href="event.detail.sourceUrl" target="_blank" rel="noopener noreferrer">GitHub ↗</a></span
                >
              </div>
              <div class="meta-row">
                <span class="meta-key">issues</span>
                <span class="meta-val"
                  ><a :href="event.detail.issuesUrl" target="_blank" rel="noopener noreferrer">GitHub Issues ↗</a></span
                >
              </div>
              <div v-if="event.detail.pypiUrl" class="meta-row">
                <span class="meta-key">pypi</span>
                <span class="meta-val"
                  ><a :href="event.detail.pypiUrl" target="_blank" rel="noopener noreferrer">pypi.org ↗</a></span
                >
              </div>
            </div>
          </div>

          <div class="sidebar-card">
            <div class="sidebar-card-header">Dependencies</div>
            <div class="sidebar-card-body">
              <div v-for="dep in event.detail.dependencies" :key="dep.name" class="dep-item">
                <span class="dep-name">{{ dep.name }}</span>
                <span class="dep-ver">{{ dep.version }}</span>
              </div>
            </div>
          </div>

          <div class="sidebar-card">
            <div class="sidebar-card-header">Volnux compatibility</div>
            <div class="sidebar-card-body">
              <div class="compat-row">
                <span
                  v-for="ver in event.detail.compatibility"
                  :key="ver"
                  :class="compatBadgeClass(ver)"
                  >{{ ver }}</span
                >
              </div>
            </div>
          </div>

          <div v-if="event.detail.pointyReferenceHtml" class="sidebar-card">
            <div class="sidebar-card-header">Reference in Pointy-lang</div>
            <div class="sidebar-card-body" v-html="event.detail.pointyReferenceHtml"></div>
          </div>
        </aside>
      </div>
    </template>
  </div>
</template>
