// ===== Tag Map =====
const blacklistPolicyCallTypeOptions = [
  '科大讯飞-冷线索',
  '科大讯飞-留资未满',
  '一知-冷线索',
  '一知-冷线索（大模型）',
  '冰兰-新线索',
  '冰兰-保客',
  '一知-大模型NEV新线索',
  '一知-保客'
];
const blacklistCommonTagOptions = ['高意向', '中意向', '低意向', '无意向', '投诉', '拒接'];
const tagMap = {
  ...Object.fromEntries(blacklistPolicyCallTypeOptions.map(type => [type, blacklistCommonTagOptions])),
  'AI外呼': ['高意向', '中意向', '低意向', '无意向', '投诉', '拒接'],
  '人工外呼': ['A类客户', 'B类客户', 'C类客户', '投诉', '拒接', '空号'],
  '机器人外呼': ['首次触达', '跟进回访', '沉默客户', '投诉', '拒接'],
  '预测外呼': ['高优', '中优', '低优', '投诉', '拒接'],
  'IVR外呼': ['通知类', '验证类', '提醒类', '投诉', '拒接'],
};

// ===== Data =====
let policies = [
  {
    id: 1,
    name: 'AI外呼-全局黑名单',
    desc: '针对投诉客户永久屏蔽AI外呼推送',
    callType: 'AI外呼',
    tags: ['投诉', '拒接'],
    tagCondition: 'or',
    priority: 1,
    durationType: 'perm',
    validityNum: null, validityUnit: null,
    status: '启用',
    manualReview: true,
    hitCount: 1284
  },
  {
    id: 2,
    name: '人工外呼-30天拦截',
    desc: '近30天内拒接3次以上的号码暂停外呼',
    callType: '人工外呼',
    tags: ['A类客户', '投诉'],
    tagCondition: 'and',
    priority: 3,
    durationType: 'temp',
    validityNum: 30, validityUnit: '天',
    status: '启用',
    manualReview: true,
    hitCount: 327
  },
  {
    id: 3,
    name: '机器人外呼-90天冷却',
    desc: '已成交客户机器人外呼冷却期设置',
    callType: '机器人外呼',
    tags: ['沉默客户', '拒接'],
    tagCondition: 'or',
    priority: 8,
    durationType: 'temp',
    validityNum: 90, validityUnit: '天',
    status: '停用',
    manualReview: false,
    hitCount: 89
  },
  {
    id: 4,
    name: 'IVR外呼-投诉号码永久黑名单',
    desc: '工信部投诉号码IVR外呼拦截',
    callType: 'IVR外呼',
    tags: ['投诉'],
    tagCondition: 'or',
    priority: 2,
    durationType: 'perm',
    validityNum: null, validityUnit: null,
    status: '启用',
    manualReview: false,
    hitCount: 56
  }
];
const hitRecords = {
  1: [
    {
      leadCode: 'PYXS202605280001', taskCode: 'PYRW202605280031', aiCode: 'AIHF202605280188', callId: 'CALL-20260528-0001284', phone: '138****6721', tag: '语音信箱、拒绝打扰、厌烦、无购车意向', audio: '试听', text: '客户表示近期不希望继续接收外呼，明确要求停止联系。', reviewStatus: '待审核', systemStatus: '待处理', exceptionReason: '—',
      transcript: {
        duration: '04:38', callType: 'AI外呼', result: '同意企微跟进',
        tags: ['关注N6', '旧车置换', '暂缓到店', '企微同意'],
        messages: [
          { role: 'agent', text: '诶..您好，我是东风日产的厂家顾问，嗯…看到您最近是有在关注日产..N6吗？' },
          { role: 'customer', text: '喂，你好' },
          { role: 'customer', text: '哎，你好' },
          { role: 'customer', text: '哎，你好，哎' },
          { role: 'customer', text: '呃，有关注', tag: 'intent' },
          { role: 'agent', text: '明白，N6最近是挺火的。那请问您这次买车，是考虑置换旧车呢，还是首次购车呀？' },
          { role: 'customer', text: '呃，旧车看马，看合适我就把旧车抵掉', tag: 'intent' },
          { role: 'agent', text: '噢，有旧车置换的话，我们厂家这边能直接给五千到一万的超级置换金，算下来比直接卖二手车划算不少。您这边是准备在本地用车吗？我帮您看下离您最近的门店。' },
          { role: 'customer', text: '哎，好的好的好的好的' },
          { role: 'agent', text: '行，那我帮您备注一下置换。您看明天或者周末，有时间去店里看看实车、了解一下吗？' },
          { role: 'customer', text: '呃，这两天可能没时间。呃，可能会过两天吧。过，过两天会呃，空了就会，会过去看一下', tag: 'action' },
          { role: 'agent', text: '好的，那到时候您有空可以直接去门店看看实车。对了，您平时用微信方便吗？我这边加您一个官方企业微信，到时候把最新的活动政策和门店定位都发您微信上，您看行吗？' },
          { role: 'customer', text: '好，可以可以。', tag: 'action' },
          { role: 'agent', text: '好的，我这边是用官方企微加您的，您看下微信首页有没有收到“服务通知”那个橙色小喇叭，点进去长按通过一下就行。对了，怎么称呼您呀？' },
          { role: 'customer', text: '嗯。' },
          { role: 'customer', text: '我免贵姓陆，哎' },
          { role: 'agent', text: '好的，已经备注您的姓氏啦。那...您这边，还有其他什么想咨询了解的吗？' },
          { role: 'customer', text: '呃，我就去看一下比较好一点吧，哈哈，我还没看见过实物，哈哈' }
        ]
      }
    },
    {
      leadCode: 'PYXS202605270093', taskCode: 'PYRW202605270210', aiCode: 'AIHF202605270512', callId: 'CALL-20260527-0000981', phone: '186****4309', tag: '拒接', audio: '试听', text: '连续多次未接通，系统识别为高频拒接号码。', reviewStatus: '待审核', systemStatus: '待处理', exceptionReason: '—',
      transcript: {
        duration: '00:08', callType: 'AI外呼', result: '拒接',
        tags: ['拒接'],
        messages: [
          { role: 'agent', text: '您好，我是东风日产的厂家顾问…' },
          { role: 'customer', text: '不需要，谢谢。' }
        ]
      }
    },
    {
      leadCode: 'PYXS202605260045', taskCode: 'PYRW202605260118', aiCode: 'AIHF202605260301', callId: 'CALL-20260526-0000756', phone: '159****2840', tag: '投诉', audio: '试听', text: '客户反馈已投诉外呼频次过高，需加入黑名单。', reviewStatus: '已驳回', systemStatus: '已处理', exceptionReason: '—',
      transcript: {
        duration: '01:45', callType: 'AI外呼', result: '投诉',
        tags: ['投诉', '无意向'],
        messages: [
          { role: 'agent', text: '您好，我是东风日产的厂家顾问，想跟您了解一下…' },
          { role: 'customer', text: '你们不要再打电话了！我已经投诉过了！' },
          { role: 'agent', text: '非常抱歉打扰到您，我这边马上帮您做备注处理。' },
          { role: 'customer', text: '每次都说备注，还是天天打！' },
          { role: 'agent', text: '真的非常抱歉，我这边立即操作，后续不会再打扰您。' }
        ]
      }
    }
  ],
  2: [
    {
      leadCode: 'PYXS202605280017', taskCode: 'PYRW202605280047', aiCode: 'AIHF202605280205', callId: 'CALL-20260528-0000327', phone: '137****9096', tag: 'A类客户 / 投诉', audio: '试听', text: '客户为A类线索，但本次通话明确表达投诉诉求，暂停30天外呼。', reviewStatus: '待审核', systemStatus: '已处理', exceptionReason: '冲突任务',
      transcript: {
        duration: '02:35', callType: '人工外呼', result: '投诉',
        tags: ['置换意向', '加微成功', '投诉'],
        messages: [
          { role: 'agent', text: '您好，我是东风日产的厂家顾问，看到您最近是有在关注日产 N6 吗？' },
          { role: 'customer', text: '喂，你好。有关注' },
          { role: 'agent', text: '明白，N6 最近是挺火的。那请问您这次买车，是考虑置换旧车呢，还是首次购车呀？', tag: 'intent' },
          { role: 'customer', text: '旧车看合适我就把旧车抵掉' },
          { role: 'agent', text: '有旧车置换的话，我们厂家这边能直接给五千到一万的超级置换金，算下来比直接卖二手车划算不少。您这边是准备在本地用车吗？我帮您看下离您最近的门店。', tag: 'action' },
          { role: 'customer', text: '好的好的' },
          { role: 'agent', text: '行，那我帮您备注一下置换。您看明天或者周末，有时间去店里看看实车、了解一下吗？' },
          { role: 'customer', text: '这两天可能没时间，可能会过两天吧。过两天空了会过去看一下' },
          { role: 'agent', text: '好的，那到时候您有空可以直接去门店看看实车。对了，您平时用微信方便吗？我这边加您一个官方企业微信，到时候把最新的活动政策和门店定位都发您微信上，您看行吗？', tag: 'action' },
          { role: 'customer', text: '好，可以可以' },
          { role: 'agent', text: '好的，我这边是用官方企微加您的，您看下微信首页有没有收到"服务通知"那个橙色小喇叭，点进去长按通过一下就行。对了，怎么称呼您呀？' },
          { role: 'customer', text: '我免贵姓陆。我就去看一下比较好一点吧，还没看见过实物，哈哈' }
        ]
      }
    },
    {
      leadCode: 'PYXS202605250066', taskCode: 'PYRW202605250142', aiCode: 'AIHF202605250377', callId: 'CALL-20260525-0000209', phone: '152****7811', tag: '投诉', audio: '试听', text: '客户要求减少联系，坐席标记投诉标签。', reviewStatus: '待审核', systemStatus: '已处理', exceptionReason: '冲突任务',
      transcript: {
        duration: '01:05', callType: '人工外呼', result: '投诉',
        tags: ['投诉'],
        messages: [
          { role: 'agent', text: '陆先生您好，我是东风日产的顾问，之前跟您聊过 N6 的…' },
          { role: 'customer', text: '能不能别再打了？你们一天打三遍！', tag: 'complaint' },
          { role: 'agent', text: '非常抱歉给您带来困扰，我这边立即帮您做减少联系的备注。' },
          { role: 'customer', text: '赶紧的，再打我投诉工信部了。' }
        ]
      }
    }
  ],
  3: [
    {
      leadCode: 'PYXS202605240021', taskCode: 'PYRW202605240088', aiCode: 'AIHF202605240144', callId: 'CALL-20260524-0000089', phone: '185****3362', tag: '沉默客户 / 拒接', audio: '试听', text: '客户无有效回应，机器人回访多轮未触达。', reviewStatus: '待审核', systemStatus: '已处理', exceptionReason: '冲突任务',
      transcript: {
        duration: '00:22', callType: '机器人外呼', result: '拒接',
        tags: ['沉默客户', '拒接'],
        messages: [
          { role: 'agent', text: '您好，这里是东风日产智能客服，想跟您确认一下近期看车的安排…' },
          { role: 'customer', text: '嗯…不用了' }
        ]
      }
    }
  ],
  4: [
    {
      leadCode: 'PYXS202605220014', taskCode: 'PYRW202605220063', aiCode: 'AIHF202605220102', callId: 'CALL-20260522-0000056', phone: '139****5188', tag: '投诉', audio: '试听', text: 'IVR回访后客户反馈投诉号码，系统永久拦截。', reviewStatus: '待审核', systemStatus: '已处理', exceptionReason: '冲突任务',
      transcript: {
        duration: '00:38', callType: 'IVR外呼', result: '投诉',
        tags: ['投诉'],
        messages: [
          { role: 'agent', text: '尊敬的客户您好，这里是东风日产回访通知，感谢您…' },
          { role: 'customer', text: '不要再打这个号码了！' },
          { role: 'agent', text: '好的，已为您标记，后续不再拨打，感谢您的理解。' }
        ]
      }
    }
  ]
};
let nextId = 5;
let editingId = null;
let viewingId = null;
let currentDuration = 'perm';
let currentCondition = 'and';
let currentPage = 1;
let policyPageSize = 10;
let hitRecordPage = 1;
let hitRecordPageSize = 10;
let hitRecordKeyword = '';
let activeTranscriptCallId = '';
let selectedHitRecordIds = [];
let activeAudioCallId = '';
let audioPlaying = false;
let audioProgressSeconds = 0;
let audioDurationSeconds = 0;
let audioTimer = null;
let worryFreeBatchCurrentPage = 1;
let worryFreeBatchPageSize = 5;
let worryFreeBatchDetailCurrentPage = 1;
let worryFreeBatchDetailPageSize = 10;
let activeWorryFreeBatchDetailDate = '';

