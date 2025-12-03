/**
 * DetailPage - 动态详情页面
 *
 * 功能：
 * - 完整内容展示
 * - 评论系统
 * - 点赞/收藏/分享
 * - 用户信息（含等级标签）
 * - 关注/取消关注
 * - 举报功能
 *
 * 对接后端API (已测试通过):
 * - GET /xypai-content/api/v1/content/detail/{feedId} - 获取动态详情
 * - GET /xypai-content/api/v1/content/comments/{feedId} - 获取评论列表
 * - POST /xypai-content/api/v1/content/comment - 发布评论
 * - POST /xypai-content/api/v1/interaction/like - 点赞/取消点赞
 * - POST /xypai-content/api/v1/interaction/collect - 收藏/取消收藏
 * - POST /xypai-content/api/v1/interaction/share - 分享
 * - POST /xypai-content/api/v1/interaction/follow/{userId} - 关注用户
 * - DELETE /xypai-content/api/v1/interaction/follow/{userId} - 取消关注
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { feedApi, type CommentItem, type FeedDetail } from '../../../../services/api/feedApi';
import { useAuthStore } from '@/src/features/AuthModule/stores/authStore';
import MoreOptionsModal from './MoreOptionsModal';
import ReportModal from './ReportModal';
import ShareModal from './ShareModal';

// 颜色常量
const COLORS = {
  PRIMARY: '#8A2BE2',
  BACKGROUND: '#F5F5F5',
  CARD_BACKGROUND: '#FFFFFF',
  TEXT_PRIMARY: '#000000',
  TEXT_SECONDARY: '#666666',
  TEXT_TERTIARY: '#999999',
  BORDER: '#E5E5E5',
  LIKE_ACTIVE: '#FF4444',
  DIVIDER: '#F0F0F0',
} as const;

interface DetailPageProps {
  feedId?: string;
}

export default function DetailPage({ feedId: propFeedId }: DetailPageProps = {}) {
  const router = useRouter();
  const params = useLocalSearchParams();
  const feedId = propFeedId || (params.feedId as string) || (params.id as string);

  // 获取当前登录用户ID
  const currentUserInfo = useAuthStore((state) => state.userInfo);
  const currentUserId = currentUserInfo?.id;

  // 状态
  const [loading, setLoading] = useState(true);
  const [feed, setFeed] = useState<FeedDetail | null>(null);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMoreOptionsModal, setShowMoreOptionsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Refs
  const imageScrollRef = useRef<ScrollView>(null);

  // 加载详情
  useEffect(() => {
    loadDetail();
  }, [feedId]);

  const loadDetail = async () => {
    if (!feedId) return;

    setLoading(true);
    try {
      console.log('[DetailPage] 开始加载详情, feedId:', feedId);

      // 并行请求动态详情和评论列表
      const [feedData, commentsData] = await Promise.all([
        feedApi.getFeedDetail(feedId),
        feedApi.getCommentList(feedId, { pageNum: 1, pageSize: 20, sortType: 'hot' }),
      ]);

      console.log('[DetailPage] 获取到的动态数据:', JSON.stringify(feedData, null, 2));
      console.log('[DetailPage] 获取到的评论数据:', commentsData?.records?.length || 0, '条');

      if (feedData) {
        // 确保数据结构完整，补充缺失字段
        const normalizedFeed: FeedDetail = {
          ...feedData,
          id: String(feedData.id),
          userId: String(feedData.userId),
          type: feedData.type || 1,
          typeDesc: feedData.typeDesc || '动态',
          title: feedData.title || '',
          content: feedData.content || '',
          userInfo: {
            id: String(feedData.userInfo?.id || feedData.userId),
            nickname: feedData.userInfo?.nickname || '用户',
            avatar: feedData.userInfo?.avatar || 'https://via.placeholder.com/100',
            gender: feedData.userInfo?.gender,
            age: feedData.userInfo?.age,
            level: feedData.userInfo?.level ?? 1,
            levelName: feedData.userInfo?.levelName || '青铜',
            isFollowed: feedData.userInfo?.isFollowed ?? false,
            isRealVerified: feedData.userInfo?.isRealVerified ?? false,
            isGodVerified: feedData.userInfo?.isGodVerified ?? false,
            isVip: feedData.userInfo?.isVip ?? false,
          },
          mediaList: (feedData.mediaList || []).map((media: any) => ({
            id: String(media.id || media.mediaId),
            type: media.type || media.mediaType || 'image',
            url: media.url,
            thumbnailUrl: media.thumbnailUrl,
            width: media.width || 0,
            height: media.height || 0,
            duration: media.duration,
          })),
          topicList: feedData.topicList || [],
          locationName: feedData.locationName,
          location: feedData.location,
          likeCount: feedData.likeCount || 0,
          commentCount: feedData.commentCount || 0,
          shareCount: feedData.shareCount || 0,
          collectCount: feedData.collectCount || 0,
          viewCount: feedData.viewCount || 0,
          isLiked: feedData.isLiked ?? false,
          isCollected: feedData.isCollected ?? false,
          createdAt: typeof feedData.createdAt === 'string'
            ? new Date(feedData.createdAt).getTime()
            : (feedData.createdAt || Date.now()),
          updatedAt: typeof feedData.updatedAt === 'string'
            ? new Date(feedData.updatedAt).getTime()
            : (feedData.updatedAt || Date.now()),
        };

        console.log('[DetailPage] 标准化后的数据:', {
          id: normalizedFeed.id,
          mediaCount: normalizedFeed.mediaList.length,
          userNickname: normalizedFeed.userInfo.nickname,
        });

        setFeed(normalizedFeed);

        // 单独获取关注状态（如果不是自己的动态且已登录）
        if (currentUserId && String(feedData.userId) !== String(currentUserId)) {
          try {
            const isFollowed = await feedApi.checkIsFollowed(String(feedData.userId));
            console.log('[DetailPage] 获取关注状态:', { userId: feedData.userId, isFollowed });
            // 更新关注状态
            setFeed(prev => prev ? {
              ...prev,
              userInfo: {
                ...prev.userInfo,
                isFollowed,
              },
            } : null);
          } catch (err) {
            console.warn('[DetailPage] 获取关注状态失败:', err);
          }
        }
      }

      if (commentsData && commentsData.records) {
        // 标准化评论数据
        const normalizedComments = commentsData.records.map((comment: any) => ({
          ...comment,
          id: String(comment.id),
          feedId: String(comment.feedId),
          userId: String(comment.userId),
          userInfo: {
            id: String(comment.userInfo?.id || comment.userId),
            nickname: comment.userInfo?.nickname || '用户',
            avatar: comment.userInfo?.avatar || 'https://via.placeholder.com/100',
          },
          likeCount: comment.likeCount || 0,
          replyCount: comment.replyCount || 0,
          isLiked: comment.isLiked ?? false,
          createdAt: typeof comment.createdAt === 'string'
            ? new Date(comment.createdAt).getTime()
            : (comment.createdAt || Date.now()),
        }));
        setComments(normalizedComments);
      }
    } catch (error) {
      console.error('[DetailPage] 加载详情失败:', error);
      Alert.alert('错误', '加载失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 点赞
  const handleLike = async () => {
    if (!feed) return;

    try {
      const action = feed.isLiked ? 'unlike' : 'like';
      const result = await feedApi.like('feed', feed.id, action);

      if (result.success) {
        setFeed({
          ...feed,
          isLiked: result.isActive ?? !feed.isLiked,
          likeCount: result.count ?? (feed.isLiked ? feed.likeCount - 1 : feed.likeCount + 1),
        });
      }
    } catch (error) {
      console.error('[DetailPage] 点赞失败:', error);
      Alert.alert('错误', '操作失败');
    }
  };

  // 收藏
  const handleCollect = async () => {
    if (!feed) return;

    try {
      const action = feed.isCollected ? 'uncollect' : 'collect';
      const result = await feedApi.collect('feed', feed.id, action);

      if (result.success) {
        setFeed({
          ...feed,
          isCollected: result.isActive ?? !feed.isCollected,
          collectCount: result.count ?? (feed.isCollected ? feed.collectCount - 1 : feed.collectCount + 1),
        });
      }
    } catch (error) {
      console.error('[DetailPage] 收藏失败:', error);
      Alert.alert('错误', '操作失败');
    }
  };

  // 分享
  const handleShare = () => {
    setShowShareModal(true);
  };

  // 实际执行分享
  const handleDoShare = async (channel: 'wechat' | 'moments' | 'qq' | 'copy_link') => {
    if (!feed) return;

    try {
      const result = await feedApi.share(feed.id, channel);
      if (result.success) {
        setFeed({
          ...feed,
          shareCount: result.count ?? feed.shareCount + 1,
        });
      }
    } catch (error) {
      console.error('[DetailPage] 分享失败:', error);
    }
  };

  // 关注用户
  const handleFollow = async () => {
    if (!feed) return;

    try {
      const isCurrentlyFollowed = feed.userInfo.isFollowed;

      // 调用关注/取消关注API
      const result = await feedApi.toggleFollow(feed.userId, !isCurrentlyFollowed);

      if (result) {
        setFeed({
          ...feed,
          userInfo: {
            ...feed.userInfo,
            isFollowed: !isCurrentlyFollowed,
          },
        });
      }
    } catch (error) {
      console.error('[DetailPage] 关注操作失败:', error);
      Alert.alert('错误', '操作失败，请重试');
    }
  };

  // 发送评论
  const handleSendComment = async () => {
    if (!commentText.trim() || !feedId) return;

    setIsCommenting(true);
    try {
      const newComment = await feedApi.publishComment({
        feedId: feedId,
        content: commentText.trim(),
      });

      if (newComment) {
        setComments([newComment, ...comments]);
        setCommentText('');

        if (feed) {
          setFeed({
            ...feed,
            commentCount: feed.commentCount + 1,
          });
        }
      }
    } catch (error) {
      console.error('[DetailPage] 发送评论失败:', error);
      Alert.alert('错误', '发送失败');
    } finally {
      setIsCommenting(false);
    }
  };

  // 点赞评论
  const handleCommentLike = async (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    try {
      const action = comment.isLiked ? 'unlike' : 'like';
      const result = await feedApi.like('comment', commentId, action);

      if (result.success) {
        setComments(prevComments =>
          prevComments.map(c =>
            c.id === commentId
              ? {
                  ...c,
                  isLiked: result.isActive ?? !c.isLiked,
                  likeCount: result.count ?? (c.isLiked ? c.likeCount - 1 : c.likeCount + 1),
                }
              : c
          )
        );
      }
    } catch (error) {
      console.error('[DetailPage] 点赞评论失败:', error);
    }
  };

  // 格式化时间（相对时间，用于评论等）
  const formatTime = (timestamp: number): string => {
    const now = Date.now();
    const diff = now - timestamp;

    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) {
      return '刚刚';
    } else if (diff < hour) {
      return `${Math.floor(diff / minute)}分钟前`;
    } else if (diff < day) {
      return `${Math.floor(diff / hour)}小时前`;
    } else if (diff < 7 * day) {
      return `${Math.floor(diff / day)}天前`;
    } else {
      const date = new Date(timestamp);
      return `${date.getMonth() + 1}-${date.getDate()}`;
    }
  };

  // 格式化日期（MM-DD格式，用于MetaArea）
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day}`;
  };

  // 格式化数字
  const formatNumber = (num: number): string => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}w`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  // 处理图片滚动
  const handleImageScroll = (event: any) => {
    const screenWidth = Dimensions.get('window').width;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / screenWidth);
    setCurrentImageIndex(index);
  };

  // 跳转到用户主页
  const handleUserPress = () => {
    if (!feed) return;
    
    console.log('[DetailPage] 🧭 导航: 动态详情 → 用户主页', { userId: feed.userId });
    router.push({
      pathname: '/profile/[userId]',
      params: { userId: feed.userId },
    });
  };

  // 跳转到评论用户主页
  const handleCommentUserPress = (userId: string) => {
    console.log('[DetailPage] 🧭 导航: 动态详情 → 评论用户主页', { userId });
    router.push({
      pathname: '/profile/[userId]',
      params: { userId },
    });
  };

  // 跳转到话题页
  const handleTopicPress = (topicName: string) => {
    console.log('[DetailPage] 🧭 导航: 动态详情 → 话题页', { topicName });
    // 使用话题名称作为ID（实际应该使用话题ID）
    router.push({
      pathname: '/topic/[topicId]',
      params: { topicId: topicName },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
      </View>
    );
  }

  if (!feed) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>内容加载失败</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadDetail}>
          <Text style={styles.retryButtonText}>重试</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* 头部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>动态详情</Text>
        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => setShowMoreOptionsModal(true)}
        >
          <Text style={styles.moreButtonText}>⋯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 图片轮播 - 在滚动内容中 */}
        {feed.mediaList.length > 0 && (
          <View style={styles.imageCarouselContainer}>
            <ScrollView
              ref={imageScrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={handleImageScroll}
              scrollEventThrottle={16}
              style={styles.imageCarousel}
            >
              {feed.mediaList.map((media, index) => (
                <Image
                  key={index}
                  source={{ uri: media.url }}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            
            {/* 图片指示器 */}
            {feed.mediaList.length > 1 && (
              <View style={styles.imageIndicatorContainer}>
                <View style={styles.imageIndicator}>
                  <Text style={styles.imageIndicatorText}>
                    {currentImageIndex + 1}/{feed.mediaList.length}
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
        {/* 用户信息 */}
        <View style={styles.userSection}>
          <TouchableOpacity style={styles.userInfo} onPress={handleUserPress}>
            <Image source={{ uri: feed.userInfo.avatar }} style={styles.avatar} />
            <View style={styles.userTextInfo}>
              <View style={styles.userNameRow}>
                <Text style={styles.nickname}>{feed.userInfo.nickname}</Text>
                {/* 性别年龄标签 */}
                {(feed.userInfo.gender || feed.userInfo.age) && (
                  <View style={[
                    styles.genderAgeBadge,
                    feed.userInfo.gender === 'female' ? styles.femaleBadge : styles.maleBadge
                  ]}>
                    <Text style={styles.genderAgeText}>
                      {feed.userInfo.gender === 'female' ? '♀' : '♂'}
                      {feed.userInfo.age || ''}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.timeText}>{formatTime(feed.createdAt)}</Text>
            </View>
          </TouchableOpacity>
          {/* 只有当不是自己的动态时才显示关注按钮 */}
          {String(feed.userId) !== String(currentUserId) && (
            <TouchableOpacity
              style={[
                styles.followButton,
                feed.userInfo.isFollowed && styles.followButtonActive
              ]}
              onPress={handleFollow}
            >
              <Text style={[
                styles.followButtonText,
                feed.userInfo.isFollowed && styles.followButtonTextActive
              ]}>
                {feed.userInfo.isFollowed ? '已关注' : '+ 关注'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 标题 */}
        {feed.title && (
          <Text style={styles.title}>{feed.title}</Text>
        )}

        {/* 正文 */}
        <Text style={styles.contentText}>{feed.content}</Text>

        {/* 话题 */}
        {feed.topicList.length > 0 && (
          <View style={styles.topicList}>
            {feed.topicList.map((topic, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.topicTag}
                onPress={() => handleTopicPress(topic.name)}
              >
                <Text style={styles.topicText}>#{topic.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* 元信息区域 - 日期和位置 */}
        <View style={styles.metaArea}>
          <Text style={styles.metaDate}>{formatDate(feed.createdAt)}</Text>
          {(feed.locationName || feed.location) && (
            <Text style={styles.metaLocation}>
              {feed.locationName || (typeof feed.location === 'string' ? feed.location : feed.location?.name)}
            </Text>
          )}
        </View>

        {/* 互动数据 */}
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>{formatNumber(feed.viewCount)} 次浏览</Text>
          <Text style={styles.statsText}>·</Text>
          <Text style={styles.statsText}>{formatNumber(feed.likeCount)} 个赞</Text>
          <Text style={styles.statsText}>·</Text>
          <Text style={styles.statsText}>{formatNumber(feed.commentCount)} 条评论</Text>
        </View>

        <View style={styles.divider} />

        {/* 评论区标题 */}
        <View style={styles.commentHeader}>
          <Text style={styles.commentTitle}>全部评论 ({feed.commentCount})</Text>
        </View>

        {/* 评论列表 */}
        {comments.map((comment) => (
          <View key={comment.id} style={styles.commentItem}>
            <TouchableOpacity onPress={() => handleCommentUserPress(comment.userId)}>
              <Image source={{ uri: comment.userInfo.avatar }} style={styles.commentAvatar} />
            </TouchableOpacity>
            <View style={styles.commentContent}>
              <TouchableOpacity onPress={() => handleCommentUserPress(comment.userId)}>
                <Text style={styles.commentUserName}>{comment.userInfo.nickname}</Text>
              </TouchableOpacity>
              <Text style={styles.commentText}>{comment.content}</Text>
              <View style={styles.commentFooter}>
                <Text style={styles.commentTime}>{formatTime(comment.createdAt)}</Text>
                <TouchableOpacity 
                  style={styles.commentLikeButton}
                  onPress={() => handleCommentLike(comment.id)}
                >
                  <Text style={styles.commentLikeIcon}>
                    {comment.isLiked ? '❤️' : '🤍'}
                  </Text>
                  {comment.likeCount > 0 && (
                    <Text style={styles.commentLikeText}>
                      {formatNumber(comment.likeCount)}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* 底部互动栏 */}
      <View style={styles.bottomBar}>
        <View style={styles.commentInputContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="说点什么..."
            placeholderTextColor={COLORS.TEXT_TERTIARY}
            value={commentText}
            onChangeText={setCommentText}
            onSubmitEditing={handleSendComment}
            returnKeyType="send"
          />
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleLike}
          >
            <Text style={styles.actionIcon}>
              {feed.isLiked ? '❤️' : '🤍'}
            </Text>
            <Text style={styles.actionCount}>
              {formatNumber(feed.likeCount)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleCollect}
          >
            <Text style={styles.actionIcon}>
              {feed.isCollected ? '⭐' : '☆'}
            </Text>
            <Text style={styles.actionCount}>
              {formatNumber(feed.collectCount)}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
          >
            <Text style={styles.actionIcon}>🔗</Text>
            <Text style={styles.actionCount}>分享</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 更多选项弹窗 */}
      <MoreOptionsModal
        visible={showMoreOptionsModal}
        onClose={() => setShowMoreOptionsModal(false)}
        isCollected={feed?.isCollected ?? false}
        hasImages={(feed?.mediaList?.length ?? 0) > 0}
        onShare={() => setShowShareModal(true)}
        onCollect={handleCollect}
        onReport={() => setShowReportModal(true)}
      />

      {/* 分享弹窗 */}
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        feedId={feedId}
        feedTitle={feed?.title}
        feedContent={feed?.content}
        onShare={handleDoShare}
        onReport={() => setShowReportModal(true)}
      />

      {/* 举报弹窗 */}
      <ReportModal
        visible={showReportModal}
        onClose={() => setShowReportModal(false)}
        targetType="feed"
        targetId={feedId}
        targetTitle={feed?.title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 16,
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  // 图片轮播样式
  imageCarouselContainer: {
    position: 'relative',
    width: '100%',
    height: Dimensions.get('window').width * 0.88, // 缩小到原来的2/3
    backgroundColor: '#000',
  },
  imageCarousel: {
    width: '100%',
    height: '100%',
  },
  carouselImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width * 0.88,
  },
  imageIndicatorContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  imageIndicator: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  moreButton: {
    padding: 4,
  },
  moreButtonText: {
    fontSize: 24,
    color: COLORS.TEXT_PRIMARY,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.TEXT_SECONDARY,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.BORDER,
  },
  userTextInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  genderAgeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  femaleBadge: {
    backgroundColor: '#FFE4EC',
  },
  maleBadge: {
    backgroundColor: '#E4F0FF',
  },
  genderAgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.TEXT_PRIMARY,
  },
  timeText: {
    fontSize: 13,
    color: COLORS.TEXT_TERTIARY,
    marginTop: 4,
  },
  followButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followButtonActive: {
    backgroundColor: COLORS.BORDER,
  },
  followButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  followButtonTextActive: {
    color: COLORS.TEXT_SECONDARY,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.TEXT_PRIMARY,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.TEXT_PRIMARY,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  topicList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.CARD_BACKGROUND,
    gap: 8,
  },
  topicTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.BACKGROUND,
  },
  topicText: {
    fontSize: 14,
    color: COLORS.PRIMARY,
    fontWeight: '500',
  },
  metaArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.CARD_BACKGROUND,
    gap: 12,
  },
  metaDate: {
    fontSize: 13,
    color: COLORS.TEXT_TERTIARY,
  },
  metaLocation: {
    fontSize: 13,
    color: COLORS.TEXT_TERTIARY,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.CARD_BACKGROUND,
    gap: 8,
  },
  statsText: {
    fontSize: 13,
    color: COLORS.TEXT_TERTIARY,
  },
  divider: {
    height: 8,
    backgroundColor: COLORS.BACKGROUND,
  },
  commentHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  commentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.CARD_BACKGROUND,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.BORDER,
  },
  commentContent: {
    flex: 1,
    marginLeft: 12,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 4,
  },
  commentText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.TEXT_PRIMARY,
    marginBottom: 8,
  },
  commentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  commentTime: {
    fontSize: 12,
    color: COLORS.TEXT_TERTIARY,
  },
  commentLikeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentLikeIcon: {
    fontSize: 16,
  },
  commentLikeText: {
    fontSize: 13,
    color: COLORS.TEXT_SECONDARY,
    marginLeft: 4,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 32 : 12,
    backgroundColor: COLORS.CARD_BACKGROUND,
    borderTopWidth: 1,
    borderTopColor: COLORS.BORDER,
  },
  commentInputContainer: {
    flex: 1,
    marginRight: 12,
  },
  commentInput: {
    backgroundColor: COLORS.BACKGROUND,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    color: COLORS.TEXT_PRIMARY,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 20,
  },
  actionCount: {
    fontSize: 12,
    color: COLORS.TEXT_SECONDARY,
    marginTop: 2,
  },
});

