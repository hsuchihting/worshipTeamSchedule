<template>
  <div class="bg-white rounded-xl shadow p-4">
    <!-- 月份導航 -->
    <div class="flex items-center justify-between mb-4">
      <button
        class="p-2 rounded-full hover:bg-gray-100 transition"
        @click="prevMonth"
      >
        ◀
      </button>
      <h2 class="text-xl font-bold text-gray-700">
        {{ currentYear }} 年 {{ currentMonth + 1 }} 月
      </h2>
      <button
        class="p-2 rounded-full hover:bg-gray-100 transition"
        @click="nextMonth"
      >
        ▶
      </button>
    </div>

    <!-- 星期標題列 -->
    <div class="grid grid-cols-7 text-center text-xs font-semibold text-gray-500 mb-2">
      <span v-for="day in weekDays" :key="day">{{ day }}</span>
    </div>

    <!-- 日期格子 -->
    <div class="grid grid-cols-7 gap-1">
      <div
        v-for="(day, index) in calendarDays"
        :key="index"
        class="relative min-h-[60px] rounded-lg p-1 text-sm cursor-pointer transition"
        :class="getDayClass(day)"
        @click="day.date && handleDayClick(day.date)"
      >
        <span v-if="day.date" class="font-medium">{{ day.date.getDate() }}</span>

        <!-- 成員端：可服事標記 -->
        <div
          v-if="day.date && !isAdmin && availableDates.includes(formatDate(day.date))"
          class="mt-1 text-xs bg-green-100 text-green-700 rounded px-1 text-center"
        >
          ✓ 可服事
        </div>

        <!-- 排班預覽 -->
        <div
          v-if="day.date && schedules[formatDate(day.date)]"
          class="mt-1 space-y-0.5"
        >
          <div
            v-for="member in schedules[formatDate(day.date)].lineup.slice(0, 3)"
            :key="member.uid"
            class="text-xs truncate rounded px-1 text-white"
            :class="member.color"
          >
            {{ member.name }}
          </div>
          <div
            v-if="schedules[formatDate(day.date)].lineup.length > 3"
            class="text-xs text-gray-400"
          >
            +{{ schedules[formatDate(day.date)].lineup.length - 3 }} 位
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Schedule } from '~/types'

const props = defineProps<{
  isAdmin: boolean
  schedules: Record<string, Schedule>
  availableDates: string[]
}>()

const emit = defineEmits<{
  (e: 'day-click', date: Date, dateStr: string): void
}>()

const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth())

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

interface CalendarDay {
  date: Date | null
}

const calendarDays = computed<CalendarDay[]>(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const days: CalendarDay[] = []

  for (let i = 0; i < firstDay; i++) {
    days.push({ date: null })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    days.push({ date: new Date(year, month, d) })
  }
  return days
})

const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const isToday = (date: Date): boolean => {
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

const getDayClass = (day: CalendarDay): string => {
  if (!day.date) return 'cursor-default'
  const dateStr = formatDate(day.date)
  const classes: string[] = []

  if (isToday(day.date)) classes.push('ring-2 ring-blue-500 bg-blue-50')
  else if (props.schedules[dateStr]) classes.push('bg-indigo-50 hover:bg-indigo-100')
  else if (props.availableDates.includes(dateStr)) classes.push('bg-green-50 hover:bg-green-100')
  else classes.push('hover:bg-gray-50')

  return classes.join(' ')
}

const handleDayClick = (date: Date) => {
  emit('day-click', date, formatDate(date))
}

const prevMonth = () => {
  if (currentMonth.value === 0) {
    currentYear.value--
    currentMonth.value = 11
  } else {
    currentMonth.value--
  }
}

const nextMonth = () => {
  if (currentMonth.value === 11) {
    currentYear.value++
    currentMonth.value = 0
  } else {
    currentMonth.value++
  }
}
</script>
