# GameSkill Module Quick-Understanding

## 📌 Core Purpose

Game skill service list page module for displaying and filtering companion players (陪玩). Supports all game types including Honor of Kings (王者荣耀), League of Legends (英雄联盟), PUBG Mobile (和平精英), etc.

**Tech Stack**: React Native + Expo Router + TypeScript + Zustand

## 📊 Progress Overview (2025-12-09)

### Feature Status
| Feature | Data Source | Status | Description |
|---------|-------------|--------|-------------|
| List Display | **RPC Real Data** | ✅ Complete | Calls `GET /api/skill/list` |
| Sort Filter | **RPC Real Data** | ✅ Complete | sortBy parameter |
| Gender Filter | **RPC Real Data** | ✅ Complete | gender parameter |
| Advanced Filter | **RPC Real Data** | ✅ Complete | filters object with rank/price/position/tags |
| Tab Switch | **RPC Real Data** | ✅ Complete | tabType parameter |
| Quick Tags | **RPC Real Data** | ✅ Complete | Merged into tags filter |
| Distance Display | **RPC Real Data** | ✅ Complete | lat/lng parameters |
| Order Creation | **RPC Real Data** | ✅ Complete | `POST /api/skill/order` → RemoteOrderService RPC |

### Progress Statistics
```
Total Features: 8
└── ✅ Complete: 8 (100%)
```

## 🎯 Main Features

- **Skill Service List Display** (vertical card list layout)
- **Multi-dimension Filtering** (sort/gender/region/rank/price/position/tags)
- **Tab Switching** (Glory King/Online/Boost/Companion/Expert)
- **Quick Tag Pills** (horizontal scrollable filter shortcuts)
- **Distance Calculation** (based on user GPS location)
- **Infinite Scroll Pagination**
- **Pull-to-Refresh**
- **Navigate to Detail Page**

## 📁 Core Directory Structure

```
GameSkill/
├── index.ts                           # Module entry, re-exports
├── Quick-Understanding.md             # This documentation
├── api/                               # API layer
│   ├── index.ts                       # API exports
│   ├── types.ts                       # TypeScript interfaces
│   ├── apiGetSkillConfig.ts           # GET /api/skill/config
│   ├── apiGetSkillList.ts             # GET /api/skill/list
│   └── apiPostSkillOrder.ts           # POST /api/skill/order
├── stores/                            # State management
│   ├── index.ts                       # Store exports
│   └── useSkillStore.ts               # Zustand store
└── GameSkillList/                     # 📱 L1 Page Component
    ├── index.tsx                      # Page orchestrator
    ├── types.ts                       # Page types
    ├── constants.ts                   # Game ID mappings, defaults
    ├── NavArea.tsx                    # L2 - Navigation bar
    ├── FilterArea.tsx                 # L2 - Sort/gender/filter buttons
    ├── TabArea.tsx                    # L2 - Horizontal tab scroll
    ├── QuickTagArea.tsx               # L2 - Quick tag pills
    ├── ContentListArea/               # L2 - List area
    │   ├── index.tsx                  # FlatList with pagination
    │   ├── types.ts                   # Area types
    │   └── SkillServiceCard/          # L3 - Card component
    │       ├── index.tsx              # Player card
    │       ├── types.ts               # Card props
    │       └── styles.ts              # Card styles
    └── modals/                        # Bottom sheet modals
        ├── index.ts                   # Modal exports
        ├── SortBottomSheet.tsx        # Sort selection
        ├── GenderBottomSheet.tsx      # Gender selection
        └── FilterBottomSheet.tsx      # Advanced filter panel
```

## 🔑 Core Interfaces

### BFF API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/skill/config?gameId=xxx` | Get page config (tabs, filter options) |
| `GET/POST` | `/api/skill/list` | Get skill service list with filters |
| `POST` | `/api/skill/order` | Create service order |