const nurtureLeadColumns = [
  { key: 'headquarterLeadId', label: '总部线索ID', defaultVisible: true },
  { key: 'leadCode', label: '培育线索编码', defaultVisible: true },
  { key: 'status', label: '线索状态', defaultVisible: true },
  { key: 'customerName', label: '客户姓名', defaultVisible: true },
  { key: 'phone', label: '电话号码', defaultVisible: true },
  { key: 'intentSeries', label: '意向车系', defaultVisible: true },
  { key: 'intentLevel', label: '意向级别', defaultVisible: true },
  { key: 'dealer', label: '意向专营店', defaultVisible: true },
  { key: 'latestSeries', label: '最新留资车系', defaultVisible: true },
  { key: 'createdAt', label: '创建时间', defaultVisible: true },
  { key: 'sourceLeadId', label: '来源线索ID', defaultVisible: true },
  { key: 'leadType', label: '线索类型', defaultVisible: false },
  { key: 'leadSource', label: '线索来源', defaultVisible: false },
  { key: 'abnormalCode', label: '异常原因', defaultVisible: false },
  { key: 'gender', label: '性别', defaultVisible: false },
  { key: 'backupPhone', label: '备用电话', defaultVisible: false },
  { key: 'smartCode', label: 'SmartCode', defaultVisible: false },
  { key: 'purchaseMethod', label: '购车方式', defaultVisible: false },
  { key: 'plannedPurchaseTime', label: '计划购买时间', defaultVisible: false },
  { key: 'ipLocation', label: 'IP地址归属地', defaultVisible: false }
];

