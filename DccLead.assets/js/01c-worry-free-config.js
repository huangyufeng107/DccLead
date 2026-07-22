function toggleWorryFreeConfig() {
  const body = document.getElementById('worryFreeConfigBody');
  const button = document.getElementById('worryFreeConfigToggleBtn');
  if (!body || !button) return;
  const nextVisible = !body.classList.contains('show');
  body.classList.toggle('show', nextVisible);
  button.textContent = nextVisible ? '收起配置' : '展开配置';
}

function getSelectedWorryFreeSeries() {
  return [...document.querySelectorAll('input[name="worryFreeSeries"]:checked')].map(input => input.value);
}

function updateWorryFreeSeriesTrigger() {
  const selected = getSelectedWorryFreeSeries();
  const trigger = document.getElementById('worryFreeSeriesTrigger');
  if (!trigger) return;
  trigger.textContent = selected.length ? selected.join(' / ') : '请选择准入意向车系';
  trigger.classList.toggle('placeholder', selected.length === 0);
  document.querySelectorAll('input[name="worryFreeSeries"]').forEach(input => {
    input.closest('.tag-option')?.classList.toggle('selected', input.checked);
  });
  syncWorryFreeScriptRules(selected);
}

const worryFreeOutboundTypes = [
  '一知-冷线索',
  '一知-冷线索（大模型）',
  '一知-大模型NEV新线索',
  '科大讯飞-冷线索',
  '科大讯飞-留资未满',
  '冰兰-新线索',
  '冰兰-保客',
  '一知-保客'
];

