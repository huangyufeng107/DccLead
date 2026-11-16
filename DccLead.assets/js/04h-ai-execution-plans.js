// 默认配置 → 建议行执行快照 → 本地模拟审核发布。
const aiExecutionState = { modal: null };
// Agent contract: agentAllocations contains {type, percent}, percentages of ALL leads.
function aiExecutionAgentPlan(row) {
  const ai=aiStrategyGetAiPercent(row.agentRecommended||row.recommended);
  const raw=Array.isArray(row.agentAllocations)?aiDefaultsClone(row.agentAllocations):[];
  const valid=raw.length && raw.every(p=>['人工外呼',...aiStrategyAiTypes].includes(p.type)&&Number.isFinite(p.percent)&&p.percent>0&&p.percent<=100) && new Set(raw.map(p=>p.type)).size===raw.length && Math.abs(raw.reduce((n,p)=>n+p.percent,0)-100)<0.000001 && Math.abs(raw.filter(p=>p.type!=='人工外呼').reduce((n,p)=>n+p.percent,0)-ai)<0.000001;
  const aiParts=valid?raw.filter(p=>p.type!=='人工外呼').map(p=>({type:p.type,percent:p.percent/ai*100})):[];
  if(aiParts.length)aiParts[aiParts.length-1].percent=100-aiParts.slice(0,-1).reduce((n,p)=>n+p.percent,0);
  return {ai,origin:'agent',manual:false,agentOriginal:raw,agentError:!valid&&(ai>0||raw.length>0)?'Agent 分配明细缺失或无效，请调整方案补齐后再发布。':'',scheme:{name:'Agent 返回方案',agentInline:true,mode:'ratio',type:'',bands:[{min:1,max:100,parts:aiParts}]}};
}
function aiExecutionEnsure(row) {
  if (!row || row.execution || row.reviewStatus === '无需审核' || row.recommended === '—') return;
  row.agentRecommended = row.agentRecommended || row.recommended;
  if(aiDefaultsState.sourceMode==='agent'){row.execution=aiExecutionAgentPlan(row);return;}
  const scheme = aiDefaultsState.items.find(item => item.isDefault);
  row.execution = { ai: aiStrategyGetAiPercent(row.agentRecommended), scheme: scheme ? aiDefaultsClone(scheme) : null, origin:'preset', manual: false };
}
function aiExecutionResult(row) {
  aiExecutionEnsure(row);
  const value = row?.execution;
  if (!value) return { error: '该记录没有可执行的分配方案。' };
  if(value.origin==='agent'&&!value.manual&&value.agentError)return {error:value.agentError};
  if (value.ai === 0) return { parts: [{ type: '人工外呼', percent: 100 }], band: null };
  if (!value.scheme) return { error: '请先设置 AI 分配默认方案，或在调整方案中选择方案。' };
  return aiDefaultsCalculate(value.scheme, value.ai);
}
function aiExecutionSummary(result) {
  return result.error || (result.parts || []).filter(part => part.percent > 0).map(part => `${part.type}${part.percent}%`).join('，');
}
function aiExecutionDefaultBanner() {
  const scheme = aiDefaultsState.items.find(item => item.isDefault);
  if(aiDefaultsState.sourceMode==='agent')return `<div class="aie-banner"><span>当前来源：<strong>Agent 完整方案</strong><small>新建议不自动读取默认预设；已有建议保留接收时的来源。明细不完整时需人工补齐。</small></span><button type="button" class="ai-strategy-text-btn" data-ai-action="tab" data-ai-value="ai-defaults">管理执行方案来源 →</button></div>`;
  return `<div class="aie-banner"><span>当前默认预设：<strong>${aiStrategyEsc(scheme?.name || '未设置')}</strong><small>新建议自动引用默认预设；已有建议保留带入时的配置，逐条调整仅影响本条执行方案。</small></span><button type="button" class="ai-strategy-text-btn" data-ai-action="tab" data-ai-value="ai-defaults">管理默认方案 →</button></div>`;
}
function aiExecutionCell(row, index, editable) {
  if (row.reviewStatus === '无需审核' || row.recommended === '—') return '<span class="ai-strategy-status-tag">沿用关联策略</span>';
  const result = aiExecutionResult(row), plan = row.execution;
  return `<div class="aie-cell"><div><span class="aie-badge ${plan.manual ? 'is-manual' : ''}">${plan.manual ? '已人工调整' : plan.origin==='agent'?'Agent 返回':'默认预设补齐'}</span><small>${aiStrategyEsc(plan.ai === 0 ? '全人工执行' : plan.scheme?.name || '未设置默认方案')}</small></div><strong class="${result.error ? 'aid-invalid' : ''}">${aiStrategyEsc(aiExecutionSummary(result))}</strong>${result.band ? `<small>AI ${plan.ai}% · 命中 ${result.band.min}–${result.band.max}% 区间</small>` : ''}${row.allocationPolicyId ? `<small>${aiStrategyEsc(row.allocationPolicySource || '关联配置')}：${aiStrategyEsc(row.allocationPolicyId)}</small>` : ''}${editable ? `<button type="button" class="ai-strategy-text-btn" data-aie-action="edit" data-aie-index="${index}">调整方案</button>` : ''}</div>`;
}
function aiExecutionActiveBand(plan) {
  return plan.scheme?.bands.find(band => plan.ai >= band.min && plan.ai <= band.max);
}
function aiExecutionSchemeCandidates(query = '', mode = '') {
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  return aiDefaultsState.items.filter(item => {
    if (mode && item.mode !== mode) return false;
    const text = [item.name, item.id, item.mode === 'ratio' ? '按比例' : '不按比例', ...(item.mode === 'single' ? [item.type] : item.bands.flatMap(band => band.parts.map(part => part.type)))].join(' ').toLocaleLowerCase();
    return terms.every(term => text.includes(term));
  }).sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}
