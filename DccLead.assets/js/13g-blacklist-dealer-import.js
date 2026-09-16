// Dealer blacklist import wizard: reuses the platform's standard three-step import interaction.
let blacklistDealerImportState = { step: 1, fileName: '', rows: [], validatedRows: [], result: { success: 0, failed: 0 } };

const blacklistDealerImportColumns = ['经销商编码', '关联车系', '属性类型', '禁用期限', '添加原因'];

function openBlacklistDealerImportWizard() {
  blacklistDealerImportState = { step: 1, fileName: '', rows: [], validatedRows: [], result: { success: 0, failed: 0 } };
  document.getElementById('blacklistDealerImportModal')?.classList.add('show');
  renderBlacklistDealerImportWizard();
}

function closeBlacklistDealerImportWizard() {
  document.getElementById('blacklistDealerImportModal')?.classList.remove('show');
}

function renderBlacklistDealerImportWizard() {
  const body = document.getElementById('blacklistDealerImportBody');
  const footer = document.getElementById('blacklistDealerImportFooter');
  if (!body || !footer) return;
  const state = blacklistDealerImportState;
  body.innerHTML = `${renderBlacklistDealerImportSteps()}${state.step === 1 ? renderBlacklistDealerImportUpload() : ''}${state.step === 2 ? renderBlacklistDealerImportPreview() : ''}${state.step === 3 ? renderBlacklistDealerImportComplete() : ''}`;
  footer.innerHTML = renderBlacklistDealerImportFooter();
}

function renderBlacklistDealerImportSteps() {
  const step = blacklistDealerImportState.step;
  return `<div class="assignment-import-steps">${[['Step1', '上传文件'], ['Step2', '数据预览'], ['Step3', '导入完成']].map((item, index) => {
    const no = index + 1;
    return `<div class="assignment-import-step ${no === step ? 'active' : no < step ? 'done' : ''}"><div class="assignment-import-step-index">${item[0]}</div><div class="assignment-import-step-title">${item[1]}</div></div>`;
  }).join('')}</div>`;
}

function renderBlacklistDealerImportUpload() {
  return `<div class="assignment-import-panel">
    <div class="assignment-import-tip">Step1 操作说明：下载模板了解格式要求 → 按模板填写 → 上传 Excel 文件。导入将校验经销商编码、属性类型、禁用期限和关联车系；重复的经销商黑名单不会覆盖原记录。</div>
    <div class="action-btns" style="margin-bottom:12px;"><button class="btn-secondary" type="button" onclick="downloadBlacklistDealerImportTemplate()">下载模板</button></div>
    <label class="assignment-import-upload"><input id="blacklistDealerImportFile" type="file" accept=".xls,.xlsx,.xml,.csv,.tsv,.txt" onchange="handleBlacklistDealerImportFile(this.files && this.files[0])" /><div><strong>上传 Excel 文件</strong><span>支持下载模板导出的 .xls 文件，也兼容 CSV/TSV 文本文件</span></div></label>
    <div class="assignment-import-file">${blacklistDealerImportState.fileName ? `已选择：${escapeDealerHtml(blacklistDealerImportState.fileName)}` : ''}</div>
    <div class="series-form-hint">导入字段：经销商编码（必填）、关联车系（选填）、属性类型（必填：永久/赛马）、禁用期限（赛马必填）、添加原因（选填）。</div>
  </div>`;
}

function renderBlacklistDealerImportPreview() {
  const rows = blacklistDealerImportState.validatedRows;
  const success = rows.filter(row => row.valid).length;
  return `<div class="assignment-import-panel"><div class="assignment-import-summary">
    <div class="assignment-import-stat"><div class="assignment-import-stat-label">解析总数</div><div class="assignment-import-stat-value">${rows.length}</div></div>
    <div class="assignment-import-stat"><div class="assignment-import-stat-label">校验通过</div><div class="assignment-import-stat-value">${success}</div></div>
    <div class="assignment-import-stat"><div class="assignment-import-stat-label">校验失败</div><div class="assignment-import-stat-value">${rows.length - success}</div></div>
  </div><div class="assignment-import-preview"><table class="data-table"><thead><tr><th style="width:64px">行号</th>${blacklistDealerImportColumns.map(column => `<th>${column}</th>`).join('')}<th style="width:220px">校验结果</th></tr></thead><tbody>${rows.map(row => `<tr><td>${row.rowNo}</td>${blacklistDealerImportColumns.map(column => `<td>${escapeDealerHtml(row.data[column] || '—')}</td>`).join('')}<td>${row.valid ? '<span class="assignment-import-pass">通过</span>' : `<div class="assignment-import-error">${row.errors.map(escapeDealerHtml).join('<br>')}</div>`}</td></tr>`).join('') || `<tr><td colspan="${blacklistDealerImportColumns.length + 2}"><div class="empty-state">暂无可预览数据</div></td></tr>`}</tbody></table></div></div>`;
}

