// ===== SMS Dispatch Policy =====
const smsDispatchRules = [
  { id: 1, name: '大模型线索高意向短信', priority: 1, leadType: '冷线索', callTypes: ['一知-大模型NEV新线索', '冰兰-保客', '冰兰-新线索', '一知-保客'], statuses: ['1-已接通'], statusLogic: '且', tags: ['有购车意向', '同意到店', '同意添加企微', '7天内-gc', '一个月内-gc', '三个月内-gc', '三个月后-gc', '7天内', '一个月内', '三个月内', '三个月后'], tagLogic: '或', send: '下发', template: '大模型短信（高意向）', enabled: true },
  { id: 2, name: '大模型线索活动权益短信', priority: 2, leadType: '冷线索', callTypes: ['一知-大模型NEV新线索', '冰兰-保客', '冰兰-新线索', '一知-保客'], statuses: ['1-已接通'], statusLogic: '且', tags: ['优惠活动', '金融政策', '置换政策', '首购', '换购', '增购', '全款', '贷款', '价格'], tagLogic: '或', send: '下发', template: '大模型短信（活动）', enabled: true },
  { id: 3, name: '大模型线索产品关注短信', priority: 3, leadType: '冷线索', callTypes: ['一知-大模型NEV新线索', '冰兰-保客', '冰兰-新线索', '一知-保客'], statuses: ['1-已接通'], statusLogic: '且', tags: ['省内自驾', '长途越野', '家庭出游', '商务接待', '滴滴挣钱', '车机', '颜色', '交付时间', '空间', '动力', '外观', '智能化', '智驾', '三电', '舒适性', '内饰', '安全性', '保值', '品牌', '能耗', '通勤代步', '服务', '环保', '养护'], tagLogic: '或', send: '下发', template: '大模型短信1', enabled: true },
  { id: 4, name: '大模型线索接通兜底短信', priority: 4, leadType: '冷线索', callTypes: ['一知-大模型NEV新线索', '冰兰-保客', '冰兰-新线索', '一知-保客'], statuses: ['1-已接通'], statusLogic: '且', tags: ['接通无标签', '接通秒挂', '语音信箱', '下次联系'], tagLogic: '或', send: '下发', template: '大模型短信2', enabled: true },
  { id: 5, name: '大模型线索未接通短信', priority: 5, leadType: '冷线索', callTypes: ['一知-大模型NEV新线索', '冰兰-保客', '冰兰-新线索', '一知-保客'], statuses: ['2-无人接听', '3-占线', '4-拒接', '5-空号', '6-关机', '7-停机', '8-欠费', '9-无法接通'], statusLogic: '或', tags: [], tagLogic: '', send: '下发', template: '大模型短信（未接通）', enabled: true }
];
let smsDispatchPageSize = 10;
let smsDispatchCurrentPage = 1;
let editingSmsDispatchRuleId = null;
let smsDispatchNextId = 6;

// 正式接口由宿主注入；未接入时仅提供原型示例响应。
const smsIntelligentDemoApi = {
  async listCallTypes() {
    return [{ code: 'AI_NEW', name: '智能外呼-新线索（示例）' }, { code: 'AI_OWNER', name: '智能外呼-保客（示例）' }];
  },
  async listTags(typeCode) {
    const tags = {
      AI_NEW: [{ code: 'NEW_INTENT', name: '有购车意向' }, { code: 'NEW_TEST', name: '愿意试驾' }, { code: 'NEW_REFUSE', name: '暂无购车意向' }],
      AI_OWNER: [{ code: 'OWNER_REPLACE', name: '有置换意向' }, { code: 'OWNER_BUY', name: '有增购意向' }, { code: 'OWNER_REFUSE', name: '暂无换购意向' }]
    };
    return tags[typeCode] || [];
  }
};
let smsIntelligentCatalog = { types: [], tags: [], typeCode: '', status: 'idle', error: '' };
let smsDispatchFormRequest = 0;

function getSmsDispatchScenario(rule) {
  return rule?.scenario || 'existing';
}

function getSmsDispatchScenarioName(rule) {
  return getSmsDispatchScenario(rule) === 'intelligent' ? '智能外呼场景' : '现有场景';
}

function normalizeSmsIntelligentOptions(items) {
  if (!Array.isArray(items)) throw new Error('接口数据格式异常，请联系管理员');
  const codes = new Set();
  const names = new Set();
  return items.filter(item => item?.enabled !== false).map(item => {
    if (typeof item?.code !== 'string' || !item.code.trim() || typeof item.name !== 'string' || !item.name.trim() || codes.has(item.code) || names.has(item.name)) {
      throw new Error('接口选项缺少有效编码、名称或存在重复，请联系管理员');
    }
    codes.add(item.code);
    names.add(item.name);
    return { code: item.code, name: item.name };
  });
}

function hasInvalidSmsIntelligentTags(rule) {
  const selections = [
    ...(rule.tags || []).map((name, index) => ({ name, code: rule.includeTagCodes?.[index] })),
    ...(rule.excludeTags || []).map((name, index) => ({ name, code: rule.excludeTagCodes?.[index] }))
  ];
  return selections.some(selection => !smsIntelligentCatalog.tags.some(tag => tag.code === selection.code && tag.name === selection.name));
}

function initializeSmsDispatchPickers() {
  updateCallTypeTagPickerSummary('smsDispatchCallType');
  updateCallTypeTagPickerSummary('smsDispatchIntentSeries');
  updateSmsDispatchCallStatusPickerSummary();
  updateSmsDispatchTagPickerSummary('Include');
  updateSmsDispatchTagPickerSummary('Exclude');
}

function refreshSmsDispatchForm(rule) {
  document.getElementById('leadDispatchRuleModalBody').innerHTML = renderSmsDispatchRuleForm(rule);
  initializeSmsDispatchPickers();
}