const carSeriesOptions = ['N6', '轩逸', '逍客', '奇骏', '天籁'];
const channelCodeOptions = Array.from({ length: 10 }, (_, index) => `R${index + 1}`);
const dealerOptions = [
  { code: 'DLR-GD-GZ-001', name: '广州东风日产天河店', province: '广东省', city: '广州市', district: '天河区' },
  { code: 'DLR-GD-SZ-002', name: '深圳东风日产南山店', province: '广东省', city: '深圳市', district: '南山区' },
  { code: 'DLR-ZJ-HZ-003', name: '杭州东风日产滨江店', province: '浙江省', city: '杭州市', district: '滨江区' },
  { code: 'DLR-SH-PD-004', name: '上海东风日产浦东店', province: '上海市', city: '上海市', district: '浦东新区' },
  { code: 'DLR-SC-CD-005', name: '成都东风日产高新店', province: '四川省', city: '成都市', district: '高新区' }
];
const reviewUserOptions = [
  { account: 'U10021', name: '张敏', role: '黑名单审核员', department: '线索运营部' },
  { account: 'U10008', name: '李强', role: 'DCC主管', department: 'DCC管理组' },
  { account: 'U10032', name: '陈晨', role: '线索运营', department: '线索运营部' },
  { account: 'U10016', name: '王磊', role: '运营负责人', department: '运营管理部' },
  { account: 'U10061', name: '赵佳', role: '合规审核员', department: '合规管理组' },
  { account: 'U10077', name: '周宁', role: '平台管理员', department: 'DCC平台组' }
];
const leadDispatchCallTypeGroups = {
  cold: ['科大讯飞-冷线索', '科大讯飞-留资未满', '一知-冷线索', '一知-冷线索（大模型）'],
  nev: ['冰兰-新线索', '冰兰-保客', '一知-大模型NEV新线索', '一知-保客']
};
const unifiedPolicyCallTypeOptions = [...new Set(Object.values(leadDispatchCallTypeGroups).flat())];
const leadDispatchTagOptions = [
  '有购车意向', '同意到店', '优惠活动', '金融政策', '置换政策', '首购', '换购', '增购',
  '全款', '贷款', '价格', '交付时间', '能耗', '三电', '同意顾问联系', '颜色', '同意添加企微',
  '已购车', '已到店', '已下订', '拒绝打扰\\厌烦', '语音信箱', '老年人', '接通秒挂',
  '接通无标签', '下次联系', '无购车意向', '不同意到店', '不同意添加企微', '不同意顾问联系'
];
const leadDispatchCallStatusOptions = ['已接通', '客户未接听', '关机', '空号', '停机', '拒接', '接通秒挂', '待返回'];
const outboundMappingSourceOptions = ['外呼标签', '通话状态'];
const outboundMappingCategoryOptions = ['抗拒原因标签', '异常原因标签'];
const outboundMappingOutputMap = {
  '抗拒原因标签': ['客观理由拒绝', '态度拒绝'],
  '异常原因标签': ['客户号码状态异常', '沟通异常']
};
const outboundMappingSourceMap = {
  '客观理由拒绝': ['外呼标签'],
  '态度拒绝': ['外呼标签'],
  '客户号码状态异常': ['外呼标签', '通话状态'],
  '沟通异常': ['外呼标签', '通话状态']
};
let outboundLabelMappingRules = [
  { id: 1, name: '客观理由拒绝归因', category: '抗拒原因标签', sources: ['外呼标签'], matchValuesBySource: { '外呼标签': ['已购车', '已下订', '已到店', '无购车意向'] }, output: '客观理由拒绝', remark: '客户已有明确客观原因，优先归为客观理由拒绝', enabled: true, updatedAt: '2026-06-22 10:20' },
  { id: 2, name: '态度拒绝归因', category: '抗拒原因标签', sources: ['外呼标签'], matchValuesBySource: { '外呼标签': ['拒绝打扰\\厌烦', '拒绝打扰', '拒绝顾问联系', '不同意到店', '不同意添加企微'] }, output: '态度拒绝', remark: '客户主观拒绝沟通或拒绝后续触达', enabled: true, updatedAt: '2026-06-22 10:25' },
  { id: 3, name: '号码异常综合归因', category: '异常原因标签', sources: ['外呼标签', '通话状态'], matchValuesBySource: { '外呼标签': ['语音信箱'], '通话状态': ['空号', '停机', '关机'] }, output: '客户号码状态异常', remark: '支持同时按外呼标签和通话状态识别客户号码状态异常', enabled: true, updatedAt: '2026-06-21 15:12' },
  { id: 4, name: '沟通异常综合归因', category: '异常原因标签', sources: ['外呼标签', '通话状态'], matchValuesBySource: { '外呼标签': ['拒绝打扰\\厌烦', '老年人'], '通话状态': ['客户未接听', '拒接'] }, output: '沟通异常', remark: '支持同时按外呼标签和通话状态识别沟通异常', enabled: true, updatedAt: '2026-06-20 18:04' }
];
let outboundLabelMappingNextId = 5;
let editingOutboundLabelMappingId = null;
const leadDispatchLeadStatusOptions = [
  '',
  '总部_高意向',
  '总部_休眠未购',
  '总部_休眠失联',
  '总部_战败',
  '总部_暂败',
  '总部_阶段性战败',
  '总部_无效',
  '总部_异地'
];
const leadDispatchFormLeadStatusOptions = leadDispatchLeadStatusOptions.filter(status => !['总部_暂败', '总部_异地'].includes(status));
const leadDispatchAbnormalReasonMap = {
  '': [''],
  '总部_高意向': [''],
  '总部_休眠未购': ['资金不足', '半年内不购车', '家人不同意', '征信不通过', '驾照没考到', '关注竞品车型', '其他'],
  '总部_休眠失联': ['三天四次无法接通', '用户要求不联系', '被拉黑'],
  '总部_战败': ['等待期长', '价格因素', '品牌偏好', '金融方案', '产品设计和配置', '服务不满', '其他'],
  '总部_无效': ['明确空号', '错号', '停机']
};
const leadDispatchIntentLevelOptions = [
  '',
  'H - H(高意向)',
  'A - A(一周内买车)',
  'B - B(计划三个月内买车)',
  'C - C(计划三个月后买车)',
  'F - F(战败)',
  'L - L(休眠)',
  'N - N(阶段性战败)'
];
const highIntentLevelOptions = [
  'H - H(高意向)',
  'A - A(一周内买车)',
  'B - B(计划三个月内买车)',
  'C - C(计划三个月后买车)'
];
const leadStatusIntentLevelMap = {
  '总部_休眠未购': 'L - L(休眠)',
  '总部_休眠失联': 'L - L(休眠)',
  '总部_战败': 'F - F(战败)',
  '总部_阶段性战败': 'N - N(阶段性战败)',
  '总部_无效': ''
};
let leadDispatchRules = [
  { id: 1, name: '冷线索高意向有店下发', priority: 1, callTypes: leadDispatchCallTypeGroups.cold, includeTags: ['有购车意向', '同意到店'], includeTagLogic: '且', excludeTags: ['已购车', '已到店', '已下订', '拒绝打扰\\厌烦', '语音信箱', '老年人'], excludeTagLogic: '或', durationOperator: '', durationSeconds: '', durationLogic: '', hasIntentDealer: '有', dispatchTarget: '下发到NEV线索中台', updateSmartCode: '', updateLeadStatus: '总部_高意向', abnormalReason: '', updateIntentLevel: 'B - B(计划三个月内买车)', enabled: true },
  { id: 2, name: '冷线索高意向无店转客服', priority: 3, callTypes: leadDispatchCallTypeGroups.cold, includeTags: ['有购车意向', '同意到店'], includeTagLogic: '且', excludeTags: ['已购车', '已到店', '已下订', '拒绝打扰\\厌烦', '语音信箱', '老年人'], excludeTagLogic: '或', durationOperator: '', durationSeconds: '', durationLogic: '', hasIntentDealer: '无', dispatchTarget: '下发到总部培育客服', updateSmartCode: '', updateLeadStatus: '', abnormalReason: '', updateIntentLevel: 'C - C(计划三个月后买车)', enabled: true },
  { id: 3, name: '冷线索兴趣标签有店下发', priority: 2, callTypes: leadDispatchCallTypeGroups.cold, includeTags: ['有购车意向', '同意到店', '优惠活动', '金融政策', '置换政策', '首购', '换购', '增购', '全款', '贷款', '价格', '交付时间', '能耗', '三电', '同意顾问联系', '颜色', '同意添加企微'], includeTagLogic: '或', excludeTags: ['已购车', '已到店', '已下订', '拒绝打扰\\厌烦', '语音信箱', '老年人'], excludeTagLogic: '或', durationOperator: '大于等于', durationSeconds: 15, durationLogic: '且', hasIntentDealer: '有', dispatchTarget: '下发到NEV线索中台', updateSmartCode: '', updateLeadStatus: '总部_高意向', abnormalReason: '', updateIntentLevel: 'B - B(计划三个月内买车)', enabled: true },
  { id: 4, name: '冷线索短通话无店不下发', priority: 4, callTypes: leadDispatchCallTypeGroups.cold, includeTags: ['有购车意向', '同意到店', '优惠活动', '金融政策', '置换政策', '首购', '换购', '增购', '全款', '贷款', '价格', '交付时间', '能耗', '三电', '同意顾问联系', '颜色', '同意添加企微'], includeTagLogic: '或', excludeTags: ['已购车', '已到店', '已下订', '拒绝打扰\\厌烦', '语音信箱', '老年人'], excludeTagLogic: '或', durationOperator: '小于', durationSeconds: 15, durationLogic: '或', hasIntentDealer: '无', dispatchTarget: '线索不下发', updateSmartCode: '', updateLeadStatus: '', abnormalReason: '', updateIntentLevel: '', enabled: true },
  { id: 5, name: 'NEV线索高意向有店下发', priority: 1, callTypes: leadDispatchCallTypeGroups.nev, includeTags: ['有购车意向', '同意到店'], includeTagLogic: '且', excludeTags: ['已购车', '已到店', '已下订', '拒绝打扰\\厌烦', '语音信箱', '老年人'], excludeTagLogic: '或', durationOperator: '', durationSeconds: '', durationLogic: '', hasIntentDealer: '有', dispatchTarget: '下发到NEV线索中台', updateSmartCode: '', updateLeadStatus: '总部_高意向', abnormalReason: '', updateIntentLevel: 'B - B(计划三个月内买车)', enabled: true },
  { id: 6, name: 'NEV线索高意向无店转客服', priority: 3, callTypes: leadDispatchCallTypeGroups.nev, includeTags: ['有购车意向', '同意到店'], includeTagLogic: '且', excludeTags: ['已购车', '已到店', '已下订', '拒绝打扰\\厌烦', '语音信箱', '老年人'], excludeTagLogic: '或', durationOperator: '', durationSeconds: '', durationLogic: '', hasIntentDealer: '无', dispatchTarget: '下发到总部培育客服', updateSmartCode: '', updateLeadStatus: '', abnormalReason: '', updateIntentLevel: 'C - C(计划三个月后买车)', enabled: true },
  { id: 7, name: 'NEV线索兴趣标签有店下发', priority: 2, callTypes: leadDispatchCallTypeGroups.nev, includeTags: ['有购车意向', '同意到店', '优惠活动', '金融政策', '置换政策', '首购', '换购', '增购', '全款', '贷款', '价格', '交付时间', '能耗', '三电', '同意顾问联系', '颜色', '同意添加企微'], includeTagLogic: '或', excludeTags: ['已购车', '已到店', '已下订', '拒绝打扰\\厌烦', '语音信箱', '老年人'], excludeTagLogic: '或', durationOperator: '', durationSeconds: '', durationLogic: '且', hasIntentDealer: '有', dispatchTarget: '下发到NEV线索中台', updateSmartCode: '', updateLeadStatus: '总部_高意向', abnormalReason: '', updateIntentLevel: 'B - B(计划三个月内买车)', enabled: true },
  { id: 8, name: 'NEV线索战败标签不下发', priority: 4, callTypes: leadDispatchCallTypeGroups.nev, includeTags: ['已下订', '已到店', '已购车', '拒绝打扰\\厌烦'], includeTagLogic: '或', excludeTags: [], excludeTagLogic: '或', durationOperator: '', durationSeconds: '', durationLogic: '或', hasIntentDealer: '无', dispatchTarget: '线索不下发', updateSmartCode: '', updateLeadStatus: '总部_战败', abnormalReason: '其他', updateIntentLevel: 'F - F(战败)', enabled: true },
  { id: 9, name: 'NEV老年人休眠未购', priority: 4, callTypes: leadDispatchCallTypeGroups.nev, includeTags: ['老年人'], includeTagLogic: '或', excludeTags: [], excludeTagLogic: '或', durationOperator: '', durationSeconds: '', durationLogic: '或', hasIntentDealer: '无', dispatchTarget: '线索不下发', updateSmartCode: '', updateLeadStatus: '总部_休眠未购', abnormalReason: '其他', updateIntentLevel: 'L - L(休眠)', enabled: true },
  { id: 10, name: 'NEV语音信箱休眠失联', priority: 4, callTypes: leadDispatchCallTypeGroups.nev, includeTags: ['语音信箱'], includeTagLogic: '或', excludeTags: [], excludeTagLogic: '或', durationOperator: '', durationSeconds: '', durationLogic: '或', hasIntentDealer: '无', dispatchTarget: '线索不下发', updateSmartCode: '', updateLeadStatus: '总部_休眠失联', abnormalReason: '三天四次无法接通', updateIntentLevel: 'L - L(休眠)', enabled: true },
  { id: 11, name: 'NEV无效通话休眠失联', priority: 4, callTypes: leadDispatchCallTypeGroups.nev, includeTags: ['接通秒挂', '接通无标签', '下次联系'], includeTagLogic: '或', excludeTags: [], excludeTagLogic: '或', durationOperator: '', durationSeconds: '', durationLogic: '或', hasIntentDealer: '无', dispatchTarget: '线索不下发', updateSmartCode: '', updateLeadStatus: '总部_休眠失联', abnormalReason: '三天四次无法接通', updateIntentLevel: 'L - L(休眠)', enabled: true },
  { id: 12, name: 'NEV无意向休眠未购', priority: 4, callTypes: leadDispatchCallTypeGroups.nev, includeTags: ['无购车意向', '不同意到店', '不同意添加企微', '不同意顾问联系'], includeTagLogic: '或', excludeTags: [], excludeTagLogic: '或', durationOperator: '', durationSeconds: '', durationLogic: '或', hasIntentDealer: '无', dispatchTarget: '线索不下发', updateSmartCode: '', updateLeadStatus: '总部_休眠未购', abnormalReason: '其他', updateIntentLevel: 'L - L(休眠)', enabled: true }
];
let leadDispatchNextId = 13;
let editingLeadDispatchRuleId = null;
let leadDispatchCurrentPage = 1;
let leadDispatchPageSize = 10;

