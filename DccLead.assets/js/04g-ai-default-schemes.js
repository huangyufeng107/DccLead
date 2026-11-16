// AI 分配默认配置：保存在当前页面，由建议审核读取配置快照。
const aiDefaultsState = {
  selected: 'ADS-001', editor: null, preview: 40, sourceMode: 'preset', pendingSourceMode: null, presetsExpanded: false,
  items: [
    { id: 'ADS-001', name: '冷线索分层分配', mode: 'ratio', isDefault: true, type: '科大讯飞-冷线索', bands: [
      { min: 1, max: 10, parts: [{ type: '一知-冷线索', percent: 100 }] },
      { min: 11, max: 100, parts: [{ type: '一知-冷线索', percent: 20 }, { type: '科大讯飞-冷线索', percent: 80 }] }
    ] },
    { id: 'ADS-002', name: '科大讯飞统一承接', mode: 'single', isDefault: false, type: '科大讯飞-冷线索', bands: [{ min: 1, max: 100, parts: [{ type: '科大讯飞-冷线索', percent: 100 }] }] }
  ]
};

function aiDefaultsClone(value) { return JSON.parse(JSON.stringify(value)); }
function aiDefaultsTypes(value) { return aiStrategyAiTypes.map(type => `<option ${type === value ? 'selected' : ''}>${aiStrategyEsc(type)}</option>`).join(''); }
function aiDefaultsValidate(item) {
  if (!item.name.trim()) return '请填写方案名称。';
  if (item.mode === 'single') return aiStrategyAiTypes.includes(item.type) ? '' : '请选择可用的 AI 外呼类型。';
  const bands = [...item.bands].sort((a, b) => a.min - b.min);
  let next = 1;
  for (const band of bands) {
    if (!Number.isInteger(band.min) || !Number.isInteger(band.max) || band.min !== next || band.max < band.min || band.max > 100) return 'AI 占比区间需连续覆盖 1–100%，不能重叠或留空；区间使用整数。';
    if (!band.parts.length || band.parts.some(part => !aiStrategyAiTypes.includes(part.type) || !(item.agentInline ? Number.isFinite(part.percent) : Number.isInteger(part.percent)) || part.percent <= 0 || part.percent > 100)) return '每个 AI 类型的内部比例需填写 1–100 的整数。';
    if (new Set(band.parts.map(part => part.type)).size !== band.parts.length) return '同一区间不能重复选择相同的 AI 外呼类型。';
    if (band.parts.reduce((sum, part) => sum + part.percent, 0) !== 100) return '每个区间内的 AI 内部比例合计必须为 100%。';
    next = band.max + 1;
  }
  return next === 101 ? '' : '请补齐 AI 占比 1–100% 的全部区间。';
}

function aiDefaultsCalculate(item, ai) {
  if (!Number.isInteger(ai) || ai < 0 || ai > 100) return { error: '请输入 0–100 的整数。' };
  if (ai === 0) return { band: null, parts: [{ type: '人工外呼', percent: 100 }] };
  const error = aiDefaultsValidate(item);
  if (error) return { error };
  const band = item.mode === 'ratio' ? item.bands.find(row => ai >= row.min && ai <= row.max) : null;
  const source = band ? band.parts : [{ type: item.type, percent: 100 }];
  // 以 0.01% 为单位按最大余数补齐，保证最终总比例准确等于 100%。
  const units = source.map(part => ({ type: part.type, exact: ai * part.percent, units: Math.floor(ai * part.percent) }));
  let remaining = ai * 100 - units.reduce((sum, part) => sum + part.units, 0);
  [...units].sort((a, b) => (b.exact - b.units) - (a.exact - a.units)).forEach(part => { if (remaining > 0) { part.units++; remaining--; } });
  const parts = units.map(part => ({ type: part.type, percent: part.units / 100 }));
  if (ai < 100) parts.unshift({ type: '人工外呼', percent: 100 - ai });
  return { band, parts };
}

