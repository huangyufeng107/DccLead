// ===== Lead Assignment Config =====
const leadAllocationPolicies = [
  {
    id: 'AP-001',
    creationSource: '人工创建',
    name: '华南城市分配策略',
    byCity: '是',
    cityAllocations: [
      { city: '广州', allocationMode: 'ratio', allocations: [{ channel: '科大讯飞-冷线索', percent: 40 }, { channel: '人工外呼', percent: 60 }] },
      { city: '深圳', allocationMode: 'single', allocations: [{ channel: '人工外呼', percent: 100 }] }
    ],
    fallbackCityAllocation: { city: '兜底城市', allocationMode: 'single', allocations: [{ channel: '科大讯飞-冷线索', percent: 100 }] },
    action: '广州：科大讯飞-冷线索40%，人工外呼60%；深圳：全部分配给人工外呼；兜底城市：全部分配给科大讯飞-冷线索',
    status: '启用',
    updatedAt: '2026-06-12 10:20'
  },
  {
    id: 'AP-002',
    creationSource: '人工创建',
    name: 'AI优先承接策略',
    byCity: '否',
    allocationMode: 'single',
    allocations: [{ channel: '科大讯飞-冷线索', percent: 100 }],
    action: '全部分配给科大讯飞-冷线索',
    status: '启用',
    updatedAt: '2026-06-11 16:35'
  },
  {
    id: 'AP-003',
    creationSource: '人工创建',
    name: 'AI人工混合策略',
    byCity: '否',
    allocationMode: 'ratio',
    allocations: [{ channel: '科大讯飞-冷线索', percent: 70 }, { channel: '人工外呼', percent: 30 }],
    action: '科大讯飞-冷线索70%，人工外呼30%',
    status: '启用',
    updatedAt: '2026-06-05 09:48'
  },
  {
    id: 'AP-004',
    creationSource: '人工创建',
    name: '预评分分层外呼策略',
    allocationScope: 'score',
    byCity: '否',
    scoreAllocations: [
      { minScore: 0, maxScore: 10, allocations: [{ channel: '科大讯飞-冷线索', percent: 100 }] },
      { minScore: 11, maxScore: 20, allocations: [{ channel: '科大讯飞-留资未满', percent: 100 }] }
    ],
    scoreFallbackAllocations: [{ channel: '科大讯飞-冷线索', percent: 100 }],
    action: '0–10分：科大讯飞-冷线索100%；11–20分：科大讯飞-留资未满100%；未命中：按兜底比例分配',
    status: '启用',
    updatedAt: '2026-09-29 10:20'
  },
  {
    id: 'AP-005',
    creationSource: '人工创建',
    name: '重点省份梯队分配策略',
    allocationScope: 'province',
    byCity: '否',
    cityAllocations: [
      { city: '广东省', cities: ['广东省'], allocationMode: 'ratio', allocations: [{ channel: 'AI外呼', percent: 50 }, { channel: '人工外呼', percent: 50 }] },
      { city: '浙江省', cities: ['浙江省'], allocationMode: 'single', allocations: [{ channel: '人工外呼', percent: 100 }] }
    ],
    fallbackCityAllocation: { city: '兜底省份', allocationMode: 'single', allocations: [{ channel: '科大讯飞-冷线索', percent: 100 }] },
    action: '广东省：AI外呼50%，人工外呼50%；浙江省：全部分配给人工外呼；兜底省份：全部分配给科大讯飞-冷线索',
    status: '启用',
    updatedAt: '2026-06-15 11:30'
  }
];
let allocationPolicyCurrentPage = 1;
let allocationPolicyPageSize = 10;

