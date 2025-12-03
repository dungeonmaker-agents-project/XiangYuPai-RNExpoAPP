/**
 * API配置文件
 * 统一管理API基础配置、环境变量、请求配置等
 */

import { Platform } from 'react-native';

/**
 * 🤖 自动检测环境并返回正确的API地址
 * 
 * 关键：Android模拟器访问主机需要使用特殊IP
 * - Android Studio模拟器: 10.0.2.2
 * - iOS模拟器: localhost
 * - 真实设备: 主机局域网IP
 */
const getDevApiUrl = (): string => {
  // 优先使用环境变量（可以覆盖自动检测）
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    console.log('[API Config] 📌 使用环境变量配置:', process.env.EXPO_PUBLIC_API_BASE_URL);
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // 根据平台自动选择
  if (Platform.OS === 'android') {
    // 🔧 使用主机实际IP（10.0.2.2映射不稳定）
    console.log('[API Config] 🤖 检测到Android环境，使用主机实际IP: 192.168.1.108:8080');
    // return 'http://192.168.1.108:8080';
    return 'http://10.0.2.2:8080';  // ❌ 映射不稳定，已禁用
  } else if (Platform.OS === 'ios') {
    // iOS模拟器可以直接使用localhost
    console.log('[API Config] 🍎 检测到iOS环境，使用 localhost:8080');
    return 'http://localhost:8080';
  } else {
    // Web环境
    console.log('[API Config] 🌐 检测到Web环境，使用 localhost:8080');
    return 'http://localhost:8080';
  }
};

// API环境配置
export const API_CONFIG = {
  // 基础URL配置
  BASE_URL: {
    development: getDevApiUrl(),  // 🆕 自动检测平台并使用正确IP
    staging: 'https://staging-api.xiangyupai.com',
    production: 'https://api.xiangyupai.com',
    mock: 'http://localhost:3000',
  },
  
  // 当前环境（支持环境变量覆盖）
  ENVIRONMENT: process.env.EXPO_PUBLIC_API_ENV || (__DEV__ ? 'development' : 'production'),
  
  // 请求超时配置
  TIMEOUT: {
    DEFAULT: 10000, // 10秒
    UPLOAD: 30000,  // 30秒
    DOWNLOAD: 60000, // 60秒
  },
  
  // 重试配置
  RETRY: {
    COUNT: 3,
    DELAY: 1000, // 1秒
    BACKOFF: 1.5, // 指数退避因子
  },
  
  // 分页配置
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  
  // 缓存配置
  CACHE: {
    TTL: 5 * 60 * 1000, // 5分钟
    MAX_SIZE: 50, // 最大缓存条数
  },
};

