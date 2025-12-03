# 🔄 搜索页面导航更新说明

## 📅 更新日期
2025-11-09

## 🎯 更新内容

### 修改前的导航逻辑
- ❌ 点击用户 → 弹出模态框 (`/modal/user-detail`)
- ❌ 点击下单 → 无跳转（TODO）

### 修改后的导航逻辑
- ✅ 点击用户 → 直接跳转到他人详情页 (`/profile/[userId]`)
- ✅ 点击下单 → 跳转到技能详情页 (`/skill/[skillId]`)
- ✅ 点击话题 → 跳转到话题详情页 (`/topic/[topicId]`)

---

## 📝 详细修改

### 1. SearchResultsPage (搜索结果页)

#### 用户卡片点击
```typescript
// 修改前
const handleUserPress = (id: string) => {
  router.push({ pathname: '/modal/user-detail' as any, params: { userId: id } });
};

// 修改后
const handleUserPress = (id: string) => {
  // 跳转到他人详情页
  router.push({ pathname: '/profile/[userId]' as any, params: { userId: id } });
};
```

**路由路径**: `/profile/[userId]`  
**页面**: 他人主页 (OtherUserProfilePage)  
**功能**: 查看用户详细资料、技能、动态等

#### 订单/服务卡片点击
```typescript
// 修改前
const handleOrderPress = (id: string) => {
  console.log('Order pressed:', id);
  // TODO: Navigate to order detail
};

// 修改后
const handleOrderPress = (id: string) => {
  // 跳转到技能详情页（服务详情）
  router.push({ pathname: '/skill/[skillId]' as any, params: { skillId: id } });
};
```

**路由路径**: `/skill/[skillId]`  
**页面**: 技能详情页 (SkillDetailPage)  
**功能**: 查看服务详情、价格、评价，可以下单

---

### 2. SearchMainPage (搜索主页)

#### 搜索结果点击
```typescript
// 修改前
const handleResultPress = useCallback((resultId: string, resultType: string) => {
  if (resultType === 'user') {
    router.push({ pathname: '/modal/user-detail' as any, params: { userId: resultId } });
  }
}, [router]);

// 修改后
const handleResultPress = useCallback((resultId: string, resultType: string) => {
  if (resultType === 'user') {
    // 跳转到他人详情页
    router.push({ pathname: '/profile/[userId]' as any, params: { userId: resultId } });
  } else if (resultType === 'order' || resultType === 'service') {
    // 跳转到技能详情页（服务详情）
    router.push({ pathname: '/skill/[skillId]' as any, params: { skillId: resultId } });
  } else if (resultType === 'topic') {
    // 跳转到话题详情页
    router.push({ pathname: '/topic/[topicId]' as any, params: { topicId: resultId } });
  }
}, [router]);
```

**支持的结果类型**:
- `user` → `/profile/[userId]`
- `order` / `service` → `/skill/[skillId]`
- `topic` → `/topic/[topicId]`

---

## 🔀 导航流程图

### 用户搜索流程
```
搜索页面
  ↓ (输入关键词)
搜索结果页
  ↓ (点击用户卡片)
他人详情页 (/profile/[userId])
  ├─ 查看用户资料
  ├─ 查看用户技能
  ├─ 查看用户动态
  ├─ 点击"关注"按钮
  └─ 点击"私信"按钮 → 聊天页
```

### 服务搜索流程
```
搜索页面
  ↓ (输入关键词)
搜索结果页
  ↓ (点击订单/服务卡片)
技能详情页 (/skill/[skillId])
  ├─ 查看服务详情
  ├─ 查看价格和评价
  ├─ 点击"立即下单" → 创建订单页
  └─ 点击用户头像 → 他人详情页
```

### 话题搜索流程
```
搜索页面
  ↓ (输入关键词)
搜索结果页
  ↓ (点击话题卡片)
话题详情页 (/topic/[topicId])
  ├─ 查看话题下的动态
  ├─ 点击动态 → 动态详情页
  └─ 点击用户 → 他人详情页
```

---

## 🎯 用户体验提升

### 改进点
1. **更直接的导航**
   - 从模态框改为全屏页面，提供更完整的信息展示
   - 减少了一次点击步骤

2. **更清晰的层级**
   - 搜索 → 结果 → 详情，层级清晰
   - 符合用户的心理预期

3. **更好的返回体验**
   - 使用标准的页面栈，可以通过返回按钮回到搜索结果
   - 保持了搜索上下文

4. **更完整的功能**
   - 详情页提供了更多操作选项（关注、私信、下单等）
   - 可以查看更详细的信息

---

## 📱 页面说明

### `/profile/[userId]` - 他人详情页
**位置**: `app/profile/[userId].tsx`  
**组件**: `OtherUserProfilePage`  
**功能**:
- 显示用户头像、昵称、简介
- 显示用户技能列表
- 显示用户发布的动态
- 关注/取消关注
- 发送私信
- 查看关注/粉丝列表

### `/skill/[skillId]` - 技能详情页
**位置**: `app/skill/[skillId].tsx`  
**组件**: `SkillDetailPage`  
**功能**:
- 显示服务详情（标题、描述、图片）
- 显示价格信息
- 显示用户评价
- 显示服务提供者信息
- 立即下单按钮
- 私信按钮
- 支持两种模式：
  - `contentType=service`: 普通服务（显示"下单"按钮）
  - `contentType=event`: 组局活动（显示"报名"按钮）

### `/topic/[topicId]` - 话题详情页
**位置**: `app/topic/[topicId].tsx`  
**组件**: `TopicDetailPage`  
**功能**:
- 显示话题信息
- 显示话题下的动态列表
- 点赞、评论、分享
- 关注话题

---

## ✅ 测试检查项

- [x] 点击用户卡片能正确跳转到他人详情页
- [x] 点击订单/服务卡片能正确跳转到技能详情页
- [x] 点击话题卡片能正确跳转到话题详情页
- [x] 返回按钮能正确返回到搜索结果页
- [x] 参数正确传递（userId, skillId, topicId）
- [x] 无 linter 错误
- [x] TypeScript 类型检查通过

---

## 🔧 技术细节

### 路由参数传递
```typescript
router.push({ 
  pathname: '/profile/[userId]' as any, 
  params: { userId: id } 
});
```

### 动态路由匹配
- `/profile/[userId]` 匹配 `/profile/123`
- `/skill/[skillId]` 匹配 `/skill/456`
- `/topic/[topicId]` 匹配 `/topic/789`

### 页面栈管理
使用 Expo Router 的 Stack 导航，自动管理页面栈：
```
Stack: [搜索页] → [搜索结果页] → [详情页]
       ↑ 返回    ← 返回         ← 返回
```

---

## 📚 相关文档

- [页面逻辑与跳转关系文档](../../../📋_页面逻辑与跳转关系文档.md)
- [搜索功能美化总结](./BEAUTIFICATION_SUMMARY.md)
- [路由头部修复指南](../../../app/ROUTE_HEADER_FIX.md)

---

**维护者**: AI Assistant  
**更新日期**: 2025-11-09

