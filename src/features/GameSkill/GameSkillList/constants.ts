/**
 * GameSkillList Page Constants
 * Static configuration and fallback values
 */

/** Game ID to display name mapping */
export const GAME_NAME_MAP: Record<string, string> = {
  honor_of_kings: '王者荣耀',
  league_of_legends: '英雄联盟',
  pubg_mobile: '和平精英',
  brawl_stars: '荒野乱斗',
};

/** Default game ID when not specified in route params */
export const DEFAULT_GAME_ID = 'honor_of_kings';

/** Default quick tags (fallback when API not loaded) */
export const DEFAULT_QUICK_TAGS = [
  { id: 'glory_king', label: '荣耀王者', filterKey: 'tags', filterValue: '荣耀王者' },
  { id: 'boost', label: '带粉上分', filterKey: 'tags', filterValue: '带粉上分' },
  { id: 'coach', label: '电竞陪练师', filterKey: 'tags', filterValue: '电竞陪练师' },
  { id: 'companion', label: '陪玩', filterKey: 'tags', filterValue: '陪玩' },
];
