/**
 * MainPage 区域组件统一导出
 *
 * 所有区域组件的 barrel export 文件
 */

// 区域组件导出
export { default as HeaderArea } from '../HeaderArea';
export { default as GameBannerArea } from '../GameBannerArea';
export { default as FunctionGridArea } from '../FunctionGridArea';
export { default as LimitedOffersArea } from '../LimitedOffersArea';
export { default as TeamPartyArea } from '../TeamPartyArea';
export { default as FilterTabsArea } from '../FilterTabsArea';
export { default as UserListArea } from '../UserListArea';

// 类型导出
export type { HeaderAreaProps } from '../HeaderArea';
export type { GameBannerAreaProps } from '../GameBannerArea';
export type { FunctionGridAreaProps } from '../FunctionGridArea';
export type { LimitedOffersAreaProps } from '../LimitedOffersArea';
export type { TeamPartyAreaProps } from '../TeamPartyArea';
export type { FilterTabsAreaProps } from '../FilterTabsArea';
export type { UserListAreaProps } from '../UserListArea';

// FeedCardComponent 类型导出
export type { FeedItemData } from '../UserListArea';
