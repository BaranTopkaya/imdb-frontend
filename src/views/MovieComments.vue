<template>
  <div class="ratings-page">
    <h2>User Ratings</h2>

    <!-- ÜLKE FİLTRELERİ -->
    <div class="filter-section">
      <h3>FILTER BY COUNTRY</h3>
      <div class="country-filters">
        <button
          @click="selectCountry('All')"
          :class="{ active: selectedCountry === 'All' }"
        >
          All
        </button>
        <button
          v-for="country in countries"
          :key="country"
          @click="selectCountry(country)"
          :class="{ active: selectedCountry === country }"
        >
          {{ country }}
        </button>
      </div>
    </div>

    <!-- OY DAĞILIMI GRAFİĞİ -->
    <div class="ratings-chart">
      <div v-for="rating in [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]" :key="rating" class="rating-row">
        <span class="rating-label">{{ rating }}</span>
        <div class="bar-container">
          <div 
            class="bar" 
            :style="{ width: ratingStats[rating] ? ratingStats[rating].percentage + '%' : '0%' }"
          ></div>
        </div>
        <span v-if="ratingStats[rating]" class="rating-text">
          {{ ratingStats[rating].percentage.toFixed(1) }}% ({{ ratingStats[rating].count }})
        </span>
      </div>
    </div>

    <!-- YORUM EKLEME FORMU -->
    <div class="rate-section">
       <button v-if="!showRateForm" @click="handleRateClick" class="rate-btn">
        Rate this movie
      </button>

      <div v-if="showRateForm" class="rate-form">
        <h3>Your Rating</h3>
        <label>
          Rating (1-10):
          <input type="number" v-model.number="userRating" min="1" max="10" />
        </label>
        <label>
          Comment:
          <textarea v-model="userComment" rows="4" placeholder="Add your review..."></textarea>
        </label>
        <div class="form-buttons">
          <button @click="submitRating" class="submit-btn">Submit</button>
          <button @click="toggleRateForm" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>

    <!-- YORUM LİSTESİ -->
    <div class="reviews-section">
      <h3>Reviews</h3>
      <div v-if="filteredComments.length === 0">No reviews for this selection.</div>
      <ul v-else class="comment-list">
        <li v-for="comment in filteredComments" :key="comment.id" class="comment-item">
          <div class="comment-rating">
            <span class="star">★</span>
            <span><strong>{{ comment.rating }}</strong>/10</span>
          </div>
          <div class="comment-content">
            <h4 class="comment-title">Review by {{ comment.userName }} ({{ comment.country }})</h4>
            <p>{{ comment.content }}</p>
            <small>{{ new Date(comment.createdAt).toLocaleDateString() }}</small>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const auth = useAuthStore()

// --- State ---
const comments = ref([])
const selectedCountry = ref('All')
const showRateForm = ref(false)
const userRating = ref(null)
const userComment = ref('')

// --- Computed Properties ---

// Yorumlardan benzersiz ülke listesi oluştur
const countries = computed(() => {
  if (!comments.value) return []
  const countrySet = new Set(comments.value.map(c => c.country))
  return Array.from(countrySet)
})

// Seçili ülkeye göre yorumları filtrele
const filteredComments = computed(() => {
  if (selectedCountry.value === 'All') {
    return comments.value
  }
  return comments.value.filter(c => c.country === selectedCountry.value)
})

// Filtrelenmiş yorumlara göre oy istatistiklerini hesapla
const ratingStats = computed(() => {
  const stats = {}
  // 1'den 10'a kadar tüm oylar için başlangıç değeri ata
  for (let i = 1; i <= 10; i++) {
    stats[i] = { count: 0, percentage: 0 }
  }

  const totalVotes = filteredComments.value.length
  if (totalVotes === 0) return stats

  // Oyları say
  for (const comment of filteredComments.value) {
    if (stats[comment.rating]) {
      stats[comment.rating].count++
    }
  }

  // Yüzdeleri hesapla
  for (let i = 1; i <= 10; i++) {
    stats[i].percentage = (stats[i].count / totalVotes) * 100
  }

  return stats
})

