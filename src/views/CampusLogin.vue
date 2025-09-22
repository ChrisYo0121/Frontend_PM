<!-- src/views/CampusLogin.vue -->
<template>
  <div class="campus-login-container nb-brutal" :class="themeClass">
    <div class="theme-btn-box">
      <button @click="toggleTheme" class="theme-btn nb-brutal">
        {{ theme === 'light' ? '夜間模式' : '白天模式' }}
      </button>
      <button @click="goToUserSelector" class="admin-btn nb-brutal">管理員</button>
    </div>
    <div class="login-box nb-brutal">
      <h1 class="title">校園登入系統</h1>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="userId">使用者 ID</label>
          <input id="userId" v-model="userId" type="text" required placeholder="請輸入使用者 ID" />
        </div>
        <div class="form-group">
          <label for="role">角色</label>
          <select id="role" v-model="role" required>
            <option value="ADMIN">管理員</option>
            <option value="TEACHER">教師</option>
            <option value="STUDENT">學生</option>
          </select>
        </div>
        <button type="submit" class="login-btn nb-brutal" :disabled="loading">登入</button>
      </form>
      <div v-if="error" class="error nb-brutal">{{ error }}</div>
      <div v-if="loading && !error" class="loading-msg">正在登入...</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { loginAsId } from '@/api/users'
import { authStore } from '@/stores/auth'
import { themeStore } from '@/stores/theme'

const router = useRouter()
const userId = ref('')
const role = ref('STUDENT')
const error = ref('')
const loading = ref(false)

const theme = themeStore.theme
const themeClass = themeStore.themeClass
function toggleTheme() { themeStore.toggleTheme() }
function goToUserSelector() { router.push('/userselector') }

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    const res = await loginAsId(userId.value, role.value)
    const jwt = res?.jwt ?? res?.data?.jwt
    if (!jwt) throw new Error('JWT missing from response')
    authStore.setToken(jwt)
    router.push({ name: 'course-catalog' })
  } catch (e) {
    error.value = e?.response?.data?.message || e.message || '登入失敗，請確認 ID 與角色。'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* 保持原樣式（略） */
.campus-login-container { min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; background: inherit; color: inherit; width: 100%; max-width: 1200px; margin: 0 auto; box-sizing: border-box; position: relative; padding-top: 80px; padding-left: 5vw; padding-right: 5vw; box-shadow: none !important; border: 3px solid transparent !important; }
.theme-btn-box { position: absolute; top: 16px; right: 16px; z-index: 10; }
.login-box { background: var(--color-background-soft); color: var(--color-text); border-radius: 16px; box-shadow: 6px 6px 0 #000, 0 4px 12px rgba(0,0,0,0.10); padding: 40px 32px; min-width: 320px; max-width: 400px; width: 100%; display: flex; flex-direction: column; align-items: center; margin-top: 24px; }
.title { font-size: 2rem; font-weight: bold; margin-bottom: 32px; text-align: center; }
.form-group { margin-bottom: 24px; width: 100%; display: flex; flex-direction: column; align-items: flex-start; }
label { font-weight: 600; margin-bottom: 8px; }
input, select { width: 100%; padding: 10px 12px; border-radius: 8px; border: 2px solid var(--color-border); font-size: 1rem; background: var(--color-background-mute); color: var(--color-text); box-shadow: 2px 2px 0 #000; }
.login-btn { width: 100%; padding: 12px 0; font-size: 1.1rem; font-weight: bold; background: inherit; color: inherit; border: 3px solid #000; box-shadow: 4px 4px 0 #000; border-radius: 8px; cursor: pointer; transition: background 0.3s, color 0.3s; }
.error { color: #fff; background: #c00; padding: 8px 16px; margin-top: 24px; border: 3px solid #000; box-shadow: 4px 4px 0 #000; text-align: center; }
.loading-msg { color: #333; background: #ffe; padding: 8px 16px; margin-top: 24px; border: 2px solid #aaa; box-shadow: 2px 2px 0 #000; text-align: center; }
.theme-btn, .admin-btn { padding: 8px 20px; font-weight: bold; background: inherit; color: inherit; border: 3px solid #000; box-shadow: 4px 4px 0 #000; border-radius: 6px; cursor: pointer; }
.admin-btn { margin-left: 12px; background: #181818; color: #fff; }
</style>
