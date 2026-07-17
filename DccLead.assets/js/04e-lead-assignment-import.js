const leadAssignmentImportColumns = ['策略名称', '配置内容', '意向车系', '线索状态', '异常原因', '是否按比例', '分配比例配置', '外呼类型', '状态'];
let leadAssignmentImportState = {
  step: 1,
  dimensionKey: '',
  fileName: '',
  rows: [],
  validatedRows: [],
  result: { success: 0, failed: 0 }
};

function openLeadAssignmentImportWizard() {
  const dimension = getLeadAssignmentDimension();
  leadAssignmentImportState = {
    step: 1,
    dimensionKey: dimension.key,
    fileName: '',
    rows: [],
    validatedRows: [],
    result: { success: 0, failed: 0 }
  };
  document.getElementById('leadAssignmentImportTitle').textContent = `导入${getLeadAssignmentRuleLabel(dimension)}`;
  document.getElementById('leadAssignmentImportModal').classList.add('show');
  renderLeadAssignmentImportWizard();
}

function getImportWizardDimension() {
  return leadAssignmentDimensions.find(item => item.key === leadAssignmentImportState.dimensionKey) || getLeadAssignmentDimension();
}

function getLeadAssignmentImportDisplayColumns(dimension = getImportWizardDimension()) {
  const config = getCompactAssignmentConfig(dimension);
  return leadAssignmentImportColumns.map(column => {
    if (column === '策略名称') return { key: column, label: '策略名称*' };
    if (column === '配置内容') return { key: column, label: `配置内容*（${config.valueLabel}）` };
    if (column === '是否按比例') return { key: column, label: '是否按比例*' };
    if (column === '分配比例配置') return { key: column, label: '分配比例配置*（按比例=是）' };
    if (column === '外呼类型') return { key: column, label: '外呼类型*（按比例=否）' };
    if (column === '状态') return { key: column, label: '状态*' };
    if (column === '异常原因' && dimension.key === 'lead-status') return { key: column, label: '异常原因*（状态要求时）' };
    return { key: column, label: column };
  });
}

function renderLeadAssignmentImportWizard() {
  const body = document.getElementById('leadAssignmentImportBody');
  const footer = document.getElementById('leadAssignmentImportFooter');
  if (!body || !footer) return;
  body.innerHTML = `
    ${renderLeadAssignmentImportSteps()}
    ${leadAssignmentImportState.step === 1 ? renderLeadAssignmentImportStepUpload() : ''}
    ${leadAssignmentImportState.step === 2 ? renderLeadAssignmentImportStepPreview() : ''}
    ${leadAssignmentImportState.step === 3 ? renderLeadAssignmentImportStepComplete() : ''}
  `;
  footer.innerHTML = renderLeadAssignmentImportFooter();
}

function renderLeadAssignmentImportSteps() {
  const step = leadAssignmentImportState.step;
  const items = [
    ['Step1', '上传文件'],
    ['Step2', '数据预览'],
    ['Step3', '导入完成']
  ];
  return `
    <div class="assignment-import-steps">
      ${items.map((item, index) => {
        const no = index + 1;
        const cls = no === step ? 'active' : no < step ? 'done' : '';
        return `<div class="assignment-import-step ${cls}"><div class="assignment-import-step-index">${item[0]}</div><div class="assignment-import-step-title">${item[1]}</div></div>`;
      }).join('')}
    </div>
  `;
}

