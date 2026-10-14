// ===== Call Status Policy Config =====
const callStatusPolicyCallTypeOptions = unifiedPolicyCallTypeOptions;
const callStatusPolicyDefaultStatusOptions = ['2-无人接听', '3-占线', '4-拒接', '5-空号', '6-关机', '7-停机', '8-欠费', '9-无法接通'];

function getCallStatusPolicyStatusOptions() {
  if (typeof DICTIONARY_ITEMS !== 'undefined' && Array.isArray(DICTIONARY_ITEMS.CALL_STATUS)) {
    return DICTIONARY_ITEMS.CALL_STATUS
      .filter(item => item.status === '启用')
      .sort((a, b) => a.order - b.order)
      .map(item => item.name);
  }
  return callStatusPolicyDefaultStatusOptions;
}
let callStatusPolicyRules = [
  { id: 1, name: '冷线索未接通阶段性战败', priority: 1, callTypes: ['一知-冷线索', '一知-冷线索（大模型）'], callStatuses: ['2-无人接听', '3-占线', '4-拒接', '5-空号', '6-关机', '7-停机', '8-欠费', '9-无法接通'], statusLogic: '或', updateLeadStatus: '总部_阶段性战败', abnormalReason: '', updateIntentLevel: 'N - N(阶段性战败)', enabled: true },
  { id: 2, name: '冰兰新线索休眠失联', priority: 2, callTypes: ['冰兰-新线索', '冰兰-保客'], callStatuses: ['2-无人接听', '9-无法接通'], statusLogic: '或', updateLeadStatus: '总部_休眠失联', abnormalReason: '三天四次无法接通', updateIntentLevel: 'L - L(休眠)', enabled: true },
  { id: 3, name: 'NEV新线索未接通休眠失联', priority: 3, callTypes: ['一知-大模型NEV新线索', '一知-保客'], callStatuses: ['2-无人接听', '3-占线', '4-拒接', '6-关机', '8-欠费', '9-无法接通'], statusLogic: '或', updateLeadStatus: '总部_休眠失联', abnormalReason: '三天四次无法接通', updateIntentLevel: 'L - L(休眠)', enabled: true },
  { id: 4, name: 'NEV新线索号码无效', priority: 4, callTypes: ['一知-大模型NEV新线索', '一知-保客'], callStatuses: ['5-空号', '7-停机'], statusLogic: '或', updateLeadStatus: '总部_无效', abnormalReason: '明确空号', updateIntentLevel: '', enabled: true }
];
let callStatusPolicyNextId = 5;
let editingCallStatusPolicyRuleId = null;
let callStatusPolicyCurrentPage = 1;
let callStatusPolicyPageSize = 10;

