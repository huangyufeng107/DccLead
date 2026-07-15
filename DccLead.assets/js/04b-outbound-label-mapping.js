let outboundLabelMappingCurrentPage = 1;
let outboundLabelMappingPageSize = 10;

function renderOutboundLabelMappingPage() {
  const page = document.getElementById('outboundLabelMappingPage');
  if (!page) return;
  page.innerHTML = `
    <div class="page-hero">
      <div>
        <div class="page-title">外呼标签映射</div>
        <div class="page-desc">将预外呼回传的外呼标签或通话状态统一映射为抗拒原因标签、异常原因标签，供通话状态配置、线索下发配置、黑名单策略等后续规则引用。</div>
      </div>
      ${renderOutboundLabelMappingSummary()}
    </div>
    <div class="filter-row">
      <span class="filter-label">标签分类：</span>
      <select class="filter-select" id="outboundMappingCategoryFilter" onchange="filterOutboundLabelMappingTable()">
        <option value="">全部</option>
        ${outboundMappingCategoryOptions.map(item => `<option value="${escapeAttr(item)}">${escapeHtml(item)}</option>`).join('')}
      </select>
      <span class="filter-label">匹配维度：</span>
      <select class="filter-select" id="outboundMappingSourceFilter" onchange="filterOutboundLabelMappingTable()">
        <option value="">全部</option>
        ${outboundMappingSourceOptions.map(item => `<option value="${escapeAttr(item)}">${escapeHtml(item)}</option>`).join('')}
      </select>
      <span class="filter-label">状态：</span>
      <select class="filter-select" id="outboundMappingStatusFilter" onchange="filterOutboundLabelMappingTable()">
        <option value="">全部</option>
        <option value="启用">启用</option>
        <option value="停用">停用</option>
      </select>
      <button class="btn-secondary" type="button" onclick="resetOutboundLabelMappingFilters()">重置</button>
    </div>
    <div class="card">
      <div class="section-header">
        <div class="section-title">外呼标签映射列表</div>
        <button class="btn-add strategy-add-btn" type="button" onclick="openOutboundLabelMappingModal('add')">新增映射</button>
      </div>
      <table class="data-table assignment-rule-table">
        <thead>
          <tr>
            <th style="width:70px">#</th>
            <th>规则名称</th>
            <th style="width:140px">标签分类</th>
            <th style="width:110px">匹配维度</th>
            <th>匹配值</th>
            <th style="width:150px">映射结果</th>
            <th>备注</th>
            <th style="width:80px">状态</th>
            <th style="width:190px">操作</th>
          </tr>
        </thead>
        <tbody id="outboundLabelMappingTableBody"></tbody>
      </table>
      <div class="pagination">
        <span id="outboundLabelMappingPageInfo">共 0 条记录，当前第 1 / 1 页</span>
        <div class="pagination-btns">
          <select class="hit-page-size" id="outboundLabelMappingPageSize" onchange="changeOutboundLabelMappingPageSize(this.value)">
            <option value="5">每页 5 条</option>
            <option value="10">每页 10 条</option>
            <option value="20">每页 20 条</option>
          </select>
          <button class="page-btn" type="button" onclick="changeOutboundLabelMappingPage(-1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <select class="hit-page-size" id="outboundLabelMappingPageSelect" onchange="selectOutboundLabelMappingPage(this.value)"></select>
          <button class="page-btn" type="button" onclick="changeOutboundLabelMappingPage(1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
    </div>
  `;
  renderOutboundLabelMappingTable();
}

function renderOutboundLabelMappingSummary() {
  const enabled = outboundLabelMappingRules.filter(rule => rule.enabled).length;
  const reject = outboundLabelMappingRules.filter(rule => rule.category === '抗拒原因标签').length;
  const abnormal = outboundLabelMappingRules.filter(rule => rule.category === '异常原因标签').length;
  const tag = outboundLabelMappingRules.filter(rule => getOutboundMappingRuleSources(rule).includes('外呼标签')).length;
  const status = outboundLabelMappingRules.filter(rule => getOutboundMappingRuleSources(rule).includes('通话状态')).length;
  const items = [
    { label: '规则总数', value: outboundLabelMappingRules.length },
    { label: '启用规则', value: enabled },
    { label: '抗拒原因标签', value: reject },
    { label: '异常原因标签', value: abnormal },
    { label: '外呼标签规则', value: tag },
    { label: '通话状态规则', value: status }
  ];
  return `<div class="summary-strip">${items.map(item => `<div class="summary-card"><div class="summary-label">${item.label}</div><div class="summary-value">${item.value}</div></div>`).join('')}</div>`;
}

