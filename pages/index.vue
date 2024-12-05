<template>
  <div class="container mx-auto p-6">
    <div v-if="code" class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
      <h2 class="text-xl font-bold mb-4">Instagram Authorization Code</h2>
      
      <div class="flex items-center">
        <input 
          type="text" 
          :value="code" 
          readonly 
          class="flex-grow p-2 border rounded mr-4"
          ref="codeInput"
        />
        <button 
          @click="copyCode" 
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {{ codeCopied ? 'Copied!' : 'Copy Code' }}
        </button>
      </div>
    </div>
    <div v-else class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
      No authorization code found
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const code = ref(null)
const codeCopied = ref(false)
const codeInput = ref(null)
const route = useRoute()

const copyCode = () => {
  if (codeInput.value) {
    codeInput.value.select()
    navigator.clipboard.writeText(code.value)
    codeCopied.value = true
    setTimeout(() => {
      codeCopied.value = false
    }, 2000)
  }
}

onMounted(() => {
  code.value = route.query.code || null
})
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}
</style>