/**
 * Stores Index - 导出所有Zustand状态存储
 */

// 导入Store实例
import { useConfigStore } from './configStore';
import { useDiscoveryStore } from './discoveryStore';
import { useHomepageStore } from './homepageStore';
import { useLocationStore } from './locationStore';
import { useProfileStore } from './profileStore';
import { useUserStore } from './userStore';

// 导出Store实例
export { useConfigStore, useDiscoveryStore, useHomepageStore, useLocationStore, useProfileStore, useUserStore };

// 导出选择器函数
  export {
    useHomepageConfig,
    useHomepageData, useHomepageError, useHomepageLoading, useUserInteraction
  } from './homepageStore';

export {
  useCurrentFilters, useFilteredUsers, useUserList, useUserSearch
} from './userStore';

export {
  useCityData, useCurrentLocation, useLocationLoading, useLocationPermission, useSelectedLocation
} from './locationStore';

export { useColors, useColorScheme, useComponentConfigs, useDeviceInfo, useNetworkStatus, useSpacing, useSystemConfig, useTheme, useTypography, useUserPreferences } from './configStore';

export {
  useActiveTab, useComments, useCurrentFeeds, useCurrentHasMore, useDiscoveryError, useDiscoveryLoading, useDiscoveryUI,
  useIsSearching, useSearch, useSearchHistory, useSearchKeyword, useSearchLoading, useSearchResults,
  useSkilledUsers, useSkilledUsersFilters, useSkilledUsersFilterOptions, useSkilledUsersLoading, useSkilledUsersPagination
} from './discoveryStore';

export {
  useCurrentProfile,
  usePosts, useActiveTab as useProfileActiveTab, useProfileError,
  useProfileLoading
} from './profileStore';

// 导出类型定义
export type {
  // Homepage Store Types
  PageConfig,
  PageData,
  UserInteraction
} from './homepageStore';

export type {
  FilterConditions,
  SearchState,
  // User Store Types
  User,
  UserListState
} from './userStore';

export type {
  CityInfo, Coordinates, DistrictInfo,
  // Location Store Types
  LocationInfo, PermissionStatus
} from './locationStore';

export type {
  ComponentConfig,
  SystemConfig,
  // Config Store Types
  ThemeConfig, UserPreferences
} from './configStore';

export type {
  CommentCache,
  // Discovery Store Types
  FeedDataState, SearchState as DiscoverySearchState, SkilledUsersState,
  TabType, UIState
} from './discoveryStore';

// Store工具函数
export const resetAllStores = () => {
  useHomepageStore.getState().resetPageState();
  useUserStore.getState().resetUserState();
  useLocationStore.getState().resetLocationState();
  useConfigStore.getState().resetConfigState();
  useDiscoveryStore.getState().resetState();
  useProfileStore.getState().resetState();
};

// 初始化所有必要的Store数据
export const initializeStores = async () => {
  const homepageStore = useHomepageStore.getState();
  const userStore = useUserStore.getState();
  const locationStore = useLocationStore.getState();
  const configStore = useConfigStore.getState();

  try {
    // 并行初始化基础配置
    await Promise.all([
      configStore.loadSystemConfig(),
      configStore.loadThemeConfig(),
      configStore.loadComponentConfig('main-page'),
      locationStore.loadCityList(),
    ]);

    // 初始化设备信息
    configStore.initializeDeviceInfo();

    console.log('Stores初始化完成');
  } catch (error) {
    console.error('Stores初始化失败:', error);
  }
};

// Store状态订阅工具
export const subscribeToStores = (callback: () => void) => {
  const unsubscribeHomepage = useHomepageStore.subscribe(callback);
  const unsubscribeUser = useUserStore.subscribe(callback);
  const unsubscribeLocation = useLocationStore.subscribe(callback);
  const unsubscribeConfig = useConfigStore.subscribe(callback);
  const unsubscribeDiscovery = useDiscoveryStore.subscribe(callback);
  const unsubscribeProfile = useProfileStore.subscribe(callback);

  return () => {
    unsubscribeHomepage();
    unsubscribeUser();
    unsubscribeLocation();
    unsubscribeConfig();
    unsubscribeDiscovery();
    unsubscribeProfile();
  };
};

// Store调试工具
export const getStoreStates = () => ({
  homepage: useHomepageStore.getState(),
  user: useUserStore.getState(),
  location: useLocationStore.getState(),
  config: useConfigStore.getState(),
  discovery: useDiscoveryStore.getState(),
  profile: useProfileStore.getState(),
});
