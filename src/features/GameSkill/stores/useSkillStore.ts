/**
 * GameSkill Zustand Store
 * State management for skill service list page
 *
 * Invocation: GameSkillList page and child components
 * Logic: Manages config, list data, filters, pagination, loading states
 */
import { create } from 'zustand';
import { apiGetSkillConfig, apiGetSkillList } from '../api';
import type {
  SkillConfigResponse,
  SkillServiceItemVO,
  TabVO,
  FilterOptionsVO,
  QuickTagVO,
  SortType,
  GenderType,
  SkillFiltersParams,
} from '../api/types';

// ============================================================================
// STATE INTERFACE
// ============================================================================

interface SkillState {
  // Config data from apiGetSkillConfig
  config: SkillConfigResponse | null;
  tabs: TabVO[];
  filterOptions: FilterOptionsVO | null;
  quickTags: QuickTagVO[];

  // List data from apiGetSkillList
  skillList: SkillServiceItemVO[];
  total: number;
  hasMore: boolean;

  // Current filter selections
  gameId: string;
  activeTab: string;
  sortBy: SortType;
  gender: GenderType;
  activeQuickTag: string | null;
  advancedFilters: SkillFiltersParams;

  // Pagination state
  pageNum: number;
  pageSize: number;

  // Loading states for UI feedback
  isConfigLoading: boolean;
  isListLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;

  // User geolocation for distance calculation
  latitude: number | null;
  longitude: number | null;
}

interface SkillActions {
  // Initialization actions
  setGameId: (gameId: string) => void;
  setUserLocation: (lat: number, lng: number) => void;

  // Data loading actions
  loadConfig: () => Promise<void>;
  loadList: (isLoadMore?: boolean) => Promise<void>;
  refreshList: () => Promise<void>;

  // Filter modification actions
  setActiveTab: (tab: string) => void;
  setSortBy: (sort: SortType) => void;
  setGender: (gender: GenderType) => void;
  toggleQuickTag: (tagId: string | null) => void;
  setAdvancedFilters: (filters: SkillFiltersParams) => void;
  resetFilters: () => void;

  // State reset
  reset: () => void;
}

type SkillStore = SkillState & SkillActions;

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState: SkillState = {
  config: null,
  tabs: [],
  filterOptions: null,
  quickTags: [],
  skillList: [],
  total: 0,
  hasMore: true,
  gameId: 'honor_of_kings',
  activeTab: 'glory_king',
  sortBy: 'smart',
  gender: 'all',
  activeQuickTag: null,
  advancedFilters: {},
  pageNum: 1,
  pageSize: 20,
  isConfigLoading: false,
  isListLoading: false,
  isRefreshing: false,
  isLoadingMore: false,
  error: null,
  latitude: null,
  longitude: null,
};

// ============================================================================
// STORE CREATION
// ============================================================================