function aiExecutionSchemeResults() {
  const modal = aiExecutionState.modal;
  if (!modal) return '';
  const items = aiExecutionSchemeCandidates(modal.schemeQuery || '', modal.schemeMode || '');
  const limit = modal.schemeLimit || 20;
  return `<div class="aie-picker-count" role="status">找到 ${items.length} 套方案 · 默认方案优先</div><div class="aie-picker-list">${items.slice(0, limit).map(item => {
    const band = item.bands.find(band => modal.plan.ai >= band.min && modal.plan.ai <= band.max);
    const summary = item.mode === 'single' ? `AI 份额全部给 ${item.type}` : band ? `AI ${band.min}–${band.max}%：${band.parts.map(part => `${part.type} ${part.percent}%`).join(' ／ ')}` : `${item.bands.length} 个区间 · 当前 AI 占比无需匹配`;
    const selected = modal.plan.scheme?.id === item.id;
    return `<button type="button" class="aie-picker-option ${selected ? 'is-selected' : ''}" data-aie-action="choose-scheme" data-aie-id="${aiStrategyEsc(item.id)}" aria-pressed="${selected}"><span class="aie-picker-option-head"><strong>${aiStrategyEsc(item.name)}</strong>${item.isDefault ? '<em>默认</em>' : ''}<span>${item.mode === 'ratio' ? '按比例' : '不按比例'}</span>${selected ? '<b>已选</b>' : ''}</span><small>${aiStrategyEsc(summary)}</small></button>`;
  }).join('') || '<div class="aie-picker-empty">没有匹配的方案，请更换关键词或分配方式。</div>'}</div>${items.length > limit ? `<button type="button" class="aie-picker-more" data-aie-action="more-schemes">再显示 20 套（已显示 ${limit} / ${items.length}）</button>` : ''}`;
}
function aiExecutionSchemePicker() {
  const modal = aiExecutionState.modal;
  if (!modal) return '';
  const scheme = modal.plan.scheme;
  return `<button type="button" id="aieSchemeTrigger" class="aie-picker-trigger" data-aie-action="toggle-schemes" aria-expanded="${!!modal.schemePickerOpen}" aria-controls="aieSchemePanel"><span>${aiStrategyEsc(scheme?.name || '搜索并选择预设方案')}</span><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>${modal.schemePickerOpen ? `<div id="aieSchemePanel" class="aie-picker-panel"><input type="search" aria-label="搜索预设方案名称或 AI 外呼类型" data-aie-field="scheme-search" value="${aiStrategyEsc(modal.schemeQuery || '')}" placeholder="搜索方案名称、编号或 AI 外呼类型" autocomplete="off"><div class="aie-picker-filters" aria-label="按分配方式筛选">${[['','全部'],['ratio','按比例'],['single','不按比例']].map(([mode, name]) => `<button type="button" class="${(modal.schemeMode || '') === mode ? 'active' : ''}" data-aie-action="filter-schemes" data-aie-mode="${mode}" aria-pressed="${(modal.schemeMode || '') === mode}">${name}</button>`).join('')}</div><div id="aieSchemeResults">${aiExecutionSchemeResults()}</div></div>` : ''}`;
}
function aiExecutionRefreshSchemePicker(focusSearch = false) {
  const node = document.getElementById('aieSchemePicker');
  if (node) node.innerHTML = aiExecutionSchemePicker();
  if (focusSearch) document.querySelector('[data-aie-field="scheme-search"]')?.focus();
}
function aiExecutionModalDetail() {
  const modal = aiExecutionState.modal;
  if (!modal) return '';
  const { plan } = modal, scheme = plan.scheme;
  if (plan.ai === 0) return '<div class="aie-neutral">当前全部分配给人工外呼，无需配置 AI 份额。</div>';
  if (!scheme) return '<div class="aid-preview-error">请选择可用方案。</div>';
  const band = aiExecutionActiveBand(plan);
  return `<label class="aid-label">AI 份额分配方式<select data-aie-field="mode"><option value="single" ${scheme.mode === 'single' ? 'selected' : ''}>不按比例 · 指定一个 AI 类型</option><option value="ratio" ${scheme.mode === 'ratio' ? 'selected' : ''}>按比例 · 拆分 AI 份额</option></select></label>${scheme.mode === 'single' ? `<label class="aid-label">AI 外呼类型<select data-aie-field="single-type">${!scheme.type?'<option value="">请选择 AI 外呼类型</option>':''}${aiDefaultsTypes(scheme.type)}</select></label>` : !band ? '<div class="aid-preview-error">当前 AI 占比没有命中区间，请更换方案。</div>' : `<section class="aie-split"><header><strong>AI 内部比例</strong><span>命中 ${band.min}–${band.max}% 区间 · 拆分当前 AI ${plan.ai}% 份额</span></header><div class="aie-split-columns"><span>AI 外呼类型</span><span>AI 内部占比</span><span>占全部线索</span><span></span></div>${band.parts.map((part, index) => `<div class="aid-part aie-split-row"><select aria-label="AI 外呼类型" data-aie-field="part-type" data-aie-part="${index}">${aiDefaultsTypes(part.type)}</select><div class="aid-percent"><input aria-label="AI 内部比例" type="number" min="1" max="100" value="${part.percent}" data-aie-field="percent" data-aie-part="${index}"><span>%</span></div><span class="aie-line-share" data-aie-share="${index}">${Number((plan.ai * part.percent / 100).toFixed(2))}%</span><button type="button" class="aid-remove" aria-label="移除 AI 类型" data-aie-action="remove-part" data-aie-part="${index}">×</button></div>`).join('')}<footer><button class="ai-strategy-text-btn" data-aie-action="add-part" ${band.parts.length >= aiStrategyAiTypes.length ? 'disabled' : ''}>＋ 添加 AI 类型</button><span id="aieSplitSum">内部合计 ${band.parts.reduce((sum, part) => sum + part.percent, 0)}%</span></footer></section>`}`;
}
function aiExecutionModalPreview() {
  const modal = aiExecutionState.modal, plan = modal?.plan;
  if (!plan) return '';
  const result = aiExecutionResult({ execution: plan });
  const policy = !result.error ? aiExecutionFindPolicy(result.parts) : null;
  const originalAi = aiStrategyGetAiPercent(modal.row.agentRecommended || modal.row.recommended);
  const colors = ['#2563eb', '#14b8a6', '#8b5cf6', '#f59e0b'];
  return `<div class="aie-result-heading"><h4>最终执行结果</h4><span>实时计算</span></div><p class="aie-result-subtitle">以下比例以全部线索为 100%</p>${result.error ? `<p class="aid-preview-error">${aiStrategyEsc(result.error)}</p>` : `<div class="aie-result-bar" aria-hidden="true">${result.parts.filter(part => part.percent > 0).map((part, index) => `<span style="width:${part.percent}%;background:${colors[index % colors.length]}"></span>`).join('')}</div>${result.parts.filter(part => part.percent > 0).map((part, index) => `<div class="aid-result"><span><i style="background:${colors[index % colors.length]}"></i>${aiStrategyEsc(part.type)}</span><strong>${part.percent}%</strong></div>`).join('')}`}<div class="aid-total">全部线索合计<strong>${result.error ? '待完善' : '100%'}</strong></div>${!result.error ? `<div class="aie-result-compare">${plan.ai === originalAi ? '人工／AI 总比例沿用 Agent 建议' : `<strong>总比例已调整</strong><span>人工 ${100-originalAi}% → ${100-plan.ai}%</span><span>AI ${originalAi}% → ${plan.ai}%</span>`}</div><div class="aie-policy-note"><span>审核发布时</span><p>${policy ? `引用已有配置「${aiStrategyEsc(policy.name)}」` : '自动创建并关联分配比例配置'}</p></div>` : ''}`;
}