const resourceLeadColumns = [
  { key: 'resourceLeadCode', label: '留资线索编码', defaultVisible: true },
  { key: 'dispatchStatus', label: '下发状态', defaultVisible: true },
  { key: 'customerName', label: '客户姓名', defaultVisible: true },
  { key: 'phone', label: '电话号码', defaultVisible: true },
  { key: 'intentSeries', label: '意向车系', defaultVisible: true },
  { key: 'dealer', label: '意向专营店', defaultVisible: true },
  { key: 'leadType', label: '线索类型', defaultVisible: true },
  { key: 'smartCode', label: 'SmartCode', defaultVisible: true },
  { key: 'channelCode', label: '渠道编码', defaultVisible: true },
  { key: 'sourceLeadId', label: '来源线索ID', defaultVisible: true },
  { key: 'manufacturerLeadCode', label: '厂商线索编码', defaultVisible: true },
  { key: 'resourceTime', label: '留资时间', defaultVisible: true },
  { key: 'createdAt', label: '创建时间', defaultVisible: true }
];

const resourceLeads = [
  { resourceLeadCode: 'LZXS202605280001', dispatchStatus: '已下发', customerName: '陆先生', gender: '男', phone: '138****6721', backupPhone: '—', ipLocation: '广东广州', sourceLeadId: 'SRC202605280188', sourceSystemCode: 'SYS-DCD-001', leadAttribute: '新线索', leadType: '门店冷线索', leadSource: '懂车帝', intentLevel: 'A', intentPrice: '18-22万', intentBrand: '东风日产', intentSeries: 'N6', dealer: '广州东风日产天河店', dealerCode: 'DLR-GD-GZ-001', resourceTime: '2026-05-28 09:10:22', followUserId: 'U10086', leadDesc: '客户关注N6上市活动，咨询置换补贴和试驾安排。', leadRemark: '优先分配广州天河店跟进。', smartCode: 'SC-N6-0891', channelCode: 'R1', landingPlatform: 'H5落地页', mediaName: '懂车帝', projectName: 'N6上市留资', deliveryLeadType: '车型兴趣线索', manufacturerLeadCode: 'FAC202605280001', createdAt: '2026-05-28' },
  { resourceLeadCode: 'LZXS202605270093', dispatchStatus: '待下发', customerName: '陈女士', gender: '女', phone: '186****4309', backupPhone: '020****8812', ipLocation: '广东深圳', sourceLeadId: 'SRC202605270512', sourceSystemCode: 'SYS-QD-002', leadAttribute: '再分配', leadType: '媒体留资', leadSource: '汽车之家', intentLevel: 'B', intentPrice: '12-15万', intentBrand: '东风日产', intentSeries: '轩逸', dealer: '深圳东风日产南山店', dealerCode: 'DLR-GD-SZ-002', resourceTime: '2026-05-27 14:32:08', followUserId: 'U10032', leadDesc: '客户咨询轩逸金融方案。', leadRemark: '等待线索下发。', smartCode: 'SC-SY-0234', channelCode: 'R2', landingPlatform: 'APP表单', mediaName: '汽车之家', projectName: '轩逸区域集客', deliveryLeadType: '价格咨询线索', manufacturerLeadCode: 'FAC202605270093', createdAt: '2026-05-27' },
  { resourceLeadCode: 'LZXS202605260045', dispatchStatus: '已下发', customerName: '王先生', gender: '男', phone: '159****2840', backupPhone: '—', ipLocation: '浙江杭州', sourceLeadId: 'SRC202605260301', sourceSystemCode: 'SYS-LIVE-003', leadAttribute: '新线索', leadType: '直播留资', leadSource: '抖音直播', intentLevel: 'H', intentPrice: '14-17万', intentBrand: '东风日产', intentSeries: '逍客', dealer: '杭州东风日产滨江店', dealerCode: 'DLR-ZJ-HZ-003', resourceTime: '2026-05-26 18:21:45', followUserId: 'U10061', leadDesc: '直播间留资，关注逍客现车和到店权益。', leadRemark: '已同步给门店。', smartCode: 'SC-XK-7712', channelCode: 'R3', landingPlatform: '直播表单', mediaName: '抖音', projectName: '逍客直播专场', deliveryLeadType: '直播留资线索', manufacturerLeadCode: 'FAC202605260045', createdAt: '2026-05-26' },
  { resourceLeadCode: 'LZXS202605250118', dispatchStatus: '下发失败', customerName: '李女士', gender: '女', phone: '137****9088', backupPhone: '—', ipLocation: '上海', sourceLeadId: 'SRC202605250664', sourceSystemCode: 'SYS-MP-004', leadAttribute: '新线索', leadType: '平台留资', leadSource: '小程序', intentLevel: 'C', intentPrice: '18-21万', intentBrand: '东风日产', intentSeries: '奇骏', dealer: '上海东风日产浦东店', dealerCode: 'DLR-SH-PD-004', resourceTime: '2026-05-25 10:18:36', followUserId: 'U10029', leadDesc: '客户填写试驾预约，门店下发接口返回失败。', leadRemark: '等待重新下发。', smartCode: 'SC-QJ-5520', channelCode: 'R4', landingPlatform: '小程序', mediaName: '企业微信', projectName: '奇骏试驾预约', deliveryLeadType: '试驾预约线索', manufacturerLeadCode: 'FAC202605250118', createdAt: '2026-05-25' },
  { resourceLeadCode: 'LZXS202605240076', dispatchStatus: '无需下发', customerName: '赵先生', gender: '男', phone: '135****2190', backupPhone: '—', ipLocation: '四川成都', sourceLeadId: 'SRC202605240902', sourceSystemCode: 'SYS-MP-005', leadAttribute: '沉默唤醒', leadType: '小程序留资', leadSource: '小程序', intentLevel: 'A', intentPrice: '16-19万', intentBrand: '东风日产', intentSeries: '天籁', dealer: '成都东风日产高新店', dealerCode: 'DLR-SC-CD-005', resourceTime: '2026-05-24 16:06:12', followUserId: 'U10077', leadDesc: '客户重复留资，系统判定无需再次下发。', leadRemark: '保持现有跟进链路。', smartCode: 'SC-TL-4219', channelCode: 'R5', landingPlatform: '品牌官网', mediaName: '日产官网', projectName: '天籁权益咨询', deliveryLeadType: '重复留资线索', manufacturerLeadCode: 'FAC202605240076', createdAt: '2026-05-24' }
];

