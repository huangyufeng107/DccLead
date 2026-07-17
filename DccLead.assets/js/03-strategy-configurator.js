// ===== Strategy Configurator Pages =====
const strategyConfiguratorPageMap = {
  'manual-unconnected-config': 'manualUnconnected',
  'manual-unconverted-config': 'manualUnconverted',
  'follow-count-config': 'followCount',
  'precall-task-config': 'precallTask',
  'excellent-project-config': 'excellentProject',
  'excellent-channel-config': 'excellentChannel',
  'excellent-sc-config': 'excellentSc',
  'return-visit-order-config': 'returnVisitOrder',
  'amap-map-config': 'amapMap'
};

function isReturnVisitOrderConfigurator(key) {
  return key === 'returnVisitOrder' || key === 'amapMap';
}

const configuratorOptions = {
  leadStatus: ['休眠失联', '战败', '无效结案'],
  returnVisitInitialLeadStatus: ['总部_高意向', '总部_休眠未购', '总部_休眠失联', '总部_战败', '总部_暂败', '总部_阶段性战败', '总部_无效', '总部_异地'],
  returnVisitMatchingDimension: ['按线索状态', '按渠道与媒体'],
  leadDispatchLeadStatus: leadDispatchFormLeadStatusOptions.filter(Boolean),
  manualUnconvertedReviewResult: ['下次回访', '试驾线索下发', '意向线索下发', '试驾排程下发', '无人接下发', '战败', '休眠未购', '休眠失联', '无效结案'],
  contactStatus: ['正常接通', '无人接听', '客户拒绝', '忙音/秘书台', '停机', '空号', '企微跟进'],
  reviewStatus: ['休眠失联-被拉黑', '休眠未购-资金不足', '阶段性战败', '下次回访'],
  carSeries: ['N6', '轩逸', '天籁', '逍客', '奇骏', 'ARIYA', '探陆', '其他车系'],
  outboundType: unifiedPolicyCallTypeOptions,
  belongType: ['请选择', '渠道编码', 'SmartCode'],
  attributeType: ['请选择', '渠道编码', 'SmartCode', '大项目名', '线索状态'],
  precallLine: ['请选择', '虚拟号-大众', '虚拟号-厚扑'],
  skillGroup: ['技能组A', '技能组B', '技能组C'],
  orderType: ['投诉工单', '回访异常工单', '试驾申诉工单', '战败激活工单'],
  assignRole: ['客服主管', '销售经理', 'DCC专员', '门店总经理'],
  mediaName: ['懂车帝', '汽车之家', '抖音', '自建官网', '百度', '腾讯'],
  channelCode: ['R1', 'R2', 'R3', 'R4', 'R5', '未知渠道'],
  projectName: ['新能源专项', '置换活动', 'DCC培育项目', '高意向培育', '保客激活', '金融置换专项'],
  intentLevelAction: ['不更新', 'E', '自动降为N', 'H', 'A', 'B', 'C', 'L', 'F'],
  agentRouting: ['原始归属人', '系统默认分配'],
  yesNo: ['是', '否'],
  status: ['启用', '停用'],
  precallSystemStatus: ['处理中', '已处理'],
  returnVisitOrderContactStatus: ['空号', '停机', '忙音/秘书台', '无人接听', '关机', '超时未接', '线索拒呼', '线索未呼'],
  nextReturnVisitTime: [
    '下次预外呼时间',
    'N+1天 18时',
    'N+2天 18时',
    'N+3天 18时',
    'N+4天 18时',
    'N+5天 18时',
    'N+7天 18时'
  ]
};

const amapProjectNameCascade = {
  '总部_高意向': ['新能源专项', '高意向培育', 'DCC培育项目'],
  '总部_休眠未购': ['DCC培育项目', '保客激活'],
  '总部_休眠失联': ['保客激活'],
  '总部_战败': ['置换活动', '金融置换专项'],
  '总部_暂败': ['置换活动', '金融置换专项'],
  '总部_阶段性战败': ['置换活动', '金融置换专项'],
  '总部_无效': ['DCC培育项目'],
  '总部_异地': ['新能源专项', '置换活动']
};

let strategyConfiguratorEditing = { key: '', id: null };
let strategyConfiguratorQuickEdit = { key: '', id: null, field: '' };
let strategyConfiguratorPageState = {
  followCount: 1,
  manualUnconnected: 1,
  manualUnconverted: 1,
  precallTask: 1,
  excellentProject: 1,
  excellentChannel: 1,
  excellentSc: 1,
  returnVisitOrder: 1,
  amapMap: 1
};
let strategyConfiguratorPageSizeState = {
  followCount: 10,
  manualUnconnected: 10,
  manualUnconverted: 10,
  precallTask: 10,
  excellentProject: 10,
  excellentChannel: 10,
  excellentSc: 10,
  returnVisitOrder: 10,
  amapMap: 10
};

let strategyConfiguratorData = {
  followCount: [
    { sortOrder: 1, id: 1012, leadStatus: '休眠失联', followUpCount: 1, updatedAt: '2020-06-01 13:59:59 操作人：张三' },
    { sortOrder: 2, id: 1013, leadStatus: '战败', followUpCount: 2, updatedAt: '2020-06-02 13:59:59 操作人：李四' },
    { sortOrder: 3, id: 1014, leadStatus: '无效结案', followUpCount: 3, updatedAt: '2020-06-02 13:59:59 操作人：李四' }
  ],
  manualUnconnected: [
    { sortOrder: 1, id: 1012, ruleName: '分配配置A', status: '启用', contactStatus: '无人接听', carSeries: ['N7'], contactRepeatCount: 0, maxOutboundCount: '10天2次', pushInterval: 'N+1', outboundType: '科大讯飞-冷线索', belongType: 'SmartCode', belongValues: ['SC-N6-0891', 'SC-GZ-2026'], includeIncomplete: '是' },
    { sortOrder: 2, id: 1013, ruleName: '分配配置B', status: '启用', contactStatus: '无人接听', carSeries: ['N6'], contactRepeatCount: 0, maxOutboundCount: '10天2次', pushInterval: 'N+1', outboundType: '科大讯飞-留资未满', belongType: 'SmartCode', belongValues: ['SC-SY-0234'], includeIncomplete: '是' },
    { sortOrder: 3, id: 1014, ruleName: '分配配置C', status: '停用', contactStatus: '无人接听', carSeries: ['华为天籁'], contactRepeatCount: 0, maxOutboundCount: '10天2次', pushInterval: 'N+1', outboundType: '一知-冷线索', belongType: 'SmartCode', belongValues: ['SC-XK-7712'], includeIncomplete: '是' }
  ],
  manualUnconverted: [
    { sortOrder: 1, id: 1012, ruleName: '冷线索配置A', status: '启用', leadStatus: '休眠失联', abnormalReason: '被拉黑', pushDelayDays: 3, updateDelayDays: 30, outboundType: '科大讯飞-冷线索', carSeries: 'N7', includeIncomplete: '是' },
    { sortOrder: 2, id: 1013, ruleName: '冷线索配置B', status: '启用', leadStatus: '休眠未购', abnormalReason: '资金不足', pushDelayDays: 3, updateDelayDays: 0, outboundType: '科大讯飞-冷线索', carSeries: 'N6', includeIncomplete: '是' },
    { sortOrder: 3, id: 1014, ruleName: '冷线索配置C', status: '启用', leadStatus: '战败', abnormalReason: '价格因素', pushDelayDays: 1, updateDelayDays: 0, outboundType: '一知-冷线索', carSeries: 'N6', includeIncomplete: '是' },
    { sortOrder: 4, id: 1015, ruleName: '冷线索配置D', status: '停用', leadStatus: '下次回访', abnormalReason: '', pushDelayDays: 1, updateDelayDays: 0, outboundType: '科大讯飞-冷线索', carSeries: '华为天籁', includeIncomplete: '是' }
  ],
  precallTask: [
    { sortOrder: 1, id: 1012, ruleName: 'R1渠道预外呼', priority: 1, attributeType: '渠道编码', attributeValues: ['R1'], leadStatuses: ['总部_高意向'], carSeries: ['N7'], precallLine: '虚拟号-大众', workTime: { days: ['周一', '周二', '周三', '周四', '周五'], slots: [{ start: '09:00', end: '18:00' }] }, workTimePriority: 1, workTimeSkillGroup: '技能组A', offWorkPriority: 2, offWorkSkillGroup: '技能组B', systemStatus: '启用', createdAt: '2026-07-08 10:00:00 操作人：管理员', updatedAt: '2026-07-08 10:00:00 操作人：管理员' },
    { sortOrder: 2, id: 1013, ruleName: 'SC定向预外呼', priority: 2, attributeType: 'SmartCode', attributeValues: ['SC-GZ-2026'], leadStatuses: [], carSeries: ['N6'], precallLine: '虚拟号-厚扑', workTime: { days: ['周一', '周二', '周三', '周四', '周五', '周六'], slots: [{ start: '10:00', end: '20:00' }] }, workTimePriority: 2, workTimeSkillGroup: '技能组A', offWorkPriority: 3, offWorkSkillGroup: '技能组C', systemStatus: '启用', createdAt: '2026-07-08 10:00:00 操作人：管理员', updatedAt: '2026-07-08 10:00:00 操作人：管理员' }
  ],
  excellentProject: [
    { sortOrder: 1, id: 1012, ruleName: '大项目名分配策略A', scProjectName: '项目A', carSeries: ['N7'], status: '启用', createdAt: '2020-06-01 13:59:59 操作人：张三', updatedAt: '2020-06-01 13:59:59 操作人：李四' },
    { sortOrder: 2, id: 1013, ruleName: '大项目名分配策略B', scProjectName: '项目B', carSeries: ['N6'], status: '启用', createdAt: '2020-06-02 13:59:59 操作人：李四', updatedAt: '2020-06-02 13:59:59 操作人：李四' }
  ],
  excellentChannel: [
    { sortOrder: 1, id: 1012, ruleName: '渠道编码分配策略A', scChannel: '渠道A', carSeries: ['N7'], status: '启用', createdAt: '2020-06-01 13:59:59 操作人：张三', updatedAt: '2020-06-01 13:59:59 操作人：李四' },
    { sortOrder: 2, id: 1013, ruleName: '渠道编码分配策略B', scChannel: '渠道B', carSeries: ['N6'], status: '启用', createdAt: '2020-06-02 13:59:59 操作人：李四', updatedAt: '2020-06-02 13:59:59 操作人：李防' }
  ],
  excellentSc: [
    { sortOrder: 1, id: 1012, ruleName: 'SmartCode分配策略A', smartCode: 'SC-N6-0891', carSeries: ['N7'], status: '启用', createdAt: '2020-06-01 13:59:59 操作人：张三', updatedAt: '2020-06-01 13:59:59 操作人：李四' },
    { sortOrder: 2, id: 1013, ruleName: 'SmartCode分配策略B', smartCode: 'SC-GZ-2026', carSeries: ['N6'], status: '启用', createdAt: '2020-06-02 13:59:59 操作人：李四', updatedAt: '2020-06-02 13:59:59 操作人：李四' }
  ],
  returnVisitOrder: [
    { sortOrder: 1, id: 1001, ruleName: '无人接听异常生成回访工单', priority: 1, status: '启用', precallSystemStatus: '已处理', triggerCondition: '无人接听', matchingDimension: '按渠道与媒体', mediaName: ['懂车帝', '汽车之家'], initialLeadStatus: [], channelCode: ['R1'], contactStatus: '未接通', nurtureResult: '下次回访', abnormalReason: '', intentLevelAction: 'E', nextReturnVisitTime: 'N+1天 18时', agentRouting: '原始归属人', descriptionTemplate: '[系统自动话单转换] 懂车帝/之家渠道连续3次无人接听，系统已自动建立回访工单归属原始归属人，并自动降级为N。', createdAt: '2026-07-01 10:00:00 操作人：系统管理员', updatedAt: '2026-07-01 10:00:00 操作人：系统管理员' },
    { sortOrder: 2, id: 1002, ruleName: '客户拒绝投诉工单直接指派', priority: 2, status: '启用', precallSystemStatus: '已处理', triggerCondition: '空号', matchingDimension: '按线索状态', mediaName: [], initialLeadStatus: ['总部_战败'], channelCode: [], contactStatus: '已接通', nurtureResult: '战败', abnormalReason: '价格因素', intentLevelAction: 'F', nextReturnVisitTime: 'N+1天 18时', agentRouting: '原始归属人', descriptionTemplate: '[系统自动话单转换] 客户呼叫反馈为空号，直接触发投诉工单指派给原始归属人。', createdAt: '2026-07-02 11:30:00 操作人：李四', updatedAt: '2026-07-02 11:30:00 操作人：李四' },
    { sortOrder: 3, id: 1003, ruleName: '忙音多次重试提醒', priority: 3, status: '停用', precallSystemStatus: '处理中', triggerCondition: '忙音/秘书台', matchingDimension: '按渠道与媒体', mediaName: ['抖音'], initialLeadStatus: [], channelCode: [], contactStatus: '未接通', nurtureResult: '无人接下发', abnormalReason: '', intentLevelAction: 'C', nextReturnVisitTime: '下次预外呼时间', agentRouting: '原始归属人', descriptionTemplate: '[系统自动话单转换] 抖音渠道连续5次忙音，触发系统默认分配回访工单。', createdAt: '2026-07-03 09:15:00 操作人：张三', updatedAt: '2026-07-03 09:15:00 操作人：张三' }
  ]
};

const strategyConfiguratorDefs = {
  followCount: {
    pageId: 'followCountConfigPage',
    title: '跟进次数配置',
    desc: '管理不同线索状态下的人工跟进次数上限，支持跟进次数快速编辑和完整规则维护。',
    addLabel: '新增配置',
    search: [],
    actions: [],
    columns: [
      { label: '#', field: 'sortOrder', width: 70 },
      { label: '回访结果', field: 'leadStatus', width: 260 },
      { label: '跟进次数', field: 'followUpCount', width: 120 }
    ],
    form: [
      { label: '回访结果', field: 'leadStatus', type: 'readonly' },
      { label: '跟进次数', field: 'followUpCount', type: 'number', required: true }
    ]
  },
  manualUnconnected: {
    pageId: 'manualUnconnectedConfigPage',
    title: '未接通激活配置',
    desc: '配置人工外呼无人接听后转交 AI 外呼的规则，覆盖接触状态、车系、重复次数、推送间隔和外呼类型。',
    addLabel: '新增配置',
    search: [
      { label: '关键字', field: 'keyword', type: 'text' },
      { label: '接触状态', field: 'contactStatus', type: 'select', options: 'contactStatus' },
      { label: '回访车系', field: 'carSeries', type: 'select', options: 'carSeries', includeAll: true },
      { label: '外呼类型', field: 'outboundType', type: 'select', options: 'outboundType' },
      { label: '命中类型', field: 'belongType', type: 'select', options: 'belongType', excludeValues: ['请选择'] }
    ],
    actions: ['add'],
    columns: [
      { label: '#', field: 'sortOrder', width: 70 },
      { label: '配置名称', field: 'ruleName', width: 150 },
      { label: '外呼类型', field: 'outboundType', width: 130 },
      { label: '接触状态', field: 'contactStatus', width: 120 },
      { label: '回访车系', field: 'carSeries', width: 180 },
      { label: '接触状态重复次数', field: 'contactRepeatCount', width: 150 },
      { label: 'AI外呼次数≤x次', field: 'maxOutboundCount', width: 150 },
      { label: '命中类型', field: 'belongType', width: 120 },
      { label: '包含留资未满', field: 'includeIncomplete', width: 150 },
      { label: '状态', field: 'status', width: 100, status: true }
    ],
    formSections: ['命中条件', '执行动作'],
    form: [
      { label: '配置名称', field: 'ruleName', type: 'text', required: true, section: '基础信息', placeholder: '请输入配置名称' },
      { label: '状态', field: 'status', type: 'select', options: 'status', required: true, section: '基础信息', defaultValue: '启用' },
      { label: '接触状态', field: 'contactStatus', type: 'select', options: 'contactStatus', required: true, section: '命中条件', placeholderOption: '请选择' },
      { label: '回访车系', field: 'carSeries', type: 'multiselect', options: 'carSeries', section: '命中条件', placeholderOption: '请选择' },
      { label: '接触状态重复次数', field: 'contactRepeatCount', type: 'number', required: true, allowZero: true, section: '命中条件', hintHtml: '填写非负整数，<strong>0次代表不限制</strong>。', placeholder: '请输入次数' },
      { label: '包含留资未满', field: 'includeIncomplete', type: 'select', options: 'yesNo', required: true, section: '命中条件', defaultValue: '否' },
      { label: 'AI外呼次数≤x次', field: 'maxOutboundCount', type: 'dayCount', required: true, section: '命中条件' },
      { label: '命中类型', field: 'belongType', type: 'select', options: 'belongType', required: true, section: '命中条件', defaultValue: '请选择' },
      { label: '间隔N小时推送给AI外呼跟进', field: 'pushInterval', type: 'number', required: true, allowZero: true, section: '执行动作', placeholder: '请输入小时' },
      { label: '外呼类型', field: 'outboundType', type: 'callTypePicker', options: 'outboundType', required: true, section: '执行动作' }
    ]
  },
  manualUnconverted: {
    pageId: 'manualUnconvertedConfigPage',
    title: '总部冷线索配置',
    desc: '配置人工跟进后未转化线索转交 AI 外呼的规则，支持回访结果、异常原因、推送间隔和未转化等待天数维护。',
    addLabel: '新增配置',
    search: [
      { label: '关键字', field: 'keyword', type: 'text' },
      { label: '回访结果', field: 'leadStatus', type: 'select', options: 'manualUnconvertedReviewResult' },
      { label: '回访车系', field: 'carSeries', type: 'select', options: 'carSeries' },
      { label: '外呼类型', field: 'outboundType', type: 'select', options: 'outboundType' },
      { label: '包含留资未满', field: 'includeIncomplete', type: 'select', options: 'yesNo' }
    ],
    actions: ['add'],
    columns: [
      { label: '#', field: 'sortOrder', width: 70 },
      { label: '配置名称', field: 'ruleName', width: 150 },
      { label: '外呼类型', field: 'outboundType', width: 130 },
      { label: '回访结果', field: 'leadStatus', width: 180 },
      { label: '异常原因', field: 'abnormalReason', width: 160 },
      { label: '回访车系', field: 'carSeries', width: 130 },
      { label: '包含留资未满', field: 'includeIncomplete', width: 150 },
      { label: '状态', field: 'status', width: 100, status: true }
    ],
    formSections: ['命中条件', '执行动作'],
    form: [
      { label: '配置名称', field: 'ruleName', type: 'text', required: true, section: '基础信息', placeholder: '请输入配置名称' },
      { label: '状态', field: 'status', type: 'select', options: 'status', required: true, section: '基础信息', defaultValue: '启用' },
      { label: '回访结果', field: 'leadStatus', type: 'select', options: 'manualUnconvertedReviewResult', required: true, section: '命中条件', defaultValue: '请选择回访结果' },
      { label: '异常原因', field: 'abnormalReason', type: 'leadStatusReason', required: true, section: '命中条件' },
      { label: '回访车系', field: 'carSeries', type: 'select', options: 'carSeries', section: '命中条件' },
      { label: '回访更新时间≥任务接收时间N天', field: 'updateDelayDays', type: 'number', required: true, allowZero: true, section: '命中条件' },
      { label: '包含留资未满', field: 'includeIncomplete', type: 'select', options: 'yesNo', required: true, section: '命中条件', defaultValue: '否' },
      { label: '间隔N小时推送给AI外呼跟进', field: 'pushDelayDays', type: 'number', required: true, allowZero: true, section: '执行动作' },
      { label: '外呼类型', field: 'outboundType', type: 'select', options: 'outboundType', required: true, section: '执行动作', defaultValue: '请选择外呼类型' }
    ]
  },
  precallTask: {
    pageId: 'precallTaskConfigPage',
    title: '推送预外呼配置',
    desc: '配置预外呼任务的命中条件、预外呼线路、生效时段及工作时段内外的技能组路由规则。',
    addLabel: '新增配置',
    search: [
      { label: '关键字', field: 'keyword', type: 'text' },
      { label: '配置名称', field: 'ruleName', type: 'text' },
      { label: '意向车系', field: 'carSeries', type: 'select', options: 'carSeries', includeAll: true },
      { label: '命中条件', field: 'matchSummary', type: 'text' },
      { label: '预外呼路由', field: 'precallLine', type: 'select', options: 'precallLine' }
    ],
    actions: ['import', 'export', 'add'],
    columns: [
      { label: '权重', field: 'priority', width: 80 },
      { label: '配置名称', field: 'ruleName', width: 180 },
      { label: '意向车系', field: 'carSeries', width: 120 },
      { label: '命中条件', field: 'matchSummary', width: 240 },
      { label: '预外呼路由', field: 'routeSummary', width: 280 },
      { label: '状态', field: 'systemStatus', width: 90, status: true }
    ],
    form: []
  },
  excellentProject: {
    pageId: 'excellentProjectConfigPage',
    title: '大项目名线索分配规则',
    desc: '维护大项目名白名单，并与意向车系关联，支持 Excel 导入导出。',
    addLabel: '新增配置',
    entityLabel: '大项目名',
    entityField: 'scProjectName',
    search: [
      { label: '关键字', field: 'keyword', type: 'text' },
      { label: '状态', field: 'status', type: 'select', options: 'status' }
    ],
    actions: ['import', 'export', 'add'],
    columns: [
      { label: '#', field: 'sortOrder', width: 70 },
      { label: '策略名称', field: 'ruleName', width: 180 },
      { label: '大项目名', field: 'scProjectName', width: 220 },
      { label: '意向车系', field: 'carSeries', width: 180 },
      { label: '状态', field: 'status', width: 90, status: true }
    ],
    form: [
      { label: '策略名称', field: 'ruleName', type: 'text', required: true },
      { label: '大项目名', field: 'scProjectName', type: 'text', required: true },
      { label: '意向车系', field: 'carSeries', type: 'multiselect', options: 'carSeries' }
    ]
  },
  excellentChannel: {
    pageId: 'excellentChannelConfigPage',
    title: '渠道编码线索分配规则',
    desc: '维护渠道编码白名单，并与意向车系关联，用于线索转手规则匹配。',
    addLabel: '新增配置',
    entityLabel: '渠道编码',
    entityField: 'scChannel',
    search: [
      { label: '关键字', field: 'keyword', type: 'text' },
      { label: '状态', field: 'status', type: 'select', options: 'status' }
    ],
    actions: ['import', 'export', 'add'],
    columns: [
      { label: '#', field: 'sortOrder', width: 70 },
      { label: '策略名称', field: 'ruleName', width: 180 },
      { label: '渠道编码', field: 'scChannel', width: 180 },
      { label: '意向车系', field: 'carSeries', width: 180 },
      { label: '状态', field: 'status', width: 90, status: true }
    ],
    form: [
      { label: '策略名称', field: 'ruleName', type: 'text', required: true },
      { label: '渠道编码', field: 'scChannel', type: 'text', required: true },
      { label: '意向车系', field: 'carSeries', type: 'multiselect', options: 'carSeries' }
    ]
  },
  excellentSc: {
    pageId: 'excellentScConfigPage',
    title: 'SmartCode线索分配规则',
    desc: '维护优秀 SmartCode 白名单，并与意向车系关联，支持 Excel 导入导出。',
    addLabel: '新增配置',
    entityLabel: 'SmartCode',
    entityField: 'smartCode',
    search: [
      { label: '关键字', field: 'keyword', type: 'text' },
      { label: '状态', field: 'status', type: 'select', options: 'status' }
    ],
    actions: ['import', 'export', 'add'],
    columns: [
      { label: '#', field: 'sortOrder', width: 70 },
      { label: '策略名称', field: 'ruleName', width: 180 },
      { label: 'SmartCode', field: 'smartCode', width: 220 },
      { label: '意向车系', field: 'carSeries', width: 180 },
      { label: '状态', field: 'status', width: 90, status: true }
    ],
    form: [
      { label: '策略名称', field: 'ruleName', type: 'text', required: true },
      { label: 'SmartCode', field: 'smartCode', type: 'text', required: true },
      { label: '意向车系', field: 'carSeries', type: 'multiselect', options: 'carSeries' }
    ]
  },
  returnVisitOrder: {
    pageId: 'returnVisitOrderConfigPage',
    title: '回访工单配置',
    desc: '配置人工外呼后触发回访工单的规则，支持组合渠道编码、初始线索状态、媒体名称等复合条件和优先级配置。',
    addLabel: '新增配置',
    search: [
      { label: '关键字', field: 'keyword', type: 'text' },
      { label: '工单类型', field: 'nurtureResult', type: 'select', options: 'manualUnconvertedReviewResult' },
      { label: '指派规则', field: 'agentRouting', type: 'select', options: 'agentRouting' },
      { label: '状态', field: 'status', type: 'select', options: 'status' }
    ],
    actions: ['add'],
    columns: [
      { label: '权重', field: 'priority', width: 80 },
      { label: '配置名称', field: 'ruleName', width: 180 },
      { label: '匹配条件', field: 'matchSummary', width: 260 },
      { label: '执行动作', field: 'actionSummary', width: 320 },
      { label: '状态', field: 'status', width: 90, status: true }
    ],
    formSections: ['匹配条件', '执行动作'],
    form: [
      { label: '配置名称', field: 'ruleName', type: 'text', required: true, section: '基础信息', placeholder: '请输入配置名称', wide: true },
      { label: '权重', field: 'priority', type: 'number', required: true, section: '基础信息', placeholder: '例：255', hintHtml: '数字越小优先级越高，命中多条规则时优先按权重判断。' },
      { label: '状态', field: 'status', type: 'select', options: 'status', required: true, section: '基础信息', defaultValue: '启用' },
      { label: '预外呼系统状态', field: 'precallSystemStatus', type: 'select', options: 'precallSystemStatus', required: true, section: '匹配条件', placeholderOption: '请选择', defaultValue: '' },
      { label: '触发条件(通话状态)', field: 'triggerCondition', type: 'select', options: 'returnVisitOrderContactStatus', required: true, section: '匹配条件', placeholderOption: '请选择' },
      { label: '匹配维度', field: 'matchingDimension', type: 'select', options: 'returnVisitMatchingDimension', section: '匹配条件', placeholderOption: '不限', defaultValue: '' },
      { label: '初始线索状态', field: 'initialLeadStatus', type: 'multiselect', options: 'returnVisitInitialLeadStatus', section: '匹配条件', placeholderOption: '请选择' },
      { label: '渠道编码', field: 'channelCode', type: 'multiselect', options: 'channelCode', section: '匹配条件', placeholderOption: '请选择' },
      { label: '媒体名称', field: 'mediaName', type: 'multiselect', options: 'mediaName', section: '匹配条件', placeholderOption: '请选择媒体名称', wide: true, isSearch: true },
      { label: '映射接触状态', field: 'contactStatus', type: 'select', options: 'contactStatus', required: true, section: '执行动作', placeholderOption: '请选择' },
      { label: '映射回访结果', field: 'nurtureResult', type: 'select', options: 'manualUnconvertedReviewResult', required: true, section: '执行动作', placeholderOption: '请选择' },
      { label: '映射异常原因', field: 'abnormalReason', type: 'leadStatusReason', required: true, section: '执行动作' },
      { label: '映射意向级别', field: 'intentLevelAction', type: 'select', options: 'intentLevelAction', required: true, section: '执行动作', placeholderOption: '请选择意向级别动作' },
      { label: '下次回访时间', field: 'nextReturnVisitTime', type: 'select', options: 'nextReturnVisitTime', required: true, section: '执行动作', placeholderOption: '请选择', defaultValue: 'N+1天 18时' },
      { label: '指派坐席规则', field: 'agentRouting', type: 'select', options: 'agentRouting', required: true, section: '执行动作', placeholderOption: '请选择' },
      { label: '回访描述模板', field: 'descriptionTemplate', type: 'textarea', required: true, section: '执行动作', placeholder: '请输入描述模板，例如：[系统自动话单转换] 通话状态为 {callStatus}，已重呼...' }
    ]
  }
};

