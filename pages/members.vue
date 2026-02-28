<template>
  <div class="min-h-screen bg-gray-50 p-4">
    <div class="max-w-3xl mx-auto">
      <!-- 頁首 -->
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold text-gray-800">成員名單</h1>
        <NuxtLink to="/" class="text-sm text-indigo-600 hover:underline">← 回班表</NuxtLink>
      </div>

      <div v-if="loading" class="text-center py-20 text-gray-400">載入中...</div>

      <div v-else>
        <!-- 1. 領唱組 -->
        <MemberGroup
          title="領唱組"
          header-color="bg-orange-500"
          :members="vocals"
        />
        <!-- 2. 合聲組 -->
        <MemberGroup
          title="合聲組"
          header-color="bg-gray-500"
          :members="singers"
        />
        <!-- 3. 核心節奏組 -->
        <MemberGroup
          title="核心節奏組"
          header-color="bg-red-600"
          :members="coreMusicians"
        />
        <!-- 4. 彈性旋律組 -->
        <MemberGroup
          title="彈性旋律組"
          header-color="bg-purple-500"
          :members="flexMusicians"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { vocals, singers, coreMusicians, flexMusicians, loading, fetchMembers, subscribeMembers } = useMembers()

onMounted(async () => {
  await fetchMembers()
  subscribeMembers()
})
</script>
