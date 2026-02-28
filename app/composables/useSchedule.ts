import {
  collection,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  Timestamp,
} from 'firebase/firestore'
import type { Schedule, LineupMember, UserProfile } from '~/types'

export const useSchedule = () => {
  const { $db } = useNuxtApp()
  const schedules = useState<Record<string, Schedule>>('schedules', () => ({}))

  // 訂閱特定月份的班表
  const subscribeMonth = (year: number, month: number) => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`
    const q = query(
      collection($db, 'schedules'),
      where('__name__', '>=', startDate),
      where('__name__', '<=', endDate)
    )
    return onSnapshot(q, (snapshot) => {
      snapshot.docs.forEach((d) => {
        schedules.value[d.id] = d.data() as Schedule
      })
    })
  }

  const getSchedule = async (dateStr: string): Promise<Schedule | null> => {
    const docRef = doc($db, 'schedules', dateStr)
    const snap = await getDoc(docRef)
    return snap.exists() ? (snap.data() as Schedule) : null
  }

  const saveSchedule = async (dateStr: string, lineup: LineupMember[]) => {
    const docRef = doc($db, 'schedules', dateStr)
    const schedule: Schedule = {
      id: dateStr,
      date: Timestamp.fromDate(new Date(dateStr)),
      lineup,
    }
    await setDoc(docRef, schedule)
    schedules.value[dateStr] = schedule
  }

  const deleteSchedule = async (dateStr: string) => {
    await deleteDoc(doc($db, 'schedules', dateStr))
    delete schedules.value[dateStr]
  }

  // 排班邏輯檢核
  const validateLineup = (lineup: LineupMember[], allMembers: UserProfile[]) => {
    const errors: string[] = []

    const getMember = (uid: string) => allMembers.find((m) => m.uid === uid)

    const vocals = lineup.filter((l) => getMember(l.uid)?.role === 'Vocal')
    const singers = lineup.filter((l) => getMember(l.uid)?.role === 'Singer')
    const musicians = lineup.filter((l) => getMember(l.uid)?.role === 'Musician')

    if (vocals.length > 2) errors.push('主唱最多 2 位')
    if (singers.length < 2 || singers.length > 3) errors.push('歌手需 2-3 位')

    const hasPN = musicians.some((l) => getMember(l.uid)?.instrument === 'PN')
    const hasDR = musicians.some((l) => getMember(l.uid)?.instrument === 'DR')
    if (!hasPN) errors.push('缺少核心樂手：鋼琴 (PN)')
    if (!hasDR) errors.push('缺少核心樂手：鼓 (DR)')

    // 檢查彈性樂手樂器重複
    const flexInstruments = musicians
      .filter((l) => !['PN', 'DR'].includes(getMember(l.uid)?.instrument ?? ''))
      .map((l) => getMember(l.uid)?.instrument)
    const duplicates = flexInstruments.filter(
      (inst, idx) => flexInstruments.indexOf(inst) !== idx
    )
    if (duplicates.length > 0) {
      errors.push(`彈性樂手樂器重複：${[...new Set(duplicates)].join(', ')}`)
    }

    return errors
  }

  // 成員意願填寫：切換日期 available 狀態
  const toggleAvailability = async (uid: string, dateStr: string) => {
    const docRef = doc($db, 'availability', uid)
    const snap = await getDoc(docRef)
    const existing = snap.exists() ? (snap.data().dates as string[]) : []
    const idx = existing.indexOf(dateStr)
    const updated = idx >= 0 ? existing.filter((d) => d !== dateStr) : [...existing, dateStr]
    await setDoc(docRef, { uid, dates: updated })
    return updated
  }

  const getAvailability = async (uid: string): Promise<string[]> => {
    const docRef = doc($db, 'availability', uid)
    const snap = await getDoc(docRef)
    return snap.exists() ? (snap.data().dates as string[]) : []
  }

  return {
    schedules: readonly(schedules),
    subscribeMonth,
    getSchedule,
    saveSchedule,
    deleteSchedule,
    validateLineup,
    toggleAvailability,
    getAvailability,
  }
}
