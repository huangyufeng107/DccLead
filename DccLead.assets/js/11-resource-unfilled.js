function initResourceUnfilledPage() {
  initResourceUnfilledCapacitySlots();
  renderResourceUnfilledDashboard();
  renderResourceUnfilledCrowdSmartCodeTable();
  renderResourceUnfilledCapacityConfig();
  renderResourceUnfilledBatchTable();
  updateResourceUnfilledRuleOverview();
  toggleResourceUnfilledConfig(false);
}

let activeResourceUnfilledBatchDetailDate = '';
let resourceUnfilledBatchDetailCurrentPage = 1;
let resourceUnfilledBatchDetailPageSize = 10;
let resourceUnfilledBatchDetailFilters = { unfilledId: '', systemStatus: '', customerName: '', phone: '', intentSeries: '', dealer: '', dataSource: '', systemSource: '', smartCode: '', nurtureLeadCode: '', startDate: '', endDate: '' };
let resourceUnfilledBatchDetailMoreFiltersExpanded = false;

let resourceUnfilledCrowdSmartCodeMappings = [
  {
    id: '1980944979051212801',
    crowdTag: 'N6高意向-广州',
    smartCode: { code: 'SC_OFFICIAL_WEB_001', name: '官网留资主通道', channel: '官网', status: '正常生效' },
    createdAt: '2025-10-22 18:31:02',
    createdBy: 'chenxinyi',
    updatedAt: '2025-10-22 18:31:02',
    updatedBy: 'chenxinyi'
  },
  {
    id: '1980944947885965313',
    crowdTag: '轩逸私域唤醒',
    smartCode: { code: 'SC_NISSAN_MP_001', name: '小程序活动引流通道', channel: '微信小程序', status: '正常生效' },
    createdAt: '2025-10-22 18:30:54',
    createdBy: 'chenxinyi',
    updatedAt: '2025-10-22 18:30:54',
    updatedBy: 'chenxinyi'
  },
  {
    id: '1980944902283120641',
    crowdTag: '直播留资补全',
    smartCode: { code: 'SC_NISSAN_APP_001', name: 'APP核心触达通道', channel: '日产智联APP', status: '正常生效' },
    createdAt: '2025-10-22 18:30:44',
    createdBy: 'chenxinyi',
    updatedAt: '2025-10-22 18:30:44',
    updatedBy: 'chenxinyi'
  },
  {
    id: '1980944893712047105',
    crowdTag: '奇骏试驾召回',
    smartCode: { code: 'SC_OFFICIAL_WEB_002', name: '官网留资备用通道', channel: '官网', status: '正常生效' },
    createdAt: '2025-10-22 18:29:56',
    createdBy: 'chenxinyi',
    updatedAt: '2025-10-22 18:29:56',
    updatedBy: 'chenxinyi'
  },
  {
    id: '1980944879560836092',
    crowdTag: '重复留资识别',
    smartCode: { code: 'SC_NISSAN_MP_002', name: '小程序留资补充通道', channel: '微信小程序', status: '正常生效' },
    createdAt: '2025-10-22 18:28:31',
    createdBy: 'chenxinyi',
    updatedAt: '2025-10-22 18:28:31',
    updatedBy: 'chenxinyi'
  },
  {
    id: '1980944865427806178',
    crowdTag: '天籁到店邀约',
    smartCode: { code: 'SC_NISSAN_APP_002', name: 'APP权益触达通道', channel: '日产智联APP', status: '正常生效' },
    createdAt: '2025-10-22 18:27:08',
    createdBy: 'chenxinyi',
    updatedAt: '2025-10-22 18:27:08',
    updatedBy: 'chenxinyi'
  },
  {
    id: '1980944851269643007',
    crowdTag: '逍客置换意向',
    smartCode: { code: 'SC_SOCIAL_001', name: '私域社群承接通道', channel: '私域运营', status: '正常生效' },
    createdAt: '2025-10-22 18:26:12',
    createdBy: 'chenxinyi',
    updatedAt: '2025-10-22 18:26:12',
    updatedBy: 'chenxinyi'
  }
];

// 数据字段管理 > 人群包标签：用于留资未满规则配置的可选值。
const resourceUnfilledCrowdPackageTagFieldValues = [
  'N6高意向-广州',
  '轩逸私域唤醒',
  '直播留资补全',
  '奇骏试驾召回',
  '重复留资识别',
  '天籁到店邀约',
  '逍客置换意向',
  '骐达首购意向',
  '劲客焕新意向',
  '探陆家庭出行'
];

const resourceUnfilledSmartCodeOptions = [
  { code: 'SC_OFFICIAL_WEB_001', name: '官网留资主通道', channel: '官网' },
  { code: 'SC_OFFICIAL_WEB_002', name: '官网留资备用通道', channel: '官网' },
  { code: 'SC_NISSAN_MP_001', name: '小程序活动引流通道', channel: '微信小程序' },
  { code: 'SC_NISSAN_APP_001', name: 'APP核心触达通道', channel: '日产智联APP' },
  { code: 'SC_NISSAN_MP_002', name: '小程序留资补充通道', channel: '微信小程序' },
  { code: 'SC_NISSAN_APP_002', name: 'APP权益触达通道', channel: '日产智联APP' },
  { code: 'SC_SOCIAL_001', name: '私域社群承接通道', channel: '私域运营' }
];

function switchResourceUnfilledRuleTab(tab) {
  const btnCrowd = document.querySelector('#resourceUnfilledRuleTabs [data-tab="unfilled-crowd-smartcode"]');
  const btnCapacity = document.querySelector('#resourceUnfilledRuleTabs [data-tab="unfilled-time-capacity"]');
  const sectionCrowd = document.getElementById('unfilledCrowdSmartCodeSection');
  const sectionCapacity = document.getElementById('unfilledTimeCapacitySection');
  const addBtn = document.getElementById('addCrowdSmartCodeBtn');
  const configContent = document.getElementById('resourceUnfilledConfigContent');

  if (tab === 'unfilled-crowd-smartcode') {
    btnCrowd?.classList.add('active');
    btnCapacity?.classList.remove('active');
    if (sectionCrowd) sectionCrowd.style.display = 'block';
    if (sectionCapacity) sectionCapacity.style.display = 'none';
    if (addBtn) addBtn.style.display = 'inline-flex';
  } else {
    btnCrowd?.classList.remove('active');
    btnCapacity?.classList.add('active');
    if (sectionCrowd) sectionCrowd.style.display = 'none';
    if (sectionCapacity) sectionCapacity.style.display = 'block';
    if (addBtn) addBtn.style.display = 'none';
  }
  if (configContent?.classList.contains('is-collapsed')) toggleResourceUnfilledConfig(true);
  updateResourceUnfilledRuleOverview();
}

function toggleResourceUnfilledConfig(expand) {
  const content = document.getElementById('resourceUnfilledConfigContent');
  const toggle = document.getElementById('resourceUnfilledConfigToggle');
  if (!content || !toggle) return;

  const shouldExpand = typeof expand === 'boolean' ? expand : content.classList.contains('is-collapsed');
  content.classList.toggle('is-collapsed', !shouldExpand);
  toggle.textContent = shouldExpand ? '收起配置' : '展开配置';
  toggle.setAttribute('aria-expanded', String(shouldExpand));
}

