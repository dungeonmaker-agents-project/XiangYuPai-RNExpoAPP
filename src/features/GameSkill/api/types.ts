/**
 * GameSkill API Types
 * Request/response type definitions for skill service list page
 * Covers: config fetching, list queries, filtering, ordering
 */

// ============================================================================
// REQUEST TYPES
// ============================================================================

/**
 * Sort type options for skill list ordering
 * smart: AI-recommended | newest: recently joined | recent: recently active
 * popular: by order count | price_asc/desc: by price
 */
export type SortType = 'smart' | 'newest' | 'recent' | 'popular' | 'price_asc' | 'price_desc';

/**
 * Gender filter options
 * all: no filter | male/female: specific gender
 */
export type GenderType = 'all' | 'male' | 'female';

/**
 * Advanced filter parameters for refined skill list queries
 * Supports status, region, rank, price range, position, tags, location filters
 */
export interface SkillFiltersParams {
  status?: 'all' | 'online' | 'active_3d' | 'active_7d';
  region?: string[];              // Server region: ['qq', 'wechat']
  rank?: string[];                // Game rank: ['glory_king', 'supreme_master']
  priceRange?: string;            // Price bucket: '4-9', '10-19', '20+'
  position?: string[];            // Game position: ['jungle', 'mid']
  tags?: string[];                // Service tags: ['peak', 'boost']
  location?: 'same_city';         // Location constraint
  cityCode?: string;              // City code for location filter
}

/**
 * Skill list query parameters
 * Primary request interface for fetching paginated skill service list
 * Supports filtering, sorting, pagination, and location-based queries
 */
export interface SkillListQueryParams {
  gameId: string;                 // Game identifier (e.g., "honor_of_kings")
  tabType?: string;               // Tab category: glory_king, online, boost, coach, companion, expert
  sortBy?: SortType;              // Sort strategy
  gender?: GenderType;            // Gender filter
  pageNum?: number;               // Page number (default: 1)
  pageSize?: number;              // Items per page (default: 20)
  latitude?: number;              // User latitude for distance calculation
  longitude?: number;             // User longitude for distance calculation
  filters?: SkillFiltersParams;   // Advanced filter criteria
}

// ============================================================================
// RESPONSE TYPES - CONFIG
// ============================================================================

/**
 * Generic option structure for dropdowns and selectors
 */
export interface OptionVO {
  value: string;
  label: string;
}

/**
 * Price range option with numeric boundaries
 * max is optional for open-ended ranges (e.g., "20+")
 */
export interface PriceRangeOptionVO {
  value: string;
  label: string;
  min: number;
  max?: number;
}

/**
 * Game information for page header display
 */
export interface GameInfoVO {
  gameId: string;
  gameName: string;
  icon?: string;
}

/**
 * Tab configuration for horizontal tab navigation
 */
export interface TabVO {
  value: string;
  label: string;
  count?: number;                 // Optional count badge
}

/**
 * Filter options configuration for filter panel
 * Contains all available filter criteria and their options
 */
export interface FilterOptionsVO {
  sortOptions: OptionVO[];
  genderOptions: OptionVO[];
  statusOptions: OptionVO[];
  regionOptions: OptionVO[];
  rankOptions: OptionVO[];
  priceRangeOptions: PriceRangeOptionVO[];
  positionOptions: OptionVO[];
  tagOptions: OptionVO[];
}

/**
 * Quick tag for one-tap filter shortcuts
 * Maps to specific filter key-value pairs
 */
export interface QuickTagVO {
  id: string;
  label: string;
  icon?: string;
  filterKey: string;              // Target filter parameter key
  filterValue: string;            // Filter value to apply
}

/**
 * Skill config response containing all page initialization data
 * Fetched once on page load, provides tabs, filters, and game info
 */
export interface SkillConfigResponse {
  gameInfo: GameInfoVO;
  tabs: TabVO[];
  filterOptions: FilterOptionsVO;
  quickTags: QuickTagVO[];
}

// ============================================================================
// RESPONSE TYPES - SKILL LIST
// ============================================================================

/**
 * Avatar display data for skill card
 */
export interface AvatarDataVO {
  avatarUrl: string;
}

/**
 * Basic user info for skill card display
 */
export interface BasicDataVO {
  nickname: string;
  gender: 'male' | 'female' | 'other';
  age?: number;
  distance?: number;              // Distance in meters from user
  distanceDisplay?: string;       // Formatted string: "3.2km"
  isOnline: boolean;
}

/**
 * Verification badges for trust indicators
 */
export interface VerificationDataVO {
  isRealVerified: boolean;        // Real-name verification
  isGodVerified: boolean;         // God-level skill verification
  isVip: boolean;                 // VIP membership status
}

/**
 * Game-specific attributes for skill display
 */
export interface GameAttrsVO {
  position?: string[];            // Game positions: ['jungle', 'mid']
  tags?: string[];                // Service tags: ['peak', 'boost']
}

/**
 * Skill service details for card display
 */
export interface SkillDataVO {
  skillName: string;
  gameName: string;
  gameRank?: string;              // Current game rank
  peakScore?: number;             // Peak score/rating achieved
  server?: string;                // Game server region
  gameAttrs?: GameAttrsVO;        // Additional game attributes
  description?: string;           // Service description
  rating: number;                 // Service rating (0-5)
  orderCount: number;             // Total orders completed
}

/**
 * Price information for skill service
 */
export interface PriceDataVO {
  price: number;                  // Numeric price value
  unit: string;                   // Price unit (e.g., "gold_coin")
  displayText: string;            // Formatted display: "10 gold/game"
}

/**
 * Complete skill service item for list card rendering
 * Aggregates all display data for a single skill card
 */
export interface SkillServiceItemVO {
  skillId: number;
  userId: number;
  avatarData: AvatarDataVO;
  basicData: BasicDataVO;
  verificationData: VerificationDataVO;
  skillData: SkillDataVO;
  priceData: PriceDataVO;
}

/**
 * Skill list response with pagination metadata
 */
export interface SkillListResponse {
  list: SkillServiceItemVO[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

/**
 * Order creation parameters
 */
export interface SkillOrderParams {
  skillId: number;
  quantity: number;
  serviceType?: string;           // Optional service variant
}

/**
 * Order creation response
 */
export interface SkillOrderResponse {
  success: boolean;
  orderId?: string;
  message?: string;
}