function syncWorryFreeScriptRules(selectedSeries) {
  const tbody = document.getElementById('worryFreeScriptRuleBody');
  if (!tbody) return;
  
  // 1. Save current selected values for each series
  const currentSelections = {};
  const rows = tbody.querySelectorAll('tr');
  rows.forEach(row => {
    const td1 = row.querySelector('td:first-child');
    const select = row.querySelector('td:nth-child(2) select');
    if (td1 && select) {
      const series = td1.textContent.trim();
      currentSelections[series] = select.value;
    }
  });
  
  // 2. Re-render the body based on selectedSeries
  tbody.innerHTML = '';
  
  if (selectedSeries.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="2" style="text-align: center; color: #64748b; padding: 16px;">
          暂无数据，请先在上方勾选准入意向车系
        </td>
      </tr>
    `;
    return;
  }
  
  selectedSeries.forEach(series => {
    const prevVal = currentSelections[series] || '一知-冷线索';
    const optionsHtml = worryFreeOutboundTypes.map(type => 
      `<option value="${type}" ${type === prevVal ? 'selected' : ''}>${type}</option>`
    ).join('');
    
    tbody.insertAdjacentHTML('beforeend', `
      <tr data-series="${series}">
        <td style="font-weight: 700; color: #1e293b;">${series}</td>
        <td>
          <select class="worry-free-table-select">
            ${optionsHtml}
          </select>
        </td>
      </tr>
    `);
  });
}

function toggleWorryFreeSeriesPicker() {
  document.querySelectorAll('.tag-picker-panel').forEach(panel => {
    if (panel.id !== 'worryFreeSeriesPanel') panel.classList.remove('show');
  });
  document.getElementById('worryFreeSeriesPanel')?.classList.toggle('show');
}

function toggleWorryFreeSeriesOption() {
  updateWorryFreeSeriesTrigger();
}

function selectAllWorryFreeSeries() {
  document.querySelectorAll('input[name="worryFreeSeries"]').forEach(input => {
    input.checked = true;
  });
  updateWorryFreeSeriesTrigger();
}

function clearWorryFreeSeries() {
  document.querySelectorAll('input[name="worryFreeSeries"]').forEach(input => {
    input.checked = false;
  });
  updateWorryFreeSeriesTrigger();
}

function getWorryFreeSmsTemplateOptions(selectedTemplate = '') {
  const templates = typeof smsDispatchRules !== 'undefined'
    ? [...new Set(smsDispatchRules.map(rule => rule.template).filter(Boolean))]
    : [];
  return selectedTemplate && !templates.includes(selectedTemplate) ? [...templates, selectedTemplate] : templates;
}

function initWorryFreeSmsTemplatePicker() {
  const input = document.getElementById('worryFreeSmsTemplate');
  const selectedTemplate = input ? input.value : '冷线索-三无忧';
  const options = getWorryFreeSmsTemplateOptions(selectedTemplate);
  
  const listContainer = document.getElementById('worryFreeSmsTemplateList');
  const countSpan = document.getElementById('worryFreeSmsTemplateCount');
  if (!listContainer) return;

  listContainer.innerHTML = options.map(template => `
    <button class="tag-option ${template === selectedTemplate ? 'selected' : ''}" type="button" data-template="${template}" onclick="selectWorryFreeSmsTemplate(this.dataset.template)">
      ${template}
    </button>
  `).join('');

  if (countSpan) {
    countSpan.textContent = `共 ${options.length} 个模板`;
  }
  
  const trigger = document.getElementById('worryFreeSmsTemplateTrigger');
  if (trigger) {
    trigger.textContent = selectedTemplate || '请选择短信模板';
    trigger.classList.toggle('placeholder', !selectedTemplate);
  }
}

function toggleWorryFreeSmsTemplatePicker() {
  initWorryFreeSmsTemplatePicker();
  document.querySelectorAll('.tag-picker-panel').forEach(panel => {
    if (panel.id !== 'worryFreeSmsTemplatePanel') panel.classList.remove('show');
  });
  document.getElementById('worryFreeSmsTemplatePanel')?.classList.toggle('show');
}

function selectWorryFreeSmsTemplate(template) {
  const input = document.getElementById('worryFreeSmsTemplate');
  const trigger = document.getElementById('worryFreeSmsTemplateTrigger');
  if (input) {
    input.value = template;
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  if (trigger) {
    trigger.textContent = template || '请选择短信模板';
    trigger.classList.toggle('placeholder', !template);
  }
  document.querySelectorAll('#worryFreeSmsTemplatePanel .tag-option').forEach(option => {
    option.classList.toggle('selected', option.dataset.template === template);
  });
  document.getElementById('worryFreeSmsTemplatePanel')?.classList.remove('show');
}

function clearWorryFreeSmsTemplate() {
  selectWorryFreeSmsTemplate('');
}

function filterWorryFreeSmsTemplateOptions(keyword) {
  const panel = document.getElementById('worryFreeSmsTemplatePanel');
  if (!panel) return;
  const normalized = String(keyword || '').trim().toLowerCase();
  const options = [...panel.querySelectorAll('.tag-option')];
  let visibleCount = 0;
  options.forEach(option => {
    const visible = !normalized || option.textContent.trim().toLowerCase().includes(normalized);
    option.style.display = visible ? '' : 'none';
    if (visible) visibleCount += 1;
  });
  const empty = document.getElementById('worryFreeSmsTemplateEmpty');
  if (empty) empty.style.display = visibleCount ? 'none' : 'block';
  const count = document.getElementById('worryFreeSmsTemplateCount');
  if (count) count.textContent = normalized ? `匹配 ${visibleCount} 个模板` : `共 ${options.length} 个模板`;
}

const worryFreeLayerMapping = {
  P1: '历史试驾过 / 历史到店过',
  P2: '门店跟进次数 ≥ 3 次',
  P3: '休眠未购',
  P4: '休眠失联',
  P100: '历史剩余数据'
};

function syncWorryFreeLayerMapping(select) {
  const row = select.closest('tr');
  const mappingInput = row?.querySelector('td:nth-child(2) select');
  if (mappingInput) mappingInput.value = worryFreeLayerMapping[select.value] || '';
}

function clearWorryFreeValidationErrors() {
  document.querySelectorAll('.worry-free-field-error').forEach(el => el.classList.remove('worry-free-field-error'));
}

document.addEventListener('input', (event) => {
  if (event.target.classList?.contains('worry-free-field-error')) {
    event.target.classList.remove('worry-free-field-error');
  }
});

document.addEventListener('change', (event) => {
  if (event.target.classList?.contains('worry-free-field-error')) {
    event.target.classList.remove('worry-free-field-error');
  }
});

function markWorryFreeInvalid(el, message) {
  if (el) {
    el.classList.add('worry-free-field-error');
    if (typeof el.focus === 'function') el.focus();
    el.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
  showToast(message, false);
}

function validateWorryFreeTableRows(tbodyId, labels) {
  const tbody = document.getElementById(tbodyId);
  const rows = tbody ? [...tbody.querySelectorAll('tr')] : [];
  if (!rows.length) {
    return { valid: false, message: `${labels.title}至少需要配置一条`, el: tbody };
  }
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex += 1) {
    const controls = [...rows[rowIndex].querySelectorAll('select, input')];
    for (let index = 0; index < labels.fields.length; index += 1) {
      const control = controls[index];
      if (!control || !String(control.value || '').trim()) {
        return { valid: false, message: `${labels.title}第${rowIndex + 1}行：请填写${labels.fields[index]}`, el: control || rows[rowIndex] };
      }
    }
  }
  return { valid: true };
}

function saveWorryFreeConfig() {
  clearWorryFreeValidationErrors();
  const requiredFields = [
    ['worryFreeDailyLimit', '每日推送上限'],
    ['worryFreeAiDedupeWindow', 'AI外呼建联去重窗口 T-N'],
    ['worryFreeManualDedupeWindow', '人工外呼建联去重窗口 T-N'],
    ['worryFreeSmsTemplate', '短信模板'],
    ['worryFreeCallTime', '推送数据时间'],
    ['worryFreeQuietTime', '禁止推送数据时间'],
    ['worryFreeSinglePhonePushWindow', '同一手机号仅推送一次 T-N']
  ];
  for (const [id, label] of requiredFields) {
    const el = document.getElementById(id);
    if (!el || !String(el.value || '').trim()) {
      markWorryFreeInvalid(el, `请填写${label}`);
      return;
    }
  }
  if (!getSelectedWorryFreeSeries().length) {
    markWorryFreeInvalid(document.getElementById('worryFreeSeriesTrigger'), '请选择准入意向车系');
    return;
  }
  const layerResult = validateWorryFreeTableRows('worryFreeLayerRuleBody', {
    title: '分层标签映射权重',
    fields: ['权重', '标签映射']
  });
  if (!layerResult.valid) {
    markWorryFreeInvalid(layerResult.el, layerResult.message);
    return;
  }
  const scriptResult = validateWorryFreeTableRows('worryFreeScriptRuleBody', {
    title: '意向车系映射话术任务',
    fields: ['外呼类型']
  });
  if (!scriptResult.valid) {
    markWorryFreeInvalid(scriptResult.el, scriptResult.message);
    return;
  }
  showToast('已保存三无忧规则配置', true);
}

const worryFreeBatchDetails = {
  '2026-06-16': {
    date: '2026-06-16', status: '执行中', candidate: '18,642', dedupe: '7,218', smsSuccess: '9,862', pushed: '10,000', recycled: '8,934', connectedRate: '31.8%', tasks: '8,934', syncFailed: '76', systemExceptionCount: '76', remaining: '9,708',
    layers: [
      ['P1', '历史试驾 / 到店', '3,000', '420', '2,920', '2,742', '18', '0'],
      ['P2', '跟进次数大于等于3次', '5,000', '1,120', '4,862', '4,392', '32', '0'],
      ['P3', '休眠未购', '4,000', '1,540', '2,080', '1,800', '26', '2,000'],
      ['P4', '休眠失联', '8,000', '2,960', '0', '0', '0', '8,000'],
      ['P100', '历史剩余数据', '6,642', '1,178', '0', '0', '0', '6,642']
    ],
    series: [
      ['NX8', '1704345165750', '5,200', '1,780', '3,420', '3,057', '21', '1,780'],
      ['N6', '1704345165747', '6,100', '2,420', '3,680', '3,294', '34', '2,420'],
      ['N7', '1704345161532', '7,342', '3,018', '2,762', '2,583', '21', '4,580']
    ],
    logs: [
      ['2026-06-16 08:30', '2026-06-16 08:32', '候选池生成', '完成准入、分层、去重过滤，候选 18,642 条。', '成功'],
      ['2026-06-16 09:00', '2026-06-16 09:05', '推送外呼类型：一知-三无忧', '按车系映射任务推送 10,000 条。', '成功'],
      ['2026-06-16 09:30', '2026-06-16 09:35', '短信预触达', '调用短信模板“冷线索-三无忧”，成功 9,862 条。', '成功'],
      ['2026-06-16 18:00', '2026-06-16 18:15', '结果回收', '已回收 8,934 条，并转化生成 DCC 培育任务。', '执行中']
    ]
  },
  '2026-06-15': {
    date: '2026-06-15', status: '已完成', candidate: '16,305', dedupe: '6,305', smsSuccess: '9,911', pushed: '10,000', recycled: '10,000', connectedRate: '33.2%', tasks: '10,000', syncFailed: '47', systemExceptionCount: '47', remaining: '6,305',
    layers: [
      ['P1', '历史试驾 / 到店', '2,700', '350', '2,680', '2,680', '8', '0'],
      ['P2', '跟进次数大于等于3次', '4,600', '1,020', '4,560', '4,560', '12', '0'],
      ['P3', '休眠未购', '4,180', '1,780', '2,671', '2,671', '15', '1,480'],
      ['P4', '休眠失联', '4,825', '2,080', '0', '0', '0', '4,825'],
      ['P100', '历史剩余数据', '3,347', '1,075', '0', '0', '0', '3,347']
    ],
    series: [
      ['NX8', '1704345165750', '5,000', '1,790', '3,210', '3,210', '8', '1,790'],
      ['N6', '1704345165747', '5,600', '2,100', '3,500', '3,500', '15', '2,100'],
      ['N7', '1704345161532', '5,705', '2,415', '3,201', '3,290', '12', '2,415']
    ],
    logs: [
      ['2026-06-15 08:30', '2026-06-15 08:31', '候选池生成', '候选 16,305 条，命中规则后推送 10,000 条。', '成功'],
      ['2026-06-15 09:00', '2026-06-15 09:06', '推送外呼类型：一知-三无忧', '推送一知平台 10,000 条。', '成功'],
      ['2026-06-15 09:30', '2026-06-15 09:34', '短信预触达', '短信成功 9,911 条，失败按规则重试。', '成功'],
      ['2026-06-15 18:00', '2026-06-15 18:12', '结果回收', '已全量回收并生成 DCC 培育任务。', '成功']
    ]
  },
  '2026-06-14': {
    date: '2026-06-14', status: '已完成', candidate: '12,908', dedupe: '2,908', smsSuccess: '9,774', pushed: '10,000', recycled: '10,000', connectedRate: '29.6%', tasks: '10,000', syncFailed: '30', systemExceptionCount: '30', remaining: '2,908',
    layers: [
      ['P1', '历史试驾 / 到店', '2,120', '210', '2,102', '2,102', '5', '0'],
      ['P2', '跟进次数大于等于3次', '4,240', '880', '4,212', '4,212', '11', '0'],
      ['P3', '休眠未购', '3,940', '1,120', '3,460', '3,460', '14', '300'],
      ['P4', '休眠失联', '2,608', '698', '0', '0', '0', '2,608'],
      ['P100', '历史剩余数据', '1,430', '0', '0', '0', '0', '1,430']
    ],
    series: [
      ['NX8', '1704345165750', '4,200', '1,080', '3,120', '3,120', '8', '1,080'],
      ['N6', '1704345165747', '4,400', '940', '3,460', '3,460', '12', '940'],
      ['N7', '1704345161532', '4,308', '888', '3,194', '3,420', '10', '888']
    ],
    logs: [
      ['2026-06-14 08:30', '2026-06-14 08:31', '候选池生成', '候选 12,908 条，按优先级取前 10,000 条。', '成功'],
      ['2026-06-14 09:00', '2026-06-14 09:04', '推送外呼类型：一知-三无忧', '车系任务映射正常，推送 10,000 条。', '成功'],
      ['2026-06-14 09:30', '2026-06-14 09:33', '短信预触达', '短信成功 9,774 条。', '成功'],
      ['2026-06-14 18:00', '2026-06-14 18:10', '结果回收', '外呼结果已完成回收。', '成功']
    ]
  }
};

function renderWorryFreeRows(rows) {
  return rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`).join('');
}