function renderCallStatusPolicyPage() {
  const page = document.getElementById('callStatusPolicyPage');
  if (!page) return;
  page.innerHTML = `
    <div class="page-hero">
      <div>
        <div class="page-title">通话状态配置</div>
        <div class="page-desc">按外呼类型和通话状态配置自动更新规则，话单回传后同步维护线索状态、异常原因与意向级别，作为线索下发配置和后续重推判断的前置状态口径。</div>
      </div>
      ${renderCallStatusPolicySummary()}
    </div>
    <div class="filter-row">
      <span class="filter-label">关键字：</span>
      <input class="lead-input" style="width:130px; margin-right: 12px;" id="callStatusPolicyKeywordFilter" placeholder="请输入" oninput="filterCallStatusPolicyTable()" />
      <span class="filter-label">外呼类型：</span>
      <select class="filter-select" id="callStatusPolicyCallTypeFilter" onchange="filterCallStatusPolicyTable()">
        <option value="">全部</option>
        ${callStatusPolicyCallTypeOptions.map(type => `<option value="${type}">${type}</option>`).join('')}
      </select>
      <span class="filter-label">通话状态：</span>
      <select class="filter-select" id="callStatusPolicyStatusFilter" onchange="filterCallStatusPolicyTable()">
        <option value="">全部</option>
        ${getCallStatusPolicyStatusOptions().map(status => `<option value="${status}">${status}</option>`).join('')}
      </select>

      <span class="filter-label">状态：</span>
      <select class="filter-select" id="callStatusPolicyEnabledFilter" onchange="filterCallStatusPolicyTable()">
        <option value="">全部</option>
        <option value="启用">启用</option>
        <option value="停用">停用</option>
      </select>
      <button class="btn-secondary" type="button" onclick="resetCallStatusPolicyFilters()">重置</button>
    </div>
    ${renderPolicyRuleNote('callStatusPolicyRuleNote', '<strong>规则执行口径：</strong>通话状态配置先于线索下发配置执行；命中后先更新线索状态、异常原因和意向级别，再进入门店冷线索配置和线索下发配置判断。')}
    <div class="card">
      <div class="section-header">
        <div class="section-title">通话状态配置列表</div>
        <button class="btn-add strategy-add-btn" type="button" onclick="openCallStatusPolicyModal('add')">新增配置</button>
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width:64px">权重</th>
            <th>配置名称</th>
            <th>外呼类型</th>
            <th>通话状态</th>
            <th>字段更新</th>
            <th style="width:80px">状态</th>
            <th style="width:190px">操作</th>
          </tr>
        </thead>
        <tbody id="callStatusPolicyTableBody"></tbody>
      </table>
      <div class="pagination">
        <span id="callStatusPolicyPageInfo">共 0 条记录，当前第 1 / 1 页</span>
        <div class="pagination-btns">
          <select class="hit-page-size" id="callStatusPolicyPageSize" onchange="changeCallStatusPolicyPageSize(this.value)">
            <option value="5">每页 5 条</option>
            <option value="10">每页 10 条</option>
            <option value="20">每页 20 条</option>
          </select>
          <button class="page-btn" type="button" onclick="changeCallStatusPolicyPage(-1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <select class="hit-page-size" id="callStatusPolicyPageSelect" onchange="selectCallStatusPolicyPage(this.value)"></select>
          <button class="page-btn" type="button" onclick="changeCallStatusPolicyPage(1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
    </div>
  `;
  renderCallStatusPolicyTable();
  schedulePolicyRuleNoteAutoHide('callStatusPolicyRuleNote');
}

function renderCallStatusPolicySummary() {
  const enabled = callStatusPolicyRules.filter(rule => rule.enabled).length;
  const callTypeCount = new Set(callStatusPolicyRules.flatMap(rule => rule.callTypes || [])).size;
  const statusCount = new Set(callStatusPolicyRules.flatMap(rule => rule.callStatuses || [])).size;
  const updateStatusCount = new Set(callStatusPolicyRules.map(rule => rule.updateLeadStatus).filter(Boolean)).size;
  const items = [
    { label: '规则总数', value: callStatusPolicyRules.length },
    { label: '启用规则', value: enabled },
    { label: '覆盖外呼类型', value: callTypeCount },
    { label: '覆盖通话状态', value: statusCount },
    { label: '更新状态', value: updateStatusCount }
  ];
  return `<div class="summary-strip">${items.map(item => `<div class="summary-card"><div class="summary-label">${item.label}</div><div class="summary-value">${item.value}</div></div>`).join('')}</div>`;
}

function getFilteredCallStatusPolicyRules() {
  const keyword = document.getElementById('callStatusPolicyKeywordFilter')?.value.trim().toLowerCase() || '';
  const callType = document.getElementById('callStatusPolicyCallTypeFilter')?.value || '';
  const callStatus = document.getElementById('callStatusPolicyStatusFilter')?.value || '';
  const enabled = document.getElementById('callStatusPolicyEnabledFilter')?.value || '';
  return callStatusPolicyRules
    .filter(rule => {
      if (!keyword) return true;
      const text = [
        rule.name,
        `CSP-${String(rule.id).padStart(3, '0')}`,
        (rule.callTypes || []).join(' '),
        (rule.callStatuses || []).join(' '),
        rule.updateLeadStatus,
        rule.abnormalReason,
        rule.updateIntentLevel
      ].filter(Boolean).join(' ').toLowerCase();
      return text.includes(keyword);
    })
    .filter(rule => !callType || rule.callTypes.includes(callType))
    .filter(rule => !callStatus || rule.callStatuses.includes(callStatus))
    .filter(rule => !enabled || (enabled === '启用' ? rule.enabled : !rule.enabled))
    .sort((a, b) => (Number(a.priority) || 99) - (Number(b.priority) || 99) || a.id - b.id);
}