function renderBlacklistDealerImportComplete() {
  const { success, failed } = blacklistDealerImportState.result;
  return `<div class="assignment-import-complete"><div class="import-complete-title">导入完成</div><div class="assignment-import-complete-desc">成功导入 <strong>${success}</strong> 条；失败 <strong>${failed}</strong> 条。</div></div>`;
}

function renderBlacklistDealerImportFooter() {
  const validCount = blacklistDealerImportState.validatedRows.filter(row => row.valid).length;
  if (blacklistDealerImportState.step === 1) return `<button class="btn-cancel" type="button" onclick="closeBlacklistDealerImportWizard()">取消</button><button class="btn-save" type="button" ${blacklistDealerImportState.validatedRows.length ? '' : 'disabled'} onclick="goBlacklistDealerImportPreview()">下一步</button>`;
  if (blacklistDealerImportState.step === 2) return `<button class="btn-cancel" type="button" onclick="backBlacklistDealerImportUpload()">上一步</button><button class="btn-save" type="button" ${validCount ? '' : 'disabled'} onclick="confirmBlacklistDealerImport()">确认导入</button>`;
  return `<button class="btn-save" type="button" onclick="closeBlacklistDealerImportWizard()">完成</button>`;
}

function downloadBlacklistDealerImportTemplate() {
  const sheets = [
    { name: '导入数据', columns: ['经销商编码*', '关联车系', '属性类型*', '禁用期限', '添加原因'], rows: [['DLR-BJ-CY-002', 'N6、轩逸', '赛马', '2026-10-31', '活动期暂不参与线索分配']] },
    { name: '填写说明', columns: ['字段', '是否必填', '填写说明'], rows: [
      ['经销商编码', '必填', '须为系统已存在的经销商编码；同一文件内不可重复。'],
      ['关联车系', '选填', '多个车系使用顿号、逗号或分号分隔；留空表示全部关联车系。'],
      ['属性类型', '必填', '仅支持：永久、赛马。'],
      ['禁用期限', '赛马必填', '格式：YYYY-MM-DD；永久类型请留空。'],
      ['添加原因', '选填', '最长 2000 字。']
    ] }
  ];
  downloadExcelWorkbookFile('经销商黑名单导入模板.xls', sheets, '经销商黑名单导入模板已下载');
}

function handleBlacklistDealerImportFile(file) {
  if (!file) return;
  blacklistDealerImportState.fileName = file.name;
  if (/\.xlsx$/i.test(file.name)) {
    blacklistDealerImportState.validatedRows = [];
    showToast('当前原型请使用下载模板保存的 .xls 文件上传', false);
    renderBlacklistDealerImportWizard();
    return;
  }
  const reader = new FileReader();
  reader.onload = event => {
    blacklistDealerImportState.rows = parseBlacklistDealerImportRows(String(event.target.result || ''), file.name);
    blacklistDealerImportState.validatedRows = validateBlacklistDealerImportRows(blacklistDealerImportState.rows);
    showToast(blacklistDealerImportState.validatedRows.length ? `已解析 ${blacklistDealerImportState.validatedRows.length} 条数据` : '未解析到可导入的数据行，请检查模板内容', !!blacklistDealerImportState.validatedRows.length);
    renderBlacklistDealerImportWizard();
  };
  reader.onerror = () => showToast('文件读取失败，请重新上传', false);
  reader.readAsText(file, 'utf-8');
}

