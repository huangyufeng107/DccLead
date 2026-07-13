// ===== Nurture Leads =====
function initNurtureLeadPage() {
  initNurtureLeadSelectors();
  const sortSelect = document.getElementById('leadSortField');
  if (sortSelect && sortSelect.options.length === 0) {
    sortSelect.innerHTML = nurtureLeadColumns
      .map(col => `<option value="${col.key}">${col.label}</option>`)
      .join('');
    sortSelect.value = nurtureLeadSortField;
    document.getElementById('leadSortDirection').value = nurtureLeadSortDirection;
  }
  renderLeadFieldPicker();
  renderNurtureLeadTable();
}

function initNurtureLeadSelectors() {
  fillSelect('leadSearchSeries', carSeriesOptions, '全部车系');
  fillSelect('leadSearchLatestSeries', carSeriesOptions, '全部车系');
  const provinces = [...new Set(dealerOptions.map(item => item.province))];
  fillSelect('leadSearchProvince', provinces, '选择省份');
  updateDealerCities();
}

function fillSelect(id, options, placeholder) {
  const select = document.getElementById(id);
  if (!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">${placeholder}</option>` + options.map(option => `<option value="${option}">${option}</option>`).join('');
  if (options.includes(current)) select.value = current;
}

function updateDealerCities() {
  const province = document.getElementById('leadSearchProvince').value;
  const cities = [...new Set(dealerOptions.filter(item => !province || item.province === province).map(item => item.city))];
  fillSelect('leadSearchCity', cities, '选择城市');
  renderDealerPicker();
}

function getVisibleDealers() {
  const province = document.getElementById('leadSearchProvince')?.value || '';
  const city = document.getElementById('leadSearchCity')?.value || '';
  const keyword = document.getElementById('leadDealerKeyword').value.trim().toLowerCase();
  return dealerOptions.filter(item => {
    if (province && item.province !== province) return false;
    if (city && item.city !== city) return false;
    if (!keyword) return true;
    return item.name.toLowerCase().includes(keyword) || item.code.toLowerCase().includes(keyword);
  });
}

function toggleDealerPicker() {
  document.getElementById('dealerPickerPanel').classList.toggle('show');
  renderDealerPicker();
}

function renderDealerPicker() {
  const dealers = getVisibleDealers();
  const list = document.getElementById('dealerOptionList');
  if (!list) return;
  list.innerHTML = dealers.length
    ? dealers.map(item => `
      <label class="dealer-option">
        <input type="checkbox" value="${item.code}" ${selectedDealerCodes.includes(item.code) ? 'checked' : ''} onchange="toggleDealerSelection(this)" />
        <span>
          <div class="dealer-name">${item.name}</div>
          <div class="dealer-meta">${item.code}｜${item.province} ${item.city} ${item.district}</div>
        </span>
      </label>
    `).join('')
    : '<div class="empty-state" style="padding:24px 12px">暂无匹配门店</div>';
  const visibleCodes = dealers.map(item => item.code);
  const checkedVisibleCount = visibleCodes.filter(code => selectedDealerCodes.includes(code)).length;
  document.getElementById('dealerSelectedCount').textContent = `已选 ${selectedDealerCodes.length} / ${dealers.length}`;
  document.getElementById('dealerSelectAll').checked = dealers.length > 0 && checkedVisibleCount === dealers.length;
  updateDealerTrigger();
}

function updateDealerTrigger() {
  const trigger = document.getElementById('dealerSelectTrigger');
  if (!trigger) return;
  const selectedNames = dealerOptions.filter(item => selectedDealerCodes.includes(item.code)).map(item => item.name);
  trigger.textContent = selectedNames.length ? selectedNames.slice(0, 2).join('、') + (selectedNames.length > 2 ? ` 等${selectedNames.length}家` : '') : '暂未选择门店';
  trigger.classList.toggle('has-value', selectedNames.length > 0);
}

function toggleDealerSelection(input) {
  if (input.checked) {
    selectedDealerCodes = [...new Set([...selectedDealerCodes, input.value])];
  } else {
    selectedDealerCodes = selectedDealerCodes.filter(code => code !== input.value);
  }
  renderDealerPicker();
}

function toggleAllVisibleDealers(checked) {
  const visibleCodes = getVisibleDealers().map(item => item.code);
  selectedDealerCodes = checked
    ? [...new Set([...selectedDealerCodes, ...visibleCodes])]
    : selectedDealerCodes.filter(code => !visibleCodes.includes(code));
  renderDealerPicker();
}

function clearSelectedDealers() {
  selectedDealerCodes = [];
  renderDealerPicker();
}

function getFilteredNurtureLeads() {
  const filters = {
    leadCode: document.getElementById('leadSearchCode').value.trim(),
    headquarterLeadId: document.getElementById('leadSearchHeadquarterId').value.trim(),
    status: document.getElementById('leadSearchStatus').value,
    customerName: document.getElementById('leadSearchName').value.trim(),
    phone: document.getElementById('leadSearchPhone').value.trim(),
    intentSeries: document.getElementById('leadSearchSeries').value.trim(),
    intentLevel: document.getElementById('leadSearchLevel').value,
    smartCode: document.getElementById('leadSearchSmartCode').value.trim(),
    latestSeries: document.getElementById('leadSearchLatestSeries').value.trim(),
    createdStart: document.getElementById('leadSearchCreatedStart').value,
    createdEnd: document.getElementById('leadSearchCreatedEnd').value,
    sourceLeadId: document.getElementById('leadSearchSourceId').value.trim()
  };

  return nurtureLeads.filter(row => {
    if (filters.createdStart && row.createdAt < filters.createdStart) return false;
    if (filters.createdEnd && row.createdAt > filters.createdEnd) return false;
    if (selectedDealerCodes.length && !selectedDealerCodes.includes(row.dealerCode)) return false;
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      if (key === 'createdStart' || key === 'createdEnd') return true;
      return String(row[key] || '').toLowerCase().includes(value.toLowerCase());
    });
  }).sort((a, b) => {
    const av = String(a[nurtureLeadSortField] || '');
    const bv = String(b[nurtureLeadSortField] || '');
    const result = av.localeCompare(bv, 'zh-CN', { numeric: true });
    return nurtureLeadSortDirection === 'asc' ? result : -result;
  });
}

