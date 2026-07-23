// Precall Task Import Wizard implementation

const precallTaskImportColumns = [
  '配置名称*', '权重*', '状态*', '命中类型*', '属性值*', '线索状态', '意向车系*', 
  '预外呼线路*', '生效星期*', '生效时段*', '工作时段优先级*', '工作时段技能组*', 
  '非工作时段优先级*', '非工作时段技能组*'
];

let precallTaskImportState = {
  step: 1,
  fileName: '',
  rows: [],
  validatedRows: [],
  result: { success: 0, failed: 0 }
};

function openPrecallTaskImportWizard() {
  precallTaskImportState = {
    step: 1,
    fileName: '',
    rows: [],
    validatedRows: [],
    result: { success: 0, failed: 0 }
  };
  document.getElementById('precallTaskImportTitle').textContent = `导入推送预外呼配置`;
  document.getElementById('precallTaskImportModal').classList.add('show');
  renderPrecallTaskImportWizard();
}

function renderPrecallTaskImportWizard() {
  const body = document.getElementById('precallTaskImportBody');
  const footer = document.getElementById('precallTaskImportFooter');
  if (!body || !footer) return;
  body.innerHTML = `
    ${renderPrecallTaskImportSteps()}
    ${precallTaskImportState.step === 1 ? renderPrecallTaskImportStepUpload() : ''}
    ${precallTaskImportState.step === 2 ? renderPrecallTaskImportStepPreview() : ''}
    ${precallTaskImportState.step === 3 ? renderPrecallTaskImportStepComplete() : ''}
  `;
  footer.innerHTML = renderPrecallTaskImportFooter();
}