const resourceUnfilledColumns = [
  { key: 'unfilledId', label: '留资未满ID' },
  { key: 'syncStatus', label: '同步状态' },
  { key: 'customerName', label: '客户姓名' },
  { key: 'phone', label: '电话号码' },
  { key: 'intentSeries', label: '意向车系' },
  { key: 'dealer', label: '意向专营店' },
  { key: 'leadType', label: '线索类型' },
  { key: 'leadSource', label: '线索来源' },
  { key: 'smartCode', label: 'SmartCode' },
  { key: 'nurtureLeadCode', label: '培育线索编码' },
  { key: 'crowdPackageTag', label: '人群包标信息' },
  { key: 'timeSlotCapacity', label: '时段容量数量' },
  { key: 'timeSlotRemaining', label: '时段剩余容量' }
];

const resourceUnfilledLeads = [
  { unfilledId: 'LZWM202605280001', syncStatus: '同步成功', customerName: '陆先生', phone: '138****6721', intentSeries: 'N6', dealer: '广州东风日产天河店', leadType: '留资未满挖掘', leadSource: '懂车帝', systemSource: '懂车帝', smartCode: 'SC-N6-0891', nurtureLeadCode: 'PYXS202605280001', crowdPackageTag: 'N6高意向-广州', timeSlotLabel: '20260528 06:30~06:59', timeSlotCapacity: 120, timeSlotRemaining: 36, createdAt: '2026-05-28' },
  { unfilledId: 'LZWM202605270093', syncStatus: '待同步', customerName: '陈女士', phone: '186****4309', intentSeries: '轩逸', dealer: '深圳东风日产南山店', leadType: '私域线索挖掘', leadSource: '私域运营', systemSource: '私域运营', smartCode: 'SC-SY-0234', nurtureLeadCode: 'PYXS202605270093', crowdPackageTag: '轩逸私域唤醒', timeSlotLabel: '20260527 07:00~07:29', timeSlotCapacity: 80, timeSlotRemaining: 18, createdAt: '2026-05-27' },
  { unfilledId: 'LZWM202605260045', syncStatus: '同步成功', customerName: '王先生', phone: '159****2840', intentSeries: '逍客', dealer: '杭州东风日产滨江店', leadType: '留资未满挖掘', leadSource: '抖音直播', systemSource: '抖音直播', smartCode: 'SC-XK-7712', nurtureLeadCode: 'PYXS202605260045', crowdPackageTag: '直播留资补全', timeSlotLabel: '20260526 07:30~07:59', timeSlotCapacity: 100, timeSlotRemaining: 42, createdAt: '2026-05-26' },
  { unfilledId: 'LZWM202605250118', syncStatus: '同步失败', customerName: '李女士', phone: '137****9088', intentSeries: '奇骏', dealer: '上海东风日产浦东店', leadType: '私域线索挖掘', leadSource: '小程序', systemSource: '小程序', smartCode: 'SC-QJ-5520', nurtureLeadCode: 'PYXS202605250118', crowdPackageTag: '奇骏试驾召回', timeSlotLabel: '20260525 08:00~08:29', timeSlotCapacity: 60, timeSlotRemaining: 0, createdAt: '2026-05-25' },
  { unfilledId: 'LZWM202605240076', syncStatus: '无需同步', customerName: '赵先生', phone: '135****2190', intentSeries: '天籁', dealer: '成都东风日产高新店', leadType: '留资未满挖掘', leadSource: '小程序', systemSource: '小程序', smartCode: 'SC-TL-4219', nurtureLeadCode: 'PYXS202605240076', crowdPackageTag: '重复留资识别', timeSlotLabel: '20260524 08:30~08:59', timeSlotCapacity: 90, timeSlotRemaining: 90, createdAt: '2026-05-24' }
];

