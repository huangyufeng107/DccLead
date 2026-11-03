/* Prototype dispatch adapter: no external request or manufacturer receipt. */
(() => {
  'use strict';
  const api = window.DccLowScoreVisit;
  if (!api) return;
  const audit = [];
  let auditSequence = 0;
  function record(item) {
    const entry = JSON.parse(JSON.stringify({ ...item, id: `CV${Date.now()}-${++auditSequence}` }));
    entry.outcome = entry.error ? '处理失败' : entry.converted ? '已转换' : entry.scoreStatus === '无分' || entry.scoreStatus === '读取失败' ? '无分' : '未命中';
    audit.unshift(entry);
    return entry;
  }
  // Display fixtures are isolated from operation audit and never mutate policy or business rows.
  const demoSources=['人工批量下发','AI批量下发','人工预览外呼','人工预测外呼','AI通话状态处理','厂商回流同步'];
  const demoEntries=['线索管理／线索分发审核／人工线索分发','线索管理／线索分发审核／AI线索分发','我的任务／培育任务回访工单','回访工单配置／话单生成回访工单','AI外呼配置／通话状态配置','线索状态更新／同步回流厂商系统'];
  const demoAudit=Array.from({length:24},(_,i)=>{
    const sourceIndex=i%6,kind=Math.floor(i/6),n=String(i+1).padStart(3,'0');
    const before={leadStatus:'培育中',visitResult:api.NO_ANSWER,resultReason:'原填写原因',visitDesc:'演示客户回访内容',intentLevel:'B'};
    const converted=kind===0;
    const final=converted?{leadStatus:'休眠失联',visitResult:api.DORMANT,resultReason:'三天四次无法接通',visitDesc:'多次联系，无人接听',intentLevel:'L'}:{...before};
    return {id:`DEMO-CV-${n}`,isDemo:true,source:demoSources[sourceIndex],entry:demoEntries[sourceIndex],
      taskCode:`DEMO-TASK-${n}`,leadCode:`DEMO-LEAD-${n}`,batchId:sourceIndex<2?`DEMO-BATCH-${sourceIndex+1}`:'',callId:sourceIndex>=3?`DEMO-CALL-${n}`:'',
      time:`2026-10-30 ${String(11-Math.floor(i/12)).padStart(2,'0')}:${String(59-i).padStart(2,'0')}:00`,
      before,final,range:{min:0,max:30},configVersion:'演示快照',score:kind===2?null:kind===1?80:20,
      scoreStatus:kind===2?'无分':'已取得',converted,outcome:['已转换','未命中','无分','处理失败'][kind],
      reason:kind===0?(sourceIndex===4?'本配置命中且评分命中低分区间':'无人接听下发且命中低分区间'):kind===1?'评分未命中低分区间':kind===2?'无有效评分，沿用原流程':'命中低分，保存失败，原数据未修改',
      error:kind===3?'模拟保存失败，请重试':'',status:kind===3?'处理失败（演示）':'已保存（演示）',
      syncStatus:kind===3?'未同步（演示）':'同步请求已提交（演示，无真实回执）'};
  });
  function recordManual(task, original, saved, decision, converted, error, originalLeadStatus, workMode = 'preview') {
    const before = { leadStatus: originalLeadStatus, visitResult: original.visitResult,
      resultReason: original.resultReason, visitDesc: original.visitDesc, intentLevel: original.intentLevel };
    const candidate = resultCode(original.visitResult) === api.NO_ANSWER;
    const score = decision.score;
    return record({ source: workMode === 'predictive' ? '人工预测外呼' : '人工预览外呼', taskCode: task.leadInfo?.taskCode || task.id,
      leadCode: task.leadInfo?.leadCode || task.leadCode || '',
      time: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' }), batchId: '',
      before, final: error ? before : { leadStatus: task.leadInfo?.leadStatus, visitResult: saved.visitResult,
        resultReason: saved.resultReason, visitDesc: saved.visitDesc, intentLevel: saved.intentLevel },
      score, range: decision.range, configVersion: decision.configVersion, entry: workMode === 'predictive' ? '人工预测外呼回访工单' : '我的任务／培育任务回访工单', scoreStatus: decision.checked ? (score == null ? '无分' : '已取得') : '未查询',
      converted: converted && !error, reason: converted ? '无人接听下发且命中低分区间' : !candidate ? '其他回访结果，沿用原流程' : !api.validRange(decision.range) ? '未配置低分区间，沿用原流程' : score == null ? '无有效评分，沿用原流程' : '评分未命中低分区间',
      error: error || '', status: error ? '处理失败' : '已保存（模拟）', syncStatus: error ? '未同步' : '未接入真实同步，回执未验证' });
  }
  const fieldSnapshot = row => ({ leadStatus: row.latestLeadStatus, visitResult: row.latestVisitResult,
    resultReason: row.abnormalReason, visitDesc: row.visitDesc, intentLevel: row.latestLevel });
  const resultCode = value => value === '无人接听下发' ? api.NO_ANSWER : value;
  async function process(items, options = {}) {
    // Capture one configuration per operation, and query each eligible row only once.
    const range = options.range === undefined ? api.getDemo().range : options.range;
    const configVersion = options.configVersion ?? api.getDemo().version;
    const actions = {...(options.actions || api.getDemo().actions)};
    const output = new Array(items.length);
    let cursor = 0;
    async function worker() {
      while (cursor < items.length) {
        const index = cursor++, row = items[index], before = fieldSnapshot(row);
        let score = null, scoreStatus = '未查询', reason = '其他回访结果，沿用原流程';
        const candidate = resultCode(before.visitResult) === api.NO_ANSWER;
        if (candidate && api.validRange(range)) {
          try {
            score = api.parseScore(await (options.query || api.queryDispatchScore)(row, 'submit'));
            scoreStatus = score == null ? '无分' : '已取得';
          } catch (_) { scoreStatus = '读取失败'; }
          reason = score == null ? '无有效评分，沿用原流程' : '评分未命中低分区间';
        } else if (candidate) reason = '未配置低分区间，沿用原流程';
        const converted = api.evaluate(resultCode(before.visitResult), score, range);
        const final = converted ? api.conversion(before,actions) : { ...before };
        if (converted) reason = '无人接听下发且命中低分区间';
        const record = { configVersion, actions: {...actions}, entry: options.entry || '', taskCode: row.taskCode, leadCode: row.leadCode, before, final, score,
          scoreStatus, range: api.validRange(range) ? { ...range } : null, converted, reason,
          status: '已保存／待同步', syncStatus: '待同步', error: '' };
        try {
          // An individual save failure must not stop other rows or overwrite the source row.
          if (converted) api.validateFinalFields({...row,...final});
          await (options.save || api.save)(final, row);
          record.patch = converted ? { latestLeadStatus: final.leadStatus, latestVisitResult: api.visitResultLabel(final.visitResult),
            abnormalReason: final.resultReason, visitDesc: final.visitDesc, latestLevel: final.intentLevel } : {};
        } catch (error) {
          record.status = '处理失败'; record.syncStatus = '未同步'; record.error = error.message || '保存失败';
          record.final = { ...before }; record.patch = null;
        }
        output[index] = record;
      }
    }
    await Promise.all(Array.from({ length: Math.min(8, items.length) }, worker));
    return output;
  }
  // One context belongs to one business operation, never to the lifetime of a lead.
  const manufacturerOperations = new WeakMap();
  function manufacturerReturn(row, operation, options = {}) {
    if (!operation || typeof operation !== 'object') return Promise.reject(Error('缺少本次操作上下文。'));
    let leads = manufacturerOperations.get(operation);
    if (!leads) { leads = new Map(); manufacturerOperations.set(operation,leads); }
    const key = row.leadCode;
    if (!key) return Promise.reject(Error('线索编号必填。'));
    if (leads.has(key)) return leads.get(key);
    const pending = (async () => {
      const prior = operation.convertedLeadCodes?.includes(key);
      let decision;
      if (prior) {
        const final = fieldSnapshot(row);
        decision = {before:{...final},final,converted:false,skipped:true,score:null,scoreStatus:'未查询',
          reason:'本次操作已完成转换，沿用已保存数据',patch:{},error:'',status:'已保存／待同步'};
      } else {
        [decision] = await process([row], {...options,entry:'线索同步回流厂商系统／同步前兜底'});
        if (decision.patch === null) {
          record({...decision,source:'厂商回流同步',time:new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'})});
          return decision;
        }
        Object.assign(row,decision.patch);
        if (decision.converted) {
          operation.convertedLeadCodes ||= [];
          operation.convertedLeadCodes.push(key);
        }
      }
      decision.source='厂商回流同步';decision.taskCode=row.taskCode;decision.leadCode=key;
      decision.entry='线索同步回流厂商系统／同步前兜底';decision.time=new Date().toLocaleString('sv-SE',{timeZone:'Asia/Shanghai'});
      // This callback is a test/service seam. Default is explicitly a simulation.
      try {
        if(options.sync) await options.sync({...decision.final},row);
        decision.syncStatus=options.sync?'同步请求已提交，回执待核对':'同步请求模拟提交，未调用真实接口';
      } catch(error) {decision.syncStatus='同步失败，DCC已保存';decision.error=error.message || '同步失败';}
      decision.audit=record(decision);
      return decision;
    })();
    leads.set(key,pending);
    // Failed saves/syncs may retry; a completed operation never dispatches twice.
    pending.then(result=>{if(result.error)leads.delete(key);},()=>leads.delete(key));
    return pending;
  }
  window.DccLowScoreDispatch = { sources: Object.freeze(demoSources), manufacturerReturn, demoRecords: () => JSON.parse(JSON.stringify(demoAudit)), process, record, recordManual, records: () => JSON.parse(JSON.stringify(audit)) };
})();