// 高德地图配置完整复用回访工单配置的字段、校验和交互规则，同时保留独立数据集。
strategyConfiguratorData.amapMap = strategyConfiguratorData.returnVisitOrder.map((row, index) => ({
  ...row,
  id: row.id + 100,
  ruleName: `高德地图-${row.ruleName}`,
  projectName: [['新能源专项'], ['DCC培育项目'], ['高意向培育']][index] || [],
  initialLeadStatus: [['总部_高意向'], ['总部_战败'], ['总部_休眠未购']][index] || []
}));
strategyConfiguratorDefs.amapMap = {
  ...strategyConfiguratorDefs.returnVisitOrder,
  pageId: 'amapMapConfigPage',
  title: '高德地图配置',
  desc: '配置触发高德地图服务的规则，仅支持按大项目名和初始线索状态进行匹配。',
  search: [
    { label: '关键字', field: 'keyword', type: 'text' },
    { label: '大项目名', field: 'projectName', type: 'multiselect', options: 'projectName' },
    { label: '初始线索状态', field: 'initialLeadStatus', type: 'multiselect', options: 'returnVisitInitialLeadStatus' },
    { label: '状态', field: 'status', type: 'select', options: 'status' }
  ],
  columns: strategyConfiguratorDefs.returnVisitOrder.columns.map(column => ({ ...column })),
  form: [
    { label: '配置名称', field: 'ruleName', type: 'text', required: true, section: '基础信息', placeholder: '请输入配置名称', wide: true },
    { label: '权重', field: 'priority', type: 'number', required: true, section: '基础信息', placeholder: '例：255', hintHtml: '数字越小优先级越高，命中多条规则时优先按权重判断。' },
    { label: '状态', field: 'status', type: 'select', options: 'status', required: true, section: '基础信息', defaultValue: '启用' },
    { label: '初始线索状态', field: 'initialLeadStatus', type: 'multiselect', options: 'returnVisitInitialLeadStatus', required: true, section: '匹配条件', placeholderOption: '请选择初始线索状态', wide: true },
    { label: '大项目名', field: 'projectName', type: 'multiselect', options: 'projectName', required: true, section: '匹配条件', placeholderOption: '请选择大项目名', wide: true, isSearch: true },
    ...strategyConfiguratorDefs.returnVisitOrder.form
      .filter(field => field.section === '执行动作')
      .map(field => ({ ...field, required: field.field === 'descriptionTemplate' ? false : field.required }))
  ]
};

function getStrategyConfiguratorDef(key) {
  return strategyConfiguratorDefs[key];
}

function renderStrategyConfiguratorPage(key) {
  const def = getStrategyConfiguratorDef(key);
  const page = document.getElementById(def.pageId);
  if (!page) return;
  const tableClass = `${key === 'followCount' || key === 'precallTask' ? 'data-table' : 'lead-table'} strategy-configurator-table strategy-configurator-table-${key}`;
  const isPrecallTask = key === 'precallTask';
  const isExcellent = ['excellentProject', 'excellentChannel', 'excellentSc'].includes(key);
  const heroTitle = isExcellent ? '优秀配置管理' : def.title;
  const heroDesc = isExcellent 
    ? '用于统一管理线索接收后的优秀线索分配规则，按SmartCode、大项目名、渠道编码和意向车系等条件判断线索分配给客服坐席。' 
    : def.desc;
  hideLeadPages();
  page.classList.add('show');
  if (isExcellent) {
    const heroEl = document.getElementById('excellentConfigManageHero');
    if (heroEl) {
      heroEl.innerHTML = `
        <div>
          <div class="page-title">${heroTitle}</div>
          <div class="page-desc">${heroDesc}</div>
        </div>
        ${renderStrategyConfiguratorSummary(key)}
      `;
    }
  }
  page.innerHTML = `
    ${isExcellent ? '' : `
      <div class="page-hero">
        <div>
          <div class="page-title">${heroTitle}</div>
          <div class="page-desc">${heroDesc}</div>
        </div>
        ${renderStrategyConfiguratorSummary(key)}
      </div>
    `}
    ${renderStrategyConfiguratorSearch(key)}
    <div class="card">
      <div class="section-header">
        <div class="section-title">${def.title}列表</div>
        <div class="lead-toolbar-right">${renderStrategyConfiguratorActions(key)}</div>
      </div>
      <div class="lead-table-wrap">
        <table class="${tableClass}">
          <thead><tr>${def.columns.map(col => `<th style="${isPrecallTask ? `width:${col.width || 120}px` : `min-width:${col.width || 120}px`}">${col.label}</th>`).join('')}<th style="${isPrecallTask ? 'width:190px' : 'min-width:190px'}">操作</th></tr></thead>
          <tbody id="${key}ConfiguratorBody"></tbody>
        </table>
      </div>
      <div class="pagination">
        <span id="${key}ConfiguratorPageInfo">共 0 条记录，当前第 1 / 1 页</span>
        <div class="pagination-btns">
          <select class="hit-page-size" id="${key}ConfiguratorPageSize" onchange="changeStrategyConfiguratorPageSize('${key}', this.value)">
            <option value="5">每页 5 条</option>
            <option value="10">每页 10 条</option>
            <option value="20">每页 20 条</option>
            <option value="50">每页 50 条</option>
          </select>
          <button class="page-btn" type="button" onclick="changeStrategyConfiguratorPage('${key}', -1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <select class="hit-page-size" id="${key}ConfiguratorPageSelect" onchange="selectStrategyConfiguratorPage('${key}', this.value)"></select>
          <button class="page-btn" type="button" onclick="changeStrategyConfiguratorPage('${key}', 1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
    </div>
  `;
  renderStrategyConfiguratorTable(key);
  // Initialize generic multiselect search picker summaries
  def.search.forEach(field => {
    if (field.type === 'multiselect') {
      updateGenericTagPickerSummary(`cfg_${key}_${field.field}`);
    }
  });
}

function renderStrategyConfiguratorSummary(key) {
  const rows = strategyConfiguratorData[key] || [];
  let items = [];
  if (key === 'followCount') {
    const maxFollowUp = rows.length ? Math.max(...rows.map(row => Number(row.followUpCount) || 0)) : 0;
    items = [
      { label: '规则总数', value: rows.length },
      { label: '最大跟进次数', value: maxFollowUp }
    ];
  } else if (key === 'manualUnconnected') {
    const carSeriesCount = new Set(rows.map(row => row.carSeries).filter(Boolean)).size;
    const outboundTypeCount = new Set(rows.map(row => row.outboundType).filter(Boolean)).size;
    const includeIncompleteCount = rows.filter(row => row.includeIncomplete === '是').length;
    const belongTypeCount = new Set(rows.map(row => row.belongType).filter(Boolean)).size;
    items = [
      { label: '规则总数', value: rows.length },
      { label: '覆盖车系', value: carSeriesCount },
      { label: '外呼类型', value: outboundTypeCount },
      { label: '包含留资未满', value: includeIncompleteCount },
      { label: '隶属维度', value: belongTypeCount }
    ];
  } else if (key === 'manualUnconverted') {
    const reviewResultCount = new Set(rows.map(row => row.leadStatus).filter(Boolean)).size;
    const outboundTypeCount = new Set(rows.map(row => row.outboundType).filter(Boolean)).size;
    const includeIncompleteCount = rows.filter(row => row.includeIncomplete === '是').length;
    items = [
      { label: '规则总数', value: rows.length },
      { label: '回访结果', value: reviewResultCount },
      { label: '外呼类型', value: outboundTypeCount },
      { label: '包含留资未满', value: includeIncompleteCount }
    ];
  } else if (key === 'precallTask') {
    const enabled = rows.filter(row => row.systemStatus === '启用').length;
    const carSeriesCount = new Set(rows.flatMap(row => row.carSeries || [])).size;
    items = [
      { label: '配置总数', value: rows.length },
      { label: '已启用', value: enabled },
      { label: '覆盖车系', value: carSeriesCount }
    ];
  } else if (['excellentProject', 'excellentChannel', 'excellentSc'].includes(key)) {
    const scCount = (strategyConfiguratorData.excellentSc || []).length;
    const projectCount = (strategyConfiguratorData.excellentProject || []).length;
    const channelCount = (strategyConfiguratorData.excellentChannel || []).length;
    items = [
      { label: '配置总数', value: scCount + projectCount + channelCount },
      { label: 'SmartCode', value: scCount },
      { label: '大项目名', value: projectCount },
      { label: '渠道编码', value: channelCount }
    ];
  } else if (key === 'amapMap') {
    const enabled = rows.filter(row => row.status === '启用').length;
    const projectNameCount = new Set(rows.flatMap(row => row.projectName || [])).size;
    const initialLeadStatusCount = new Set(rows.flatMap(row => row.initialLeadStatus || [])).size;
    items = [
      { label: '配置总数', value: rows.length },
      { label: '已启用', value: enabled },
      { label: '大项目名数', value: projectNameCount },
      { label: '初始线索状态数', value: initialLeadStatusCount }
    ];
  } else if (isReturnVisitOrderConfigurator(key)) {
    const enabled = rows.filter(row => row.status === '启用').length;
    const triggerConditionCount = new Set(rows.map(row => row.triggerCondition).filter(Boolean)).size;
    const nurtureResultCount = new Set(rows.map(row => row.nurtureResult).filter(Boolean)).size;
    const agentRoutingCount = new Set(rows.map(row => row.agentRouting).filter(Boolean)).size;
    items = [
      { label: '配置总数', value: rows.length },
      { label: '已启用', value: enabled },
      { label: '通话状态数', value: triggerConditionCount },
      { label: '工单类型数', value: nurtureResultCount },
      { label: '指派规则数', value: agentRoutingCount }
    ];
  } else {
    const enabled = rows.filter(row => row.systemStatus === '启用').length;
    items = [
      { label: '配置总数', value: rows.length },
      { label: '已启用', value: enabled || rows.length },
      { label: '示例数据', value: rows.length },
      { label: '分页大小', value: 20 }
    ];
  }
  return `<div class="summary-strip">${items.map(item => `<div class="summary-card"><div class="summary-label">${item.label}</div><div class="summary-value">${item.value}</div></div>`).join('')}</div>`;
}

