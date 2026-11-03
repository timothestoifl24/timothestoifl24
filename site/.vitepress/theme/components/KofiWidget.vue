<script setup lang="ts">
// Official Ko-fi widget (Widget_2.js). Its draw() uses document.writeln, which
// doesn't work after the page has loaded, so we load the script on the client
// and insert kofiwidget2.getHTML() into this element instead.
// Without JS (or if the script fails) the plain link below stays as fallback.
import { onMounted, ref } from 'vue'

const KOFI_ID = 'Z4F028KJ68'
const TEXT = 'Buy me a coffee'
const COLOR = '#72a4f2'
const SRC = 'https://storage.ko-fi.com/cdn/widget/Widget_2.js'

const el = ref<HTMLElement | null>(null)

function loadScript(): Promise<void> {
  const w = window as any
  if (w.kofiwidget2) return Promise.resolve()
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SRC}"]`)
    const s = existing ?? document.createElement('script')
    s.addEventListener('load', () => resolve(), { once: true })
    s.addEventListener('error', () => reject(new Error('Ko-fi widget failed to load')), { once: true })
    if (!existing) {
      s.src = SRC
      s.async = true
      document.head.appendChild(s)
    }
  })
}

onMounted(async () => {
  try {
    await loadScript()
    const k = (window as any).kofiwidget2
    k.init(TEXT, COLOR, KOFI_ID)
    if (el.value) el.value.innerHTML = k.getHTML()
  } catch {
    /* keep the fallback link */
  }
})
</script>

<template>
  <div ref="el" class="kofi-widget">
    <a class="kofi-fallback" :href="`https://ko-fi.com/${KOFI_ID}`">{{ TEXT }} on Ko-fi</a>
  </div>
</template>
