// ===== Resource Leads =====
function initResourceLeadPage() {
  fillSelect('resourceSearchSeries', carSeriesOptions, '全部车系');
  fillSelect('resourceSearchChannelCode', channelCodeOptions, '全部');
  const provinces = [...new Set(dealerOptions.map(item => item.province))];
  fillSelect('resourceSearchProvince', provinces, '选择省份');
  updateResourceDealerCities();
  const sortSelect = document.getElementById('resourceSortField');
  if (sortSelect && sortSelect.options.length === 0) {
    sortSelect.innerHTML = resourceLeadColumns
      .map(col => `<option value="${col.key}">${col.label}</option>`)
      .join('');
    sortSelect.value = resourceLeadSortField;
    document.getElementById('resourceSortDirection').value = resourceLeadSortDirection;
  }
  renderResourceFieldPicker();
  renderResourceLeadTable();
}

function getFilteredResourceLeads() {
  const filters = {
    resourceLeadCode: document.getElementById('resourceSearchCode').value.trim(),
    dispatchStatus: document.getElementById('resourceSearchDispatchStatus').value,
    customerName: document.getElementById('resourceSearchName').value.trim(),
    phone: document.getElementById('resourceSearchPhone').value.trim(),
    intentSeries: document.getElementById('resourceSearchSeries').value,
    smartCode: document.getElementById('resourceSearchSmartCode').value.trim(),
    channelCode: document.getElementById('resourceSearchChannelCode').value,
    sourceLeadId: document.getElementById('resourceSearchSourceId').value.trim(),
    manufacturerLeadCode: document.getElementById('resourceSearchManufacturerCode').value.trim(),
    createdStart: document.getElementById('resourceSearchCreatedStart').value,
    createdEnd: document.getElementById('resourceSearchCreatedEnd').value
  };

  return resourceLeads.filter(row => {
    if (filters.createdStart && row.createdAt < filters.createdStart) return false;
    if (filters.createdEnd && row.createdAt > filters.createdEnd) return false;
    if (selectedResourceDealerCodes.length && !selectedResourceDealerCodes.includes(row.dealerCode)) return false;
    return Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      if (key === 'createdStart' || key === 'createdEnd') return true;
      if (key === 'channelCode') return row[key] === value;
      return String(row[key] || '').toLowerCase().includes(value.toLowerCase());
    });
  }).sort((a, b) => {
    const av = String(a[resourceLeadSortField] || '');
    const bv = String(b[resourceLeadSortField] || '');
    const result = av.localeCompare(bv, 'zh-CN', { numeric: true });
    return resourceLeadSortDirection === 'asc' ? result : -result;
  });
}

