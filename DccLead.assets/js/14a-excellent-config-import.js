// Excellent configuration import wizard: aligned with the precall task import flow.
let excellentConfigImportState = { key: '', step: 1, fileName: '', rows: [], validatedRows: [], result: { success: 0, failed: 0 } };

function getExcellentImportConfig() {
  const def = getStrategyConfiguratorDef(excellentConfigImportState.key);
  return { def, entityLabel: def.entityLabel, entityField: def.entityField, columns: ['策略名称', def.entityLabel, '意向车系', '状态'] };
}

function openExcellentConfigImportWizard(key) {
  excellentConfigImportState = { key, step: 1, fileName: '', rows: [], validatedRows: [], result: { success: 0, failed: 0 } };
  document.getElementById('excellentConfigImportTitle').textContent = `导入${getStrategyConfiguratorDef(key).title}`;
  document.getElementById('excellentConfigImportModal').classList.add('show');
  renderExcellentConfigImportWizard();
}

function renderExcellentConfigImportWizard() {
  const body = document.getElementById('excellentConfigImportBody');
  const footer = document.getElementById('excellentConfigImportFooter');
  if (!body || !footer) return;
  body.innerHTML = `${renderExcellentConfigImportSteps()}${excellentConfigImportState.step === 1 ? renderExcellentConfigImportUpload() : ''}${excellentConfigImportState.step === 2 ? renderExcellentConfigImportPreview() : ''}${excellentConfigImportState.step === 3 ? renderExcellentConfigImportComplete() : ''}`;
  footer.innerHTML = renderExcellentConfigImportFooter();
}

function renderExcellentConfigImportSteps() {
  const step = excellentConfigImportState.step;
  return `<div class="assignment-import-steps">${[['Step1', '上传文件'], ['Step2', '数据预览'], ['Step3', '导入完成']].map((item, index) => { const no = index + 1; return `<div class="assignment-import-step ${no === step ? 'active' : no < step ? 'done' : ''}"><div class="assignment-import-step-index">${item[0]}</div><div class="assignment-import-step-title">${item[1]}</div></div>`; }).join('')}</div>`;
}

function renderExcellentConfigImportUpload() {
  const config = getExcellentImportConfig();
  return `<div class="assignment-import-panel"><div class="assignment-import-tip">Step1 操作说明：下载模板了解格式要求 → 按模板填写 → 上传Excel文件。模板包含必填字段，上传后将校验空值、状态和意向车系枚举。</div><div class="action-btns" style="margin-bottom:12px;"><button class="btn-secondary" type="button" onclick="downloadExcellentConfigImportTemplate()">下载模板</button></div><label class="assignment-import-upload"><input id="excellentConfigImportFile" type="file" accept=".xls,.xlsx,.xml,.csv,.tsv,.txt" onchange="handleExcellentConfigImportFile(this.files && this.files[0])" /><div><strong>上传Excel文件</strong><span>支持模板导出的 .xls 文件，也兼容 CSV/TSV 文本文件</span></div></label><div class="assignment-import-file" id="excellentConfigImportFileName">${excellentConfigImportState.fileName ? `已选择：${escapeHtml(excellentConfigImportState.fileName)}` : ''}</div><div class="series-form-hint">导入字段：${config.columns.join('、')}。</div></div>`;
}

