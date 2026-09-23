// ===== Blacklist Dealer Management =====
// 复用全局 dealerOptions（定义在 00-data.js），确保数据源全局统一

const BLACKLIST_DEALER_CAR_SERIES_OPTIONS = ['全部车系', 'N6', '轩逸', '天籁', '逍客', '奇骏', 'ARIYA', '探陆'];

function _getBlacklistDealerOptions() {
  return (typeof dealerOptions !== 'undefined' && dealerOptions) ? dealerOptions : [];
}

function _findDealerByCode(code) {
  return _getBlacklistDealerOptions().find(d => d.code === code) || null;
}

function _renderDealerOptionItem(d, selected, selectFnName) {
  const region = [d.province, d.city, d.district].filter(Boolean).join(' ');
  return `
    <label class="tag-option dealer-tag-option ${selected ? 'selected' : ''}" onclick="event.stopPropagation(); ${selectFnName}('${escapeDealerHtml(d.code)}')">
      <span>
        <div class="dealer-name">${escapeDealerHtml(d.name)}</div>
        <div class="dealer-meta">${escapeDealerHtml(d.code)}｜${escapeDealerHtml(region)}</div>
      </span>
    </label>`;
}

let blacklistDealers = (function initDealerBlacklistData() {
  const dealers = _getBlacklistDealerOptions();
  const d1 = dealers[0] || { code: 'DLR-GD-GZ-001', name: '广州东风日产天河店' };
  const d2 = dealers[1] || { code: 'DLR-GD-SZ-002', name: '深圳东风日产南山店' };
  return [
    {
      id: '2096887757724639233',
      dealerCode: d1.code,
      dealerName: d1.name,
      carSeries: [],
      attrType: '1',
      expireAt: '2026-09-11',
      addType: '命中MKT添加',
      reason: '赛马活动黑名单',
      etlUpdateTime: '2026-09-08 10:30:00',
      createTime: '2026-09-07 17:06:14',
      createOperator: '管理员',
      updateTime: '2026-09-07 17:06:14',
      updateOperator: '管理员'
    },
    {
      id: '2096887757724639234',
      dealerCode: d2.code,
      dealerName: d2.name,
      carSeries: ['N6', '探陆'],
      attrType: '0',
      expireAt: null,
      addType: '人工手动添加',
      reason: '长期不配合培育任务',
      etlUpdateTime: '2026-09-08 10:00:00',
      createTime: '2026-09-05 09:30:00',
      createOperator: '李主管',
      updateTime: '2026-09-05 09:30:00',
      updateOperator: '李主管'
    }
  ];
})();

let blacklistDealerNextId = 2096887757724639235;
let blacklistDealerCurrentPage = 1;
let blacklistDealerPageSize = 20;
let blacklistDealerFilterCode = '';
let blacklistDealerFilterAttrType = '';
let blacklistDealerFilterAddType = '';
let selectedDealerCode = '';
let selectedDealerCarSeries = [];

function escapeDealerHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function generateDealerId() {
  return String(blacklistDealerNextId++);
}

function getNowStr() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}

function updateBlacklistDealerSummary() {
  const total = blacklistDealers.length;
  const perm = blacklistDealers.filter(d => d.attrType === '0').length;
  const temp = blacklistDealers.filter(d => d.attrType === '1').length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const today = blacklistDealers.filter(d => d.createTime && d.createTime.startsWith(todayStr)).length;

  const totalEl = document.getElementById('blacklistDealerSummaryTotal');
  const permEl = document.getElementById('blacklistDealerSummaryPerm');
  const tempEl = document.getElementById('blacklistDealerSummaryTemp');
  const todayEl = document.getElementById('blacklistDealerSummaryToday');

  if (totalEl) totalEl.textContent = total.toLocaleString();
  if (permEl) permEl.textContent = perm.toLocaleString();
  if (tempEl) tempEl.textContent = temp.toLocaleString();
  if (todayEl) todayEl.textContent = today.toLocaleString();
}

function getFilteredBlacklistDealers() {
  const codeFilter = blacklistDealerFilterCode;
  const attrTypeFilter = blacklistDealerFilterAttrType;
  const addTypeFilter = blacklistDealerFilterAddType;

  return blacklistDealers.filter(d => {
    if (codeFilter && d.dealerCode !== codeFilter) return false;
    if (attrTypeFilter && d.attrType !== attrTypeFilter) return false;
    if (addTypeFilter && d.addType !== addTypeFilter) return false;
    return true;
  });
}

