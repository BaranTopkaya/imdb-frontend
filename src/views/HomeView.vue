<template>
  <div class="home">
    <!-- YENİ YAPI 1: Header bar artık tam genişlikte, İÇERİĞİ ortalanıyor -->
    <header class="header-bar">
      <div class="header-content">
        <a href="/" class="logo-box">IMDb</a>

        <!-- Arama Grubu -->
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

        <!-- Diğer Header Elemanları -->
        <div class="header-actions">
          <select v-model="locale" class="language-switcher">
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
          </select>
          <button
            class="watchlist-button"
            @click="toggleWatchlist"
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

    <!-- YENİ YAPI 2: Film listesi artık doğrudan ana gövdede yer alıyor -->
    <div class="movie-carousel-container">
      <!-- Film Listesi -->
      <div class="movie-list">
        <div v-for="movie in movies" :key="movie.id" class="movie-card">
          <router-link :to="`/movie/${movie.id}`" class="movie-link">
            <img :src="movie.posterUrl" alt="Poster" />
            <h3>{{ movie.title }} ({{ movie.releaseDate }})</h3>
          </router-link>
          <p>{{ t('rating') }}: {{ movie.rating }} | {{ t('popularity') }}: {{ movie.popularity }}</p>
          
          <div class="buttons">
            <button @click="addToWatchlist(movie.id)">{{ t('addToWatchlist') }}</button>
            <button @click="openTrailer(movie.trailerUrl)">{{ t('trailer') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Watchlist Overlay'i (Değişiklik yok) -->
    <div v-if="showWatchlist" class="watchlist-overlay">
      <h2>{{ t('watchlist') }}</h2>
      <div class="movie-list overlay-movie-list">
        <div v-for="movie in watchlistMovies" :key="movie.id" class="movie-card">
          <router-link :to="`/movie/${movie.id}`" class="movie-link">
            <img :src="movie.posterUrl" alt="Poster" />
            <h3>{{ movie.title }} ({{ movie.releaseDate }})</h3>
          </router-link>
          <p>{{ t('rating') }}: {{ movie.rating }} | {{ t('popularity') }}: {{ movie.popularity }}</p>
        </div>
      </div>
      <button @click="showWatchlist = false">{{ t('close') }}</button>
    </div>
  </div>
</template>

<script setup>
// Script bölümünde değişiklik yok.
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()
const auth = useAuthStore()
const router = useRouter()

const movies = ref([])
const watchlist = ref([])
const showWatchlist = ref(false)
const searchQuery = ref('')
const selectedFilter = ref('all')
let initialMovies = []
let debounceTimer = null

const user = computed(() => auth.user)

const watchlistMovies = computed(() =>
  initialMovies.filter(m => watchlist.value.includes(m.id))
)

const performSearch = async () => {
  if (!searchQuery.value.trim()) {
    movies.value = initialMovies
    return
  }
  try {
    const response = await axios.get('https://imdb-backend-4ofp.onrender.com/movies/search', {
      params: {
        filter: selectedFilter.value,
        query: searchQuery.value,
      },
    })
    movies.value = response.data
  } catch (error) {
    console.error('Arama hatası:', error)
    movies.value = []
  }
}

const debouncedSearch = () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    performSearch()
  }, 300)
}

onMounted(async () => {
  try {
    const res = await axios.get('https://imdb-backend-4ofp.onrender.com/movies/getAll')
    movies.value = res.data
    initialMovies = res.data
  } catch (error) {
    console.error('Filmler çekilemedi:', error)
  }
  if (user.value) {
    fetchWatchlist()
  }
})

const addToWatchlist = async (movieId) => {
  if (!user.value) {
    alert(t('pleaseLoginFirst'))
    return
  }
  try {
    await axios.post(`https://imdb-backend-4ofp.onrender.com/users/${user.value.id}/watchlist/${movieId}`)
    if (!watchlist.value.includes(movieId)) {
      watchlist.value.push(movieId)
    }
    alert(t('addedToWatchlist'))
  } catch (error) {
    alert(t('errorAddingToWatchlist'))
    console.error(error)
  }
}

const fetchWatchlist = async () => {
  if (!user.value) return
  try {
    const res = await axios.get(`https://imdb-backend-4ofp.onrender.com/users/${user.value.id}/watchlist`)
    watchlist.value = res.data.map(m => m.id)
  } catch (error) {
    console.error('Watchlist çekme hatası', error)
  }
}

const toggleWatchlist = async () => {
  if (!user.value) {
    alert(t('pleaseLoginFirst'))
    return
  }
  if (!showWatchlist.value) {
    await fetchWatchlist()
  }
  showWatchlist.value = !showWatchlist.value
}

const openTrailer = (url) => {
  window.open(url, '_blank')
}

