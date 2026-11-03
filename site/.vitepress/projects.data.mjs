// Build-time data loader: `import { data } from '../.vitepress/projects.data.mjs'`
import { defineLoader } from 'vitepress'
import { loadProjects } from './lib/projects.mjs'

export default defineLoader({
  watch: ['../../data/projects.yaml'],
  load() {
    return loadProjects()
  }
})