const leadAssignmentDimensions = [
  {
    key: 'series',
    name: '意向车系',
    ruleLabel: '车系线索分配策略',
    owner: '车型运营',
    source: '基础车系字典',
    desc: '按意向车系识别线索应进入的培育路径',
    fields: '意向车系、是否按比例、分配比例配置、外呼类型、排序序号',
    rules: [
      { id: 'CAR-001', name: 'N6车系优先培育', keyValue: 'N6', seriesValues: ['N6'], callTypes: ['科大讯飞-冷线索'], condition: '意向车系=N6', allocationMode: 'single', allocations: [{ channel: '科大讯飞-冷线索', percent: 100 }], action: '全部分配给科大讯飞-冷线索', ratio: '不按比例', aiType: '科大讯飞-冷线索', sort: 1, status: '启用', updatedAt: '2026-06-10 10:18', sourceType: 'agent_recommendation', recommendationId: 'REC-20261012-0001', recommendationItemId: 'ITEM-0001', recommendationSummary: 'Agent建议评分为 100.0 分，系统将该评分作为对象效能参考，建议结合当前人工容量与现行分派规则审核确认。', recommended: '人工0% / AI100%', aiInternalMode: '不按比例', aiInternalPlan: '科大讯飞-冷线索', recommendationType: '优先培育', recommendationPlan: '人工0% / AI100% · 不按比例 · 优先培育', recommendationReason: 'Agent建议评分为 100.0 分，系统将该评分作为对象效能参考，建议结合当前人工容量与现行分派规则审核确认。', adoptionSummary: '张晓彤于 2026-10-12 16:20 采纳，未修改建议内容', agentVersion: 'lead-allocation-agent@V1.3', dataDate: '2026-10-11', batchId: 'BATCH-20261011-0001', requestId: 'REQ-20261012-0001', ruleVersion: 'V12' },
      { id: 'CAR-002', name: '轩逸车系混合比例分配', keyValue: '轩逸', seriesValues: ['轩逸'], useAllocationPolicy: '是', allocationPolicyId: 'AP-003', callTypes: ['科大讯飞-冷线索', '人工外呼'], condition: '意向车系=轩逸 / 分配比例配置=AI人工混合策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：AI人工混合策略', ratio: '比例配置', sort: 2, status: '启用', updatedAt: '2026-06-11 14:20' },
      { id: 'CAR-003', name: '天籁车系华南城市分配', keyValue: '天籁', seriesValues: ['天籁'], useAllocationPolicy: '是', allocationPolicyId: 'AP-001', callTypes: ['AI外呼', '人工外呼'], condition: '意向车系=天籁 / 分配比例配置=华南城市分配策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：华南城市分配策略', ratio: '比例配置', sort: 3, status: '启用', updatedAt: '2026-06-12 11:30' },
      { id: 'CAR-004', name: '逍客车系省份梯队分配', keyValue: '逍客', seriesValues: ['逍客'], useAllocationPolicy: '是', allocationPolicyId: 'AP-005', callTypes: ['AI外呼', '人工外呼', '科大讯飞-冷线索'], condition: '意向车系=逍客 / 分配比例配置=重点省份梯队分配策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：重点省份梯队分配策略', ratio: '比例配置', sort: 4, status: '启用', updatedAt: '2026-06-15 15:10' },
      { id: 'CAR-005', name: '奇骏车系预评分分层分配', keyValue: '奇骏', seriesValues: ['奇骏'], useAllocationPolicy: '是', allocationPolicyId: 'AP-004', callTypes: ['科大讯飞-冷线索', '科大讯飞-留资未满'], condition: '意向车系=奇骏 / 分配比例配置=预评分分层外呼策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：预评分分层外呼策略', ratio: '比例配置', sort: 5, status: '启用', updatedAt: '2026-06-16 09:40' }
    ]
  },
  {
    key: 'sc',
    name: 'SmartCode',
    ruleLabel: 'SmartCode线索分配策略',
    owner: 'SC运营',
    source: 'SmartCode、基础车系字典',
    desc: '按 SmartCode 和意向车系识别线索应进入的培育路径',
    fields: 'SmartCode、意向车系、是否按比例、分配比例配置、推送时间、排序序号',
    rules: [
      { id: 'SC-001', name: '过期SC暂缓分配', keyValue: 'SC-OLD-001', scValues: ['SC-OLD-001'], scSeriesValues: [], useAllocationPolicy: '否', allocationPolicyId: '', callTypes: ['科大讯飞-冷线索'], condition: 'SmartCode=SC-OLD-001 / 未接入分配比例配置', allocationMode: 'single', allocations: [{ channel: '科大讯飞-冷线索', percent: 100 }], pushTime: { days: ['周一', '周二', '周三', '周四', '周五'], slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] }, action: '全部分配给科大讯飞-冷线索', ratio: '不接入比例配置', sort: 1, status: '启用', updatedAt: '2026-06-08 10:15' },
      { id: 'SC-002', name: '重点SC混合比例分配', keyValue: 'SC-GZ-2026', scValues: ['SC-GZ-2026'], scSeriesValues: ['N6', '轩逸'], useAllocationPolicy: '是', allocationPolicyId: 'AP-003', callTypes: ['科大讯飞-冷线索', '人工外呼'], condition: 'SmartCode=SC-GZ-2026 / 意向车系=N6、轩逸 / 分配比例配置=AI人工混合策略', allocationMode: 'policy', allocations: [], pushTime: { days: [], slots: [] }, action: '接入比例配置：AI人工混合策略', ratio: '比例配置', sort: 2, status: '启用', updatedAt: '2026-06-09 14:22' },
      { id: 'SC-003', name: '广州N6-SC定向培育', keyValue: 'SC-N6-0891', scValues: ['SC-N6-0891'], scSeriesValues: ['N6'], useAllocationPolicy: '是', allocationPolicyId: 'AP-001', callTypes: ['AI外呼', '人工外呼'], condition: 'SmartCode=SC-N6-0891 / 意向车系=N6 / 分配比例配置=华南城市分配策略', allocationMode: 'policy', allocations: [], pushTime: { days: ['周一', '周二', '周三', '周四', '周五'], slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] }, action: '接入比例配置：华南城市分配策略', ratio: '比例配置', sort: 3, status: '启用', updatedAt: '2026-06-10 11:05' },
      { id: 'SC-004', name: '沈阳SC省份梯队分配', keyValue: 'SC-SY-0234', scValues: ['SC-SY-0234'], scSeriesValues: ['天籁'], useAllocationPolicy: '是', allocationPolicyId: 'AP-005', callTypes: ['AI外呼', '人工外呼', '科大讯飞-冷线索'], condition: 'SmartCode=SC-SY-0234 / 意向车系=天籁 / 分配比例配置=重点省份梯队分配策略', allocationMode: 'policy', allocations: [], pushTime: { days: [], slots: [] }, action: '接入比例配置：重点省份梯队分配策略', ratio: '比例配置', sort: 4, status: '启用', updatedAt: '2026-06-15 16:30' },
      { id: 'SC-005', name: '逍客SC评分分层承接', keyValue: 'SC-XK-7712', scValues: ['SC-XK-7712'], scSeriesValues: ['逍客'], useAllocationPolicy: '是', allocationPolicyId: 'AP-004', callTypes: ['科大讯飞-冷线索', '科大讯飞-留资未满'], condition: 'SmartCode=SC-XK-7712 / 意向车系=逍客 / 分配比例配置=预评分分层外呼策略', allocationMode: 'policy', allocations: [], pushTime: { days: [], slots: [] }, action: '接入比例配置：预评分分层外呼策略', ratio: '比例配置', sort: 5, status: '启用', updatedAt: '2026-06-16 11:10' }
    ]
  },
  {
    key: 'project',
    name: '大项目名',
    ruleLabel: '大项目名线索分配策略',
    owner: '项目运营',
    source: '大项目名、基础车系字典',
    desc: '按大项目名和意向车系识别线索应进入的培育路径',
    fields: '大项目名、车系、是否按比例、分配比例配置、外呼类型、排序序号',
    rules: [
      { id: 'PROJ-001', name: '置换活动项目人工直跟', keyValue: '置换活动', projectValues: ['置换活动'], projectSeriesValues: ['轩逸'], callTypes: ['人工外呼'], condition: '大项目名=置换活动 / 意向车系=轩逸', allocationMode: 'single', allocations: [{ channel: '人工外呼', percent: 100 }], action: '全部分配给人工外呼', ratio: '不按比例', sort: 1, status: '启用', updatedAt: '2026-06-03 09:30' },
      { id: 'PROJ-002', name: '新能源专项混合分配', keyValue: '新能源专项', projectValues: ['新能源专项'], projectSeriesValues: ['N6'], useAllocationPolicy: '是', allocationPolicyId: 'AP-003', callTypes: ['科大讯飞-冷线索', '人工外呼'], condition: '大项目名=新能源专项 / 意向车系=N6 / 分配比例配置=AI人工混合策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：AI人工混合策略', ratio: '比例配置', sort: 2, status: '启用', updatedAt: '2026-06-06 12:33' },
      { id: 'PROJ-003', name: '华南新能源项目城市分配', keyValue: '新能源专项', projectValues: ['新能源专项'], projectSeriesValues: ['N6', '天籁'], useAllocationPolicy: '是', allocationPolicyId: 'AP-001', callTypes: ['AI外呼', '人工外呼'], condition: '大项目名=新能源专项 / 意向车系=N6、天籁 / 分配比例配置=华南城市分配策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：华南城市分配策略', ratio: '比例配置', sort: 3, status: '启用', updatedAt: '2026-06-12 15:48' },
      { id: 'PROJ-004', name: 'DCC培育项目省份梯队承接', keyValue: 'DCC培育项目', projectValues: ['DCC培育项目'], projectSeriesValues: ['天籁', '逍客'], useAllocationPolicy: '是', allocationPolicyId: 'AP-005', callTypes: ['AI外呼', '人工外呼', '科大讯飞-冷线索'], condition: '大项目名=DCC培育项目 / 意向车系=天籁、逍客 / 分配比例配置=重点省份梯队分配策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：重点省份梯队分配策略', ratio: '比例配置', sort: 4, status: '启用', updatedAt: '2026-06-15 17:00' },
      { id: 'PROJ-005', name: '高意向培育项目评分分级分配', keyValue: '高意向培育', projectValues: ['高意向培育'], projectSeriesValues: ['奇骏'], useAllocationPolicy: '是', allocationPolicyId: 'AP-004', callTypes: ['科大讯飞-冷线索', '科大讯飞-留资未满'], condition: '大项目名=高意向培育 / 意向车系=奇骏 / 分配比例配置=预评分分层外呼策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：预评分分层外呼策略', ratio: '比例配置', sort: 5, status: '启用', updatedAt: '2026-06-16 14:15' }
    ]
  },
  {
    key: 'channel',
    name: '渠道编码',
    ruleLabel: '渠道编码线索分配策略',
    owner: '渠道运营',
    source: 'samrtcode系统-R渠道、基础车系字典',
    desc: '按渠道编码和意向车系识别线索应进入的培育路径',
    fields: '渠道编码、车系、是否按比例、分配比例配置、外呼类型、排序序号',
    rules: [
      { id: 'CH-001', name: 'R1渠道新线索AI直推', keyValue: 'R1', channelValues: ['R1'], channelSeriesValues: ['N6'], callTypes: ['科大讯飞-冷线索'], condition: '渠道编码=R1 / 意向车系=N6', allocationMode: 'single', allocations: [{ channel: '科大讯飞-冷线索', percent: 100 }], action: '全部分配给科大讯飞-冷线索', ratio: '不按比例', sort: 1, status: '启用', updatedAt: '2026-06-10 15:20' },
      { id: 'CH-002', name: 'R2渠道混合比例承接', keyValue: 'R2', channelValues: ['R2'], channelSeriesValues: ['轩逸'], useAllocationPolicy: '是', allocationPolicyId: 'AP-003', callTypes: ['科大讯飞-冷线索', '人工外呼'], condition: '渠道编码=R2 / 意向车系=轩逸 / 分配比例配置=AI人工混合策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：AI人工混合策略', ratio: '比例配置', sort: 2, status: '启用', updatedAt: '2026-06-11 16:00' },
      { id: 'CH-003', name: 'R1渠道华南城市比例分配', keyValue: 'R1', channelValues: ['R1'], channelSeriesValues: ['N6'], useAllocationPolicy: '是', allocationPolicyId: 'AP-001', callTypes: ['AI外呼', '人工外呼'], condition: '渠道编码=R1 / 意向车系=N6 / 分配比例配置=华南城市分配策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：华南城市分配策略', ratio: '比例配置', sort: 3, status: '启用', updatedAt: '2026-06-13 10:26' },
      { id: 'CH-004', name: 'R3渠道省份梯度分配', keyValue: 'R3', channelValues: ['R3'], channelSeriesValues: ['天籁'], useAllocationPolicy: '是', allocationPolicyId: 'AP-005', callTypes: ['AI外呼', '人工外呼', '科大讯飞-冷线索'], condition: '渠道编码=R3 / 意向车系=天籁 / 分配比例配置=重点省份梯队分配策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：重点省份梯队分配策略', ratio: '比例配置', sort: 4, status: '启用', updatedAt: '2026-06-15 17:40' },
      { id: 'CH-005', name: 'R4渠道官网评分分层分配', keyValue: 'R4', channelValues: ['R4'], channelSeriesValues: ['逍客'], useAllocationPolicy: '是', allocationPolicyId: 'AP-004', callTypes: ['科大讯飞-冷线索', '科大讯飞-留资未满'], condition: '渠道编码=R4 / 意向车系=逍客 / 分配比例配置=预评分分层外呼策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：预评分分层外呼策略', ratio: '比例配置', sort: 5, status: '启用', updatedAt: '2026-06-16 15:20' }
    ]
  },
  {
    key: 'lead-status',
    name: '线索状态',
    ruleLabel: '线索状态分配规则',
    owner: '线索运营',
    source: '线索系统状态字典',
    desc: '按线索状态和意向车系识别线索应进入的培育路径',
    fields: '线索状态、车系、是否按比例、分配比例配置、外呼类型、排序序号',
    rules: [
      { id: 'LS-001', name: '总部无效状态人工核验', keyValue: '总部_无效', leadStatusValues: ['总部_无效'], leadStatusReasonValues: ['明确空号'], leadStatusSeriesValues: [], callTypes: ['人工外呼'], condition: '线索状态=总部_无效 / 异常原因=明确空号', allocationMode: 'single', allocations: [{ channel: '人工外呼', percent: 100 }], action: '全部分配给人工外呼', ratio: '不按比例', sort: 1, status: '启用', updatedAt: '2026-06-01 16:55' },
      { id: 'LS-002', name: '总部休眠未购混合再激活', keyValue: '总部_休眠未购', leadStatusValues: ['总部_休眠未购'], leadStatusReasonValues: [], leadStatusSeriesValues: ['轩逸'], useAllocationPolicy: '是', allocationPolicyId: 'AP-003', callTypes: ['科大讯飞-冷线索', '人工外呼'], condition: '线索状态=总部_休眠未购 / 意向车系=轩逸 / 分配比例配置=AI人工混合策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：AI人工混合策略', ratio: '比例配置', sort: 2, status: '启用', updatedAt: '2026-06-05 18:12' },
      { id: 'LS-003', name: '总部高意向华南比例分配', keyValue: '总部_高意向', leadStatusValues: ['总部_高意向'], leadStatusReasonValues: [], leadStatusSeriesValues: ['N6'], useAllocationPolicy: '是', allocationPolicyId: 'AP-001', callTypes: ['AI外呼', '人工外呼'], condition: '线索状态=总部_高意向 / 意向车系=N6 / 分配比例配置=华南城市分配策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：华南城市分配策略', ratio: '比例配置', sort: 3, status: '启用', updatedAt: '2026-06-14 11:18' },
      { id: 'LS-004', name: '战败挽回线索省份梯次分配', keyValue: '总部_战败', leadStatusValues: ['总部_战败'], leadStatusReasonValues: [], leadStatusSeriesValues: ['天籁'], useAllocationPolicy: '是', allocationPolicyId: 'AP-005', callTypes: ['AI外呼', '人工外呼', '科大讯飞-冷线索'], condition: '线索状态=总部_战败 / 意向车系=天籁 / 分配比例配置=重点省份梯队分配策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：重点省份梯队分配策略', ratio: '比例配置', sort: 4, status: '启用', updatedAt: '2026-06-15 18:00' },
      { id: 'LS-005', name: '下发前高潜线索评分分级分配', keyValue: '总部_高意向', leadStatusValues: ['总部_高意向'], leadStatusReasonValues: [], leadStatusSeriesValues: ['奇骏'], useAllocationPolicy: '是', allocationPolicyId: 'AP-004', callTypes: ['科大讯飞-冷线索', '科大讯飞-留资未满'], condition: '线索状态=总部_高意向 / 意向车系=奇骏 / 分配比例配置=预评分分层外呼策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：预评分分层外呼策略', ratio: '比例配置', sort: 5, status: '启用', updatedAt: '2026-06-16 16:10' }
    ]
  },
  {
    key: 'dealer',
    name: '意向门店',
    ruleLabel: '意向门店线索分配策略',
    owner: '门店运营',
    source: '营销平台经销商基础数据、基础车系字典',
    desc: '按意向门店和意向车系和线索状态识别线索应进入的培育路径',
    fields: '意向门店、车系、线索状态、是否按比例、分配比例配置、外呼类型、排序序号',
    rules: [
      { id: 'DLR-001', name: '北京门店专属人工直跟', keyValue: '杭州东风日产滨江店', dealerValues: ['杭州东风日产滨江店'], dealerSeriesValues: ['轩逸'], dealerLeadStatusValues: ['总部_高意向'], callTypes: ['人工外呼'], condition: '意向门店=杭州东风日产滨江店 / 意向车系=轩逸 / 线索状态=总部_高意向', allocationMode: 'single', allocations: [{ channel: '人工外呼', percent: 100 }], action: '全部分配给人工外呼', ratio: '不按比例', sort: 1, status: '启用', updatedAt: '2026-06-10 09:08' },
      { id: 'DLR-002', name: '深圳南山门店混合承接', keyValue: '深圳南山日产', dealerValues: ['深圳南山日产'], dealerSeriesValues: ['N6'], dealerLeadStatusValues: ['总部_休眠未购'], useAllocationPolicy: '是', allocationPolicyId: 'AP-003', callTypes: ['科大讯飞-冷线索', '人工外呼'], condition: '意向门店=深圳南山日产 / 意向车系=N6 / 线索状态=总部_休眠未购 / 分配比例配置=AI人工混合策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：AI人工混合策略', ratio: '比例配置', sort: 2, status: '启用', updatedAt: '2026-06-11 17:18' },
      { id: 'DLR-003', name: '广州白云门店城市比例分配', keyValue: '广州白云日产', dealerValues: ['广州白云日产'], dealerSeriesValues: ['天籁'], dealerLeadStatusValues: ['总部_高意向'], useAllocationPolicy: '是', allocationPolicyId: 'AP-001', callTypes: ['AI外呼', '人工外呼'], condition: '意向门店=广州白云日产 / 意向车系=天籁 / 线索状态=总部_高意向 / 分配比例配置=华南城市分配策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：华南城市分配策略', ratio: '比例配置', sort: 3, status: '启用', updatedAt: '2026-06-12 18:20' },
      { id: 'DLR-004', name: '华东多店跨省梯队分配', keyValue: '上海东风日产浦东店', dealerValues: ['上海东风日产浦东店'], dealerSeriesValues: ['逍客'], dealerLeadStatusValues: [], useAllocationPolicy: '是', allocationPolicyId: 'AP-005', callTypes: ['AI外呼', '人工外呼', '科大讯飞-冷线索'], condition: '意向门店=上海东风日产浦东店 / 意向车系=逍客 / 分配比例配置=重点省份梯队分配策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：重点省份梯队分配策略', ratio: '比例配置', sort: 4, status: '启用', updatedAt: '2026-06-15 18:30' },
      { id: 'DLR-005', name: '成都标杆门店评分分层承接', keyValue: '成都东风日产高新店', dealerValues: ['成都东风日产高新店'], dealerSeriesValues: ['奇骏'], dealerLeadStatusValues: ['总部_高意向'], useAllocationPolicy: '是', allocationPolicyId: 'AP-004', callTypes: ['科大讯飞-冷线索', '科大讯飞-留资未满'], condition: '意向门店=成都东风日产高新店 / 意向车系=奇骏 / 线索状态=总部_高意向 / 分配比例配置=预评分分层外呼策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：预评分分层外呼策略', ratio: '比例配置', sort: 5, status: '启用', updatedAt: '2026-06-16 17:00' }
    ]
  },
  {
    key: 'allocation-policy',
    name: '分配比例配置',
    ruleLabel: '分配比例公共配置',
    owner: '策略运营',
    source: '外呼渠道比例规则字典',
    desc: '用于统一维护线索的外呼分配比例，支持按城市、省份或预评分区间配置外呼类型，并设置未命中条件时的处理方式。启用后的配置可被多类线索分配策略复用。',
    fields: '配置名称、分配依据、评分区间、外呼类型、引用情况、状态',
    rules: []
  }
];
let activeLeadAssignmentDimension = 'series';
let highlightedLeadAssignmentRuleId = '';
let leadAssignmentCurrentPage = 1;
let leadAssignmentPageSize = 10;

