/**
 * useServiceDetail - 服务详情页数据管理Hook
 *
 * 功能：
 * - 调用 bffApi 加载服务详情数据
 * - 加载评价列表（支持分页）
 * - 数据转换：bffApi响应 → 组件数据模型
 * - 管理页面状态（加载中、错误、成功）
 *
 * 外部依赖：
 * - bffApi.getServiceDetail() - 获取服务详情
 * - bffApi.getServiceReviews() - 获取评价列表
 */

import { useCallback, useEffect, useState } from 'react';

import {
  bffApi,
  type ServiceDetailResponse as BffServiceDetailResponse,
  type ServiceReviewItem as BffReviewItem,
  type ServiceReviewsResponse as BffReviewsResponse,
} from '@/services/api';

import { PAGE_CONFIG } from '../constants';
import type {
  PageState,
  ReviewItem,
  ReviewSummaryData,
  ServiceDetailData,
  ServiceType,
} from '../types';

// #region 数据转换器
/**
 * 转换评价项：bffApi → 组件类型
 * @param item bffApi 返回的评价项
 */
const transformReviewItem = (item: BffReviewItem): ReviewItem => ({
  reviewId: String(item.reviewId),
  userId: String(item.userId),
  avatar: item.avatar,
  nickname: item.nickname,
  rating: item.rating,
  content: item.content,
  createTime: item.createTime,
});

/**
 * 转换服务详情：bffApi响应 → 组件数据模型
 * @param response bffApi 返回的服务详情
 * @param serviceType 服务类型（线上/线下）
 */
const transformServiceDetail = (
  response: BffServiceDetailResponse,
  serviceType: ServiceType
): ServiceDetailData => {
  const isOnline = serviceType === 'online';
  const { provider, skillInfo, price, reviews, images = [], description } = response;

  // 计算好评率：rating >= 4 的比例
  const goodRate = reviews?.summary?.averageRating
    ? Math.round((reviews.summary.averageRating / 5) * 100)
    : 99;

  return {
    serviceId: String(response.serviceId),
    serviceType,

    // 游戏资料卡片
    gameCard: {
      screenshots: images.length > 0
        ? images.map(url => ({ imageUrl: url, type: 'image' as const }))
        : [{ imageUrl: 'https://picsum.photos/seed/game1/800/600', type: 'image' as const }],
      currentIndex: 0,
    },

    // 用户信息
    userInfo: {
      userId: String(provider.userId),
      avatar: provider.avatar,
      nickname: provider.nickname,
      level: 19, // TODO: 后端需要返回等级字段
      isOnline: provider.isOnline,
      ...(isOnline ? { price: price.amount, priceUnit: price.unit } : {}),
    },

    // 标签区域（仅线上）
    ...(isOnline && {
      tags: {
        certification: provider.isVerified ? '大神' : undefined,
        tags: [
          { text: skillInfo.region || '全区' },
          { text: skillInfo.level || '高手' },
          ...(provider.tags?.slice(0, 2).map(t => ({ text: t })) || []),
        ],
      },
    }),

    // 技能介绍（仅线上）
    ...(isOnline && description && {
      skillIntro: {
        title: skillInfo.skillLabel || '技能介绍',
        description,
      },
    }),

    // 活动信息（仅线下）
    ...(!isOnline && {
      activity: {
        description: description || '线下活动详情',
        dateTime: '待定',
        location: '待定',
        price: price.amount,
        priceUnit: '金币/小时',
      },
    }),

    // 评价摘要
    reviewSummary: {
      totalCount: reviews?.total || 0,
      goodRate,
      highlightTags: reviews?.tags?.slice(0, 3).map(t => t.tag) || [],
    },

    // 操作按钮
    action: {
      canMessage: true,
      canOrder: response.canBook,
    },
  };
};

/**
 * 转换评价列表响应
 * @param response bffApi 返回的评价列表
 */
const transformReviewsResponse = (
  response: BffReviewsResponse
): { reviews: ReviewItem[]; hasMore: boolean; total: number } => ({
  reviews: response.list.map(transformReviewItem),
  hasMore: response.hasNext,
  total: response.total,
});
// #endregion

// #region Hook定义
interface UseServiceDetailReturn {
  pageState: PageState;
  detailData: ServiceDetailData | null;
  reviews: ReviewItem[];
  hasMoreReviews: boolean;
  loadDetail: () => Promise<void>;
  loadMoreReviews: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

/**
 * 服务详情页数据管理Hook
 *
 * @param serviceId 服务ID
 * @param serviceType 服务类型（online/offline）
 * @returns 页面状态和数据操作方法
 */
export const useServiceDetail = (
  serviceId: string,
  serviceType: ServiceType
): UseServiceDetailReturn => {
  // 页面状态
  const [pageState, setPageState] = useState<PageState>({
    isLoading: true,
    isError: false,
    errorMessage: null,
    serviceType,
  });

  // 详情数据
  const [detailData, setDetailData] = useState<ServiceDetailData | null>(null);

  // 评价数据
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [reviewPage, setReviewPage] = useState(1);

  /**
   * 加载服务详情
   * 调用 bffApi.getServiceDetail 并转换数据格式
   */
  const loadDetail = useCallback(async () => {
    try {
      setPageState(prev => ({ ...prev, isLoading: true, isError: false }));

      // 调用 bffApi 获取详情
      const response = await bffApi.getServiceDetail({
        serviceId: Number(serviceId),
      });

      if (!response) {
        throw new Error('服务详情加载失败');
      }

      // 转换数据格式
      const transformedData = transformServiceDetail(response, serviceType);
      setDetailData(transformedData);

      // 同时加载第一页评价
      const reviewsResponse = await bffApi.getServiceReviews({
        serviceId: Number(serviceId),
        pageNum: 1,
        pageSize: PAGE_CONFIG.REVIEWS_PAGE_SIZE,
      });

      const { reviews: reviewList, hasMore } = transformReviewsResponse(reviewsResponse);
      setReviews(reviewList);
      setReviewPage(1);
      setHasMoreReviews(hasMore);

      setPageState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      console.error('[useServiceDetail] 加载失败:', error);
      setPageState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        errorMessage: error instanceof Error ? error.message : '加载失败',
      }));
    }
  }, [serviceId, serviceType]);

  /**
   * 加载更多评价
   * 调用 bffApi.getServiceReviews 分页加载
   */
  const loadMoreReviews = useCallback(async () => {
    if (!hasMoreReviews) return;

    try {
      const nextPage = reviewPage + 1;

      const response = await bffApi.getServiceReviews({
        serviceId: Number(serviceId),
        pageNum: nextPage,
        pageSize: PAGE_CONFIG.REVIEWS_PAGE_SIZE,
      });

      const { reviews: newReviews, hasMore } = transformReviewsResponse(response);

      setReviews(prev => [...prev, ...newReviews]);
      setReviewPage(nextPage);
      setHasMoreReviews(hasMore);
    } catch (error) {
      console.error('[useServiceDetail] 加载更多评价失败:', error);
    }
  }, [hasMoreReviews, reviewPage, serviceId]);

  /** 刷新全部数据 */
  const refreshAll = useCallback(async () => {
    await loadDetail();
  }, [loadDetail]);

  /** 初始加载 */
  useEffect(() => {
    loadDetail();
  }, [loadDetail]);

  return {
    pageState,
    detailData,
    reviews,
    hasMoreReviews,
    loadDetail,
    loadMoreReviews,
    refreshAll,
  };
};
// #endregion

export default useServiceDetail;
