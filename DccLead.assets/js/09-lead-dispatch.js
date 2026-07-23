// ===== Lead Dispatch Config =====
function renderLeadDispatchConfigPage() {
  const page = document.getElementById('leadDispatchConfigPage');
  if (!page) return;
  page.innerHTML = `
    <div class="page-hero">
      <div>
        <div class="page-title">线索下发配置</div>
        <div class="page-desc">用于配置外呼结果后的线索处理规则，按外呼类型、通话状态、外呼标签、通话时长和意向专营店判断是否下发，并同步维护线索状态、异常原因、意向级别和 SmartCode，让每条线索的流转路径清晰可追踪。</div>
      </div>
      ${renderLeadDispatchSummary()}
    </div>
    <div class="filter-row">
      <span class="filter-label">关键字：</span>
      <input class="lead-input" style="width:130px; margin-right: 12px;" id="leadDispatchKeywordFilter" placeholder="请输入" oninput="filterLeadDispatchRuleTable()" />
      <span class="filter-label">外呼类型：</span>
      <select class="filter-select" id="leadDispatchCallTypeFilter" onchange="filterLeadDispatchRuleTable()">
        <option value="">全部</option>
        ${unifiedPolicyCallTypeOptions.map(type => `<option value="${type}">${type}</option>`).join('')}
      </select>
      <span class="filter-label">下发动作：</span>
      <select class="filter-select" id="leadDispatchTargetFilter" onchange="filterLeadDispatchRuleTable()">
        <option value="">全部</option>
        <option value="下发到NEV线索中台">下发到NEV线索中台</option>
        <option value="下发到总部培育客服">下发到总部培育客服</option>
        <option value="线索不下发">线索不下发</option>
      </select>
      <span class="filter-label">状态：</span>
      <select class="filter-select" id="leadDispatchEnabledFilter" onchange="filterLeadDispatchRuleTable()">
        <option value="">全部</option>
        <option value="启用">启用</option>
        <option value="停用">停用</option>
      </select>
      <button class="btn-secondary" type="button" onclick="resetLeadDispatchFilters()">重置</button>
    </div>
    <div class="policy-rule-note" id="leadDispatchRuleNote">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 1 21h22L12 2zm1 16h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
      <div>
        <strong>多配置命中处理：</strong>同一电话号码命中多个线索下发配置时，按权重判定，数字越小越先判定；同权重取更严格执行动作（下发到NEV线索中台 &gt; 下发到总部培育客服 &gt; 线索不下发）。
      </div>
    </div>
    <div class="card">
      <div class="section-header">
        <div class="section-title">线索下发配置列表</div>
        <div class="action-btns">
          <button class="btn-add strategy-add-btn" type="button" onclick="openLeadDispatchRuleModal('add')">新增配置</button>
        </div>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:64px">权重</th>
            <th>配置名称</th>
            <th>外呼类型</th>
            <th>命中条件</th>
            <th>下发动作</th>
            <th>字段更新</th>
            <th style="width:80px">状态</th>
            <th style="width:190px">操作</th>
          </tr>
        </thead>
        <tbody id="leadDispatchRuleTableBody"></tbody>
      </table>
      <div class="pagination">
        <span id="leadDispatchPageInfo">共 0 条记录，当前第 1 / 1 页</span>
        <div class="pagination-btns">
          <select class="hit-page-size" id="leadDispatchPageSize" onchange="changeLeadDispatchPageSize(this.value)">
            <option value="5">每页 5 条</option>
            <option value="10">每页 10 条</option>
            <option value="20">每页 20 条</option>
            <option value="50">每页 50 条</option>
          </select>
          <button class="page-btn" type="button" onclick="changeLeadDispatchPage(-1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <select class="hit-page-size" id="leadDispatchPageSelect" onchange="selectLeadDispatchPage(this.value)"></select>
          <button class="page-btn" type="button" onclick="changeLeadDispatchPage(1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
    </div>
  `;
  renderLeadDispatchRuleTable();
}