function renderNurtureLeadTable() {
  const columns = nurtureLeadColumns.filter(col => visibleNurtureLeadFields.includes(col.key));
  const rows = getFilteredNurtureLeads();
  const totalPages = Math.max(1, Math.ceil(rows.length / nurtureLeadPageSize));
  nurtureLeadCurrentPage = Math.min(nurtureLeadCurrentPage, totalPages);
  const start = (nurtureLeadCurrentPage - 1) * nurtureLeadPageSize;
  const pageRows = rows.slice(start, start + nurtureLeadPageSize);
  document.getElementById('nurtureLeadPageInfo').textContent = `共 ${rows.length} 条记录，当前第 ${nurtureLeadCurrentPage} / ${totalPages} 页`;
  const pageSelect = document.getElementById('nurtureLeadPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, idx) => `<option value="${idx + 1}">第 ${idx + 1} 页</option>`).join('');
    pageSelect.value = String(nurtureLeadCurrentPage);
  }
  const pageSizeSelect = document.getElementById('nurtureLeadPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(nurtureLeadPageSize);
  document.getElementById('nurtureLeadTableHead').innerHTML = `
    <tr>
      ${columns.map(col => `
        <th onclick="sortNurtureLeadBy('${col.key}')">
          ${col.label}${nurtureLeadSortField === col.key ? `<span class="sort-indicator">${nurtureLeadSortDirection === 'asc' ? '↑' : '↓'}</span>` : ''}
        </th>
      `).join('')}
      <th>操作</th>
    </tr>
  `;
  document.getElementById('nurtureLeadTableBody').innerHTML = pageRows.length
    ? pageRows.map(row => `
      <tr>
        ${columns.map(col => `<td>${formatNurtureLeadCell(row, col.key)}</td>`).join('')}
        <td><button class="action-btn view" type="button" onclick="openLeadDetail('${row.leadCode}')">查看</button></td>
      </tr>
    `).join('')
    : `<tr><td colspan="${Math.max(columns.length + 1, 1)}"><div class="empty-state">暂无匹配的培育线索</div></td></tr>`;
}

function formatNurtureLeadCell(row, key) {
  const value = row[key] || '—';
  if (key === 'status') {
    const cls = value === '无效' ? 'gray' : value === '已邀约' || value === '已转化' ? 'green' : '';
    return `<span class="tag-chip ${cls}">${value}</span>`;
  }
  if (key === 'intentLevel') return `<span class="tag-chip orange">${value}</span>`;
  return value;
}

function filterNurtureLeads() {
  nurtureLeadCurrentPage = 1;
  renderNurtureLeadTable();
}

function resetNurtureLeadSearch() {
  ['leadSearchCode', 'leadSearchHeadquarterId', 'leadSearchName', 'leadSearchPhone', 'leadSearchSeries', 'leadSearchProvince', 'leadSearchCity', 'leadDealerKeyword', 'leadSearchSmartCode', 'leadSearchLatestSeries', 'leadSearchCreatedStart', 'leadSearchCreatedEnd', 'leadSearchSourceId'].forEach(id => {
    document.getElementById(id).value = '';
  });
  document.getElementById('leadSearchStatus').value = '';
  document.getElementById('leadSearchLevel').value = '';
  selectedDealerCodes = [];
  nurtureLeadCurrentPage = 1;
  updateDealerCities();
  renderNurtureLeadTable();
}

function changeNurtureLeadSort() {
  nurtureLeadSortField = document.getElementById('leadSortField').value;
  nurtureLeadSortDirection = document.getElementById('leadSortDirection').value;
  nurtureLeadCurrentPage = 1;
  renderNurtureLeadTable();
}

function sortNurtureLeadBy(key) {
  if (nurtureLeadSortField === key) {
    nurtureLeadSortDirection = nurtureLeadSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    nurtureLeadSortField = key;
    nurtureLeadSortDirection = 'asc';
  }
  document.getElementById('leadSortField').value = nurtureLeadSortField;
  document.getElementById('leadSortDirection').value = nurtureLeadSortDirection;
  nurtureLeadCurrentPage = 1;
  renderNurtureLeadTable();
}

function changeNurtureLeadPageSize(value) {
  nurtureLeadPageSize = Number(value) || 5;
  nurtureLeadCurrentPage = 1;
  renderNurtureLeadTable();
}

function selectNurtureLeadPage(value) {
  nurtureLeadCurrentPage = Number(value) || 1;
  renderNurtureLeadTable();
}

function changeNurtureLeadPage(dir) {
  const rows = getFilteredNurtureLeads();
  const totalPages = Math.max(1, Math.ceil(rows.length / nurtureLeadPageSize));
  nurtureLeadCurrentPage = Math.max(1, Math.min(totalPages, nurtureLeadCurrentPage + dir));
  renderNurtureLeadTable();
}

function toggleLeadFieldPicker() {
  document.getElementById('leadFieldPicker').classList.toggle('show');
}

function renderLeadFieldPicker() {
  const picker = document.getElementById('leadFieldPicker');
  picker.innerHTML = `
    <div class="field-picker-grid">
      ${nurtureLeadColumns.map(col => `
        <label class="field-check">
          <input type="checkbox" value="${col.key}" ${visibleNurtureLeadFields.includes(col.key) ? 'checked' : ''} onchange="toggleNurtureLeadField(this)" />
          ${col.label}
        </label>
      `).join('')}
    </div>
  `;
}

function toggleNurtureLeadField(input) {
  if (input.checked) {
    visibleNurtureLeadFields = [...new Set([...visibleNurtureLeadFields, input.value])];
  } else {
    visibleNurtureLeadFields = visibleNurtureLeadFields.filter(key => key !== input.value);
  }
  if (visibleNurtureLeadFields.length === 0) {
    visibleNurtureLeadFields = ['leadCode'];
  }
  renderNurtureLeadTable();
}

function openLeadDetail(leadCode) {
  const lead = nurtureLeads.find(row => row.leadCode === leadCode);
  if (!lead) return;
  leadDetailSource = '培育线索';
  document.querySelector('nav[aria-label="培育策略三级菜单"]').classList.add('hidden');
  document.querySelector('.leads-nav').classList.add('show');
  setLeadNavActive('培育线索');
  setSidebarActiveByName('线索管理');
  setPageName('线索管理 / 培育线索 / 线索详情');
  setPolicyContentVisible(false);
  hideLeadPages();
  document.getElementById('designStage').classList.remove('show');
  document.getElementById('leadDetailPage').classList.add('show');
  document.getElementById('leadDetailTitle').textContent = '查看培育线索详情';
  document.getElementById('leadDetailSubtitle').textContent = `线索管理 / 培育线索 / ${lead.leadCode}`;
  document.getElementById('leadDetailSummary').innerHTML = renderLeadDetailSummary(lead);
  document.getElementById('leadDetailPageBody').innerHTML = renderLeadDetailPageContent(lead);
}

function renderLeadDetailPageContent(lead) {
  const detailGroups = getLeadDetailGroups(lead);
  const taskInitializations = sortTasksByCreatedAtDesc(getLeadTaskInitializations(lead));
  const upstreamLogs = getLeadUpstreamSyncLogs(lead, taskInitializations);
  const logs = getLeadSystemLogs(lead);
  return `
    <div class="detail-tabs">
      <button class="detail-tab active" type="button" onclick="switchLeadDetailTab(this, 'leadDetailInfoPanel')">线索详情</button>
      <button class="detail-tab" type="button" onclick="switchLeadDetailTab(this, 'leadTaskPanel')">培育任务</button>
      <button class="detail-tab" type="button" onclick="switchLeadDetailTab(this, 'leadSyncLogPanel')">接收日志</button>
      <button class="detail-tab" type="button" onclick="switchLeadDetailTab(this, 'leadSystemLogPanel')">系统日志</button>
    </div>
    <div class="detail-tab-panel active" id="leadDetailInfoPanel">
      ${detailGroups.map(renderDetailSection).join('')}
    </div>
    <div class="detail-tab-panel" id="leadTaskPanel">
      ${renderTaskOverview(taskInitializations)}
      ${taskInitializations.map((task, index) => renderTaskInitializationCard(task, index === 0)).join('')}
    </div>
    <div class="detail-tab-panel" id="leadSyncLogPanel">
      ${renderLeadUpstreamSyncLogTable(upstreamLogs)}
    </div>
    <div class="detail-tab-panel" id="leadSystemLogPanel">
      <table class="log-table">
        <thead>
          <tr>
            <th>时间</th>
            <th>节点</th>
            <th>操作人</th>
            <th>操作类型</th>
            <th>说明</th>
            <th>结果</th>
          </tr>
        </thead>
        <tbody>
          ${logs.map(log => `
            <tr>
              <td>${log.time}</td>
              <td>${log.node}</td>
              <td>${log.operator}</td>
              <td>${log.type}</td>
              <td>${log.desc}</td>
              <td>${log.result}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function backToNurtureLeadList() {
  hideLeadPages();
  document.getElementById('nurtureLeadPage').classList.add('show');
  document.getElementById('designStage').classList.remove('show');
  setLeadNavActive('培育线索');
  setSidebarActiveByName('线索管理');
  setPageName('线索管理 / 培育线索');
  renderNurtureLeadTable();
}

function backToResourceLeadList() {
  hideLeadPages();
  document.getElementById('resourceLeadPage').classList.add('show');
  document.getElementById('designStage').classList.remove('show');
  setLeadNavActive('留资线索');
  setSidebarActiveByName('线索管理');
  setPageName('线索管理 / 留资线索');
  renderResourceLeadTable();
}

function backToLeadList() {
  if (leadDetailSource === '留资线索') {
    backToResourceLeadList();
    return;
  }
  backToNurtureLeadList();
}

function switchLeadDetailTab(button, panelId) {
  const scope = button.closest('.lead-detail-content') || button.closest('.modal-body');
  if (!scope) return;
  scope.querySelectorAll('.detail-tab').forEach(tab => tab.classList.remove('active'));
  scope.querySelectorAll('.detail-tab-panel').forEach(panel => panel.classList.remove('active'));
  button.classList.add('active');
  document.getElementById(panelId)?.classList.add('active');
}

function detailValue(value) {
  return value || '—';
}

function formatYesNoTag(value) {
  const normalized = value || '否';
  return `<span class="tag-chip ${normalized === '是' ? 'orange' : 'gray'}">${normalized}</span>`;
}

function formatYesNoText(value) {
  return value || '否';
}

function formatSystemStatusTag(value) {
  const normalized = value || '处理中';
  return `<span class="tag-chip ${normalized === '已处理' ? 'green' : 'orange'}">${normalized}</span>`;
}

function formatFlagTextWithUpdatedAt(value, updatedAt) {
  return `${formatYesNoText(value)}<div class="field-update-time">更新时间：${detailValue(updatedAt)}</div>`;
}

function formatLeadValueText(row, key) {
  return detailValue(row[key]);
}

function renderLeadDetailSummary(lead) {
  const items = [
    { label: '培育线索编码', value: detailValue(lead.leadCode) },
    { label: '客户姓名', value: detailValue(lead.customerName) },
    { label: '电话号码', value: detailValue(lead.phone) },
    { label: '线索状态', value: formatNurtureLeadCell(lead, 'status') },
    { label: '意向车系', value: detailValue(lead.intentSeries) },
    { label: '意向专营店', value: detailValue(lead.dealer) }
  ];
  return items.map(item => `
    <div class="lead-summary-item">
      <div class="lead-summary-label">${item.label}</div>
      <div class="lead-summary-value">${item.value}</div>
    </div>
  `).join('');
}

function renderDetailSection(group) {
  return `
    <section class="detail-section">
      <div class="detail-section-title">${group.title}</div>
      <div class="detail-section-body">
        ${group.items.map(item => `
          <div class="lead-detail-item">
            <div class="lead-detail-label">${item.label}</div>
            <div class="lead-detail-value">${item.value || '—'}</div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

