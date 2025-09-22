<!-- src/views/CourseLearn.vue -->
<template>
  <div class="container nb-brutal" :class="themeClass">
    <div class="theme-btn-box">
      <button @click="toggleTheme" class="theme-btn nb-brutal">
        {{ theme === 'light' ? 'theme: light' : 'theme: dark' }}
      </button>
      <router-link to="/catalog" class="theme-btn nb-brutal">Back</router-link>
    </div>

    <h1 class="page-title">{{ title }}</h1>

    <div v-if="error" class="error nb-brutal">{{ error }}</div>

    <div v-else class="learn-sections">
      <!-- 課程簡介 -->
      <section class="card nb-brutal">
        <h2 class="sec-title">課程簡介</h2>
        <div v-if="!editing">{{ content.intro }}</div>
        <div v-else>
          <textarea v-model="content.intro" rows="5" class="input nb-brutal"
                    placeholder="撰寫本課程的核心介紹、學習目標與應用場景"></textarea>
        </div>
      </section>

      <!-- 本課程包含項目 -->
      <section class="card nb-brutal">
        <h2 class="sec-title">本課程包含項目</h2>
        <ul v-if="!editing">
          <li v-for="(it, idx) in content.includes" :key="`incl-${idx}`">{{ it }}</li>
        </ul>
        <div v-else class="list-editor">
          <div v-for="(it, idx) in content.includes" :key="`incl-ed-${idx}`" class="list-row">
            <input v-model="content.includes[idx]" class="input nb-brutal" />
            <button class="btn nb-brutal danger" @click="removeFromArray(content.includes, idx)">刪除</button>
          </div>
          <button class="btn nb-brutal" @click="content.includes.push('')">新增項目</button>
        </div>
      </section>

      <!-- 需求與時數、修課條件 -->
      <section class="card nb-brutal">
        <h2 class="sec-title">需求與時數 / 修課條件</h2>
        <div class="grid-3">
          <div class="kv">
            <div class="kv-k">技能水準需求</div>
            <div class="kv-v" v-if="!editing">{{ content.level }}</div>
            <input v-else v-model="content.level" class="input nb-brutal" />
          </div>
          <div class="kv">
            <div class="kv-k">預計課程時間</div>
            <div class="kv-v" v-if="!editing">{{ content.duration }}</div>
            <input v-else v-model="content.duration" class="input nb-brutal" />
          </div>
          <div class="kv">
            <div class="kv-k">修課條件</div>
            <div class="kv-v" v-if="!editing">{{ content.prerequisites }}</div>
            <input v-else v-model="content.prerequisites" class="input nb-brutal" />
          </div>
        </div>
      </section>

      <!-- 學成技能 -->
      <section class="card nb-brutal">
        <h2 class="sec-title">學成技能</h2>
        <ul v-if="!editing">
          <li v-for="(it, idx) in content.outcomes" :key="`out-${idx}`">{{ it }}</li>
        </ul>
        <div v-else class="list-editor">
          <div v-for="(it, idx) in content.outcomes" :key="`out-ed-${idx}`" class="list-row">
            <input v-model="content.outcomes[idx]" class="input nb-brutal" />
            <button class="btn nb-brutal danger" @click="removeFromArray(content.outcomes, idx)">刪除</button>
          </div>
          <button class="btn nb-brutal" @click="content.outcomes.push('')">新增技能</button>
        </div>
      </section>

      <!-- 教學大綱 -->
      <section class="card nb-brutal">
        <h2 class="sec-title">教學大綱</h2>
        <div v-if="!editing">
          <div v-for="(sec, sidx) in content.syllabus" :key="`sy-${sidx}`" class="syllabus-sec">
            <div class="sy-title">{{ sec.title }}</div>
            <ul>
              <li v-for="(t, tidx) in sec.topics" :key="`sy-${sidx}-t-${tidx}`">{{ t }}</li>
            </ul>
          </div>
        </div>
        <div v-else class="syllabus-editor">
          <div v-for="(sec, sidx) in content.syllabus" :key="`sy-ed-${sidx}`" class="sy-card nb-brutal">
            <input v-model="sec.title" class="input nb-brutal" placeholder="單元標題" />
            <div class="list-editor">
              <div v-for="(t, tidx) in sec.topics" :key="`sy-ed-${sidx}-${tidx}`" class="list-row">
                <input v-model="sec.topics[tidx]" class="input nb-brutal" placeholder="主題" />
                <button class="btn nb-brutal danger" @click="removeFromArray(sec.topics, tidx)">刪除</button>
              </div>
              <button class="btn nb-brutal" @click="sec.topics.push('')">新增主題</button>
            </div>
            <div class="sy-actions">
              <button class="btn nb-brutal danger" @click="removeFromArray(content.syllabus, sidx)">刪除單元</button>
            </div>
          </div>
          <button class="btn nb-brutal" @click="content.syllabus.push({ title: '', topics: [''] })">新增單元</button>
        </div>
      </section>

      <!-- 工具列與儲存狀態 -->
      <div class="toolbar">
        <template v-if="canEdit">
          <button v-if="!editing" class="btn nb-brutal" @click="startEdit">編輯內容</button>
          <button v-if="!editing" class="btn nb-brutal" @click="applyDefaultsAndSave">一鍵套用預設並儲存</button>
          <div v-else class="edit-actions">
            <button class="btn nb-brutal" @click="save" :disabled="saving">儲存</button>
            <button class="btn nb-brutal" @click="cancelEdit" :disabled="saving">取消</button>
          </div>
        </template>
        <p v-if="successMessage" class="success nb-brutal">{{ successMessage }}</p>
        <p v-if="saveError" class="error nb-brutal">{{ saveError }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { getCourse, updateCourse } from '@/api/courses'
import { themeStore } from '@/stores/theme'
import { authStore } from '@/stores/auth'

const route = useRoute()
const courseId = Number(route.params.id)

const course = ref(null)
const error = ref('')
const saveError = ref('')
const successMessage = ref('')
const saving = ref(false)

const theme = themeStore.theme
const themeClass = themeStore.themeClass
function toggleTheme() { themeStore.toggleTheme() }

const canEdit = computed(() => {
  const role = authStore.userRole.value
  return role === 'ADMIN' || role === 'TEACHER'
})

const title = computed(() => String(course.value?.courseName || '').trim())

// 僅保留六大區塊，預設內容為「假描述」
const DEFAULT_LEARN_CONTENT = {
  type: 'CourseLearnContent',
  version: 2,
  intro: '本課程以實務導向的方式建立演算法與問題解決能力，透過經典案例與實作練習連結理論與應用；從時間/空間複雜度出發，循序掌握分治、貪婪、動態規劃、圖論與搜尋技巧，並於期末以小型專題整合學習成果。',
  includes: [
    '每週重點講義與投影片',
    '對應主題的範例程式與測試資料',
    '分層難度的練習題（含參考解）',
    '線上小測驗（即時回饋）',
    '助教答疑與作業回饋',
    '期中檢核與期末小型專題'
  ],
  level: '入門至進階（循序打底並延伸挑戰）',
  duration: '8 週（每週 3 小時課程 + 2–3 小時練習）',
  prerequisites: '具備基礎程式能力（任一語言皆可），基本離散數學與資料結構觀念佳；若為初學者亦可透過預習單元快速銜接。',
  outcomes: [
    '能以時間/空間複雜度衡量解法可行性並做取捨',
    '熟悉分治、貪婪、動態規劃的設計思路與辨識條件',
    '能運用圖論基礎（BFS/DFS、最短路徑、最小生成樹）解題',
    '具備以測試資料驗證與優化程式效能的能力',
    '能以口語與技術文件清楚表達解法設計與取捨'
  ],
  syllabus: [
    { title: '課程導論與複雜度分析', topics: ['漸進符號與估算', '正確性與效能的雙軸思維', '測試資料與邊界案例'] },
    { title: '資料結構複習與實作習慣', topics: ['陣列/鏈結/堆疊/佇列', '雜湊與集合操作', 'I/O 與除錯策略'] },
    { title: '分治法', topics: ['Divide & Conquer 模式', '遞迴式推導與 Master Theorem', '典型應用（排序、最近點對）'] },
    { title: '貪婪法', topics: ['選擇性證明與交換辯證', '區間安排與資源配置', '最小生成樹（Kruskal/Prim）'] },
    { title: '動態規劃（I）', topics: ['重疊子問題與最優子結構', '自頂向下與自底向上', '記憶化策略'] },
    { title: '動態規劃（II）', topics: ['序列與背包類型', '狀態壓縮與轉移優化', '典範題型演練'] },
    { title: '圖論基礎與最短路徑', topics: ['BFS/DFS 與層級遍歷', 'Dijkstra/Bellman-Ford', '圖模型化實務'] },
    { title: '綜合實作與期末專題', topics: ['題型辨識流程', '效能分析與優化報告', '專題簡報與同儕回饋'] }
  ]
}

// async function save() {
//   saveError.value = ''
//   successMessage.value = ''
//   saving.value = true
//   try {
//     const payloadJson = JSON.stringify(content.value)
//     const { data } = await updateCourseDescription(courseId, payloadJson)
//     course.value = data
//     content.value = parseContent(data?.courseDescription)
//     successMessage.value = '已儲存變更'
//     editing.value = false
//   } catch (e) {
//     saveError.value = e?.response?.data?.message || e.message || '儲存失敗'
//   } finally {
//     saving.value = false
//   }
// }

const content = ref(createDefaultContent())

function createDefaultContent() {
  // 深拷貝避免編輯時污染常數
  return JSON.parse(JSON.stringify(DEFAULT_LEARN_CONTENT))
}

function parseContent(desc) {
  // 讀到舊資料或不是 JSON，直接以 intro 鋪回預設其餘欄位
  if (!desc) return createDefaultContent()
  try {
    const parsed = JSON.parse(desc)
    if (parsed && parsed.type === 'CourseLearnContent') {
      // 以預設鋪底，覆蓋使用者既有內容（缺漏欄位補預設）
      const base = createDefaultContent()
      return {
        ...base,
        ...parsed,
        includes: Array.isArray(parsed.includes) && parsed.includes.length ? parsed.includes : base.includes,
        outcomes: Array.isArray(parsed.outcomes) && parsed.outcomes.length ? parsed.outcomes : base.outcomes,
        syllabus: Array.isArray(parsed.syllabus) && parsed.syllabus.length
            ? parsed.syllabus.map(s => ({
              title: String(s?.title || ''),
              topics: Array.isArray(s?.topics) && s.topics.length ? s.topics : ['']
            }))
            : base.syllabus,
        level: parsed.level || base.level,
        duration: parsed.duration || base.duration,
        prerequisites: parsed.prerequisites || base.prerequisites,
        intro: parsed.intro || base.intro,
        version: 2,
      }
    }
    const d = createDefaultContent()
    d.intro = String(desc)
    return d
  } catch {
    const d = createDefaultContent()
    d.intro = String(desc)
    return d
  }
}

onMounted(async () => {
  try {
    const { data } = await getCourse(courseId)
    course.value = data
    content.value = parseContent(data?.courseDescription)
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || 'Failed to load course'
  }
})

const editing = ref(false)
function startEdit() { editing.value = true }
function cancelEdit() {
  editing.value = false
  content.value = parseContent(course.value?.courseDescription)
}
function removeFromArray(arr, idx) { arr.splice(idx, 1) }

async function save() {
  saveError.value = ''
  successMessage.value = ''
  saving.value = true
  try {
    const payload = {
      courseName: course.value.courseName,
      courseDescription: JSON.stringify(content.value),
      credits: course.value.credits,
      teacher: course.value.teacher
    }
    const { data } = await updateCourse(courseId, payload)
    course.value = data
    content.value = parseContent(data?.courseDescription)
    successMessage.value = '已儲存變更'
    editing.value = false
  } catch (e) {
    saveError.value = e?.response?.data?.message || e.message || '儲存失敗'
  } finally {
    saving.value = false
  }
}


// 一鍵套用預設（ADMIN/TEACHER 用）
async function applyDefaultsAndSave() {
  content.value = createDefaultContent()
  await save()
}



</script>

<style scoped>
.container { background: inherit; color: inherit; padding: 24px 0; border-radius: 12px; box-shadow: var(--nb-shadow); min-height: 80vh; width: 100%; max-width: 1200px; margin: 24px auto; position: relative; box-sizing: border-box; }
.theme-btn-box { position: absolute; top: 16px; right: 16px; display: flex; gap: 8px; }
.page-title { font-size: 2rem; font-weight: 800; margin: 8px 0 16px; text-align: center; }

.learn-sections { display: flex; flex-direction: column; gap: 16px; width: 100%; max-width: 1000px; margin: 0 auto; }
.card { padding: 16px; border: var(--nb-border-thick) solid var(--nb-border); border-radius: 12px; background: inherit; }
.sec-title { font-size: 1.2rem; font-weight: 800; margin: 0 0 10px; }

.input { width: 100%; padding: 10px 12px; border-radius: 8px; background: var(--color-background-mute); color: inherit; border: var(--nb-border-thick) solid var(--nb-border); box-shadow: var(--nb-shadow); }

.grid-3 { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.kv { display: flex; flex-direction: column; gap: 6px; }
.kv-k { font-weight: 700; }

.list-editor { display: flex; flex-direction: column; gap: 8px; }
.list-row { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }

.syllabus-editor { display: flex; flex-direction: column; gap: 12px; }
.syllabus-sec { margin-bottom: 8px; }
.sy-title { font-weight: 800; margin-bottom: 6px; }
.sy-card { padding: 12px; border-radius: 10px; }
.sy-actions { display: flex; justify-content: flex-end; margin-top: 8px; }

.toolbar { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; margin-top: 4px; }
.edit-actions { display: flex; gap: 8px; }

.btn { padding: 8px 14px; border: 3px solid #000; box-shadow: 4px 4px 0 #000; background: inherit; color: inherit; border-radius: 6px; font-weight: 800; cursor: pointer; }
.btn.danger { background: #ffe3e3; }

.success { background: #efe; color: #262; padding: 8px 12px; border: var(--nb-border-thick) solid var(--nb-border); box-shadow: var(--nb-shadow); }
.error { background: #c00; color: #fff; padding: 8px 12px; border: var(--nb-border-thick) solid var(--nb-border); box-shadow: var(--nb-shadow); }
</style>
