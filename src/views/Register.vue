<template>
  <div class="auth-container">
    <div class="auth-card">
      <h2>Kayıt Ol</h2>
      <form @submit.prevent="register">
        
        <!-- Profil Fotoğrafı Yükleme Alanı -->
        <div class="profile-picture-container">
          <label for="profile-picture-input" class="profile-picture-label">
            <img :src="profilePicturePreview || '/src/assets/default-avatar.png'" alt="Profil Fotoğrafı" class="profile-picture-preview" />
            <span>Fotoğraf Seç</span>
          </label>
          <input 
            id="profile-picture-input" 
            type="file" 
            accept="image/*" 
            @change="handleFileChange"
            style="display: none;"
          />
        </div>

        <!-- İsim Soyisim Alanları -->
        <div class="form-row">
          <div class="form-group">
            <label for="name">Ad</label>
            <input id="name" type="text" v-model="name" required />
          </div>
          <div class="form-group">
            <label for="surname">Soyad</label>
            <input id="surname" type="text" v-model="surname" required />
          </div>
        </div>

        <!-- Email ve Şifre Alanları -->
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Şifre</label>
          <input id="password" type="password" v-model="password" required />
        </div>
        
        <!-- Ülke ve Şehir Alanları -->
        <div class="form-row">
          <div class="form-group">
            <label for="country">Ülke</label>
            <select id="country" v-model="selectedCountry" @change="updateCities" required>
              <option disabled value="">Ülke seçin</option>
              <option v-for="country in countries" :key="country" :value="country">
                {{ country }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="city">Şehir</label>
            <select id="city" v-model="selectedCity" :disabled="!selectedCountry" required>
              <option disabled value="">Şehir seçin</option>
              <option v-for="city in cities" :key="city" :value="city">
                {{ city }}
              </option>
            </select>
          </div>
        </div>
        
        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? 'Kaydediliyor...' : 'Kayıt Ol' }}
        </button>

      </form>
      <p class="auth-switch">
        Hesabın var mı? <router-link to="/login">Giriş Yap</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();

// Form state'leri
const name = ref('');
const surname = ref('');
const email = ref('');
const password = ref('');
const selectedCountry = ref('');
const selectedCity = ref('');
const isLoading = ref(false);

// Profil fotoğrafı state'leri
const profilePictureFile = ref(null);
const profilePicturePreview = ref(null);

// Ülke ve şehir verileri
const countries = ['Türkiye', 'ABD'];
const cityData = {
  'Türkiye': ['İstanbul', 'Ankara', 'İzmir'],
  'ABD': ['New York', 'Los Angeles', 'Chicago']
};
const cities = computed(() => cityData[selectedCountry.value] || []);

// Şehir listesini güncelleme
const updateCities = () => {
  selectedCity.value = '';
};

// Dosya seçildiğinde çalışacak fonksiyon
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    profilePictureFile.value = file;
    // Önizleme için geçici URL oluştur
    profilePicturePreview.value = URL.createObjectURL(file);
  }
};

// Kayıt fonksiyonu
const register = async () => {
  isLoading.value = true;
  let imageUrl = null;

  // 1. Adım: Profil fotoğrafı seçilmişse Imgur'a yükle
  if (profilePictureFile.value) {
    const formData = new FormData();
    formData.append('file', profilePictureFile.value);

    try {
      const response = await axios.post('https://imdb-backend-4ofp.onrender.com/images/upload', formData);
      imageUrl = response.data.imageUrl; // Imgur'dan dönen URL
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      alert('Profil fotoğrafı yüklenirken bir hata oluştu.');
      isLoading.value = false;
      return; // Hata varsa işlemi durdur
    }
  }

  // 2. Adım: Tüm verilerle birlikte kullanıcıyı kaydet
  try {
    const userData = {
      name: name.value,
      surname: surname.value,
      email: email.value,
      password: password.value,
      country: selectedCountry.value,
      city: selectedCity.value,
      imageUrl: imageUrl // Yüklenen resmin URL'i veya null
    };

    await axios.post('https://imdb-backend-4ofp.onrender.com/auth/register', userData);
    
    alert('Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.');
    router.push('/login');
  } catch (error) {
    console.error('Kayıt hatası:', error);
    alert('Kayıt sırasında bir hata oluştu: ' + (error.response?.data || error.message));
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
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
  max-width: 450px;
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

.profile-picture-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

.profile-picture-label {
  position: relative;
  cursor: pointer;
  display: inline-block;
}

.profile-picture-preview {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--color-border);
  transition: filter 0.3s;
}

.profile-picture-label:hover .profile-picture-preview {
  filter: brightness(0.7);
}

.profile-picture-label span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none; /* Yazının tıklamayı engellememesi için */
}

.profile-picture-label:hover span {
  opacity: 1;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
  flex: 1;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--color-text);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  background-color: var(--color-background-mute);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text);
  font-size: 1rem;
}

.form-group input:focus,
.form-group select:focus {
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