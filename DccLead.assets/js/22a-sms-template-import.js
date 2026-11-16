/* 公共短信模板批量维护：CSV 校验、差异预览、整批确认。仅更新当前原型会话。 */
var smsImportState = { rows: [], snapshot: '', generation: 0, busy: false };
var smsImportHeaders = ['模板编号', '模板名称', '模板类型', '模板内容', '状态'];
function mountSmsImport() {
  var page = document.getElementById('smsTemplatePage');
  var add = page && page.querySelector('.section-header .btn-add');
  if (!add || page.querySelector('.sms-import-toolbar')) return;
  var actions = document.createElement('div'); actions.className = 'sms-import-toolbar';
  add.parentNode.insertBefore(actions, add); actions.appendChild(add);
  var button = document.createElement('button'); button.type = 'button'; button.className = 'btn-secondary'; button.textContent = '导入数据'; button.onclick = openSmsImport;
  actions.insertBefore(button, add);
  var exportButton = document.createElement('button'); exportButton.type = 'button'; exportButton.className = 'btn-secondary'; exportButton.textContent = '导出数据'; exportButton.onclick = exportSmsTemplateData;
  actions.insertBefore(exportButton, add);
  if (document.getElementById('smsImportModal')) return;
  document.body.insertAdjacentHTML('beforeend', '<div class="modal-overlay" id="smsImportModal"><div class="modal assignment-import-modal" role="dialog" aria-modal="true" aria-labelledby="smsImportTitle"><div class="modal-header"><div class="modal-title" id="smsImportTitle">导入公共短信模板</div><button type="button" class="modal-close" aria-label="关闭批量导入" onclick="closeSmsImport()">✕</button></div><div class="modal-body" id="smsImportBody"></div><div class="modal-footer" id="smsImportFooter"></div></div></div>');
}
function exportSmsTemplateData() {
  var rows=getFilteredSmsTemplates();
  if(!rows.length){showToast('暂无符合条件的短信模板可导出',false);return;}
  downloadExcelWorkbookFile('公共短信模板_'+new Date().toISOString().slice(0,10)+'.xls',[
    {name:'公共短信模板',columns:smsImportHeaders.concat(['创建时间']),rows:rows.map(function(t){return [t.id,t.name,t.type,t.content,t.status,t.createTime];})}
  ],'已导出 '+rows.length+' 条短信模板');
}
function openSmsImport() {
  smsImportState.generation++; smsImportState.rows = []; smsImportState.snapshot = ''; smsImportState.busy = false;
  smsImportState.step=1; smsImportState.fileName=''; smsImportState.feedback=''; smsImportState.result=null;
  renderSmsImportWizard();
  document.getElementById('smsImportModal').classList.add('show');
}
function closeSmsImport() { smsImportState.generation++; smsImportState.rows = []; document.getElementById('smsImportModal').classList.remove('show'); }
function renderSmsImportWizard() {
  var state=smsImportState, esc=escapeSmsHtml;
  var steps='<div class="assignment-import-steps">'+['上传文件','数据预览','导入完成'].map(function(label,i){return '<div class="assignment-import-step '+(i+1===state.step?'active':i+1<state.step?'done':'')+'"><div class="assignment-import-step-index">Step'+(i+1)+'</div><div class="assignment-import-step-title">'+label+'</div></div>';}).join('')+'</div>';
  var body='',footer='';
  if(state.step===1) {
    body='<div class="assignment-import-panel"><div class="assignment-import-tip">Step1 操作说明：下载模板了解格式要求 → 按模板填写 → 上传Excel文件。当前导入对象：公共短信模板；模板已包含必填字段列，上传后会校验数据格式与枚举值合法性。</div><div class="action-btns"><button type="button" class="btn-secondary" onclick="downloadSmsImportTemplate()">下载模板</button></div><label class="assignment-import-upload"><input id="smsImportFile" type="file" aria-label="上传短信模板文件" accept=".xls,.xml,.csv,.tsv" onchange="readSmsImportFile(this.files[0])"><div><strong>上传Excel文件</strong><span>支持使用模板下载的 .xls 文件，也兼容 CSV/TSV 文本文件</span></div></label><div class="assignment-import-file">'+(state.fileName?'已选择：'+esc(state.fileName):'')+'</div><div id="smsImportFeedback" class="sms-import-feedback" role="status" aria-live="polite">'+esc(state.feedback||'')+'</div></div>';
    footer='<button type="button" class="btn-cancel" onclick="closeSmsImport()">取消</button><button type="button" class="btn-save" id="smsImportNext" '+(state.rows.length?'':'disabled')+' onclick="nextSmsImportStep()">下一步</button>';
  } else if(state.step===2) {
    body='<div class="assignment-import-panel"><div class="assignment-import-tip">Step2 操作说明：核对新增、更新及修改前后内容。名称、类型、内容、状态必填；类型、状态及变量沿用单条维护规则。存在错误时，请返回上一步修正文件并重新上传，整批校验通过后才能导入。</div><div id="smsImportStats" class="assignment-import-summary"></div><div id="smsImportFeedback" class="sms-import-feedback" role="status" aria-live="polite"></div><div id="smsImportPreview"></div></div>';
    footer='<button type="button" class="btn-cancel" onclick="backSmsImportStep()">上一步</button><button type="button" class="btn-save" id="smsImportConfirm" disabled onclick="confirmSmsImport()">确认导入</button>';
  } else {
    var result=state.result;
    body='<div class="assignment-import-complete"><div class="assignment-import-complete-title">导入完成</div><div class="assignment-import-complete-desc">新增 '+result.added+' 条，更新 '+result.updated+' 条，无变化 '+result.unchanged+' 条。模板列表已更新。</div><div class="assignment-import-summary">'+[['新增',result.added],['更新',result.updated],['无变化',result.unchanged]].map(function(item){return '<div class="assignment-import-stat"><div class="assignment-import-stat-label">'+item[0]+'</div><div class="assignment-import-stat-value">'+item[1]+'</div></div>';}).join('')+'</div></div>';
    footer='<button type="button" class="btn-save" onclick="closeSmsImport()">完成</button>';
  }
  document.getElementById('smsImportBody').innerHTML=steps+body;
  document.getElementById('smsImportFooter').innerHTML=footer;
  if(state.step===2)renderSmsImportPreview(state.rows);
}
function nextSmsImportStep() { if(smsImportState.rows.length){smsImportState.step=2;renderSmsImportWizard();} }
function backSmsImportStep() { smsImportState.step=1;renderSmsImportWizard(); }
function downloadSmsImportTemplate() {
  downloadExcelWorkbookFile('公共短信模板导入模板.xls', [
    {name:'公共短信模板',columns:smsImportHeaders,rows:smsTemplateData.map(function(t){return [t.id,t.name,t.type,t.content,t.status];})},
    {name:'填写说明',columns:['字段','是否必填','填写说明'],rows:[
      ['模板编号','选填','已有模板按编号更新；新增可留空。编号留空时，同名更新、未匹配新增。'],
      ['模板名称','必填','名称唯一，文件内不可重复。下载文件包含现有模板，可直接修改或追加新行；删除文件行不会删除已有模板。'],
      ['模板类型','必填','提醒短信、回访短信、营销短信、关怀短信'],
      ['模板内容','必填','支持变量：{name}、{time}、{address}、{agent}、{date}、{event}。'],
      ['状态','必填','启用、停用。公共模板由坐席共用，导入不触发短信发送。']
    ]}
  ],'公共短信模板导入模板已下载');
}
function parseSmsImportWorkbook(text) {
  var doc=new DOMParser().parseFromString(text,'text/xml');
  if(doc.querySelector('parsererror'))throw new Error('Excel 文件格式有误，请使用下载的 .xls 模板文件。');
  var sheet=doc.getElementsByTagNameNS('*','Worksheet')[0];
  if(!sheet)throw new Error('未找到工作表，请使用下载模板。');
  return Array.from(sheet.getElementsByTagNameNS('*','Row')).map(function(row){
    var values=[];
    Array.from(row.getElementsByTagNameNS('*','Cell')).forEach(function(cell){
      var index=Number(cell.getAttributeNS('urn:schemas-microsoft-com:office:spreadsheet','Index'));
      if(index){while(values.length<index-1)values.push('');}
      values.push(cell.textContent);
    });
    return values;
  }).filter(function(row){return row.some(function(v){return v.trim()!=='';});});
}
// CSV quoted fields support commas, doubled quotes and multiline messages.
function parseSmsImportCsv(text, delimiter) {
  delimiter=delimiter||',';
  text = text.replace(/^\ufeff/,'');
  var rows=[], row=[], value='', quoted=false, afterQuote=false;
  function cell() { row.push(value); value=''; afterQuote=false; }
  function line() { cell(); if(row.some(function(v){return v.trim()!=='';})) rows.push(row); row=[]; }
  for(var i=0;i<text.length;i++) {
    var c=text[i];
    if(quoted) { if(c==='"') { if(text[i+1]==='"'){value+='"';i++;}else{quoted=false;afterQuote=true;} } else value+=c; }
    else if(c===delimiter) cell();
    else if(c==='\n'||c==='\r') { if(c==='\r'&&text[i+1]==='\n')i++; line(); }
    else if(c==='"' && value==='' && !afterQuote) quoted=true;
    else { if(afterQuote || c==='"') throw new Error('CSV 引号格式有误，请使用下载模板并保存为 CSV UTF-8。'); value+=c; }
  }
  if(quoted) throw new Error('CSV 存在未闭合的引号，请检查文件。');
  if(value!==''||row.length||afterQuote) line();
  return rows;
}
function validateSmsImport(text, templates, fileName) {
  var csv=/\.(xls|xml)$/i.test(fileName||'') ? parseSmsImportWorkbook(text) : parseSmsImportCsv(text,/\.tsv$/i.test(fileName||'')?'\t':',');
  if(!csv.length) throw new Error('文件为空，请填写模板后重新上传。');
  var header=csv.shift().map(function(v){return v.trim();});
  if(header.length<smsImportHeaders.length || smsImportHeaders.some(function(v){return header.indexOf(v)<0;}) || header.some(function(v,i){return header.indexOf(v)!==i || smsImportHeaders.concat(['创建时间']).indexOf(v)<0;})) throw new Error('表头必须包含：'+smsImportHeaders.join('、')+'。请使用下载模板。');
  if(!csv.length) throw new Error('文件只有表头，请至少填写一条模板。');
  var results=csv.map(function(cells,index){
    var item={line:index+2,errors:[],old:null,action:'新增'};
    smsImportHeaders.forEach(function(h){item[h]=String(cells[header.indexOf(h)]||'').trim();});
    if(cells.length!==header.length)item.errors.push('列数与表头不一致');
    ['模板名称','模板类型','模板内容','状态'].forEach(function(h){if(!item[h])item.errors.push(h+'不能为空');});
    if(item['模板类型'] && ['提醒短信','回访短信','营销短信','关怀短信'].indexOf(item['模板类型'])<0)item.errors.push('模板类型无效');
    if(item['状态'] && ['启用','停用'].indexOf(item['状态'])<0)item.errors.push('状态只能为启用或停用');
    var id=item['模板编号'];
    if(id) {
      if(!/^\d+$/.test(id))item.errors.push('模板编号须为已有编号');
      item.old=templates.find(function(t){return String(t.id)===id;})||null;
      if(!item.old)item.errors.push('模板编号不存在；新增模板请留空编号');
    } else item.old=templates.find(function(t){return t.name.trim().toLowerCase()===item['模板名称'].toLowerCase();})||null;
    if(item.old)item.action='更新';
    if(templates.some(function(t){return (!item.old||t.id!==item.old.id)&&t.name.trim().toLowerCase()===item['模板名称'].toLowerCase();}))item.errors.push('名称与其他模板重复');
    var allowed=['name','time','address','agent','date','event'];
    var content=item['模板内容'];
    content.replace(/\{([^{}]+)\}/g,function(match,v){if(allowed.indexOf(v)<0)item.errors.push('不支持的变量：'+match);return match;});
    if(item.old && item.old.name===item['模板名称'] && item.old.type===item['模板类型'] && item.old.content===content && item.old.status===item['状态'])item.action='不变';
    return item;
  });
  results.forEach(function(item){
    if(results.some(function(other){return other!==item && item['模板名称'] && other['模板名称'].toLowerCase()===item['模板名称'].toLowerCase();}))item.errors.push('文件内模板名称重复');
    if(item.old && results.some(function(other){return other!==item && other.old && other.old.id===item.old.id;}))item.errors.push('同一模板在文件中出现多次');
  });
  return results;
}
async function readSmsImportFile(file) {
  var token=++smsImportState.generation;
  smsImportState.rows=[]; smsImportState.snapshot=''; smsImportState.fileName=file?file.name:'';
  var feedback=document.getElementById('smsImportFeedback');
  document.getElementById('smsImportNext').disabled=true;
  function report(message){smsImportState.feedback=message;feedback.textContent=message;}
  if(!file){report('请选择导入文件。');return;}
  if(!/\.(xls|xml|csv|tsv)$/i.test(file.name)){report('请使用下载的 .xls 模板，也可上传 CSV/TSV 文本文件。');return;}
  report('正在读取并校验文件…');
  try {
    var text=await file.text();
    if(token!==smsImportState.generation)return;
    if(text.indexOf('\ufffd')>=0)throw new Error('文件编码无法识别，请用 CSV UTF-8 格式重新保存。');
    var rows=validateSmsImport(text,smsTemplateData,file.name);
    smsImportState.rows=rows; smsImportState.snapshot=JSON.stringify(smsTemplateData);
    var invalid=rows.filter(function(r){return r.errors.length;}).length;
    smsImportState.feedback='已解析 '+rows.length+' 条，校验失败 '+invalid+' 条，点击“下一步”查看明细。';
    renderSmsImportWizard();
  } catch(error) {if(token===smsImportState.generation)report(error.message||'读取文件失败，请重新选择文件。');}
}
function renderSmsImportPreview(rows) {
  var count={新增:0,更新:0,不变:0}, invalid=0;
  rows.forEach(function(r){if(r.errors.length)invalid++;else count[r.action]++;});
  document.getElementById('smsImportFeedback').textContent='共 '+rows.length+' 条：新增 '+count['新增']+' 条，更新 '+count['更新']+' 条，无变化 '+count['不变']+' 条，错误 '+invalid+' 条。'+(invalid?'请修正错误后重新上传，本次不会写入任何模板。':'请核对下方内容，确认后整批生效。');
  var stats=document.getElementById('smsImportStats');
  if(stats)stats.innerHTML=[['解析总数',rows.length],['校验通过',rows.length-invalid],['校验失败',invalid]].map(function(item){return '<div class="assignment-import-stat"><div class="assignment-import-stat-label">'+item[0]+'</div><div class="assignment-import-stat-value">'+item[1]+'</div></div>';}).join('');
  var esc=escapeSmsHtml;
  function values(t){return esc(t.name)+'｜'+esc(t.type)+'｜'+esc(t.status)+'<div class="sms-import-content">'+esc(t.content)+'</div>';}
  document.getElementById('smsImportPreview').innerHTML='<div class="assignment-import-preview sms-import-table"><table><thead><tr><th>数据行</th><th>处理结果</th><th>原模板</th><th>导入后模板</th></tr></thead><tbody>'+rows.map(function(r){return '<tr><td>'+r.line+'</td><td class="'+(r.errors.length?'sms-import-error':'')+'">'+(r.errors.length?esc(r.errors.join('；')):r.action)+'</td><td>'+(r.old?values(r.old):'—')+'</td><td>'+values({name:r['模板名称'],type:r['模板类型'],status:r['状态'],content:r['模板内容']})+'</td></tr>';}).join('')+'</tbody></table></div>';
  document.getElementById('smsImportConfirm').disabled=!!invalid || !(count['新增']+count['更新']);
}
function confirmSmsImport() {
  var state=smsImportState;
  if(state.busy||!state.rows.length||state.rows.some(function(r){return r.errors.length;}))return;
  if(JSON.stringify(smsTemplateData)!==state.snapshot){document.getElementById('smsImportFeedback').textContent='模板数据已变化，请重新上传文件，校验最新内容后再确认。';document.getElementById('smsImportConfirm').disabled=true;return;}
  state.busy=true; document.getElementById('smsImportConfirm').disabled=true;
  var max=smsTemplateData.reduce(function(n,t){return Math.max(n,Number(t.id));},0), added=0, updated=0;
  var next=smsTemplateData.map(function(t){return Object.assign({},t);});
  state.rows.forEach(function(r){
    if(r.action==='不变')return;
    var target=r.old?next.find(function(t){return t.id===r.old.id;}):{id:++max,createTime:new Date().toISOString().slice(0,10)};
    target.name=r['模板名称'];target.type=r['模板类型'];target.content=r['模板内容'];target.status=r['状态'];
    if(r.old)updated++;else{next.push(target);added++;}
  });
  smsTemplateData.splice.apply(smsTemplateData,[0,smsTemplateData.length].concat(next));
  state.result={added:added,updated:updated,unchanged:state.rows.filter(function(r){return r.action==='不变';}).length};
  state.rows=[]; state.step=3; state.busy=false;
  renderSmsImportWizard(); refreshSmsTemplateSummary(); resetSmsFilter();
  showToast('导入完成：新增 '+added+' 条，更新 '+updated+' 条',true);
}