async function loadSmsIntelligentFormOptions() {
  const token = ++smsDispatchFormRequest;
  if (document.getElementById('smsFormScenario')?.value !== 'intelligent') return;
  const api = window.smsIntelligentOutboundApi || smsIntelligentDemoApi;
  const typeCode = document.getElementById('smsFormIntelligentCallType')?.value || '';
  smsIntelligentCatalog = { types: [], tags: [], typeCode, status: 'loading', error: '' };
  refreshSmsDispatchForm(readSmsDispatchForm());
  let types = [];
  try {
    types = normalizeSmsIntelligentOptions(await api.listCallTypes());
    if (token !== smsDispatchFormRequest) return;
    const validType = types.some(item => item.code === typeCode);
    const tags = validType ? normalizeSmsIntelligentOptions(await api.listTags(typeCode)) : [];
    if (token !== smsDispatchFormRequest) return;
    smsIntelligentCatalog = { types, tags, typeCode, status: 'ready', error: '' };
  } catch (error) {
    if (token !== smsDispatchFormRequest) return;
    smsIntelligentCatalog = { types, tags: [], typeCode, status: 'error', error: error.message || '加载失败，请重试' };
  }
  if (document.getElementById('leadDispatchRuleModal')?.classList.contains('show') && document.getElementById('smsFormScenario')?.value === 'intelligent') {
    const draft = readSmsDispatchForm();
    // 标签名称调整时按稳定编码回填，已移除标签保留原名并交由保存校验提示。
    for (const [namesField, codesField] of [['tags', 'includeTagCodes'], ['excludeTags', 'excludeTagCodes']]) {
      draft[namesField] = draft[namesField].map((name, index) => smsIntelligentCatalog.tags.find(item => item.code === draft[codesField][index])?.name || name);
    }
    refreshSmsDispatchForm(draft);
  }
}

function changeSmsDispatchScenario() {
  smsDispatchFormRequest++;
  const rule = { ...readSmsDispatchForm(), callTypes: [], callTypeCode: '', tags: [], excludeTags: [] };
  refreshSmsDispatchForm(rule);
  if (rule.scenario === 'intelligent') loadSmsIntelligentFormOptions();
  showToast('已切换场景，请重新选择外呼类型和标签');
}

function changeSmsIntelligentCallType() {
  refreshSmsDispatchForm({ ...readSmsDispatchForm(), tags: [], excludeTags: [] });
  loadSmsIntelligentFormOptions();
}

