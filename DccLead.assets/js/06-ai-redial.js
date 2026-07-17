// ===== AI Redial Policy Config =====
const aiRedialOutboundTypeOptions = assignmentOutboundChannels;
const aiRedialNewOutboundTypeOptions = ['原外呼类型', '人工外呼'];
const aiRedialIntentOptions = leadDispatchIntentLevelOptions.filter(Boolean);
const aiRedialLeadStatusOptions = leadDispatchLeadStatusOptions.filter(Boolean);
const aiRedialPushDelayOptions = ['立即', '30分钟', '2小时', '1天', '3天'];
const aiRedialCountOptions = ['1次', '2次', '3次', '4次'];
const aiRedialIntervalOptions = ['立即', '30分钟', '2小时', '1天', '2天', '3天'];
const aiRedialAttributeOptions = ['线索状态', '通话状态'];
const aiRedialCallStatusOptions = leadDispatchCallStatusOptions;
let aiRedialRules = [
  { id: 1012, ruleName: '人工客服-高意向-重推', sortOrder: 1, outboundType: '人工客服', newOutboundType: '原外呼类型', intentLevel: 'B - B(计划三个月内买车)', leadStatus: ['总部_高意向'], abnormalReason: '', abnormalReasons: [], pushDelay: '1天', redialCount: '3次', redialInterval: '2天', attributeType: '线索状态', callStatus: '', outboundLabel: '', createdAt: '2020-06-01 13:59:59 操作人：张三', updatedAt: '2020-06-01 13:59:59 操作人：李四', enabled: true },
  { id: 1013, ruleName: '休眠未购-异常重推', sortOrder: 2, outboundType: '人工客服', newOutboundType: '人工外呼', intentLevel: 'L - L(休眠)', leadStatus: ['总部_休眠未购'], abnormalReason: '资金不足', abnormalReasons: ['资金不足', '半年内不购车'], pushDelay: '1天', redialCount: '3次', redialInterval: '2天', attributeType: '线索状态', callStatus: '', outboundLabel: '', createdAt: '2020-06-02 13:59:59 操作人：李四', updatedAt: '2020-06-02 13:59:59 操作人：李四', enabled: true },
  { id: 1014, ruleName: 'AI外呼-未接听重推', sortOrder: 3, outboundType: 'AI外呼', newOutboundType: '原外呼类型', intentLevel: '', leadStatus: [], abnormalReason: '', abnormalReasons: [], pushDelay: '2小时', redialCount: '2次', redialInterval: '1天', attributeType: '通话状态', callStatus: '客户未接听', callStatuses: ['客户未接听'], outboundLabel: '下次联系', createdAt: '2026-06-18 10:20:00 操作人：王五', updatedAt: '2026-06-20 09:30:00 操作人：王五', enabled: false }
];
let aiRedialCurrentPage = 1;
let aiRedialPageSize = 10;
let editingAiRedialRuleId = null;
let aiRedialNextId = 1015;

