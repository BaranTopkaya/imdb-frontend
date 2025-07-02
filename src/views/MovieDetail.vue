<template>
  <div v-if="movie" class="movie-detail">
    <div class="header">
      <h1>{{ movie.title }}</h1>
      
      <div class="stats-container">
        <!-- IMDb Rating Bloğu -->
        <div class="stat-block imdb-rating" @click="goToComments" title="Yorumları gör">
          <span class="stat-label">IMDb RATING</span>
          <div class="stat-content">
            <svg class="icon-svg star-icon" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            <span class="rating-score"><strong>{{ movie.rating }}</strong>/10</span>
            <span class="vote-count">58K</span>
          </div>
        </div>

        <!-- Your Rating Bloğu -->
        <div class="stat-block user-rating" @click="toggleRateForm" title="Puan ver">
          <span class="stat-label">YOUR RATING</span>
          <div class="stat-content">
            <svg class="icon-svg rate-icon" viewBox="0 0 24 24"><path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/></svg>
            <span class="rate-text">Rate</span>
          </div>
        </div>

        <!-- GÜNCELLENMİŞ Popularity Bloğu -->
        <div class="stat-block popularity-metric">
          <span class="stat-label">POPULARITY</span>
          <div class="stat-content">
            <span class="popularity-score"><strong>{{ movie.popularity }}</strong></span>
            <!-- Sadece ok sembolü ve gelen veri -->
            <span class="popularity-arrow">▾</span> 
          </div>
        </div>
      </div>
    </div>

    <!-- Puanlama Formu (Değişiklik yok) -->
    <div v-if="showRateForm" class="rate-form">
      <h3>Rate and Comment</h3>
      <label>
        Rating (1-10):
        <input type="number" min="1" max="10" v-model.number="userRating" />
      </label>
      <label>
        Comment:
        <textarea v-model="userComment" rows="4"></textarea>
      </label>
      <button @click="submitRating">Submit</button>
      <button @click="toggleRateForm" class="cancel-button">Cancel</button>
    </div>

    <div class="content">
      <img :src="movie.posterUrl" alt="Poster" class="poster" />
      <iframe
        v-if="movie.trailerUrl"
        :src="movie.trailerUrl.replace('watch?v=', 'embed/')"
        title="Trailer"
        frameborder="0"
        allowfullscreen
        class="trailer"
      ></iframe>
    </div>

    <p><strong>Özet:</strong> {{ movie.summary }}</p>
    <p><strong>Oyuncular:</strong> {{ movie.actors.join(", ") }}</p>
    <p><strong>Vizyon Tarihi:</strong> {{ movie.releaseDate }}</p>
  </div>

  <div v-else>
    <p>Yükleniyor...</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const movie = ref(null);

const showRateForm = ref(false);
const userRating = ref(5);
const userComment = ref("");

const goToComments = () => {
  router.push(`/movie/${route.params.id}/comments`);
};

const toggleRateForm = () => {
  showRateForm.value = !showRateForm.value;
};

const submitRating = async () => {
  if (userRating.value < 1 || userRating.value > 10) {
    alert("Rating must be between 1 and 10");
    return;
  }
  try {
    const payload = {
      userId: 1, 
      rating: userRating.value,
      comment: userComment.value,
    };
    await axios.post(`https://imdb-backend-4ofp.onrender.com/comments/${route.params.id}/rate`, payload);
    alert("Rating and comment submitted!");
    toggleRateForm();
  } catch (error) {
    console.error("Error submitting rating:", error);
    alert("Error submitting rating");
  }
};

onMounted(async () => {
  try {
    const res = await axios.get(`https://imdb-backend-4ofp.onrender.com/movies/id/${route.params.id}`);
    movie.value = res.data;
  } catch (error) {
    console.error("Film çekme hatası:", error);
  }
});
</script>

<style scoped>
.movie-detail {
  max-width: 1100px;
  margin: 2rem auto;
  padding: 1rem;
  color: #fff;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

h1 {
  margin: 0;
  font-size: 2.5rem;
}

.stats-container {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.stat-block {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.75rem;
  font-weight: bold;
  color: #a0a0a0;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-svg {
  width: 24px;
  height: 24px;
}

.star-icon { fill: #f5c518; }
.rate-icon { fill: #5799ef; }

.rating-score, .popularity-score {
  font-size: 1.2rem;
  font-weight: bold;
}
.rating-score strong, .popularity-score strong {
  font-size: 1.5rem;
}

.vote-count {
  font-size: 0.9rem;
  color: #ccc;
}

.rate-text {
  font-size: 1.2rem;
  color: #5799ef;
  font-weight: bold;
}

/* GÜNCELLENMİŞ POPULARITY STİLİ */
.popularity-arrow {
  font-size: 1.2rem;
  color: #e53935; /* Ok rengi */
}

.imdb-rating, .user-rating {
  cursor: pointer;
}

.rate-form {
  margin: 1rem 0;
  padding: 1.5rem;
  border: 1px solid #444;
  border-radius: 8px;
  background-color: #2c2c2c;
}
.rate-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
}
.rate-form input[type="number"],
.rate-form textarea {
  width: 100%;
  padding: 0.5rem;
  margin-top: 0.25rem;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #555;
  background-color: #333;
  color: #fff;
  font-size: 1rem;
}
.rate-form button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
}
.rate-form button.cancel-button {
  background-color: #6c757d;
  color: #fff;
  margin-left: 0.5rem;
}
.rate-form button:not(.cancel-button) {
  background-color: #28a745;
  color: white;
}

.content {
  display: flex;
  gap: 1.5rem;
  margin: 2rem 0;
}

.poster {
  width: 300px;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  flex-shrink: 0;
}

.trailer {
  flex-grow: 1;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  border: none;
}
</style>