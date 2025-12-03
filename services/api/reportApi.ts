/**
 * Report API - 举报相关API
 *
 * 功能：
 * - 获取举报类型列表
 * - 提交举报
 *
 * 接口路径：
 * - GET  /xypai-content/api/v1/content/report/types  获取举报类型列表
 * - POST /xypai-content/api/v1/content/report        提交举报
 */

import { apiClient } from './client';

// ==================== 类型定义 ====================

/**
 * 举报类型
 */
export interface ReportType {
  key: string;    // 类型标识: insult, porn, fraud, illegal, fake, minor, uncomfortable, other
  label: string;  // 类型名称: 辱骂引战, 色情低俗, 诈骗, 违法犯罪, 不实信息, 未成年人相关, 内容引人不适, 其他
}

/**
 * 举报目标类型
 */
export type ReportTargetType = 'feed' | 'comment' | 'user';

/**
 * 举报请求DTO
 */
export interface ReportSubmitDTO {
  targetType: ReportTargetType;  // 目标类型: feed=动态, comment=评论, user=用户
  targetId: number;              // 目标ID
  reasonType: string;            // 举报类型key
  description?: string;          // 举报描述(0-200字符)
  evidenceImages?: string[];     // 举报图片URL列表(最多9张)
}

/**
 * 举报响应VO
 */
export interface ReportResultVO {
  reportId: number;              // 举报ID
  status: string;                // 状态: pending, processing, approved, rejected
  createdAt?: string;            // 创建时间
}

// ==================== Report API Class ====================

class ReportAPI {
  /**
   * 获取举报类型列表
   */
  async getReportTypes(): Promise<ReportType[]> {
    console.log('[ReportAPI] 获取举报类型列表');

    try {
      const response = await apiClient.get<ReportType[]>('/xypai-content/api/v1/content/report/types');

      console.log('[ReportAPI] 获取举报类型成功', {
        count: response.data?.length || 0
      });

      return response.data || [];
    } catch (error) {
      console.error('[ReportAPI] 获取举报类型失败', error);
      // 返回默认类型列表作为降级方案
      return [
        { key: 'insult', label: '辱骂引战' },
        { key: 'porn', label: '色情低俗' },
        { key: 'fraud', label: '诈骗' },
        { key: 'illegal', label: '违法犯罪' },
        { key: 'fake', label: '不实信息' },
        { key: 'minor', label: '未成年人相关' },
        { key: 'uncomfortable', label: '内容引人不适' },
        { key: 'other', label: '其他' },
      ];
    }
  }

  /**
   * 提交举报
   */
  async submitReport(data: ReportSubmitDTO): Promise<ReportResultVO> {
    console.log('[ReportAPI] 提交举报', {
      targetType: data.targetType,
      targetId: data.targetId,
      reasonType: data.reasonType
    });

    try {
      const response = await apiClient.post<ReportResultVO>('/xypai-content/api/v1/content/report', data);

      console.log('[ReportAPI] 举报提交成功', {
        reportId: response.data?.reportId,
        status: response.data?.status
      });

      return response.data;
    } catch (error: any) {
      console.error('[ReportAPI] 举报提交失败', error);

      // 处理特定错误
      if (error?.message?.includes('重复举报') || error?.message?.includes('已举报')) {
        throw new Error('您已经举报过该内容，请勿重复举报');
      }

      throw error;
    }
  }
}

// 导出单例
export const reportApi = new ReportAPI();
