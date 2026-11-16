/* Prototype-only scoring adapter. No score calculation or upstream request is sent. */
(() => {
  'use strict';
  const NO_ANSWER = 'no_answer_dispatch';
  const DORMANT = 'dormant_unreachable';
  const actionResultOptions = [ {value:DORMANT,label:'休眠失联'}, {value:'dormant_no_purchase',label:'休眠未购'}, {value:'closed_invalid',label:'无效结案'}, {value:'closed_lost',label:'战败'} ];
  const defaultActions = {leadStatus:'休眠失联',visitResult:DORMANT,resultReason:'三天四次无法接通',visitDesc:'多次联系，无人接听',intentLevel:'L'};
  const demo = { rules: [], range: null, actions: {...defaultActions}, scenario: 'actual', version: 0, updatedAt: '' };
  const visitResultLabel = value => actionDictionaries('').results.find(item=>item.value===value)?.label || actionResultOptions.find(item=>item.value===value)?.label || value || '';
  // Resolve current dictionary state at edit/save time; execution retains its captured values.
  function actionDictionaries(leadStatus) {
    const dictionary = typeof DICTIONARY_ITEMS === 'undefined' ? null : DICTIONARY_ITEMS;
    const enabled = key => (dictionary?.[key] || []).filter(item=>item.status === '启用').sort((a,b)=>a.order-b.order);
    const statuses = dictionary ? enabled('INITIAL_LEAD_STATUS').filter(item=>item.code !== 'HQ_HIGH_INTENT').map(item=>({value:item.name.replace(/^总部_/,''),label:item.name,code:item.code})) : [];
    const resultCodes = {NEXT_FOLLOW_UP:'next_visit',TEST_DRIVE_SCHEDULE:'test_drive',TEST_DRIVE_LEAD:'test_drive_lead',INTENT_LEAD:'intent_lead',NO_ANSWER_DISPATCH:NO_ANSWER,DORMANT_UNREACHABLE:DORMANT,DORMANT_NOT_PURCHASED:'dormant_no_purchase',INVALID_CLOSED:'closed_invalid',LOST:'closed_lost'};
    const results = dictionary ? enabled('RETURN_VISIT_RESULT').filter(item=>!['NEXT_FOLLOW_UP','TEST_DRIVE_SCHEDULE','TEST_DRIVE_LEAD','INTENT_LEAD'].includes(item.code)).map(item=>({value:resultCodes[item.code] || item.code.toLowerCase(),label:item.name,code:item.code})) : actionResultOptions;
    const reasons = dictionary ? enabled('ABNORMAL_REASON').filter(item=>typeof getAbnormalReasonApplicableLeadStatuses === 'function' && getAbnormalReasonApplicableLeadStatuses(item).some(status=>status.replace(/^总部_/,'') === leadStatus)).map(item=>({value:item.name,label:item.name,code:item.code})) : [];
    return {available:Boolean(dictionary),statuses,results,reasons};
  }
  function validateActionDictionary(actions) {
    const options = actionDictionaries(actions.leadStatus);
    if (!options.available) { if (!actionResultOptions.some(item=>item.value === actions.visitResult)) throw Error('请选择有效的回访结果'); return; }
    if (!options.statuses.some(item=>item.value === actions.leadStatus)) throw Error('请选择已启用的线索状态');
    if (!options.results.some(item=>item.value === actions.visitResult)) throw Error('请选择已启用的回访结果');
    if (actions.resultReason && !options.reasons.some(item=>item.value === actions.resultReason)) throw Error('异常原因不适用于当前线索状态，请重新选择');
  }
  function normalizeActions(value) {
    const actions = Object.fromEntries(Object.keys(defaultActions).map(key=>[key,String(value?.[key] ?? '').trim()]));
    if (!actions.leadStatus || !actions.visitResult || !/^[A-Z]$/.test(actions.intentLevel)) throw Error('请选择有效的线索状态、回访结果和意向级别');
    if (!actions.visitDesc || actions.visitDesc.length > 500) throw Error('回访描述不能为空，且不能超过500字');
    return actions;
  }
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  function parseScore(value) {
    if (value == null || value === '') return null;
    if (typeof value === 'number') return Number.isFinite(value) && value >= 0 ? value : null;
    const match = String(value).trim().match(/^(\d+(?:\.\d+)?)\s*(?:分)?$/);
    return match ? Number(match[1]) : null;
  }
  function validRange(value) {
    return value && Number.isInteger(value.min) && Number.isInteger(value.max) && value.min >= 0 && value.max <= 100 && value.min <= value.max;
  }
  function matchRule(score, rules = demo.rules) {
    return rules.find(rule => matchesLowScore(score, rule.range)) || null;
  }
  function matchesLowScore(score, range) {
    return Boolean(validRange(range) && score != null && Number.isFinite(score) && score >= range.min && score <= range.max);
  }
  function evaluate(result, score, range) {
    return result === NO_ANSWER && matchesLowScore(score, range);
  }
  function conversion(form, actions = demo.actions) { return { ...form, ...normalizeActions(actions) }; }
  function validateConfiguration(range, actions = demo.actions) {
    if (range !== null && !validRange(range)) throw new Error('分数须为 0–100 的整数，且最低分不能高于最高分');
    const normalized = normalizeActions(actions);
    validateActionDictionary(normalized);
    return normalized;
  }
  function configure(range, scenario, actions = demo.actions) {
    const normalized = validateConfiguration(range, actions);
    if (JSON.stringify(demo.range) !== JSON.stringify(range) || JSON.stringify(demo.actions) !== JSON.stringify(normalized)) {
      demo.version += 1; demo.updatedAt = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Shanghai' });
    }
    demo.range = range ? { ...range } : null;
    demo.actions = normalized;
    demo.rules = range ? [{range:{...range},actions:{...normalized}}] : [];
    demo.scenario = scenario || 'actual';
  }
  function configureRules(rules, scenario = demo.scenario) {
    const normalized = validateRules(rules);
    if (JSON.stringify(demo.rules) !== JSON.stringify(normalized)) {
      demo.version += 1;
      demo.updatedAt = new Date().toLocaleString('sv-SE', {timeZone:'Asia/Shanghai'});
    }
    demo.rules = normalized;
    demo.range = normalized[0]?.range ? {...normalized[0].range} : null;
    demo.actions = normalized[0]?.actions ? {...normalized[0].actions} : {...demo.actions};
    demo.scenario = scenario;
  }
  function validateRules(rules) {
    if (!Array.isArray(rules)) throw Error('区间配置格式不正确');
    const normalized = rules.map((rule, index) => {
      if (!validRange(rule.range)) throw Error(`第 ${index + 1} 个区间须为 0–100 的整数，且最低分不能高于最高分`);
      const actions = validateConfiguration(rule.range, rule.actions);
      return {range:{...rule.range},actions:{...actions}};
    });
    const sorted = [...normalized].sort((a,b) => a.range.min-b.range.min);
    for (let i=1;i<sorted.length;i++) {
      if (sorted[i].range.min <= sorted[i-1].range.max) throw Error(`区间 ${sorted[i-1].range.min}–${sorted[i-1].range.max} 与 ${sorted[i].range.min}–${sorted[i].range.max} 重叠，端点不能交集`);
    }
    return normalized;
  }
  function setScenario(scenario) { demo.scenario = scenario || 'actual'; }
  async function query(task, phase) {
    const scenario = demo.scenario;
    const original = task.currentPreScore ?? task.aiInsight?.score ?? task.leadInfo?.initScore ?? task.initScore;
    await wait(phase === 'open' ? 400 : 180);
    if (scenario === 'score-error') throw new Error('评分暂未获取');
    if (scenario === 'none' || (scenario === 'late' && phase === 'open')) return null;
    if (scenario === 'low' || scenario === 'late') return 20;
    if (scenario === 'pass') return 80;
    return parseScore(original);
  }
  function createSession(task, options = {}) {
    const session = {
      taskId: task.id, status: 'idle', score: null, result: '',
      range: null, started: false, disposed: false, submitting: false,
      validationStarted: false,
      freshValidationStarted: false,
      pendingConfirmation: false, requestCounts: { open: 0, submit: 0 },
      current() { return !this.disposed && (!options.isCurrent || options.isCurrent()); },
      notify() { if (this.current()) options.onChange?.(this); },
      hint() {
        const rule = matchRule(this.score);
        if (this.current() && !this.submitting && !this.pendingConfirmation && this.result === NO_ANSWER && rule) {
          this.range = {...rule.range};
          options.onHit?.({ score: this.score, range: { ...rule.range }, actions: {...rule.actions} });
        }
      },
      async start() {
        if (this.started) return;
        this.started = true;
        // The live score is also used by the communication/insight views, even without a conversion range.
        this.status = 'loading'; this.requestCounts.open += 1; this.notify();
        let score = null, status = 'none';
        try { score = parseScore(await (options.query || query)(task, 'open')); status = score == null ? 'none' : 'ready'; }
        catch (_) { status = 'error'; }
        if (!this.current() || this.freshValidationStarted) return;
        this.score = score; this.status = status;
        this.notify(); if (!this.validationStarted) this.hint();
      },
      select(result) { this.result = result; this.hint(); },
      async validate(result) {
        if (!this.current()) return { stale: true };
        this.validationStarted = true;
        this.submitting = true;
        const rules = demo.rules.map(rule=>({range:{...rule.range},actions:{...rule.actions}}));
        const configVersion = demo.version;
        const checked = result === NO_ANSWER && rules.length > 0;
        let score = null;
        if (checked) {
          this.freshValidationStarted = true;
          this.requestCounts.submit += 1;
          try { score = parseScore(await (options.query || query)(task, 'submit')); }
          catch (_) { score = null; }
        }
        if (!this.current()) return { stale: true };
        if (checked) {
          this.score = score; this.status = score == null ? 'none' : 'ready'; this.notify();
        }
        const matched = matchRule(score, rules);
        const range = matched ? {...matched.range} : null;
        this.range = range;
        return { hit: result === NO_ANSWER && Boolean(matched), score, range, result, checked, configVersion, actions: matched ? {...matched.actions} : {...demo.actions} };
      },
      release() { this.submitting = false; this.pendingConfirmation = false; },
      close() { this.disposed = true; this.pendingConfirmation = false; }
    };
    return session;
  }
  function validateFinalFields(form) {
    if (['next_visit','intentional','considering','appointment','test_drive','callback','sms_followup','reject_call','下次回访','试驾排程下发'].includes(form.visitResult) && !String(form.nextVisitTime || '').trim()) {
      throw Error('转换后的回访结果需要填写下次回访时间；请返回补充后重新提交。');
    }
  }
  async function save(form) {
    const scenario = demo.scenario;
    await wait(180);
    if (scenario === 'save-failure') throw new Error('保存失败，请重试。已保留原填写内容。');
    return { ...form };
  }
  window.DccLowScoreVisit = { NO_ANSWER, DORMANT, parseScore, validRange, matchesLowScore, evaluate, conversion, configure, configureRules, validateRules, setScenario, matchRule, validateConfiguration, createSession, save, validateFinalFields, actionResultOptions, actionDictionaries, visitResultLabel, queryDispatchScore: (row, phase) => query({ currentPreScore: row.currentPreScore }, phase), getDemo: () => ({ rules: demo.rules.map(rule=>({range:{...rule.range},actions:{...rule.actions}})), range: demo.range ? { ...demo.range } : null, scenario: demo.scenario, actions: {...demo.actions}, version: demo.version, updatedAt: demo.updatedAt }) };
})();
