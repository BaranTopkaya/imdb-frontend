import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.user,
    userId: (state) => state.user?.id || null,
  },
  actions: {
    setUser(userDto) {
      this.user = userDto
    },
    clearUser() {
      this.user = null
    },
  },
})
