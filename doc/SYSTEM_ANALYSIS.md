# 樂團排班系統 (BandScheduler) 系統分析書 v1.5

## 1. 專案目標

建立一個基於 Nuxt 3 與 Firebase 的樂團協作平台，實現「成員意願填寫」與「管理員視覺化排班」，並透過顏色與樂器標籤自動化分類成員名單。

## 2. 技術棧 (Tech Stack)

* **前端框架**: `Nuxt 3` (Vue 3 Composition API)
* **樣式工具**: `Tailwind CSS`
* **後端服務**: `Firebase Auth` (Google OAuth 2.0)
* **資料庫**: `Firestore` (NoSQL)
* **開發環境**: `VS Code` (建議安裝: Volar, Tailwind CSS IntelliSense)

---

## 3. 角色定義與視覺規範

系統核心邏輯圍繞以下四種顏色標籤展開，用於區分音響編制與職責：

| 身份類別 | 代表色 (Tailwind) | 簡稱範例 | 數量限制 (每場) | 排班規則 |
| :--- | :--- | :--- | :--- | :--- |
| **主唱** | `bg-orange-500` | (Vocal) | 0 - 2 位 | 核心領唱 |
| **歌手** | `bg-gray-500` | (Singer) | 2 - 3 位 | 合聲與歌手組 |
| **核心樂手** | `bg-red-600` | (PN), (DR) | 各限 1 位 | 必須具備鋼琴與鼓 |
| **彈性樂手** | `bg-purple-500` | (EG), (BS)... | 每種樂器限 1 | 其餘樂器，按需編制 |

---

## 4. 頁面功能詳細規格

### 4.1 身份註冊與個人設定 (`/setup`)

* **Google 登入**: 統一採用 Google OAuth 進行身分驗證。
* **角色配置**: 首次登入需選擇「主唱、歌手、樂手」。
* **樂器選單**: 樂手需從選單選擇主修樂器。
  * 選擇 `PN` (鋼琴) 或 `DR` (鼓) -> 自動標記為紅色核心樂手。
  * 選擇其餘樂器 -> 自動標記為紫色彈性樂手。

### 4.2 成員名單頁面 (`/members`)

此頁面將成員「分類顯示」，以便一目了然各組別的人力狀況：

* **分類顯示區塊**:
    1. **領唱組**: 橘色標籤成員。
    2. **合聲組**: 灰色標籤成員。
    3. **核心節奏組**: 紅色標籤成員（固定為鋼琴與鼓手）。
    4. **彈性旋律組**: 紫色標籤成員（依據樂器代碼顯示）。
* **資訊內容**: 顯示姓名、Email 及該身份對應的標籤顏色。

### 4.3 班表行事曆與排班 (`/`)

* **成員端 (填寫意願)**:
  * 月曆模式顯示。
  * 點擊日期可切換該日為「Available」。
* **管理員端 (排班管理)**:
  * 點擊特定日期可彈出排班視窗（CRUD）。
  * **邏輯檢核**:
    * 同一紫色樂器（如：兩位吉他手）不可重複選入同一場。
    * 自動計算主唱 (<=2) 與 歌手 (2-3) 人數是否符合規範。
    * 檢查是否有核心樂手 (PN/DR)。
  * **發佈**: 排班結果存檔後，立即更新於所有成員的行事曆。

---

## 5. 資料庫架構 (Firestore Design)

### `users` (Collection)

```typescript
interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: 'Vocal' | 'Singer' | 'Musician';
  instrument: string;      // 樂器簡寫，如 'PN', 'EG', 'BS'
  label: string;           // 格式化標籤，如 '(EG) 姓名'
  colorClass: string;      // 例如 'bg-orange-500'
  isAdmin: boolean;        // 管理員權限標記
}
```

### `schedules` (Collection)

```typescript
interface Schedule {
  id: string;              // 文件 ID 即為 YYYY-MM-DD
  date: Timestamp;
  lineup: Array<{
    uid: string;
    name: string;
    label: string;
    color: string;
  }>;
}
```

## 6. VS Code 開發目錄架構建議

BandScheduler/
├── components/
│   ├── calendar/
│   │   ├── CalendarMain.vue    # 行事曆核心
│   │   └── ScheduleModal.vue   # 排班編輯對話框
│   ├── members/
│   │   └── MemberGroup.vue     # 分類顯示區域組件
│   └── shared/
│       └── StatusTag.vue       # 四色身份標籤組件
├── pages/
│   ├── index.vue               # 行事曆頁面
│   ├── members.vue             # 分類成員清單
│   └── setup.vue               # 註冊資料設定頁
├── types/
│   └── index.ts                # TypeScript 型別宣告
└── tailwind.config.js          # Tailwind 主題顏色配置