function renderStrategyConfiguratorSearch(key) {
  const def = getStrategyConfiguratorDef(key);
  if (!def.search.length) return '';
  if (['manualUnconnected', 'manualUnconverted', 'precallTask', 'excellentProject', 'excellentChannel', 'excellentSc', 'returnVisitOrder', 'amapMap'].includes(key)) return renderFlatStrategyConfiguratorFilterRow(key, def);
  
  const isExcellent = ['excellentProject', 'excellentChannel', 'excellentSc'].includes(key);
  const actionHtml = isExcellent
    ? `<button class="btn-secondary" type="button" onclick="resetStrategyConfiguratorSearch('${key}')">重置</button>`
    : key === 'manualUnconnected'
      ? '<button class="btn-secondary" type="button" onclick="resetStrategyConfiguratorSearch(\'manualUnconnected\')">重置</button>'
      : `<button class="btn-add" type="button" onclick="queryStrategyConfigurator('${key}')">查询</button>
         <button class="btn-secondary" type="button" onclick="resetStrategyConfiguratorSearch('${key}')">重置</button>
         <button class="btn-secondary" type="button" onclick="closeStrategyConfiguratorSearch('${key}')">关闭</button>`;
  return `
    <div class="filter-row" id="${key}ConfiguratorSearch">
      <div class="lead-search-panel">
        <div class="lead-search-grid compact">
          ${def.search.map(field => renderStrategyConfiguratorSearchField(key, field)).join('')}
          <div class="lead-search-actions">
            ${actionHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderFlatStrategyConfiguratorFilterRow(key, def) {
  return `
    <div class="filter-row">
      ${def.search.map(field => renderFlatStrategyConfiguratorFilterField(key, field)).join('')}
      <button class="btn-secondary" type="button" onclick="resetStrategyConfiguratorSearch('${key}')">重置</button>
    </div>
  `;
}

function renderFlatStrategyConfiguratorFilterField(key, field) {
  const id = `cfg_${key}_${field.field}`;
  if (field.type === 'text') {
    return `
      <span class="filter-label">${field.label}：</span>
      <input class="lead-input" style="width:130px; margin-right: 12px;" id="${id}" placeholder="请输入" oninput="queryStrategyConfigurator('${key}')" />
    `;
  }
  if (field.type === 'multiselect') {
    const options = configuratorOptions[field.options] || [];
    const idPrefix = `cfg_${key}_${field.field}`;
    return `
      <span class="filter-label">${field.label}：</span>
      ${renderGenericTagPicker({
        idPrefix: idPrefix,
        inputName: `${idPrefix}Values`,
        options: options,
        selected: [],
        placeholder: `请选择${field.label}`,
        onchange: `queryStrategyConfigurator('${key}')`,
        width: '160px',
        isSearch: true
      })}
    `;
  }
  let options = configuratorOptions[field.options] || [];
  if (field.excludeValues?.length) options = options.filter(item => !field.excludeValues.includes(item));
  return `
    <span class="filter-label">${field.label}：</span>
    <select class="filter-select" id="${id}" onchange="queryStrategyConfigurator('${key}')">
      <option value="">全部</option>
      ${options.map(item => `<option value="${escapeAttr(item)}">${escapeHtml(item)}</option>`).join('')}
    </select>
  `;
}

function renderStrategyConfiguratorSearchField(key, field) {
  const id = `cfg_${key}_${field.field}`;
  const isLive = ['manualUnconnected', 'excellentProject', 'excellentChannel', 'excellentSc'].includes(key);
  if (field.type === 'select' || field.type === 'selectFromData') {
    let options = field.type === 'selectFromData'
      ? [...new Set((strategyConfiguratorData[key] || []).map(row => row[field.field]).filter(Boolean))]
      : (configuratorOptions[field.options] || []);
    if (field.excludeValues?.length) options = options.filter(item => !field.excludeValues.includes(item));
    const onchange = isLive ? ` onchange="queryStrategyConfigurator('${key}')"` : '';
    return `<div class="search-field"><label>${field.label}</label><select class="lead-select" id="${id}"${onchange}><option value="">全部</option>${options.map(item => `<option value="${escapeAttr(item)}">${escapeHtml(item)}</option>`).join('')}</select></div>`;
  }
  const oninput = isLive ? ` oninput="queryStrategyConfigurator('${key}')"` : '';
  return `<div class="search-field"><label>${field.label}</label><input class="lead-input" id="${id}" placeholder="${field.placeholder || `请输入${field.label}`}"${oninput} /></div>`;
}

function renderStrategyConfiguratorActions(key) {
  const def = getStrategyConfiguratorDef(key);
  return def.actions.map(action => {
    if (action === 'refresh') return `<button class="btn-secondary" type="button" onclick="refreshStrategyConfigurator('${key}')">刷新</button>`;
    if (action === 'add') return `<button class="btn-add strategy-add-btn" type="button" onclick="openStrategyConfiguratorModal('${key}', 'add')">${def.addLabel || '新增'}</button>`;
    if (action === 'reset') return `<button class="btn-secondary" type="button" onclick="resetStrategyConfiguratorSearch('${key}')">重置</button>`;
    if (action === 'export') return `<button class="btn-secondary" type="button" onclick="exportStrategyConfigurator('${key}')">导出数据</button>`;
    if (action === 'import') return `<button class="btn-secondary" type="button" onclick="openStrategyConfiguratorImport('${key}')">导入数据</button>`;
    if (action === 'importManage') return `<button class="btn-secondary" type="button" onclick="openStrategyConfiguratorImport('${key}')">导入管理</button>`;
    return '';
  }).join('');
}

function getFilteredStrategyConfiguratorRows(key) {
  const def = getStrategyConfiguratorDef(key);
  return (strategyConfiguratorData[key] || [])
    .filter(row => def.search.every(field => {
      const el = document.getElementById(`cfg_${key}_${field.field}`);
      if (!el) return true;
      let value;
      if (field.type === 'multiselect') {
        const idPrefix = `cfg_${key}_${field.field}`;
        const inputs = getGenericTagPickerInputs(idPrefix);
        const selected = inputs.filter(input => input.checked).map(input => input.value);
        if (!selected.length) return true;
        const rowValues = Array.isArray(row[field.field]) ? row[field.field] : (row[field.field] ? [row[field.field]] : []);
        return selected.some(sel => rowValues.includes(sel));
      }
      value = el.value || '';
      if (value === '请选择') value = '';
      if (!value) return true;
      if (field.field === 'keyword') {
        if (isReturnVisitOrderConfigurator(key)) {
          const fieldsToCheck = [
            row.ruleName,
            row.id,
            row.triggerCondition,
            row.channelCode,
            row.mediaName,
            row.initialLeadStatus,
            row.nurtureResult,
            row.intentLevelAction
          ];
          return fieldsToCheck.some(item => {
            const text = Array.isArray(item) ? item.join('、') : String(item ?? '');
            return text.toLowerCase().includes(value.toLowerCase());
          });
        }
        return Object.values(row).some(item => {
          const text = Array.isArray(item) ? item.join('、') : String(item ?? '');
          return text.includes(value);
        });
      }
      if (field.field === 'status') {
        return String(row.status ?? '') === value;
      }
      if (key === 'precallTask' && field.field === 'matchSummary') {
        const rowValue = getPrecallMatchSummary(row);
        return rowValue.includes(value);
      }
      if (key === 'precallTask' && field.field === 'ruleName') {
        const rowValue = row.ruleName || row.taskGroupName || '';
        return rowValue.includes(value);
      }
      const rowValue = Array.isArray(row[field.field]) ? row[field.field].join('、') : String(row[field.field] ?? '');
      return field.type === 'text' ? rowValue.includes(value) : rowValue.includes(value);
    }))
    .sort((a, b) => {
      if (key === 'precallTask' || isReturnVisitOrderConfigurator(key)) {
        return (Number(a.priority) || 99) - (Number(b.priority) || 99) || a.id - b.id;
      }
      return (Number(a.sortOrder) || 99) - (Number(b.sortOrder) || 99);
    });
}

function renderStrategyConfiguratorTable(key) {
  const def = getStrategyConfiguratorDef(key);
  const rows = getFilteredStrategyConfiguratorRows(key);
  const pageSize = strategyConfiguratorPageSizeState[key] || 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  strategyConfiguratorPageState[key] = Math.min(strategyConfiguratorPageState[key] || 1, totalPages);
  const currentPage = strategyConfiguratorPageState[key] || 1;
  const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const body = document.getElementById(`${key}ConfiguratorBody`);
  const info = document.getElementById(`${key}ConfiguratorPageInfo`);
  const pageSelect = document.getElementById(`${key}ConfiguratorPageSelect`);
  const pageSizeSelect = document.getElementById(`${key}ConfiguratorPageSize`);
  if (info) info.textContent = `共 ${rows.length} 条记录，当前第 ${currentPage} / ${totalPages} 页`;
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, index) => `<option value="${index + 1}">第 ${index + 1} 页</option>`).join('');
    pageSelect.value = String(currentPage);
  }
  if (pageSizeSelect) pageSizeSelect.value = String(pageSize);
  if (!body) return;
  body.innerHTML = pageRows.length ? pageRows.map(row => `
    <tr>
      ${def.columns.map(col => `<td${col.field === 'sortOrder' ? ' class="row-index"' : ''}>${renderStrategyConfiguratorCell(key, row, col)}</td>`).join('')}
      <td>${renderStrategyConfiguratorRowActions(key, row)}</td>
    </tr>
  `).join('') : `<tr><td colspan="${def.columns.length + 1}"><div class="empty-state">暂无数据</div></td></tr>`;
}

function renderStrategyConfiguratorCell(key, row, col) {
  if (key === 'excellentProject' && col.field === 'ruleName') {
    return `
      <div class="rule-text-stack">
        <div class="rule-text-main">${escapeHtml(row.ruleName || '—')}</div>
        <div class="rule-muted">规则ID: EPC-${String(row.id).padStart(3, '0')}</div>
      </div>
    `;
  }
  if (key === 'excellentChannel' && col.field === 'ruleName') {
    return `
      <div class="rule-text-stack">
        <div class="rule-text-main">${escapeHtml(row.ruleName || '—')}</div>
        <div class="rule-muted">规则ID: ECC-${String(row.id).padStart(3, '0')}</div>
      </div>
    `;
  }
  if (key === 'excellentSc' && col.field === 'ruleName') {
    return `
      <div class="rule-text-stack">
        <div class="rule-text-main">${escapeHtml(row.ruleName || '—')}</div>
        <div class="rule-muted">规则ID: ESC-${String(row.id).padStart(3, '0')}</div>
      </div>
    `;
  }
  if (key === 'followCount' && col.field === 'leadStatus') {
    return `
      <div class="rule-text-stack">
        <div class="rule-text-main">${escapeHtml(row.leadStatus || '—')}</div>
        <div class="rule-muted">规则ID: FUC-${String(row.id).padStart(3, '0')}</div>
      </div>
    `;
  }
  if (key === 'manualUnconnected' && col.field === 'ruleName') {
    return `
      <div class="rule-text-stack">
        <div class="rule-text-main">${escapeHtml(row.ruleName || '—')}</div>
        <div class="rule-muted">规则ID: MAC-${String(row.id).padStart(3, '0')}</div>
      </div>
    `;
  }
  if (key === 'manualUnconverted' && col.field === 'ruleName') {
    return `
      <div class="rule-text-stack">
        <div class="rule-text-main">${escapeHtml(row.ruleName || '—')}</div>
        <div class="rule-muted">规则ID: MUC-${String(row.id).padStart(3, '0')}</div>
      </div>
    `;
  }
  if (isReturnVisitOrderConfigurator(key) && col.field === 'priority') {
    return `<span class="policy-plain-text">P${row.priority || 99}</span>`;
  }
  if (isReturnVisitOrderConfigurator(key) && col.field === 'ruleName') {
    return `
      <div class="rule-text-stack">
        <div class="rule-text-main">${escapeHtml(row.ruleName || '—')}</div>
        <div class="rule-muted">规则ID: ${key === 'amapMap' ? 'AMC' : 'RVO'}-${String(row.id).padStart(3, '0')}</div>
      </div>
    `;
  }
  if (key === 'amapMap' && col.field === 'matchSummary') {
    const projectName = Array.isArray(row.projectName) ? row.projectName.join('、') : (row.projectName || '');
    const leadSt = Array.isArray(row.initialLeadStatus) ? row.initialLeadStatus.join('、') : (row.initialLeadStatus || '');
    const projectNameLogic = row.projectNameLogic === '且' ? '且 (AND)' : '或 (OR)';
    const items = [
      projectName ? `大项目名：${escapeHtml(projectName)}（${projectNameLogic}）` : '',
      leadSt ? `初始线索状态：${escapeHtml(leadSt)}` : ''
    ].filter(Boolean);
    return `<div class="rule-text-stack">${items.map(item => `<div>${item}</div>`).join('')}</div>`;
  }
  if (isReturnVisitOrderConfigurator(key) && col.field === 'matchSummary') {
    const media = Array.isArray(row.mediaName) ? row.mediaName.join('、') : (row.mediaName || '');
    const leadSt = Array.isArray(row.initialLeadStatus) ? row.initialLeadStatus.join('、') : (row.initialLeadStatus || '');
    const channelCode = Array.isArray(row.channelCode) ? row.channelCode.join('、') : (row.channelCode || '');
    const dimension = row.matchingDimension || '';
    const items = [
      row.precallSystemStatus ? `预外呼系统状态：${escapeHtml(row.precallSystemStatus)}` : '',
      `通话状态：${escapeHtml(row.triggerCondition || '不限')}`,
      `匹配维度：${escapeHtml(dimension || '不限')}`,
      dimension === '按线索状态' && leadSt ? `初始线索状态：${escapeHtml(leadSt)}` : '',
      dimension === '按渠道与媒体' && channelCode ? `渠道编码：${escapeHtml(channelCode)}` : '',
      dimension === '按渠道与媒体' && media ? `媒体名称：${escapeHtml(media)}` : ''
    ].filter(Boolean);
    return `<div class="rule-text-stack">${items.map(item => `<div>${item}</div>`).join('')}</div>`;
  }
  if (isReturnVisitOrderConfigurator(key) && col.field === 'actionSummary') {
    const items = [
      `接触状态 → ${escapeHtml(row.contactStatus || '不更新')}`,
      `回访结果 → ${escapeHtml(row.nurtureResult || '不更新')}`,
      row.abnormalReason ? `异常原因 → ${escapeHtml(row.abnormalReason)}` : '',
      `意向级别 → ${escapeHtml(row.intentLevelAction || '不更新')}`,
      row.nextReturnVisitTime ? `下次回访时间 → ${escapeHtml(row.nextReturnVisitTime)}` : '',
      `指派坐席 → ${escapeHtml(row.agentRouting || '原始归属人')}`
    ].filter(Boolean);
    return `<div class="rule-text-stack" style="line-height:1.4">${items.map(item => `<div>${item}</div>`).join('')}</div>`;
  }
  if (key === 'precallTask' && col.field === 'priority') {
    return `<span class="policy-plain-text">P${row.priority || 99}</span>`;
  }
  if (key === 'precallTask' && col.field === 'ruleName') {
    return `
      <div class="rule-text-stack">
        <div class="rule-text-main">${escapeHtml(row.ruleName || row.taskGroupName || '—')}</div>
        <div class="rule-muted">规则ID: POC-${String(row.id).padStart(3, '0')}</div>
      </div>
    `;
  }
  if (key === 'precallTask' && col.field === 'carSeries') {
    return renderRuleChipList(row.carSeries, 'blue', 2);
  }
  if (key === 'precallTask' && col.field === 'matchSummary') {
    return escapeHtml(getPrecallMatchSummary(row));
  }
  if (key === 'precallTask' && col.field === 'routeSummary') {
    return `
      <div class="rule-text-stack">
        <div class="rule-text-main">${escapeHtml(row.precallLine || '—')}</div>
        <div class="rule-muted">时段：${escapeHtml(getPrecallWorkTimeSummary(row.workTime))}</div>
        <div class="rule-muted">路由：工作：${escapeHtml(row.workTimeSkillGroup || '—')} / 非工作：${escapeHtml(row.offWorkSkillGroup || '—')}</div>
      </div>
    `;
  }
  if (key === 'manualUnconverted' && col.field === 'abnormalReason') {
    const mappedStatus = getManualUnconvertedMappedLeadStatus(row.leadStatus || '');
    const reason = getSelectedLeadDispatchAbnormalReason(mappedStatus, row.abnormalReason || '');
    return escapeHtml(reason || '不更新');
  }
  const raw = row[col.field];
  const value = Array.isArray(raw) ? raw.join('、') : (raw ?? '—');
  if (col.status) return row[col.field] === '启用' ? '<span class="col-status-on">● 启用</span>' : '<span class="col-status-off">● 停用</span>';
  if (key === 'followCount' && col.quickEdit) return `<button class="strategy-inline-edit" type="button" onclick="openStrategyConfiguratorQuickEdit('${key}', ${row.id}, '${col.field}')">${escapeHtml(value)}${col.suffix || ''}</button>`;
  if (col.quickEdit) return `<button class="action-btn view" type="button" onclick="openStrategyConfiguratorQuickEdit('${key}', ${row.id}, '${col.field}')">${escapeHtml(value)}${col.suffix || ''}</button>`;
  if (key === 'followCount') return `<span class="policy-plain-text">${escapeHtml(`${value}${col.suffix || ''}`)}</span>`;
  return escapeHtml(`${value}${col.suffix || ''}`);
}

function renderStrategyConfiguratorRowActions(key, row) {
  const actions = [
    `<button class="action-btn view" type="button" onclick="openStrategyConfiguratorModal('${key}', 'view', ${row.id})">查看</button>`,
    `<button class="action-btn edit" type="button" onclick="openStrategyConfiguratorModal('${key}', 'edit', ${row.id})">编辑</button>`
  ];
  actions.push(`<button class="action-btn delete" type="button" onclick="deleteStrategyConfiguratorRow('${key}', ${row.id})">删除</button>`);
  return `<div class="action-btns">${actions.join('')}</div>`;
}

function queryStrategyConfigurator(key) {
  strategyConfiguratorPageState[key] = 1;
  renderStrategyConfiguratorTable(key);
}

function resetStrategyConfiguratorSearch(key) {
  const def = getStrategyConfiguratorDef(key);
  def.search.forEach(field => {
    const input = document.getElementById(`cfg_${key}_${field.field}`);
    if (!input) return;
    if (field.type === 'multiselect') {
      const idPrefix = `cfg_${key}_${field.field}`;
      const inputs = getGenericTagPickerInputs(idPrefix);
      inputs.forEach(inEl => inEl.checked = false);
      updateGenericTagPickerSummary(idPrefix);
    } else {
      input.value = '';
    }
  });
  strategyConfiguratorPageState[key] = 1;
  renderStrategyConfiguratorTable(key);
}

function closeStrategyConfiguratorSearch(key) {
  const panel = document.getElementById(`${key}ConfiguratorSearch`);
  if (panel) panel.style.display = 'none';
}

function refreshStrategyConfigurator(key) {
  renderStrategyConfiguratorPage(key);
  showToast('列表已刷新', true);
}

function selectStrategyConfiguratorPage(key, page) {
  strategyConfiguratorPageState[key] = Number(page) || 1;
  renderStrategyConfiguratorTable(key);
}

function changeStrategyConfiguratorPageSize(key, value) {
  strategyConfiguratorPageSizeState[key] = Number(value) || 10;
  strategyConfiguratorPageState[key] = 1;
  renderStrategyConfiguratorTable(key);
}

function changeStrategyConfiguratorPage(key, direction) {
  const rows = getFilteredStrategyConfiguratorRows(key);
  const pageSize = strategyConfiguratorPageSizeState[key] || 10;
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  strategyConfiguratorPageState[key] = Math.max(1, Math.min(totalPages, (strategyConfiguratorPageState[key] || 1) + direction));
  renderStrategyConfiguratorTable(key);
}

function openStrategyConfiguratorModal(key, mode, id = null) {
  const def = getStrategyConfiguratorDef(key);
  const row = id ? (strategyConfiguratorData[key] || []).find(item => item.id === id) : null;
  strategyConfiguratorEditing = { key, id: mode === 'edit' || mode === 'view' ? id : null, mode };
  
  if (mode === 'view') {
    document.getElementById('leadDispatchRuleModalTitle').textContent = `查看${def.title}`;
    document.getElementById('leadDispatchRuleModalBody').innerHTML = renderStrategyConfiguratorDetail(key, row || {});
    document.getElementById('leadDispatchRuleModalFooter').innerHTML = `<button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">关闭</button>`;
  } else {
    document.getElementById('leadDispatchRuleModalTitle').textContent = mode === 'edit' ? `编辑${def.title}` : `新增${def.title}`;
    document.getElementById('leadDispatchRuleModalBody').innerHTML = renderStrategyConfiguratorForm(key, row || {}, false);
    document.getElementById('leadDispatchRuleModalFooter').innerHTML = `<button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">取消</button><button class="btn-save" type="button" onclick="saveStrategyConfiguratorRow()">确定</button>`;
  }
  
  document.getElementById('leadDispatchRuleModal').classList.add('show');
  if (mode !== 'view') {
    def.form.forEach(field => {
      if (field.type === 'multiselect') {
        updateGenericTagPickerSummary(`cfgForm_${field.field}`);
      }
    });
  }
  if (key === 'manualUnconnected' && mode !== 'view') {
    syncUnconnectedBelongTypeFields(row);
    updateCallTypeTagPickerSummary('unconnectedCallType');
  }
  if ((key === 'manualUnconverted' || isReturnVisitOrderConfigurator(key)) && mode !== 'view') {
    if (isReturnVisitOrderConfigurator(key)) {
      handleReturnVisitOrderNurtureResultChange(row?.abnormalReason || '', row?.intentLevelAction || '');
      syncReturnVisitOrderAgentRouting();
      syncReturnVisitOrderMatchingDimension(row);
    } else {
      syncStrategyConfiguratorAbnormalReason(row?.abnormalReason || '');
    }
  }
  if (key === 'amapMap' && mode !== 'view') {
    syncAmapProjectNameOptions();
  }
  if (key === 'precallTask' && mode !== 'view') {
    if (row?.attributeType === 'SmartCode') updatePrecallSmartCodeSelectedCount();
    if (row?.attributeType === '大项目名') updatePrecallProjectSelectedCount();
  }
  if (key === 'excellentSc') {
    updateExcellentScSmartCodeSelectedCount();
  }
  if (key === 'excellentProject') {
    updateExcellentProjectSelectedCount();
  }
  if (key === 'excellentChannel') {
    updateExcellentChannelSelectedCount();
  }
}

function renderStrategyConfiguratorDetail(key, row) {
  if (!row || !Object.keys(row).length) return renderEmptySnapshot('未找到配置');
  if (key === 'manualUnconnected') {
    const belongValues = Array.isArray(row.belongValues) ? row.belongValues.join('、') : (row.belongValues || '—');
    const belongValueLabel = row.belongType === '渠道编码' ? '渠道编码' : row.belongType === 'SmartCode' ? 'SmartCode' : '命中类型';
    const sections = [
      {
        title: '基础信息',
        fields: [
          ['配置名称', row.ruleName],
          ['状态', row.status || '启用']
        ]
      },
      {
        title: '命中条件',
        fields: [
          ['接触状态', row.contactStatus],
          ['回访车系', row.carSeries],
          ['接触状态重复次数', `${row.contactRepeatCount ?? '—'}次`],
          ['AI外呼次数≤x次', row.maxOutboundCount],
          ['包含留资未满', row.includeIncomplete],
          ['命中类型', row.belongType],
          [belongValueLabel, belongValues]
        ]
      },
      {
        title: '执行动作',
        fields: [
          ['间隔N小时推送给AI外呼跟进', row.pushInterval],
          ['外呼类型', row.outboundType]
        ]
      }
    ];
    return renderRuleDetailSections(sections);
  }
  if (key === 'manualUnconverted') {
    const sections = [
      {
        title: '基础信息',
        fields: [
          ['配置名称', row.ruleName],
          ['状态', row.status || '启用']
        ]
      },
      {
        title: '命中条件',
        fields: [
          ['回访结果', row.leadStatus],
          ['异常原因', getSelectedLeadDispatchAbnormalReason(getManualUnconvertedMappedLeadStatus(row.leadStatus || ''), row.abnormalReason || '') || '不更新'],
          ['回访车系', row.carSeries],
          ['回访更新时间≥任务接收时间N天', `${row.updateDelayDays ?? '—'}天`],
          ['包含留资未满', row.includeIncomplete]
        ]
      },
      {
        title: '执行动作',
        fields: [
          ['间隔N小时推送给AI外呼跟进', `${row.pushDelayDays ?? '—'}小时`],
          ['外呼类型', row.outboundType]
        ]
      }
    ];
    return renderRuleDetailSections(sections);
  }
  if (key === 'precallTask') return renderPrecallTaskDetail(row);
  if (key === 'excellentSc') return renderExcellentScDetail(row);
  if (key === 'excellentProject') return renderExcellentProjectDetail(row);
  if (key === 'excellentChannel') return renderExcellentChannelDetail(row);
  if (key === 'amapMap') return renderAmapMapDetail(row);
  if (isReturnVisitOrderConfigurator(key)) return renderReturnVisitOrderDetail(row);
  return renderStrategyConfiguratorForm(key, row, true);
}

function renderReturnVisitOrderDetail(row) {
  if (!row || !Object.keys(row).length) return '<div class="empty-state">未找到配置</div>';
  const media = Array.isArray(row.mediaName) ? row.mediaName.join('、') : (row.mediaName || '—');
  const channelCode = Array.isArray(row.channelCode) ? row.channelCode.join('、') : (row.channelCode || '—');
  const leadSt = Array.isArray(row.initialLeadStatus) ? row.initialLeadStatus.join('、') : (row.initialLeadStatus || '—');
  const dimension = row.matchingDimension || '';
  const sections = [
    {
      title: '基础信息',
      fields: [
        ['配置名称', row.ruleName],
        ['权重优先级', `P${row.priority || 255}`],
        ['状态', row.status || '启用']
      ]
    },
    {
      title: '匹配条件',
      fields: [
        ['预外呼系统状态', row.precallSystemStatus || '不限'],
        ['触发条件(通话状态)', row.triggerCondition],
        ['匹配维度', dimension || '不限'],
        dimension === '按线索状态' ? ['初始线索状态', leadSt] : null,
        dimension === '按渠道与媒体' ? ['渠道编码', channelCode] : null,
        dimension === '按渠道与媒体' ? ['媒体名称', media] : null
      ].filter(Boolean)
    },
    {
      title: '执行动作',
      fields: [
        ['映射接触状态', row.contactStatus],
        ['映射回访结果', row.nurtureResult],
        ['映射异常原因', row.abnormalReason || '不更新'],
        ['映射意向级别', row.intentLevelAction],
        ['下次回访时间', row.nextReturnVisitTime || '—'],
        ['指派坐席规则', row.agentRouting],
        ['回访描述模板', row.descriptionTemplate || '—']
      ]
    }
  ];
  return renderRuleDetailSections(sections);
}

function renderAmapMapDetail(row) {
  if (!row || !Object.keys(row).length) return '<div class="empty-state">未找到配置</div>';
  const projectName = Array.isArray(row.projectName) ? row.projectName.join('、') : (row.projectName || '—');
  const projectNameLogic = row.projectNameLogic === '且' ? '且（AND）' : '或（OR）';
  const initialLeadStatus = Array.isArray(row.initialLeadStatus) ? row.initialLeadStatus.join('、') : (row.initialLeadStatus || '—');
  const sections = [
    {
      title: '基础信息',
      fields: [
        ['配置名称', row.ruleName],
        ['权重优先级', `P${row.priority || 255}`],
        ['状态', row.status || '启用']
      ]
    },
    {
      title: '匹配条件',
      fields: [
        ['大项目名', projectName],
        ['大项目名命中逻辑', projectNameLogic],
        ['初始线索状态', initialLeadStatus]
      ]
    },
    {
      title: '执行动作',
      fields: [
        ['映射接触状态', row.contactStatus],
        ['映射回访结果', row.nurtureResult],
        ['映射异常原因', row.abnormalReason || '不更新'],
        ['映射意向级别', row.intentLevelAction],
        ['下次回访时间', row.nextReturnVisitTime || '—'],
        ['指派坐席规则', row.agentRouting],
        ['回访描述模板', row.descriptionTemplate || '—']
      ]
    }
  ];
  return renderRuleDetailSections(sections);
}