function parseWorryFreeNumber(value) {
  return Number(String(value || '0').replace(/,/g, '')) || 0;
}

function formatWorryFreeNumber(value) {
  return parseWorryFreeNumber(value).toLocaleString('en-US');
}

function getWorryFreeSystemExceptionCount(detail) {
  if (detail.systemExceptionCount) return detail.systemExceptionCount;
  const total = (detail.layers || []).reduce((sum, row) => sum + parseWorryFreeNumber(row[6]), 0);
  return formatWorryFreeNumber(total);
}

function getWorryFreeBatchLeadRows(detail) {
  const dateKey = String(detail.date || '2026-06-16').replace(/-/g, '');
  const prefix = dateKey.slice(4);
  return [
    [`HQ${dateKey}00188`, `PYXS${dateKey}0001`, `PYRW${dateKey}0128`, '培育中', '—', 'A', '陆先生', '138****6721', 'N6', '广州东风日产天河店', 'N6', 'SC-N6-0891', `${detail.date} 17:10:00`, '4', '历史试驾过 / 历史到店过', 'P1', '成功', detail.status === '执行中' ? '同步中' : '已同步', `${detail.date} 17:10:00`, '—'],
    [`HQ${dateKey}00231`, `PYXS${dateKey}0002`, `PYRW${dateKey}0136`, '休眠未购', '资金不足', 'B', '陈女士', '186****4309', 'NX8', '深圳东风日产南山店', 'NX8', 'SC-NX8-2048', `${detail.date} 16:42:00`, '3', '门店跟进次数 ≥ 3次', 'P2', '成功', '已同步', `${detail.date} 16:42:00`, '—'],
    [`HQ${dateKey}00309`, `PYXS${dateKey}0003`, `PYRW${dateKey}0142`, '无效', '明确空号', 'H', '王先生', '159****2840', 'N7', '杭州东风日产滨江店', 'N7', 'SC-N7-7712', `${detail.date} 15:28:00`, '1', '休眠未购', 'P3', '失败', '同步失败', `${detail.date} 15:28:00`, '短信发送失败'],
    [`HQ${dateKey}00476`, `PYXS${dateKey}0004`, `PYRW${dateKey}0155`, '休眠失联', '三天四次无法接通', 'C', '李女士', '137****9088', 'N6', '上海东风日产浦东店', 'N6', 'SC-N6-5520', `${detail.date} 14:55:00`, '5', '休眠失联', 'P4', '成功', '已同步', `${detail.date} 14:55:00`, '—'],
    [`HQ${dateKey}00518`, `PYXS${dateKey}0005`, `PYRW${dateKey}0162`, '待培育', '—', 'A', '赵先生', '135****2190', 'NX8', '成都东风日产高新店', 'NX8', `SC-${prefix}-4219`, `${detail.date} 13:36:00`, '0', '—', 'P100', '成功', '待同步', `${detail.date} 13:36:00`, '等待DCC任务生成']
  ];
}

