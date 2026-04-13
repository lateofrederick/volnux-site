<script setup lang="ts">
import type { EventSource } from '@/types/wizard'
import { usePointyWizard } from '@/composables/usePointyWizard'

const marketingUrl = import.meta.env.VITE_MARKETING_URL || 'https://volnux.netlify.app'

const {
  canvasWrapRef,
  dragGhostRef,
  pointyOutputRef,
  nodes,
  edges,
  selectedNodeId,
  selectedNode,
  currentTool,
  zoomDisplay,
  workflowName,
  paletteSearch,
  collapsed,
  rightPanelCollapsed,
  bottomTab,
  modalOpen,
  modalName,
  selectedTemplate,
  ctxVisible,
  ctxX,
  ctxY,
  ctxIsCanvas,
  liveEdgeD,
  connectingHoverId,
  edgePaths,
  copyBtnFlash,
  canvasEmpty,
  filteredSections,
  pointyHtml,
  setTool,
  zoom,
  fitCanvas,
  toggleSection,
  metaFor,
  srcColor,
  eventAbbr,
  deleteNode,
  duplicateNode,
  onCanvasMouseDown,
  onNodeBodyPointerDown,
  onOutputPortDown,
  onNodeContextMenu,
  onCanvasContextMenu,
  hideCtx,
  ctxDelete,
  ctxDuplicate,
  clearCanvas,
  removeEdge,
  onPaletteDragStart,
  onPaletteDragEnd,
  onCanvasDragOver,
  onCanvasDrop,
  openNewWorkflowModal,
  closeModal,
  pickTemplate,
  confirmNewWorkflow,
  copyPointy,
  onEdgeEnter,
  onEdgeLeave,
  patchNode,
  paletteStripeColor,
} = usePointyWizard()
</script>

