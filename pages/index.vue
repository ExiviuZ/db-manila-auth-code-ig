<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md bg-white shadow-2xl rounded-2xl overflow-hidden">
      <div 
        v-if="error" 
        class="bg-red-500 text-white px-6 py-4 flex items-center space-x-4"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p class="font-bold">Authentication Error</p>
          <p class="text-sm opacity-75">{{ error }}</p>
        </div>
      </div>

      <div v-if="code" class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-800">Instagram Auth Code</h2>
          <div 
            class="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-semibold"
          >
            Active
          </div>
        </div>

        <div class="bg-gray-100 rounded-lg p-4 mb-4 flex items-center space-x-4">
          <input 
            type="text" 
            :value="code" 
            readonly 
            class="flex-grow bg-transparent text-gray-700 font-mono tracking-wider"
          />
          <button 
            @click="copyCode" 
            class="transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none"
          >
            <svg 
              v-if="!codeCopied" 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-6 w-6 text-blue-500 hover:text-blue-600" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span 
              v-else 
              class="text-green-500 font-bold text-sm"
            >
              Copied!
            </span>
          </button>
        </div>

        <div class="flex items-center justify-between bg-gray-50 rounded-lg p-3">
          <div class="flex items-center space-x-2">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-5 w-5 text-orange-500" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            <span class="text-gray-600 font-medium">Will Expire In</span>
          </div>
          <span 
            :class="{
              'text-red-500': timeRemaining <= 300, 
              'text-yellow-500': timeRemaining <= 600 && timeRemaining > 300,
              'text-green-500': timeRemaining > 600
            }"
            class="font-bold"
          >
            {{ formattedTimeRemaining }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

const code = ref(null)
const error = ref(null)
const codeCopied = ref(false)
const timeRemaining = ref(3600) // 1 hour = 3600 seconds

const route = useRoute()

const formattedTimeRemaining = computed(() => {
  const minutes = Math.floor(timeRemaining.value / 60)
  const seconds = timeRemaining.value % 60
  return `${minutes}m ${seconds < 10 ? '0' : ''}${seconds}s`
})

const copyCode = () => {
  navigator.clipboard.writeText(code.value)
  codeCopied.value = true
  setTimeout(() => { codeCopied.value = false }, 2000)
}

onMounted(() => {
  if (route.query.error) {
    error.value = route.query.error_description || 'Authentication failed'
    return
  }

  code.value = route.query.code
  
  if (!code.value) {
    error.value = 'No authorization code found'
    return
  }

  // Start countdown
  const countdown = setInterval(() => {
    timeRemaining.value--
    
    if (timeRemaining.value <= 0) {
      clearInterval(countdown)
      code.value = null
      error.value = 'Authorization code has expired'
    }
  }, 1000)

  // Clean up interval on component unmount
  return () => clearInterval(countdown)
})
</script>