// ===== Resource Unfilled Leads =====
function initResourceUnfilledPage() {
  fillSelect('unfilledSearchSeries', carSeriesOptions, '全部车系');
  renderResourceUnfilledTable();
}

function getFilteredResourceUnfilledLeads() {
  const filters = {
    unfilledId: document.getElementById('unfilledSearchId').value.trim(),
    syncStatus: document.getElementById('unfilledSearchSyncStatus').value,
    customerName: document.getElementById('unfilledSearchName').value.trim(),
    phone: document.getElementById('unfilledSearchPhone').value.trim(),
    intentSeries: document.getElementById('unfilledSearchSeries').value,
    dealer: document.getElementById('unfilledSearchDealer').value.trim(),
    systemSource: document.getElementById('unfilledSearchSystemSource').value,
    smartCode: document.getElementById('unfilledSearchSmartCode').value.trim(),
    nurtureLeadCode: document.getElementById('unfilledSearchNurtureCode').value.trim(),
    createdStart: document.getElementById('unfilledSearchCreatedStart').value,
    createdEnd: document.getElementById('unfilledSearchCreatedEnd').value
  };

  return resourceUnfilledLeads.filter(row => {
    if (filters.createdStart && row.createdAt < filters.createdStart) return false;
    if (filters.createdEnd && row.createdAt > filters.createdEnd) return false;
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      if (key === 'createdStart' || key === 'createdEnd') return true;
      if (key === 'syncStatus' || key === 'intentSeries' || key === 'systemSource') return row[key] === value;
      return String(row[key] || '').toLowerCase().includes(value.toLowerCase());
    });
  }).sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''), 'zh-CN', { numeric: true }));
}

function renderResourceUnfilledTable() {
  const rows = getFilteredResourceUnfilledLeads();
  const totalPages = Math.max(1, Math.ceil(rows.length / resourceUnfilledPageSize));
  resourceUnfilledCurrentPage = Math.min(resourceUnfilledCurrentPage, totalPages);
  const start = (resourceUnfilledCurrentPage - 1) * resourceUnfilledPageSize;
  const pageRows = rows.slice(start, start + resourceUnfilledPageSize);
  document.getElementById('resourceUnfilledPageInfo').textContent = `共 ${rows.length} 条记录，当前第 ${resourceUnfilledCurrentPage} / ${totalPages} 页`;

  const pageSelect = document.getElementById('resourceUnfilledPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, idx) => `<option value="${idx + 1}">第 ${idx + 1} 页</option>`).join('');
    pageSelect.value = String(resourceUnfilledCurrentPage);
  }
  const pageSizeSelect = document.getElementById('resourceUnfilledPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(resourceUnfilledPageSize);

  document.getElementById('resourceUnfilledTableHead').innerHTML = `
    <tr>${resourceUnfilledColumns.map(col => `<th>${col.label}</th>`).join('')}</tr>
  `;
  document.getElementById('resourceUnfilledTableBody').innerHTML = pageRows.length
    ? pageRows.map(row => `
      <tr>${resourceUnfilledColumns.map(col => `<td>${formatResourceUnfilledCell(row, col.key)}</td>`).join('')}</tr>
    `).join('')
    : `<tr><td colspan="${resourceUnfilledColumns.length}"><div class="empty-state">暂无匹配的留资未满数据</div></td></tr>`;
}

function formatResourceUnfilledCell(row, key) {
  if (key === 'timeSlotCapacity' || key === 'timeSlotRemaining') {
    return `
      <div class="slot-capacity-cell">
        <div class="slot-capacity-time">${detailValue(row.timeSlotLabel)}</div>
        <div class="slot-capacity-value">${detailValue(row[key])}<span class="slot-capacity-unit">个</span></div>
      </div>
    `;
  }
  return detailValue(row[key]);
}

function filterResourceUnfilled() {
  resourceUnfilledCurrentPage = 1;
  renderResourceUnfilledTable();
}

function resetResourceUnfilledSearch() {
  [
    'unfilledSearchId',
    'unfilledSearchName',
    'unfilledSearchPhone',
    'unfilledSearchDealer',
    'unfilledSearchSmartCode',
    'unfilledSearchNurtureCode',
    'unfilledSearchCreatedStart',
    'unfilledSearchCreatedEnd'
  ].forEach(id => {
    document.getElementById(id).value = '';
  });
  ['unfilledSearchSyncStatus', 'unfilledSearchSeries', 'unfilledSearchSystemSource'].forEach(id => {
    document.getElementById(id).value = '';
  });
  resourceUnfilledCurrentPage = 1;
  renderResourceUnfilledTable();
}

function changeResourceUnfilledPageSize(value) {
  resourceUnfilledPageSize = Number(value) || 5;
  resourceUnfilledCurrentPage = 1;
  renderResourceUnfilledTable();
}

function selectResourceUnfilledPage(value) {
  resourceUnfilledCurrentPage = Number(value) || 1;
  renderResourceUnfilledTable();
}

function changeResourceUnfilledPage(dir) {
  const rows = getFilteredResourceUnfilledLeads();
  const totalPages = Math.max(1, Math.ceil(rows.length / resourceUnfilledPageSize));
  resourceUnfilledCurrentPage = Math.max(1, Math.min(totalPages, resourceUnfilledCurrentPage + dir));
  renderResourceUnfilledTable();
}
