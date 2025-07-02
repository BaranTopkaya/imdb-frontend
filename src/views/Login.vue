<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Giriş Yap</h2>
      <form @submit.prevent="login">
        
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" v-model="email" required />
        </div>
        
        <div class="form-group">
          <label for="password">Şifre</label>
          <input id="password" type="password" v-model="password" required />
        </div>
        
        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap' }}
        </button>

      </form>
      <p class="auth-switch">
        Hesabın yok mu? <router-link to="/register">Kayıt Ol</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const isLoading = ref(false);

const login = async () => {
  isLoading.value = true;
  try {
    const response = await axios.post('https://imdb-backend-4ofp.onrender.com/auth/login', {
      email: email.value,
      password: password.value,
    });
    
    // Pinia store'a kullanıcı bilgilerini kaydet
    authStore.setUser(response.data);
    
    // Ana sayfaya yönlendir
    router.push('/');
  } catch (error) {
    console.error('Giriş hatası:', error);
    alert('Giriş başarısız: ' + (error.response?.data?.message || 'Email veya şifre hatalı.'));
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Stiller Register.vue ile aynı, tutarlılık için kopyalandı */
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 2rem;
  box-sizing: border-box;
}

.auth-card {
  width: 100%;
  max-width: 400px; /* Login kartı biraz daha dar olabilir */
  padding: 2rem;
  background-color: var(--color-background-soft);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
  color: var(--color-heading);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #1e90ff;
}

.submit-btn {
  width: 100%;
  padding: 0.85rem;
  border: none;
  background-color: #1e90ff;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.submit-btn:hover:not(:disabled) {
  background-color: #0073e6;
}

.submit-btn:disabled {
  background-color: #555;
  cursor: not-allowed;
}

.auth-switch {
  margin-top: 1.5rem;
  text-align: center;
  color: var(--color-text-mute);
}

.auth-switch a {
  color: #1e90ff;
  font-weight: bold;
  text-decoration: none;
}
</style>