function renderLeadAssignmentConfigPage() {
  const page = document.getElementById('leadAssignmentConfigPage');
  if (!page) return;
  const totalRules = leadAssignmentDimensions.reduce((sum, item) => sum + item.rules.length, 0);
  const enabledRules = leadAssignmentDimensions.reduce((sum, item) => sum + item.rules.filter(rule => rule.status === '启用').length, 0);
  const aiRules = leadAssignmentDimensions.reduce((sum, item) => sum + item.rules.filter(rule => rule.action.includes('AI')).length, 0);
  const manualRules = leadAssignmentDimensions.reduce((sum, item) => sum + item.rules.filter(rule => rule.action.includes('人工')).length, 0);
  page.innerHTML = `
    <div class="page-hero">
      <div>
        <div class="page-title">线索分配策略</div>
        <div class="page-desc">用于统一管理线索接收后的线索分配策略，按意向车系、SmartCode、大项目名、线索状态、渠道编码和意向门店等条件判断线索分配给 AI 跟进、人工跟进或暂不分配。</div>
      </div>
      <div class="summary-strip">
        <div class="summary-card"><div class="summary-label">配置维度</div><div class="summary-value">${leadAssignmentDimensions.length}</div></div>
        <div class="summary-card"><div class="summary-label">规则总数</div><div class="summary-value">${totalRules}</div></div>
        <div class="summary-card"><div class="summary-label">启用规则</div><div class="summary-value">${enabledRules}</div></div>
        <div class="summary-card"><div class="summary-label">AI跟进</div><div class="summary-value">${aiRules}</div></div>
        <div class="summary-card"><div class="summary-label">人工跟进</div><div class="summary-value">${manualRules}</div></div>
      </div>
    </div>
    <div class="assignment-dimension-tabs" aria-label="线索分配策略维度">
      ${leadAssignmentDimensions.map(item => `
        <button class="assignment-dimension-tab ${item.key === activeLeadAssignmentDimension ? 'active' : ''}" type="button" ${renderUiActionCallback('assignment-dimension-switch', [item.key])}>${item.name}</button>
      `).join('')}
    </div>
    <div id="leadAssignmentDimensionPanel"></div>
  `;
  renderLeadAssignmentDimensionPanel();
}

function switchLeadAssignmentDimension(key) {
  activeLeadAssignmentDimension = key;
  leadAssignmentCurrentPage = 1;
  document.querySelectorAll('.assignment-dimension-tab').forEach(item => {
    item.classList.toggle('active', item.textContent.trim() === getLeadAssignmentDimension().name);
  });
  renderLeadAssignmentDimensionPanel();
}