function updateResourceUnfilledRuleOverview() {
  const uniqueSmartCodes = new Set();
  resourceUnfilledCrowdSmartCodeMappings.forEach(item => {
    if (item.smartCode?.code) uniqueSmartCodes.add(item.smartCode.code);
  });

  const activeSlots = resourceUnfilledCapacitySlots.filter(slot => Number(slot.capacity) > 0);
  const totalCapacity = resourceUnfilledCapacitySlots.reduce((sum, slot) => sum + Number(slot.capacity || 0), 0);

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  setText('crowdMappingCount', resourceUnfilledCrowdSmartCodeMappings.length.toLocaleString());
  setText('crowdSmartCodeCount', uniqueSmartCodes.size.toLocaleString());
  setText('capacityActiveSlotCount', activeSlots.length.toLocaleString());
  setText('capacityTotalLimit', totalCapacity.toLocaleString());
  setText('capacityActiveSlotText', `${activeSlots.length.toLocaleString()} 个`);
  setText('capacityDailyTotalText', totalCapacity.toLocaleString());
  setText('crowdMappingTabCount', resourceUnfilledCrowdSmartCodeMappings.length.toLocaleString());
  setText('capacitySlotTabCount', `${activeSlots.length.toLocaleString()} 个`);
  updateResourceUnfilledCapacityDirtyState();
}

function renderResourceUnfilledCrowdSmartCodeTable() {
  const body = document.getElementById('crowdSmartCodeTableBody');
  if (!body) return;
  updateResourceUnfilledRuleOverview();

  const rows = resourceUnfilledCrowdSmartCodeMappings;

  if (!rows.length) {
    body.innerHTML = `<tr><td colspan="4"><div class="empty-state">暂无人群包与SmartCode映射关系</div></td></tr>`;
    return;
  }

  body.innerHTML = rows.map((item, index) => `
    <tr>
      <td class="col-num">${index + 1}</td>
      <td class="resource-unfilled-mapping-text">${escapeHtml(item.crowdTag)}</td>
      <td><a href="javascript:void(0)" class="resource-unfilled-mapping-text resource-unfilled-smartcode-link" onclick="viewCrowdSmartCodes('${item.id}')">${escapeHtml(item.smartCode?.code || '-')}</a></td>
      <td>
        <div class="action-btns">
          <button class="action-btn edit" type="button" onclick="openCrowdSmartCodeModal('${item.id}')">编辑</button>
          <button class="action-btn delete" type="button" onclick="deleteCrowdSmartCode('${item.id}')">删除</button>
        </div>
      </td>
    </tr>
  `).join('');
}

function renderCrowdSmartCodePickerOptions(selectedCode = '') {
  const list = document.getElementById('smartCodeRadioList');
  if (!list) return;
  list.innerHTML = resourceUnfilledSmartCodeOptions.map(item => `
    <label class="resource-unfilled-smartcode-option ${selectedCode === item.code ? 'selected' : ''}" data-crowd-smartcode-option="${escapeHtml(item.code)}">
      <input type="radio" name="smartCodeItem" value="${escapeHtml(item.code)}" ${selectedCode === item.code ? 'checked' : ''} onchange="selectCrowdSmartCodeFromPicker(this)" />
      <span class="resource-unfilled-smartcode-option-main">${escapeHtml(item.code)}</span>
      <span class="resource-unfilled-smartcode-option-name">${escapeHtml(item.name)}</span>
    </label>
  `).join('');
  updateCrowdSmartCodePickerSummary();
}

function renderCrowdTagPicker(selectedTag = '') {
  const select = document.getElementById('crowdTagSelect');
  const list = document.getElementById('crowdTagOptionList');
  const trigger = document.getElementById('crowdTagTrigger');
  const count = document.getElementById('crowdTagAvailableCount');
  const empty = document.getElementById('crowdTagPickerEmpty');
  if (!select || !list || !trigger) return;

  const options = Array.from(select.options).filter(option => option.value && !option.disabled);
  list.innerHTML = options.map(option => `
    <button type="button" class="resource-unfilled-crowd-tag-option ${option.value === selectedTag ? 'selected' : ''}" onclick="selectCrowdTag('${escapeHtml(option.value)}')">
      <span>${escapeHtml(option.textContent)}</span>
      ${option.value === selectedTag ? '<b>✓</b>' : ''}
    </button>
  `).join('');
  trigger.textContent = selectedTag || '请选择人群包标签';
  trigger.classList.toggle('placeholder', !selectedTag);
  if (count) count.textContent = `可选标签（${options.length}）`;
  if (empty) empty.style.display = options.length ? 'none' : 'block';
}

function toggleCrowdTagPicker() {
  document.getElementById('crowdSmartCodePickerDropdown')?.classList.remove('show');
  document.getElementById('crowdTagDropdown')?.classList.toggle('show');
}

function selectCrowdTag(tag) {
  const select = document.getElementById('crowdTagSelect');
  if (!select) return;
  select.value = tag;
  renderCrowdTagPicker(tag);
  document.getElementById('crowdTagDropdown')?.classList.remove('show');
}

function openCrowdSmartCodePicker() {
  document.getElementById('crowdTagDropdown')?.classList.remove('show');
  document.getElementById('crowdSmartCodePickerDropdown')?.classList.add('show');
}

function toggleCrowdSmartCodePicker() {
  document.getElementById('crowdTagDropdown')?.classList.remove('show');
  document.getElementById('crowdSmartCodePickerDropdown')?.classList.toggle('show');
}

function selectCrowdSmartCodeFromPicker(input) {
  if (!input?.checked) return;
  document.querySelectorAll('#smartCodeRadioList .resource-unfilled-smartcode-option').forEach(option => {
    option.classList.toggle('selected', option.querySelector('input') === input);
  });
  updateCrowdSmartCodePickerSummary();
  document.getElementById('crowdSmartCodePickerDropdown')?.classList.remove('show');
}

function clearCrowdSmartCodePicker() {
  document.querySelectorAll('#smartCodeRadioList input[name="smartCodeItem"]').forEach(input => { input.checked = false; });
  document.querySelectorAll('#smartCodeRadioList .resource-unfilled-smartcode-option').forEach(option => option.classList.remove('selected'));
  const input = document.getElementById('crowdSmartCodeSearchInput');
  if (input) input.value = '';
  updateCrowdSmartCodePickerSummary();
  filterCrowdSmartCodeOptions();
}

function updateCrowdSmartCodePickerSummary() {
  const selected = document.querySelector('#smartCodeRadioList input[name="smartCodeItem"]:checked')?.value || '';
  const input = document.getElementById('crowdSmartCodeSearchInput');
  if (input && selected) input.value = selected;
}

function filterCrowdSmartCodeOptions(keyword = '') {
  const normalized = String(keyword).trim().toLowerCase();
  document.querySelectorAll('#smartCodeRadioList input[name="smartCodeItem"]:checked').forEach(input => {
    if (input.value !== keyword) {
      input.checked = false;
      input.closest('.resource-unfilled-smartcode-option')?.classList.remove('selected');
    }
  });
  let visibleCount = 0;
  document.querySelectorAll('#smartCodeRadioList [data-crowd-smartcode-option]').forEach(option => {
    const visible = option.textContent.toLowerCase().includes(normalized);
    option.style.display = visible ? '' : 'none';
    if (visible) visibleCount += 1;
  });
  const empty = document.getElementById('crowdSmartCodeSearchEmpty');
  if (empty) empty.style.display = visibleCount ? 'none' : 'block';
  const manual = document.getElementById('crowdSmartCodeManualOption');
  if (manual) {
    manual.style.display = normalized && !resourceUnfilledSmartCodeOptions.some(option => option.code.toLowerCase() === normalized) ? '' : 'none';
    manual.textContent = normalized ? `使用“${keyword.trim()}”作为 SmartCode` : '';
  }
}