function renderSmsDispatchCallTypeInput(rule) {
  if (getSmsDispatchScenario(rule) !== 'intelligent') {
    return renderCallTypeTagPicker({ idPrefix: 'smsDispatchCallType', inputName: 'smsDispatchCallType', options: getSmsDispatchAllCallTypes(), selected: rule.callTypes || [] });
  }
  const catalog = smsIntelligentCatalog;
  const missing = rule.callTypeCode && !catalog.types.some(item => item.code === rule.callTypeCode);
  return `<select class="form-input" id="smsFormIntelligentCallType" ${catalog.status === 'loading' || (catalog.status === 'error' && !catalog.types.length) ? 'disabled' : ''} ${renderUiActionCallback('sms-intelligent-type-change')}>
    <option value="">${catalog.status === 'loading' ? '正在加载智能外呼类型…' : '请选择智能外呼类型'}</option>
    ${catalog.types.map(item => `<option value="${escapeAttr(item.code)}" ${rule.callTypeCode === item.code ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('')}
    ${missing ? `<option value="${escapeAttr(rule.callTypeCode)}" selected>${escapeHtml(rule.callTypes?.[0] || rule.callTypeCode)}${catalog.status === 'ready' ? '（已失效）' : ''}</option>` : ''}
  </select><div class="series-form-hint">${window.smsIntelligentOutboundApi ? '类型及标签由智能外呼系统提供' : '当前为原型接口示例数据'}；每条规则选择一个外呼类型。</div>
  ${catalog.status === 'error' ? `<div role="alert">${escapeHtml(catalog.error)} <button class="btn-secondary" type="button" ${renderUiActionCallback('sms-intelligent-retry')}>重试</button></div>` : ''}
  ${catalog.status === 'ready' && !catalog.types.length ? '<div role="status">智能外呼系统暂无可用外呼类型</div>' : ''}
  <div id="smsIntelligentTagsAlert" role="alert" ${catalog.status === 'ready' && hasInvalidSmsIntelligentTags(rule) ? '' : 'hidden'}>原配置包含已失效的标签，请清空后重新选择</div>
  ${catalog.status === 'ready' && rule.callTypeCode && !catalog.tags.length ? '<div role="status">该外呼类型暂无可用标签，请选择其他类型</div>' : ''}`;
}

function changeSmsDispatchScenarioFilter() {
  const scenario = document.getElementById('smsDispatchScenarioFilter')?.value;
  const types = scenario === 'existing' ? getSmsDispatchAllCallTypes() : scenario === 'intelligent'
    ? [...new Set(smsDispatchRules.filter(rule => getSmsDispatchScenario(rule) === 'intelligent').flatMap(rule => rule.callTypes || []))]
    : [...new Set([...getSmsDispatchAllCallTypes(), ...smsDispatchRules.flatMap(rule => rule.callTypes || [])])];
  document.getElementById('smsDispatchCallTypeFilter').innerHTML = '<option value="">全部</option>' + types.map(name => `<option value="${escapeAttr(name)}">${escapeHtml(name)}</option>`).join('');
  filterSmsDispatchRuleTable();
}

registerUiActionCallback('sms-scenario-change', event => {
  if (event.type === 'change') changeSmsDispatchScenario();
});
registerUiActionCallback('sms-intelligent-type-change', event => {
  if (event.type === 'change') changeSmsIntelligentCallType();
});
registerUiActionCallback('sms-intelligent-retry', loadSmsIntelligentFormOptions);
registerUiActionCallback('sms-scenario-filter', event => {
  if (event.type === 'change') changeSmsDispatchScenarioFilter();
});

function renderSmsDispatchPolicyPage() {
  const page = document.getElementById('smsDispatchPolicyPage');
  if (!page) return;
  page.innerHTML = `
    <div class="page-hero">
      <div>
        <div class="page-title">短信下发配置</div>
        <div class="page-desc">用于配置 AI 外呼结束后的短信触达规则，先按适用场景区分数据来源，再按外呼类型、通话状态、外呼标签、标签最新意向车系和优先级判断是否下发短信，并关联具体短信模板。命中后系统按规则自动选择模板触达客户，让高意向、活动权益、未接通等场景的后续沟通更标准、可追踪。</div>
      </div>
      ${renderSmsDispatchSummary()}
    </div>
    <div class="filter-row">
      <span class="filter-label">适用场景：</span>
      <select class="filter-select" id="smsDispatchScenarioFilter" ${renderUiActionCallback('sms-scenario-filter')}>
        <option value="">全部</option><option value="existing">现有场景</option><option value="intelligent">智能外呼场景</option>
      </select>
      <span class="filter-label">关键字：</span>
      <input class="lead-input" style="width:130px; margin-right: 12px;" id="smsDispatchKeywordFilter" placeholder="请输入" ${renderUiActionCallback('sms-filter')} />
      <span class="filter-label">外呼类型：</span>
      <select class="filter-select" id="smsDispatchCallTypeFilter" ${renderUiActionCallback('sms-filter')}>
        <option value="">全部</option>
        ${[...new Set([...getSmsDispatchAllCallTypes(), ...smsDispatchRules.flatMap(rule => rule.callTypes || [])])].map(type => `<option value="${type}">${type}</option>`).join('')}
      </select>
      <span class="filter-label">短信模板：</span>
      <select class="filter-select" id="smsDispatchTemplateFilter" ${renderUiActionCallback('sms-filter')}>
        <option value="">全部</option>
        ${[...new Set(smsDispatchRules.map(rule => rule.template))].map(template => `<option value="${template}">${template}</option>`).join('')}
      </select>
      <span class="filter-label">状态：</span>
      <select class="filter-select" id="smsDispatchEnabledFilter" ${renderUiActionCallback('sms-filter')}>
        <option value="">全部</option>
        <option value="启用">启用</option>
        <option value="停用">停用</option>
      </select>
      <button class="btn-secondary" type="button" ${renderUiActionCallback('sms-reset')}>重置</button>
    </div>
    <div class="policy-rule-note" id="smsDispatchRuleNote">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 1 21h22L12 2zm1 16h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
      <div>
        <strong>多配置命中处理：</strong>同一电话号码在同一场景内命中多个短信下发配置时，按权重判定，数字越小越先判定；同权重取创建时间倒序。
      </div>
    </div>
    <div class="card">
      <div class="section-header">
        <div class="section-title">短信下发配置列表</div>
        <div class="action-btns">
          <button class="btn-add strategy-add-btn" type="button" ${renderUiActionCallback('sms-open-modal', ['add'])}>新增配置</button>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:64px">权重</th>
            <th>配置名称</th>
            <th>适用场景</th>
            <th>外呼类型</th>
            <th>命中条件</th>
            <th>短信模板</th>
            <th style="width:80px">状态</th>
            <th style="width:190px">操作</th>
          </tr>
        </thead>
        <tbody id="smsDispatchRuleTableBody"></tbody>
      </table>
      <div class="pagination">
        <span id="smsDispatchPageInfo">共 0 条记录，当前第 1 / 1 页</span>
        <div class="pagination-btns">
          <select class="hit-page-size" id="smsDispatchPageSize" ${renderUiActionCallback('sms-page-size', ['$value'])}>
            <option value="5">每页 5 条</option>
            <option value="10">每页 10 条</option>
            <option value="20">每页 20 条</option>
            <option value="50">每页 50 条</option>
          </select>
          <button class="page-btn" type="button" onclick="changeSmsDispatchPage(-1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <select class="hit-page-size" id="smsDispatchPageSelect" ${renderUiActionCallback('sms-page-select', ['$value'])}></select>
          <button class="page-btn" type="button" onclick="changeSmsDispatchPage(1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
    </div>
  `;
  renderSmsDispatchRuleTable();
}

function renderSmsDispatchSummary() {
  const enabled = smsDispatchRules.filter(rule => rule.enabled).length;
  const templates = new Set(smsDispatchRules.map(rule => rule.template)).size;
  return `
    <div class="summary-strip">
      <div class="summary-card"><div class="summary-label">规则总数</div><div class="summary-value">${smsDispatchRules.length}</div></div>
      <div class="summary-card"><div class="summary-label">启用规则</div><div class="summary-value">${enabled}</div></div>
      <div class="summary-card"><div class="summary-label">短信模板</div><div class="summary-value">${templates}</div></div>
    </div>
  `;
}

function getSmsDispatchAllCallTypes() {
  return unifiedPolicyCallTypeOptions;
}

function getSmsDispatchIntentSeriesOptions(selected = []) {
  const names = (DICTIONARY_ITEMS.INTENT_SERIES || [])
    .filter(item => item.status === '启用')
    .map(item => item.name);
  return [...new Set([...names, ...(selected || [])])];
}

function getSmsDispatchAllStatuses() {
  return [...new Set(smsDispatchRules.flatMap(rule => rule.statuses))];
}

function getSmsDispatchAllTags(rule) {
  if (getSmsDispatchScenario(rule) === 'intelligent') return smsIntelligentCatalog.tags.map(item => item.name);
  return [...new Set(smsDispatchRules.filter(item => getSmsDispatchScenario(item) === 'existing').flatMap(item => item.tags))];
}

function getFilteredSmsDispatchRules() {
  const keyword = document.getElementById('smsDispatchKeywordFilter')?.value.trim().toLowerCase() || '';
  const callType = document.getElementById('smsDispatchCallTypeFilter')?.value || '';
  const template = document.getElementById('smsDispatchTemplateFilter')?.value || '';
  const enabled = document.getElementById('smsDispatchEnabledFilter')?.value || '';
  const scenario = document.getElementById('smsDispatchScenarioFilter')?.value || '';
  return smsDispatchRules
    .filter(rule => {
      if (!keyword) return true;
      const text = [
        rule.name,
        getSmsDispatchScenarioName(rule),
        (rule.callTypes || []).join(' '),
        (rule.statuses || []).join(' '),
        (rule.tags || []).join(' '),
        (rule.intentSeriesNames || []).join(' '),
        rule.template,
        rule.send
      ].filter(Boolean).join(' ').toLowerCase();
      return text.includes(keyword);
    })
    .filter(rule => !scenario || getSmsDispatchScenario(rule) === scenario)
    .filter(rule => !callType || rule.callTypes.includes(callType))
    .filter(rule => !template || rule.template === template)
    .filter(rule => !enabled || (enabled === '启用' ? rule.enabled : !rule.enabled))
    // 示例ID按新增顺序递增，用于模拟同权重的创建时间倒序。
    .sort((a, b) => (Number(a.priority) || 99) - (Number(b.priority) || 99) || b.id - a.id);
}

function renderSmsDispatchRuleTable() {
  const body = document.getElementById('smsDispatchRuleTableBody');
  if (!body) return;
  const rows = getFilteredSmsDispatchRules();
  const totalPages = Math.max(1, Math.ceil(rows.length / smsDispatchPageSize));
  smsDispatchCurrentPage = Math.min(smsDispatchCurrentPage, totalPages);
  const start = (smsDispatchCurrentPage - 1) * smsDispatchPageSize;
  const pageRows = rows.slice(start, start + smsDispatchPageSize);
  const info = document.getElementById('smsDispatchPageInfo');
  if (info) info.textContent = `共 ${rows.length} 条记录，当前第 ${smsDispatchCurrentPage} / ${totalPages} 页`;
  const pageSelect = document.getElementById('smsDispatchPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, idx) => `<option value="${idx + 1}">第 ${idx + 1} 页</option>`).join('');
    pageSelect.value = String(smsDispatchCurrentPage);
  }
  const pageSizeSelect = document.getElementById('smsDispatchPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(smsDispatchPageSize);
  body.innerHTML = pageRows.length ? pageRows.map(rule => `
    <tr>
      <td><span class="policy-plain-text">${rule.priority ? `P${rule.priority}` : '—'}</span></td>
      <td>
        <div class="rule-text-stack">
          <div class="rule-text-main">${rule.name}</div>
          <div class="rule-muted">规则ID: SMS-${String(rule.id).padStart(3, '0')}</div>
        </div>
      </td>
      <td>${getSmsDispatchScenarioName(rule)}</td>
      <td>${renderRuleChipList(rule.callTypes, 'blue', 2)}</td>
      <td>${renderSmsDispatchConditionSummary(rule)}</td>
      <td><strong>${rule.template}</strong></td>
      <td>${rule.enabled ? '<span class="col-status-on">● 启用</span>' : '<span class="col-status-off">● 停用</span>'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view" type="button" ${renderUiActionCallback('sms-open-modal', ['view', rule.id])}>查看</button>
          <button class="action-btn edit" type="button" ${renderUiActionCallback('sms-open-modal', ['edit', rule.id])}>编辑</button>
          <button class="action-btn delete" type="button" ${renderUiActionCallback('sms-delete', [rule.id])}>删除</button>
        </div>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="8"><div class="empty-state">暂无匹配的短信下发配置</div></td></tr>';
}


function renderSmsDispatchConditionSummary(rule) {
  const parts = [
    `通话状态（${rule.statusLogic || '或'}）：${(rule.statuses || []).slice(0, 3).join('、') || '不限'}${(rule.statuses || []).length > 3 ? '…' : ''}`,
    `包含标签（${rule.tagLogic || '或'}）：${(rule.tags || []).slice(0, 3).join('、') || '—'}${(rule.tags || []).length > 3 ? '…' : ''}`,
    `标签最新意向车系：${(rule.intentSeriesNames || []).join('、') || '不限'}`
  ];
  if (rule.excludeTags && rule.excludeTags.length) {
    parts.push(`排除标签（${rule.excludeTagLogic || '或'}）：${rule.excludeTags.slice(0, 3).join('、')}${rule.excludeTags.length > 3 ? '…' : ''}`);
  }
  return `<div class="rule-text-stack">${parts.map(item => `<div>${escapeHtml(item)}</div>`).join('')}</div>`;
}

function openSmsDispatchRuleModal(mode, id = null) {
  smsDispatchFormRequest++;
  setSharedRuleModalVisual('config');
  editingSmsDispatchRuleId = mode === 'edit' ? id : null;
  const rule = id ? smsDispatchRules.find(item => item.id === id) : null;
  const titleMap = { add: '新增短信下发配置', edit: '编辑短信下发配置', view: '查看短信下发配置' };
  document.getElementById('leadDispatchRuleModalTitle').textContent = titleMap[mode] || '短信下发规则';
  document.getElementById('leadDispatchRuleModalBody').innerHTML = mode === 'view'
    ? renderSmsDispatchRuleDetail(rule)
    : renderSmsDispatchRuleForm(rule || getDefaultSmsDispatchRule());
  document.getElementById('leadDispatchRuleModalFooter').innerHTML = mode === 'view'
    ? `<button class="btn-cancel" type="button" ${renderUiActionCallback('sms-close-modal')}>关闭</button>`
    : `
      <button class="btn-cancel" type="button" ${renderUiActionCallback('sms-close-modal')}>取消</button>
      <button class="btn-save" type="button" ${renderUiActionCallback('sms-save')}>保存</button>
    `;
  document.getElementById('leadDispatchRuleModal').classList.add('show');
  if (mode !== 'view') {
    initializeSmsDispatchPickers();
    if (getSmsDispatchScenario(rule) === 'intelligent') loadSmsIntelligentFormOptions();
  }
}

function getDefaultSmsDispatchRule() {
  return {
    name: '',
    scenario: 'existing',
    callTypeCode: '',
    priority: 255,
    leadType: '冷线索',
    callTypes: [],
    statuses: [],
    statusLogic: '或',
    tags: [],
    tagLogic: '或',
    intentSeriesNames: [],
    excludeTags: [],
    excludeTagLogic: '或',
    send: '下发',
    template: '',
    enabled: true
  };
}

function renderSmsDispatchRuleDetail(rule) {
  if (!rule) return '<div class="empty-state">未找到短信下发规则</div>';
  return `
    <div class="rule-detail-layout">
      <div class="rule-detail-section">
        <div class="rule-detail-title">基础信息</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">适用场景</div><div class="rule-detail-value">${getSmsDispatchScenarioName(rule)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">配置名称</div><div class="rule-detail-value">${detailValue(rule.name)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">权重</div><div class="rule-detail-value">${rule.priority ? `P${rule.priority}` : '—'}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">状态</div><div class="rule-detail-value">${rule.enabled ? '启用' : '停用'}</div></div>
        </div>
      </div>
      <div class="rule-detail-section">
        <div class="rule-detail-title">命中条件</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">外呼类型</div><div class="rule-detail-value">${(rule.callTypes || []).join('、') || '—'}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">标签最新意向车系</div><div class="rule-detail-value">${detailValue((rule.intentSeriesNames || []).join("、") || "不限")}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">通话状态</div><div class="rule-detail-value">${detailValue(`${rule.statusLogic || '或'}：${(rule.statuses || []).join('、') || '不限'}`)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">包含标签</div><div class="rule-detail-value">${detailValue(`${rule.tagLogic || '或'}：${(rule.tags || []).join('、') || '—'}`)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">不包含标签</div><div class="rule-detail-value">${detailValue(`${rule.excludeTagLogic || '或'}：${(rule.excludeTags || []).join('、') || '—'}`)}</div></div>
        </div>
      </div>
      <div class="rule-detail-section">
        <div class="rule-detail-title">执行动作</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">短信模板</div><div class="rule-detail-value">${detailValue(rule.template)}</div></div>
        </div>
      </div>
    </div>
  `;
}

function renderSmsDispatchRuleForm(rule) {
  return `
    <div class="dispatch-rule-form">
      <section class="dispatch-form-section">
        <div class="dispatch-section-title">基础信息</div>
        <div class="dispatch-form-grid">
          <div class="form-group wide">
            <div class="form-label">适用场景 <span class="required">*</span></div>
            <select class="form-input" id="smsFormScenario" ${renderUiActionCallback('sms-scenario-change')}>
              <option value="existing" ${getSmsDispatchScenario(rule) === 'existing' ? 'selected' : ''}>现有场景</option>
              <option value="intelligent" ${getSmsDispatchScenario(rule) === 'intelligent' ? 'selected' : ''}>智能外呼场景</option>
            </select>
          </div>
          <div class="form-group wide">
            <div class="form-label">配置名称 <span class="required">*</span></div>
            <input class="form-input" id="smsFormName" value="${escapeAttr(rule.name || '')}" placeholder="例：大模型线索高意向短信" />
          </div>
          <div class="form-group">
            <div class="form-label">权重 <span class="required">*</span></div>
            <input class="form-input" id="smsFormPriority" type="number" min="1" max="255" value="${escapeAttr(rule.priority ?? 255)}" placeholder="数字越小越优先" />
            <div class="series-form-hint">数字越小优先级越高，命中多条规则时优先按权重判断</div>
          </div>
          <div class="form-group">
            <div class="form-label">状态</div>
            <select class="form-input" id="smsFormStatus">
              ${['启用', '停用'].map(status => `<option value="${status}" ${(rule.enabled ? '启用' : '停用') === status ? 'selected' : ''}>${status}</option>`).join('')}
            </select>
          </div>
        </div>
      </section>

      <section class="dispatch-form-section">
        <div class="dispatch-section-title">命中条件</div>
        <div class="dispatch-form-grid">
          <div class="form-group wide">
            <div class="form-label">外呼类型 <span class="required">*</span></div>
            ${renderSmsDispatchCallTypeInput(rule)}
          </div>
          <div class="form-group wide">
            <div class="form-label">标签最新意向车系</div>
            ${renderCallTypeTagPicker({ idPrefix: 'smsDispatchIntentSeries', inputName: 'smsDispatchIntentSeries', options: getSmsDispatchIntentSeriesOptions(rule.intentSeriesNames), selected: rule.intentSeriesNames || [], placeholder: '不限' })}
            <div class="series-form-hint">不选表示不限；选择后，按本次话单标签返回的单个车系名称匹配，多个选项满足任意一个即可。</div>
          </div>
          <div class="form-group wide">
            <div class="form-label">通话状态</div>
            ${renderSmsDispatchCallStatusPicker(rule.statuses || [])}
            ${renderSmsDispatchStatusLogic(rule.statusLogic || '或')}
            <div class="series-form-hint">不选择表示不限制通话状态</div>
          </div>
          <div class="form-group">
            <div class="form-label">包含标签 <span class="required">*</span></div>
            ${renderSmsDispatchTagPicker('Include', 'smsDispatchTag', rule.tags || [], '请选择包含标签', rule)}
            ${renderSmsDispatchTagLogic('Include', 'smsFormTagLogic', rule.tagLogic || '或')}
          </div>
          <div class="form-group">
            <div class="form-label">不包含标签</div>
            ${renderSmsDispatchTagPicker('Exclude', 'smsDispatchExcludeTag', rule.excludeTags || [], '请选择不包含标签', rule)}
            ${renderSmsDispatchTagLogic('Exclude', 'smsFormExcludeTagLogic', rule.excludeTagLogic || '或')}
          </div>
        </div>
      </section>

      <section class="dispatch-form-section">
        <div class="dispatch-section-title">执行动作</div>
        <div class="dispatch-form-grid">
          <div class="form-group wide">
            <div class="form-label">短信模板 <span class="required">*</span></div>
            ${renderSmsDispatchTemplatePicker(rule.template || '')}
          </div>
        </div>
      </section>
    </div>
  `;
}
function getSmsDispatchTemplateOptions(selectedTemplate = '') {
  const templates = [...new Set(smsDispatchRules.map(rule => rule.template).filter(Boolean))];
  return selectedTemplate && !templates.includes(selectedTemplate) ? [...templates, selectedTemplate] : templates;
}

function renderSmsDispatchTemplatePicker(selectedTemplate = '') {
  const options = getSmsDispatchTemplateOptions(selectedTemplate);
  const triggerText = selectedTemplate || '请选择短信模板';
  return `
    <div class="tag-picker dispatch-tag-picker sms-template-picker">
      <input type="hidden" id="smsFormTemplate" value="${escapeAttr(selectedTemplate || '')}" />
      <button class="tag-picker-trigger ${selectedTemplate ? '' : 'placeholder'}" id="smsTemplateTrigger" type="button" ${renderUiActionCallback('sms-template-toggle')}>${triggerText}</button>
      <div class="tag-picker-panel" id="smsTemplatePanel">
        <div class="tag-picker-toolbar">
          <span id="smsTemplateCount">共 ${options.length} 个模板</span>
          <div class="tag-picker-actions">
            <button class="tag-picker-action" type="button" ${renderUiActionCallback('sms-template-clear')}>清空</button>
          </div>
        </div>
        <div class="tag-picker-search">
          <input type="search" placeholder="搜索短信模板" ${renderUiActionCallback('sms-template-filter', ['$value'])} />
        </div>
        <div class="tag-picker-list">
          ${options.map(template => `
            <button class="tag-option ${template === selectedTemplate ? 'selected' : ''}" type="button" data-template="${escapeAttr(template)}" ${renderUiActionCallback('sms-template-select', ['$data:template'])}>
              ${template}
            </button>
          `).join('')}
        </div>
        <div class="tag-picker-empty">暂无匹配模板</div>
      </div>
    </div>
  `;
}

function toggleSmsDispatchTemplatePicker() {
  document.querySelectorAll('.tag-picker-panel').forEach(panel => {
    if (panel.id !== 'smsTemplatePanel') panel.classList.remove('show');
  });
  document.getElementById('smsTemplatePanel')?.classList.toggle('show');
}

function selectSmsDispatchTemplate(template) {
  const input = document.getElementById('smsFormTemplate');
  const trigger = document.getElementById('smsTemplateTrigger');
  if (input) input.value = template;
  if (trigger) {
    trigger.textContent = template || '请选择短信模板';
    trigger.classList.toggle('placeholder', !template);
  }
  document.querySelectorAll('#smsTemplatePanel .tag-option').forEach(option => {
    option.classList.toggle('selected', option.dataset.template === template);
  });
  document.getElementById('smsTemplatePanel')?.classList.remove('show');
}

function clearSmsDispatchTemplate() {
  selectSmsDispatchTemplate('');
}

function filterSmsDispatchTemplateOptions(keyword) {
  const panel = document.getElementById('smsTemplatePanel');
  if (!panel) return;
  const normalized = String(keyword || '').trim().toLowerCase();
  const options = [...panel.querySelectorAll('.tag-option')];
  let visibleCount = 0;
  options.forEach(option => {
    const visible = !normalized || option.textContent.trim().toLowerCase().includes(normalized);
    option.style.display = visible ? '' : 'none';
    if (visible) visibleCount += 1;
  });
  const empty = panel.querySelector('.tag-picker-empty');
  if (empty) empty.style.display = visibleCount ? 'none' : 'block';
  const count = document.getElementById('smsTemplateCount');
  if (count) count.textContent = normalized ? `匹配 ${visibleCount} 个模板` : `共 ${options.length} 个模板`;
}


function renderSmsDispatchCallStatusPicker(selectedStatuses = []) {
  const options = getSmsDispatchAllStatuses();
  const safeSelected = selectedStatuses || [];
  return `
    <div class="tag-picker dispatch-tag-picker">
      <button class="tag-picker-trigger placeholder" id="smsCallStatusTrigger" type="button" ${renderUiActionCallback('sms-status-toggle')}>请选择通话状态</button>
      <div class="tag-picker-panel" id="smsCallStatusPanel">
        <div class="tag-picker-toolbar">
          <span id="smsCallStatusCount">已选 0 / ${options.length}</span>
          <div class="tag-picker-actions">
            <button class="tag-picker-action" type="button" ${renderUiActionCallback('sms-status-all')}>全选</button>
            <button class="tag-picker-action" type="button" ${renderUiActionCallback('sms-status-clear')}>清空</button>
          </div>
        </div>
        <div class="tag-picker-list">
          ${options.map(status => `
            <label class="tag-option">
              <input type="checkbox" name="smsDispatchCallStatus" value="${escapeAttr(status)}" ${safeSelected.includes(status) ? 'checked' : ''} ${renderUiActionCallback('sms-status-option', ['$self'])} />
              ${status}
            </label>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderSmsDispatchStatusLogic(value = '或') {
  const isAnd = value === '且';
  return `
    <select class="form-input" id="smsFormStatusLogic" style="display:none">
      <option value="且" ${isAnd ? 'selected' : ''}>且</option>
      <option value="或" ${!isAnd ? 'selected' : ''}>或</option>
    </select>
    <div class="condition-row">
      <span class="condition-label">状态判断条件：</span>
      <div class="condition-toggle">
        <button type="button" class="condition-btn ${isAnd ? 'active' : ''}" id="smsStatusAnd" ${renderUiActionCallback('sms-status-logic', ['且'])}>且 (AND)</button>
        <button type="button" class="condition-btn ${!isAnd ? 'active' : ''}" id="smsStatusOr" ${renderUiActionCallback('sms-status-logic', ['或'])}>或 (OR)</button>
      </div>
      <span class="condition-desc" id="smsStatusDesc">${isAnd ? '命中所有已选通话状态才触发规则' : '命中任意一个已选通话状态即触发规则'}</span>
    </div>
  `;
}

function getSmsDispatchCallStatusInputs() {
  return getTagPickerInputs('smsCallStatusPanel');
}

function toggleSmsDispatchCallStatusPicker() {
  toggleExclusivePanel('smsCallStatusPanel');
}

function updateSmsDispatchCallStatusPickerSummary() {
  updateMultiSelectPickerSummary({
    panelId: 'smsCallStatusPanel',
    triggerId: 'smsCallStatusTrigger',
    countId: 'smsCallStatusCount',
    placeholder: '请选择通话状态'
  });
}

function toggleSmsDispatchCallStatusOption(input) {
  togglePickerOption(input, updateSmsDispatchCallStatusPickerSummary);
}

function selectAllSmsDispatchCallStatuses() {
  setPickerInputsChecked(getSmsDispatchCallStatusInputs(), true, updateSmsDispatchCallStatusPickerSummary);
}

function clearSmsDispatchCallStatuses() {
  setPickerInputsChecked(getSmsDispatchCallStatusInputs(), false, updateSmsDispatchCallStatusPickerSummary);
}

function setSmsDispatchStatusLogic(value) {
  const select = document.getElementById('smsFormStatusLogic');
  if (select) select.value = value;
  document.getElementById('smsStatusAnd')?.classList.toggle('active', value === '且');
  document.getElementById('smsStatusOr')?.classList.toggle('active', value === '或');
  const desc = document.getElementById('smsStatusDesc');
  if (desc) desc.textContent = value === '且' ? '命中所有已选通话状态才触发规则' : '命中任意一个已选通话状态即触发规则';
}

function renderSmsDispatchTagPicker(kind, inputName, selectedTags = [], placeholder = '请选择标签', rule) {
  const available = getSmsDispatchAllTags(rule);
  const options = [...new Set([...available, ...(selectedTags || [])])];
  const safeSelected = selectedTags || [];
  const panelId = `sms${kind}TagPanel`;
  const triggerId = `sms${kind}TagTrigger`;
  const countId = `sms${kind}TagCount`;
  return `
    <div class="tag-picker dispatch-tag-picker">
      <button class="tag-picker-trigger placeholder" id="${triggerId}" type="button" ${renderUiActionCallback('sms-tag-toggle', [kind])}>${placeholder}</button>
      <div class="tag-picker-panel" id="${panelId}">
        <div class="tag-picker-toolbar">
          <span id="${countId}">已选 0 / ${options.length}</span>
          <div class="tag-picker-actions">
            <button class="tag-picker-action" type="button" ${renderUiActionCallback('sms-tag-all', [kind])}>全选</button>
            <button class="tag-picker-action" type="button" ${renderUiActionCallback('sms-tag-clear', [kind])}>清空</button>
          </div>
        </div>
        <div class="tag-picker-search">
          <input type="search" placeholder="搜索标签" ${renderUiActionCallback('sms-tag-filter', [panelId, '$value'])} />
        </div>
        <div class="tag-picker-list">
          ${options.map(tag => `
            <label class="tag-option">
              <input type="checkbox" name="${inputName}" value="${escapeAttr(tag)}" data-tag-code="${escapeAttr((kind === 'Include' ? rule?.includeTagCodes : rule?.excludeTagCodes)?.[selectedTags.indexOf(tag)] || smsIntelligentCatalog.tags.find(item => item.name === tag)?.code || '')}" ${safeSelected.includes(tag) ? 'checked' : ''} ${renderUiActionCallback('sms-tag-option', ['$self', kind])} />
              ${escapeHtml(tag)}${getSmsDispatchScenario(rule) === 'intelligent' && smsIntelligentCatalog.status === 'ready' && !available.includes(tag) ? '（已失效）' : ''}
            </label>
          `).join('')}
        </div>
        <div class="tag-picker-empty">暂无匹配标签</div>
      </div>
    </div>
  `;
}

function renderSmsDispatchTagLogic(kind, selectId, value = '或') {
  const isAnd = value === '且';
  const desc = kind === 'Include'
    ? (isAnd ? '命中所有已选标签才触发规则' : '命中任意一个已选标签即触发规则')
    : (isAnd ? '同时命中全部排除标签才排除' : '命中任意一个排除标签即排除');
  return `
    <select class="form-input" id="${selectId}" style="display:none">
      <option value="且" ${isAnd ? 'selected' : ''}>且</option>
      <option value="或" ${!isAnd ? 'selected' : ''}>或</option>
    </select>
    <div class="condition-row">
      <span class="condition-label">${kind === 'Include' ? '标签判断条件：' : '排除判断条件：'}</span>
      <div class="condition-toggle">
        <button type="button" class="condition-btn ${isAnd ? 'active' : ''}" id="sms${kind}TagAnd" ${renderUiActionCallback('sms-tag-logic', [kind, '且'])}>且 (AND)</button>
        <button type="button" class="condition-btn ${!isAnd ? 'active' : ''}" id="sms${kind}TagOr" ${renderUiActionCallback('sms-tag-logic', [kind, '或'])}>或 (OR)</button>
      </div>
      <span class="condition-desc" id="sms${kind}TagDesc">${desc}</span>
    </div>
  `;
}

function getSmsDispatchTagInputs(kind) {
  return getTagPickerInputs(`sms${kind}TagPanel`);
}

function toggleSmsDispatchTagPicker(kind) {
  toggleExclusivePanel(`sms${kind}TagPanel`);
}

function updateSmsDispatchTagPickerSummary(kind) {
  updateMultiSelectPickerSummary({
    panelId: `sms${kind}TagPanel`,
    triggerId: `sms${kind}TagTrigger`,
    countId: `sms${kind}TagCount`,
    placeholder: kind === 'Include' ? '请选择包含标签' : '请选择不包含标签'
  });
  const alert = document.getElementById('smsIntelligentTagsAlert');
  if (alert) alert.hidden = smsIntelligentCatalog.status !== 'ready' || !hasInvalidSmsIntelligentTags(readSmsDispatchForm());
}

function toggleSmsDispatchTagOption(input, kind) {
  if (document.getElementById('smsFormScenario')?.value === 'intelligent' && input.checked) {
    input.dataset.tagCode = smsIntelligentCatalog.tags.find(tag => tag.name === input.value)?.code || '';
  }
  togglePickerOption(input, () => updateSmsDispatchTagPickerSummary(kind));
}

function selectAllSmsDispatchTags(kind) {
  const inputs = getVisibleTagPickerInputs(`sms${kind}TagPanel`);
  if (document.getElementById('smsFormScenario')?.value === 'intelligent') {
    inputs.forEach(input => {
      const tag = smsIntelligentCatalog.tags.find(item => item.name === input.value);
      input.checked = Boolean(tag);
      input.dataset.tagCode = tag?.code || '';
    });
    updateSmsDispatchTagPickerSummary(kind);
    return;
  }
  setPickerInputsChecked(inputs, true, () => updateSmsDispatchTagPickerSummary(kind));
}

function clearSmsDispatchTags(kind) {
  setPickerInputsChecked(getSmsDispatchTagInputs(kind), false, () => updateSmsDispatchTagPickerSummary(kind));
}

function setSmsDispatchTagLogic(kind, value) {
  const selectId = kind === 'Include' ? 'smsFormTagLogic' : 'smsFormExcludeTagLogic';
  const select = document.getElementById(selectId);
  if (select) select.value = value;
  document.getElementById(`sms${kind}TagAnd`)?.classList.toggle('active', value === '且');
  document.getElementById(`sms${kind}TagOr`)?.classList.toggle('active', value === '或');
  const desc = document.getElementById(`sms${kind}TagDesc`);
  if (!desc) return;
  if (kind === 'Include') {
    desc.textContent = value === '且' ? '命中所有已选标签才触发规则' : '命中任意一个已选标签即触发规则';
  } else {
    desc.textContent = value === '且' ? '同时命中全部排除标签才排除' : '命中任意一个排除标签即排除';
  }
}


function readSmsDispatchForm() {
  const scenario = document.getElementById('smsFormScenario')?.value || 'existing';
  const typeSelect = document.getElementById('smsFormIntelligentCallType');
  return {
    scenario,
    callTypeCode: scenario === 'intelligent' ? typeSelect?.value || '' : '',
    name: document.getElementById('smsFormName')?.value.trim() || '',
    priority: document.getElementById('smsFormPriority')?.value.trim() || '',
    leadType: '冷线索',
    callTypes: scenario === 'intelligent' ? (typeSelect?.value ? [typeSelect.selectedOptions[0].textContent.replace('（已失效）', '')] : []) : collectCheckedValues('smsDispatchCallType'),
    intentSeriesNames: collectCheckedValues('smsDispatchIntentSeries'),
    statuses: collectCheckedValues('smsDispatchCallStatus'),
    statusLogic: document.getElementById('smsFormStatusLogic')?.value || '或',
    includeTagCodes: [...document.querySelectorAll('input[name="smsDispatchTag"]:checked')].map(input => input.dataset.tagCode || ''),
    excludeTagCodes: [...document.querySelectorAll('input[name="smsDispatchExcludeTag"]:checked')].map(input => input.dataset.tagCode || ''),
    tags: collectCheckedValues('smsDispatchTag'),
    tagLogic: document.getElementById('smsFormTagLogic')?.value || '或',
    excludeTags: collectCheckedValues('smsDispatchExcludeTag'),
    excludeTagLogic: document.getElementById('smsFormExcludeTagLogic')?.value || '或',
    send: '下发',
    template: document.getElementById('smsFormTemplate')?.value.trim() || '',
    enabled: (document.getElementById('smsFormStatus')?.value || '启用') === '启用'
  };
}

function saveSmsDispatchRule() {
  const payload = readSmsDispatchForm();
  if (!['existing', 'intelligent'].includes(payload.scenario)) return showToast('请选择有效的适用场景');
  if (payload.scenario === 'intelligent') {
    const catalog = smsIntelligentCatalog;
    if (catalog.status !== 'ready') return showToast('请等待智能外呼类型和标签加载成功后保存');
    if (!catalog.types.some(item => item.code === payload.callTypeCode)) return showToast('请选择有效的智能外呼类型');
    if (catalog.typeCode !== payload.callTypeCode || hasInvalidSmsIntelligentTags(payload)) {
      return showToast('标签不属于当前外呼类型或已失效，请重新选择');
    }
    payload.includeTagCodes = payload.tags.map(name => catalog.tags.find(item => item.name === name).code);
    payload.excludeTagCodes = payload.excludeTags.map(name => catalog.tags.find(item => item.name === name).code);
  } else {
    payload.includeTagCodes = [];
    payload.excludeTagCodes = [];
  }
  if (!payload.name) {
    showToast('请填写配置名称');
    return;
  }
  if (!payload.priority) {
    showToast('请填写权重');
    return;
  }
  if (!/^\d+$/.test(String(payload.priority)) || Number(payload.priority) < 1 || Number(payload.priority) > 255) {
    showToast('权重需填写 1-255 的数字');
    return;
  }
  if (!payload.callTypes.length) {
    showToast('请选择外呼类型');
    return;
  }
  if (!payload.tags.length) {
    showToast('请选择包含标签');
    return;
  }
  if (!payload.template) {
    showToast('请填写短信模板');
    return;
  }
  if (editingSmsDispatchRuleId) {
    const index = smsDispatchRules.findIndex(rule => rule.id === editingSmsDispatchRuleId);
    if (index > -1) smsDispatchRules[index] = { ...smsDispatchRules[index], ...payload };
    showToast('短信下发规则已更新', true);
  } else {
    smsDispatchRules.push({ id: smsDispatchNextId++, ...payload });
    showToast('短信下发规则已新增', true);
  }
  closeModal('leadDispatchRuleModal');
  renderSmsDispatchPolicyPage();
}

function deleteSmsDispatchRule(id) {
  const rule = smsDispatchRules.find(item => item.id === id);
  if (!rule) return;
  if (!confirm(`确认删除短信下发配置「${rule.name}」？`)) return;
  const index = smsDispatchRules.findIndex(item => item.id === id);
  if (index > -1) smsDispatchRules.splice(index, 1);
  showToast('短信下发配置已删除', true);
  renderSmsDispatchPolicyPage();
}

function resetSmsDispatchFilters() {
  ['smsDispatchScenarioFilter', 'smsDispatchKeywordFilter', 'smsDispatchCallTypeFilter', 'smsDispatchTemplateFilter', 'smsDispatchEnabledFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  changeSmsDispatchScenarioFilter();
}

function filterSmsDispatchRuleTable() {
  smsDispatchCurrentPage = 1;
  renderSmsDispatchRuleTable();
}

function changeSmsDispatchPageSize(value) {
  smsDispatchPageSize = Number(value) || 10;
  smsDispatchCurrentPage = 1;
  renderSmsDispatchRuleTable();
}

function changeSmsDispatchPage(dir) {
  const rows = getFilteredSmsDispatchRules();
  const totalPages = Math.max(1, Math.ceil(rows.length / smsDispatchPageSize));
  smsDispatchCurrentPage = Math.max(1, Math.min(totalPages, smsDispatchCurrentPage + dir));
  renderSmsDispatchRuleTable();
}

function selectSmsDispatchPage(value) {
  smsDispatchCurrentPage = Number(value) || 1;
  renderSmsDispatchRuleTable();
}

registerUiActionCallback('sms-filter', event => {
  const isTyping = event.target.tagName === 'INPUT' && event.type === 'input';
  const isSelection = event.target.tagName === 'SELECT' && event.type === 'change';
  if (isTyping || isSelection) filterSmsDispatchRuleTable();
});
registerUiActionCallback('sms-reset', resetSmsDispatchFilters);
registerUiActionCallback('sms-open-modal', openSmsDispatchRuleModal);
registerUiActionCallback('sms-delete', deleteSmsDispatchRule);
registerUiActionCallback('sms-page-size', (value, event) => {
  if (event.type === 'change') changeSmsDispatchPageSize(value);
});
registerUiActionCallback('sms-page', changeSmsDispatchPage);
registerUiActionCallback('sms-page-select', (value, event) => {
  if (event.type === 'change') selectSmsDispatchPage(value);
});
registerUiActionCallback('sms-close-modal', () => closeModal('leadDispatchRuleModal'));
registerUiActionCallback('sms-save', saveSmsDispatchRule);
registerUiActionCallback('sms-template-toggle', toggleSmsDispatchTemplatePicker);
registerUiActionCallback('sms-template-clear', clearSmsDispatchTemplate);
registerUiActionCallback('sms-template-filter', filterSmsDispatchTemplateOptions);
registerUiActionCallback('sms-template-select', selectSmsDispatchTemplate);
registerUiActionCallback('sms-status-toggle', toggleSmsDispatchCallStatusPicker);
registerUiActionCallback('sms-status-all', selectAllSmsDispatchCallStatuses);
registerUiActionCallback('sms-status-clear', clearSmsDispatchCallStatuses);
registerUiActionCallback('sms-status-option', toggleSmsDispatchCallStatusOption);
registerUiActionCallback('sms-status-logic', setSmsDispatchStatusLogic);
registerUiActionCallback('sms-tag-toggle', toggleSmsDispatchTagPicker);
registerUiActionCallback('sms-tag-all', selectAllSmsDispatchTags);
registerUiActionCallback('sms-tag-clear', clearSmsDispatchTags);
registerUiActionCallback('sms-tag-filter', filterTagPickerOptions);
registerUiActionCallback('sms-tag-option', toggleSmsDispatchTagOption);
registerUiActionCallback('sms-tag-logic', setSmsDispatchTagLogic);
