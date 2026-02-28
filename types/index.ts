// TypeScript Type Definitions for BandScheduler
import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'Vocal' | 'Singer' | 'Musician'

export type InstrumentCode = 'PN' | 'DR' | 'EG' | 'BS' | 'AG' | 'KB' | 'SAX' | 'VLN' | 'FLT'

export type ColorClass = 'bg-orange-500' | 'bg-gray-500' | 'bg-red-600' | 'bg-purple-500'

export interface UserProfile {
  uid: string
  displayName: string
  email: string
  role: UserRole
  instrument: string      // 樂器簡寫，如 'PN', 'EG', 'BS'
  label: string           // 格式化標籤，如 '(EG) 姓名'
  colorClass: ColorClass  // 例如 'bg-orange-500'
  isAdmin: boolean        // 管理員權限標記
}

export interface LineupMember {
  uid: string
  name: string
  label: string
  color: string
}

export interface Schedule {
  id: string              // 文件 ID 即為 YYYY-MM-DD
  date: Timestamp
  lineup: LineupMember[]
}

export interface AvailabilityEntry {
  uid: string
  dates: string[]         // YYYY-MM-DD 格式
}

// 角色顏色映射
export const ROLE_COLOR_MAP: Record<string, ColorClass> = {
  Vocal: 'bg-orange-500',
  Singer: 'bg-gray-500',
  PN: 'bg-red-600',
  DR: 'bg-red-600',
}

// 核心樂器列表
export const CORE_INSTRUMENTS: InstrumentCode[] = ['PN', 'DR']

// 所有樂器選項
export const INSTRUMENT_OPTIONS: { code: InstrumentCode; label: string }[] = [
  { code: 'PN', label: '鋼琴 (Piano)' },
  { code: 'DR', label: '鼓 (Drums)' },
  { code: 'EG', label: '電吉他 (Electric Guitar)' },
  { code: 'BS', label: '貝斯 (Bass)' },
  { code: 'AG', label: '木吉他 (Acoustic Guitar)' },
  { code: 'KB', label: '鍵盤 (Keyboard)' },
  { code: 'SAX', label: '薩克斯風 (Saxophone)' },
  { code: 'VLN', label: '小提琴 (Violin)' },
  { code: 'FLT', label: '長笛 (Flute)' },
]