function useCrowdSmartCodeTypedValue() {
  const input = document.getElementById('crowdSmartCodeSearchInput');
  if (!input?.value.trim()) return;
  document.querySelectorAll('#smartCodeRadioList input[name="smartCodeItem"]').forEach(item => { item.checked = false; });
  document.querySelectorAll('#smartCodeRadioList .resource-unfilled-smartcode-option').forEach(option => option.classList.remove('selected'));
  document.getElementById('crowdSmartCodePickerDropdown')?.classList.remove('show');
}

function openCrowdSmartCodeModal(id = null) {
  const modal = document.getElementById('addCrowdSmartCodeModal');
  const title = document.getElementById('crowdSmartCodeModalTitle');
  const form = document.getElementById('crowdSmartCodeForm');
  const crowdTagSelect = document.getElementById('crowdTagSelect');
  if (!modal || !form) return;

  form.reset();
  document.getElementById('crowdSmartCodeMappingId').value = id || '';
  const item = id ? resourceUnfilledCrowdSmartCodeMappings.find(m => m.id === id) : null;
  if (crowdTagSelect) {
    const usedTags = new Set(resourceUnfilledCrowdSmartCodeMappings.filter(mapping => mapping.id !== id).map(mapping => mapping.crowdTag));
    crowdTagSelect.innerHTML = `<option value="">请选择人群包标签</option>${resourceUnfilledCrowdPackageTagFieldValues.map(tag => `<option value="${escapeHtml(tag)}" ${usedTags.has(tag) ? 'disabled' : ''}>${escapeHtml(tag)}${usedTags.has(tag) ? '（已关联）' : ''}</option>`).join('')}`;
  }
  renderCrowdTagPicker(item?.crowdTag || '');
  renderCrowdSmartCodePickerOptions(item?.smartCode?.code || '');
  document.getElementById('crowdSmartCodeSearchInput').value = item?.smartCode?.code || '';
  filterCrowdSmartCodeOptions();

  if (item) {
    if (title) title.textContent = '编辑人群包与SmartCode映射';
    if (crowdTagSelect) crowdTagSelect.value = item.crowdTag;
    renderCrowdTagPicker(item.crowdTag);
  } else {
    if (title) title.textContent = '新增人群包与SmartCode映射';
  }
  modal.classList.add('show');
}

function closeCrowdSmartCodeModal() {
  document.getElementById('addCrowdSmartCodeModal')?.classList.remove('show');
}

function saveCrowdSmartCodeMapping(event) {
  event.preventDefault();
  const id = document.getElementById('crowdSmartCodeMappingId')?.value;
  const crowdTag = document.getElementById('crowdTagSelect')?.value;

  if (!crowdTag) {
    showToast('请选择人群包标签', false);
    return;
  }

  const selectedCode = document.querySelector('#smartCodeRadioList input[name="smartCodeItem"]:checked')?.value
    || document.getElementById('crowdSmartCodeSearchInput')?.value.trim();
  if (!selectedCode) {
    showToast('请选择 SmartCode', false);
    return;
  }

  const selectedOption = resourceUnfilledSmartCodeOptions.find(option => option.code === selectedCode);
  const smartCode = {
    code: selectedCode,
    name: selectedOption?.name || '手动录入通道',
    channel: selectedOption?.channel || '手动输入',
    status: '正常生效'
  };

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const nowStr = `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;

  if (id) {
    const item = resourceUnfilledCrowdSmartCodeMappings.find(m => m.id === id);
    if (item) {
      item.crowdTag = crowdTag;
      item.smartCode = smartCode;
      item.updatedAt = nowStr;
      item.updatedBy = 'chenxinyi';
      showToast('已更新人群包与SmartCode映射配置', true);
    }
  } else {
    const newId = `19809449${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    resourceUnfilledCrowdSmartCodeMappings.unshift({
      id: newId,
      crowdTag,
      smartCode,
      createdAt: nowStr,
      createdBy: 'chenxinyi',
      updatedAt: nowStr,
      updatedBy: 'chenxinyi'
    });
    showToast('已新增人群包与SmartCode映射配置', true);
  }

  closeCrowdSmartCodeModal();
  renderResourceUnfilledCrowdSmartCodeTable();
}

function deleteCrowdSmartCode(id) {
  const item = resourceUnfilledCrowdSmartCodeMappings.find(m => m.id === id);
  if (!item) return;
  if (!confirm(`确认要删除人群包标签「${item.crowdTag}」与 SmartCode 的映射关系吗？`)) return;

  resourceUnfilledCrowdSmartCodeMappings = resourceUnfilledCrowdSmartCodeMappings.filter(m => m.id !== id);
  renderResourceUnfilledCrowdSmartCodeTable();
  showToast('已成功删除映射关系配置', true);
}

function viewCrowdSmartCodes(id) {
  const item = resourceUnfilledCrowdSmartCodeMappings.find(m => m.id === id);
  if (!item) return;
  const modal = document.getElementById('viewCrowdSmartCodesModal');
  const body = document.getElementById('viewCrowdSmartCodesModalBody');
  if (!modal || !body) return;

  body.innerHTML = `
    <div style="margin-bottom: 14px; background: #f8fafc; padding: 12px; border-radius: 6px; border-left: 4px solid #2563eb;">
      <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">人群包标签</div>
      <div style="font-weight: 700; color: #1e293b; font-size: 14px;">${escapeHtml(item.crowdTag)}</div>
      <div style="font-size: 12px; color: #94a3b8; margin-top: 4px;">主键ID: ${escapeHtml(item.id)}</div>
    </div>
    <div style="font-size: 13px; font-weight: 600; color: #1e293b; margin-bottom: 8px;">关联 SmartCode</div>
    <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px;">
      <div>
        <div style="font-weight: 700; color: #2563eb; font-family: monospace; font-size: 13px;">${escapeHtml(item.smartCode?.code || '-')}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${escapeHtml(item.smartCode?.name || '默认通道')} · ${escapeHtml(item.smartCode?.channel || '跨渠道')}</div>
      </div>
      <span class="col-status-on" style="font-size: 12px;">● ${escapeHtml(item.smartCode?.status || '生效中')}</span>
    </div>
  `;

  modal.classList.add('show');
}

function closeViewCrowdSmartCodesModal() {
  document.getElementById('viewCrowdSmartCodesModal')?.classList.remove('show');
}

let resourceUnfilledCapacitySlots = [];
let resourceUnfilledCapacityDirtySlots = new Set();

function initResourceUnfilledCapacitySlots() {
  if (resourceUnfilledCapacitySlots.length) return;
  resourceUnfilledCapacitySlots = Array.from({ length: 48 }, (_, index) => {
    const startMinutes = index * 30;
    const endMinutes = startMinutes + 29;
    const toTime = minutes => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
    const hour = Math.floor(startMinutes / 60);
    const capacity = hour >= 9 && hour < 19 ? 1000 : 0;
    return {
      id: `LZWM-CAP-${String(index + 1).padStart(2, '0')}`,
      slot: `${toTime(startMinutes)}~${toTime(endMinutes)}`,
      capacity,
      remaining: capacity,
      createdAt: '2026-07-21 00:00:00',
      createdBy: 'system',
      updatedAt: '2026-07-21 00:00:00',
      updatedBy: '古国琼'
    };
  });
}