function renderAiRedialPolicyPage() {
  const page = document.getElementById('aiRedialPolicyPage');
  if (!page) return;
  page.innerHTML = `
    <div class="page-hero">
      <div>
        <div class="page-title">外呼重推配置</div>
        <div class="page-desc">用于管理外呼重推规则：什么样的线索、从什么外呼来源进入、在什么时间重推、重拨几次以及重推间隔。规则命中后由系统按配置自动生成后续外呼任务。</div>
      </div>
      ${renderAiRedialSummary()}
    </div>
    <div class="filter-row">
      <span class="filter-label">关键字：</span>
      <input class="filter-select" id="aiRedialKeywordFilter" placeholder="请输入内容" oninput="filterAiRedialTable()" />
      <span class="filter-label">原外呼类型：</span>
      <select class="filter-select" id="aiRedialOutboundTypeFilter" onchange="filterAiRedialTable()">${renderSimpleOptions(aiRedialOutboundTypeOptions, '', '全部')}</select>
      <span class="filter-label">新外呼类型：</span>
      <select class="filter-select" id="aiRedialNewOutboundTypeFilter" onchange="filterAiRedialTable()">${renderSimpleOptions(aiRedialNewOutboundTypeOptions, '', '全部')}</select>
      <span class="filter-label">命中类型：</span>
      <select class="filter-select" id="aiRedialAttributeFilter" onchange="filterAiRedialTable()">${renderSimpleOptions(aiRedialAttributeOptions, '', '全部')}</select>
      <span class="filter-label">状态：</span>
      <select class="filter-select" id="aiRedialStatusFilter" onchange="filterAiRedialTable()"><option value="">全部</option><option value="启用">启用</option><option value="停用">停用</option></select>
      <button class="btn-secondary" type="button" onclick="resetAiRedialFilters()">重置</button>
    </div>
    <div class="card">
      <div class="section-header">
        <div class="section-title">外呼重推配置列表</div>
        <button class="btn-add strategy-add-btn" type="button" onclick="openAiRedialRuleModal('add')">新增配置</button>
      </div>
      <div class="policy-table-wrap">
        <table class="data-table policy-table">
          <thead>
            <tr>
              <th style="width:50px">#</th><th style="width:190px">配置名称</th><th style="width:90px">原外呼类型</th><th style="width:90px">新外呼类型</th><th style="width:80px">推送时间</th><th style="width:70px">重推次数</th><th style="width:70px">重推间隔</th><th style="width:80px">命中类型</th><th style="width:80px">状态</th><th style="width:150px">操作</th>
            </tr>
          </thead>
          <tbody id="aiRedialRuleTableBody"></tbody>
        </table>
      </div>
      <div class="pagination">
        <span id="aiRedialPageInfo">共 0 条记录，当前第 1 / 1 页</span>
        <div class="pagination-btns">
          <select class="hit-page-size" id="aiRedialPageSize" onchange="changeAiRedialPageSize(this.value)">
            <option value="5">每页 5 条</option>
            <option value="10">每页 10 条</option>
            <option value="20">每页 20 条</option>
          </select>
          <button class="page-btn" type="button" onclick="changeAiRedialPage(-1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <select class="hit-page-size" id="aiRedialPageSelect" onchange="selectAiRedialPage(this.value)"></select>
          <button class="page-btn" type="button" onclick="changeAiRedialPage(1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
    </div>
  `;
  renderAiRedialTable();
}

function renderAiRedialSummary() {
  const enabled = aiRedialRules.filter(rule => rule.enabled).length;
  const outboundTypes = new Set(aiRedialRules.map(rule => rule.outboundType)).size;
  return `<div class="summary-strip"><div class="summary-card"><div class="summary-label">规则总数</div><div class="summary-value">${aiRedialRules.length}</div></div><div class="summary-card"><div class="summary-label">启用规则</div><div class="summary-value">${enabled}</div></div><div class="summary-card"><div class="summary-label">覆盖原外呼类型</div><div class="summary-value">${outboundTypes}</div></div></div>`;
}