function setTriggerText(triggerId, text, isPlaceholder) {
  const el = document.getElementById(triggerId);
  if (!el) return;
  el.textContent = text;
  el.classList.toggle('placeholder', !!isPlaceholder);
}

function _dealerPickerGetDealer() {
  return _findDealerByCode(selectedDealerCode);
}

function _updateFormCodeTrigger() {
  const d = _dealerPickerGetDealer();
  if (d) {
    setTriggerText('blacklistDealerCodeTrigger', d.name, false);
  } else {
    setTriggerText('blacklistDealerCodeTrigger', '请选择经销商', true);
  }
}

function _updateFilterCodeTrigger() {
  const d = _findDealerByCode(blacklistDealerFilterCode);
  const hidden = document.getElementById('blacklistDealerCodeFilterInput');
  if (d) {
    setTriggerText('blacklistDealerCodeFilterTrigger', d.name, false);
    if (hidden) hidden.value = d.code;
  } else {
    setTriggerText('blacklistDealerCodeFilterTrigger', '请选择', true);
    if (hidden) hidden.value = '';
  }
}

function renderBlacklistDealerListPage() {
  updateBlacklistDealerSummary();
  const rows = getFilteredBlacklistDealers();
  const body = document.getElementById('blacklistDealerTableBody');
  if (!body) return;

  const totalPages = Math.max(1, Math.ceil(rows.length / blacklistDealerPageSize));
  blacklistDealerCurrentPage = Math.min(blacklistDealerCurrentPage, totalPages);
  const start = (blacklistDealerCurrentPage - 1) * blacklistDealerPageSize;
  const pageRows = rows.slice(start, start + blacklistDealerPageSize);

  const info = document.getElementById('blacklistDealerPageInfo');
  if (info) {
    info.textContent = `共 ${rows.length} 条记录，当前第 ${blacklistDealerCurrentPage} / ${totalPages} 页`;
    syncPaginationButtons(info.closest('.pagination') || '#blacklistDealerPagination', blacklistDealerCurrentPage, totalPages);
  }

  const pageSelect = document.getElementById('blacklistDealerPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, idx) => `<option value="${idx + 1}">第 ${idx + 1} 页</option>`).join('');
    pageSelect.value = String(blacklistDealerCurrentPage);
  }

  const pageSizeSelect = document.getElementById('blacklistDealerPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(blacklistDealerPageSize);

  _updateFilterCodeTrigger();

  if (!pageRows.length) {
    body.innerHTML = `<tr><td colspan="10"><div class="empty-state"><div class="empty-state-icon">📋</div>暂无黑名单经销商数据，可点击"新增数据"添加</div></td></tr>`;
    return;
  }

  body.innerHTML = pageRows.map((d, index) => {
    const attrTypeText = d.attrType === '0'
      ? '<span class="policy-plain-text" style="color:#e53e3e;">永久</span>'
      : '<span class="policy-plain-text" style="color:#dd6b20;">赛马</span>';
    const carSeriesText = d.carSeries && d.carSeries.length
      ? d.carSeries.map(s => `<span class="tag-chip blue" style="margin-right:4px;">${escapeDealerHtml(s)}</span>`).join('')
      : '<span style="color:#999;">—</span>';
    const expireText = d.attrType === '0'
      ? '<span style="color:#999;">—</span>'
      : escapeDealerHtml(d.expireAt || '—');

    return `
      <tr>
        <td class="col-num">${start + index + 1}</td>
        <td><span class="policy-plain-text" style="font-family:monospace; font-size:12px;">${escapeDealerHtml(d.dealerCode)}</span></td>
        <td><span class="policy-plain-text">${escapeDealerHtml(d.dealerName)}</span></td>
        <td>${carSeriesText}</td>
        <td>${attrTypeText}</td>
        <td class="dealer-add-type-cell"><span class="tag-chip green dealer-add-type-chip">${escapeDealerHtml(d.addType || '人工手动添加')}</span></td>
        <td><span class="policy-plain-text" style="font-size:12px;">${escapeDealerHtml(d.etlUpdateTime || '—')}</span></td>
        <td>
          <div class="rule-text-stack">
            <div class="policy-plain-text" style="font-size:12px;">${escapeDealerHtml(d.createTime || '—')}</div>
            <div class="rule-muted">操作人：${escapeDealerHtml(d.createOperator || '—')}</div>
          </div>
        </td>
        <td>
          <div class="rule-text-stack">
            <div class="policy-plain-text" style="font-size:12px;">${escapeDealerHtml(d.updateTime || '—')}</div>
            <div class="rule-muted">操作人：${escapeDealerHtml(d.updateOperator || '—')}</div>
            ${d.attrType === '1' ? `<div class="rule-muted" style="color:#dd6b20;">到期：${expireText}</div>` : ''}
          </div>
        </td>
        <td>
          <div class="action-btns">
            <button class="action-btn view" type="button" onclick="editBlacklistDealer('${d.id}')">编辑</button>
            <button class="action-btn delete" type="button" onclick="deleteBlacklistDealer('${d.id}')">删除</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ===== Filter: Dealer Code (tag-picker single select, two-line options) =====
function renderBlacklistDealerFilterCodeList(keyword) {
  const list = document.getElementById('blacklistDealerCodeFilterList');
  if (!list) return;
  const kw = (keyword || '').toLowerCase();
  // 筛选器只列出当前黑名单表中已存在的经销商（从全局dealerOptions中找详情）
  const existingCodes = [...new Set(blacklistDealers.map(d => d.dealerCode))];
  const existingDealers = existingCodes
    .map(code => _findDealerByCode(code) || { code, name: code, province: '', city: '', district: '' })
    .filter(d =>
      d.code.toLowerCase().includes(kw) ||
      d.name.toLowerCase().includes(kw) ||
      (d.province || '').toLowerCase().includes(kw) ||
      (d.city || '').toLowerCase().includes(kw)
    );
  list.innerHTML = existingDealers.length
    ? existingDealers.map(d => _renderDealerOptionItem(d, blacklistDealerFilterCode === d.code, '_selectFilterDealerByCode')).join('')
    : '<div class="tag-picker-empty">暂无匹配门店</div>';
}

function toggleBlacklistDealerFilterDropdown() {
  const panel = document.getElementById('blacklistDealerCodeFilterPanel');
  if (!panel) return;
  const isShown = panel.classList.contains('show');
  document.getElementById('blacklistDealerCodePanel')?.classList.remove('show');
  document.getElementById('dealerCarSeriesPanel')?.classList.remove('show');
  panel.classList.toggle('show', !isShown);
  if (!isShown) {
    const search = document.getElementById('blacklistDealerCodeFilterSearch');
    if (search) { search.value = ''; search.focus(); }
    renderBlacklistDealerFilterCodeList('');
  }
}

function filterBlacklistDealerCodeOptions(keyword) {
  renderBlacklistDealerFilterCodeList(keyword);
}

function _selectFilterDealerByCode(code) {
  blacklistDealerFilterCode = code;
  document.getElementById('blacklistDealerCodeFilterPanel')?.classList.remove('show');
  blacklistDealerCurrentPage = 1;
  renderBlacklistDealerListPage();
}

function applyBlacklistDealerFilters() {
  blacklistDealerFilterAttrType = document.getElementById('blacklistDealerAttrTypeFilter')?.value || '';
  blacklistDealerFilterAddType = document.getElementById('blacklistDealerAddTypeFilter')?.value || '';
  blacklistDealerCurrentPage = 1;
  renderBlacklistDealerListPage();
}

// ===== Form: Dealer Code Picker (single select, searchable, two-line options) =====
function renderDealerCodeList(keyword) {
  const list = document.getElementById('blacklistDealerCodeList');
  if (!list) return;
  const kw = (keyword || '').toLowerCase();
  const all = _getBlacklistDealerOptions();
  const filtered = all.filter(d =>
    d.code.toLowerCase().includes(kw) ||
    d.name.toLowerCase().includes(kw) ||
    (d.province || '').toLowerCase().includes(kw) ||
    (d.city || '').toLowerCase().includes(kw)
  );
  list.innerHTML = filtered.length
    ? filtered.map(d => _renderDealerOptionItem(d, selectedDealerCode === d.code, '_selectDealerFromOption')).join('')
    : '<div class="tag-picker-empty">暂无匹配门店</div>';
}

function toggleBlacklistDealerCodeDropdown() {
  const panel = document.getElementById('blacklistDealerCodePanel');
  if (!panel) return;
  const isShown = panel.classList.contains('show');
  document.getElementById('blacklistDealerCodeFilterPanel')?.classList.remove('show');
  document.getElementById('dealerCarSeriesPanel')?.classList.remove('show');
  panel.classList.toggle('show', !isShown);
  if (!isShown) {
    const search = document.getElementById('blacklistDealerCodeSearch');
    if (search) { search.value = ''; search.focus(); }
    renderDealerCodeList('');
  }
}

function filterDealerCodeOptions(keyword) {
  renderDealerCodeList(keyword);
}

function _selectDealerFromOption(code) {
  const d = _findDealerByCode(code);
  if (!d) return;
  selectedDealerCode = code;
  const hidden = document.getElementById('blacklistDealerCodeInput');
  if (hidden) hidden.value = code;
  _updateFormCodeTrigger();
  document.getElementById('blacklistDealerCodePanel')?.classList.remove('show');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
  const filterPicker = document.getElementById('dealerCodeFilterPicker');
  const formCodePicker = document.getElementById('dealerCodePicker');
  const carSeriesPicker = document.getElementById('dealerCarSeriesPicker');

  if (filterPicker && !filterPicker.contains(e.target)) {
    document.getElementById('blacklistDealerCodeFilterPanel')?.classList.remove('show');
  }
  if (formCodePicker && !formCodePicker.contains(e.target)) {
    document.getElementById('blacklistDealerCodePanel')?.classList.remove('show');
  }
  if (carSeriesPicker && !carSeriesPicker.contains(e.target)) {
    document.getElementById('dealerCarSeriesPanel')?.classList.remove('show');
  }
});

// ===== Modal: Add/Edit =====
function openAddBlacklistDealerModal() {
  const modal = document.getElementById('addBlacklistDealerModal');
  if (!modal) return;
  document.getElementById('addBlacklistDealerModalTitle').textContent = '新增';
  document.getElementById('blacklistDealerEditId').value = '';
  selectedDealerCode = '';
  const codeHidden = document.getElementById('blacklistDealerCodeInput');
  if (codeHidden) codeHidden.value = '';
  _updateFormCodeTrigger();
  document.getElementById('blacklistDealerExpireInput').value = '';
  document.getElementById('blacklistDealerReasonInput').value = '';
  document.getElementById('blacklistDealerEditMeta').style.display = 'none';
  selectedDealerCarSeries = [];
  updateDealerCarSeriesTrigger();
  renderDealerCarSeriesList();
  const attrTypeSelect = document.getElementById('blacklistDealerAttrType');
  if (attrTypeSelect) attrTypeSelect.value = '1';
  handleDealerAttrTypeChange('1');
  document.getElementById('blacklistDealerCodePanel')?.classList.remove('show');
  document.getElementById('dealerCarSeriesPanel')?.classList.remove('show');
  document.getElementById('blacklistDealerCodeFilterPanel')?.classList.remove('show');
  modal.classList.add('show');
}

function closeAddBlacklistDealerModal() {
  document.getElementById('addBlacklistDealerModal')?.classList.remove('show');
}

function editBlacklistDealer(id) {
  const d = blacklistDealers.find(x => x.id === id);
  if (!d) return;
  openAddBlacklistDealerModal();
  document.getElementById('addBlacklistDealerModalTitle').textContent = '编辑';
  document.getElementById('blacklistDealerEditId').value = d.id;
  selectedDealerCode = d.dealerCode;
  const codeHidden = document.getElementById('blacklistDealerCodeInput');
  if (codeHidden) codeHidden.value = d.dealerCode;
  _updateFormCodeTrigger();
  document.getElementById('blacklistDealerExpireInput').value = d.expireAt || '';
  document.getElementById('blacklistDealerReasonInput').value = d.reason || '';
  document.getElementById('blacklistDealerAddTypeInput').value = d.addType || '人工手动添加';
  document.getElementById('blacklistDealerEtlUpdateTimeInput').value = d.etlUpdateTime || '—';
  document.getElementById('blacklistDealerEditMeta').style.display = '';
  selectedDealerCarSeries = [...(d.carSeries || [])];
  updateDealerCarSeriesTrigger();
  renderDealerCarSeriesList();
  const attrTypeSelect = document.getElementById('blacklistDealerAttrType');
  if (attrTypeSelect) attrTypeSelect.value = d.attrType;
  handleDealerAttrTypeChange(d.attrType);
}

function handleDealerAttrTypeChange(val) {
  const expireGroup = document.getElementById('dealerExpireGroup');
  if (!expireGroup) return;
  expireGroup.style.display = val === '0' ? 'none' : 'block';
}

// ===== Form: Car Series Picker (multi select, tag-picker style) =====
function updateDealerCarSeriesTrigger() {
  const trigger = document.getElementById('dealerCarSeriesTrigger');
  if (!trigger) return;
  if (!selectedDealerCarSeries.length) {
    setTriggerText('dealerCarSeriesTrigger', '请选择关联车系', true);
  } else {
    trigger.textContent = selectedDealerCarSeries.join(' / ');
    trigger.classList.remove('placeholder');
  }
  const countEl = document.getElementById('dealerCarSeriesCount');
  if (countEl) countEl.textContent = `已选 ${selectedDealerCarSeries.length} / ${BLACKLIST_DEALER_CAR_SERIES_OPTIONS.length} 个车系`;
}

function renderDealerCarSeriesList() {
  const list = document.getElementById('dealerCarSeriesList');
  if (!list) return;
  list.innerHTML = BLACKLIST_DEALER_CAR_SERIES_OPTIONS.map(s => {
    const checked = selectedDealerCarSeries.includes(s);
    const disabled = selectedDealerCarSeries.includes('全部车系') && s !== '全部车系';
    return `<label class="blacklist-dealer-series-option ${s === '全部车系' ? 'all-series' : ''} ${checked ? 'selected' : ''} ${disabled ? 'disabled' : ''}">
      <input type="checkbox" value="${escapeDealerHtml(s)}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} onchange="toggleDealerCarSeriesOption(this.value, this.checked)" />
      <span>${escapeDealerHtml(s)}</span>
    </label>`;
  }).join('');
  updateDealerCarSeriesTrigger();
}

function toggleDealerCarSeriesPicker() {
  const panel = document.getElementById('dealerCarSeriesPanel');
  if (!panel) return;
  const isShown = panel.classList.contains('show');
  document.getElementById('blacklistDealerCodeFilterPanel')?.classList.remove('show');
  document.getElementById('blacklistDealerCodePanel')?.classList.remove('show');
  panel.classList.toggle('show', !isShown);
  if (!isShown) renderDealerCarSeriesList();
}

function toggleDealerCarSeriesOption(series, checked) {
  if (series === '全部车系') {
    selectedDealerCarSeries = checked ? ['全部车系'] : [];
  } else {
    selectedDealerCarSeries = selectedDealerCarSeries.filter(item => item !== '全部车系' && item !== series);
    if (checked) selectedDealerCarSeries.push(series);
  }
  renderDealerCarSeriesList();
}

function selectAllDealerCarSeries() {
  selectedDealerCarSeries = ['全部车系'];
  renderDealerCarSeriesList();
}

function clearDealerCarSeries() {
  selectedDealerCarSeries = [];
  renderDealerCarSeriesList();
}

// ===== Form Submit =====
function saveBlacklistDealer(event) {
  event.preventDefault();
  const editId = document.getElementById('blacklistDealerEditId').value;
  const dealerCode = selectedDealerCode || (document.getElementById('blacklistDealerCodeInput')?.value || '').trim();
  const dealerName = _findDealerByCode(dealerCode)?.name || '';
  const expireAt = document.getElementById('blacklistDealerExpireInput').value;
  const reason = document.getElementById('blacklistDealerReasonInput').value.trim();
  const carSeries = [...selectedDealerCarSeries];

  const attrType = document.getElementById('blacklistDealerAttrType')?.value || '1';

  if (!dealerCode) {
    showToast('请选择经销商', false);
    return;
  }
  if (attrType === '1' && !expireAt) {
    showToast('请选择禁用期限（截止时间）', false);
    return;
  }

  const now = getNowStr();

  if (editId) {
    const d = blacklistDealers.find(x => x.id === editId);
    if (d) {
      d.dealerCode = dealerCode;
      d.dealerName = dealerName;
      d.carSeries = carSeries;
      d.attrType = attrType;
      d.expireAt = attrType === '0' ? null : expireAt;
      d.reason = reason;
      d.updateTime = now;
      d.updateOperator = '管理员';
      showToast(`已成功编辑经销商黑名单：${dealerName}`, true);
    }
  } else {
    blacklistDealers.unshift({
      id: generateDealerId(),
      dealerCode,
      dealerName,
      carSeries,
      attrType,
      expireAt: attrType === '0' ? null : expireAt,
      addType: '人工手动添加',
      reason,
      etlUpdateTime: now,
      createTime: now,
      createOperator: '管理员',
      updateTime: now,
      updateOperator: '管理员'
    });
    showToast(`已成功添加经销商黑名单：${dealerName}`, true);
  }

  closeAddBlacklistDealerModal();
  renderBlacklistDealerListPage();
}

function deleteBlacklistDealer(id) {
  const d = blacklistDealers.find(x => x.id === id);
  if (!d) return;
  if (!confirm(`确认要删除经销商「${d.dealerName}（${d.dealerCode}）」的黑名单记录吗？`)) return;
  blacklistDealers = blacklistDealers.filter(x => x.id !== id);
  renderBlacklistDealerListPage();
  showToast(`已成功删除经销商黑名单：${d.dealerName}`, true);
}

function resetBlacklistDealerFilters() {
  blacklistDealerFilterCode = '';
  blacklistDealerFilterAttrType = '';
  blacklistDealerFilterAddType = '';
  const attrTypeFilter = document.getElementById('blacklistDealerAttrTypeFilter');
  const addTypeFilter = document.getElementById('blacklistDealerAddTypeFilter');
  if (attrTypeFilter) attrTypeFilter.value = '';
  if (addTypeFilter) addTypeFilter.value = '';
  _updateFilterCodeTrigger();
  document.getElementById('blacklistDealerCodeFilterPanel')?.classList.remove('show');
  blacklistDealerCurrentPage = 1;
  renderBlacklistDealerListPage();
}

function exportBlacklistDealers() {
  showToast('正在导出经销商黑名单列表数据...', true);
}

// ===== Pagination =====
function changeBlacklistDealerPageSize(val) {
  blacklistDealerPageSize = Number(val) || 20;
  blacklistDealerCurrentPage = 1;
  renderBlacklistDealerListPage();
}

function changeBlacklistDealerPage(direction) {
  const totalPages = Math.max(1, Math.ceil(getFilteredBlacklistDealers().length / blacklistDealerPageSize));
  blacklistDealerCurrentPage = Math.max(1, Math.min(totalPages, blacklistDealerCurrentPage + direction));
  renderBlacklistDealerListPage();
}

function selectBlacklistDealerPage(val) {
  blacklistDealerCurrentPage = Number(val) || 1;
  renderBlacklistDealerListPage();
}

// ===== Register UI Actions =====
if (typeof registerUiAction === 'function') {
  registerUiAction('blacklist-dealer-filter', (target, event) => {
    if (event.type === 'input') {
      blacklistDealerCurrentPage = 1;
      renderBlacklistDealerListPage();
    }
  });
  registerUiAction('blacklist-dealer-reset', (target, event) => {
    if (event.type === 'click') resetBlacklistDealerFilters();
  });
  registerUiAction('blacklist-dealer-page-size', (target, event) => {
    if (event.type === 'change') changeBlacklistDealerPageSize(target.value);
  });
  registerUiAction('blacklist-dealer-page-prev', (target, event) => {
    if (event.type === 'click') changeBlacklistDealerPage(-1);
  });
  registerUiAction('blacklist-dealer-page-next', (target, event) => {
    if (event.type === 'click') changeBlacklistDealerPage(1);
  });
  registerUiAction('blacklist-dealer-page-select', (target, event) => {
    if (event.type === 'change') selectBlacklistDealerPage(target.value);
  });
}
