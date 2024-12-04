<template>
  <div class="container mx-auto p-6">
    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">Error: </strong>
      <span class="block sm:inline">{{ error }}</span>
    </div>

    <div v-if="tokenData" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
      <h2 class="text-xl font-bold mb-4">Instagram Access Token Details</h2>
      
      <div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">User ID</label>
        <div class="flex items-center">
          <input 
            type="text" 
            :value="tokenData.user_id" 
            readonly 
            class="flex-grow p-2 border rounded mr-4"
            ref="userIdInput"
          />
          <button 
            @click="copyUserId" 
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {{ userIdCopied ? 'Copied!' : 'Copy User ID' }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-gray-700 text-sm font-bold mb-2">Long-Lived Access Token</label>
        <div class="flex items-center">
          <input 
            type="text" 
            :value="tokenData.long_lived_token" 
            readonly 
            class="flex-grow p-2 border rounded mr-4"
            ref="tokenInput"
          />
          <button 
            @click="copyToken" 
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            {{ tokenCopied ? 'Copied!' : 'Copy Token' }}
          </button>
        </div>
        <p class="mt-2 text-sm text-gray-600">
          Token expires in {{ tokenData.expires_in }} seconds
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const error = ref(null)
const tokenData = ref(null)
const tokenCopied = ref(false)
const userIdCopied = ref(false)
const tokenInput = ref(null)
const userIdInput = ref(null)

const copyToken = () => {
  if (tokenInput.value) {
    tokenInput.value.select()
    navigator.clipboard.writeText(tokenData.value.long_lived_token)
    tokenCopied.value = true
    setTimeout(() => {
      tokenCopied.value = false
    }, 2000)
  }
}

const copyUserId = () => {
  if (userIdInput.value) {
    userIdInput.value.select()
    navigator.clipboard.writeText(tokenData.value.user_id)
    userIdCopied.value = true
    setTimeout(() => {
      userIdCopied.value = false
    }, 2000)
  }
}

onMounted(async () => {
  const urlParams = new URLSearchParams(window.location.search)
  
  // Check for error parameters first
  if (urlParams.get('error')) {
    error.value = urlParams.get('error_description') || 'Authentication failed'
    return
  }

  // Extract authorization code
  const code = urlParams.get('code')
  if (!code) {
    error.value = 'No authorization code found'
    return
  }

  try {
    // Step 1: Exchange code for short-lived token
    const shortLivedTokenResponse = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.VITE_INSTAGRAM_APP_ID,
        client_secret: process.env.VITE_INSTAGRAM_APP_SECRET,
        grant_type: 'authorization_code',
        redirect_uri: process.env.VITE_INSTAGRAM_REDIRECT_URI,
        code: code
      })
    })

    const shortLivedTokenData = await shortLivedTokenResponse.json()

    // Step 2: Exchange short-lived token for long-lived token
    const longLivedTokenResponse = await fetch(`https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${process.env.VITE_INSTAGRAM_APP_SECRET}&access_token=${shortLivedTokenData.access_token}`, {
      method: 'GET'
    })

    const longLivedTokenData = await longLivedTokenResponse.json()

    // Combine and store token data
    tokenData.value = {
      user_id: shortLivedTokenData.user_id,
      long_lived_token: longLivedTokenData.access_token,
      expires_in: longLivedTokenData.expires_in
    }
  } catch (err) {
    error.value = 'Failed to exchange tokens: ' + err.message
  }
})
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
</style>