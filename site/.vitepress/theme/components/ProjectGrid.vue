<script setup lang="ts">
import { computed } from 'vue'
import { data as projects } from '../../projects.data.mjs'
import ProjectCard from './ProjectCard.vue'

// Used on Home (as an h2 section) and on /projects (as the page's h1).
const props = withDefaults(defineProps<{ title?: string; level?: 'h1' | 'h2' }>(), {
  title: 'My Projects',
  level: 'h2'
})

// Featured first, then the loader's order (status, then name). Archived go last, collapsed.
const current = computed(() =>
  projects
    .filter((p) => p.status !== 'archived')
    .sort((a, b) => Number(b.featured) - Number(a.featured))
)
const archived = computed(() => projects.filter((p) => p.status === 'archived'))
const headingId = computed(() => `${props.level}-projects-heading`)
</script>

<template>
  <section class="section all-projects" :aria-labelledby="headingId">
    <component :is="level" :id="headingId" class="projects-heading">{{ title }}</component>

    <div v-if="current.length" class="card-grid project-list">
      <ProjectCard v-for="p in current" :key="p.slug" :project="p" show-preview />
    </div>
    <p v-else class="empty">No projects yet.</p>

    <details v-if="archived.length" class="archived">
      <summary>Archived projects ({{ archived.length }})</summary>
      <div class="card-grid">
        <ProjectCard v-for="p in archived" :key="p.slug" :project="p" />
      </div>
    </details>
  </section>
</template>
