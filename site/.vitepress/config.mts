import { defineConfig } from 'vitepress'

const SITE_URL = 'https://timothestoifl24.dev'
const PROFILE_URL = 'https://timothe.stoifl.app'
const GITHUB_URL = 'https://github.com/timothestoifl24'
const LINKEDIN_URL = 'https://www.linkedin.com/in/timothestoifl'
const TITLE = 'Timo’s projects'
const DESCRIPTION =
  'Projects by Timothé Stoifl, an IT System Engineer who writes software for his homelab and work life.'

export default defineConfig({
  lang: 'en',
  title: TITLE,
  titleTemplate: ':title · timothestoifl24.dev',
  description: DESCRIPTION,
  cleanUrls: true,
  lastUpdated: false,
  ignoreDeadLinks: false,
  appearance: true, // follows prefers-color-scheme until the visitor uses the toggle

  sitemap: { hostname: SITE_URL },

  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    ['meta', { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' }],
    ['meta', { name: 'theme-color', content: '#1b1b1f', media: '(prefers-color-scheme: dark)' }],
    ['meta', { name: 'author', content: 'Timothé Stoifl' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'timothestoifl24.dev' }],
    ['meta', { property: 'og:image', content: `${SITE_URL}/og-image.png` }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }]
  ],

  // Per-page canonical + Open Graph tags.
  transformHead({ pageData, siteData }) {
    if (pageData.isNotFound) return [['meta', { name: 'robots', content: 'noindex' }]]
    const route = pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
    const url = `${SITE_URL}/${route}`
    const title = pageData.title ? `${pageData.title} · timothestoifl24.dev` : siteData.title
    const description = pageData.description || siteData.description
    return [
      ['link', { rel: 'canonical', href: url }],
      ['meta', { property: 'og:url', content: url }],
      ['meta', { property: 'og:title', content: title }],
      ['meta', { property: 'og:description', content: description }],
      ['meta', { name: 'twitter:title', content: title }],
      ['meta', { name: 'twitter:description', content: description }]
    ]
  },

  themeConfig: {
    siteTitle: 'timothestoifl24.dev',
    logo: { src: '/favicon.svg', alt: '' },
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Projects', link: '/projects', activeMatch: '^/projects' },
      { text: 'My Profile', link: PROFILE_URL }
    ],
    // Rendered right after the light/dark switch, in this order.
    socialLinks: [
      { icon: 'linkedin', link: LINKEDIN_URL, ariaLabel: 'LinkedIn profile' },
      { icon: 'github', link: GITHUB_URL, ariaLabel: 'GitHub profile' }
    ],
    footer: {
      message: `More about me on <a href="${PROFILE_URL}">My Profile</a>`,
      copyright: '© Timothé Stoifl'
    },
    externalLinkIcon: true,
    outline: false
  }
})