function getFilteredOutboundLabelMappingRules() {
  const category = document.getElementById('outboundMappingCategoryFilter')?.value || '';
  const source = document.getElementById('outboundMappingSourceFilter')?.value || '';
  const status = document.getElementById('outboundMappingStatusFilter')?.value || '';
  const sourceRank = { '通话状态': 1, '外呼标签': 2 };
  return outboundLabelMappingRules
    .filter(rule => !category || rule.category === category)
    .filter(rule => !source || getOutboundMappingRuleSources(rule).includes(source))
    .filter(rule => !status || (status === '启用' ? rule.enabled : !rule.enabled))
    .sort((a, b) => getOutboundMappingSourceSort(a, sourceRank) - getOutboundMappingSourceSort(b, sourceRank) || a.id - b.id);
}

function getOutboundMappingRuleSources(rule = {}) {
  return Array.isArray(rule.sources) && rule.sources.length ? rule.sources : (rule.source ? [rule.source] : []);
}

function getOutboundMappingSourceSort(rule, sourceRank) {
  return Math.min(...getOutboundMappingRuleSources(rule).map(source => sourceRank[source] || 9));
}

function getOutboundMappingMatchValuesBySource(rule = {}) {
  if (rule.matchValuesBySource) return rule.matchValuesBySource;
  const source = getOutboundMappingRuleSources(rule)[0] || '';
  return source ? { [source]: rule.matchValues || [] } : {};
}

function getOutboundMappingMatchLogicBySource(rule = {}) {
  const legacyLogic = rule.tagLogic === '且' ? '且' : '或';
  const logicBySource = rule.matchLogicBySource || {};
  return getOutboundMappingRuleSources(rule).reduce((result, source) => {
    if (source === '外呼标签') result[source] = logicBySource[source] === '且' ? '且' : legacyLogic;
    if (source === '通话状态') result[source] = logicBySource[source] === '且' ? '且' : '或';
    return result;
  }, {});
}

function getOutboundMappingDisplayMatchValues(rule = {}) {
  const valuesBySource = getOutboundMappingMatchValuesBySource(rule);
  return getOutboundMappingRuleSources(rule).flatMap(source => (valuesBySource[source] || []).map(value => `${source}：${value}`));
}

