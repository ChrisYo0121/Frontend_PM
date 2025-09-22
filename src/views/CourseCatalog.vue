<!-- src/views/CourseCatalog.vue -->
<template>
  <div class="container nb-brutal" :class="themeClass">
    <div class="theme-btn-box">
      <button @click="toggleTheme" class="theme-btn nb-brutal">
        {{ theme === 'light' ? 'theme: light' : 'theme: dark' }}
      </button>
    </div>

    <h1 class="title">Course Catalog</h1>

    <div v-if="error" class="error nb-brutal">{{ error }}</div>
    <div v-else-if="courses.length === 0" class="loading nb-brutal">Loading courses...</div>

    <div v-else class="card-grid">
      <div
          v-for="course in courses"
          :key="course.courseId"
          class="course-card nb-brutal clickable"
          @click="navigateToCourse(course.courseId)"
      >
        <img
            class="course-image"
            :src="getImageSrc(courseTitle(course))"
            :alt="`Course: ${courseTitle(course)}`"
        />
        <div class="overlay-title">
          {{ courseTitle(course) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCourses } from '@/api/courses'
import { themeStore } from '@/stores/theme'

// 掃描 assets/courses（相對於 views）
const imageModules = import.meta.glob('../assets/courses/*.{png,jpg,jpeg,webp,svg}', {
  eager: true,
  import: 'default',
})

const router = useRouter()
const courses = ref([])
const error = ref('')

const theme = themeStore.theme
const themeClass = themeStore.themeClass
function toggleTheme() { themeStore.toggleTheme() }

onMounted(async () => {
  try {
    const { data } = await fetchCourses()
    courses.value = data
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || 'Failed to load courses'
  }
})

function courseTitle(course) {
  return String(course?.courseName || course?.name || '').trim()
}

function getImageSrc(title) {
  if (!title) return getFirstFallback()
  const preferredKey = `../assets/courses/${title}.png`
  if (imageModules[preferredKey]) return imageModules[preferredKey]
  const matcher = new RegExp(`^\\.\\.\\/assets\\/courses\\/${escapeRegExp(title)}\\.(png|jpg|jpeg|webp|svg)$`)
  for (const key of Object.keys(imageModules)) {
    if (matcher.test(key)) return imageModules[key]
  }
  return getFirstFallback()
}

function getFirstFallback() {
  const firstKey = Object.keys(imageModules)[0]
  return firstKey ? imageModules[firstKey] : ''
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function navigateToCourse(id) {
  router.push({ name: 'course-learn', params: { id } })
}
</script>

<style scoped>
/* 样式與先前版本一致（略） */
.container { background: inherit; color: inherit; padding: 32px 0; border-radius: 12px; box-shadow: var(--nb-shadow); min-height: 80vh; position: relative; width: 100%; max-width: 1200px; margin: 24px auto; box-sizing: border-box; overflow-x: hidden; display: flex; flex-direction: column; align-items: center; }
.theme-btn-box { position: absolute; top: 16px; right: 16px; left: auto; z-index: 10; width: auto; display: flex; justify-content: flex-end; }
.title { font-size: 2rem; font-weight: bold; margin-bottom: 16px; color: inherit; }
.card-grid { width: 95%; margin: 8px auto 24px; display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px; }
.course-card { position: relative; background: inherit; color: inherit; border: var(--nb-border-thick) solid var(--nb-border); box-shadow: var(--nb-shadow); border-radius: 12px; overflow: hidden; display: flex; flex-direction: column; }
.clickable { cursor: pointer; }
.course-image { width: 100%; height: 160px; object-fit: cover; border-bottom: var(--nb-border-thick) solid var(--nb-border); background: var(--color-background-mute); }
.overlay-title { position: absolute; left: 0; right: 0; bottom: 0; padding: 10px 12px; font-weight: 800; font-size: 1.1rem; line-height: 1.3; color: #111; background: linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0.25)); border-top: var(--nb-border-thick) solid var(--nb-border); }
.loading { color: #333; background: #ffe; padding: 8px 16px; border: var(--nb-border-thick) solid var(--nb-border); box-shadow: var(--nb-shadow); text-align: center; border-radius: 8px; margin-top: 16px; }
.error { color: #fff; background: #c00; padding: 8px 16px; border: var(--nb-border-thick) solid var(--nb-border); box-shadow: var(--nb-shadow); text-align: center; border-radius: 8px; margin-top: 16px; }
</style>
