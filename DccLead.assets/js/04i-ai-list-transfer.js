// Reuse the platform's three-step import interaction and SpreadsheetML download helper.
let aiListTransfer = null;
const aiListTransferConfigs = {
  low: { title: '低效对象配置', columns: ['对象维度', '关联规则ID', '维护说明', '关联策略名称', '匹配值'], required: ['对象维度', '关联规则ID', '维护说明'] },
  direct: { title: '直派名单', columns: ['直派名单类型', '标识值', '生效说明'], required: ['直派名单类型', '标识值', '生效说明'] }
};
function aiListTransferButtons(kind) {
  return `<button type="button" class="ai-strategy-btn secondary" data-ai-io="open" data-io-kind="${kind}">导入数据</button><button type="button" class="ai-strategy-btn secondary" data-ai-io="export" data-io-kind="${kind}">导出数据</button>`;
}
function aiListTransferRows(kind) {
  return kind === 'low'
    ? aiStrategyState.lowEfficiency.map(item => [item.dimension, item.strategyId, item.note, item.strategyName, item.value])
    : aiStrategyState.directLeadList.map(item => [item.type, item.value, item.note]);
}
function aiListTransferDownload(kind, template = false) {
  const config = aiListTransferConfigs[kind];
  if (!config) return;
  const rows = template ? [] : aiListTransferRows(kind);
  if (!template && !rows.length) { aiStrategyNotice('暂无可导出的数据。'); return; }
  const instructions = kind === 'low' ? [
    ['对象维度', `必填，仅支持：${aiStrategyRouteOrder.join('、')}。`],
    ['关联规则ID', '必填，填写该维度下已启用的线索分配策略规则ID；与对象维度组合唯一，重复不覆盖。'],
    ['维护说明', '必填，最多100字。'], ['关联策略名称、匹配值', '选填，仅供核对；系统以规则ID查询的策略为准。']
  ] : [['直派名单类型', '必填，当前仅支持“大项目名”。'], ['标识值', '必填，最多80字；与类型组合唯一，重复不覆盖。'], ['生效说明', '必填，最多120字。']];
  const sheets = [{ name: '导入数据', columns: config.columns.map(c => template && config.required.includes(c) ? c + '*' : c), rows }];
  if (template) {
    sheets.push({ name: '填写说明', columns: ['字段', '说明'], rows: instructions });
    if (kind === 'low') sheets.push({ name: '可关联策略参考', columns: ['对象维度', '关联规则ID', '关联策略名称', '匹配值'], rows: aiStrategyRouteOrder.flatMap(d => aiStrategyEnabledRules(d).map(r => [d, r.id, r.name, r.keyValue || ''])) });
  }
  downloadExcelWorkbookFile(`${config.title}${template ? '导入模板' : '数据'}.xls`, sheets, `${config.title}${template ? '模板' : '数据'}已下载`);
}
function aiListTransferClose() {
  aiListTransfer = null;
  document.getElementById('aiListTransferModal')?.remove();
}
function aiListTransferOpen(kind) {
  if (!aiListTransferConfigs[kind]) return;
  aiListTransferClose();
  aiListTransfer = { kind, step: 1, fileName: '', rows: [], validated: [], loading: false, error: '', result: null };
  const el = document.createElement('div');
  el.id = 'aiListTransferModal'; el.className = 'ai-strategy-modal-backdrop';
  document.body.appendChild(el);
  aiListTransferRender();
}
function aiListTransferRender() {
  const state = aiListTransfer, el = document.getElementById('aiListTransferModal');
  if (!state || !el) return;
  const config = aiListTransferConfigs[state.kind], valid = state.validated.filter(r => r.valid).length;
  let content = '';
  if (state.step === 1) content = `<div class="assignment-import-panel"><div class="assignment-import-tip">Step1 操作说明：下载模板了解格式要求 → 按模板填写 → 上传文件。必填字段为${config.required.join('、')}；上传后校验数据，仅新增通过的记录，重复数据不覆盖原记录。</div><div><button type="button" class="ai-strategy-btn secondary" data-ai-io="template">下载模板</button></div><label class="assignment-import-upload"><input type="file" accept=".xls,.xml,.csv,.tsv" data-ai-io-file><div><strong>上传文件</strong><span>支持本页模板生成的 Excel XML（.xls/.xml），或 UTF-8 CSV/TSV 文件；最多5000条。</span></div></label><div class="assignment-import-file">${state.loading ? '正在读取文件…' : aiStrategyEsc(state.fileName ? `已选择：${state.fileName}，共 ${state.rows.length} 条` : '')}</div>${state.error ? `<p class="ai-strategy-danger" role="alert">${aiStrategyEsc(state.error)}</p>` : ''}<p class="ai-strategy-muted">${state.kind === 'low' ? '模板附有可关联策略参考；只接受对应维度下已启用的规则ID。' : '直派名单类型当前仅支持大项目名。'}</p></div>`;
  if (state.step === 2) content = `<div class="assignment-import-panel"><div class="assignment-import-summary">${[['解析总数',state.validated.length],['校验通过',valid],['校验失败',state.validated.length-valid]].map(([label,n]) => `<div class="assignment-import-stat"><div class="assignment-import-stat-label">${label}</div><div class="assignment-import-stat-value">${n}</div></div>`).join('')}</div><p class="ai-strategy-muted">确认后仅导入校验通过的记录。预览最多显示100条，失败明细可下载。</p><div class="assignment-import-preview"><table class="data-table"><thead><tr><th>行号</th>${config.columns.map(c=>`<th>${c}</th>`).join('')}<th>校验结果</th></tr></thead><tbody>${state.validated.slice(0,100).map(r=>`<tr><td>${r.rowNo}</td>${config.columns.map(c=>`<td>${aiStrategyEsc(r.data[c] || '—')}</td>`).join('')}<td>${r.valid ? '<span class="assignment-import-pass">通过</span>' : `<span class="assignment-import-error">${aiStrategyEsc(r.errors.join('；'))}</span>`}</td></tr>`).join('')}</tbody></table></div></div>`;
  if (state.step === 3) content = `<div class="assignment-import-complete"><div class="import-complete-title">导入完成</div><div class="assignment-import-complete-desc">成功导入 <strong>${state.result.success}</strong> 条；失败 <strong>${state.result.failed}</strong> 条。${state.result.failed ? '失败行未写入，请下载明细修正后重新导入。' : ''}</div></div>`;
  const failed = state.step === 3 ? state.result.failed : state.validated.length-valid;
  el.innerHTML = `<div class="ai-strategy-audit-rules-modal ai-list-transfer-modal" role="dialog" aria-modal="true" aria-labelledby="aiListTransferTitle"><div class="ai-strategy-modal-header"><div class="ai-strategy-modal-title" id="aiListTransferTitle">导入${config.title}</div><button type="button" class="ai-strategy-help-close" data-ai-io="close" aria-label="关闭">×</button></div><div class="ai-strategy-modal-body"><div class="assignment-import-steps">${['上传文件','数据预览','导入完成'].map((label,i)=>`<div class="assignment-import-step ${i+1===state.step?'active':i+1<state.step?'done':''}"><div class="assignment-import-step-index">Step${i+1}</div><div class="assignment-import-step-title">${label}</div></div>`).join('')}</div>${content}</div><div class="ai-strategy-modal-footer">${failed && state.step>1 ? '<button type="button" class="ai-strategy-btn secondary" data-ai-io="errors">下载失败明细</button>' : ''}${state.step===1 ? `<button type="button" class="ai-strategy-btn secondary" data-ai-io="close">取消</button><button type="button" class="ai-strategy-btn primary" data-ai-io="next" ${!state.rows.length||state.loading?'disabled':''}>下一步</button>` : state.step===2 ? `<button type="button" class="ai-strategy-btn secondary" data-ai-io="back">上一步</button><button type="button" class="ai-strategy-btn primary" data-ai-io="confirm" ${!valid?'disabled':''}>确认导入</button>` : '<button type="button" class="ai-strategy-btn primary" data-ai-io="close">完成</button>'}</div></div>`;
}
function aiListTransferParse(text, fileName, kind) {
  let matrix = [];
  if (/\.(xls|xml)$/i.test(fileName)) {
    const doc = new DOMParser().parseFromString(text, 'text/xml');
    if (doc.querySelector('parsererror')) throw Error('文件格式无法识别，请使用本页下载的模板，或另存为 UTF-8 CSV 文件。');
    const sheet = doc.getElementsByTagNameNS('*','Worksheet')[0];
    if (!sheet) throw Error('未找到数据工作表，请使用本页模板。');
    matrix = Array.from(sheet.getElementsByTagNameNS('*','Row')).map(row => {
      const cells=[];
      for(const cell of row.getElementsByTagNameNS('*','Cell')) {
        const index=Number(cell.getAttributeNS('urn:schemas-microsoft-com:office:spreadsheet','Index'));
        if(index) while(cells.length<index-1) cells.push('');
        cells.push(cell.textContent.trim());
      }
      return cells;
    });
  } else {
    const delimiter=/\.tsv$/i.test(fileName)?'\t':',';
    let row=[], cell='', quoted=false;
    for(let i=0;i<text.length;i++) {
      const c=text[i];
      if(c==='"'&&quoted&&text[i+1]==='"') {cell+='"';i++;}
      else if(c==='"') quoted=!quoted;
      else if(c===delimiter&&!quoted) {row.push(cell.trim());cell='';}
      else if((c==='\n'||c==='\r')&&!quoted) {if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell.trim());matrix.push(row);row=[];cell='';}
      else cell+=c;
    }
    if(quoted) throw Error('CSV 引号未闭合，请检查文件格式。');
    row.push(cell.trim()); if(row.some(Boolean))matrix.push(row);
  }
  const config=aiListTransferConfigs[kind], header=(matrix.shift()||[]).map(c=>String(c).replace(/^\ufeff/,'').replace(/\*/g,'').trim());
  if(config.required.some(c=>!header.includes(c)) || new Set(header).size!==header.length) throw Error('表头缺少必填字段或存在重复列，请按模板填写。');
  const rows=matrix.map((r,i)=>({rowNo:i+2,data:Object.fromEntries(config.columns.map(c=>[c,String(r[header.indexOf(c)]||'').trim()]))})).filter(r=>Object.values(r.data).some(Boolean));
  if(rows.length>5000)throw Error('单次最多导入5000条，请拆分文件后上传。');
  if(!rows.length)throw Error('文件没有可导入的数据，请填写模板后上传。');
  return rows;
}
function aiListTransferValidate(kind, rows) {
  const seen=new Set(), config=aiListTransferConfigs[kind];
  return rows.map(row=>{
    const d=row.data, errors=[];
    config.required.forEach(c=>{if(!d[c])errors.push(`${c}必填`);});
    let item=null, key;
    if(kind==='low') {
      const dimension=d['对象维度'], id=d['关联规则ID']; key=JSON.stringify([dimension,id]);
      if(!aiStrategyRouteOrder.includes(dimension))errors.push('对象维度无效');
      const rule=aiStrategyEnabledRules(dimension).find(r=>r.id===id);
      if(!rule)errors.push('该维度下规则不存在或未启用');
      if(d['维护说明'].length>100)errors.push('维护说明最多100字');
      if(aiStrategyState.lowEfficiency.some(r=>r.dimension===dimension&&r.strategyId===id))errors.push('该策略已在低效清单中');
      if(rule)item={dimension,strategyId:id,strategyName:rule.name,strategyVersion:rule.updatedAt||'当前版本',condition:rule.condition,value:rule.keyValue||rule.condition||'—',note:d['维护说明']};
    } else {
      key=JSON.stringify([d['直派名单类型'],d['标识值']]);
      if(d['直派名单类型']!=='大项目名')errors.push('类型仅支持大项目名');
      if(d['标识值'].length>80)errors.push('标识值最多80字');
      if(d['生效说明'].length>120)errors.push('生效说明最多120字');
      if(aiStrategyState.directLeadList.some(r=>r.type===d['直派名单类型']&&r.value===d['标识值']))errors.push('该直派标识已存在');
      item={type:d['直派名单类型'],value:d['标识值'],note:d['生效说明']};
    }
    if(seen.has(key))errors.push('文件内重复记录');
    seen.add(key);
    return {...row,item,valid:!errors.length,errors};
  });
}
function aiListTransferRead(file) {
  const state=aiListTransfer;
  if(!file||!state)return;
  state.rows=[];state.validated=[];state.error='';state.fileName=file.name;state.loading=false;state.readToken=null;
  if(!/\.(xls|xml|csv|tsv)$/i.test(file.name)||file.size>10*1024*1024){state.error='请上传10MB以内的模板 .xls/.xml 或 UTF-8 CSV/TSV 文件。';aiListTransferRender();return;}
  state.loading=true; const token={};state.readToken=token;aiListTransferRender();
  const reader=new FileReader();
  reader.onload=e=>{
    if(aiListTransfer!==state||state.readToken!==token)return;
    try {state.rows=aiListTransferParse(String(e.target.result||''),file.name,state.kind);state.validated=aiListTransferValidate(state.kind,state.rows);}catch(error){state.error=error.message;}
    state.loading=false;aiListTransferRender();
  };
  reader.onerror=()=>{if(aiListTransfer!==state||state.readToken!==token)return;state.loading=false;state.error='文件读取失败，请重新上传。';aiListTransferRender();};
  reader.readAsText(file,'utf-8');
}
function aiListTransferConfirm() {
  const state=aiListTransfer;
  if(!state||state.step!==2)return;
  // Revalidate against current rules and lists immediately before writing.
  const checked=aiListTransferValidate(state.kind,state.validated.filter(r=>r.valid));
  const failures=[...state.validated.filter(r=>!r.valid),...checked.filter(r=>!r.valid)];
  const valid=checked.filter(r=>r.valid);
  const target=state.kind==='low'?aiStrategyState.lowEfficiency:aiStrategyState.directLeadList;
  valid.forEach(r=>target.push(r.item));
  state.result={success:valid.length,failed:failures.length,failures};state.step=3;
  if(valid.length)aiStrategyLog(`导入${aiListTransferConfigs[state.kind].title}：成功${valid.length}条，失败${failures.length}条`);
  renderAiStrategyWorkbench();aiListTransferRender();
}
function aiListTransferExportSuggestions() {
  const draft=aiStrategySelectedDraft();
  if(!draft){aiStrategyNotice('暂无可导出的策略建议。');return;}
  const records=aiStrategyFilteredDraftRows(draft,aiStrategyState.draftFilters || {});
  if(!records.length){aiStrategyNotice('当前筛选条件下没有可导出的策略建议。');return;}
  const rows=records.map(({row})=>{
    const hasSuggestion=row.reviewStatus!=='无需审核' && row.recommended!=='—';
    if(hasSuggestion)aiExecutionEnsure(row);
    const result=hasSuggestion?aiExecutionResult(row):null;
    return [draft.id,aiStrategyDraftDate(draft),row.dimension,row.value,row.ruleId || '',row.sample,aiStrategyCurrentRuleTemplate(row),row.agentRecommended || row.recommended || '—',result ? (result.error || aiExecutionSummary(result)) : (row.type === '直派名单命中' ? '按直派路径执行' : '沿用关联策略'),hasSuggestion ? (row.execution?.scheme?.name || '全人工执行') : '—',aiStrategyAgentReason(row),row.reviewStatus || '待审核',hasSuggestion ? (row.receivedAt || '未记录') : '—',row.review?.reviewer || '—',row.review?.reviewedAt || '—'];
  });
  downloadExcelWorkbookFile(`线索分派策略建议-${draft.id}.xls`,[{name:'策略建议',columns:['建议批次号','业务日期','规则维度','匹配值','规则ID','样本量','当前比例（规则模板）','Agent建议比例','执行分配方案','引用预设方案','建议说明','审核/发布状态','接收时间','审核人','审核时间'],rows}],`已导出当前筛选结果，共${rows.length}条`);
}
document.addEventListener('change',event=>{if(event.target.matches?.('[data-ai-io-file]'))aiListTransferRead(event.target.files?.[0]);});
document.addEventListener('click',event=>{
  const node=event.target.closest('[data-ai-io]');if(!node||node.disabled)return;
  const action=node.dataset.aiIo, kind=node.dataset.ioKind;event.preventDefault();
  if(action==='open')return aiListTransferOpen(kind);
  if(action==='export')return aiListTransferDownload(kind);
  if(action==='export-suggestions')return aiListTransferExportSuggestions();
  if(action==='close')return aiListTransferClose();
  const state=aiListTransfer;if(!state)return;
  if(action==='template')return aiListTransferDownload(state.kind,true);
  if(action==='next'&&state.rows.length&&!state.loading){state.validated=aiListTransferValidate(state.kind,state.rows);state.step=2;}
  if(action==='back')state.step=1;
  if(action==='confirm')return aiListTransferConfirm();
  if(action==='errors') {
    const config=aiListTransferConfigs[state.kind], failed=state.step===3?state.result.failures:state.validated.filter(r=>!r.valid);
    downloadExcelWorkbookFile(`${config.title}导入失败明细.xls`,[{name:'失败明细',columns:['行号',...config.columns,'失败原因'],rows:failed.map(r=>[r.rowNo,...config.columns.map(c=>r.data[c]),r.errors.join('；')])}],'失败明细已下载');return;
  }
  aiListTransferRender();
});
