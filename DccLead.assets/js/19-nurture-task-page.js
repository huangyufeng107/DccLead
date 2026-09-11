// ===== NEV培育 - 培育任务（电销员工作台） - 复刻现网三栏布局 =====
(function() {
'use strict';

// ==================== 数据定义 ====================
const nurtureTaskQueues = [
  { id: 'new', name: '新任务', count: 0, group: 'normal' },
  { id: 'today', name: '当日跟进', count: 2, group: 'normal' },
  { id: 'overdue', name: '逾期任务', count: 5, group: 'normal' },
  { id: 'future', name: '未来任务', count: 0, group: 'normal' },
  { id: 'drive_new', name: '新任务', count: 1, group: 'drive' },
  { id: 'drive_today', name: '当日跟进', count: 0, group: 'drive' },
  { id: 'drive_overdue', name: '逾期任务', count: 0, group: 'drive' },
  { id: 'drive_future', name: '未来任务', count: 0, group: 'drive' }
];

const contactStatusOptions = [
  { value: 'connected', label: '已接通' },
  { value: 'rejected', label: '客户拒绝' },
  { value: 'no_answer', label: '未接听' },
  { value: 'busy', label: '通话中' },
  { value: 'shutdown', label: '关机' },
  { value: 'out_of_service', label: '停机' },
  { value: 'invalid', label: '空号' },
  { value: 'wrong_number', label: '错号' }
];

const visitResultMap = {
  connected: [
    { value: 'next_visit', label: '下次回访', needFollowTime: true },
    { value: 'intentional', label: '有意向', needFollowTime: true },
    { value: 'considering', label: '待考虑', needFollowTime: true },
    { value: 'appointment', label: '已邀约到店', needFollowTime: true, needStoreVisit: true },
    { value: 'test_drive', label: '已预约试驾', needFollowTime: true, needStoreVisit: true },
    { value: 'ordered', label: '已下订', needFollowTime: false },
    { value: 'purchased', label: '已成交', needFollowTime: false },
    { value: 'invalid', label: '无效线索', needFollowTime: false },
    { value: 'no_intent', label: '无意向', needFollowTime: false }
  ],
  rejected: [
    { value: 'reject_call', label: '拒接', needFollowTime: true },
    { value: 'do_not_disturb', label: '请勿打扰', needFollowTime: false },
    { value: 'complaint', label: '投诉', needFollowTime: false }
  ],
  no_answer: [
    { value: 'callback', label: '稍后回拨', needFollowTime: true },
    { value: 'sms_followup', label: '短信跟进', needFollowTime: true }
  ],
  busy: [{ value: 'callback', label: '稍后回拨', needFollowTime: true }],
  shutdown: [{ value: 'callback', label: '稍后回拨', needFollowTime: true }],
  out_of_service: [{ value: 'invalid_number', label: '号码失效', needFollowTime: false }],
  invalid: [{ value: 'invalid_number', label: '空号无效', needFollowTime: false }],
  wrong_number: [{ value: 'wrong_number_result', label: '错号', needFollowTime: false }]
};

const intentLevelOptions = [
  { value: 'H', label: 'H', color: '#dc2626' },
  { value: 'A', label: 'A', color: '#ea580c' },
  { value: 'B', label: 'B', color: '#d97706' },
  { value: 'C', label: 'C', color: '#2563eb' },
  { value: 'E', label: 'E', color: '#6b7280' },
  { value: 'F', label: 'F', color: '#9ca3af' }
];

const resultReasonMap = {
  next_visit: ['客户忙，改期联系', '需家人商议', '需要再了解', '其他'],
  intentional: ['价格商谈中', '已邀约到店', '确认车型配置', '金融方案沟通中', '其他'],
  considering: ['对比竞品中', '价格待考虑', '需实地看车', '其他'],
  appointment: ['已确定到店时间', '需提前确认接待', '其他'],
  test_drive: ['已预约试驾时间', '指定试驾车型', '其他'],
  ordered: ['线上已付订金', '到店签约中', '其他'],
  purchased: ['全款购车', '贷款已批', '置换完成', '其他'],
  invalid: ['非本人', '无购车需求', '重复线索', '其他'],
  no_intent: ['已购其他品牌', '暂无购车计划', '预算不符', '对品牌无兴趣', '其他'],
  reject_call: ['明确拒接', '态度恶劣', '其他'],
  do_not_disturb: ['要求勿扰', '已拉黑', '其他'],
  complaint: ['服务投诉', '产品投诉', '其他'],
  callback: ['短时占线', '未接听', '其他'],
  sms_followup: ['未接通发短信', '客户要求短信', '其他'],
  invalid_number: ['停机', '空号', '其他'],
  wrong_number_result: ['错号', '其他']
};

const purchaseTypeOptions = ['全款', '贷款/分期', '置换', '以租代购'];
const planBuyTimeOptions = ['7天内', '15天内', '1个月内', '3个月内', '半年内', '1年内', '暂无计划'];
const addWecomOptions = ['已添加', '未添加', '客户拒绝', '无需添加'];
const genderOptions = ['男', '女', '未知'];
const carSeriesOptions = ['N6', 'N7', 'NX8', '轩逸', '天籁', '逍客', '奇骏', 'ARIYA艾睿雅', '探陆'];

const intentStoreOptions = [
  { code: 'DLR-BJ-CY-002', name: '北京东风日产朝阳店', region: '北京 朝阳区' },
  { code: 'DLR-BJ-LZ-001', name: '北京东风南方丽泽（过渡）', region: '北京 丰台区' },
  { code: 'DLR-GD-GZ-001', name: '广州东风日产天河店', region: '广东省 广州市 天河区' },
  { code: 'DLR-GD-SZ-002', name: '深圳东风日产南山店', region: '广东省 深圳市 南山区' },
  { code: 'DLR-SH-PD-004', name: '上海东风日产浦东店', region: '上海 浦东新区' },
  { code: 'DLR-ZJ-HZ-003', name: '杭州东风日产西湖店', region: '浙江省 杭州市 西湖区' },
  { code: 'DLR-SC-CD-005', name: '成都东风日产高新店', region: '四川省 成都市 高新区' }
];

function makeLeadInfo(overrides) {
  return Object.assign({
    phone: '-', ipLocation: '-', leadType: '-', leadSource: '-', firstLeadStatus: '-',
    firstIntentLevel: '-', intentCar: '-', latestIntentSeries: '-', followCount: '-',
    createTime: '-', leadStatus: '-', leadDesc: '', intentStore: '-', buyTime: '-',
    carModel: '-', purchaseStore: '-', vin: '-', leadRemark: '', leadCode: '-',
    taskCode: '-', channelName: '-', mediaName: '-', projectName: '-', aiCalled: '否'
  }, overrides || {});
}

const nurtureTaskItems = [
  {
    id: 'NT-T1', queue: 'today', name: '车系+门店对应', phone: '11700000007', level: 'C',
    dueLabel: '今日 16:50', tag: '回访提交', isDriveTask: false,
    leadInfo: makeLeadInfo({
      phone: '11700000007', leadSource: 'id: 1-DNDC-车巴巴', firstLeadStatus: '培育中',
      firstIntentLevel: 'C', intentCar: '456 ( L343 )', createTime: '2026-05-18 16:50:55',
      leadStatus: '培育中', intentStore: '北京东风南方丽泽（过渡）',
      leadCode: '1846296533270691', taskCode: '2026051816500000017'
    }),
    formData: { contactStatus: 'rejected', gender: '', visitResult: 'next_visit', intentLevel: 'E', altPhone: '', lastVisitTime: '-', nextVisitTime: '', intentCar: '天籁·鸿蒙座舱', intentStore: '', purchaseType: '', planBuyTime: '', wecomStatus: '', expectStoreTime: '', resultReason: '', visitDesc: '', remark: '' },
    timelineEvents: [], visitRecords: [],
    customerProfile: { ownerTags: {}, buyIntent: { awareness: '', planTime: '未知', ownBrand: '-', competitors: '-', focus: ['未知'] } },
    wishlist: []
  },
  {
    id: 'NT-T2', queue: 'today', name: '培育中111', phone: '11400000018', level: 'C',
    dueLabel: '今日 14:37', tag: '回访提交', isDriveTask: false,
    leadInfo: makeLeadInfo({
      phone: '11400000018', ipLocation: '-', leadType: '线索状态分配--休眠未购',
      leadSource: 'AI智能外呼', firstLeadStatus: '休眠未购', firstIntentLevel: 'C',
      intentCar: 'N6', latestIntentSeries: 'N6', followCount: '5次',
      createTime: '2026-05-15 10:20:00', leadStatus: '培育中', leadDesc: '关注N6智驾版，询问置换补贴',
      intentStore: '广州东风日产天河店', buyTime: '1个月内', carModel: 'N6 2026款 智驾版',
      purchaseStore: '广州东风日产天河店', leadRemark: '客户周末方便接听',
      leadCode: '1846296533270692', taskCode: '2026051814370000018',
      channelName: 'R3-天网行动', mediaName: '百度有驾', projectName: 'N6新品推广', aiCalled: '是'
    }),
    formData: { contactStatus: 'connected', gender: '男', visitResult: 'next_visit', intentLevel: 'H', altPhone: '', lastVisitTime: '2026-05-17 15:00', nextVisitTime: '', intentCar: 'N6', intentStore: 'DLR-GD-GZ-001', purchaseType: '置换', planBuyTime: '1个月内', wecomStatus: '已添加', expectStoreTime: '', resultReason: '客户忙，改期联系', visitDesc: '客户今天在开会，约定明天上午10点再次联系，重点介绍置换补贴政策。', remark: '高意向客户，优先跟进' },
    timelineEvents: [
      { type: 'lead', title: '线索入库', time: '2026-05-15 10:20', desc: '百度有驾留资，关注N6智驾版' },
      { type: 'call', title: '首次外呼-已接通', time: '2026-05-16 14:30', desc: '客户表示感兴趣，需了解置换政策', agent: '张敏' },
      { type: 'sms', title: '短信发送', time: '2026-05-16 14:35', desc: '已发送N6产品手册与置换补贴说明' },
      { type: 'wecom', title: '企微添加', time: '2026-05-17 09:00', desc: '客户通过企微好友申请' },
      { type: 'call', title: '二次回访-下次回访', time: '2026-05-17 15:00', desc: '详细沟通置换方案，约定周末到店', agent: '张敏' }
    ],
    visitRecords: [
      {
        result: '无人接听下发', status: '无人接听', agent: '张敏', time: '2026-07-29 09:30',
        desc: '拨打电话3次均未接通，系统根据预设规则自动触发无人接听下发动作。',
        remark: '已自动转投下发队列，等待下一轮多渠道自动触达。',
        dispatchSummary: '经AI多维度评估，外呼未接通但意向分达57，系统已将线索由C级提权至B级。建议采用“痛点直击”话术策略，优先致电跟进。'
      },
      {
        result: '下次回访', status: '正常接通', agent: '张敏', time: '2026-07-28 15:30',
        desc: '客户关注续航里程与置换补贴政策，约定本周末到店体验 N6 智驾版。',
        remark: '需提前一日电话回访确认到店行程与试驾专员安排。'
      },
      {
        result: '下次回访', status: '企微跟进', agent: '李雷', time: '2026-07-25 10:20',
        desc: '已通过微信发送 N6 官方选配手册与 2000 元购车膨胀券。',
        remark: '客户微信已查收，表示优先考虑置换方案。'
      }
    ],
    customerProfile: {
      ownerTags: { keepCarModel: '轩逸·纯电', useYears: '5年', mileage: '8万公里', lastReturnStore: '2026-03-15 广州天河店' },
      buyIntent: { awareness: '日产粉丝', planTime: '1个月内', ownBrand: '日产', competitors: '比亚迪宋PLUS', focus: ['智驾', '三电', '空间'] },
      habits: { dailyCommute: '通勤30km', chargingCond: '有', parkingCond: '有' },
      lifestyle: { familySize: '3口之家', hobby: '自驾游' }
    },
    aiInsight: {
      levelText: '高', score: 82, levelColor: '#dc2626',
      summary: '当前评为<strong>高等级</strong>：计划<strong>1个月内</strong>换购<strong>N6</strong>，<strong>需置换</strong>；已添加企微、到店1次，试驾意愿强烈。建议推介2年0息+置换补贴方案。',
      tags: {
        basic: [['年龄段', '35-45岁'], ['职业', 'IT工程师'], ['城市', '广州']],
        intent: [['购车预算', '16-20万'], ['付款方式', '置换'], ['关注点', '智驾/三电/续航'], ['竞品', '比亚迪宋PLUS']],
        behavior: [['近三月访问', '28次'], ['有效留资', '3次'], ['到店', '1次']]
      }
    },
    wishlist: [{ car: 'N6 智驾版', config: '极光蓝+棕内饰', note: '优先选高阶智驾包', addTime: '2026-05-16' }]
  },
  {
    id: 'NT-DR1', queue: 'drive_new', name: '试驾-张先生', phone: '138****8888', level: 'H',
    dueLabel: '今日 14:00', tag: '试驾待确认', isDriveTask: true,
    driveInfo: {
      bookingCode: 'YYSD2026090800125', scheduleCode: 'NEVSP202609080045',
      driveType: '到店试驾', driveVehicle: '粤AC6666（N7·曜石黑）',
      driveSeries: 'N7（AE01）— 高级灰', driveTimeSlot: '14:00–14:30',
      appointmentDate: '2026-09-10', driveStatus: '待确认',
      cancelTag: '-', dccInitialStatus: '待回访'
    },
    leadInfo: makeLeadInfo({
      phone: '138****8888', ipLocation: '广东广州', leadType: '试驾预约线索',
      leadSource: '官网预约试驾', firstLeadStatus: '已预约试驾', firstIntentLevel: 'H',
      intentCar: 'N7', latestIntentSeries: 'N7', followCount: '2次',
      createTime: '2026-09-08 09:00:00', leadStatus: '待确认到店', leadDesc: '官网预约N7试驾',
      intentStore: '广州东风日产天河店', buyTime: '1个月内', carModel: 'N7 2026款 四驱版',
      leadRemark: '预约14:00试驾，请提前准备车辆',
      leadCode: '1846296533270700', taskCode: '202609091400000001D',
      channelName: '官网', projectName: 'N7试驾招募'
    }),
    formData: { contactStatus: '', gender: '男', visitResult: '', intentLevel: 'H', altPhone: '', lastVisitTime: '2026-09-08 10:00', nextVisitTime: '', intentCar: 'N7', intentStore: 'DLR-GD-GZ-001', purchaseType: '', planBuyTime: '1个月内', wecomStatus: '已添加', expectStoreTime: '2026-09-10', resultReason: '', visitDesc: '', remark: '' },
    timelineEvents: [
      { type: 'lead', title: '试驾预约', time: '2026-09-08 09:00', desc: '官网预约N7四驱版试驾' },
      { type: 'call', title: '确认来电', time: '2026-09-08 10:00', desc: '确认试驾时间为9月10日14:00', agent: '张敏' }
    ],
    visitRecords: [
      { result: '已邀约到店', status: '已接通', agent: '张敏', time: '2026-09-08 10:00', desc: '确认试驾时间，客户对N7四驱版很感兴趣。', remark: '提醒销售顾问提前准备试驾车辆。' }
    ],
    customerProfile: { ownerTags: {}, buyIntent: { awareness: '基本了解', planTime: '1个月内', ownBrand: '-', competitors: '特斯拉Model Y', focus: ['动力', '智驾', '外观'] } },
    wishlist: [{ car: 'N7 四驱版', config: '曜石黑+黑内饰', note: '关注四驱性能', addTime: '2026-09-08' }]
  }
];

// 新任务、未来任务模拟数据：用于验证队列切换后的待办线索列表。
nurtureTaskItems.push(
  {
    id: 'NT-N1', queue: 'new', name: '周先生', phone: '137****6880', level: 'C',
    dueLabel: '今日 16:00', tag: '待首次跟进', isDriveTask: false,
    leadInfo: makeLeadInfo({
      phone: '137****6880', ipLocation: '广东深圳', leadType: '官网留资', leadSource: '官网车型页',
      firstLeadStatus: '待培育', firstIntentLevel: 'C', intentCar: '天籁', latestIntentSeries: '天籁',
      followCount: '0次', createTime: '2026-09-09 09:18:00', leadStatus: '待首次跟进',
      leadDesc: '浏览天籁配置页后提交留资，关注舒适性与金融方案。', intentStore: '深圳东风日产南山店',
      buyTime: '3个月内', carModel: '天籁 2.0T XL', leadRemark: '首次联系确认购车计划与到店意向。',
      leadCode: '1846296533270711', taskCode: '2026090916000000021', channelName: '官网', mediaName: '车型配置页', projectName: '天籁金秋焕新', aiCalled: '否'
    }),
    formData: { contactStatus: '', gender: '男', visitResult: '', intentLevel: 'C', altPhone: '', lastVisitTime: '-', nextVisitTime: '', intentCar: '天籁', intentStore: '', purchaseType: '', planBuyTime: '3个月内', wecomStatus: '未添加', expectStoreTime: '', resultReason: '', visitDesc: '', remark: '' },
    timelineEvents: [{ type: 'lead', title: '线索入库', time: '2026-09-09 09:18', desc: '官网车型页提交天籁留资' }], visitRecords: [],
    customerProfile: { ownerTags: {}, buyIntent: { awareness: '初步了解', planTime: '3个月内', ownBrand: '-', competitors: '雅阁', focus: ['舒适性', '金融方案'] } }, wishlist: []
  },
  {
    id: 'NT-F1', queue: 'future', name: '刘女士', phone: '136****2658', level: 'B',
    dueLabel: '3d后 10:00', tag: '关键提醒', isDriveTask: false,
    leadInfo: makeLeadInfo({
      phone: '136****2658', ipLocation: '上海浦东', leadType: '媒体留资', leadSource: '懂车帝',
      firstLeadStatus: '培育中', firstIntentLevel: 'B', intentCar: 'N7', latestIntentSeries: 'N7',
      followCount: '2次', createTime: '2026-09-03 14:20:00', leadStatus: '待回访',
      leadDesc: '客户正在比较N7与同级纯电车型，约定明日上午回访。', intentStore: '上海东风日产浦东店',
      buyTime: '1个月内', carModel: 'N7 长续航版', leadRemark: '重点跟进续航与置换补贴。',
      leadCode: '1846296533270712', taskCode: '2026091010000000022', channelName: 'R3-天网行动', mediaName: '懂车帝', projectName: 'N7纯电焕新', aiCalled: '是'
    }),
    formData: { contactStatus: 'connected', gender: '女', visitResult: 'next_visit', intentLevel: 'B', altPhone: '', lastVisitTime: '2026-09-08 15:30', nextVisitTime: '2026-09-10 10:00', intentCar: 'N7', intentStore: 'DLR-SH-PD-002', purchaseType: '置换', planBuyTime: '1个月内', wecomStatus: '已添加', expectStoreTime: '', resultReason: '客户忙，改期联系', visitDesc: '客户约定明日上午回访，继续沟通N7续航与置换补贴。', remark: '' },
    timelineEvents: [{ type: 'lead', title: '线索入库', time: '2026-09-03 14:20', desc: '懂车帝留资关注N7' }, { type: 'call', title: '回访预约', time: '2026-09-08 15:30', desc: '客户约定9月10日上午回访', agent: '张敏' }], visitRecords: [],
    customerProfile: { ownerTags: {}, buyIntent: { awareness: '对比中', planTime: '1个月内', ownBrand: '日产', competitors: '小鹏P7', focus: ['续航', '置换补贴'] } }, wishlist: []
  },
  {
    id: 'NT-F2', queue: 'future', name: '黄先生', phone: '185****9026', level: 'A',
    dueLabel: '5d后 15:00', tag: '', isDriveTask: false,
    leadInfo: makeLeadInfo({
      phone: '185****9026', ipLocation: '广东佛山', leadType: '门店转介', leadSource: '线下活动',
      firstLeadStatus: '培育中', firstIntentLevel: 'A', intentCar: '探陆', latestIntentSeries: '探陆',
      followCount: '3次', createTime: '2026-09-01 11:30:00', leadStatus: '待到店确认',
      leadDesc: '家庭用车客户，已预约周末到店体验探陆。', intentStore: '佛山东风日产禅城店',
      buyTime: '1个月内', carModel: '探陆 380VC-TURBO', leadRemark: '到店前一天确认同行人数与车辆准备。',
      leadCode: '1846296533270713', taskCode: '2026091115300000023', channelName: '门店活动', mediaName: '商超车展', projectName: '探陆家庭出行季', aiCalled: '否'
    }),
    formData: { contactStatus: 'connected', gender: '男', visitResult: 'appointment', intentLevel: 'A', altPhone: '', lastVisitTime: '2026-09-08 17:00', nextVisitTime: '2026-09-11 15:30', intentCar: '探陆', intentStore: 'DLR-GD-FS-006', purchaseType: '贷款/分期', planBuyTime: '1个月内', wecomStatus: '已添加', expectStoreTime: '2026-09-12 14:00', resultReason: '已确定到店时间', visitDesc: '已预约周末到店，待回访确认试驾车辆。', remark: '高意向家庭客户。' },
    timelineEvents: [{ type: 'lead', title: '活动留资', time: '2026-09-01 11:30', desc: '商超车展留资，关注探陆空间' }, { type: 'call', title: '到店邀约', time: '2026-09-08 17:00', desc: '预约9月12日到店体验', agent: '李主管' }], visitRecords: [],
    customerProfile: { ownerTags: {}, buyIntent: { awareness: '深入了解', planTime: '1个月内', ownBrand: '本田', competitors: '汉兰达', focus: ['空间', '家庭出行', '金融方案'] } }, wishlist: []
  }
);

// 添加逾期任务模拟数据
const overdueNames = ['陈先生', '王女士', '李总', '周小姐', '赵哥'];
const overduePhones = ['139****1001', '139****1002', '139****1003', '139****1004', '139****1005'];
const overdueLevels = ['H', 'A', 'B', 'C', 'A'];
const overdueSources = ['车巴巴', '官网', 'AI外呼', '门店', '百度有驾'];
for (let i = 0; i < 5; i++) {
  nurtureTaskItems.push({
    id: `NT-OV${i+1}`, queue: 'overdue', name: overdueNames[i], phone: overduePhones[i],
    level: overdueLevels[i], dueLabel: i === 0 ? '逾期 1 d' : `逾期 ${i + 1} h`, tag: i === 2 ? '关键提醒' : '', isDriveTask: false,
    leadInfo: makeLeadInfo({
      phone: overduePhones[i], ipLocation: '广东广州', leadType: '一般留资',
      leadSource: overdueSources[i], firstLeadStatus: '培育中', firstIntentLevel: overdueLevels[i],
      intentCar: carSeriesOptions[i % carSeriesOptions.length], latestIntentSeries: carSeriesOptions[i % carSeriesOptions.length],
      followCount: `${i+1}次`, createTime: `2026-08-${20+i} 10:00:00`, leadStatus: '培育中',
      intentStore: intentStoreOptions[i % intentStoreOptions.length].name,
      leadCode: `18462965${1001+i}`, taskCode: `202608${20+i}100000${i+1}`
    }),
    formData: { contactStatus: '', gender: '', visitResult: '', intentLevel: overdueLevels[i], altPhone: '', lastVisitTime: '-', nextVisitTime: '', intentCar: '', intentStore: '', purchaseType: '', planBuyTime: '', wecomStatus: '', expectStoreTime: '', resultReason: '', visitDesc: '', remark: '' },
    timelineEvents: [], visitRecords: [],
    customerProfile: { ownerTags: {}, buyIntent: { awareness: '', planTime: '未知', ownBrand: '-', competitors: '-', focus: ['未知'] } },
    wishlist: []
  });
}

// ==================== 状态 ====================
let activeNurtureTaskQueue = 'today';
let activeNurtureTaskId = 'NT-T2';
let activeNurtureTaskScope = 'nurture';
let activeRightTab = 'rating';
let activeProfileSubTab = 'buyIntent';
let collapsedQueues = { new: false, today: false, overdue: false, future: true, drive_new: false, drive_today: true, drive_overdue: true, drive_future: true };
let collapsedSections = { leadInfo: false, timeline: true };
let nurtureSearchKeyword = '';
let moreActionsOpen = false;
let rightTabMoreOpen = false;
let editingCustomerNameTaskId = null;
let isNurtureAssistantCollapsed = false;
const nurtureCompletedToday = 8;

// ==================== 页面入口 ====================
window.showNurtureTaskPage = function() {
  hideLeadPages();
  setStrategyConfigTabsVisible(false);
  setManualAiConfigTabsVisible(false);
  setExcellentConfigManageTabsVisible(false);
  document.querySelector('nav[aria-label="培育策略三级菜单"]')?.classList.add('hidden');
  document.querySelector('.leads-nav')?.classList.remove('show');
  document.querySelector('.reports-nav')?.classList.remove('show');
  document.querySelector('.ops-nav')?.classList.remove('show');
  setSidebarActiveByName('培育任务');
  setPolicyContentVisible(false);
  setPageName('NEV培育 / 培育任务');
  document.getElementById('designStage')?.classList.remove('show');
  document.getElementById('nurtureTaskPage')?.classList.add('show');
  renderNurtureTaskPage();
};

function getActiveTask() {
  return nurtureTaskItems.find(t => t.id === activeNurtureTaskId) || nurtureTaskItems[0];
}

function commitCustomerName(page) {
  const input = page?.querySelector('[data-customer-name-input]');
  const value = input?.value.trim() || '';
  if (!value) {
    showToast?.('客户姓名不能为空', false);
    input?.focus();
    return;
  }
  if (value.length > 20) {
    showToast?.('客户姓名最多输入20个字符', false);
    input?.focus();
    return;
  }
  const task = nurtureTaskItems.find(item=>item.id===editingCustomerNameTaskId);
  if (!task) return;
  task.name = value;
  editingCustomerNameTaskId = null;
  renderNurtureTaskPage();
  showToast?.('客户姓名已更新', true);
}

function esc(s) { return String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

function renderNurtureTaskTopbar() {
  const pendingCount = nurtureTaskItems.length;
  const overdueCount = nurtureTaskItems.filter(item => item.queue === 'overdue' || item.queue === 'drive_overdue').length;
  return `<header class="nt-page-topbar">
    <div class="nt-page-heading">
      <h2>培育任务</h2>
      <p>按优先级处理待跟进线索，在同一工作台完成沟通、回访和客户信息查看。</p>
      <div class="nt-page-metrics" aria-label="任务概览">
        <button type="button" class="nt-page-metric" data-nt-summary="pending"><span>待处理</span><b>${pendingCount}</b></button>
        <button type="button" class="nt-page-metric overdue" data-nt-summary="overdue"><span>逾期</span><b>${overdueCount}</b></button>
        <span class="nt-page-metric completed"><span>今日已完成</span><b>${nurtureCompletedToday}</b></span>
      </div>
    </div>
    <div class="nt-page-actions">
      <button type="button" class="nt-page-action nt-page-action-wide" data-nt-top-action="simulate-seat">
        模拟坐席接听弹屏（场景A/C代跟进）
      </button>
      <button type="button" class="nt-page-action" data-nt-top-action="toggle-assistant">${isNurtureAssistantCollapsed ? '展开辅助信息' : '收起辅助信息'}</button>
      <button type="button" class="nt-page-action" data-nt-top-action="refresh">刷新任务</button>
    </div>
  </header>`;
}

// ==================== 左栏渲染 ====================
function renderTaskCard(item) {
  const isActive = item.id === activeNurtureTaskId;
  const levelTone = item.level === 'H'
    ? { background: '#fff7db', color: '#b45309', border: '#f4c44e' }
    : { background: '#f8fafc', color: '#64748b', border: '#cbd5e1' };
  const isCritical = item.tag === '关键提醒';
  const intentSeries = item.leadInfo?.latestIntentSeries || item.leadInfo?.intentCar || '—';
  return `<button type="button" class="nt-task-card ${isActive?'active':''} ${isCritical?'critical':''}" data-task-id="${item.id}" data-queue="${item.queue}">
    <div class="nt-task-card-top">
      <span class="nt-task-identity">
        <span class="nt-task-name">${esc(item.name)}</span>
        <span class="nt-task-level" style="background:${levelTone.background};color:${levelTone.color};border-color:${levelTone.border}">${item.level}级</span>
        ${isCritical ? '<span class="nt-task-tag">关键提醒</span>' : ''}
      </span>
      <span class="nt-task-time">${esc(item.dueLabel)}</span>
    </div>
    <div class="nt-task-card-bottom">
      <span class="nt-task-phone">${esc(item.phone)}</span>
      <span class="nt-task-separator">·</span>
      <span class="nt-task-series">${esc(intentSeries)}</span>
    </div>
  </button>`;
}

function renderQueueBlock(q) {
  const realCount = nurtureTaskItems.filter(it => it.queue === q.id).length;
  return `<div class="nt-queue-block" data-queue="${q.id}">
    <button type="button" class="nt-queue-header ${activeNurtureTaskQueue===q.id?'active':''}" data-queue-toggle="${q.id}">
      <span class="nt-queue-name">${esc(q.name)}</span>
      <span class="nt-queue-count">${realCount}</span>
    </button>
  </div>`;
}

function renderLeftPanel() {
  const isDriveScope = activeNurtureTaskScope === 'drive';
  const scopeQueues = nurtureTaskQueues.filter(q => q.group === (isDriveScope ? 'drive' : 'normal'));
  const nurtureCount = nurtureTaskItems.filter(item => !item.isDriveTask).length;
  const driveCount = nurtureTaskItems.filter(item => item.isDriveTask).length;
  const activeQueueTasks = nurtureTaskItems.filter(item => item.queue === activeNurtureTaskQueue && (!nurtureSearchKeyword || item.phone.includes(nurtureSearchKeyword) || item.name.includes(nurtureSearchKeyword)));
  return `<aside class="nt-left-panel">
    <div class="nt-panel-head">
      <span class="nt-panel-title">外呼列表</span>
      <div class="nt-task-scope-tabs" role="tablist" aria-label="任务类型">
        <button type="button" class="nt-task-scope-tab ${!isDriveScope ? 'active' : ''}" data-task-scope="nurture" role="tab" aria-selected="${!isDriveScope}">培育任务 <b>${nurtureCount}</b></button>
        <button type="button" class="nt-task-scope-tab ${isDriveScope ? 'active' : ''}" data-task-scope="drive" role="tab" aria-selected="${isDriveScope}">试驾排程 <b>${driveCount}</b></button>
      </div>
      <div class="nt-search-box">
        <input type="text" class="nt-search-input" placeholder="手机号搜索" id="nurtureSearchInput" value="${esc(nurtureSearchKeyword)}"/>
        <button type="button" class="nt-search-icon-btn" id="nurtureSearchBtn">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </button>
        <button type="button" class="nt-filter-icon-btn" title="筛选">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
        </button>
      </div>
    </div>
    <div class="nt-queue-list" id="nurtureQueueList">
      <div class="nt-queue-group ${isDriveScope ? 'nt-group-drive' : 'nt-group-normal'}">
        ${scopeQueues.map(renderQueueBlock).join('')}
      </div>
      <div class="nt-queue-items nt-active-queue-items" aria-live="polite">
        ${activeQueueTasks.length ? activeQueueTasks.map(renderTaskCard).join('') : '<div class="nt-queue-empty"><div class="nt-empty-icon">💬</div><div>当前队列暂无任务</div></div>'}
      </div>
    </div>
  </aside>`;
}

// ==================== 线索信息渲染 ====================
function renderLeadInfoSection(task) {
  const info = task.leadInfo || {};
  const isDrive = task.isDriveTask;
  let groups;
  if (isDrive) {
    const drive = task.driveInfo || {};
    groups = [
      { title: '试驾信息', summary: [drive.driveStatus, drive.appointmentDate, drive.driveTimeSlot].filter(value=>value&&value!=='-').join(' · '), fields: [
        ['预约试驾编码', drive.bookingCode || '-', true], ['试驾排程编码', drive.scheduleCode || '-', true],
        ['试驾类型', drive.driveType || '-', false], ['试驾车辆', drive.driveVehicle || '-', false],
        ['试驾车系', drive.driveSeries || '-', false], ['试驾时间段', drive.driveTimeSlot || '-', false],
        ['预约试驾日期', drive.appointmentDate || '-', false], ['当前试驾状态', drive.driveStatus || '-', false],
        ['试驾取消标签', drive.cancelTag || '-', false], ['回访初始状态', drive.dccInitialStatus || '-', false]
      ]},
      { title: '线索与意向信息', summary: [info.latestIntentSeries, info.firstIntentLevel&&info.firstIntentLevel!=='-'?`${info.firstIntentLevel}级`:'', info.intentStore].filter(value=>value&&value!=='-').join(' · '), fields: [
        ['客户联系电话', info.phone, true], ['线索类型', info.leadType, false],
        ['首次线索状态', info.firstLeadStatus, false], ['累计跟进次数', info.followCount, false],
        ['当前线索状态', info.leadStatus, false], ['意向门店', info.intentStore, false],
        ['最新意向车型', info.carModel, false], ['VIN码', info.vin, false],
        ['IP归属地', info.ipLocation, false], ['线索来源', info.leadSource, false],
        ['首次意向级别', info.firstIntentLevel, false], ['原始意向车辆', info.intentCar, false],
        ['最新意向车系', info.latestIntentSeries, false], ['首次留资时间', info.createTime, true],
        ['预计购车时间', info.buyTime, false], ['购车门店', info.purchaseStore, false],
        ['线索备注', info.leadRemark, true], ['线索描述', info.leadDesc, true]
      ]},
      { title: '业务标识信息', summary: drive.bookingCode&&drive.scheduleCode?'预约试驾、排程编码已关联':'查看业务编码与渠道信息', fields: [
        ['培育线索编码', info.leadCode, true], ['人工任务编码', info.taskCode, true],
        ['渠道名称', info.channelName, false], ['媒体名称', info.mediaName, false],
        ['大项目名', info.projectName, false], ['是否经过AI外呼', info.aiCalled, false]
      ]}
    ];
  } else {
    groups = [
      { title: '基础信息', summary: [info.leadStatus, info.followCount&&info.followCount!=='-'?`累计跟进 ${info.followCount}`:''].filter(value=>value&&value!=='-').join(' · '), fields: [
        ['客户联系电话', info.phone, true], ['线索类型', info.leadType, false],
        ['首次线索状态', info.firstLeadStatus, false], ['累计跟进次数', info.followCount, false],
        ['当前线索状态', info.leadStatus, false], ['意向门店', info.intentStore, false],
        ['最新意向车型', info.carModel, false], ['VIN码', info.vin, false]
      ]},
      { title: '来源与意向信息', summary: [info.leadSource, info.latestIntentSeries, info.firstIntentLevel&&info.firstIntentLevel!=='-'?`${info.firstIntentLevel}级`:''].filter(value=>value&&value!=='-').join(' · '), fields: [
        ['IP归属地', info.ipLocation, false], ['线索来源', info.leadSource, false],
        ['首次意向级别', info.firstIntentLevel, false], ['原始意向车辆', info.intentCar, false],
        ['最新意向车系', info.latestIntentSeries, false], ['首次留资时间', info.createTime, true],
        ['预计购车时间', info.buyTime, false], ['购车门店', info.purchaseStore, false],
        ['线索备注', info.leadRemark, true], ['线索描述', info.leadDesc, true]
      ]},
      { title: '业务标识信息', summary: info.leadCode&&info.taskCode?'线索编码、任务编码已关联':'查看业务编码与渠道信息', fields: [
        ['线索编码', info.leadCode, true], ['任务编码', info.taskCode, true],
        ['渠道名称', info.channelName, false], ['媒体名称', info.mediaName, false],
        ['大项目名', info.projectName, false], ['是否经过AI外呼', info.aiCalled, false]
      ]}
    ];
  }
  const copyIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
  const renderField = ([label,val,copyable]) => {
    const isEmpty = val==='-'||val===''||val==null;
    return `<div class="nt-lead-detail-row"><span class="nt-lead-detail-label">${esc(label)}</span><span class="nt-lead-detail-value ${isEmpty?'empty':''}" title="${esc(val)}">${isEmpty?'-':esc(val)}</span>${copyable&&!isEmpty?`<button type="button" class="nt-lead-detail-copy" title="复制" data-copy="${esc(val)}">${copyIcon}</button>`:''}</div>`;
  };
  const renderDisclosure = (group,index,openIndex) => `<details class="nt-lead-detail-group nt-lead-detail-disclosure" ${index===openIndex?'open':''}>
    <summary>
      <span class="nt-disclosure-main"><b>${esc(group.title)}</b><small>${esc(group.summary||'点击查看详细字段')}</small></span>
      <span class="nt-disclosure-meta"><em>${group.fields.length}项</em><span class="nt-disclosure-state"><span class="when-closed">展开</span><span class="when-open">收起</span></span></span>
    </summary>
    <div class="nt-lead-detail-list">${group.fields.map(renderField).join('')}</div>
  </details>`;
  if (isDrive) {
    return `<div class="nt-lead-details-view nt-drive-lead-details">${groups.map((group,index)=>renderDisclosure(group,index,0)).join('')}</div>`;
  }
  return `<div class="nt-lead-details-view nt-nurture-lead-details">${groups.map((group,index)=>renderDisclosure(group,index,1)).join('')}</div>`;
}

function renderTimelineEntry(task) {
  const collapsed = collapsedSections.timeline;
  return `<section class="nt-section nt-timeline-entry ${collapsed?'collapsed':''}" id="ntTimelineEntry">
    <button type="button" class="nt-section-header nt-section-header-link" data-section-toggle="timeline" data-open-tab="timeline">
      <span class="nt-section-title">时光轴</span>
      <span class="nt-section-arrow-r">›</span>
    </button>
  </section>`;
}

// ==================== 回访表单 ====================
function renderVisitForm(task) {
  const f = task.formData || {};
  const cs = f.contactStatus || '';
  const vr = f.visitResult || '';
  const resultOptions = cs ? (visitResultMap[cs] || []) : [];
  const reasonOptions = vr ? (resultReasonMap[vr] || []) : [];
  const selRes = resultOptions.find(r => r.value === vr);
  const showFollow = !!(selRes?.needFollowTime || ['next_visit','intentional','considering','appointment','test_drive','callback','sms_followup'].includes(vr));
  const showStore = !!(selRes?.needStoreVisit || ['appointment','test_drive'].includes(vr));
  const lc = intentLevelOptions.find(l => l.value === (f.intentLevel || task.level)) || {};
  const selStore = intentStoreOptions.find(s => s.code === f.intentStore);

  const selectHtml = (field, label, options, currentVal, placeholder, disabled, isNav) => {
    const hasVal = !!currentVal;
    return `<div class="nt-form-item ${disabled?'nt-form-item-disabled':''}" data-field="${field}">
      <label>${esc(label)}</label>
      ${isNav?
        `<button type="button" class="nt-form-ctl nt-select-nav" ${disabled?'disabled':''} data-action="open-store-picker">
          <span class="nt-select-value ${!hasVal?'placeholder':''}">${hasVal?esc((options.find(o=>o.value===currentVal||o.code===currentVal)?.name||options.find(o=>o.value===currentVal||o.code===currentVal)?.label||currentVal)):esc(placeholder)}</span>
          <span class="nt-select-arrow-r">›</span>
        </button>`
        :
        `<div class="nt-form-ctl nt-custom-select" data-select="${field}" ${disabled?'data-disabled="1"':''}>
          <button type="button" class="nt-select-trigger" ${disabled?'disabled':''}>
            <span class="nt-select-value ${!hasVal?'placeholder':''}" ${hasVal&&field==='intentLevel'?`style="color:${lc.color}"`:''}>${hasVal?esc(options.find(o=>o.value===currentVal)?.label||currentVal):esc(placeholder)}</span>
            ${hasVal?`<span class="nt-select-clear" data-clear="${field}">×</span>`:''}
            <span class="nt-select-arrow">⌄</span>
          </button>
          <div class="nt-select-dropdown">
            ${options.map(o=>`<div class="nt-select-option ${currentVal===o.value?'selected':''}" data-option="${esc(o.value)}">${field==='intentLevel'?`<span style="color:${o.color}">${esc(o.label)}</span>`:esc(o.label)}</div>`).join('')}
          </div>
        </div>`
      }
    </div>`;
  };

  return `<section class="nt-section nt-visit-form-section" id="ntVisitForm">
    <div class="nt-section-header static"><span class="nt-section-title">回访提交</span></div>
    <div class="nt-section-body">
      <div class="nt-form-grid">
        ${selectHtml('contactStatus', '接触状态', contactStatusOptions, cs, '请选择', false, false)}
        ${selectHtml('gender', '性别', genderOptions.map(g=>({value:g,label:g})), f.gender, '请选择', false, false)}
        ${selectHtml('visitResult', '回访结果', resultOptions, vr, cs?'请选择':'请先选择接触状态', !cs, false)}
        ${selectHtml('intentLevel', '意向级别', intentLevelOptions, f.intentLevel || task.level, '请选择', false, false)}
        <div class="nt-form-item"><label>备用电话</label><input type="text" class="nt-form-ctl nt-input" data-input="altPhone" placeholder="请输入" value="${esc(f.altPhone||'')}"/></div>
        <div class="nt-form-item nt-form-item-plain"><label>上次回访时间</label><div class="nt-form-ctl nt-plain">${esc(f.lastVisitTime||'-')}</div></div>
        <div class="nt-form-item ${showFollow?'':'nt-hidden'}" data-field="nextVisitTime"><label>下次回访时间</label><input type="text" class="nt-form-ctl nt-input nt-date-input" data-date="nextVisitTime" placeholder="请选择日期" readonly value="${esc(f.nextVisitTime||'')}"/></div>
        ${selectHtml('intentCar', '意向车辆', carSeriesOptions.map(c=>({value:c,label:c})), f.intentCar, '请选择', false, false)}
        ${selectHtml('intentStore', '意向门店', intentStoreOptions, f.intentStore, '请选择', false, true)}
        ${selectHtml('purchaseType', '购车方式', purchaseTypeOptions.map(p=>({value:p,label:p})), f.purchaseType, '请选择', false, false)}
        ${selectHtml('planBuyTime', '计划购买时间', planBuyTimeOptions.map(p=>({value:p,label:p})), f.planBuyTime, '请选择', false, false)}
        ${selectHtml('wecomStatus', '添加企微', addWecomOptions.map(w=>({value:w,label:w})), f.wecomStatus, '请选择', false, false)}
        <div class="nt-form-item ${showStore?'':'nt-hidden'}" data-field="expectStoreTime"><label>预计到店时间</label><input type="text" class="nt-form-ctl nt-input nt-date-input" data-date="expectStoreTime" placeholder="请选择日期" readonly ${!showStore?'disabled':''} value="${esc(f.expectStoreTime||'')}"/></div>
        ${reasonOptions.length?selectHtml('resultReason', '结果原因', reasonOptions.map(r=>({value:r,label:r})), f.resultReason, '请选择', false, false):''}
        <div class="nt-form-item nt-form-item-wide"><label>回访描述</label><textarea class="nt-form-ctl nt-textarea" data-input="visitDesc" rows="3" placeholder="请输入本次沟通内容、客户异议与已确认结论">${esc(f.visitDesc||'')}</textarea></div>
        <div class="nt-form-item nt-form-item-wide"><label>备注信息</label><textarea class="nt-form-ctl nt-textarea" data-input="remark" rows="2" placeholder="补充需要协同或特别关注的事项">${esc(f.remark||'')}</textarea></div>
      </div>
      <div class="nt-form-actions">
        <button type="button" class="nt-btn nt-btn-disabled" disabled>智能体填单</button>
        <button type="button" class="nt-btn nt-btn-default" data-action="pause">回访暂存</button>
        <button type="button" class="nt-btn nt-btn-primary" data-action="submit">回访提交</button>
        <div class="nt-more-wrap">
          <button type="button" class="nt-btn nt-btn-ghost" data-action="toggle-more"><span class="nt-more-dots">⋯</span></button>
          <div class="nt-more-menu ${moreActionsOpen?'show':''}">
            <button type="button" data-action="sms">下发短信</button>
            <button type="button" data-action="store-query">门店查询</button>
            <button type="button" data-action="drive-record">试驾记录</button>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

// ==================== 右栏 ====================
function renderSmartRating(task) {
  const info = task.leadInfo || {};
  const form = task.formData || {};
  const profile = task.customerProfile || {};
  const buyIntent = profile.buyIntent || {};
  const configured = task.aiInsight || {};
  const ratingByLevel = {
    H: { text: '高', score: 80, color: '#be123c' },
    A: { text: '中', score: 68, color: '#d97706' },
    B: { text: '中', score: 65, color: '#d97706' },
    C: { text: '低', score: 45, color: '#2563eb' }
  };
  const rating = configured.score != null ? {
    text: configured.levelText || ratingByLevel[task.level]?.text || '中',
    score: configured.score,
    color: configured.levelColor || ratingByLevel[task.level]?.color || '#d97706'
  } : (ratingByLevel[task.level] || ratingByLevel.B);
  const firstValue = (values, fallback = '-') => values.find(value => value && value !== '-') || fallback;
  const basicSource = configured.tags?.basic || [];
  const basicMap = Object.fromEntries(basicSource);
  const cityText = firstValue([basicMap['城市'], info.ipLocation], '未知');
  const provinceText = cityText.includes('广州') || cityText.includes('深圳') || cityText.includes('佛山') ? '广东省'
    : cityText.includes('上海') ? '上海市' : cityText.includes('北京') ? '北京市' : cityText.includes('成都') ? '四川省' : '未知';
  const planTime = firstValue([form.planBuyTime, info.buyTime, buyIntent.planTime], '未知');
  const intentSeries = firstValue([info.latestIntentSeries, form.intentCar, info.intentCar], '未知');
  const budget = firstValue([configured.tags?.intent?.find(([label])=>label==='购车预算')?.[1]], '10-13万');
  const payment = firstValue([form.purchaseType, configured.tags?.intent?.find(([label])=>label==='付款方式')?.[1]], '低首付贷款');
  const followCount = String(info.followCount || '0').replace(/次$/, '') || '0';
  const visitCount = task.isDriveTask ? '1次' : (task.visitRecords?.length ? '1次' : '0次');
  const platformVisits = configured.tags?.behavior?.find(([label])=>label.includes('访问'))?.[1] || '8次';
  const focus = (buyIntent.focus || []).filter(value=>value&&value!=='未知').join('、') || '车型配置';
  const basicTags = [
    ['年龄段', basicMap['年龄段'] || '25-30岁'],
    ['省份组合', provinceText],
    ['城市组合', cityText]
  ];
  const groups = [
    ['基础画像', basicTags],
    ['互动表现', [['最近一次留资距今天数', '2天'], ['到店次数', visitCount]]],
    ['兴趣偏好', [['近三月平台访问次数', platformVisits], ['关注方向', focus]]],
    ['购车需求', [['预计用车时间', planTime], ['购车预算', budget], ['付款方式', payment], ['意向车系', intentSeries]]]
  ];
  const renderGroup = ([title, values]) => `<section class="rating-feature-group"><div class="rating-feature-heading"><h6>${esc(title)}</h6></div><div class="rating-feature-tags">${values.map(([label,value])=>`<span><em>${esc(label)}</em><strong>${esc(value)}</strong></span>`).join('')}</div></section>`;
  const summary = configured.summary || `当前评为<strong>${esc(rating.text)}等级</strong>：计划<strong>${esc(planTime)}</strong>购车，核心询问<strong>${esc(intentSeries)}</strong>相关方案；已产生<strong>${esc(followCount)}次</strong>跟进。建议结合客户关注点持续推进。`;
  return `<div class="nurture-rating-panel nt-smart-rating-panel">
    <div class="rating-result-label">预评结果</div>
    <div class="rating-score-strip">
      <strong class="rating-level" style="color:${rating.color}">${esc(rating.text)}</strong>
      <strong class="rating-score">${rating.score}<small>分</small></strong>
      <div class="rating-progress"><i style="width:${Math.max(0,Math.min(100,rating.score))}%;background:${rating.color}"></i></div>
      <span class="rating-percent">${rating.score}%</span>
    </div>
    <section class="rating-summary-block"><h5>预评小结</h5><div class="rating-summary-copy">${summary}</div></section>
    <section class="rating-features-block">
      <h5>客户特征</h5>
      <div class="tag-summary-block"><h6>标签小结</h6><p>${esc(basicTags[0][1])}、${esc(cityText)}；计划${esc(planTime)}购车，预算${esc(budget)}；倾向${esc(payment)}，近三月访问${esc(platformVisits)}。</p></div>
      ${groups.map(renderGroup).join('')}
    </section>
  </div>`;
}

function renderVisitRecords(task) {
  const records = task.visitRecords || [];
  if (!records.length) return `<div class="nt-records-view"><h3 class="nt-records-title">回访记录</h3><div class="nt-empty"><div>暂无数据</div></div></div>`;
  return `<div class="nt-records-view">
    <h3 class="nt-records-title">回访记录</h3>
    <div class="nurture-timeline">${records.map(r=>`
      <article class="nurture-timeline-item">
        <span class="nurture-timeline-dot" aria-hidden="true"></span>
        <div class="nurture-timeline-head">
          <span class="nurture-timeline-result">${esc(r.result)}</span>
          <span class="nurture-timeline-status-tag">${esc(r.status)}</span>
        </div>
        <div class="nurture-timeline-meta"><span class="agent">@${esc(r.agent)}</span><time>${esc(r.time)}</time></div>
        <div class="nurture-timeline-block">
          <label>回访描述</label>
          <p>${esc(r.desc)}</p>
        </div>
        ${r.remark?`<div class="nurture-timeline-block"><label>备注信息</label><p>${esc(r.remark)}</p></div>`:''}
        ${r.dispatchSummary?`<div class="nurture-dispatch-summary-box"><div class="summary-title">下发原因小结</div><div class="summary-desc">${esc(r.dispatchSummary)}</div></div>`:''}
      </article>`).join('')}</div>
  </div>`;
}

function renderCustomerProfile(task) {
  const p = task.customerProfile || {};
  const o = p.ownerTags || {};
  const bi = p.buyIntent || {};
  const h = p.habits || {};
  const ls = p.lifestyle || {};
  const awOpts = ['完全不了解','知道但不太了解','基本了解','日产粉丝'];
  const tmOpts = ['计划7天内买车','计划一个月内买车','计划三个月内买车','计划三个月后买车','未知'];
  const fcOpts = ['空间','动力','外观','智能化','智驾','三电','舒适性','内饰','未知'];
  const tag = (t,a)=>`<span class="nt-p-tag ${a?'active':''}">${esc(t)}</span>`;
  const sub = (k,n)=>`<button class="nt-p-subtab ${activeProfileSubTab===k?'active':''}" data-psub="${k}">${n}</button>`;
  return `<div class="nt-profile">
    <div class="nt-p-subtabs">${sub('ownerTags','保客标签')}${sub('buyIntent','购车意向')}${sub('habits','用车习惯')}${sub('lifestyle','生活方式')}</div>
    ${activeProfileSubTab==='ownerTags'?`<div class="nt-p-body">
      <h5>保客标签</h5>
      <div class="nt-p-row"><label>保客车型：</label><span>${esc(o.keepCarModel||'-')}</span></div>
      <div class="nt-p-row"><label>使用年限：</label><span>${o.useYears?esc(o.useYears)+' 年':'-'}</span></div>
      <div class="nt-p-row"><label>用车里程：</label><span>${o.mileage?esc(o.mileage)+' 公里':'-'}</span></div>
      <div class="nt-p-row"><label>上次回厂门店：</label><span>${esc(o.lastReturnStore||'-')}</span></div>
    </div>`:''}
    ${activeProfileSubTab==='buyIntent'?`<div class="nt-p-body">
      <h5>购车意向</h5>
      <div class="nt-p-group"><label>品牌认知</label><div class="nt-p-tags">${awOpts.map(a=>tag(a,bi.awareness===a)).join('')}</div></div>
      <div class="nt-p-group"><label>预计购车时间</label><div class="nt-p-tags">${tmOpts.map(t=>tag(t,bi.planTime===t)).join('')}</div></div>
      <div class="nt-p-row"><label>已有车辆品牌</label><span>${esc(bi.ownBrand||'-')}</span><button class="nt-p-more">更多›</button></div>
      <div class="nt-p-row"><label>关注竞品</label><span>${esc(bi.competitors||'-')}</span><button class="nt-p-more">更多›</button></div>
      <div class="nt-p-group"><label>购车关注点</label><div class="nt-p-tags">${fcOpts.map(f=>tag(f,(bi.focus||[]).includes(f))).join('')}</div></div>
      <button class="nt-btn nt-btn-primary nt-p-update">更新客户档案</button>
    </div>`:''}
    ${activeProfileSubTab==='habits'?`<div class="nt-p-body">
      <h5>用车习惯</h5>
      <div class="nt-p-row"><label>日常通勤：</label><span>${esc(h.dailyCommute||'-')}</span></div>
      <div class="nt-p-row"><label>充电条件：</label><span>${esc(h.chargingCond||'-')}</span></div>
      <div class="nt-p-row"><label>停车条件：</label><span>${esc(h.parkingCond||'-')}</span></div>
    </div>`:''}
    ${activeProfileSubTab==='lifestyle'?`<div class="nt-p-body">
      <h5>生活方式</h5>
      <div class="nt-p-row"><label>家庭构成：</label><span>${esc(ls.familySize||'-')}</span></div>
      <div class="nt-p-row"><label>兴趣爱好：</label><span>${esc(ls.hobby||'-')}</span></div>
    </div>`:''}
  </div>`;
}

function renderAIPortrait(task) {
  const ai = task.aiInsight;
  if (!ai) return `<div class="nt-empty"><div class="nt-empty-big">🤖</div><div>暂无AI画像数据</div></div>`;
  const sections = [
    { title:'客户基本信息', tags: ai.tags?.basic },
    { title:'客户意向信息', tags: ai.tags?.intent },
    { title:'客户行动与状态', tags: ai.tags?.behavior },
    { title:'客户关注点', tags: null },
    { title:'话术提醒', tags: null }
  ];
  return `<div class="nt-ai">
    <div class="nt-ai-subtabs"><button class="active">常见问题话术</button><button>智推问题话术</button></div>
    <div class="nt-ai-score"><span class="nt-ai-lv" style="color:${ai.levelColor}">${esc(ai.levelText)}</span><span class="nt-ai-sc">${ai.score}<small>分</small></span></div>
    <div class="nt-ai-sum"><h6>客户小结</h6><p>${ai.summary}</p></div>
    ${sections.map(s=>`<div class="nt-ai-sec"><h6>${s.title}</h6>${s.tags&&s.tags.length?`<div class="nt-ai-tags">${s.tags.map(([l,v])=>`<span class="nt-ai-tag"><em>${esc(l)}</em><strong>${esc(v)}</strong></span>`).join('')}</div>`:'<p class="nt-ai-empty">-</p>'}</div>`).join('')}
    <div class="nt-ai-note"><span class="nt-star">*</span> 为自动建档标签信息 <a>全部/</a><a>提及标签/</a><a>自定义标签</a></div>
  </div>`;
}

function renderRightTimeline(task) {
  const evs = task.timelineEvents || [];
  if (!evs.length) return `<div class="nt-empty"><div>暂无时光轴数据</div></div>`;
  const ico = {lead:'📋',call:'📞',sms:'💬',wecom:'💚',visit:'🏪',drive:'🚗'};
  return `<div class="nt-rtl">${evs.map((e,i)=>`
    <div class="nt-rtl-i">
      <div class="nt-rtl-dot">${ico[e.type]||'●'}</div>
      <div class="nt-rtl-c">
        <div class="nt-rtl-t">${esc(e.title)}</div>
        <div class="nt-rtl-m">${esc(e.time)}${e.agent?` · @${esc(e.agent)}`:''}</div>
        ${e.desc?`<div class="nt-rtl-d">${esc(e.desc)}</div>`:''}
      </div>
      ${i<evs.length-1?'<div class="nt-rtl-line"></div>':''}
    </div>`).join('')}</div>`;
}

function renderWishlist(task) {
  const wl = task.wishlist || [];
  if (!wl.length) return `<div class="nt-empty"><div class="nt-empty-big">❤️</div><div>暂无心愿单数据</div></div>`;
  return `<div class="nt-wish">${wl.map(w=>`
    <div class="nt-wish-i">
      <div class="nt-wish-car">${esc(w.car)}</div>
      <div class="nt-wish-cfg">配置：${esc(w.config||'-')}</div>
      ${w.note?`<div class="nt-wish-note">备注：${esc(w.note)}</div>`:''}
      <div class="nt-wish-t">添加时间：${esc(w.addTime||'-')}</div>
    </div>`).join('')}</div>`;
}

function renderTaskOverview(task) {
  const info = task.leadInfo || {};
  const configured = task.aiInsight || {};
  const ratingByLevel = {
    H: { text:'高', score:80, color:'#be123c' },
    A: { text:'中', score:68, color:'#d97706' },
    B: { text:'中', score:65, color:'#d97706' },
    C: { text:'低', score:45, color:'#2563eb' }
  };
  const level = task.formData?.intentLevel || task.level || '-';
  const fallbackRating = ratingByLevel[level] || ratingByLevel.B;
  const rating = configured.score != null ? {
    text: configured.levelText || fallbackRating.text,
    score: configured.score,
    color: configured.levelColor || fallbackRating.color
  } : fallbackRating;
  const levelColor = intentLevelOptions.find(item=>item.value===level)?.color || '#d97706';
  const currentLeadStatus = info.leadStatus || '-';
  const overdueMatch = String(task.dueLabel || '').match(/^逾期\s*(\d+)\s*d$/i);
  const dueText = overdueMatch ? `已逾期 ${overdueMatch[1]} 天` : (task.dueLabel || '待处理');
  const planTime = task.formData?.planBuyTime || info.buyTime || '待确认';
  const intentSeries = info.latestIntentSeries || task.formData?.intentCar || info.intentCar || '意向车型';
  const followCount = String(info.followCount || '0次').replace(/次$/, '');
  const isEditingName = editingCustomerNameTaskId === task.id;
  const summary = configured.summary || `当前评为<strong>${esc(rating.text)}等级</strong>：计划<strong>${esc(planTime)}</strong>购车，关注<strong>${esc(intentSeries)}</strong>；已产生<strong>${esc(followCount)}次</strong>跟进。建议结合客户关注点持续推进，优先确认购车计划与到店意向。`;
  return `<section class="nt-task-overview">
    <header class="nt-overview-head">
      <div class="nt-overview-customer">
        <div class="nt-overview-title-row">
          ${isEditingName?`<div class="nt-name-editor"><input type="text" value="${esc(task.name)}" maxlength="20" data-customer-name-input aria-label="客户姓名"><button type="button" class="nt-name-save" data-name-save>保存</button><button type="button" class="nt-name-cancel" data-name-cancel>取消</button></div>`:`<strong>${esc(task.name)}</strong>`}
          <span>${esc(task.phone)}</span>
          ${isEditingName?'':`<button type="button" class="nt-edit-icon" data-name-edit title="编辑客户姓名" aria-label="编辑客户姓名"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>`}
        </div>
        <div class="nt-overview-meta">任务编号 ${esc(task.id)} · ${esc(currentLeadStatus)} · ${esc(dueText)}</div>
      </div>
      <div class="nt-overview-owner"><span class="nt-overview-level" style="background:${levelColor}12;color:${levelColor}">意向 ${esc(level)}</span><span>当前处理人：张敏</span></div>
    </header>
    <div class="nt-overview-insight">
      <h3>沟通提示</h3>
      <div class="nt-overview-score"><strong style="color:${rating.color}">${esc(rating.text)}</strong><b>${rating.score}<small>分</small></b></div>
      <div class="nt-overview-summary">${summary}</div>
      <button type="button" class="nurture-rating-result-link" data-rtab="rating">查看预评结果与客户特征</button>
    </div>
  </section>`;
}

function renderRightPanel(task) {
  const primaryTabs = [
    { k:'rating', n:'智能预评' },
    { k:'details', n:'线索详情' },
    { k:'records', n:'回访记录', c:(task.visitRecords||[]).length },
    { k:'profile', n:'客户档案' }
  ];
  const moreTabs = [
    { k:'ai', n:'AI画像' },
    { k:'timeline', n:'时光轴' },
    { k:'wishlist', n:'心愿单' }
  ];
  const moreTabActive = moreTabs.some(tab=>tab.k===activeRightTab);
  return `<aside class="nt-right-panel">
    <div class="nt-assistant-header">
      <h3>客户辅助信息</h3>
      <button type="button" class="nt-assistant-close" data-nt-assistant-close aria-label="关闭客户辅助信息" title="关闭客户辅助信息">×</button>
    </div>
    <div class="nt-search-ai">
      <input type="text" class="nt-search-ai-input" placeholder="请输入问题"/>
      <button type="button" class="nt-search-ai-btn">搜 索</button>
    </div>
    <div class="nt-right-tabs">
      ${primaryTabs.map(t=>`<button type="button" class="nt-rt-tab ${activeRightTab===t.k?'active':''}" data-rtab="${t.k}">${esc(t.n)}${t.c!=null?`<span class="nt-rt-count">${t.c}</span>`:''}</button>`).join('')}
      <div class="nt-right-tab-more-wrap">
        <button type="button" class="nt-rt-more ${moreTabActive?'active':''}" data-rt-more aria-expanded="${rightTabMoreOpen?'true':'false'}">更多</button>
        <div class="nt-rt-more-menu ${rightTabMoreOpen?'show':''}">
          ${moreTabs.map(t=>`<button type="button" class="${activeRightTab===t.k?'active':''}" data-rtab="${t.k}">${esc(t.n)}</button>`).join('')}
        </div>
      </div>
    </div>
    <div class="nt-right-body">
      ${activeRightTab==='rating'?renderSmartRating(task):''}
      ${activeRightTab==='details'?renderLeadInfoSection(task):''}
      ${activeRightTab==='records'?renderVisitRecords(task):''}
      ${activeRightTab==='profile'?renderCustomerProfile(task):''}
      ${activeRightTab==='ai'?renderAIPortrait(task):''}
      ${activeRightTab==='timeline'?renderRightTimeline(task):''}
      ${activeRightTab==='wishlist'?renderWishlist(task):''}
    </div>
  </aside>`;
}

// ==================== 主渲染 ====================
window.renderNurtureTaskPage = function() {
  const page = document.getElementById('nurtureTaskPage');
  if (!page) return;
  const task = getActiveTask();
  nurtureTaskQueues.forEach(q => { q.count = nurtureTaskItems.filter(it => it.queue === q.id).length; });

  page.innerHTML = `<div class="nt-page-shell">
    ${renderNurtureTaskTopbar()}
    <div class="nt-workspace ${isNurtureAssistantCollapsed ? 'assistant-collapsed' : ''}">
      ${renderLeftPanel()}
      <main class="nt-center-panel">
      ${renderTaskOverview(task)}
      ${renderVisitForm(task)}
      </main>
      ${renderRightPanel(task)}
    </div>
  </div>`;

  bindEvents();
};

// ==================== 事件绑定 ====================
function bindEvents() {
  const page = document.getElementById('nurtureTaskPage');
  if (!page) return;
  page.onclick = function(e) {
    // 点击外部关闭下拉
    if (!e.target.closest('.nt-custom-select') && !e.target.closest('.nt-more-wrap')) {
      page.querySelectorAll('.nt-custom-select.open').forEach(s=>s.classList.remove('open'));
      page.querySelectorAll('.nt-more-menu.show').forEach(m=>m.classList.remove('show'));
    }
    if (!e.target.closest('.nt-right-tab-more-wrap')) {
      rightTabMoreOpen = false;
      page.querySelector('.nt-rt-more-menu.show')?.classList.remove('show');
    }

    const topAction = e.target.closest('[data-nt-top-action]');
    if (topAction) {
      const action = topAction.dataset.ntTopAction;
      if (action === 'toggle-assistant') {
        isNurtureAssistantCollapsed = !isNurtureAssistantCollapsed;
        renderNurtureTaskPage();
        return;
      }
      if (action === 'refresh') {
        renderNurtureTaskPage();
        showToast?.('任务列表已刷新', true);
        return;
      }
      if (action === 'simulate-seat') {
        activeNurtureTaskScope = 'nurture';
        activeNurtureTaskQueue = 'today';
        const simulatedTask = nurtureTaskItems.find(item => item.queue === 'today') || nurtureTaskItems[0];
        if (simulatedTask) activeNurtureTaskId = simulatedTask.id;
        renderNurtureTaskPage();
        showToast?.('已模拟坐席接听，客户任务已弹屏', true);
        return;
      }
    }

    const assistantClose = e.target.closest('[data-nt-assistant-close]');
    if (assistantClose) {
      isNurtureAssistantCollapsed = true;
      rightTabMoreOpen = false;
      renderNurtureTaskPage();
      return;
    }

    const nameEdit = e.target.closest('[data-name-edit]');
    if (nameEdit) {
      editingCustomerNameTaskId = activeNurtureTaskId;
      renderNurtureTaskPage();
      const input = document.querySelector('#nurtureTaskPage [data-customer-name-input]');
      input?.focus();
      input?.select();
      return;
    }
    if (e.target.closest('[data-name-save]')) {
      commitCustomerName(page);
      return;
    }
    if (e.target.closest('[data-name-cancel]')) {
      editingCustomerNameTaskId = null;
      renderNurtureTaskPage();
      return;
    }

    const summaryAction = e.target.closest('[data-nt-summary]');
    if (summaryAction) {
      if (summaryAction.dataset.ntSummary === 'overdue') {
        activeNurtureTaskScope = 'nurture';
        activeNurtureTaskQueue = 'overdue';
        const firstOverdue = nurtureTaskItems.find(item => item.queue === 'overdue');
        if (firstOverdue) activeNurtureTaskId = firstOverdue.id;
      }
      renderNurtureTaskPage();
      return;
    }

    // 队列折叠
    const scopeTab = e.target.closest('[data-task-scope]');
    if (scopeTab) {
      const nextScope = scopeTab.dataset.taskScope;
      if (nextScope !== activeNurtureTaskScope) {
        activeNurtureTaskScope = nextScope;
        const nextTask = nurtureTaskItems.find(task => Boolean(task.isDriveTask) === (nextScope === 'drive'));
        if (nextTask) {
          activeNurtureTaskId = nextTask.id;
          activeNurtureTaskQueue = nextTask.queue;
          collapsedQueues[nextTask.queue] = false;
        }
      }
      renderNurtureTaskPage(); return;
    }

    // 切换任务队列：下方任务列表同步切换为当前队列对应的培育线索。
    const qt = e.target.closest('[data-queue-toggle]');
    if (qt) {
      editingCustomerNameTaskId = null;
      activeNurtureTaskQueue = qt.dataset.queueToggle;
      const firstTask = nurtureTaskItems.find(task => task.queue === activeNurtureTaskQueue);
      if (firstTask) activeNurtureTaskId = firstTask.id;
      moreActionsOpen = false;
      renderNurtureTaskPage(); return;
    }

    // 任务卡片
    const tc = e.target.closest('.nt-task-card');
    if (tc) {
      editingCustomerNameTaskId = null;
      activeNurtureTaskId = tc.dataset.taskId;
      const t = nurtureTaskItems.find(x=>x.id===activeNurtureTaskId);
      if (t && t.queue !== activeNurtureTaskQueue) { activeNurtureTaskQueue = t.queue; collapsedQueues[t.queue] = false; }
      if (t) activeNurtureTaskScope = t.isDriveTask ? 'drive' : 'nurture';
      moreActionsOpen = false;
      renderNurtureTaskPage(); return;
    }

    // section折叠
    const st = e.target.closest('[data-section-toggle]');
    if (st) {
      const sec = st.dataset.sectionToggle;
      collapsedSections[sec] = !collapsedSections[sec];
      if (st.dataset.openTab && !collapsedSections[sec]) { activeRightTab = st.dataset.openTab; }
      renderNurtureTaskPage(); return;
    }

    // 复制按钮
    const cp = e.target.closest('[data-copy]');
    if (cp) { const t=cp.dataset.copy; navigator.clipboard?.writeText(t); showToast?.('已复制', true); return; }

    // select展开/收起
    const sel = e.target.closest('.nt-custom-select');
    if (sel && !sel.dataset.disabled) {
      const wasOpen = sel.classList.contains('open');
      page.querySelectorAll('.nt-custom-select.open').forEach(s=>s.classList.remove('open'));
      sel.classList.toggle('open', !wasOpen);
      e.stopPropagation(); return;
    }

    // select选项
    const opt = e.target.closest('.nt-select-option');
    if (opt) {
      const sel = opt.closest('.nt-custom-select');
      if (!sel) return;
      const field = sel.dataset.select;
      const val = opt.dataset.option;
      setFormField(field, val);
      sel.classList.remove('open');
      renderNurtureTaskPage(); return;
    }

    // select清除
    const clr = e.target.closest('[data-clear]');
    if (clr) { e.stopPropagation(); setFormField(clr.dataset.clear, ''); renderNurtureTaskPage(); return; }

    // 右栏更多菜单
    const rightMore = e.target.closest('[data-rt-more]');
    if (rightMore) {
      rightTabMoreOpen = !rightTabMoreOpen;
      renderNurtureTaskPage(); return;
    }

    // 右栏tab
    const rt = e.target.closest('[data-rtab]');
    if (rt) {
      activeRightTab = rt.dataset.rtab;
      rightTabMoreOpen = false;
      if (rt.classList.contains('nurture-rating-result-link')) isNurtureAssistantCollapsed = false;
      renderNurtureTaskPage(); return;
    }

    // 客户档案子tab
    const ps = e.target.closest('[data-psub]');
    if (ps) { activeProfileSubTab = ps.dataset.psub; renderNurtureTaskPage(); return; }

    // 表单操作
    const act = e.target.closest('[data-action]');
    if (act) {
      const a = act.dataset.action;
      if (a==='toggle-more') { moreActionsOpen = !moreActionsOpen; const mm = page.querySelector('.nt-more-menu'); mm&&mm.classList.toggle('show', moreActionsOpen); e.stopPropagation(); return; }
      if (a==='pause') { showToast?.('回访任务已暂存', true); return; }
      if (a==='submit') { showToast?.('回访结果已保存，下次回访任务已自动推送到预测外呼队列', true); return; }
      if (a==='sms') { showToast?.('短信关怀模板已发送至客户手机', true); return; }
      if (a==='store-query') { showToast?.('已调取意向门店地图与试驾车辆库存', true); return; }
      if (a==='drive-record') { showToast?.('已检索客户历史试驾预约记录', true); return; }
      if (a==='open-store-picker') { openStorePicker(); return; }
    }
  };

  // 搜索框
  const si = document.getElementById('nurtureSearchInput');
  if (si) {
    si.addEventListener('input', function() { nurtureSearchKeyword = this.value.trim(); });
    si.addEventListener('keydown', function(e) { if(e.key==='Enter') renderNurtureTaskPage(); });
  }
  const sb = document.getElementById('nurtureSearchBtn');
  if (sb) sb.onclick = function(){ renderNurtureTaskPage(); };

  const customerNameInput = page.querySelector('[data-customer-name-input]');
  if (customerNameInput) {
    customerNameInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitCustomerName(page);
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        editingCustomerNameTaskId = null;
        renderNurtureTaskPage();
      }
    });
  }

  // 表单输入
  page.querySelectorAll('[data-input]').forEach(inp=>{
    inp.addEventListener('input', function(){ setFormField(this.dataset.input, this.value); });
  });

  // 日期input点击（模拟简易日期选择）
  page.querySelectorAll('[data-date]').forEach(inp=>{
    inp.addEventListener('click', function(){
      const today = new Date();
      const d = new Date(today.getTime()+86400000);
      const str = d.toISOString().slice(0,10);
      setFormField(this.dataset.date, str);
      renderNurtureTaskPage();
    });
  });

  // 信息组采用单开手风琴，避免多个长字段区同时展开。
  page.querySelectorAll('.nt-lead-detail-disclosure').forEach(disclosure=>{
    disclosure.addEventListener('toggle', function(){
      if (!this.open) return;
      const container = this.closest('.nt-lead-details-view');
      container?.querySelectorAll('.nt-lead-detail-disclosure[open]').forEach(item=>{
        if (item !== this) item.open = false;
      });
    });
  });
}

function setFormField(field, value) {
  const task = getActiveTask();
  if (!task.formData) task.formData = {};
  task.formData[field] = value;
  // 联动：切换接触状态清空回访结果和原因
  if (field === 'contactStatus') {
    task.formData.visitResult = '';
    task.formData.resultReason = '';
  }
  // 联动：切换回访结果清空原因
  if (field === 'visitResult') {
    task.formData.resultReason = '';
  }
  moreActionsOpen = false;
}

function openStorePicker() {
  const task = getActiveTask();
  // 简单选择第一个门店
  const current = task.formData.intentStore;
  const idx = intentStoreOptions.findIndex(s=>s.code===current);
  const next = intentStoreOptions[(idx+1)%intentStoreOptions.length];
  setFormField('intentStore', next.code);
  renderNurtureTaskPage();
  showToast?.('已选择：' + next.name, true);
}

})();