function aiExecutionOpen(index) {
  const draft = aiStrategySelectedDraft(), row = draft?.rows?.[index];
  if (!aiStrategyCanReviewRow(draft, row)) { aiStrategyNotice('该建议已失效或不可修改。'); return; }
  aiExecutionEnsure(row);
  aiExecutionState.modal = { draft, row, plan: aiDefaultsClone(row.execution) };
  aiExecutionRenderModal();
}
function aiExecutionRenderModal() {
  document.getElementById('aiExecutionModal')?.remove();
  const modal = aiExecutionState.modal;
  if (!modal) return;
  const { row, plan } = modal;
  const node = document.createElement('div');
  node.id = 'aiExecutionModal'; node.className = 'aie-backdrop';
  node.innerHTML = `<section class="aie-modal aid-page" role="dialog" aria-modal="true" aria-labelledby="aieTitle">
    <header class="aie-modal-head"><div><h3 id="aieTitle">调整执行分配方案</h3><p>${aiStrategyEsc(row.dimension)} · ${aiStrategyEsc(row.value)}</p></div><button type="button" class="aid-remove" aria-label="关闭调整窗口" data-aie-action="cancel">×</button></header>
    <div class="aie-modal-body"><div class="aie-edit-grid"><div class="aie-config-stack">
      <section class="aie-step"><header class="aie-step-heading"><span class="aie-step-number">01</span><div><h4>人工与 AI 总比例</h4><p>先确定人工承接多少，其余自动分给 AI。</p></div></header>
        <div class="aie-agent"><span>Agent 原始建议</span><strong>${aiStrategyEsc(row.agentRecommended || row.recommended)}</strong><small>只读参考</small></div>
        <div class="aie-ratio-pair"><label class="aid-label">人工外呼<div class="aid-preview-input"><input type="number" min="0" max="100" data-aie-field="human" value="${100 - plan.ai}" aria-label="执行人工占比"><span>%</span></div></label><label class="aid-label">AI 外呼 · 自动计算<div id="aieAiValue" class="aie-ai-total">${plan.ai}%</div></label></div>
        <p id="aieHumanOnlyNote" class="aie-human-only-note" ${plan.ai === 0 ? '' : 'hidden'}>当前全部分配给人工外呼，无需配置 AI，可直接保存。</p>
      </section>
      <section id="aieAiSection" class="aie-step" ${Number.isInteger(plan.ai) && plan.ai > 0 && plan.ai <= 100 ? '' : 'hidden'}><header class="aie-step-heading"><span class="aie-step-number">02</span><div><h4>AI 份额分配</h4><p>${plan.origin==='agent'?'核对 Agent 返回的类型和比例，可手动补齐或调整。':'选择预设，再按需调整本条建议的 AI 分配。'}</p></div></header>
        ${plan.origin==='agent'?'<div class="aie-neutral">来源：Agent 完整方案。此处手动调整不会读取默认预设。</div>':`<div class="aid-label"><span>引用预设方案</span><div id="aieSchemePicker" class="aie-scheme-picker">${aiExecutionSchemePicker()}</div><div class="aie-scheme-tools"><small>支持搜索名称、编号或 AI 类型</small><button type="button" class="ai-strategy-text-btn" data-aie-action="refresh-scheme">读取最新预设</button></div></div>`}
        <div id="aieDetail">${aiExecutionModalDetail()}</div>
      </section>
    </div><aside id="aiePreview" class="aie-preview-box">${aiExecutionModalPreview()}</aside></div><div id="aieError" class="aid-preview-error" role="alert"></div></div>
    <footer class="aie-modal-foot"><div class="aie-footer-secondary"><button type="button" class="ai-strategy-text-btn" data-aie-action="reset" title="按本条建议接收时的来源恢复方案">${plan.origin==='agent'?'恢复 Agent 方案':'恢复默认'}</button><span>调整仅保存到本条建议</span></div><div><button type="button" class="ai-strategy-btn" data-aie-action="cancel">取消</button><button type="button" class="ai-strategy-btn primary" data-aie-action="save">保存执行方案</button></div></footer>
  </section>`;
  document.body.appendChild(node);
}
function aiExecutionClose() { aiExecutionState.modal = null; document.getElementById('aiExecutionModal')?.remove(); }
function aiExecutionRefresh(detail = false) {
  if (detail) document.getElementById('aieDetail').innerHTML = aiExecutionModalDetail();
  document.getElementById('aiePreview').innerHTML = aiExecutionModalPreview();
  const plan = aiExecutionState.modal.plan;
  document.getElementById('aieAiValue').textContent = `${Number.isFinite(plan.ai) ? plan.ai : '—'}%`;
  const section = document.getElementById('aieAiSection');
  if (section) section.hidden = !(Number.isInteger(plan.ai) && plan.ai > 0 && plan.ai <= 100);
  const note = document.getElementById('aieHumanOnlyNote');
  if (note) note.hidden = plan.ai !== 0;
  if (plan.ai === 0 && aiExecutionState.modal.schemePickerOpen) { aiExecutionState.modal.schemePickerOpen = false; aiExecutionRefreshSchemePicker(); }
  const band = aiExecutionActiveBand(plan), sum = document.getElementById('aieSplitSum');
  if (band) band.parts.forEach((part, index) => { const node = document.querySelector(`[data-aie-share="${index}"]`); if (node) node.textContent = Number.isFinite(part.percent) ? `${Number((plan.ai * part.percent / 100).toFixed(2))}%` : '—'; });
  if (band && sum) { const total = band.parts.reduce((n, part) => n + part.percent, 0); sum.textContent = `内部合计 ${total}%`; sum.className = total === 100 ? 'aid-valid' : 'aid-invalid'; }
}
function aiExecutionAllocationKey(parts) {
  return parts.filter(part => Number(part.percent) > 0).map(part => [part.channel || part.type, Math.round(Number(part.percent) * 100)]).sort((a,b) => a[0].localeCompare(b[0])).map(part => part.join(':')).join('|');
}
function aiExecutionFindPolicy(parts) {
  if (typeof leadAllocationPolicies === 'undefined') return null;
  const key = aiExecutionAllocationKey(parts);
  return leadAllocationPolicies.find(policy => policy.status === '启用' && (policy.allocationScope || (policy.byCity === '是' ? 'city' : 'none')) === 'none' && Array.isArray(policy.allocations) && !policy.allocations.some(part => part.pushTime?.days?.length || part.pushTime?.slots?.length) && aiExecutionAllocationKey(policy.allocations) === key) || null;
}
function aiExecutionPreparePolicy(row) {
  const result = aiExecutionResult(row);
  if (result.error) return result;
  if (typeof leadAllocationPolicies === 'undefined') return { error: '分配比例配置尚未加载。' };
  const existing = aiExecutionFindPolicy(result.parts);
  if (existing) return { policy: existing, created: false };
  let serial = Math.max(0, ...leadAllocationPolicies.map(policy => Number((policy.id.match(/^AP-(\d+)$/) || [])[1]) || 0)) + 1;
  let id = `AP-${String(serial).padStart(3, '0')}`;
  while (leadAllocationPolicies.some(policy => policy.id === id)) id = `AP-${String(++serial).padStart(3, '0')}`;
  const allocations = result.parts.filter(part => part.percent > 0).map(part => ({ channel: part.type, percent: part.percent }));
  return { created: true, policy: { id, name: `策略分配配置-人工${100 - row.execution.ai}%-AI${row.execution.ai}%-${id.slice(3)}`, allocationScope: 'none', byCity: '否', allocationMode: allocations.length === 1 ? 'single' : 'ratio', allocations, action: aiExecutionSummary(result), status: '启用', updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }) } };
}
function aiExecutionSyncPublishedRule(row, policy, now) {
  const rule = aiStrategyDemoRule(row);
  if (!rule) return;
  Object.assign(rule, { useAllocationPolicy: '是', allocationPolicyId: policy.id, allocationMode: 'policy', allocations: [], callTypes: policy.allocations.map(part => part.channel), action: `接入比例配置：${policy.name}`, ratio: '比例配置', updatedAt: now });
  rule.condition = String(rule.condition || '').replace(/\s*\/\s*分配比例配置=.*$/, '') + ` / 分配比例配置=${policy.name}`;
}
function aiExecutionHistoricalParts(snapshot) {
  if (Array.isArray(snapshot.allocations) && snapshot.allocations.length) return snapshot.allocations;
  const policy = snapshot.allocationPolicyId && leadAllocationPolicies.find(policy => policy.id === snapshot.allocationPolicyId);
  if (policy?.allocations?.length) return policy.allocations.map(part => ({ type: part.channel, percent: part.percent }));
  const content = snapshot.content || '';
  const totals = content.match(/人工(\d+(?:\.\d+)?)%\s*\/\s*AI(\d+(?:\.\d+)?)%/);
  if (!totals) return null;
  const human = Number(totals[1]), ai = Number(totals[2]);
  if (human + ai !== 100) return null;
  if (!ai) return [{ type: '人工外呼', percent: 100 }];
  const single = content.match(/单一AI类型[：:]\s*([^）)]+)/);
  if (single && aiStrategyAiTypes.includes(single[1].trim())) return [{ type: '人工外呼', percent: human }, { type: single[1].trim(), percent: ai }].filter(part => part.percent > 0);
  const detail = content.slice(content.indexOf('（') + 1);
  const parts = ['人工外呼', ...aiStrategyAiTypes].flatMap(type => {
    const match = detail.match(new RegExp(type + '(\\d+(?:\\.\\d+)?)%'));
    return match ? [{ type, percent: Number(match[1]) }] : [];
  });
  return Math.abs(parts.reduce((sum, part) => sum + part.percent, 0) - 100) < 0.000001 ? parts : null;
}
function aiExecutionPrepareRollback(pending, current) {
  const before = new Map(aiStrategyVersionRules(current).map(rule => [aiStrategyRuleKey(rule), rule]));
  const changes = [];
  for (const snapshot of pending.rules || []) {
    if (before.get(aiStrategyRuleKey(snapshot))?.content === snapshot.content) continue;
    const rule = aiStrategyDemoRule(snapshot);
    if (!rule) continue;
    const parts = aiExecutionHistoricalParts(snapshot);
    if (!parts) return { error: `历史规则 ${snapshot.value} 缺少完整分配配置，无法同步恢复，请先核对历史快照。` };
    if (parts.some(part => !['人工外呼', ...aiStrategyAiTypes].includes(part.type) || !Number.isFinite(part.percent) || part.percent < 0) || Math.abs(parts.reduce((sum, part) => sum + part.percent, 0) - 100) > 0.000001) return { error: `历史规则 ${snapshot.value} 的分配比例不完整，未执行回滚。` };
    changes.push({ snapshot, parts });
  }
  return { changes };
}
function aiExecutionSyncRollback(plan, now, version) {
  for (const { snapshot, parts } of plan.changes) {
    let policy = aiExecutionFindPolicy(parts);
    if (!policy) {
      let serial = Math.max(0, ...leadAllocationPolicies.map(item => Number((item.id.match(/^AP-(\d+)$/) || [])[1]) || 0)) + 1;
      const id = `AP-${String(serial).padStart(3, '0')}`;
      policy = { id, name: `历史恢复-${id}`, creationSource: '回滚自动创建', createdBy: aiStrategyCurrentAccountName(), createdAt: now, sourceVersionId: version.targetVersionId || '未记录', sourceRuleObject: `${snapshot.dimension} · ${snapshot.value}`,  allocationScope: 'none', byCity: '否', allocationMode: parts.length === 1 ? 'single' : 'ratio', allocations: parts.filter(part => part.percent > 0).map(part => ({ channel: part.type, percent: part.percent })), action: aiExecutionSummary({ parts }), status: '启用', updatedAt: now };
      leadAllocationPolicies.push(policy);
    }
    const restored = version.rules.find(rule => aiStrategyRuleKey(rule) === aiStrategyRuleKey(snapshot));
    restored.allocationPolicyId = policy.id;
    restored.allocations = aiDefaultsClone(parts);
    aiExecutionSyncPublishedRule(restored, policy, now);
  }
}