function getWorryFreeDccExportFields() {
  return {
    dailyLimit: getWorryFreeInputValue('worryFreeDailyLimit'),
    allowedSeries: getSelectedWorryFreeSeries().join(' / '),
    aiDedupeWindow: formatWorryFreeDedupeWindow(getWorryFreeInputValue('worryFreeAiDedupeWindow')),
    manualDedupeWindow: formatWorryFreeDedupeWindow(getWorryFreeInputValue('worryFreeManualDedupeWindow')),
    smsTemplate: getWorryFreeInputValue('worryFreeSmsTemplate'),
    callTime: getWorryFreeInputValue('worryFreeCallTime'),
    quietTime: getWorryFreeInputValue('worryFreeQuietTime'),
    singlePhonePushWindow: formatWorryFreeDedupeWindow(getWorryFreeInputValue('worryFreeSinglePhonePushWindow')),
    layerRule: getWorryFreeLayerRuleText(),
    scriptRule: getWorryFreeScriptRuleText()
  };
}

function getWorryFreeBatchLeadDetailRows(detail) {
  const rows = detail.details || getWorryFreeBatchLeadRows(detail);
  if (rows[0]?.length === worryFreeExportColumns.length) {
    return rows.map(row => {
      const normalized = [...row];
      if (normalized[18] !== '已同步') normalized[19] = '—';
      return normalized;
    });
  }
  const dccFields = getWorryFreeDccExportFields();
  return rows.map(row => {
    const normalized = [...row];
    if (normalized[17] !== '已同步') normalized[18] = '—';
    return [
      getWorryFreeBatchNo(detail.date),
      ...normalized,
      dccFields.dailyLimit,
      dccFields.allowedSeries,
      dccFields.aiDedupeWindow,
      dccFields.manualDedupeWindow,
      dccFields.smsTemplate,
      dccFields.callTime,
      dccFields.quietTime,
      dccFields.singlePhonePushWindow,
      dccFields.layerRule,
      dccFields.scriptRule
    ];
  });
}

let worryFreeBatchDetailFilters = { headquarterLeadId: '', systemStatus: '', customerName: '', phone: '', intentSeries: '', dealer: '', layer: '', smartCode: '', nurtureLeadCode: '', startDate: '', endDate: '' };
let worryFreeBatchDetailMoreFiltersExpanded = false;

function getFilteredWorryFreeBatchLeadDetailRows(detail) {
  const filter = worryFreeBatchDetailFilters;
  const includes = (value, keyword) => !keyword || String(value || '').toLowerCase().includes(keyword.toLowerCase());
  return getWorryFreeBatchLeadDetailRows(detail).filter(row =>
    includes(row[1], filter.headquarterLeadId) &&
    (!filter.systemStatus || row[18] === filter.systemStatus) &&
    includes(row[7], filter.customerName) &&
    includes(row[8], filter.phone) &&
    (!filter.intentSeries || row[9] === filter.intentSeries) &&
    includes(row[10], filter.dealer) &&
    (!filter.layer || row[16] === filter.layer) &&
    includes(row[12], filter.smartCode) &&
    includes(row[2], filter.nurtureLeadCode) &&
    (!filter.startDate || String(row[13] || '').slice(0, 10) >= filter.startDate) &&
    (!filter.endDate || String(row[13] || '').slice(0, 10) <= filter.endDate)
  );
}

function renderWorryFreeBatchLeadDetailTable(detail) {
  const columns = worryFreeExportColumns;
  const rows = getFilteredWorryFreeBatchLeadDetailRows(detail);
  const totalPages = Math.max(1, Math.ceil(rows.length / worryFreeBatchDetailPageSize));
  worryFreeBatchDetailCurrentPage = Math.max(1, Math.min(totalPages, worryFreeBatchDetailCurrentPage));
  const start = (worryFreeBatchDetailCurrentPage - 1) * worryFreeBatchDetailPageSize;
  const pageRows = rows.slice(start, start + worryFreeBatchDetailPageSize);
  const pageOptions = Array.from({ length: totalPages }, (_, idx) => `<option value="${idx + 1}"${worryFreeBatchDetailCurrentPage === idx + 1 ? ' selected' : ''}>第 ${idx + 1} 页</option>`).join('');
  return `
    <div id="worryFreeBatchLeadDetailTableArea">
      <div class="lead-table-wrap">
        <table class="lead-table" style="min-width: 2200px;">
          <thead>
            <tr>${columns.map(column => `<th>${column}</th>`).join('')}</tr>
          </thead>
          <tbody>${pageRows.length ? renderWorryFreeRows(pageRows) : `<tr><td colspan="${columns.length}"><div class="empty-state">暂无明细数据</div></td></tr>`}</tbody>
        </table>
      </div>
      <div class="pagination">
        <span>共 ${rows.length} 条记录，当前第 ${worryFreeBatchDetailCurrentPage} / ${totalPages} 页</span>
        <div class="pagination-btns">
          <select class="hit-page-size" id="worryFreeBatchDetailPageSize" onchange="changeWorryFreeBatchDetailPageSize(this.value)">
            <option value="5"${worryFreeBatchDetailPageSize === 5 ? ' selected' : ''}>每页 5 条</option>
            <option value="10"${worryFreeBatchDetailPageSize === 10 ? ' selected' : ''}>每页 10 条</option>
            <option value="20"${worryFreeBatchDetailPageSize === 20 ? ' selected' : ''}>每页 20 条</option>
            <option value="50"${worryFreeBatchDetailPageSize === 50 ? ' selected' : ''}>每页 50 条</option>
          </select>
          <button class="page-btn${worryFreeBatchDetailCurrentPage <= 1 ? ' disabled' : ''}" type="button"${worryFreeBatchDetailCurrentPage <= 1 ? ' disabled' : ''} onclick="changeWorryFreeBatchDetailPage(-1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <select class="hit-page-size" id="worryFreeBatchDetailPageSelect" onchange="selectWorryFreeBatchDetailPage(this.value)">${pageOptions}</select>
          <button class="page-btn${worryFreeBatchDetailCurrentPage >= totalPages ? ' disabled' : ''}" type="button"${worryFreeBatchDetailCurrentPage >= totalPages ? ' disabled' : ''} onclick="changeWorryFreeBatchDetailPage(1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
    </div>
  `;
}

function refreshWorryFreeBatchLeadDetailTable() {
  const detail = worryFreeBatchDetails[activeWorryFreeBatchDetailDate];
  const tableArea = document.getElementById('worryFreeBatchLeadDetailTableArea');
  if (!detail || !tableArea) return;
  const wrapper = document.createElement('div');
  wrapper.innerHTML = renderWorryFreeBatchLeadDetailTable(detail).trim();
  if (wrapper.firstElementChild) tableArea.replaceWith(wrapper.firstElementChild);
}

function changeWorryFreeBatchDetailPageSize(value) {
  worryFreeBatchDetailPageSize = Number(value) || 10;
  worryFreeBatchDetailCurrentPage = 1;
  refreshWorryFreeBatchLeadDetailTable();
}

