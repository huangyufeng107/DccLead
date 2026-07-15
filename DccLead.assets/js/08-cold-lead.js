// ===== Cold Lead Definition Config =====
let coldLeadDefinitionRules = [
  { id: 1, leadStatus: '总部_休眠未购', enabled: true, remark: '休眠未购进入门店冷线索池' },
  { id: 2, leadStatus: '总部_暂败', enabled: true, remark: '暂败进入门店冷线索池' },
  { id: 3, leadStatus: '总部_异地', enabled: true, remark: '异地进入门店冷线索池' }
];
let coldLeadDefinitionNextId = 4;
let editingColdLeadDefinitionId = null;
let coldLeadDefinitionCurrentPage = 1;
let coldLeadDefinitionPageSize = 10;

function renderColdLeadDefinitionPage() {
  const page = document.getElementById('coldLeadDefinitionPage');
  if (!page) return;
  page.innerHTML = `
    <div class="page-hero">
      <div>
        <div class="page-title">门店冷线索配置</div>
        <div class="page-desc">维护线索状态与门店冷线索的映射关系。通话状态配置或线索下发配置更新线索状态后，系统按此定义判断是否进入冷线索处理链路。</div>
      </div>
      ${renderColdLeadDefinitionSummary()}
    </div>
    <div class="filter-row">
      <span class="filter-label">线索状态：</span>
      <select class="filter-select" id="coldLeadStatusFilter" onchange="filterColdLeadDefinitionTable()">
        <option value="">全部</option>
        ${leadDispatchLeadStatusOptions.filter(Boolean).map(status => `<option value="${status}">${status}</option>`).join('')}
      </select>
      <span class="filter-label">状态：</span>
      <select class="filter-select" id="coldLeadEnabledFilter" onchange="filterColdLeadDefinitionTable()">
        <option value="">全部</option>
        <option value="启用">启用</option>
        <option value="停用">停用</option>
      </select>
      <button class="btn-secondary" type="button" onclick="resetColdLeadDefinitionFilters()">重置</button>
    </div>
    <div class="card">
      <div class="section-header">
        <div class="section-title">门店冷线索配置列表</div>
        <button class="btn-add strategy-add-btn" type="button" onclick="openColdLeadDefinitionModal('add')">新增配置</button>
      </div>
      <table class="data-table">
        <thead><tr><th style="width:70px">#</th><th>线索状态</th><th>备注</th><th style="width:80px">状态</th><th style="width:190px">操作</th></tr></thead>
        <tbody id="coldLeadDefinitionTableBody"></tbody>
      </table>
      <div class="pagination">
        <span id="coldLeadDefinitionPageInfo">共 0 条记录，当前第 1 / 1 页</span>
        <div class="pagination-btns">
          <select class="hit-page-size" id="coldLeadDefinitionPageSize" onchange="changeColdLeadDefinitionPageSize(this.value)">
            <option value="5">每页 5 条</option>
            <option value="10">每页 10 条</option>
            <option value="20">每页 20 条</option>
            <option value="50">每页 50 条</option>
          </select>
          <button class="page-btn" type="button" onclick="changeColdLeadDefinitionPage(-1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <select class="hit-page-size" id="coldLeadDefinitionPageSelect" onchange="selectColdLeadDefinitionPage(this.value)"></select>
          <button class="page-btn" type="button" onclick="changeColdLeadDefinitionPage(1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
    </div>
  `;
  renderColdLeadDefinitionTable();
}

function renderColdLeadDefinitionSummary() {
  const enabled = coldLeadDefinitionRules.filter(rule => rule.enabled).length;
  const items = [
    { label: '配置总数', value: coldLeadDefinitionRules.length },
    { label: '启用配置', value: enabled }
  ];
  return `<div class="summary-strip">${items.map(item => `<div class="summary-card"><div class="summary-label">${item.label}</div><div class="summary-value">${item.value}</div></div>`).join('')}</div>`;
}

