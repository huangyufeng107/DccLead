/* Global rule configuration and predictive-call generation demo; session-only, no service calls. */
(() => {
  'use strict';
  const api = window.DccLowScoreVisit, gateway = window.DccLowScoreDispatch;
  if (!api || !gateway) return;
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const routes = [
    ['人工批量下发','线索管理／线索分发审核／人工线索分发（含天网付费自动触发）','提交后逐条保存、同步前','原型模拟已接入'],
    ['AI批量下发','线索管理／线索分发审核／AI线索分发（含天网付费自动触发）','提交后逐条保存、同步前','原型模拟已接入'],
    ['人工预览外呼','我的任务／培育任务回访工单','选择提示、提交复核与覆盖确认','原型模拟已接入'],
    ['人工预测外呼','回访工单配置 → 话单生成回访工单','先生成候选字段，再统一转换并保存','生成链路模拟'],
    ['厂商回流同步','线索状态更新 → 同步回流厂商系统','本次已转换则跳过；否则仅回访结果为无人接听下发时判分，先保存DCC再同步','兜底链路模拟'],
    ['AI通话状态处理','培育策略／AI外呼配置／通话状态配置','本配置命中且选择优先执行时，按低分区间判断；不要求回访结果；未转换时执行原动作','规则判定模拟已接入'],
  ];
  const selectOptions = (items,current) => items.map(item=>`<option value="${esc(item.value)}" ${item.value===current?'selected':''}>${esc(item.label)}</option>`).join('');
  function reasonOptions(status,current) {
    const dictionary = api.actionDictionaries(status);
    const items = dictionary.available ? dictionary.reasons : [{value:current,label:current}].filter(item=>item.value);
    return `<option value="">不设置（清空原值）</option>${selectOptions(items,current)}`;
  }
  function renderActionInputs(actions) {
    const dictionary = api.actionDictionaries(actions.leadStatus);
    const statuses = dictionary.available ? dictionary.statuses : [{value:actions.leadStatus,label:actions.leadStatus}];
    const levels = typeof strategyConfiguratorOptions === 'undefined' ? ['H','A','B','C','E','F','L','N'] : [...new Set([...strategyConfiguratorOptions.intentLevelAction.filter(value=>/^[A-Z]$/.test(value)),'N'])];
    return `<tr><td>线索状态</td><td><select id="gscActionStatus">${selectOptions(statuses,actions.leadStatus)}</select></td></tr>
      <tr><td>回访结果</td><td><select id="gscActionResult">${selectOptions(dictionary.results,actions.visitResult)}</select><small class="gsc-field-help">读取启用字典项，仅保留无人接听下发、休眠失联、休眠未购、无效结案和战败。</small></td></tr>
      <tr><td>异常原因</td><td><select id="gscActionReason">${reasonOptions(actions.leadStatus,actions.resultReason)}</select><small class="gsc-field-help" id="gscReasonHelp">仅展示适用于所选线索状态的已启用原因；不设置时清空原异常原因。</small></td></tr>
      <tr><td>回访描述</td><td><textarea id="gscActionDesc" rows="3" maxlength="500" placeholder="请输入命中后的回访描述">${esc(actions.visitDesc)}</textarea><small class="gsc-field-help">必填，最多500字。</small></td></tr>
      <tr><td>意向级别</td><td><select id="gscActionLevel">${selectOptions(levels.map(value=>({value,label:value})),actions.intentLevel)}</select></td></tr>`;
  }
  window.openGlobalConversionRules = () => window.switchStrategyNav(document.querySelector('[data-page="lead-state-conversion"]'));
  window.openPredictiveVisitConfig = () => {
    window.switchStrategyNav(document.querySelector('[data-page="manual-ai-config"]'));
    window.switchManualAiConfigTab('return-visit-order-config');
  };
  window.renderLeadStateConversionPage = function () {
    const page = document.getElementById('leadStateConversionPage');
    if (!page) return;
    const config = api.getDemo();
    page.innerHTML = `<section class="gsc-page"><header class="gsc-card gsc-head"><div><h1>预评分转换规则</h1><p>统一维护无人接听下发场景的低分转换规则，各入口共用配置与判定。</p></div><span>${config.range ? '已配置' : '未配置，沿用原流程'}</span></header>
      <section class="gsc-card"><h2>统一规则配置</h2><p>当本次回访结果为「无人接听下发」，且有效预评分命中以下区间时执行转换。其他结果、无分或未配置时沿用原流程。</p><form id="gscForm" novalidate><div class="gsc-fields"><label>最低分<input id="gscMin" type="text" inputmode="numeric" pattern="[0-9]{1,3}" autocomplete="off" aria-describedby="gscRangeHelp gscError" value="${config.range?.min ?? ''}" placeholder="默认留空"></label><span>至</span><label>最高分<input id="gscMax" type="text" inputmode="numeric" pattern="[0-9]{1,3}" autocomplete="off" aria-describedby="gscRangeHelp gscError" value="${config.range?.max ?? ''}" placeholder="默认留空"></label><button type="button" id="gscClear" class="gsc-secondary">清空区间</button></div></form><p class="gsc-muted" id="gscRangeHelp">仅支持 0–100 的整数，最低分不得大于最高分；两项同时留空表示不启用。原型按包含最低分、最高分演示。保存后用于后续操作；当前版本 ${config.version}，${config.updatedAt ? '更新时间：' + esc(config.updatedAt) : '尚未保存'}。配置仅在当前原型会话保留。</p>
      <table class="gsc-table"><thead><tr><th>命中后更新字段</th><th>命中后执行值（可配置）</th></tr></thead><tbody>${renderActionInputs(config.actions)}</tbody></table><div class="gsc-review-note"><strong>保存前请核对三项关系</strong><span>线索状态、异常原因和意向级别应符合业务处理口径。异常原因按状态联动；意向级别由操作人核对，系统不擅自推定对应关系。</span></div><p id="gscError" role="alert" aria-live="polite"></p><div class="gsc-save-footer"><span>修改后请保存；确认保存后用于后续操作，不补改历史记录。</span><button type="submit" form="gscForm" class="gsc-primary" id="gscSave">保存配置</button></div><div id="gscConfirmHost"></div></section>
      <section class="gsc-card"><h2>接入场景</h2><p>各入口共用低分区间与转换动作。通话状态配置通过「是否优先执行预评分转换规则」决定是否引用；选择是且本配置命中后直接判断低分，未触发转换则执行原动作。以下状态表示原型覆盖情况，不代表服务上线。</p><div class="gsc-scroll"><table class="gsc-table"><thead><tr><th>接入场景</th><th>具体入口</th><th>判定时点</th><th>覆盖状态</th></tr></thead><tbody>${routes.map(row=>`<tr>${row.map(v=>`<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></section><details class="gsc-card"><summary>原型演示设置</summary><p>仅模拟厂商回流同步兜底，不调用真实厂商接口。使用当前已保存规则。</p><div class="gsc-fields"><label>模拟场景<select id="gscReturnScenario"><option value="low">未转换，低分20分</option><option value="done">本次已转换，跳过查分</option><option value="other">其他回访结果，跳过查分</option><option value="none">无分，沿用原流程</option><option value="failure">命中低分，保存失败</option></select></label><button type="button" class="gsc-secondary" id="gscReturnRun">应用演示设置</button></div><p id="gscReturnOutput" role="status"></p></details></section>`;
    page.querySelector('#gscReturnRun').onclick = async event => {
      event.target.disabled=true;
      try {
        const scenario=page.querySelector('#gscReturnScenario').value;
        const row={taskCode:'RETURN-DEMO-TASK',leadCode:'RETURN-DEMO-LEAD',latestLeadStatus:scenario==='done'?'休眠失联':'培育中',latestVisitResult:scenario==='other'?'下次回访':scenario==='done'?'休眠失联':'无人接听下发',abnormalReason:'',visitDesc:'回流演示',latestLevel:'B'};
        const result=await gateway.manufacturerReturn(row,{convertedLeadCodes:scenario==='done'?[row.leadCode]:[]},{query:async()=>scenario==='none'?null:20,save:async()=>{if(scenario==='failure')throw Error('模拟DCC保存失败');}});
        page.querySelector('#gscReturnOutput').textContent=`${result.reason}；线索状态：${row.latestLeadStatus}；回访结果：${row.latestVisitResult}；${result.error || result.syncStatus}。可在“预评分转换记录”按厂商回流同步查看。`;
      } catch(error) {page.querySelector('#gscReturnOutput').textContent=error.message;}
      finally {event.target.disabled=false;}
    };
    page.querySelector('#gscActionStatus').onchange = () => {
      const status = page.querySelector('#gscActionStatus').value;
      const reason = page.querySelector('#gscActionReason');
      const previous = reason.value;
      const valid = api.actionDictionaries(status).reasons.some(item=>item.value === previous);
      reason.innerHTML = reasonOptions(status,valid ? previous : '');
      reason.value = valid ? previous : '';
      const help = page.querySelector('#gscReasonHelp');
      if (help) help.textContent = previous && !valid ? '线索状态已变更，原异常原因不适用，已清空；请重新选择或保留不设置。' : '仅展示适用于所选线索状态的已启用原因；不设置时清空原异常原因。';
    };
    const scoreInputs = ['#gscMin','#gscMax'].map(selector => page.querySelector(selector));
    const errorNode = page.querySelector('#gscError');
    const validText = value => value === '' || (/^\d{1,3}$/.test(value) && Number(value) <= 100);
    scoreInputs.forEach(input => {
      let previous = input.value;
      const reject = () => { errorNode.textContent = '仅支持输入 0–100 的整数，不支持负数、小数或科学计数法。'; input.setAttribute('aria-invalid','true'); };
      input.addEventListener('keydown', event => {
        if (!event.ctrlKey && !event.metaKey && ['-','+','.','e','E'].includes(event.key)) { event.preventDefault(); reject(); }
      });
      input.addEventListener('input', () => {
        if (!validText(input.value)) { input.value = previous; reject(); return; }
        previous = input.value; input.removeAttribute('aria-invalid'); errorNode.textContent = '';
      });
      input.addEventListener('blur', () => {
        if (input.value !== '' && validText(input.value)) { input.value = String(Number(input.value)); previous = input.value; }
      });
    });
    const host = page.querySelector('#gscConfirmHost');
    let pending = null;
    const close = () => { pending = null; host.innerHTML = ''; host.onkeydown = null; page.querySelector('#gscSave')?.focus?.(); };
    const rangeLabel = range => range ? `${range.min}–${range.max} 分（含上下限）` : '未配置，不执行转换';
    const openConfirmation = (range, actions, clear = false) => {
      const normalized = api.validateConfiguration(range,actions);
      pending = {range:range ? {...range} : null,actions:{...normalized},version:config.version};
      const rows = [
        ['低分区间',rangeLabel(config.range),rangeLabel(range),false],
        ['线索状态',config.actions.leadStatus,normalized.leadStatus,true],
        ['回访结果',api.visitResultLabel(config.actions.visitResult),api.visitResultLabel(normalized.visitResult),false],
        ['异常原因',config.actions.resultReason || '不设置（清空原值）',normalized.resultReason || '不设置（清空原值）',true],
        ['回访描述',config.actions.visitDesc,normalized.visitDesc,false],
        ['意向级别',config.actions.intentLevel,normalized.intentLevel,true]
      ];
      host.innerHTML = `<div class="gsc-confirm-mask"><section class="gsc-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="gscConfirmTitle" aria-describedby="gscConfirmNote"><header><h2 id="gscConfirmTitle">${clear ? '确认清空低分区间' : '确认保存预评分转换规则'}</h2><button type="button" class="gsc-confirm-close" id="gscConfirmClose" aria-label="返回修改">×</button></header><div class="gsc-confirm-body"><div class="gsc-review-note" id="gscConfirmNote"><strong>请重点核对：线索状态 → 异常原因 → 意向级别</strong><span>三项将共同写入命中线索，请确认组合符合业务处理口径。字典关联校验不能代替业务核对。</span></div>${clear ? '<p>仅清空已保存的低分区间，保留已保存的转换动作；当前未保存的字段修改不会提交。</p>' : ''}<table class="gsc-table"><thead><tr><th>配置项</th><th>已保存值</th><th>本次保存值</th></tr></thead><tbody>${rows.map(([label,before,after,key])=>`<tr class="${key?'gsc-key-review':''}"><th scope="row">${esc(label)}${key?' · 重点核对':''}</th><td>${esc(before)}</td><td>${esc(after)}</td></tr>`).join('')}</tbody></table><p>各接入入口共用本配置，确认后对后续操作生效，不补改历史记录。</p><label class="gsc-confirm-check"><input id="gscConfirmAck" type="checkbox">我已核对线索状态、异常原因与意向级别的关系，确认配置正确。</label><p id="gscConfirmError" role="alert"></p></div><footer><button type="button" class="gsc-secondary" id="gscConfirmBack">返回修改</button><button type="button" class="gsc-primary" id="gscConfirmCommit" disabled>确认保存</button></footer></section></div>`;
      const ack=host.querySelector('#gscConfirmAck'),commit=host.querySelector('#gscConfirmCommit');
      ack.onchange=()=>{commit.disabled=!ack.checked;};
      host.querySelector('#gscConfirmBack').onclick=close;
      host.querySelector('#gscConfirmClose').onclick=close;
      commit.onclick=()=>{
        if (!pending || !ack.checked || commit.disabled) return;
        try {
          if (api.getDemo().version !== pending.version) throw Error('已保存配置发生变化，请返回修改并重新核对后保存。');
          api.configure(pending.range,config.scenario,pending.actions);
          pending=null;window.renderLeadStateConversionPage();window.showToast?.('统一规则已确认保存（原型会话）',true);
        } catch(error) {host.querySelector('#gscConfirmError').textContent=error.message;}
      };
      host.onkeydown=event=>{
        if(event.key==='Escape'){event.preventDefault();close();return;}
        if(event.key==='Tab'){
          const controls=[...host.querySelectorAll('button:not(:disabled),input')];
          const first=controls[0],last=controls[controls.length-1];
          if(event.shiftKey && document.activeElement===first){event.preventDefault();last?.focus();}
          else if(!event.shiftKey && document.activeElement===last){event.preventDefault();first?.focus();}
        }
      };
      host.querySelector('#gscConfirmBack').focus?.();
    };
    page.querySelector('#gscForm').onsubmit = event => {
      event.preventDefault();
      const min = page.querySelector('#gscMin').value.trim(), max = page.querySelector('#gscMax').value.trim();
      try {
        errorNode.textContent='';
        if (!validText(min) || !validText(max)) throw Error('最低分和最高分仅支持 0–100 的整数。');
        if ((min === '') !== (max === '')) throw Error('请同时填写最低分和最高分，或同时留空。');
        openConfirmation(min === '' ? null : {min:Number(min),max:Number(max)}, {leadStatus:page.querySelector('#gscActionStatus').value,visitResult:page.querySelector('#gscActionResult').value,resultReason:page.querySelector('#gscActionReason').value,visitDesc:page.querySelector('#gscActionDesc').value,intentLevel:page.querySelector('#gscActionLevel').value});
      } catch (error) { errorNode.textContent = error.message; }
    };
    page.querySelector('#gscClear').onclick = () => {
      try { openConfirmation(null,config.actions,true); } catch(error) { errorNode.textContent=error.message; }
    };
  };
  function compare(condition, actual, field) {
    if (condition == null || condition === '') return true;
    if (!condition || typeof condition !== 'object' || actual == null || !Number.isFinite(Number(actual))) return false;
    const expected = Number(condition[field]);
    if (!Number.isFinite(expected)) return false;
    const n = Number(actual);
    return ({'>':n>expected,'≥':n>=expected,'=':n===expected,'≤':n<=expected,'<':n<expected})[condition.operator] === true;
  }
  function matches(rule, call) {
    const any = (list,value) => !list?.length || list.includes(value);
    return rule.status === '启用' && rule.precallSystemStatus === call.systemStatus && rule.triggerCondition === call.callStatus &&
      any(rule.channelCode,call.channel) && any(rule.mediaName,call.media) && any(rule.initialLeadStatus,call.initialLeadStatus) &&
      compare(rule.callDuration,call.duration,'seconds') && compare(rule.callReturnCount,call.returnCount,'count');
  }
  const generated = new Map();
  async function generate(call, rules, options = {}) {
    if (!call.id || !call.leadCode) throw Error('话单编号与线索编码必填。');
    const operationKey = `${call.leadCode}:${call.id}`;
    if (generated.has(operationKey)) return generated.get(operationKey);
    const promise = (async () => {
      const matched = rules.filter(rule=>matches(rule,call)).sort((a,b)=>Number(a.priority)-Number(b.priority) || Number(a.sortOrder||0)-Number(b.sortOrder||0) || Number(a.id)-Number(b.id))[0];
      if (!matched) return {status:'未命中回访工单配置，不生成工单',task:null};
      // Resolve the original rule first; the global conversion owns the final five fields.
      const task = {taskCode:`RV-${call.id}`,leadCode:call.leadCode,latestLeadStatus:call.leadStatus || '培育中',
        latestVisitResult:matched.nurtureResult,abnormalReason:matched.abnormalReason,visitDesc:matched.descriptionTemplate,
        latestLevel:matched.intentLevelAction,contactStatus:matched.contactStatus,currentPreScore:call.score,nextVisitTime:call.nextVisitTime || '',
        callId:call.id,generationRuleId:matched.id,agentRouting:matched.agentRouting,nextReturnVisitRule:matched.nextReturnVisitTime};
      const [decision] = await gateway.process([task], {query: async row => row.currentPreScore,...options,entry:'预测外呼话单 → 回访工单配置 → 生成人工回访工单'});
      if (decision.patch !== null) Object.assign(task,decision.patch);
      decision.status = decision.patch === null ? '处理失败' : '已保存（模拟）';
      decision.syncStatus = decision.patch === null ? '未同步' : '待既有同步流程（未接入真实接口）';
      const record = gateway.record({...decision,source:'人工预测外呼',time:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'}),batchId:'',callId:call.id,generationRuleId:matched.id});
      if (decision.patch === null) return {status:'生成保存失败，未生成工单',task:null,record};
      return {status:'已生成回访工单（模拟）',task,record,ruleName:matched.ruleName};
    })();
    generated.set(operationKey,promise);
    try { const result = await promise; if (!result.task) generated.delete(operationKey); return result; }
    catch(error) {generated.delete(operationKey);throw error;}
  }
  window.DccPredictiveVisitGeneration = {generate,matches};
  const demoRule = {id:'DEMO-ONLY',ruleName:'独立演示：无人接听下发',status:'启用',priority:1,precallSystemStatus:'已处理',triggerCondition:'无人接听',channelCode:[],mediaName:[],initialLeadStatus:[],nurtureResult:'无人接听下发',contactStatus:'无人接听',intentLevelAction:'C',abnormalReason:'原配置原因',descriptionTemplate:'原配置生成的回访描述',agentRouting:'原始归属人',nextReturnVisitTime:'N+1天 18时'};
  function appendGenerationDemo(page) {
    if (!page || page.querySelector('.gsc-generation-demo')) return;
    const box = document.createElement('details');box.className='gsc-card gsc-generation-demo';
    const current = typeof strategyConfiguratorData === 'undefined' ? [] : strategyConfiguratorData.returnVisitOrder;
    box.innerHTML=`<summary>话单生成与全局转换演示</summary><p>先匹配当前回访工单配置，再用生成的回访结果执行全局判断。停用配置不参与；独立示例不写入现有配置。以下仅演示工单生成与会话保存，不实际指派或同步。</p><div class="gsc-fields"><label>模拟话单匹配样例<select id="gscRuleSample">${current.filter(rule=>rule.status==='启用').map(rule=>`<option value="${esc(rule.id)}">当前配置：${esc(rule.ruleName)}</option>`).join('')}<option value="demo">独立示例：无人接听下发（不保存配置）</option></select></label><label>本次实时评分<input id="gscCallScore" type="number" min="0" step="any" value="20" placeholder="留空表示无分"></label><label>本次接通时长（秒）<input id="gscCallDuration" type="number" min="0" step="1" placeholder="无记录可留空"></label><label>本批次返回次数<input id="gscCallCount" type="number" min="0" step="1" placeholder="无记录可留空"></label><button type="button" class="gsc-primary" id="gscGenerate">模拟话单生成工单</button><button type="button" class="gsc-secondary" id="gscRules">查看统一转换规则</button></div><div id="gscGenerated" aria-live="polite"></div>`;
    page.appendChild(box);
    box.querySelector('#gscRules').onclick=window.openGlobalConversionRules;
    box.querySelector('#gscGenerate').onclick=async event=>{
      event.target.disabled=true;
      const output=box.querySelector('#gscGenerated');
      try {
        const ruleId=box.querySelector('#gscRuleSample').value;
        const liveRules=typeof strategyConfiguratorData==='undefined'?[]:strategyConfiguratorData.returnVisitOrder;
        const selected=ruleId==='demo'?demoRule:liveRules.find(rule=>String(rule.id)===ruleId);
        if(!selected || selected.status!=='启用') throw Error('配置已变化或停用，请刷新后重试。');
        const rawScore=box.querySelector('#gscCallScore').value.trim();
        const call={id:`DEMO-CALL-${Date.now()}`,leadCode:`DEMO-LEAD-${Date.now()}`,systemStatus:selected.precallSystemStatus,callStatus:selected.triggerCondition,
          duration:box.querySelector('#gscCallDuration').value === '' ? null : Number(box.querySelector('#gscCallDuration').value),returnCount:box.querySelector('#gscCallCount').value === '' ? null : Number(box.querySelector('#gscCallCount').value),channel:selected.channelCode?.[0]||'R1',media:selected.mediaName?.[0]||'懂车帝',initialLeadStatus:selected.initialLeadStatus?.[0]||'总部_新线索',score:rawScore===''?null:Number(rawScore)};
        if ([call.duration,call.returnCount].some(value => value != null && (!Number.isInteger(value) || value < 0))) throw Error('时长与返回次数应为非负整数。');
        const result=await generate(call,ruleId==='demo'?[demoRule]:liveRules);
        output.innerHTML=`<p><strong>${esc(result.status)}</strong></p>${result.record?`<p>匹配配置：${esc(result.ruleName||selected.ruleName)}；最终判定：${esc(result.record.outcome)}</p><table class="gsc-table"><thead><tr><th>字段</th><th>原配置生成值</th><th>最终保存值</th></tr></thead><tbody>${[['线索状态','leadStatus'],['回访结果','visitResult'],['异常原因','resultReason'],['回访描述','visitDesc'],['意向级别','intentLevel']].map(([name,key])=>`<tr><td>${name}</td><td>${esc(result.record.before[key]||'未填写')}</td><td>${esc(key==='visitResult'?api.visitResultLabel(result.record.final[key]):result.record.final[key]||'未填写')}</td></tr>`).join('')}</tbody></table><p>关联话单：${esc(call.id)}；记录已写入「统计报表 → 预评分转换记录」。${result.task?'指派及回访计划沿用原配置。':'保存失败未生成有效工单。'}</p>`:''}`;
      } catch(error) {output.textContent=error.message;}
      finally{event.target.disabled=false;}
    };
  }
  const originalRender = window.renderStrategyConfiguratorPage;
  if (typeof originalRender === 'function') window.renderStrategyConfiguratorPage=function(key){
    const result=originalRender(key);
    if(key==='returnVisitOrder')appendGenerationDemo(document.getElementById('returnVisitOrderConfigPage'));
    return result;
  };
})();