function renderResourceUnfilledDashboard() {
  const batchTotals = resourceUnfilledBatchRecords.reduce((totals, row) => ({
    total: totals.total + row.total,
    dedupe: totals.dedupe + row.dedupe,
    dccTasks: totals.dccTasks + row.dccTasks,
    syncFailed: totals.syncFailed + row.syncFailed
  }), { total: 0, dedupe: 0, dccTasks: 0, syncFailed: 0 });
  const rolloverCount = resourceUnfilledBatchRecords[0]?.rollover || 0;
  const target = document.getElementById('resourceUnfilledDashboard');
  if (!target) return;
  target.innerHTML = [
    { label: '累计总量', value: batchTotals.total.toLocaleString(), desc: '统计周期内进入待推送池的数据总量', tone: 'primary' },
    { label: '去重过滤', value: batchTotals.dedupe.toLocaleString(), desc: '同步状态为“冲突重复”', tone: '' },
    { label: 'DCC培育任务', value: batchTotals.dccTasks.toLocaleString(), desc: '已成功生成培育任务', tone: 'success' },
    { label: '同步失败', value: batchTotals.syncFailed.toLocaleString(), desc: '任务同步异常，待自动重试', tone: 'danger' },
    { label: '滚存待推送', value: rolloverCount.toLocaleString(), desc: '按优先级顺延', tone: 'warning' }
  ].map(item => `
    <button class="worry-free-metric worry-free-metric-button ${item.tone}" type="button" onclick="showResourceUnfilledMetricInfo('${item.label}', this)">
      <div class="metric-label">${item.label}</div>
      <div class="metric-value">${item.value}</div>
      <div class="metric-sub">${item.desc}</div>
    </button>
  `).join('');
}