function getLeadAssignmentDimension() {
  return leadAssignmentDimensions.find(item => item.key === activeLeadAssignmentDimension) || leadAssignmentDimensions[0];
}

function isCompactAssignmentDimension(dimension = getLeadAssignmentDimension()) {
  return ['series', 'sc', 'project', 'channel', 'lead-status', 'dealer'].includes(dimension.key);
}

function hasRelatedSeriesCondition(dimension = getLeadAssignmentDimension()) {
  return ['sc', 'project', 'channel', 'lead-status', 'dealer'].includes(dimension.key);
}

function renderLeadAssignmentDimensionPanel() {
  const panel = document.getElementById('leadAssignmentDimensionPanel');
  if (!panel) return;
  const dimension = getLeadAssignmentDimension();
  if (dimension.key === 'allocation-policy') {
    renderAllocationPolicyPanel('leadAssignmentDimensionPanel');
    return;
  }
  panel.innerHTML = `
    <div class="assignment-dimension-meta">
      <div class="assignment-meta-item">
        <div class="assignment-meta-label">配置维度</div>
        <div class="assignment-meta-value">${dimension.name}</div>
      </div>
      <div class="assignment-meta-item">
        <div class="assignment-meta-label">用途说明</div>
        <div class="assignment-meta-value">${dimension.desc}</div>
      </div>
      <div class="assignment-meta-item">
        <div class="assignment-meta-label">数据来源</div>
        <div class="assignment-meta-value">${dimension.source}</div>
      </div>
      <div class="assignment-meta-item">
        <div class="assignment-meta-label">维护角色</div>
        <div class="assignment-meta-value">${dimension.owner}</div>
      </div>
    </div>
    <div class="filter-row">
      <span class="filter-label">关键字：</span>
      <input class="lead-input" id="leadAssignmentKeyword" placeholder="请输入内容" ${renderUiActionCallback('assignment-filter')} />
      <span class="filter-label">状态：</span>
      <select class="filter-select" id="leadAssignmentStatusFilter" ${renderUiActionCallback('assignment-filter')}>
        <option value="">全部</option>
        <option value="启用">启用</option>
        <option value="停用">停用</option>
      </select>
      <button class="btn-secondary" type="button" ${renderUiActionCallback('assignment-reset')}>重置</button>
    </div>
    ${renderPolicyRuleNote('leadAssignmentRuleNote', '用于统一管理线索接收后的线索分配策略，按意向车系、SmartCode、大项目名、线索状态、渠道编码和意向门店等条件判断线索分配给 AI 跟进、人工跟进或暂不分配。')}
    <div class="card">
      <div class="section-header">
        <div>
          <div class="section-title">${getLeadAssignmentRuleLabel(dimension)}列表</div>
        </div>
        <div class="action-btns">
          <button class="btn-secondary" type="button" ${renderUiActionCallback('assignment-import')}>导入数据</button>
          <button class="btn-secondary" type="button" ${renderUiActionCallback('assignment-export', [dimension.key])}>导出数据</button>
          <button class="btn-add" type="button" ${renderUiActionCallback('assignment-open-rule', ['add'])}>新增策略</button>
        </div>
      </div>
      <table class="data-table assignment-rule-table lead-dimension-rule-table">
        <thead>
          <tr>
            ${isCompactAssignmentDimension(dimension) ? '<th style="width:60px;text-align:center;">#</th>' : '<th style="width:70px;text-align:center;">排序</th>'}
            <th style="width:250px;">策略名称</th>
            <th style="width:120px;">配置内容</th>
            <th style="width:130px;">外呼类型</th>
            <th style="width:180px;">匹配条件</th>
            <th>分配动作</th>
            ${isCompactAssignmentDimension(dimension) ? '' : '<th style="width:120px;">比例/评级</th>'}
            <th style="width:84px;text-align:center;">状态</th>
            <th style="width:170px;text-align:right;">操作</th>
          </tr>
        </thead>
        <tbody id="leadAssignmentDimensionTableBody"></tbody>
      </table>
      <div class="pagination">
        <span id="leadAssignmentPageInfo">共 0 条记录，当前第 1 / 1 页</span>
        <div class="pagination-btns">
          <select class="hit-page-size" id="leadAssignmentPageSize" ${renderUiActionCallback('assignment-page-size', ['$value'])}>
            <option value="5">每页 5 条</option>
            <option value="10">每页 10 条</option>
            <option value="20">每页 20 条</option>
            <option value="50">每页 50 条</option>
          </select>
          <button class="page-btn" type="button" id="leadAssignmentPrevPage" onclick="changeLeadAssignmentPage(-1)" aria-label="上一页"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <select class="hit-page-size" id="leadAssignmentPageSelect" ${renderUiActionCallback('assignment-page-select', ['$value'])}></select>
          <button class="page-btn" type="button" id="leadAssignmentNextPage" onclick="changeLeadAssignmentPage(1)" aria-label="下一页"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
    </div>
  `;
  renderLeadAssignmentDimensionTable();
  schedulePolicyRuleNoteAutoHide('leadAssignmentRuleNote');
}

function getAllocationPolicyById(id) {
  return leadAllocationPolicies.find(item => item.id === id);
}

function getAllocationPolicyCallTypes(policy = {}) {
  const scope = getAllocationPolicyScope(policy);
  if (scope === 'score') {
    return [...new Set([
      ...(policy.scoreAllocations || []).flatMap(item => item.allocations || []),
      ...(policy.scoreFallbackAllocations || [])
    ].map(item => item.channel).filter(Boolean))];
  }
  const allocations = scope !== 'none'
    ? [
        ...(policy.cityAllocations || []).flatMap(item => getRegionalAllocationRows(item)),
        ...getRegionalAllocationRows(policy.fallbackCityAllocation || {})
      ]
    : (policy.allocations || []);
  return [...new Set(allocations.map(item => item.channel).filter(Boolean))];
}

function getRegionalAllocationRows(item = {}) {
  return item.allocationMode === 'score'
    ? [...(item.scoreAllocations || []).flatMap(range => range.allocations || []), ...(item.scoreFallbackAllocations || [])]
    : (item.allocations || []);
}

function getAllocationPolicySummary(policy = {}) {
  const scope = getAllocationPolicyScope(policy);
  if (scope === 'score') {
    const ranges = (policy.scoreAllocations || []).map(item => `${item.minScore}–${item.maxScore}分：${(item.allocations || []).map(row => `${row.channel}${row.percent}%`).join('、')}`);
    const fallback = (policy.scoreFallbackAllocations || []).map(row => `${row.channel}${row.percent}%`).join('、') || '待配置';
    return `${ranges.join('；')}${ranges.length ? '；' : ''}兜底：${fallback}`;
  }
  if (scope !== 'none') {
    const config = getAllocationAreaConfig(scope);
    return [
      ...(policy.cityAllocations || []).map(item => `${getCityAllocationAreaLabel(item)}：${renderCityAllocationSummary(item)}`),
      `${config.fallbackLabel}：${renderCityAllocationSummary(policy.fallbackCityAllocation || {})}`
    ].join('；');
  }
  return renderCityAllocationSummary(policy);
}

function getAllocationPolicyScope(policy = {}) {
  if (policy.allocationScope) return policy.allocationScope;
  return policy.byCity === '是' ? 'city' : 'none';
}

function getAllocationPolicyScopeLabel(scopeOrPolicy = {}) {
  const scope = typeof scopeOrPolicy === 'string' ? scopeOrPolicy : getAllocationPolicyScope(scopeOrPolicy);
  if (scope === 'city') return '关联城市';
  if (scope === 'province') return '关联省份';
  if (scope === 'score') return '关联预评分';
  return '不按区域';
}

function getAllocationAreaConfig(scope = 'city') {
  const isProvince = scope === 'province';
  return {
    scope,
    valueLabel: isProvince ? '关联省份' : '关联城市',
    fallbackLabel: isProvince ? '兜底省份' : '兜底城市',
    addLabel: isProvince ? '添加省份' : '添加城市',
    hint: isProvince
      ? '先匹配省份；未命中时使用最终兜底省份。普通省份配置可按比例或按预评分区间分配。'
      : '先匹配城市；未命中时使用最终兜底城市。普通城市配置可按比例或按预评分区间分配。',
    options: isProvince ? assignmentProvinceOptions : assignmentCityOptions,
    defaultValue: isProvince ? assignmentProvinceOptions[0] : assignmentCityOptions[0],
    defaultRows: isProvince
      ? [{ city: '广东省', allocationMode: 'ratio', allocations: getDefaultAssignmentAllocationRows() }]
      : [{ city: '广州', allocationMode: 'ratio', allocations: getDefaultAssignmentAllocationRows() }]
  };
}

function renderAllocationPolicyTemplatePage() {
  const page = document.getElementById('leadAssignmentConfigPage');
  if (!page) return;
  page.innerHTML = `
    <div id="allocationPolicyTemplatePanel"></div>
  `;
  renderAllocationPolicyPanel('allocationPolicyTemplatePanel');
}

