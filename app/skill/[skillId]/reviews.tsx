/**
 * All Reviews Screen - 全部评价列表
 * Route: /skill/[skillId]/reviews
 */

import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Review = {
  id: string;
  userName: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
};

const COLORS = {
  BG: '#FFFFFF',
  TEXT: '#111827',
  TEXT_SECONDARY: '#6B7280',
  BORDER: '#E5E7EB',
  PRIMARY: '#8B5CF6',
} as const;

function genMockReviews(count = 30): Review[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: String(i + 1),
    userName: `用户${(i + 1).toString().padStart(2, '0')}`,
    avatar: `https://picsum.photos/seed/rev_${i}/80`,
    rating: (i % 5) + 1,
    date: '2025-06-01',
    content:
      '服务专业，沟通顺畅，体验很不错。会再次预约。这里是评价内容示例，长度适中便于展示。',
  }));
}

const ReviewItem = ({ item }: { item: Review }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{item.userName}</Text>
          <View style={styles.stars}>
            {Array.from({ length: 5 }).map((_, idx) => (
              <Text key={idx} style={styles.star}>{idx < item.rating ? '★' : '☆'}</Text>
            ))}
          </View>
          <Text style={styles.date}>{item.date}</Text>
        </View>
        <Text style={styles.text}>{item.content}</Text>
      </View>
    </View>
  );
};

export default function AllReviewsScreen() {
  const router = useRouter();
  const { skillId } = useLocalSearchParams<{ skillId: string }>();

  const reviews = useMemo(() => genMockReviews(36), [skillId]);

  const renderItem = ({ item }: { item: Review }) => <ReviewItem item={item} />;
  const keyExtractor = (item: Review) => item.id;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={COLORS.TEXT} />
          </TouchableOpacity>
          <Text style={styles.title}>全部评价</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={reviews}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.BG },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  backBtn: { width: 40, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: COLORS.TEXT },
  listContent: { padding: 16 },
  separator: { height: 8 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#EEE' },
  content: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  name: { fontSize: 14, fontWeight: '600', color: COLORS.TEXT, marginRight: 8 },
  stars: { flexDirection: 'row', marginRight: 8 },
  star: { color: '#F59E0B', fontSize: 12 },
  date: { marginLeft: 'auto', fontSize: 12, color: COLORS.TEXT_SECONDARY },
  text: { fontSize: 14, color: COLORS.TEXT, lineHeight: 20 },
});

