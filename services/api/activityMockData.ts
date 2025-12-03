/**
 * 组局中心 - 测试数据
 * 根据接口文档生成的模拟数据,用于前端开发和测试
 */

import type {
  ActivityListResponse,
  ActivityDetail,
  PublishConfig,
  ActivityListItem,
} from './types/activity';

// Mock活动列表数据
export const mockActivityList: ActivityListResponse = {
  total: 25,
  hasMore: true,
  filters: {
    sortOptions: [
      { value: 'smart', label: '智能排序' },
      { value: 'latest', label: '最新发布' },
      { value: 'popular', label: '报名人数' },
    ],
    genderOptions: [
      { value: 'all', label: '不限性别' },
      { value: 'male', label: '男' },
      { value: 'female', label: '女' },
    ],
    memberOptions: [
      { value: 'all', label: '成员' },
      { value: '2-5', label: '2-5人' },
      { value: '6-10', label: '6-10人' },
      { value: '10+', label: '10人以上' },
    ],
    activityTypes: [
      { value: 'explore', label: '探店', icon: '🔍' },
      { value: 'movie', label: '私影', icon: '🎬' },
      { value: 'billiards', label: '台球', icon: '🎱' },
      { value: 'ktv', label: 'K歌', icon: '🎤' },
      { value: 'drink', label: '喝酒', icon: '🍺' },
      { value: 'massage', label: '按摩', icon: '💆' },
    ],
  },
  list: [
    {
      activityId: 1001,
      organizer: {
        userId: 10001,
        avatar: 'https://i.pravatar.cc/150?img=1',
        nickname: '小红帽',
      },
      title: '周末一起去探店新开的网红咖啡馆',
      description: '听说最近开了一家很棒的咖啡馆，环境超美，适合拍照打卡！',
      activityType: {
        type: 'explore',
        label: '探店',
        icon: '🔍',
      },
      tags: [
        { text: '可线上', type: 'feature', color: '#D1FAE5' },
        { text: '50金币', type: 'price', color: '#FED7AA' },
      ],
      price: {
        amount: 50,
        unit: 'per_person',
        displayText: '50金币/人',
      },
      schedule: {
        startTime: '2024-06-15T14:00:00Z',
        displayText: '6月15日 14:00',
      },
      location: {
        address: '朝阳区三里屯太古里北区',
        district: '朝阳区',
      },
      participants: {
        registered: 3,
        limit: 6,
        displayText: '3/6人',
      },
      status: 'open',
      registrationDeadline: '2024-06-14T23:59:59Z',
    },
    {
      activityId: 1002,
      organizer: {
        userId: 10002,
        avatar: 'https://i.pravatar.cc/150?img=2',
        nickname: '电影迷',
      },
      title: '私人影院看经典老片',
      description: '组团包场看《肖申克的救赎》，一起回味经典！',
      activityType: {
        type: 'movie',
        label: '私影',
        icon: '🎬',
      },
      tags: [
        { text: '室内', type: 'feature' },
        { text: '80金币', type: 'price' },
      ],
      price: {
        amount: 80,
        unit: 'per_person',
        displayText: '80金币/人',
      },
      schedule: {
        startTime: '2024-06-16T19:00:00Z',
        displayText: '6月16日 19:00',
      },
      location: {
        address: '海淀区中关村大街1号鼎好大厦5层',
      },
      participants: {
        registered: 5,
        limit: 8,
        displayText: '5/8人',
      },
      status: 'open',
      registrationDeadline: '2024-06-16T12:00:00Z',
    },
    {
      activityId: 1003,
      organizer: {
        userId: 10003,
        avatar: 'https://i.pravatar.cc/150?img=3',
        nickname: '台球小王子',
      },
      title: '台球厅约球',
      description: '技术不限，主要是玩得开心！欢迎新手和高手',
      activityType: {
        type: 'billiards',
        label: '台球',
        icon: '🎱',
      },
      tags: [
        { text: '新手友好', type: 'feature' },
        { text: '60金币', type: 'price' },
      ],
      price: {
        amount: 60,
        unit: 'per_hour',
        displayText: '60金币/小时',
      },
      schedule: {
        startTime: '2024-06-17T15:00:00Z',
        displayText: '6月17日 15:00',
      },
      location: {
        address: '东城区王府井大街88号台球会馆',
      },
      participants: {
        registered: 4,
        limit: 4,
        displayText: '4/4人',
      },
      status: 'full',
      registrationDeadline: '2024-06-17T10:00:00Z',
    },
    {
      activityId: 1004,
      organizer: {
        userId: 10004,
        avatar: 'https://i.pravatar.cc/150?img=4',
        nickname: 'K歌之王',
      },
      title: 'KTV嗨唱夜',
      description: '周五晚上一起放松，唱歌喝酒聊天！',
      activityType: {
        type: 'ktv',
        label: 'K歌',
        icon: '🎤',
      },
      tags: [
        { text: '包厢', type: 'feature' },
        { text: '100金币', type: 'price' },
      ],
      price: {
        amount: 100,
        unit: 'per_person',
        displayText: '100金币/人',
      },
      schedule: {
        startTime: '2024-06-14T20:00:00Z',
        displayText: '6月14日 20:00',
      },
      location: {
        address: '西城区西单大悦城麦乐迪KTV',
      },
      participants: {
        registered: 6,
        limit: 10,
        displayText: '6/10人',
      },
      status: 'open',
      registrationDeadline: '2024-06-14T18:00:00Z',
    },
    {
      activityId: 1005,
      organizer: {
        userId: 10005,
        avatar: 'https://i.pravatar.cc/150?img=5',
        nickname: '按摩爱好者',
      },
      title: '养生按摩团购',
      description: '周末去spa放松一下，缓解工作压力',
      activityType: {
        type: 'massage',
        label: '按摩',
        icon: '💆',
      },
      tags: [
        { text: '正规店铺', type: 'feature' },
        { text: '200金币', type: 'price' },
      ],
      price: {
        amount: 200,
        unit: 'per_person',
        displayText: '200金币/人',
      },
      schedule: {
        startTime: '2024-06-15T10:00:00Z',
        displayText: '6月15日 10:00',
      },
      location: {
        address: '朝阳区国贸CBD养生会所',
      },
      participants: {
        registered: 2,
        limit: 5,
        displayText: '2/5人',
      },
      status: 'open',
      registrationDeadline: '2024-06-14T20:00:00Z',
    },
  ],
};

