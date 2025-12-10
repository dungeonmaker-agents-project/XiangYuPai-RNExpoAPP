/**
 * Get skill list page configuration
 * Invocation: GameSkillList page mount
 * Logic: Fetch tabs, filter options, quick tags for specific game
 */
import { api } from '@/services/api/config';
import type { SkillConfigResponse } from './types';

export interface GetSkillConfigParams {
  gameId: string;
}

export async function apiGetSkillConfig(params: GetSkillConfigParams): Promise<SkillConfigResponse> {
  const response = await api.get<{ code: number; msg: string; data: SkillConfigResponse }>(
    '/xypai-app-bff/api/skill/config',
    { params }
  );

  if (response.data.code !== 200) {
    throw new Error(response.data.msg || 'Failed to get skill config');
  }

  return response.data.data;
}