const goLogin = () => {
  if (!user.value) {
    router.push('/login')
  }
}
</script>

<style scoped>
/* YENİ STİLLER: Daha temiz ve tam genişlikli bir düzen için */

/* Bu, padding ve border'ın genişliği etkilemesini önleyen temel bir kuraldır */
* {
  box-sizing: border-box;
}

.home {
  width: 100%;
  background-color: var(--color-background);
}

/* HEADER DÜZENLEMELERİ */
.header-bar {
  width: 100%; /* Arka planın tam genişlikte olmasını sağlar */
  background-color: #212121; /* Header arka plan rengi */
  padding: 1rem 0;
  border-bottom: 1px solid #333;
}

.header-content {
  width: 100%;
  max-width: 1400px; /* İçeriğin maksimum genişliği */
  margin: 0 auto; /* İçeriği yatayda ortalar */
  padding: 0 2rem; /* İçeriğin ekran kenarlarına yapışmasını önler */
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.logo-box {
  background-color: #f5c518;
  color: #000;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  white-space: nowrap;
  flex-shrink: 0; /* Daralmasını engelle */
}

.search-group {
  display: flex;
  flex-grow: 1; /* Arama çubuğunun kalan boşluğu doldurmasını sağlar */
  max-width: 600px;
}
.search-filter {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-right: none;
  border-radius: 6px 0 0 6px;
  background-color: #f0f0f0;
  cursor: pointer;
}
.search-input {
  flex-grow: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 0 6px 6px 0;
}
.search-input:focus, .search-filter:focus {
  outline: none;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0; /* Daralmasını engelle */
}

.language-switcher {
  padding: 0.5rem;
  border-radius: 6px;
  background-color: #333;
  color: white;
  border: 1px solid #555;
  cursor: pointer;
}
.watchlist-button, .login-button {
  border: none;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  white-space: nowrap;
}
.watchlist-button { background-color: #ff6347; }
.login-button { background-color: #1e90ff; }
.watchlist-button:disabled, .login-button:disabled { opacity: 0.5; cursor: not-allowed; }

/* FİLM LİSTESİ DÜZENLEMELERİ */
.movie-carousel-container {
  width: 100%;
  margin-top: 2rem; /* Header ile arasına boşluk koyar */
}

.movie-list {
  display: flex;
  flex-wrap: nowrap;
  gap: 1rem;
  overflow-x: auto;
  padding: 0 2rem 1.5rem 2rem; /* Sol-sağ boşlukları header ile hizalar, altta da boşluk bırakır */
  scrollbar-width: thin; /* Firefox için scrollbar */
  scrollbar-color: #555 #333; /* Firefox için scrollbar rengi */
}
/* Webkit tarayıcıları için scrollbar stili */
.movie-list::-webkit-scrollbar {
  height: 8px;
}
.movie-list::-webkit-scrollbar-track {
  background: #333;
}
.movie-list::-webkit-scrollbar-thumb {
  background-color: #555;
  border-radius: 10px;
}


.movie-card {
  background-color: var(--color-background-mute);
  color: var(--color-text);
  border-radius: 8px;
  padding: 1rem;
  width: 200px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-height: 400px;
}
.movie-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  color: inherit;
}
.movie-card img {
  max-width: 100%;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  height: 280px; /* Posterlerin aynı boyda olmasını sağlar */
  object-fit: cover;
}
.movie-card h3 {
  margin: 0.3rem 0 1rem 0;
  font-size: 1.1rem;
  text-align: center;
}
.movie-card p {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  text-align: center;
}
.buttons {
  margin-top: auto;
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.buttons button {
  flex: 1;
  padding: 0.5rem 0;
  margin: 0 0.15rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
.buttons button:first-of-type {
  background-color: #ff6347;
  color: white;
}
.buttons button:last-of-type {
  background-color: #1e90ff;
  color: white;
}
.watchlist-overlay {
  position: fixed;
  top: 5rem;
  left: 5%;
  right: 5%;
  bottom: 5rem;
  background-color: var(--color-background-mute);
  border-radius: 12px;
  padding: 1rem;
  overflow-y: auto;
  box-shadow: 0 0 10px rgba(0,0,0,0.7);
  z-index: 1000;
}
.watchlist-overlay h2 {
  margin-top: 0;
  text-align: center;
}
.watchlist-overlay .overlay-movie-list {
  margin-top: 1rem;
  overflow-x: unset;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0; /* Overlay içindeki padding'i sıfırla */
}
.watchlist-overlay button {
  display: block;
  margin: 1rem auto 0 auto;
  background-color: #ff6347;
  border: none;
  color: white;
  padding: 0.5rem 2rem;
  border-radius: 6px;
  cursor: pointer;
}
</style>