function selectWorryFreeBatchDetailPage(value) {
  worryFreeBatchDetailCurrentPage = Number(value) || 1;
  refreshWorryFreeBatchLeadDetailTable();
}

function changeWorryFreeBatchDetailPage(dir) {
  const detail = worryFreeBatchDetails[activeWorryFreeBatchDetailDate];
  const rows = detail ? getFilteredWorryFreeBatchLeadDetailRows(detail) : [];
  const totalPages = Math.max(1, Math.ceil(rows.length / worryFreeBatchDetailPageSize));
  worryFreeBatchDetailCurrentPage = Math.max(1, Math.min(totalPages, worryFreeBatchDetailCurrentPage + dir));
  refreshWorryFreeBatchLeadDetailTable();
}

function openWorryFreeBatchDetail(date) {
  const detail = worryFreeBatchDetails[date];
  if (!detail) {
    showToast('未找到该批次详情', false);
    return;
  }
  activeWorryFreeBatchDetailDate = date;
  worryFreeBatchDetailCurrentPage = 1;
  worryFreeBatchDetailFilters = { headquarterLeadId: '', systemStatus: '', customerName: '', phone: '', intentSeries: '', dealer: '', layer: '', smartCode: '', nurtureLeadCode: '', startDate: '', endDate: '' };
  worryFreeBatchDetailMoreFiltersExpanded = false;
  document.querySelector('nav[aria-label="培育策略三级菜单"]').classList.add('hidden');
  document.querySelector('.leads-nav').classList.add('show');
  setLeadNavActive('三无忧');
  setSidebarActiveByName('线索管理');
  setPageName(`线索管理 / 三无忧 / 批次详情 / ${detail.date}`);
  setPolicyContentVisible(false);
  hideLeadPages();
  document.getElementById('designStage').classList.remove('show');
  document.getElementById('worryFreeBatchDetailPage').classList.add('show');
  document.getElementById('worryFreeBatchDetailTitle').textContent = '三无忧批次详情';
  document.getElementById('worryFreeBatchDetailSubtitle').textContent = `线索管理 / 三无忧 / ${detail.date}`;
  document.getElementById('worryFreeBatchDetailBody').innerHTML = renderWorryFreeBatchDetailPageContent(detail);
  mountWorryFreeBatchDetailFilters();
}

function renderWorryFreeBatchTabSummary(detail) {
  const summaryItems = [
    ['批次日期', detail.date],
    ['累计总量', detail.candidate],
    ['去重过滤', detail.dedupe],
    ['短信成功', detail.smsSuccess],
    ['DCC培育任务', detail.tasks],
    ['同步失败量', detail.syncFailed || getWorryFreeSystemExceptionCount(detail)],
    ['滚存待推送', detail.remaining],
    ['批次状态', detail.status]
  ];
  return `
    <div class="worry-free-batch-summary-cards">
      ${summaryItems.map(([label, value]) => `
      <div class="worry-free-batch-summary-card">
        <div class="worry-free-batch-summary-label">${label}</div>
        <div class="worry-free-batch-summary-value${label === '批次状态' ? ' status' : ''}">${value}</div>
      </div>
      `).join('')}
    </div>
  `;
}