<template>
  <div class="flex min-h-0 flex-1 select-none flex-col overflow-hidden bg-vn-wizard-bg text-[13px]">
    <!-- MENUBAR -->
    <header
      class="relative z-[300] flex h-9 shrink-0 items-center border-b border-vn-border bg-vn-surface px-3"
    >
      <a
        :href="marketingUrl"
        class="mr-5 flex items-center gap-2 text-inherit no-underline visited:text-inherit"
      >
        <svg class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="none">
          <circle cx="10" cy="10" r="10" fill="#0f1318" />
          <path d="M10 10L10 1.5A8.5 8.5 0 0 1 17.9 13Z" fill="#00c8e0" />
          <path d="M10 10L17.9 13A8.5 8.5 0 0 1 2.1 13Z" fill="#6b4fff" />
          <path d="M10 10L2.1 13A8.5 8.5 0 0 1 10 1.5Z" fill="#00e87a" />
          <path
            d="M8.2 2.3C7.8 4.3 7.6 6.8 8 10A2 2 0 0 0 10 11.8A2 2 0 0 0 12 10C12.4 6.8 12.2 4.3 11.8 2.3C11.5 1.8 8.5 1.8 8.2 2.3Z"
            fill="#0f1318"
          />
          <path
            d="M2.5 12C4 10 6.5 9 9.8 8.5A2 2 0 0 0 9 7A2 2 0 0 0 7.8 6.5C5.3 7.2 3.5 8.8 2.8 11C2.6 11.6 2.6 12.8 2.5 12Z"
            fill="#0f1318"
          />
          <path
            d="M17.5 12C16 10 13.5 9 10.2 8.5A2 2 0 0 0 11 7A2 2 0 0 0 12.2 6.5C14.7 7.2 16.5 8.8 17.2 11C17.4 11.6 17.4 12.8 17.5 12Z"
            fill="#0f1318"
          />
          <circle cx="10" cy="10" r="1.8" fill="#0f1318" />
          <circle cx="10" cy="10" r="0.9" fill="#00e5ff" />
        </svg>
        <span class="font-mono text-[0.78rem] font-medium text-vn-white"
          >vol<span class="text-vn-accent">nux</span></span
        >
      </a>

      <div
        class="group relative flex h-9 cursor-default items-center gap-1 rounded px-[0.65rem] text-[0.78rem] text-vn-wizard-fog2 transition-colors hover:bg-white/5 hover:text-vn-white"
      >
        File
        <div
          class="invisible absolute left-0 top-full z-[500] min-w-[180px] rounded border border-vn-border2 bg-vn-surface2 py-1.5 opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover:visible group-hover:opacity-100"
        >
          <div
            class="flex cursor-pointer items-center justify-between px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 transition-colors hover:bg-white/[0.04] hover:text-vn-white"
            @click.stop="openNewWorkflowModal()"
          >
            New workflow <kbd class="ml-1 rounded border border-vn-border2 bg-vn-surface3 px-1 py-px font-mono text-[0.6rem] text-vn-wizard-muted">⌘N</kbd>
          </div>
          <div class="flex cursor-pointer items-center justify-between px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white">
            Open… <kbd class="ml-1 rounded border border-vn-border2 bg-vn-surface3 px-1 py-px font-mono text-[0.6rem] text-vn-wizard-muted">⌘O</kbd>
          </div>
          <div class="my-1 h-px bg-vn-border" />
          <div class="flex cursor-pointer items-center justify-between px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white">
            Save <kbd class="ml-1 rounded border border-vn-border2 bg-vn-surface3 px-1 py-px font-mono text-[0.6rem] text-vn-wizard-muted">⌘S</kbd>
          </div>
          <div class="flex cursor-pointer items-center justify-between px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white">Save as…</div>
          <div class="my-1 h-px bg-vn-border" />
          <div
            class="flex cursor-pointer items-center justify-between px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white"
            @click.stop="copyPointy()"
          >
            Export Pointy-lang
          </div>
          <div class="flex cursor-pointer items-center justify-between px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white">Export JSON</div>
        </div>
      </div>
      <div
        class="group relative flex h-9 cursor-default items-center gap-1 rounded px-[0.65rem] text-[0.78rem] text-vn-wizard-fog2 transition-colors hover:bg-white/5 hover:text-vn-white"
      >
        Edit
        <div
          class="invisible absolute left-0 top-full z-[500] min-w-[180px] rounded border border-vn-border2 bg-vn-surface2 py-1.5 opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover:visible group-hover:opacity-100"
        >
          <div class="flex cursor-pointer items-center justify-between px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white">
            Undo <kbd class="ml-1 rounded border border-vn-border2 bg-vn-surface3 px-1 py-px font-mono text-[0.6rem] text-vn-wizard-muted">⌘Z</kbd>
          </div>
          <div class="flex cursor-pointer items-center justify-between px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white">
            Redo <kbd class="ml-1 rounded border border-vn-border2 bg-vn-surface3 px-1 py-px font-mono text-[0.6rem] text-vn-wizard-muted">⌘⇧Z</kbd>
          </div>
          <div class="my-1 h-px bg-vn-border" />
          <div class="flex cursor-pointer items-center justify-between px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white">
            Select all <kbd class="ml-1 rounded border border-vn-border2 bg-vn-surface3 px-1 py-px font-mono text-[0.6rem] text-vn-wizard-muted">⌘A</kbd>
          </div>
          <div class="flex cursor-pointer items-center justify-between px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white">
            Delete selected <kbd class="ml-1 rounded border border-vn-border2 bg-vn-surface3 px-1 py-px font-mono text-[0.6rem] text-vn-wizard-muted">⌫</kbd>
          </div>
        </div>
      </div>
      <div
        class="group relative flex h-9 cursor-default items-center gap-1 rounded px-[0.65rem] text-[0.78rem] text-vn-wizard-fog2 transition-colors hover:bg-white/5 hover:text-vn-white"
      >
        View
        <div
          class="invisible absolute left-0 top-full z-[500] min-w-[180px] rounded border border-vn-border2 bg-vn-surface2 py-1.5 opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover:visible group-hover:opacity-100"
        >
          <div
            class="flex cursor-pointer items-center justify-between px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white"
            @click.stop="fitCanvas()"
          >
            Fit to canvas <kbd class="ml-1 rounded border border-vn-border2 bg-vn-surface3 px-1 py-px font-mono text-[0.6rem] text-vn-wizard-muted">⌘0</kbd>
          </div>
          <div
            class="flex cursor-pointer items-center justify-between px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white"
            @click.stop="zoom(0.1)"
          >
            Zoom in <kbd class="ml-1 rounded border border-vn-border2 bg-vn-surface3 px-1 py-px font-mono text-[0.6rem] text-vn-wizard-muted">⌘+</kbd>
          </div>
          <div
            class="flex cursor-pointer items-center justify-between px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white"
            @click.stop="zoom(-0.1)"
          >
            Zoom out <kbd class="ml-1 rounded border border-vn-border2 bg-vn-surface3 px-1 py-px font-mono text-[0.6rem] text-vn-wizard-muted">⌘-</kbd>
          </div>
          <div class="my-1 h-px bg-vn-border" />
          <div class="flex cursor-pointer items-center justify-between px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white">Toggle palette</div>
          <div
            class="flex cursor-pointer items-center justify-between px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white"
            @click.stop="rightPanelCollapsed = !rightPanelCollapsed"
          >
            Toggle properties
          </div>
        </div>
      </div>
      <div class="flex h-9 cursor-default items-center rounded px-[0.65rem] text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/5 hover:text-vn-white">Workflow</div>
      <div class="flex h-9 cursor-default items-center rounded px-[0.65rem] text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/5 hover:text-vn-white">Help</div>

      <button
        type="button"
        class="ml-auto flex h-[26px] shrink-0 items-center gap-2 rounded border-0 bg-vn-accent px-[0.85rem] font-mono text-[0.72rem] font-medium text-vn-wizard-bg transition-all hover:-translate-y-px hover:bg-[#33eaff] hover:shadow-[0_4px_16px_rgba(0,229,255,0.25)]"
        @click="openNewWorkflowModal()"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" class="shrink-0">
          <path d="M6 1v10M1 6h10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        New workflow
      </button>
    </header>

    <!-- TOOLBAR -->
    <div class="z-[200] flex h-12 shrink-0 items-center gap-1 border-b border-vn-border bg-vn-surface px-3">
      <div class="flex items-center gap-0.5 border-r border-vn-border px-2">
        <button
          type="button"
          class="flex h-[30px] w-[30px] items-center justify-center rounded border border-transparent text-vn-wizard-fog2 transition-all hover:border-vn-border2 hover:bg-vn-surface3 hover:text-vn-white data-[active=true]:border-vn-accent/20 data-[active=true]:bg-vn-accent/10 data-[active=true]:text-vn-accent"
          :data-active="currentTool === 'select'"
          title="Select (V)"
          @click="setTool('select')"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l4 10 2-4 4-2-10-4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          </svg>
        </button>
        <button
          type="button"
          class="flex h-[30px] w-[30px] items-center justify-center rounded border border-transparent text-vn-wizard-fog2 transition-all hover:border-vn-border2 hover:bg-vn-surface3 hover:text-vn-white data-[active=true]:border-vn-accent/20 data-[active=true]:bg-vn-accent/10 data-[active=true]:text-vn-accent"
          :data-active="currentTool === 'connect'"
          title="Connect (E)"
          @click="setTool('connect')"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="3" cy="7" r="2" stroke="currentColor" stroke-width="1.5" />
            <circle cx="11" cy="7" r="2" stroke="currentColor" stroke-width="1.5" />
            <path d="M5 7h4" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 1" />
          </svg>
        </button>
        <button
          type="button"
          class="flex h-[30px] w-[30px] items-center justify-center rounded border border-transparent text-vn-wizard-fog2 transition-all hover:border-vn-border2 hover:bg-vn-surface3 hover:text-vn-white data-[active=true]:border-vn-accent/20 data-[active=true]:bg-vn-accent/10 data-[active=true]:text-vn-accent"
          :data-active="currentTool === 'pan'"
          title="Pan (H)"
          @click="setTool('pan')"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M7 1v2M7 11v2M1 7h2M11 7h2M3.5 3.5l1.4 1.4M9.1 9.1l1.4 1.4M3.5 10.5l1.4-1.4M9.1 4.9l1.4-1.4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>

      <div class="flex items-center gap-0.5 border-r border-vn-border px-2">
        <input
          v-model="workflowName"
          type="text"
          spellcheck="false"
          class="min-w-[160px] rounded border border-transparent bg-transparent px-2 py-1 font-mono text-[0.8rem] text-vn-white outline-none transition-colors focus:border-vn-border2 focus:bg-vn-surface3"
        />
      </div>

      <div class="flex items-center gap-0.5 border-r border-vn-border px-2">
        <button
          type="button"
          class="flex h-[30px] w-[30px] items-center justify-center rounded border border-transparent text-vn-wizard-fog2 hover:border-vn-border2 hover:bg-vn-surface3 hover:text-vn-white"
          title="Zoom out"
          @click="zoom(-0.1)"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
        <span class="min-w-[42px] text-center font-mono text-[0.72rem] text-vn-wizard-fog2">{{ zoomDisplay }}</span>
        <button
          type="button"
          class="flex h-[30px] w-[30px] items-center justify-center rounded border border-transparent text-vn-wizard-fog2 hover:border-vn-border2 hover:bg-vn-surface3 hover:text-vn-white"
          title="Zoom in"
          @click="zoom(0.1)"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </button>
        <button
          type="button"
          class="flex h-[30px] w-[30px] items-center justify-center rounded border border-transparent text-vn-wizard-fog2 hover:border-vn-border2 hover:bg-vn-surface3 hover:text-vn-white"
          title="Fit canvas"
          @click="fitCanvas()"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="1" y="1" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1.2" />
            <rect x="7" y="7" width="4" height="4" rx="1" stroke="currentColor" stroke-width="1.2" />
            <path d="M8 4h1V3M4 8H3v1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
        </button>
      </div>

      <div class="flex items-center gap-0.5 border-r border-vn-border px-2">
        <span class="px-2 font-mono text-[0.68rem] text-vn-wizard-muted">{{ nodes.length }} nodes · {{ edges.length }} edges</span>
      </div>

      <div class="ml-auto flex items-center gap-0.5 border-r-0 pl-2">
        <button
          type="button"
          class="flex h-7 items-center gap-1.5 rounded border border-vn-border2 bg-transparent px-[0.85rem] font-mono text-[0.72rem] text-vn-wizard-fog2 transition-colors hover:border-vn-attr/35 hover:text-vn-attr"
          :class="copyBtnFlash && 'text-vn-accent3'"
          @click="copyPointy()"
        >
          <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
            <rect x="1" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.2" />
            <path
              d="M3 3V2a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H8"
              stroke="currentColor"
              stroke-width="1.2"
            />
          </svg>
          {{ copyBtnFlash ? 'Copied!' : 'Copy Pointy' }}
        </button>
        <button
          type="button"
          class="flex h-7 items-center gap-1.5 rounded border border-vn-accent3/25 bg-vn-accent3/10 px-[0.85rem] font-mono text-[0.72rem] text-vn-accent3 transition-colors hover:border-vn-accent3/45 hover:bg-vn-accent3/[0.18]"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 1.5l7 3.5-7 3.5V1.5z" fill="currentColor" />
          </svg>
          Run
        </button>
      </div>
    </div>

    <!-- WORKSPACE -->
    <div class="flex min-h-0 min-w-0 flex-1 overflow-hidden">
      <!-- PALETTE -->
      <aside class="z-[100] flex w-64 shrink-0 flex-col overflow-hidden border-r border-vn-border bg-vn-surface">
        <div class="flex items-center gap-2 border-b border-vn-border px-3 py-[0.65rem]">
          <input
            v-model="paletteSearch"
            type="text"
            placeholder="Search events…"
            class="w-full rounded border border-vn-border2 bg-vn-surface3 px-2 py-[0.35rem] font-mono text-[0.72rem] text-vn-white placeholder:text-vn-wizard-muted outline-none focus:border-vn-accent/30"
          />
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto py-2 [scrollbar-color:#2a3340_transparent] [scrollbar-width:thin]">
          <div v-for="sec in filteredSections" :key="sec.id" class="mb-1">
            <div
              class="flex cursor-pointer items-center justify-between px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-vn-wizard-muted transition-colors hover:text-vn-wizard-fog2"
              @click="toggleSection(sec.id)"
            >
              {{ sec.title }}
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                class="shrink-0 transition-transform duration-200"
                :class="collapsed[sec.id] ? '-rotate-90' : ''"
              >
                <path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
              </svg>
            </div>
            <div v-show="!collapsed[sec.id]" class="flex flex-col gap-0.5 px-2 pb-2">
              <div
                v-for="ev in sec.events"
                :key="ev.type"
                draggable="true"
                class="relative flex cursor-grab items-center gap-2.5 overflow-hidden rounded-md border border-vn-border bg-vn-surface2 px-2.5 py-[0.55rem] transition-all before:pointer-events-none before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[3px] before:rounded-l-md before:content-[''] hover:translate-x-0.5 hover:border-vn-border2 hover:bg-vn-surface3 active:cursor-grabbing active:opacity-70"
                :class="paletteStripeColor(ev.cat)"
                @dragstart="(e) => onPaletteDragStart(e, ev)"
                @dragend="onPaletteDragEnd()"
              >
                <div
                  class="flex h-7 w-7 shrink-0 items-center justify-center rounded border font-mono text-[0.6rem] font-medium"
                  :class="metaFor(ev.cat).iconBox"
                >
                  {{ ev.icon }}
                </div>
                <div class="min-w-0 flex-1">
                  <div class="truncate font-mono text-[0.72rem] text-vn-white">{{ ev.type }}</div>
                  <div class="mt-px truncate text-[0.62rem] text-vn-wizard-muted">{{ ev.sub }}</div>
                </div>
                <span class="shrink-0 text-[0.7rem] text-vn-wizard-muted opacity-0 transition-opacity group-hover:opacity-100">⠿</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <!-- CANVAS -->
      <div
        id="canvas-wrap"
        ref="canvasWrapRef"
        class="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-vn-wizard-bg before:pointer-events-none before:absolute before:inset-0 before:z-0 before:bg-[radial-gradient(rgba(255,255,255,0.06)_1px,transparent_1px)] before:bg-[length:24px_24px]"
        :class="currentTool === 'pan' ? 'cursor-grab' : 'cursor-default'"
        @mousedown="onCanvasMouseDown"
        @dragover="onCanvasDragOver"
        @drop="onCanvasDrop"
        @contextmenu="onCanvasContextMenu"
      >
        <div
          class="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center gap-3"
          :class="canvasEmpty ? 'flex' : 'hidden'"
        >
          <div
            class="flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-dashed border-vn-border2 text-vn-wizard-muted"
          >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect x="2" y="8" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.5" />
              <rect x="16" y="8" width="10" height="10" rx="2" stroke="currentColor" stroke-width="1.5" />
              <path d="M12 13h4" stroke="currentColor" stroke-width="1.5" stroke-dasharray="2 1" />
              <path d="M14 5v3M14 20v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            </svg>
          </div>
          <p class="font-mono text-[0.85rem] text-vn-wizard-fog2">Canvas is empty</p>
          <p class="max-w-[240px] text-center text-[0.75rem] leading-relaxed text-vn-wizard-muted">
            Drag events from the palette onto the canvas, then connect them to build your workflow.
          </p>
        </div>

        <svg class="pointer-events-none absolute inset-0 z-[1] h-full w-full" aria-hidden="true">
          <defs>
            <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
              <path d="M0 0L8 3L0 6" fill="none" stroke="#00e5ff" stroke-width="1.2" stroke-linejoin="round" />
            </marker>
          </defs>
          <g id="edges-group" class="pointer-events-auto">
            <template v-for="edge in edgePaths" :key="edge.id">
              <path
                fill="none"
                stroke-width="2"
                stroke-linecap="round"
                class="cursor-pointer stroke-vn-accent [stroke-linecap:round] hover:stroke-[3px]"
                :d="edge.d"
                marker-end="url(#arrowhead)"
                @mouseenter="onEdgeEnter"
                @mouseleave="onEdgeLeave"
                @dblclick.prevent="removeEdge(edge.id)"
              />
              <rect
                :x="edge.mx - 14"
                :y="edge.my - 9"
                width="28"
                height="16"
                rx="3"
                class="fill-vn-surface2 stroke-vn-border"
                stroke-width="1"
              />
              <text
                class="fill-vn-accent font-mono text-[9px] [dominant-baseline:central] [text-anchor:middle]"
                :x="edge.mx"
                :y="edge.my"
              >
                →
              </text>
            </template>
          </g>
          <path
            id="live-edge-path"
            fill="none"
            stroke-width="2"
            stroke-dasharray="6 4"
            class="stroke-vn-accent opacity-60 [stroke-linecap:round]"
            :d="liveEdgeD || ''"
          />
        </svg>

        <div id="canvas-nodes" class="absolute inset-0 z-[2]">
          <div
            v-for="node in nodes"
            :id="node.id"
            :key="node.id"
            class="canvas-node group absolute min-w-[160px] overflow-visible rounded-lg border-[1.5px] border-vn-border2 bg-vn-surface2 transition-[border-color,box-shadow] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
            :class="{
              'border-vn-accent shadow-[0_0_0_2px_rgba(0,229,255,0.15),0_8px_24px_rgba(0,0,0,0.4)]': selectedNodeId === node.id,
              'border-vn-accent3 shadow-[0_0_0_2px_rgba(0,255,148,0.2)]': connectingHoverId === node.id,
            }"
            :style="{ left: `${node.x}px`, top: `${node.y}px` }"
            @contextmenu.prevent.stop="onNodeContextMenu($event, node.id)"
          >
            <div class="absolute left-0 right-0 top-0 h-0.5 rounded-t-lg" :style="{ backgroundColor: metaFor(node.cat).bar }" />
            <div
              class="relative flex items-center gap-2 border-b border-vn-border px-[0.65rem] py-[0.55rem]"
              @pointerdown="onNodeBodyPointerDown($event, node.id)"
            >
              <div
                class="mt-0.5 flex shrink-0 items-center justify-center rounded border font-mono text-[0.55rem] font-medium"
                :class="metaFor(node.cat).iconBox"
                style="width: 22px; height: 22px"
              >
                {{ eventAbbr(node.type) }}
              </div>
              <span class="min-w-0 flex-1 truncate font-mono text-[0.75rem] font-medium text-vn-white">{{ node.type }}</span>
              <span
                class="shrink-0 rounded px-[0.35rem] py-px font-mono text-[0.55rem]"
                :style="{
                  backgroundColor: `${srcColor(node.source)}18`,
                  border: `1px solid ${srcColor(node.source)}30`,
                  color: srcColor(node.source),
                }"
                >{{ node.source }}</span
              >
            </div>
            <div class="px-[0.65rem] py-2" @pointerdown="onNodeBodyPointerDown($event, node.id)">
              <div :id="`${node.id}-meta`" class="mb-1 font-mono text-[0.62rem] text-vn-wizard-muted">
                {{ node.source }}:{{ node.type }}
              </div>
              <div
                v-if="node.annotation.trim()"
                class="mt-0.5 inline-block rounded border border-vn-attr/15 bg-vn-attr/[0.07] px-[0.35rem] py-px font-mono text-[0.6rem] text-vn-attr"
              >
                [{{ node.annotation }}]
              </div>
            </div>
            <div class="port absolute left-[-7px] top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
              <div
                class="input port h-3.5 w-3.5 cursor-crosshair rounded-full border-2 border-vn-border2 bg-vn-surface3 transition-all hover:scale-125 hover:border-vn-accent hover:bg-vn-accent hover:shadow-[0_0_0_3px_rgba(0,229,255,0.2)]"
                title="Input"
              />
            </div>
            <div class="port absolute right-[-7px] top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
              <div
                class="output port h-3.5 w-3.5 cursor-crosshair rounded-full border-2 border-vn-border2 bg-vn-surface3 transition-all hover:scale-125 hover:border-vn-accent hover:bg-vn-accent hover:shadow-[0_0_0_3px_rgba(0,229,255,0.2)]"
                title="Output — drag to connect"
                @pointerdown.stop="onOutputPortDown($event, node.id)"
              />
            </div>
            <div
              class="absolute -right-1.5 -top-1.5 z-20 hidden h-[18px] w-[18px] cursor-pointer items-center justify-center rounded-full border-2 border-vn-surface2 bg-vn-red text-[0.6rem] text-white transition-transform hover:scale-110 group-hover:flex [.canvas-node:hover_&]:flex [.canvas-node.border-vn-accent_&]:flex"
              @click.stop="deleteNode(node.id)"
            >
              ✕
            </div>
          </div>
        </div>
      </div>

      <!-- PROPERTIES -->
      <aside
        class="z-[100] flex w-60 shrink-0 flex-col overflow-hidden border-l border-vn-border bg-vn-surface transition-[width] duration-200"
        :class="rightPanelCollapsed ? 'w-0 border-l-0' : ''"
      >
        <div class="flex h-12 shrink-0 items-center justify-between border-b border-vn-border px-[0.85rem]">
          <span class="font-mono text-[0.7rem] uppercase tracking-[0.1em] text-vn-wizard-fog">Properties</span>
          <button
            type="button"
            class="flex h-[22px] w-[22px] items-center justify-center rounded border-0 bg-transparent text-vn-wizard-fog transition-colors hover:bg-vn-surface3 hover:text-vn-white"
            @click="rightPanelCollapsed = !rightPanelCollapsed"
          >
            ✕
          </button>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto p-[0.85rem] [scrollbar-color:#2a3340_transparent] [scrollbar-width:thin]">
          <template v-if="!selectedNode">
            <div class="flex h-full flex-col items-center justify-center gap-2 text-center text-vn-wizard-muted">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" class="opacity-40">
                <rect x="4" y="10" width="24" height="16" rx="3" stroke="currentColor" stroke-width="1.5" />
                <path d="M10 6h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                <path d="M12 18h8M12 22h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5" />
              </svg>
              <p class="text-[0.72rem] leading-relaxed">Select a node to<br />edit its properties</p>
            </div>
          </template>
          <template v-else>
            <div class="mb-5">
              <div class="mb-1.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-vn-wizard-muted">Event name</div>
              <input
                class="w-full rounded border border-vn-border2 bg-vn-surface3 px-2.5 py-1.5 font-mono text-[0.75rem] text-vn-white outline-none transition-colors focus:border-vn-accent/35"
                :value="selectedNode.type"
                @input="patchNode(selectedNode.id, { type: ($event.target as HTMLInputElement).value })"
              />
            </div>
            <div class="mb-5">
              <div class="mb-1.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-vn-wizard-muted">Source</div>
              <select
                class="w-full cursor-pointer rounded border border-vn-border2 bg-vn-surface3 px-2.5 py-1.5 font-mono text-[0.75rem] text-vn-white outline-none"
                :value="selectedNode.source"
                @change="
                  patchNode(selectedNode!.id, {
                    source: ($event.target as HTMLSelectElement).value as EventSource,
                  })
                "
              >
                <option value="pypi">pypi</option>
                <option value="hub">hub</option>
                <option value="git">git</option>
                <option value="local">local</option>
              </select>
            </div>
            <div class="mb-5">
              <div class="mb-1.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-vn-wizard-muted">Version</div>
              <input
                class="w-full rounded border border-vn-border2 bg-vn-surface3 px-2.5 py-1.5 font-mono text-[0.75rem] text-vn-white outline-none transition-colors focus:border-vn-accent/35"
                :value="selectedNode.version"
                @input="patchNode(selectedNode.id, { version: ($event.target as HTMLInputElement).value })"
              />
            </div>
            <div class="mb-5">
              <div class="mb-1.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-vn-wizard-muted">Node annotation</div>
              <input
                class="w-full rounded border border-vn-border2 bg-vn-surface3 px-2.5 py-1.5 font-mono text-[0.75rem] text-vn-white outline-none transition-colors focus:border-vn-accent/35"
                placeholder='e.g. node="warehouse"'
                :value="selectedNode.annotation"
                @input="patchNode(selectedNode.id, { annotation: ($event.target as HTMLInputElement).value })"
              />
            </div>
            <div class="mb-5">
              <div class="mb-1.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-vn-wizard-muted">Executor</div>
              <select
                class="w-full cursor-pointer rounded border border-vn-border2 bg-vn-surface3 px-2.5 py-1.5 font-mono text-[0.75rem] text-vn-white outline-none"
                :value="selectedNode.executor"
                @change="patchNode(selectedNode!.id, { executor: ($event.target as HTMLSelectElement).value })"
              >
                <option value="">default</option>
                <option value="celery">celery</option>
                <option value="local">local</option>
              </select>
            </div>
            <div class="mb-5">
              <div class="mb-1.5 font-mono text-[0.62rem] uppercase tracking-[0.08em] text-vn-wizard-muted">Retry count</div>
              <select
                class="w-full cursor-pointer rounded border border-vn-border2 bg-vn-surface3 px-2.5 py-1.5 font-mono text-[0.75rem] text-vn-white outline-none"
                :value="String(selectedNode.retry)"
                @change="
                  patchNode(selectedNode!.id, {
                    retry: Number.parseInt(($event.target as HTMLSelectElement).value, 10) || 0,
                  })
                "
              >
                <option value="0">none</option>
                <option value="2">× 2</option>
                <option value="3">× 3</option>
                <option value="5">× 5</option>
              </select>
            </div>
            <div class="my-[0.85rem] h-px bg-vn-border" />
            <div class="mb-1.5 flex items-center justify-between">
              <span class="font-mono text-[0.68rem] text-vn-wizard-fog2">Node ID</span
              ><span class="font-mono text-[0.68rem] text-vn-accent">{{ selectedNode.id }}</span>
            </div>
            <div class="mb-1.5 flex items-center justify-between">
              <span class="font-mono text-[0.68rem] text-vn-wizard-fog2">Category</span
              ><span class="font-mono text-[0.68rem] text-vn-accent">{{ selectedNode.cat }}</span>
            </div>
            <div class="mb-1.5 flex items-center justify-between">
              <span class="font-mono text-[0.68rem] text-vn-wizard-fog2">Position</span
              ><span class="font-mono text-[0.68rem] text-vn-accent"
                >{{ Math.round(selectedNode.x) }}, {{ Math.round(selectedNode.y) }}</span
              >
            </div>
            <div class="my-[0.85rem] h-px bg-vn-border" />
            <div class="flex flex-wrap gap-1.5">
              <button
                type="button"
                class="min-w-0 flex-1 rounded border border-vn-red/20 bg-vn-red/10 px-2 py-[0.45rem] font-mono text-[0.68rem] text-vn-red transition-colors hover:bg-vn-red/[0.15]"
                @click="deleteNode(selectedNode.id)"
              >
                Delete node
              </button>
              <button
                type="button"
                class="min-w-0 flex-1 rounded border border-vn-border2 bg-vn-surface3 px-2 py-[0.45rem] font-mono text-[0.68rem] text-vn-wizard-fog2 transition-colors hover:border-vn-border2 hover:text-vn-white"
                @click="duplicateNode(selectedNode.id)"
              >
                Duplicate
              </button>
            </div>
          </template>
        </div>
      </aside>
    </div>

    <!-- BOTTOM -->
    <div class="shrink-0 border-t border-vn-border bg-vn-surface">
      <div class="flex h-[30px] items-stretch border-b border-vn-border">
        <button
          type="button"
          class="flex items-center gap-1.5 border-b-2 border-transparent bg-transparent px-[0.85rem] font-mono text-[0.68rem] text-vn-wizard-fog2 transition-colors hover:text-vn-white"
          :class="bottomTab === 'pointy' ? 'border-b-vn-accent text-vn-accent' : ''"
          @click="bottomTab = 'pointy'"
        >
          <span class="h-1.5 w-1.5 animate-pls rounded-full bg-vn-accent3" />
          Pointy-lang output
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 border-b-2 border-transparent bg-transparent px-[0.85rem] font-mono text-[0.68rem] text-vn-wizard-fog2 transition-colors hover:text-vn-white"
          :class="bottomTab === 'console' ? 'border-b-vn-accent text-vn-accent' : ''"
          @click="bottomTab = 'console'"
        >
          Console
        </button>
        <button
          type="button"
          class="flex items-center gap-1.5 border-b-2 border-transparent bg-transparent px-[0.85rem] font-mono text-[0.68rem] text-vn-wizard-fog2 transition-colors hover:text-vn-white"
          :class="bottomTab === 'validation' ? 'border-b-vn-accent text-vn-accent' : ''"
          @click="bottomTab = 'validation'"
        >
          Validation
        </button>
      </div>
      <div
        v-show="bottomTab === 'pointy'"
        id="pointy-output"
        ref="pointyOutputRef"
        class="h-[110px] overflow-auto whitespace-pre px-4 py-[0.65rem] font-mono text-[0.78rem] leading-[1.9] [scrollbar-color:#2a3340_transparent] [scrollbar-width:thin]"
        v-html="pointyHtml"
      />
      <div
        v-show="bottomTab === 'console'"
        class="h-[110px] overflow-auto whitespace-pre px-4 py-[0.65rem] font-mono text-[0.78rem] leading-[1.9] text-vn-wizard-fog"
      >
        # Console (coming soon)
      </div>
      <div
        v-show="bottomTab === 'validation'"
        class="h-[110px] overflow-auto whitespace-pre px-4 py-[0.65rem] font-mono text-[0.78rem] leading-[1.9] text-vn-wizard-fog"
      >
        # Validation (coming soon)
      </div>
    </div>

    <!-- STATUS -->
    <footer
      class="flex h-6 shrink-0 items-center gap-5 border-t border-vn-border bg-vn-surface2 px-3 font-mono text-[0.62rem] text-vn-wizard-muted"
    >
      <div class="flex items-center gap-1.5">
        <div class="h-[5px] w-[5px] rounded-full bg-vn-accent3" />
        Runtime connected
      </div>
      <div class="flex items-center gap-1.5">
        <div class="h-[5px] w-[5px] rounded-full bg-vn-accent3" />
        EventHub online
      </div>
      <div>{{ nodes.length }} node{{ nodes.length !== 1 ? 's' : '' }}</div>
      <div>{{ edges.length }} edge{{ edges.length !== 1 ? 's' : '' }}</div>
      <div class="ml-auto" />
      <div>Pointy-lang Wizard v0.3</div>
      <div>volnux-core 0.9.1</div>
    </footer>

    <div
      id="drag-ghost"
      ref="dragGhostRef"
      class="fixed left-0 top-[-100px] z-[9999] hidden rounded border border-vn-border2 bg-vn-surface2 px-3 py-1.5 font-mono text-[0.75rem] text-vn-white opacity-85 pointer-events-none"
    />

    <div
      v-show="ctxVisible"
      id="ctx-menu"
      class="fixed z-[1000] min-w-[160px] rounded-md border border-vn-border2 bg-vn-surface2 py-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.5)]"
      :style="{ left: `${ctxX}px`, top: `${ctxY}px` }"
      @click.stop
    >
      <template v-if="ctxIsCanvas">
        <div class="flex cursor-pointer items-center gap-2.5 px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 transition-colors hover:bg-white/[0.04] hover:text-vn-white" @click="hideCtx()">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          Add node here
        </div>
        <div class="flex cursor-pointer items-center gap-2.5 px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white" @click="(fitCanvas(), hideCtx())">Fit canvas</div>
        <div class="my-1 h-px bg-vn-border" />
        <div class="flex cursor-pointer items-center gap-2.5 px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white" @click="(clearCanvas(), hideCtx())">Clear canvas</div>
      </template>
      <template v-else>
        <div class="flex cursor-pointer items-center gap-2.5 px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white" @click="ctxDuplicate()">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="1" y="4" width="8" height="8" rx="1.5" stroke="currentColor" stroke-width="1.2" />
            <path d="M4 4V3a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H9" stroke="currentColor" stroke-width="1.2" />
          </svg>
          Duplicate
        </div>
        <div class="flex cursor-pointer items-center gap-2.5 px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
          Add annotation
        </div>
        <div class="flex cursor-pointer items-center gap-2.5 px-[0.85rem] py-1.5 text-[0.78rem] text-vn-wizard-fog2 hover:bg-white/[0.04] hover:text-vn-white">
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M2 6.5a4.5 4.5 0 1 0 9 0 4.5 4.5 0 0 0-9 0z" stroke="currentColor" stroke-width="1.2" />
            <path d="M6.5 4v2.5l1.5 1.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
          </svg>
          Add retry
        </div>
        <div class="my-1 h-px bg-vn-border" />
        <div
          class="flex cursor-pointer items-center gap-2.5 px-[0.85rem] py-1.5 text-[0.78rem] text-vn-red transition-colors hover:bg-vn-red/10"
          @click="ctxDelete()"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M2 4h9M5 4V2.5h3V4M5.5 6.5v4M7.5 6.5v4M3 4l.8 7h5.4L10 4"
              stroke="currentColor"
              stroke-width="1.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          Delete
        </div>
      </template>
    </div>

    <!-- MODAL -->
    <div
      class="fixed inset-0 z-[500] items-center justify-center bg-black/60 backdrop-blur-sm"
      :class="modalOpen ? 'flex' : 'hidden'"
      @click.self="closeModal()"
    >
      <div class="w-[440px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[10px] border border-vn-border2 bg-vn-surface2 shadow-[0_24px_64px_rgba(0,0,0,0.6)]" @click.stop>
        <div class="flex items-center justify-between border-b border-vn-border px-5 py-[1.1rem]">
          <span class="font-mono text-[0.85rem] font-medium text-vn-white">New workflow</span>
          <button
            type="button"
            class="flex h-6 w-6 items-center justify-center rounded border-0 bg-transparent text-vn-wizard-fog2 hover:bg-vn-surface3 hover:text-vn-white"
            @click="closeModal()"
          >
            ✕
          </button>
        </div>
        <div class="p-5">
          <div class="mb-4">
            <label class="mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.08em] text-vn-wizard-fog">Workflow name</label>
            <input v-model="modalName" type="text" spellcheck="false" class="w-full rounded border border-vn-border2 bg-vn-surface3 px-3 py-2 font-mono text-[0.82rem] text-vn-white outline-none focus:border-vn-accent/40" />
          </div>
          <div class="mb-4">
            <label class="mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.08em] text-vn-wizard-fog">Start from template</label>
            <div class="mt-2 grid grid-cols-2 gap-2">
              <div
                class="cursor-pointer rounded-md border-[1.5px] border-vn-border2 bg-vn-surface p-3 transition-colors hover:border-vn-accent/30 hover:bg-vn-surface3"
                :class="selectedTemplate === 'Blank' ? 'border-vn-accent bg-vn-accent/5' : ''"
                @click="pickTemplate('Blank')"
              >
                <div class="mb-1 text-lg">⬜</div>
                <div class="mb-0.5 font-mono text-[0.72rem] text-vn-white">Blank</div>
                <div class="text-[0.65rem] leading-snug text-vn-wizard-muted">Start from an empty canvas</div>
              </div>
              <div
                class="cursor-pointer rounded-md border-[1.5px] border-vn-border2 bg-vn-surface p-3 transition-colors hover:border-vn-accent/30 hover:bg-vn-surface3"
                :class="selectedTemplate === 'ETL Pipeline' ? 'border-vn-accent bg-vn-accent/5' : ''"
                @click="pickTemplate('ETL Pipeline')"
              >
                <div class="mb-1 text-lg">🔄</div>
                <div class="mb-0.5 font-mono text-[0.72rem] text-vn-white">ETL Pipeline</div>
                <div class="text-[0.65rem] leading-snug text-vn-wizard-muted">Extract → Transform → Load</div>
              </div>
              <div
                class="cursor-pointer rounded-md border-[1.5px] border-vn-border2 bg-vn-surface p-3 transition-colors hover:border-vn-accent/30 hover:bg-vn-surface3"
                :class="selectedTemplate === 'AI Agent' ? 'border-vn-accent bg-vn-accent/5' : ''"
                @click="pickTemplate('AI Agent')"
              >
                <div class="mb-1 text-lg">🤖</div>
                <div class="mb-0.5 font-mono text-[0.72rem] text-vn-white">AI Agent</div>
                <div class="text-[0.65rem] leading-snug text-vn-wizard-muted">Intent → Process → Respond</div>
              </div>
              <div
                class="cursor-pointer rounded-md border-[1.5px] border-vn-border2 bg-vn-surface p-3 transition-colors hover:border-vn-accent/30 hover:bg-vn-surface3"
                :class="selectedTemplate === 'Streaming' ? 'border-vn-accent bg-vn-accent/5' : ''"
                @click="pickTemplate('Streaming')"
              >
                <div class="mb-1 text-lg">📡</div>
                <div class="mb-0.5 font-mono text-[0.72rem] text-vn-white">Streaming</div>
                <div class="text-[0.65rem] leading-snug text-vn-wizard-muted">Ingest → Validate → Sink</div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-end gap-2 border-t border-vn-border px-5 py-[0.85rem]">
          <button
            type="button"
            class="flex h-8 items-center gap-1.5 rounded border border-vn-border2 bg-transparent px-4 font-mono text-[0.75rem] text-vn-wizard-fog2 hover:border-vn-border2 hover:text-vn-white"
            @click="closeModal()"
          >
            Cancel
          </button>
          <button
            type="button"
            class="flex h-8 items-center gap-1.5 rounded border-0 bg-vn-accent px-4 font-mono text-[0.75rem] font-medium text-vn-wizard-bg hover:bg-[#33eaff]"
            @click="confirmNewWorkflow()"
          >
            Create workflow →
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
