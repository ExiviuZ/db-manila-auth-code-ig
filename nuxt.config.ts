// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    public: {
      instagramAppId: process.env.NUXT_INSTAGRAM_APP_ID,
      instagramRedirectUri: process.env.NUXT_INSTAGRAM_REDIRECT_URI
    },
    instagramAppSecret: process.env.NUXT_INSTAGRAM_APP_SECRET
  }
})
