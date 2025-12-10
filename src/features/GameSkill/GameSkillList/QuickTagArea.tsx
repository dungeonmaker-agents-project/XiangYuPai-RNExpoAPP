/**
 * QuickTagArea - L2 Component
 * Quick filter tags for common filters
 */
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import type { QuickTagVO } from '../api/types';

interface QuickTagAreaProps {
  tags: QuickTagVO[];
  activeTag: string | null;
  onTagPress: (tagId: string | null) => void;
}

export function QuickTagArea({ tags, activeTag, onTagPress }: QuickTagAreaProps) {
  if (tags.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tags.map((tag) => {
          const isActive = tag.id === activeTag;
          return (
            <TouchableOpacity
              key={tag.id}
              style={[styles.tag, isActive && styles.tagActive]}
              onPress={() => onTagPress(isActive ? null : tag.id)}
            >
              {tag.icon && <Text style={styles.tagIcon}>{tag.icon}</Text>}
              <Text style={[styles.tagText, isActive && styles.tagTextActive]}>
                {tag.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  scrollContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    gap: 4,
  },
  tagActive: {
    borderColor: '#9B59B6',
    backgroundColor: '#F5E6FF',
  },
  tagIcon: {
    fontSize: 14,
  },
  tagText: {
    fontSize: 13,
    color: '#666666',
  },
  tagTextActive: {
    color: '#9B59B6',
  },
});
