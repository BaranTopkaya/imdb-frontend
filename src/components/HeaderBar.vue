<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'
// Not: axios burada artık gerekli değil, çünkü watchlist'i HomeView yönetecek.

const { t, locale } = useI18n()
const authStore = useAuthStore()
const router = useRouter()

// Header'a ait state'ler
const searchQuery = ref('')
const selectedFilter = ref('all')
let debounceTimer = null

// Auth'a ait computed property
const user = computed(() => authStore.user)

// ARAMA MANTIĞI: Arama yapıldığında HomeView'a query parametresi ile yönlendirir.
const handleSearch = () => {
  router.push({ name: 'home', query: { filter: selectedFilter.value, q: searchQuery.value } })
}

const debouncedSearch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(handleSearch, 300)
}

// NAVİGASYON
const goLogin = () => {
  if (!user.value) {
    router.push('/login')
  }
}

// Bu bileşen artık dışarıdan bir olay (event) yayarak HomeView'a watchlist'i açmasını söyleyecek.
const emit = defineEmits(['toggle-watchlist'])

function onToggleWatchlist() {
  emit('toggle-watchlist')
}
</script>

<template>
  <header class="header-bar">
    <div class="header-content">
      <router-link to="/" class="logo-box">IMDb</router-link>

      <div class="search-group">
        <select v-model="selectedFilter" class="search-filter" @change="debouncedSearch">
          <option value="all">{{ t('searchFilterAll') }}</option>
          <option value="titles">{{ t('searchFilterTitles') }}</option>
          <option value="celebs">{{ t('searchFilterCelebs') }}</option>
        </select>
        <input 
          v-model="searchQuery" 
          type="text" 
          :placeholder="t('searchPlaceholder')" 
          @input="debouncedSearch" 
          class="search-input"
        />
      </div>

      <div class="header-actions">
        <select v-model="locale" class="language-switcher">
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
        </select>
        <button
          class="watchlist-button"
          @click="onToggleWatchlist"
          :disabled="!user"
          :title="!user ? t('loginFirst') : t('watchlist')"
        >
          {{ t('watchlist') }}
        </button>
        <button
          class="login-button"
          @click="goLogin"
          :disabled="user !== null"
          :title="user ? t('alreadyLoggedIn') : t('login')"
        >
          {{ user ? user.name : t('login') }}
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Header Stilleri - Değişiklik yok */
.header-bar { width: 100%; background-color: #1f1f1f; padding: 1rem 2rem; border-bottom: 1px solid #333; }
.header-content { display: flex; align-items: center; gap: 1.5rem; max-width: 1400px; margin: 0 auto; }
.logo-box { background-color: #f5c518; color: #000; padding: 0.5rem 1rem; border-radius: 6px; text-decoration: none; font-weight: bold; }
.search-group { display: flex; flex-grow: 1; max-width: 600px; }
.search-filter { padding: 0.7rem; border: none; border-radius: 6px 0 0 6px; background-color: #f0f0f0; }
.search-input { flex-grow: 1; padding: 0.7rem; border: none; border-radius: 0 6px 6px 0; }
.header-actions { display: flex; align-items: center; gap: 1rem; }
.language-switcher, .watchlist-button, .login-button { border: none; color: white; padding: 0.7rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
.language-switcher { background-color: #333; border: 1px solid #555; }
.watchlist-button { background-color: #e57373; }
.login-button { background-color: #0073e6; }
.watchlist-button:disabled, .login-button:disabled { opacity: 0.5; cursor: not-allowed; }
</style>