function renderExcellentConfigImportPreview() {
  const { columns } = getExcellentImportConfig();
  const rows = excellentConfigImportState.validatedRows;
  const success = rows.filter(row => row.valid).length;
  return `<div class="assignment-import-panel"><div class="assignment-import-summary"><div class="assignment-import-stat"><div class="assignment-import-stat-label">解析总数</div><div class="assignment-import-stat-value">${rows.length}</div></div><div class="assignment-import-stat"><div class="assignment-import-stat-label">校验通过</div><div class="assignment-import-stat-value">${success}</div></div><div class="assignment-import-stat"><div class="assignment-import-stat-label">校验失败</div><div class="assignment-import-stat-value">${rows.length - success}</div></div></div><div class="assignment-import-preview"><table class="data-table"><thead><tr><th style="width:64px">行号</th>${columns.map(column => `<th>${escapeHtml(column)}</th>`).join('')}<th style="width:180px">校验结果</th></tr></thead><tbody>${rows.map(row => `<tr><td>${row.rowNo}</td>${columns.map(column => `<td>${escapeHtml(row.data[column] || '—')}</td>`).join('')}<td>${row.valid ? '<span class="assignment-import-pass">通过</span>' : `<div class="assignment-import-error">${row.errors.map(escapeHtml).join('<br>')}</div>`}</td></tr>`).join('') || `<tr><td colspan="${columns.length + 2}"><div class="empty-state">暂无可预览数据</div></td></tr>`}</tbody></table></div></div>`;
}

function renderExcellentConfigImportComplete() {
  const result = excellentConfigImportState.result;
  return `<div class="assignment-import-complete"><div class="assignment-import-complete-title" style="font-size:18px;font-weight:bold;text-align:center;margin-bottom:8px;color:#52c41a;">导入完成</div><div class="assignment-import-complete-desc" style="text-align:center;color:#64748b;">成功导入 <strong>${result.success}</strong> 条；失败 <strong>${result.failed}</strong> 条。</div></div>`;
}

function renderExcellentConfigImportFooter() {
  const validCount = excellentConfigImportState.validatedRows.filter(row => row.valid).length;
  if (excellentConfigImportState.step === 1) return `<button class="btn-cancel" type="button" onclick="closeModal('excellentConfigImportModal')">取消</button><button class="btn-save" type="button" ${excellentConfigImportState.validatedRows.length ? '' : 'disabled'} onclick="goExcellentConfigImportPreview()">下一步</button>`;
  if (excellentConfigImportState.step === 2) return `<button class="btn-cancel" type="button" onclick="backExcellentConfigImportUpload()">上一步</button><button class="btn-save" type="button" ${validCount ? '' : 'disabled'} onclick="confirmExcellentConfigImport()">确认导入</button>`;
  return `<button class="btn-save" type="button" onclick="closeModal('excellentConfigImportModal')">完成</button>`;
}

function downloadExcellentConfigImportTemplate() {
  const { def, entityLabel, columns } = getExcellentImportConfig();
  downloadExcelWorkbookFile(`${def.title}导入模板.xls`, [{ name: '导入数据', columns: columns.map(column => `${column}${['策略名称', entityLabel, '状态'].includes(column) ? '*' : ''}`), rows: [[`示例${entityLabel}规则`, `示例${entityLabel}`, 'N6、轩逸', '启用']] }, { name: '填写说明', columns: ['字段', '是否必填', '填写说明'], rows: [['策略名称', '必填', '规则名称，用于列表展示和检索'], [entityLabel, '必填', `${entityLabel}可填写一个或多个值，使用顿号、逗号或分号分隔`], ['意向车系', '选填', '多个车系使用顿号、逗号或分号分隔；不填写表示不限'], ['状态', '必填', '仅支持：启用、停用']] }], `${def.title}导入模板已下载`);
}

function handleExcellentConfigImportFile(file) {
  if (!file) return;
  excellentConfigImportState.fileName = file.name;
  if (/\.xlsx$/i.test(file.name)) { excellentConfigImportState.validatedRows = []; showToast('当前原型请使用下载模板保存的 .xls 文件上传', false); renderExcellentConfigImportWizard(); return; }
  const reader = new FileReader();
  reader.onload = event => {
    excellentConfigImportState.rows = parseExcellentConfigImportRows(String(event.target.result || ''), file.name);
    excellentConfigImportState.validatedRows = validateExcellentConfigImportRows(excellentConfigImportState.rows);
    showToast(excellentConfigImportState.validatedRows.length ? `已解析 ${excellentConfigImportState.validatedRows.length} 条数据` : '未解析到可导入的数据行，请检查模板内容', !!excellentConfigImportState.validatedRows.length);
    renderExcellentConfigImportWizard();
  };
  reader.onerror = () => showToast('文件读取失败，请重新上传', false);
  reader.readAsText(file, 'utf-8');
}

