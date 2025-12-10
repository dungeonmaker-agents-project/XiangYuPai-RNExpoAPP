import type { SkillServiceItemVO } from '../../api/types';

export interface ContentListAreaProps {
  data: SkillServiceItemVO[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
  onItemPress: (item: SkillServiceItemVO) => void;
}