### Request Parameters (SkillListQueryParams)
```typescript
interface SkillListQueryParams {
  gameId: string;           // 'honor_of_kings' | 'lol' | 'pubg' | ...
  tabType?: string;         // 'glory_king' | 'online' | 'boost' | ...
  sortBy?: SortType;        // 'smart' | 'newest' | 'recent' | 'popular' | 'price_asc' | 'price_desc'
  gender?: GenderType;      // 'all' | 'male' | 'female'
  pageNum?: number;
  pageSize?: number;
  latitude?: number;
  longitude?: number;
  filters?: SkillFiltersParams;
}
```

### Response Structure (SkillServiceItemVO)
```typescript
interface SkillServiceItemVO {
  skillId: number;
  userId: number;
  avatarData: { avatarUrl: string };
  basicData: { nickname, gender, age, distance, isOnline };
  verificationData: { isRealVerified, isGodVerified, isVip };
  skillData: { skillName, gameName, gameRank, peakScore, server, gameAttrs, description, rating, orderCount };
  priceData: { price, unit, displayText };
}
```

## 🏛️ Component Architecture

### Hierarchy
```
GameSkillList [L1 Page]
├── NavArea [L2] - Back button + title
├── FilterArea [L2] - Sort/gender/filter controls
├── TabArea [L2] - Horizontal scrollable tabs
├── QuickTagArea [L2] - Quick filter tag pills
├── ContentListArea [L2] - FlatList with pagination
│   └── SkillServiceCard [L3] - Player card item
├── SortBottomSheet [Modal] - Sort selection
├── GenderBottomSheet [Modal] - Gender selection
└── FilterBottomSheet [Modal] - Advanced filter panel
```

### Data Flow
```
Route Mount
    ↓
useSkillStore.setGameId(gameId)
    ↓
loadConfig() → GET /api/skill/config
    ↓
loadList() → GET /api/skill/list
    ↓
Zustand state update
    ↓
FlatList renders SkillServiceCard
    ↓
User interaction → Filter/Sort/Tab change → Reload list
```

## 🗺️ Page Navigation Flow

### Page Entry
| Source | Trigger | Route Params |
|--------|---------|--------------|
| Homepage Banner | Click game banner | `skillType='王者荣耀', gameId='honor_of_kings'` |
| Homepage Function Grid | Click function icon | `skillType='xxx', gameId='xxx'` |

### Page Exit
| Trigger | Target Page | Route |
|---------|-------------|-------|
| Click player card | Service Detail Page | `/service/detail/[serviceId]` |
| Click back button | Previous page | `router.back()` |

### Navigation Diagram
```
┌──────────────────────┐
│  Homepage MainPage   │
└──────────┬───────────┘
           │ Click banner/function
           ↓
┌─────────────────────────────────┐
│  GameSkillList                  │
│  /(tabs)/homepage/game-player-list │
└──────────┬──────────────────────┘
           │ Click player card
           ↓
┌─────────────────────────────────┐
│  ServiceDetailPage              │
│  /service/detail/[serviceId]   │
└─────────────────────────────────┘
```

## 🔧 Store Structure (useSkillStore)

### State
| Field | Type | Description |
|-------|------|-------------|
| `gameId` | `string` | Current game identifier |
| `tabs` | `TabItem[]` | Tab list from config |
| `quickTags` | `QuickTagItem[]` | Quick filter tags |
| `skillList` | `SkillServiceItemVO[]` | Player list data |
| `total` | `number` | Total count |
| `hasMore` | `boolean` | Has more pages |
| `activeTab` | `string` | Current tab value |
| `sortBy` | `SortType` | Current sort |
| `gender` | `GenderType` | Current gender filter |
| `activeQuickTag` | `string \| null` | Active quick tag |
| `advancedFilters` | `AdvancedFilters` | Advanced filter state |
| `pageNum` | `number` | Current page |
| `isListLoading` | `boolean` | Initial loading |
| `isRefreshing` | `boolean` | Pull-to-refresh |
| `isLoadingMore` | `boolean` | Pagination loading |

