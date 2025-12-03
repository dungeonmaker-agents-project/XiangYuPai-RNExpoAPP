/**
 * 活动详情页 - Activity Detail Page
 * 显示活动完整信息,支持报名、取消报名等操作
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { activityApi, type ActivityDetail } from '@/services/api';

export default function ActivityDetailPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadActivityDetail(parseInt(id));
    }
  }, [id]);

  const loadActivityDetail = async (activityId: number) => {
    try {
      setIsLoading(true);
      const response = await activityApi.getActivityDetail(activityId);
      if (response.success && response.data) {
        setActivity(response.data);
      }
    } catch (error) {
      console.error('加载活动详情失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!activity) return;
    
    try {
      const response = await activityApi.registerActivity({
        activityId: activity.activityId,
      });
      
      if (response.success) {
        alert('报名成功!');
        loadActivityDetail(activity.activityId);
      }
    } catch (error) {
      console.error('报名失败:', error);
      alert('报名失败,请稍后重试');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!activity) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>活动不存在</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canRegister = activity.userStatus?.canRegister && activity.status === 'open';
  const hasRegistered = activity.userStatus?.hasRegistered;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Banner */}
        {activity.bannerImage && (
          <View style={styles.bannerContainer}>
            <Image source={{ uri: activity.bannerImage }} style={styles.banner} />
          </View>
        )}

        {/* Organizer Info */}
        <View style={styles.organizerSection}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{activity.organizer.nickname[0]}</Text>
          </View>
          <View style={styles.organizerInfo}>
            <Text style={styles.organizerName}>{activity.organizer.nickname}</Text>
            {activity.organizer.tags && activity.organizer.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {activity.organizer.tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Activity Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <Text style={styles.activityType}>{activity.activityType.label}</Text>
            <View style={[
              styles.statusBadge,
              activity.status === 'open' ? styles.statusOpen : styles.statusClosed
            ]}>
              <Text style={styles.statusText}>
                {activity.status === 'open' ? '报名中' : '已关闭'}
              </Text>
            </View>
          </View>
          
          {activity.title && (
            <Text style={styles.title}>{activity.title}</Text>
          )}
          
          <Text style={styles.description}>{activity.description}</Text>
          
          {activity.images && activity.images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
              {activity.images.map((img, index) => (
                <Image key={index} source={{ uri: img }} style={styles.activityImage} />
              ))}
            </ScrollView>
          )}
        </View>

        {/* Details */}
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>价格</Text>
            <Text style={styles.detailValue}>{activity.price.displayText}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>时间</Text>
            <Text style={styles.detailValue}>{activity.schedule.displayText}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>地点</Text>
            <Text style={styles.detailValue}>{activity.location.address}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>人数</Text>
            <Text style={styles.detailValue}>{activity.participants.displayText}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>报名截止</Text>
            <Text style={styles.detailValue}>
              {new Date(activity.registrationDeadline).toLocaleString('zh-CN')}
            </Text>
          </View>
        </View>

        {/* Participants */}
        {activity.participants.list && activity.participants.list.length > 0 && (
          <View style={styles.participantsSection}>
            <Text style={styles.sectionTitle}>已报名 ({activity.participants.registered})</Text>
            {activity.participants.list.map((participant) => (
              <View key={participant.userId} style={styles.participantItem}>
                <View style={styles.participantAvatar}>
                  <Text style={styles.participantAvatarText}>{participant.nickname[0]}</Text>
                </View>
                <Text style={styles.participantName}>{participant.nickname}</Text>
                <View style={[
                  styles.participantStatus,
                  participant.status === 'approved' ? styles.statusApproved : 
                  participant.status === 'pending' ? styles.statusPending : styles.statusRejected
                ]}>
                  <Text style={styles.participantStatusText}>{participant.statusLabel}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity style={styles.favoriteButton}>
          <Text style={styles.favoriteButtonText}>❤️ 收藏</Text>
        </TouchableOpacity>
        
        {canRegister && (
          <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
            <Text style={styles.registerButtonText}>立即报名</Text>
          </TouchableOpacity>
        )}
        
        {hasRegistered && (
          <View style={styles.registeredButton}>
            <Text style={styles.registeredButtonText}>
              {activity.userStatus?.registrationStatus === 'pending' ? '等待审核' : '已报名'}
            </Text>
          </View>
        )}
        
        {activity.status === 'full' && (
          <View style={styles.fullButton}>
            <Text style={styles.fullButtonText}>已满员</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#64748B',
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  bannerContainer: {
    width: '100%',
    height: 240,
  },
  banner: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  organizerSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  organizerInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  organizerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 4,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#E0E7FF',
    borderRadius: 4,
  },
  tagText: {
    fontSize: 12,
    color: '#5B21B6',
  },
  infoSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusOpen: {
    backgroundColor: '#D1FAE5',
  },
  statusClosed: {
    backgroundColor: '#FEE2E2',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#475569',
    lineHeight: 22,
    marginBottom: 16,
  },
  imagesScroll: {
    marginTop: 8,
  },
  activityImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginRight: 8,
  },
  detailsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 14,
    color: '#64748B',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    textAlign: 'right',
  },
  participantsSection: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    marginBottom: 12,
  },
  participantItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  participantAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
  },
  participantAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  participantName: {
    flex: 1,
    fontSize: 14,
    color: '#1E293B',
    marginLeft: 12,
  },
  participantStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusApproved: {
    backgroundColor: '#D1FAE5',
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusRejected: {
    backgroundColor: '#FEE2E2',
  },
  participantStatusText: {
    fontSize: 12,
    color: '#1E293B',
  },
  bottomActions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 12,
  },
  favoriteButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButtonText: {
    fontSize: 14,
    color: '#7C3AED',
  },
  registerButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#7C3AED',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  registeredButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#E0E7FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registeredButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5B21B6',
  },
  fullButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
});