// Mock活动详情数据
export const mockActivityDetail: ActivityDetail = {
  activityId: 1001,
  status: 'open',
  organizer: {
    userId: 10001,
    avatar: 'https://i.pravatar.cc/150?img=1',
    nickname: '小红帽',
    tags: ['活跃用户', '探店达人'],
    isVerified: true,
  },
  activityType: {
    type: 'explore',
    label: '探店',
    icon: '🔍',
  },
  title: '周末一起去探店新开的网红咖啡馆',
  description:
    '听说最近开了一家很棒的咖啡馆，环境超美，适合拍照打卡！咖啡豆是从云南采购的精品豆，老板是专业咖啡师，非常用心在做。周末一起去试试吧！',
  images: [
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
  ],
  bannerImage: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb',
  schedule: {
    startTime: '2024-06-15T14:00:00Z',
    endTime: '2024-06-15T17:00:00Z',
    displayText: '6月15日 14:00 - 17:00',
  },
  location: {
    address: '朝阳区三里屯太古里北区B1-32号',
    district: '朝阳区',
    coordinates: {
      latitude: 39.9289,
      longitude: 116.4473,
    },
  },
  price: {
    amount: 50,
    unit: 'per_person',
    displayText: '50金币/人',
  },
  participants: {
    registered: 3,
    limit: 6,
    displayText: '3/6人',
    list: [
      {
        userId: 20001,
        avatar: 'https://i.pravatar.cc/150?img=11',
        nickname: '咖啡爱好者',
        status: 'approved',
        statusLabel: '报名成功',
      },
      {
        userId: 20002,
        avatar: 'https://i.pravatar.cc/150?img=12',
        nickname: '拍照小能手',
        status: 'approved',
        statusLabel: '报名成功',
      },
      {
        userId: 20003,
        avatar: 'https://i.pravatar.cc/150?img=13',
        nickname: '美食探索者',
        status: 'pending',
        statusLabel: '等待审核',
      },
    ],
    waitingText: '还差3人开团',
  },
  registrationDeadline: '2024-06-14T23:59:59Z',
  userStatus: {
    isOrganizer: false,
    hasRegistered: false,
    canRegister: true,
  },
};

