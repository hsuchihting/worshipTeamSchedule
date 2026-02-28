<template>
  <div class="mb-6">
    <h2 class="text-lg font-bold mb-3 flex items-center gap-2">
      <span class="w-3 h-3 rounded-full inline-block" :class="headerColor" />
      {{ title }}
      <span class="text-sm font-normal text-gray-500">({{ members.length }} 人)</span>
    </h2>
    <div v-if="members.length === 0" class="text-gray-400 text-sm pl-5">尚無成員</div>
    <ul v-else class="space-y-2">
      <li
        v-for="member in members"
        :key="member.uid"
        class="flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm border border-gray-100"
      >
        <StatusTag :label="member.label" :color-class="member.colorClass" />
        <div>
          <p class="font-medium text-gray-800">{{ member.displayName }}</p>
          <p class="text-xs text-gray-400">{{ member.email }}</p>
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { UserProfile } from '~/types'

defineProps<{
  title: string
  headerColor: string
  members: UserProfile[]
}>()
</script>
