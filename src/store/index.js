import { createStore } from 'vuex'

export default createStore({
  state: {
    isAuthenticated: false,
    localIpAddress: ''
  },

  getters: {
    getAuthenticated: (state) => state.isAuthenticated,
  },

  mutations: {
  },

  actions: {
  },
  
  modules: {
  }
})
