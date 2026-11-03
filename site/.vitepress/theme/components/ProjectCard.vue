<script setup lang="ts">
import StatusBadge from './StatusBadge.vue'
import { formatDate } from '../format'

defineProps<{
  project: {
    slug: string
    name: string
    category: string
    one_line: string
    status: string
    stack: string[]
    repo: string
    site: string | null
    link: string
    preview: string | null
    created: string
  }
  showPreview?: boolean
}>()
</script>

<template>
  <article class="project-card" :class="{ muted: project.status === 'archived' }">
    <a v-if="showPreview" class="card-preview" :href="project.link" tabindex="-1" aria-hidden="true">
      <img
        v-if="project.preview"
        :src="project.preview"
        alt=""
        width="1280"
        height="640"
        loading="lazy"
        decoding="async"
      />
      <span v-else class="card-preview-fallback">{{ project.name }}</span>
    </a>
    <div class="card-body">
      <div class="card-head">
        <h3 class="card-title">
          <a :href="project.link">{{ project.name }}</a>
        </h3>
        <StatusBadge :status="project.status" />
      </div>
      <p class="card-category">{{ project.category }}</p>
      <p class="card-oneline">{{ project.one_line }}</p>
      <ul class="card-stack" aria-label="Stack">
        <li v-for="tag in project.stack" :key="tag">{{ tag }}</li>
      </ul>
      <p class="card-created"><strong>Created:</strong> <time :datetime="project.created">{{ formatDate(project.created) }}</time></p>
      <p class="card-links">
        <a :href="project.repo">Repository<span class="sr-only"> for {{ project.name }}</span></a>
        <a v-if="project.site" :href="project.site">Website<span class="sr-only"> for {{ project.name }}</span></a>
      </p>
    </div>
  </article>
</template>