function getAllocationPolicyReferences(policyId) {
  return leadAssignmentDimensions.flatMap(dimension => (
    dimension.rules
      .filter(rule => rule.allocationPolicyId === policyId)
      .map(rule => ({
        dimension: dimension.name,
        dimensionKey: dimension.key,
        ruleLabel: dimension.ruleLabel,
        ruleId: rule.id,
        ruleName: rule.name,
        status: rule.status
      }))
  ));
}

function renderAllocationPolicyReferenceSummary(policyId) {
  const references = getAllocationPolicyReferences(policyId);
  if (!references.length) return '<span class="dictionary-empty">未被引用</span>';
  return `<span class="dictionary-ref">被 ${references.length} 处引用</span>`;
}

function renderAllocationPolicyReferenceDetails(policyId) {
  const references = getAllocationPolicyReferences(policyId);
  if (!references.length) return '<div class="rule-detail-value policy-reference-message">当前没有线索分配策略引用此策略，可安全删除。</div>';
  return `
    <div class="rule-detail-value policy-reference-message">当前被以下 ${references.length} 条线索分配策略引用；如需删除，请先在对应线索分配策略中改为其他比例配置或不按比例分配。</div>
    <div class="policy-reference-list">
      ${references.map(item => `<div class="policy-reference-item"><div><strong>${escapeHtml(item.ruleName)}</strong><span>${escapeHtml(item.ruleLabel)}ID · <button class="policy-reference-link" type="button" ${renderUiActionCallback('allocation-reference', [item.dimensionKey, item.ruleId])}>${escapeHtml(item.ruleId)}</button></span></div><span class="policy-reference-status ${item.status === '启用' ? 'active' : ''}">${escapeHtml(item.status)}</span></div>`).join('')}
    </div>
  `;
}

