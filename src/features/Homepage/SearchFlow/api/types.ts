/**
 * Search API Types - 搜索功能API类型定义
 * 基于接口文档: 首页搜索功能接口文档.md
 */

// ============================================
// 1. 打开搜索页面 - GET /api/search/init
// ============================================

export interface GetSearchInitRequest {
  // 无参数,从token获取当前用户ID
}

export interface SearchHistoryItem {
  keyword: string;
  searchTime: string;
  type?: 'user' | 'topic' | 'order';
}

export interface HotKeyword {
  keyword: string;
  rank?: number;
  isHot?: boolean;
}

export interface GetSearchInitResponse {
  code: number;
  message: string;
  data: {
    searchHistory: SearchHistoryItem[];
    hotKeywords: HotKeyword[];
    placeholder: string;
  };
}

// ============================================
// 2. 获取搜索建议 - GET /api/search/suggest
// ============================================

export interface GetSearchSuggestRequest {
  keyword: string;
  limit?: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'user' | 'topic' | 'keyword';
  highlight?: string;
  icon?: string;
  extra?: string;
}

export interface GetSearchSuggestResponse {
  code: number;
  message: string;
  data: {
    suggestions: SearchSuggestion[];
  };
}

// ============================================
// 3. 执行搜索 - POST /api/search/search
// ============================================

export interface ExecuteSearchRequest {
  keyword: string;
  type: 'all' | 'user' | 'order' | 'topic';
  pageNum: number;
  pageSize: number;
  filters?: {
    cityCode?: string;
    districtCode?: string;
    gender?: 'all' | 'male' | 'female';
    sortBy?: string;
  };
}

export interface SearchTab {
  type: 'all' | 'user' | 'order' | 'topic';
  label: string;
  count: number;
}

export interface ExecuteSearchResponse {
  code: number;
  message: string;
  data: {
    keyword: string;
    total: number;
    hasMore: boolean;
    tabs: SearchTab[];
    results: any; // 根据type返回不同结构
  };
}

// ============================================
// 4. 搜索结果 - 全部Tab - GET /api/search/all
// ============================================

export interface GetSearchAllRequest {
  keyword: string;
  pageNum: number;
  pageSize: number;
}

export interface PostSearchResult {
  postId: number;
  title?: string;
  description: string;
  thumbnail: string;
  mediaType: 'image' | 'video';
  isVideo: boolean;
  author: {
    userId: number;
    avatar: string;
    nickname: string;
  };
  stats: {
    likes: number;
    comments?: number;
    views?: number;
  };
}

export interface UserSearchResult {
  userId: number;
  avatar: string;
  nickname: string;
  signature?: string;
  isVerified: boolean;
}

export interface AllSearchItem {
  itemType: 'post' | 'video' | 'user';
  itemId: number;
  post?: PostSearchResult;
  user?: UserSearchResult;
}

export interface GetSearchAllResponse {
  code: number;
  message: string;
  data: {
    total: number;
    hasMore: boolean;
    list: AllSearchItem[];
  };
}

// ============================================
// 5. 搜索结果 - 用户Tab - GET /api/search/users
// ============================================

export interface GetSearchUsersRequest {
  keyword: string;
  pageNum: number;
  pageSize: number;
  gender?: 'all' | 'male' | 'female';
}

export interface UserResult {
  userId: number;
  avatar: string;
  nickname: string;
  age?: number;
  gender: 'male' | 'female';
  signature?: string;
  isVerified: boolean;
  verifiedLabel?: string;
  relationStatus: 'none' | 'following' | 'followed' | 'mutual';
  tags?: string[];
  stats?: {
    followers?: number;
    posts?: number;
  };
}

export interface GetSearchUsersResponse {
  code: number;
  message: string;
  data: {
    total: number;
    hasMore: boolean;
    list: UserResult[];
  };
}

// ============================================
// 6. 搜索结果 - 下单Tab - GET /api/search/orders
// ============================================

export interface GetSearchOrdersRequest {
  keyword: string;
  pageNum: number;
  pageSize: number;
  filters?: {
    cityCode?: string;
    districtCode?: string;
    gender?: 'all' | 'male' | 'female';
    priceRange?: string[];
    sortBy?: string;
  };
}

export interface OrderTag {
  text: string;
  type: 'feature' | 'price' | 'skill';
  color?: string;
}

export interface OrderPrice {
  amount: number;
  unit: 'per_order' | 'per_hour' | 'per_game';
  displayText: string;
}

export interface OrderResult {
  userId: number;
  avatar: string;
  nickname: string;
  gender: 'male' | 'female';
  age?: number;
  distance: number;
  tags: OrderTag[];
  description: string;
  price: OrderPrice;
  isOnline: boolean;
  skills?: Array<{
    name: string;
    level?: string;
  }>;
  stats?: {
    orders?: number;
    rating?: number;
  };
}

export interface GetSearchOrdersResponse {
  code: number;
  message: string;
  data: {
    total: number;
    hasMore: boolean;
    list: OrderResult[];
  };
}

// ============================================
// 7. 搜索结果 - 话题Tab - GET /api/search/topics
// ============================================

export interface GetSearchTopicsRequest {
  keyword: string;
  pageNum: number;
  pageSize: number;
  sortBy?: 'relevance' | 'hot' | 'new';
}

export interface TopicResult {
  topicId: number;
  topicName: string;
  icon?: string;
  description: string;
  isHot: boolean;
  hotLabel?: string;
  stats: {
    posts: number;
    views?: number;
    followers?: number;
  };
  category?: string;
}

export interface GetSearchTopicsResponse {
  code: number;
  message: string;
  data: {
    total: number;
    hasMore: boolean;
    list: TopicResult[];
  };
}

// ============================================
// 8. 删除搜索历史 - DELETE /api/search/history
// ============================================

export interface DeleteSearchHistoryRequest {
  keyword?: string;
  clearAll?: boolean;
}

export interface DeleteSearchHistoryResponse {
  code: number;
  message: string;
  data: {
    success: boolean;
  };
}

// ============================================
// 9. 关注/取消关注用户 - POST /api/user/follow
// ============================================

export interface FollowUserRequest {
  targetUserId: number;
  action: 'follow' | 'unfollow';
}

export interface FollowUserResponse {
  code: number;
  message: string;
  data: {
    success: boolean;
    relationStatus: 'none' | 'following' | 'followed' | 'mutual';
  };
}