function parseExcellentConfigImportRows(text, fileName) {
  let matrix = [];
  if (text.includes('<Workbook')) {
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    matrix = Array.from(doc.getElementsByTagName('Row')).map(row => Array.from(row.getElementsByTagName('Cell')).map(cell => cell.textContent.trim()));
  } else {
    const delimiter = /\.tsv$/i.test(fileName) ? '\t' : ',';
    matrix = text.split(/\r?\n/).filter(Boolean).map(line => line.split(delimiter).map(cell => cell.trim()));
  }
  const { columns, entityLabel } = getExcellentImportConfig();
  const headerIndex = matrix.findIndex(row => row.map(cell => String(cell).replace(/\*/g, '').trim()).includes(entityLabel) && row.map(cell => String(cell).replace(/\*/g, '').trim()).includes('策略名称'));
  if (headerIndex < 0) return [];
  const header = matrix[headerIndex].map(cell => String(cell).replace(/\*/g, '').trim());
  return matrix.slice(headerIndex + 1).filter(row => row.some(Boolean)).map((row, index) => ({ rowNo: headerIndex + index + 2, data: Object.fromEntries(columns.map(column => [column, row[header.indexOf(column)] || ''])) }));
}

function validateExcellentConfigImportRows(rows) {
  const { entityLabel } = getExcellentImportConfig();
  return rows.map(row => { const data = row.data; const errors = []; if (!data['策略名称'].trim()) errors.push('策略名称必填'); if (!data[entityLabel].trim()) errors.push(`${entityLabel}必填`); if (!['启用', '停用'].includes(data['状态'].trim())) errors.push('状态仅支持：启用、停用'); const series = data['意向车系'].split(/[、,，;；]/).map(item => item.trim()).filter(Boolean); const invalid = series.filter(item => !seriesIntentOptions.includes(item)); if (invalid.length) errors.push(`意向车系无效：${invalid.join('、')}`); return { ...row, valid: !errors.length, errors }; });
}

function goExcellentConfigImportPreview() { excellentConfigImportState.step = 2; renderExcellentConfigImportWizard(); }
function backExcellentConfigImportUpload() { excellentConfigImportState.step = 1; renderExcellentConfigImportWizard(); }

function confirmExcellentConfigImport() {
  const { entityField } = getExcellentImportConfig();
  const key = excellentConfigImportState.key;
  const validRows = excellentConfigImportState.validatedRows.filter(row => row.valid);
  const now = new Date().toISOString().slice(0, 16).replace('T', ' ') + ' 操作人：管理员';
  validRows.forEach(row => { const data = row.data; const values = data[entityField === 'smartCode' ? 'SmartCode' : entityField === 'scProjectName' ? '大项目名' : '渠道编码'].split(/[、,，;；]/).map(item => item.trim()).filter(Boolean); strategyConfiguratorData[key].push({ id: Date.now() + row.rowNo, sortOrder: strategyConfiguratorData[key].length + 1, ruleName: data['策略名称'], [entityField]: values.join('、'), carSeries: data['意向车系'].split(/[、,，;；]/).map(item => item.trim()).filter(Boolean), status: data['状态'], createdAt: now, updatedAt: now }); });
  excellentConfigImportState.result = { success: validRows.length, failed: excellentConfigImportState.validatedRows.length - validRows.length };
  excellentConfigImportState.step = 3;
  renderStrategyConfiguratorPage(key);
  renderExcellentConfigImportWizard();
}