function openAllocationPolicyReferenceRule(dimensionKey, ruleId) {
  const dimension = leadAssignmentDimensions.find(item => item.key === dimensionKey);
  const rule = dimension?.rules.find(item => item.id === ruleId);
  if (!dimension || !rule) {
    showToast('未找到对应的线索分配策略', false);
    return;
  }
  activeLeadAssignmentDimension = dimensionKey;
  const orderedRules = [...dimension.rules].sort((a, b) => Number(a.sort || 99) - Number(b.sort || 99));
  const ruleIndex = orderedRules.findIndex(item => item.id === ruleId);
  leadAssignmentCurrentPage = Math.floor(Math.max(ruleIndex, 0) / leadAssignmentPageSize) + 1;
  highlightedLeadAssignmentRuleId = ruleId;
  closeModal('leadDispatchRuleModal');
  const assignmentNav = document.querySelector('.strategy-nav-item[data-page="lead-assignment"]');
  if (assignmentNav) switchStrategyNav(assignmentNav);
  document.querySelector(`[data-rule-id="${ruleId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderAllocationPolicySummary() {
  const enabledCount = leadAllocationPolicies.filter(item => item.status === '启用').length;
  const areaCount = leadAllocationPolicies.filter(item => getAllocationPolicyScope(item) !== 'none').length;
  const callTypeCount = new Set(leadAllocationPolicies.flatMap(policy => getAllocationPolicyCallTypes(policy))).size;
  const referencedCount = leadAssignmentDimensions.reduce((sum, dimension) => {
    return sum + dimension.rules.filter(rule => rule.allocationPolicyId).length;
  }, 0);
  return `
    <div class="summary-strip">
      <div class="summary-card"><div class="summary-label">配置总数</div><div class="summary-value">${leadAllocationPolicies.length}</div></div>
      <div class="summary-card"><div class="summary-label">启用配置</div><div class="summary-value">${enabledCount}</div></div>
      <div class="summary-card"><div class="summary-label">分配依据</div><div class="summary-value">${areaCount}</div></div>
      <div class="summary-card"><div class="summary-label">外呼类型</div><div class="summary-value">${callTypeCount}</div></div>
      <div class="summary-card"><div class="summary-label">引用规则</div><div class="summary-value">${referencedCount}</div></div>
    </div>
  `;
}

function renderAllocationPolicyPanel(targetId = 'leadAssignmentDimensionPanel') {
  const panel = document.getElementById(targetId);
  if (!panel) return;
  panel.innerHTML = `
    <div class="page-hero allocation-policy-inline-hero">
      <div>
        <div class="page-title">分配比例配置</div>
        <div class="page-desc">用于统一维护线索的外呼分配比例，支持按城市、省份或预评分区间配置外呼类型，并设置未命中条件时的处理方式。启用后的配置可被多类线索分配策略复用。</div>
      </div>
    </div>
    <div class="filter-row">
      <span class="filter-label">关键字：</span>
      <input class="lead-input" style="width:130px; margin-right: 12px;" id="allocationPolicyKeywordFilter" placeholder="请输入" ${renderUiActionCallback('allocation-filter')} />
      <span class="filter-label">外呼类型：</span>
      <select class="filter-select" id="allocationPolicyCallTypeFilter" ${renderUiActionCallback('allocation-filter')}>
        <option value="">全部</option>
        ${[...new Set(leadAllocationPolicies.flatMap(policy => getAllocationPolicyCallTypes(policy)))].map(type => `<option value="${type}">${type}</option>`).join('')}
      </select>
      <span class="filter-label">分配依据：</span>
      <select class="filter-select" id="allocationPolicyCityFilter" ${renderUiActionCallback('allocation-filter')}>
        <option value="">全部</option>
        <option value="none">不按区域</option>
        <option value="city">关联城市</option>
        <option value="province">关联省份</option>
        <option value="score">关联预评分</option>
      </select>
      <span class="filter-label">状态：</span>
      <select class="filter-select" id="allocationPolicyStatusFilter" ${renderUiActionCallback('allocation-filter')}>
        <option value="">全部</option>
        <option value="启用">启用</option>
        <option value="停用">停用</option>
      </select>
      <button class="btn-secondary" type="button" ${renderUiActionCallback('allocation-reset')}>重置</button>
    </div>
    ${renderPolicyRuleNote('allocationPolicyRuleNote', '停用后，历史关联仍保留，新增或编辑线索分配策略时不可再选择该配置。')}
    <div class="card">
      <div class="section-header">
        <div>
          <div class="section-title">分配比例配置列表</div>
        </div>
        <div class="action-btns">
          <button class="btn-add strategy-add-btn" type="button" ${renderUiActionCallback('allocation-open-modal', ['add'])}>新增配置</button>
        </div>
      </div>
      <table class="data-table assignment-rule-table">
        <thead>
          <tr>
            <th style="width:70px">#</th>
            <th>配置名称</th>
            <th style="width:110px">分配依据</th>
            <th>线索分配策略</th>
            <th>外呼类型</th>
            <th style="min-width:140px">创建来源</th>
            <th style="min-width:200px">引用情况</th>
            <th style="width:80px">状态</th>
            <th style="width:190px">操作</th>
          </tr>
        </thead>
        <tbody id="allocationPolicyTableBody"></tbody>
      </table>
      <div class="pagination">
        <span id="allocationPolicyPageInfo">共 0 条记录，当前第 1 / 1 页</span>
        <div class="pagination-btns">
          <select class="hit-page-size" id="allocationPolicyPageSize" ${renderUiActionCallback('allocation-page-size', ['$value'])}>
            <option value="5">每页 5 条</option>
            <option value="10">每页 10 条</option>
            <option value="20">每页 20 条</option>
            <option value="50">每页 50 条</option>
          </select>
          <button class="page-btn" type="button" onclick="changeAllocationPolicyPage(-1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <select class="hit-page-size" id="allocationPolicyPageSelect" ${renderUiActionCallback('allocation-page-select', ['$value'])}></select>
          <button class="page-btn" type="button" onclick="changeAllocationPolicyPage(1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
    </div>
  `;
  renderAllocationPolicyTable();
  schedulePolicyRuleNoteAutoHide('allocationPolicyRuleNote', 8);
}

function getFilteredAllocationPolicies() {
  const keyword = document.getElementById('allocationPolicyKeywordFilter')?.value.trim().toLowerCase() || '';
  const callType = document.getElementById('allocationPolicyCallTypeFilter')?.value || '';
  const byCity = document.getElementById('allocationPolicyCityFilter')?.value || '';
  const status = document.getElementById('allocationPolicyStatusFilter')?.value || '';
  return leadAllocationPolicies.filter(policy => {
    if (keyword) {
      const text = [
        policy.name,
        policy.id,
        getAllocationPolicyCreationSource(policy),
        policy.sourceBatchId,
        policy.sourceRuleObject,
        getAllocationPolicyScopeLabel(policy),
        getAllocationPolicySummary(policy),
        getAllocationPolicyCallTypes(policy).join(' ')
      ].filter(Boolean).join(' ').toLowerCase();
      if (!text.includes(keyword)) return false;
    }
    if (callType && !getAllocationPolicyCallTypes(policy).includes(callType)) return false;
    if (byCity && getAllocationPolicyScope(policy) !== byCity) return false;
    if (status && policy.status !== status) return false;
    return true;
  });
}

function renderAllocationPolicyTable() {
  const body = document.getElementById('allocationPolicyTableBody');
  if (!body) return;
  const rows = getFilteredAllocationPolicies();
  const totalPages = Math.max(1, Math.ceil(rows.length / allocationPolicyPageSize));
  if (allocationPolicyCurrentPage > totalPages) allocationPolicyCurrentPage = totalPages;
  const start = (allocationPolicyCurrentPage - 1) * allocationPolicyPageSize;
  const pageRows = rows.slice(start, start + allocationPolicyPageSize);
  const info = document.getElementById('allocationPolicyPageInfo');
  if (info) info.textContent = `共 ${rows.length} 条记录，当前第 ${allocationPolicyCurrentPage} / ${totalPages} 页`;
  const pageSelect = document.getElementById('allocationPolicyPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, index) => `<option value="${index + 1}">第 ${index + 1} 页</option>`).join('');
    pageSelect.value = String(allocationPolicyCurrentPage);
  }
  const pageSizeSelect = document.getElementById('allocationPolicyPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(allocationPolicyPageSize);
  body.innerHTML = pageRows.length ? pageRows.map((policy, index) => `
    <tr>
      <td class="row-index">${start + index + 1}</td>
      <td>
        <div class="rule-text-stack">
          <div class="rule-text-main">${policy.name}</div>
          <div class="rule-muted">规则ID: ${policy.id}</div>
        </div>
      </td>
      <td>${getAllocationPolicyScopeLabel(policy)}</td>
      <td>${renderClampedCellText(getAllocationPolicySummary(policy))}</td>
      <td>${renderClampedCellText(getAllocationPolicyCallTypes(policy).join('、'))}</td>
      <td><span class="allocation-policy-source ${policy.creationSource === '策略审核自动创建' ? 'is-auto' : ''}">${getAllocationPolicyCreationSource(policy)}</span></td>
      <td>${renderAllocationPolicyReferenceSummary(policy.id)}</td>
      <td>${policy.status === '启用' ? '<span class="col-status-on">● 启用</span>' : '<span class="col-status-off">● 停用</span>'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view" type="button" ${renderUiActionCallback('allocation-open-modal', ['view', policy.id])}>查看</button>
          <button class="action-btn edit" type="button" ${renderUiActionCallback('allocation-open-modal', ['edit', policy.id])}>编辑</button>
          <button class="action-btn ${policy.status === '启用' ? 'delete' : 'view'}" type="button" ${renderUiActionCallback('allocation-toggle', [policy.id])}>${policy.status === '启用' ? '停用' : '启用'}</button>
          <button class="action-btn delete" type="button" ${renderUiActionCallback('allocation-delete', [policy.id])}>删除</button>
        </div>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="9"><div class="empty-state">暂无匹配的分配比例配置</div></td></tr>';
}

function filterAllocationPolicyTable() {
  allocationPolicyCurrentPage = 1;
  renderAllocationPolicyTable();
}

function resetAllocationPolicyFilters() {
  const keyword = document.getElementById('allocationPolicyKeywordFilter');
  const callType = document.getElementById('allocationPolicyCallTypeFilter');
  const byCity = document.getElementById('allocationPolicyCityFilter');
  const status = document.getElementById('allocationPolicyStatusFilter');
  if (keyword) keyword.value = '';
  if (callType) callType.value = '';
  if (byCity) byCity.value = '';
  if (status) status.value = '';
  filterAllocationPolicyTable();
}

function changeAllocationPolicyPageSize(value) {
  allocationPolicyPageSize = Number(value) || 10;
  allocationPolicyCurrentPage = 1;
  renderAllocationPolicyTable();
}

function changeAllocationPolicyPage(dir) {
  const rows = getFilteredAllocationPolicies();
  const totalPages = Math.max(1, Math.ceil(rows.length / allocationPolicyPageSize));
  allocationPolicyCurrentPage = Math.min(Math.max(1, allocationPolicyCurrentPage + dir), totalPages);
  renderAllocationPolicyTable();
}

function selectAllocationPolicyPage(value) {
  allocationPolicyCurrentPage = Number(value) || 1;
  renderAllocationPolicyTable();
}

function getFilteredLeadAssignmentRules() {
  const dimension = getLeadAssignmentDimension();
  const keyword = document.getElementById('leadAssignmentKeyword')?.value.trim().toLowerCase() || '';
  const status = document.getElementById('leadAssignmentStatusFilter')?.value || '';
  return dimension.rules.filter(rule => {
    if (status && rule.status !== status) return false;
    if (!keyword) return true;
    return [rule.name, rule.id, rule.keyValue, rule.condition, rule.action, rule.ratio].some(value => String(value || '').toLowerCase().includes(keyword));
  }).sort((a, b) => Number(a.sort || 99) - Number(b.sort || 99));
}

function getLeadAssignmentRuleLabel(dimension) {
  return dimension.ruleLabel || `${dimension.name}策略`;
}

function renderAgentSourceSummary(rule) {
  if (!rule?.recommendationId) return '<span class="rule-source-manual">来源：人工/系统创建</span>';
  return '<span class="rule-agent-badge"><span class="rule-agent-icon">🤖</span><span class="rule-agent-text">Agent建议</span></span>';
}

function renderLeadAssignmentDimensionTable() {
  const body = document.getElementById('leadAssignmentDimensionTableBody');
  if (!body) return;
  const rows = getFilteredLeadAssignmentRules();
  const dimension = getLeadAssignmentDimension();
  const totalPages = Math.max(1, Math.ceil(rows.length / leadAssignmentPageSize));
  leadAssignmentCurrentPage = Math.min(leadAssignmentCurrentPage, totalPages);
  const start = (leadAssignmentCurrentPage - 1) * leadAssignmentPageSize;
  const pageRows = rows.slice(start, start + leadAssignmentPageSize);
  const pageInfo = document.getElementById('leadAssignmentPageInfo');
  if (pageInfo) pageInfo.textContent = `共 ${rows.length} 条记录，当前第 ${leadAssignmentCurrentPage} / ${totalPages} 页`;
  const pageSizeSelect = document.getElementById('leadAssignmentPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(leadAssignmentPageSize);
  const pageSelect = document.getElementById('leadAssignmentPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, index) => `<option value="${index + 1}">第 ${index + 1} 页</option>`).join('');
    pageSelect.value = String(leadAssignmentCurrentPage);
  }
  const prevButton = document.getElementById('leadAssignmentPrevPage');
  const nextButton = document.getElementById('leadAssignmentNextPage');
  if (prevButton) prevButton.disabled = leadAssignmentCurrentPage <= 1;
  if (nextButton) nextButton.disabled = leadAssignmentCurrentPage >= totalPages;
  body.innerHTML = pageRows.length ? pageRows.map((rule, index) => `
    <tr class="${rule.id === highlightedLeadAssignmentRuleId ? 'referenced-rule-highlight' : ''}" data-rule-id="${rule.id}">
      ${isCompactAssignmentDimension(dimension) ? `<td class="row-index cell-center">${start + index + 1}</td>` : `<td class="cell-center"><strong>P${rule.sort}</strong></td>`}
      <td>
        <div class="rule-text-stack">
          <div class="rule-text-main" title="${escapeAttr(rule.name)}">${escapeHtml(rule.name)}</div>
          <div class="rule-muted">规则ID：${escapeHtml(rule.id)} · 版本：${escapeHtml(rule.ruleVersion || '—')}</div><div class="rule-source-line">${renderAgentSourceSummary(rule)}</div>
        </div>
      </td>
      <td>${isCompactAssignmentDimension(dimension) ? renderClampedCellText(getCompactAssignmentSelectedValues(rule, dimension).join('、')) : `<strong>${escapeHtml(rule.keyValue)}</strong>`}</td>
      <td>${isCompactAssignmentDimension(dimension) ? renderClampedCellText((rule.callTypes || []).join('、')) : renderRuleChipList(rule.callTypes, 'blue', 2)}</td>
      <td>${isCompactAssignmentDimension(dimension) ? renderCompactConditionCell(rule, dimension) : escapeHtml(rule.condition)}</td>
      <td>${isCompactAssignmentDimension(dimension) ? renderClampedCellText(rule.action) : `<strong>${escapeHtml(rule.action)}</strong>`}</td>
      ${isCompactAssignmentDimension(dimension) ? '' : `<td>${escapeHtml(rule.ratio || '—')}</td>`}
      <td class="cell-center">${rule.status === '启用' ? '<span class="col-status-on">● 启用</span>' : '<span class="col-status-off">● 停用</span>'}</td>
      <td class="cell-right">
        <div class="action-btns" style="justify-content: flex-end;">
          <button class="action-btn view" type="button" ${renderUiActionCallback('assignment-open-rule', ['view', rule.id])}>查看</button>
          <button class="action-btn edit" type="button" ${renderUiActionCallback('assignment-open-rule', ['edit', rule.id])}>编辑</button>
          <button class="action-btn delete" type="button" ${renderUiActionCallback('assignment-delete-rule', [rule.id])}>删除</button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="${isCompactAssignmentDimension(dimension) ? 8 : 9}"><div class="empty-state">暂无匹配的线索分配策略</div></td></tr>`;
}

function resetLeadAssignmentFilters() {
  const keyword = document.getElementById('leadAssignmentKeyword');
  const status = document.getElementById('leadAssignmentStatusFilter');
  if (keyword) keyword.value = '';
  if (status) status.value = '';
  leadAssignmentCurrentPage = 1;
  renderLeadAssignmentDimensionTable();
}

function filterLeadAssignmentDimensionTable() {
  leadAssignmentCurrentPage = 1;
  renderLeadAssignmentDimensionTable();
}

function changeLeadAssignmentPageSize(value) {
  leadAssignmentPageSize = Number(value) || 10;
  leadAssignmentCurrentPage = 1;
  renderLeadAssignmentDimensionTable();
}

function selectLeadAssignmentPage(value) {
  leadAssignmentCurrentPage = Number(value) || 1;
  renderLeadAssignmentDimensionTable();
}

function changeLeadAssignmentPage(direction) {
  const totalPages = Math.max(1, Math.ceil(getFilteredLeadAssignmentRules().length / leadAssignmentPageSize));
  leadAssignmentCurrentPage = Math.max(1, Math.min(totalPages, leadAssignmentCurrentPage + direction));
  renderLeadAssignmentDimensionTable();
}

function deleteLeadAssignmentRule(id) {
  const dimension = getLeadAssignmentDimension();
  const rule = dimension.rules.find(item => item.id === id);
  if (!rule) return;
  if (!confirm(`确认删除${getLeadAssignmentRuleLabel(dimension)}「${rule.name}」？`)) return;
  dimension.rules = dimension.rules.filter(item => item.id !== id);
  showToast(`${getLeadAssignmentRuleLabel(dimension)}已删除`, true);
  renderLeadAssignmentConfigPage();
}

let editingLeadAssignmentRuleId = null;
let editingAllocationPolicyId = null;

function getAllocationPolicyCreationSource(policy) {
  return policy.creationSource || '未记录';
}
function renderAllocationPolicyCreationDetails(policy) {
  const fields = [['创建来源', getAllocationPolicyCreationSource(policy)], ['创建人', policy.createdBy || '未记录'], ['创建时间', policy.createdAt || '未记录']];
  if (policy.creationSource === '策略审核自动创建') {
    fields.push(['来源建议批次号', policy.sourceBatchId || '未记录'], ['来源规则对象', policy.sourceRuleObject || '未记录'], ['来源规则ID', policy.sourceRuleId || '未记录']);
  } else if (policy.creationSource === '回滚自动创建') {
    fields.push(['来源历史版本', policy.sourceVersionId || '未记录'], ['来源规则对象', policy.sourceRuleObject || '未记录']);
  }
  return `<div class="rule-detail-section"><div class="rule-detail-title">创建信息</div><div class="rule-detail-body">${fields.map(([label, value]) => `<div class="rule-detail-field"><div class="rule-detail-label">${label}</div><div class="rule-detail-value">${escapeHtml(String(value))}</div></div>`).join('')}</div></div>`;
}

function renderAllocationPolicyDetail(policy) {
  if (!policy) return '<div class="empty-state">未找到分配比例配置</div>';
  return `
    <div class="rule-detail-layout">
      <div class="rule-detail-section">
        <div class="rule-detail-title">基础信息</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">配置名称</div><div class="rule-detail-value">${detailValue(policy.name)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">配置ID</div><div class="rule-detail-value">${detailValue(policy.id)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">状态</div><div class="rule-detail-value">${detailValue(policy.status)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">更新时间</div><div class="rule-detail-value">${detailValue(policy.updatedAt)}</div></div>
        </div>
      </div>
      <div class="rule-detail-section">
        <div class="rule-detail-title">线索分配策略</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">分配依据</div><div class="rule-detail-value">${detailValue(getAllocationPolicyScopeLabel(policy))}</div></div>
          <div class="rule-detail-field wide"><div class="rule-detail-label">规则内容</div><div class="rule-detail-value">${detailValue(getAllocationPolicySummary(policy))}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">外呼类型</div><div class="rule-detail-value">${detailValue(getAllocationPolicyCallTypes(policy).join('、'))}</div></div>
        </div>
      </div>
      ${renderAllocationPolicyCreationDetails(policy)}
      <div class="rule-detail-section">
        <div class="rule-detail-title">引用情况</div>
        ${renderAllocationPolicyReferenceDetails(policy.id)}
      </div>
    </div>
  `;
}

function renderAllocationPolicyForm(policy = {}) {
  const allocationScope = getAllocationPolicyScope(policy);
  const allocations = getSeriesAllocation(policy);
  const defaultAllocations = allocations.length ? allocations : getDefaultAssignmentAllocationRows();
  return `
    <section class="dispatch-form-section">
      <div class="dispatch-section-title">基础信息</div>
      <div class="dispatch-form-grid">
        <div class="form-group">
          <div class="form-label">配置名称 <span class="required">*</span></div>
          <input class="form-input" id="allocationPolicyName" value="${escapeAttr(policy.name || '')}" placeholder="例：华南城市分配策略" />
        </div>
        <div class="form-group">
          <div class="form-label">状态</div>
          <select class="form-input" id="allocationPolicyStatus">
            ${['启用', '停用'].map(status => `<option value="${status}" ${policy.status === status ? 'selected' : ''}>${status}</option>`).join('')}
          </select>
          <div class="form-hint">只有启用状态的分配比例配置可被线索分配策略引用。</div>
        </div>
      </div>
    </section>

    <section class="dispatch-form-section">
      <div class="dispatch-section-title">分配动作</div>
    <div class="series-action-box">
      <div class="form-group">
        <div class="form-label">分配依据 <span class="required">*</span></div>
        <input type="hidden" id="allocationPolicyByCity" value="${allocationScope === 'none' ? '否' : '是'}" />
        <input type="hidden" id="allocationPolicyScope" value="${allocationScope}" />
        <select class="form-input" id="allocationPolicyScopeSelect" onchange="switchAllocationPolicyCityMode(this.value)">
          <option value="none" ${allocationScope === 'none' ? 'selected' : ''}>不按区域</option>
          <option value="city" ${allocationScope === 'city' ? 'selected' : ''}>关联城市</option>
          <option value="province" ${allocationScope === 'province' ? 'selected' : ''}>关联省份</option>
          <option value="score" ${allocationScope === 'score' ? 'selected' : ''}>关联预评分</option>
        </select>
        <div class="form-hint">可按全国统一比例、城市、省份或预评分区间配置外呼类型比例。</div>
      </div>
      <div id="allocationPolicyDefaultAllocationPanel" style="${allocationScope !== 'none' ? 'display:none' : ''}">
        <div class="form-group">
          <div class="form-label allocation-call-type-title">外呼类型 <span class="required">*</span></div>
          <div class="allocation-call-type-prompt">请在下方配置外呼类型及比例</div>
          <div class="assignment-allocation-panel" id="seriesAllocationRows">
            ${defaultAllocations.map(item => renderSeriesAllocationRow(item)).join('')}
          </div>
          <button class="series-add-channel-btn" type="button" onclick="addSeriesAllocationRow()">添加外呼类型</button>
          <div class="series-form-hint">分配比例配置默认按比例处理，各外呼类型比例合计必须为 100%。</div>
        </div>
      </div>
      <div class="form-group" id="allocationPolicyCityAllocationPanel" style="${allocationScope !== 'none' ? '' : 'display:none'}">
        <div class="form-label" id="allocationPolicyAreaPanelLabel">${getAllocationPolicyScopeLabel(allocationScope)}配置 <span class="required">*</span></div>
        <div id="allocationPolicyAreaAllocationContent">${allocationScope === 'score' ? renderScoreAllocationPanel(policy) : renderSmartCodeCityAllocationPanel(policy, allocationScope)}</div>
      </div>
    </div>
    </section>
  `;
}

function openAllocationPolicyModal(mode, id = null) {
  const policy = id ? getAllocationPolicyById(id) : null;
  editingAllocationPolicyId = mode === 'edit' ? id : null;
  const titleMap = { add: '新增分配比例配置', edit: '编辑分配比例配置', view: '查看分配比例配置' };
  const page = document.getElementById('leadAssignmentConfigPage');
  if (!page) return;
  const subtitle = mode === 'add'
    ? '培育策略 / 线索分配策略 / 分配比例配置 / 新增配置'
    : `培育策略 / 线索分配策略 / 分配比例配置 / ${policy?.name || '配置详情'}`;
  page.innerHTML = `
    <div class="allocation-policy-detail-page">
      <div class="detail-page-header">
        <div>
          <div class="detail-page-title">${titleMap[mode] || '分配比例配置'}</div>
          <div class="detail-page-subtitle">${escapeHtml(subtitle)}</div>
        </div>
        <div class="lead-toolbar-right">
          ${mode === 'view'
            ? `<button class="btn-secondary" type="button" onclick="closeAllocationPolicyPage()">返回列表</button><button class="btn-add" type="button" onclick="openAllocationPolicyModal('edit', '${escapeAttr(policy?.id || '')}')">编辑配置</button>`
            : `<button class="btn-secondary" type="button" onclick="closeAllocationPolicyPage()">取消</button><button class="btn-add" type="button" onclick="saveAllocationPolicy()">保存</button>`}
        </div>
      </div>
      <div class="lead-detail-content">
        <div class="allocation-policy-form-card">
          ${mode === 'view'
            ? renderAllocationPolicyDetail(policy)
            : renderAllocationPolicyForm(policy || { status: '启用', byCity: '否', allocationMode: 'single', allocations: [{ channel: '', percent: 100 }] })}
        </div>
      </div>
    </div>
  `;
  refreshCityAllocationSelectionMutex();
}

function closeAllocationPolicyPage() {
  editingAllocationPolicyId = null;
  activeLeadAssignmentDimension = 'allocation-policy';
  renderLeadAssignmentConfigPage();
}

function switchAllocationPolicyCityMode(triggerOrValue, maybeValue) {
  const value = maybeValue || (triggerOrValue === '是' ? 'city' : triggerOrValue === '否' ? 'none' : triggerOrValue);
  if (maybeValue && triggerOrValue) {
    const group = triggerOrValue.closest('.allocation-city-toggle');
    group?.querySelectorAll('.duration-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.allocationCityMode === value);
    });
  }
  const hiddenInput = document.getElementById('allocationPolicyByCity');
  if (hiddenInput) hiddenInput.value = value === 'none' ? '否' : '是';
  const scopeInput = document.getElementById('allocationPolicyScope');
  if (scopeInput) scopeInput.value = value;
  const scopeSelect = document.getElementById('allocationPolicyScopeSelect');
  if (scopeSelect) scopeSelect.value = value;
  const cityPanel = document.getElementById('allocationPolicyCityAllocationPanel');
  const defaultPanel = document.getElementById('allocationPolicyDefaultAllocationPanel');
  if (cityPanel) cityPanel.style.display = value !== 'none' ? '' : 'none';
  if (defaultPanel) defaultPanel.style.display = value !== 'none' ? 'none' : '';
  const label = document.getElementById('allocationPolicyAreaPanelLabel');
  if (label && value !== 'none') label.innerHTML = `${getAllocationPolicyScopeLabel(value)}配置 <span class="required">*</span>`;
  const content = document.getElementById('allocationPolicyAreaAllocationContent');
  if (content && value !== 'none') content.innerHTML = value === 'score' ? renderScoreAllocationPanel({}) : renderSmartCodeCityAllocationPanel({}, value);
  refreshCityAllocationSelectionMutex();
}

function saveAllocationPolicy() {
  const name = document.getElementById('allocationPolicyName')?.value.trim() || '';
  const allocationScope = document.getElementById('allocationPolicyScope')?.value || (document.getElementById('allocationPolicyByCity')?.value === '是' ? 'city' : 'none');
  const byCity = allocationScope === 'none' ? '否' : '是';
  if (!name) { showToast('请填写配置名称', false); return; }
  let payload = {
    name,
    byCity,
    allocationScope,
    status: document.getElementById('allocationPolicyStatus')?.value || '启用',
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  };
  if (allocationScope === 'score') {
    const scoreResult = collectScoreAllocations();
    if (!scoreResult.ok) { showToast(scoreResult.message, false); return; }
    payload = {
      ...payload,
      allocationMode: 'score',
      allocations: [],
      scoreAllocations: scoreResult.value.scoreAllocations,
      scoreFallbackAllocations: scoreResult.value.scoreFallbackAllocations,
      cityAllocations: [],
      fallbackCityAllocation: null,
      action: getAllocationPolicySummary({ allocationScope: 'score', ...scoreResult.value })
    };
  } else if (allocationScope !== 'none') {
    const cityResult = collectSmartCodeCityAllocations(allocationScope);
    if (!cityResult.ok) { showToast(cityResult.message, false); return; }
    const config = getAllocationAreaConfig(allocationScope);
    payload = {
      ...payload,
      ...cityResult.value,
      allocationMode: 'policy-city',
      allocations: [],
      action: [
        ...cityResult.value.cityAllocations.map(item => `${getCityAllocationAreaLabel(item)}：${renderCityAllocationSummary(item)}`),
        `${config.fallbackLabel}：${renderCityAllocationSummary(cityResult.value.fallbackCityAllocation)}`
      ].join('；')
    };
  } else {
    const allocationResult = collectAllocationRowsFromPanel(document.getElementById('seriesAllocationRows'), name);
    if (!allocationResult.ok) { showToast(allocationResult.message, false); return; }
    const allocations = allocationResult.value;
    payload = {
      ...payload,
      allocationMode: 'ratio',
      allocations,
      allocationScope: 'none',
      cityAllocations: [],
      fallbackCityAllocation: null,
      action: renderCityAllocationSummary({ allocationMode: 'ratio', allocations })
    };
  }
  if (editingAllocationPolicyId) {
    const index = leadAllocationPolicies.findIndex(item => item.id === editingAllocationPolicyId);
    if (index > -1) leadAllocationPolicies[index] = { ...leadAllocationPolicies[index], ...payload };
    showToast('分配比例配置已更新', true);
  } else {
    const nextNo = leadAllocationPolicies.length + 1;
    leadAllocationPolicies.push({ id: `AP-${String(nextNo).padStart(3, '0')}`, ...payload, creationSource: '人工创建', createdBy: typeof aiStrategyCurrentAccountName === 'function' ? aiStrategyCurrentAccountName() : '未记录', createdAt: new Date().toLocaleString('zh-CN', { hour12: false }) });
    showToast('分配比例配置已创建', true);
  }
  closeAllocationPolicyPage();
}

function deleteAllocationPolicy(id) {
  const policy = getAllocationPolicyById(id);
  if (!policy) return;
  const references = getAllocationPolicyReferences(id);
  if (references.length) {
    showToast(`配置「${policy.name}」被 ${references.length} 条线索分配策略引用，请先解除关联后再删除`, false);
    return;
  }
  if (!confirm(`确认删除分配比例配置「${policy.name}」？`)) return;
  const index = leadAllocationPolicies.findIndex(item => item.id === id);
  if (index > -1) leadAllocationPolicies.splice(index, 1);
  showToast('分配比例配置已删除', true);
  renderAllocationPolicyPanel('leadAssignmentDimensionPanel');
}

function toggleAllocationPolicy(id) {
  const policy = getAllocationPolicyById(id);
  if (!policy) return;
  const nextStatus = policy.status === '启用' ? '停用' : '启用';
  const references = getAllocationPolicyReferences(id);
  const hint = nextStatus === '停用'
    ? `${references.length ? '该配置当前被 ' + references.length + ' 处线索分配策略引用；' : ''}停用后，历史关联仍保留，新增或编辑线索分配策略时不可再选择该配置。`
    : '启用后，新增或编辑线索分配策略时可重新选择该配置。';
  if (!confirm(`确认${nextStatus}分配比例配置「${policy.name}」？${hint}`)) return;
  policy.status = nextStatus;
  policy.updatedAt = '2026-07-22 10:30';
  showToast(`分配比例配置已${nextStatus}`, true);
  renderAllocationPolicyPanel('leadAssignmentDimensionPanel');
}

function exportLeadAssignmentRules(dimensionKey) {
  const dimension = leadAssignmentDimensions.find(item => item.key === dimensionKey);
  if (!dimension) return;
  const rows = dimension.rules.map(rule => [
    rule.id || '',
    rule.name || '',
    rule.keyValue || '',
    rule.condition || '',
    rule.action || '',
    (rule.callTypes || []).join('、'),
    String(rule.sort || ''),
    rule.status || '',
    rule.updatedAt || ''
  ]);
  const sheets = [
    {
      name: `${dimension.name}分配规则`,
      columns: ['规则ID', '策略名称', '配置内容', '匹配条件', '分配动作', '外呼类型', '排序/权重', '状态', '更新时间'],
      rows: rows
    }
  ];
  downloadExcelWorkbookFile(
    `${dimension.name}线索分配策略导出_${new Date().toISOString().slice(0, 10)}.xls`,
    sheets,
    `已成功导出 ${dimension.rules.length} 条${dimension.name}分配规则`
  );
}

registerUiActionCallback('assignment-dimension-switch', switchLeadAssignmentDimension);
registerUiActionCallback('assignment-filter', filterLeadAssignmentDimensionTable);
registerUiActionCallback('assignment-reset', resetLeadAssignmentFilters);
registerUiActionCallback('assignment-export', exportLeadAssignmentRules);
registerUiActionCallback('assignment-page-size', changeLeadAssignmentPageSize);
registerUiActionCallback('assignment-page-select', selectLeadAssignmentPage);
registerUiActionCallback('assignment-delete-rule', deleteLeadAssignmentRule);
registerUiActionCallback('allocation-reference', openAllocationPolicyReferenceRule);
registerUiActionCallback('allocation-filter', filterAllocationPolicyTable);
registerUiActionCallback('allocation-reset', resetAllocationPolicyFilters);
registerUiActionCallback('allocation-open-modal', openAllocationPolicyModal);
registerUiActionCallback('allocation-toggle', toggleAllocationPolicy);
registerUiActionCallback('allocation-delete', deleteAllocationPolicy);
registerUiActionCallback('allocation-page-size', changeAllocationPolicyPageSize);
registerUiActionCallback('allocation-page-select', selectAllocationPolicyPage);

document.addEventListener('click', function(event) {
  if (!event.target.closest('.area-multi-picker')) {
    document.querySelectorAll('.area-multi-picker.open').forEach(item => item.classList.remove('open'));
  }
  if (!event.target.closest('.rule-agent-popover-wrap')) {
    document.querySelectorAll('.rule-agent-popover-wrap.active').forEach(item => item.classList.remove('active'));
  }
});
