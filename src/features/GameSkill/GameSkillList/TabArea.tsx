/**
 * TabArea - L2 Component
 * Horizontal scrollable tab bar
 */
import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import type { TabVO } from '../api/types';

interface TabAreaProps {
  tabs: TabVO[];
  activeTab: string;
  onTabPress: (tabValue: string) => void;
}

export function TabArea({ tabs, activeTab, onTabPress }: TabAreaProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => {
          const isActive = tab.value === activeTab;
          return (
            <TouchableOpacity
              key={tab.value}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onTabPress(tab.value)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </Text>
              {tab.count !== undefined && tab.count > 0 && (
                <Text style={[styles.tabCount, isActive && styles.tabCountActive]}>
                  {tab.count}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 48,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    gap: 4,
  },
  tabActive: {
    backgroundColor: '#F5E6FF',
  },
  tabText: {
    fontSize: 14,
    color: '#999999',
  },
  tabTextActive: {
    color: '#9B59B6',
    fontWeight: '500',
  },
  tabCount: {
    fontSize: 12,
    color: '#999999',
  },
  tabCountActive: {
    color: '#9B59B6',
  },
});
