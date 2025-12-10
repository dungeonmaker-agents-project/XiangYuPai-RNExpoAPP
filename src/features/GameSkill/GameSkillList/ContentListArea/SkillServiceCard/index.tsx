/**
 * SkillServiceCard - L3 Component
 * Player card for skill service list
 *
 * Invocation: ContentListArea FlatList renderItem
 * Logic: Display skill provider info with avatar, badges, description, tags, price
 */
import React, { memo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { styles } from './styles';
import type { SkillServiceCardProps } from './types';

function SkillServiceCardComponent({ item, onPress }: SkillServiceCardProps) {
  const { avatarData, basicData, verificationData, skillData, priceData } = item;

  // Format distance display
  const distanceDisplay = basicData.distance
    ? basicData.distance >= 1000
      ? `${(basicData.distance / 1000).toFixed(1)}km`
      : `${basicData.distance}m`
    : '';

  // Gender symbol and style
  const isFemale = basicData.gender === 'female';
  const genderSymbol = isFemale ? '♀' : '♂';
  const genderAgeStyle = [
    styles.genderAge,
    isFemale ? styles.genderAgeFemale : styles.genderAgeMale,
  ];

  // Build tags array from multiple sources
  const displayTags: string[] = [];
  if (skillData.server) displayTags.push(skillData.server);
  if (skillData.gameRank) displayTags.push(skillData.gameRank);
  if (skillData.peakScore) displayTags.push(`巅峰${skillData.peakScore}+`);
  if (skillData.gameAttrs?.tags) {
    displayTags.push(...skillData.gameAttrs.tags.slice(0, 2));
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      {/* Avatar Section */}
      <Image
        source={{ uri: avatarData.avatarUrl }}
        style={styles.avatar}
        resizeMode="cover"
      />

      {/* Info Section */}
      <View style={styles.infoSection}>
        {/* Row 1: Nickname + Gender/Age + Distance */}
        <View style={styles.row1}>
          <View style={styles.leftGroup}>
            <Text style={styles.nickname} numberOfLines={1}>
              {basicData.nickname}
            </Text>
            <View style={genderAgeStyle}>
              <Text style={styles.genderAgeText}>
                {genderSymbol}{basicData.age || ''}
              </Text>
            </View>
          </View>
          {distanceDisplay ? (
            <Text style={styles.distance}>{distanceDisplay}</Text>
          ) : null}
        </View>

        {/* Row 2: Verification Badges */}
        <View style={styles.row2}>
          {verificationData.isRealVerified && (
            <View style={[styles.badge, styles.badgeReal]}>
              <Text style={[styles.badgeText, styles.badgeTextReal]}>✓实名认证</Text>
            </View>
          )}
          {verificationData.isGodVerified && (
            <View style={[styles.badge, styles.badgeGod]}>
              <Text style={[styles.badgeText, styles.badgeTextGod]}>👑大神</Text>
            </View>
          )}
          {verificationData.isVip && (
            <View style={[styles.badge, styles.badgeVip]}>
              <Text style={[styles.badgeText, styles.badgeTextVip]}>VIP</Text>
            </View>
          )}
        </View>

        {/* Row 3: Description */}
        <View style={styles.row3}>
          <Text style={styles.description} numberOfLines={2}>
            {skillData.description || `${skillData.gameName} ${skillData.gameRank || ''}`}
          </Text>
        </View>

        {/* Row 4: Tags and Price */}
        <View style={styles.row4}>
          <View style={styles.tags}>
            {displayTags.slice(0, 4).map((tag, index) => (
              <Text key={index} style={styles.tag}>{tag}</Text>
            ))}
          </View>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{priceData.price}</Text>
            <Text style={styles.priceUnit}>{priceData.unit}</Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <Text style={styles.statsText}>{skillData.orderCount}单</Text>
          <Text style={styles.statsDivider}>|</Text>
          <Text style={styles.statsText}>{skillData.rating.toFixed(1)}分</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export const SkillServiceCard = memo(SkillServiceCardComponent);