export const useSkillStore = create<SkillStore>((set, get) => ({
  ...initialState,

  // --------------------------------------------------------------------------
  // INITIALIZATION ACTIONS
  // --------------------------------------------------------------------------

  /** Set game identifier, resets list state for fresh data load */
  setGameId: (gameId: string) => {
    set({ gameId, pageNum: 1, skillList: [], hasMore: true });
  },

  /** Store user geolocation for distance-based sorting */
  setUserLocation: (lat: number, lng: number) => {
    set({ latitude: lat, longitude: lng });
  },

  // --------------------------------------------------------------------------
  // DATA LOADING ACTIONS
  // Uses: apiGetSkillConfig, apiGetSkillList from ../api
  // --------------------------------------------------------------------------

  /**
   * Load page configuration (tabs, filters, quick tags)
   * Called once on page mount
   */
  loadConfig: async () => {
    const { gameId } = get();
    set({ isConfigLoading: true, error: null });

    try {
      const config = await apiGetSkillConfig({ gameId });
      set({
        config,
        tabs: config.tabs,
        filterOptions: config.filterOptions,
        quickTags: config.quickTags,
        isConfigLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load config',
        isConfigLoading: false,
      });
    }
  },

  /**
   * Load skill list with current filters and pagination
   * Supports both initial load and load-more pagination
   * Merges quick tag selection into filter params before API call
   */
  loadList: async (isLoadMore = false) => {
    const state = get();

    // Guard: prevent duplicate or unnecessary requests
    if (isLoadMore && !state.hasMore) return;
    if (isLoadMore && state.isLoadingMore) return;
    if (!isLoadMore && state.isListLoading) return;

    const pageNum = isLoadMore ? state.pageNum + 1 : 1;

    set({
      isListLoading: !isLoadMore,
      isLoadingMore: isLoadMore,
      error: null,
    });

    try {
      // Merge quick tag into filters if active
      const mergedFilters = { ...state.advancedFilters };
      if (state.activeQuickTag) {
        const quickTag = state.quickTags.find(t => t.id === state.activeQuickTag);
        if (quickTag && quickTag.filterKey === 'tags') {
          mergedFilters.tags = [...(mergedFilters.tags || []), quickTag.filterValue];
        }
      }

      const result = await apiGetSkillList({
        gameId: state.gameId,
        tabType: state.activeTab,
        sortBy: state.sortBy,
        gender: state.gender,
        pageNum,
        pageSize: state.pageSize,
        latitude: state.latitude ?? undefined,
        longitude: state.longitude ?? undefined,
        filters: Object.keys(mergedFilters).length > 0 ? mergedFilters : undefined,
      });

      set({
        skillList: isLoadMore ? [...state.skillList, ...result.list] : result.list,
        total: result.total,
        hasMore: result.hasMore,
        pageNum,
        isListLoading: false,
        isLoadingMore: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load list',
        isListLoading: false,
        isLoadingMore: false,
      });
    }
  },

  /** Pull-to-refresh handler, resets to page 1 */
  refreshList: async () => {
    set({ isRefreshing: true, pageNum: 1 });

    try {
      await get().loadList(false);
    } finally {
      set({ isRefreshing: false });
    }
  },

  // --------------------------------------------------------------------------
  // FILTER MODIFICATION ACTIONS
  // Each filter change resets pagination and triggers list reload
  // --------------------------------------------------------------------------

  /** Switch active tab, triggers list reload */
  setActiveTab: (tab: string) => {
    set({ activeTab: tab, pageNum: 1, skillList: [], hasMore: true });
    get().loadList();
  },

  /** Change sort order, triggers list reload */
  setSortBy: (sort: SortType) => {
    set({ sortBy: sort, pageNum: 1, skillList: [], hasMore: true });
    get().loadList();
  },

  /** Change gender filter, triggers list reload */
  setGender: (gender: GenderType) => {
    set({ gender, pageNum: 1, skillList: [], hasMore: true });
    get().loadList();
  },

  /** Toggle quick tag selection (deselect if same tag clicked), triggers list reload */
  toggleQuickTag: (tagId: string | null) => {
    const current = get().activeQuickTag;
    set({
      activeQuickTag: current === tagId ? null : tagId,
      pageNum: 1,
      skillList: [],
      hasMore: true,
    });
    get().loadList();
  },

  /** Apply advanced filter panel selections, triggers list reload */
  setAdvancedFilters: (filters: SkillFiltersParams) => {
    set({
      advancedFilters: filters,
      pageNum: 1,
      skillList: [],
      hasMore: true,
    });
    get().loadList();
  },

  /** Reset all filters to defaults, triggers list reload */
  resetFilters: () => {
    set({
      sortBy: 'smart',
      gender: 'all',
      activeQuickTag: null,
      advancedFilters: {},
      pageNum: 1,
      skillList: [],
      hasMore: true,
    });
    get().loadList();
  },

  // --------------------------------------------------------------------------
  // STATE RESET
  // --------------------------------------------------------------------------

  /** Full store reset, typically on page unmount */
  reset: () => {
    set(initialState);
  },
}));

// ============================================================================
// SELECTOR HOOKS
// Optimized selectors to prevent unnecessary re-renders
// ============================================================================

/** Get full config object */
export const useSkillConfig = () => useSkillStore((s) => s.config);

/** Get tabs array for tab navigation */
export const useSkillTabs = () => useSkillStore((s) => s.tabs);

/** Get skill list items for rendering */
export const useSkillList = () => useSkillStore((s) => s.skillList);

/** Get current filter selections as grouped object */
export const useSkillFilters = () => useSkillStore((s) => ({
  activeTab: s.activeTab,
  sortBy: s.sortBy,
  gender: s.gender,
  activeQuickTag: s.activeQuickTag,
  advancedFilters: s.advancedFilters,
}));

/** Get all loading states as grouped object */
export const useSkillLoading = () => useSkillStore((s) => ({
  isConfigLoading: s.isConfigLoading,
  isListLoading: s.isListLoading,
  isRefreshing: s.isRefreshing,
  isLoadingMore: s.isLoadingMore,
}));