function parseBlacklistDealerImportRows(text, fileName) {
  let matrix = [];
  if (text.includes('<Workbook')) {
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    matrix = Array.from(doc.getElementsByTagName('Row')).map(row => Array.from(row.getElementsByTagName('Cell')).map(cell => cell.textContent.trim()));
  } else {
    const delimiter = /\.tsv$/i.test(fileName) ? '\t' : ',';
    matrix = text.split(/\r?\n/).filter(Boolean).map(line => line.split(delimiter).map(cell => cell.trim()));
  }
  const headerIndex = matrix.findIndex(row => row.map(cell => String(cell).replace(/\*/g, '').trim()).includes('经销商编码'));
  if (headerIndex < 0) return [];
  const header = matrix[headerIndex].map(cell => String(cell).replace(/\*/g, '').trim());
  return matrix.slice(headerIndex + 1).filter(row => row.some(Boolean)).map((row, index) => ({ rowNo: headerIndex + index + 2, data: Object.fromEntries(blacklistDealerImportColumns.map(column => [column, row[header.indexOf(column)] || ''])) }));
}

function validateBlacklistDealerImportRows(rows) {
  const seenCodes = new Set();
  const existingCodes = new Set(blacklistDealers.map(item => item.dealerCode));
  return rows.map(row => {
    const data = row.data;
    const errors = [];
    const code = data['经销商编码'].trim();
    const attrType = data['属性类型'].trim();
    const expireAt = data['禁用期限'].trim();
    const series = data['关联车系'].split(/[、,，;；]/).map(item => item.trim()).filter(Boolean);
    if (!code) errors.push('经销商编码必填');
    else if (!_findDealerByCode(code)) errors.push('经销商编码不存在');
    else if (existingCodes.has(code)) errors.push('该经销商已在黑名单中');
    else if (seenCodes.has(code)) errors.push('文件内经销商编码重复');
    seenCodes.add(code);
    if (!['永久', '赛马'].includes(attrType)) errors.push('属性类型仅支持：永久、赛马');
    if (attrType === '赛马' && !/^\d{4}-\d{2}-\d{2}$/.test(expireAt)) errors.push('赛马类型需填写禁用期限（YYYY-MM-DD）');
    if (attrType === '永久' && expireAt) errors.push('永久类型无需填写禁用期限');
    if (series.length) {
      const invalidSeries = series.filter(item => !seriesIntentOptions.includes(item));
      if (invalidSeries.length) errors.push(`关联车系无效：${invalidSeries.join('、')}`);
    }
    if (data['添加原因'].length > 2000) errors.push('添加原因不能超过 2000 字');
    return { ...row, valid: !errors.length, errors };
  });
}

function goBlacklistDealerImportPreview() { blacklistDealerImportState.step = 2; renderBlacklistDealerImportWizard(); }
function backBlacklistDealerImportUpload() { blacklistDealerImportState.step = 1; renderBlacklistDealerImportWizard(); }

function confirmBlacklistDealerImport() {
  const validRows = blacklistDealerImportState.validatedRows.filter(row => row.valid);
  const now = typeof formatDealerNow === 'function' ? formatDealerNow() : new Date().toISOString().slice(0, 19).replace('T', ' ');
  validRows.forEach(row => {
    const data = row.data;
    const dealer = _findDealerByCode(data['经销商编码'].trim());
    blacklistDealers.push({
      id: String(blacklistDealerNextId++), dealerCode: dealer.code, dealerName: dealer.name,
      carSeries: data['关联车系'].split(/[、,，;；]/).map(item => item.trim()).filter(Boolean),
      attrType: data['属性类型'].trim() === '永久' ? '0' : '1',
      expireAt: data['属性类型'].trim() === '永久' ? null : data['禁用期限'].trim(),
      addType: '批量导入', reason: data['添加原因'].trim(), etlUpdateTime: now,
      createTime: now, createOperator: '管理员', updateTime: now, updateOperator: '管理员'
    });
  });
  blacklistDealerImportState.result = { success: validRows.length, failed: blacklistDealerImportState.validatedRows.length - validRows.length };
  blacklistDealerImportState.step = 3;
  renderBlacklistDealerListPage();
  renderBlacklistDealerImportWizard();
}
