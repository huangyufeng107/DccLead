// ===== Strategy Configurator Pages =====
const strategyConfiguratorPageMap = {
  'manual-unconnected-config': 'manualUnconnected',
  'manual-unconverted-config': 'manualUnconverted',
  'follow-count-config': 'followCount',
  'precall-task-config': 'precallTask',
  'excellent-project-config': 'excellentProject',
  'excellent-channel-config': 'excellentChannel',
  'excellent-sc-config': 'excellentSc'
};

const configuratorOptions = {
  leadStatus: ['休眠失联', '战败', '无效结案'],
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
  yesNo: ['是', '否'],
  status: ['启用', '停用']
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
  excellentSc: 1
};
let strategyConfiguratorPageSizeState = {
  followCount: 10,
  manualUnconnected: 10,
  manualUnconverted: 10,
  precallTask: 10,
  excellentProject: 10,
  excellentChannel: 10,
  excellentSc: 10
};

let strategyConfiguratorData = {
  followCount: [
    { sortOrder: 1, id: 1012, leadStatus: '休眠失联', followUpCount: 1, updatedAt: '2020-06-01 13:59:59 操作人：张三' },
    { sortOrder: 2, id: 1013, leadStatus: '战败', followUpCount: 2, updatedAt: '2020-06-02 13:59:59 操作人：李四' },
    { sortOrder: 3, id: 1014, leadStatus: '无效结案', followUpCount: 3, updatedAt: '2020-06-02 13:59:59 操作人：李四' }
  ],
  manualUnconnected: [
    { sortOrder: 1, id: 1012, ruleName: '分配配置A', status: '启用', contactStatus: '无人接听', carSeries: 'N7', contactRepeatCount: 0, maxOutboundCount: '10天2次', pushInterval: 'N+1', outboundType: '科大讯飞-冷线索', belongType: 'SmartCode', belongValues: ['SC-N6-0891', 'SC-GZ-2026'], includeIncomplete: '是' },
    { sortOrder: 2, id: 1013, ruleName: '分配配置B', status: '启用', contactStatus: '无人接听', carSeries: 'N6', contactRepeatCount: 0, maxOutboundCount: '10天2次', pushInterval: 'N+1', outboundType: '科大讯飞-留资未满', belongType: 'SmartCode', belongValues: ['SC-SY-0234'], includeIncomplete: '是' },
    { sortOrder: 3, id: 1014, ruleName: '分配配置C', status: '停用', contactStatus: '无人接听', carSeries: '华为天籁', contactRepeatCount: 0, maxOutboundCount: '10天2次', pushInterval: 'N+1', outboundType: '一知-冷线索', belongType: 'SmartCode', belongValues: ['SC-XK-7712'], includeIncomplete: '是' }
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
    { sortOrder: 1, id: 1012, scProjectName: '项目A', carSeries: ['N7'], createdAt: '2020-06-01 13:59:59 操作人：张三', updatedAt: '2020-06-01 13:59:59 操作人：李四' },
    { sortOrder: 2, id: 1013, scProjectName: '项目B', carSeries: ['N6'], createdAt: '2020-06-02 13:59:59 操作人：李四', updatedAt: '2020-06-02 13:59:59 操作人：李四' }
  ],
  excellentChannel: [
    { sortOrder: 1, id: 1012, scChannel: '渠道A', carSeries: ['N7'], createdAt: '2020-06-01 13:59:59 操作人：张三', updatedAt: '2020-06-01 13:59:59 操作人：李四' },
    { sortOrder: 2, id: 1013, scChannel: '渠道B', carSeries: ['N6'], createdAt: '2020-06-02 13:59:59 操作人：李四', updatedAt: '2020-06-02 13:59:59 操作人：李四' }
  ],
  excellentSc: [
    { sortOrder: 1, id: 1012, scProjectName: 'SC-001', carSeries: ['N7'], createdAt: '2020-06-01 13:59:59 操作人：张三', updatedAt: '2020-06-01 13:59:59 操作人：李四' },
    { sortOrder: 2, id: 1013, scProjectName: 'SC-002', carSeries: ['N6'], createdAt: '2020-06-02 13:59:59 操作人：李四', updatedAt: '2020-06-02 13:59:59 操作人：李四' }
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
      { label: '接触状态', field: 'contactStatus', type: 'select', options: 'contactStatus' },
      { label: '回访车系', field: 'carSeries', type: 'select', options: 'carSeries' },
      { label: '外呼类型', field: 'outboundType', type: 'select', options: 'outboundType' },
      { label: '命中类型', field: 'belongType', type: 'select', options: 'belongType', excludeValues: ['请选择'] }
    ],
    actions: ['add'],
    columns: [
      { label: '#', field: 'sortOrder', width: 70 },
      { label: '配置名称', field: 'ruleName', width: 150 },
      { label: '外呼类型', field: 'outboundType', width: 130 },
      { label: '接触状态', field: 'contactStatus', width: 120 },
      { label: '回访车系', field: 'carSeries', width: 120 },
      { label: '接触状态重复次数', field: 'contactRepeatCount', width: 150 },
      { label: 'AI外呼次数≤x次', field: 'maxOutboundCount', width: 150 },
      { label: '命中类型', field: 'belongType', width: 120 },
      { label: '包含留资未满', field: 'includeIncomplete', width: 150 },
      { label: '状态', field: 'status', width: 100, status: true }
    ],
    formSections: ['命中', '执行动作'],
    form: [
      { label: '配置名称', field: 'ruleName', type: 'text', required: true, section: '基础信息', placeholder: '请输入配置名称' },
      { label: '状态', field: 'status', type: 'select', options: 'status', required: true, section: '基础信息', defaultValue: '启用' },
      { label: '接触状态', field: 'contactStatus', type: 'select', options: 'contactStatus', required: true, section: '基础信息', placeholderOption: '请选择' },
      { label: '回访车系', field: 'carSeries', type: 'select', options: 'carSeries', section: '基础信息', placeholderOption: '请选择' },
      { label: '接触状态重复次数', field: 'contactRepeatCount', type: 'number', required: true, allowZero: true, section: '命中', hintHtml: '填写非负整数，<strong>0次代表不限制</strong>。', placeholder: '请输入次数' },
      { label: '包含留资未满', field: 'includeIncomplete', type: 'select', options: 'yesNo', required: true, section: '命中', defaultValue: '否' },
      { label: 'AI外呼次数≤x次', field: 'maxOutboundCount', type: 'dayCount', required: true, section: '命中' },
      { label: '命中类型', field: 'belongType', type: 'select', options: 'belongType', required: true, section: '命中', defaultValue: '请选择' },
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
    formSections: ['命中', '执行动作'],
    form: [
      { label: '配置名称', field: 'ruleName', type: 'text', required: true, section: '基础信息', placeholder: '请输入配置名称' },
      { label: '状态', field: 'status', type: 'select', options: 'status', required: true, section: '基础信息', defaultValue: '启用' },
      { label: '回访结果', field: 'leadStatus', type: 'select', options: 'manualUnconvertedReviewResult', required: true, section: '基础信息', defaultValue: '请选择回访结果' },
      { label: '异常原因', field: 'abnormalReason', type: 'leadStatusReason', required: true, section: '基础信息' },
      { label: '回访车系', field: 'carSeries', type: 'select', options: 'carSeries', section: '基础信息' },
      { label: '回访更新时间≥任务接收时间N天', field: 'updateDelayDays', type: 'number', required: true, allowZero: true, section: '命中' },
      { label: '包含留资未满', field: 'includeIncomplete', type: 'select', options: 'yesNo', required: true, section: '命中', defaultValue: '否' },
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
      { label: '配置名称', field: 'ruleName', type: 'text' },
      { label: '命中条件', field: 'matchSummary', type: 'text' },
      { label: '意向车系', field: 'carSeries', type: 'select', options: 'carSeries' }
    ],
    actions: ['add'],
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
    title: '优秀大项目配置器',
    desc: '维护 SC 大项目名白名单，并与意向车系关联，支持 Excel 导入导出。',
    addLabel: '新增配置',
    entityLabel: 'SC大项目名',
    entityField: 'scProjectName',
    search: [
      { label: '主键ID', field: 'id', type: 'text' },
      { label: 'SC大项目名', field: 'scProjectName', type: 'selectFromData' },
      { label: '意向车系', field: 'carSeries', type: 'select', options: 'carSeries' }
    ],
    actions: ['refresh', 'add', 'export', 'import'],
    columns: [
      { label: '序号', field: 'sortOrder', width: 70 },
      { label: '主键ID', field: 'id', width: 90 },
      { label: 'SC大项目名', field: 'scProjectName', width: 220 },
      { label: '意向车系', field: 'carSeries', width: 180 },
      { label: '创建时间', field: 'createdAt', width: 220 },
      { label: '更新时间', field: 'updatedAt', width: 220 }
    ],
    form: [
      { label: '序号', field: 'sortOrder', type: 'number', required: true },
      { label: 'SC大项目名', field: 'scProjectName', type: 'text', required: true },
      { label: '意向车系', field: 'carSeries', type: 'multiselect', options: 'carSeries' }
    ]
  },
  excellentChannel: {
    pageId: 'excellentChannelConfigPage',
    title: '优秀渠道配置器',
    desc: '维护 SmartCode 渠道白名单，并与意向车系关联，用于线索转手规则匹配。',
    addLabel: '新增配置',
    entityLabel: 'SC渠道',
    entityField: 'scChannel',
    search: [
      { label: '主键ID', field: 'id', type: 'text' },
      { label: 'SC渠道', field: 'scChannel', type: 'selectFromData' },
      { label: '意向车系', field: 'carSeries', type: 'select', options: 'carSeries' }
    ],
    actions: ['refresh', 'add'],
    columns: [
      { label: '序号', field: 'sortOrder', width: 70 },
      { label: '主键ID', field: 'id', width: 90 },
      { label: 'SC渠道', field: 'scChannel', width: 180 },
      { label: '意向车系', field: 'carSeries', width: 180 },
      { label: '创建时间', field: 'createdAt', width: 220 },
      { label: '更新时间', field: 'updatedAt', width: 220 }
    ],
    form: [
      { label: '序号', field: 'sortOrder', type: 'number', required: true },
      { label: 'SC渠道', field: 'scChannel', type: 'text', required: true },
      { label: '意向车系', field: 'carSeries', type: 'multiselect', options: 'carSeries' }
    ]
  },
  excellentSc: {
    pageId: 'excellentScConfigPage',
    title: '优秀SC配置器',
    desc: '维护优秀 SmartCode 白名单，并与意向车系关联，支持 Excel 导入导出。',
    addLabel: '新增配置',
    entityLabel: 'SC大项目名',
    entityField: 'scProjectName',
    search: [
      { label: '主键ID', field: 'id', type: 'text' },
      { label: 'SC大项目名', field: 'scProjectName', type: 'selectFromData' },
      { label: '意向车系', field: 'carSeries', type: 'select', options: 'carSeries' }
    ],
    actions: ['refresh', 'add', 'export', 'import'],
    columns: [
      { label: '序号', field: 'sortOrder', width: 70 },
      { label: '主键ID', field: 'id', width: 90 },
      { label: 'SC大项目名', field: 'scProjectName', width: 220 },
      { label: '意向车系', field: 'carSeries', width: 180 },
      { label: '创建时间', field: 'createdAt', width: 220 },
      { label: '更新时间', field: 'updatedAt', width: 220 }
    ],
    form: [
      { label: '序号', field: 'sortOrder', type: 'number', required: true },
      { label: 'SC大项目名', field: 'scProjectName', type: 'text', required: true },
      { label: '意向车系', field: 'carSeries', type: 'multiselect', options: 'carSeries' }
    ]
  }
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
  hideLeadPages();
  page.classList.add('show');
  page.innerHTML = `
    <div class="page-hero">
      <div>
        <div class="page-title">${def.title}</div>
        <div class="page-desc">${def.desc}</div>
      </div>
      ${renderStrategyConfiguratorSummary(key)}
    </div>
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
  if (['manualUnconnected', 'manualUnconverted', 'precallTask'].includes(key)) return renderFlatStrategyConfiguratorFilterRow(key, def);
  const actionHtml = key === 'manualUnconnected'
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
  if (field.type === 'select' || field.type === 'selectFromData') {
    let options = field.type === 'selectFromData'
      ? [...new Set((strategyConfiguratorData[key] || []).map(row => row[field.field]).filter(Boolean))]
      : (configuratorOptions[field.options] || []);
    if (field.excludeValues?.length) options = options.filter(item => !field.excludeValues.includes(item));
    const onchange = key === 'manualUnconnected' ? ` onchange="queryStrategyConfigurator('${key}')"` : '';
    return `<div class="search-field"><label>${field.label}</label><select class="lead-select" id="${id}"${onchange}><option value="">全部</option>${options.map(item => `<option value="${escapeAttr(item)}">${escapeHtml(item)}</option>`).join('')}</select></div>`;
  }
  const oninput = key === 'manualUnconnected' ? ` oninput="queryStrategyConfigurator('${key}')"` : '';
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
      let value = document.getElementById(`cfg_${key}_${field.field}`)?.value || '';
      if (value === '请选择') value = '';
      if (!value) return true;
      if (field.field === 'keyword') {
        return Object.values(row).some(item => {
          const text = Array.isArray(item) ? item.join('、') : String(item ?? '');
          return text.includes(value);
        });
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
      if (key === 'precallTask') {
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
  if (key === 'precallTask' && col.field === 'priority') {
    return `<span class="policy-plain-text">P${row.priority || 99}</span>`;
  }
  if (key === 'precallTask' && col.field === 'ruleName') {
    return `
      <div class="rule-text-stack">
        <div class="rule-text-main">${escapeHtml(row.ruleName || row.taskGroupName || '—')}</div>
        <div class="rule-muted">配置ID：POC-${String(row.id).padStart(3, '0')}</div>
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
    if (input) input.value = '';
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
  if (key === 'manualUnconnected' && mode !== 'view') {
    syncUnconnectedBelongTypeFields(row);
    updateCallTypeTagPickerSummary('unconnectedCallType');
  }
  if (key === 'manualUnconverted' && mode !== 'view') {
    syncManualUnconvertedAbnormalReason(row?.abnormalReason || '');
  }
  if (key === 'precallTask' && mode !== 'view') {
    if (row?.attributeType === 'SmartCode') updatePrecallSmartCodeSelectedCount();
    if (row?.attributeType === '大项目名') updatePrecallProjectSelectedCount();
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
          ['状态', row.status || '启用'],
          ['接触状态', row.contactStatus],
          ['回访车系', row.carSeries]
        ]
      },
      {
        title: '命中',
        fields: [
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
          ['状态', row.status || '启用'],
          ['回访结果', row.leadStatus],
          ['异常原因', getSelectedLeadDispatchAbnormalReason(getManualUnconvertedMappedLeadStatus(row.leadStatus || ''), row.abnormalReason || '') || '不更新'],
          ['回访车系', row.carSeries]
        ]
      },
      {
        title: '命中',
        fields: [
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
  return renderStrategyConfiguratorForm(key, row, true);
}

function renderRuleDetailSections(sections) {
  return `<div class="rule-detail-layout">${sections.map(section => `<section class="rule-detail-section"><div class="rule-detail-title">${section.title}</div><div class="rule-detail-body">${section.fields.map(([label, value]) => `<div class="rule-detail-field"><div class="rule-detail-label">${label}</div><div class="rule-detail-value">${detailValue(value)}</div></div>`).join('')}</div></section>`).join('')}</div>`;
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
  if (!config) return '<div class="form-label">属性值</div><div class="series-form-hint">请先选择命中类型</div>';
  if (attributeType === '大项目名') return renderPrecallProjectNameInput(selectedValues, smartCodeInputMode, readonly);
  if (attributeType !== 'SmartCode') return `<div class="form-label">${config.label} <span class="required">*</span></div>${renderPrecallCheckboxes('precallAttributeValue', config.options, selectedValues, readonly)}`;
  precallSmartCodeInputModeState = smartCodeInputMode === 'manual' ? 'manual' : 'picker';
  const isManual = precallSmartCodeInputModeState === 'manual';
  const disabled = readonly ? 'disabled' : '';
  return `<div class="form-label">SmartCode <span class="required">*</span></div>
    <div class="series-mode-toggle" style="width:100%; margin-bottom:12px">
      <button class="duration-tab ${!isManual ? 'active' : ''}" type="button" id="precallSmartCodePickerModeBtn" ${readonly ? 'disabled' : 'onclick="switchPrecallSmartCodeInputMode(\'picker\')"'}>下拉勾选</button>
      <button class="duration-tab ${isManual ? 'active' : ''}" type="button" id="precallSmartCodeManualModeBtn" ${readonly ? 'disabled' : 'onclick="switchPrecallSmartCodeInputMode(\'manual\')"'}>手动输入</button>
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
    <div id="precallSmartCodeManualPanel" style="${isManual ? '' : 'display:none'}"><textarea class="form-input assignment-manual-textarea" id="precallSmartCodeManualInput" rows="4" placeholder="可一次粘贴多个 SmartCode，支持换行、逗号、分号或空格分隔" ${disabled}>${escapeHtml(selectedValues.join('\n'))}</textarea><div class="series-form-hint">保存时会自动拆分并去重；不在下拉选项中的 SmartCode 也可直接录入。</div></div>`;
}

function switchPrecallSmartCodeInputMode(mode) {
  precallSmartCodeInputModeState = mode === 'manual' ? 'manual' : 'picker';
  const isManual = precallSmartCodeInputModeState === 'manual';
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
  return `<div class="form-label">大项目名 <span class="required">*</span></div><div class="form-label" style="margin-top:12px">录入方式</div>
    <div class="series-mode-toggle" style="width:100%; margin:12px 0">
      <button class="duration-tab ${!isManual ? 'active' : ''}" type="button" id="precallProjectPickerModeBtn" ${readonly ? 'disabled' : 'onclick="switchPrecallProjectNameInputMode(\'picker\')"'}>下拉勾选</button>
      <button class="duration-tab ${isManual ? 'active' : ''}" type="button" id="precallProjectManualModeBtn" ${readonly ? 'disabled' : 'onclick="switchPrecallProjectNameInputMode(\'manual\')"'}>手动输入</button>
    </div>
    <div id="precallProjectPickerPanel" style="${isManual ? 'display:none' : ''}"><div class="tag-picker project-name-picker ${readonly ? 'readonly' : ''}"><button class="tag-picker-trigger placeholder" id="precallProjectTrigger" type="button" ${readonly ? 'disabled' : 'onclick="togglePrecallProjectPicker()"'}>请选择大项目名</button><div class="tag-picker-panel" id="precallProjectOptionsPanel"><div class="tag-picker-toolbar"><span id="precallProjectSelectedCount">已选 ${selectedValues.length} / ${projectNameOptions.length}</span>${readonly ? '' : '<div class="tag-picker-actions"><button class="tag-picker-action" type="button" onclick="selectAllPrecallProjectOptions()">全选</button><button class="tag-picker-action" type="button" onclick="clearPrecallProjectOptions()">清空</button></div>'}</div><div class="tag-picker-list">${projectNameOptions.map(item => `<label class="tag-option ${selectedValues.includes(item) ? 'selected' : ''}"><input type="checkbox" name="precallAttributeValue" value="${escapeAttr(item)}" ${selectedValues.includes(item) ? 'checked' : ''} ${disabled} onchange="updatePrecallProjectSelectedCount()" />${escapeHtml(item)}</label>`).join('')}</div></div></div></div>
    <div id="precallProjectManualPanel" style="${isManual ? '' : 'display:none'}"><textarea class="form-input assignment-manual-textarea" id="precallProjectManualInput" rows="4" placeholder="可一次粘贴多个大项目名，支持换行、逗号、分号或空格分隔" ${disabled}>${escapeHtml(selectedValues.join('\n'))}</textarea><div class="series-form-hint">保存时会自动拆分并去重；不在下拉选项中的大项目名也可直接录入。</div></div>`;
}

function switchPrecallProjectNameInputMode(mode) {
  precallProjectNameInputModeState = mode === 'manual' ? 'manual' : 'picker';
  const isManual = precallProjectNameInputModeState === 'manual';
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
      <div class="form-group"><div class="form-label">命中类型 <span class="required">*</span></div><select class="form-input" id="precallAttributeType" onchange="syncPrecallAttributeFields()" ${disabled}>${configuratorOptions.attributeType.map(item => `<option value="${escapeAttr(item)}" ${attributeType === item ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select></div>
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
    { title: '命中条件', fields: [['命中类型', row.attributeType], [row.attributeType || '属性值', (row.attributeValues || []).join('、')], ['线索状态（且）', row.attributeType !== '线索状态' && (row.leadStatuses || []).length ? row.leadStatuses.join('、') : '不限'], ['意向车系', (row.carSeries || []).join('、') || '不限']] },
    { title: '执行动作', fields: [['预外呼线路', row.precallLine], ['生效时段', getPrecallWorkTimeSummary(row.workTime)], ['工作时段优先级', row.workTimePriority], ['工作时段技能组', row.workTimeSkillGroup], ['非工作时段优先级', row.offWorkPriority], ['非工作时段技能组', row.offWorkSkillGroup]] }
  ];
  return renderRuleDetailSections(sections);
}

function renderStrategyConfiguratorForm(key, row, readonly = false) {
  if (key === 'precallTask') return renderPrecallTaskForm(row, readonly);
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
    if (key === 'manualUnconnected' && sectionName === '命中') {
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
  if (field.type === 'dayCount') {
    const parsed = parseStrategyDayCountValue(value);
    const integerAttrs = getNonNegativeIntegerInputAttrs(key, field.field);
    return `<div class="${groupClass}"><div class="form-label">${field.label}${required}</div><div class="day-count-control"><span class="day-count-prefix">最近</span><div class="day-count-input"><input class="form-input" id="${id}_days" type="number" min="0"${integerAttrs} value="${escapeAttr(parsed.days)}" placeholder="0" ${disabled} /><span class="day-count-suffix">天</span></div><span class="day-count-connector">内 ≤</span><div class="day-count-input"><input class="form-input" id="${id}_count" type="number" min="0"${integerAttrs} value="${escapeAttr(parsed.count)}" placeholder="0" ${disabled} /><span class="day-count-suffix">次</span></div></div></div>`;
  }
  if (field.type === 'readonly') {
    return `<div class="${groupClass}"><div class="form-label">${field.label}${required}</div><input class="form-input" id="${id}" type="text" value="${escapeAttr(value)}" readonly />${hint}</div>`;
  }
  if (field.type === 'select') {
    const options = configuratorOptions[field.options] || [];
    const onchange = field.field === 'belongType'
      ? 'onchange="syncUnconnectedBelongTypeFields()"'
      : (key === 'manualUnconverted' && field.field === 'leadStatus' ? 'onchange="syncManualUnconvertedAbnormalReason()"' : '');
    const selectOptions = field.defaultValue && !options.includes(field.defaultValue) ? [field.defaultValue, ...options] : options;
    const placeholderOption = field.placeholderOption ? `<option value="" ${!value ? 'selected' : ''}>${escapeHtml(field.placeholderOption)}</option>` : '';
    return `<div class="${groupClass}"><div class="form-label">${field.label}${required}</div><select class="form-input" id="${id}" ${onchange} ${disabled}>${placeholderOption}${selectOptions.map(item => `<option value="${escapeAttr(item)}" ${value === item ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select>${hint}</div>`;
  }
  if (field.type === 'leadStatusReason') {
    const leadStatus = getManualUnconvertedMappedLeadStatus(row.leadStatus || '');
    const locked = !leadStatus || isLeadStatusAbnormalReasonLocked(leadStatus);
    const selected = leadStatus ? getSelectedLeadDispatchAbnormalReason(leadStatus, value || '') : '';
    const reasonOptions = leadStatus ? getLeadDispatchAbnormalReasonOptions(leadStatus, value || '') : [''];
    return `<div class="${groupClass}" id="manualUnconvertedAbnormalReasonGroup"><div class="form-label">${field.label}${required}</div><select class="form-input" id="${id}" ${locked || readonly ? 'disabled' : ''}>${renderLeadDispatchOptionList(reasonOptions, selected, locked ? '不更新' : '请选择异常原因')}</select>${hint}</div>`;
  }
  if (field.type === 'multiselect') {
    const selected = Array.isArray(value) ? value : (value ? [value] : []);
    const options = configuratorOptions[field.options] || [];
    return `<div class="form-group wide"><div class="form-label">${field.label}${required}</div><select class="form-input" id="${id}" multiple size="4" ${disabled}>${options.map(item => `<option value="${escapeAttr(item)}" ${selected.includes(item) ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select><div class="series-form-hint">按住 Command/Ctrl 可多选</div>${hint}</div>`;
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

function syncManualUnconvertedAbnormalReason(currentReason = '') {
  const statusSelect = document.getElementById('cfgForm_leadStatus');
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
      const reviewResult = document.getElementById('cfgForm_leadStatus')?.value || '';
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
    const el = document.getElementById(`cfgForm_${field.field}`);
    if (!el) continue;
    let value = field.type === 'multiselect' ? Array.from(el.selectedOptions).map(option => option.value) : el.value.trim();
    if (field.field === 'belongType' && value === '请选择') return { ok: false, message: '请选择命中类型' };
    if (field.required && field.defaultValue && value === field.defaultValue) return { ok: false, message: `请选择${field.label}` };
    if (field.required && (!value || (Array.isArray(value) && !value.length))) return { ok: false, message: `请填写${field.label}` };
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
  showToast(`${getStrategyConfiguratorDef(key).title}已按当前条件导出为 Excel`, true);
}

function openStrategyConfiguratorImport(key) {
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
