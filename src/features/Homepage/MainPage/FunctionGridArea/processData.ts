/**
 * FunctionGridArea 数据处理模块
 * 处理功能网格的数据逻辑
 * 
 * 注意：此模块现在也支持从API获取的quickEntries数据
 * API接口：GET /api/home/init -> quickEntries
 */

import type { FunctionItem, HomeInitResponse } from '../types';

// PNG图标映射
const ICON_SOURCES = {
  '王者荣耀': require('../../../../../assets/images/icons/王者荣耀.png'),
  '英雄联盟': require('../../../../../assets/images/icons/英雄联盟.png'),
  '和平精英': require('../../../../../assets/images/icons/和平精英.png'),
  '荒野乱斗': require('../../../../../assets/images/icons/荒野乱斗.png'),
  '探店': require('../../../../../assets/images/icons/探店.png'),
  '私影': require('../../../../../assets/images/icons/私影.png'),
  '台球': require('../../../../../assets/images/icons/台球.png'),
  'K歌': require('../../../../../assets/images/icons/K歌.png'),
  '喝酒': require('../../../../../assets/images/icons/喝酒.png'),
  '按摩': require('../../../../../assets/images/icons/按摩.png'),
} as const;

// 默认功能项配置（当API数据未加载时使用）
const DEFAULT_FUNCTION_ITEMS: Array<Omit<FunctionItem, 'iconSource'>> = [
  // 第一行
  { id: '1', name: '王者荣耀', icon: '👑', color: '#FFD700' },
  { id: '2', name: '英雄联盟', icon: '⚔️', color: '#4A90E2' },
  { id: '3', name: '和平精英', icon: '🔫', color: '#FF8C00' },
  { id: '4', name: '荒野乱斗', icon: '💥', color: '#8B5CF6' },
  { id: '5', name: '探店', icon: '🏪', color: '#32CD32' },
  // 第二行
  { id: '6', name: '私影', icon: '📸', color: '#FF4500', isHot: true },
  { id: '7', name: '台球', icon: '🎱', color: '#FF69B4' },
  { id: '8', name: 'K歌', icon: '🎤', color: '#FFD700' },
  { id: '9', name: '喝酒', icon: '🍻', color: '#4A90E2' },
  { id: '10', name: '按摩', icon: '💆', color: '#999999' },
];

/**
 * 处理功能网格数据
 * 将配置数据转换为带图标源的完整数据
 * 支持传入API数据或使用默认配置
 */
export const processGridData = (apiQuickEntries?: HomeInitResponse['quickEntries']): FunctionItem[] => {
  // 如果有API数据，转换为FunctionItem格式
  if (apiQuickEntries && apiQuickEntries.length > 0) {
    const colorMap: { [key: string]: string } = {
      '签到': '#10B981',
      '电竞赛事': '#8B5CF6',
      '电竞资料': '#4A90E2',
      '礼物商城': '#EC4899',
      '充值': '#FFD700',
    };
    
    return apiQuickEntries.slice(0, 10).map((entry, index) => ({
      id: `api-${index + 1}`,
      name: entry.title,
      icon: entry.icon,
      color: colorMap[entry.title] || '#6B7280',
      linkUrl: entry.linkUrl,
      iconSource: ICON_SOURCES[entry.title as keyof typeof ICON_SOURCES],
    }));
  }
  
  // 使用默认配置
  return DEFAULT_FUNCTION_ITEMS.map((item: Omit<FunctionItem, 'iconSource'>) => ({
    ...item,
    iconSource: ICON_SOURCES[item.name as keyof typeof ICON_SOURCES],
  }));
};

/**
 * 根据类型筛选功能项
 */
export const processFilterByType = (type: string): FunctionItem[] => {
  const allItems = processGridData();
  
  switch (type) {
    case 'game':
      return allItems.filter(item => 
        ['王者荣耀', '英雄联盟', '和平精英', '荒野乱斗'].includes(item.name)
      );
    case 'entertainment':
      return allItems.filter(item => 
        ['私影', '台球', 'K歌', '喝酒'].includes(item.name)
      );
    case 'service':
      return allItems.filter(item => 
        ['探店', '按摩'].includes(item.name)
      );
    default:
      return allItems;
  }
};
