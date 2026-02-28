<template>
  <!-- 背景遮罩 -->
  <div
    class="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4"
    @click.self="$emit('close')"
  >
    <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-50">
      <div class="p-6">
        <!-- 標題 -->
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-800">
            {{ dateStr }} 排班
          </h3>
          <button class="text-gray-400 hover:text-gray-600 text-2xl" @click="$emit('close')">
            ✕
          </button>
        </div>

        <!-- 錯誤提示 -->
        <div v-if="errors.length" class="mb-4 p-3 bg-red-50 rounded-lg">
          <p v-for="err in errors" :key="err" class="text-red-600 text-sm">⚠ {{ err }}</p>
        </div>

        <!-- 已選陣容 -->
        <div class="mb-4">
          <h4 class="font-semibold text-gray-600 mb-2">目前陣容 ({{ selectedLineup.length }} 人)</h4>
          <div v-if="selectedLineup.length === 0" class="text-gray-400 text-sm">尚未選擇成員</div>
          <div class="space-y-1">
            <div
              v-for="member in selectedLineup"
              :key="member.uid"
              class="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <StatusTag :label="member.label" :color-class="member.color" />
              <span class="text-sm text-gray-700 flex-1 ml-2">{{ member.name }}</span>
              <button
                class="text-red-400 hover:text-red-600 text-xs"
                @click="removeMember(member.uid)"
              >
                移除
              </button>
            </div>
          </div>
        </div>

        <!-- 可加入成員 -->
        <div class="mb-6">
          <h4 class="font-semibold text-gray-600 mb-2">可加入成員</h4>
          <div class="space-y-1 max-h-48 overflow-y-auto">
            <div
              v-for="member in availableMembers"
              :key="member.uid"
              class="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              :class="{ 'opacity-50 cursor-not-allowed': isSelected(member.uid) }"
              @click="!isSelected(member.uid) && addMember(member)"
            >
              <StatusTag :label="member.label" :color-class="member.colorClass" />
              <span class="text-sm text-gray-700">{{ member.displayName }}</span>
              <span class="text-xs text-gray-400">{{ member.email }}</span>
            </div>
          </div>
        </div>

        <!-- 操作按鈕 -->
        <div class="flex gap-3 justify-end">
          <button
            v-if="hasExistingSchedule"
            class="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm"
            @click="handleDelete"
          >
            刪除排班
          </button>
          <button
            class="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
            @click="$emit('close')"
          >
            取消
          </button>
          <button
            class="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-semibold"
            :disabled="saving"
            @click="handleSave"
          >
            {{ saving ? '儲存中...' : '發佈排班' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile, LineupMember } from '~/types'

const props = defineProps<{
  dateStr: string
  allMembers: UserProfile[]
  initialLineup: LineupMember[]
  hasExistingSchedule: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', lineup: LineupMember[]): void
  (e: 'delete'): void
}>()

const { validateLineup } = useSchedule()

const selectedLineup = ref<LineupMember[]>([...props.initialLineup])
const errors = ref<string[]>([])
const saving = ref(false)

const availableMembers = computed(() => props.allMembers)

const isSelected = (uid: string) => selectedLineup.value.some((m) => m.uid === uid)

const addMember = (member: UserProfile) => {
  selectedLineup.value.push({
    uid: member.uid,
    name: member.displayName,
    label: member.label,
    color: member.colorClass,
  })
  errors.value = validateLineup(selectedLineup.value, props.allMembers)
}

const removeMember = (uid: string) => {
  selectedLineup.value = selectedLineup.value.filter((m) => m.uid !== uid)
  errors.value = validateLineup(selectedLineup.value, props.allMembers)
}

const handleSave = async () => {
  errors.value = validateLineup(selectedLineup.value, props.allMembers)
  if (errors.value.length > 0) return
  saving.value = true
  emit('save', selectedLineup.value)
}

const handleDelete = () => {
  emit('delete')
}
</script>
