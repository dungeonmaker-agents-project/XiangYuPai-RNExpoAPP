/**
 * Homepage 模块 - 首页功能模块
 *
 * 包含：
 * - MainPage: 首页主页面（用户列表、功能入口等）
 * - EventFlow: 组局中心功能流
 * - FeaturedFlow: 精选推荐功能流
 * - FilterFlow: 筛选功能流
 * - LocationFlow: 位置选择功能流
 * - SearchFlow: 搜索功能流
 * - ServiceFlow: 服务详情功能流
 * - UserDetailFlow: 用户详情功能流
 */

// ==================== 主页面 ====================
export { default as MainPage } from './MainPage';
export { HomeScreen } from './MainPage';

// 区域组件导出
export {
  FilterTabsArea,
  FunctionGridArea,
  GameBannerArea,
  HeaderArea,
  LimitedOffersArea,
  TeamPartyArea,
  UserListArea,
} from './MainPage';

// Hooks 导出
export {
  useHomeData,
  useHomeNavigation,
  useHomeState,
} from './MainPage';

// 类型导出
export type {
  FunctionItem,
  LocationInfo,
  UserCard,
} from './MainPage';

// 常量导出
export {
  COLORS as HOME_COLORS,
  GRADIENTS as HOME_GRADIENTS,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from './MainPage';

// ==================== 功能流页面 ====================

// EventFlow - 组局中心
export { default as EventCenterPage } from './EventFlow/EventCenterPage';
export { default as PublishEventPage } from './EventFlow/PublishEventPage';

// FeaturedFlow - 精选推荐
export { default as FeaturedPage } from './FeaturedFlow/FeaturedPage';

// FilterFlow - 筛选
export { default as FilterMainPage } from './FilterFlow/FilterMainPage';

// LocationFlow - 位置选择
export { default as LocationMainPage } from './LocationFlow/LocationMainPage';

// SearchFlow - 搜索
export { default as SearchMainPage } from './SearchFlow/SearchMainPage';
export { default as SearchResultsPage } from './SearchFlow/SearchResultsPage';

// ServiceFlow - 服务详情
export { default as ServiceDetailPage } from './ServiceFlow/ServiceDetailPage';

// UserDetailFlow - 用户详情
export { EnhancedUserDetailPage } from './UserDetailFlow';

// ==================== 共享组件 ====================
export {
  SortBottomSheet,
  GenderBottomSheet,
  AdvancedFilterSheet,
  type SortOption,
  type GenderOption,
  type AdvancedFilters,
} from './SharedComponents';