function renderRuleDetailSections(sections) {
  return `<div class="rule-detail-layout">${sections.map(section => `<section class="rule-detail-section"><div class="rule-detail-title">${section.title}</div><div class="rule-detail-body">${section.fields.map(([label, value]) => `<div class="rule-detail-field"><div class="rule-detail-label">${label}</div><div class="rule-detail-value">${detailValue(value)}</div></div>`).join('')}</div></section>`).join('')}</div>`;
}

function renderExcellentScDetail(row) {
  if (!row || !Object.keys(row).length) return '<div class="empty-state">未找到配置</div>';
  const scValues = Array.isArray(row.smartCode) ? row.smartCode : (row.smartCode ? [row.smartCode] : []);
  const carSeriesValues = Array.isArray(row.carSeries) ? row.carSeries : (row.carSeries ? [row.carSeries] : []);
  return `
    <div class="rule-detail-layout">
      <section class="rule-detail-section">
        <div class="rule-detail-title">基础信息</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">策略名称</div><div class="rule-detail-value">${detailValue(row.ruleName)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">状态</div><div class="rule-detail-value">${detailValue(row.status || '启用')}</div></div>
        </div>
      </section>
      <section class="rule-detail-section">
        <div class="rule-detail-title">匹配条件</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field wide"><div class="rule-detail-label">SmartCode</div><div class="rule-detail-value">${scValues.length ? renderDetailValueTags(scValues) : '—'}</div></div>
          <div class="rule-detail-field wide"><div class="rule-detail-label">意向车系</div><div class="rule-detail-value">${carSeriesValues.length ? renderDetailValueTags(carSeriesValues) : '不限'}</div></div>
        </div>
      </section>
    </div>
  `;
}

function renderExcellentProjectDetail(row) {
  if (!row || !Object.keys(row).length) return '<div class="empty-state">未找到配置</div>';
  const projectValues = Array.isArray(row.scProjectName) ? row.scProjectName : (row.scProjectName ? [row.scProjectName] : []);
  const carSeriesValues = Array.isArray(row.carSeries) ? row.carSeries : (row.carSeries ? [row.carSeries] : []);
  return `
    <div class="rule-detail-layout">
      <section class="rule-detail-section">
        <div class="rule-detail-title">基础信息</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">策略名称</div><div class="rule-detail-value">${detailValue(row.ruleName)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">状态</div><div class="rule-detail-value">${detailValue(row.status || '启用')}</div></div>
        </div>
      </section>
      <section class="rule-detail-section">
        <div class="rule-detail-title">匹配条件</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field wide"><div class="rule-detail-label">大项目名</div><div class="rule-detail-value">${projectValues.length ? renderDetailValueTags(projectValues) : '—'}</div></div>
          <div class="rule-detail-field wide"><div class="rule-detail-label">意向车系</div><div class="rule-detail-value">${carSeriesValues.length ? renderDetailValueTags(carSeriesValues) : '不限'}</div></div>
        </div>
      </section>
    </div>
  `;
}

function renderExcellentChannelDetail(row) {
  if (!row || !Object.keys(row).length) return '<div class="empty-state">未找到配置</div>';
  const channelValues = Array.isArray(row.scChannel) ? row.scChannel : (row.scChannel ? [row.scChannel] : []);
  const carSeriesValues = Array.isArray(row.carSeries) ? row.carSeries : (row.carSeries ? [row.carSeries] : []);
  return `
    <div class="rule-detail-layout">
      <section class="rule-detail-section">
        <div class="rule-detail-title">基础信息</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">策略名称</div><div class="rule-detail-value">${detailValue(row.ruleName)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">状态</div><div class="rule-detail-value">${detailValue(row.status || '启用')}</div></div>
        </div>
      </section>
      <section class="rule-detail-section">
        <div class="rule-detail-title">匹配条件</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field wide"><div class="rule-detail-label">渠道编码</div><div class="rule-detail-value">${channelValues.length ? renderDetailValueTags(channelValues) : '—'}</div></div>
          <div class="rule-detail-field wide"><div class="rule-detail-label">意向车系</div><div class="rule-detail-value">${carSeriesValues.length ? renderDetailValueTags(carSeriesValues) : '不限'}</div></div>
        </div>
      </section>
    </div>
  `;
}

function getPrecallWorkTimeSummary(workTime = {}) {
  const days = Array.isArray(workTime.days) ? workTime.days : [];
  const slots = Array.isArray(workTime.slots) ? workTime.slots : [];
  const timeText = slots.filter(slot => slot?.start && slot?.end).map(slot => `${slot.start}-${slot.end}`).join('；');
  return `${days.join('、') || '—'}${timeText ? ` / ${timeText}` : ''}`;
}

function getPrecallMatchSummary(row = {}) {
  const primary = `${row.attributeType || '—'}：${(row.attributeValues || []).join('、') || '—'}`;
  const status = row.attributeType !== '线索状态' && (row.leadStatuses || []).length ? ` 且 线索状态：${row.leadStatuses.join('、')}` : '';
  return primary + status;
}

function renderPrecallCheckboxes(name, options, selected, readonly = false) {
  return `<div class="series-select-panel"><div class="series-series-grid">${options.map(item => `<label class="series-series-option"><input type="checkbox" name="${name}" value="${escapeAttr(item)}" ${selected.includes(item) ? 'checked' : ''} ${readonly ? 'disabled' : ''} /><span>${escapeHtml(item)}</span></label>`).join('')}</div></div>`;
}

let precallSmartCodeInputModeState = 'picker';
let precallProjectNameInputModeState = 'picker';

function renderPrecallAttributeValueControl(attributeType, selectedValues = [], smartCodeInputMode = 'picker', readonly = false) {
  const config = precallAttributeConfigs[attributeType];
  if (!config) return '<div class="form-label">类型值</div><div class="series-form-hint">请先选择命中类型</div>';
  if (attributeType === '大项目名') return renderPrecallProjectNameInput(selectedValues, smartCodeInputMode, readonly);
  if (attributeType !== 'SmartCode') return `<div class="form-label">${config.label} <span class="required">*</span></div>${renderPrecallCheckboxes('precallAttributeValue', config.options, selectedValues, readonly)}`;
  precallSmartCodeInputModeState = smartCodeInputMode === 'manual' ? 'manual' : 'picker';
  const isManual = precallSmartCodeInputModeState === 'manual';
  const disabled = readonly ? 'disabled' : '';
  return `<div class="form-label">SmartCode <span class="required">*</span></div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
      <div class="smart-code-input-mode" style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
        <div class="form-label" style="font-weight: normal; font-size: 13px; color: #64748b; margin-bottom: 0;">录入方式</div>
        <div class="series-mode-toggle" style="margin-top: 0; margin-bottom: 0;">
          <button class="duration-tab ${!isManual ? 'active' : ''}" type="button" id="precallSmartCodePickerModeBtn" ${readonly ? 'disabled' : 'onclick="switchPrecallSmartCodeInputMode(\'picker\')"'}>下拉勾选</button>
          <button class="duration-tab ${isManual ? 'active' : ''}" type="button" id="precallSmartCodeManualModeBtn" ${readonly ? 'disabled' : 'onclick="switchPrecallSmartCodeInputMode(\'manual\')"'}>手动输入</button>
        </div>
      </div>
      
      <div id="precallSmartCodePickerPanel" style="${isManual ? 'display:none' : ''}">
        <div class="tag-picker project-name-picker ${readonly ? 'readonly' : ''}">
          <button class="tag-picker-trigger placeholder" id="precallSmartCodeTrigger" type="button" ${readonly ? 'disabled' : 'onclick="togglePrecallSmartCodePicker()"'}>请选择SmartCode</button>
          <div class="tag-picker-panel" id="precallSmartCodeOptionsPanel">
            <div class="tag-picker-toolbar"><span id="precallSmartCodeSelectedCount">已选 ${selectedValues.length} / ${config.options.length}</span>${readonly ? '' : '<div class="tag-picker-actions"><button class="tag-picker-action" type="button" onclick="selectAllPrecallSmartCodeOptions()">全选</button><button class="tag-picker-action" type="button" onclick="clearPrecallSmartCodeOptions()">清空</button></div>'}</div>
            <div class="tag-picker-list">${config.options.map(item => `<label class="tag-option ${selectedValues.includes(item) ? 'selected' : ''}"><input type="checkbox" name="precallAttributeValue" value="${escapeAttr(item)}" ${selectedValues.includes(item) ? 'checked' : ''} ${disabled} onchange="updatePrecallSmartCodeSelectedCount()" />${escapeHtml(item)}</label>`).join('')}</div>
          </div>
        </div>
      </div>
      
      <div id="precallSmartCodeManualPanel" style="${isManual ? '' : 'display:none'}">
        <textarea class="form-input assignment-manual-textarea" id="precallSmartCodeManualInput" rows="4" style="margin-top: 0;" placeholder="可一次粘贴多个 SmartCode，支持换行、逗号、分号或空格分隔" ${disabled}>${escapeHtml(selectedValues.join('\n'))}</textarea>
        <div class="series-form-hint" style="margin-bottom: 0;">保存时会自动拆分并去重；不在下拉选项中的 SmartCode 也可直接录入。</div>
      </div>
    </div>`;
}

function switchPrecallSmartCodeInputMode(mode) {
  precallSmartCodeInputModeState = mode === 'manual' ? 'manual' : 'picker';
  const isManual = precallSmartCodeInputModeState === 'manual';
  syncPickerManualInput({ mode: precallSmartCodeInputModeState, pickerSelector: 'input[name="precallAttributeValue"]', manualInputId: 'precallSmartCodeManualInput', onSync: updatePrecallSmartCodeSelectedCount });
  document.getElementById('precallSmartCodePickerModeBtn')?.classList.toggle('active', !isManual);
  document.getElementById('precallSmartCodeManualModeBtn')?.classList.toggle('active', isManual);
  document.getElementById('precallSmartCodePickerPanel').style.display = isManual ? 'none' : '';
  document.getElementById('precallSmartCodeManualPanel').style.display = isManual ? '' : 'none';
}

function togglePrecallSmartCodePicker() {
  toggleExclusivePanel('precallSmartCodeOptionsPanel');
}

function updatePrecallSmartCodeSelectedCount() {
  updateMultiSelectPickerSummary({
    panelId: 'precallSmartCodeOptionsPanel',
    triggerId: 'precallSmartCodeTrigger',
    countId: 'precallSmartCodeSelectedCount',
    placeholder: '请选择SmartCode',
    maxLabels: Number.POSITIVE_INFINITY
  });
}

function selectAllPrecallSmartCodeOptions() { setPickerInputsChecked(getTagPickerInputs('precallSmartCodeOptionsPanel'), true, updatePrecallSmartCodeSelectedCount); }
function clearPrecallSmartCodeOptions() { setPickerInputsChecked(getTagPickerInputs('precallSmartCodeOptionsPanel'), false, updatePrecallSmartCodeSelectedCount); }

function renderPrecallProjectNameInput(selectedValues = [], inputMode = 'picker', readonly = false) {
  precallProjectNameInputModeState = inputMode === 'manual' ? 'manual' : 'picker';
  const isManual = precallProjectNameInputModeState === 'manual';
  const disabled = readonly ? 'disabled' : '';
  return `<div class="form-label">大项目名 <span class="required">*</span></div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
      <div class="smart-code-input-mode" style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
        <div class="form-label" style="font-weight: normal; font-size: 13px; color: #64748b; margin-bottom: 0;">录入方式</div>
        <div class="series-mode-toggle" style="margin-top: 0; margin-bottom: 0;">
          <button class="duration-tab ${!isManual ? 'active' : ''}" type="button" id="precallProjectPickerModeBtn" ${readonly ? 'disabled' : 'onclick="switchPrecallProjectNameInputMode(\'picker\')"'}>下拉勾选</button>
          <button class="duration-tab ${isManual ? 'active' : ''}" type="button" id="precallProjectManualModeBtn" ${readonly ? 'disabled' : 'onclick="switchPrecallProjectNameInputMode(\'manual\')"'}>手动输入</button>
        </div>
      </div>
      
      <div id="precallProjectPickerPanel" style="${isManual ? 'display:none' : ''}">
        <div class="tag-picker project-name-picker ${readonly ? 'readonly' : ''}">
          <button class="tag-picker-trigger placeholder" id="precallProjectTrigger" type="button" ${readonly ? 'disabled' : 'onclick="togglePrecallProjectPicker()"'}>请选择大项目名</button>
          <div class="tag-picker-panel" id="precallProjectOptionsPanel">
            <div class="tag-picker-toolbar"><span id="precallProjectSelectedCount">已选 ${selectedValues.length} / ${projectNameOptions.length}</span>${readonly ? '' : '<div class="tag-picker-actions"><button class="tag-picker-action" type="button" onclick="selectAllPrecallProjectOptions()">全选</button><button class="tag-picker-action" type="button" onclick="clearPrecallProjectOptions()">清空</button></div>'}</div>
            <div class="tag-picker-list">${projectNameOptions.map(item => `<label class="tag-option ${selectedValues.includes(item) ? 'selected' : ''}"><input type="checkbox" name="precallAttributeValue" value="${escapeAttr(item)}" ${selectedValues.includes(item) ? 'checked' : ''} ${disabled} onchange="updatePrecallProjectSelectedCount()" />${escapeHtml(item)}</label>`).join('')}</div>
          </div>
        </div>
      </div>
      
      <div id="precallProjectManualPanel" style="${isManual ? '' : 'display:none'}">
        <textarea class="form-input assignment-manual-textarea" id="precallProjectManualInput" rows="4" style="margin-top: 0;" placeholder="可一次粘贴多个大项目名，支持换行、逗号、分号或空格分隔" ${disabled}>${escapeHtml(selectedValues.join('\n'))}</textarea>
        <div class="series-form-hint" style="margin-bottom: 0;">保存时会自动拆分并去重；不在下拉选项中的大项目名也可直接录入。</div>
      </div>
    </div>`;
}

function switchPrecallProjectNameInputMode(mode) {
  precallProjectNameInputModeState = mode === 'manual' ? 'manual' : 'picker';
  const isManual = precallProjectNameInputModeState === 'manual';
  syncPickerManualInput({ mode: precallProjectNameInputModeState, pickerSelector: 'input[name="precallAttributeValue"]', manualInputId: 'precallProjectManualInput', onSync: updatePrecallProjectSelectedCount });
  document.getElementById('precallProjectPickerModeBtn')?.classList.toggle('active', !isManual);
  document.getElementById('precallProjectManualModeBtn')?.classList.toggle('active', isManual);
  document.getElementById('precallProjectPickerPanel').style.display = isManual ? 'none' : '';
  document.getElementById('precallProjectManualPanel').style.display = isManual ? '' : 'none';
}

function togglePrecallProjectPicker() {
  toggleExclusivePanel('precallProjectOptionsPanel');
}

function updatePrecallProjectSelectedCount() {
  updateMultiSelectPickerSummary({
    panelId: 'precallProjectOptionsPanel',
    triggerId: 'precallProjectTrigger',
    countId: 'precallProjectSelectedCount',
    placeholder: '请选择大项目名',
    maxLabels: Number.POSITIVE_INFINITY
  });
}

function selectAllPrecallProjectOptions() { setPickerInputsChecked(getTagPickerInputs('precallProjectOptionsPanel'), true, updatePrecallProjectSelectedCount); }
function clearPrecallProjectOptions() { setPickerInputsChecked(getTagPickerInputs('precallProjectOptionsPanel'), false, updatePrecallProjectSelectedCount); }

function renderPrecallTimeSlot(slot = {}, index = 0, total = 1, readonly = false) {
  return `<div class="push-time-slot precall-work-slot"><div class="push-time-slot-label">时段${index + 1}</div><input class="form-input time-input precall-work-start" type="time" value="${escapeAttr(slot.start || '')}" ${readonly ? 'disabled' : ''}/><div class="push-time-separator">-</div><input class="form-input time-input precall-work-end" type="time" value="${escapeAttr(slot.end || '')}" ${readonly ? 'disabled' : ''}/>${readonly ? '' : `<button class="push-time-remove" type="button" onclick="removePrecallWorkTimeSlot(this)" style="${total <= 1 ? 'visibility:hidden' : ''}">删除</button>`}</div>`;
}