function aiDefaultsPreview() {
  const item = aiDefaultsState.editor || aiDefaultsState.items.find(row => row.id === aiDefaultsState.selected);
  if (!item) return '';
  const result = aiDefaultsCalculate(item, aiDefaultsState.preview);
  if (result.error) return `<div class="aid-preview-error">${aiStrategyEsc(result.error)}</div>`;
  const colors = ['#2563eb', '#14b8a6', '#8b5cf6', '#f59e0b'];
  return `<div class="aid-match">${aiDefaultsState.preview === 0 ? '全人工，无需分配 AI 份额' : result.band ? `命中 AI 占比 ${result.band.min}–${result.band.max}% 区间` : 'AI 份额全部交给指定类型'}</div>
    <div class="aid-bar">${result.parts.filter(part => part.percent > 0).map((part, index) => `<span style="width:${part.percent}%;background:${colors[index % colors.length]}" title="${aiStrategyEsc(part.type)} ${part.percent}%"></span>`).join('')}</div>
    ${result.parts.map((part, index) => `<div class="aid-result"><span><i style="background:${colors[index % colors.length]}"></i>${aiStrategyEsc(part.type)}</span><strong>${part.percent}%</strong></div>`).join('')}
    <div class="aid-total">全部线索合计 <strong>100%</strong></div><p class="aid-caption">内部比例以 AI 份额为 100%；换算后与人工合计为全部线索的 100%。此处仅试算，不修改建议或现行策略。</p>`;
}

