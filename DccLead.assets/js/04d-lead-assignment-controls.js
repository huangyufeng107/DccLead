function renderSeriesAllocationRow(item = {}) {
  const selectedChannel = assignmentOutboundChannels.includes(item.channel) ? item.channel : '';
  return `
    <div class="assignment-allocation-row">
      <div class="assignment-allocation-main">
        <select class="form-input series-allocation-channel allocation-channel-native" aria-hidden="true" tabindex="-1">
          <option value="">请选择外呼类型</option>
          ${assignmentOutboundChannels.map(channel => `<option value="${channel}" ${selectedChannel === channel ? 'selected' : ''}>${channel}</option>`).join('')}
        </select>
        ${renderAllocationChannelPicker(selectedChannel)}
        <div class="assignment-allocation-percent">
          <input class="form-input series-allocation-percent" type="number" min="0" max="100" value="${escapeAttr(item.percent ?? '')}" />
        </div>
        <button class="assignment-mini-btn" type="button" onclick="removeSeriesAllocationRow(this)">删除</button>
      </div>
      ${renderAllocationPushTimePanel(item.pushTime || {})}
    </div>
  `;
}

function renderAllocationChannelPicker(selectedChannel = '') {
  const selected = assignmentOutboundChannels.includes(selectedChannel) ? selectedChannel : '';
  return `
    <div class="allocation-channel-picker">
      <button class="allocation-channel-trigger ${selected ? '' : 'placeholder'}" type="button" onclick="toggleAllocationChannelPicker(this)">
        <span class="allocation-channel-trigger-text">${escapeHtml(selected || '请选择外呼类型')}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="allocation-channel-panel">
        <div class="allocation-channel-toolbar">
          <span class="allocation-channel-count">已选 ${selected ? 1 : 0} / ${assignmentOutboundChannels.length}</span>
        </div>
        <div class="allocation-channel-list">
          ${assignmentOutboundChannels.map(channel => `
            <button class="allocation-channel-option ${selected === channel ? 'selected' : ''}" type="button" data-channel="${escapeAttr(channel)}" onclick="selectAllocationChannelOption(this)">
              <span class="allocation-channel-mark"></span>
              <span>${escapeHtml(channel)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderAssignmentSingleChannelPicker(selectedChannel = '') {
  const selected = assignmentOutboundChannels.includes(selectedChannel) ? selectedChannel : '';
  return `
    <div class="allocation-channel-picker assignment-single-channel-picker">
      <div class="allocation-channel-native">
        ${assignmentOutboundChannels.map(channel => `
          <input type="radio" name="seriesSingleChannel" value="${escapeAttr(channel)}" ${selected === channel ? 'checked' : ''} />
        `).join('')}
      </div>
      <button class="allocation-channel-trigger ${selected ? '' : 'placeholder'}" type="button" onclick="toggleAllocationChannelPicker(this)">
        <span class="allocation-channel-trigger-text">${escapeHtml(selected || '请选择外呼类型')}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="allocation-channel-panel">
        <div class="allocation-channel-toolbar">
          <span class="allocation-channel-count">已选 ${selected ? 1 : 0} / ${assignmentOutboundChannels.length}</span>
        </div>
        <div class="allocation-channel-list">
          ${assignmentOutboundChannels.map(channel => `
            <button class="allocation-channel-option ${selected === channel ? 'selected' : ''}" type="button" data-channel="${escapeAttr(channel)}" onclick="selectAssignmentSingleChannelOption(this)">
              <span class="allocation-channel-mark"></span>
              <span>${escapeHtml(channel)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function normalizeBlacklistPolicyCallType(value) {
  if (blacklistPolicyCallTypeOptions.includes(value)) return value;
  if (!value) return '';
  if (value.includes('冰兰')) return '冰兰-新线索';
  if (value.includes('一知') && value.includes('大模型')) return '一知-冷线索（大模型）';
  if (value.includes('一知')) return '一知-冷线索';
  if (value.includes('科大讯飞')) return '科大讯飞-冷线索';
  return blacklistPolicyCallTypeOptions[0] || '';
}

function renderBlacklistCallTypePicker(selectedCallType = '', disabled = false) {
  const selected = normalizeBlacklistPolicyCallType(selectedCallType);
  return `
    <div class="allocation-channel-picker blacklist-call-type-picker">
      <div class="allocation-channel-native">
        ${blacklistPolicyCallTypeOptions.map(type => `
          <input type="radio" name="callType" value="${escapeAttr(type)}" ${selected === type ? 'checked' : ''} ${disabled ? 'disabled' : ''} />
        `).join('')}
      </div>
      <button class="allocation-channel-trigger ${selected ? '' : 'placeholder'}" type="button" onclick="toggleAllocationChannelPicker(this)" ${disabled ? 'disabled' : ''}>
        <span class="allocation-channel-trigger-text">${escapeHtml(selected || '请选择外呼类型')}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      <div class="allocation-channel-panel">
        <div class="allocation-channel-toolbar">
          <span class="allocation-channel-count">已选 ${selected ? 1 : 0} / ${blacklistPolicyCallTypeOptions.length}</span>
        </div>
        <div class="allocation-channel-list">
          ${blacklistPolicyCallTypeOptions.map(type => `
            <button class="allocation-channel-option ${selected === type ? 'selected' : ''}" type="button" data-channel="${escapeAttr(type)}" onclick="selectBlacklistCallTypeOption(this)">
              <span class="allocation-channel-mark"></span>
              <span>${escapeHtml(type)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function initBlacklistCallTypePicker(selectedCallType = '', disabled = false) {
  const container = document.getElementById('callTypeGrid');
  if (!container) return;
  container.innerHTML = renderBlacklistCallTypePicker(selectedCallType, disabled);
}

function toggleAllocationChannelPicker(button) {
  if (button.disabled) return;
  const picker = button.closest('.allocation-channel-picker');
  if (!picker) return;
  document.querySelectorAll('.allocation-channel-picker.open').forEach(item => {
    if (item !== picker) item.classList.remove('open');
  });
  picker.classList.toggle('open');
}

function selectAllocationChannelOption(option) {
  const picker = option.closest('.allocation-channel-picker');
  const row = option.closest('.assignment-allocation-row');
  const channel = option.dataset.channel || '';
  const select = row?.querySelector('.series-allocation-channel');
  if (!picker || !select || !channel) return;
  select.value = channel;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  picker.querySelectorAll('.allocation-channel-option').forEach(item => {
    item.classList.toggle('selected', item.dataset.channel === channel);
  });
  const trigger = picker.querySelector('.allocation-channel-trigger');
  const triggerText = picker.querySelector('.allocation-channel-trigger-text');
  const count = picker.querySelector('.allocation-channel-count');
  if (triggerText) triggerText.textContent = channel;
  trigger?.classList.remove('placeholder');
  if (count) count.textContent = `已选 1 / ${assignmentOutboundChannels.length}`;
  picker.classList.remove('open');
}

function selectBlacklistCallTypeOption(option) {
  const picker = option.closest('.blacklist-call-type-picker');
  const callType = option.dataset.channel || '';
  const radio = Array.from(picker?.querySelectorAll('input[name="callType"]') || []).find(input => input.value === callType);
  if (!picker || !radio || !callType || radio.disabled) return;
  radio.checked = true;
  radio.dispatchEvent(new Event('change', { bubbles: true }));
  picker.querySelectorAll('.allocation-channel-option').forEach(item => {
    item.classList.toggle('selected', item.dataset.channel === callType);
  });
  const trigger = picker.querySelector('.allocation-channel-trigger');
  const triggerText = picker.querySelector('.allocation-channel-trigger-text');
  const count = picker.querySelector('.allocation-channel-count');
  if (triggerText) triggerText.textContent = callType;
  trigger?.classList.remove('placeholder');
  if (count) count.textContent = `已选 1 / ${blacklistPolicyCallTypeOptions.length}`;
  picker.classList.remove('open');
  updateTagSection();
}

function selectAssignmentSingleChannelOption(option) {
  const picker = option.closest('.assignment-single-channel-picker');
  const channel = option.dataset.channel || '';
  const radio = Array.from(picker?.querySelectorAll('input[name="seriesSingleChannel"]') || []).find(input => input.value === channel);
  if (!picker || !radio || !channel) return;
  radio.checked = true;
  radio.dispatchEvent(new Event('change', { bubbles: true }));
  picker.querySelectorAll('.allocation-channel-option').forEach(item => {
    item.classList.toggle('selected', item.dataset.channel === channel);
  });
  const trigger = picker.querySelector('.allocation-channel-trigger');
  const triggerText = picker.querySelector('.allocation-channel-trigger-text');
  const count = picker.querySelector('.allocation-channel-count');
  if (triggerText) triggerText.textContent = channel;
  trigger?.classList.remove('placeholder');
  if (count) count.textContent = `已选 1 / ${assignmentOutboundChannels.length}`;
  picker.classList.remove('open');
}

function normalizeAiRedialOutboundType(value) {
  if (aiRedialOutboundTypeOptions.includes(value)) return value;
  return normalizeAssignmentCallType(value) || '';
}

function renderAiRedialOutboundTypePicker(selectedType = '', disabled = false) {
  const selected = normalizeAiRedialOutboundType(selectedType);
  return `
    <select class="form-input" id="aiRedialFormOutboundType" onchange="syncAiRedialNewOutboundType()" ${disabled ? 'disabled' : ''}>
      <option value="">请选择外呼类型</option>
      ${aiRedialOutboundTypeOptions.map(type => `<option value="${escapeAttr(type)}" ${selected === type ? 'selected' : ''}>${escapeHtml(type)}</option>`).join('')}
    </select>
  `;
}

function selectAiRedialOutboundTypeOption(option) {
  const picker = option.closest('.ai-redial-outbound-type-picker');
  const outboundType = option.dataset.channel || '';
  const select = picker?.querySelector('#aiRedialFormOutboundType');
  if (!picker || !select || !outboundType || select.disabled) return;
  select.value = outboundType;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  picker.querySelectorAll('.allocation-channel-option').forEach(item => {
    item.classList.toggle('selected', item.dataset.channel === outboundType);
  });
  const trigger = picker.querySelector('.allocation-channel-trigger');
  const triggerText = picker.querySelector('.allocation-channel-trigger-text');
  const count = picker.querySelector('.allocation-channel-count');
  if (triggerText) triggerText.textContent = outboundType;
  trigger?.classList.remove('placeholder');
  if (count) count.textContent = `已选 1 / ${aiRedialOutboundTypeOptions.length}`;
  picker.classList.remove('open');
}

function normalizeAllocationPushTime(pushTime = {}) {
  const days = Array.isArray(pushTime.days) ? pushTime.days : [];
  const slots = Array.isArray(pushTime.slots) ? pushTime.slots : [];
  const normalizedSlots = slots.map(slot => ({
    start: slot?.start || '',
    end: slot?.end || ''
  }));
  while (normalizedSlots.length < 1) normalizedSlots.push({ start: '', end: '' });
  return { days, slots: normalizedSlots };
}

function renderAllocationPushTimeSlot(slot = {}, index = 0, total = 1) {
  const rowNo = index + 1;
  return `
    <div class="push-time-slot allocation-push-slot" data-slot-index="${rowNo}">
      <div class="push-time-slot-label">时段${rowNo}</div>
      <input class="form-input time-input allocation-push-start" type="time" step="60" list="smartCodeTimeOptions" value="${escapeAttr(slot.start || '')}" />
      <div class="push-time-separator">-</div>
      <input class="form-input time-input allocation-push-end" type="time" step="60" list="smartCodeTimeOptions" value="${escapeAttr(slot.end || '')}" />
      <button class="push-time-remove" type="button" onclick="removeAllocationPushTimeSlot(this)" style="${total <= 1 ? 'visibility:hidden' : ''}">删除</button>
    </div>
  `;
}

function renderAllocationPushTimePanel(pushTime = {}) {
  const normalized = normalizeAllocationPushTime(pushTime);
  const isExpanded = hasPushTimeValue(normalized);
  return `
    <div class="allocation-row-push-time optional-push-time" data-expanded="${isExpanded}">
      <div class="optional-push-time-header">
        <div class="optional-push-time-title">推送时间 <span class="optional-push-time-tag">选填</span></div>
        <button class="optional-push-time-toggle" type="button" onclick="toggleOptionalPushTime(this)">${isExpanded ? '收起配置' : '配置推送时间'}</button>
      </div>
      <div class="optional-push-time-body" ${isExpanded ? '' : 'hidden'}>
        <div class="push-time-days">
          ${assignmentPushWeekdays.map(day => `
            <label class="push-time-day">
              <input type="checkbox" class="allocation-push-day" value="${day}" ${normalized.days.includes(day) ? 'checked' : ''} />
              <span>${day}</span>
            </label>
          `).join('')}
        </div>
        <div class="push-time-slots">
          <div class="allocation-push-slots">
            ${normalized.slots.map((slot, index) => renderAllocationPushTimeSlot(slot, index, normalized.slots.length)).join('')}
          </div>
          <button class="push-time-add" type="button" onclick="addAllocationPushTimeSlot(this)">新增时段</button>
          <div class="series-form-hint">选填；可自由选择时间，后续时间点必须晚于前一个已设置时间点，保存时会校验顺序。</div>
        </div>
      </div>
    </div>
  `;
}

function renderCityAllocationSummary(item = {}) {
  const mode = item.allocationMode === 'ratio' ? 'ratio' : 'single';
  const allocations = item.allocations?.length ? item.allocations : [{ channel: '', percent: 100 }];
  return mode === 'ratio'
    ? allocations.map(allocation => `${allocation.channel}${allocation.percent}%${renderAllocationPushTimeSummary(allocation.pushTime)}`).join('，')
    : `全部分配给${allocations[0]?.channel || '—'}`;
}

function getCityAllocationAreaValues(item = {}) {
  if (Array.isArray(item.cities) && item.cities.length) return item.cities.filter(Boolean);
  if (Array.isArray(item.cityValues) && item.cityValues.length) return item.cityValues.filter(Boolean);
  return item.city ? [item.city] : [];
}

function getCityAllocationAreaLabel(item = {}) {
  const values = getCityAllocationAreaValues(item);
  return values.length ? values.join('、') : (item.city || '—');
}

function renderAllocationPushTimeSummary(pushTime = {}) {
  const normalized = normalizeAllocationPushTime(pushTime);
  const slots = normalized.slots
    .filter(slot => slot.start && slot.end)
    .map(slot => `${slot.start}-${slot.end}`)
    .join('、');
  if (!normalized.days.length && !slots) return '';
  return `（${normalized.days.join('、') || '未选星期'}${slots ? ` ${slots}` : ''}）`;
}

function getSmartCodeCityAllocations(rule = {}) {
  const cityAllocations = Array.isArray(rule.cityAllocations) ? rule.cityAllocations : [];
  const fallbackCityAllocation = rule.fallbackCityAllocation || { city: '兜底城市', allocationMode: 'ratio', allocations: getDefaultAssignmentAllocationRows() };
  return { cityAllocations, fallbackCityAllocation };
}

function renderCityAllocationRatioRows(allocations = []) {
  return (allocations.length ? allocations : getDefaultAssignmentAllocationRows())
    .map(item => renderSeriesAllocationRow(item))
    .join('');
}

function renderSmartCodeCityAllocationRow(item = {}, index = 0, isFallback = false, scope = 'city') {
  const config = getAllocationAreaConfig(scope);
  const selectedAreas = getCityAllocationAreaValues(item);
  const citySelect = isFallback
    ? `<input class="form-input city-allocation-city" value="${config.fallbackLabel}" disabled />`
    : renderAreaMultiPicker(config.options, selectedAreas, config.valueLabel);
  return `
    <div class="city-allocation-row${isFallback ? ' fallback' : ''}" data-fallback="${isFallback ? 'true' : 'false'}">
      <div class="city-allocation-head">
        <div>
          <div class="form-label">${isFallback ? config.fallbackLabel : config.valueLabel}</div>
          ${citySelect}
        </div>
        <div class="city-allocation-actions">
          <button class="assignment-mini-btn" type="button" onclick="removeSmartCodeCityAllocationRow(this)" style="${isFallback ? 'visibility:hidden' : ''}">删除</button>
        </div>
      </div>
      <div class="city-allocation-body">
        <div class="city-ratio-allocation">
          <div class="form-label">类型比例 <span class="required">*</span></div>
          <div class="assignment-allocation-panel city-allocation-ratio-rows">
            ${renderCityAllocationRatioRows(item.allocations || [])}
          </div>
          <button class="series-add-channel-btn" type="button" onclick="addCityAllocationRatioRow(this)">添加外呼类型</button>
        </div>
      </div>
    </div>
  `;
}

function renderAreaMultiPicker(options = [], selectedValues = [], label = '关联区域') {
  const selectedSet = new Set(selectedValues);
  const summary = selectedValues.length ? selectedValues.join('、') : `请选择${label}`;
  const isCityPicker = label === '关联城市';
  const activeProvince = getInitialCityPickerProvince(selectedValues);
  return `
    <div class="area-multi-picker city-allocation-city" data-area-picker="true" data-picker-type="${isCityPicker ? 'city' : 'province'}">
      <button class="area-multi-trigger${selectedValues.length ? '' : ' placeholder'}" type="button" onclick="toggleAreaMultiPicker(this)">${summary}</button>
      <div class="area-multi-panel${isCityPicker ? ' city-cascade-picker' : ' simple'}">
        ${isCityPicker ? renderCityCascadePicker(selectedSet, activeProvince) : renderProvinceMultiPicker(options, selectedSet)}
      </div>
    </div>
  `;
}

function renderProvinceMultiPicker(options = [], selectedSet = new Set()) {
  return `
    <div class="province-picker-search">
      <input type="search" class="province-picker-search-input" placeholder="搜索省份" oninput="filterProvinceMultiPicker(this)" />
    </div>
    <div class="province-picker-list">
      ${options.map(value => `
        <label class="area-multi-option" data-area-option="${value}">
          <input type="checkbox" class="area-multi-checkbox" value="${value}" ${selectedSet.has(value) ? 'checked' : ''} onchange="refreshCityAllocationSelectionMutex()" />
          <span>${value}</span>
        </label>
      `).join('')}
    </div>
    <div class="province-picker-empty">暂无匹配省份</div>
  `;
}

function getInitialCityPickerProvince(selectedValues = []) {
  const matched = assignmentCityGroups.find(group => selectedValues.some(city => group.cities.includes(city)));
  return matched?.province || assignmentCityGroups[0]?.province || '';
}

function renderCityCascadePicker(selectedSet, activeProvince = '') {
  return `
    <div class="city-picker-search">
      <input type="search" class="city-picker-search-input" placeholder="搜索城市" oninput="filterCityCascadePicker(this)" />
    </div>
    <div class="city-picker-toolbar">
      <span class="city-picker-count">已选 ${selectedSet.size} 项</span>
      <div class="city-picker-actions">
        <button class="city-picker-action" type="button" onclick="selectCurrentProvinceCities(this)">选择当前省</button>
        <button class="city-picker-action" type="button" onclick="clearCurrentCityPicker(this)">清空本组</button>
      </div>
    </div>
    <div class="city-picker-layout">
      <div class="city-province-list">
        ${assignmentCityGroups.map(group => `
          <button class="city-province-item ${group.province === activeProvince ? 'active' : ''}" type="button" data-province="${group.province}" onclick="switchCityPickerProvince(this)">${group.province}</button>
        `).join('')}
      </div>
      <div class="city-list-wrap">
        ${assignmentCityGroups.map(group => `
          <div class="city-group" data-city-group="${group.province}" style="${group.province === activeProvince ? '' : 'display:none'}">
            ${group.cities.map(city => `
              <label class="area-multi-option" data-area-option="${city}" data-province="${group.province}">
                <input type="checkbox" class="area-multi-checkbox" value="${city}" ${selectedSet.has(city) ? 'checked' : ''} onchange="refreshCityAllocationSelectionMutex()" />
                <span>${city}</span>
              </label>
            `).join('')}
          </div>
        `).join('')}
        <div class="city-picker-empty">暂无匹配城市</div>
      </div>
    </div>
  `;
}

function renderSmartCodeCityAllocationPanel(rule = {}, scope = 'city') {
  const { cityAllocations, fallbackCityAllocation } = getSmartCodeCityAllocations(rule);
  const config = getAllocationAreaConfig(scope);
  const rows = cityAllocations.length ? cityAllocations : config.defaultRows;
  const fallback = fallbackCityAllocation?.city
    ? { ...fallbackCityAllocation, city: fallbackCityAllocation.city.startsWith('兜底') ? config.fallbackLabel : fallbackCityAllocation.city }
    : { city: config.fallbackLabel, allocationMode: 'ratio', allocations: getDefaultAssignmentAllocationRows() };
  return `
    <div class="city-allocation-panel" id="smartCodeCityAllocationRows" data-allocation-scope="${scope}">
      ${rows.map((item, index) => renderSmartCodeCityAllocationRow(item, index, false, scope)).join('')}
      ${renderSmartCodeCityAllocationRow(fallback, rows.length, true, scope)}
    </div>
    <button class="series-add-channel-btn" type="button" onclick="addSmartCodeCityAllocationRow()">${config.addLabel}</button>
    <div class="series-form-hint">${config.hint} 同一个配置组可多选，且不同配置组之间不可重复选择相同${config.valueLabel.replace('关联', '')}。</div>
  `;
}

function switchSeriesAllocationMode(triggerOrMode, maybeMode) {
  const mode = maybeMode || triggerOrMode;
  const scope = maybeMode ? triggerOrMode.closest('.series-action-box') || document : document;
  scope.querySelector('#seriesAllocationSingleTab')?.classList.toggle('active', mode === 'single');
  scope.querySelector('#seriesAllocationRatioTab')?.classList.toggle('active', mode === 'ratio');
  const single = scope.querySelector('#seriesSingleAllocation');
  const ratio = scope.querySelector('#seriesRatioAllocation');
  if (single) single.style.display = mode === 'single' ? '' : 'none';
  if (ratio) ratio.style.display = mode === 'ratio' ? '' : 'none';
}

function addSeriesAllocationRow() {
  document.getElementById('seriesAllocationRows')?.insertAdjacentHTML('beforeend', renderSeriesAllocationRow({ channel: '', percent: '' }));
}

function getAreaPickerSelectedValues(picker) {
  return Array.from(picker?.querySelectorAll('.area-multi-checkbox:checked') || [])
    .map(input => input.value)
    .filter(Boolean);
}

function getSelectedCityAllocationValues(excludedPicker = null) {
  return Array.from(document.querySelectorAll('#smartCodeCityAllocationRows .city-allocation-row[data-fallback="false"] .area-multi-picker'))
    .filter(picker => picker !== excludedPicker)
    .flatMap(picker => getAreaPickerSelectedValues(picker));
}

function refreshAreaMultiPickerSummary(picker) {
  const trigger = picker?.querySelector('.area-multi-trigger');
  if (!trigger) return;
  const selected = getAreaPickerSelectedValues(picker);
  const row = picker.closest('.city-allocation-row');
  const label = row?.querySelector('.form-label')?.textContent?.trim() || '关联区域';
  trigger.textContent = selected.length ? selected.join('、') : `请选择${label}`;
  trigger.classList.toggle('placeholder', !selected.length);
  const count = picker.querySelector('.city-picker-count');
  if (count) count.textContent = `已选 ${selected.length} 项`;
}

function refreshCityAllocationSelectionMutex() {
  const pickers = Array.from(document.querySelectorAll('#smartCodeCityAllocationRows .city-allocation-row[data-fallback="false"] .area-multi-picker'));
  pickers.forEach(picker => {
    const selectedInOtherRows = new Set(getSelectedCityAllocationValues(picker));
    picker.querySelectorAll('.area-multi-option').forEach(option => {
      const input = option.querySelector('.area-multi-checkbox');
      const disabled = !!input && !input.checked && selectedInOtherRows.has(input.value);
      if (input) input.disabled = disabled;
      option.classList.toggle('disabled', disabled);
    });
    refreshAreaMultiPickerSummary(picker);
  });
}

function switchCityPickerProvince(button) {
  const picker = button.closest('.area-multi-picker');
  if (!picker) return;
  picker.querySelectorAll('.city-province-item').forEach(item => item.classList.toggle('active', item === button));
  const province = button.dataset.province || '';
  picker.querySelectorAll('.city-group').forEach(group => {
    group.style.display = group.dataset.cityGroup === province ? '' : 'none';
  });
  const search = picker.querySelector('.city-picker-search-input');
  if (search) search.value = '';
  filterCityCascadePicker(search || picker.querySelector('.city-picker-search-input'));
}

function filterCityCascadePicker(input) {
  const picker = input?.closest('.area-multi-picker');
  if (!picker) return;
  const keyword = String(input.value || '').trim().toLowerCase();
  const groups = Array.from(picker.querySelectorAll('.city-group'));
  let visibleCount = 0;
  if (keyword) {
    groups.forEach(group => {
      let groupVisible = 0;
      group.querySelectorAll('.area-multi-option').forEach(option => {
        const city = (option.dataset.areaOption || option.textContent || '').toLowerCase();
        const visible = city.includes(keyword);
        option.style.display = visible ? '' : 'none';
        if (visible) groupVisible += 1;
      });
      group.style.display = groupVisible ? '' : 'none';
      visibleCount += groupVisible;
    });
    picker.querySelectorAll('.city-province-item').forEach(item => item.classList.remove('active'));
  } else {
    const active = picker.querySelector('.city-province-item.active') || picker.querySelector('.city-province-item');
    const province = active?.dataset.province || '';
    picker.querySelectorAll('.city-province-item').forEach(item => item.classList.toggle('active', item === active));
    groups.forEach(group => {
      const show = group.dataset.cityGroup === province;
      group.style.display = show ? '' : 'none';
      group.querySelectorAll('.area-multi-option').forEach(option => option.style.display = '');
      if (show) visibleCount += group.querySelectorAll('.area-multi-option').length;
    });
  }
  const empty = picker.querySelector('.city-picker-empty');
  if (empty) empty.style.display = visibleCount ? 'none' : 'block';
}

function filterProvinceMultiPicker(input) {
  const picker = input?.closest('.area-multi-picker');
  if (!picker) return;
  const keyword = String(input.value || '').trim().toLowerCase();
  let visibleCount = 0;
  picker.querySelectorAll('.province-picker-list .area-multi-option').forEach(option => {
    const province = (option.dataset.areaOption || option.textContent || '').toLowerCase();
    const visible = !keyword || province.includes(keyword);
    option.style.display = visible ? '' : 'none';
    if (visible) visibleCount += 1;
  });
  const empty = picker.querySelector('.province-picker-empty');
  if (empty) empty.style.display = visibleCount ? 'none' : 'block';
}

function selectCurrentProvinceCities(button) {
  const picker = button.closest('.area-multi-picker');
  if (!picker) return;
  const activeProvince = picker.querySelector('.city-province-item.active')?.dataset.province || '';
  const groups = Array.from(picker.querySelectorAll('.city-group'))
    .filter(group => !activeProvince || group.dataset.cityGroup === activeProvince);
  groups.flatMap(group => Array.from(group.querySelectorAll('.area-multi-checkbox'))).forEach(input => {
    if (!input.disabled) input.checked = true;
  });
  refreshCityAllocationSelectionMutex();
}

function clearCurrentCityPicker(button) {
  const picker = button.closest('.area-multi-picker');
  if (!picker) return;
  picker.querySelectorAll('.area-multi-checkbox').forEach(input => {
    input.checked = false;
  });
  refreshCityAllocationSelectionMutex();
}

function toggleAreaMultiPicker(trigger) {
  const picker = trigger.closest('.area-multi-picker');
  const shouldOpen = !picker.classList.contains('open');
  document.querySelectorAll('.area-multi-picker.open').forEach(item => {
    if (item !== picker) item.classList.remove('open');
  });
  picker.classList.toggle('open', shouldOpen);
  if (shouldOpen && picker.dataset.pickerType === 'city') {
    filterCityCascadePicker(picker.querySelector('.city-picker-search-input'));
  }
  if (shouldOpen && picker.dataset.pickerType === 'province') {
    filterProvinceMultiPicker(picker.querySelector('.province-picker-search-input'));
  }
}

function addSmartCodeCityAllocationRow() {
  const container = document.getElementById('smartCodeCityAllocationRows');
  const fallback = container?.querySelector('.city-allocation-row[data-fallback="true"]');
  if (!container || !fallback) return;
  const scope = container.dataset.allocationScope || 'city';
  const config = getAllocationAreaConfig(scope);
  const selected = getSelectedCityAllocationValues();
  const defaultValue = config.options.find(value => !selected.includes(value)) || config.defaultValue;
  fallback.insertAdjacentHTML('beforebegin', renderSmartCodeCityAllocationRow({ cities: [defaultValue], allocationMode: 'ratio', allocations: getDefaultAssignmentAllocationRows() }, 0, false, scope));
  refreshCityAllocationSelectionMutex();
}

function removeSmartCodeCityAllocationRow(button) {
  button.closest('.city-allocation-row')?.remove();
  refreshCityAllocationSelectionMutex();
}

function addCityAllocationRatioRow(button) {
  const panel = button.closest('.city-ratio-allocation')?.querySelector('.city-allocation-ratio-rows');
  panel?.insertAdjacentHTML('beforeend', renderSeriesAllocationRow({ channel: '', percent: '' }));
}

function getProjectNameOptionLabels() {
  return [...document.querySelectorAll('[data-project-option]')];
}

function updateProjectNameSelectedCount() {
  const config = getCompactAssignmentConfig(getLeadAssignmentDimension());
  const count = document.getElementById('projectNameSelectedCount');
  const trigger = document.getElementById('projectNameTrigger');
  const total = getProjectNameOptionLabels().length;
  const selected = [...document.querySelectorAll(`input[name="${config.inputName}"]:checked`)].map(input => input.value);
  if (count) count.textContent = `已选 ${selected.length} / ${total}`;
  getProjectNameOptionLabels().forEach(label => {
    const input = label.querySelector(`input[name="${config.inputName}"]`);
    label.classList.toggle('selected', !!input?.checked);
  });
  if (!trigger) return;
  trigger.classList.toggle('placeholder', !selected.length);
  if (!selected.length) {
    trigger.textContent = `请选择${config.valueLabel}`;
    return;
  }
  trigger.textContent = selected.slice(0, 3).join('、') + (selected.length > 3 ? ` 等${selected.length}项` : '');
}

function filterProjectNameOptions(keyword = '') {
  const input = document.getElementById('projectNameSearchInput');
  const normalized = String(keyword || input?.value || '').trim().toLowerCase();
  let visibleCount = 0;
  getProjectNameOptionLabels().forEach(label => {
    const text = (label.dataset.projectOption || label.textContent || '').toLowerCase();
    const visible = !normalized || text.includes(normalized);
    label.style.display = visible ? '' : 'none';
    if (visible) visibleCount += 1;
  });
  const empty = document.getElementById('projectNameSearchEmpty');
  if (empty) empty.style.display = visibleCount ? 'none' : 'block';
  updateProjectNameSelectedCount();
}

function selectAllProjectNameOptions() {
  const config = getCompactAssignmentConfig(getLeadAssignmentDimension());
  getProjectNameOptionLabels().forEach(label => {
    if (label.style.display === 'none') return;
    const input = label.querySelector(`input[name="${config.inputName}"]`);
    if (input) input.checked = true;
  });
  updateProjectNameSelectedCount();
}

function clearProjectNameOptions() {
  const config = getCompactAssignmentConfig(getLeadAssignmentDimension());
  document.querySelectorAll(`input[name="${config.inputName}"]`).forEach(input => {
    input.checked = false;
  });
  filterProjectNameOptions();
}

function toggleProjectNameOption(input) {
  input.closest('.tag-option')?.classList.toggle('selected', input.checked);
  updateProjectNameSelectedCount();
}

function toggleProjectNamePicker() {
  document.querySelectorAll('.tag-picker-panel').forEach(panel => {
    if (panel.id !== 'projectNamePanel') panel.classList.remove('show');
  });
  document.getElementById('projectNamePanel')?.classList.toggle('show');
}

function switchSmartCodeInputMode(mode) {
  const isManual = mode === 'manual';
  syncPickerManualInput({ mode, pickerSelector: 'input[name="assignmentSmartCodeValue"]', manualInputId: 'assignmentSmartCodeManualInput', onSync: updateProjectNameSelectedCount });
  document.getElementById('smartCodePickerMode')?.classList.toggle('active', !isManual);
  document.getElementById('smartCodeManualMode')?.classList.toggle('active', isManual);
  const picker = document.getElementById('smartCodePickerInputPanel');
  const manual = document.getElementById('smartCodeManualInputPanel');
  if (picker) picker.style.display = isManual ? 'none' : '';
  if (manual) manual.style.display = isManual ? '' : 'none';
}

function switchProjectNameInputMode(mode) {
  const isManual = mode === 'manual';
  syncPickerManualInput({ mode, pickerSelector: 'input[name="assignmentProjectValue"]', manualInputId: 'assignmentProjectNameManualInput', onSync: updateProjectNameSelectedCount });
  document.getElementById('projectNamePickerMode')?.classList.toggle('active', !isManual);
  document.getElementById('projectNameManualMode')?.classList.toggle('active', isManual);
  const picker = document.getElementById('projectNamePickerInputPanel');
  const manual = document.getElementById('projectNameManualInputPanel');
  if (picker) picker.style.display = isManual ? 'none' : '';
  if (manual) manual.style.display = isManual ? '' : 'none';
}

function switchDealerInputMode(mode) {
  const isManual = mode === 'manual';
  syncPickerManualInput({ mode, pickerSelector: 'input[name="assignmentDealerValue"]', manualInputId: 'assignmentDealerManualInput', onSync: updateProjectNameSelectedCount });
  document.getElementById('dealerPickerMode')?.classList.toggle('active', !isManual);
  document.getElementById('dealerManualMode')?.classList.toggle('active', isManual);
  const picker = document.getElementById('dealerPickerInputPanel');
  const manual = document.getElementById('dealerManualInputPanel');
  if (picker) picker.style.display = isManual ? 'none' : '';
  if (manual) manual.style.display = isManual ? '' : 'none';
}

function removeSeriesAllocationRow(button) {
  const panel = button.closest('.assignment-allocation-panel');
  const rows = panel ? panel.querySelectorAll('.assignment-allocation-row') : document.querySelectorAll('#seriesAllocationRows .assignment-allocation-row');
  if (rows.length <= 1) {
    showToast('至少保留一个外呼类型', false);
    return;
  }
  button.closest('.assignment-allocation-row')?.remove();
}

function refreshAllocationPushTimeSlotLabels(container) {
  const slots = Array.from(container?.querySelectorAll('.allocation-push-slot') || []);
  slots.forEach((slot, index) => {
    slot.dataset.slotIndex = String(index + 1);
    const label = slot.querySelector('.push-time-slot-label');
    if (label) label.textContent = `时段${index + 1}`;
    const remove = slot.querySelector('.push-time-remove');
    if (remove) remove.style.visibility = slots.length <= 1 ? 'hidden' : '';
  });
}

function addAllocationPushTimeSlot(button) {
  const container = button.closest('.allocation-row-push-time')?.querySelector('.allocation-push-slots');
  if (!container) return;
  const count = container.querySelectorAll('.allocation-push-slot').length;
  container.insertAdjacentHTML('beforeend', renderAllocationPushTimeSlot({ start: '', end: '' }, count, count + 1));
  refreshAllocationPushTimeSlotLabels(container);
}

function removeAllocationPushTimeSlot(button) {
  const container = button.closest('.allocation-push-slots');
  if (!container) return;
  const slots = container.querySelectorAll('.allocation-push-slot');
  if (slots.length <= 1) {
    showToast('至少保留一个推送时段', false);
    return;
  }
  button.closest('.allocation-push-slot')?.remove();
  refreshAllocationPushTimeSlotLabels(container);
}

function addMinutesToTime(value, minutes = 30) {
  if (!value) return '';
  const [hour, minute] = value.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return '';
  const next = Math.min((hour * 60) + minute + minutes, (23 * 60) + 59);
  const nextHour = String(Math.floor(next / 60)).padStart(2, '0');
  const nextMinute = String(next % 60).padStart(2, '0');
  return `${nextHour}:${nextMinute}`;
}

function getSmartCodeTimeOptions() {
  const options = [];
  for (let minuteOfDay = 0; minuteOfDay < 24 * 60; minuteOfDay += 10) {
    const hour = String(Math.floor(minuteOfDay / 60)).padStart(2, '0');
    const minute = String(minuteOfDay % 60).padStart(2, '0');
    options.push(`${hour}:${minute}`);
  }
  return options;
}

function getSmartCodePushTimeInputs() {
  return Array.from(document.querySelectorAll('#smartCodePushTimeSlots .smart-code-push-slot')).map((row, index) => ({
    row,
    index,
    start: row.querySelector('.smart-code-push-start'),
    end: row.querySelector('.smart-code-push-end')
  }));
}

function setSmartCodeTimeMin(input, minValue) {
  if (!input) return;
  if (minValue) {
    input.min = minValue;
  } else {
    input.removeAttribute('min');
  }
}

function setSmartCodeTimeError(rows, invalidInputs = [], message = '') {
  const hint = document.getElementById('smartCodePushTimeHint');
  rows.forEach(row => {
    row.start?.classList.remove('invalid');
    row.end?.classList.remove('invalid');
    row.start?.setCustomValidity('');
    row.end?.setCustomValidity('');
  });
  if (hint) {
    hint.textContent = message;
    hint.classList.toggle('show', !!message);
  }
  invalidInputs.forEach(input => {
    if (!input) return;
    input.classList.add('invalid');
    input.setCustomValidity(message || '时间顺序不正确');
  });
}

function validateSmartCodePushTimeOrder(showMessage = false) {
  const rows = getSmartCodePushTimeInputs();
  let previousTime = '';
  let previousLabel = '';
  for (const row of rows) {
    const rowNo = row.index + 1;
    const points = [
      { input: row.start, value: row.start?.value || '', label: `时段${rowNo}开始时间` },
      { input: row.end, value: row.end?.value || '', label: `时段${rowNo}结束时间` }
    ];
    for (const point of points) {
      if (point.value && previousTime && point.value <= previousTime) {
        const message = `${point.label}必须晚于${previousLabel}`;
        if (showMessage) setSmartCodeTimeError(rows, [point.input], message);
        return { ok: false, message };
      }
      if (point.value) {
        previousTime = point.value;
        previousLabel = point.label;
      }
    }
  }
  if (showMessage) setSmartCodeTimeError(rows);
  return { ok: true, message: '' };
}

function syncSmartCodePushTime() {
  const rows = getSmartCodePushTimeInputs();
  let previousTime = '';
  rows.forEach(row => {
    setSmartCodeTimeMin(row.start, previousTime ? addMinutesToTime(previousTime, 1) : '');
    if (row.start?.value) previousTime = row.start.value;
    setSmartCodeTimeMin(row.end, previousTime ? addMinutesToTime(previousTime, 1) : '');
    if (row.end?.value) previousTime = row.end.value;
  });
  validateSmartCodePushTimeOrder(true);
}

function initSmartCodePushTimeControls() {
  syncSmartCodePushTime();
}

function refreshSmartCodePushTimeSlotLabels() {
  const rows = getSmartCodePushTimeInputs();
  rows.forEach((row, index) => {
    row.row.dataset.slotIndex = String(index + 1);
    const label = row.row.querySelector('.push-time-slot-label');
    if (label) label.textContent = `时段${index + 1}`;
    const remove = row.row.querySelector('.push-time-remove');
    if (remove) remove.style.visibility = rows.length <= 1 ? 'hidden' : '';
  });
}

function addSmartCodePushTimeSlot() {
  const container = document.getElementById('smartCodePushTimeSlots');
  if (!container) return;
  const count = getSmartCodePushTimeInputs().length;
  container.insertAdjacentHTML('beforeend', renderSmartCodePushTimeSlot({ start: '', end: '' }, count, count + 1));
  refreshSmartCodePushTimeSlotLabels();
  syncSmartCodePushTime();
}

function toggleOptionalPushTime(button) {
  const container = button.closest('.optional-push-time');
  const body = container?.querySelector('.optional-push-time-body');
  if (!container || !body) return;
  const isExpanded = body.hidden;
  body.hidden = !isExpanded;
  container.dataset.expanded = String(isExpanded);
  button.textContent = isExpanded ? '收起配置' : '配置推送时间';
}

function removeSmartCodePushTimeSlot(button) {
  const rows = getSmartCodePushTimeInputs();
  if (rows.length <= 1) {
    showToast('至少保留一个推送时段', false);
    return;
  }
  button.closest('.smart-code-push-slot')?.remove();
  refreshSmartCodePushTimeSlotLabels();
  syncSmartCodePushTime();
}

function collectSmartCodePushTime() {
  const days = Array.from(document.querySelectorAll('input[name="smartCodePushDay"]:checked')).map(input => input.value);
  const slotRows = getSmartCodePushTimeInputs();
  const slots = slotRows.map(row => ({
    start: row.start?.value || '',
    end: row.end?.value || ''
  }));
  const filledSlots = slots.filter(slot => slot.start || slot.end);
  if (!days.length && !filledSlots.length) return { ok: true, value: { days: [], slots: [] } };
  if (!days.length) return { ok: false, message: '请选择推送星期' };
  const lastFilledIndex = slots.reduce((last, slot, index) => (slot.start || slot.end ? index : last), -1);
  for (let index = 0; index <= lastFilledIndex; index += 1) {
    const slot = slots[index];
    if ((slot.start && !slot.end) || (!slot.start && slot.end)) {
      return { ok: false, message: `请补全时段${index + 1}的开始和结束时间` };
    }
    if (!slot.start && !slot.end) {
      return { ok: false, message: `请先配置时段${index + 1}，再配置后续时段` };
    }
  }
  const orderResult = validateSmartCodePushTimeOrder(true);
  if (!orderResult.ok) {
    return orderResult;
  }
  return { ok: true, value: { days, slots: slots.filter(slot => slot.start && slot.end) } };
}

function collectCityAllocationFromRow(row, scope = 'city') {
  const config = getAllocationAreaConfig(scope);
  const isFallback = row.dataset.fallback === 'true';
  const areaInput = row.querySelector('.city-allocation-city');
  const cities = isFallback
    ? [config.fallbackLabel]
    : getAreaPickerSelectedValues(areaInput);
  if (!cities.length) return { ok: false, message: `请选择${config.valueLabel}` };
  const city = cities.join('、');
  const result = collectAllocationRowsFromPanel(row.querySelector('.city-allocation-ratio-rows'), city);
  if (!result.ok) return result;
  return { ok: true, value: { city, cities, allocationMode: 'ratio', allocations: result.value } };
}

function collectAllocationRowsFromPanel(panel, contextLabel = '') {
  const rows = Array.from(panel?.querySelectorAll('.assignment-allocation-row') || []);
  const allocations = [];
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const channel = row.querySelector('.series-allocation-channel')?.value || '';
    const percent = Number(row.querySelector('input.series-allocation-percent')?.value || 0);
    if (!channel) continue;
    const pushTimeResult = collectAllocationPushTimeFromRow(row, `${contextLabel}${contextLabel ? ' - ' : ''}${channel}`);
    if (!pushTimeResult.ok) return pushTimeResult;
    allocations.push({ channel, percent, pushTime: pushTimeResult.value });
  }
  const total = allocations.reduce((sum, item) => sum + item.percent, 0);
  if (!allocations.length) return { ok: false, message: `${contextLabel || '当前模板'}请配置外呼类型比例` };
  if (total !== 100) return { ok: false, message: `${contextLabel || '当前模板'}外呼类型比例合计必须为 100%` };
  return { ok: true, value: allocations };
}

function collectAllocationPushTimeFromRow(row, label = '当前外呼类型') {
  const days = Array.from(row.querySelectorAll('.allocation-push-day:checked')).map(input => input.value);
  const slots = Array.from(row.querySelectorAll('.allocation-push-slot')).map(slot => ({
    start: slot.querySelector('.allocation-push-start')?.value || '',
    end: slot.querySelector('.allocation-push-end')?.value || ''
  }));
  const filledSlots = slots.filter(slot => slot.start || slot.end);
  if (!days.length && !filledSlots.length) return { ok: true, value: { days: [], slots: [] } };
  if (!days.length) return { ok: false, message: `${label}请选择推送星期` };
  const lastFilledIndex = slots.reduce((last, slot, index) => (slot.start || slot.end ? index : last), -1);
  for (let index = 0; index <= lastFilledIndex; index += 1) {
    const slot = slots[index];
    if ((slot.start && !slot.end) || (!slot.start && slot.end)) {
      return { ok: false, message: `${label}请补全时段${index + 1}的开始和结束时间` };
    }
    if (!slot.start && !slot.end) {
      return { ok: false, message: `${label}请先配置时段${index + 1}，再配置后续时段` };
    }
    if (slot.start >= slot.end) {
      return { ok: false, message: `${label}时段${index + 1}结束时间必须晚于开始时间` };
    }
    if (index > 0) {
      const previous = slots[index - 1];
      if (previous.end && slot.start <= previous.end) {
        return { ok: false, message: `${label}时段${index + 1}开始时间必须晚于上一时段结束时间` };
      }
    }
  }
  return { ok: true, value: { days, slots: slots.filter(slot => slot.start && slot.end) } };
}

function collectSmartCodeCityAllocations(scope = 'city') {
  const config = getAllocationAreaConfig(scope);
  const rows = Array.from(document.querySelectorAll('#smartCodeCityAllocationRows .city-allocation-row'));
  const cityRows = rows.filter(row => row.dataset.fallback !== 'true');
  const fallbackRow = rows.find(row => row.dataset.fallback === 'true');
  if (!cityRows.length) return { ok: false, message: `请至少配置一个${config.valueLabel}` };
  if (!fallbackRow) return { ok: false, message: `请配置${config.fallbackLabel}` };
  const cityAllocations = [];
  const citySet = new Set();
  for (const row of cityRows) {
    const result = collectCityAllocationFromRow(row, scope);
    if (!result.ok) return result;
    for (const city of result.value.cities) {
      if (citySet.has(city)) return { ok: false, message: `${config.valueLabel}${city}重复，请勿在多个配置组中同时选择` };
      citySet.add(city);
    }
    cityAllocations.push(result.value);
  }
  const fallbackResult = collectCityAllocationFromRow(fallbackRow, scope);
  if (!fallbackResult.ok) return fallbackResult;
  return { ok: true, value: { cityAllocations, fallbackCityAllocation: fallbackResult.value } };
}

function saveSeriesAssignmentRule() {
  const dimension = getLeadAssignmentDimension();
  const config = getCompactAssignmentConfig(dimension);
  const smartCodeInputMode = document.getElementById('smartCodeManualMode')?.classList.contains('active') ? 'manual' : 'picker';
  const projectNameInputMode = document.getElementById('projectNameManualMode')?.classList.contains('active') ? 'manual' : 'picker';
  const dealerInputMode = document.getElementById('dealerManualMode')?.classList.contains('active') ? 'manual' : 'picker';
  let selectedValues = Array.from(document.querySelectorAll(`input[name="${config.inputName}"]:checked`)).map(input => input.value);
  if (dimension.key === 'sc' && smartCodeInputMode === 'manual') {
    const manualValue = document.getElementById('assignmentSmartCodeManualInput')?.value || '';
    selectedValues = [...new Set(manualValue.split(/[\s,，;；]+/).map(item => item.trim()).filter(Boolean))];
  }
  if (dimension.key === 'project' && projectNameInputMode === 'manual') {
    const manualValue = document.getElementById('assignmentProjectNameManualInput')?.value || '';
    selectedValues = [...new Set(manualValue.split(/[\s,，;；]+/).map(item => item.trim()).filter(Boolean))];
  }
  if (dimension.key === 'dealer' && dealerInputMode === 'manual') {
    const manualValue = document.getElementById('assignmentDealerManualInput')?.value || '';
    selectedValues = [...new Set(manualValue.split(/[\s,，;；]+/).map(item => item.trim()).filter(Boolean))];
  }
  const relatedSeriesValues = hasRelatedSeriesCondition(dimension)
    ? Array.from(document.querySelectorAll('input[name="assignmentRelatedSeriesValue"]:checked')).map(input => input.value)
    : [];
  const dealerLeadStatusValues = dimension.key === 'dealer'
    ? Array.from(document.querySelectorAll('input[name="assignmentDealerLeadStatusValue"]:checked')).map(input => input.value)
    : [];
  const leadStatusReasonValues = dimension.key === 'lead-status'
    ? Array.from(document.querySelectorAll('input[name="assignmentLeadStatusReasonValue"]:checked')).map(input => input.value)
    : [];
  const availableLeadStatusReasons = dimension.key === 'lead-status' ? getLeadStatusReasonOptions(selectedValues) : [];
  const isRatio = document.getElementById('seriesAllocationRatioTab')?.classList.contains('active');
  const useAllocationPolicy = isRatio ? '是' : '否';
  const allocationPolicyId = isRatio ? (document.getElementById('assignmentAllocationPolicyId')?.value || '') : '';
  const selectedAllocationPolicy = isRatio ? getAllocationPolicyById(allocationPolicyId) : null;
  let allocations = [];
  if (isRatio) {
    if (!allocationPolicyId) { showToast('请选择分配比例配置', false); return; }
    if (!selectedAllocationPolicy) { showToast('所选分配比例配置不存在', false); return; }
    if (selectedAllocationPolicy.status !== '启用') { showToast('所选分配比例配置已停用，请重新选择', false); return; }
    allocations = getAllocationPolicyScope(selectedAllocationPolicy) !== 'none'
      ? [
          ...(selectedAllocationPolicy.cityAllocations || []).flatMap(item => item.allocations || []),
          ...((selectedAllocationPolicy.fallbackCityAllocation || {}).allocations || [])
        ]
      : (selectedAllocationPolicy.allocations || []);
  } else {
    const channel = document.querySelector('input[name="seriesSingleChannel"]:checked')?.value || '';
    if (!channel) { showToast('请选择外呼类型', false); return; }
    allocations = [{ channel, percent: 100 }];
  }
  const name = document.getElementById('assignmentFormName').value.trim();
  if (!name) { showToast('请填写策略名称', false); return; }
  if (!selectedValues.length) { showToast(config.emptyToast, false); return; }
  if (dimension.key === 'lead-status' && availableLeadStatusReasons.length && !leadStatusReasonValues.length) {
    showToast('请选择异常原因', false);
    return;
  }
  const smartCodePushTimeResult = dimension.key === 'sc' && !isRatio ? collectSmartCodePushTime() : { ok: true, value: dimension.key === 'sc' ? { days: [], slots: [] } : null };
  if (!smartCodePushTimeResult.ok) { showToast(smartCodePushTimeResult.message, false); return; }
  const allocationText = dimension.key === 'sc'
    ? !isRatio
      ? `全部分配给${allocations[0].channel}`
      : `接入比例配置：${selectedAllocationPolicy.name}`
    : isRatio
      ? `接入比例配置：${selectedAllocationPolicy.name}`
      : `全部分配给${allocations[0].channel}`;
  const conditionParts = [`${config.conditionPrefix}=${selectedValues.join('、')}`];
  if (dimension.key === 'lead-status' && leadStatusReasonValues.length) {
    conditionParts.push(`异常原因=${leadStatusReasonValues.join('、')}`);
  }
  if (hasRelatedSeriesCondition(dimension) && relatedSeriesValues.length) {
    conditionParts.push(`意向车系=${relatedSeriesValues.join('、')}`);
  }
  if (dimension.key === 'dealer' && dealerLeadStatusValues.length) {
    conditionParts.push(`线索状态=${dealerLeadStatusValues.join('、')}`);
  }
  conditionParts.push(`是否按比例=${isRatio ? '是' : '否'}`);
  if (isRatio) {
    conditionParts.push(`分配比例配置=${selectedAllocationPolicy.name}`);
  }
  const payload = {
    name,
    keyValue: selectedValues.join('、'),
    [config.valuesKey]: selectedValues,
    ...(dimension.key === 'sc' ? { smartCodeInputMode } : {}),
    ...(dimension.key === 'project' ? { projectNameInputMode } : {}),
    ...(dimension.key === 'dealer' ? { dealerInputMode } : {}),
    ...(dimension.key === 'sc' ? { scSeriesValues: relatedSeriesValues } : {}),
    ...(dimension.key === 'project' ? { projectSeriesValues: relatedSeriesValues } : {}),
    ...(dimension.key === 'channel' ? { channelSeriesValues: relatedSeriesValues } : {}),
    ...(dimension.key === 'lead-status' ? { leadStatusSeriesValues: relatedSeriesValues } : {}),
    ...(dimension.key === 'lead-status' ? { leadStatusReasonValues } : {}),
    ...(dimension.key === 'dealer' ? { dealerSeriesValues: relatedSeriesValues } : {}),
    ...(dimension.key === 'dealer' ? { dealerLeadStatusValues } : {}),
    ...(dimension.key === 'sc' ? { pushTime: smartCodePushTimeResult.value } : {}),
    useAllocationPolicy,
    allocationPolicyId,
    cityAllocations: [],
    fallbackCityAllocation: null,
    callTypes: [...new Set(allocations.map(item => item.channel).filter(Boolean))],
    condition: conditionParts.join(' / '),
    allocationMode: isRatio ? 'policy' : 'single',
    allocations,
    action: allocationText,
    ratio: isRatio ? '按比例：比例配置' : '不按比例',
    status: document.getElementById('assignmentFormStatus').value,
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  };
  if (editingLeadAssignmentRuleId) {
    const index = dimension.rules.findIndex(item => item.id === editingLeadAssignmentRuleId);
    if (index > -1) dimension.rules[index] = { ...dimension.rules[index], ...payload };
    showToast(`${getLeadAssignmentRuleLabel(dimension)}已更新`, true);
  } else {
    dimension.rules.push({ ...getDefaultLeadAssignmentRule(dimension), sort: dimension.rules.length + 1, ...payload });
    showToast(`${getLeadAssignmentRuleLabel(dimension)}已创建`, true);
  }
  closeModal('leadDispatchRuleModal');
  renderLeadAssignmentConfigPage();
}


function saveLeadAssignmentRule() {
  const dimension = getLeadAssignmentDimension();
  if (isCompactAssignmentDimension(dimension)) return saveSeriesAssignmentRule();
  const payload = {
    name: document.getElementById('assignmentFormName').value.trim(),
    sort: Number(document.getElementById('assignmentFormSort').value) || 99,
    keyValue: document.getElementById('assignmentFormKeyValue').value.trim(),
    callTypes: document.getElementById('assignmentFormCallTypes').value.split(/[,，]/).map(item => item.trim()).filter(Boolean),
    condition: document.getElementById('assignmentFormCondition').value.trim(),
    action: document.getElementById('assignmentFormAction').value,
    ratio: document.getElementById('assignmentFormRatio').value.trim(),
    status: document.getElementById('assignmentFormStatus').value,
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  };
  if (!payload.name) { showToast('请填写策略名称', false); return; }
  if (!payload.keyValue) { showToast('请填写配置内容', false); return; }
  if (!payload.callTypes.length) { showToast('请填写外呼类型', false); return; }
  if (!payload.condition) { showToast('请填写匹配条件', false); return; }
  if (editingLeadAssignmentRuleId) {
    const index = dimension.rules.findIndex(item => item.id === editingLeadAssignmentRuleId);
    if (index > -1) dimension.rules[index] = { ...dimension.rules[index], ...payload };
    showToast(`${dimension.name}策略已更新`, true);
  } else {
    dimension.rules.push({ ...getDefaultLeadAssignmentRule(dimension), ...payload });
    showToast(`${dimension.name}策略已创建`, true);
  }
  closeModal('leadDispatchRuleModal');
  renderLeadAssignmentConfigPage();
}