function renderPrecallTaskForm(row = {}, readonly = false) {
  const status = row.systemStatus || '启用';
  const attributeType = row.attributeType || '请选择';
  const config = precallAttributeConfigs[attributeType];
  const attributeValues = row.attributeValues || [];
  const leadStatuses = row.leadStatuses || [];
  const carSeries = row.carSeries || [];
  const workTime = row.workTime || { days: [], slots: [{ start: '', end: '' }] };
  const slots = workTime.slots?.length ? workTime.slots : [{ start: '', end: '' }];
  const disabled = readonly ? 'disabled' : '';
  const attributeInputMode = attributeType === 'SmartCode' ? row.smartCodeInputMode : attributeType === '大项目名' ? row.projectNameInputMode : 'picker';
  const attributeValueControl = renderPrecallAttributeValueControl(attributeType, attributeValues, attributeInputMode || 'picker', readonly);
  return `<div class="dispatch-rule-form strategy-configurator-form strategy-configurator-form-precallTask">
    <section class="dispatch-form-section"><div class="dispatch-section-title">基础信息</div><div class="dispatch-form-grid">
      <div class="form-group wide"><div class="form-label">配置名称 <span class="required">*</span></div><input class="form-input" id="precallRuleName" value="${escapeAttr(row.ruleName || '')}" placeholder="请输入配置名称" ${disabled} /></div>
      <div class="form-group"><div class="form-label">权重 <span class="required">*</span></div><input class="form-input" id="precallPriority" type="number" min="1" max="255" oninput="this.value = this.value.replace(/[^0-9]/g, '')" value="${escapeAttr(row.priority || 255)}" ${disabled} /><div class="series-form-hint">数字越小优先级越高，命中多条规则时优先按权重判断</div></div>
      <div class="form-group"><div class="form-label">状态 <span class="required">*</span></div><select class="form-input" id="precallStatus" ${disabled}><option value="启用" ${status === '启用' ? 'selected' : ''}>启用</option><option value="停用" ${status === '停用' ? 'selected' : ''}>停用</option></select></div>
    </div></section>
    <section class="dispatch-form-section"><div class="dispatch-section-title">命中条件</div><div class="dispatch-form-grid">
      <div class="form-group wide"><div class="form-label">命中类型 <span class="required">*</span></div><select class="form-input" id="precallAttributeType" onchange="syncPrecallAttributeFields()" ${disabled}>${configuratorOptions.attributeType.map(item => `<option value="${escapeAttr(item)}" ${attributeType === item ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select></div>
      <div class="form-group wide" id="precallAttributeValueGroup">${attributeValueControl}</div>
      <div class="form-group wide" id="precallLeadStatusGroup" style="${config && attributeType !== '线索状态' ? '' : 'display:none'}"><div class="form-label">线索状态 <span class="optional-push-time-tag">选填</span></div>${renderPrecallCheckboxes('precallLeadStatus', assignmentLeadStatusOptions, leadStatuses, readonly)}<div class="series-form-hint">选择后与命中类型按“且（AND）”组合。</div></div>
      <div class="form-group wide"><div class="form-label">意向车系 <span class="required">*</span></div>${renderPrecallCheckboxes('precallCarSeries', configuratorOptions.carSeries, carSeries, readonly)}</div>
    </div></section>
    <section class="dispatch-form-section"><div class="dispatch-section-title">执行动作</div><div class="dispatch-form-grid">
      <div class="form-group"><div class="form-label">预外呼线路 <span class="required">*</span></div><select class="form-input" id="precallLine" ${disabled}>${configuratorOptions.precallLine.map(item => `<option value="${escapeAttr(item)}" ${(row.precallLine || '请选择') === item ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select></div>
      <div class="form-group"><div class="form-label">工作时段优先级 <span class="required">*</span></div><input class="form-input" id="precallWorkPriority" type="number" min="1" oninput="this.value = this.value.replace(/[^0-9]/g, '')" value="${escapeAttr(row.workTimePriority || '')}" placeholder="请输入优先组" ${disabled} /></div>
      <div class="form-group"><div class="form-label">工作时段技能组 <span class="required">*</span></div><select class="form-input" id="precallWorkSkill" ${disabled}>${renderSimpleOptions(configuratorOptions.skillGroup, row.workTimeSkillGroup || '', '请选择')}</select></div>
      <div class="form-group"><div class="form-label">非工作时段优先级 <span class="required">*</span></div><input class="form-input" id="precallOffWorkPriority" type="number" min="1" oninput="this.value = this.value.replace(/[^0-9]/g, '')" value="${escapeAttr(row.offWorkPriority || '')}" placeholder="请输入优先组" ${disabled} /></div>
      <div class="form-group"><div class="form-label">非工作时段技能组 <span class="required">*</span></div><select class="form-input" id="precallOffWorkSkill" ${disabled}>${renderSimpleOptions(configuratorOptions.skillGroup, row.offWorkSkillGroup || '', '请选择')}</select></div>
      <div class="form-group wide"><div class="form-label">生效时段 <span class="required">*</span></div><div class="precall-work-time-panel"><div class="push-time-days">${assignmentPushWeekdays.map(day => `<label class="push-time-day"><input type="checkbox" name="precallWorkDay" value="${day}" ${workTime.days?.includes(day) ? 'checked' : ''} ${disabled}/><span>${day}</span></label>`).join('')}</div><div class="push-time-slots"><div id="precallWorkTimeSlots">${slots.map((slot, index) => renderPrecallTimeSlot(slot, index, slots.length, readonly)).join('')}</div>${readonly ? '' : '<button class="push-time-add" type="button" onclick="addPrecallWorkTimeSlot()">新增时段</button>'}</div><div class="series-form-hint">至少选择一天和一个完整时段；结束时间须晚于开始时间，多个时段不可重叠。</div></div></div>
    </div></section>
  </div>`;
}

function syncPrecallAttributeFields() {
  const type = document.getElementById('precallAttributeType')?.value || '请选择';
  const config = precallAttributeConfigs[type];
  const valueGroup = document.getElementById('precallAttributeValueGroup');
  const statusGroup = document.getElementById('precallLeadStatusGroup');
  if (valueGroup) valueGroup.innerHTML = renderPrecallAttributeValueControl(type, [], 'picker');
  if (statusGroup) statusGroup.style.display = config && type !== '线索状态' ? '' : 'none';
}

function addPrecallWorkTimeSlot() {
  const container = document.getElementById('precallWorkTimeSlots');
  if (!container) return;
  const count = container.querySelectorAll('.precall-work-slot').length;
  container.insertAdjacentHTML('beforeend', renderPrecallTimeSlot({}, count, count + 1));
  refreshPrecallWorkTimeSlots();
}

function removePrecallWorkTimeSlot(button) {
  button.closest('.precall-work-slot')?.remove();
  refreshPrecallWorkTimeSlots();
}

function refreshPrecallWorkTimeSlots() {
  const rows = [...document.querySelectorAll('#precallWorkTimeSlots .precall-work-slot')];
  rows.forEach((row, index) => {
    row.querySelector('.push-time-slot-label').textContent = `时段${index + 1}`;
    const button = row.querySelector('.push-time-remove');
    if (button) button.style.visibility = rows.length <= 1 ? 'hidden' : '';
  });
}

function renderPrecallTaskDetail(row) {
  const sections = [
    { title: '基础信息', fields: [['配置名称', row.ruleName], ['权重', row.priority ? `P${row.priority}` : '—'], ['状态', row.systemStatus]] },
    { title: '命中条件', fields: [['命中类型', row.attributeType], [row.attributeType || '类型值', (row.attributeValues || []).join('、')], ['线索状态（且）', row.attributeType !== '线索状态' && (row.leadStatuses || []).length ? row.leadStatuses.join('、') : '不限'], ['意向车系', (row.carSeries || []).join('、') || '不限']] },
    { title: '执行动作', fields: [['预外呼线路', row.precallLine], ['生效时段', getPrecallWorkTimeSummary(row.workTime)], ['工作时段优先级', row.workTimePriority], ['工作时段技能组', row.workTimeSkillGroup], ['非工作时段优先级', row.offWorkPriority], ['非工作时段技能组', row.offWorkSkillGroup]] }
  ];
  return renderRuleDetailSections(sections);
}

function renderStrategyConfiguratorForm(key, row, readonly = false) {
  if (key === 'precallTask') return renderPrecallTaskForm(row, readonly);
  if (key === 'excellentSc') return renderExcellentScForm(row, readonly);
  if (key === 'excellentProject') return renderExcellentProjectForm(row, readonly);
  if (key === 'excellentChannel') return renderExcellentChannelForm(row, readonly);
  const def = getStrategyConfiguratorDef(key);
  const sections = renderStrategyConfiguratorFormSections(key, def, row, readonly);
  return `
    <div class="dispatch-rule-form strategy-configurator-form strategy-configurator-form-${key}">
      ${sections}
    </div>
  `;
}

function renderStrategyConfiguratorFormSections(key, def, row, readonly = false) {
  const sectionNames = ['基础信息', ...(def.formSections || [])];
  return sectionNames.map(sectionName => {
    const fields = def.form.filter(field => (field.section || '基础信息') === sectionName);
    if (!fields.length) return '';
    let gridContent = fields.map(field => renderStrategyConfiguratorFormField(key, field, row, readonly)).join('');
    if (key === 'manualUnconnected' && sectionName === '命中条件') {
      gridContent += `<div class="day-count-hint day-count-row-hint">填写非负整数，<strong>0次代表不限制</strong>。</div>`;
      gridContent += `<div id="unconnectedBelongTypeSubContainer" class="form-group wide" style="display:none"></div>`;
    }
    return `<section class="dispatch-form-section"><div class="dispatch-section-title">${sectionName}</div><div class="dispatch-form-grid">${gridContent}</div></section>`;
  }).join('');
}

function renderStrategyConfiguratorFormField(key, field, row, readonly = false) {
  const id = `cfgForm_${field.field}`;
  const value = row[field.field] ?? field.defaultValue ?? '';
  const required = field.required ? ' <span class="required">*</span>' : '';
  const hint = field.hintHtml ? `<div class="series-form-hint">${field.hintHtml}</div>` : (field.hint ? `<div class="series-form-hint">${escapeHtml(field.hint)}</div>` : '');
  const groupClass = field.wide ? 'form-group wide' : 'form-group';
  const disabled = readonly ? 'disabled' : '';
  if (isReturnVisitOrderConfigurator(key) && field.field === 'mediaName') {
    const selected = Array.isArray(value) ? value : (value ? [value] : []);
    const inputMode = row.mediaNameInputMode === 'manual' ? 'manual' : 'picker';
    const mediaNameLogic = row.mediaNameLogic || '或';
    const isAnd = mediaNameLogic === '且';
    const options = configuratorOptions.mediaName || [];
    return `
      <div class="${groupClass}" id="formGroup_${field.field}">
        <div class="form-label">${field.label}${required}</div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
          <div class="smart-code-input-mode" style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <div class="form-label" style="font-weight: normal; font-size: 13px; color: #64748b; margin-bottom: 0;">录入方式</div>
            <div class="series-mode-toggle" style="margin-top: 0; margin-bottom: 0;">
              <button class="duration-tab ${inputMode === 'picker' ? 'active' : ''}" type="button" id="cfgForm_mediaNamePickerMode" ${disabled} onclick="switchReturnVisitMediaNameInputMode('picker')">下拉勾选</button>
              <button class="duration-tab ${inputMode === 'manual' ? 'active' : ''}" type="button" id="cfgForm_mediaNameManualMode" ${disabled} onclick="switchReturnVisitMediaNameInputMode('manual')">手动输入</button>
            </div>
          </div>
          
          <div id="cfgForm_mediaNamePickerPanel" style="${inputMode === 'manual' ? 'display:none' : ''}">
            ${renderGenericTagPicker({
              idPrefix: id,
              inputName: `${id}Values`,
              options: options,
              selected: selected,
              placeholder: field.placeholderOption || `请选择${field.label}`,
              readonly: readonly,
              width: '100%',
              isSearch: true
            })}
          </div>
          
          <div id="cfgForm_mediaNameManualPanel" style="${inputMode === 'manual' ? '' : 'display:none'}">
            <textarea class="form-input assignment-manual-textarea" id="cfgForm_mediaNameManualInput" rows="3" style="margin-top: 0;" placeholder="可一次输入或粘贴多个媒体名称，以换行、逗号或空格分隔" ${disabled}>${escapeHtml(selected.join('\n'))}</textarea>
            <div class="series-form-hint" style="margin-bottom: 0;">不在下拉选项中的媒体名称也可直接录入，保存时将自动排重。</div>
          </div>

          <div class="condition-row" style="margin-top: 12px; margin-bottom: 0; padding: 6px 12px; min-height: 40px; background: #fff;">
            <span class="condition-label">状态判断条件：</span>
            <div class="condition-toggle">
              <button type="button" class="condition-btn ${isAnd ? 'active' : ''}" id="cfgForm_mediaNameAnd" ${disabled} onclick="switchReturnVisitMediaNameLogic('且')">且 (AND)</button>
              <button type="button" class="condition-btn ${!isAnd ? 'active' : ''}" id="cfgForm_mediaNameOr" ${disabled} onclick="switchReturnVisitMediaNameLogic('或')">或 (OR)</button>
            </div>
            <span class="condition-desc" id="cfgForm_mediaNameLogicDesc" style="font-size: 12px; color: #8c8c8c; margin-left: 4px;">${isAnd ? '命中所有已选媒体名称才触发规则' : '命中任意一个已选媒体名称即触发规则'}</span>
          </div>
        </div>
        ${hint}
      </div>
    `;
  }
  if (key === 'amapMap' && field.field === 'initialLeadStatus') {
    const selected = Array.isArray(value) ? value : (value ? [value] : []);
    return `
      <div class="${groupClass}" id="formGroup_${field.field}">
        <div class="form-label">${field.label}${required}</div>
        ${renderGenericTagPicker({
          idPrefix: id,
          inputName: `${id}Values`,
          options: configuratorOptions[field.options] || [],
          selected: selected,
          placeholder: field.placeholderOption || '请选择初始线索状态',
          readonly: readonly,
          width: '100%',
          onchange: 'syncAmapProjectNameOptions()',
          isSearch: field.isSearch
        })}
        ${hint}
      </div>
    `;
  }
  if (key === 'amapMap' && field.field === 'projectName') {
    const selected = Array.isArray(value) ? value : (value ? [value] : []);
    const inputMode = row.projectNameInputMode === 'manual' ? 'manual' : 'picker';
    const projectNameLogic = row.projectNameLogic || '或';
    const isAnd = projectNameLogic === '且';
    const selectedStatuses = Array.isArray(row.initialLeadStatus) ? row.initialLeadStatus : (row.initialLeadStatus ? [row.initialLeadStatus] : []);
    const options = getAmapProjectNameOptions(selectedStatuses);
    const isDisabled = readonly;
    const disabledAttr = isDisabled ? 'disabled' : '';
    return `
      <div class="${groupClass}" id="formGroup_${field.field}">
        <div class="form-label">${field.label}${required}</div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
          <div class="smart-code-input-mode" style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
            <div class="form-label" style="font-weight: normal; font-size: 13px; color: #64748b; margin-bottom: 0;">录入方式</div>
            <div class="series-mode-toggle" style="margin-top: 0; margin-bottom: 0;">
              <button class="duration-tab ${inputMode === 'picker' ? 'active' : ''}" type="button" id="cfgForm_projectNamePickerMode" ${disabledAttr} onclick="switchAmapProjectNameInputMode('picker')">下拉勾选</button>
              <button class="duration-tab ${inputMode === 'manual' ? 'active' : ''}" type="button" id="cfgForm_projectNameManualMode" ${disabledAttr} onclick="switchAmapProjectNameInputMode('manual')">手动输入</button>
            </div>
          </div>
          <div id="cfgForm_projectNamePickerPanel" style="${inputMode === 'manual' ? 'display:none' : ''}">
            ${renderGenericTagPicker({
              idPrefix: id,
              inputName: `${id}Values`,
              options: options,
              selected: selected,
              placeholder: field.placeholderOption || '请选择大项目名',
              readonly: readonly,
              width: '100%',
              isSearch: true
            })}
          </div>
          <div id="cfgForm_projectNameManualPanel" style="${inputMode === 'manual' ? '' : 'display:none'}">
            <textarea class="form-input assignment-manual-textarea" id="cfgForm_projectNameManualInput" rows="3" style="margin-top: 0;" placeholder="可一次输入或粘贴多个大项目名，以换行、逗号或空格分隔" ${disabledAttr}>${escapeHtml(selected.join('\n'))}</textarea>
            <div class="series-form-hint" style="margin-bottom: 0;">不在下拉选项中的大项目名也可直接录入，保存时将自动排重。</div>
          </div>
          <div class="condition-row" style="margin-top: 12px; margin-bottom: 0; padding: 6px 12px; min-height: 40px; background: #fff;">
            <span class="condition-label">状态判断条件：</span>
            <div class="condition-toggle">
              <button type="button" class="condition-btn ${isAnd ? 'active' : ''}" id="cfgForm_projectNameAnd" ${disabledAttr} onclick="switchAmapProjectNameLogic('且')">且 (AND)</button>
              <button type="button" class="condition-btn ${!isAnd ? 'active' : ''}" id="cfgForm_projectNameOr" ${disabledAttr} onclick="switchAmapProjectNameLogic('或')">或 (OR)</button>
            </div>
            <span class="condition-desc" id="cfgForm_projectNameLogicDesc" style="font-size: 12px; color: #8c8c8c; margin-left: 4px;">${isAnd ? '命中所有已选大项目名才触发规则' : '命中任意一个已选大项目名即触发规则'}</span>
          </div>
        </div>
        ${hint}
      </div>
    `;
  }
  if (field.type === 'dayCount') {
    const parsed = parseStrategyDayCountValue(value);
    const integerAttrs = getNonNegativeIntegerInputAttrs(key, field.field);
    return `<div class="${groupClass}"><div class="form-label">${field.label}${required}</div><div class="day-count-control"><span class="day-count-prefix">最近</span><div class="day-count-input"><input class="form-input" id="${id}_days" type="number" min="0"${integerAttrs} value="${escapeAttr(parsed.days)}" placeholder="0" ${disabled} /><span class="day-count-suffix">天</span></div><span class="day-count-connector">内 ≤</span><div class="day-count-input"><input class="form-input" id="${id}_count" type="number" min="0"${integerAttrs} value="${escapeAttr(parsed.count)}" placeholder="0" ${disabled} /><span class="day-count-suffix">次</span></div></div></div>`;
  }
  if (isReturnVisitOrderConfigurator(key) && field.field === 'intentLevelAction') {
    const nurtureResult = row.nurtureResult || '';
    const options = getReturnVisitOrderIntentLevelOptions(nurtureResult);
    const locked = options.length <= 1;
    const selected = options.includes(value) ? value : options[0];
    return `<div class="${groupClass}"><div class="form-label">${field.label}${required}</div><select class="form-input" id="${id}" ${locked || readonly ? 'disabled' : ''}>${options.map(item => `<option value="${escapeAttr(item)}" ${selected === item ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select>${hint}</div>`;
  }
  if (isReturnVisitOrderConfigurator(key) && field.field === 'agentRouting') {
    const precallSystemStatus = row.precallSystemStatus || '';
    const triggerCondition = row.triggerCondition || '';
    const lockedValue = getReturnVisitOrderLockedAgentRouting(precallSystemStatus, triggerCondition);
    const selected = lockedValue || value || '';
    const options = configuratorOptions.agentRouting || [];
    return `<div class="${groupClass}"><div class="form-label">${field.label}${required}</div><select class="form-input" id="${id}" disabled>${selected ? `<option value="${escapeAttr(selected)}" selected>${escapeHtml(selected)}</option>` : `<option value="" selected>请选择</option>`}${options.filter(o => o !== selected).map(item => `<option value="${escapeAttr(item)}">${escapeHtml(item)}</option>`).join('')}</select>${hint}</div>`;
  }
  if (isReturnVisitOrderConfigurator(key) && field.field === 'nextReturnVisitTime') {
    const canSelect = row.nurtureResult === '下次回访';
    const allOptions = configuratorOptions.nextReturnVisitTime || [];
    const currentValue = canSelect ? (value || '') : '';
    const placeholder = canSelect ? '请选择' : '不更新';
    return `<div class="${groupClass}"><div class="form-label">${field.label}${required}</div><select class="form-input" id="${id}" ${canSelect && !readonly ? '' : 'disabled'}><option value="" ${!currentValue ? 'selected' : ''}>${placeholder}</option>${allOptions.map(item => `<option value="${escapeAttr(item)}" ${currentValue === item ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select>${hint}</div>`;
  }
  if (field.type === 'readonly') {
    return `<div class="${groupClass}"><div class="form-label">${field.label}${required}</div><input class="form-input" id="${id}" type="text" value="${escapeAttr(value)}" readonly />${hint}</div>`;
  }
  if (field.type === 'select') {
    const options = configuratorOptions[field.options] || [];
    const onchange = field.field === 'belongType'
      ? 'onchange="syncUnconnectedBelongTypeFields()"'
      : (key === 'manualUnconverted' && field.field === 'leadStatus' ? 'onchange="syncStrategyConfiguratorAbnormalReason()"'
        : (isReturnVisitOrderConfigurator(key) && field.field === 'nurtureResult' ? 'onchange="handleReturnVisitOrderNurtureResultChange()"'
          : (isReturnVisitOrderConfigurator(key) && field.field === 'precallSystemStatus' ? 'onchange="syncReturnVisitOrderAgentRouting()"'
            : (isReturnVisitOrderConfigurator(key) && field.field === 'triggerCondition' ? 'onchange="syncReturnVisitOrderAgentRouting()"'
              : (isReturnVisitOrderConfigurator(key) && field.field === 'matchingDimension' ? 'onchange="syncReturnVisitOrderMatchingDimension()"'
                : '')))));
    const selectOptions = field.defaultValue && !options.includes(field.defaultValue) ? [field.defaultValue, ...options] : options;
    const placeholderOption = field.placeholderOption ? `<option value="" ${!value ? 'selected' : ''}>${escapeHtml(field.placeholderOption)}</option>` : '';
    return `<div class="${groupClass}" id="formGroup_${field.field}"><div class="form-label">${field.label}${required}</div><select class="form-input" id="${id}" ${onchange} ${disabled}>${placeholderOption}${selectOptions.map(item => `<option value="${escapeAttr(item)}" ${value === item ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select>${hint}</div>`;
  }
  if (field.type === 'leadStatusReason') {
    const statusVal = (isReturnVisitOrderConfigurator(key) ? row.nurtureResult : row.leadStatus) || '';
    const leadStatus = getManualUnconvertedMappedLeadStatus(statusVal);
    const locked = !leadStatus || isLeadStatusAbnormalReasonLocked(leadStatus);
    const selected = leadStatus ? getSelectedLeadDispatchAbnormalReason(leadStatus, value || '') : '';
    const reasonOptions = leadStatus ? getLeadDispatchAbnormalReasonOptions(leadStatus, value || '') : [''];
    return `<div class="${groupClass}" id="manualUnconvertedAbnormalReasonGroup" style="${shouldShowLeadDispatchAbnormalReason(leadStatus) ? '' : 'display:none'}"><div class="form-label">${field.label}${required}</div><select class="form-input" id="${id}" ${locked || readonly ? 'disabled' : ''}>${renderLeadDispatchOptionList(reasonOptions, selected, locked ? '不更新' : '请选择异常原因')}</select>${hint}</div>`;
  }
  if (field.type === 'multiselect') {
    const selected = Array.isArray(value) ? value : (value ? [value] : []);
    const options = configuratorOptions[field.options] || [];
    return `
      <div class="${groupClass}" id="formGroup_${field.field}">
        <div class="form-label">${field.label}${required}</div>
        ${renderGenericTagPicker({
          idPrefix: id,
          inputName: `${id}Values`,
          options: options,
          selected: selected,
          placeholder: field.placeholderOption || `请选择${field.label}`,
          readonly: readonly,
          width: '100%',
          isSearch: field.isSearch
        })}
        ${hint}
      </div>
    `;
  }
  if (field.type === 'callTypePicker') {
    const selected = Array.isArray(value) ? value : (value ? String(value).split(/[、,，]/).map(item => item.trim()).filter(Boolean) : []);
    return `
      <div class="${groupClass}">
        <div class="form-label">${field.label}${required}</div>
        ${renderCallTypeTagPicker({
          idPrefix: 'unconnectedCallType',
          inputName: 'unconnectedCallTypeValue',
          options: configuratorOptions[field.options] || [],
          selected: selected,
          readonly: readonly
        })}
        ${hint}
      </div>
    `;
  }
  if (field.type === 'textarea') {
    return `<div class="form-group wide"><div class="form-label">${field.label}${required}</div><textarea class="form-textarea" id="${id}" placeholder="请输入${field.label}" ${disabled}>${escapeHtml(value)}</textarea>${hint}</div>`;
  }
  const integerAttrs = field.type === 'number' ? getNonNegativeIntegerInputAttrs(key, field.field) : '';
  return `<div class="${groupClass}"><div class="form-label">${field.label}${required}</div><input class="form-input" id="${id}" type="${field.type === 'number' ? 'number' : 'text'}" min="${field.allowZero ? 0 : 1}"${integerAttrs} value="${escapeAttr(value)}" placeholder="请输入${field.label}" ${disabled} />${hint}</div>`;
}

function isManualUnconvertedNonNegativeIntegerField(key, fieldName) {
  if (key === 'manualUnconnected') return ['contactRepeatCount', 'maxOutboundCount', 'pushInterval'].includes(fieldName);
  if (key === 'manualUnconverted') return ['updateDelayDays', 'pushDelayDays'].includes(fieldName);
  return false;
}

function getNonNegativeIntegerInputAttrs(key, fieldName) {
  if (!isManualUnconvertedNonNegativeIntegerField(key, fieldName)) return '';
  return ' step="1" inputmode="numeric" pattern="\\d*" onkeydown="return preventNonNegativeIntegerKey(event)" oninput="normalizeNonNegativeIntegerInput(this)" onpaste="setTimeout(() => normalizeNonNegativeIntegerInput(this))"';
}

function preventNonNegativeIntegerKey(event) {
  if (event.ctrlKey || event.metaKey || event.altKey) return true;
  const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
  if (allowedKeys.includes(event.key)) return true;
  return /^\d$/.test(event.key);
}

function normalizeNonNegativeIntegerInput(input) {
  input.value = String(input.value || '').replace(/[^\d]/g, '');
}

function getManualUnconvertedMappedLeadStatus(reviewResult = '') {
  const map = {
    '休眠未购': '总部_休眠未购',
    '休眠失联': '总部_休眠失联',
    '战败': '总部_战败',
    '无效结案': '总部_无效',
    '总部_休眠未购': '总部_休眠未购',
    '总部_休眠失联': '总部_休眠失联',
    '总部_战败': '总部_战败',
    '总部_无效': '总部_无效'
  };
  return map[reviewResult || ''] || '';
}

function syncStrategyConfiguratorAbnormalReason(currentReason = '') {
  const key = strategyConfiguratorEditing.key;
  const statusField = isReturnVisitOrderConfigurator(key) ? 'nurtureResult' : 'leadStatus';
  const statusSelect = document.getElementById(`cfgForm_${statusField}`);
  const reasonSelect = document.getElementById('cfgForm_abnormalReason');
  if (!statusSelect || !reasonSelect) return;
  const reasonGroup = document.getElementById('manualUnconvertedAbnormalReasonGroup');
  const reviewResult = ['请选择线索状态', '请选择回访结果'].includes(statusSelect.value) ? '' : (statusSelect.value || '');
  const leadStatus = getManualUnconvertedMappedLeadStatus(reviewResult);
  const locked = !leadStatus || isLeadStatusAbnormalReasonLocked(leadStatus);
  const previousValue = currentReason || reasonSelect.value || '';
  const selectedReason = leadStatus ? getSelectedLeadDispatchAbnormalReason(leadStatus, previousValue) : '';
  reasonSelect.disabled = locked;
  reasonSelect.innerHTML = renderLeadDispatchOptionList(
    leadStatus ? getLeadDispatchAbnormalReasonOptions(leadStatus, previousValue) : [''],
    selectedReason,
    locked ? '不更新' : '请选择异常原因'
  );
  if (reasonGroup) reasonGroup.style.display = shouldShowLeadDispatchAbnormalReason(leadStatus) ? '' : 'none';
}

function getReturnVisitOrderIntentLevelOptions(nurtureResult) {
  switch (nurtureResult) {
    case '下次回访':
      return ['E', 'A', 'B', 'C'];
    case '试驾排程下发':
    case '试驾线索下发':
    case '意向线索下发':
      return ['H'];
    case '无人接听下发':
    case '无人接下发':
      return ['C'];
    case '休眠失联':
    case '休眠未购':
      return ['L'];
    case '战败':
      return ['F'];
    case '无效结案':
    default:
      return ['不更新'];
  }
}

function syncReturnVisitOrderIntentLevelAction(currentIntent = '') {
  const statusSelect = document.getElementById('cfgForm_nurtureResult');
  const intentSelect = document.getElementById('cfgForm_intentLevelAction');
  if (!statusSelect || !intentSelect) return;
  const nurtureResult = statusSelect.value || '';
  const options = getReturnVisitOrderIntentLevelOptions(nurtureResult);
  const locked = options.length <= 1;
  const previousValue = currentIntent || intentSelect.value || '';
  const selected = options.includes(previousValue) ? previousValue : options[0];
  
  intentSelect.disabled = locked;
  intentSelect.innerHTML = options.map(item => `<option value="${escapeAttr(item)}" ${selected === item ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('');
}

function syncReturnVisitOrderNextReturnVisitTime(currentTime = '') {
  const nurtureResultEl = document.getElementById('cfgForm_nurtureResult');
  const nextReturnVisitTimeEl = document.getElementById('cfgForm_nextReturnVisitTime');
  if (!nurtureResultEl || !nextReturnVisitTimeEl) return;

  const canSelect = nurtureResultEl.value === '下次回访';
  const allOptions = configuratorOptions.nextReturnVisitTime || [];
  const previousValue = canSelect ? (currentTime || nextReturnVisitTimeEl.value || '') : '';
  nextReturnVisitTimeEl.disabled = !canSelect;
  nextReturnVisitTimeEl.innerHTML = `<option value="" ${!previousValue ? 'selected' : ''}>${canSelect ? '请选择' : '不更新'}</option>` + allOptions.map(item =>
    `<option value="${escapeAttr(item)}" ${previousValue === item ? 'selected' : ''}>${escapeHtml(item)}</option>`
  ).join('');
}

function handleReturnVisitOrderNurtureResultChange(currentReason = '', currentIntent = '', currentTime = '') {
  syncStrategyConfiguratorAbnormalReason(currentReason);
  syncReturnVisitOrderIntentLevelAction(currentIntent);
  syncReturnVisitOrderNextReturnVisitTime(currentTime);
}

function getReturnVisitOrderLockedAgentRouting(precallSystemStatus, triggerCondition) {
  if (!precallSystemStatus) {
    return '';
  }
  if (precallSystemStatus === '处理中') {
    return '原始归属人';
  }
  if (precallSystemStatus === '已处理') {
    const isSpecialCallStatus = ['超时未接', '线索拒呼', '线索未呼'].includes(triggerCondition);
    if (isSpecialCallStatus) {
      return '系统默认分配';
    } else {
      return '原始归属人';
    }
  }
  return '';
}

function syncReturnVisitOrderAgentRouting() {
  const precallStatusEl = document.getElementById('cfgForm_precallSystemStatus');
  const triggerConditionEl = document.getElementById('cfgForm_triggerCondition');
  const agentRoutingEl = document.getElementById('cfgForm_agentRouting');
  if (!precallStatusEl) return;

  const precallStatus = precallStatusEl.value || '';
  const triggerCondition = triggerConditionEl ? (triggerConditionEl.value || '') : '';
  const lockedValues = ['超时未接', '线索拒呼', '线索未呼'];
  const isLockedCondition = lockedValues.includes(triggerCondition);

  // --- 指派坐席规则联动 ---
  if (agentRoutingEl) {
    if (!precallStatus) {
      // 规则1: 预外呼系统状态 = 请选择 → 禁止选择，显示"请选择"
      agentRoutingEl.disabled = true;
      agentRoutingEl.value = '';
    } else if (precallStatus === '处理中') {
      // 规则2: 处理中 → 禁止选择，默认"原始归属人"
      agentRoutingEl.disabled = true;
      agentRoutingEl.value = '原始归属人';
    } else if (precallStatus === '已处理' && !isLockedCondition) {
      // 规则3: 已处理 且 触发条件 ≠ 超时未接/线索拒呼/线索未呼 → 禁止选择，默认"原始归属人"
      agentRoutingEl.disabled = true;
      agentRoutingEl.value = '原始归属人';
    } else if (precallStatus === '已处理' && isLockedCondition) {
      // 规则4: 已处理 且 触发条件 = 超时未接/线索拒呼/线索未呼 → 禁止选择，默认"系统默认分配"
      agentRoutingEl.disabled = true;
      agentRoutingEl.value = '系统默认分配';
    } else {
      agentRoutingEl.disabled = true;
    }
  }

}

function syncReturnVisitOrderMatchingDimension(row = null) {
  const dimensionEl = document.getElementById('cfgForm_matchingDimension');
  if (!dimensionEl) return;
  const value = dimensionEl.value || row?.matchingDimension || '';
  dimensionEl.value = value;
  
  const leadStatusGroup = document.getElementById('formGroup_initialLeadStatus');
  const channelCodeGroup = document.getElementById('formGroup_channelCode');
  const mediaNameGroup = document.getElementById('formGroup_mediaName');
  
  if (value === '按线索状态') {
    if (leadStatusGroup) leadStatusGroup.style.display = '';
    if (channelCodeGroup) channelCodeGroup.style.display = 'none';
    if (mediaNameGroup) mediaNameGroup.style.display = 'none';
  } else if (value === '按渠道与媒体') {
    if (leadStatusGroup) leadStatusGroup.style.display = 'none';
    if (channelCodeGroup) channelCodeGroup.style.display = '';
    if (mediaNameGroup) mediaNameGroup.style.display = '';
  } else {
    if (leadStatusGroup) leadStatusGroup.style.display = 'none';
    if (channelCodeGroup) channelCodeGroup.style.display = 'none';
    if (mediaNameGroup) mediaNameGroup.style.display = 'none';
  }

  const leadStatusLabel = document.querySelector('#formGroup_initialLeadStatus .form-label');
  const channelCodeLabel = document.querySelector('#formGroup_channelCode .form-label');
  if (leadStatusLabel) {
    leadStatusLabel.innerHTML = '初始线索状态' + (value === '按线索状态' ? ' <span class="required">*</span>' : '');
  }
  if (channelCodeLabel) {
    channelCodeLabel.innerHTML = '渠道编码' + (value === '按渠道与媒体' ? ' <span class="required">*</span>' : '');
  }
}

function parseStrategyDayCountValue(value) {
  const text = String(value ?? '').trim();
  const match = text.match(/(\d+)\s*天\s*(\d+)\s*次/);
  return {
    days: match ? match[1] : '',
    count: match ? match[2] : ''
  };
}

function collectStrategyConfiguratorFormValue(def) {
  if (strategyConfiguratorEditing.key === 'precallTask') return collectPrecallTaskFormValue();
  if (strategyConfiguratorEditing.key === 'excellentSc') return collectExcellentScFormValue();
  if (strategyConfiguratorEditing.key === 'excellentProject') return collectExcellentProjectFormValue();
  if (strategyConfiguratorEditing.key === 'excellentChannel') return collectExcellentChannelFormValue();
  const payload = {};
  for (const field of def.form) {
    if (field.type === 'dayCount') {
      const days = document.getElementById(`cfgForm_${field.field}_days`)?.value.trim() || '';
      const count = document.getElementById(`cfgForm_${field.field}_count`)?.value.trim() || '';
      if (field.required && (!days || !count)) return { ok: false, message: `请填写${field.label}` };
      const dayValue = Number(days);
      const countValue = Number(count);
      if (!Number.isInteger(dayValue) || !Number.isInteger(countValue) || dayValue < 0 || countValue < 0) return { ok: false, message: `请填写有效${field.label}` };
      payload[field.field] = `${dayValue}天${countValue}次`;
      continue;
    }
    if (field.type === 'callTypePicker') {
      const inputs = getCallTypeTagPickerInputs('unconnectedCallType');
      const selected = inputs.filter(input => input.checked).map(input => input.value);
      if (field.required && !selected.length) return { ok: false, message: `请选择${field.label}` };
      payload[field.field] = selected;
      continue;
    }
    if (field.type === 'leadStatusReason') {
      const statusField = isReturnVisitOrderConfigurator(strategyConfiguratorEditing.key) ? 'nurtureResult' : 'leadStatus';
      const reviewResult = document.getElementById(`cfgForm_${statusField}`)?.value || '';
      const normalizedLeadStatus = getManualUnconvertedMappedLeadStatus(reviewResult);
      const reasonValue = document.getElementById(`cfgForm_${field.field}`)?.value.trim() || '';
      if (!normalizedLeadStatus || isLeadStatusAbnormalReasonLocked(normalizedLeadStatus)) {
        payload[field.field] = '';
      } else {
        if (field.required && !reasonValue) return { ok: false, message: `请选择${field.label}` };
        payload[field.field] = reasonValue;
      }
      continue;
    }
    if (isReturnVisitOrderConfigurator(strategyConfiguratorEditing.key) && field.field === 'intentLevelAction') {
      const nurtureResult = document.getElementById('cfgForm_nurtureResult')?.value || '';
      const allowed = getReturnVisitOrderIntentLevelOptions(nurtureResult);
      const val = document.getElementById(`cfgForm_${field.field}`)?.value.trim() || '';
      payload[field.field] = allowed.includes(val) ? val : allowed[0];
      continue;
    }
    if (isReturnVisitOrderConfigurator(strategyConfiguratorEditing.key) && field.field === 'nextReturnVisitTime') {
      const nurtureResult = document.getElementById('cfgForm_nurtureResult')?.value || '';
      const value = document.getElementById(`cfgForm_${field.field}`)?.value.trim() || '';
      if (nurtureResult === '下次回访' && field.required && !value) return { ok: false, message: `请选择${field.label}` };
      payload[field.field] = nurtureResult === '下次回访' ? value : '';
      continue;
    }
    if (isReturnVisitOrderConfigurator(strategyConfiguratorEditing.key) && field.field === 'mediaName') {
      const id = `cfgForm_${field.field}`;
      const isManual = document.getElementById('cfgForm_mediaNameManualMode')?.classList.contains('active');
      payload.mediaNameInputMode = isManual ? 'manual' : 'picker';
      if (isManual) {
        const text = document.getElementById('cfgForm_mediaNameManualInput')?.value || '';
        payload.mediaName = text.split(/[\n,;，；\s]+/).map(v => v.trim()).filter(Boolean);
        payload.mediaName = [...new Set(payload.mediaName)];
      } else {
        const inputs = getGenericTagPickerInputs(id);
        payload.mediaName = inputs.filter(input => input.checked).map(input => input.value);
      }
      const isAnd = document.getElementById('cfgForm_mediaNameAnd')?.classList.contains('active');
      payload.mediaNameLogic = isAnd ? '且' : '或';
      continue;
    }
    if (strategyConfiguratorEditing.key === 'amapMap' && field.field === 'projectName') {
      const id = `cfgForm_${field.field}`;
      const isManual = document.getElementById('cfgForm_projectNameManualMode')?.classList.contains('active');
      payload.projectNameInputMode = isManual ? 'manual' : 'picker';
      if (isManual) {
        const text = document.getElementById('cfgForm_projectNameManualInput')?.value || '';
        payload.projectName = [...new Set(text.split(/[\n,;，；\s]+/).map(value => value.trim()).filter(Boolean))];
      } else {
        const inputs = getGenericTagPickerInputs(id);
        payload.projectName = inputs.filter(input => input.checked).map(input => input.value);
      }
      if (field.required && !payload.projectName.length) return { ok: false, message: '请选择或输入大项目名' };
      payload.projectNameLogic = document.getElementById('cfgForm_projectNameAnd')?.classList.contains('active') ? '且' : '或';
      continue;
    }
    const id = `cfgForm_${field.field}`;
    const el = document.getElementById(id);
    if (!el && field.type !== 'multiselect') continue;
    let value;
    if (field.type === 'multiselect') {
      const inputs = getGenericTagPickerInputs(id);
      value = inputs.filter(input => input.checked).map(input => input.value);
    } else {
      value = el.value.trim();
    }
    if (field.field === 'belongType' && value === '请选择') return { ok: false, message: '请选择命中类型' };
    if (field.required && field.defaultValue && value === field.defaultValue) return { ok: false, message: `请选择${field.label}` };
    if (field.required && (!value || (Array.isArray(value) && !value.length))) return { ok: false, message: `请选择${field.label}` };
    if (field.type === 'number') {
      const numberValue = Number(value);
      if (Number.isNaN(numberValue) || numberValue < (field.allowZero ? 0 : 1)) return { ok: false, message: `请填写有效${field.label}` };
      if (isManualUnconvertedNonNegativeIntegerField(strategyConfiguratorEditing.key, field.field) && !Number.isInteger(numberValue)) return { ok: false, message: `请填写非负整数${field.label}` };
      value = numberValue;
    }
    payload[field.field] = value;
  }
  if (strategyConfiguratorEditing.key === 'manualUnconnected') {
    const belongType = document.getElementById('cfgForm_belongType')?.value || '';
    let belongValues = [];
    let smartCodeInputMode = 'picker';
    if (belongType === '渠道编码') {
      belongValues = Array.from(document.querySelectorAll('input[name="unconnectedChannelValue"]:checked')).map(input => input.value);
      if (!belongValues.length) return { ok: false, message: '请选择渠道编码' };
    } else if (belongType === 'SmartCode') {
      smartCodeInputMode = unconnectedSmartCodeInputModeState;
      if (smartCodeInputMode === 'picker') {
        belongValues = Array.from(document.querySelectorAll('input[name="unconnectedSmartCodeValue"]:checked')).map(input => input.value);
      } else {
        const text = document.getElementById('unconnectedSmartCodeManualInput')?.value || '';
        belongValues = text.split(/[\n,;，；\s]+/).map(v => v.trim()).filter(Boolean);
        belongValues = [...new Set(belongValues)];
      }
      if (!belongValues.length) return { ok: false, message: '请选择或输入SmartCode' };
    }
    payload.belongValues = belongValues;
    payload.smartCodeInputMode = smartCodeInputMode;
  }
  if (strategyConfiguratorEditing.key === 'returnVisitOrder') {
    const dimension = payload.matchingDimension || '';
    if (dimension === '按线索状态') {
      payload.channelCode = [];
      payload.mediaName = [];
      if (!payload.initialLeadStatus || !payload.initialLeadStatus.length) {
        return { ok: false, message: '请选择初始线索状态' };
      }
    } else if (dimension === '按渠道与媒体') {
      payload.initialLeadStatus = [];
      if (!payload.channelCode || !payload.channelCode.length) {
        return { ok: false, message: '请选择渠道编码' };
      }
    } else {
      payload.initialLeadStatus = [];
      payload.channelCode = [];
      payload.mediaName = [];
    }
  }
  return { ok: true, payload };
}

function collectPrecallTaskFormValue() {
  const valueOf = id => document.getElementById(id)?.value.trim() || '';
  const checkedValues = name => Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(input => input.value);
  const ruleName = valueOf('precallRuleName');
  const priority = Number(valueOf('precallPriority'));
  const attributeType = valueOf('precallAttributeType');
  let attributeValues = checkedValues('precallAttributeValue');
  const precallLine = valueOf('precallLine');
  const workTimePriority = Number(valueOf('precallWorkPriority'));
  const offWorkPriority = Number(valueOf('precallOffWorkPriority'));
  const workTimeSkillGroup = valueOf('precallWorkSkill');
  const offWorkSkillGroup = valueOf('precallOffWorkSkill');
  const days = checkedValues('precallWorkDay');
  const slots = Array.from(document.querySelectorAll('#precallWorkTimeSlots .precall-work-slot')).map(row => ({
    start: row.querySelector('.precall-work-start')?.value || '',
    end: row.querySelector('.precall-work-end')?.value || ''
  }));
  if (!ruleName) return { ok: false, message: '请填写配置名称' };
  if (!Number.isInteger(priority) || priority < 1 || priority > 255) return { ok: false, message: '请填写1-255的权重' };
  if (!checkedValues('precallCarSeries').length) return { ok: false, message: '请选择意向车系' };
  if (!precallAttributeConfigs[attributeType]) return { ok: false, message: '请选择命中类型' };
  const smartCodeInputMode = attributeType === 'SmartCode' ? precallSmartCodeInputModeState : 'picker';
  if (attributeType === 'SmartCode' && smartCodeInputMode === 'manual') {
    attributeValues = (document.getElementById('precallSmartCodeManualInput')?.value || '').split(/[\n,;，；\s]+/).map(item => item.trim()).filter(Boolean);
    attributeValues = [...new Set(attributeValues)];
  }
  const projectNameInputMode = attributeType === '大项目名' ? precallProjectNameInputModeState : 'picker';
  if (attributeType === '大项目名' && projectNameInputMode === 'manual') {
    attributeValues = (document.getElementById('precallProjectManualInput')?.value || '').split(/[\n,;，；\s]+/).map(item => item.trim()).filter(Boolean);
    attributeValues = [...new Set(attributeValues)];
  }
  if (!attributeValues.length) return { ok: false, message: `请选择或输入${precallAttributeConfigs[attributeType].label}` };
  if (!precallLine || precallLine === '请选择') return { ok: false, message: '请选择预外呼线路' };
  if (!Number.isInteger(workTimePriority) || workTimePriority < 1) return { ok: false, message: '请填写有效工作时段优先级' };
  if (!workTimeSkillGroup) return { ok: false, message: '请选择工作时段技能组' };
  if (!Number.isInteger(offWorkPriority) || offWorkPriority < 1) return { ok: false, message: '请填写有效非工作时段优先级' };
  if (!offWorkSkillGroup) return { ok: false, message: '请选择非工作时段技能组' };
  if (!days.length) return { ok: false, message: '请选择生效星期' };
  if (!slots.length || slots.some(slot => !slot.start || !slot.end || slot.end <= slot.start)) return { ok: false, message: '请填写有效生效时段（结束时间须晚于开始时间）' };
  const orderedSlots = [...slots].sort((a, b) => a.start.localeCompare(b.start));
  if (orderedSlots.some((slot, index) => index > 0 && slot.start < orderedSlots[index - 1].end)) return { ok: false, message: '生效时段不可重叠' };
  return { ok: true, payload: {
    ruleName, priority, attributeType, attributeValues, smartCodeInputMode, projectNameInputMode,
    leadStatuses: attributeType === '线索状态' ? [] : checkedValues('precallLeadStatus'),
    carSeries: checkedValues('precallCarSeries'), precallLine,
    workTime: { days, slots: orderedSlots }, workTimePriority, workTimeSkillGroup, offWorkPriority, offWorkSkillGroup,
    systemStatus: valueOf('precallStatus') || '启用'
  } };
}

function saveStrategyConfiguratorRow() {
  const { key, id } = strategyConfiguratorEditing;
  const def = getStrategyConfiguratorDef(key);
  const result = collectStrategyConfiguratorFormValue(def);
  if (!result.ok) { showToast(result.message, false); return; }
  const now = '2026-07-08 10:00:00 操作人：管理员';
  const payload = { ...result.payload, updatedAt: now };
  if (id) {
    const index = strategyConfiguratorData[key].findIndex(row => row.id === id);
    if (index > -1) strategyConfiguratorData[key][index] = { ...strategyConfiguratorData[key][index], ...payload };
    showToast('编辑成功', true);
  } else {
    const nextId = Math.max(1000, ...strategyConfiguratorData[key].map(row => Number(row.id) || 0)) + 1;
    if (!Object.prototype.hasOwnProperty.call(payload, 'sortOrder')) {
      payload.sortOrder = Math.max(0, ...strategyConfiguratorData[key].map(row => Number(row.sortOrder) || 0)) + 1;
    }
    strategyConfiguratorData[key].push({ id: nextId, createdAt: now, systemStatus: key === 'precallTask' ? '启用' : undefined, ...payload });
    showToast('新增成功', true);
  }
  closeModal('leadDispatchRuleModal');
  renderStrategyConfiguratorPage(key);
}

function deleteStrategyConfiguratorRow(key, id) {
  const def = getStrategyConfiguratorDef(key);
  const message = ['excellentProject', 'excellentSc', 'precallTask'].includes(key) ? '请检查信息是否正确' : `确认删除${def.title}这条配置？`;
  if (!confirm(message)) return;
  strategyConfiguratorData[key] = strategyConfiguratorData[key].filter(row => row.id !== id);
  renderStrategyConfiguratorPage(key);
  showToast('删除成功', true);
}

function toggleStrategyConfiguratorStatus(key, id) {
  const row = strategyConfiguratorData[key].find(item => item.id === id);
  if (!row) return;
  const nextStatus = row.systemStatus === '启用' ? '停用' : '启用';
  if (!confirm(`确认${nextStatus}配置「${row.ruleName || row.taskGroupName}」？`)) return;
  row.systemStatus = nextStatus;
  row.updatedAt = '2026-07-08 10:00:00 操作人：管理员';
  renderStrategyConfiguratorPage(key);
  showToast(`${nextStatus}成功`, true);
}

function openStrategyConfiguratorQuickEdit(key, id, field) {
  const row = strategyConfiguratorData[key].find(item => item.id === id);
  const def = getStrategyConfiguratorDef(key);
  const column = def.columns.find(item => item.field === field) || {};
  const formField = def.form.find(item => item.field === field) || {};
  const min = formField.allowZero ? 0 : 1;
  const integerAttrs = getNonNegativeIntegerInputAttrs(key, field);
  strategyConfiguratorQuickEdit = { key, id, field };
  document.getElementById('leadDispatchRuleModalTitle').textContent = '确认操作';
  document.getElementById('leadDispatchRuleModalBody').innerHTML = `<div class="dispatch-rule-form"><section class="dispatch-form-section"><div class="dispatch-form-grid"><div class="form-group"><div class="form-label">${column.label || '配置值'} <span class="required">*</span></div><input class="form-input" id="strategyConfiguratorQuickValue" type="number" min="${min}"${integerAttrs} value="${escapeAttr(row?.[field] ?? '')}" /></div></div></section></div>`;
  document.getElementById('leadDispatchRuleModalFooter').innerHTML = `<button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">取消</button><button class="btn-save" type="button" onclick="saveStrategyConfiguratorQuickEdit()">确定</button>`;
  document.getElementById('leadDispatchRuleModal').classList.add('show');
}

function saveStrategyConfiguratorQuickEdit() {
  const { key, id, field } = strategyConfiguratorQuickEdit;
  const def = getStrategyConfiguratorDef(key);
  const formField = def.form.find(item => item.field === field) || {};
  const min = formField.allowZero ? 0 : 1;
  const rawValue = document.getElementById('strategyConfiguratorQuickValue')?.value.trim() || '';
  const value = Number(rawValue);
  if (!rawValue || Number.isNaN(value) || value < min || (isManualUnconvertedNonNegativeIntegerField(key, field) && !Number.isInteger(value))) { showToast(min === 0 ? '请输入有效非负整数' : '请输入有效正整数', false); return; }
  const row = strategyConfiguratorData[key].find(item => item.id === id);
  if (row) {
    row[field] = value;
    row.updatedAt = '2026-07-08 10:00:00 操作人：管理员';
  }
  closeModal('leadDispatchRuleModal');
  renderStrategyConfiguratorTable(key);
  showToast('更新成功', true);
}

function exportStrategyConfigurator(key) {
  if (key === 'precallTask') {
    exportPrecallTask();
    return;
  }
  showToast(`${getStrategyConfiguratorDef(key).title}已按当前条件导出为 Excel`, true);
}

function openStrategyConfiguratorImport(key) {
  if (key === 'precallTask') {
    openPrecallTaskImportWizard();
    return;
  }
  const def = getStrategyConfiguratorDef(key);
  document.getElementById('leadDispatchRuleModalTitle').textContent = `${def.title}导入`;
  document.getElementById('leadDispatchRuleModalBody').innerHTML = `
    <div class="assignment-import-body">
      <div class="assignment-import-upload">
        <input id="strategyConfiguratorImportFile" type="file" accept=".xls,.xlsx" />
        <div class="assignment-import-title">上传 Excel 文件</div>
        <div class="assignment-import-desc">仅支持 .xls / .xlsx，导入时将校验必填列、重复数据和空数据。</div>
      </div>
      <div class="policy-rule-note"><strong>导入规则：</strong>缺省值和重复数据不更新；全部为空时不做更新；优秀大项目/优秀SC按覆盖更新处理。</div>
    </div>
  `;
  document.getElementById('leadDispatchRuleModalFooter').innerHTML = `<button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">取消</button><button class="btn-save" type="button" onclick="completeStrategyConfiguratorImport('${key}')">开始导入</button>`;
  document.getElementById('leadDispatchRuleModal').classList.add('show');
}

function completeStrategyConfiguratorImport(key) {
  const file = document.getElementById('strategyConfiguratorImportFile')?.files?.[0];
  if (!file) { showToast('请选择 Excel 文件', false); return; }
  if (!/\.(xls|xlsx)$/i.test(file.name)) { showToast('仅支持 .xls / .xlsx 文件', false); return; }
  closeModal('leadDispatchRuleModal');
  renderStrategyConfiguratorPage(key);
  showToast('导入完成：成功 2 条，失败 0 条', true);
}

function renderExcellentScForm(row = {}, readonly = false) {
  const selectedSmartCodes = row.smartCode 
    ? String(row.smartCode).split(/[、,，\s;；]/).map(item => item.trim()).filter(Boolean) 
    : [];
  const selectedCarSeries = Array.isArray(row.carSeries) ? row.carSeries : (row.carSeries ? [row.carSeries] : []);
  const smartCodeInputMode = row.smartCodeInputMode === 'manual' ? 'manual' : 'picker';
  const disabled = readonly ? 'disabled' : '';

  return `
    <div class="dispatch-rule-form strategy-configurator-form strategy-configurator-form-excellentSc">
      <section class="dispatch-form-section">
        <div class="dispatch-section-title">基础信息</div>
        <div class="dispatch-form-grid">
          <div class="form-group">
            <div class="form-label">策略名称 <span class="required">*</span></div>
            <input class="form-input" type="text" id="excellentScRuleName" placeholder="请输入策略名称" ${disabled} value="${escapeHtml(row.ruleName || '')}" />
          </div>

          <div class="form-group">
            <div class="form-label">状态 <span class="required">*</span></div>
            <select class="form-input" id="excellentScStatus" ${disabled}>
              <option value="启用" ${row.status === '启用' || !row.status ? 'selected' : ''}>启用</option>
              <option value="停用" ${row.status === '停用' ? 'selected' : ''}>停用</option>
            </select>
          </div>
        </div>
      </section>

      <section class="dispatch-form-section">
        <div class="dispatch-section-title">匹配条件</div>
        <div class="dispatch-form-grid">
          <div class="form-group wide">
            <div class="form-label">SmartCode <span class="required">*</span></div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
              <div class="smart-code-input-mode" style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                <div class="form-label" style="font-weight: normal; font-size: 13px; color: #64748b; margin-bottom: 0;">录入方式</div>
                <div class="series-mode-toggle" style="margin-top: 0; margin-bottom: 0;">
                  <button class="duration-tab ${smartCodeInputMode === 'picker' ? 'active' : ''}" type="button" id="excellentScSmartCodePickerMode" ${disabled} onclick="switchExcellentScSmartCodeInputMode('picker')">下拉勾选</button>
                  <button class="duration-tab ${smartCodeInputMode === 'manual' ? 'active' : ''}" type="button" id="excellentScSmartCodeManualMode" ${disabled} onclick="switchExcellentScSmartCodeInputMode('manual')">手动输入</button>
                </div>
              </div>
              
              <div id="excellentScSmartCodePickerInputPanel" style="${smartCodeInputMode === 'manual' ? 'display:none' : ''}">
                <div class="tag-picker project-name-picker">
                  <button class="tag-picker-trigger placeholder" id="excellentScSmartCodeTrigger" type="button" ${disabled} onclick="toggleExcellentScSmartCodePicker()">请选择SmartCode</button>
                  <div class="tag-picker-panel" id="excellentScSmartCodePanel">
                    <div class="tag-picker-toolbar">
                      <span id="excellentScSmartCodeSelectedCount">已选 ${selectedSmartCodes.length} / ${assignmentSmartCodeOptions.length}</span>
                      ${readonly ? '' : `
                        <div class="tag-picker-actions">
                          <button class="tag-picker-action" type="button" onclick="selectAllExcellentScSmartCodeOptions()">全选</button>
                          <button class="tag-picker-action" type="button" onclick="clearExcellentScSmartCodeOptions()">清空</button>
                        </div>
                      `}
                    </div>
                    <div class="tag-picker-search">
                      <input type="search" id="excellentScSmartCodeSearchInput" placeholder="搜索SmartCode" ${disabled} oninput="filterExcellentScSmartCodeOptions(this.value)" />
                    </div>
                    <div class="tag-picker-list" id="excellentScSmartCodeList">
                      ${assignmentSmartCodeOptions.map(item => `
                        <label class="tag-option ${selectedSmartCodes.includes(item) ? 'selected' : ''}" data-project-option="${escapeAttr(item)}">
                          <input type="checkbox" name="excellentScSmartCodeCheckbox" value="${item}" ${selectedSmartCodes.includes(item) ? 'checked' : ''} ${disabled} onchange="toggleExcellentScSmartCodeOption(this)" />
                          ${item}
                        </label>
                      `).join('')}
                    </div>
                    <div class="tag-picker-empty" id="excellentScSmartCodeSearchEmpty">暂无匹配的SmartCode</div>
                  </div>
                </div>
              </div>
              
              <div id="excellentScSmartCodeManualInputPanel" style="${smartCodeInputMode === 'manual' ? '' : 'display:none'}">
                <textarea class="form-input assignment-manual-textarea" id="excellentScSmartCodeManualInput" rows="4" style="margin-top: 0;" placeholder="可一次粘贴多个 SmartCode，支持换行、逗号、分号或空格分隔" ${disabled}>${escapeHtml(selectedSmartCodes.join('\n'))}</textarea>
                <div class="series-form-hint" style="margin-bottom: 0;">保存时会自动拆分并去重；不在下拉选项中的 SmartCode 也可直接录入。</div>
              </div>
            </div>
          </div>


          <div class="form-group wide">
            <div class="form-label">意向车系</div>
            <div class="series-select-panel">
              <div class="series-series-grid">
                ${(configuratorOptions.carSeries || []).map(item => `
                  <label class="series-series-option">
                    <input type="checkbox" name="excellentScCarSeriesCheckbox" value="${item}" ${selectedCarSeries.includes(item) ? 'checked' : ''} ${disabled} />
                    <span>${item}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="series-form-hint">选择后白名单将与指定意向车系组合判断；不选择表示不限意向车系</div>
          </div>
        </div>
      </section>
    </div>
  `;
}

let excellentScSmartCodeInputModeState = 'picker';

function switchExcellentScSmartCodeInputMode(mode) {
  excellentScSmartCodeInputModeState = mode === 'manual' ? 'manual' : 'picker';
  const isManual = excellentScSmartCodeInputModeState === 'manual';
  syncPickerManualInput({ mode: excellentScSmartCodeInputModeState, pickerSelector: 'input[name="excellentScSmartCodeCheckbox"]', manualInputId: 'excellentScSmartCodeManualInput', onSync: updateExcellentScSmartCodeSelectedCount });
  document.getElementById('excellentScSmartCodePickerMode')?.classList.toggle('active', !isManual);
  document.getElementById('excellentScSmartCodeManualMode')?.classList.toggle('active', isManual);
  const picker = document.getElementById('excellentScSmartCodePickerInputPanel');
  const manual = document.getElementById('excellentScSmartCodeManualInputPanel');
  if (picker) picker.style.display = isManual ? 'none' : '';
  if (manual) manual.style.display = isManual ? '' : 'none';
}

function toggleExcellentScSmartCodePicker() {
  document.querySelectorAll('.tag-picker-panel').forEach(panel => {
    if (panel.id !== 'excellentScSmartCodePanel') panel.classList.remove('show');
  });
  document.getElementById('excellentScSmartCodePanel')?.classList.toggle('show');
}

function filterExcellentScSmartCodeOptions(keyword = '') {
  const input = document.getElementById('excellentScSmartCodeSearchInput');
  const normalized = String(keyword || input?.value || '').trim().toLowerCase();
  let visibleCount = 0;
  document.querySelectorAll('#excellentScSmartCodeList .tag-option').forEach(label => {
    const text = (label.dataset.projectOption || label.textContent || '').toLowerCase();
    const visible = !normalized || text.includes(normalized);
    label.style.display = visible ? '' : 'none';
    if (visible) visibleCount += 1;
  });
  const empty = document.getElementById('excellentScSmartCodeSearchEmpty');
  if (empty) empty.style.display = visibleCount ? 'none' : 'block';
  updateExcellentScSmartCodeSelectedCount();
}

function selectAllExcellentScSmartCodeOptions() {
  document.querySelectorAll('#excellentScSmartCodeList .tag-option').forEach(label => {
    if (label.style.display === 'none') return;
    const input = label.querySelector('input[name="excellentScSmartCodeCheckbox"]');
    if (input) {
      input.checked = true;
      label.classList.add('selected');
    }
  });
  updateExcellentScSmartCodeSelectedCount();
}

function clearExcellentScSmartCodeOptions() {
  document.querySelectorAll('input[name="excellentScSmartCodeCheckbox"]').forEach(input => {
    input.checked = false;
    input.closest('.tag-option')?.classList.remove('selected');
  });
  filterExcellentScSmartCodeOptions();
}

function toggleExcellentScSmartCodeOption(input) {
  input.closest('.tag-option')?.classList.toggle('selected', input.checked);
  updateExcellentScSmartCodeSelectedCount();
}

function updateExcellentScSmartCodeSelectedCount() {
  const selected = Array.from(document.querySelectorAll('input[name="excellentScSmartCodeCheckbox"]:checked')).map(input => input.value);
  const countSpan = document.getElementById('excellentScSmartCodeSelectedCount');
  if (countSpan) countSpan.textContent = `已选 ${selected.length} / ${assignmentSmartCodeOptions.length}`;
  const trigger = document.getElementById('excellentScSmartCodeTrigger');
  if (trigger) {
    if (selected.length) {
      trigger.textContent = selected.join('、');
      trigger.classList.remove('placeholder');
    } else {
      trigger.textContent = '请选择SmartCode';
      trigger.classList.add('placeholder');
    }
  }
}

document.addEventListener('click', function(event) {
  if (event.target.closest('.tag-picker')) return;
  document.getElementById('excellentScSmartCodePanel')?.classList.remove('show');
  document.getElementById('excellentProjectPanel')?.classList.remove('show');
  document.getElementById('excellentChannelPanel')?.classList.remove('show');
});

function collectExcellentScFormValue() {
  const ruleName = document.getElementById('excellentScRuleName')?.value?.trim() || '';
  const smartCodeInputMode = document.getElementById('excellentScSmartCodeManualMode')?.classList.contains('active') ? 'manual' : 'picker';
  let selectedValues = Array.from(document.querySelectorAll('input[name="excellentScSmartCodeCheckbox"]:checked')).map(input => input.value);
  if (smartCodeInputMode === 'manual') {
    const manualValue = document.getElementById('excellentScSmartCodeManualInput')?.value || '';
    selectedValues = [...new Set(manualValue.split(/[\s,，;；]+/).map(item => item.trim()).filter(Boolean))];
  }
  const relatedCarSeries = Array.from(document.querySelectorAll('input[name="excellentScCarSeriesCheckbox"]:checked')).map(input => input.value);
  const status = document.getElementById('excellentScStatus')?.value || '启用';
  
  if (!ruleName) return { ok: false, message: '请输入策略名称' };
  if (!selectedValues.length) return { ok: false, message: '请选择或录入SmartCode' };
  
  return {
    ok: true,
    payload: {
      ruleName: ruleName,
      smartCode: selectedValues.join('、'),
      carSeries: relatedCarSeries,
      smartCodeInputMode: smartCodeInputMode,
      status: status
    }
  };
}

function renderExcellentProjectForm(row = {}, readonly = false) {
  const selectedValues = row.scProjectName 
    ? String(row.scProjectName).split(/[、,，\s;；]/).map(item => item.trim()).filter(Boolean) 
    : [];
  const selectedCarSeries = Array.isArray(row.carSeries) ? row.carSeries : (row.carSeries ? [row.carSeries] : []);
  const inputMode = row.projectNameInputMode === 'manual' ? 'manual' : 'picker';
  const disabled = readonly ? 'disabled' : '';

  return `
    <div class="dispatch-rule-form strategy-configurator-form strategy-configurator-form-excellentProject">
      <section class="dispatch-form-section">
        <div class="dispatch-section-title">基础信息</div>
        <div class="dispatch-form-grid">
          <div class="form-group">
            <div class="form-label">策略名称 <span class="required">*</span></div>
            <input class="form-input" type="text" id="excellentProjectRuleName" placeholder="请输入策略名称" ${disabled} value="${escapeHtml(row.ruleName || '')}" />
          </div>

          <div class="form-group">
            <div class="form-label">状态 <span class="required">*</span></div>
            <select class="form-input" id="excellentProjectStatus" ${disabled}>
              <option value="启用" ${row.status === '启用' || !row.status ? 'selected' : ''}>启用</option>
              <option value="停用" ${row.status === '停用' ? 'selected' : ''}>停用</option>
            </select>
          </div>
        </div>
      </section>

      <section class="dispatch-form-section">
        <div class="dispatch-section-title">匹配条件</div>
        <div class="dispatch-form-grid">
          <div class="form-group wide">
            <div class="form-label">大项目名 <span class="required">*</span></div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
              <div class="smart-code-input-mode" style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                <div class="form-label" style="font-weight: normal; font-size: 13px; color: #64748b; margin-bottom: 0;">录入方式</div>
                <div class="series-mode-toggle" style="margin-top: 0; margin-bottom: 0;">
                  <button class="duration-tab ${inputMode === 'picker' ? 'active' : ''}" type="button" id="excellentProjectPickerMode" ${disabled} onclick="switchExcellentProjectInputMode('picker')">下拉勾选</button>
                  <button class="duration-tab ${inputMode === 'manual' ? 'active' : ''}" type="button" id="excellentProjectManualMode" ${disabled} onclick="switchExcellentProjectInputMode('manual')">手动输入</button>
                </div>
              </div>
              
              <div id="excellentProjectPickerInputPanel" style="${inputMode === 'manual' ? 'display:none' : ''}">
                <div class="tag-picker project-name-picker">
                  <button class="tag-picker-trigger placeholder" id="excellentProjectTrigger" type="button" ${disabled} onclick="toggleExcellentProjectPicker()">请选择大项目名</button>
                  <div class="tag-picker-panel" id="excellentProjectPanel">
                    <div class="tag-picker-toolbar">
                      <span id="excellentProjectSelectedCount">已选 ${selectedValues.length} / ${projectNameOptions.length}</span>
                      ${readonly ? '' : `
                        <div class="tag-picker-actions">
                          <button class="tag-picker-action" type="button" onclick="selectAllExcellentProjectOptions()">全选</button>
                          <button class="tag-picker-action" type="button" onclick="clearExcellentProjectOptions()">清空</button>
                        </div>
                      `}
                    </div>
                    <div class="tag-picker-search">
                      <input type="search" id="excellentProjectSearchInput" placeholder="搜索大项目名" ${disabled} oninput="filterExcellentProjectOptions(this.value)" />
                    </div>
                    <div class="tag-picker-list" id="excellentProjectList">
                      ${projectNameOptions.map(item => `
                        <label class="tag-option ${selectedValues.includes(item) ? 'selected' : ''}" data-project-option="${escapeAttr(item)}">
                          <input type="checkbox" name="excellentProjectCheckbox" value="${item}" ${selectedValues.includes(item) ? 'checked' : ''} ${disabled} onchange="toggleExcellentProjectOption(this)" />
                          ${item}
                        </label>
                      `).join('')}
                    </div>
                    <div class="tag-picker-empty" id="excellentProjectSearchEmpty">暂无匹配的大项目名</div>
                  </div>
                </div>
              </div>
              
              <div id="excellentProjectManualInputPanel" style="${inputMode === 'manual' ? '' : 'display:none'}">
                <textarea class="form-input assignment-manual-textarea" id="excellentProjectManualInput" rows="4" style="margin-top: 0;" placeholder="可一次粘贴多个大项目名，支持换行、逗号、分号或空格分隔" ${disabled}>${escapeHtml(selectedValues.join('\n'))}</textarea>
                <div class="series-form-hint" style="margin-bottom: 0;">保存时会自动拆分并去重；不在下拉选项中的项目名也可直接录入。</div>
              </div>
            </div>
          </div>


          <div class="form-group wide">
            <div class="form-label">意向车系</div>
            <div class="series-select-panel">
              <div class="series-series-grid">
                ${(configuratorOptions.carSeries || []).map(item => `
                  <label class="series-series-option">
                    <input type="checkbox" name="excellentProjectCarSeriesCheckbox" value="${item}" ${selectedCarSeries.includes(item) ? 'checked' : ''} ${disabled} />
                    <span>${item}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="series-form-hint">选择后白名单将与指定意向车系组合判断；不选择表示不限意向车系</div>
          </div>
        </div>
      </section>
    </div>
  `;
}

let excellentProjectInputModeState = 'picker';

function switchExcellentProjectInputMode(mode) {
  excellentProjectInputModeState = mode === 'manual' ? 'manual' : 'picker';
  const isManual = excellentProjectInputModeState === 'manual';
  syncPickerManualInput({ mode: excellentProjectInputModeState, pickerSelector: 'input[name="excellentProjectCheckbox"]', manualInputId: 'excellentProjectManualInput', onSync: updateExcellentProjectSelectedCount });
  document.getElementById('excellentProjectPickerMode')?.classList.toggle('active', !isManual);
  document.getElementById('excellentProjectManualMode')?.classList.toggle('active', isManual);
  const picker = document.getElementById('excellentProjectPickerInputPanel');
  const manual = document.getElementById('excellentProjectManualInputPanel');
  if (picker) picker.style.display = isManual ? 'none' : '';
  if (manual) manual.style.display = isManual ? '' : 'none';
}

function toggleExcellentProjectPicker() {
  document.querySelectorAll('.tag-picker-panel').forEach(panel => {
    if (panel.id !== 'excellentProjectPanel') panel.classList.remove('show');
  });
  document.getElementById('excellentProjectPanel')?.classList.toggle('show');
}

function filterExcellentProjectOptions(keyword = '') {
  const input = document.getElementById('excellentProjectSearchInput');
  const normalized = String(keyword || input?.value || '').trim().toLowerCase();
  let visibleCount = 0;
  document.querySelectorAll('#excellentProjectList .tag-option').forEach(label => {
    const text = (label.dataset.projectOption || label.textContent || '').toLowerCase();
    const visible = !normalized || text.includes(normalized);
    label.style.display = visible ? '' : 'none';
    if (visible) visibleCount += 1;
  });
  const empty = document.getElementById('excellentProjectSearchEmpty');
  if (empty) empty.style.display = visibleCount ? 'none' : 'block';
  updateExcellentProjectSelectedCount();
}

function selectAllExcellentProjectOptions() {
  document.querySelectorAll('#excellentProjectList .tag-option').forEach(label => {
    if (label.style.display === 'none') return;
    const input = label.querySelector('input[name="excellentProjectCheckbox"]');
    if (input) {
      input.checked = true;
      label.classList.add('selected');
    }
  });
  updateExcellentProjectSelectedCount();
}

function clearExcellentProjectOptions() {
  document.querySelectorAll('input[name="excellentProjectCheckbox"]').forEach(input => {
    input.checked = false;
    input.closest('.tag-option')?.classList.remove('selected');
  });
  filterExcellentProjectOptions();
}

function toggleExcellentProjectOption(input) {
  input.closest('.tag-option')?.classList.toggle('selected', input.checked);
  updateExcellentProjectSelectedCount();
}

function updateExcellentProjectSelectedCount() {
  const selected = Array.from(document.querySelectorAll('input[name="excellentProjectCheckbox"]:checked')).map(input => input.value);
  const countSpan = document.getElementById('excellentProjectSelectedCount');
  if (countSpan) countSpan.textContent = `已选 ${selected.length} / ${projectNameOptions.length}`;
  const trigger = document.getElementById('excellentProjectTrigger');
  if (trigger) {
    if (selected.length) {
      trigger.textContent = selected.join('、');
      trigger.classList.remove('placeholder');
    } else {
      trigger.textContent = '请选择大项目名';
      trigger.classList.add('placeholder');
    }
  }
}

function collectExcellentProjectFormValue() {
  const ruleName = document.getElementById('excellentProjectRuleName')?.value?.trim() || '';
  const inputMode = document.getElementById('excellentProjectManualMode')?.classList.contains('active') ? 'manual' : 'picker';
  let selectedValues = Array.from(document.querySelectorAll('input[name="excellentProjectCheckbox"]:checked')).map(input => input.value);
  if (inputMode === 'manual') {
    const manualValue = document.getElementById('excellentProjectManualInput')?.value || '';
    selectedValues = [...new Set(manualValue.split(/[\s,，;；]+/).map(item => item.trim()).filter(Boolean))];
  }
  const relatedCarSeries = Array.from(document.querySelectorAll('input[name="excellentProjectCarSeriesCheckbox"]:checked')).map(input => input.value);
  const status = document.getElementById('excellentProjectStatus')?.value || '启用';
  
  if (!ruleName) return { ok: false, message: '请输入策略名称' };
  if (!selectedValues.length) return { ok: false, message: '请选择或录入大项目名' };
  
  return {
    ok: true,
    payload: {
      ruleName: ruleName,
      scProjectName: selectedValues.join('、'),
      carSeries: relatedCarSeries,
      projectNameInputMode: inputMode,
      status: status
    }
  };
}

function renderExcellentChannelForm(row = {}, readonly = false) {
  const selectedValues = row.scChannel 
    ? String(row.scChannel).split(/[、,，\s;；]/).map(item => item.trim()).filter(Boolean) 
    : [];
  const selectedCarSeries = Array.isArray(row.carSeries) ? row.carSeries : (row.carSeries ? [row.carSeries] : []);
  const inputMode = row.channelInputMode === 'manual' ? 'manual' : 'picker';
  const disabled = readonly ? 'disabled' : '';

  return `
    <div class="dispatch-rule-form strategy-configurator-form strategy-configurator-form-excellentChannel">
      <section class="dispatch-form-section">
        <div class="dispatch-section-title">基础信息</div>
        <div class="dispatch-form-grid">
          <div class="form-group">
            <div class="form-label">策略名称 <span class="required">*</span></div>
            <input class="form-input" type="text" id="excellentChannelRuleName" placeholder="请输入策略名称" ${disabled} value="${escapeHtml(row.ruleName || '')}" />
          </div>

          <div class="form-group">
            <div class="form-label">状态 <span class="required">*</span></div>
            <select class="form-input" id="excellentChannelStatus" ${disabled}>
              <option value="启用" ${row.status === '启用' || !row.status ? 'selected' : ''}>启用</option>
              <option value="停用" ${row.status === '停用' ? 'selected' : ''}>停用</option>
            </select>
          </div>
        </div>
      </section>

      <section class="dispatch-form-section">
        <div class="dispatch-section-title">匹配条件</div>
        <div class="dispatch-form-grid">
          <div class="form-group wide">
            <div class="form-label">渠道编码 <span class="required">*</span></div>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
              <div class="smart-code-input-mode" style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                <div class="form-label" style="font-weight: normal; font-size: 13px; color: #64748b; margin-bottom: 0;">录入方式</div>
                <div class="series-mode-toggle" style="margin-top: 0; margin-bottom: 0;">
                  <button class="duration-tab ${inputMode === 'picker' ? 'active' : ''}" type="button" id="excellentChannelPickerMode" ${disabled} onclick="switchExcellentChannelInputMode('picker')">下拉勾选</button>
                  <button class="duration-tab ${inputMode === 'manual' ? 'active' : ''}" type="button" id="excellentChannelManualMode" ${disabled} onclick="switchExcellentChannelInputMode('manual')">手动输入</button>
                </div>
              </div>
              
              <div id="excellentChannelPickerInputPanel" style="${inputMode === 'manual' ? 'display:none' : ''}">
                <div class="tag-picker project-name-picker">
                  <button class="tag-picker-trigger placeholder" id="excellentChannelTrigger" type="button" ${disabled} onclick="toggleExcellentChannelPicker()">请选择渠道编码</button>
                  <div class="tag-picker-panel" id="excellentChannelPanel">
                    <div class="tag-picker-toolbar">
                      <span id="excellentChannelSelectedCount">已选 ${selectedValues.length} / ${assignmentChannelCodeOptions.length}</span>
                      ${readonly ? '' : `
                        <div class="tag-picker-actions">
                          <button class="tag-picker-action" type="button" onclick="selectAllExcellentChannelOptions()">全选</button>
                          <button class="tag-picker-action" type="button" onclick="clearExcellentChannelOptions()">清空</button>
                        </div>
                      `}
                    </div>
                    <div class="tag-picker-search">
                      <input type="search" id="excellentChannelSearchInput" placeholder="搜索渠道编码" ${disabled} oninput="filterExcellentChannelOptions(this.value)" />
                    </div>
                    <div class="tag-picker-list" id="excellentChannelList">
                      ${assignmentChannelCodeOptions.map(item => `
                        <label class="tag-option ${selectedValues.includes(item) ? 'selected' : ''}" data-project-option="${escapeAttr(item)}">
                          <input type="checkbox" name="excellentChannelCheckbox" value="${item}" ${selectedValues.includes(item) ? 'checked' : ''} ${disabled} onchange="toggleExcellentChannelOption(this)" />
                          ${item}
                        </label>
                      `).join('')}
                    </div>
                    <div class="tag-picker-empty" id="excellentChannelSearchEmpty">暂无匹配的渠道编码</div>
                  </div>
                </div>
              </div>
              
              <div id="excellentChannelManualInputPanel" style="${inputMode === 'manual' ? '' : 'display:none'}">
                <textarea class="form-input assignment-manual-textarea" id="excellentChannelManualInput" rows="4" style="margin-top: 0;" placeholder="可一次粘贴多个渠道编码，支持换行、逗号、分号或空格分隔" ${disabled}>${escapeHtml(selectedValues.join('\n'))}</textarea>
                <div class="series-form-hint" style="margin-bottom: 0;">保存时会自动拆分并去重；不在下拉选项中的渠道编码也可直接录入。</div>
              </div>
            </div>
          </div>


          <div class="form-group wide">
            <div class="form-label">意向车系</div>
            <div class="series-select-panel">
              <div class="series-series-grid">
                ${(configuratorOptions.carSeries || []).map(item => `
                  <label class="series-series-option">
                    <input type="checkbox" name="excellentChannelCarSeriesCheckbox" value="${item}" ${selectedCarSeries.includes(item) ? 'checked' : ''} ${disabled} />
                    <span>${item}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="series-form-hint">选择后白名单将与指定意向车系组合判断；不选择表示不限意向车系</div>
          </div>
        </div>
      </section>
    </div>
  `;
}

let excellentChannelInputModeState = 'picker';

function switchExcellentChannelInputMode(mode) {
  excellentChannelInputModeState = mode === 'manual' ? 'manual' : 'picker';
  const isManual = excellentChannelInputModeState === 'manual';
  syncPickerManualInput({ mode: excellentChannelInputModeState, pickerSelector: 'input[name="excellentChannelCheckbox"]', manualInputId: 'excellentChannelManualInput', onSync: updateExcellentChannelSelectedCount });
  document.getElementById('excellentChannelPickerMode')?.classList.toggle('active', !isManual);
  document.getElementById('excellentChannelManualMode')?.classList.toggle('active', isManual);
  const picker = document.getElementById('excellentChannelPickerInputPanel');
  const manual = document.getElementById('excellentChannelManualInputPanel');
  if (picker) picker.style.display = isManual ? 'none' : '';
  if (manual) manual.style.display = isManual ? '' : 'none';
}

function toggleExcellentChannelPicker() {
  document.querySelectorAll('.tag-picker-panel').forEach(panel => {
    if (panel.id !== 'excellentChannelPanel') panel.classList.remove('show');
  });
  document.getElementById('excellentChannelPanel')?.classList.toggle('show');
}

function filterExcellentChannelOptions(keyword = '') {
  const input = document.getElementById('excellentChannelSearchInput');
  const normalized = String(keyword || input?.value || '').trim().toLowerCase();
  let visibleCount = 0;
  document.querySelectorAll('#excellentChannelList .tag-option').forEach(label => {
    const text = (label.dataset.projectOption || label.textContent || '').toLowerCase();
    const visible = !normalized || text.includes(normalized);
    label.style.display = visible ? '' : 'none';
    if (visible) visibleCount += 1;
  });
  const empty = document.getElementById('excellentChannelSearchEmpty');
  if (empty) empty.style.display = visibleCount ? 'none' : 'block';
  updateExcellentChannelSelectedCount();
}

function selectAllExcellentChannelOptions() {
  document.querySelectorAll('#excellentChannelList .tag-option').forEach(label => {
    if (label.style.display === 'none') return;
    const input = label.querySelector('input[name="excellentChannelCheckbox"]');
    if (input) {
      input.checked = true;
      label.classList.add('selected');
    }
  });
  updateExcellentChannelSelectedCount();
}

function clearExcellentChannelOptions() {
  document.querySelectorAll('input[name="excellentChannelCheckbox"]').forEach(input => {
    input.checked = false;
    input.closest('.tag-option')?.classList.remove('selected');
  });
  filterExcellentChannelOptions();
}

function toggleExcellentChannelOption(input) {
  input.closest('.tag-option')?.classList.toggle('selected', input.checked);
  updateExcellentChannelSelectedCount();
}

function updateExcellentChannelSelectedCount() {
  const selected = Array.from(document.querySelectorAll('input[name="excellentChannelCheckbox"]:checked')).map(input => input.value);
  const countSpan = document.getElementById('excellentChannelSelectedCount');
  if (countSpan) countSpan.textContent = `已选 ${selected.length} / ${assignmentChannelCodeOptions.length}`;
  const trigger = document.getElementById('excellentChannelTrigger');
  if (trigger) {
    if (selected.length) {
      trigger.textContent = selected.join('、');
      trigger.classList.remove('placeholder');
    } else {
      trigger.textContent = '请选择渠道编码';
      trigger.classList.add('placeholder');
    }
  }
}

function collectExcellentChannelFormValue() {
  const ruleName = document.getElementById('excellentChannelRuleName')?.value?.trim() || '';
  const inputMode = document.getElementById('excellentChannelManualMode')?.classList.contains('active') ? 'manual' : 'picker';
  let selectedValues = Array.from(document.querySelectorAll('input[name="excellentChannelCheckbox"]:checked')).map(input => input.value);
  if (inputMode === 'manual') {
    const manualValue = document.getElementById('excellentChannelManualInput')?.value || '';
    selectedValues = [...new Set(manualValue.split(/[\s,，;；]+/).map(item => item.trim()).filter(Boolean))];
  }
  const relatedCarSeries = Array.from(document.querySelectorAll('input[name="excellentChannelCarSeriesCheckbox"]:checked')).map(input => input.value);
  const status = document.getElementById('excellentChannelStatus')?.value || '启用';
  
  if (!ruleName) return { ok: false, message: '请输入策略名称' };
  if (!selectedValues.length) return { ok: false, message: '请选择或录入渠道编码' };
  
  return {
    ok: true,
    payload: {
      ruleName: ruleName,
      scChannel: selectedValues.join('、'),
      carSeries: relatedCarSeries,
      channelInputMode: inputMode,
      status: status
    }
  };
}

function renderGenericTagPicker({ idPrefix, inputName, options = [], selected = [], placeholder = '请选择', onchange = '', readonly = false, width = '100%', isSearch = false }) {
  const safeSelected = selected || [];
  const disabledAttr = readonly ? 'disabled' : '';
  const onclickAttr = readonly ? '' : `onclick="toggleGenericTagPicker('${idPrefix}')"`;
  const triggerStyle = isSearch ? 'style="height: 34px; padding-top: 6px; padding-bottom: 6px; min-height: 34px;"' : '';
  return `
    <div class="tag-picker dispatch-tag-picker ${readonly ? 'readonly' : ''}" style="display: inline-block; vertical-align: middle; width: ${width};">
      <button class="tag-picker-trigger placeholder" id="${idPrefix}Trigger" data-placeholder="${escapeAttr(placeholder)}" type="button" ${triggerStyle} ${onclickAttr}>${placeholder}</button>
      <div class="tag-picker-panel" id="${idPrefix}Panel">
        <div class="tag-picker-toolbar">
          <span id="${idPrefix}Count">已选 0 / ${options.length}</span>
          ${readonly ? '' : `
          <div class="tag-picker-actions">
            <button class="tag-picker-action" type="button" onclick="selectAllGenericTagPicker('${idPrefix}', '${onchange}')">全选</button>
            <button class="tag-picker-action" type="button" onclick="clearGenericTagPicker('${idPrefix}', '${onchange}')">清空</button>
          </div>
          `}
        </div>
        ${readonly ? '' : (isSearch ? `
        <div class="tag-picker-search" style="padding: 6px 10px; border-bottom: 1px solid #e2e8f0;">
          <input type="search" placeholder="搜索${escapeAttr(placeholder)}" style="width: 100%; height: 32px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 13px;" oninput="filterGenericTagPickerOptions('${idPrefix}', this.value)" />
        </div>
        ` : '')}
        <div class="tag-picker-list" style="max-height: 180px; overflow-y: auto;">
          ${options.map(type => `
            <label class="tag-option" style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 13px;">
              <input type="checkbox" name="${inputName}" value="${escapeAttr(type)}" ${safeSelected.includes(type) ? 'checked' : ''} ${disabledAttr} onchange="toggleGenericTagOption('${idPrefix}', this, '${onchange}')" />
              <span>${escapeHtml(type)}</span>
            </label>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function getGenericTagPickerInputs(idPrefix) {
  return [...document.querySelectorAll(`#${idPrefix}Panel .tag-option input`)];
}

function toggleGenericTagPicker(idPrefix) {
  const panelId = `${idPrefix}Panel`;
  toggleExclusivePanel(panelId);
  updateGenericTagPickerSummary(idPrefix);
}

function updateGenericTagPickerSummary(idPrefix) {
  updatePickerSummaryFromInputs({
    inputs: getGenericTagPickerInputs(idPrefix),
    triggerId: `${idPrefix}Trigger`,
    countId: `${idPrefix}Count`,
    placeholder: document.getElementById(`${idPrefix}Trigger`)?.getAttribute('data-placeholder') || '请选择'
  });
}

function toggleGenericTagOption(idPrefix, input, onchange) {
  togglePickerOption(input, () => {
    updateGenericTagPickerSummary(idPrefix);
    if (onchange) {
      try {
        const fn = new Function(onchange);
        fn();
      } catch(e) { console.error(e); }
    }
  });
}

function selectAllGenericTagPicker(idPrefix, onchange) {
  setPickerInputsChecked(getGenericTagPickerInputs(idPrefix), true, () => {
    updateGenericTagPickerSummary(idPrefix);
    if (onchange) {
      try {
        const fn = new Function(onchange);
        fn();
      } catch(e) { console.error(e); }
    }
  });
}

function clearGenericTagPicker(idPrefix, onchange) {
  setPickerInputsChecked(getGenericTagPickerInputs(idPrefix), false, () => {
    updateGenericTagPickerSummary(idPrefix);
    if (onchange) {
      try {
        const fn = new Function(onchange);
        fn();
      } catch(e) { console.error(e); }
    }
  });
}

function filterGenericTagPickerOptions(idPrefix, query) {
  const panelEl = document.getElementById(`${idPrefix}Panel`);
  if (!panelEl) return;
  const options = panelEl.querySelectorAll('.tag-option');
  const normalizedQuery = String(query).trim().toLowerCase();
  
  options.forEach(option => {
    const text = option.querySelector('span')?.textContent.toLowerCase() || '';
    if (!normalizedQuery || text.includes(normalizedQuery)) {
      option.style.display = 'flex';
    } else {
      option.style.display = 'none';
    }
  });
}

function getAmapProjectNameOptions(initialLeadStatuses = []) {
  const statuses = Array.isArray(initialLeadStatuses) ? initialLeadStatuses : [initialLeadStatuses];
  if (!statuses.length) return [...(configuratorOptions.projectName || [])];
  return [...new Set(statuses.flatMap(status => amapProjectNameCascade[status] || []))];
}

function syncAmapProjectNameOptions() {
  const statusInputs = getGenericTagPickerInputs('cfgForm_initialLeadStatus');
  const selectedStatuses = statusInputs.filter(input => input.checked).map(input => input.value);
  const options = getAmapProjectNameOptions(selectedStatuses);
  const isDisabled = false;
  const projectInputs = getGenericTagPickerInputs('cfgForm_projectName');
  const selectedProjects = projectInputs.filter(input => input.checked).map(input => input.value).filter(value => options.includes(value));
  const projectPanel = document.getElementById('cfgForm_projectNamePanel');
  const projectList = projectPanel?.querySelector('.tag-picker-list');
  const trigger = document.getElementById('cfgForm_projectNameTrigger');
  const manualInput = document.getElementById('cfgForm_projectNameManualInput');

  if (projectList) {
    projectList.innerHTML = options.map(option => `
      <label class="tag-option" style="display: flex; align-items: center; gap: 8px; padding: 6px 12px; font-size: 13px;">
        <input type="checkbox" name="cfgForm_projectNameValues" value="${escapeAttr(option)}" ${selectedProjects.includes(option) ? 'checked' : ''} onchange="toggleGenericTagOption('cfgForm_projectName', this, '')" />
        <span>${escapeHtml(option)}</span>
      </label>
    `).join('');
  }
  if (trigger) {
    trigger.disabled = isDisabled;
    trigger.setAttribute('data-placeholder', '请选择大项目名');
  }
  ['cfgForm_projectNamePickerMode', 'cfgForm_projectNameManualMode', 'cfgForm_projectNameAnd', 'cfgForm_projectNameOr'].forEach(id => {
    const element = document.getElementById(id);
    if (element) element.disabled = isDisabled;
  });
  if (manualInput) {
    manualInput.disabled = isDisabled;
    manualInput.placeholder = '可一次输入或粘贴多个大项目名，以换行、逗号或空格分隔';
  }
  if (isDisabled && projectPanel) projectPanel.classList.remove('show');
  updateGenericTagPickerSummary('cfgForm_projectName');
}

function switchReturnVisitMediaNameInputMode(mode) {
  const pickerTab = document.getElementById('cfgForm_mediaNamePickerMode');
  const manualTab = document.getElementById('cfgForm_mediaNameManualMode');
  const pickerPanel = document.getElementById('cfgForm_mediaNamePickerPanel');
  const manualPanel = document.getElementById('cfgForm_mediaNameManualPanel');
  syncPickerManualInput({ mode, pickerSelector: '#cfgForm_mediaNamePanel .tag-option input', manualInputId: 'cfgForm_mediaNameManualInput', onSync: () => updateGenericTagPickerSummary('cfgForm_mediaName') });
  
  if (mode === 'picker') {
    if (pickerTab) pickerTab.classList.add('active');
    if (manualTab) manualTab.classList.remove('active');
    if (pickerPanel) pickerPanel.style.display = '';
    if (manualPanel) manualPanel.style.display = 'none';
  } else {
    if (pickerTab) pickerTab.classList.remove('active');
    if (manualTab) manualTab.classList.add('active');
    if (pickerPanel) pickerPanel.style.display = 'none';
    if (manualPanel) manualPanel.style.display = '';
  }
}

function switchReturnVisitMediaNameLogic(logic) {
  const andBtn = document.getElementById('cfgForm_mediaNameAnd');
  const orBtn = document.getElementById('cfgForm_mediaNameOr');
  const desc = document.getElementById('cfgForm_mediaNameLogicDesc');
  if (logic === '且') {
    if (andBtn) andBtn.classList.add('active');
    if (orBtn) orBtn.classList.remove('active');
    if (desc) desc.textContent = '命中所有已选媒体名称才触发规则';
  } else {
    if (andBtn) andBtn.classList.remove('active');
    if (orBtn) orBtn.classList.add('active');
    if (desc) desc.textContent = '命中任意一个已选媒体名称即触发规则';
  }
}

function switchAmapProjectNameInputMode(mode) {
  const pickerTab = document.getElementById('cfgForm_projectNamePickerMode');
  const manualTab = document.getElementById('cfgForm_projectNameManualMode');
  const pickerPanel = document.getElementById('cfgForm_projectNamePickerPanel');
  const manualPanel = document.getElementById('cfgForm_projectNameManualPanel');
  syncPickerManualInput({ mode, pickerSelector: '#cfgForm_projectNamePanel .tag-option input', manualInputId: 'cfgForm_projectNameManualInput', onSync: () => updateGenericTagPickerSummary('cfgForm_projectName') });
  const useManual = mode === 'manual';
  if (pickerTab) pickerTab.classList.toggle('active', !useManual);
  if (manualTab) manualTab.classList.toggle('active', useManual);
  if (pickerPanel) pickerPanel.style.display = useManual ? 'none' : '';
  if (manualPanel) manualPanel.style.display = useManual ? '' : 'none';
}

function switchAmapProjectNameLogic(logic) {
  const isAnd = logic === '且';
  document.getElementById('cfgForm_projectNameAnd')?.classList.toggle('active', isAnd);
  document.getElementById('cfgForm_projectNameOr')?.classList.toggle('active', !isAnd);
  const desc = document.getElementById('cfgForm_projectNameLogicDesc');
  if (desc) desc.textContent = isAnd ? '命中所有已选大项目名才触发规则' : '命中任意一个已选大项目名即触发规则';
}