function aiDefaultsRender() {
  const state = aiDefaultsState;
  const item = state.editor || state.items.find(row => row.id === state.selected);
  const editing = !!state.editor;
  const active = state.items.find(row => row.isDefault);
  const selectedSource = state.pendingSourceMode || state.sourceMode;
  const sourceDirty = selectedSource !== state.sourceMode;
  return `<section class="ai-strategy-card aid-page"><div class="ai-strategy-section-head"><div><h3>AI 分配默认方案</h3><p>为执行分配方案预设 AI 份额的分配方式，按执行方案中的 AI 占比匹配区间，再换算各外呼类型的最终比例。</p></div>${selectedSource==='preset'?'<button type="button" class="ai-strategy-btn primary" data-aid-action="new">＋ 新增方案</button>':''}</div>
    <section class="aid-source-control" aria-label="执行方案来源"><h4>执行方案来源</h4><div class="aid-mode">${[['preset','默认预设补齐','Agent 提供人工／AI 总比例，默认预设补齐 AI 类型及内部比例。'],['agent','Agent 完整方案','直接采用 Agent 返回的完整分配内容，不自动读取默认预设。']].map(([mode,title,hint])=>`<button type="button" class="${selectedSource===mode?'active':''}" data-aid-action="source-mode" data-aid-source="${mode}" aria-pressed="${selectedSource===mode}" ${editing?'disabled':''}><b>${title}${mode==='preset'?'（默认）':''}</b><small>${hint}</small></button>`).join('')}</div><p class="aid-caption">当前生效：<strong>${state.sourceMode==='agent'?'Agent 完整方案':'默认预设补齐'}</strong>${sourceDirty?' · 未保存，仍按当前生效模式接收建议。':' · 选择其他模式后，需保存并确认才生效。'}</p>${sourceDirty?'<div class="aid-source-actions"><button type="button" class="ai-strategy-btn" data-aid-action="source-cancel">取消修改</button><button type="button" class="ai-strategy-btn primary" data-aid-action="source-save">保存并生效</button></div>':''}<p class="aid-caption">保存后仅影响新接收的建议；已有建议和已发布策略保留原方案。Agent 明细缺失或校验失败时需人工补齐，不能直接发布。</p></section>
    ${selectedSource==='agent'?`<div class="aid-banner"><span>${sourceDirty?'已选择 Agent 完整方案，保存后不再自动引用默认预设。':'当前使用 Agent 完整方案，默认预设不参与自动生成。'}</span><button type="button" class="ai-strategy-text-btn" data-aid-action="toggle-presets">${state.presetsExpanded?'收起预设配置':'展开维护预设'}</button></div>`:''}
    <div ${selectedSource==='agent'&&!state.presetsExpanded?'hidden':''}>
    ${selectedSource==='agent'?'<div class="aid-source-actions"><button type="button" class="ai-strategy-btn primary" data-aid-action="new">＋ 新增预设</button></div>':''}
    <div class="aid-banner"><span>当前默认预设 <strong>${aiStrategyEsc(active?.name || '未设置')}</strong></span><span class="aid-caption">${state.sourceMode==='agent'?'备用预设 · 当前不自动引用':'新建议默认引用 · 已有建议保留原配置'}</span></div>
    <div class="aid-layout"><aside class="aid-sidebar"><div class="aid-side-title">方案列表 <span>${state.items.length} 套</span></div>${state.items.map(row => `<button type="button" class="aid-scheme ${row.id === state.selected ? 'active' : ''}" data-aid-action="select" data-aid-id="${row.id}" ${editing ? 'disabled' : ''}><span><strong>${aiStrategyEsc(row.name)}</strong>${row.isDefault ? '<em>默认</em>' : ''}</span><small>${row.mode === 'ratio' ? `按比例 · ${row.bands.length} 个区间` : '不按比例 · 单一 AI 类型'}</small></button>`).join('')}<p class="aid-caption aid-side-note">可保存多套预设，指定一套作为默认。仅在“默认预设补齐”模式下，新建议自动引用；Agent 模式不自动读取预设。</p></aside>
    <div class="aid-main"><div class="aid-detail-head"><div><h3>${editing ? (item.id ? '编辑方案' : '新增方案') : aiStrategyEsc(item.name)}</h3><span class="aid-caption">${editing ? '配置 AI 份额的分配方式；按比例时，每个区间的内部比例合计为 100%。' : '查看预设配置，或在右侧输入执行 AI 占比试算。'}</span></div><div class="aid-actions">${editing ? '<button class="ai-strategy-btn" data-aid-action="cancel">取消</button><button class="ai-strategy-btn primary" data-aid-action="save">保存方案</button>' : `${!item.isDefault ? '<button class="ai-strategy-btn secondary" data-aid-action="default">设为默认</button>' : ''}<button class="ai-strategy-btn" data-aid-action="edit">编辑</button>`}</div></div>
    <div class="aid-content"><div class="aid-config"><label class="aid-label">方案名称${editing ? `<input data-aid-field="name" maxlength="40" value="${aiStrategyEsc(item.name)}" placeholder="例如：冷线索分层分配">` : `<strong>${aiStrategyEsc(item.name)}</strong>`}</label>
    <div class="aid-label">AI 份额分配方式</div><div class="aid-mode">${[['single', '不按比例', 'AI 份额全部给一个外呼类型'], ['ratio', '按比例', '匹配执行 AI 占比，按内部比例分配']].map(([mode, title, hint]) => `<button type="button" class="${item.mode === mode ? 'active' : ''}" data-aid-action="mode" data-aid-mode="${mode}" ${editing ? '' : 'disabled'}><b>${title}</b><small>${hint}</small></button>`).join('')}</div>
    ${item.mode === 'single' ? `<div class="aid-band"><label class="aid-label">AI 外呼类型${editing ? `<select data-aid-field="type">${aiDefaultsTypes(item.type)}</select>` : `<strong>${aiStrategyEsc(item.type)}</strong>`}</label><p class="aid-caption">AI 份额全部交给此类型；人工占比以本条执行分配方案为准。</p></div>` : `<div class="aid-band-heading"><strong>执行 AI 占比区间</strong><span class="aid-caption">区间范围 1–100% · 首尾均包含</span></div>${item.bands.map((band, b) => `<section class="aid-band"><header><div>${editing ? `<input aria-label="区间${b + 1}下限" type="number" min="1" max="100" data-aid-band="${b}" data-aid-field="min" value="${band.min}"><span>至</span><input aria-label="区间${b + 1}上限" type="number" min="1" max="100" data-aid-band="${b}" data-aid-field="max" value="${band.max}"><span>%</span>` : `<b>AI 占比 ${band.min}–${band.max}%</b>`}</div>${editing ? `<button class="ai-strategy-text-btn" data-aid-action="remove-band" data-aid-band="${b}">删除区间</button>` : '<span class="aid-caption">AI 内部比例</span>'}</header>${band.parts.map((part, p) => `<div class="aid-part">${editing ? `<select aria-label="AI 外呼类型" data-aid-band="${b}" data-aid-part="${p}" data-aid-field="part-type">${aiDefaultsTypes(part.type)}</select><div class="aid-percent"><input aria-label="AI 内部比例" type="number" min="1" max="100" data-aid-band="${b}" data-aid-part="${p}" data-aid-field="percent" value="${part.percent}"><span>%</span></div><button aria-label="移除 AI 类型" class="aid-remove" data-aid-action="remove-part" data-aid-band="${b}" data-aid-part="${p}">×</button>` : `<span>${aiStrategyEsc(part.type)}</span><strong>${part.percent}%</strong>`}</div>`).join('')}<footer>${editing ? `<button class="ai-strategy-text-btn" data-aid-action="add-part" data-aid-band="${b}" ${band.parts.length >= aiStrategyAiTypes.length ? 'disabled' : ''}>＋ 添加 AI 类型</button>` : '<span>AI 内部比例合计</span>'}<span class="${band.parts.reduce((sum, part) => sum + part.percent, 0) === 100 ? 'aid-valid' : 'aid-invalid'}" data-aid-sum="${b}">合计 ${band.parts.reduce((sum, part) => sum + part.percent, 0)}%</span></footer></section>`).join('')}${editing ? '<button class="ai-strategy-btn secondary aid-add-band" data-aid-action="add-band">＋ 添加比例区间</button>' : ''}`}
    <div id="aidError" class="aid-preview-error" role="alert"></div>${editing ? `<label class="aid-default-check"><input type="checkbox" data-aid-field="isDefault" ${item.isDefault ? 'checked' : ''}>保存后设为默认方案</label>` : ''}</div>
    <aside class="aid-preview"><div class="aid-preview-title">执行分配试算 <span>实时预览</span></div><label class="aid-label">输入执行方案的 AI 占比<div class="aid-preview-input"><input aria-label="试算 AI 占比" type="number" min="0" max="100" data-aid-field="preview" value="${state.preview}"><span>%</span></div></label><div id="aidPreviewResult">${aiDefaultsPreview()}</div></aside></div></div></div></div></section>`;
}