function renderPrecallTaskImportSteps() {
  const step = precallTaskImportState.step;
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

function renderPrecallTaskImportStepUpload() {
  return `
    <div class="assignment-import-panel">
      <div class="assignment-import-tip">
        Step1 操作说明：下载模板了解格式要求 → 按模板填写 → 上传Excel文件。模板已包含必填字段列，上传后会校验数据格式与枚举值合法性。
      </div>
      <div class="action-btns" style="margin-bottom: 12px;">
        <button class="btn-secondary" type="button" data-ui-action="precall-task-import-download-template">下载模板</button>
      </div>
      <label class="assignment-import-upload">
        <input id="precallTaskImportFile" type="file" accept=".xls,.xlsx,.xml,.csv,.tsv,.txt" onchange="handlePrecallTaskImportFile(this.files && this.files[0])" />
        <div>
          <strong>上传Excel文件</strong>
          <span>支持使用模板下载的 .xls 文件，也兼容 CSV/TSV 文本文件</span>
        </div>
      </label>
      <div class="assignment-import-file" id="precallTaskImportFileName">${precallTaskImportState.fileName ? `已选择：${escapeHtml(precallTaskImportState.fileName)}` : ''}</div>
    </div>
  `;
}

function renderPrecallTaskImportStepPreview() {
  const rows = precallTaskImportState.validatedRows;
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
              ${precallTaskImportColumns.map(col => `<th>${col}</th>`).join('')}
              <th style="width:180px">校验结果</th>
            </tr>
          </thead>
          <tbody>
            ${rows.length ? rows.map(row => `
              <tr class="${row.valid ? '' : 'has-error'}" style="${row.valid ? '' : 'background-color: #fff1f0;'}">
                <td>${row.rowNo}</td>
                ${precallTaskImportColumns.map(col => `<td>${escapeHtml(row.data[col] || '—')}</td>`).join('')}
                <td>${row.valid ? '<span class="assignment-import-pass" style="color: #52c41a; font-weight: bold;">通过</span>' : `<div class="assignment-import-error" style="color: #ff4d4f; font-size: 12px; line-height: 1.4;">${row.errors.map(escapeHtml).join('<br>')}</div>`}</td>
              </tr>
            `).join('') : '<tr><td colspan="16"><div class="empty-state">暂无可预览数据</div></td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderPrecallTaskImportStepComplete() {
  const result = precallTaskImportState.result;
  return `
    <div class="assignment-import-complete">
      <div class="assignment-import-complete-title" style="font-size: 18px; font-weight: bold; text-align: center; margin-bottom: 8px; color: #52c41a;">导入完成</div>
      <div class="assignment-import-complete-desc" style="text-align: center; margin-bottom: 24px; color: #555;">成功 ${result.success} 条，失败 ${result.failed} 条；成功数据已写入推送预外呼配置列表。</div>
      <div class="assignment-import-summary">
        <div class="assignment-import-stat"><div class="assignment-import-stat-label">成功</div><div class="assignment-import-stat-value" style="color: #52c41a;">${result.success}</div></div>
        <div class="assignment-import-stat"><div class="assignment-import-stat-label">失败</div><div class="assignment-import-stat-value" style="color: #ff4d4f;">${result.failed}</div></div>
      </div>
    </div>
  `;
}

function renderPrecallTaskImportFooter() {
  const step = precallTaskImportState.step;
  const validCount = precallTaskImportState.validatedRows.filter(row => row.valid).length;
  if (step === 1) {
    return `
      <button class="btn-cancel" type="button" onclick="closeModal('precallTaskImportModal')">取消</button>
      <button class="btn-save" type="button" ${precallTaskImportState.validatedRows.length ? '' : 'disabled'} onclick="goPrecallTaskImportPreview()">下一步</button>
    `;
  }
  if (step === 2) {
    return `
      <button class="btn-cancel" type="button" onclick="backPrecallTaskImportUpload()">上一步</button>
      <button class="btn-save" type="button" ${validCount ? '' : 'disabled'} onclick="confirmPrecallTaskImport()">确认导入</button>
    `;
  }
  return `<button class="btn-save" type="button" onclick="closeModal('precallTaskImportModal')">完成</button>`;
}

function goPrecallTaskImportPreview() {
  precallTaskImportState.step = 2;
  renderPrecallTaskImportWizard();
}

function backPrecallTaskImportUpload() {
  precallTaskImportState.step = 1;
  renderPrecallTaskImportWizard();
}

function downloadPrecallTaskImportTemplate() {
  const sheets = [
    {
      name: '推送预外呼配置',
      columns: precallTaskImportColumns,
      rows: [
        ['R1渠道预外呼示例', '1', '启用', '渠道编码', 'R1', '总部_高意向', 'N7', '虚拟号-大众', '周一、周二、周三、周四、周五', '09:00-18:00', '1', '技能组A', '2', '技能组B']
      ]
    },
    {
      name: '填写说明',
      columns: ['字段', '是否必填', '填写说明', '示例/枚举'],
      rows: [
        ['配置名称', '必填', '配置的规则名称，用于管理和检索。', 'R1渠道预外呼'],
        ['权重', '必填', '配置生效优先级，数值为1-255。数字越小优先级越高。', '1'],
        ['状态', '必填', '策略状态，只支持“启用”或“停用”。', '启用、停用'],
        ['命中类型', '必填', '命中类型。只支持“渠道编码”、“SmartCode”、“大项目名”或“线索状态”。', '渠道编码、SmartCode、大项目名、线索状态'],
        ['属性值', '必填', '命中类型对应的匹配值，多个值以逗号或顿号隔开。若命中类型为线索状态，则此处应填写线索状态。', 'R1、SC-GZ-2026'],
        ['线索状态', '选填', '当命中类型不为线索状态时，可选填用于且条件判断，多个值以逗号或顿号隔开。', '总部_高意向、门店_高意向'],
        ['意向车系', '必填', '准入意向车系，多个值以逗号或顿号隔开。', 'N6、N7、轩逸、天籁、逍客、奇骏、ARIYA、探陆、其他车系'],
        ['预外呼线路', '必填', '呼叫线路。', '虚拟号-大众、虚拟号-厚扑'],
        ['生效星期', '必填', '生效的星期几，多个值以逗号或顿号隔开。', '周一、周二、周三、周四、周五、周六、周日'],
        ['生效时段', '必填', '每天生效时段，格式为HH:MM-HH:MM，多个时段以逗号隔开。时段不可重叠。', '09:00-12:00, 14:00-18:00'],
        ['工作时段优先级', '必填', '工作时段内的呼叫优先级，为正整数。', '1'],
        ['工作时段技能组', '必填', '工作时段的路由目标技能组。', '技能组A、技能组B、技能组C'],
        ['非工作时段优先级', '必填', '非工作时段内的呼叫优先级，为正整数。', '2'],
        ['非工作时段技能组', '必填', '非工作时段的路由目标技能组。', '技能组A、技能组B、技能组C']
      ]
    }
  ];
  downloadExcelWorkbookFile('推送预外呼配置导入模板.xls', sheets, '推送预外呼配置导入模板已下载');
}

registerUiAction('precall-task-import-download-template', downloadPrecallTaskImportTemplate);

function handlePrecallTaskImportFile(file) {
  if (!file) return;
  precallTaskImportState.fileName = file.name;
  const fileNameNode = document.getElementById('precallTaskImportFileName');
  if (fileNameNode) fileNameNode.textContent = `已选择：${file.name}`;
  if (file.name.toLowerCase().endsWith('.xlsx')) {
    precallTaskImportState.rows = [];
    precallTaskImportState.validatedRows = [];
    showToast('当前原型请使用下载模板保存的 .xls 文件上传', false);
    renderPrecallTaskImportWizard();
    return;
  }
  const reader = new FileReader();
  reader.onload = event => {
    const text = String(event.target.result || '');
    const rows = parsePrecallTaskImportRows(text);
    precallTaskImportState.rows = rows;
    precallTaskImportState.validatedRows = validatePrecallTaskImportRows(rows);
    if (!precallTaskImportState.validatedRows.length) {
      showToast('未解析到可导入的数据行，请检查模板内容', false);
    } else {
      showToast(`已解析 ${precallTaskImportState.validatedRows.length} 条数据`, true);
    }
    renderPrecallTaskImportWizard();
  };
  reader.onerror = () => showToast('文件读取失败，请重新上传', false);
  reader.readAsText(file, 'utf-8');
}

function parsePrecallTaskImportRows(text) {
  let matrix = [];
  if (text.includes('<Workbook')) {
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    const parseError = doc.querySelector('parsererror');
    if (!parseError) {
      const rowNodes = Array.from(doc.getElementsByTagName('Row')).length
        ? Array.from(doc.getElementsByTagName('Row'))
        : Array.from(doc.getElementsByTagNameNS('urn:schemas-microsoft-com:office:spreadsheet', 'Row'));
      matrix = rowNodes.map(row => {
        const cells = Array.from(row.getElementsByTagName('Cell')).length
          ? Array.from(row.getElementsByTagName('Cell'))
          : Array.from(doc.getElementsByTagNameNS('urn:schemas-microsoft-com:office:spreadsheet', 'Cell'));
        return cells.map(cell => cell.textContent.trim());
      });
    }
  } else {
    // Delimited
    const delimiter = text.includes('\t') ? '\t' : ',';
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
    matrix = rows;
  }
  
  if (!matrix.length) return [];
  const normalizedMatrix = matrix.map(row => row.map(cell => String(cell || '').replace(/^\ufeff/, '').trim()));
  const targetHeaderCols = precallTaskImportColumns.map(col => col.replace(/\*/g, '').trim());
  
  const headerIndex = normalizedMatrix.findIndex(row => {
    const normalizedHeader = row.map(h => h.replace(/^\ufeff/, '').replace(/\*/g, '').trim());
    return targetHeaderCols.every(column => normalizedHeader.includes(column));
  });
  if (headerIndex < 0) return [];
  const header = normalizedMatrix[headerIndex].map(h => h.replace(/^\ufeff/, '').replace(/\*/g, '').trim());
  return normalizedMatrix.slice(headerIndex + 1)
    .filter(row => row.some(Boolean))
    .map((row, index) => {
      const data = {};
      precallTaskImportColumns.forEach(column => {
        const cleanCol = column.replace(/\*/g, '').trim();
        data[cleanCol] = row[header.indexOf(cleanCol)] || '';
      });
      return { rowNo: headerIndex + index + 2, data };
    });
}

function validatePrecallTaskImportRows(rows) {
  return rows.map(row => {
    const errors = [];
    const data = row.data;
    
    const ruleName = (data['配置名称'] || '').trim();
    const priorityStr = (data['权重'] || '').trim();
    const status = (data['状态'] || '').trim();
    const attributeType = (data['命中类型'] || '').trim();
    const attributeValuesStr = (data['属性值'] || '').trim();
    const leadStatusesStr = (data['线索状态'] || '').trim();
    const carSeriesStr = (data['意向车系'] || '').trim();
    const precallLine = (data['预外呼线路'] || '').trim();
    const workDaysStr = (data['生效星期'] || '').trim();
    const workSlotsStr = (data['生效时段'] || '').trim();
    const workPriorityStr = (data['工作时段优先级'] || '').trim();
    const workSkill = (data['工作时段技能组'] || '').trim();
    const offWorkPriorityStr = (data['非工作时段优先级'] || '').trim();
    const offWorkSkill = (data['非工作时段技能组'] || '').trim();
    
    if (!ruleName) errors.push('配置名称必填');
    
    const priority = Number(priorityStr);
    if (!priorityStr) errors.push('权重必填');
    else if (!Number.isInteger(priority) || priority < 1 || priority > 255) errors.push('权重必须为1-255的整数');
    
    if (!status) errors.push('状态必填');
    else if (!['启用', '停用'].includes(status)) errors.push('状态只支持：启用/停用');
    
    if (!attributeType) errors.push('命中类型必填');
    else if (!['渠道编码', 'SmartCode', '大项目名', '线索状态'].includes(attributeType)) {
      errors.push('命中类型只支持：渠道编码、SmartCode、大项目名、线索状态');
    }
    
    const attributeValues = splitImportedValues(attributeValuesStr);
    if (!attributeValuesStr) errors.push('属性值必填');
    else if (attributeType && precallAttributeConfigs[attributeType]) {
      const allowedOptions = precallAttributeConfigs[attributeType].options || [];
      if (attributeType !== 'SmartCode' && attributeType !== '大项目名') {
        const optionSet = new Set(allowedOptions);
        attributeValues.forEach(val => {
          if (!optionSet.has(val)) errors.push(`属性值枚举值无效：${val}`);
        });
      }
    }
    
    const leadStatuses = splitImportedValues(leadStatusesStr);
    if (leadStatuses.length && attributeType !== '线索状态') {
      const statusSet = new Set(assignmentLeadStatusOptions);
      leadStatuses.forEach(val => {
        if (!statusSet.has(val)) errors.push(`线索状态枚举值无效：${val}`);
      });
    }
    
    const carSeries = splitImportedValues(carSeriesStr);
    if (!carSeriesStr) errors.push('意向车系必填');
    else {
      const seriesSet = new Set(configuratorOptions.carSeries);
      carSeries.forEach(val => {
        if (!seriesSet.has(val)) errors.push(`意向车系枚举值无效：${val}`);
      });
    }
    
    if (!precallLine || precallLine === '请选择') errors.push('预外呼线路必填');
    else if (!configuratorOptions.precallLine.includes(precallLine)) errors.push(`预外呼线路枚举值无效：${precallLine}`);
    
    const workDays = splitImportedValues(workDaysStr);
    if (!workDaysStr) errors.push('生效星期必填');
    else {
      const validWeekdays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
      workDays.forEach(day => {
        if (!validWeekdays.includes(day)) errors.push(`生效星期包含无效星期值：${day}`);
      });
    }
    
    const slots = [];
    if (!workSlotsStr) errors.push('生效时段必填');
    else {
      const slotsParts = splitImportedValues(workSlotsStr);
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      slotsParts.forEach(slotPart => {
        const times = slotPart.split('-');
        if (times.length !== 2 || !timeRegex.test(times[0]) || !timeRegex.test(times[1]) || times[1] <= times[0]) {
          errors.push(`生效时段格式不合法：${slotPart}（正确格式如 09:00-18:00）`);
        } else {
          slots.push({ start: times[0], end: times[1] });
        }
      });
      if (slots.length > 0) {
        const ordered = [...slots].sort((a, b) => a.start.localeCompare(b.start));
        for (let i = 1; i < ordered.length; i++) {
          if (ordered[i].start < ordered[i - 1].end) {
            errors.push('生效时段不可有重叠冲突');
            break;
          }
        }
      }
    }
    
    const workPriority = Number(workPriorityStr);
    if (!workPriorityStr) errors.push('工作时段优先级必填');
    else if (!Number.isInteger(workPriority) || workPriority < 1) errors.push('工作时段优先级必须是大于0的整数');
    
    if (!workSkill) errors.push('工作时段技能组必填');
    else if (!configuratorOptions.skillGroup.includes(workSkill)) errors.push(`工作时段技能组枚举值无效：${workSkill}`);
    
    const offWorkPriority = Number(offWorkPriorityStr);
    if (!offWorkPriorityStr) errors.push('非工作时段优先级必填');
    else if (!Number.isInteger(offWorkPriority) || offWorkPriority < 1) errors.push('非工作时段优先级必须是大于0的整数');
    
    if (!offWorkSkill) errors.push('非工作时段技能组必填');
    else if (!configuratorOptions.skillGroup.includes(offWorkSkill)) errors.push(`非工作时段技能组枚举值无效：${offWorkSkill}`);
    
    return {
      ...row,
      valid: errors.length === 0,
      errors,
      normalized: {
        ruleName, priority, status, attributeType, attributeValues, leadStatuses, carSeries,
        precallLine, workDays, slots, workPriority, workSkill, offWorkPriority, offWorkSkill
      }
    };
  });
}

function confirmPrecallTaskImport() {
  const validRows = precallTaskImportState.validatedRows.filter(row => row.valid);
  const failed = precallTaskImportState.validatedRows.length - validRows.length;
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' 操作人：管理员';
  
  validRows.forEach((row, index) => {
    const norm = row.normalized;
    const nextId = Math.max(1000, ...strategyConfiguratorData.precallTask.map(r => Number(r.id) || 0)) + 1;
    const sortOrder = Math.max(0, ...strategyConfiguratorData.precallTask.map(r => Number(r.sortOrder) || 0)) + 1;
    
    const ruleObj = {
      sortOrder,
      id: nextId,
      ruleName: norm.ruleName,
      priority: norm.priority,
      attributeType: norm.attributeType,
      attributeValues: norm.attributeValues,
      smartCodeInputMode: norm.attributeType === 'SmartCode' ? 'manual' : 'picker',
      projectNameInputMode: norm.attributeType === '大项目名' ? 'manual' : 'picker',
      leadStatuses: norm.attributeType === '线索状态' ? [] : norm.leadStatuses,
      carSeries: norm.carSeries,
      precallLine: norm.precallLine,
      workTime: {
        days: norm.workDays,
        slots: norm.slots
      },
      workTimePriority: norm.workPriority,
      workTimeSkillGroup: norm.workSkill,
      offWorkPriority: norm.offWorkPriority,
      offWorkSkillGroup: norm.offWorkSkill,
      systemStatus: norm.status,
      createdAt: now,
      updatedAt: now
    };
    strategyConfiguratorData.precallTask.push(ruleObj);
  });
  
  precallTaskImportState.result = { success: validRows.length, failed };
  precallTaskImportState.step = 3;
  renderStrategyConfiguratorPage('precallTask');
  renderPrecallTaskImportWizard();
}

function exportPrecallTask() {
  const rows = strategyConfiguratorData.precallTask.map(rule => [
    rule.ruleName || '',
    String(rule.priority || ''),
    rule.systemStatus || '启用',
    rule.attributeType || '',
    (rule.attributeValues || []).join('、'),
    (rule.leadStatuses || []).join('、'),
    (rule.carSeries || []).join('、'),
    rule.precallLine || '',
    (rule.workTime?.days || []).join('、'),
    (rule.workTime?.slots || []).map(s => `${s.start}-${s.end}`).join(', '),
    String(rule.workTimePriority || ''),
    rule.workTimeSkillGroup || '',
    String(rule.offWorkPriority || ''),
    rule.offWorkSkillGroup || ''
  ]);
  const sheets = [
    {
      name: '推送预外呼配置',
      columns: [
        '配置名称', '权重', '状态', '命中类型', '属性值', '线索状态', '意向车系', 
        '预外呼线路', '生效星期', '生效时段', '工作时段优先级', '工作时段技能组', 
        '非工作时段优先级', '非工作时段技能组'
      ],
      rows: rows
    }
  ];
  downloadExcelWorkbookFile(
    `推送预外呼配置导出_${new Date().toISOString().slice(0, 10)}.xls`,
    sheets,
    `已成功导出 ${strategyConfiguratorData.precallTask.length} 条推送预外呼配置`
  );
}
