// ===== AI Outbound Frequency Audit (下发审核) =====

// Audio Player & Transcript State
let activeAuditAudioCallId = '';
let auditAudioPlaying = false;
let auditAudioProgressSeconds = 0;
let auditAudioDurationSeconds = 0;
let auditAudioTimer = null;
let activeAuditTranscriptCallId = '';

// 不下发为独立拦截流转：不可进入“总部_高意向”。
const auditRejectLeadStatusOptions = leadDispatchFormLeadStatusOptions.filter(status => status !== '总部_高意向');

// Mock data list
let leadAuditList = [
  { 
    id: 'PYXS202607240001', 
    headquarterLeadId: 'HQ202607240188',
    taskCode: 'PYRW202607240031',
    workOrderCode: 'AIHF202607240188',
    callId: 'CALL-20260724-0000188',
    name: '王先生', 
    phone: '13888886721', 
    displayPhone: '138****6721', 
    leadType: '留资未满', 
    coldTag: '门店冷线索', 
    callCount: 2, 
    latestTime: '2026-07-24 10:15:30', 
    ruleName: '冷线索高意向有店下发', 
    scenario: '培育方式分配给AI跟进', 
    status: '待审核', 
    updateLeadStatus: '', 
    abnormalReason: '', 
    updateIntentLevel: '', 
    location: '广东广州', 
    carSeries: 'N6', 
    dealer: '广州东风日产天河店', 
    dealerCode: 'DLR-GD-GZ-001',
    transcript: {
      duration: '01:15',
      callType: 'AI呼叫',
      messages: [
        { role: 'agent', text: '您好，这里是东风日产智能服务，请问是王先生吗？最近看到您看中了我们的新款N6车系。' },
        { role: 'customer', text: '对啊，主要是听说空间比较大。' },
        { role: 'agent', text: '是的，王先生。我们N6后排是可以完全放平的，周末带家人出去非常宽敞。我们这周在广州天河店正好有现车试驾活动，您可以来感受一下，我帮您安排周六上午可以吗？', tag: 'intent' },
        { role: 'customer', text: '周六上午可以，那我就去天河店吧。' },
        { role: 'agent', text: '太好了，已帮您登记，具体地址信息等下会发送到您这个手机上，祝您生活愉快！', tag: 'action' }
      ],
      tags: ['大空间意向', '同意试驾']
    }
  },
  { 
    id: 'PYXS202607240017', 
    headquarterLeadId: 'HQ202607240205',
    taskCode: 'PYRW202607240047',
    workOrderCode: 'AIHF202607240205',
    callId: 'CALL-20260724-0000205',
    name: '李女士', 
    phone: '13911111234', 
    displayPhone: '139****1234', 
    leadType: '三无忧', 
    coldTag: '三无忧线索', 
    callCount: 2, 
    latestTime: '2026-07-24 09:44:12', 
    ruleName: '冷线索高意向有店下发', 
    scenario: '培育方式分配给人工转化回AI跟进', 
    status: '待审核', 
    updateLeadStatus: '', 
    abnormalReason: '', 
    updateIntentLevel: '', 
    location: '北京北京', 
    carSeries: 'N7', 
    dealer: '北京东风日产朝阳店', 
    dealerCode: 'DLR-BJ-CY-002',
    transcript: {
      duration: '00:50',
      callType: 'AI呼叫',
      messages: [
        { role: 'agent', text: '您好，这里是东风日产智能助手，李女士是吗？您之前关注的N7车系有最新的优惠政策啦。' },
        { role: 'customer', text: '什么优惠？我之前觉得价格有点超预算。' },
        { role: 'agent', text: '现在限时订车可以享受终身免基础保养和万元置换补贴哦。' },
        { role: 'customer', text: '听起来还行，那你们朝阳店有现车吗？' },
        { role: 'agent', text: '有的李女士，朝阳店现车充足，我帮您预约这周末专人体验，下午两点行吗？', tag: 'intent' },
        { role: 'customer', text: '行，下午可以去看看。' }
      ],
      tags: ['关注优惠', '意向到店']
    }
  },
  { 
    id: 'PYXS202607230021', 
    headquarterLeadId: 'HQ202607230144',
    taskCode: 'PYRW202607230088',
    workOrderCode: 'AIHF202607230144',
    callId: 'CALL-20260723-0000144',
    name: '张先生', 
    phone: '13666668888', 
    displayPhone: '136****8888', 
    leadType: 'NEV线索中台', 
    coldTag: '总部冷线索', 
    callCount: 3, 
    latestTime: '2026-07-23 15:20:00', 
    ruleName: '冷线索高意向有店下发', 
    scenario: '培育方式分配给AI跟进', 
    status: '待审核', 
    updateLeadStatus: '', 
    abnormalReason: '', 
    updateIntentLevel: '', 
    location: '广东深圳', 
    carSeries: 'NX8', 
    dealer: '深圳东风日产南山店', 
    dealerCode: 'DLR-GD-SZ-003',
    transcript: {
      duration: '02:10',
      callType: 'AI呼叫',
      messages: [
        { role: 'agent', text: '您好，这里是东风日产。张先生，您前几天预约的NX8新车首发，目前已经可以订车了。' },
        { role: 'customer', text: '哦，NX8啊，配置出来了没有？' },
        { role: 'agent', text: '已经发布了，双电机四驱和最新的超智驾系统都是标配，深圳南山店目前有样车展示。您这周末要不过来看一下实车？', tag: 'intent' },
        { role: 'customer', text: '好啊，那给我发个定位吧，我周日过去。' },
        { role: 'agent', text: '好的，定位已发到您手机，南山店见！', tag: 'action' }
      ],
      tags: ['新车首发', '配置咨询']
    }
  },
  { 
    id: 'PYXS202607220014', 
    headquarterLeadId: 'HQ202607220102',
    taskCode: 'PYRW202607220063',
    workOrderCode: 'AIHF202607220102',
    callId: 'CALL-20260722-0000102',
    name: '陈先生', 
    phone: '15899999999', 
    displayPhone: '158****9999', 
    leadType: '留资未满', 
    coldTag: '门店冷线索', 
    callCount: 2, 
    latestTime: '2026-07-22 11:30:00', 
    ruleName: '冷线索高意向有店下发', 
    scenario: '培育方式分配给AI跟进', 
    status: '已下发', 
    updateLeadStatus: '总部_高意向', 
    abnormalReason: '', 
    updateIntentLevel: 'B - B(计划三个月内买车)', 
    location: '广东广州', 
    carSeries: 'N6', 
    dealer: '广州东风日产天河店', 
    dealerCode: 'DLR-GD-GZ-001',
    transcript: {
      duration: '01:05',
      callType: 'AI外呼',
      messages: [
        { role: 'agent', text: '您好，我是东风日产智能服务。请问是陈先生吗？最近在看我们的车吗？' },
        { role: 'customer', text: '对，看看。' },
        { role: 'agent', text: '我们这周末在天河店有团购专场，价格是本月最低的，您有时间过来了解下吗？', tag: 'intent' },
        { role: 'customer', text: '周末可以去转转。' }
      ],
      tags: ['低活跃', '可约到店']
    }
  },
  { 
    id: 'PYXS202607210066', 
    headquarterLeadId: 'HQ202607210377',
    taskCode: 'PYRW202607210142',
    workOrderCode: 'AIHF202607210377',
    callId: 'CALL-20260721-0000377',
    name: '赵女士', 
    phone: '18500001111', 
    displayPhone: '185****1111', 
    leadType: '三无忧', 
    coldTag: '三无忧线索', 
    callCount: 2, 
    latestTime: '2026-07-21 16:45:00', 
    ruleName: '冷线索高意向有店下发', 
    scenario: '培育方式分配给AI跟进', 
    status: '不下发', 
    updateLeadStatus: '总部_休眠未购', 
    abnormalReason: '家人不同意', 
    updateIntentLevel: 'C - C(计划三个月后买车)', 
    location: '上海上海', 
    carSeries: 'N7', 
    dealer: '上海东风日产浦东店', 
    dealerCode: 'DLR-SH-PD-004',
    transcript: {
      duration: '00:45',
      callType: 'AI外呼',
      messages: [
        { role: 'agent', text: '赵女士您好，这里是东风日产客服，请问您最近有看中什么车型吗？' },
        { role: 'customer', text: '现在不买了，家人不同意，觉得不太适合。' },
        { role: 'agent', text: '啊，这样啊，那方便问下是因为什么考虑吗？', tag: 'intent' },
        { role: 'customer', text: '就家里人不太支持，换别的了。' }
      ],
      tags: ['家庭阻碍', '放弃购车']
    }
  }
];

let selectedAuditIds = [];
let auditPageCurrentPage = 1;
let auditPagePageSize = 10;
let currentRejectingLeadId = null;
let currentRejectingLeadIds = [];
let batchAuditPendingIds = [];
let leadAuditSnapshots = [];
let auditSnapshotSequence = 1;
const leadAuditSnapshotStorageKey = 'dcc-lead-audit-snapshots-v1';

function persistAuditSnapshots() {
  try { localStorage.setItem(leadAuditSnapshotStorageKey, JSON.stringify({ sequence: auditSnapshotSequence, records: leadAuditSnapshots })); } catch (error) {}
}

function loadPersistedAuditSnapshots() {
  try {
    const stored = JSON.parse(localStorage.getItem(leadAuditSnapshotStorageKey) || '{}');
    leadAuditSnapshots = Array.isArray(stored.records) ? stored.records : [];
    auditSnapshotSequence = Number(stored.sequence) || (leadAuditSnapshots.length + 1);
  } catch (error) { leadAuditSnapshots = []; }
}

function migrateAuditSnapshotTerminology() {
  let changed = false;
  leadAuditSnapshots.forEach(snapshot => {
    if (snapshot.reviewer === '运营管理员') {
      snapshot.reviewer = '张敏（黑名单审核员）';
      changed = true;
    }
    const previous = snapshot.rule?.interceptReason || '';
    const updated = previous
      .replaceAll('上次培育不符合线索下发条件', '上次培育符合线索下发条件')
      .replaceAll('不符合NEV下发', '符合NEV下发');
    if (updated !== previous) {
      snapshot.rule.interceptReason = updated;
      changed = true;
    }
    if (snapshot.rule && Object.prototype.hasOwnProperty.call(snapshot.rule, 'ruleVersion')) {
      delete snapshot.rule.ruleVersion;
      changed = true;
    }
    // ruleName 仅是原型列表的模拟字段，不能作为可追溯的审核规则。
    if (snapshot.rule && Object.prototype.hasOwnProperty.call(snapshot.rule, 'name')) {
      delete snapshot.rule.name;
      changed = true;
    }
    if (!snapshot.auditRule) {
      snapshot.auditRule = createAuditRuleSnapshot();
      changed = true;
    }
    if (snapshot.decisionConfig && Object.prototype.hasOwnProperty.call(snapshot.decisionConfig, 'dispatchLimit')) {
      delete snapshot.decisionConfig.dispatchLimit;
      changed = true;
    }
    if (Object.prototype.hasOwnProperty.call(snapshot, 'execution')) {
      delete snapshot.execution;
      changed = true;
    }
  });
  if (changed) persistAuditSnapshots();
}