function renderCallStatusPolicyTable() {
  const body = document.getElementById('callStatusPolicyTableBody');
  if (!body) return;
  const rows = getFilteredCallStatusPolicyRules();
  const totalPages = Math.max(1, Math.ceil(rows.length / callStatusPolicyPageSize));
  callStatusPolicyCurrentPage = Math.min(callStatusPolicyCurrentPage, totalPages);
  const start = (callStatusPolicyCurrentPage - 1) * callStatusPolicyPageSize;
  const pageRows = rows.slice(start, start + callStatusPolicyPageSize);
  document.getElementById('callStatusPolicyPageInfo').textContent = `共 ${rows.length} 条记录，当前第 ${callStatusPolicyCurrentPage} / ${totalPages} 页`;
  const pageSelect = document.getElementById('callStatusPolicyPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, idx) => `<option value="${idx + 1}">第 ${idx + 1} 页</option>`).join('');
    pageSelect.value = String(callStatusPolicyCurrentPage);
  }
  const pageSizeSelect = document.getElementById('callStatusPolicyPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(callStatusPolicyPageSize);
  body.innerHTML = pageRows.length ? pageRows.map(rule => `
    <tr>
      <td><span class="policy-plain-text">P${rule.priority}</span></td>
      <td><div class="rule-text-stack"><div class="rule-text-main">${rule.name}</div><div class="rule-muted">规则ID: CSP-${String(rule.id).padStart(3, '0')}</div></div></td>
      <td>${renderRuleChipList(rule.callTypes, 'blue', 2)}</td>
      <td><div class="rule-text-stack"><div>${rule.statusLogic || '或'}：${(rule.callStatuses || []).join('、') || '不限'}</div></div></td>
      <td>${renderCallStatusPolicyUpdateSummary(rule)}</td>
      <td>${rule.enabled ? '<span class="col-status-on">● 启用</span>' : '<span class="col-status-off">● 停用</span>'}</td>
      <td><div class="action-btns"><button class="action-btn view" type="button" onclick="openCallStatusPolicyModal('view', ${rule.id})">查看</button><button class="action-btn edit" type="button" onclick="openCallStatusPolicyModal('edit', ${rule.id})">编辑</button><button class="action-btn delete" type="button" onclick="deleteCallStatusPolicyRule(${rule.id})">删除</button></div></td>
    </tr>
  `).join('') : '<tr><td colspan="7"><div class="empty-state">暂无匹配的通话状态配置</div></td></tr>';
}

function renderCallStatusPolicyUpdateSummary(rule) {
  const items = [
    rule.updateLeadStatus ? `线索状态：${rule.updateLeadStatus}` : '',
    rule.abnormalReason ? `异常原因：${rule.abnormalReason}` : '',
    rule.updateIntentLevel ? `意向级别：${rule.updateIntentLevel}` : ''
  ].filter(Boolean);
  return `<div class="rule-text-stack">${items.length ? items.map(item => `<div>${item}</div>`).join('') : '<span class="rule-muted">不更新</span>'}</div>`;
}

function resetCallStatusPolicyFilters() {
  ['callStatusPolicyKeywordFilter', 'callStatusPolicyCallTypeFilter', 'callStatusPolicyStatusFilter', 'callStatusPolicyEnabledFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  callStatusPolicyCurrentPage = 1;
  renderCallStatusPolicyTable();
}

function filterCallStatusPolicyTable() {
  callStatusPolicyCurrentPage = 1;
  renderCallStatusPolicyTable();
}

function changeCallStatusPolicyPageSize(value) {
  callStatusPolicyPageSize = Number(value) || 10;
  callStatusPolicyCurrentPage = 1;
  renderCallStatusPolicyTable();
}

function changeCallStatusPolicyPage(dir) {
  const rows = getFilteredCallStatusPolicyRules();
  const totalPages = Math.max(1, Math.ceil(rows.length / callStatusPolicyPageSize));
  callStatusPolicyCurrentPage = Math.max(1, Math.min(totalPages, callStatusPolicyCurrentPage + dir));
  renderCallStatusPolicyTable();
}

function selectCallStatusPolicyPage(value) {
  callStatusPolicyCurrentPage = Number(value) || 1;
  renderCallStatusPolicyTable();
}

function getDefaultCallStatusPolicyRule() {
  return {
    name: '',
    priority: 255,
    callTypes: [],
    callStatuses: [],
    statusLogic: '或',
    updateLeadStatus: '',
    abnormalReason: '',
    updateIntentLevel: '',
    enabled: true
  };
}

function openCallStatusPolicyModal(mode, id = null) {
  setSharedRuleModalVisual('config');
  editingCallStatusPolicyRuleId = mode === 'edit' ? id : null;
  const rule = id ? callStatusPolicyRules.find(item => item.id === id) : null;
  const titleMap = { add: '新增通话状态配置', edit: '编辑通话状态配置', view: '查看通话状态配置' };
  document.getElementById('leadDispatchRuleModalTitle').textContent = titleMap[mode] || '通话状态配置';
  document.getElementById('leadDispatchRuleModalBody').innerHTML = mode === 'view'
    ? renderCallStatusPolicyDetail(rule)
    : renderCallStatusPolicyForm(rule || getDefaultCallStatusPolicyRule());
  document.getElementById('leadDispatchRuleModalFooter').innerHTML = mode === 'view'
    ? `<button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">关闭</button>`
    : `<button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">取消</button><button class="btn-save" type="button" onclick="saveCallStatusPolicyRule()">保存</button>`;
  document.getElementById('leadDispatchRuleModal').classList.add('show');
  if (mode !== 'view') {
    updateCallTypeTagPickerSummary('callStatusPolicyCallType');
    updateCallStatusPolicyCallStatusPickerSummary();
  }
}

function renderCallStatusPolicyCallStatusPicker(selectedStatuses = []) {
  const safeSelected = selectedStatuses || [];
  const statusOptions = getCallStatusPolicyStatusOptions();
  return `
    <div class="tag-picker dispatch-tag-picker">
      <button class="tag-picker-trigger placeholder" id="callStatusPolicyStatusTrigger" type="button" onclick="toggleCallStatusPolicyCallStatusPicker()">请选择通话状态</button>
      <div class="tag-picker-panel" id="callStatusPolicyStatusPanel">
        <div class="tag-picker-toolbar">
          <span id="callStatusPolicyStatusCount">已选 0 / ${statusOptions.length}</span>
          <div class="tag-picker-actions">
            <button class="tag-picker-action" type="button" onclick="selectAllCallStatusPolicyCallStatuses()">全选</button>
            <button class="tag-picker-action" type="button" onclick="clearCallStatusPolicyCallStatuses()">清空</button>
          </div>
        </div>
        <div class="tag-picker-list">
          ${statusOptions.map(status => `
            <label class="tag-option">
              <input type="checkbox" name="callStatusPolicyStatus" value="${escapeAttr(status)}" ${safeSelected.includes(status) ? 'checked' : ''} onchange="toggleCallStatusPolicyCallStatusOption(this)" />
              ${escapeHtml(status)}
            </label>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderCallStatusPolicyStatusLogic(value = '或') {
  const isAnd = value === '且';
  return `
    <select class="form-input" id="callStatusFormLogic" style="display:none">
      <option value="且" ${isAnd ? 'selected' : ''}>且</option>
      <option value="或" ${!isAnd ? 'selected' : ''}>或</option>
    </select>
    <div class="condition-row">
      <span class="condition-label">状态判断条件：</span>
      <div class="condition-toggle">
        <button type="button" class="condition-btn ${isAnd ? 'active' : ''}" id="callStatusPolicyStatusAnd" onclick="setCallStatusPolicyLogic('且')">且 (AND)</button>
        <button type="button" class="condition-btn ${!isAnd ? 'active' : ''}" id="callStatusPolicyStatusOr" onclick="setCallStatusPolicyLogic('或')">或 (OR)</button>
      </div>
      <span class="condition-desc" id="callStatusPolicyLogicDesc">${isAnd ? '命中所有已选通话状态才触发规则' : '命中任意一个已选通话状态即触发规则'}</span>
    </div>
  `;
}

function getCallStatusPolicyCallStatusInputs() {
  return getTagPickerInputs('callStatusPolicyStatusPanel');
}

function toggleCallStatusPolicyCallStatusPicker() {
  toggleExclusivePanel('callStatusPolicyStatusPanel');
}

function updateCallStatusPolicyCallStatusPickerSummary() {
  updateMultiSelectPickerSummary({
    panelId: 'callStatusPolicyStatusPanel',
    triggerId: 'callStatusPolicyStatusTrigger',
    countId: 'callStatusPolicyStatusCount',
    placeholder: '请选择通话状态'
  });
}

function toggleCallStatusPolicyCallStatusOption(input) {
  togglePickerOption(input, updateCallStatusPolicyCallStatusPickerSummary);
}

function selectAllCallStatusPolicyCallStatuses() {
  setPickerInputsChecked(getCallStatusPolicyCallStatusInputs(), true, updateCallStatusPolicyCallStatusPickerSummary);
}

function clearCallStatusPolicyCallStatuses() {
  setPickerInputsChecked(getCallStatusPolicyCallStatusInputs(), false, updateCallStatusPolicyCallStatusPickerSummary);
}

function renderCallStatusPolicyForm(rule) {
  return `
    <div class="dispatch-rule-form">
      <section class="dispatch-form-section">
        <div class="dispatch-section-title">基础信息</div>
        <div class="dispatch-form-grid">
          <div class="form-group wide"><div class="form-label">配置名称 <span class="required">*</span></div><input class="form-input" id="callStatusFormName" value="${escapeAttr(rule.name || '')}" placeholder="例：NEV新线索未接通休眠失联" /></div>
          <div class="form-group"><div class="form-label">权重 <span class="required">*</span></div><input class="form-input" id="callStatusFormPriority" type="number" min="1" max="255" value="${escapeAttr(rule.priority || 255)}" /><div class="series-form-hint">数字越小优先级越高，命中多条规则时优先按权重判断</div></div>
          <div class="form-group"><div class="form-label">状态</div><select class="form-input" id="callStatusFormEnabled"><option value="启用" ${rule.enabled ? 'selected' : ''}>启用</option><option value="停用" ${!rule.enabled ? 'selected' : ''}>停用</option></select></div>
        </div>
      </section>
      <section class="dispatch-form-section">
        <div class="dispatch-section-title">命中条件</div>
        <div class="dispatch-form-grid">
          <div class="form-group wide"><div class="form-label">外呼类型 <span class="required">*</span></div>${renderCallTypeTagPicker({ idPrefix: 'callStatusPolicyCallType', inputName: 'callStatusPolicyCallType', options: callStatusPolicyCallTypeOptions, selected: rule.callTypes || [] })}</div>
          <div class="form-group wide"><div class="form-label">通话状态 <span class="required">*</span></div>${renderCallStatusPolicyCallStatusPicker(rule.callStatuses || [])}${renderCallStatusPolicyStatusLogic(rule.statusLogic || '或')}</div>
        </div>
      </section>
      <section class="dispatch-form-section">
        <div class="dispatch-section-title">执行动作</div>
        <div class="dispatch-action-card">
          <div class="dispatch-form-grid">
            <div class="form-group"><div class="form-label">线索状态更新为 <span class="required">*</span></div><select class="form-input" id="callStatusFormLeadStatus" onchange="updateCallStatusPolicyReasonOptions()">${renderLeadDispatchOptionList(leadDispatchFormLeadStatusOptions, rule.updateLeadStatus || '', '请选择线索状态')}</select></div>
            <div class="form-group" id="callStatusFormAbnormalReasonGroup" style="${shouldShowLeadDispatchAbnormalReason(rule.updateLeadStatus || '') ? '' : 'display:none'}"><div class="form-label">异常原因更新为 <span class="required">*</span></div><select class="form-input" id="callStatusFormAbnormalReason" ${isLeadStatusAbnormalReasonLocked(rule.updateLeadStatus || '') ? 'disabled' : ''}>${renderLeadDispatchOptionList(getLeadDispatchAbnormalReasonOptions(rule.updateLeadStatus || '', rule.abnormalReason || ''), getSelectedLeadDispatchAbnormalReason(rule.updateLeadStatus || '', rule.abnormalReason || ''), isLeadStatusAbnormalReasonLocked(rule.updateLeadStatus || '') ? '不更新' : '请选择异常原因')}</select></div>
            <div class="form-group wide"><div class="form-label">意向级别 <span class="required">*</span></div><select class="form-input" id="callStatusFormIntentLevel" ${isLeadStatusIntentLevelLocked(rule.updateLeadStatus || '') ? 'disabled' : ''}>${renderLeadDispatchOptionList(getLeadDispatchIntentLevelOptions(rule.updateLeadStatus || '', rule.updateIntentLevel || ''), getLeadStatusLockedIntentLevel(rule.updateLeadStatus || '', rule.updateIntentLevel || ''), isLeadStatusIntentLevelLocked(rule.updateLeadStatus || '') ? '不更新' : '请选择意向级别')}</select></div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function setCallStatusPolicyLogic(value) {
  const select = document.getElementById('callStatusFormLogic');
  if (select) select.value = value;
  document.getElementById('callStatusPolicyStatusAnd')?.classList.toggle('active', value === '且');
  document.getElementById('callStatusPolicyStatusOr')?.classList.toggle('active', value !== '且');
  const desc = document.getElementById('callStatusPolicyLogicDesc');
  if (desc) desc.textContent = value === '且' ? '命中所有已选通话状态才触发规则' : '命中任意一个已选通话状态即触发规则';
}

function updateCallStatusPolicyReasonOptions() {
  const statusSelect = document.getElementById('callStatusFormLeadStatus');
  const reasonSelect = document.getElementById('callStatusFormAbnormalReason');
  if (!statusSelect || !reasonSelect) return;
  const reasonGroup = document.getElementById('callStatusFormAbnormalReasonGroup');
  const shouldShowReason = shouldShowLeadDispatchAbnormalReason(statusSelect.value || '');
  if (reasonGroup) reasonGroup.style.display = shouldShowReason ? '' : 'none';
  reasonSelect.disabled = isLeadStatusAbnormalReasonLocked(statusSelect.value || '');
  reasonSelect.innerHTML = renderLeadDispatchOptionList(getLeadDispatchAbnormalReasonOptions(statusSelect.value || '', ''), getSelectedLeadDispatchAbnormalReason(statusSelect.value || '', ''), isLeadStatusAbnormalReasonLocked(statusSelect.value || '') ? '不更新' : '请选择异常原因');
  if (!shouldShowReason) reasonSelect.value = '';
  syncIntentLevelByLeadStatus(statusSelect.value || '', 'callStatusFormIntentLevel');
}

function renderCallStatusPolicyDetail(rule) {
  if (!rule) return renderEmptySnapshot('未找到规则');
  const sections = [
    { title: '基础信息', fields: [['配置名称', rule.name], ['权重', `P${rule.priority}`], ['状态', rule.enabled ? '启用' : '停用']] },
    { title: '命中条件', fields: [['外呼类型', rule.callTypes.join('、')], ['通话状态', `${rule.statusLogic || '或'}：${rule.callStatuses.join('、')}`]] },
    { title: '执行动作', fields: [['线索状态更新为', rule.updateLeadStatus || '不更新'], ['异常原因更新为', rule.abnormalReason || '不更新'], ['意向级别', rule.updateIntentLevel || '不更新']] }
  ];
  return `<div class="rule-detail-layout">${sections.map(section => `<section class="rule-detail-section"><div class="rule-detail-title">${section.title}</div><div class="rule-detail-body">${section.fields.map(([label, value]) => `<div class="rule-detail-field"><div class="rule-detail-label">${label}</div><div class="rule-detail-value">${detailValue(value)}</div></div>`).join('')}</div></section>`).join('')}</div>`;
}

function saveCallStatusPolicyRule() {
  const payload = {
    name: document.getElementById('callStatusFormName').value.trim(),
    priority: Math.min(255, Math.max(1, parseInt(document.getElementById('callStatusFormPriority').value, 10) || 255)),
    callTypes: collectCheckedValues('callStatusPolicyCallType'),
    callStatuses: collectCheckedValues('callStatusPolicyStatus'),
    statusLogic: document.getElementById('callStatusFormLogic').value,
    updateLeadStatus: document.getElementById('callStatusFormLeadStatus').value.trim(),
    abnormalReason: getLeadStatusLockedAbnormalReason(document.getElementById('callStatusFormLeadStatus').value.trim(), document.getElementById('callStatusFormAbnormalReason').value.trim()),
    updateIntentLevel: getLeadStatusLockedIntentLevel(document.getElementById('callStatusFormLeadStatus').value.trim(), document.getElementById('callStatusFormIntentLevel').value.trim()),
    enabled: document.getElementById('callStatusFormEnabled').value === '启用'
  };
  if (!payload.name) { showToast('请填写配置名称', false); return; }
  if (!payload.callTypes.length) { showToast('请选择外呼类型', false); return; }
  if (!payload.callStatuses.length) { showToast('请选择通话状态', false); return; }
  if (!payload.updateLeadStatus) { showToast('请选择线索状态更新值', false); return; }
  if (!isLeadStatusAbnormalReasonLocked(payload.updateLeadStatus) && hasLeadDispatchAbnormalReasons(payload.updateLeadStatus) && !payload.abnormalReason) { showToast('请选择异常原因', false); return; }
  if (isLeadDispatchIntentLevelRequired(payload.updateLeadStatus) && !payload.updateIntentLevel) { showToast('请选择意向级别', false); return; }
  if (!isLeadDispatchIntentLevelValid(payload.updateLeadStatus, payload.updateIntentLevel)) { showToast('请选择有效的意向级别', false); return; }
  if (editingCallStatusPolicyRuleId) {
    const index = callStatusPolicyRules.findIndex(rule => rule.id === editingCallStatusPolicyRuleId);
    if (index > -1) callStatusPolicyRules[index] = { ...callStatusPolicyRules[index], ...payload };
    showToast('通话状态配置已更新', true);
  } else {
    callStatusPolicyRules.push({ id: callStatusPolicyNextId++, ...payload });
    showToast('通话状态配置已新增', true);
  }
  closeModal('leadDispatchRuleModal');
  renderCallStatusPolicyPage();
}

function deleteCallStatusPolicyRule(id) {
  const rule = callStatusPolicyRules.find(item => item.id === id);
  if (!rule) return;
  if (!confirm(`确认删除通话状态配置「${rule.name}」？`)) return;
  callStatusPolicyRules = callStatusPolicyRules.filter(item => item.id !== id);
  showToast('通话状态配置已删除', true);
  renderCallStatusPolicyPage();
}