const nurtureLeads = [
  { leadCode: 'PYXS202605280001', headquarterLeadId: 'HQ202605280188', leadType: '新线索', leadSource: '门店冷线索', status: '培育中', abnormalCode: '—', customerName: '陆先生', gender: '男', phone: '138****6721', backupPhone: '—', intentSeries: 'N6', intentLevel: 'A', dealer: '广州东风日产天河店', dealerCode: 'DLR-GD-GZ-001', latestSeries: 'N6', smartCode: 'SC-N6-0891', purchaseMethod: '置换', plannedPurchaseTime: '1个月内', ipLocation: '广东广州', createdAt: '2026-05-28', sourceLeadId: 'SRC202605280188' },
  { leadCode: 'PYXS202605270093', headquarterLeadId: 'HQ202605270512', leadType: '再分配', leadSource: '懂车帝', status: '待培育', abnormalCode: 'PHONE_BUSY', customerName: '陈女士', gender: '女', phone: '186****4309', backupPhone: '020****8812', intentSeries: '轩逸', intentLevel: 'B', dealer: '深圳东风日产南山店', dealerCode: 'DLR-GD-SZ-002', latestSeries: '轩逸', smartCode: 'SC-SY-0234', purchaseMethod: '首购', plannedPurchaseTime: '3个月内', ipLocation: '广东深圳', createdAt: '2026-05-27', sourceLeadId: 'SRC202605270512' },
  { leadCode: 'PYXS202605260045', headquarterLeadId: 'HQ202605260301', leadType: '新线索', leadSource: '抖音直播', status: '已邀约', abnormalCode: '—', customerName: '王先生', gender: '男', phone: '159****2840', backupPhone: '—', intentSeries: '逍客', intentLevel: 'H', dealer: '杭州东风日产滨江店', dealerCode: 'DLR-ZJ-HZ-003', latestSeries: '逍客', smartCode: 'SC-XK-7712', purchaseMethod: '贷款', plannedPurchaseTime: '两周内', ipLocation: '浙江杭州', createdAt: '2026-05-26', sourceLeadId: 'SRC202605260301' },
  { leadCode: 'PYXS202605250118', headquarterLeadId: 'HQ202605250664', leadType: '沉默唤醒', leadSource: '汽车之家', status: '无效', abnormalCode: 'NO_INTENT', customerName: '李女士', gender: '女', phone: '137****9088', backupPhone: '—', intentSeries: '奇骏', intentLevel: 'C', dealer: '上海东风日产浦东店', dealerCode: 'DLR-SH-PD-004', latestSeries: '奇骏', smartCode: 'SC-QJ-5520', purchaseMethod: '未定', plannedPurchaseTime: '半年内', ipLocation: '上海', createdAt: '2026-05-25', sourceLeadId: 'SRC202605250664' },
  { leadCode: 'PYXS202605240076', headquarterLeadId: 'HQ202605240902', leadType: '新线索', leadSource: '小程序', status: '已转化', abnormalCode: '—', customerName: '赵先生', gender: '男', phone: '135****2190', backupPhone: '—', intentSeries: '天籁', intentLevel: 'A', dealer: '成都东风日产高新店', dealerCode: 'DLR-SC-CD-005', latestSeries: '天籁', smartCode: 'SC-TL-4219', purchaseMethod: '全款', plannedPurchaseTime: '1个月内', ipLocation: '四川成都', createdAt: '2026-05-24', sourceLeadId: 'SRC202605240902' }
];

let visibleNurtureLeadFields = nurtureLeadColumns.filter(col => col.defaultVisible).map(col => col.key);
let nurtureLeadSortField = 'createdAt';
let nurtureLeadSortDirection = 'desc';
let nurtureLeadCurrentPage = 1;
let nurtureLeadPageSize = 5;
let visibleResourceLeadFields = resourceLeadColumns.filter(col => col.defaultVisible).map(col => col.key);
let resourceLeadSortField = 'createdAt';
let resourceLeadSortDirection = 'desc';
let resourceLeadCurrentPage = 1;
let resourceLeadPageSize = 5;
let resourceUnfilledCurrentPage = 1;
let resourceUnfilledPageSize = 5;
let leadDetailSource = '培育线索';
let selectedDealerCodes = [];
let selectedResourceDealerCodes = [];
let selectedReviewUserAccounts = [];
let selectedMessageUserAccounts = [];