function renderWorryFreeBatchDetailPageContent(detail) {
  return `
    <div class="detail-tabs">
      <button class="detail-tab active" type="button" onclick="switchLeadDetailTab(this, 'worryFreeBatchOverviewPanel')">执行概览</button>
      <button class="detail-tab" type="button" onclick="switchLeadDetailTab(this, 'worryFreeBatchDetailRowsPanel')">批量明细</button>
      <button class="detail-tab" type="button" onclick="switchLeadDetailTab(this, 'worryFreeBatchLogPanel')">执行日志</button>
    </div>
    <div class="detail-tab-panel active" id="worryFreeBatchOverviewPanel">
      <div class="worry-free-batch-layout">
        ${renderWorryFreeBatchTabSummary(detail)}
        <div class="worry-free-batch-stack">
          <div class="worry-free-batch-section">
            <div class="worry-free-batch-section-head">
              <div class="worry-free-batch-section-title">分层推送明细</div>
              <div class="worry-free-batch-section-meta">P1-P100</div>
            </div>
            <div class="lead-table-wrap">
              <table class="lead-table worry-free-overview-detail-table">
                <thead><tr><th>优先级</th><th>分层标签</th><th>累计总量</th><th>去重过滤</th><th>短信成功</th><th>DCC培育任务</th><th>异常原因</th><th>滚存待推送</th></tr></thead>
                <tbody>${renderWorryFreeRows(detail.layers)}</tbody>
              </table>
            </div>
          </div>
          <div class="worry-free-batch-section">
            <div class="worry-free-batch-section-head">
              <div class="worry-free-batch-section-title">车系话术明细</div>
              <div class="worry-free-batch-section-meta">车系额度</div>
            </div>
            <div class="lead-table-wrap">
              <table class="lead-table worry-free-overview-detail-table">
                <thead><tr><th>意向车系</th><th>一知任务ID</th><th>累计总量</th><th>去重过滤</th><th>短信成功</th><th>DCC培育任务</th><th>异常原因</th><th>滚存待推送</th></tr></thead>
                <tbody>${renderWorryFreeRows(detail.series)}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="detail-tab-panel worry-free-batch-detail-panel" id="worryFreeBatchDetailRowsPanel">
      <div class="worry-free-batch-layout">
        ${renderWorryFreeBatchTabSummary(detail)}
        <div class="worry-free-batch-section">
          <div class="worry-free-batch-section-head">
            <div class="worry-free-batch-section-title">批量明细</div>
          </div>
          ${renderWorryFreeBatchLeadDetailTable(detail)}
        </div>
      </div>
    </div>
    <div class="detail-tab-panel" id="worryFreeBatchLogPanel">
      <div class="worry-free-batch-layout">
        ${renderWorryFreeBatchTabSummary(detail)}
        <div class="worry-free-batch-section">
          <div class="worry-free-batch-section-head">
            <div class="worry-free-batch-section-title">执行日志</div>
            <div class="worry-free-batch-section-meta">${detail.logs.length} 条</div>
          </div>
          <div class="lead-table-wrap">
            <table class="lead-table">
              <thead><tr><th>开始时间</th><th>结束时间</th><th>节点</th><th>说明</th><th>结果</th></tr></thead>
              <tbody>${renderWorryFreeRows(detail.logs)}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderWorryFreeBatchDetailFilters() {
  const filter = worryFreeBatchDetailFilters;
  const selected = (value, expected) => value === expected ? ' selected' : '';
  const value = field => escapeHtml(filter[field] || '');
  return `<div class="resource-unfilled-batch-query worry-free-batch-query"><div class="resource-unfilled-batch-query-title">筛选查询</div><div class="resource-unfilled-batch-query-grid"><label>总部线索ID<input class="form-input" id="worryFreeDetailHeadquarterLeadId" value="${value('headquarterLeadId')}" placeholder="请输入总部线索ID" /></label><label>系统状态<select class="filter-select" id="worryFreeDetailSystemStatus"><option value="">全部</option>${['同步中', '已同步', '同步失败', '待同步'].map(item => `<option value="${item}"${selected(filter.systemStatus, item)}>${item}</option>`).join('')}</select></label><label>客户姓名<input class="form-input" id="worryFreeDetailCustomerName" value="${value('customerName')}" placeholder="请输入客户姓名" /></label><label>手机号码<input class="form-input" id="worryFreeDetailPhone" value="${value('phone')}" placeholder="请输入手机号码" /></label><label>意向车系<select class="filter-select" id="worryFreeDetailIntentSeries"><option value="">全部车系</option>${['N6', 'N7', 'NX8'].map(item => `<option value="${item}"${selected(filter.intentSeries, item)}>${item}</option>`).join('')}</select></label><div class="resource-unfilled-batch-query-actions"><button class="btn-add" type="button" onclick="queryWorryFreeBatchDetail()">查询</button><button class="btn-secondary" type="button" onclick="resetWorryFreeBatchDetailQuery()">重置</button></div></div><button class="resource-unfilled-batch-more-trigger" type="button" onclick="toggleWorryFreeBatchDetailMoreFilters()">更多筛选 <span>${worryFreeBatchDetailMoreFiltersExpanded ? '收起' : '展开'}</span></button><div class="resource-unfilled-batch-query-more" style="display:${worryFreeBatchDetailMoreFiltersExpanded ? 'grid' : 'none'}"><label>意向专营店<input class="form-input" id="worryFreeDetailDealer" value="${value('dealer')}" placeholder="请输入专营店名称" /></label><label>分层标签<select class="filter-select" id="worryFreeDetailLayer"><option value="">全部</option>${['P1', 'P2', 'P3', 'P4', 'P100'].map(item => `<option value="${item}"${selected(filter.layer, item)}>${item}</option>`).join('')}</select></label><label>SmartCode<input class="form-input" id="worryFreeDetailSmartCode" value="${value('smartCode')}" placeholder="请输入SmartCode" /></label><label>培育线索编码<input class="form-input" id="worryFreeDetailNurtureLeadCode" value="${value('nurtureLeadCode')}" placeholder="请输入培育线索编码" /></label><label>最近跟进时间<div class="resource-unfilled-batch-date-range"><input class="form-input" id="worryFreeDetailStartDate" type="date" value="${value('startDate')}" /><span>至</span><input class="form-input" id="worryFreeDetailEndDate" type="date" value="${value('endDate')}" /></div></label></div></div>`;
}

function mountWorryFreeBatchDetailFilters() {
  const panel = document.getElementById('worryFreeBatchDetailRowsPanel');
  const layout = panel?.querySelector('.worry-free-batch-layout');
  const section = panel?.querySelector('.worry-free-batch-section');
  if (!layout || !section || layout.querySelector('.worry-free-batch-query')) return;
  section.insertAdjacentHTML('beforebegin', renderWorryFreeBatchDetailFilters());
}

function queryWorryFreeBatchDetail() {
  const value = id => document.getElementById(id)?.value.trim() || '';
  worryFreeBatchDetailFilters = { headquarterLeadId: value('worryFreeDetailHeadquarterLeadId'), systemStatus: value('worryFreeDetailSystemStatus'), customerName: value('worryFreeDetailCustomerName'), phone: value('worryFreeDetailPhone'), intentSeries: value('worryFreeDetailIntentSeries'), dealer: value('worryFreeDetailDealer'), layer: value('worryFreeDetailLayer'), smartCode: value('worryFreeDetailSmartCode'), nurtureLeadCode: value('worryFreeDetailNurtureLeadCode'), startDate: value('worryFreeDetailStartDate'), endDate: value('worryFreeDetailEndDate') };
  worryFreeBatchDetailCurrentPage = 1;
  refreshWorryFreeBatchLeadDetailTable();
}

function resetWorryFreeBatchDetailQuery() {
  worryFreeBatchDetailFilters = { headquarterLeadId: '', systemStatus: '', customerName: '', phone: '', intentSeries: '', dealer: '', layer: '', smartCode: '', nurtureLeadCode: '', startDate: '', endDate: '' };
  worryFreeBatchDetailCurrentPage = 1;
  const detail = worryFreeBatchDetails[activeWorryFreeBatchDetailDate];
  const body = document.getElementById('worryFreeBatchDetailBody');
  if (!detail || !body) return;
  body.innerHTML = renderWorryFreeBatchDetailPageContent(detail);
  mountWorryFreeBatchDetailFilters();
  const detailTab = body.querySelector('[onclick*="worryFreeBatchDetailRowsPanel"]');
  if (detailTab && typeof switchLeadDetailTab === 'function') switchLeadDetailTab(detailTab, 'worryFreeBatchDetailRowsPanel');
}

function toggleWorryFreeBatchDetailMoreFilters() {
  worryFreeBatchDetailMoreFiltersExpanded = !worryFreeBatchDetailMoreFiltersExpanded;
  const more = document.querySelector('#worryFreeBatchDetailRowsPanel .resource-unfilled-batch-query-more');
  const trigger = document.querySelector('#worryFreeBatchDetailRowsPanel .resource-unfilled-batch-more-trigger');
  if (more) more.style.display = worryFreeBatchDetailMoreFiltersExpanded ? 'grid' : 'none';
  if (trigger) trigger.innerHTML = `更多筛选 <span>${worryFreeBatchDetailMoreFiltersExpanded ? '收起' : '展开'}</span>`;
}

function backToWorryFreeList() {
  hideLeadPages();
  document.getElementById('worryFreePage').classList.add('show');
  document.getElementById('designStage').classList.remove('show');
  setLeadNavActive('三无忧');
  setSidebarActiveByName('线索管理');
  setPageName('线索管理 / 三无忧');
  renderWorryFreeBatchTable();
}

function deleteWorryFreeRuleRow(button) {
  const row = button.closest('tr');
  if (!row) return;
  const layerSelect = row.querySelector('select');
  if (layerSelect && layerSelect.value === 'P100') {
    showToast('P100 为保底分层，禁止删除', false);
    return;
  }
  row.remove();
  showToast('当前配置行已删除', true);
}

function addWorryFreeLayerRule() {
  const tbody = document.getElementById('worryFreeLayerRuleBody');
  if (!tbody) return;
  tbody.insertAdjacentHTML('beforeend', `
    <tr>
      <td>
        <select class="worry-free-table-select" onchange="syncWorryFreeLayerMapping(this)">
          <option>P1</option>
          <option>P2</option>
          <option>P3</option>
          <option>P4</option>
          <option selected>P100</option>
        </select>
      </td>
      <td>
        <select class="worry-free-table-select">
          <option>历史试驾过 / 历史到店过</option>
          <option>门店跟进次数 ≥ 3 次</option>
          <option>休眠未购</option>
          <option>休眠失联</option>
          <option selected>历史剩余数据</option>
        </select>
      </td>
      <td><div class="worry-free-table-actions"><button class="action-btn delete" type="button" onclick="deleteWorryFreeRuleRow(this)">删除</button></div></td>
    </tr>
  `);
  showToast('已新增分层标签映射行', true);
}

const worryFreeExportColumns = [
  '批次号',
  '总部线索ID',
  '培育线索编码',
  '培育任务编码',
  '线索状态',
  '异常原因',
  '意向级别',
  '客户姓名',
  '手机号码',
  '意向车系',
  '意向专营店',
  '最新留资车系',
  'SmartCode',
  '最近跟进时间',
  '门店跟进次数',
  '用户标签',
  '分层标签',
  '短信状态',
  '系统状态',
  '同步时间',
  '系统异常原因',
  '每日推送上限',
  '准入意向车系',
  'AI外呼建联去重窗口 T-N',
  '人工外呼建联去重窗口 T-N',
  '短信模板',
  '推送数据时间',
  '禁止推送数据时间',
  '同一手机号仅推送一次 T-N',
  '分层标签映射权重',
  '意向车系映射话术任务'
];

const worryFreeExportSourceRows = [
  {
    batchDate: '2026-06-16',
    sourceLeadId: 'HQ202606160001',
    nurtureLeadCode: 'PY202606160001',
    nurtureTaskCode: 'RW202606160001',
    leadStatus: '待外呼',
    exceptionReason: '',
    intentLevel: 'A',
    customerName: '王先生',
    mobile: '138****2601',
    intentSeries: 'NX8',
    intentDealer: '上海蔚来中心浦东店',
    latestSeries: 'NX8',
    smartCode: 'SC-NX8-2601',
    lastFollowTime: '2026-05-28 14:20',
    dealerFollowCount: '2',
    layerTag: 'P1',
    layerWeight: '100',
    smsStatus: '待发送',
    systemStatus: '待推送',
    systemExceptionReason: ''
  },
  {
    batchDate: '2026-06-16',
    sourceLeadId: 'HQ202606160002',
    nurtureLeadCode: 'PY202606160002',
    nurtureTaskCode: 'RW202606160002',
    leadStatus: '已推送',
    exceptionReason: '',
    intentLevel: 'B',
    customerName: '李女士',
    mobile: '139****8712',
    intentSeries: 'N6',
    intentDealer: '北京蔚来中心朝阳店',
    latestSeries: 'N6',
    smartCode: 'SC-N6-8712',
    lastFollowTime: '2026-05-30 10:42',
    dealerFollowCount: '4',
    layerTag: 'P2',
    layerWeight: '80',
    smsStatus: '成功',
    systemStatus: '已推送一知',
    systemExceptionReason: ''
  },
  {
    batchDate: '2026-06-15',
    sourceLeadId: 'HQ202606160003',
    nurtureLeadCode: 'PY202606160003',
    nurtureTaskCode: 'RW202606160003',
    leadStatus: '短信成功',
    exceptionReason: '',
    intentLevel: 'H',
    customerName: '陈先生',
    mobile: '186****0934',
    intentSeries: 'N7',
    intentDealer: '广州蔚来中心天河店',
    latestSeries: 'N7',
    smartCode: 'SC-N7-0934',
    lastFollowTime: '2026-04-18 16:05',
    dealerFollowCount: '1',
    layerTag: 'P3',
    layerWeight: '60',
    smsStatus: '成功',
    systemStatus: '已生成DCC培育任务',
    systemExceptionReason: ''
  },
  {
    batchDate: '2026-06-15',
    sourceLeadId: 'HQ202606160004',
    nurtureLeadCode: 'PY202606160004',
    nurtureTaskCode: 'RW202606160004',
    leadStatus: '异常',
    exceptionReason: '号码为空号',
    intentLevel: 'C',
    customerName: '赵女士',
    mobile: '137****5520',
    intentSeries: 'NX8',
    intentDealer: '深圳蔚来中心南山店',
    latestSeries: 'NX8',
    smartCode: 'SC-NX8-5520',
    lastFollowTime: '2026-03-22 09:18',
    dealerFollowCount: '0',
    layerTag: 'P4',
    layerWeight: '40',
    smsStatus: '失败',
    systemStatus: '失败',
    systemExceptionReason: '号码为空号'
  },
  {
    batchDate: '2026-06-14',
    sourceLeadId: 'HQ202606160005',
    nurtureLeadCode: 'PY202606160005',
    nurtureTaskCode: 'RW202606160005',
    leadStatus: '待推送',
    exceptionReason: '',
    intentLevel: 'A',
    customerName: '周先生',
    mobile: '158****4418',
    intentSeries: 'N6',
    intentDealer: '杭州蔚来中心西湖店',
    latestSeries: 'N6',
    smartCode: 'SC-N6-4418',
    lastFollowTime: '2026-02-16 11:32',
    dealerFollowCount: '1',
    layerTag: 'P100',
    layerWeight: '20',
    smsStatus: '待发送',
    systemStatus: '待推送',
    systemExceptionReason: ''
  }
];

const worryFreeBatchRecords = [
  { date: '2026-06-16', candidate: '18,642', dedupe: '7,218', smsSuccess: '9,862', tasks: '8,934', syncFailed: '76', remaining: '9,708', status: '执行中' },
  { date: '2026-06-15', candidate: '16,305', dedupe: '6,305', smsSuccess: '9,911', tasks: '10,000', syncFailed: '47', remaining: '6,305', status: '已完成' },
  { date: '2026-06-14', candidate: '12,908', dedupe: '2,908', smsSuccess: '9,774', tasks: '10,000', syncFailed: '30', remaining: '2,908', status: '已完成' }
];

function renderWorryFreeBatchStatus(status) {
  const cls = status === '执行中' ? 'status-enabled' : 'status-reviewed';
  return `<span class="status-badge ${cls}">${status}</span>`;
}

function renderWorryFreeBatchTable() {
  const rows = worryFreeBatchRecords;
  const totalPages = Math.max(1, Math.ceil(rows.length / worryFreeBatchPageSize));
  worryFreeBatchCurrentPage = Math.min(worryFreeBatchCurrentPage, totalPages);
  const start = (worryFreeBatchCurrentPage - 1) * worryFreeBatchPageSize;
  const pageRows = rows.slice(start, start + worryFreeBatchPageSize);
  const tableHead = document.getElementById('worryFreeBatchTableHead');
  const tableBody = document.getElementById('worryFreeBatchTableBody');
  const pageInfo = document.getElementById('worryFreeBatchPageInfo');
  if (!tableHead || !tableBody || !pageInfo) return;

  tableHead.innerHTML = '<tr><th>批次日期</th><th>累计总量</th><th>去重过滤</th><th>短信成功</th><th>DCC培育任务</th><th>同步失败量</th><th>滚存待推送</th><th>批次状态</th><th>操作</th></tr>';
  tableBody.innerHTML = pageRows.length
    ? pageRows.map(row => `
      <tr>
        <td>${row.date}</td>
        <td>${row.candidate}</td>
        <td>${row.dedupe}</td>
        <td>${row.smsSuccess}</td>
        <td>${row.tasks}</td>
        <td>${row.syncFailed}</td>
        <td>${row.remaining}</td>
        <td>${renderWorryFreeBatchStatus(row.status)}</td>
        <td><button class="action-btn view" type="button" onclick="openWorryFreeBatchDetail('${row.date}')">查看</button></td>
      </tr>
    `).join('')
    : '<tr><td colspan="9"><div class="empty-state">暂无批次记录</div></td></tr>';
  pageInfo.textContent = `共 ${rows.length} 条记录，当前第 ${worryFreeBatchCurrentPage} / ${totalPages} 页`;

  const pageSizeSelect = document.getElementById('worryFreeBatchPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(worryFreeBatchPageSize);
  const pageSelect = document.getElementById('worryFreeBatchPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, idx) => `<option value="${idx + 1}">第 ${idx + 1} 页</option>`).join('');
    pageSelect.value = String(worryFreeBatchCurrentPage);
  }
  if (typeof initWorryFreeSmsTemplatePicker === 'function') {
    initWorryFreeSmsTemplatePicker();
  }
}

function changeWorryFreeBatchPageSize(value) {
  worryFreeBatchPageSize = Number(value) || 5;
  worryFreeBatchCurrentPage = 1;
  renderWorryFreeBatchTable();
}

function selectWorryFreeBatchPage(value) {
  worryFreeBatchCurrentPage = Number(value) || 1;
  renderWorryFreeBatchTable();
}

function changeWorryFreeBatchPage(dir) {
  const totalPages = Math.max(1, Math.ceil(worryFreeBatchRecords.length / worryFreeBatchPageSize));
  worryFreeBatchCurrentPage = Math.max(1, Math.min(totalPages, worryFreeBatchCurrentPage + dir));
  renderWorryFreeBatchTable();
}

function getWorryFreeInputValue(id) {
  return document.getElementById(id)?.value?.trim() || '';
}

function getWorryFreeLayerRuleText() {
  return [...document.querySelectorAll('#worryFreeLayerRuleBody tr')].map(row => {
    const controls = row.querySelectorAll('select, input');
    const layer = controls[0]?.value || '';
    const mapping = controls[1]?.value || '';
    return `${layer}：${mapping}`;
  }).filter(Boolean).join('；');
}

function getWorryFreeScriptRuleText() {
  return [...document.querySelectorAll('#worryFreeScriptRuleBody tr')].map(row => {
    const td1 = row.querySelector('td:first-child');
    const select = row.querySelector('select');
    const series = td1 ? td1.textContent.trim() : '';
    const taskId = select ? select.value : '';
    return `${series}：外呼类型 ${taskId}`;
  }).filter(Boolean).join('；');
}

function formatWorryFreeDedupeWindow(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  return /^T-/.test(text) ? text : `T-${text}`;
}

function getWorryFreeBatchNo(date) {
  return `SWY-${String(date || '').replace(/-/g, '')}-001`;
}

function isWorryFreeExportDateInRange(date, startDate, endDate) {
  if (!date) return false;
  if (startDate && date < startDate) return false;
  if (endDate && date > endDate) return false;
  return true;
}

function exportWorryFreeDetails() {
  const startDate = getWorryFreeInputValue('worryFreeExportStartDate');
  const endDate = getWorryFreeInputValue('worryFreeExportEndDate');
  if (startDate && endDate && startDate > endDate) {
    showToast('开始日期不能晚于结束日期', false);
    document.getElementById('worryFreeExportStartDate')?.focus();
    return;
  }
  const dccFields = getWorryFreeDccExportFields();
  const exportSourceRows = worryFreeExportSourceRows.filter(row => isWorryFreeExportDateInRange(row.batchDate, startDate, endDate));
  if (!exportSourceRows.length) {
    showToast('当前日期范围内暂无可导出数据', false);
    return;
  }
  const userTagMap = {
    P1: '历史试驾过 / 历史到店过',
    P2: '门店跟进次数 ≥ 3次',
    P3: '休眠未购',
    P4: '休眠失联',
    P100: '—'
  };
  const rows = exportSourceRows.map(row => [
    getWorryFreeBatchNo(row.batchDate),
    row.sourceLeadId,
    row.nurtureLeadCode,
    row.nurtureTaskCode,
    row.leadStatus,
    row.exceptionReason,
    row.intentLevel || '—',
    row.customerName,
    row.mobile,
    row.intentSeries,
    row.intentDealer,
    row.latestSeries,
    row.smartCode,
    row.lastFollowTime,
    row.dealerFollowCount,
    userTagMap[row.layerTag] || '—',
    row.layerTag,
    row.smsStatus,
    row.systemStatus,
    row.systemExceptionReason,
    dccFields.dailyLimit,
    dccFields.allowedSeries,
    dccFields.aiDedupeWindow,
    dccFields.manualDedupeWindow,
    dccFields.smsTemplate,
    dccFields.callTime,
    dccFields.quietTime,
    dccFields.singlePhonePushWindow,
    dccFields.layerRule,
    dccFields.scriptRule
  ]);
  const csvRows = [
    worryFreeExportColumns.map(csvEscape).join(','),
    ...rows.map(row => row.map(csvEscape).join(','))
  ];
  const rangeText = startDate || endDate ? `${startDate || '全部'}_${endDate || '全部'}` : new Date().toISOString().slice(0, 10);
  downloadCsvFile(`三无忧全部数据_${rangeText}.csv`, csvRows, `已导出 ${rows.length} 条三无忧明细数据`);
}
