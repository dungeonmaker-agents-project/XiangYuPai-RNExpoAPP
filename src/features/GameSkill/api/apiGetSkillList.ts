/**
 * Get skill service list with filters
 * Invocation: List load, filter change, pagination, refresh
 * Logic: Query skills with multi-dimensional filters and sorting
 */
import { api } from '@/services/api/config';
import type { SkillListQueryParams, SkillListResponse } from './types';

export async function apiGetSkillList(params: SkillListQueryParams): Promise<SkillListResponse> {
  // Use POST for complex filters, GET for simple queries
  const hasComplexFilters = params.filters && Object.keys(params.filters).length > 0;

  if (hasComplexFilters) {
    const { filters, ...queryParams } = params;
    const response = await api.post<{ code: number; msg: string; data: SkillListResponse }>(
      '/xypai-app-bff/api/skill/list',
      filters,
      { params: queryParams }
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.msg || 'Failed to get skill list');
    }

    return response.data.data;
  }

  // Simple GET request
  const response = await api.get<{ code: number; msg: string; data: SkillListResponse }>(
    '/xypai-app-bff/api/skill/list',
    { params }
  );

  if (response.data.code !== 200) {
    throw new Error(response.data.msg || 'Failed to get skill list');
  }

  return response.data.data;
}