function renderOutboundLabelMappingTable() {
  const body = document.getElementById('outboundLabelMappingTableBody');
  if (!body) return;
  const rows = getFilteredOutboundLabelMappingRules();
  const totalPages = Math.max(1, Math.ceil(rows.length / outboundLabelMappingPageSize));
  outboundLabelMappingCurrentPage = Math.min(outboundLabelMappingCurrentPage, totalPages);
  const start = (outboundLabelMappingCurrentPage - 1) * outboundLabelMappingPageSize;
  const pageRows = rows.slice(start, start + outboundLabelMappingPageSize);

  const info = document.getElementById('outboundLabelMappingPageInfo');
  if (info) info.textContent = `共 ${rows.length} 条记录，当前第 ${outboundLabelMappingCurrentPage} / ${totalPages} 页`;

  const pageSelect = document.getElementById('outboundLabelMappingPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, idx) => `<option value="${idx + 1}">第 ${idx + 1} 页</option>`).join('');
    pageSelect.value = String(outboundLabelMappingCurrentPage);
  }

  const pageSizeSelect = document.getElementById('outboundLabelMappingPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(outboundLabelMappingPageSize);

  body.innerHTML = pageRows.length ? pageRows.map((rule, index) => `
    <tr>
      <td><span class="policy-plain-text">${start + index + 1}</span></td>
      <td><div class="rule-text-stack"><div class="rule-text-main">${escapeHtml(rule.name)}</div><div class="rule-muted">规则ID：OLM-${String(rule.id).padStart(3, '0')}</div></div></td>
      <td><span class="policy-plain-text">${escapeHtml(rule.category)}</span></td>
      <td>${renderRuleChipList(getOutboundMappingRuleSources(rule), 'blue', 2)}</td>
      <td>${renderRuleChipList(getOutboundMappingDisplayMatchValues(rule), 'green', 4)}</td>
      <td><span class="tag-chip blue">${escapeHtml(rule.output)}</span></td>
      <td>${renderClampedCellText(rule.remark || '—')}</td>
      <td>${rule.enabled ? '<span class="col-status-on">● 启用</span>' : '<span class="col-status-off">● 停用</span>'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view" type="button" onclick="openOutboundLabelMappingModal('view', ${rule.id})">查看</button>
          <button class="action-btn edit" type="button" onclick="openOutboundLabelMappingModal('edit', ${rule.id})">编辑</button>
          <button class="action-btn delete" type="button" onclick="deleteOutboundLabelMappingRule(${rule.id})">删除</button>
        </div>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="9"><div class="empty-state">暂无匹配的外呼标签映射</div></td></tr>';
}

function filterOutboundLabelMappingTable() {
  outboundLabelMappingCurrentPage = 1;
  renderOutboundLabelMappingTable();
}

function resetOutboundLabelMappingFilters() {
  ['outboundMappingCategoryFilter', 'outboundMappingSourceFilter', 'outboundMappingStatusFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  filterOutboundLabelMappingTable();
}

function changeOutboundLabelMappingPageSize(value) {
  outboundLabelMappingPageSize = Number(value) || 10;
  outboundLabelMappingCurrentPage = 1;
  renderOutboundLabelMappingTable();
}

function changeOutboundLabelMappingPage(dir) {
  const rows = getFilteredOutboundLabelMappingRules();
  const totalPages = Math.max(1, Math.ceil(rows.length / outboundLabelMappingPageSize));
  outboundLabelMappingCurrentPage = Math.max(1, Math.min(totalPages, outboundLabelMappingCurrentPage + dir));
  renderOutboundLabelMappingTable();
}

function selectOutboundLabelMappingPage(value) {
  outboundLabelMappingCurrentPage = Number(value) || 1;
  renderOutboundLabelMappingTable();
}

function renderOutboundLabelMappingDetail(rule) {
  if (!rule) return '<div class="empty-state">未找到外呼标签映射</div>';
  const logicBySource = getOutboundMappingMatchLogicBySource(rule);
  const sources = getOutboundMappingRuleSources(rule);
  const baseFields = [
    ['规则名称', rule.name],
    ['状态', rule.enabled ? '启用' : '停用'],
    ['标签分类', rule.category],
    ['映射结果', rule.output]
  ];
  const matchFields = [
    ['匹配维度', sources.join('、')],
    ...(sources.includes('外呼标签') ? [['外呼标签判断条件', logicBySource['外呼标签'] === '且' ? '且（AND）' : '或（OR）']] : []),
    ...(sources.includes('通话状态') ? [['通话状态判断条件', logicBySource['通话状态'] === '且' ? '且（AND）' : '或（OR）']] : []),
    ['匹配值', getOutboundMappingDisplayMatchValues(rule).join('、')]
  ];
  const otherFields = [
    ['更新时间', rule.updatedAt],
    ['备注', rule.remark || '—']
  ];
  return `<div class="rule-detail-layout">
    <section class="rule-detail-section"><div class="rule-detail-title">基础信息</div><div class="rule-detail-body">${baseFields.map(([label, value]) => `<div class="rule-detail-field"><div class="rule-detail-label">${label}</div><div class="rule-detail-value">${detailValue(value)}</div></div>`).join('')}</div></section>
    <section class="rule-detail-section"><div class="rule-detail-title">匹配条件</div><div class="rule-detail-body">${matchFields.map(([label, value]) => `<div class="rule-detail-field"><div class="rule-detail-label">${label}</div><div class="rule-detail-value">${detailValue(value)}</div></div>`).join('')}</div></section>
    <section class="rule-detail-section"><div class="rule-detail-title">其他信息</div><div class="rule-detail-body">${otherFields.map(([label, value]) => `<div class="rule-detail-field"><div class="rule-detail-label">${label}</div><div class="rule-detail-value">${detailValue(value)}</div></div>`).join('')}</div></section>
  </div>`;
}

function getOutboundMappingValueOptions(source) {
  if (source === '通话状态') return leadDispatchCallStatusOptions;
  if (source === '外呼标签') return leadDispatchTagOptions;
  return [];
}

function getOutboundMappingOutputs(category) {
  return outboundMappingOutputMap[category] || [];
}

function getOutboundMappingSources(output) {
  return outboundMappingSourceMap[output] || [];
}

function normalizeOutboundMappingTarget(rule = {}) {
  const category = outboundMappingCategoryOptions.includes(rule.category) ? rule.category : '';
  const outputs = category ? getOutboundMappingOutputs(category) : [];
  const output = outputs.includes(rule.output) ? rule.output : '';
  const sources = output ? getOutboundMappingSources(output) : [];
  const selectedSources = getOutboundMappingRuleSources(rule).filter(source => sources.includes(source));
  return { category, output, sources: selectedSources };
}

function renderOutboundMappingOutputOptions(category, selected = '') {
  return `<option value="">请选择</option>${getOutboundMappingOutputs(category).map(item => `<option value="${escapeAttr(item)}" ${selected === item ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}`;
}

function renderOutboundMappingSourceCheckboxes(output, selected = [], disabled = false) {
  const sources = disabled ? outboundMappingSourceOptions : getOutboundMappingSources(output);
  return `<div class="outbound-source-options">${sources.map(source => {
    const checked = !disabled && selected.includes(source);
    return `<label class="tag-option ${checked ? 'selected' : ''} ${disabled ? 'disabled' : ''}"><input type="checkbox" name="outboundMappingSource" value="${escapeAttr(source)}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} onchange="this.closest('.tag-option').classList.toggle('selected', this.checked);syncOutboundMappingValueField()" />${escapeHtml(source)}</label>`;
  }).join('')}</div>`;
}

function getOutboundMappingLogicConfig(source) {
  if (source === '通话状态') {
    return {
      key: 'Status',
      selectId: 'outboundMappingStatusLogic',
      andId: 'outboundMappingStatusAnd',
      orId: 'outboundMappingStatusOr',
      descId: 'outboundMappingStatusLogicDesc',
      label: '状态判断条件：',
      andDesc: '需同时命中全部已选通话状态才触发规则',
      orDesc: '命中任意一个已选通话状态即触发规则'
    };
  }
  return {
    key: 'Tag',
    selectId: 'outboundMappingTagLogic',
    andId: 'outboundMappingTagAnd',
    orId: 'outboundMappingTagOr',
    descId: 'outboundMappingTagLogicDesc',
    label: '标签判断条件：',
    andDesc: '需同时命中全部已选标签才映射',
    orDesc: '命中任意一个已选标签即映射'
  };
}

function renderOutboundMappingMatchLogic(source, value = '或') {
  const config = getOutboundMappingLogicConfig(source);
  const isAnd = value === '且';
  return `
    <select class="form-input" id="${config.selectId}" style="display:none">
      <option value="且" ${isAnd ? 'selected' : ''}>且</option>
      <option value="或" ${!isAnd ? 'selected' : ''}>或</option>
    </select>
    <div class="condition-row outbound-mapping-condition-row">
      <span class="condition-label">${config.label}</span>
      <div class="condition-toggle">
        <button type="button" class="condition-btn ${isAnd ? 'active' : ''}" id="${config.andId}" onclick="setOutboundMappingMatchLogic('${source}', '且')">且 (AND)</button>
        <button type="button" class="condition-btn ${!isAnd ? 'active' : ''}" id="${config.orId}" onclick="setOutboundMappingMatchLogic('${source}', '或')">或 (OR)</button>
      </div>
      <span class="condition-desc" id="${config.descId}">${isAnd ? config.andDesc : config.orDesc}</span>
    </div>
  `;
}

function renderOutboundMappingValueField(source, selected = [], logic = '或') {
  const options = getOutboundMappingValueOptions(source);
  const config = getOutboundMappingPickerConfig(source);
  const safeSelected = selected || [];
  const triggerText = safeSelected.length ? safeSelected.join('、') : config.placeholder;
  return `
    <div class="tag-picker dispatch-tag-picker outbound-mapping-picker" data-source="${escapeAttr(source)}">
      <button class="tag-picker-trigger ${safeSelected.length ? '' : 'placeholder'}" id="${config.triggerId}" type="button" onclick="toggleOutboundMappingValuePicker('${source}')">${escapeHtml(triggerText)}</button>
      <div class="tag-picker-panel" id="${config.panelId}">
        <div class="tag-picker-toolbar">
          <span id="${config.countId}">已选 ${safeSelected.length} / ${options.length}</span>
          <div class="tag-picker-actions">
            <button class="tag-picker-action" type="button" onclick="selectAllOutboundMappingValues('${source}')">全选</button>
            <button class="tag-picker-action" type="button" onclick="clearOutboundMappingValues('${source}')">清空</button>
          </div>
        </div>
        ${source === '外呼标签' ? `<div class="tag-picker-search"><input type="search" placeholder="搜索外呼标签" oninput="filterTagPickerOptions('${config.panelId}', this.value)" /></div>` : ''}
        <div class="tag-picker-list">
          ${options.map(value => `
            <label class="tag-option ${safeSelected.includes(value) ? 'selected' : ''}">
              <input type="checkbox" name="outboundMappingMatchValue" data-source="${escapeAttr(source)}" value="${escapeAttr(value)}" ${safeSelected.includes(value) ? 'checked' : ''} onchange="toggleOutboundMappingValueOption('${source}', this)" />
              ${escapeHtml(value)}
            </label>
          `).join('')}
        </div>
        <div class="tag-picker-empty">暂无匹配数据</div>
      </div>
    </div>
    ${['外呼标签', '通话状态'].includes(source) ? renderOutboundMappingMatchLogic(source, logic) : ''}
  `;
}

function getOutboundMappingPickerConfig(source) {
  if (source === '通话状态') {
    return {
      key: 'Status',
      panelId: 'outboundMappingStatusPanel',
      triggerId: 'outboundMappingStatusTrigger',
      countId: 'outboundMappingStatusCount',
      placeholder: '请选择通话状态'
    };
  }
  return {
    key: 'Tag',
    panelId: 'outboundMappingTagPanel',
    triggerId: 'outboundMappingTagTrigger',
    countId: 'outboundMappingTagCount',
    placeholder: '请选择包含标签'
  };
}

function getOutboundMappingValueInputs(source) {
  return Array.from(document.querySelectorAll(`input[name="outboundMappingMatchValue"][data-source="${source}"]`));
}

function toggleOutboundMappingValuePicker(source) {
  const { panelId } = getOutboundMappingPickerConfig(source);
  toggleExclusivePanel(panelId);
  updateOutboundMappingValuePicker(source);
}

function toggleOutboundMappingValueOption(source, input) {
  togglePickerOption(input, () => updateOutboundMappingValuePicker(source));
}

function updateOutboundMappingValuePicker(source) {
  const config = getOutboundMappingPickerConfig(source);
  updatePickerSummaryFromInputs({
    inputs: getOutboundMappingValueInputs(source),
    triggerId: config.triggerId,
    countId: config.countId,
    placeholder: config.placeholder,
    maxLabels: Number.POSITIVE_INFINITY
  });
}

function selectAllOutboundMappingValues(source) {
  const inputs = getVisibleTagPickerInputs(getOutboundMappingPickerConfig(source).panelId);
  setPickerInputsChecked(inputs, true, () => updateOutboundMappingValuePicker(source));
}

function clearOutboundMappingValues(source) {
  setPickerInputsChecked(getOutboundMappingValueInputs(source), false, () => updateOutboundMappingValuePicker(source));
}

function setOutboundMappingMatchLogic(source, value) {
  const config = getOutboundMappingLogicConfig(source);
  const logic = value === '且' ? '且' : '或';
  const select = document.getElementById(config.selectId);
  if (select) select.value = logic;
  document.getElementById(config.andId)?.classList.toggle('active', logic === '且');
  document.getElementById(config.orId)?.classList.toggle('active', logic !== '且');
  const desc = document.getElementById(config.descId);
  if (desc) desc.textContent = logic === '且' ? config.andDesc : config.orDesc;
}

function setOutboundMappingTagLogic(value) {
  setOutboundMappingMatchLogic('外呼标签', value);
}

function renderOutboundMappingValueFields(sources = [], selectedBySource = {}, logicBySource = {}) {
  if (!sources.length) {
    return '<div class="series-form-hint">请先选择匹配维度</div>';
  }
  return sources.map(source => {
    const label = source === '外呼标签' ? '包含标签' : (source === '通话状态' ? '通话状态' : `${source}匹配值`);
    return `
      <div class="form-group" style="margin-bottom:14px">
        <div class="form-label">${escapeHtml(label)} <span class="required">*</span></div>
        ${renderOutboundMappingValueField(source, selectedBySource[source] || [], logicBySource[source] || '或')}
      </div>
    `;
  }).join('');
}

function renderOutboundLabelMappingForm(rule = {}) {
  const normalized = normalizeOutboundMappingTarget(rule);
  const target = {
    name: '',
    category: normalized.category,
    sources: normalized.sources,
    matchValuesBySource: {},
    matchLogicBySource: {},
    output: normalized.output,
    remark: '',
    enabled: true,
    ...rule
  };
  target.category = normalized.category;
  target.output = normalized.output;
  target.sources = normalized.sources;
  target.matchValuesBySource = getOutboundMappingMatchValuesBySource(target);
  target.matchLogicBySource = getOutboundMappingMatchLogicBySource(target);
  return `
    <div class="dispatch-rule-form">
      <section class="dispatch-form-section">
        <div class="dispatch-section-title">基础信息</div>
        <div class="dispatch-form-grid">
          <div class="form-group"><div class="form-label">规则名称 <span class="required">*</span></div><input class="form-input" id="outboundMappingName" value="${escapeAttr(target.name)}" placeholder="例：客观理由拒绝归因" /></div>
          <div class="form-group"><div class="form-label">状态</div><select class="form-input" id="outboundMappingEnabled"><option value="启用" ${target.enabled ? 'selected' : ''}>启用</option><option value="停用" ${!target.enabled ? 'selected' : ''}>停用</option></select></div>
          <div class="form-group"><div class="form-label">标签分类 <span class="required">*</span></div><select class="form-input" id="outboundMappingCategory" onchange="syncOutboundMappingOutputOptions()"><option value="">请选择</option>${outboundMappingCategoryOptions.map(item => `<option value="${escapeAttr(item)}" ${target.category === item ? 'selected' : ''}>${escapeHtml(item)}</option>`).join('')}</select></div>
          <div class="form-group"><div class="form-label">映射结果 <span class="required">*</span></div><select class="form-input" id="outboundMappingOutput" onchange="syncOutboundMappingSourceOptions()" ${target.category ? '' : 'disabled'}>${renderOutboundMappingOutputOptions(target.category, target.output)}</select></div>
        </div>
      </section>
      <section class="dispatch-form-section">
        <div class="dispatch-section-title">匹配条件</div>
        <div class="form-group">
          <div class="form-label">匹配维度 <span class="required">*</span></div>
          <div id="outboundMappingSourceField">${renderOutboundMappingSourceCheckboxes(target.output, target.sources, !target.category || !target.output)}</div>
        </div>
        <div class="form-group">
          <div class="form-label">匹配值 <span class="required">*</span></div>
          <div id="outboundMappingValueField">${renderOutboundMappingValueFields(target.sources, target.matchValuesBySource, target.matchLogicBySource)}</div>
        </div>
        <div class="form-group"><div class="form-label">备注</div><textarea class="form-textarea" id="outboundMappingRemark" placeholder="填写该映射规则的业务说明">${escapeHtml(target.remark || '')}</textarea></div>
      </section>
    </div>
  `;
}

function syncOutboundMappingValueField() {
  const sources = getSelectedOutboundMappingSources();
  const field = document.getElementById('outboundMappingValueField');
  const logicBySource = {
    '外呼标签': document.getElementById('outboundMappingTagLogic')?.value || '或',
    '通话状态': document.getElementById('outboundMappingStatusLogic')?.value || '或'
  };
  if (field) field.innerHTML = renderOutboundMappingValueFields(sources, {}, logicBySource);
}

function syncOutboundMappingOutputOptions() {
  const category = document.getElementById('outboundMappingCategory')?.value || '';
  const outputSelect = document.getElementById('outboundMappingOutput');
  if (!outputSelect) return;
  outputSelect.disabled = !category;
  outputSelect.innerHTML = renderOutboundMappingOutputOptions(category, '');
  syncOutboundMappingSourceOptions();
}

function syncOutboundMappingSourceOptions() {
  const category = document.getElementById('outboundMappingCategory')?.value || '';
  const output = document.getElementById('outboundMappingOutput')?.value || '';
  const sourceField = document.getElementById('outboundMappingSourceField');
  if (!sourceField) return;
  sourceField.innerHTML = renderOutboundMappingSourceCheckboxes(output, [], !category || !output);
  syncOutboundMappingValueField();
}

function openOutboundLabelMappingModal(mode, id = null) {
  setSharedRuleModalVisual('config');
  const rule = id ? outboundLabelMappingRules.find(item => item.id === id) : null;
  editingOutboundLabelMappingId = mode === 'edit' ? id : null;
  const titleMap = { add: '新增外呼标签映射', edit: '编辑外呼标签映射', view: '查看外呼标签映射' };
  document.getElementById('leadDispatchRuleModalTitle').textContent = titleMap[mode] || '外呼标签映射';
  document.getElementById('leadDispatchRuleModalBody').innerHTML = mode === 'view' ? renderOutboundLabelMappingDetail(rule) : renderOutboundLabelMappingForm(rule || {});
  document.getElementById('leadDispatchRuleModalFooter').innerHTML = mode === 'view'
    ? `<button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">关闭</button>`
    : `<button class="btn-cancel" type="button" onclick="closeModal('leadDispatchRuleModal')">取消</button><button class="btn-save" type="button" onclick="saveOutboundLabelMappingRule()">保存</button>`;
  document.getElementById('leadDispatchRuleModal').classList.add('show');
}

function getSelectedOutboundMappingSources() {
  return Array.from(document.querySelectorAll('input[name="outboundMappingSource"]:checked')).map(input => input.value);
}

function getOutboundMappingMatchValuesBySelectedSources(sources = []) {
  return sources.reduce((result, source) => {
    result[source] = Array.from(document.querySelectorAll(`input[name="outboundMappingMatchValue"][data-source="${source}"]:checked`)).map(input => input.value);
    return result;
  }, {});
}

function getOutboundMappingMatchLogicBySelectedSources(sources = []) {
  return sources.reduce((result, source) => {
    if (['外呼标签', '通话状态'].includes(source)) {
      const { selectId } = getOutboundMappingLogicConfig(source);
      result[source] = document.getElementById(selectId)?.value === '且' ? '且' : '或';
    }
    return result;
  }, {});
}

function saveOutboundLabelMappingRule() {
  const name = document.getElementById('outboundMappingName')?.value.trim() || '';
  if (!name) { showToast('请填写规则名称', false); return; }
  const category = document.getElementById('outboundMappingCategory')?.value || '';
  if (!category) { showToast('请选择标签分类', false); return; }
  const output = document.getElementById('outboundMappingOutput')?.value || '';
  if (!output || !getOutboundMappingOutputs(category).includes(output)) { showToast('请选择有效映射结果', false); return; }
  const sources = getSelectedOutboundMappingSources();
  if (!sources.length) { showToast('请选择匹配维度', false); return; }
  const matchValuesBySource = getOutboundMappingMatchValuesBySelectedSources(sources);
  const matchLogicBySource = getOutboundMappingMatchLogicBySelectedSources(sources);
  const missingSource = sources.find(source => !(matchValuesBySource[source] || []).length);
  if (missingSource) {
    const missingLabel = missingSource === '外呼标签' ? '包含标签' : (missingSource === '通话状态' ? '通话状态' : `${missingSource}匹配值`);
    showToast(`请选择${missingLabel}`, false);
    return;
  }
  if (sources.some(source => !getOutboundMappingSources(output).includes(source))) { showToast('请选择有效匹配维度', false); return; }
  const payload = {
    name,
    category,
    sources,
    source: sources.join('、'),
    matchValuesBySource,
    matchLogicBySource,
    tagLogic: matchLogicBySource['外呼标签'] || '或',
    matchValues: sources.flatMap(source => matchValuesBySource[source] || []),
    output,
    remark: document.getElementById('outboundMappingRemark')?.value.trim() || '',
    enabled: document.getElementById('outboundMappingEnabled')?.value !== '停用',
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  };
  if (editingOutboundLabelMappingId) {
    const index = outboundLabelMappingRules.findIndex(item => item.id === editingOutboundLabelMappingId);
    if (index > -1) outboundLabelMappingRules[index] = { ...outboundLabelMappingRules[index], ...payload };
    showToast('外呼标签映射已更新', true);
  } else {
    outboundLabelMappingRules.push({ id: outboundLabelMappingNextId++, ...payload });
    showToast('外呼标签映射已新增', true);
  }
  closeModal('leadDispatchRuleModal');
  renderOutboundLabelMappingPage();
}

function deleteOutboundLabelMappingRule(id) {
  const rule = outboundLabelMappingRules.find(item => item.id === id);
  if (!rule) return;
  if (!confirm(`确认删除外呼标签映射「${rule.name}」？`)) return;
  outboundLabelMappingRules = outboundLabelMappingRules.filter(item => item.id !== id);
  showToast('外呼标签映射已删除', true);
  renderOutboundLabelMappingPage();
}
