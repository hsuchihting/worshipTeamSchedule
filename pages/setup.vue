<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">身份設定</h1>
      <p class="text-gray-500 text-sm mb-6">請選擇您在敬拜團的角色與樂器</p>

      <!-- 尚未登入 -->
      <div v-if="!currentUser" class="text-center py-8">
        <p class="text-gray-500 mb-4">請先使用 Google 帳號登入</p>
        <button
          class="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium"
          @click="handleLogin"
        >
          Google 登入
        </button>
      </div>

      <!-- 設定表單 -->
      <form v-else @submit.prevent="handleSubmit">
        <!-- 顯示名稱（唯讀） -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">姓名</label>
          <p class="text-gray-800 font-semibold">{{ currentUser.displayName }}</p>
        </div>

        <!-- 角色選擇 -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">角色 *</label>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="r in roles"
              :key="r.value"
              type="button"
              class="py-2 rounded-lg border-2 text-sm font-medium transition"
              :class="
                form.role === r.value
                  ? `${r.activeColor} text-white border-transparent`
                  : 'border-gray-200 text-gray-600 hover:border-gray-300'
              "
              @click="selectRole(r.value)"
            >
              {{ r.label }}
            </button>
          </div>
        </div>

        <!-- 樂器選擇（僅樂手） -->
        <div v-if="form.role === 'Musician'" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">主修樂器 *</label>
          <select
            v-model="form.instrument"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="" disabled>請選擇樂器</option>
            <option v-for="inst in INSTRUMENT_OPTIONS" :key="inst.code" :value="inst.code">
              {{ inst.label }}
            </option>
          </select>
        </div>

        <!-- 預覽標籤 -->
        <div v-if="previewLabel" class="mb-6 p-3 bg-gray-50 rounded-lg flex items-center gap-2">
          <span class="text-sm text-gray-500">標籤預覽：</span>
          <StatusTag :label="previewLabel" :color-class="previewColor" />
        </div>

        <!-- 錯誤提示 -->
        <p v-if="errorMsg" class="text-red-500 text-sm mb-4">{{ errorMsg }}</p>

        <button
          type="submit"
          class="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          :disabled="saving"
        >
          {{ saving ? '儲存中...' : '儲存設定' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { INSTRUMENT_OPTIONS, CORE_INSTRUMENTS } from '~/types'
import type { UserRole, ColorClass } from '~/types'

const { currentUser, userProfile, loginWithGoogle, saveUserProfile } = useAuth()

const form = reactive({
  role: '' as UserRole | '',
  instrument: '',
})

const saving = ref(false)
const errorMsg = ref('')

const roles = [
  { value: 'Vocal', label: '主唱', activeColor: 'bg-orange-500' },
  { value: 'Singer', label: '歌手', activeColor: 'bg-gray-500' },
  { value: 'Musician', label: '樂手', activeColor: 'bg-red-600' },
]

const selectRole = (role: string) => {
  form.role = role as UserRole
  form.instrument = ''
}

const previewColor = computed<ColorClass>(() => {
  if (form.role === 'Vocal') return 'bg-orange-500'
  if (form.role === 'Singer') return 'bg-gray-500'
  if (form.role === 'Musician' && form.instrument) {
    return CORE_INSTRUMENTS.includes(form.instrument as any) ? 'bg-red-600' : 'bg-purple-500'
  }
  return 'bg-gray-500'
})

const previewLabel = computed(() => {
  if (!form.role) return ''
  if (form.role === 'Vocal') return `(Vocal) ${currentUser.value?.displayName ?? ''}`
  if (form.role === 'Singer') return `(Singer) ${currentUser.value?.displayName ?? ''}`
  if (form.role === 'Musician' && form.instrument) {
    return `(${form.instrument}) ${currentUser.value?.displayName ?? ''}`
  }
  return ''
})

const handleLogin = async () => {
  await loginWithGoogle()
}

const handleSubmit = async () => {
  if (!form.role) return (errorMsg.value = '請選擇角色')
  if (form.role === 'Musician' && !form.instrument) return (errorMsg.value = '請選擇樂器')
  if (!currentUser.value) return

  saving.value = true
  errorMsg.value = ''

  try {
    await saveUserProfile({
      uid: currentUser.value.uid,
      displayName: currentUser.value.displayName ?? '',
      email: currentUser.value.email ?? '',
      role: form.role as UserRole,
      instrument: form.role === 'Musician' ? form.instrument : form.role,
      label: previewLabel.value,
      colorClass: previewColor.value,
      isAdmin: userProfile.value?.isAdmin ?? false,
    })
    navigateTo('/')
  } catch (e) {
    errorMsg.value = '儲存失敗，請稍後再試'
  } finally {
    saving.value = false
  }
}

// 預填已有設定
onMounted(() => {
  if (userProfile.value) {
    form.role = userProfile.value.role
    form.instrument = userProfile.value.instrument
  }
})
</script>
