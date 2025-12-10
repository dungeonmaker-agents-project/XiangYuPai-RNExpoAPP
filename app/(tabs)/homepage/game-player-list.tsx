/**
 * Game Skill List Screen - Route adapter for skill service list page
 * Supports all skill types: Honor of Kings, League of Legends, PUBG Mobile, etc.
 *
 * Route: /homepage/game-player-list?skillType=王者荣耀&gameId=honor_of_kings
 * Params:
 *   - skillType: Display name (王者荣耀, 英雄联盟, etc.)
 *   - gameId: Internal identifier (honor_of_kings, lol, pubg, etc.)
 */
import { ErrorBoundary } from '@/src/components';
import { GameSkillList } from '@/src/features/GameSkill';
import React from 'react';

export default function GameSkillListScreen() {
  return (
    <ErrorBoundary>
      <GameSkillList />
    </ErrorBoundary>
  );
}