function aiDefaultsRefreshPreview() {
  const node = document.getElementById('aidPreviewResult');
  if (node) node.innerHTML = aiDefaultsPreview();
  (aiDefaultsState.editor?.bands || []).forEach((band, index) => {
    const node = document.querySelector(`[data-aid-sum="${index}"]`);
    if (!node) return;
    const sum = band.parts.reduce((total, part) => total + part.percent, 0);
    node.textContent = `合计 ${sum}%`; node.className = sum === 100 ? 'aid-valid' : 'aid-invalid';
  });
}

document.addEventListener('input', event => {
  const node = event.target.closest('[data-aid-field]');
  if (!node) return;
  const field = node.dataset.aidField;
  if (field === 'preview') { aiDefaultsState.preview = node.value === '' ? NaN : Number(node.value); aiDefaultsRefreshPreview(); return; }
  const item = aiDefaultsState.editor;
  if (!item) return;
  const band = item.bands[Number(node.dataset.aidBand)];
  if (field === 'name' || field === 'type') item[field] = node.value;
  if (field === 'isDefault') item.isDefault = node.checked;
  if (field === 'min' || field === 'max') band[field] = node.value === '' ? NaN : Number(node.value);
  if (field === 'part-type') band.parts[Number(node.dataset.aidPart)].type = node.value;
  if (field === 'percent') band.parts[Number(node.dataset.aidPart)].percent = node.value === '' ? NaN : Number(node.value);
  aiDefaultsRefreshPreview();
});

