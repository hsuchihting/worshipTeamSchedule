<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- 頁首 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">敬拜團班表</h1>
        <div class="flex items-center gap-3">
          <NuxtLink to="/members" class="text-sm text-indigo-600 hover:underline">成員名單</NuxtLink>
          <span v-if="userProfile" class="text-sm text-gray-600">
            {{ userProfile.displayName }}
            <span v-if="userProfile.isAdmin" class="ml-1 text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">管理員</span>
          </span>
          <button
            v-if="currentUser"
            class="text-sm text-red-500 hover:underline"
            @click="logout"
          >
            登出
          </button>
          <button
            v-else
            class="text-sm bg-indigo-600 text-white px-3 py-1 rounded-lg hover:bg-indigo-700"
            @click="handleLogin"
          >
            Google 登入
          </button>
        </div>
      </div>

      <!-- 未登入提示 -->
      <div v-if="!currentUser && !loading" class="text-center py-20 text-gray-400">
        <p class="text-lg">請先登入以查看班表</p>
      </div>

      <!-- 未完成個人設定 -->
      <div v-else-if="currentUser && userProfile && !userProfile.role" class="text-center py-10">
        <p class="text-gray-600 mb-3">請先完成個人設定</p>
        <NuxtLink to="/setup" class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          前往設定
        </NuxtLink>
      </div>

      <!-- 行事曆 -->
      <div v-else-if="currentUser">
        <CalendarMain
          :is-admin="userProfile?.isAdmin ?? false"
          :schedules="schedules"
          :available-dates="availableDates"
          @day-click="handleDayClick"
        />
      </div>

      <!-- 排班編輯 Modal (管理員) -->
      <ScheduleModal
        v-if="showModal && selectedDate && userProfile?.isAdmin"
        :date-str="selectedDateStr"
        :all-members="allMembers"
        :initial-lineup="selectedSchedule?.lineup ?? []"
        :has-existing-schedule="!!selectedSchedule"
        @close="showModal = false"
        @save="handleSave"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LineupMember } from '~/types'

const { currentUser, userProfile, loading, loginWithGoogle, logout } = useAuth()
const { schedules, subscribeMonth, getSchedule, saveSchedule, deleteSchedule, toggleAvailability, getAvailability } = useSchedule()
const { members: allMembers, fetchMembers } = useMembers()

const showModal = ref(false)
const selectedDate = ref<Date | null>(null)
const selectedDateStr = ref('')
const selectedSchedule = ref<any>(null)
const availableDates = ref<string[]>([])

const handleLogin = async () => {
  const user = await loginWithGoogle()
  if (user && !userProfile.value?.role) {
    navigateTo('/setup')
  }
}

const handleDayClick = async (date: Date, dateStr: string) => {
  if (!currentUser.value) return

  if (userProfile.value?.isAdmin) {
    selectedDate.value = date
    selectedDateStr.value = dateStr
    selectedSchedule.value = await getSchedule(dateStr)
    showModal.value = true
  } else {
    // 成員切換 available 狀態
    availableDates.value = await toggleAvailability(currentUser.value.uid, dateStr)
  }
}

const handleSave = async (lineup: LineupMember[]) => {
  await saveSchedule(selectedDateStr.value, lineup)
  showModal.value = false
}

const handleDelete = async () => {
  await deleteSchedule(selectedDateStr.value)
  showModal.value = false
}

onMounted(async () => {
  const today = new Date()
  subscribeMonth(today.getFullYear(), today.getMonth() + 1)
  await fetchMembers()

  if (currentUser.value) {
    availableDates.value = await getAvailability(currentUser.value.uid)
  }
})

watch(currentUser, async (user) => {
  if (user) {
    availableDates.value = await getAvailability(user.uid)
  }
})
</script>
