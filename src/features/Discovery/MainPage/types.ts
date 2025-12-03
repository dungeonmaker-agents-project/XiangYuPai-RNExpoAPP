/**
 * MainPage - 类型定义
 */

import type { StyleProp, ViewStyle } from 'react-native';
import type { Feed, TabType } from '../types';

/**
 * MainPage Props接口
 */
export interface MainPageProps {
  initialTab?: TabType;
  userId?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * MainPage本地状态
 */
export interface MainPageState {
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastRefreshTime: number;
}

/**
 * Tab数据状态
 */
export interface TabDataState {
  followFeeds: Feed[];
  hotFeeds: Feed[];
  localFeeds: Feed[];
  hasMore: {
    follow: boolean;
    hot: boolean;
    local: boolean;
  };
  page: {
    follow: number;
    hot: number;
    local: number;
  };
}

/**
 * NavigationArea Props
 */
export interface NavigationAreaProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onSearchPress: () => void;
  onPublishPress: () => void;
  style?: StyleProp<ViewStyle>;
}

/**
 * ContentArea Props
 */
export interface ContentAreaProps {
  activeTab: TabType;
  feeds: Feed[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onFeedPress: (feedId: string) => void;
  onUserPress: (userId: string) => void;
  onTopicPress: (topicName: string) => void;
  onLike: (feedId: string) => void;
  onComment: (feedId: string) => void;
  onShare: (feedId: string) => void;
  onCollect: (feedId: string) => void;
  style?: StyleProp<ViewStyle>;
}