// API端点配置（基于RuoYi-Cloud-Plus后端实际路径）
export const API_ENDPOINTS = {
  // 首页相关（待后端实现的专用接口 - xypai-user模块）
  // ⚠️ 注意：通过网关访问需要加 /xypai-user 前缀
  HOMEPAGE: {
    CONFIG: '/xypai-user/api/v1/homepage/config',
    DATA: '/xypai-user/api/v1/homepage/data',
    FEATURED_USERS: '/xypai-user/api/v1/homepage/featured-users',
    BANNER: '/xypai-user/api/v1/homepage/banner',
    SERVICES: '/xypai-user/api/v1/homepage/services',
    STATISTICS: '/xypai-user/api/v1/homepage/statistics',
    HOT_KEYWORDS: '/xypai-user/api/v1/homepage/hot-keywords',
    
    // 首页用户查询（集成筛选）
    USER_LIST: '/xypai-user/api/v1/homepage/users/list',
    NEARBY_USERS: '/xypai-user/api/v1/homepage/nearby-users',       // ✅ 后端已实现
    RECOMMENDED_USERS: '/xypai-user/api/v1/homepage/recommended-users', // ✅ 后端已实现
    NEW_USERS: '/xypai-user/api/v1/homepage/new-users',            // ✅ 后端已实现
    RECOMMEND_USERS: '/xypai-user/api/v1/homepage/users/recommend', // 兼容旧代码
    LATEST_USERS: '/xypai-user/api/v1/homepage/users/latest',      // 兼容旧代码
  },
  
  // 用户资料相关（已有接口 - xypai-user模块）
  // ⚠️ 注意：通过网关访问需要加 /xypai-user 前缀
  PROFILE: {
    // 用户资料查询
    USER_PROFILE: '/xypai-user/api/v1/user/profile',           // GET/PUT /{userId}
    CURRENT_PROFILE: '/xypai-user/api/v1/user/profile/current', // GET/PUT
    
    // 在线状态
    ONLINE_STATUS: '/xypai-user/api/v2/user/profile/:userId/online-status', // PUT
    IS_ONLINE: '/xypai-user/api/v2/user/profile/:userId/is-online',         // GET
    GO_ONLINE: '/xypai-user/api/v2/user/profile/current/go-online',         // PUT
    GO_OFFLINE: '/xypai-user/api/v2/user/profile/current/go-offline',       // PUT
    GO_INVISIBLE: '/xypai-user/api/v2/user/profile/current/go-invisible',   // PUT
    
    // 资料完整度
    COMPLETENESS: '/xypai-user/api/v2/user/profile/:userId/completeness',    // GET
    CURRENT_COMPLETENESS: '/xypai-user/api/v2/user/profile/current/completeness', // GET
  },
  
  // 用户统计相关（已有接口 - xypai-user模块）
  USER_STATS: {
    STATS: '/xypai-user/api/v1/users/stats',                  // GET /{userId}
    CURRENT: '/xypai-user/api/v1/users/stats/current',        // GET
    BATCH: '/xypai-user/api/v1/users/stats/batch',            // POST
    POPULAR: '/xypai-user/api/v1/users/stats/popular',        // GET
    QUALITY_ORGANIZERS: '/xypai-user/api/v1/users/stats/quality-organizers', // GET
    
    // 统计增减（内部服务）
    INCREMENT_LIKE: '/xypai-user/api/v1/users/stats/:userId/like/increment',
    INCREMENT_FOLLOWER: '/xypai-user/api/v1/users/stats/:userId/follower/increment',
    DECREMENT_FOLLOWER: '/xypai-user/api/v1/users/stats/:userId/follower/decrement',
    INCREMENT_CONTENT: '/xypai-user/api/v1/users/stats/:userId/content/increment',
    REFRESH_CACHE: '/xypai-user/api/v1/users/stats/:userId/refresh',
  },
  
  // 职业标签相关（已有接口 - xypai-user模块）
  OCCUPATION: {
    USER: '/xypai-user/api/v1/occupation/user',               // GET/PUT /{userId}
    CURRENT: '/xypai-user/api/v1/occupation/current',          // GET/PUT
    LIST: '/xypai-user/api/v1/occupation/list',                // GET 所有职业
    CATEGORY: '/xypai-user/api/v1/occupation/category',        // GET /{category}
    CATEGORIES: '/xypai-user/api/v1/occupation/categories',    // GET 所有分类
    ADD: '/xypai-user/api/v1/occupation/user/:userId/add',     // POST
    REMOVE: '/xypai-user/api/v1/occupation/user/:userId/remove', // DELETE
    CLEAR: '/xypai-user/api/v1/occupation/user/:userId/clear',  // DELETE
    HAS: '/xypai-user/api/v1/occupation/user/:userId/has',      // GET
    BY_CODE: '/xypai-user/api/v1/occupation/:occupationCode/users', // GET
    COUNT_BY_CODE: '/xypai-user/api/v1/occupation/:occupationCode/count', // GET
  },
  
  // 用户管理相关（已有接口 - xypai-user模块）
  USER: {
    LIST: '/xypai-user/api/v1/users/list',                    // UserController
    DETAIL: '/xypai-user/api/v1/users',                        // GET /{userId}
    PROFILE: '/xypai-user/api/v1/users/profile',               // GET/PUT 当前用户
    ADD: '/xypai-user/api/v1/users',                           // POST
    UPDATE: '/xypai-user/api/v1/users',                        // PUT
    DELETE: '/xypai-user/api/v1/users/:userIds',               // DELETE
    CHANGE_STATUS: '/xypai-user/api/v1/users/:userId/status',  // PUT
    RESET_PASSWORD: '/xypai-user/api/v1/users/:userId/reset-password', // PUT
    CHECK_USERNAME: '/xypai-user/api/v1/users/check-username',  // GET
    CHECK_MOBILE: '/xypai-user/api/v1/users/check-mobile',      // GET
  },
  
  // 内容相关（已有接口 - xypai-content模块）
  // ⚠️ 注意：通过网关访问需要加 /xypai-content 前缀
  CONTENT: {
    LIST: '/xypai-content/api/v1/contents/list',                // ContentController
    DETAIL: '/xypai-content/api/v1/contents/:contentId',
    HOT: '/xypai-content/api/v1/contents/hot',
    RECOMMENDED: '/xypai-content/api/v1/contents/recommended',
    NEARBY: '/xypai-content/api/v1/contents/nearby',             // v7.1空间索引查询
    BY_CITY: '/xypai-content/api/v1/contents/city/:cityId',     // v7.1城市内容
    SEARCH: '/xypai-content/api/v1/contents/search',
    USER_CONTENTS: '/xypai-content/api/v1/contents/user/:userId',
    MY_CONTENTS: '/xypai-content/api/v1/contents/my',
  },

  // Feed流相关（已有接口 - xypai-content模块 FeedController）
  // ⚠️ 注意：通过网关访问需要加 /xypai-content 前缀
  FEED: {
    LIST: '/xypai-content/api/v1/content/feed/:tabType',        // GET - tabType: follow/hot/local
    DETAIL: '/xypai-content/api/v1/content/detail/:feedId',     // GET - 动态详情
    PUBLISH: '/xypai-content/api/v1/content/publish',           // POST - 发布动态
    DELETE: '/xypai-content/api/v1/content/:feedId',            // DELETE - 删除动态
  },
  
  // 评论相关（v7.1新增 - xypai-content模块）
  COMMENT: {
    ADD: '/xypai-content/api/v1/comments',                       // CommentController
    DELETE: '/xypai-content/api/v1/comments/:commentId',
    LIST: '/xypai-content/api/v1/comments/content/:contentId',   // 评论列表
    REPLIES: '/xypai-content/api/v1/comments/:parentId/replies', // 评论回复
    LIKE: '/xypai-content/api/v1/comments/:commentId/like',      // 评论点赞
    TOP: '/xypai-content/api/v1/comments/:commentId/top',        // 置顶评论
    COUNT: '/xypai-content/api/v1/comments/count/:contentId',    // 统计评论
  },
  
  // 内容互动（已有 - xypai-content模块 InteractionController）
  // ⚠️ 注意：通过网关访问需要加 /xypai-content 前缀
  INTERACTION: {
    LIKE: '/xypai-content/api/v1/interaction/like',              // POST - 点赞/取消点赞
    COLLECT: '/xypai-content/api/v1/interaction/collect',        // POST - 收藏/取消收藏
    SHARE: '/xypai-content/api/v1/interaction/share',            // POST - 分享
    // 旧接口（保留兼容）
    LIKE_OLD: '/xypai-content/api/v1/content-actions/like/:contentId',
    UNLIKE_OLD: '/xypai-content/api/v1/content-actions/like/:contentId',  // DELETE
    COLLECT_OLD: '/xypai-content/api/v1/content-actions/collect/:contentId',
    UNCOLLECT_OLD: '/xypai-content/api/v1/content-actions/collect/:contentId', // DELETE
    SHARE_OLD: '/xypai-content/api/v1/content-actions/share/:contentId',
    STATUS: '/xypai-content/api/v1/content-actions/:contentId/status',      // 用户互动状态
    STATISTICS: '/xypai-content/api/v1/content-actions/:contentId/statistics', // 统计数据
  },
  
  // 草稿相关（v7.1新增 - xypai-content模块）
  DRAFT: {
    SAVE: '/xypai-content/api/v1/drafts/save',
    GET: '/xypai-content/api/v1/drafts/:draftId',
    MY_DRAFTS: '/xypai-content/api/v1/drafts/my',
    DELETE: '/xypai-content/api/v1/drafts/:draftId',
    PUBLISH: '/xypai-content/api/v1/drafts/:draftId/publish',
    COUNT: '/xypai-content/api/v1/drafts/count',
  },
  
  // 位置相关（待实现 - xypai-user模块）
  LOCATION: {
    CITIES: '/xypai-user/api/v1/location/cities',
    CITY_DETAIL: '/xypai-user/api/v1/location/cities/:cityId',
    DISTRICTS: '/xypai-user/api/v1/location/cities/:cityId/districts',
    HOT_CITIES: '/xypai-user/api/v1/location/cities/hot',
    SEARCH_CITIES: '/xypai-user/api/v1/location/cities/search',
    CURRENT: '/xypai-user/api/v1/location/current',
    GEOCODE: '/xypai-user/api/v1/location/geocode',
    REVERSE_GEOCODE: '/xypai-user/api/v1/location/reverse-geocode',
  },
  
  // 服务相关（待实现 - xypai-user模块）
  SERVICE: {
    TYPES: '/xypai-user/api/v1/services/types',
    CONFIG: '/xypai-user/api/v1/services/:type/config',
    USERS: '/xypai-user/api/v1/services/:type/users',
    DETAIL: '/xypai-user/api/v1/services/:type/:serviceId',
    GAME_SERVICE: '/xypai-user/api/v1/services/game/:serviceId',
    LIFE_SERVICE: '/xypai-user/api/v1/services/life/:serviceId',
  },
  
  // Profile 页面专用端点（✅ 后端已测试通过）
  // 测试文件参考: AppProfilePageTest.java, AppOtherUserProfilePageTest.java, AppEditProfilePageTest.java
  PROFILE_PAGE: {
    // 页面数据加载
    EDIT: '/xypai-user/api/user/profile/edit',           // GET 编辑页面数据
    HEADER: '/xypai-user/api/user/profile/header',       // GET 主页头部
    OTHER: '/xypai-user/api/user/profile/other',         // GET /{userId} 他人主页
    INFO: '/xypai-user/api/user/profile/info',           // GET 资料详情

    // Tab 数据（需要调用 xypai-content）
    // ⚠️ 前端应直接调用 xypai-content 服务
    // POSTS: '/xypai-content/api/v1/content/feed/user',  // GET /{userId} 动态列表
    // FAVORITES: '/xypai-content/api/v1/interaction/collect/my', // GET 收藏列表
    // LIKES: '/xypai-content/api/v1/interaction/like/my',        // GET 点赞列表

    // 单字段更新
    UPDATE_NICKNAME: '/xypai-user/api/user/profile/nickname',     // PUT
    UPDATE_GENDER: '/xypai-user/api/user/profile/gender',         // PUT
    UPDATE_BIRTHDAY: '/xypai-user/api/user/profile/birthday',     // PUT
    UPDATE_RESIDENCE: '/xypai-user/api/user/profile/residence',   // PUT
    UPDATE_HEIGHT: '/xypai-user/api/user/profile/height',         // PUT
    UPDATE_WEIGHT: '/xypai-user/api/user/profile/weight',         // PUT
    UPDATE_OCCUPATION: '/xypai-user/api/user/profile/occupation', // PUT
    UPDATE_WECHAT: '/xypai-user/api/user/profile/wechat',         // PUT
    UPDATE_BIO: '/xypai-user/api/user/profile/bio',               // PUT

    // 头像上传
    AVATAR_UPLOAD: '/xypai-user/api/user/profile/avatar/upload',  // POST multipart
  },

  // 技能管理端点（✅ 后端已测试通过）
  // 测试文件参考: AppSkillManagementPageTest.java
  SKILL: {
    // 配置
    CONFIG: '/xypai-user/api/skills/config',              // GET 技能配置（技能列表、段位选项等）

    // 创建
    CREATE_ONLINE: '/xypai-user/api/user/skills/online',   // POST 创建线上技能
    CREATE_OFFLINE: '/xypai-user/api/user/skills/offline', // POST 创建线下技能

    // 查询
    MY_LIST: '/xypai-user/api/user/skills/my',             // GET 我的技能列表
    DETAIL: '/xypai-user/api/user/skills',                 // GET /{skillId}
    USER_LIST: '/xypai-user/api/user/skills/user',         // GET /{userId}
    NEARBY: '/xypai-user/api/user/skills/nearby',          // GET 附近技能

    // 操作
    UPDATE: '/xypai-user/api/user/skills',                 // PUT /{skillId}
    DELETE: '/xypai-user/api/user/skills',                 // DELETE /{skillId}
    TOGGLE: '/xypai-user/api/user/skills',                 // PUT /{skillId}/toggle

    // 图片上传
    IMAGE_UPLOAD: '/xypai-user/api/skills/images/upload',  // POST 上传技能图片
  },

  // Content Tab 数据端点（动态/收藏/点赞 - xypai-content模块）
  // ⚠️ 这些接口数据来源于 xypai-content 模块
  CONTENT_TAB: {
    USER_FEED: '/xypai-content/api/v1/content/feed/user',     // GET /{userId} 用户动态列表（待实现）
    MY_COLLECT: '/xypai-content/api/v1/interaction/collect/my', // GET 我的收藏列表（待实现）
    MY_LIKE: '/xypai-content/api/v1/interaction/like/my',       // GET 我的点赞列表（已存在）
  },

  // 用户关系相关（已有接口 - xypai-user模块 RelationController）
  // ⚠️ 注意：通过网关访问需要加 /xypai-user 前缀
  RELATION: {
    // 关注相关（✅ 后端已实现）
    FOLLOW: '/xypai-user/api/user/relation/follow/:followingId',     // POST - 关注用户
    UNFOLLOW: '/xypai-user/api/user/relation/follow/:followingId',   // DELETE - 取消关注
    FOLLOWING: '/xypai-user/api/user/relation/following',            // GET - 关注列表
    FANS: '/xypai-user/api/user/relation/fans',                      // GET - 粉丝列表

    // 拉黑相关（✅ 后端已实现）
    BLOCK: '/xypai-user/api/user/relation/block/:blockedUserId',     // POST - 拉黑用户
    UNBLOCK: '/xypai-user/api/user/relation/block/:blockedUserId',   // DELETE - 取消拉黑

    // 举报相关（✅ 后端已实现）
    REPORT: '/xypai-user/api/user/relation/report/:reportedUserId',  // POST - 举报用户

    // 旧接口（保留兼容）
    FOLLOW_OLD: '/xypai-user/api/v1/relations/follow',             // POST/DELETE /{targetUserId}
    FOLLOWING_OLD: '/xypai-user/api/v1/relations/following',        // GET 当前用户关注列表
    FOLLOWERS_OLD: '/xypai-user/api/v1/relations/followers',        // GET 当前用户粉丝列表
    USER_RELATIONS: '/xypai-user/api/v1/relations',             // GET /{userId}/following|followers
    CHECK: '/xypai-user/api/v1/relations/check',                // GET /{targetUserId}
    STATISTICS: '/xypai-user/api/v1/relations/statistics',      // GET
    USER_STATISTICS: '/xypai-user/api/v1/relations/:userId/statistics', // GET
    BLOCKED: '/xypai-user/api/v1/relations/blocked',            // GET 拉黑列表
    BATCH_FOLLOW: '/xypai-user/api/v1/relations/batch-follow',  // POST
    BATCH_UNFOLLOW: '/xypai-user/api/v1/relations/batch-unfollow', // POST
  },

  // BFF聚合服务（xypai-app-bff模块）- 首页用户推荐流
  // ⚠️ 注意：通过网关访问需要加 /xypai-app-bff 前缀
  // 测试文件参考: AppHomeFeedTest.java, Page05_LimitedTimeTest.java, Page06_SearchTest.java, Page07_SearchResultsTest.java, Page08_ActivityListTest.java, Page09_ActivityDetailTest.java, Page10_PublishActivityTest.java, Page11_ServiceListTest.java, Page12_ServiceDetailTest.java
  BFF: {
    // 首页用户推荐流（✅ 后端已测试通过）
    HOME_FEED: '/xypai-app-bff/api/home/feed',              // GET ?type=online|offline&pageNum=1&pageSize=10&cityCode=440300

    // 首页筛选（⚠️ 待后端实现）
    FILTER_CONFIG: '/xypai-app-bff/api/home/filter/config', // GET ?type=online|offline
    FILTER_APPLY: '/xypai-app-bff/api/home/filter/apply',   // POST

    // 限时专享（✅ 后端已测试通过 - Page05_LimitedTimeTest.java）
    LIMITED_TIME_LIST: '/xypai-app-bff/api/home/limited-time/list', // GET ?pageNum=1&pageSize=10&sortBy=smart&gender=all&language=

    // 搜索页面（✅ 后端已测试通过 - Page06_SearchTest.java）
    SEARCH_INIT: '/xypai-app-bff/api/search/init',          // GET - 获取搜索初始数据（历史+热门）
    SEARCH_SUGGEST: '/xypai-app-bff/api/search/suggest',    // GET ?keyword=xxx&limit=10 - 获取搜索建议
    SEARCH_HISTORY: '/xypai-app-bff/api/search/history',    // DELETE - 删除搜索历史

    // 搜索结果页面（✅ 后端已测试通过 - Page07_SearchResultsTest.java）
    SEARCH_SEARCH: '/xypai-app-bff/api/search/search',      // POST - 执行综合搜索
    SEARCH_ALL: '/xypai-app-bff/api/search/all',            // GET ?keyword=xxx&pageNum=1&pageSize=10 - 全部Tab结果
    SEARCH_USERS: '/xypai-app-bff/api/search/users',        // GET ?keyword=xxx&pageNum=1&pageSize=10 - 用户Tab结果
    SEARCH_ORDERS: '/xypai-app-bff/api/search/orders',      // GET ?keyword=xxx&pageNum=1&pageSize=10 - 下单Tab结果
    SEARCH_TOPICS: '/xypai-app-bff/api/search/topics',      // GET ?keyword=xxx&pageNum=1&pageSize=10 - 话题Tab结果

    // 组局中心列表（✅ 后端已测试通过 - Page08_ActivityListTest.java）
    ACTIVITY_LIST: '/xypai-app-bff/api/activity/list',      // GET ?pageNum=1&pageSize=10&sortBy=smart_recommend&gender=all&memberCount=2-4&activityType=billiards

    // 组局详情（✅ 后端已测试通过 - Page09_ActivityDetailTest.java）
    ACTIVITY_DETAIL: '/xypai-app-bff/api/activity/detail',  // GET /{activityId} - 获取活动详情
    ACTIVITY_REGISTER: '/xypai-app-bff/api/activity/register', // POST - 报名参加活动
    ACTIVITY_REGISTER_CANCEL: '/xypai-app-bff/api/activity/register/cancel', // POST - 取消报名

    // 发布组局（✅ 后端已测试通过 - Page10_PublishActivityTest.java）
    ACTIVITY_PUBLISH_CONFIG: '/xypai-app-bff/api/activity/publish/config', // GET - 获取发布配置（活动类型、价格单位、人数选项、平台费规则）
    ACTIVITY_PUBLISH: '/xypai-app-bff/api/activity/publish', // POST - 发布活动
    ACTIVITY_PUBLISH_PAY: '/xypai-app-bff/api/activity/publish/pay', // POST - 支付平台费

    // 服务列表（✅ 后端已测试通过 - Page11_ServiceListTest.java）
    SERVICE_LIST: '/xypai-app-bff/api/service/list', // GET ?skillType=王者荣耀&pageNum=1&pageSize=10&tabType=glory_king|online|offline&sortBy=price_asc|rating_desc|orders_desc&gender=male|female

    // 服务详情（✅ 后端已测试通过 - Page12_ServiceDetailTest.java）
    SERVICE_DETAIL: '/xypai-app-bff/api/service/detail', // GET ?serviceId=xxx&userId=xxx - 获取服务详情
    SERVICE_REVIEWS: '/xypai-app-bff/api/service/reviews', // GET ?serviceId=xxx&pageNum=1&pageSize=10&filterBy=excellent|negative - 获取服务评价列表
  },

  // 通用服务（xypai-common模块）- 媒体上传、位置服务
  // 测试文件参考: Page02_PublishFeedTest.java
  COMMON: {
    // 媒体上传（✅ 后端已测试）
    MEDIA_UPLOAD: '/xypai-common/api/v1/media/upload',      // POST FormData: file, type(image|video)

    // 位置服务（✅ 后端已测试）
    LOCATION_NEARBY: '/xypai-common/api/v1/location/nearby',   // GET ?latitude=x&longitude=y&radius=5
    LOCATION_SEARCH: '/xypai-common/api/v1/location/search',   // GET ?keyword=xxx&page=1&pageSize=20
  },

  // 话题相关（xypai-content模块）
  // 测试文件参考: Page02_PublishFeedTest.java
  TOPIC: {
    HOT: '/xypai-content/api/v1/content/topics/hot',         // GET ?page=1&pageSize=20
    SEARCH: '/xypai-content/api/v1/content/topics/search',   // GET ?keyword=xxx&page=1&pageSize=20
  },

  // 配置相关（系统配置 - ruoyi-system模块）
  CONFIG: {
    COMPONENT: '/system/api/v1/config/components/:id',
    THEME: '/system/api/v1/config/theme',
    SYSTEM: '/system/api/v1/config/system',
    FEATURES: '/system/api/v1/config/features',
  },
  
  // 认证相关（xypai-auth模块）- 完全对接后端API
  // ⚠️ 所有接口带 /api 前缀，通过Gateway访问
  AUTH: {
    // 登录相关
    LOGIN_PASSWORD: '/xypai-auth/api/auth/login/password',   // 密码登录
    LOGIN_SMS: '/xypai-auth/api/auth/login/sms',             // SMS验证码登录（自动注册）
    LOGOUT: '/xypai-auth/api/auth/logout',                   // 登出
    REFRESH: '/xypai-auth/api/auth/token/refresh',           // 刷新Token

    // 短信验证码相关
    SMS_SEND: '/xypai-auth/api/auth/sms/send',               // 发送验证码（LOGIN/RESET_PASSWORD）

    // 密码重置相关
    PASSWORD_RESET_VERIFY: '/xypai-auth/api/auth/password/reset/verify',   // 验证重置密码验证码
    PASSWORD_RESET_CONFIRM: '/xypai-auth/api/auth/password/reset/confirm', // 重置密码

    // 以下接口暂未实现，保留配置供后续使用
    // VERIFY: '/xypai-auth/api/auth/verify',                 // 验证令牌（未实现）
    // HEARTBEAT: '/xypai-auth/api/auth/heartbeat',           // 心跳保活（未实现）
    // HEALTH: '/xypai-auth/api/auth/health',                 // 健康检查（未实现）
    // SMS_VERIFY: '/xypai-auth/api/auth/sms/verify',         // 单独验证验证码（未实现）
    // USER_EXISTS: '/xypai-auth/api/auth/user/exists',       // 检查用户是否存在（未实现）
  },
  
  // 上传相关（resource模块）
  UPLOAD: {
    IMAGE: '/resource/api/v1/upload/image',
    VIDEO: '/resource/api/v1/upload/video',
    AVATAR: '/resource/api/v1/upload/avatar',
    FILE: '/resource/api/v1/upload/file',
  },
  
  // 分析相关（待实现 - xypai-user模块）
  ANALYTICS: {
    EVENTS: '/xypai-user/api/v1/analytics/events',
    BATCH_EVENTS: '/xypai-user/api/v1/analytics/events/batch',
    PAGE_VIEW: '/xypai-user/api/v1/analytics/page-view',
  },
};

// HTTP状态码配置
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const;

// 错误类型配置
export const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

// 请求头配置
export const REQUEST_HEADERS = {
  CONTENT_TYPE: {
    JSON: 'application/json',
    FORM_DATA: 'multipart/form-data',
    URL_ENCODED: 'application/x-www-form-urlencoded',
  },
  ACCEPT: {
    JSON: 'application/json',
    TEXT: 'text/plain',
    HTML: 'text/html',
  },
} as const;

// 获取当前环境的API基础URL
export const getBaseURL = (): string => {
  return API_CONFIG.BASE_URL[API_CONFIG.ENVIRONMENT as keyof typeof API_CONFIG.BASE_URL];
};

// 构建完整的API URL
export const buildURL = (endpoint: string, params?: Record<string, string>): string => {
  let url = getBaseURL() + endpoint;
  
  // 替换URL参数
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, encodeURIComponent(value));
    });
  }
  
  return url;
};

// 构建查询参数
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
};

// API版本配置
export const API_VERSION = {
  V1: 'v1',
  V2: 'v2',
  CURRENT: 'v1',
} as const;