document.addEventListener('click', event => {
  const button = event.target.closest('[data-aid-action]');
  if (!button || button.disabled) return;
  const state = aiDefaultsState, action = button.dataset.aidAction;
  const current = state.items.find(row => row.id === state.selected);
  if (action === 'source-mode') {
    if(state.editor){aiStrategyNotice('请先保存或取消正在编辑的方案。');return;}
    const mode=button.dataset.aidSource;if(!['preset','agent'].includes(mode))return;
    state.pendingSourceMode=mode===state.sourceMode?null:mode;
    renderAiStrategyWorkbench();return;
  }
  if(action==='source-cancel'){state.pendingSourceMode=null;renderAiStrategyWorkbench();return;}
  if(action==='source-save'){
    if(state.editor){aiStrategyNotice('请先保存或取消正在编辑的方案。');return;}
    const mode=state.pendingSourceMode;
    if(!['preset','agent'].includes(mode)||mode===state.sourceMode)return;
    if(mode==='preset'&&!state.items.some(row=>row.isDefault&&!aiDefaultsValidate(row))){aiStrategyNotice('请先配置一套有效的默认预设。');return;}
    const label=mode==='agent'?'Agent 完整方案':'默认预设补齐';
    if(!window.confirm(`确认将执行方案来源切换为「${label}」？\n保存后仅对新接收的建议生效，已有建议和已发布策略保持原方案。${mode==='agent'?'\nAgent 明细缺失或校验失败时，需要人工补齐后才能发布。':''}`))return;
    (aiStrategyState.drafts||[]).forEach(d=>d.rows.forEach(aiExecutionEnsure));
    state.sourceMode=mode;state.pendingSourceMode=null;state.presetsExpanded=false;
    aiStrategyLog(`切换执行方案来源：${label}`);
    renderAiStrategyWorkbench();aiStrategyNotice('执行方案来源已保存，仅对新接收的建议生效。',true);return;
  }
  if(action==='toggle-presets')state.presetsExpanded=!state.presetsExpanded;
  if (action === 'select') state.selected = button.dataset.aidId;
  if (action === 'new') { if (state.editor) { aiStrategyNotice('请先保存或取消正在编辑的方案。'); return; } state.editor = { id: '', name: '', mode: 'ratio', isDefault: false, type: aiStrategyAiTypes[0], bands: [{ min: 1, max: 100, parts: [{ type: aiStrategyAiTypes[0], percent: 100 }] }] }; }
  if (action === 'edit') state.editor = aiDefaultsClone(current);
  if (action === 'cancel') state.editor = null;
  if (action === 'default') { state.items.forEach(row => { row.isDefault = row.id === current.id; }); }
  const item = state.editor;
  if (item) {
    const b = Number(button.dataset.aidBand), p = Number(button.dataset.aidPart);
    if (action === 'mode') item.mode = button.dataset.aidMode;
    if (action === 'add-band') {
      if (!item.bands.length) item.bands.push({ min: 1, max: 100, parts: [{ type: aiStrategyAiTypes[0], percent: 100 }] });
      else {
        const last = [...item.bands].sort((a, b) => b.max - a.max)[0];
        if (!Number.isInteger(last.min) || !Number.isInteger(last.max) || last.min >= last.max) { aiStrategyNotice('请先调整已有区间，为新区间预留范围。'); return; }
        const oldMax = last.max;
        last.max = Math.floor((last.min + last.max) / 2);
        item.bands.push({ min: last.max + 1, max: oldMax, parts: aiDefaultsClone(last.parts) });
      }
    }
    if (action === 'remove-band') item.bands.splice(b, 1);
    if (action === 'add-part') { const type = aiStrategyAiTypes.find(type => !item.bands[b].parts.some(part => part.type === type)); if (type) item.bands[b].parts.push({ type, percent: 0 }); }
    if (action === 'remove-part') item.bands[b].parts.splice(p, 1);
    if (action === 'save') {
      let error = aiDefaultsValidate(item);
      if (!error && state.items.some(row => row.id !== item.id && row.name.trim() === item.name.trim())) error = '方案名称已存在，请使用不同名称。';
      if (!error && !item.isDefault && !state.items.some(row => row.id !== item.id && row.isDefault)) error = '请保留一套默认方案；可先将其他方案设为默认。';
      if (error) { document.getElementById('aidError').textContent = error; return; }
      const saved = aiDefaultsClone(item); saved.name = saved.name.trim(); saved.bands.sort((a, b) => a.min - b.min);
      if (!saved.id) saved.id = `ADS-${Date.now()}`;
      if (saved.isDefault) state.items.forEach(row => { row.isDefault = false; });
      const index = state.items.findIndex(row => row.id === saved.id);
      if (index < 0) state.items.push(saved); else state.items[index] = saved;
      state.selected = saved.id; state.editor = null;
    }
  }
  renderAiStrategyWorkbench();
  if (action === 'save' || action === 'default') aiStrategyNotice(action === 'save' ? '方案已保存，可在右侧试算分配效果。' : '已设为默认方案。', true);
});