// Mock发布配置数据
export const mockPublishConfig: PublishConfig = {
  activityTypes: [
    { type: 'explore', label: '探店', icon: '🔍' },
    { type: 'movie', label: '私影', icon: '🎬' },
    { type: 'billiards', label: '台球', icon: '🎱' },
    { type: 'ktv', label: 'K歌', icon: '🎤' },
    { type: 'drink', label: '喝酒', icon: '🍺' },
    { type: 'massage', label: '按摩', icon: '💆' },
  ],
  priceUnit: {
    options: [
      { value: 'per_hour', label: '金币/小时' },
      { value: 'per_person', label: '金币/人' },
    ],
  },
  memberCountOptions: [
    { value: 2, label: '2人' },
    { value: 3, label: '3人' },
    { value: 4, label: '4人' },
    { value: 5, label: '5人' },
    { value: 6, label: '6人' },
    { value: 8, label: '8人' },
    { value: 10, label: '10人' },
  ],
  platformFee: {
    rate: 0.05,
    description: '发布后团局，平台会收取5%的下单费',
  },
  depositRules: {
    depositAmount: 100,
    description: '发布活动需缴纳100金币保证金，活动完成后退还',
  },
};

// 使用说明和测试场景
export const testScenarios = {
  // 场景1: 浏览活动列表
  scenario1: {
    description: '用户打开组局中心，查看活动列表',
    endpoint: 'GET /api/activity/list',
    params: {
      pageNum: 1,
      pageSize: 10,
      sortBy: 'smart',
    },
    expectedResponse: mockActivityList,
  },

  // 场景2: 查看活动详情
  scenario2: {
    description: '用户点击活动卡片，查看活动详情',
    endpoint: 'GET /api/activity/detail',
    params: {
      activityId: 1001,
    },
    expectedResponse: mockActivityDetail,
  },

  // 场景3: 发布新活动
  scenario3: {
    description: '用户点击"发布组局"，填写表单后提交',
    steps: [
      {
        step: 1,
        action: '获取发布配置',
        endpoint: 'GET /api/activity/publish/config',
        expectedResponse: mockPublishConfig,
      },
      {
        step: 2,
        action: '提交发布表单',
        endpoint: 'POST /api/activity/publish',
        params: {
          activityType: 'explore',
          title: '周末探店',
          content: '一起去探索新店',
          schedule: {
            startTime: '2024-06-20T14:00:00Z',
          },
          location: {
            address: '北京市朝阳区',
          },
          price: {
            amount: 50,
            unit: 'per_person',
          },
          memberLimit: 6,
          registrationDeadline: '2024-06-19T23:59:59Z',
        },
        expectedResponse: {
          activityId: 1006,
          needPayment: false,
        },
      },
    ],
  },

  // 场景4: 报名参加活动
  scenario4: {
    description: '用户报名参加活动',
    endpoint: 'POST /api/activity/register',
    params: {
      activityId: 1001,
      message: '期待参加！',
    },
    expectedResponse: {
      registrationId: 3001,
      status: 'approved',
      needPayment: false,
      approvalRequired: false,
    },
  },

  // 场景5: 筛选活动
  scenario5: {
    description: '用户筛选特定类型的活动',
    endpoint: 'GET /api/activity/list',
    params: {
      pageNum: 1,
      pageSize: 10,
      filters: {
        activityType: ['explore', 'movie'],
        gender: 'all',
      },
    },
    expectedResponse: {
      ...mockActivityList,
      list: mockActivityList.list.filter(
        (item) => item.activityType.type === 'explore' || item.activityType.type === 'movie'
      ),
    },
  },
};

export default {
  mockActivityList,
  mockActivityDetail,
  mockPublishConfig,
  testScenarios,
};
