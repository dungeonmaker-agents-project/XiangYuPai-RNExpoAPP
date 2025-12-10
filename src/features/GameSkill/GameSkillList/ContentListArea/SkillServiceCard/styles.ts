import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 120,
    height: 160,
    borderRadius: 8,
  },
  infoSection: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  // Row 1: Basic Info
  row1: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nickname: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  genderAge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  genderAgeFemale: {
    backgroundColor: '#FFE4EC',
  },
  genderAgeMale: {
    backgroundColor: '#E4F0FF',
  },
  genderAgeText: {
    fontSize: 12,
  },
  distance: {
    fontSize: 12,
    color: '#999999',
  },
  // Row 2: Badges
  row2: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeReal: {
    backgroundColor: '#E3F2FD',
  },
  badgeGod: {
    backgroundColor: '#FFF8E1',
  },
  badgeVip: {
    backgroundColor: '#FCE4EC',
  },
  badgeText: {
    fontSize: 11,
    marginLeft: 2,
  },
  badgeTextReal: {
    color: '#1976D2',
  },
  badgeTextGod: {
    color: '#9B59B6',
  },
  badgeTextVip: {
    color: '#E91E63',
  },
  // Row 3: Description
  row3: {
    marginTop: 6,
  },
  description: {
    fontSize: 13,
    color: '#666666',
    lineHeight: 18,
  },
  // Row 4: Tags and Price
  row4: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 6,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
  },
  tag: {
    fontSize: 12,
    color: '#9B59B6',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FF6B9D',
  },
  priceUnit: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 2,
  },
  // Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statsText: {
    fontSize: 11,
    color: '#999999',
  },
  statsDivider: {
    marginHorizontal: 6,
    color: '#DDDDDD',
  },
});