function formatAuditSnapshotTime(date = new Date()) {
  const pad = value => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function createAuditBatchNo() {
  return `AUD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(auditSnapshotSequence).padStart(4, '0')}`;
}

function createAuditRuleSnapshot(config = aiColdAuditRuleConfig) {
  const sources = Array.isArray(config.enabledSources) && config.enabledSources.length
    ? config.enabledSources.join('、')
    : '—';
  return {
    status: config.enabled ? '已启用' : '已停用',
    dataScope: sources,
    followUpCondition: `近${config.windowDays || '—'}天第${config.outboundSequence || '—'}次 AI 智能外呼跟进`,
    previousNurtureCondition: config.previousNurtureRule || '—',
    hitHandling: '人工审核（生成审核待办）'
  };
}

function saveAuditSnapshot(item, decision, config = {}, batchNo = createAuditBatchNo(), reviewedAt = formatAuditSnapshotTime()) {
  const snapshot = {
    id: `AR-${String(auditSnapshotSequence++).padStart(6, '0')}`,
    batchNo,
    result: decision,
    reviewedAt,
    reviewer: '张敏（黑名单审核员）',
    reviewChannel: batchNo.endsWith('0001') ? '单条审核' : '批量审核',
    lead: {
      auditLeadId: item.id,
      headquarterLeadId: item.headquarterLeadId,
      customer: `${item.name}（${item.displayPhone}）`,
      source: item.leadType,
      coldTag: item.coldTag,
      carSeries: item.carSeries,
      dealer: item.dealer,
      location: item.location,
      callId: item.callId,
      latestTime: item.latestTime,
      callTags: (item.transcript?.tags || []).join('、') || '—'
    },
    rule: {
      interceptReason: getAiColdAuditInterceptReason(item)
    },
    auditRule: createAuditRuleSnapshot(),
    decisionConfig: config
  };
  leadAuditSnapshots.push(snapshot);
  item.auditSnapshotId = snapshot.id;
  persistAuditSnapshots();
  return snapshot;
}

function seedProcessedAuditSnapshots() {
  leadAuditList.filter(item => item.status !== '待审核').forEach((item, index) => {
    const config = item.status === '已下发'
      ? { carSeries: item.carSeries, dealer: item.dealer, dealerCode: item.dealerCode, leadStatus: item.updateLeadStatus }
      : { leadStatus: item.updateLeadStatus, abnormalReason: item.abnormalReason, intentLevel: item.updateIntentLevel };
    saveAuditSnapshot(item, item.status, config, `AUD-202607${String(21 + index).padStart(2, '0')}-0001`, item.latestTime);
  });
}

function auditSnapshotValue(value) {
  return escapeHtml(String(value || '—'));
}

function openAuditSnapshotDetail(leadId) {
  const item = leadAuditList.find(entry => entry.id === leadId);
  const snapshot = leadAuditSnapshots.find(entry => entry.id === item?.auditSnapshotId);
  if (!snapshot) { showToast('未找到该线索的审核快照', false); return; }
  document.getElementById('leadAuditSnapshotModal')?.remove();
  const decisionRows = Object.entries(snapshot.decisionConfig).map(([key, value]) => `<div class="rule-detail-field"><div class="rule-detail-label">${auditSnapshotValue({ carSeries: '意向车系', dealer: '意向专营店', dealerCode: '专营店编码', leadStatus: '线索状态', abnormalReason: '异常原因', intentLevel: '意向级别' }[key] || key)}</div><div class="rule-detail-value">${auditSnapshotValue(value)}</div></div>`).join('');
  const auditRule = snapshot.auditRule || createAuditRuleSnapshot();
  const auditRuleRows = [
    ['策略状态', auditRule.status],
    ['适用数据范围', auditRule.dataScope],
    ['AI 跟进条件', auditRule.followUpCondition],
    ['上次培育反查', auditRule.previousNurtureCondition],
    ['命中处理', auditRule.hitHandling],
    ['本次拦截依据', snapshot.rule?.interceptReason]
  ].map(([label, value]) => `<div class="rule-detail-field"><div class="rule-detail-label">${label}</div><div class="rule-detail-value">${auditSnapshotValue(value)}</div></div>`).join('');
  const modal = document.createElement('div');
  modal.className = 'modal-overlay show';
  modal.id = 'leadAuditSnapshotModal';
  modal.innerHTML = `
    <div class="modal" style="width:880px; max-width:calc(100vw - 40px); max-height:calc(100vh - 56px); overflow:auto;">
      <div class="modal-header"><div class="modal-title">审核详情 · ${auditSnapshotValue(snapshot.id)}</div><button class="modal-close" type="button">✕</button></div>
      <div class="modal-body audit-snapshot-detail">
        <div class="rule-detail-section audit-snapshot-result-section"><div class="rule-detail-title">审核结果</div><div class="rule-detail-body"><div class="rule-detail-field"><div class="rule-detail-label">审核结果</div><div class="rule-detail-value"><span class="rule-chip ${snapshot.result === '已下发' ? 'green' : 'gray'}">${auditSnapshotValue(snapshot.result)}</span></div></div><div class="rule-detail-field"><div class="rule-detail-label">审核批次</div><div class="rule-detail-value">${auditSnapshotValue(snapshot.batchNo)}</div></div><div class="rule-detail-field"><div class="rule-detail-label">审核人</div><div class="rule-detail-value">${auditSnapshotValue(snapshot.reviewer)}</div></div><div class="rule-detail-field"><div class="rule-detail-label">审核时间</div><div class="rule-detail-value">${auditSnapshotValue(snapshot.reviewedAt)}</div></div></div></div>
        <div class="rule-detail-section audit-snapshot-lead-section"><div class="rule-detail-title">线索快照</div><div class="rule-detail-body"><div class="rule-detail-field"><div class="rule-detail-label">线索 ID</div><div class="rule-detail-value">${auditSnapshotValue(snapshot.lead.auditLeadId)}</div></div><div class="rule-detail-field"><div class="rule-detail-label">总部线索 ID</div><div class="rule-detail-value">${auditSnapshotValue(snapshot.lead.headquarterLeadId)}</div></div><div class="rule-detail-field"><div class="rule-detail-label">客户</div><div class="rule-detail-value">${auditSnapshotValue(snapshot.lead.customer)}</div></div><div class="rule-detail-field"><div class="rule-detail-label">车系 / 专营店</div><div class="rule-detail-value">${auditSnapshotValue(snapshot.lead.carSeries)} / ${auditSnapshotValue(snapshot.lead.dealer)}</div></div></div></div>
        <div class="rule-detail-section"><div class="rule-detail-title">审核规则快照</div><div class="rule-detail-body">${auditRuleRows}</div></div>
        <div class="rule-detail-section"><div class="rule-detail-title">审核配置快照</div><div class="rule-detail-body">${decisionRows || '<div class="rule-detail-value">—</div>'}</div></div>
      </div>
      <div class="modal-footer"><button class="btn-cancel" type="button">关闭</button></div>
    </div>`;
  modal.querySelectorAll('.modal-close, .btn-cancel').forEach(button => button.addEventListener('click', () => modal.remove()));
  document.body.appendChild(modal);
}

// AI冷线索下发审核运营规则（原型本地状态）
let aiColdAuditRuleConfig = {
  version: 'V1.0',
  enabled: true,
  notifyEnabled: true,
  reviewers: ['张敏（黑名单审核员）', '李强（DCC主管）'],
  noticeRecipients: ['张敏（黑名单审核员）', '陈晨（线索运营）'],
  reviewerEmails: 'lead-audit-review@dcc.example.com',
  noticeEmails: 'dcc-manager@dcc.example.com, operation-owner@dcc.example.com',
  notifyFrequency: '实时通知',
  timeoutReminder: '2小时未处理提醒审核人员',
  enabledSources: ['门店冷线索', '总部冷线索', '三无忧线索'],
  windowDays: 30,
  outboundSequence: 2,
  previousNurtureRule: '上次培育符合NEV下发',
  updatedAt: '2026-07-24 10:20',
  updatedBy: '运营管理员'
};
const aiColdAuditRuleStorageKey = 'dcc-lead-ai-cold-audit-rule-v1';

function persistAiColdAuditRuleConfig() {
  try { localStorage.setItem(aiColdAuditRuleStorageKey, JSON.stringify(aiColdAuditRuleConfig)); } catch (error) {}
}

function loadPersistedAiColdAuditRuleConfig() {
  try {
    const stored = JSON.parse(localStorage.getItem(aiColdAuditRuleStorageKey) || '{}');
    if (stored && typeof stored === 'object') aiColdAuditRuleConfig = { ...aiColdAuditRuleConfig, ...stored };
  } catch (error) {}
}

loadPersistedAuditSnapshots();
loadPersistedAiColdAuditRuleConfig();
migrateAuditSnapshotTerminology();
if (!leadAuditSnapshots.length) seedProcessedAuditSnapshots();
leadAuditList.filter(item => item.status !== '待审核').forEach(item => {
  const existing = leadAuditSnapshots.find(snapshot => snapshot.lead.auditLeadId === item.id);
  if (existing) item.auditSnapshotId = existing.id;
});
leadAuditList.forEach(item => {
  const history = leadAuditSnapshots.filter(snapshot => snapshot.lead.auditLeadId === item.id);
  const latest = history[history.length - 1];
  if (!latest) return;
  item.auditSnapshotId = latest.id;
  item.status = latest.result;
  const config = latest.decisionConfig || {};
  if (config.carSeries) item.carSeries = config.carSeries;
  if (config.dealer) item.dealer = config.dealer;
  if (config.dealerCode) item.dealerCode = config.dealerCode;
  if (config.leadStatus) item.updateLeadStatus = config.leadStatus;
  if (Object.prototype.hasOwnProperty.call(config, 'abnormalReason')) item.abnormalReason = config.abnormalReason;
  if (Object.prototype.hasOwnProperty.call(config, 'intentLevel')) item.updateIntentLevel = config.intentLevel;
});

function getAiColdAuditInterceptReason(item) {
  return `近${aiColdAuditRuleConfig.windowDays}天第${item.callCount}次AI智能外呼跟进；当前符合线索下发条件，上次培育符合线索下发条件`;
}

// 批量下发专营店可售车系映射；选择车系后仅展示可售门店。
const wizardDealerSeriesMap = {
  'N6': ['DLR-GD-GZ-001', 'DLR-GD-SZ-002', 'DLR-SH-PD-004'],
  'N7': ['DLR-BJ-CY-002', 'DLR-ZJ-HZ-003', 'DLR-SH-PD-004'],
  'NX8': ['DLR-GD-SZ-002', 'DLR-ZJ-HZ-003', 'DLR-SC-CD-005'],
  '轩逸': ['DLR-GD-GZ-001', 'DLR-BJ-CY-002', 'DLR-SC-CD-005'],
  '逍客': ['DLR-GD-SZ-002', 'DLR-ZJ-HZ-003', 'DLR-SH-PD-004'],
  '奇骏': ['DLR-GD-GZ-001', 'DLR-BJ-CY-002', 'DLR-SC-CD-005'],
  '天籁': ['DLR-GD-GZ-001', 'DLR-BJ-CY-002', 'DLR-SH-PD-004']
};

function getWizardDealerOptionsBySeries(series) {
  // 批量保留原车系时，仅展示同时可售所选线索全部原车系的门店。
  if (series === keepOriginalIntentValue) {
    const originalSeries = [...new Set(dispatchSettingsSelectedIds
      .map(id => leadAuditList.find(item => item.id === id)?.carSeries)
      .filter(Boolean))];
    if (!originalSeries.length) return dealerOptions;
    const eligibleCodes = originalSeries
      .map(item => wizardDealerSeriesMap[item] || [])
      .reduce((codes, seriesCodes) => codes.filter(code => seriesCodes.includes(code)));
    return dealerOptions.filter(dealer => eligibleCodes.includes(dealer.code));
  }
  const eligibleCodes = wizardDealerSeriesMap[series] || [];
  return dealerOptions.filter(dealer => eligibleCodes.includes(dealer.code));
}

// Wizard state for dispatch settings
let dispatchSettingsSelectedIds = [];
let dispatchSettingsCurrentStep = 1;
let dispatchSettingsDealerQuotaList = [];
const keepOriginalIntentValue = '__KEEP_ORIGINAL_INTENT__';

// Initialize the page
function initLeadDispatchAuditPage() {
  const page = document.getElementById('leadDispatchAuditPage');
  if (!page) return;
  
  selectedAuditIds = []; // reset checkbox selection
  
  page.innerHTML = `
    <div class="page-hero">
      <div>
        <div class="page-title">AI冷线索下发审核</div>
        <div class="page-desc">对符合线索下发条件、且命中规则的冷线索进行人工审核；审核通过后下发至线索平台，不下发则按拦截配置同步更新状态、异常原因和意向级别。</div>
      </div>
      <div class="summary-strip" id="leadAuditSummaryStrip"></div>
    </div>
    
    <div class="filter-row">
      <span class="filter-label">关键字：</span>
      <input class="lead-input" style="width:320px; margin-right: 12px;" id="auditKeywordFilter" placeholder="手机号/姓名（多手机号用逗号分隔）" title="支持多个手机号：用逗号分隔" ${renderUiActionCallback('audit-dispatch-filter')} />
      <span class="filter-label">审核状态：</span>
      <select class="filter-select" id="auditStatusFilter" ${renderUiActionCallback('audit-dispatch-filter')}>
        <option value="">全部</option>
        <option value="待审核">待审核</option>
        <option value="已下发">已下发</option>
        <option value="不下发">不下发</option>
      </select>
      <span class="filter-label">线索来源：</span>
      <select class="filter-select" id="auditTypeFilter" ${renderUiActionCallback('audit-dispatch-filter')}>
        <option value="">全部</option>
        <option value="留资未满">留资未满</option>
        <option value="三无忧">三无忧</option>
        <option value="NEV线索中台">NEV线索中台</option>
      </select>
      <button class="btn-secondary" type="button" ${renderUiActionCallback('audit-dispatch-reset')}>重置</button>
    </div>

    <div class="card">
      <div class="section-header">
        <div class="section-title">审核待办列表</div>
        <div class="action-btns" style="gap:8px;">
          <button class="btn-secondary" type="button" ${renderUiActionCallback('audit-rule-open')}>审核规则</button>
          <button class="btn-add" type="button" style="background:#2563eb; border-color:#2563eb;" ${renderUiActionCallback('audit-dispatch-batch-open-settings')}>批量审核</button>
        </div>
      </div>
      <div class="audit-table-scroll">
        <table class="data-table audit-lead-table" style="min-width: 2480px;">
          <thead>
            <tr>
              <th style="width:40px"><input type="checkbox" id="auditSelectAll" ${renderUiActionCallback('audit-dispatch-toggle-all', ['$checked'])} /></th>
              <th>总部线索ID</th>
              <th>培育线索编码</th>
              <th>培育任务编码</th>
              <th>回访工单编码</th>
              <th>通话ID</th>
              <th>客户信息</th>
              <th>最近呼叫</th>
              <th>意向车系</th>
              <th>意向专营店</th>
              <th style="text-align:center; width:90px;">门店冷线索</th>
              <th style="text-align:center; width:90px;">总部冷线索</th>
              <th style="text-align:center; width:90px;">三无忧线索</th>
              <th style="text-align:center; width:120px;">近${aiColdAuditRuleConfig.windowDays}天跟进频次</th>
              <th style="width:150px;">上次培育判定</th>
              <th style="width:260px;">截留原因</th>
              <th style="text-align:center; width:80px;">审核状态</th>
              <th style="text-align:center; width:80px;">录音播放</th>
              <th style="text-align:center; width:80px;">录音文本</th>
              <th style="width:160px; text-align:center;">审核操作</th>
            </tr>
          </thead>
          <tbody id="leadAuditTableBody"></tbody>
        </table>
      </div>
      <div class="pagination">
        <span id="leadAuditPageInfo">共 0 条记录，当前第 1 / 1 页</span>
        <div class="pagination-btns">
          <select class="hit-page-size" id="leadAuditPageSize" ${renderUiActionCallback('audit-dispatch-page-size', ['$value'])}>
            <option value="5">每页 5 条</option>
            <option value="10" selected>每页 10 条</option>
            <option value="20">每页 20 条</option>
          </select>
          <button class="page-btn" type="button" ${renderUiActionCallback('audit-dispatch-page', [-1])}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <select class="hit-page-size" id="leadAuditPageSelect" ${renderUiActionCallback('audit-dispatch-page-select', ['$value'])}></select>
          <button class="page-btn" type="button" ${renderUiActionCallback('audit-dispatch-page', [1])}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
    </div>

    <!-- Audio Player Bar -->
    <div class="audio-player" id="auditAudioPlayer" style="display:none; margin-top:16px; margin-bottom:14px;">
      <button class="audio-toggle" type="button" ${renderUiActionCallback('audit-dispatch-toggle-audio-playback')} aria-label="暂停或继续播放" id="auditAudioToggle">
        <svg id="auditAudioIcon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5h3v14H8V5zm5 0h3v14h-3V5z"/></svg>
      </button>
      <div class="audio-main">
        <div class="audio-title-row">
          <span class="audio-title" id="auditAudioTitle">当前录音</span>
          <span class="audio-time" id="auditAudioTime">00:00 / 00:00</span>
        </div>
        <div class="audio-progress" aria-label="录音播放进度">
          <div class="audio-progress-bar" id="auditAudioProgress" style="width:0%"></div>
        </div>
      </div>
      <button class="modal-close" type="button" style="margin-left:12px; color:#64748b;" ${renderUiActionCallback('audit-dispatch-close-audio')} aria-label="关闭播放器" title="关闭播放器">×</button>
    </div>

    <!-- Transcript Panel -->
    <div class="transcript-panel" id="auditTranscriptPanel">
      <div class="transcript-header">
        <div>
          <div class="transcript-title" id="auditTranscriptTitle">录音文本</div>
          <div class="transcript-meta" id="auditTranscriptMeta"></div>
        </div>
        <button class="transcript-close" type="button" ${renderUiActionCallback('audit-dispatch-close-transcript')}>收起对话</button>
      </div>
      <div class="transcript-body" id="auditTranscriptBody"></div>
    </div>
  `;
  renderLeadAuditSummary();
  renderLeadAuditTable();
  createRejectModalIfNeeded();
  createDispatchSettingsModalIfNeeded();
  createBatchAuditDecisionModalIfNeeded();
  createAiColdAuditRuleModalIfNeeded();
}

// Render Summary Cards
function renderAiColdAuditRuleSummary() {
  const container = document.getElementById('aiColdAuditRuleSummary');
  if (!container) return;
  const config = aiColdAuditRuleConfig;
  container.innerHTML = `
    <span class="audit-rule-summary-label">当前生效规则</span>
    <span class="rule-chip blue">${config.enabled ? '已启用' : '已停用'}</span>
    <span>${config.enabledSources.join('、')}</span>
    <span class="audit-rule-summary-separator">·</span>
    <span>近${config.windowDays}天第${config.outboundSequence}次AI智能外呼跟进</span>
    <span class="audit-rule-summary-separator">·</span>
    <span>${config.previousNurtureRule}</span>
    <button class="audit-rule-summary-link" type="button" ${renderUiActionCallback('audit-rule-open')}>查看配置</button>
  `;
}

function renderLeadAuditSummary() {
  const container = document.getElementById('leadAuditSummaryStrip');
  if (!container) return;

  const total = leadAuditList.length;
  const pending = leadAuditList.filter(item => item.status === '待审核').length;
  const approved = leadAuditList.filter(item => item.status === '已下发').length;
  const rejected = leadAuditList.filter(item => item.status === '不下发').length;
  const cards = [
    { label: '审核总量', value: total, color: '#2563eb' },
    { label: '待审核', value: pending, color: '#f59e0b' },
    { label: '已下发', value: approved, color: '#22c55e' },
    { label: '不下发', value: rejected, color: '#64748b' }
  ];
  container.innerHTML = cards.map((card, index) => `
    <div class="summary-card audit-summary-card audit-summary-card-${index + 1}">
      <div class="summary-label">${card.label}</div>
      <div class="summary-value">${card.value}</div>
    </div>
  `).join('');
}

// Get filtered rules
function getFilteredAuditLeads() {
  const keyword = document.getElementById('auditKeywordFilter')?.value.trim().toLowerCase() || '';
  const status = document.getElementById('auditStatusFilter')?.value || '';
  const type = document.getElementById('auditTypeFilter')?.value || '';

  // 多手机号支持：逗号、中文逗号、空格、分号或换行分隔；任一号码命中即保留。
  const phoneKeywords = keyword.split(/[\s,，;；]+/).filter(value => /^1\d{10}$/.test(value));
  const isMultiplePhoneQuery = phoneKeywords.length > 1;

  return leadAuditList.filter(item => {
    if (isMultiplePhoneQuery && !phoneKeywords.includes(item.phone)) return false;
    if (keyword && !isMultiplePhoneQuery && !item.name.toLowerCase().includes(keyword) && !item.phone.includes(keyword) && !item.id.toLowerCase().includes(keyword) && !item.taskCode.toLowerCase().includes(keyword) && !item.workOrderCode.toLowerCase().includes(keyword) && !item.callId.toLowerCase().includes(keyword)) return false;
    if (status && item.status !== status) return false;
    if (type && item.leadType !== type) return false;
    return true;
  });
}

// Render Table List
function renderLeadAuditTable() {
  const body = document.getElementById('leadAuditTableBody');
  if (!body) return;

  // 已审核记录不能再参与批量下发。
  selectedAuditIds = selectedAuditIds.filter(id => leadAuditList.some(item => item.id === id && item.status === '待审核'));
  const rows = getFilteredAuditLeads();
  const totalPages = Math.max(1, Math.ceil(rows.length / auditPagePageSize));
  auditPageCurrentPage = Math.min(auditPageCurrentPage, totalPages);
  const start = (auditPageCurrentPage - 1) * auditPagePageSize;
  const pageRows = rows.slice(start, start + auditPagePageSize);

  const info = document.getElementById('leadAuditPageInfo');
  if (info) info.textContent = `共 ${rows.length} 条记录，当前第 ${auditPageCurrentPage} / ${totalPages} 页`;
  
  const pageSelect = document.getElementById('leadAuditPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, idx) => `<option value="${idx + 1}">第 ${idx + 1} 页</option>`).join('');
    pageSelect.value = String(auditPageCurrentPage);
  }
  
  const pageSizeSelect = document.getElementById('leadAuditPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(auditPagePageSize);

  body.innerHTML = pageRows.length ? pageRows.map(item => {
    const isPending = item.status === '待审核' && aiColdAuditRuleConfig.enabled;
    const statusTextHtml = item.status === '待审核' 
      ? `<span class="tag-chip orange" style="font-weight:400;">待审核</span>`
      : item.status === '已下发'
        ? `<span class="tag-chip green" style="font-weight:400;">已下发</span>`
        : `<span class="tag-chip gray" style="font-weight:400;">不下发</span>`;

    const isStore = item.coldTag === '门店冷线索' ? '<span style="color:#22c55e; font-weight:400;">是</span>' : '<span style="color:#64748b;">否</span>';
    const isHq = item.coldTag === '总部冷线索' ? '<span style="color:#22c55e; font-weight:400;">是</span>' : '<span style="color:#64748b;">否</span>';
    const isWorryFree = item.coldTag === '三无忧线索' ? '<span style="color:#22c55e; font-weight:400;">是</span>' : '<span style="color:#64748b;">否</span>';

    const isPlayingThis = activeAuditAudioCallId === item.callId && auditAudioPlaying;
    const isTranscriptOpenThis = activeAuditTranscriptCallId === item.callId;

    return `
      <tr class="audit-record-row ${isTranscriptOpenThis ? 'active' : ''}" ${renderUiActionCallback('audit-dispatch-open-transcript', [item.callId])}>
        <td><input type="checkbox" class="audit-row-checkbox" value="${item.id}" ${selectedAuditIds.includes(item.id) ? 'checked' : ''} ${isPending ? renderUiActionCallback('audit-dispatch-toggle-one', ['$self']) : 'disabled aria-label="已审核记录不可选择"'} /></td>
        <td class="audit-code-cell" title="${item.headquarterLeadId}"><span>${item.headquarterLeadId}</span></td>
        <td class="audit-code-cell" title="${item.id}"><span>${item.id}</span></td>
        <td class="audit-code-cell" title="${item.taskCode}"><span>${item.taskCode}</span></td>
        <td class="audit-code-cell" title="${item.workOrderCode}"><span>${item.workOrderCode}</span></td>
        <td class="audit-code-cell" title="${item.callId}"><span>${item.callId}</span></td>
        <td>
          <div class="list-customer-cell">
            <div class="list-customer-name audit-cell-ellipsis" title="${item.name}">${item.name}</div>
            <div class="list-customer-phone audit-cell-ellipsis" title="${item.displayPhone}">${item.displayPhone}</div>
          </div>
        </td>
        <td class="audit-cell-ellipsis" title="${item.latestTime}">${item.latestTime}</td>
        <td class="audit-cell-ellipsis" style="font-weight:400;" title="${item.carSeries}">${item.carSeries}</td>
        <td class="audit-cell-ellipsis" style="font-weight:400;" title="${item.dealer}">${item.dealer}</td>
        <td style="text-align:center;">${isStore}</td>
        <td style="text-align:center;">${isHq}</td>
        <td style="text-align:center;">${isWorryFree}</td>
        <td style="text-align:center;"><span class="rule-chip blue" style="font-weight:400;">第 ${item.callCount} 次</span></td>
        <td class="audit-cell-ellipsis audit-previous-result" title="上次培育符合NEV下发">符合NEV下发</td>
        <td class="audit-cell-ellipsis audit-intercept-reason" title="${getAiColdAuditInterceptReason(item)}">${getAiColdAuditInterceptReason(item)}</td>
        <td style="text-align:center;">${statusTextHtml}</td>
        <td style="text-align:center;">
          <button class="listen-btn ${isPlayingThis ? 'playing' : ''}" type="button" ${renderUiActionCallback('audit-dispatch-listen-audio', [item.callId])}>
            ${isPlayingThis ? '播放中' : '播放'}
          </button>
        </td>
        <td class="audit-transcript-cell ${isTranscriptOpenThis ? 'active' : ''}" title="${isTranscriptOpenThis ? '当前对话已展示' : '点击本行查看对话'}">
          ${isTranscriptOpenThis ? '当前对话已展示' : '点击本行查看对话'}
        </td>
        <td>
          <div class="action-btns audit-action-cell" style="justify-content:center;">
            ${isPending 
              ? `<button class="action-btn view" style="color:#2563eb;" type="button" ${renderUiActionCallback('audit-dispatch-open-settings', [item.id])}>下发设置</button>
                 <button class="action-btn delete" type="button" ${renderUiActionCallback('audit-dispatch-reject-open', [item.id])}>不下发</button>`
              : item.status === '待审核'
                ? `<span class="rule-muted">审核策略已停用</span>`
                : `<button class="action-btn view" style="color:#2563eb;" type="button" ${renderUiActionCallback('audit-dispatch-view-snapshot', [item.id])}>查看审核</button>`
            }
          </div>
        </td>
      </tr>
    `;
  }).join('') : '<tr><td colspan="20"><div class="empty-state">暂无符合当前审核规则的线索</div></td></tr>';

  // Toggle master select all checkbox state
  const selectAllCheckbox = document.getElementById('auditSelectAll');
  if (selectAllCheckbox) {
    const selectablePageRowIds = pageRows.filter(item => item.status === '待审核').map(item => item.id);
    selectAllCheckbox.disabled = selectablePageRowIds.length === 0;
    selectAllCheckbox.checked = selectablePageRowIds.length > 0 && selectablePageRowIds.every(id => selectedAuditIds.includes(id));
  }
}

// Create AI cold lead audit rule modal if it doesn't exist
function createAiColdAuditRuleModalIfNeeded() {
  if (document.getElementById('aiColdAuditRuleModal')) return;

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.id = 'aiColdAuditRuleModal';
  modalOverlay.onclick = event => {
    if (event.target === modalOverlay) modalOverlay.classList.remove('show');
  };
  modalOverlay.innerHTML = `
    <div class="modal audit-rule-config-modal">
      <div class="modal-header">
        <div class="modal-title">审核规则配置</div>
        <button class="modal-close" type="button" ${renderUiActionCallback('audit-rule-close')}>×</button>
      </div>
      <div class="modal-body" id="aiColdAuditRuleBody"></div>
      <div class="modal-footer">
        <button class="btn-cancel" type="button" ${renderUiActionCallback('audit-rule-close')}>取消</button>
        <button class="btn-save" type="button" ${renderUiActionCallback('audit-rule-save')}>保存</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalOverlay);
}

let auditRuleSelectedPeople = { reviewers: [], noticeRecipients: [] };
let auditRulePickerDismissBound = false;

function formatAuditRulePersonLabel(user) {
  return `${user.name}（${user.role}）`;
}

function getAuditRulePersonPickerConfig(type) {
  const configs = {
    reviewers: { hiddenId: 'auditRuleReviewers', triggerId: 'auditRuleReviewersTrigger', panelId: 'auditRuleReviewersPanel', countId: 'auditRuleReviewersCount', listId: 'auditRuleReviewersList', placeholder: '请选择审核人员' },
    noticeRecipients: { hiddenId: 'auditRuleNoticeRecipients', triggerId: 'auditRuleNoticeRecipientsTrigger', panelId: 'auditRuleNoticeRecipientsPanel', countId: 'auditRuleNoticeRecipientsCount', listId: 'auditRuleNoticeRecipientsList', placeholder: '请选择站内通知人员' }
  };
  return configs[type];
}

function getAuditRulePersonAccounts(labels = []) {
  return reviewUserOptions
    .filter(user => labels.includes(formatAuditRulePersonLabel(user)))
    .map(user => user.account);
}

function getAuditRulePersonPickerHtml(type) {
  const config = getAuditRulePersonPickerConfig(type);
  return `<input id="${config.hiddenId}" type="hidden" />
    <div class="account-picker">
      <div class="account-select-trigger placeholder" id="${config.triggerId}" data-audit-notification-control role="button" tabindex="0" onclick="toggleAuditRulePersonPicker('${type}')">${config.placeholder}</div>
      <div class="account-picker-panel" id="${config.panelId}">
        <div class="account-picker-tools"><span id="${config.countId}">已选 0 / ${reviewUserOptions.length}</span><span class="account-picker-actions"><button class="account-picker-action" type="button" onclick="selectAllAuditRulePeople('${type}')">全选</button><button class="account-picker-action" type="button" onclick="clearAuditRulePeople('${type}')">清除所选</button></span></div>
        <div class="account-option-list" id="${config.listId}"></div>
      </div>
    </div>`;
}

function renderAuditRulePersonPicker(type) {
  const config = getAuditRulePersonPickerConfig(type);
  if (!config) return;
  renderAccountMultiPicker({
    selectedAccounts: auditRuleSelectedPeople[type] || [],
    users: reviewUserOptions,
    formatLabel: formatAuditRulePersonLabel,
    hiddenId: config.hiddenId,
    triggerId: config.triggerId,
    countId: config.countId,
    listId: config.listId,
    placeholder: config.placeholder,
    onchange: () => `toggleAuditRulePersonSelection('${type}', this)`
  });
}

function toggleAuditRulePersonPicker(type) {
  const config = getAuditRulePersonPickerConfig(type);
  if (!config || document.getElementById(config.triggerId)?.classList.contains('is-disabled')) return;
  document.querySelectorAll('#aiColdAuditRulePage .account-picker-panel').forEach(panel => {
    if (panel.id !== config.panelId) panel.classList.remove('show');
  });
  document.getElementById(config.panelId)?.classList.toggle('show');
  renderAuditRulePersonPicker(type);
}

function toggleAuditRulePersonSelection(type, input) {
  auditRuleSelectedPeople[type] = updateSelectedValues(auditRuleSelectedPeople[type] || [], input.value, input.checked);
  renderAuditRulePersonPicker(type);
}

function selectAllAuditRulePeople(type) {
  auditRuleSelectedPeople[type] = reviewUserOptions.map(user => user.account);
  renderAuditRulePersonPicker(type);
}

function clearAuditRulePeople(type) {
  auditRuleSelectedPeople[type] = [];
  renderAuditRulePersonPicker(type);
}

function bindAuditRulePickerDismiss() {
  if (auditRulePickerDismissBound) return;
  auditRulePickerDismissBound = true;
  document.addEventListener('click', event => {
    const page = document.getElementById('aiColdAuditRulePage');
    if (!page?.classList.contains('show')) return;
    if (event.target.closest('#aiColdAuditRulePage .account-picker')) return;
    document.querySelectorAll('#aiColdAuditRulePage .account-picker-panel').forEach(panel => panel.classList.remove('show'));
  });
}

function renderAiColdAuditRuleModal() {
  const body = document.getElementById('aiColdAuditRuleBody');
  if (!body) return;
  const config = aiColdAuditRuleConfig;
  const sources = ['门店冷线索', '总部冷线索', '三无忧线索'];
  auditRuleSelectedPeople = {
    reviewers: getAuditRulePersonAccounts(config.reviewers),
    noticeRecipients: getAuditRulePersonAccounts(config.noticeRecipients)
  };
  body.innerHTML = `
    <div class="audit-rule-section">
      <div class="audit-rule-section-title">策略状态</div>
      <div class="audit-rule-readonly" style="justify-content:space-between;"><div><strong>命中后需要人工审核</strong><div class="form-field-helper-label" style="margin-top:4px;">开启后，命中本规则的线索进入审核待办；关闭后不再新增审核待办。</div></div><label class="switch"><input id="auditRuleEnabled" type="checkbox" ${config.enabled ? 'checked' : ''}/><span class="slider"></span></label></div>
    </div>
    <div id="auditRuleConditionRegion">
    <div class="audit-rule-notice">仅当当前培育线索符合线索下发条件，且按手机号反查命中以下规则时，才截留并生成待人工审核记录。</div>
    <div class="audit-rule-section audit-rule-section-no-divider">
      <div class="audit-rule-section-title">适用数据范围 <span class="required">*</span></div>
      <div class="audit-rule-source-grid">
        ${sources.map(source => `<label class="audit-rule-source-option"><input type="checkbox" name="auditRuleSource" value="${source}" ${config.enabledSources.includes(source) ? 'checked' : ''}/><span>${source}</span></label>`).join('')}
      </div>
    </div>
    <div class="audit-rule-section audit-rule-section-no-divider">
      <div class="audit-rule-section-title">AI智能外呼跟进频次 <span class="required">*</span></div>
      <div class="audit-rule-field-row">
        <label>统计周期<input class="form-input audit-rule-number-input" id="auditRuleWindowDays" type="number" min="1" max="90" inputmode="numeric" oninput="this.value=this.value.replace(/[^0-9]/g, '')" value="${config.windowDays}"/><span>天</span></label>
        <label>跟进频次<select class="form-input audit-rule-sequence-select" id="auditRuleOutboundSequence">${[1,2,3,4,5].map(n => `<option value="${n}" ${config.outboundSequence === n ? 'selected' : ''}>第 ${n} 次</option>`).join('')}</select></label>
      </div>
      <div class="form-field-helper-label">按手机号码统计“已完成”的 AI智能外呼，并按时间升序确定跟进频次。</div>
    </div>
    <div class="audit-rule-section audit-rule-section-no-divider">
      <div class="audit-rule-section-title">上次培育反查条件</div>
      <div class="audit-rule-readonly"><span class="rule-chip blue">固定条件</span><span>上次培育结果符合 NEV 下发条件</span></div>
      <div class="form-field-helper-label">避免同一手机号在连续符合 NEV 下发条件时重复进入人工审核。</div>
    </div>
    <div class="audit-rule-section">
      <div class="audit-rule-section-title">命中处理</div>
      <div class="audit-rule-readonly"><span class="rule-chip orange">人工审核</span><span>截留并生成审核待办，由审核人员决定“线索下发”或“不下发”。</span></div>
    </div>
    </div>
    <div class="audit-rule-section audit-rule-notification-region" id="auditRuleNotificationRegion">
      <div class="audit-rule-section-title">审核与通知</div>
      <div class="audit-rule-readonly" style="justify-content:space-between; margin-bottom:14px;"><div><strong>开启审核通知</strong><div class="form-field-helper-label" id="auditRuleNotifyHint" style="margin-top:4px;">产生待审核记录时，向配置的站内通知人员和邮箱发送提醒。</div></div><label class="switch"><input id="auditRuleNotifyEnabled" type="checkbox" ${config.notifyEnabled ? 'checked' : ''}/><span class="slider"></span></label></div>
      <div class="audit-notification-grid">
        <div class="audit-notification-field"><div class="form-label">审核人员</div>${getAuditRulePersonPickerHtml('reviewers')}<div class="form-field-helper-label">从账号人员中选择审核人，支持多选、全选和清除所选。</div></div>
        <div class="audit-notification-field"><div class="form-label">站内通知人员</div>${getAuditRulePersonPickerHtml('noticeRecipients')}<div class="form-field-helper-label">从账号人员中选择站内通知接收人，支持多选、全选和清除所选。</div></div>
        <div class="audit-notification-field"><div class="form-label">审核通知邮箱</div><input class="form-input" id="auditRuleReviewerEmails" data-audit-notification-control value="${escapeAttr(config.reviewerEmails || '')}" placeholder="多个邮箱用逗号分隔"/><div class="form-field-helper-label">支持录入多个邮箱，使用逗号、分号或换行分隔。</div></div>
        <div class="audit-notification-field"><div class="form-label">邮件抄送邮箱</div><input class="form-input" id="auditRuleNoticeEmails" data-audit-notification-control value="${escapeAttr(config.noticeEmails || '')}" placeholder="多个邮箱用逗号分隔"/><div class="form-field-helper-label">支持录入多个邮箱，使用逗号、分号或换行分隔。</div></div>
        <div class="audit-notification-field"><div class="form-label">通知频率</div><select class="form-input" id="auditRuleNotifyFrequency" data-audit-notification-control>${['实时通知', '每小时汇总', '每日汇总'].map(value => `<option value="${value}" ${config.notifyFrequency === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div>
        <div class="audit-notification-field"><div class="form-label">超时提醒</div><select class="form-input" id="auditRuleTimeoutReminder" data-audit-notification-control>${['不提醒', '1小时未处理提醒审核人员', '2小时未处理提醒审核人员', '4小时未处理提醒审核人员'].map(value => `<option value="${value}" ${config.timeoutReminder === value ? 'selected' : ''}>${value}</option>`).join('')}</select></div>
      </div>
    </div>
  `;
  renderAuditRulePersonPicker('reviewers');
  renderAuditRulePersonPicker('noticeRecipients');
  bindAuditRulePickerDismiss();
  document.getElementById('auditRuleEnabled')?.addEventListener('change', syncAuditRuleNotificationState);
  document.getElementById('auditRuleNotifyEnabled')?.addEventListener('change', syncAuditRuleNotificationState);
  syncAuditRuleNotificationState();
}

function syncAuditRuleNotificationState() {
  const ruleEnabled = Boolean(document.getElementById('auditRuleEnabled')?.checked);
  const notifyToggle = document.getElementById('auditRuleNotifyEnabled');
  if (!notifyToggle) return;
  notifyToggle.disabled = !ruleEnabled;
  const notificationActive = ruleEnabled && notifyToggle.checked;
  const conditionRegion = document.getElementById('auditRuleConditionRegion');
  if (conditionRegion) conditionRegion.hidden = !ruleEnabled;
  const notificationRegion = document.getElementById('auditRuleNotificationRegion');
  if (notificationRegion) notificationRegion.hidden = !ruleEnabled;
  document.querySelectorAll('[data-audit-notification-control]').forEach(control => {
    if (control.tagName === 'BUTTON' || control.classList.contains('account-select-trigger')) control.classList.toggle('is-disabled', !notificationActive);
    else control.disabled = !notificationActive;
  });
  if (!notificationActive) document.querySelectorAll('#aiColdAuditRulePage .account-picker-panel').forEach(panel => panel.classList.remove('show'));
  notificationRegion?.classList.toggle('is-disabled', !notificationActive);
  const hint = document.getElementById('auditRuleNotifyHint');
  if (hint) hint.textContent = !ruleEnabled
    ? '审核策略已停用，不会生成待审核记录或发送通知。'
    : (notifyToggle.checked ? '产生待审核记录时，向配置的站内通知人员和邮箱发送提醒。' : '通知已关闭；仍会生成待审核记录，但不会发送提醒。');
}

function openAiColdAuditRulePage() {
  const page = document.getElementById('aiColdAuditRulePage');
  if (!page) return;
  document.querySelector('.content')?.classList.add('audit-rule-page-active');
  document.getElementById('leadDispatchAuditPage')?.classList.remove('show');
  document.getElementById('batchDispatchAiPage')?.classList.remove('show');
  document.getElementById('batchDispatchManualPage')?.classList.remove('show');
  setPageName('线索管理 / 下发审核 / AI冷线索 / 审核规则配置');
  page.innerHTML = `
    <div class="detail-page-header audit-rule-page-header">
      <div>
        <div class="detail-page-title">审核规则配置</div>
        <div class="detail-page-subtitle">线索管理 / 下发审核 / AI冷线索 / 审核规则配置</div>
      </div>
      <div class="lead-toolbar-right">
        <button class="btn-secondary" type="button" ${renderUiActionCallback('audit-rule-close')}>取消</button>
        <button class="btn-add" type="button" ${renderUiActionCallback('audit-rule-save')}>保存</button>
      </div>
    </div>
    <div class="audit-rule-page-card"><div class="modal-body" id="aiColdAuditRuleBody"></div></div>
  `;
  page.classList.add('show');
  renderAiColdAuditRuleModal();
  window.scrollTo({ top: 0, behavior: 'auto' });
}

function closeAiColdAuditRulePage() {
  document.querySelector('.content')?.classList.remove('audit-rule-page-active');
  document.getElementById('aiColdAuditRulePage')?.classList.remove('show');
  document.getElementById('leadDispatchAuditPage')?.classList.add('show');
  setPageName('线索管理 / 下发审核 / AI冷线索');
  initLeadDispatchAuditPage();
}

registerUiActionCallback('audit-rule-open', () => {
  openAiColdAuditRulePage();
});

registerUiActionCallback('audit-rule-close', () => {
  closeAiColdAuditRulePage();
});

registerUiActionCallback('audit-rule-save', () => {
  const sources = Array.from(document.querySelectorAll('input[name="auditRuleSource"]:checked')).map(input => input.value);
  const days = Number(document.getElementById('auditRuleWindowDays')?.value);
  const sequence = Number(document.getElementById('auditRuleOutboundSequence')?.value);
  const enabled = Boolean(document.getElementById('auditRuleEnabled')?.checked);
  const notifyEnabled = Boolean(document.getElementById('auditRuleNotifyEnabled')?.checked);
  const reviewers = (auditRuleSelectedPeople.reviewers || []).map(account => {
    const user = reviewUserOptions.find(item => item.account === account);
    return user ? formatAuditRulePersonLabel(user) : account;
  });
  const noticeRecipients = (auditRuleSelectedPeople.noticeRecipients || []).map(account => {
    const user = reviewUserOptions.find(item => item.account === account);
    return user ? formatAuditRulePersonLabel(user) : account;
  });
  const reviewerEmails = document.getElementById('auditRuleReviewerEmails')?.value.trim() || '';
  const noticeEmails = document.getElementById('auditRuleNoticeEmails')?.value.trim() || '';
  const notifyFrequency = document.getElementById('auditRuleNotifyFrequency')?.value || '实时通知';
  const timeoutReminder = document.getElementById('auditRuleTimeoutReminder')?.value || '不提醒';
  if (enabled && !sources.length) return showToast('请至少选择一个适用数据范围', false);
  if (enabled && (!Number.isInteger(days) || days < 1 || days > 90)) return showToast('统计周期请输入 1–90 天', false);
  if (enabled && (!Number.isInteger(sequence) || sequence < 1)) return showToast('请选择有效的AI外呼序次', false);
  if (enabled && !reviewers.length) return showToast('请至少配置一名审核人员', false);

  aiColdAuditRuleConfig.enabledSources = sources;
  aiColdAuditRuleConfig.windowDays = days;
  aiColdAuditRuleConfig.outboundSequence = sequence;
  aiColdAuditRuleConfig.enabled = enabled;
  aiColdAuditRuleConfig.notifyEnabled = notifyEnabled;
  aiColdAuditRuleConfig.reviewers = reviewers;
  aiColdAuditRuleConfig.noticeRecipients = noticeRecipients;
  aiColdAuditRuleConfig.reviewerEmails = reviewerEmails;
  aiColdAuditRuleConfig.noticeEmails = noticeEmails;
  aiColdAuditRuleConfig.notifyFrequency = notifyFrequency;
  aiColdAuditRuleConfig.timeoutReminder = timeoutReminder;
  aiColdAuditRuleConfig.updatedAt = '2026-07-24 10:30';
  persistAiColdAuditRuleConfig();
  selectedAuditIds = [];
  renderAiColdAuditRuleSummary();
  renderLeadAuditTable();
  showToast('AI冷线索审核规则已保存并生效', true);
  closeAiColdAuditRulePage();
});

function createBatchAuditDecisionModalIfNeeded() {
  if (document.getElementById('leadAuditBatchDecisionModal')) return;

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.id = 'leadAuditBatchDecisionModal';
  modalOverlay.onclick = event => {
    if (event.target === modalOverlay) closeBatchAuditDecisionModal();
  };
  modalOverlay.innerHTML = `
    <div class="modal" style="width: 500px; max-width: calc(100vw - 40px);">
      <div class="modal-header">
        <div class="modal-title">批量审核</div>
        <button class="modal-close" type="button" ${renderUiActionCallback('audit-batch-review-close')}>×</button>
      </div>
      <div class="modal-body">
        <div style="color:#475569; font-size:13px; line-height:1.6; margin-bottom:16px;">已选择 <strong id="batchAuditDecisionCount" style="color:#0f172a;">0</strong> 条待审核线索，请选择本次审核结果。</div>
        <div style="display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:12px;">
          <button type="button" style="padding:18px 14px; border:1px solid #bfdbfe; border-radius:8px; background:#eff6ff; color:#1d4ed8; text-align:left; cursor:pointer;" ${renderUiActionCallback('audit-batch-review-approve')}>
            <div style="font-size:15px; font-weight:600; margin-bottom:6px;">线索下发</div>
            <div style="font-size:12px; color:#64748b; line-height:1.5;">设置意向车系与专营店。</div>
          </button>
          <button type="button" style="padding:18px 14px; border:1px solid #e2e8f0; border-radius:8px; background:#f8fafc; color:#334155; text-align:left; cursor:pointer;" ${renderUiActionCallback('audit-batch-review-reject')}>
            <div style="font-size:15px; font-weight:600; margin-bottom:6px;">不下发</div>
            <div style="font-size:12px; color:#64748b; line-height:1.5;">统一配置线索状态、异常原因和意向级别。</div>
          </button>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel" type="button" ${renderUiActionCallback('audit-batch-review-close')}>取消</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalOverlay);
}

function openBatchAuditDecisionModal(leadIds) {
  batchAuditPendingIds = leadIds.filter(id => leadAuditList.some(item => item.id === id && item.status === '待审核'));
  if (!batchAuditPendingIds.length) {
    showToast('请至少选择一条待审核线索', false);
    return;
  }
  document.getElementById('batchAuditDecisionCount').textContent = batchAuditPendingIds.length;
  document.getElementById('leadAuditBatchDecisionModal')?.classList.add('show');
}

function closeBatchAuditDecisionModal() {
  document.getElementById('leadAuditBatchDecisionModal')?.classList.remove('show');
  batchAuditPendingIds = [];
}

// Create Reject Modal HTML structure if it doesn't exist
function createRejectModalIfNeeded() {
  if (document.getElementById('leadAuditRejectModal')) return;

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.id = 'leadAuditRejectModal';
  modalOverlay.onclick = function(e) {
    if (e.target === modalOverlay) closeRejectModal();
  };

  modalOverlay.innerHTML = `
    <div class="modal" style="width: 500px; max-width: calc(100vw - 40px);">
      <div class="modal-header">
        <div class="modal-title" id="leadAuditRejectModalTitle">线索拦截配置</div>
        <button class="modal-close" type="button" ${renderUiActionCallback('audit-dispatch-close-modal')}>×</button>
      </div>
      <div class="modal-body">
        <div id="leadAuditRejectModalNotice" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px; margin-bottom:16px; font-size:13px; color:#475569; line-height:1.5;">
          <strong>提示：</strong>选择“不下发”后，该线索将停止下发。请设置线索状态、异常原因和意向级别，系统会同步更新主数据，避免后续任务继续流转。
        </div>
        <div class="dispatch-rule-form" style="padding:0;">
          <div class="dispatch-form-grid" style="display:flex; flex-direction:column; gap:16px;">
            <div class="form-group" style="width:100%;">
              <div class="form-label">线索状态 <span class="required">*</span></div>
              <select class="form-input" id="auditFormLeadStatus" ${renderUiActionCallback('audit-dispatch-status-change', ['$value'])}>
                <!-- populated via script -->
              </select>
            </div>
            
            <div class="form-group" id="auditFormAbnormalReasonGroup" style="width:100%; display:none;">
              <div class="form-label">异常原因 <span class="required">*</span></div>
              <select class="form-input" id="auditFormAbnormalReason">
                <!-- populated cascadingly -->
              </select>
            </div>

            <div class="form-group" style="width:100%;">
              <div class="form-label">意向级别 <span class="required">*</span></div>
              <select class="form-input" id="auditFormIntentLevel">
                <!-- populated via script -->
              </select>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer" style="padding-top:12px;">
        <button class="btn-cancel" type="button" ${renderUiActionCallback('audit-dispatch-close-modal')}>取消</button>
        <button class="btn-save" id="leadAuditRejectModalSubmit" type="button" style="background:#ef4444; border-color:#ef4444;" ${renderUiActionCallback('audit-dispatch-reject-save')}>确 定</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);
}

// Close reject modal dialog
function closeRejectModal() {
  document.getElementById('leadAuditRejectModal')?.classList.remove('show');
  currentRejectingLeadId = null;
  currentRejectingLeadIds = [];
}

// Create Dispatch Settings Modal (Two-step wizard) if it doesn't exist
function createDispatchSettingsModalIfNeeded() {
  if (document.getElementById('leadAuditDispatchSettingsModal')) return;

  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';
  modalOverlay.id = 'leadAuditDispatchSettingsModal';
  modalOverlay.onclick = function(e) {
    if (e.target === modalOverlay) closeDispatchSettingsModal();
  };

  modalOverlay.innerHTML = `
    <div class="modal" id="dispatchSettingsModalContainer" style="width: 680px; max-width: calc(100vw - 40px);">
      <div class="modal-header">
        <div class="modal-title" id="dispatchSettingsModalTitle">下发设置</div>
        <button class="modal-close" type="button" ${renderUiActionCallback('audit-dispatch-settings-close')}>×</button>
      </div>
      <div class="modal-body" id="dispatchSettingsModalBody" style="padding-top: 16px;">
        <!-- Step views will be dynamically injected here -->
      </div>
      <div class="modal-footer" id="dispatchSettingsModalFooter">
        <!-- Buttons will be dynamically injected here -->
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);
}

function closeDispatchSettingsModal() {
  document.getElementById('leadAuditDispatchSettingsModal')?.classList.remove('show');
  dispatchSettingsSelectedIds = [];
  dispatchSettingsCurrentStep = 1;
}

// Helper to open the wizard modal
function openDispatchSettingsWizard(leadIds) {
  dispatchSettingsSelectedIds = leadIds;
  dispatchSettingsCurrentStep = 1;
  const body = document.getElementById('dispatchSettingsModalBody');
  if (body) {
    delete body.dataset.series;
    delete body.dataset.dealerName;
  }
  renderDispatchSettingsStep();
  document.getElementById('leadAuditDispatchSettingsModal')?.classList.add('show');
}

// Render wizard content based on current step
function renderDispatchSettingsStep() {
  const container = document.getElementById('dispatchSettingsModalContainer');
  const title = document.getElementById('dispatchSettingsModalTitle');
  const body = document.getElementById('dispatchSettingsModalBody');
  const footer = document.getElementById('dispatchSettingsModalFooter');
  if (!body || !footer) return;

  if (dispatchSettingsCurrentStep === 1) {
    // 单条沿用“下发设置”；勾选多条时明确为“批量下发”。
    const isSingle = dispatchSettingsSelectedIds.length === 1;
    title.textContent = isSingle ? '下发设置' : '批量审核';
    container.style.width = '560px';

    // Check if single or multiple
    let singleLead = null;
    let selectedSeries = '';
    let selectedDealer = '';

    const bodyEl = document.getElementById('dispatchSettingsModalBody');
    if (bodyEl && bodyEl.dataset.series) {
      selectedSeries = bodyEl.dataset.series;
      selectedDealer = bodyEl.dataset.dealerName;
    } else {
      if (isSingle) {
        singleLead = leadAuditList.find(r => r.id === dispatchSettingsSelectedIds[0]);
        if (singleLead) {
          selectedSeries = singleLead.carSeries || '';
          selectedDealer = singleLead.dealer || '';
        }
      } else {
        // 批量下发默认不覆盖各线索已有的意向信息。
        selectedSeries = keepOriginalIntentValue;
        selectedDealer = '';
      }
    }

    const keepOriginalIntent = !isSingle && selectedSeries === keepOriginalIntentValue;
    const dealerInputDisabled = !selectedSeries;
    const dealerInputValue = selectedDealer;
    const dealerPlaceholder = keepOriginalIntent
      ? '默认保留原意向专营店；可选择门店更新'
      : (selectedSeries ? '请选择或输入可售专营店进行匹配' : '请先选择意向车系');

    body.innerHTML = `
      <div style="background:#eff6ff; border:1px solid #bfdbfe; border-radius:6px; padding:12px; margin-bottom:16px; font-size:12px; color:#1e3a8a; line-height:1.5;">
        <strong>注意：</strong>如当前培育线索任务状态已经是门店跟进中，则不会覆盖更新。反之更新培育线索数据。
      </div>
      
      <div class="dispatch-rule-form" style="padding:0;">
        <div class="dispatch-form-grid" style="display:flex; flex-direction:column; gap:16px;">
          <div class="form-group" style="width:100%;">
            <div class="form-label">意向车系 ${isSingle ? '<span class="required">*</span>' : ''}</div>
            <select class="form-input" id="wizardFormCarSeries" ${renderUiActionCallback('audit-dispatch-settings-series-change', ['$value'])}>
              ${isSingle ? '<option value="">请选择意向车系</option>' : `<option value="${keepOriginalIntentValue}" ${keepOriginalIntent ? 'selected' : ''}>保留原意向车系</option>`}
              ${carSeriesOptions.map(series => `<option value="${series}" ${series === selectedSeries ? 'selected' : ''}>${series}</option>`).join('')}
            </select>
          </div>
          
          <div class="form-group" style="width:100%;">
            <div class="form-label">意向专营店 ${isSingle ? '<span class="required">*</span>' : ''}</div>
            <div class="resource-unfilled-smartcode-combobox" style="position:relative;">
              <input class="form-input" id="wizardFormDealerInput" autocomplete="off" placeholder="${dealerPlaceholder}" value="${dealerInputValue}" ${dealerInputDisabled ? 'disabled' : ''} onclick="toggleWizardDealerPicker()" oninput="openWizardDealerPicker();filterWizardDealerOptions(this.value)" />
              <div class="resource-unfilled-smartcode-dropdown wizard-dealer-dropdown" id="wizardFormDealerDropdown" style="width:100%; box-sizing:border-box; z-index:9999;">
                <div class="resource-unfilled-smartcode-dropdown-head">
                  <span>可售专营店</span>
                  <button type="button" onclick="clearWizardDealer()">清空选择</button>
                </div>
                <div class="wizard-dealer-filter-bar">
                  <input class="form-input" id="wizardDealerSearch" placeholder="搜索专营店名称/编码" oninput="filterWizardDealerOptions(this.value)" />
                  <select class="form-input" id="wizardDealerProvince" onchange="updateWizardDealerCityOptions()"></select>
                  <select class="form-input" id="wizardDealerCity" onchange="filterWizardDealerOptions()"></select>
                </div>
                <div class="resource-unfilled-smartcode-options" id="wizardFormDealerList" style="max-height:220px; overflow-y:auto; padding:8px 0;"></div>
                <div class="tag-picker-empty" id="wizardFormDealerEmpty" style="display:none; padding:12px; text-align:center; color:#94a3b8; font-size:12px;">暂无符合筛选条件的可售专营店</div>
              </div>
            </div>
          </div>

          ${!isSingle ? '<div class="form-field-helper-label">默认保留每条线索原有的意向车系和意向专营店；可仅选择专营店批量更新门店，候选仅展示同时可售所选线索原车系的门店。</div>' : ''}

          ${isSingle && singleLead ? `
          <div class="form-group" style="width:100%;">
            <div class="form-label">手机号码归属地</div>
            <div style="background:#f1f5f9; padding:8px 12px; border-radius:6px; font-size:13px; color:#334155; font-weight:600;">
              ${singleLead.location || '未知'}
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    `;

    footer.innerHTML = `
      <button class="btn-cancel" type="button" ${renderUiActionCallback('audit-dispatch-settings-close')}>取 消</button>
      <button class="btn-save" type="button" style="background:#22c55e; border-color:#22c55e;" ${renderUiActionCallback('audit-dispatch-settings-confirm')}>确 定</button>
    `;

    renderWizardDealerLocationFilters();
    renderWizardDealerOptions(selectedDealer);
  }
}

// Handle close buttons inside settings modal
registerUiActionCallback('audit-dispatch-settings-close', () => {
  closeDispatchSettingsModal();
});

// Single & Batch dispatch button entry
registerUiActionCallback('audit-dispatch-open-settings', leadId => {
  const item = leadAuditList.find(r => r.id === leadId);
  if (!item) return;

  if (item.status !== '待审核') {
    showToast('只能对待审核的线索进行下发设置！', false);
    return;
  }
  openDispatchSettingsWizard([leadId]);
});

registerUiActionCallback('audit-dispatch-batch-open-settings', () => {
  const pendingSelected = selectedAuditIds.filter(id => {
    const item = leadAuditList.find(r => r.id === id);
    return item && item.status === '待审核';
  });

  if (pendingSelected.length === 0) {
    showToast('请至少选择一条“待审核”的线索进行批量审核！', false);
    return;
  }

  openBatchAuditDecisionModal(pendingSelected);
});

registerUiActionCallback('audit-batch-review-close', closeBatchAuditDecisionModal);

registerUiActionCallback('audit-batch-review-approve', () => {
  const leadIds = [...batchAuditPendingIds];
  closeBatchAuditDecisionModal();
  openDispatchSettingsWizard(leadIds);
});

registerUiActionCallback('audit-batch-review-reject', () => {
  const leadIds = [...batchAuditPendingIds];
  closeBatchAuditDecisionModal();
  openAuditRejectModal(leadIds);
});

registerUiActionCallback('audit-dispatch-settings-series-change', () => {
  const dealerInput = document.getElementById('wizardFormDealerInput');
  const series = document.getElementById('wizardFormCarSeries')?.value || '';
  const keepOriginalIntent = series === keepOriginalIntentValue;
  if (dealerInput) {
    dealerInput.value = '';
    dealerInput.disabled = !series;
    dealerInput.placeholder = keepOriginalIntent
      ? '默认保留原意向专营店；可选择门店更新'
      : (dealerInput.disabled ? '请先选择意向车系' : '请选择或输入可售专营店进行匹配');
  }
  document.getElementById('wizardFormDealerDropdown')?.classList.remove('show');
  renderWizardDealerLocationFilters();
  renderWizardDealerOptions('');
});

// Confirm & Submit Dispatch ("确 定")
registerUiActionCallback('audit-dispatch-settings-confirm', () => {
  const series = document.getElementById('wizardFormCarSeries').value;
  const dealerInputVal = document.getElementById('wizardFormDealerInput').value.trim();
  const keepOriginalIntent = series === keepOriginalIntentValue;

  if (!series) {
    showToast('请选择意向车系', false);
    return;
  }

  let dealerName = '';
  let matchedDlrCode = '';
  if (!keepOriginalIntent || dealerInputVal) {
    if (!dealerInputVal) {
      showToast('请选择意向专营店', false);
      return;
    }
    const dealerCandidates = keepOriginalIntent ? dealerOptions : getWizardDealerOptionsBySeries(series);
    const selectedDlrObj = dealerCandidates.find(d => d.name === dealerInputVal || d.code === dealerInputVal);
    if (!selectedDlrObj) {
      showToast('请输入有效的意向专营店或专营店编码', false);
      return;
    }
    dealerName = selectedDlrObj.name;
    matchedDlrCode = selectedDlrObj.code;
  }

  const reviewedAt = formatAuditSnapshotTime();
  const batchNo = createAuditBatchNo();

  // Update mock database records and preserve the audit-time snapshot.
  dispatchSettingsSelectedIds.forEach(id => {
    const item = leadAuditList.find(r => r.id === id);
    if (item) {
      item.status = '已下发';
      if (!keepOriginalIntent) {
        item.carSeries = series;
      }
      if (dealerName) item.dealer = dealerName;
      if (matchedDlrCode) item.dealerCode = matchedDlrCode;
      item.updateLeadStatus = '总部_高意向';
      saveAuditSnapshot(item, '已下发', {
        carSeries: item.carSeries,
        dealer: item.dealer,
        dealerCode: item.dealerCode,
        leadStatus: item.updateLeadStatus,
      }, batchNo, reviewedAt);
    }
  });

  // Reset selection checkboxes
  selectedAuditIds = selectedAuditIds.filter(id => !dispatchSettingsSelectedIds.includes(id));

  // Close Modal
  closeDispatchSettingsModal();
  showToast(`成功下发 ${dispatchSettingsSelectedIds.length} 条线索至 NEV 线索中台！`, true);

  // Re-render
  renderLeadAuditSummary();
  renderLeadAuditTable();
});

// Dynamic Action Callbacks Registration
registerUiActionCallback('audit-dispatch-filter', () => {
  auditPageCurrentPage = 1;
  renderLeadAuditTable();
});

registerUiActionCallback('audit-dispatch-reset', () => {
  const kw = document.getElementById('auditKeywordFilter');
  if (kw) kw.value = '';
  const status = document.getElementById('auditStatusFilter');
  if (status) status.value = '';
  const type = document.getElementById('auditTypeFilter');
  if (type) type.value = '';
  
  auditPageCurrentPage = 1;
  renderLeadAuditTable();
});

registerUiActionCallback('audit-dispatch-page-size', size => {
  auditPagePageSize = Number(size) || 10;
  auditPageCurrentPage = 1;
  renderLeadAuditTable();
});

registerUiActionCallback('audit-dispatch-page-select', pageVal => {
  auditPageCurrentPage = Number(pageVal) || 1;
  renderLeadAuditTable();
});

registerUiActionCallback('audit-dispatch-page', direction => {
  const rows = getFilteredAuditLeads();
  const totalPages = Math.max(1, Math.ceil(rows.length / auditPagePageSize));
  auditPageCurrentPage = Math.max(1, Math.min(totalPages, auditPageCurrentPage + direction));
  renderLeadAuditTable();
});

registerUiActionCallback('audit-dispatch-view-snapshot', openAuditSnapshotDetail);

registerUiActionCallback('audit-dispatch-toggle-all', checked => {
  const rows = getFilteredAuditLeads();
  const start = (auditPageCurrentPage - 1) * auditPagePageSize;
  const pageRows = rows.slice(start, start + auditPagePageSize);
  const pageRowIds = pageRows.filter(item => item.status === '待审核').map(item => item.id);

  if (checked) {
    selectedAuditIds = [...new Set([...selectedAuditIds, ...pageRowIds])];
  } else {
    selectedAuditIds = selectedAuditIds.filter(id => !pageRowIds.includes(id));
  }
  renderLeadAuditTable();
});

registerUiActionCallback('audit-dispatch-toggle-one', input => {
  if (input.checked) {
    selectedAuditIds = [...new Set([...selectedAuditIds, input.value])];
  } else {
    selectedAuditIds = selectedAuditIds.filter(id => id !== input.value);
  }
  renderLeadAuditTable();
});

function openAuditRejectModal(leadIds) {
  const pendingIds = leadIds.filter(id => leadAuditList.some(item => item.id === id && item.status === '待审核'));
  if (!pendingIds.length) {
    showToast('请至少选择一条待审核线索', false);
    return;
  }

  currentRejectingLeadIds = pendingIds;
  currentRejectingLeadId = pendingIds[0];
  const isBatch = pendingIds.length > 1;
  const title = document.getElementById('leadAuditRejectModalTitle');
  const notice = document.getElementById('leadAuditRejectModalNotice');
  const submit = document.getElementById('leadAuditRejectModalSubmit');
  if (title) title.textContent = isBatch ? '批量不下发' : '线索拦截配置';
  if (notice) notice.innerHTML = isBatch
    ? `<strong>提示：</strong>将对已选择的 ${pendingIds.length} 条线索执行“不下发”。请统一设置线索状态、异常原因和意向级别，系统会同步更新主数据。`
    : '<strong>提示：</strong>选择“不下发”后，该线索将停止下发。请设置线索状态、异常原因和意向级别，系统会同步更新主数据，避免后续任务继续流转。';
  if (submit) submit.textContent = isBatch ? '确 定' : '确 定';

  // 与“新增线索下发配置－执行动作”共用同一套状态联动规则。
  const statusSelect = document.getElementById('auditFormLeadStatus');
  const reasonGroup = document.getElementById('auditFormAbnormalReasonGroup');
  if (statusSelect) {
    statusSelect.innerHTML = renderLeadDispatchOptionList(auditRejectLeadStatusOptions, '', '请选择线索状态');
    statusSelect.value = '';
  }
  if (reasonGroup) reasonGroup.style.display = '';
  syncAuditRejectFieldsByLeadStatus();

  // Show Modal
  document.getElementById('leadAuditRejectModal')?.classList.add('show');
}

// Open Reject Config Modal
registerUiActionCallback('audit-dispatch-reject-open', leadId => {
  openAuditRejectModal([leadId]);
});

// Close Reject Modal
registerUiActionCallback('audit-dispatch-close-modal', () => {
  closeRejectModal();
});

// 与“新增线索下发配置－执行动作”保持一致的三级联动。
function syncAuditRejectFieldsByLeadStatus() {
  const statusSelect = document.getElementById('auditFormLeadStatus');
  const reasonSelect = document.getElementById('auditFormAbnormalReason');
  const intentSelect = document.getElementById('auditFormIntentLevel');
  const reasonGroup = document.getElementById('auditFormAbnormalReasonGroup');
  if (!statusSelect || !reasonSelect || !intentSelect) return;

  const statusValue = statusSelect.value || '';
  const currentReason = reasonSelect.value || '';
  const currentIntentLevel = intentSelect.value || '';
  const reasonLocked = !statusValue || isLeadStatusAbnormalReasonLocked(statusValue);
  const intentLocked = !statusValue || isLeadStatusIntentLevelLocked(statusValue);

  if (reasonGroup) reasonGroup.style.display = shouldShowLeadDispatchAbnormalReason(statusValue) ? '' : 'none';
  reasonSelect.disabled = reasonLocked;
  reasonSelect.innerHTML = renderLeadDispatchOptionList(
    getLeadDispatchAbnormalReasonOptions(statusValue, currentReason),
    getSelectedLeadDispatchAbnormalReason(statusValue, currentReason),
    !statusValue ? '请选择异常原因' : (isLeadStatusAbnormalReasonLocked(statusValue) ? '不更新' : '请选择异常原因')
  );

  intentSelect.disabled = intentLocked;
  intentSelect.innerHTML = renderLeadDispatchOptionList(
    getLeadDispatchIntentLevelOptions(statusValue, currentIntentLevel),
    getLeadStatusLockedIntentLevel(statusValue, currentIntentLevel),
    !statusValue ? '请选择意向级别' : (isLeadStatusIntentLevelLocked(statusValue) ? '不更新' : '请选择意向级别')
  );
}

registerUiActionCallback('audit-dispatch-status-change', syncAuditRejectFieldsByLeadStatus);

// Save Reject Config Parameters
registerUiActionCallback('audit-dispatch-reject-save', () => {
  const targetIds = currentRejectingLeadIds.length
    ? currentRejectingLeadIds
    : (currentRejectingLeadId ? [currentRejectingLeadId] : []);
  const targetItems = leadAuditList.filter(item => targetIds.includes(item.id) && item.status === '待审核');
  if (!targetItems.length) return;

  const leadStatus = document.getElementById('auditFormLeadStatus').value;
  const abnormalReason = document.getElementById('auditFormAbnormalReason').value;
  const intentLevel = document.getElementById('auditFormIntentLevel').value;

  if (!leadStatus) {
    showToast('请选择线索状态', false);
    return;
  }

  const resolvedReason = getLeadStatusLockedAbnormalReason(leadStatus, abnormalReason);
  const resolvedIntentLevel = getLeadStatusLockedIntentLevel(leadStatus, intentLevel);
  if (!isLeadStatusAbnormalReasonLocked(leadStatus) && hasLeadDispatchAbnormalReasons(leadStatus) && !resolvedReason) {
    showToast('请选择异常原因', false);
    return;
  }
  if (isLeadDispatchIntentLevelRequired(leadStatus) && !resolvedIntentLevel) {
    showToast('请选择意向级别', false);
    return;
  }
  if (!isLeadDispatchIntentLevelValid(leadStatus, resolvedIntentLevel)) {
    showToast('请选择有效的意向级别', false);
    return;
  }

  const reviewedAt = formatAuditSnapshotTime();
  const batchNo = createAuditBatchNo();

  // 对本次选中的待审核线索统一执行“不下发”，并保存审核配置快照。
  targetItems.forEach(item => {
    item.status = '不下发';
    item.updateLeadStatus = leadStatus;
    item.abnormalReason = resolvedReason;
    item.updateIntentLevel = resolvedIntentLevel;
    saveAuditSnapshot(item, '不下发', {
      leadStatus: item.updateLeadStatus,
      abnormalReason: item.abnormalReason,
      intentLevel: item.updateIntentLevel
    }, batchNo, reviewedAt);
  });
  selectedAuditIds = selectedAuditIds.filter(id => !targetIds.includes(id));

  closeRejectModal();
  showToast(`已将 ${targetItems.length} 条线索设为不下发，并更新归档信息！`, true);
  
  // Re-render
  renderLeadAuditSummary();
  renderLeadAuditTable();
});

function switchLeadDispatchAuditTab(tab = 'lead-dispatch-audit-ai-cold') {
  // Hide active modals
  document.getElementById('leadAuditRejectConfigModal')?.classList.remove('show');
  document.getElementById('leadAuditRejectModal')?.classList.remove('show');
  document.getElementById('leadAuditDispatchSettingsModal')?.classList.remove('show');
  document.getElementById('leadAuditBatchDecisionModal')?.classList.remove('show');

  // Highlight active tab
  document.querySelectorAll('#leadDispatchAuditTabs .strategy-config-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });

  // Hide all containers
  document.getElementById('leadDispatchAuditPage').classList.remove('show');
  document.querySelector('.content')?.classList.remove('audit-rule-page-active');
  document.getElementById('aiColdAuditRulePage')?.classList.remove('show');
  document.getElementById('batchDispatchAiPage').classList.remove('show');
  document.getElementById('batchDispatchManualPage').classList.remove('show');

  if (tab === 'lead-dispatch-audit-ai-cold') {
    setPageName('线索管理 / 下发审核 / AI冷线索');
    document.getElementById('leadDispatchAuditPage').classList.add('show');
    initLeadDispatchAuditPage();
  } else if (tab === 'lead-dispatch-audit-ai-batch') {
    setPageName('线索管理 / 下发审核 / AI批量下发');
    document.getElementById('batchDispatchAiPage').classList.add('show');
    if (typeof initBatchDispatchAiPage === 'function') {
      initBatchDispatchAiPage();
    }
  } else if (tab === 'lead-dispatch-audit-manual-batch') {
    setPageName('线索管理 / 下发审核 / 人工批量下发');
    document.getElementById('batchDispatchManualPage').classList.add('show');
    if (typeof initBatchDispatchManualPage === 'function') {
      initBatchDispatchManualPage();
    }
  }
}

registerUiActionCallback('lead-dispatch-audit-tab-switch', tab => switchLeadDispatchAuditTab(tab));

// ===== Audio Player and Transcript Dialogue Control =====

function parseAuditDurationToSeconds(duration) {
  const parts = String(duration || '00:00').split(':').map(num => parseInt(num, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

function formatAuditAudioTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const mins = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const secs = String(safeSeconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function pauseAuditAudio() {
  auditAudioPlaying = false;
  window.clearInterval(auditAudioTimer);
  auditAudioTimer = null;
  const item = leadAuditList.find(r => r.callId === activeAuditAudioCallId);
  if (item) updateAuditAudioPlayer(item);
  renderLeadAuditTable();
}

function stopAuditAudio() {
  window.clearInterval(auditAudioTimer);
  auditAudioTimer = null;
  activeAuditAudioCallId = '';
  auditAudioPlaying = false;
  auditAudioProgressSeconds = 0;
  auditAudioDurationSeconds = 0;
  const player = document.getElementById('auditAudioPlayer');
  if (player) player.style.display = 'none';
  renderLeadAuditTable();
}

function startAuditAudioTimer() {
  window.clearInterval(auditAudioTimer);
  auditAudioTimer = window.setInterval(() => {
    if (!auditAudioPlaying) return;
    auditAudioProgressSeconds += 1;
    if (auditAudioProgressSeconds >= auditAudioDurationSeconds) {
      auditAudioProgressSeconds = auditAudioDurationSeconds;
      pauseAuditAudio();
    }
    const item = leadAuditList.find(r => r.callId === activeAuditAudioCallId);
    if (item) updateAuditAudioPlayer(item);
  }, 1000);
}

function updateAuditAudioPlayer(item) {
  const player = document.getElementById('auditAudioPlayer');
  if (!player) return;
  player.style.display = 'flex';
  document.getElementById('auditAudioTitle').textContent = `${auditAudioPlaying ? '正在播放' : '已暂停'} · ${item.name} · ${item.callId}`;
  document.getElementById('auditAudioTime').textContent = `${formatAuditAudioTime(auditAudioProgressSeconds)} / ${formatAuditAudioTime(auditAudioDurationSeconds)}`;
  document.getElementById('auditAudioProgress').style.width = `${auditAudioDurationSeconds ? Math.min(100, (auditAudioProgressSeconds / auditAudioDurationSeconds) * 100) : 0}%`;
  document.getElementById('auditAudioIcon').innerHTML = auditAudioPlaying
    ? '<path d="M8 5h3v14H8V5zm5 0h3v14h-3V5z"/>'
    : '<path d="M8 5v14l11-7L8 5z"/>';
}

function renderTranscriptPanelForLead(item) {
  const panel = document.getElementById('auditTranscriptPanel');
  const title = document.getElementById('auditTranscriptTitle');
  const meta = document.getElementById('auditTranscriptMeta');
  const body = document.getElementById('auditTranscriptBody');
  
  if (panel && title && meta && body) {
    const transcript = item.transcript;
    title.textContent = '录音文本 · ' + (item.displayPhone || item.phone.replace(/(\d{3})\d+(\d{4})/, '$1****$2'));
    meta.innerHTML =
      `<span>通话时长：${transcript.duration || '—'}</span>` +
      `<span>外呼类型：${transcript.callType || '—'}</span>` +
      `<span>通话ID：${item.callId}</span>`;

    let html = '<div class="chat-time-divider">00:00 开始通话</div>';
    transcript.messages.forEach(msg => {
      const isAgent = msg.role === 'agent';
      const avatarText = isAgent ? '销' : '客';
      const senderName = isAgent ? 'AI智能助理' : '客户';
      const tagHtml = msg.tag
        ? `<span class="chat-sender-tag ${msg.tag}">${
            msg.tag === 'intent' ? '意向确认' :
            msg.tag === 'action' ? '关键动作' : msg.tag
          }</span>`
        : '';

      html += `
        <div class="chat-msg ${isAgent ? 'agent' : 'customer'}">
          <div class="chat-avatar">${avatarText}</div>
          <div class="chat-bubble-wrap">
            <div class="chat-sender">${senderName} ${tagHtml}</div>
            <div class="chat-bubble">${msg.text}</div>
          </div>
        </div>
      `;
    });

    if (transcript.tags && transcript.tags.length > 0) {
      html += `<div class="chat-tags-bar">${transcript.tags.map(tag =>
        `<span class="tag-chip">${tag}</span>`
      ).join('')}</div>`;
    }

    html += `<div class="chat-end-divider">通话结束 · 时长 ${transcript.duration || '—'}</div>`;
    body.innerHTML = html;
    panel.classList.add('show');
  }
}

registerUiActionCallback('audit-dispatch-listen-audio', callId => {
  const item = leadAuditList.find(r => r.callId === callId);
  if (!item) return;

  if (activeAuditAudioCallId === callId && auditAudioPlaying) {
    pauseAuditAudio();
    return;
  }

  const isSameAudio = activeAuditAudioCallId === callId;
  activeAuditAudioCallId = callId;
  auditAudioPlaying = true;
  auditAudioProgressSeconds = isSameAudio && auditAudioProgressSeconds > 0 ? auditAudioProgressSeconds : 0;
  auditAudioDurationSeconds = parseAuditDurationToSeconds(item.transcript?.duration || '01:15');
  
  updateAuditAudioPlayer(item);
  startAuditAudioTimer();

  // Dual linkage: Automatically render/open transcript of this call record
  activeAuditTranscriptCallId = callId;
  renderTranscriptPanelForLead(item);

  renderLeadAuditTable();
  showToast(`正在播放录音：${callId}`, true);
});

registerUiActionCallback('audit-dispatch-close-audio', () => {
  stopAuditAudio();
});

registerUiActionCallback('audit-dispatch-toggle-audio-playback', () => {
  if (!activeAuditAudioCallId) return;
  const item = leadAuditList.find(r => r.callId === activeAuditAudioCallId);
  if (!item) return;
  
  if (auditAudioPlaying) {
    pauseAuditAudio();
  } else {
    auditAudioPlaying = true;
    updateAuditAudioPlayer(item);
    startAuditAudioTimer();
    renderLeadAuditTable();
  }
});

registerUiActionCallback('audit-dispatch-open-transcript', callId => {
  const item = leadAuditList.find(r => r.callId === callId);
  if (!item || !item.transcript) {
    showToast('暂无录音文本数据', false);
    return;
  }

  activeAuditTranscriptCallId = callId;
  renderTranscriptPanelForLead(item);

  const panel = document.getElementById('auditTranscriptPanel');
  if (panel) {
    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Dual linkage: Automatically sync/play audio for this record
  if (activeAuditAudioCallId !== callId) {
    activeAuditAudioCallId = callId;
    auditAudioPlaying = true;
    auditAudioProgressSeconds = 0;
    auditAudioDurationSeconds = parseAuditDurationToSeconds(item.transcript.duration || '01:15');
    updateAuditAudioPlayer(item);
    startAuditAudioTimer();
    showToast(`正在播放录音：${callId}`, true);
  }
  
  renderLeadAuditTable();
});

registerUiActionCallback('audit-dispatch-close-transcript', () => {
  const panel = document.getElementById('auditTranscriptPanel');
  if (panel) panel.classList.remove('show');
  activeAuditTranscriptCallId = '';
  stopAuditAudio();
  renderLeadAuditTable();
});

// ===== Intent Dealer Combobox Searchable Dropdown =====

if (typeof window.escapeHtml !== 'function') {
  window.escapeHtml = function(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };
}

function getWizardDealerFilterBase() {
  const series = document.getElementById('wizardFormCarSeries')?.value || '';
  return getWizardDealerOptionsBySeries(series);
}

function renderWizardDealerLocationFilters() {
  const provinceSelect = document.getElementById('wizardDealerProvince');
  const citySelect = document.getElementById('wizardDealerCity');
  if (!provinceSelect || !citySelect) return;

  const dealers = getWizardDealerFilterBase();
  const previousProvince = provinceSelect.value || '';
  const provinces = [...new Set(dealers.map(item => item.province))];
  provinceSelect.innerHTML = `<option value="">全部省份</option>${provinces.map(province => `<option value="${escapeHtml(province)}" ${province === previousProvince ? 'selected' : ''}>${escapeHtml(province)}</option>`).join('')}`;
  if (previousProvince && !provinces.includes(previousProvince)) provinceSelect.value = '';
  updateWizardDealerCityOptions(true);
}

function updateWizardDealerCityOptions(keepCurrent = false) {
  const provinceSelect = document.getElementById('wizardDealerProvince');
  const citySelect = document.getElementById('wizardDealerCity');
  if (!provinceSelect || !citySelect) return;

  const previousCity = keepCurrent ? citySelect.value : '';
  const province = provinceSelect.value;
  const cities = [...new Set(getWizardDealerFilterBase().filter(item => !province || item.province === province).map(item => item.city))];
  citySelect.innerHTML = `<option value="">全部城市</option>${cities.map(city => `<option value="${escapeHtml(city)}" ${city === previousCity ? 'selected' : ''}>${escapeHtml(city)}</option>`).join('')}`;
  if (previousCity && !cities.includes(previousCity)) citySelect.value = '';
  filterWizardDealerOptions();
}

function renderWizardDealerOptions(selectedDealer = '') {
  const list = document.getElementById('wizardFormDealerList');
  if (!list) return;
  const eligibleDealers = getWizardDealerFilterBase();

  list.innerHTML = eligibleDealers.map(item => {
    const isSelected = selectedDealer === item.name;
    return `
      <label class="resource-unfilled-smartcode-option ${isSelected ? 'selected' : ''}" data-dealer-option="${escapeHtml(item.name)}" data-dealer-province="${escapeHtml(item.province)}" data-dealer-city="${escapeHtml(item.city)}" style="display:flex; align-items:center; gap:8px; padding:8px 12px; cursor:pointer;">
        <input type="radio" name="wizardDealerItem" value="${escapeHtml(item.name)}" ${isSelected ? 'checked' : ''} onchange="selectWizardDealerFromPicker(this)" />
        <span class="resource-unfilled-smartcode-option-main" style="font-size:13px; color:#1e293b;">${escapeHtml(item.name)}</span>
        <span class="resource-unfilled-smartcode-option-name" style="margin-left:auto; font-size:12px; color:#64748b;">${escapeHtml(item.code)}</span>
      </label>
    `;
  }).join('');
  filterWizardDealerOptions();
}

function toggleWizardDealerPicker() {
  const series = document.getElementById('wizardFormCarSeries')?.value;
  if (!series) {
    showToast('请先选择意向车系', false);
    return;
  }
  document.getElementById('wizardFormDealerDropdown')?.classList.toggle('show');
}

function openWizardDealerPicker() {
  if (!document.getElementById('wizardFormCarSeries')?.value) return;
  document.getElementById('wizardFormDealerDropdown')?.classList.add('show');
}

function filterWizardDealerOptions(keyword) {
  const searchInput = document.getElementById('wizardDealerSearch');
  if (keyword !== undefined && searchInput && searchInput.value !== String(keyword)) searchInput.value = String(keyword);
  const normalized = String(keyword === undefined ? (searchInput?.value || '') : keyword).trim().toLowerCase();
  const province = document.getElementById('wizardDealerProvince')?.value || '';
  const city = document.getElementById('wizardDealerCity')?.value || '';

  let visibleCount = 0;
  document.querySelectorAll('#wizardFormDealerList [data-dealer-option]').forEach(option => {
    const text = option.textContent.toLowerCase();
    const visible = text.includes(normalized) && (!province || option.dataset.dealerProvince === province) && (!city || option.dataset.dealerCity === city);
    option.style.display = visible ? 'flex' : 'none';
    if (visible) visibleCount += 1;
  });

  const empty = document.getElementById('wizardFormDealerEmpty');
  if (empty) empty.style.display = visibleCount ? 'none' : 'block';
}

function selectWizardDealerFromPicker(input) {
  if (!input?.checked) return;
  document.querySelectorAll('#wizardFormDealerList .resource-unfilled-smartcode-option').forEach(option => {
    option.classList.toggle('selected', option.querySelector('input') === input);
  });
  
  const searchInput = document.getElementById('wizardFormDealerInput');
  if (searchInput) searchInput.value = input.value;
  
  document.getElementById('wizardFormDealerDropdown')?.classList.remove('show');
}

function clearWizardDealer() {
  document.querySelectorAll('#wizardFormDealerList input[name="wizardDealerItem"]').forEach(input => { input.checked = false; });
  document.querySelectorAll('#wizardFormDealerList .resource-unfilled-smartcode-option').forEach(option => option.classList.remove('selected'));
  const input = document.getElementById('wizardFormDealerInput');
  if (input) input.value = '';
  filterWizardDealerOptions('');
}

document.addEventListener('click', event => {
  const combobox = event.target.closest('.resource-unfilled-smartcode-combobox');
  if (!combobox) {
    document.getElementById('wizardFormDealerDropdown')?.classList.remove('show');
  }
});