function renderResourceLeadTable() {
  const columns = resourceLeadColumns.filter(col => visibleResourceLeadFields.includes(col.key));
  const rows = getFilteredResourceLeads();
  const totalPages = Math.max(1, Math.ceil(rows.length / resourceLeadPageSize));
  resourceLeadCurrentPage = Math.min(resourceLeadCurrentPage, totalPages);
  const start = (resourceLeadCurrentPage - 1) * resourceLeadPageSize;
  const pageRows = rows.slice(start, start + resourceLeadPageSize);
  document.getElementById('resourceLeadPageInfo').textContent = `共 ${rows.length} 条记录，当前第 ${resourceLeadCurrentPage} / ${totalPages} 页`;

  const pageSelect = document.getElementById('resourceLeadPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, idx) => `<option value="${idx + 1}">第 ${idx + 1} 页</option>`).join('');
    pageSelect.value = String(resourceLeadCurrentPage);
  }
  const pageSizeSelect = document.getElementById('resourceLeadPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(resourceLeadPageSize);

  document.getElementById('resourceLeadTableHead').innerHTML = `
    <tr>
      ${columns.map(col => `
        <th onclick="sortResourceLeadBy('${col.key}')">
          ${col.label}${resourceLeadSortField === col.key ? `<span class="sort-indicator">${resourceLeadSortDirection === 'asc' ? '↑' : '↓'}</span>` : ''}
        </th>
      `).join('')}
      <th>操作</th>
    </tr>
  `;
  document.getElementById('resourceLeadTableBody').innerHTML = pageRows.length
    ? pageRows.map(row => `
      <tr>
        ${columns.map(col => `<td>${formatResourceLeadCell(row, col.key)}</td>`).join('')}
        <td><button class="action-btn view" type="button" onclick="openResourceLeadDetail('${row.resourceLeadCode}')">查看</button></td>
      </tr>
    `).join('')
    : `<tr><td colspan="${Math.max(columns.length + 1, 1)}"><div class="empty-state">暂无匹配的留资线索</div></td></tr>`;
}

function formatResourceLeadCell(row, key) {
  const value = row[key] || '—';
  return value;
}

function openResourceLeadDetail(resourceLeadCode) {
  const lead = resourceLeads.find(row => row.resourceLeadCode === resourceLeadCode);
  if (!lead) return;
  leadDetailSource = '留资线索';
  document.querySelector('nav[aria-label="培育策略三级菜单"]').classList.add('hidden');
  document.querySelector('.leads-nav').classList.add('show');
  setLeadNavActive('留资线索');
  setSidebarActiveByName('线索管理');
  setPageName('线索管理 / 留资线索 / 线索详情');
  setPolicyContentVisible(false);
  hideLeadPages();
  document.getElementById('designStage').classList.remove('show');
  document.getElementById('leadDetailPage').classList.add('show');
  document.getElementById('leadDetailTitle').textContent = '查看留资线索详情';
  document.getElementById('leadDetailSubtitle').textContent = `线索管理 / 留资线索 / ${lead.resourceLeadCode}`;
  document.getElementById('leadDetailSummary').innerHTML = renderResourceLeadDetailSummary(lead);
  document.getElementById('leadDetailPageBody').innerHTML = renderResourceLeadDetailPageContent(lead);
}

function renderResourceLeadDetailSummary(lead) {
  const items = [
    { label: '留资线索编码', value: detailValue(lead.resourceLeadCode) },
    { label: '客户姓名', value: detailValue(lead.customerName) },
    { label: '电话号码', value: detailValue(lead.phone) },
    { label: '下发状态', value: formatResourceLeadCell(lead, 'dispatchStatus') },
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

function renderResourceLeadDetailPageContent(lead) {
  const logs = getResourceLeadSystemLogs(lead);
  return `
    <div class="detail-tabs">
      <button class="detail-tab active" type="button" onclick="switchLeadDetailTab(this, 'resourceDetailInfoPanel')">线索详情</button>
      <button class="detail-tab" type="button" onclick="switchLeadDetailTab(this, 'resourceSystemLogPanel')">系统日志</button>
    </div>
    <div class="detail-tab-panel active" id="resourceDetailInfoPanel">
      ${getResourceLeadDetailGroups(lead).map(renderDetailSection).join('')}
    </div>
    <div class="detail-tab-panel" id="resourceSystemLogPanel">
      ${renderResourceLeadSystemLogTable(logs)}
    </div>
  `;
}

function renderResourceLeadSystemLogTable(logs) {
  return `
    <div class="log-table-card">
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

function getResourceLeadSystemLogs(lead) {
  const createdAt = lead.resourceTime || `${lead.createdAt} 09:10:22`;
  const statusTime = lead.dispatchStatus === '待下发' ? `${lead.createdAt} 14:30:00` : `${lead.createdAt} 14:35:00`;
  const dispatchDescMap = {
    '已下发': `系统已将留资线索下发至 ${lead.dealer || '目标专营店'}。`,
    '待下发': '线索已入库，等待下发任务执行。',
    '下发失败': '线索下发失败，等待系统重试或人工处理。',
    '无需下发': '系统识别该线索无需下发，保留记录用于追溯。'
  };
  return [
    {
      time: createdAt,
      node: '线索创建',
      operator: '上游系统',
      type: '接收线索',
      desc: `接收留资线索，来源线索ID ${lead.sourceLeadId || '—'}。`,
      result: '创建成功'
    },
    {
      time: createdAt,
      node: '入库校验',
      operator: '系统',
      type: '数据校验',
      desc: '完成客户信息、意向信息、门店信息和投放信息校验。',
      result: '校验通过'
    },
    {
      time: createdAt,
      node: '下发状态初始化',
      operator: '系统',
      type: '状态初始化',
      desc: '留资线索入库后初始化下发处理状态。',
      result: '待下发'
    },
    {
      time: statusTime,
      node: '下发状态变更',
      operator: '系统',
      type: '状态更新',
      desc: dispatchDescMap[lead.dispatchStatus] || '系统更新留资线索下发状态。',
      result: lead.dispatchStatus || '—'
    }
  ];
}

function getResourceLeadDetailGroups(lead) {
  const leadInfoItems = [
    { label: '线索属性', value: detailValue(lead.leadAttribute) },
    { label: '线索类型', value: detailValue(lead.leadType) },
    { label: '线索来源', value: detailValue(lead.leadSource) },
    { label: '意向级别', value: detailValue(lead.intentLevel) },
    { label: '意向价格', value: detailValue(lead.intentPrice) },
    { label: '意向品牌', value: detailValue(lead.intentBrand) },
    { label: '意向车系', value: detailValue(lead.intentSeries) },
    { label: '意向专营店', value: detailValue(lead.dealer) },
    { label: '下发状态', value: formatResourceLeadCell(lead, 'dispatchStatus') },
    { label: '留资时间', value: detailValue(lead.resourceTime) },
    { label: '线索描述', value: detailValue(lead.leadDesc) },
    { label: '线索备注', value: detailValue(lead.leadRemark) },
    { label: '来源线索ID', value: detailValue(lead.sourceLeadId) },
    { label: '原始系统来源编码', value: detailValue(lead.sourceSystemCode) },
    { label: '跟进人员id', value: detailValue(lead.followUserId) }
  ];
  return [
    {
      title: '基础信息',
      items: [
        { label: '客户姓名', value: detailValue(lead.customerName) },
        { label: '性别', value: detailValue(lead.gender) },
        { label: '电话号码', value: detailValue(lead.phone) },
        { label: '备用电话', value: detailValue(lead.backupPhone) },
        { label: 'IP地址归属地', value: detailValue(lead.ipLocation) }
      ]
    },
    {
      title: '线索信息',
      items: leadInfoItems
    },
    {
      title: '投放信息',
      items: [
        { label: 'SmartCode', value: detailValue(lead.smartCode) },
        { label: '渠道编码', value: detailValue(lead.channelCode) },
        { label: '落地平台', value: detailValue(lead.landingPlatform) },
        { label: '媒体名称', value: detailValue(lead.mediaName) },
        { label: '大项目', value: detailValue(lead.projectName) },
        { label: '线索类型', value: detailValue(lead.deliveryLeadType) }
      ]
    }
  ];
}

function filterResourceLeads() {
  resourceLeadCurrentPage = 1;
  renderResourceLeadTable();
}

function resetResourceLeadSearch() {
  ['resourceSearchCode', 'resourceSearchName', 'resourceSearchPhone', 'resourceSearchSmartCode', 'resourceSearchSourceId', 'resourceSearchManufacturerCode', 'resourceSearchCreatedStart', 'resourceSearchCreatedEnd', 'resourceDealerKeyword'].forEach(id => {
    document.getElementById(id).value = '';
  });
  ['resourceSearchDispatchStatus', 'resourceSearchSeries', 'resourceSearchChannelCode', 'resourceSearchProvince', 'resourceSearchCity'].forEach(id => {
    document.getElementById(id).value = '';
  });
  selectedResourceDealerCodes = [];
  resourceLeadCurrentPage = 1;
  updateResourceDealerCities();
  renderResourceLeadTable();
}

function changeResourceLeadSort() {
  resourceLeadSortField = document.getElementById('resourceSortField').value;
  resourceLeadSortDirection = document.getElementById('resourceSortDirection').value;
  resourceLeadCurrentPage = 1;
  renderResourceLeadTable();
}

function sortResourceLeadBy(key) {
  if (resourceLeadSortField === key) {
    resourceLeadSortDirection = resourceLeadSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    resourceLeadSortField = key;
    resourceLeadSortDirection = 'asc';
  }
  document.getElementById('resourceSortField').value = resourceLeadSortField;
  document.getElementById('resourceSortDirection').value = resourceLeadSortDirection;
  resourceLeadCurrentPage = 1;
  renderResourceLeadTable();
}

function toggleResourceFieldPicker() {
  document.getElementById('resourceFieldPicker').classList.toggle('show');
}

function renderResourceFieldPicker() {
  const picker = document.getElementById('resourceFieldPicker');
  picker.innerHTML = `
    <div class="field-picker-grid">
      ${resourceLeadColumns.map(col => `
        <label class="field-check">
          <input type="checkbox" value="${col.key}" ${visibleResourceLeadFields.includes(col.key) ? 'checked' : ''} onchange="toggleResourceLeadField(this)" />
          ${col.label}
        </label>
      `).join('')}
    </div>
  `;
}

function toggleResourceLeadField(input) {
  if (input.checked) {
    visibleResourceLeadFields = [...new Set([...visibleResourceLeadFields, input.value])];
  } else {
    visibleResourceLeadFields = visibleResourceLeadFields.filter(key => key !== input.value);
  }
  if (visibleResourceLeadFields.length === 0) {
    visibleResourceLeadFields = ['resourceLeadCode'];
  }
  renderResourceLeadTable();
}

function changeResourceLeadPageSize(value) {
  resourceLeadPageSize = Number(value) || 5;
  resourceLeadCurrentPage = 1;
  renderResourceLeadTable();
}

function selectResourceLeadPage(value) {
  resourceLeadCurrentPage = Number(value) || 1;
  renderResourceLeadTable();
}

function changeResourceLeadPage(dir) {
  const rows = getFilteredResourceLeads();
  const totalPages = Math.max(1, Math.ceil(rows.length / resourceLeadPageSize));
  resourceLeadCurrentPage = Math.max(1, Math.min(totalPages, resourceLeadCurrentPage + dir));
  renderResourceLeadTable();
}

function exportResourceLeads() {
  const columns = resourceLeadColumns.filter(col => visibleResourceLeadFields.includes(col.key));
  const rows = getFilteredResourceLeads();
  const csvRows = [
    columns.map(col => csvEscape(col.label)).join(','),
    ...rows.map(row => columns.map(col => csvEscape(row[col.key] || '')).join(','))
  ];
  downloadCsvFile(`留资线索_${new Date().toISOString().slice(0, 10)}.csv`, csvRows, `已导出 ${rows.length} 条留资线索`);
}

function updateResourceDealerCities() {
  const province = document.getElementById('resourceSearchProvince')?.value || '';
  const cities = [...new Set(dealerOptions.filter(item => !province || item.province === province).map(item => item.city))];
  fillSelect('resourceSearchCity', cities, '选择城市');
  renderResourceDealerPicker();
}

function getVisibleResourceDealers() {
  const province = document.getElementById('resourceSearchProvince')?.value || '';
  const city = document.getElementById('resourceSearchCity')?.value || '';
  const keyword = document.getElementById('resourceDealerKeyword')?.value.trim().toLowerCase() || '';
  return dealerOptions.filter(item => {
    if (province && item.province !== province) return false;
    if (city && item.city !== city) return false;
    if (!keyword) return true;
    return item.name.toLowerCase().includes(keyword) || item.code.toLowerCase().includes(keyword);
  });
}

function toggleResourceDealerPicker() {
  document.getElementById('resourceDealerPickerPanel').classList.toggle('show');
  renderResourceDealerPicker();
}

function renderResourceDealerPicker() {
  const dealers = getVisibleResourceDealers();
  const list = document.getElementById('resourceDealerOptionList');
  if (!list) return;
  list.innerHTML = dealers.length
    ? dealers.map(item => `
      <label class="dealer-option">
        <input type="checkbox" value="${item.code}" ${selectedResourceDealerCodes.includes(item.code) ? 'checked' : ''} onchange="toggleResourceDealerSelection(this)" />
        <span>
          <div class="dealer-name">${item.name}</div>
          <div class="dealer-meta">${item.code}｜${item.province} ${item.city} ${item.district}</div>
        </span>
      </label>
    `).join('')
    : '<div class="empty-state" style="padding:24px 12px">暂无匹配门店</div>';

  const visibleCodes = dealers.map(item => item.code);
  const checkedVisibleCount = visibleCodes.filter(code => selectedResourceDealerCodes.includes(code)).length;
  const selectedCount = document.getElementById('resourceDealerSelectedCount');
  if (selectedCount) selectedCount.textContent = `已选 ${selectedResourceDealerCodes.length} / ${dealers.length}`;
  const selectAll = document.getElementById('resourceDealerSelectAll');
  if (selectAll) selectAll.checked = dealers.length > 0 && checkedVisibleCount === dealers.length;
  updateResourceDealerTrigger();
}

function updateResourceDealerTrigger() {
  const trigger = document.getElementById('resourceDealerSelectTrigger');
  if (!trigger) return;
  const selectedNames = dealerOptions.filter(item => selectedResourceDealerCodes.includes(item.code)).map(item => item.name);
  trigger.textContent = selectedNames.length ? selectedNames.slice(0, 2).join('、') + (selectedNames.length > 2 ? ` 等${selectedNames.length}家` : '') : '暂未选择门店';
  trigger.classList.toggle('has-value', selectedNames.length > 0);
}

function toggleResourceDealerSelection(input) {
  if (input.checked) {
    selectedResourceDealerCodes = [...new Set([...selectedResourceDealerCodes, input.value])];
  } else {
    selectedResourceDealerCodes = selectedResourceDealerCodes.filter(code => code !== input.value);
  }
  renderResourceDealerPicker();
}

function toggleAllVisibleResourceDealers(checked) {
  const visibleCodes = getVisibleResourceDealers().map(item => item.code);
  selectedResourceDealerCodes = checked
    ? [...new Set([...selectedResourceDealerCodes, ...visibleCodes])]
    : selectedResourceDealerCodes.filter(code => !visibleCodes.includes(code));
  renderResourceDealerPicker();
}

function clearSelectedResourceDealers() {
  selectedResourceDealerCodes = [];
  renderResourceDealerPicker();
  renderResourceLeadTable();
}
