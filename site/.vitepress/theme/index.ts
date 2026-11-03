import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import KofiWidget from './components/KofiWidget.vue'
import ProfileCard from './components/ProfileCard.vue'
import ProjectGrid from './components/ProjectGrid.vue'
import './custom.css'

// Only components used directly in Markdown pages are registered globally.
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('KofiWidget', KofiWidget)
    app.component('ProfileCard', ProfileCard)
    app.component('ProjectGrid', ProjectGrid)
  }
} satisfies Theme
