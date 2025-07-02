// src/i18n.js

import { createI18n } from 'vue-i18n'

const messages = {
  tr: {
    login: 'Giriş',
    watchlist: 'İzleme Listesi',
    loginFirst: 'Önce giriş yapmalısın',
    alreadyLoggedIn: 'Zaten giriş yaptınız',
    
    // GÜNCELLENDİ
    searchPlaceholder: 'Film ara...', 

    rating: 'Puan',
    popularity: 'Popülerlik',
    addToWatchlist: '+ İzleme Listesi',
    trailer: 'Fragman',
    close: 'Kapat',
    pleaseLoginFirst: 'Lütfen önce giriş yapın.',
    addedToWatchlist: "İzleme listesine eklendi!",
    errorAddingToWatchlist: "İzleme listesine eklenirken hata oluştu.",
    searchFilterAll: 'Tümü',
    searchFilterTitles: 'Başlıklar',
    searchFilterCelebs: 'Kişiler'
  },
  en: {
    login: 'Login',
    watchlist: 'Watchlist',
    loginFirst: 'You must login first',
    alreadyLoggedIn: 'Already logged in',
    
    // UPDATED
    searchPlaceholder: 'Search a movie...', 

    rating: 'Rating',
    popularity: 'Popularity',
    addToWatchlist: '+ Watchlist',
    trailer: 'Trailer',
    close: 'Close',
    pleaseLoginFirst: 'Please login first.',
    addedToWatchlist: 'Added to watchlist!',
    errorAddingToWatchlist: 'Error adding to watchlist.',
    searchFilterAll: 'All',
    searchFilterTitles: 'Titles',
    searchFilterCelebs: 'Celebs'
  }
}

export default createI18n({
  legacy: false,
  locale: navigator.language.startsWith('tr') ? 'tr' : 'en',
  fallbackLocale: 'en',
  messages
})