function getFilteredColdLeadDefinitionRules() {
  const leadStatus = document.getElementById('coldLeadStatusFilter')?.value || '';
  const enabled = document.getElementById('coldLeadEnabledFilter')?.value || '';
  return coldLeadDefinitionRules
    .filter(rule => !leadStatus || rule.leadStatus === leadStatus)
    .filter(rule => !enabled || (enabled === '启用' ? rule.enabled : !rule.enabled));
}

function renderColdLeadDefinitionTable() {
  const body = document.getElementById('coldLeadDefinitionTableBody');
  if (!body) return;
  const rows = getFilteredColdLeadDefinitionRules();
  const totalPages = Math.max(1, Math.ceil(rows.length / coldLeadDefinitionPageSize));
  coldLeadDefinitionCurrentPage = Math.min(coldLeadDefinitionCurrentPage, totalPages);
  const start = (coldLeadDefinitionCurrentPage - 1) * coldLeadDefinitionPageSize;
  const pageRows = rows.slice(start, start + coldLeadDefinitionPageSize);
  const info = document.getElementById('coldLeadDefinitionPageInfo');
  if (info) info.textContent = `共 ${rows.length} 条记录，当前第 ${coldLeadDefinitionCurrentPage} / ${totalPages} 页`;
  const pageSelect = document.getElementById('coldLeadDefinitionPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, idx) => `<option value="${idx + 1}">第 ${idx + 1} 页</option>`).join('');
    pageSelect.value = String(coldLeadDefinitionCurrentPage);
  }
  const pageSizeSelect = document.getElementById('coldLeadDefinitionPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(coldLeadDefinitionPageSize);
  body.innerHTML = pageRows.length ? pageRows.map((rule, index) => `
    <tr>
      <td class="row-index">${start + index + 1}</td>
      <td><span class="policy-plain-text">${rule.leadStatus}</span></td>
      <td><span class="policy-plain-text">${rule.remark || '—'}</span></td>
      <td>${rule.enabled ? '<span class="col-status-on">● 启用</span>' : '<span class="col-status-off">● 停用</span>'}</td>
      <td><div class="action-btns"><button class="action-btn view" type="button" onclick="openColdLeadDefinitionModal('view', ${rule.id})">查看</button><button class="action-btn edit" type="button" onclick="openColdLeadDefinitionModal('edit', ${rule.id})">编辑</button><button class="action-btn delete" type="button" onclick="deleteColdLeadDefinition(${rule.id})">删除</button></div></td>
    </tr>
  `).join('') : '<tr><td colspan="5"><div class="empty-state">暂无匹配的门店冷线索配置</div></td></tr>';
}

function resetColdLeadDefinitionFilters() {
  ['coldLeadStatusFilter', 'coldLeadEnabledFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  coldLeadDefinitionCurrentPage = 1;
  renderColdLeadDefinitionTable();
}

function filterColdLeadDefinitionTable() {
  coldLeadDefinitionCurrentPage = 1;
  renderColdLeadDefinitionTable();
}

function changeColdLeadDefinitionPageSize(value) {
  coldLeadDefinitionPageSize = Number(value) || 10;
  coldLeadDefinitionCurrentPage = 1;
  renderColdLeadDefinitionTable();
}

function changeColdLeadDefinitionPage(dir) {
  const rows = getFilteredColdLeadDefinitionRules();
  const totalPages = Math.max(1, Math.ceil(rows.length / coldLeadDefinitionPageSize));
  coldLeadDefinitionCurrentPage = Math.max(1, Math.min(totalPages, coldLeadDefinitionCurrentPage + dir));
  renderColdLeadDefinitionTable();
}

function selectColdLeadDefinitionPage(value) {
  coldLeadDefinitionCurrentPage = Number(value) || 1;
  renderColdLeadDefinitionTable();
}

function openColdLeadDefinitionModal(mode, id = null) {
  setSharedRuleModalVisual('policy');
  editingColdLeadDefinitionId = mode === 'edit' ? id : null;
  const rule = id ? coldLeadDefinitionRules.find(item => item.id === id) : null;
  const target = rule || { leadStatus: '', enabled: true, remark: '' };
  const titleMap = { add: '新增门店冷线索配置', edit: '编辑门店冷线索配置', view: '查看门店冷线索配置' };
  document.getElementById('leadDispatchRuleModalTitle').textContent = titleMap[mode] || '门店冷线索配置';
  document.getElementById('leadDispatchRuleModalBody').innerHTML = mode === 'view' ? `
    <div class="rule-detail-layout"><section class="rule-detail-section"><div class="rule-detail-title">配置详情</div><div class="rule-detail-body">
      ${[['线索状态', target.leadStatus], ['状态', target.enabled ? '启用' : '停用'], ['备注', target.remark || '—']].map(([label, value]) => `<div class="rule-detail-field"><div class="rule-detail-label">${label}</div><div class="rule-detail-value">${value}</div></div>`).join('')}
    </div></section></div>
  ` : `
    <div class="dispatch-rule-form">
      <section class="dispatch-form-section"><div class="dispatch-section-title">基础信息</div><div class="dispatch-form-grid">
        <div class="form-group"><div class="form-label">线索状态 <span class="required">*</span></div><select class="form-input" id="coldLeadFormStatus">${renderLeadDispatchOptionList(leadDispatchLeadStatusOptions, target.leadStatus || '', '请选择线索状态')}</select></div>
        <div class="form-group"><div class="form-label">状态</div><select class="form-input" id="coldLeadFormEnabled"><option value="启用" ${target.enabled ? 'selected' : ''}>启用</option><option value="停用" ${!target.enabled ? 'selected' : ''}>停用</option></select></div>
        <div class="form-group wide"><div class="form-label">备注</div><textarea class="form-textarea" id="coldLeadFormRemark" placeholder="填写配置说明">${escapeHtml(target.remark || '')}</textarea></div>
      </div></section>
    </div>
  `;
  document.getElementById('leadDispatchRuleModalFooter').innerHTML = mode === 'view'
    ? `<button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">关闭</button>`
    : `<button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">取消</button><button class="btn-save" type="button" onclick="saveColdLeadDefinition()">保存</button>`;
  document.getElementById('leadDispatchRuleModal').classList.add('show');
}

function saveColdLeadDefinition() {
  const payload = {
    leadStatus: document.getElementById('coldLeadFormStatus').value.trim(),
    enabled: document.getElementById('coldLeadFormEnabled').value === '启用',
    remark: document.getElementById('coldLeadFormRemark').value.trim()
  };
  if (!payload.leadStatus) { showToast('请选择线索状态', false); return; }
  const duplicate = coldLeadDefinitionRules.find(rule => rule.leadStatus === payload.leadStatus && rule.id !== editingColdLeadDefinitionId);
  if (duplicate) { showToast('该线索状态已存在配置', false); return; }
  if (editingColdLeadDefinitionId) {
    const index = coldLeadDefinitionRules.findIndex(rule => rule.id === editingColdLeadDefinitionId);
    if (index > -1) coldLeadDefinitionRules[index] = { ...coldLeadDefinitionRules[index], ...payload };
    showToast('门店冷线索配置已更新', true);
  } else {
    coldLeadDefinitionRules.push({ id: coldLeadDefinitionNextId++, ...payload });
    showToast('门店冷线索配置已新增', true);
  }
  closeModal('leadDispatchRuleModal');
  renderColdLeadDefinitionPage();
}

function deleteColdLeadDefinition(id) {
  const rule = coldLeadDefinitionRules.find(item => item.id === id);
  if (!rule) return;
  if (!confirm(`确认删除门店冷线索配置「${rule.leadStatus}」？`)) return;
  coldLeadDefinitionRules = coldLeadDefinitionRules.filter(item => item.id !== id);
  showToast('门店冷线索配置已删除', true);
  renderColdLeadDefinitionPage();
}