function renderLeadAssignmentImportStepUpload() {
  const dimension = getImportWizardDimension();
  return `
    <div class="assignment-import-panel">
      <div class="assignment-import-tip">
        Step1 操作说明：下载模板了解格式要求 → 按模板填写 → 上传Excel文件。当前导入维度：${escapeHtml(dimension.name)}；模板已包含必填字段列，上传后会校验数据格式与枚举值合法性。
      </div>
      <div class="action-btns">
        <button class="btn-secondary" type="button" onclick="downloadLeadAssignmentImportTemplate()">下载模板</button>
      </div>
      <label class="assignment-import-upload">
        <input id="leadAssignmentImportFile" type="file" accept=".xls,.xlsx,.xml,.csv,.tsv,.txt" onchange="handleLeadAssignmentImportFile(this.files && this.files[0])" />
        <div>
          <strong>上传Excel文件</strong>
          <span>支持使用模板下载的 .xls 文件，也兼容 CSV/TSV 文本文件</span>
        </div>
      </label>
      <div class="assignment-import-file" id="leadAssignmentImportFileName">${leadAssignmentImportState.fileName ? `已选择：${escapeHtml(leadAssignmentImportState.fileName)}` : ''}</div>
    </div>
  `;
}

function renderLeadAssignmentImportStepPreview() {
  const displayColumns = getLeadAssignmentImportDisplayColumns();
  const rows = leadAssignmentImportState.validatedRows;
  const success = rows.filter(row => row.valid).length;
  const failed = rows.length - success;
  return `
    <div class="assignment-import-panel">
      <div class="assignment-import-summary">
        <div class="assignment-import-stat"><div class="assignment-import-stat-label">解析总数</div><div class="assignment-import-stat-value">${rows.length}</div></div>
        <div class="assignment-import-stat"><div class="assignment-import-stat-label">校验通过</div><div class="assignment-import-stat-value">${success}</div></div>
        <div class="assignment-import-stat"><div class="assignment-import-stat-label">校验失败</div><div class="assignment-import-stat-value">${failed}</div></div>
      </div>
      <div class="assignment-import-preview">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width:64px">行号</th>
              ${displayColumns.map(column => `<th>${column.label}</th>`).join('')}
              <th style="width:180px">校验结果</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map(row => `
              <tr>
                <td>${row.rowNo}</td>
                ${displayColumns.map(column => `<td>${escapeHtml(row.data[column.key] || '—')}</td>`).join('')}
                <td>${row.valid ? '<span class="assignment-import-pass">通过</span>' : `<div class="assignment-import-error">${row.errors.map(escapeHtml).join('<br>')}</div>`}</td>
              </tr>
            `).join('') : '<tr><td colspan="11"><div class="empty-state">暂无可预览数据</div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderLeadAssignmentImportStepComplete() {
  const result = leadAssignmentImportState.result;
  return `
    <div class="assignment-import-complete">
      <div class="assignment-import-complete-title">导入完成</div>
      <div class="assignment-import-complete-desc">成功 ${result.success} 条，失败 ${result.failed} 条；成功数据已写入当前线索分配规则列表。</div>
      <div class="assignment-import-summary">
        <div class="assignment-import-stat"><div class="assignment-import-stat-label">成功</div><div class="assignment-import-stat-value">${result.success}</div></div>
        <div class="assignment-import-stat"><div class="assignment-import-stat-label">失败</div><div class="assignment-import-stat-value">${result.failed}</div></div>
        <div class="assignment-import-stat"><div class="assignment-import-stat-label">当前维度</div><div class="assignment-import-stat-value">${escapeHtml(getImportWizardDimension().name)}</div></div>
      </div>
    </div>
  `;
}

function renderLeadAssignmentImportFooter() {
  const step = leadAssignmentImportState.step;
  const validCount = leadAssignmentImportState.validatedRows.filter(row => row.valid).length;
  if (step === 1) {
    return `
      <button class="btn-cancel" type="button" onclick="closeModal('leadAssignmentImportModal')">取消</button>
      <button class="btn-save" type="button" ${leadAssignmentImportState.validatedRows.length ? '' : 'disabled'} onclick="goLeadAssignmentImportPreview()">下一步</button>
    `;
  }
  if (step === 2) {
    return `
      <button class="btn-cancel" type="button" onclick="backLeadAssignmentImportUpload()">上一步</button>
      <button class="btn-save" type="button" ${validCount ? '' : 'disabled'} onclick="confirmLeadAssignmentImport()">确认导入</button>
    `;
  }
  return `<button class="btn-save" type="button" onclick="closeModal('leadAssignmentImportModal')">完成</button>`;
}

function downloadLeadAssignmentImportTemplate() {
  const dimension = getImportWizardDimension();
  const config = getCompactAssignmentConfig(dimension);
  const displayColumns = getLeadAssignmentImportDisplayColumns(dimension);
  const sampleValue = config.options?.[0] || dimension.name;
  const sampleSeries = hasRelatedSeriesCondition(dimension) ? 'N6' : '';
  const sampleStatus = dimension.key === 'dealer' ? '总部_高意向' : '';
  const sampleReason = dimension.key === 'lead-status' ? '明确空号' : '';
  downloadExcelWorkbookFile(
    `${getLeadAssignmentRuleLabel(dimension)}导入模板.xls`,
    [
      {
        name: `${dimension.name}线索分配规则`,
        columns: displayColumns.map(column => column.label),
        rows: [
          [`${sampleValue}导入示例`, sampleValue, sampleSeries, sampleStatus, sampleReason, '否', '', 'AI外呼', '启用']
        ]
      },
      {
        name: '填写说明',
        columns: ['字段', '是否必填', '填写说明', '示例/枚举'],
        rows: getLeadAssignmentImportTemplateGuideRows(dimension)
      }
    ],
    `${getLeadAssignmentRuleLabel(dimension)}导入模板已下载`
  );
}

function getLeadAssignmentImportTemplateGuideRows(dimension) {
  const config = getCompactAssignmentConfig(dimension);
  return [
    ['策略名称', '必填', '规则名称，用于列表展示和检索。', `${config.example || 'N6车系优先培育'}`],
    [config.valueLabel, '必填', `当前导入维度的匹配值；多个值用顿号、逗号或分号分隔。`, (config.options || []).join('、')],
    ['意向车系', hasRelatedSeriesCondition(dimension) ? '选填' : '无需填写', '可与当前维度组合判断；不填表示不限意向车系。', seriesIntentOptions.join('、')],
    ['线索状态', dimension.key === 'dealer' ? '选填' : '无需填写', '仅意向门店维度用于组合判断；不填表示不限线索状态。', assignmentLeadStatusOptions.join('、')],
    ['异常原因', dimension.key === 'lead-status' ? '条件必填' : '无需填写', '仅线索状态维度使用；当所选线索状态存在异常原因枚举时必填。', Object.values(assignmentLeadStatusReasonMap).flat().join('、')],
    ['是否按比例', '必填', '填写“是”或“否”。', '是、否'],
    ['分配比例配置', '条件必填', '是否按比例=是时必填；可填写配置名称或配置ID，且配置状态必须为启用。', leadAllocationPolicies.map(policy => `${policy.name}(${policy.id})`).join('、')],
    ['外呼类型', '条件必填', '是否按比例=否时必填，且仅支持填写一个外呼类型。', assignmentOutboundChannels.join('、')],
    ['状态', '必填', '规则启停状态。', '启用、停用']
  ];
}

function handleLeadAssignmentImportFile(file) {
  if (!file) return;
  leadAssignmentImportState.fileName = file.name;
  const fileNameNode = document.getElementById('leadAssignmentImportFileName');
  if (fileNameNode) fileNameNode.textContent = `已选择：${file.name}`;
  if (file.name.toLowerCase().endsWith('.xlsx')) {
    leadAssignmentImportState.rows = [];
    leadAssignmentImportState.validatedRows = [];
    showToast('当前原型请使用下载模板保存的 .xls 文件上传', false);
    renderLeadAssignmentImportWizard();
    return;
  }
  const reader = new FileReader();
  reader.onload = event => {
    const text = String(event.target.result || '');
    const rows = parseLeadAssignmentImportRows(text, file.name);
    leadAssignmentImportState.rows = rows;
    leadAssignmentImportState.validatedRows = validateLeadAssignmentImportRows(rows);
    if (!leadAssignmentImportState.validatedRows.length) {
      showToast('未解析到可导入的数据行，请检查模板内容', false);
    } else {
      showToast(`已解析 ${leadAssignmentImportState.validatedRows.length} 条数据`, true);
    }
    renderLeadAssignmentImportWizard();
  };
  reader.onerror = () => showToast('文件读取失败，请重新上传', false);
  reader.readAsText(file, 'utf-8');
}

function parseLeadAssignmentImportRows(text, fileName = '') {
  const lowerName = fileName.toLowerCase();
  if (lowerName.endsWith('.xls') || lowerName.endsWith('.xml') || text.includes('<Workbook')) {
    return parseExcelXmlRows(text);
  }
  return parseDelimitedImportRows(text, lowerName.endsWith('.tsv') ? '\t' : ',');
}

function parseExcelXmlRows(text) {
  const doc = new DOMParser().parseFromString(text, 'text/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError) return [];
  const rowNodes = Array.from(doc.getElementsByTagName('Row')).length
    ? Array.from(doc.getElementsByTagName('Row'))
    : Array.from(doc.getElementsByTagNameNS('urn:schemas-microsoft-com:office:spreadsheet', 'Row'));
  const matrix = rowNodes.map(row => {
    const cells = Array.from(row.getElementsByTagName('Cell')).length
      ? Array.from(row.getElementsByTagName('Cell'))
      : Array.from(row.getElementsByTagNameNS('urn:schemas-microsoft-com:office:spreadsheet', 'Cell'));
    return cells.map(cell => cell.textContent.trim());
  });
  return normalizeLeadAssignmentImportMatrix(matrix);
}

function parseDelimitedImportRows(text, delimiter = ',') {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(cell.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  if (row.some(Boolean)) rows.push(row);
  return normalizeLeadAssignmentImportMatrix(rows);
}

function normalizeLeadAssignmentImportMatrix(matrix) {
  if (!matrix.length) return [];
  const normalizedMatrix = matrix.map(row => row.map(cell => String(cell || '').replace(/^\ufeff/, '').trim()));
  const headerIndex = normalizedMatrix.findIndex(row => {
    const normalizedHeader = row.map(normalizeLeadAssignmentImportHeader);
    return leadAssignmentImportColumns.every(column => normalizedHeader.includes(column));
  });
  if (headerIndex < 0) return [];
  const header = normalizedMatrix[headerIndex].map(normalizeLeadAssignmentImportHeader);
  return normalizedMatrix.slice(headerIndex + 1)
    .filter(row => row.some(Boolean))
    .map((row, index) => {
      const data = {};
      leadAssignmentImportColumns.forEach(column => {
        data[column] = row[header.indexOf(column)] || '';
      });
      return { rowNo: headerIndex + index + 2, data };
    });
}

function normalizeLeadAssignmentImportHeader(value) {
  const text = String(value || '').replace(/^\ufeff/, '').replace(/\*/g, '').trim();
  const base = text.split(/[（(]/)[0].trim();
  const aliasMap = {
    'SmartCode': '配置内容',
    '大项目名': '配置内容',
    '渠道编码': '配置内容',
    '意向门店': '配置内容'
  };
  if (leadAssignmentImportColumns.includes(base)) return base;
  return aliasMap[base] || base;
}

function validateLeadAssignmentImportRows(rows) {
  const dimension = getImportWizardDimension();
  return rows.map(row => {
    const errors = [];
    const data = row.data;
    const config = getCompactAssignmentConfig(dimension);
    const selectedValues = splitImportedValues(data['配置内容']);
    const seriesValues = splitImportedValues(data['意向车系']);
    const leadStatusValues = splitImportedValues(data['线索状态']);
    const reasonValues = splitImportedValues(data['异常原因']);
    const callTypes = splitImportedValues(data['外呼类型']).map(normalizeAssignmentCallType);
    const useRatio = data['是否按比例'].trim();
    const status = data['状态'].trim();
    if (!data['策略名称'].trim()) errors.push('策略名称必填');
    if (!selectedValues.length) errors.push(`${config.valueLabel}必填`);
    if (!['是', '否'].includes(useRatio)) errors.push('是否按比例仅支持：是/否');
    if (!status) errors.push('状态必填');
    else if (!['启用', '停用'].includes(status)) errors.push('状态仅支持：启用/停用');
    validateImportedEnumValues(selectedValues, config.options, config.valueLabel, errors);
    if (hasRelatedSeriesCondition(dimension)) validateImportedEnumValues(seriesValues, seriesIntentOptions, '意向车系', errors);
    if (dimension.key === 'dealer') validateImportedEnumValues(leadStatusValues, assignmentLeadStatusOptions, '线索状态', errors);
    if (dimension.key === 'lead-status') {
      const availableReasons = getLeadStatusReasonOptions(selectedValues);
      if (availableReasons.length && !reasonValues.length) errors.push('当前线索状态需填写异常原因');
      validateImportedEnumValues(reasonValues, availableReasons, '异常原因', errors);
    }
    if (useRatio === '是') {
      const policyName = data['分配比例配置'].trim();
      const policy = leadAllocationPolicies.find(item => item.name === policyName || item.id === policyName);
      if (!policyName) errors.push('按比例时分配比例配置必填');
      else if (!policy) errors.push('分配比例配置不存在');
      else if (policy.status !== '启用') errors.push('分配比例配置未启用');
    } else if (useRatio === '否') {
      if (!callTypes.length) errors.push('不按比例时外呼类型必填');
      if (callTypes.length > 1) errors.push('不按比例时仅支持填写一个外呼类型');
      validateImportedEnumValues(callTypes, assignmentOutboundChannels, '外呼类型', errors);
    }
    return {
      ...row,
      valid: errors.length === 0,
      errors,
      normalized: { selectedValues, seriesValues, leadStatusValues, reasonValues, callTypes, useRatio, status }
    };
  });
}

function validateImportedEnumValues(values, options, label, errors) {
  const optionSet = new Set(options || []);
  values.forEach(value => {
    if (value && !optionSet.has(value)) errors.push(`${label}枚举值无效：${value}`);
  });
}

function splitImportedValues(value) {
  return String(value || '')
    .split(/[、,，;；\n\r\t]/)
    .map(item => item.trim())
    .filter(Boolean);
}

function goLeadAssignmentImportPreview() {
  leadAssignmentImportState.step = 2;
  renderLeadAssignmentImportWizard();
}

function backLeadAssignmentImportUpload() {
  leadAssignmentImportState.step = 1;
  renderLeadAssignmentImportWizard();
}

function confirmLeadAssignmentImport() {
  const dimension = getImportWizardDimension();
  const validRows = leadAssignmentImportState.validatedRows.filter(row => row.valid);
  const failed = leadAssignmentImportState.validatedRows.length - validRows.length;
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
  validRows.forEach((row, index) => {
    dimension.rules.push(buildImportedLeadAssignmentRule(row, dimension, index, now));
  });
  leadAssignmentImportState.result = { success: validRows.length, failed };
  leadAssignmentImportState.step = 3;
  renderLeadAssignmentConfigPage();
  renderLeadAssignmentImportWizard();
}

function buildImportedLeadAssignmentRule(row, dimension, index, updatedAt) {
  const data = row.data;
  const config = getCompactAssignmentConfig(dimension);
  const normalized = row.normalized;
  const isRatio = normalized.useRatio === '是';
  const selectedPolicy = isRatio ? leadAllocationPolicies.find(item => item.name === data['分配比例配置'].trim() || item.id === data['分配比例配置'].trim()) : null;
  const allocations = isRatio
    ? getImportedAllocationPolicyChannels(selectedPolicy)
    : normalized.callTypes.map(channel => ({ channel, percent: normalized.callTypes.length === 1 ? 100 : Math.floor(100 / normalized.callTypes.length) }));
  if (!isRatio && allocations.length > 1) {
    const used = allocations.reduce((sum, item) => sum + item.percent, 0);
    allocations[allocations.length - 1].percent += 100 - used;
  }
  const conditionParts = [`${config.conditionPrefix}=${normalized.selectedValues.join('、')}`];
  if (dimension.key === 'lead-status' && normalized.reasonValues.length) conditionParts.push(`异常原因=${normalized.reasonValues.join('、')}`);
  if (hasRelatedSeriesCondition(dimension) && normalized.seriesValues.length) conditionParts.push(`意向车系=${normalized.seriesValues.join('、')}`);
  if (dimension.key === 'dealer' && normalized.leadStatusValues.length) conditionParts.push(`线索状态=${normalized.leadStatusValues.join('、')}`);
  conditionParts.push(`是否按比例=${isRatio ? '是' : '否'}`);
  if (isRatio && selectedPolicy) conditionParts.push(`分配比例配置=${selectedPolicy.name}`);
  const base = getDefaultLeadAssignmentRule(dimension);
  return {
    ...base,
    id: getNextImportedLeadAssignmentRuleId(dimension, index),
    name: data['策略名称'].trim(),
    keyValue: normalized.selectedValues.join('、'),
    [config.valuesKey]: normalized.selectedValues,
    ...(dimension.key === 'sc' ? { scSeriesValues: normalized.seriesValues } : {}),
    ...(dimension.key === 'project' ? { projectSeriesValues: normalized.seriesValues } : {}),
    ...(dimension.key === 'channel' ? { channelSeriesValues: normalized.seriesValues } : {}),
    ...(dimension.key === 'lead-status' ? { leadStatusValues: normalized.selectedValues, leadStatusSeriesValues: normalized.seriesValues, leadStatusReasonValues: normalized.reasonValues } : {}),
    ...(dimension.key === 'dealer' ? { dealerSeriesValues: normalized.seriesValues, dealerLeadStatusValues: normalized.leadStatusValues } : {}),
    useAllocationPolicy: isRatio ? '是' : '否',
    allocationPolicyId: selectedPolicy?.id || '',
    callTypes: [...new Set(allocations.map(item => item.channel).filter(Boolean))],
    condition: conditionParts.join(' / '),
    allocationMode: isRatio ? 'policy' : 'single',
    allocations,
    action: isRatio && selectedPolicy ? `接入比例配置：${selectedPolicy.name}` : `全部分配给${normalized.callTypes.join('、')}`,
    ratio: isRatio ? '按比例：比例配置' : '不按比例',
    sort: dimension.rules.length + index + 1,
    status: normalized.status,
    updatedAt
  };
}

function getImportedAllocationPolicyChannels(policy) {
  if (!policy) return [];
  if (getAllocationPolicyScope(policy) !== 'none') {
    return [
      ...(policy.cityAllocations || []).flatMap(item => item.allocations || []),
      ...((policy.fallbackCityAllocation || {}).allocations || [])
    ];
  }
  return policy.allocations || [];
}

function getNextImportedLeadAssignmentRuleId(dimension, offset = 0) {
  const prefixMap = { series: 'CAR', sc: 'SC', project: 'PROJ', channel: 'CH', 'lead-status': 'LS', dealer: 'DLR' };
  const prefix = prefixMap[dimension.key] || 'RULE';
  const maxNo = dimension.rules.reduce((max, rule) => {
    const match = String(rule.id || '').match(new RegExp(`^${prefix}-(\\d+)$`));
    return match ? Math.max(max, Number(match[1])) : max;
  }, 0);
  return `${prefix}-${String(maxNo + offset + 1).padStart(3, '0')}`;
}