document.addEventListener('input', event => {
  const node = event.target.closest('[data-aie-field]'), modal = aiExecutionState.modal;
  if (!node || !modal) return;
  const { plan } = modal, field = node.dataset.aieField;
  if (field === 'scheme-search') { modal.schemeQuery = node.value; modal.schemeLimit = 20; const result = document.getElementById('aieSchemeResults'); if (result) result.innerHTML = aiExecutionSchemeResults(); return; }
  if (field === 'human') {
    const value = Number(node.value);
    if (node.value.trim() === '' || !Number.isFinite(value)) {
      plan.ai = NaN;
    } else {
      const human = Math.min(100, Math.max(0, Math.trunc(value)));
      node.value = String(human);
      plan.ai = 100 - human;
    }
  }
  if (field === 'mode') plan.scheme.mode = node.value;
  if (field === 'single-type') plan.scheme.type = node.value;
  const band = aiExecutionActiveBand(plan);
  if (band && field === 'part-type') band.parts[Number(node.dataset.aiePart)].type = node.value;
  if (band && field === 'percent') band.parts[Number(node.dataset.aiePart)].percent = node.value === '' ? NaN : Number(node.value);
  plan.manual = true;
  aiExecutionRefresh(['human','mode'].includes(field));
  if (field === 'human' && modal.schemePickerOpen) { const result = document.getElementById('aieSchemeResults'); if (result) result.innerHTML = aiExecutionSchemeResults(); }
});
document.addEventListener('click', event => {
  const button = event.target.closest('[data-aie-action]');
  if (!button || button.disabled) return;
  const action = button.dataset.aieAction;
  if (action === 'edit') { aiExecutionOpen(Number(button.dataset.aieIndex)); return; }
  const modal = aiExecutionState.modal;
  if (!modal) return;
  if (action === 'cancel') { aiExecutionClose(); return; }
  if (!aiStrategyCanReviewRow(modal.draft, modal.row)) { aiExecutionClose(); aiStrategyNotice('该建议已被新数据替代或已处理，未保存修改。'); return; }
  if(modal.plan.origin==='agent'&&['choose-scheme','refresh-scheme','toggle-schemes','more-schemes'].includes(action))return;
  if (action === 'toggle-schemes') {
    modal.schemePickerOpen = !modal.schemePickerOpen;
    if (modal.schemePickerOpen) { modal.schemeQuery = ''; modal.schemeMode = ''; modal.schemeLimit = 20; }
    aiExecutionRefreshSchemePicker(modal.schemePickerOpen); return;
  }
  if (action === 'filter-schemes') { modal.schemeMode = button.dataset.aieMode; modal.schemeLimit = 20; aiExecutionRefreshSchemePicker(true); return; }
  if (action === 'more-schemes') { modal.schemeLimit = (modal.schemeLimit || 20) + 20; document.getElementById('aieSchemeResults').innerHTML = aiExecutionSchemeResults(); return; }
  if (action === 'choose-scheme') {
    const scheme = aiDefaultsState.items.find(item => item.id === button.dataset.aieId);
    if (!scheme) { document.getElementById('aieError').textContent = '该方案已不存在，请重新选择。'; return; }
    modal.plan.scheme = aiDefaultsClone(scheme); modal.plan.manual = true; modal.schemePickerOpen = false;
    aiExecutionRefreshSchemePicker(); aiExecutionRefresh(true); document.getElementById('aieSchemeTrigger')?.focus(); return;
  }
  if (action === 'refresh-scheme') {
    const scheme = aiDefaultsState.items.find(item => item.id === modal.plan.scheme?.id);
    if (!scheme) { document.getElementById('aieError').textContent = '原预设已不存在，请选择其他方案。'; return; }
    modal.plan.scheme = aiDefaultsClone(scheme); modal.plan.manual = true; aiExecutionRefresh(true); return;
  }
  if (action === 'reset') {
    if(modal.plan.origin==='agent'){modal.plan=aiExecutionAgentPlan(modal.row);aiExecutionRenderModal();return;}
    const scheme = aiDefaultsState.items.find(item => item.isDefault);
    modal.plan = { ai: aiStrategyGetAiPercent(modal.row.agentRecommended || modal.row.recommended), scheme: scheme ? aiDefaultsClone(scheme) : null, manual: false };
    modal.schemePickerOpen = false; aiExecutionRenderModal(); return;
  }
  const band = aiExecutionActiveBand(modal.plan);
  if(['add-part','remove-part'].includes(action))modal.plan.manual=true;
  if (action === 'add-part' && band) { const type = aiStrategyAiTypes.find(type => !band.parts.some(part => part.type === type)); if (type) band.parts.push({ type, percent: 0 }); aiExecutionRefresh(true); }
  if (action === 'remove-part' && band) { band.parts.splice(Number(button.dataset.aiePart), 1); aiExecutionRefresh(true); }
  if (action === 'save') {
    const result = aiExecutionResult({ execution: modal.plan });
    if (result.error) { document.getElementById('aieError').textContent = result.error; return; }
    modal.row.execution = aiDefaultsClone(modal.plan);
    aiStrategyLog(`调整执行方案 ${modal.row.dimension}/${modal.row.value}：${aiExecutionSummary(result)}；Agent 原始建议 ${modal.row.agentRecommended || modal.row.recommended}`);
    aiExecutionClose(); renderAiStrategyWorkbench(); aiStrategyNotice('执行方案已保存，审核时按此结果发布。', true);
  }
});
document.addEventListener('keydown', event => {
  const modal = aiExecutionState.modal;
  if (!modal) return;
  if (event.key === 'Escape') {
    event.preventDefault();
    if (modal.schemePickerOpen) { modal.schemePickerOpen = false; aiExecutionRefreshSchemePicker(); document.getElementById('aieSchemeTrigger')?.focus(); }
    else aiExecutionClose();
  }
  if (event.key === 'ArrowDown' && event.target.matches?.('[data-aie-field="scheme-search"]')) { event.preventDefault(); document.querySelector('.aie-picker-option')?.focus(); }
});