// --- Methods ---

const fetchComments = async () => {
  try {
    const res = await axios.get(`https://imdb-backend-4ofp.onrender.com/comments/${route.params.id}`)
    // Yorumları en yeniden en eskiye sırala
    comments.value = res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error('Yorumlar alınamadı:', error)
  }
}

const selectCountry = (country) => {
  selectedCountry.value = country
}

const toggleRateForm = () => {
  showRateForm.value = !showRateForm.value
}

const handleRateClick = () => {
  if (!auth.user) {
    alert('Lütfen önce giriş yapınız!')
    return
  }
  toggleRateForm()
}

const submitRating = async () => {
  if (!auth.user) {
    alert('Lütfen önce giriş yapınız!')
    return
  }

  if (!userRating.value || userRating.value < 1 || userRating.value > 10) {
    alert('Lütfen 1 ile 10 arasında bir puan verin.')
    return
  }

  try {
    await axios.post(`https://imdb-backend-4ofp.onrender.com/comments/${route.params.id}/rate`, {
      userId: auth.user.id,
      rating: userRating.value,
      comment: userComment.value
    })
    alert('Oy ve yorum gönderildi!')
    userRating.value = null
    userComment.value = ''
    toggleRateForm()
    fetchComments() // Listeyi ve grafiği yenilemek için yorumları tekrar çek
  } catch (error) {
    console.error('Gönderme hatası:', error)
    alert('Gönderirken hata oluştu.')
  }
}

onMounted(() => {
  fetchComments()
})
</script>

<!-- MovieComments.vue dosyasının <template> ve <script> kısmı aynı kalacak -->

<style scoped>
.ratings-page {
  /* max-width: 960px; yerine %100 kullanmak daha esnek olabilir. 
     Böylece App.vue'deki main ne kadar genişse o kadar yer kaplar. */
  max-width: 100%; 
  margin: 0 auto; /* Zaten App.vue'deki main ortaladığı için bu gereksiz bile olabilir */
  padding: 1rem;
  font-family: Arial, sans-serif;
}

h2, h3 {
  margin-top: 0;
  border-bottom: 1px solid var(--color-border);
  padding-bottom: 0.5rem;
  margin-bottom: 1rem;
}

/* Ülke Filtreleri */
.filter-section h3 {
  font-size: 0.8rem;
  color: #555;
  border: none;
  margin-bottom: 0.5rem;
}
.country-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
}
.country-filters button {
  background: none;
  border: 1px solid #ccc;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
}
.country-filters button:hover {
  border-color: #333;
}
.country-filters button.active {
  background-color: #333;
  color: white;
  border-color: #333;
}

/* Oy Grafiği */
.ratings-chart {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 2.5rem;
}
.rating-row {
  display: grid;
  grid-template-columns: 30px 1fr auto;
  gap: 1rem;
  align-items: center;
  font-size: 0.9rem;
}
.rating-label {
  font-weight: bold;
  text-align: right;
}
.bar-container {
  background-color: #f0f0f0;
  border-radius: 4px;
  height: 20px;
}
.bar {
  background-color: #f5c518;
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease-in-out;
}
.rating-text {
  color: #555;
}

/* Yorum Ekleme Formu */
.rate-section {
  margin-bottom: 2rem;
}
.rate-btn {
  background-color: #1e90ff;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}
.rate-form {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}
.rate-form label { display: block; margin-bottom: 1rem; }
.rate-form input, .rate-form textarea {
  width: 100%;
  box-sizing: border-box;
  margin-top: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}
.form-buttons button { margin-top: 1rem; }
.submit-btn { background-color: #28a745; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }
.cancel-btn { background-color: #ccc; margin-left: 0.5rem; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; }

/* Yorum Listesi */
.comment-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.comment-item {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}
.comment-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 1rem;
}
.comment-rating .star {
  color: #f5c518;
  font-size: 1.2rem;
}
.comment-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
}
.comment-content p {
  margin: 0 0 0.5rem 0;
  line-height: 1.5;
}
.comment-content small {
  color: #777;
}
</style>