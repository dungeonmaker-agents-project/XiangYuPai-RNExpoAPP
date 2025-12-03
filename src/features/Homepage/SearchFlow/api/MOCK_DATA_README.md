# 搜索功能Mock数据使用说明

## 概述

为了方便前端开发和测试，已经为所有搜索接口创建了完整的Mock测试数据。你可以在不需要后端API的情况下，完整测试搜索功能的所有流程。

## 🔧 如何使用

### 切换Mock模式

在 `searchApi.ts` 文件中修改 `USE_MOCK_DATA` 常量：

```typescript
/**
 * 🧪 测试模式开关
 * true: 使用Mock数据（用于前端开发测试）
 * false: 使用真实API（用于后端联调和生产环境）
 */
const USE_MOCK_DATA = true;  // 👈 修改这里来切换模式
```

- **`true`** - 使用Mock数据（当前设置）
- **`false`** - 使用真实API

## 📦 Mock数据内容

### 1. 搜索初始数据 (`mockSearchInitData`)

**包含内容：**
- 4条搜索历史记录
- 6个热门关键词
- 占位符文本

**示例：**
```typescript
{
  searchHistory: [
    { keyword: '王者荣耀', searchTime: '...', type: 'topic' },
    { keyword: '英雄联盟陪玩', searchTime: '...', type: 'order' },
    // ...
  ],
  hotKeywords: [
    { keyword: '王者荣耀', rank: 1, isHot: true },
    { keyword: '英雄联盟', rank: 2, isHot: true },
    // ...
  ],
  placeholder: '搜索用户、服务或话题'
}
```

### 2. 搜索建议 (`generateMockSuggestions`)

**动态生成：** 根据输入关键词生成相关建议

**示例：** 输入"王者"
```typescript
{
  suggestions: [
    { text: '王者高手', type: 'user', icon: '...', extra: '1.2万粉丝' },
    { text: '王者陪玩', type: 'keyword', icon: '🔍', extra: '热门搜索' },
    { text: '#王者', type: 'topic', icon: '...', extra: '8.5万讨论' },
    // ...
  ]
}
```

### 3. 用户搜索结果 (`mockSearchUsersData`)

**包含：** 5个用户数据

**特点：**
- 包含不同年龄、性别
- 不同关注状态（none/following/mutual/followed）
- 实名认证标识
- 用户标签和统计数据

**用户示例：**
```typescript
{
  userId: 1001,
  nickname: '王者荣耀112',
  age: 22,
  gender: 'male',
  signature: '国服李白，带你上王者！',
  isVerified: true,
  relationStatus: 'none',
  tags: ['王者荣耀', '电竞', '上分'],
  stats: { followers: 1250, posts: 89 }
}
```

### 4. 下单搜索结果 (`mockSearchOrdersData`)

**包含：** 3个可接单用户

**特点：**
- 包含价格信息（金币/局、金币/小时）
- 距离信息
- 在线状态
- 技能标签
- 接单统计和评分

**示例：**
```typescript
{
  userId: 2001,
  nickname: '甜心陪玩',
  distance: 2.3,
  tags: [
    { text: '可线上', type: 'feature' },
    { text: '10元/局', type: 'price' },
    { text: '王者荣耀', type: 'skill' }
  ],
  price: {
    amount: 10,
    unit: 'per_game',
    displayText: '10 金币/局'
  },
  isOnline: true,
  stats: { orders: 156, rating: 4.9 }
}
```

### 5. 话题搜索结果 (`mockSearchTopicsData`)

**包含：** 4个话题

**特点：**
- 话题图标
- 热门标签
- 帖子数、浏览量、关注数统计
- 分类信息

**示例：**
```typescript
{
  topicId: 3001,
  topicName: '王者荣耀',
  icon: 'https://...',
  description: '王者荣耀游戏交流、攻略分享、陪玩推荐',
  isHot: true,
  hotLabel: '热门',
  stats: {
    posts: 125680,
    views: 5680000,
    followers: 89500
  },
  category: '游戏'
}
```

### 6. 全部Tab混合结果 (`mockSearchAllData`)

**包含：**
- 1个用户
- 1个帖子（图片）
- 1个视频

展示了混合内容类型的搜索结果。

## 🎯 分页数据生成

Mock数据支持分页功能，提供了3个工具函数：

### `generatePaginatedUsers(pageNum, pageSize)`
根据页码和每页数量返回用户列表，支持真实的分页逻辑。

### `generatePaginatedOrders(pageNum, pageSize)`
返回分页的下单用户数据。

### `generatePaginatedTopics(pageNum, pageSize)`
返回分页的话题数据。

**示例使用：**
```typescript
// 第1页，每页2条
const page1 = generatePaginatedUsers(1, 2);
// 返回: { total: 5, hasMore: true, list: [用户1, 用户2] }

// 第2页，每页2条
const page2 = generatePaginatedUsers(2, 2);
// 返回: { total: 5, hasMore: true, list: [用户3, 用户4] }

// 第3页，每页2条
const page3 = generatePaginatedUsers(3, 2);
// 返回: { total: 5, hasMore: false, list: [用户5] }
```