function renderSimpleOptions(options, selected = '', allLabel = '请选择') {
  return `<option value="">${allLabel}</option>${options.map(item => `<option value="${escapeAttr(item)}" ${item === selected ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}`;
}

function getAiRedialCallStatuses(rule = {}) {
  if (Array.isArray(rule.callStatuses)) return rule.callStatuses;
  return rule.callStatus ? [rule.callStatus] : [];
}

function getAiRedialAbnormalReasons(rule = {}) {
  if (Array.isArray(rule.abnormalReasons)) return rule.abnormalReasons;
  return rule.abnormalReason ? [rule.abnormalReason] : [];
}

function getAiRedialOutboundLabels(rule = {}) {
  if (Array.isArray(rule.outboundLabels)) return rule.outboundLabels;
  return rule.outboundLabel ? [rule.outboundLabel] : [];
}

function renderAiRedialCheckOptions(options, name, selectedValues = [], onchange = '') {
  const selected = Array.isArray(selectedValues) ? selectedValues : [];
  return options.map(option => `
    <label class="check-option">
      <input type="checkbox" name="${name}" value="${escapeAttr(option)}" ${selected.includes(option) ? 'checked' : ''} ${onchange} />
      ${escapeHtml(option)}
    </label>
  `).join('');
}

function getCheckedAiRedialValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(item => item.value);
}

// ===== AI Redial Outbound Label Picker (multi-select tag-picker) =====
function renderAiRedialOutboundLabelPicker(selectedLabels = [], readonly = false) {
  const safeSelected = selectedLabels || [];
  return `
    <div class="tag-picker dispatch-tag-picker">
      <button class="tag-picker-trigger placeholder" id="aiRedialOutboundLabelTrigger" type="button" onclick="toggleAiRedialOutboundLabelPicker()" ${readonly ? 'disabled' : ''}>请选择外呼标签</button>
      <div class="tag-picker-panel" id="aiRedialOutboundLabelPanel">
        <div class="tag-picker-toolbar">
          <span id="aiRedialOutboundLabelCount">已选 0 / ${leadDispatchTagOptions.length}</span>
          <div class="tag-picker-actions">
            <button class="tag-picker-action" type="button" onclick="selectAllAiRedialOutboundLabels()">全选</button>
            <button class="tag-picker-action" type="button" onclick="clearAiRedialOutboundLabels()">清空</button>
          </div>
        </div>
        <div class="tag-picker-search">
          <input type="search" placeholder="搜索外呼标签" oninput="filterTagPickerOptions('aiRedialOutboundLabelPanel', this.value)" />
        </div>
        <div class="tag-picker-list">
          ${leadDispatchTagOptions.map(tag => `
            <label class="tag-option">
              <input type="checkbox" name="aiRedialOutboundLabel" value="${escapeAttr(tag)}" ${safeSelected.includes(tag) ? 'checked' : ''} ${readonly ? 'disabled' : 'onchange="toggleAiRedialOutboundLabelOption(this)"'} />
              ${tag}
            </label>
          `).join('')}
        </div>
        <div class="tag-picker-empty">暂无匹配标签</div>
      </div>
    </div>
  `;
}

function getAiRedialOutboundLabelInputs() {
  return getTagPickerInputs('aiRedialOutboundLabelPanel');
}

function toggleAiRedialOutboundLabelPicker() {
  toggleExclusivePanel('aiRedialOutboundLabelPanel');
}

function updateAiRedialOutboundLabelPickerSummary() {
  updateMultiSelectPickerSummary({
    panelId: 'aiRedialOutboundLabelPanel',
    triggerId: 'aiRedialOutboundLabelTrigger',
    countId: 'aiRedialOutboundLabelCount',
    placeholder: '请选择外呼标签'
  });
}

function toggleAiRedialOutboundLabelOption(input) {
  togglePickerOption(input, updateAiRedialOutboundLabelPickerSummary);
}

function selectAllAiRedialOutboundLabels() {
  setPickerInputsChecked(getVisibleTagPickerInputs('aiRedialOutboundLabelPanel'), true, updateAiRedialOutboundLabelPickerSummary);
}

function clearAiRedialOutboundLabels() {
  setPickerInputsChecked(getAiRedialOutboundLabelInputs(), false, updateAiRedialOutboundLabelPickerSummary);
}

function hasAiRedialAbnormalReasons(leadStatuses = []) {
  return leadStatuses.some(status => hasLeadDispatchAbnormalReasons(status));
}

function getAiRedialAbnormalReasonOptions(leadStatuses = [], currentReasons = []) {
  const options = [];
  leadStatuses.forEach(status => {
    getLeadDispatchAbnormalReasonOptions(status, '').forEach(reason => {
      if (reason && !options.includes(reason)) options.push(reason);
    });
  });
  (Array.isArray(currentReasons) ? currentReasons : [currentReasons]).forEach(reason => {
    if (reason && !options.includes(reason)) options.push(reason);
  });
  return options;
}

function getAiRedialIntentOptions(leadStatuses = [], currentValue = '') {
  const baseOptions = leadDispatchIntentLevelOptions;
  if (!currentValue || baseOptions.includes(currentValue)) return baseOptions;
  return [...baseOptions, currentValue];
}

function getAiRedialSelectedIntentLevel(leadStatuses = [], currentValue = '') {
  return currentValue || '';
}

function isAiRedialIntentLocked(leadStatuses = []) {
  return false;
}

function getFilteredAiRedialRules() {
  const keyword = document.getElementById('aiRedialKeywordFilter')?.value.trim() || '';
  const outboundType = document.getElementById('aiRedialOutboundTypeFilter')?.value || '';
  const newOutboundType = document.getElementById('aiRedialNewOutboundTypeFilter')?.value || '';
  const attributeType = document.getElementById('aiRedialAttributeFilter')?.value || '';
  const status = document.getElementById('aiRedialStatusFilter')?.value || '';
  return aiRedialRules
    .filter(rule => !keyword || String(rule.id).includes(keyword) || (rule.ruleName || '').includes(keyword))
    .filter(rule => !outboundType || rule.outboundType === outboundType)
    .filter(rule => !newOutboundType || rule.newOutboundType === newOutboundType)
    .filter(rule => !attributeType || rule.attributeType === attributeType)
    .filter(rule => !status || (status === '启用' ? rule.enabled : !rule.enabled))
    .sort((a, b) => (Number(a.sortOrder) || 999) - (Number(b.sortOrder) || 999) || String(b.createdAt).localeCompare(String(a.createdAt)));
}

function renderAiRedialTable() {
  const body = document.getElementById('aiRedialRuleTableBody');
  if (!body) return;
  const rows = getFilteredAiRedialRules();
  const totalPages = Math.max(1, Math.ceil(rows.length / aiRedialPageSize));
  aiRedialCurrentPage = Math.min(aiRedialCurrentPage, totalPages);
  const start = (aiRedialCurrentPage - 1) * aiRedialPageSize;
  const pageRows = rows.slice(start, start + aiRedialPageSize);
  document.getElementById('aiRedialPageInfo').textContent = `共 ${rows.length} 条记录，当前第 ${aiRedialCurrentPage} / ${totalPages} 页`;
  const pageSelect = document.getElementById('aiRedialPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, idx) => `<option value="${idx + 1}">第 ${idx + 1} 页</option>`).join('');
    pageSelect.value = String(aiRedialCurrentPage);
  }
  const pageSizeSelect = document.getElementById('aiRedialPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(aiRedialPageSize);
  body.innerHTML = pageRows.length ? pageRows.map(rule => `
    <tr>
      <td>${rule.sortOrder}</td>
      <td>
        <div class="rule-text-stack">
          <div class="rule-text-main">${escapeHtml(rule.ruleName || '—')}</div>
          <div class="rule-muted">规则ID: ARP-${rule.id}</div>
        </div>
      </td>
      <td>${escapeHtml(rule.outboundType)}</td>
      <td>${escapeHtml(rule.newOutboundType || '原外呼类型')}</td>
      <td>${escapeHtml(rule.pushDelay)}</td>
      <td>${escapeHtml(rule.redialCount)}</td>
      <td>${escapeHtml(rule.redialInterval)}</td>
      <td>${escapeHtml(rule.attributeType || '—')}</td>
      <td>${rule.enabled ? '<span class="col-status-on">● 启用</span>' : '<span class="col-status-off">● 停用</span>'}</td>
      <td><div class="action-btns"><button class="action-btn view" type="button" onclick="openAiRedialRuleModal('view', ${rule.id})">查看</button><button class="action-btn edit" type="button" onclick="openAiRedialRuleModal('edit', ${rule.id})">编辑</button><button class="action-btn delete" type="button" onclick="deleteAiRedialRule(${rule.id})">删除</button></div></td>
    </tr>
  `).join('') : '<tr><td colspan="10"><div class="empty-state">暂无数据</div></td></tr>';
}

function filterAiRedialTable() {
  aiRedialCurrentPage = 1;
  renderAiRedialTable();
}

function resetAiRedialFilters() {
  ['aiRedialKeywordFilter', 'aiRedialOutboundTypeFilter', 'aiRedialNewOutboundTypeFilter', 'aiRedialAttributeFilter', 'aiRedialStatusFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  filterAiRedialTable();
}

function changeAiRedialPageSize(value) {
  aiRedialPageSize = Number(value) || 20;
  aiRedialCurrentPage = 1;
  renderAiRedialTable();
}

function changeAiRedialPage(dir) {
  const rows = getFilteredAiRedialRules();
  const totalPages = Math.max(1, Math.ceil(rows.length / aiRedialPageSize));
  aiRedialCurrentPage = Math.max(1, Math.min(totalPages, aiRedialCurrentPage + dir));
  renderAiRedialTable();
}

function selectAiRedialPage(value) {
  aiRedialCurrentPage = Number(value) || 1;
  renderAiRedialTable();
}

function jumpToAiRedialPage(value) {
  const rows = getFilteredAiRedialRules();
  const totalPages = Math.max(1, Math.ceil(rows.length / aiRedialPageSize));
  aiRedialCurrentPage = Math.max(1, Math.min(totalPages, Number(value) || 1));
  renderAiRedialTable();
}

function getDefaultAiRedialRule() {
  return { id: '', ruleName: '', sortOrder: aiRedialRules.length + 1, outboundType: '', newOutboundType: '', intentLevel: '', leadStatus: [], abnormalReason: '', abnormalReasons: [], pushDelay: '', redialCount: '', redialInterval: '', attributeType: '', callStatus: '', callStatuses: [], outboundLabel: '', outboundLabels: [], enabled: null };
}

function openAiRedialRuleModal(mode, id) {
  editingAiRedialRuleId = mode === 'edit' ? id : null;
  const source = id ? aiRedialRules.find(rule => rule.id === id) : null;
  const rule = source || getDefaultAiRedialRule();
  const readonly = mode === 'view';
  document.getElementById('aiRedialRuleModalTitle').textContent = mode === 'add' ? '新增外呼重推配置' : mode === 'edit' ? '编辑外呼重推配置' : '查看外呼重推配置';
  document.getElementById('aiRedialRuleModalBody').innerHTML = mode === 'view'
    ? renderAiRedialRuleDetail(rule)
    : renderAiRedialRuleForm(rule, readonly);
  document.getElementById('aiRedialRuleModalFooter').innerHTML = mode === 'view'
    ? `<button class="btn-secondary" type="button" onclick="closeModal('aiRedialRuleModal')">关闭</button><button class="btn-add" type="button" onclick="openAiRedialRuleModal('edit', ${rule.id})">编辑</button>`
    : `<button class="btn-secondary" type="button" onclick="closeModal('aiRedialRuleModal')">取消</button><button class="btn-add" type="button" onclick="saveAiRedialRule('${mode}')">确定</button>`;
  document.getElementById('aiRedialRuleModal').classList.add('show');
  updateAiRedialOutboundLabelPickerSummary();
}

function renderAiRedialRuleForm(rule, readonly = false) {
  const disabled = readonly ? 'disabled' : '';
  const newOutboundDisabled = readonly || !rule.outboundType ? 'disabled' : '';
  const attributeType = rule.attributeType || '';
  const selectedLeadStatuses = rule.leadStatus || [];
  const selectedAbnormalReasons = getAiRedialAbnormalReasons(rule);
  const selectedCallStatuses = getAiRedialCallStatuses(rule);
  const selectedOutboundLabels = rule.outboundLabels || (rule.outboundLabel ? [rule.outboundLabel] : []);
  const reasonVisible = attributeType === '线索状态' && hasAiRedialAbnormalReasons(selectedLeadStatuses);
  const intentLocked = isAiRedialIntentLocked(selectedLeadStatuses);
  return `
    <section class="dispatch-form-section"><div class="dispatch-section-title">基础信息</div><div class="dispatch-form-grid">
      <div class="form-group"><div class="form-label">配置名称 <span class="required">*</span></div><input class="form-input" type="text" id="aiRedialFormRuleName" value="${escapeAttr(rule.ruleName || '')}" placeholder="例：空号状态重新推送" ${disabled} /></div>
      <div class="form-group"><div class="form-label">状态 <span class="required">*</span></div><select class="form-input" id="aiRedialFormEnabled" ${disabled}><option value="">请选择</option><option value="启用" ${rule.enabled === true ? 'selected' : ''}>启用</option><option value="停用" ${rule.enabled === false ? 'selected' : ''}>停用</option></select></div>
    </div></section>
    <section class="dispatch-form-section"><div class="dispatch-section-title">命中条件</div><div class="dispatch-form-grid">
        <div class="form-group"><div class="form-label">原外呼类型 <span class="required">*</span></div>${renderAiRedialOutboundTypePicker(rule.outboundType || '', readonly)}</div>
        <div class="form-group"><div class="form-label">新外呼类型 <span class="required">*</span></div><select class="form-input" id="aiRedialFormNewOutboundType" ${newOutboundDisabled}>${renderSimpleOptions(aiRedialNewOutboundTypeOptions, rule.newOutboundType || '', '请选择')}</select></div>
        <div class="form-group"><div class="form-label">命中类型 <span class="required">*</span></div><select class="form-input" id="aiRedialFormAttribute" onchange="syncAiRedialConditionFields()" ${disabled}>${renderSimpleOptions(aiRedialAttributeOptions, attributeType, '请选择')}</select></div>
        <div class="form-group" id="aiRedialIntentGroup" style="${attributeType === '线索状态' ? '' : 'display:none'}"><div class="form-label">意向级别 <span class="required">*</span></div><select class="form-input" id="aiRedialFormIntent" ${intentLocked || readonly ? 'disabled' : ''}>${renderLeadDispatchOptionList(getAiRedialIntentOptions(selectedLeadStatuses, rule.intentLevel || ''), getAiRedialSelectedIntentLevel(selectedLeadStatuses, rule.intentLevel || ''), intentLocked ? '不更新' : '请选择')}</select></div>
        <div class="form-group wide" id="aiRedialLeadStatusGroup" style="${attributeType === '线索状态' ? '' : 'display:none'}"><div class="form-label">线索状态 <span class="required">*</span></div><div class="series-select-panel"><div class="series-series-grid">${aiRedialLeadStatusOptions.map(item => `<label class="series-series-option"><input type="checkbox" name="aiRedialLeadStatus" value="${escapeAttr(item)}" ${selectedLeadStatuses.includes(item) ? 'checked' : ''} ${readonly ? 'disabled' : 'onchange="syncAiRedialLeadStatusFields()"'} /><span>${escapeHtml(item)}</span></label>`).join('')}</div></div></div>
        <div class="form-group wide" id="aiRedialAbnormalReasonGroup" style="${reasonVisible ? '' : 'display:none'}"><div class="form-label">异常原因 <span class="required">*</span></div><div class="series-select-panel"><div class="lead-status-reason-groups" id="aiRedialAbnormalReasonOptions">${renderLeadStatusReasonGroups(selectedLeadStatuses, selectedAbnormalReasons, 'aiRedialAbnormalReason')}</div><div class="series-form-hint">异常原因会按已选择的线索状态分组展示。</div></div></div>
        <div class="form-group" id="aiRedialCallStatusGroup" style="${attributeType === '通话状态' ? '' : 'display:none'}"><div class="form-label">通话状态 <span class="required">*</span></div><select class="form-input" id="aiRedialFormCallStatus" ${disabled}>${renderSimpleOptions(aiRedialCallStatusOptions, selectedCallStatuses[0] || '', '请选择')}</select></div>
        <div class="form-group wide" id="aiRedialOutboundLabelGroup" style="${attributeType === '通话状态' ? '' : 'display:none'}"><div class="form-label">外呼标签 <span class="required">*</span></div>${renderAiRedialOutboundLabelPicker(selectedOutboundLabels, readonly)}</div>
      </div>
    </section>
    <section class="dispatch-form-section"><div class="dispatch-section-title">执行动作</div><div class="dispatch-form-grid">
      <div class="form-group"><div class="form-label">推送时间 <span class="required">*</span></div><select class="form-input" id="aiRedialFormPushDelay" ${disabled}>${renderSimpleOptions(aiRedialPushDelayOptions, rule.pushDelay, '请选择')}</select></div>
      <div class="form-group"><div class="form-label">重推次数 <span class="required">*</span></div><select class="form-input" id="aiRedialFormCount" ${disabled}>${renderSimpleOptions(aiRedialCountOptions, rule.redialCount, '请选择')}</select></div>
      <div class="form-group"><div class="form-label">重推间隔 <span class="required">*</span></div><select class="form-input" id="aiRedialFormInterval" ${disabled}>${renderSimpleOptions(aiRedialIntervalOptions, rule.redialInterval, '请选择')}</select></div>
    </div></section>
  `;
}

function renderAiRedialRuleDetail(rule = {}) {
  if (!rule) return renderEmptySnapshot('未找到规则');
  const hitFields = [
    ['原外呼类型', rule.outboundType],
    ['新外呼类型', rule.newOutboundType || '原外呼类型'],
    ['命中类型', rule.attributeType]
  ];
  if (rule.attributeType === '线索状态') {
    hitFields.push(['意向级别', rule.intentLevel]);
    hitFields.push(['线索状态', (rule.leadStatus || []).join('、')]);
    if (hasAiRedialAbnormalReasons(rule.leadStatus || [])) {
      hitFields.push(['异常原因', getAiRedialAbnormalReasons(rule).join('、')]);
    }
  } else if (rule.attributeType === '通话状态') {
    hitFields.push(['通话状态', rule.callStatus || getAiRedialCallStatuses(rule)[0] || '']);
    hitFields.push(['外呼标签', getAiRedialOutboundLabels(rule).join('、')]);
  }
  const sections = [
    { title: '基础信息', fields: [
      ['配置名称', rule.ruleName],
      ['状态', rule.enabled ? '启用' : '停用']
    ]},
    { title: '命中条件', fields: hitFields },
    { title: '执行动作', fields: [
      ['推送时间', rule.pushDelay],
      ['重推次数', rule.redialCount],
      ['重推间隔', rule.redialInterval]
    ]}
  ];
  return `<div class="rule-detail-layout">${sections.map(section => `<section class="rule-detail-section"><div class="rule-detail-title">${section.title}</div><div class="rule-detail-body">${section.fields.map(([label, value]) => `<div class="rule-detail-field"><div class="rule-detail-label">${label}</div><div class="rule-detail-value">${detailValue(value)}</div></div>`).join('')}</div></section>`).join('')}</div>`;
}

function syncAiRedialNewOutboundType() {
  const originalType = document.getElementById('aiRedialFormOutboundType')?.value || '';
  const newTypeSelect = document.getElementById('aiRedialFormNewOutboundType');
  if (!newTypeSelect) return;
  newTypeSelect.disabled = !originalType;
  if (!originalType) {
    newTypeSelect.value = '';
  }
}

function syncAiRedialConditionFields() {
  const attributeType = document.getElementById('aiRedialFormAttribute')?.value || '';
  const leadStatusGroup = document.getElementById('aiRedialLeadStatusGroup');
  const abnormalReasonGroup = document.getElementById('aiRedialAbnormalReasonGroup');
  const intentGroup = document.getElementById('aiRedialIntentGroup');
  const callStatusGroup = document.getElementById('aiRedialCallStatusGroup');
  const outboundLabelGroup = document.getElementById('aiRedialOutboundLabelGroup');
  const intentSelect = document.getElementById('aiRedialFormIntent');
  const showLeadStatus = attributeType === '线索状态';
  const showCallStatus = attributeType === '通话状态';

  if (leadStatusGroup) leadStatusGroup.style.display = showLeadStatus ? '' : 'none';
  if (intentGroup) intentGroup.style.display = showLeadStatus ? '' : 'none';
  if (callStatusGroup) callStatusGroup.style.display = showCallStatus ? '' : 'none';
  if (outboundLabelGroup) outboundLabelGroup.style.display = showCallStatus ? '' : 'none';

  if (!showLeadStatus) {
    document.querySelectorAll('input[name="aiRedialLeadStatus"]').forEach(input => { input.checked = false; });
    document.querySelectorAll('input[name="aiRedialAbnormalReason"]').forEach(input => { input.checked = false; });
    if (intentSelect) intentSelect.value = '';
    if (abnormalReasonGroup) abnormalReasonGroup.style.display = 'none';
  } else {
    syncAiRedialLeadStatusFields();
  }

  if (!showCallStatus) {
    const callStatusSelect = document.getElementById('aiRedialFormCallStatus');
    if (callStatusSelect) callStatusSelect.value = '';
    getAiRedialOutboundLabelInputs().forEach(input => { input.checked = false; input.closest('.tag-option')?.classList.remove('selected'); });
    const labelTrigger = document.getElementById('aiRedialOutboundLabelTrigger');
    if (labelTrigger) {
      labelTrigger.textContent = '请选择外呼标签';
      labelTrigger.classList.add('placeholder');
    }
    const labelCount = document.getElementById('aiRedialOutboundLabelCount');
    if (labelCount) labelCount.textContent = `已选 0 / ${leadDispatchTagOptions.length}`;
  }
}

function syncAiRedialLeadStatusFields() {
  const leadStatuses = getCheckedAiRedialValues('aiRedialLeadStatus');
  const reasonGroup = document.getElementById('aiRedialAbnormalReasonGroup');
  const reasonOptions = document.getElementById('aiRedialAbnormalReasonOptions');
  const intentSelect = document.getElementById('aiRedialFormIntent');
  const showReason = hasAiRedialAbnormalReasons(leadStatuses);
  if (reasonGroup) reasonGroup.style.display = showReason ? '' : 'none';
  if (reasonOptions) {
    const currentValues = getCheckedAiRedialValues('aiRedialAbnormalReason');
    const allReasons = getAiRedialAbnormalReasonOptions(leadStatuses, []);
    const selected = showReason ? currentValues.filter(value => allReasons.includes(value)) : [];
    reasonOptions.innerHTML = showReason ? renderLeadStatusReasonGroups(leadStatuses, selected, 'aiRedialAbnormalReason') : '';
  }
  if (intentSelect) {
    const locked = isAiRedialIntentLocked(leadStatuses);
    const currentValue = intentSelect.value || '';
    intentSelect.innerHTML = renderLeadDispatchOptionList(
      getAiRedialIntentOptions(leadStatuses, currentValue),
      getAiRedialSelectedIntentLevel(leadStatuses, currentValue),
      locked ? '不更新' : '请选择'
    );
    intentSelect.disabled = locked;
  }
}

function saveAiRedialRule(mode) {
  const ruleName = document.getElementById('aiRedialFormRuleName')?.value.trim() || '';
  const outboundType = document.getElementById('aiRedialFormOutboundType')?.value || '';
  const newOutboundType = document.getElementById('aiRedialFormNewOutboundType')?.value || '';
  const attributeType = document.getElementById('aiRedialFormAttribute')?.value || '';
  const pushDelay = document.getElementById('aiRedialFormPushDelay')?.value || '';
  const redialCount = document.getElementById('aiRedialFormCount')?.value || '';
  const redialInterval = document.getElementById('aiRedialFormInterval')?.value || '';
  const enabledValue = document.getElementById('aiRedialFormEnabled')?.value || '';
  if (!ruleName || !outboundType || !newOutboundType || !enabledValue || !attributeType || !pushDelay || !redialCount || !redialInterval) {
    showToast('请完整填写必填项', false);
    return;
  }
  const leadStatusValues = getCheckedAiRedialValues('aiRedialLeadStatus');
  const abnormalReasons = getCheckedAiRedialValues('aiRedialAbnormalReason');
  const intentLevel = document.getElementById('aiRedialFormIntent')?.value || '';
  const callStatus = document.getElementById('aiRedialFormCallStatus')?.value || '';
  const outboundLabels = getAiRedialOutboundLabelInputs().filter(input => input.checked).map(input => input.value);
  if (attributeType === '线索状态') {
    if (!leadStatusValues.length) {
      showToast('请选择线索状态', false);
      return;
    }
    if (hasAiRedialAbnormalReasons(leadStatusValues) && !abnormalReasons.length) {
      showToast('请选择异常原因', false);
      return;
    }
    if (!intentLevel) {
      showToast('请选择意向级别', false);
      return;
    }
  }
  if (attributeType === '通话状态' && (!callStatus || !outboundLabels.length)) {
    showToast('请选择通话状态和外呼标签', false);
    return;
  }
  const now = '2026-07-08 10:00:00 操作人：管理员';
  const currentRule = editingAiRedialRuleId ? aiRedialRules.find(rule => rule.id === editingAiRedialRuleId) : null;
  const payload = {
    ruleName,
    sortOrder: currentRule?.sortOrder || aiRedialRules.length + 1,
    outboundType,
    newOutboundType,
    intentLevel: attributeType === '线索状态' ? intentLevel : '',
    leadStatus: attributeType === '线索状态' ? leadStatusValues : [],
    abnormalReason: attributeType === '线索状态' ? (abnormalReasons[0] || '') : '',
    abnormalReasons: attributeType === '线索状态' ? abnormalReasons : [],
    pushDelay,
    redialCount,
    redialInterval,
    attributeType,
    callStatus: attributeType === '通话状态' ? callStatus : '',
    callStatuses: attributeType === '通话状态' ? (callStatus ? [callStatus] : []) : [],
    outboundLabel: attributeType === '通话状态' ? (outboundLabels[0] || '') : '',
    outboundLabels: attributeType === '通话状态' ? outboundLabels : [],
    enabled: enabledValue === '启用',
    updatedAt: now
  };
  if (mode === 'edit' && editingAiRedialRuleId) {
    aiRedialRules = aiRedialRules.map(rule => rule.id === editingAiRedialRuleId ? { ...rule, ...payload } : rule);
    showToast('编辑成功', true);
  } else {
    aiRedialRules.unshift({ id: aiRedialNextId++, ...payload, createdAt: now });
    aiRedialCurrentPage = 1;
    showToast('新增成功', true);
  }
  closeModal('aiRedialRuleModal');
  renderAiRedialPolicyPage();
}

function deleteAiRedialRule(id) {
  if (!confirm('请检查信息是否正确')) return;
  aiRedialRules = aiRedialRules.filter(rule => rule.id !== id);
  showToast('删除成功', true);
  renderAiRedialPolicyPage();
}
