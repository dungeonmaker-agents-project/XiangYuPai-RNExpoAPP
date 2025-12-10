/**
 * Create skill service order
 * Invocation: Order button click on detail page
 * Logic: Create order with skill ID and quantity
 */
import { api } from '@/services/api/config';
import type { SkillOrderParams, SkillOrderResponse } from './types';

export async function apiPostSkillOrder(params: SkillOrderParams): Promise<SkillOrderResponse> {
  const response = await api.post<{ code: number; msg: string; data: SkillOrderResponse }>(
    '/xypai-app-bff/api/skill/order',
    params
  );

  if (response.data.code !== 200) {
    return {
      success: false,
      message: response.data.msg || 'Failed to create order'
    };
  }

  return response.data.data;
}