## ⏱️ 模拟延迟

为了模拟真实的网络请求，Mock数据会添加延迟：

- 搜索初始化：300ms
- 搜索建议：200ms
- 搜索执行：400ms
- 其他接口：350ms
- 删除历史：200ms
- 关注操作：300ms

可以在 `mockDelay()` 函数中调整延迟时间。

## 📝 使用示例

### 完整测试流程

```typescript
// 1. 打开搜索页面
const initData = await searchApiService.getSearchInit();
// 返回Mock历史记录和热门关键词

// 2. 输入搜索关键词
const suggestions = await searchApiService.getSearchSuggest('王者', 10);
// 返回动态生成的建议

// 3. 执行搜索
const searchResult = await searchApiService.executeSearch({
  keyword: '王者荣耀',
  type: 'all',
  pageNum: 1,
  pageSize: 20,
});
// 返回综合搜索结果

// 4. 获取用户Tab数据（支持分页）
const usersPage1 = await searchApiService.getSearchUsers({
  keyword: '王者',
  pageNum: 1,
  pageSize: 2,
});
// 返回: { total: 5, hasMore: true, list: [2个用户] }

const usersPage2 = await searchApiService.getSearchUsers({
  keyword: '王者',
  pageNum: 2,
  pageSize: 2,
});
// 返回: { total: 5, hasMore: true, list: [下2个用户] }

// 5. 关注用户
const followResult = await searchApiService.followUser({
  targetUserId: 1001,
  action: 'follow',
});
// 返回: { success: true, relationStatus: 'following' }

// 6. 删除搜索历史
const deleteResult = await searchApiService.deleteSearchHistory({
  keyword: '王者荣耀',
});
// 返回: { success: true }
```

## 🎨 界面测试覆盖

使用Mock数据可以完整测试以下界面：

### ✅ SearchMainPage
- [x] 搜索历史显示（4条记录）
- [x] 热门搜索显示（6个关键词）
- [x] 搜索建议实时显示
- [x] 历史记录删除
- [x] 清空所有历史

### ✅ SearchResultsPage - 全部Tab
- [x] 混合内容展示（用户+帖子+视频）
- [x] 不同类型卡片渲染

### ✅ SearchResultsPage - 用户Tab
- [x] 5个用户的完整信息
- [x] 不同关注状态显示
- [x] 关注/取消关注功能
- [x] 分页加载（每页2条）
- [x] 下拉刷新
- [x] hasMore状态

### ✅ SearchResultsPage - 下单Tab
- [x] 3个可接单用户
- [x] 价格信息展示
- [x] 在线状态显示
- [x] 距离信息
- [x] 分页功能

### ✅ SearchResultsPage - 话题Tab
- [x] 4个话题数据
- [x] 热门标签显示
- [x] 统计信息展示
- [x] 分页功能

## 🔄 切换到真实API

当后端API准备就绪时：

1. **修改开关**
   ```typescript
   const USE_MOCK_DATA = false;  // 切换到真实API
   ```

2. **验证环境**
   - 确保API端点正确
   - 确认token认证正常
   - 检查网络连接

3. **对比测试**
   - Mock数据和真实API的响应结构应该一致
   - 所有字段名称和类型完全匹配
   - 业务逻辑保持一致

## 📊 控制台日志

Mock模式下，所有API调用都会在控制台输出详细日志：

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 [Search API] 获取搜索初始数据
   模式: 🧪 Mock数据
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   结果: ✅ 获取成功 (Mock)
   历史记录数: 4
   热门关键词数: 6
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

通过日志可以清楚地看到：
- 当前使用的模式（Mock/真实API）
- 请求参数
- 返回的数据概要
- 操作结果

## 🎯 优势

1. **独立开发** - 无需等待后端API
2. **快速迭代** - 即时查看UI效果
3. **完整测试** - 覆盖所有交互场景
4. **数据一致** - 与接口文档完全匹配
5. **易于调试** - 可以修改Mock数据测试边界情况
6. **无缝切换** - 一行代码切换到真实API

## 📝 注意事项

1. Mock数据仅用于开发测试，生产环境必须使用真实API
2. Mock数据的ID都是固定的，适合UI测试但不适合状态管理测试
3. 分页数据是有限的，超出范围会返回空列表
4. 关注操作的状态变化是模拟的，刷新页面后会重置

## 🔧 自定义Mock数据

如果需要测试特殊场景，可以修改 `mockData.ts` 文件：

```typescript
// 添加更多用户数据
export const mockSearchUsersData: GetSearchUsersResponse['data'] = {
  list: [
    // 添加你的测试用户
    {
      userId: 9999,
      nickname: '测试用户',
      // ...
    }
  ]
};

// 调整延迟时间
const mockDelay = (ms: number = 100) => ...  // 改为100ms
```

---

**祝测试顺利！🎉**

切换API模式：修改 `searchApi.ts` 中的 `USE_MOCK_DATA` 常量