### Actions
| Method | Description |
|--------|-------------|
| `setGameId(id)` | Set game and reset state |
| `setUserLocation(lat, lng)` | Update GPS coordinates |
| `loadConfig()` | Fetch page config |
| `loadList(isLoadMore?)` | Fetch list data |
| `refreshList()` | Pull-to-refresh |
| `setActiveTab(tab)` | Switch tab |
| `setSortBy(sort)` | Change sort |
| `setGender(gender)` | Change gender filter |
| `toggleQuickTag(tag)` | Toggle quick tag |
| `setAdvancedFilters(filters)` | Apply advanced filters |
| `reset()` | Reset all state |

## 🔗 Related Modules

- [xypai-app-bff](../../../../RuoYi-Cloud-Plus/xypai-aggregation/xypai-app-bff/快速理解.md) - Backend BFF service
- [xypai-user](../../../../RuoYi-Cloud-Plus/xypai-modules/xypai-user/快速理解.md) - User domain service (RPC provider)
- [Homepage](../Homepage/快速理解.md) - Homepage navigation to this page

## 🎨 UI Layout

### Page Layout
```
┌─────────────────────────────────────────┐
│  NavArea [44px fixed]                    │
│  ← Back        王者荣耀                   │
├─────────────────────────────────────────┤
│  FilterArea [44px fixed]                 │
│  智能排序 ▼   不限性别 ▼    筛选 ▼        │
├─────────────────────────────────────────┤
│  TabArea [40px fixed, scroll-x]          │
│  [荣耀王者] [带粉上分] [电竞陪练师] →     │
├─────────────────────────────────────────┤
│  QuickTagArea [40px fixed, scroll-x]     │
│  [荣耀王者] [巅峰赛] [声优陪玩] →         │
├─────────────────────────────────────────┤
│  ContentListArea [flex:1, scroll-y]      │
│  ┌───────────────────────────────────┐  │
│  │ SkillServiceCard                   │  │
│  │ ┌──────┐ Nickname  ♀19   3.2km    │  │
│  │ │Avatar│ ✓Real ✓God               │  │
│  │ │120x160│ Description...          │  │
│  │ └──────┘ Tags...     10金币/局     │  │
│  └───────────────────────────────────┘  │
│  [More cards...]                         │
└─────────────────────────────────────────┘
```

### SkillServiceCard Layout
```
┌───────────────────────────────────────────────────┐
│ ┌──────────────┐  ┌────────────────────────────┐ │
│ │              │  │ R1: Nickname ♀19    3.2km  │ │
│ │    Avatar    │  │ R2: ✓实名 ✓大神           │ │
│ │   120×160    │  │ R3: Description...         │ │
│ │   rounded    │  │ R4: [Tag1] [Tag2] [Tag3]   │ │
│ │              │  │ R5: 10金币/局    99单|5.0分│ │
│ └──────────────┘  └────────────────────────────┘ │
│   [120px fixed]          [flex:1]                │
└───────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Import
```typescript
import { GameSkillList, useSkillStore } from '@/src/features/GameSkill';
```

### Route File
```typescript
// app/(tabs)/homepage/game-player-list.tsx
import { ErrorBoundary } from '@/src/components';
import { GameSkillList } from '@/src/features/GameSkill';

export default function GameSkillListScreen() {
  return (
    <ErrorBoundary>
      <GameSkillList />
    </ErrorBoundary>
  );
}
```

### Navigation
```typescript
router.push({
  pathname: '/(tabs)/homepage/game-player-list',
  params: { skillType: '王者荣耀', gameId: 'honor_of_kings' },
});
```

## 📌 Important Notes

### Game ID Mapping
```typescript
const GAME_ID_MAP = {
  'honor_of_kings': '王者荣耀',
  'lol': '英雄联盟',
  'pubg': '和平精英',
  'brawl_stars': '荒野乱斗',
  // ... more games
};
```

### Backend Dependencies
- BFF Controller: `SkillListController.java` at `/api/skill/*`
- RPC Service: `RemoteAppUserService.querySkillServiceList()`
- Database: `xypai_user.skills` + `xypai_user.users`

### Performance
- FlatList with virtualization for large lists
- Memoized card components (`React.memo`)
- Zustand selector hooks for granular re-renders
- Location permission requested only once on mount

---

**Last Updated**: 2025-12-09