function showResourceUnfilledMetricInfo(metric, element) {
  const ev = window.event;
  if (ev) {
    ev.stopPropagation();
    if (ev.preventDefault) ev.preventDefault();
  }
  const descriptions = {
    '累计总量': '当前统计周期内，留资未满流程进入待推送池的数据总量。',
    '去重过滤': '仅统计同步状态为“冲突重复”的数据。这类线索现阶段已存在跟进记录，不再推送给 DCC 系统。',
    'DCC培育任务': '完成去重筛选，并在当前时段容量允许范围内，成功生成并推送至 DCC 的培育任务数量。',
    '同步失败': '留资未满任务同步至 DCC 培育流程时发生接口异常、超时或返回失败的数量。',
    '滚存待推送': '当日推送 DCC 的容量已经满额，未完成推送的数据放入滚存池，在下一批次（即次日）继续执行。'
  };
  const popover = document.getElementById('metricInfoPopover');
  const trigger = element || window.event?.target?.closest?.('.worry-free-metric-button') || document.activeElement?.closest('.worry-free-metric-button');
  if (!popover || !trigger) return;
  if (typeof closePreDialerMetricInfo === 'function') closePreDialerMetricInfo();
  trigger.classList.add('metric-info-active');
  const action = `<button class="metric-info-popover-action" type="button" onclick="openResourceUnfilledMetricRuleModal('${metric}')">点击查看指标规则 →</button>`;
  popover.innerHTML = `<div class="metric-info-popover-head"><div class="metric-info-popover-title">${metric} · 指标说明</div><button class="metric-info-popover-close" type="button" aria-label="关闭指标说明" onclick="closePreDialerMetricInfo()">×</button></div><div class="metric-info-popover-body">${descriptions[metric] || '用于监控留资未满批次处理表现，请结合批次记录综合判断。'}</div>${action}`;
  popover.classList.add('show');
  const rect = trigger.getBoundingClientRect();
  const width = Math.min(360, window.innerWidth - 32);
  const left = Math.max(16, Math.min(rect.left, window.innerWidth - width - 16));
  let top = rect.bottom + 10;
  if (top + popover.offsetHeight > window.innerHeight - 16) top = Math.max(16, rect.top - popover.offsetHeight - 10);
  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

function renderResourceUnfilledMetricRule(rule) {
  return `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 4px;">
        <div style="font-weight: 600; color: #1e293b; font-size: 14px; margin-bottom: 6px;">指标核心定义</div>
        <div style="color: #475569; font-size: 13px; line-height: 1.6;">${rule.desc}</div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <div style="font-weight: 600; color: #1e293b; font-size: 13px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            计算逻辑 / 口径公式
          </div>
          <div style="background: #f1f5f9; padding: 10px 14px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #0f172a; line-height: 1.5; word-break: break-all;">${rule.formula}</div>
        </div>

        <div>
          <div style="font-weight: 600; color: #1e293b; font-size: 13px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            SLA 监控规则与阈值
          </div>
          <div style="color: #475569; font-size: 13px; line-height: 1.5; padding-left: 20px;">${rule.sla}</div>
        </div>
      </div>
    </div>
  `;
}

function openResourceUnfilledMetricRuleModal(metric, element) {
  const ev = window.event;
  if (ev) {
    ev.stopPropagation();
    if (ev.preventDefault) ev.preventDefault();
  }
  if (typeof closePreDialerMetricInfo === 'function') closePreDialerMetricInfo();

  const modal = document.getElementById('metricRuleModal');
  const title = document.getElementById('metricRuleModalTitle');
  const body = document.getElementById('metricRuleModalBody');
  if (!modal || !title || !body) return;

  title.innerText = `${metric} · 指标口径与规则`;

  const rules = {
    '累计总量': {
      desc: '当前统计周期内，留资未满流程进入待推送池的数据总量。',
      formula: '留资未满待推送池累计数据总量',
      sla: '数据接收接口响应时间 ≤ 200ms；批次统计按系统配置周期自动刷新。'
    },
    '去重过滤': {
      desc: '仅统计同步状态为“冲突重复”的数据。这类线索现阶段已存在跟进记录，不再推送给 DCC 系统。',
      formula: '同步状态 = 冲突重复 的线索数量',
      sla: '去重判定需在批次生成前完成，避免重复下发造成坐席重复跟进。'
    },
    'DCC培育任务': {
      desc: '完成去重筛选，并在当前时段容量允许范围内，成功生成并推送至 DCC 的培育任务数量。',
      formula: '累计总量 - 去重过滤 - 同步失败 - 滚存待推送',
      sla: '时段容量未满时实时下发；当前时段容量满额后，不再继续推送至 DCC。'
    },
    '同步失败': {
      desc: '留资未满任务同步至 DCC 培育流程时发生接口异常、超时或返回失败的数量。',
      formula: '同步接口返回失败或超时的任务数量',
      sla: '系统按重试策略自动补偿；持续失败的数据需进入异常监控并支持人工核查。'
    },
    '滚存待推送': {
      desc: '当日推送 DCC 的容量已经满额，未完成推送的数据放入滚存池，在下一批次（即次日）继续执行。',
      formula: '当前批次待推送量 - 当前时段可用剩余容量',
      sla: '每 30 分钟维护可推送至 DCC 的容量；容量用尽后自动滚存至下一批次。'
    }
  };

  const rule = rules[metric] || {
    desc: '用于监控留资未满批次处理表现，请结合批次记录综合判断。',
    formula: '统计结果总额求和',
    sla: '数据接口对接及时率要求 100%。'
  };
  body.innerHTML = renderResourceUnfilledMetricRule(rule);
  modal.classList.add('show');
}

function renderResourceUnfilledCapacityConfig() {
  const target = document.getElementById('resourceUnfilledCapacityGrid');
  if (!target) return;
  updateResourceUnfilledRuleOverview();
  const selectedIds = new Set(getResourceUnfilledCapacityRangeSlots().map(slot => slot.id));
  target.innerHTML = resourceUnfilledCapacitySlots.map(slot => `
    <button class="resource-unfilled-capacity-slot ${Number(slot.capacity) > 0 ? 'is-active' : 'is-empty'} ${selectedIds.has(slot.id) ? 'is-selected' : ''} ${resourceUnfilledCapacityDirtySlots.has(slot.id) ? 'is-dirty' : ''}" type="button" onclick="editResourceUnfilledCapacity('${slot.id}')">
      <span>${slot.slot}</span>
      <strong>${Number(slot.capacity) > 0 ? slot.capacity.toLocaleString() : '不推送'}</strong>
      <small>${Number(slot.capacity) > 0 ? `剩余 ${slot.remaining.toLocaleString()}` : '容量 0'}</small>
    </button>
  `).join('');
}

function getResourceUnfilledCapacityRangeSlots() {
  const range = document.getElementById('resourceUnfilledCapacityRange')?.value || '08:00-18:29';
  if (range === '00:00-23:59') return resourceUnfilledCapacitySlots;
  return resourceUnfilledCapacitySlots.filter(slot => {
    const [hour, minute] = slot.slot.slice(0, 5).split(':').map(Number);
    const startMinutes = hour * 60 + minute;
    return startMinutes >= 8 * 60 && startMinutes <= 18 * 60;
  });
}

function syncResourceUnfilledCapacityRangeSelection() {
  renderResourceUnfilledCapacityConfig();
}

function applyResourceUnfilledCapacityBatch() {
  const value = Number(document.getElementById('resourceUnfilledCapacityBatchValue')?.value);
  if (!Number.isInteger(value) || value < 0) {
    showToast('请输入大于或等于 0 的每时段容量', false);
    return;
  }
  getResourceUnfilledCapacityRangeSlots().forEach(slot => {
    slot.capacity = value;
    slot.remaining = value;
    resourceUnfilledCapacityDirtySlots.add(slot.id);
  });
  renderResourceUnfilledCapacityConfig();
}

function clearResourceUnfilledCapacityBatch() {
  getResourceUnfilledCapacityRangeSlots().forEach(slot => {
    slot.capacity = 0;
    slot.remaining = 0;
    resourceUnfilledCapacityDirtySlots.add(slot.id);
  });
  renderResourceUnfilledCapacityConfig();
}

function updateResourceUnfilledCapacityDirtyState() {
  const dirtyCount = resourceUnfilledCapacityDirtySlots.size;
  const text = document.getElementById('resourceUnfilledCapacityDirtyText');
  const button = document.getElementById('saveResourceUnfilledCapacityBtn');
  if (text) text.textContent = dirtyCount ? `已修改 ${dirtyCount} 个时段，待保存` : '暂无待保存变更';
  if (button) button.disabled = !dirtyCount;
}

function commitResourceUnfilledCapacityChanges() {
  if (!resourceUnfilledCapacityDirtySlots.size) return;
  resourceUnfilledCapacityDirtySlots.forEach(id => {
    const slot = resourceUnfilledCapacitySlots.find(item => item.id === id);
    if (slot) {
      slot.updatedAt = '2026-07-21 10:30:00';
      slot.updatedBy = '当前操作人';
    }
  });
  const changedCount = resourceUnfilledCapacityDirtySlots.size;
  resourceUnfilledCapacityDirtySlots.clear();
  renderResourceUnfilledCapacityConfig();
  showToast(`已保存 ${changedCount} 个时段容量`, true);
}

function editResourceUnfilledCapacity(slotId) {
  const slot = resourceUnfilledCapacitySlots.find(item => item.id === slotId);
  if (!slot) return;
  document.getElementById('resourceUnfilledCapacityModal')?.remove();
  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal-overlay show" id="resourceUnfilledCapacityModal" onclick="if(event.target === this) closeResourceUnfilledCapacityModal()">
      <div class="modal resource-unfilled-capacity-modal-window">
        <div class="modal-header"><span>编辑时段容量</span><button class="modal-close" type="button" onclick="closeResourceUnfilledCapacityModal()">×</button></div>
        <div class="modal-body resource-unfilled-capacity-modal">
          <div class="form-field"><label>配置时段</label><div class="form-readonly">${slot.slot}</div></div>
          <div class="form-field"><label>容量 <em>*</em></label><input id="resourceUnfilledCapacityInput" class="form-input" type="number" min="0" step="1" inputmode="numeric" oninput="this.value=this.value.replace(/\\D/g,'')" value="${slot.capacity}" placeholder="请输入非负整数" /></div>
          <div class="form-hint">该时段容量用尽后，未推送的数据将自动滚存至下一批次（次日）执行。</div>
        </div>
        <div class="modal-footer"><button class="btn-secondary" type="button" onclick="closeResourceUnfilledCapacityModal()">取消</button><button class="btn-primary" type="button" onclick="saveResourceUnfilledCapacity('${slot.id}')">保存</button></div>
      </div>
    </div>
  `);
}

function closeResourceUnfilledCapacityModal() {
  document.getElementById('resourceUnfilledCapacityModal')?.remove();
}

function saveResourceUnfilledCapacity(slotId) {
  const input = document.getElementById('resourceUnfilledCapacityInput');
  const value = Number(input && input.value);
  if (!Number.isInteger(value) || value < 0) {
    showToast('请输入大于或等于 0 的整数', false);
    return;
  }
  const slot = resourceUnfilledCapacitySlots.find(item => item.id === slotId);
  if (!slot) return;
  slot.capacity = value;
  slot.remaining = value;
  resourceUnfilledCapacityDirtySlots.add(slot.id);
  renderResourceUnfilledCapacityConfig();
  closeResourceUnfilledCapacityModal();
  showToast('已加入待保存变更', true);
}

const resourceUnfilledBatchRecords = [
  { date: '2026-06-16', total: 18642, dedupe: 7218, dccTasks: 8934, syncFailed: 76, rollover: 9708, status: '执行中' },
  { date: '2026-06-15', total: 16305, dedupe: 6305, dccTasks: 10000, syncFailed: 47, rollover: 6305, status: '已完成' },
  { date: '2026-06-14', total: 12908, dedupe: 2908, dccTasks: 10000, syncFailed: 30, rollover: 2908, status: '已完成' }
];

function getFilteredResourceUnfilledBatches() {
  const start = document.getElementById('resourceUnfilledBatchStartDate')?.value || '';
  const end = document.getElementById('resourceUnfilledBatchEndDate')?.value || '';
  return resourceUnfilledBatchRecords.filter(row => (!start || row.date >= start) && (!end || row.date <= end));
}

function renderResourceUnfilledBatchTable() {
  const rows = getFilteredResourceUnfilledBatches();
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

  document.getElementById('resourceUnfilledTableHead').innerHTML = '<tr><th>批次日期</th><th>累计总量</th><th>去重过滤</th><th>DCC培育任务</th><th>同步失败</th><th>滚存待推送</th><th>批次状态</th><th>操作</th></tr>';
  document.getElementById('resourceUnfilledTableBody').innerHTML = pageRows.length
    ? pageRows.map(row => `
      <tr>
        <td>${row.date}</td>
        <td>${row.total.toLocaleString()}</td>
        <td>${row.dedupe.toLocaleString()}</td>
        <td>${row.dccTasks.toLocaleString()}</td>
        <td class="resource-unfilled-sync-failed">${row.syncFailed.toLocaleString()}</td>
        <td>${row.rollover.toLocaleString()}</td>
        <td>${typeof renderWorryFreeBatchStatus === 'function' ? renderWorryFreeBatchStatus(row.status) : `<span class="status-badge ${row.status === '执行中' ? 'status-enabled' : 'status-reviewed'}">${row.status}</span>`}</td>
        <td><button class="action-btn view" type="button" onclick="showResourceUnfilledBatchDetails('${row.date}')">查看</button></td>
      </tr>
    `).join('')
    : '<tr><td colspan="8"><div class="empty-state">暂无匹配的批次记录</div></td></tr>';
}

function filterResourceUnfilledBatches() {
  const start = document.getElementById('resourceUnfilledBatchStartDate')?.value || '';
  const end = document.getElementById('resourceUnfilledBatchEndDate')?.value || '';
  if (start && end && start > end) {
    showToast('开始日期不能晚于结束日期', false);
    return;
  }
  resourceUnfilledCurrentPage = 1;
  renderResourceUnfilledBatchTable();
}

function exportResourceUnfilledBatchDetails() {
  const start = document.getElementById('resourceUnfilledBatchStartDate')?.value || '';
  const end = document.getElementById('resourceUnfilledBatchEndDate')?.value || '';
  if (start && end && start > end) {
    showToast('开始日期不能晚于结束日期', false);
    return;
  }
  const rows = getFilteredResourceUnfilledBatches();
  if (!rows.length) {
    showToast('当前日期范围内暂无可导出数据', false);
    return;
  }
  const columns = ['批次日期', '累计总量', '去重过滤', 'DCC培育任务', '同步失败', '滚存待推送', '批次状态'];
  const csvRows = [
    columns.map(csvEscape).join(','),
    ...rows.map(row => [row.date, row.total, row.dedupe, row.dccTasks, row.syncFailed, row.rollover, row.status].map(csvEscape).join(','))
  ];
  const rangeText = `${start || '全部'}_${end || '全部'}`;
  downloadCsvFile(`留资未满批次明细_${rangeText}.csv`, csvRows, `已导出 ${rows.length} 条留资未满批次明细`);
}

function changeResourceUnfilledPageSize(value) {
  resourceUnfilledPageSize = Number(value) || 5;
  resourceUnfilledCurrentPage = 1;
  renderResourceUnfilledBatchTable();
}

function selectResourceUnfilledPage(value) {
  resourceUnfilledCurrentPage = Number(value) || 1;
  renderResourceUnfilledBatchTable();
}

function changeResourceUnfilledPage(dir) {
  const rows = getFilteredResourceUnfilledBatches();
  const totalPages = Math.max(1, Math.ceil(rows.length / resourceUnfilledPageSize));
  resourceUnfilledCurrentPage = Math.max(1, Math.min(totalPages, resourceUnfilledCurrentPage + dir));
  renderResourceUnfilledBatchTable();
}

function showResourceUnfilledBatchDetails(date) {
  const batch = resourceUnfilledBatchRecords.find(item => item.date === date);
  if (!batch) return;
  activeResourceUnfilledBatchDetailDate = date;
  resourceUnfilledBatchDetailCurrentPage = 1;
  resourceUnfilledBatchDetailFilters = { unfilledId: '', systemStatus: '', customerName: '', phone: '', intentSeries: '', dealer: '', dataSource: '', systemSource: '', smartCode: '', nurtureLeadCode: '', startDate: '', endDate: '' };
  document.querySelector('nav[aria-label="培育策略三级菜单"]')?.classList.add('hidden');
  document.querySelector('.leads-nav')?.classList.add('show');
  if (typeof setLeadNavActive === 'function') setLeadNavActive('留资未满');
  if (typeof setSidebarActiveByName === 'function') setSidebarActiveByName('线索管理');
  if (typeof setPageName === 'function') setPageName(`线索管理 / 留资未满 / 批次详情 / ${date}`);
  if (typeof setPolicyContentVisible === 'function') setPolicyContentVisible(false);
  if (typeof hideLeadPages === 'function') hideLeadPages();
  document.getElementById('designStage')?.classList.remove('show');
  document.getElementById('resourceUnfilledBatchDetailPage')?.classList.add('show');
  document.getElementById('resourceUnfilledBatchDetailTitle').textContent = '留资未满批次详情';
  document.getElementById('resourceUnfilledBatchDetailSubtitle').textContent = `线索管理 / 留资未满 / ${date}`;
  document.getElementById('resourceUnfilledBatchDetailBody').innerHTML = renderResourceUnfilledBatchDetailPage(batch);
  mountResourceUnfilledBatchDetailFilters();
}

function getResourceUnfilledBatchSystemStatus(row) {
  return row.syncStatus === '同步成功' ? '已同步' : row.syncStatus;
}

function getFilteredResourceUnfilledBatchDetailRows() {
  const filter = resourceUnfilledBatchDetailFilters;
  const includes = (value, keyword) => !keyword || String(value || '').toLowerCase().includes(keyword.toLowerCase());
  return (resourceUnfilledLeads || []).filter(row =>
    includes(row.unfilledId, filter.unfilledId) &&
    (!filter.systemStatus || getResourceUnfilledBatchSystemStatus(row) === filter.systemStatus) &&
    includes(row.customerName, filter.customerName) &&
    includes(row.phone, filter.phone) &&
    (!filter.intentSeries || row.intentSeries === filter.intentSeries) &&
    includes(row.dealer, filter.dealer) &&
    (!filter.dataSource || row.leadType === filter.dataSource) &&
    (!filter.systemSource || row.systemSource === filter.systemSource) &&
    includes(row.smartCode, filter.smartCode) &&
    includes(row.nurtureLeadCode, filter.nurtureLeadCode) &&
    (!filter.startDate || row.createdAt >= filter.startDate) &&
    (!filter.endDate || row.createdAt <= filter.endDate)
  );
}

function renderResourceUnfilledBatchDetailFilters() {
  const filter = resourceUnfilledBatchDetailFilters;
  const selected = (value, expected) => value === expected ? ' selected' : '';
  const value = field => escapeHtml(filter[field] || '');
  return `<div class="resource-unfilled-batch-query"><div class="resource-unfilled-batch-query-grid"><label>留资未满ID<input class="form-input" id="resourceUnfilledDetailUnfilledId" value="${value('unfilledId')}" placeholder="请输入留资未满ID" /></label><label>系统状态<select class="filter-select" id="resourceUnfilledDetailSystemStatus"><option value="">全部</option><option value="已同步"${selected(filter.systemStatus, '已同步')}>已同步</option><option value="待同步"${selected(filter.systemStatus, '待同步')}>待同步</option><option value="冲突重复"${selected(filter.systemStatus, '冲突重复')}>冲突重复</option><option value="无需同步"${selected(filter.systemStatus, '无需同步')}>无需同步</option></select></label><label>客户姓名<input class="form-input" id="resourceUnfilledDetailCustomerName" value="${value('customerName')}" placeholder="请输入客户姓名" /></label><label>电话号码<input class="form-input" id="resourceUnfilledDetailPhone" value="${value('phone')}" placeholder="请输入电话号码" /></label><label>意向车系<select class="filter-select" id="resourceUnfilledDetailIntentSeries"><option value="">全部车系</option>${['N6', '轩逸', '逍客', '奇骏', '天籁'].map(item => `<option value="${item}"${selected(filter.intentSeries, item)}>${item}</option>`).join('')}</select></label><div class="resource-unfilled-batch-query-actions"><button class="btn-add" type="button" onclick="queryResourceUnfilledBatchDetail()">查询</button><button class="btn-secondary" type="button" onclick="resetResourceUnfilledBatchDetailQuery()">重置</button></div></div><div class="resource-unfilled-batch-query-more"><span>更多筛选</span><label>意向专营店<input class="form-input" id="resourceUnfilledDetailDealer" value="${value('dealer')}" placeholder="请输入专营店名称" /></label><label>系统来源<select class="filter-select" id="resourceUnfilledDetailSystemSource"><option value="">全部</option>${['懂车帝', '私域运营', '抖音直播', '小程序'].map(item => `<option value="${item}"${selected(filter.systemSource, item)}>${item}</option>`).join('')}</select></label><label>SmartCode<input class="form-input" id="resourceUnfilledDetailSmartCode" value="${value('smartCode')}" placeholder="请输入SmartCode" /></label><label>培育线索编码<input class="form-input" id="resourceUnfilledDetailNurtureLeadCode" value="${value('nurtureLeadCode')}" placeholder="请输入培育线索编码" /></label><label>创建时间<div class="resource-unfilled-batch-date-range"><input class="form-input" id="resourceUnfilledDetailStartDate" type="date" value="${value('startDate')}" /><span>至</span><input class="form-input" id="resourceUnfilledDetailEndDate" type="date" value="${value('endDate')}" /></div></label></div></div>`;
}

function queryResourceUnfilledBatchDetail() {
  const getValue = id => document.getElementById(id)?.value.trim() || '';
  resourceUnfilledBatchDetailFilters = { unfilledId: getValue('resourceUnfilledDetailUnfilledId'), systemStatus: getValue('resourceUnfilledDetailSystemStatus'), customerName: getValue('resourceUnfilledDetailCustomerName'), phone: getValue('resourceUnfilledDetailPhone'), intentSeries: getValue('resourceUnfilledDetailIntentSeries'), dealer: getValue('resourceUnfilledDetailDealer'), dataSource: getValue('resourceUnfilledDetailDataSource'), systemSource: getValue('resourceUnfilledDetailSystemSource'), smartCode: getValue('resourceUnfilledDetailSmartCode'), nurtureLeadCode: getValue('resourceUnfilledDetailNurtureLeadCode'), startDate: getValue('resourceUnfilledDetailStartDate'), endDate: getValue('resourceUnfilledDetailEndDate') };
  resourceUnfilledBatchDetailCurrentPage = 1;
  refreshResourceUnfilledBatchDetail();
}

function resetResourceUnfilledBatchDetailQuery() {
  resourceUnfilledBatchDetailFilters = { unfilledId: '', systemStatus: '', customerName: '', phone: '', intentSeries: '', dealer: '', dataSource: '', systemSource: '', smartCode: '', nurtureLeadCode: '', startDate: '', endDate: '' };
  resourceUnfilledBatchDetailCurrentPage = 1;
  refreshResourceUnfilledBatchDetail();
}

function renderResourceUnfilledBatchDetailPage(batch) {
  const leadRows = getFilteredResourceUnfilledBatchDetailRows();
  const totalPages = Math.max(1, Math.ceil(leadRows.length / resourceUnfilledBatchDetailPageSize));
  resourceUnfilledBatchDetailCurrentPage = Math.max(1, Math.min(totalPages, resourceUnfilledBatchDetailCurrentPage));
  const start = (resourceUnfilledBatchDetailCurrentPage - 1) * resourceUnfilledBatchDetailPageSize;
  const pageRows = leadRows.slice(start, start + resourceUnfilledBatchDetailPageSize);
  const pageOptions = Array.from({ length: totalPages }, (_, index) => `<option value="${index + 1}"${resourceUnfilledBatchDetailCurrentPage === index + 1 ? ' selected' : ''}>第 ${index + 1} 页</option>`).join('');
  const summary = [['批次日期', batch.date], ['累计总量', batch.total.toLocaleString()], ['去重过滤', batch.dedupe.toLocaleString()], ['DCC培育任务', batch.dccTasks.toLocaleString()], ['同步失败', batch.syncFailed.toLocaleString()], ['滚存待推送', batch.rollover.toLocaleString()], ['批次状态', batch.status]];
  const summaryCards = `<div class="worry-free-batch-summary-cards">${summary.map(([label, value]) => `<div class="worry-free-batch-summary-card"><div class="worry-free-batch-summary-label">${label}</div><div class="worry-free-batch-summary-value${label === '批次状态' ? ' status' : ''}${label === '同步失败' ? ' resource-unfilled-detail-failure' : ''}">${value}</div></div>`).join('')}</div>`;
  const dataSourceRows = [['留资未满挖掘', '12,508', '4,718', '6,034', '42', '6,432'], ['私域线索挖掘', '6,134', '2,500', '2,900', '34', '3,276']];
  const leadSourceRows = [['懂车帝', '7,820', '2,780', '3,980', '24', '4,060'], ['抖音直播', '4,688', '1,938', '2,054', '18', '2,616'], ['私域运营', '3,126', '1,268', '1,500', '16', '1,626'], ['小程序', '3,008', '1,232', '1,400', '18', '1,406']];
  const renderPushDetailTable = (firstColumn, rows) => `<div class="lead-table-wrap"><table class="lead-table resource-unfilled-push-detail-table"><thead><tr><th>${firstColumn}</th><th>累计总量</th><th>去重过滤</th><th>DCC培育任务</th><th>同步失败</th><th>滚存待推送</th></tr></thead><tbody>${rows.map(row => `<tr>${row.map(value => `<td>${value}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const slotUpdateTimes = ['17:10', '16:42', '15:28', '14:55', '13:36'];
  const formatSlotQuantity = (quantity, index) => `${batch.date} ${slotUpdateTimes[index] || '00:00'} 数量：${quantity}`;
  const getSystemStatus = row => row.syncStatus === '同步成功' ? '已同步' : row.syncStatus;
  const formatSyncTime = (row, index) => getSystemStatus(row) === '已同步' ? `${batch.date} ${slotUpdateTimes[index] || '00:00'}:00` : '—';
  const paginationMarkup = `<div class="pagination"><span>共 ${leadRows.length} 条记录，当前第 ${resourceUnfilledBatchDetailCurrentPage} / ${totalPages} 页</span><div class="pagination-btns"><select class="hit-page-size" onchange="changeResourceUnfilledBatchDetailPageSize(this.value)"><option value="5"${resourceUnfilledBatchDetailPageSize === 5 ? ' selected' : ''}>每页 5 条</option><option value="10"${resourceUnfilledBatchDetailPageSize === 10 ? ' selected' : ''}>每页 10 条</option><option value="20"${resourceUnfilledBatchDetailPageSize === 20 ? ' selected' : ''}>每页 20 条</option><option value="50"${resourceUnfilledBatchDetailPageSize === 50 ? ' selected' : ''}>每页 50 条</option></select><button class="page-btn${resourceUnfilledBatchDetailCurrentPage <= 1 ? ' disabled' : ''}" type="button"${resourceUnfilledBatchDetailCurrentPage <= 1 ? ' disabled' : ''} onclick="changeResourceUnfilledBatchDetailPage(-1)">‹</button><select class="hit-page-size" onchange="selectResourceUnfilledBatchDetailPage(this.value)">${pageOptions}</select><button class="page-btn${resourceUnfilledBatchDetailCurrentPage >= totalPages ? ' disabled' : ''}" type="button"${resourceUnfilledBatchDetailCurrentPage >= totalPages ? ' disabled' : ''} onclick="changeResourceUnfilledBatchDetailPage(1)">›</button></div></div>`;
  const executionLogs = [[`${batch.date} 08:00:00`, `${batch.date} 08:02:10`, '候选池生成', `生成 ${batch.total.toLocaleString()} 条留资未满候选数据。`, '成功'], [`${batch.date} 08:05:00`, `${batch.date} 08:06:35`, '去重过滤', `识别 ${batch.dedupe.toLocaleString()} 条冲突重复数据，未推送至 DCC。`, '成功'], [`${batch.date} 18:00:00`, `${batch.date} 18:15:00`, '结果回收', `已回收 ${batch.dccTasks.toLocaleString()} 条，并转化生成 DCC 培育任务。`, batch.status === '执行中' ? '执行中' : '成功']];
  const executionLogRows = executionLogs.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
  return `<div class="detail-tabs"><button class="detail-tab active" type="button" onclick="switchLeadDetailTab(this, 'resourceUnfilledBatchOverviewPanel')">执行概览</button><button class="detail-tab" type="button" onclick="switchLeadDetailTab(this, 'resourceUnfilledBatchRowsPanel')">批量明细</button><button class="detail-tab" type="button" onclick="switchLeadDetailTab(this, 'resourceUnfilledBatchLogPanel')">执行日志</button></div>
    <div class="detail-tab-panel active" id="resourceUnfilledBatchOverviewPanel"><div class="worry-free-batch-layout">${summaryCards}<div class="worry-free-batch-stack"><div class="worry-free-batch-section"><div class="worry-free-batch-section-head"><div class="worry-free-batch-section-title">数据来源明细</div></div>${renderPushDetailTable('数据来源', dataSourceRows)}</div><div class="worry-free-batch-section"><div class="worry-free-batch-section-head"><div class="worry-free-batch-section-title">线索来源明细</div></div>${renderPushDetailTable('线索来源', leadSourceRows)}</div></div></div></div>
    <div class="detail-tab-panel worry-free-batch-detail-panel" id="resourceUnfilledBatchRowsPanel"><div class="worry-free-batch-layout">${summaryCards}<div class="worry-free-batch-section"><div class="worry-free-batch-section-head"><div class="worry-free-batch-section-title">批量明细</div></div><div class="lead-table-wrap"><table class="lead-table resource-unfilled-batch-lead-table"><thead><tr><th>批次号</th><th>留资未满编码</th><th>培育线索编码</th><th>培育任务编码</th><th>系统状态</th><th>同步时间</th><th>客户姓名</th><th>电话号码</th><th>意向车系</th><th>数据来源</th><th>线索来源</th><th>SmartCode</th><th>人群包标识</th><th>当前时段设置容量</th><th>当前时段剩余容量</th></tr></thead><tbody>${pageRows.map((row, index) => { const suffix = String(row.nurtureLeadCode || row.unfilledId || '').replace(/^PYXS|^LZWM/, ''); return `<tr><td>LZWM-${batch.date.replace(/-/g, '')}-001</td><td>${escapeHtml(row.unfilledId)}</td><td>${escapeHtml(row.nurtureLeadCode)}</td><td>${escapeHtml(`PYRW${suffix}`)}</td><td>${escapeHtml(getSystemStatus(row))}</td><td>${escapeHtml(formatSyncTime(row, start + index))}</td><td>${escapeHtml(row.customerName)}</td><td>${escapeHtml(row.phone)}</td><td>${escapeHtml(row.intentSeries)}</td><td>${escapeHtml(row.leadType)}</td><td>${escapeHtml(row.leadSource)}</td><td>${escapeHtml(row.smartCode)}</td><td>${escapeHtml(row.crowdPackageTag)}</td><td>${escapeHtml(formatSlotQuantity(row.timeSlotCapacity, start + index))}</td><td>${escapeHtml(formatSlotQuantity(row.timeSlotRemaining, start + index))}</td></tr>`; }).join('')}</tbody></table></div>${paginationMarkup}</div></div></div>
    <div class="detail-tab-panel" id="resourceUnfilledBatchLogPanel"><div class="worry-free-batch-layout">${summaryCards}<div class="worry-free-batch-section"><div class="worry-free-batch-section-head"><div class="worry-free-batch-section-title">执行日志</div></div><div class="lead-table-wrap"><table class="lead-table"><thead><tr><th>开始时间</th><th>结束时间</th><th>节点</th><th>说明</th><th>结果</th></tr></thead><tbody>${executionLogRows}</tbody></table></div></div></div></div>`;
}

function refreshResourceUnfilledBatchDetail() {
  const batch = resourceUnfilledBatchRecords.find(item => item.date === activeResourceUnfilledBatchDetailDate);
  const body = document.getElementById('resourceUnfilledBatchDetailBody');
  if (!batch || !body) return;
  body.innerHTML = renderResourceUnfilledBatchDetailPage(batch);
  mountResourceUnfilledBatchDetailFilters();
  const detailTab = body.querySelector('[onclick*="resourceUnfilledBatchRowsPanel"]');
  if (detailTab && typeof switchLeadDetailTab === 'function') switchLeadDetailTab(detailTab, 'resourceUnfilledBatchRowsPanel');
}

function mountResourceUnfilledBatchDetailFilters() {
  const panel = document.getElementById('resourceUnfilledBatchRowsPanel');
  const layout = panel?.querySelector('.worry-free-batch-layout');
  const section = panel?.querySelector('.worry-free-batch-section');
  if (!layout || !section) return;
  section.insertAdjacentHTML('beforebegin', renderResourceUnfilledBatchDetailFilters());
  const query = layout.querySelector('.resource-unfilled-batch-query');
  const more = query?.querySelector('.resource-unfilled-batch-query-more');
  if (!query || !more) return;
  query.querySelector('#resourceUnfilledDetailDealer')?.closest('label')?.remove();
  query.insertAdjacentHTML('afterbegin', '<div class="resource-unfilled-batch-query-title">筛选查询</div>');
  const leadSourceSelect = more.querySelector('#resourceUnfilledDetailSystemSource');
  const leadSourceLabel = leadSourceSelect?.closest('label');
  if (leadSourceLabel) {
    leadSourceLabel.firstChild.textContent = '线索来源';
    const dataSourceLabel = document.createElement('label');
    dataSourceLabel.innerHTML = `数据来源<select class="filter-select" id="resourceUnfilledDetailDataSource"><option value="">全部</option>${['留资未满挖掘', '私域线索挖掘'].map(item => `<option value="${item}"${resourceUnfilledBatchDetailFilters.dataSource === item ? ' selected' : ''}>${item}</option>`).join('')}</select>`;
    leadSourceLabel.before(dataSourceLabel);
  }
  more.querySelector(':scope > span')?.remove();
  const trigger = document.createElement('button');
  trigger.className = 'resource-unfilled-batch-more-trigger';
  trigger.type = 'button';
  trigger.innerHTML = `更多筛选 <span>${resourceUnfilledBatchDetailMoreFiltersExpanded ? '收起' : '展开'}</span>`;
  trigger.onclick = toggleResourceUnfilledBatchDetailMoreFilters;
  more.before(trigger);
  more.style.display = resourceUnfilledBatchDetailMoreFiltersExpanded ? 'grid' : 'none';
}

function toggleResourceUnfilledBatchDetailMoreFilters() {
  resourceUnfilledBatchDetailMoreFiltersExpanded = !resourceUnfilledBatchDetailMoreFiltersExpanded;
  refreshResourceUnfilledBatchDetail();
}

function changeResourceUnfilledBatchDetailPageSize(value) {
  resourceUnfilledBatchDetailPageSize = Number(value) || 10;
  resourceUnfilledBatchDetailCurrentPage = 1;
  refreshResourceUnfilledBatchDetail();
}

function selectResourceUnfilledBatchDetailPage(value) {
  resourceUnfilledBatchDetailCurrentPage = Number(value) || 1;
  refreshResourceUnfilledBatchDetail();
}

function changeResourceUnfilledBatchDetailPage(direction) {
  const totalPages = Math.max(1, Math.ceil(getFilteredResourceUnfilledBatchDetailRows().length / resourceUnfilledBatchDetailPageSize));
  resourceUnfilledBatchDetailCurrentPage = Math.max(1, Math.min(totalPages, resourceUnfilledBatchDetailCurrentPage + direction));
  refreshResourceUnfilledBatchDetail();
}

function backToResourceUnfilledBatchList() {
  if (typeof hideLeadPages === 'function') hideLeadPages();
  document.getElementById('resourceUnfilledPage')?.classList.add('show');
  if (typeof setLeadNavActive === 'function') setLeadNavActive('留资未满');
  if (typeof setPageName === 'function') setPageName('线索管理 / 留资未满');
  initResourceUnfilledPage();
}