function renderLeadDispatchSummary() {
  const enabled = leadDispatchRules.filter(rule => rule.enabled).length;
  const nevCount = leadDispatchRules.filter(rule => rule.dispatchTarget === '下发到NEV线索中台').length;
  const manualCount = leadDispatchRules.filter(rule => rule.dispatchTarget === '下发到总部培育客服').length;
  const noDispatchCount = leadDispatchRules.filter(rule => rule.dispatchTarget === '线索不下发').length;
  const cards = [
    { label: '规则总数', value: leadDispatchRules.length },
    { label: '启用规则', value: enabled },
    { label: '下发NEV中台', value: nevCount },
    { label: '下发人工客服', value: manualCount },
    { label: '线索不下发', value: noDispatchCount }
  ];
  return `
    <div class="summary-strip">
      ${cards.map(card => `
        <div class="summary-card">
          <div class="summary-label">${card.label}</div>
          <div class="summary-value">${card.value}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function getFilteredLeadDispatchRules() {
  const keyword = document.getElementById('leadDispatchKeywordFilter')?.value.trim().toLowerCase() || '';
  const callType = document.getElementById('leadDispatchCallTypeFilter')?.value || '';
  const target = document.getElementById('leadDispatchTargetFilter')?.value || '';
  const enabled = document.getElementById('leadDispatchEnabledFilter')?.value || '';
  return leadDispatchRules
    .filter(rule => {
      if (!keyword) return true;
      const text = [
        rule.name,
        `LDF-${String(rule.id).padStart(3, '0')}`,
        (rule.callTypes || []).join(' '),
        rule.dispatchTarget,
        rule.updateLeadStatus,
        rule.abnormalReason,
        rule.updateIntentLevel,
        rule.updateSmartCode
      ].filter(Boolean).join(' ').toLowerCase();
      return text.includes(keyword);
    })
    .filter(rule => !callType || rule.callTypes.includes(callType))
    .filter(rule => !target || rule.dispatchTarget === target)
    .filter(rule => !enabled || (enabled === '启用' ? rule.enabled : !rule.enabled))
    .sort((a, b) => (Number(a.priority) || 99) - (Number(b.priority) || 99) || a.id - b.id);
}

function renderLeadDispatchRuleTable() {
  const body = document.getElementById('leadDispatchRuleTableBody');
  if (!body) return;
  const rows = getFilteredLeadDispatchRules();
  const totalPages = Math.max(1, Math.ceil(rows.length / leadDispatchPageSize));
  leadDispatchCurrentPage = Math.min(leadDispatchCurrentPage, totalPages);
  const start = (leadDispatchCurrentPage - 1) * leadDispatchPageSize;
  const pageRows = rows.slice(start, start + leadDispatchPageSize);
  const info = document.getElementById('leadDispatchPageInfo');
  if (info) info.textContent = `共 ${rows.length} 条记录，当前第 ${leadDispatchCurrentPage} / ${totalPages} 页`;
  const pageSelect = document.getElementById('leadDispatchPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, idx) => `<option value="${idx + 1}">第 ${idx + 1} 页</option>`).join('');
    pageSelect.value = String(leadDispatchCurrentPage);
  }
  const pageSizeSelect = document.getElementById('leadDispatchPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(leadDispatchPageSize);
  body.innerHTML = pageRows.length ? pageRows.map(rule => `
    <tr>
      <td><span class="policy-plain-text">P${rule.priority}</span></td>
      <td>
        <div class="rule-text-stack">
          <div class="rule-text-main">${rule.name}</div>
          <div class="rule-muted">规则ID: LDF-${String(rule.id).padStart(3, '0')}</div>
        </div>
      </td>
      <td>${renderRuleChipList(rule.callTypes, 'blue', 2)}</td>
      <td>${renderLeadDispatchConditionSummary(rule)}</td>
      <td><span class="policy-plain-text">${rule.dispatchTarget}</span></td>
      <td>${renderLeadDispatchUpdateSummary(rule)}</td>
      <td>${rule.enabled ? '<span class="col-status-on">● 启用</span>' : '<span class="col-status-off">● 停用</span>'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view" type="button" onclick="openLeadDispatchRuleModal('view', ${rule.id})">查看</button>
          <button class="action-btn edit" type="button" onclick="openLeadDispatchRuleModal('edit', ${rule.id})">编辑</button>
          <button class="action-btn delete" type="button" onclick="deleteLeadDispatchRule(${rule.id})">删除</button>
        </div>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="8"><div class="empty-state">暂无匹配的线索下发规则</div></td></tr>';
}

function renderRuleChipList(values, cls = '', limit = 4) {
  const list = values || [];
  if (!list.length) return '<span class="rule-muted">—</span>';
  const shown = list.slice(0, limit);
  const more = list.length > limit ? [`+${list.length - limit}`] : [];
  return `<div class="rule-chip-row">${[...shown, ...more].map(value => `<span class="rule-chip ${cls}">${value}</span>`).join('')}</div>`;
}

function renderCallTypeTagPicker({ idPrefix, inputName, options = [], selected = [], placeholder = '请选择外呼类型', readonly = false }) {
  const safeSelected = selected || [];
  const disabledAttr = readonly ? 'disabled' : '';
  const onclickAttr = readonly ? '' : `onclick="toggleCallTypeTagPicker('${idPrefix}')"`;
  return `
    <div class="tag-picker dispatch-tag-picker ${readonly ? 'readonly' : ''}">
      <button class="tag-picker-trigger placeholder" id="${idPrefix}Trigger" type="button" ${onclickAttr}>${placeholder}</button>
      <div class="tag-picker-panel" id="${idPrefix}Panel">
        <div class="tag-picker-toolbar">
          <span id="${idPrefix}Count">已选 0 / ${options.length}</span>
          ${readonly ? '' : `
          <div class="tag-picker-actions">
            <button class="tag-picker-action" type="button" onclick="selectAllCallTypeTagPicker('${idPrefix}')">全选</button>
            <button class="tag-picker-action" type="button" onclick="clearCallTypeTagPicker('${idPrefix}')">清空</button>
          </div>
          `}
        </div>
        <div class="tag-picker-list">
          ${options.map(type => `
            <label class="tag-option">
              <input type="checkbox" name="${inputName}" value="${escapeAttr(type)}" ${safeSelected.includes(type) ? 'checked' : ''} ${disabledAttr} onchange="toggleCallTypeTagOption('${idPrefix}', this)" />
              ${escapeHtml(type)}
            </label>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function getCallTypeTagPickerInputs(idPrefix) {
  return [...document.querySelectorAll(`#${idPrefix}Panel .tag-option input`)];
}

function toggleCallTypeTagPicker(idPrefix) {
  const panelId = `${idPrefix}Panel`;
  toggleExclusivePanel(panelId);
  updateCallTypeTagPickerSummary(idPrefix);
}

function updateCallTypeTagPickerSummary(idPrefix) {
  updatePickerSummaryFromInputs({
    inputs: getCallTypeTagPickerInputs(idPrefix),
    triggerId: `${idPrefix}Trigger`,
    countId: `${idPrefix}Count`,
    placeholder: '请选择外呼类型'
  });
}

function toggleCallTypeTagOption(idPrefix, input) {
  togglePickerOption(input, () => updateCallTypeTagPickerSummary(idPrefix));
}

function selectAllCallTypeTagPicker(idPrefix) {
  setPickerInputsChecked(getCallTypeTagPickerInputs(idPrefix), true, () => updateCallTypeTagPickerSummary(idPrefix));
}

function clearCallTypeTagPicker(idPrefix) {
  setPickerInputsChecked(getCallTypeTagPickerInputs(idPrefix), false, () => updateCallTypeTagPickerSummary(idPrefix));
}

function renderLeadDispatchConditionSummary(rule) {
  const parts = [
    `通话状态（${rule.includeCallStatusLogic || '或'}）：${(rule.includeCallStatuses || []).slice(0, 3).join('、') || '不限'}${(rule.includeCallStatuses || []).length > 3 ? '…' : ''}`,
    `包含标签（${rule.includeTagLogic || '或'}）：${(rule.includeTags || []).slice(0, 3).join('、') || '—'}${rule.includeTags.length > 3 ? '…' : ''}`,
    `不包含标签（${rule.excludeTagLogic || '或'}）：${(rule.excludeTags || []).slice(0, 3).join('、') || '—'}${rule.excludeTags.length > 3 ? '…' : ''}`,
    `意向专营店：${rule.hasIntentDealer || '不限'}`
  ];
  if (rule.durationOperator && rule.durationSeconds) parts.push(`通话时长：${rule.durationOperator}${rule.durationSeconds}秒`);
  return `<div class="rule-text-stack">${parts.map(item => `<div>${item}</div>`).join('')}</div>`;
}

function renderLeadDispatchUpdateSummary(rule) {
  const items = [
    rule.updateLeadStatus ? `线索状态：${rule.updateLeadStatus}` : '',
    rule.abnormalReason ? `异常原因：${rule.abnormalReason}` : '',
    rule.updateIntentLevel ? `意向级别：${rule.updateIntentLevel}` : '',
    rule.updateSmartCode ? `SmartCode：${rule.updateSmartCode}` : ''
  ].filter(Boolean);
  return `<div class="rule-text-stack">${items.length ? items.map(item => `<div>${item}</div>`).join('') : '<span class="rule-muted">不更新</span>'}</div>`;
}

function resetLeadDispatchFilters() {
  ['leadDispatchKeywordFilter', 'leadDispatchCallTypeFilter', 'leadDispatchTargetFilter', 'leadDispatchEnabledFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  leadDispatchCurrentPage = 1;
  renderLeadDispatchRuleTable();
}

function filterLeadDispatchRuleTable() {
  leadDispatchCurrentPage = 1;
  renderLeadDispatchRuleTable();
}

function changeLeadDispatchPageSize(value) {
  leadDispatchPageSize = Number(value) || 10;
  leadDispatchCurrentPage = 1;
  renderLeadDispatchRuleTable();
}

function changeLeadDispatchPage(dir) {
  const rows = getFilteredLeadDispatchRules();
  const totalPages = Math.max(1, Math.ceil(rows.length / leadDispatchPageSize));
  leadDispatchCurrentPage = Math.max(1, Math.min(totalPages, leadDispatchCurrentPage + dir));
  renderLeadDispatchRuleTable();
}

function selectLeadDispatchPage(value) {
  leadDispatchCurrentPage = Number(value) || 1;
  renderLeadDispatchRuleTable();
}

function openLeadDispatchRuleModal(mode, id = null) {
  setSharedRuleModalVisual('config');
  editingLeadDispatchRuleId = mode === 'edit' ? id : null;
  const rule = id ? leadDispatchRules.find(item => item.id === id) : null;
  const titleMap = { add: '新增线索下发配置', edit: '编辑线索下发配置', view: '查看线索下发配置' };
  document.getElementById('leadDispatchRuleModalTitle').textContent = titleMap[mode] || '线索下发规则';
  document.getElementById('leadDispatchRuleModalBody').innerHTML = mode === 'view'
    ? renderLeadDispatchRuleDetail(rule)
    : renderLeadDispatchRuleForm(rule || getDefaultLeadDispatchRule());
  document.getElementById('leadDispatchRuleModalFooter').innerHTML = mode === 'view'
    ? `<button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">关闭</button>`
    : `
      <button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">取消</button>
      <button class="btn-save" type="button" onclick="saveLeadDispatchRule()">保存</button>
    `;
  document.getElementById('leadDispatchRuleModal').classList.add('show');
  if (mode !== 'view') {
    updateCallTypeTagPickerSummary('leadDispatchCallType');
    updateLeadDispatchCallStatusPickerSummary();
    updateLeadDispatchTagPickerSummary('Include');
    updateLeadDispatchTagPickerSummary('Exclude');
  }
}

function getDefaultLeadDispatchRule() {
  return {
    name: '',
    priority: 255,
    callTypes: [],
    includeCallStatuses: [],
    includeCallStatusLogic: '或',
    includeTags: [],
    includeTagLogic: '或',
    excludeTags: [],
    excludeTagLogic: '或',
    durationOperator: '',
    durationSeconds: '',
    durationLogic: '且',
    hasIntentDealer: '',
    dispatchTarget: '',
    updateSmartCode: '',
    updateLeadStatus: '',
    abnormalReason: '',
    updateIntentLevel: '',
    enabled: true
  };
}

function renderLeadDispatchOptionList(options, selectedValue = '', emptyText = '不更新') {
  const selected = selectedValue || '';
  const list = options.includes(selected) ? options : [...options, selected];
  return list.map(value => `
    <option value="${escapeAttr(value)}" ${value === selected ? 'selected' : ''}>${value || emptyText}</option>
  `).join('');
}

function getManagedDictionaryOptionNames(dictionaryCode, fallbackOptions = []) {
  if (typeof DICTIONARY_ITEMS !== 'undefined' && Array.isArray(DICTIONARY_ITEMS[dictionaryCode])) {
    return DICTIONARY_ITEMS[dictionaryCode]
      .filter(item => item.status === '启用')
      .sort((a, b) => a.order - b.order)
      .map(item => item.name);
  }
  return fallbackOptions.filter(Boolean);
}

function getLeadDispatchAbnormalReasonOptions(leadStatus = '', currentReason = '') {
  if (isLeadStatusAbnormalReasonLocked(leadStatus || '')) return [''];
  const fallbackOptions = leadDispatchAbnormalReasonMap[leadStatus || ''] || [''];
  const dictionaryItems = typeof DICTIONARY_ITEMS !== 'undefined' && Array.isArray(DICTIONARY_ITEMS.ABNORMAL_REASON)
    ? DICTIONARY_ITEMS.ABNORMAL_REASON
    : null;
  const baseOptions = dictionaryItems
    ? dictionaryItems
      .filter(item => item.status === '启用' && typeof getAbnormalReasonApplicableLeadStatuses === 'function' && getAbnormalReasonApplicableLeadStatuses(item).includes(leadStatus))
      .sort((a, b) => a.order - b.order)
      .map(item => item.name)
    : fallbackOptions.filter(Boolean);
  if (!currentReason) return baseOptions;
  return baseOptions.includes(currentReason) ? baseOptions : [...baseOptions, currentReason];
}

function shouldShowLeadDispatchAbnormalReason(leadStatus = '') {
  return true;
}

function isLeadStatusAbnormalReasonLocked(leadStatus = '') {
  return ['总部_高意向', '总部_暂败', '总部_阶段性战败', '总部_异地'].includes(leadStatus || '');
}

function getLeadStatusLockedAbnormalReason(leadStatus = '', currentValue = '') {
  return isLeadStatusAbnormalReasonLocked(leadStatus || '') ? '' : currentValue;
}

function getSelectedLeadDispatchAbnormalReason(leadStatus = '', currentValue = '') {
  if (isLeadStatusAbnormalReasonLocked(leadStatus || '')) return '';
  const options = getLeadDispatchAbnormalReasonOptions(leadStatus || '', currentValue || '');
  if (currentValue && options.includes(currentValue)) return currentValue;
  return '';
}

function hasLeadDispatchAbnormalReasons(leadStatus = '') {
  return (leadDispatchAbnormalReasonMap[leadStatus || ''] || []).some(Boolean);
}

function isLeadStatusIntentLevelLocked(statusValue = '') {
  return Object.prototype.hasOwnProperty.call(leadStatusIntentLevelMap, statusValue || '');
}

function getLeadDispatchIntentLevelOptions(statusValue = '', currentValue = '') {
  const managedOptions = getManagedDictionaryOptionNames('INTENT_LEVEL', leadDispatchIntentLevelOptions);
  const baseOptions = (statusValue || '') === '总部_高意向'
    ? managedOptions.filter(item => highIntentLevelOptions.includes(item))
    : managedOptions;
  if (!currentValue || baseOptions.includes(currentValue)) return baseOptions;
  return [...baseOptions, currentValue];
}

function getLeadStatusLockedIntentLevel(statusValue = '', currentValue = '') {
  if (isLeadStatusIntentLevelLocked(statusValue)) return leadStatusIntentLevelMap[statusValue || ''];
  const options = getLeadDispatchIntentLevelOptions(statusValue || '', currentValue || '');
  if (currentValue && options.includes(currentValue)) return currentValue;
  return '';
}

function isLeadDispatchIntentLevelValid(statusValue = '', intentLevel = '') {
  if (isLeadStatusIntentLevelLocked(statusValue || '')) return intentLevel === leadStatusIntentLevelMap[statusValue || ''];
  if ((statusValue || '') === '总部_高意向') return highIntentLevelOptions.includes(intentLevel || '');
  return true;
}

function isLeadDispatchIntentLevelRequired(statusValue = '') {
  return !isLeadStatusIntentLevelLocked(statusValue || '') || leadStatusIntentLevelMap[statusValue || ''] !== '';
}

function syncIntentLevelByLeadStatus(statusValue, intentLevelSelectId) {
  const intentLevelSelect = document.getElementById(intentLevelSelectId);
  if (!intentLevelSelect) return;
  const locked = isLeadStatusIntentLevelLocked(statusValue || '');
  const disabled = !statusValue || locked;
  intentLevelSelect.disabled = disabled;
  const currentValue = intentLevelSelect.value || '';
  const options = getLeadDispatchIntentLevelOptions(statusValue || '', currentValue);
  const selected = getLeadStatusLockedIntentLevel(statusValue || '', currentValue);
  intentLevelSelect.innerHTML = renderLeadDispatchOptionList(options, selected, !statusValue ? '请选择意向级别' : (locked ? '不更新' : '请选择意向级别'));
}

function updateLeadDispatchAbnormalReasonOptions() {
  const statusSelect = document.getElementById('dispatchFormLeadStatus');
  const reasonSelect = document.getElementById('dispatchFormAbnormalReason');
  if (!statusSelect || !reasonSelect) return;
  const reasonGroup = document.getElementById('dispatchFormAbnormalReasonGroup');
  const currentValue = reasonSelect.value;
  const statusValue = statusSelect.value || '';
  const shouldShowReason = shouldShowLeadDispatchAbnormalReason(statusValue);
  if (reasonGroup) reasonGroup.style.display = shouldShowReason ? '' : 'none';
  const isReasonLocked = !statusValue || isLeadStatusAbnormalReasonLocked(statusValue);
  reasonSelect.disabled = isReasonLocked;
  const options = getLeadDispatchAbnormalReasonOptions(statusValue, currentValue);
  reasonSelect.innerHTML = renderLeadDispatchOptionList(options, getSelectedLeadDispatchAbnormalReason(statusValue, options.includes(currentValue) ? currentValue : ''), !statusValue ? '请选择异常原因' : (isLeadStatusAbnormalReasonLocked(statusValue) ? '不更新' : '请选择异常原因'));
  if (!shouldShowReason) reasonSelect.value = '';
  syncIntentLevelByLeadStatus(statusValue, 'dispatchFormIntentLevel');
}

function getLeadDispatchTagDictionaryOptions() {
  if (typeof DICTIONARY_ITEMS !== 'undefined' && Array.isArray(DICTIONARY_ITEMS.OUTBOUND_TAG)) {
    return DICTIONARY_ITEMS.OUTBOUND_TAG
      .filter(item => item.status === '启用')
      .sort((a, b) => a.order - b.order)
      .map(item => item.name);
  }
  return leadDispatchTagOptions;
}

function renderLeadDispatchTagPicker(kind, inputName, selectedTags = [], placeholder = '请选择外呼标签') {
  const safeSelected = selectedTags || [];
  const tagOptions = getLeadDispatchTagDictionaryOptions();
  return `
    <div class="tag-picker dispatch-tag-picker" data-kind="${kind}">
      <button class="tag-picker-trigger placeholder" id="dispatch${kind}TagTrigger" type="button" onclick="toggleLeadDispatchTagPicker('${kind}')">${placeholder}</button>
      <div class="tag-picker-panel" id="dispatch${kind}TagPanel">
        <div class="tag-picker-toolbar">
          <span id="dispatch${kind}TagCount">已选 0 / ${tagOptions.length}</span>
          <div class="tag-picker-actions">
            <button class="tag-picker-action" type="button" onclick="selectAllLeadDispatchTags('${kind}')">全选</button>
            <button class="tag-picker-action" type="button" onclick="clearLeadDispatchTags('${kind}')">清空</button>
          </div>
        </div>
        <div class="tag-picker-search">
          <input type="search" placeholder="搜索${kind === 'Include' ? '包含' : '不包含'}标签" oninput="filterTagPickerOptions('dispatch${kind}TagPanel', this.value)" />
        </div>
        <div class="tag-picker-list">
          ${tagOptions.map(tag => `
            <label class="tag-option">
              <input type="checkbox" name="${inputName}" value="${escapeAttr(tag)}" ${safeSelected.includes(tag) ? 'checked' : ''} onchange="toggleLeadDispatchTagOption(this, '${kind}')" />
              ${tag}
            </label>
          `).join('')}
        </div>
        <div class="tag-picker-empty">暂无匹配标签</div>
      </div>
    </div>
  `;
}

function renderLeadDispatchCallStatusPicker(selectedStatuses = []) {
  const safeSelected = selectedStatuses || [];
  return `
    <div class="tag-picker dispatch-tag-picker">
      <button class="tag-picker-trigger placeholder" id="dispatchCallStatusTrigger" type="button" onclick="toggleLeadDispatchCallStatusPicker()">请选择通话状态</button>
      <div class="tag-picker-panel" id="dispatchCallStatusPanel">
        <div class="tag-picker-toolbar">
          <span id="dispatchCallStatusCount">已选 0 / ${leadDispatchCallStatusOptions.length}</span>
          <div class="tag-picker-actions">
            <button class="tag-picker-action" type="button" onclick="selectAllLeadDispatchCallStatuses()">全选</button>
            <button class="tag-picker-action" type="button" onclick="clearLeadDispatchCallStatuses()">清空</button>
          </div>
        </div>
        <div class="tag-picker-list">
          ${leadDispatchCallStatusOptions.map(status => `
            <label class="tag-option">
              <input type="checkbox" name="dispatchCallStatus" value="${escapeAttr(status)}" ${safeSelected.includes(status) ? 'checked' : ''} onchange="toggleLeadDispatchCallStatusOption(this)" />
              ${status}
            </label>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderLeadDispatchTagLogic(kind, selectId, value = '或') {
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
        <button type="button" class="condition-btn ${isAnd ? 'active' : ''}" id="dispatch${kind}And" onclick="setLeadDispatchTagLogic('${kind}', '且')">且 (AND)</button>
        <button type="button" class="condition-btn ${!isAnd ? 'active' : ''}" id="dispatch${kind}Or" onclick="setLeadDispatchTagLogic('${kind}', '或')">或 (OR)</button>
      </div>
      <span class="condition-desc" id="dispatch${kind}Desc">${desc}</span>
    </div>
  `;
}

function renderLeadDispatchCallStatusLogic(value = '或') {
  const isAnd = value === '且';
  return `
    <select class="form-input" id="dispatchFormCallStatusLogic" style="display:none">
      <option value="且" ${isAnd ? 'selected' : ''}>且</option>
      <option value="或" ${!isAnd ? 'selected' : ''}>或</option>
    </select>
    <div class="condition-row">
      <span class="condition-label">状态判断条件：</span>
      <div class="condition-toggle">
        <button type="button" class="condition-btn ${isAnd ? 'active' : ''}" id="dispatchCallStatusAnd" onclick="setLeadDispatchCallStatusLogic('且')">且 (AND)</button>
        <button type="button" class="condition-btn ${!isAnd ? 'active' : ''}" id="dispatchCallStatusOr" onclick="setLeadDispatchCallStatusLogic('或')">或 (OR)</button>
      </div>
      <span class="condition-desc" id="dispatchCallStatusDesc">${isAnd ? '命中所有已选通话状态才触发规则' : '命中任意一个已选通话状态即触发规则'}</span>
    </div>
  `;
}

function renderLeadDispatchDurationLogic(value = '且') {
  const isAnd = value === '且';
  return `
    <select class="form-input" id="dispatchFormDurationLogic" style="display:none">
      <option value="且" ${isAnd ? 'selected' : ''}>且</option>
      <option value="或" ${!isAnd ? 'selected' : ''}>或</option>
    </select>
    <div class="condition-row">
      <span class="condition-label">时长判断条件：</span>
      <div class="condition-toggle">
        <button type="button" class="condition-btn ${isAnd ? 'active' : ''}" id="dispatchDurationAnd" onclick="setLeadDispatchDurationLogic('且')">且 (AND)</button>
        <button type="button" class="condition-btn ${!isAnd ? 'active' : ''}" id="dispatchDurationOr" onclick="setLeadDispatchDurationLogic('或')">或 (OR)</button>
      </div>
      <span class="condition-desc" id="dispatchDurationDesc">${isAnd ? '与前置条件执行“且”运算' : '与前置条件执行“或”运算'}</span>
    </div>
  `;
}

function setLeadDispatchDurationLogic(value) {
  const select = document.getElementById('dispatchFormDurationLogic');
  if (select) select.value = value;
  document.getElementById('dispatchDurationAnd')?.classList.toggle('active', value === '且');
  document.getElementById('dispatchDurationOr')?.classList.toggle('active', value === '或');
  const desc = document.getElementById('dispatchDurationDesc');
  if (desc) desc.textContent = value === '且' ? '与前置条件执行“且”运算' : '与前置条件执行“或”运算';
}

function getLeadDispatchCallStatusInputs() {
  return getTagPickerInputs('dispatchCallStatusPanel');
}

function toggleLeadDispatchCallStatusPicker() {
  toggleExclusivePanel('dispatchCallStatusPanel');
}

function updateLeadDispatchCallStatusPickerSummary() {
  updateMultiSelectPickerSummary({
    panelId: 'dispatchCallStatusPanel',
    triggerId: 'dispatchCallStatusTrigger',
    countId: 'dispatchCallStatusCount',
    placeholder: '请选择通话状态'
  });
}

function toggleLeadDispatchCallStatusOption(input) {
  togglePickerOption(input, updateLeadDispatchCallStatusPickerSummary);
}

function selectAllLeadDispatchCallStatuses() {
  setPickerInputsChecked(getLeadDispatchCallStatusInputs(), true, updateLeadDispatchCallStatusPickerSummary);
}

function clearLeadDispatchCallStatuses() {
  setPickerInputsChecked(getLeadDispatchCallStatusInputs(), false, updateLeadDispatchCallStatusPickerSummary);
}

function setLeadDispatchCallStatusLogic(value) {
  const select = document.querySelector('#dispatchFormCallStatusLogic');
  if (select) select.value = value;
  document.getElementById('dispatchCallStatusAnd')?.classList.toggle('active', value === '且');
  document.getElementById('dispatchCallStatusOr')?.classList.toggle('active', value === '或');
  const desc = document.getElementById('dispatchCallStatusDesc');
  if (desc) desc.textContent = value === '且' ? '命中所有已选通话状态才触发规则' : '命中任意一个已选通话状态即触发规则';
}

function getLeadDispatchTagPickerInputs(kind) {
  return getTagPickerInputs(`dispatch${kind}TagPanel`);
}

function toggleLeadDispatchTagPicker(kind) {
  toggleExclusivePanel(`dispatch${kind}TagPanel`);
}

function updateLeadDispatchTagPickerSummary(kind) {
  updateMultiSelectPickerSummary({
    panelId: `dispatch${kind}TagPanel`,
    triggerId: `dispatch${kind}TagTrigger`,
    countId: `dispatch${kind}TagCount`,
    placeholder: kind === 'Include' ? '请选择包含标签' : '请选择不包含标签'
  });
}

function toggleLeadDispatchTagOption(input, kind) {
  togglePickerOption(input, () => updateLeadDispatchTagPickerSummary(kind));
}

function selectAllLeadDispatchTags(kind) {
  setPickerInputsChecked(getVisibleTagPickerInputs(`dispatch${kind}TagPanel`), true, () => updateLeadDispatchTagPickerSummary(kind));
}

function clearLeadDispatchTags(kind) {
  setPickerInputsChecked(getLeadDispatchTagPickerInputs(kind), false, () => updateLeadDispatchTagPickerSummary(kind));
}

function setLeadDispatchTagLogic(kind, value) {
  const selectId = kind === 'Include' ? 'dispatchFormIncludeLogic' : 'dispatchFormExcludeLogic';
  const select = document.querySelector(`#${selectId}`);
  if (select) select.value = value;
  document.getElementById(`dispatch${kind}And`)?.classList.toggle('active', value === '且');
  document.getElementById(`dispatch${kind}Or`)?.classList.toggle('active', value === '或');
  const desc = document.getElementById(`dispatch${kind}Desc`);
  if (!desc) return;
  if (kind === 'Include') {
    desc.textContent = value === '且' ? '命中所有已选标签才触发规则' : '命中任意一个已选标签即触发规则';
  } else {
    desc.textContent = value === '且' ? '同时命中全部排除标签才排除' : '命中任意一个排除标签即排除';
  }
}

function renderLeadDispatchRuleForm(rule) {
  return `
    <div class="dispatch-rule-form">
      <section class="dispatch-form-section">
        <div class="dispatch-section-title">基础信息</div>
        <div class="dispatch-form-grid">
          <div class="form-group wide">
            <div class="form-label">配置名称 <span class="required">*</span></div>
            <input class="form-input" id="dispatchFormName" value="${escapeAttr(rule.name || '')}" placeholder="例：NEV线索高意向有店下发" />
          </div>
          <div class="form-group">
            <div class="form-label">权重 <span class="required">*</span></div>
            <input class="form-input" id="dispatchFormPriority" type="number" min="1" max="255" value="${escapeAttr(rule.priority || 255)}" />
            <div class="series-form-hint">数字越小优先级越高，命中多条规则时优先按权重判断</div>
          </div>
          <div class="form-group">
            <div class="form-label">状态</div>
            <select class="form-input" id="dispatchFormStatus">
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
            ${renderCallTypeTagPicker({ idPrefix: 'leadDispatchCallType', inputName: 'dispatchCallType', options: unifiedPolicyCallTypeOptions, selected: rule.callTypes || [] })}
          </div>
          <div class="form-group">
            <div class="form-label">通话状态</div>
            ${renderLeadDispatchCallStatusPicker(rule.includeCallStatuses || [])}
            ${renderLeadDispatchCallStatusLogic(rule.includeCallStatusLogic || '或')}
            <div class="series-form-hint">不选择表示不限制通话状态</div>
          </div>
          <div class="form-group">
            <div class="form-label">通话时长</div>
            <div class="date-range" style="margin-bottom: 8px; grid-template-columns: 1fr 1fr;">
              <select class="lead-select" id="dispatchFormDurationOperator">
                <option value="" ${!rule.durationOperator ? 'selected' : ''}>不限制</option>
                <option value="大于等于" ${rule.durationOperator === '大于等于' ? 'selected' : ''}>大于等于</option>
                <option value="小于" ${rule.durationOperator === '小于' ? 'selected' : ''}>小于</option>
              </select>
              <input class="lead-input" id="dispatchFormDurationSeconds" type="number" min="0" value="${escapeAttr(rule.durationSeconds || '')}" placeholder="秒数" style="flex: 1;" />
            </div>
            ${renderLeadDispatchDurationLogic(rule.durationLogic || '且')}
          </div>
          <div class="form-group">
            <div class="form-label">包含标签 <span class="required">*</span></div>
            ${renderLeadDispatchTagPicker('Include', 'dispatchIncludeTag', rule.includeTags || [], '请选择包含标签')}
            ${renderLeadDispatchTagLogic('Include', 'dispatchFormIncludeLogic', rule.includeTagLogic || '或')}
          </div>
          <div class="form-group">
            <div class="form-label">不包含标签</div>
            ${renderLeadDispatchTagPicker('Exclude', 'dispatchExcludeTag', rule.excludeTags || [], '请选择不包含标签')}
            ${renderLeadDispatchTagLogic('Exclude', 'dispatchFormExcludeLogic', rule.excludeTagLogic || '或')}
          </div>
          <div class="form-group wide">
            <div class="form-label">意向专营店 <span class="required">*</span></div>
            <select class="form-input" id="dispatchFormHasDealer">
              <option value="" ${!rule.hasIntentDealer ? 'selected' : ''}>请选择</option>
              <option value="有" ${rule.hasIntentDealer === '有' ? 'selected' : ''}>有</option>
              <option value="无" ${rule.hasIntentDealer === '无' ? 'selected' : ''}>无</option>
            </select>
          </div>
        </div>
      </section>

      <section class="dispatch-form-section">
        <div class="dispatch-section-title">执行动作</div>
        <div class="dispatch-action-card">
          <div class="dispatch-form-grid">
            <div class="form-group">
              <div class="form-label">线索是否下发 <span class="required">*</span></div>
              <select class="form-input" id="dispatchFormTarget">
                <option value="">请选择</option>
                <option value="下发到NEV线索中台" ${rule.dispatchTarget === '下发到NEV线索中台' ? 'selected' : ''}>下发到NEV线索中台</option>
                <option value="下发到总部培育客服" ${rule.dispatchTarget === '下发到总部培育客服' ? 'selected' : ''}>下发到总部培育客服</option>
                <option value="线索不下发" ${rule.dispatchTarget === '线索不下发' ? 'selected' : ''}>线索不下发</option>
              </select>
            </div>
            <div class="form-group">
              <div class="form-label">SmartCode</div>
              <input class="form-input" id="dispatchFormSmartCode" value="${escapeAttr(rule.updateSmartCode || '')}" placeholder="不填写表示不更新" />
            </div>
            <div class="form-group">
              <div class="form-label">线索状态 <span class="required">*</span></div>
              <select class="form-input" id="dispatchFormLeadStatus" onchange="updateLeadDispatchAbnormalReasonOptions()">
                ${renderLeadDispatchOptionList(leadDispatchFormLeadStatusOptions, rule.updateLeadStatus || '', '不更新')}
              </select>
            </div>
            <div class="form-group" id="dispatchFormAbnormalReasonGroup" style="${shouldShowLeadDispatchAbnormalReason(rule.updateLeadStatus || '') ? '' : 'display:none'}">
              <div class="form-label">异常原因 <span class="required">*</span></div>
              <select class="form-input" id="dispatchFormAbnormalReason" ${(!rule.updateLeadStatus || isLeadStatusAbnormalReasonLocked(rule.updateLeadStatus || '')) ? 'disabled' : ''}>
                ${renderLeadDispatchOptionList(getLeadDispatchAbnormalReasonOptions(rule.updateLeadStatus || '', rule.abnormalReason || ''), getSelectedLeadDispatchAbnormalReason(rule.updateLeadStatus || '', rule.abnormalReason || ''), !rule.updateLeadStatus ? '请选择异常原因' : (isLeadStatusAbnormalReasonLocked(rule.updateLeadStatus || '') ? '不更新' : '请选择异常原因'))}
              </select>
            </div>
            <div class="form-group wide">
              <div class="form-label">意向级别 <span class="required">*</span></div>
              <select class="form-input" id="dispatchFormIntentLevel" ${(!rule.updateLeadStatus || isLeadStatusIntentLevelLocked(rule.updateLeadStatus || '')) ? 'disabled' : ''}>
                ${renderLeadDispatchOptionList(getLeadDispatchIntentLevelOptions(rule.updateLeadStatus || '', rule.updateIntentLevel || ''), getLeadStatusLockedIntentLevel(rule.updateLeadStatus || '', rule.updateIntentLevel || ''), !rule.updateLeadStatus ? '请选择意向级别' : (isLeadStatusIntentLevelLocked(rule.updateLeadStatus || '') ? '不更新' : '请选择意向级别'))}
              </select>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}
function renderLeadDispatchRuleDetail(rule) {
  if (!rule) return renderEmptySnapshot('未找到规则');
  const sections = [
    {
      title: '基础信息',
      fields: [
        ['配置名称', rule.name],
        ['权重', `P${rule.priority}`],
        ['状态', rule.enabled ? '启用' : '停用']
      ]
    },
    {
      title: '命中条件',
      fields: [
        ['外呼类型', rule.callTypes.join('、')],
        ['通话状态', `${rule.includeCallStatusLogic || '或'}：${(rule.includeCallStatuses || []).join('、') || '不限'}`],
        ['包含标签', `${rule.includeTagLogic || '或'}：${(rule.includeTags || []).join('、') || '—'}`],
        ['不包含标签', `${rule.excludeTagLogic || '或'}：${(rule.excludeTags || []).join('、') || '—'}`],
        ['通话时长', rule.durationOperator ? `${rule.durationLogic || '且'} ${rule.durationOperator}${rule.durationSeconds}秒` : '不限制'],
        ['意向专营店', rule.hasIntentDealer || '不限']
      ]
    },
    {
      title: '执行动作',
      fields: [
        ['线索是否下发', rule.dispatchTarget],
        ['SmartCode', rule.updateSmartCode || '不更新'],
        ['线索状态', rule.updateLeadStatus || '不更新'],
        ['异常原因', rule.abnormalReason || '不更新'],
        ['意向级别', rule.updateIntentLevel || '不更新']
      ]
    }
  ];
  return `
    <div class="rule-detail-layout">
      ${sections.map(section => `
        <section class="rule-detail-section">
          <div class="rule-detail-title">${section.title}</div>
          <div class="rule-detail-body">
            ${section.fields.map(([label, value]) => `
              <div class="rule-detail-field">
                <div class="rule-detail-label">${label}</div>
                <div class="rule-detail-value">${detailValue(value)}</div>
              </div>
            `).join('')}
          </div>
        </section>
      `).join('')}
    </div>
  `;
}

function collectCheckedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(input => input.value);
}

function saveLeadDispatchRule() {
  const name = document.getElementById('dispatchFormName').value.trim();
  const callTypes = collectCheckedValues('dispatchCallType');
  if (!name) { showToast('请填写配置名称', false); return; }
  if (!callTypes.length) { showToast('请选择外呼类型', false); return; }
  const durationOperator = document.getElementById('dispatchFormDurationOperator').value;
  const durationSeconds = document.getElementById('dispatchFormDurationSeconds').value.trim();
  if (durationOperator && !durationSeconds) { showToast('请填写通话时长秒数', false); return; }
  const payload = {
    name,
    priority: Math.min(255, Math.max(1, parseInt(document.getElementById('dispatchFormPriority').value, 10) || 255)),
    callTypes,
    includeCallStatuses: collectCheckedValues('dispatchCallStatus'),
    includeCallStatusLogic: document.querySelector('#dispatchFormCallStatusLogic').value,
    includeTags: collectCheckedValues('dispatchIncludeTag'),
    includeTagLogic: document.querySelector('#dispatchFormIncludeLogic').value,
    excludeTags: collectCheckedValues('dispatchExcludeTag'),
    excludeTagLogic: document.querySelector('#dispatchFormExcludeLogic').value,
    durationOperator,
    durationSeconds: durationSeconds ? Number(durationSeconds) : '',
    durationLogic: document.getElementById('dispatchFormDurationLogic').value,
    hasIntentDealer: document.getElementById('dispatchFormHasDealer').value,
    dispatchTarget: document.getElementById('dispatchFormTarget').value,
    updateSmartCode: document.getElementById('dispatchFormSmartCode').value.trim(),
    updateLeadStatus: document.getElementById('dispatchFormLeadStatus').value.trim(),
    abnormalReason: getLeadStatusLockedAbnormalReason(document.getElementById('dispatchFormLeadStatus').value.trim(), document.getElementById('dispatchFormAbnormalReason').value.trim()),
    updateIntentLevel: getLeadStatusLockedIntentLevel(document.getElementById('dispatchFormLeadStatus').value.trim(), document.getElementById('dispatchFormIntentLevel').value.trim()),
    enabled: (document.getElementById('dispatchFormStatus')?.value || '启用') === '启用'
  };
  if (!payload.includeTags.length) { showToast('请选择包含标签', false); return; }
  if (!payload.hasIntentDealer) { showToast('请选择意向专营店', false); return; }
  if (!payload.dispatchTarget) { showToast('请选择线索是否下发', false); return; }
  if (!payload.updateLeadStatus) { showToast('请选择线索状态', false); return; }
  if (!isLeadStatusAbnormalReasonLocked(payload.updateLeadStatus) && hasLeadDispatchAbnormalReasons(payload.updateLeadStatus) && !payload.abnormalReason) { showToast('请选择异常原因', false); return; }
  if (isLeadDispatchIntentLevelRequired(payload.updateLeadStatus) && !payload.updateIntentLevel) { showToast('请选择意向级别', false); return; }
  if (!isLeadDispatchIntentLevelValid(payload.updateLeadStatus, payload.updateIntentLevel)) { showToast('请选择有效的意向级别', false); return; }
  if (editingLeadDispatchRuleId) {
    const index = leadDispatchRules.findIndex(rule => rule.id === editingLeadDispatchRuleId);
    if (index > -1) leadDispatchRules[index] = { ...leadDispatchRules[index], ...payload };
    showToast('线索下发规则已更新', true);
  } else {
    leadDispatchRules.push({ id: leadDispatchNextId++, ...payload });
    showToast('线索下发规则已创建', true);
  }
  closeModal('leadDispatchRuleModal');
  renderLeadDispatchConfigPage();
}

function deleteLeadDispatchRule(id) {
  const rule = leadDispatchRules.find(item => item.id === id);
  if (!rule) return;
  if (!confirm(`确认删除线索下发规则「${rule.name}」？`)) return;
  leadDispatchRules = leadDispatchRules.filter(item => item.id !== id);
  showToast('线索下发规则已删除', true);
  renderLeadDispatchConfigPage();
}
