import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'
import type { UserProfile } from '~/types'

export const useMembers = () => {
  const { $db } = useNuxtApp()
  const members = useState<UserProfile[]>('members-list', () => [])
  const loading = useState<boolean>('members-loading', () => false)

  const fetchMembers = async () => {
    loading.value = true
    const q = query(collection($db, 'users'), orderBy('displayName'))
    const snapshot = await getDocs(q)
    members.value = snapshot.docs.map((d) => d.data() as UserProfile)
    loading.value = false
  }

  // 依角色分類
  const vocals = computed(() =>
    members.value.filter((m) => m.role === 'Vocal')
  )
  const singers = computed(() =>
    members.value.filter((m) => m.role === 'Singer')
  )
  const coreMusicians = computed(() =>
    members.value.filter(
      (m) => m.role === 'Musician' && ['PN', 'DR'].includes(m.instrument)
    )
  )
  const flexMusicians = computed(() =>
    members.value.filter(
      (m) => m.role === 'Musician' && !['PN', 'DR'].includes(m.instrument)
    )
  )

  // 訂閱即時更新
  const subscribeMembers = () => {
    const q = query(collection($db, 'users'), orderBy('displayName'))
    return onSnapshot(q, (snapshot) => {
      members.value = snapshot.docs.map((d) => d.data() as UserProfile)
    })
  }

  return {
    members: readonly(members),
    loading: readonly(loading),
    vocals,
    singers,
    coreMusicians,
    flexMusicians,
    fetchMembers,
    subscribeMembers,
  }
}
