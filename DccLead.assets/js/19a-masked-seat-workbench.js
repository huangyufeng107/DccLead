(() => {
  const data = window.dccMaskedWorklist;
  const monitoring = window.maskedMonitoring;
  let privacyTimer;
  let remoteMonitorSettings;
  const monitorLimits = () => remoteMonitorSettings || monitoring.settings();
  const params = new URLSearchParams(location.search);
  const local = params.get('dccMode') === 'local';
  const safe = value => String(value ?? '').replace(/[&<>"']/g, char =>
    ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'})[char]);
  const known = value => safe(value || '—');
  const mobilePattern = '1[3-9][0-9]{9}';
  const mobileNumber = new RegExp('^' + mobilePattern + '$');
  const mobileError = '请输入 11 位中国大陆手机号，例如 13800000000。';
  let account = Object.hasOwn(data.agents, params.get('maskedSeat')) ? params.get('maskedSeat') : 'A001';
  let rows = [];
  let token;
  let requestVersion = 0;
  let verificationTimer;
  let loaded = false;
  const queues = {new: '新任务', today: '当日跟进', overdue: '逾期任务', future: '未来任务'};
  const contacts = {
    connected: '正常接通', no_answer: '无人接听', wechat_follow_up: '企微跟进',
    rejected: '客户拒绝', busy: '忙音/秘书台', invalid: '空号'
  };
  const results = {
    callback: '下次回访', return_no_phone: '回访完成（未取得手机号）', candidate: '提交客户手机号核验'
  };
  const savedResultLabel = result => results[result] || ({recorded:'记录本次跟进', completed:'回访完成', dispatch_store:'下发门店'})[result];
  const shanghai = new Intl.DateTimeFormat('sv-SE', {timeZone:'Asia/Shanghai', dateStyle:'short', timeStyle:'short'});
  const dateTime = value => {
    const time = monitoring.timestamp(value);
    return Number.isFinite(time) ? shanghai.format(time) : '';
  };
  let activeQueue = !local && ['today', 'completed'].includes(params.get('maskedQueue')) ? params.get('maskedQueue') : 'new';
  let selected = '';
  let keyword = '';
  let outboundToolbar;
  let intentCatalog;
  let demoOpen = false;
  let assistantCollapsed = false;
  let assistantTab = 'details';
  let assistantKeyword = '';
  let loading = false;
  let error = '';
  let success = '';
  const predictiveCalls = [];
  const predictiveStatus = {
    queued: '排队中', dialing: '拨号中', waiting_seat: '接通待转坐席', in_call: '坐席通话中',
    ended: '通话已结束', no_answer: '客户未接听', blocked: '拨前拦截', canceled: '已移出队列'
  };
  const predictiveActive = call => ['queued', 'dialing', 'waiting_seat', 'in_call'].includes(call.status);

  const ownedRows = () => (local ? rows : data.demoRows(account)).filter(row => row.owner === account);
  const pendingRows = () => ownedRows().filter(data.pendingFollowup);
  const matchingRows = rows => rows.filter(row => [row.task, row.original, row.name, data.phone(row)]
    .some(value => String(value || '').toLowerCase().includes(keyword.toLowerCase())));
  const privacyLabel = row => data.privacyLabels[data.privacyStatus(row)] || '待取号';
  const privacyDeadline = row => monitoring.timestamp(row.privacy?.expiresAtRaw || row.privacy?.expiresAt);
  const canDial = row => !row.followupComplete && data.privacyStatus(row) === 'available' && privacyDeadline(row) > Date.now();
  const missingVerificationResult = row => !row.followupComplete && !row.followupVerification &&
    row.manualFollowup?.result === 'candidate';

  function predictiveEligibility(row) {
    return row && canDial(row) && Boolean(row.privacy?.number) && !missingVerificationResult(row)
      && (!row.followupVerification || row.followupVerification.status === 'failed');
  }

  const awaitingPredictiveVisit = call => !call.linked && ['ended', 'no_answer'].includes(call.status);
  const predictiveVisitContacts = call => call.status === 'ended' ? ['connected', 'rejected'] : ['no_answer'];

  function renderPredictiveQueue(current) {
    const calls = predictiveCalls.filter(call => call.seat === account);
    const latest = calls.findLast(call => call.taskId === current?.id);
    const displayed = calls.filter(call => predictiveActive(call) || call === latest);
    const enqueue = predictiveEligibility(current) && (!latest || (!predictiveActive(latest) && !awaitingPredictiveVisit(latest)));
    const actions = {
      queued: [['dial', '模拟出队拨号'], ['cancel', '移出队列']],
      dialing: [['connected', '模拟客户接通'], ['no_answer', '模拟未接听']],
      waiting_seat: [['handoff', '转当前坐席']],
      in_call: [['hangup', '结束通话']]
    };
    return `<div class="nt-masked-section-head"><h4>人工预测外呼</h4><span class="sd-tag sd-tag-info">演示</span></div>
      ${current && !current.followupComplete ? `<button type="button" class="nt-page-action" data-masked-predictive="enqueue" ${enqueue ? '' : 'disabled'}>将当前任务加入预测队列</button>` : ''}
      ${displayed.length ? `<ul class="nt-masked-predictive-list">${displayed.map(call => `<li>
        <div><strong>${safe(call.task)}</strong><span class="sd-tag sd-tag-info">${predictiveStatus[call.status]}</span></div>
        ${call.recordId ? `<p>话单 ${safe(call.recordId)}${call.linked ? ' · 已关联回访' : awaitingPredictiveVisit(call) ? ' · 待提交回访' : ''}</p>` : ''}
        ${call.reason ? `<p>${safe(call.reason)}</p>` : ''}
        <div>${(actions[call.status] || []).map(([action, label]) =>
          `<button type="button" class="nt-page-action" data-masked-predictive="${action}" data-call="${call.id}">${label}</button>`).join('')}</div>
      </li>`).join('')}</ul>` : '<p>暂无预测外呼记录。</p>'}`;
  }

  function predictivePanel(row) {
    return `<section class="nt-masked-section nt-masked-predictive" aria-label="人工预测外呼">
      <div data-predictive-queue>${renderPredictiveQueue(row)}</div><p role="status" data-predictive-status></p></section>`;
  }

  function advancePredictive(action, id, current) {
    const call = predictiveCalls.find(item => item.id === Number(id) && item.seat === account);
    const engaged = predictiveCalls.some(item => item.seat === account && predictiveActive(item) && item.status !== 'queued');
    if (action === 'enqueue' && predictiveEligibility(current)) {
      const existing = predictiveCalls.filter(item => item.taskId === current.id);
      if (!existing.some(predictiveActive) && !existing.some(awaitingPredictiveVisit)) {
        predictiveCalls.push({id: predictiveCalls.length + 1, taskId: current.id, task: current.task, seat: account, status: 'queued'});
        return '已加入预测队列。';
      }
    }
    if (call?.status === 'queued' && action === 'cancel') call.status = 'canceled';
    if (call?.status === 'queued' && action === 'dial') {
      if (engaged) return '当前坐席还有一通预测外呼待处理。';
      const row = ownedRows().find(item => item.id === call.taskId);
      if (!predictiveEligibility(row)) {
        call.status = 'blocked';
        call.reason = '任务或隐私号当前不可拨，未发起外呼。';
        return call.reason;
      }
      call.status = 'dialing';
      call.recordId = `DEMO-PRED-${String(call.id).padStart(4, '0')}`;
    }
    if (call?.status === 'dialing' && action === 'connected') call.status = 'waiting_seat';
    if (call?.status === 'dialing' && action === 'no_answer') call.status = 'no_answer';
    if (call?.status === 'waiting_seat' && action === 'handoff') {
      if (!pendingRows().some(row => row.id === call.taskId)) {
        call.status = 'canceled';
        call.reason = '原任务已不在当前坐席的待跟进列表，未转接。';
        return call.reason;
      }
      call.status = 'in_call';
    }
    if (call?.status === 'in_call' && action === 'hangup') call.status = 'ended';
    return call ? predictiveStatus[call.status] : '';
  }

  function queueFor(row) {
    if (row.followupComplete) return 'completed';
    const plan = row.manualFollowup?.nextVisitAt;
    if (plan && monitoring.timestamp(plan) <= Date.now()) return 'overdue';
    const plannedDay = dateTime(plan).slice(0, 10);
    const today = dateTime(Date.now()).slice(0, 10);
    if (plannedDay) {
      if (plannedDay < today) return 'overdue';
      if (plannedDay > today) return 'future';
      return 'today';
    }
    return row.manualFollowup || row.followupVerification ? 'today' : 'new';
  }

  function renderQueues(pending) {
    return `<div class="nt-queue-group nt-group-normal" aria-label="掩码任务队列">
      ${Object.entries(queues).map(([key,label]) => `<div class="nt-queue-block"><button type="button"
        data-nt-masked-queue="${key}" class="nt-queue-header ${activeQueue === key ? 'active' : ''}"
        aria-pressed="${activeQueue === key}"><span class="nt-queue-name">${label}</span>
        <span class="nt-queue-count">${pending.filter(row => queueFor(row) === key).length}</span></button></div>`).join('')}
    </div>`;
  }

  function currentIntent(row) {
    return {carSeriesId: row.series || null, storeId: row.intentionStore || null, ...row.manualFollowup?.intent};
  }

  function seriesLabel(code, row) {
    if (row?.series === code && row.intentSeriesName) return row.intentSeriesName;
    return ({'DEMO-NEV-01': '新能源车系 A（演示）', 'DEMO-NEV-02': '新能源车系 B（演示）'})[code] || code;
  }

  function renderIntentField(name, label, selected, choices) {
    if (selected && !choices.has(selected)) choices.set(selected, selected);
    return `<div class="nt-form-item"><label for="ntMaskedIntent-${name}">${label}</label>
      <select id="ntMaskedIntent-${name}" name="${name}" class="nt-form-ctl nt-input">
        <option value="">暂未确认</option>
        ${[...choices].map(([code, text]) => `<option value="${safe(code)}" ${code === selected ? 'selected' : ''}>${safe(text)}</option>`).join('')}
      </select></div>`;
  }

  function renderFollowupForm(row) {
    const verification = row.followupVerification;
    const visit = row.manualFollowup;
    const locked = row.followupComplete || verification && verification.status !== 'failed';
    const intent = currentIntent(row);
    const series = new Map(intentCatalog.series.map(code => [code, code]));
    for (const code of ['DEMO-NEV-01', 'DEMO-NEV-02']) series.set(code, seriesLabel(code, row));
    const options = values => Object.entries(values).map(([key, label]) =>
      `<option value="${key}">${label}</option>`).join('');
    return `<section class="nt-section nt-visit-form-section nt-masked-visit" aria-label="回访提交">
      <div class="nt-section-header static"><span class="nt-section-title">回访提交</span>
        <span class="nt-masked-result">${verification || missingVerificationResult(row) ? '手机号核验' : row.followupComplete ? '已完成' : '待提交'}</span></div>
      <div class="nt-section-body">
        ${visit?.nextVisitAt ? `<p class="nt-visit-saved nt-masked-current-plan" role="status">
          <strong>当前预约</strong><time datetime="${safe(visit.nextVisitAt)}">${safe(dateTime(visit.nextVisitAt))}</time>
        </p>` : visit && visit.result !== 'candidate' ? `<p class="nt-visit-saved" role="status">上次回访结果 · ${safe(savedResultLabel(visit.result))}</p>` : ''}
        ${verification ? renderVerificationProgress(row) : missingVerificationResult(row)
          ? '<p class="nt-visit-saved" role="status">已提交手机号核验，结果未记录。任务仍在待跟进。</p>' : row.noPhoneReturn
          ? `<p class="nt-visit-saved">${row.noPhoneReturn.doNotContact ? '已退回临时池，保留客户拒绝继续联系的限制。' : '未取得手机号，已退回临时池。'}</p>` : ''}
        ${visit?.note ? `<p class="nt-masked-visit-note">${safe(visit.note)}</p>` : ''}
        ${locked ? '' : `<form class="nt-masked-submit">
          <div class="nt-form-grid">
            <div class="nt-form-item"><label for="ntMaskedContact">接触状态</label>
              <select id="ntMaskedContact" name="contactStatus" class="nt-form-ctl nt-input" required>
                <option value="">请选择接触状态</option>${options(contacts)}</select></div>
            <div class="nt-form-item"><label for="ntMaskedResult">回访结果</label>
              <select id="ntMaskedResult" name="result" class="nt-form-ctl nt-input" required>
                <option value="">请选择回访结果</option>${options(results)}</select></div>
            <div class="nt-form-item nt-form-item-plain"><label>上次回访时间</label>
              <div class="nt-form-ctl nt-plain">${known(dateTime(visit?.visitedAt))}</div></div>
            <div class="nt-form-item" data-masked-field="nextVisitAt" hidden>
              <label for="ntMaskedNextVisit">${visit?.nextVisitAt ? '重新安排回访时间' : '下次回访时间'}</label>
              <input type="datetime-local" class="nt-form-ctl nt-input" id="ntMaskedNextVisit" name="nextVisitAt" aria-describedby="ntMaskedNextVisitError">
              <p id="ntMaskedNextVisitError" class="nt-masked-field-error" role="status" hidden></p></div>
            <div class="nt-form-item" data-masked-field="phone" hidden>
              <label for="ntMaskedCustomerPhone">客户提供的手机号</label>
              <input class="nt-form-ctl nt-input" id="ntMaskedCustomerPhone" name="phone" type="tel" inputmode="numeric"
                autocomplete="off" pattern="${mobilePattern}" aria-describedby="ntMaskedMobileError"
                placeholder="输入 11 位手机号">
              <p id="ntMaskedMobileError" class="nt-masked-field-error" aria-live="polite" hidden></p></div>
            <div class="nt-form-grid nt-form-item-wide">
              ${renderIntentField('carSeriesId', '当前意向车系', intent.carSeriesId, series)}
              <div class="nt-form-item">
                <label for="ntMaskedIntentStore">当前意向专营店</label>
                <input type="hidden" name="storeId" value="${safe(intent.storeId)}">
                <button type="button" id="ntMaskedIntentStore" class="nt-form-ctl nt-select-nav" data-masked-store-picker aria-haspopup="dialog">
                  <span class="nt-select-value ${intent.storeId ? '' : 'placeholder'}">${safe(intentCatalog.storeName(intent.storeId) || '请选择意向专营店')}</span>
                  <span class="nt-select-arrow-r" aria-hidden="true">›</span>
                </button>
              </div>
            </div>
            <div class="nt-form-item nt-form-item-wide"><label for="ntMaskedVisitNote">回访描述</label>
              <textarea id="ntMaskedVisitNote" class="nt-form-ctl nt-textarea" name="note" rows="3" maxlength="500"
                placeholder="填写本次沟通内容和约定事项"></textarea></div>
            <div class="nt-form-item-wide" data-masked-return-restriction hidden><label><input type="checkbox" name="doNotContact" disabled> 客户明确要求停止后续联系</label></div>
          </div>
          <p class="nt-masked-return-note" data-nt-masked-return-note hidden>填写未取得手机号的经过。临时池接收后，任务将退出您的待跟进。</p>
          <p class="nt-masked-feedback" role="status" data-nt-masked-submit-status></p>
          <div class="nt-form-actions"><button class="nt-btn nt-btn-primary" type="submit">回访提交</button></div>
        </form>`}
      </div>
    </section>`;
  }

  function verificationLabel(verification) {
    if (!verification) return '待提交';
    if (verification.status === 'passed') {
      return '核验通过，任务已完成';
    }
    return {pending:'已提交，核验中', timed_out:'核验超时待确认', failed:'核验未通过'}[verification.status] || '待核验';
  }

  function verificationTone(verification) {
    if (verification.status === 'passed') return 'success';
    if (verification.status === 'failed') return 'danger';
    return verification.status === 'timed_out' ? 'warning' : 'info';
  }

  function renderVerificationProgress(row) {
    const verification = row.followupVerification;
    const label = verificationLabel(verification);
    const guidance = verification.status === 'failed'
      ? (canDial(row) ? '可继续跟进，确认后提交更正号码。' : '隐私号当前不可拨，请查看任务状态。')
      : verification.status === 'passed'
        ? '总部 DCC 已取得临时池的核验通过结果。'
        : '等待临时池反馈核验结果，任务暂留在待跟进。';
    return `<div class="nt-masked-verification" data-tone="${verificationTone(verification)}" role="status">
      <strong>${label}</strong>
      <div class="nt-masked-verification-meta"><span>已提交号码 ${known(verification.maskedPhone)}</span>
        <span>提交时间 ${known(dateTime(verification.submittedAt))}</span></div>
      ${verification.status === 'failed' && verification.reason ? `<div>未通过原因编码 ${safe(verification.reason)}</div>` : ''}
      <div>${guidance}</div>
    </div>`;
  }

  function privacyReminder(row, now, limits) {
    const alert = monitoring.privacyAlert(row, now, data.privacyStatus(row), limits);
    if (alert?.type === 'expired') return '隐私号已失效';
    if (alert?.type !== 'expiry' || alert.priority !== 0) return '';
    return '隐私号即将失效 · 剩余 ' + monitoring.duration(alert.at - now);
  }

  function expiryGuidance(row) {
    if (row.followupComplete || data.privacyStatus(row) !== 'expired') return '';
    const verification = row.followupVerification;
    if (verification && ['pending', 'timed_out'].includes(verification.status)
      && monitoring.timestamp(verification.submittedAt) < privacyDeadline(row)) {
      return '到期前提交的候选号码仍可继续核验，请查看原提交的核验结果。';
    }
    if (missingVerificationResult(row)) return '请核对原提交的核验记录。';
    return '是否可以重新取号及任务后续去向待确认。';
  }

  function card(row, now, limits) {
    return `<button type="button" class="nt-task-card ${row.id === selected ? 'active' : ''}"
      data-nt-masked-task="${safe(row.id)}" aria-pressed="${row.id === selected}">
      <span class="nt-task-card-top"><span class="nt-task-name" title="${known(row.name || row.original || row.task)}">${known(row.name || row.original || row.task)}</span>
        ${row.followupComplete ? '' : `<span data-privacy-card-status class="sd-tag sd-tag-${data.privacyTones[data.privacyStatus(row)] || 'info'}">${privacyLabel(row)}</span>`}</span>
      <span class="nt-task-card-bottom"><span class="nt-task-phone">${[data.phone(row), seriesLabel(currentIntent(row).carSeriesId, row)].filter(Boolean).map(safe).join(' · ')}</span></span>
      ${row.followupVerification ? `<span class="nt-masked-verification-card sd-tag sd-tag-${verificationTone(row.followupVerification)}">${verificationLabel(row.followupVerification)}</span>` : ''}
      ${missingVerificationResult(row) ? '<span class="nt-masked-verification-card sd-tag sd-tag-info">核验结果未记录</span>' : ''}
      <span class="nt-masked-privacy-card" data-privacy-card>${safe(privacyReminder(row, now, limits))}</span>
      ${row.manualFollowup?.nextVisitAt ? `<span class="nt-masked-card-time">预约回访 ${safe(dateTime(row.manualFollowup.nextVisitAt))}</span>` : ''}</button>`;
  }

  function detail(row) {
    return `<section class="nt-masked-detail">
      <header><h3>${known(row.name || row.original || row.task)}</h3><span>人工跟进 · ${safe(account)}</span></header>
      <div class="nt-masked-follow-main">
      <p class="nt-masked-privacy-banner" data-privacy-banner role="status"></p>
      <section class="nt-masked-section" aria-label="隐私号外呼">
        <div class="nt-masked-section-head"><h4>隐私号外呼</h4>
          ${row.followupComplete ? '<span class="sd-tag sd-tag-info">任务已完成</span>'
            : `<span class="sd-tag sd-tag-${data.privacyTones[data.privacyStatus(row)] || 'info'}">${privacyLabel(row)}</span>`}</div>
        <dl class="nt-masked-fields"><div><dt>隐私号</dt><dd>${known(row.privacy?.number)}</dd></div>
        <div><dt>失效截止时间</dt><dd>${known(row.privacy?.expiresAt)}</dd></div></dl>
        ${row.privacy?.reason ? `<p class="nt-masked-feedback">${safe(row.privacy.reason)}</p>` : ''}
        <p class="nt-masked-feedback" data-expiry-guidance role="status" hidden></p>
      </section>
      ${local ? '' : predictivePanel(row)}
      ${renderFollowupForm(row)}
      </div>
    </section>`;
  }

  function renderAssistant(row) {
    const records = row?.manualFollowupHistory || (row?.manualFollowup ? [row.manualFollowup] : []);
    const groups = row ? [
      ['基础信息', [['客户姓名', row.name], ['原始掩码号', data.phone(row)], ['隐私号状态', privacyLabel(row)]]],
      ['来源与意向信息', [['线索来源', row.entry], ['渠道编码', row.channel], ['SmartCode', data.smartcode(row)],
        ['原意向车系', row.intentSeriesName || row.series], ['原意向门店 ID', row.intentionStore], ['送池门店 ID', row.store],
        ...(row.manualFollowup?.intent ? [['当前意向车系', seriesLabel(currentIntent(row).carSeriesId, row) || '暂未确认'],
          ['当前意向专营店', intentCatalog.storeName(currentIntent(row).storeId) || '暂未确认']] : [])]],
      ['业务标识信息', [['任务编码', row.task], ['原线索 ID', row.original]]]
    ] : [];
    const filtered = groups.map(([title, fields]) => [title, fields.filter(([label, value]) =>
      !assistantKeyword || [label, value].some(item => String(item || '').toLowerCase().includes(assistantKeyword.toLowerCase())))])
      .filter(([, fields]) => fields.length);
    let body = '<p class="nt-masked-assistant-empty">请选择一条掩码任务。</p>';
    if (row && assistantTab === 'details') {
      body = filtered.map(([title, fields], index) => `<details class="nt-masked-lead-group" ${assistantKeyword || index === 0 || index === 1 ? 'open' : ''}>
          <summary><strong>${title}</strong><span>${fields.length} 项</span></summary>
          <dl>${fields.map(([label,value]) => `<div><dt>${label}</dt><dd${label === '隐私号状态' ? ' data-privacy-assistant-status' : ''}>${known(value)}</dd></div>`).join('')}</dl>
        </details>`).join('') || '<p class="nt-masked-assistant-empty">未找到符合条件的线索字段。</p>';
    }
    if (row && assistantTab === 'records') {
      body = records.map(record => `<article class="nt-masked-lead-group nt-masked-visit-record">
        <strong>${known(savedResultLabel(record.result))}</strong>
        <div>${known(contacts[record.contactStatus] || (record.contactStatus === 'not_called' ? '未外呼' : ''))} · 跟进于 ${known(dateTime(record.visitedAt))}</div>
        ${record.nextVisitAt ? `<div>当时预约 ${safe(dateTime(record.nextVisitAt))}</div>` : ''}
        ${record.intent ? `<div>${[
          Object.hasOwn(record.intent, 'carSeriesId') ? '意向车系 ' + (seriesLabel(record.intent.carSeriesId, row) || '暂未确认') : '',
          Object.hasOwn(record.intent, 'storeId') ? '意向专营店 ' + (intentCatalog.storeName(record.intent.storeId) || '暂未确认') : ''
        ].filter(Boolean).map(safe).join(' · ')}</div>` : ''}
        ${record.note ? `<p>${safe(record.note)}</p>` : ''}
        ${record.predictiveRecordId ? `<p>人工预测外呼话单 ${safe(record.predictiveRecordId)}</p>` : ''}
      </article>`).join('') || '<p class="nt-masked-assistant-empty">暂无回访记录。</p>';
    }
    const tabs = [['details','线索详情'], ['records','回访记录']];
    return `<aside class="nt-right-panel nt-masked-assistant" aria-label="客户辅助信息">
      <div class="nt-assistant-header"><h3>客户辅助信息</h3>
        <button type="button" class="nt-assistant-close" aria-label="关闭客户辅助信息" data-masked-assistant-close>×</button></div>
      <form class="nt-search-ai nt-masked-assistant-search">
        <input class="nt-search-ai-input" name="query" aria-label="搜索线索字段" placeholder="搜索线索字段" value="${safe(assistantKeyword)}">
        <button class="nt-search-ai-btn" type="submit">搜 索</button></form>
      <div class="nt-right-tabs" role="tablist" aria-label="客户辅助信息">
        ${tabs.map(([key,label]) => `<button type="button" class="nt-rt-tab ${assistantTab === key ? 'active' : ''}"
          data-masked-assistant-tab="${key}" role="tab" aria-selected="${assistantTab === key}">
          ${label}${key === 'records' ? `<span class="nt-rt-count">${records.length}</span>` : ''}</button>`).join('')}
      </div>
      <div class="nt-right-body">${body}</div>
    </aside>`;
  }

  function renderDemoSettings() {
    return `<details class="nt-visit-demo nt-masked-demo" ${demoOpen ? 'open' : ''}>
      <summary>原型演示设置</summary>
      <p>切换坐席，查看该坐席的抖音掩码待办。</p>
      <form class="nt-visit-demo-row">
        <label>演示坐席
          <select name="seat" ${loading ? 'disabled' : ''}>${Object.entries(data.agents).map(([key, name]) =>
            `<option value="${key}" ${key === account ? 'selected' : ''}>${safe(name)}（${key}）</option>`).join('')}</select>
        </label>
        <div class="nt-visit-demo-actions"><button type="submit" class="nt-btn nt-btn-default" ${loading ? 'disabled' : ''}>应用演示设置</button></div>
      </form>
    </details>`;
  }

  function render(page, tabs, switchScope, focus) {
    clearTimeout(privacyTimer);
    const demoFocus = focus === '.nt-masked-demo summary';
    const centerScroll = demoFocus ? page.querySelector('.nt-masked-center')?.scrollTop : 0;
    const pending = pendingRows();
    const completed = ownedRows().filter(row => row.followupComplete);
    const completeView = activeQueue === 'completed';
    const matches = matchingRows(completeView ? completed : pending);
    if (loading === false && !matches.some(row => queueFor(row) === activeQueue) && focus === '[name="keyword"]' && keyword && matches.length) {
      activeQueue = queueFor(matches[0]);
    }
    const now = Date.now();
    const limits = monitorLimits();
    const urgent = row => monitoring.privacyAlert(row, now, data.privacyStatus(row), limits)?.type === 'expiry'
      && Boolean(privacyReminder(row, now, limits));
    let visible = matches.filter(row => queueFor(row) === activeQueue)
      .sort((a, b) => Number(urgent(b)) - Number(urgent(a)));
    const current = visible.find(row => row.id === selected) || visible[0];
    selected = current?.id || '';
    const dialPhone = () => current && canDial(current) ? current.privacy?.number || null : null;
    const renderItems = (time, thresholds) => visible.length ? visible.map(row => card(row, time, thresholds)).join('') :
      `<div class="nt-queue-empty">${loading || error ? '' : keyword ? '暂无符合查询条件的掩码任务' : completeView ? '暂无已完成的掩码任务' : '暂无待跟进的掩码任务'}</div>`;
    page.innerHTML = `<div class="nt-page-shell">
      ${outboundToolbar.render({masked: true, assistantCollapsed, dialPhone: dialPhone()})}
      <div class="nt-workspace nt-masked-workspace ${assistantCollapsed ? 'assistant-collapsed' : ''}" role="region" aria-label="抖音掩码人工外呼">
        <aside class="nt-left-panel">
          <div class="nt-panel-head"><span class="nt-panel-title">外呼列表</span>${tabs()}
            <form class="nt-search-box nt-masked-search" aria-label="搜索掩码任务">
              <input class="nt-search-input" name="keyword" value="${safe(keyword)}" aria-label="任务编码、线索 ID 或号码尾号"
                placeholder="任务编码、线索 ID 或号码尾号">
              <button class="nt-search-icon-btn" aria-label="查询" type="submit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </button>
            </form></div>
          <div class="nt-queue-list">
            <div class="nt-masked-counts">
              <button type="button" data-nt-mask-phase="pending" aria-pressed="${!completeView}">待跟进 <b>${pending.length}</b></button>
              <button type="button" data-nt-mask-phase="complete" aria-pressed="${completeView}">已完成 <b>${completed.length}</b></button>
            </div>
            <p class="nt-masked-list-status" role="status">${safe(error || success || (loading ? '正在读取掩码待办…' : ''))}</p>
            ${completeView ? '' : renderQueues(pending)}
            <div class="nt-queue-items nt-active-queue-items">${renderItems(now, limits)}</div>
          </div>
        </aside>
        <main class="nt-center-panel nt-masked-center">
          ${current ? detail(current) : '<div class="nt-queue-empty">待跟进任务的留资线索与跟进结果将在这里显示</div>'}
          ${!local && !current && predictiveCalls.some(call => call.seat === account && predictiveActive(call)) ? predictivePanel() : ''}
          <div class="nt-masked-demo-footer">${renderDemoSettings()}</div>
        </main>
        <div class="nt-masked-assistant-slot" ${assistantCollapsed ? 'hidden' : ''}>${renderAssistant(current)}</div>
      </div>
      ${outboundToolbar.dialogs(dialPhone())}
    </div>`;
    const shell = page.querySelector('.nt-masked-workspace');
    const updatePrivacy = async (reloadLimits = false) => {
      if (!shell.isConnected || !page.getClientRects().length) return;
      if (reloadLimits && local && token) {
        try {
          const result = await data.request('monitor-settings', undefined, token);
          if (!shell.isConnected) return;
          if (monitoring.validSettings(result.monitorSettings)) remoteMonitorSettings = result.monitorSettings;
        } catch { /* Keep the latest available threshold and retry next time. */ }
      }
      const time = Date.now();
      const latest = monitorLimits();
      if (!completeView) {
        if (current) activeQueue = queueFor(current);
        const list = shell.querySelector('.nt-active-queue-items');
        const nextVisible = matches.filter(row => queueFor(row) === activeQueue);
        if (nextVisible.length !== visible.length || nextVisible.some(row => !visible.includes(row))) {
          if (!current && nextVisible.length) {
            render(page, tabs, switchScope);
            return;
          }
          const focusedTask = list.contains(document.activeElement) ? document.activeElement.dataset.ntMaskedTask : '';
          visible = nextVisible;
          list.innerHTML = renderItems(time, latest);
          if (focusedTask) [...list.querySelectorAll('[data-nt-masked-task]')]
            .find(button => button.dataset.ntMaskedTask === focusedTask)?.focus({preventScroll:true});
        }
        shell.querySelectorAll('[data-nt-masked-queue]').forEach(button => {
          const key = button.dataset.ntMaskedQueue;
          button.classList.toggle('active', key === activeQueue);
          button.setAttribute('aria-pressed', String(key === activeQueue));
          button.querySelector('.nt-queue-count').textContent = pending.filter(row => queueFor(row) === key).length;
        });
        const planLabel = shell.querySelector('.nt-masked-current-plan strong');
        if (planLabel) planLabel.textContent = activeQueue === 'overdue' ? '回访逾期' : '当前预约';
      }
      const items = [...shell.querySelectorAll('[data-nt-masked-task]')];
      const ranked = items.map(button => {
        const row = visible.find(item => item.id === button.dataset.ntMaskedTask);
        const reminder = privacyReminder(row, time, latest);
        button.querySelector('[data-privacy-card]').textContent = reminder;
        const status = button.querySelector('[data-privacy-card-status]');
        if (status) {
          status.textContent = privacyLabel(row);
          status.className = 'sd-tag sd-tag-' + (data.privacyTones[data.privacyStatus(row)] || 'info');
        }
        return {button, urgent: reminder.startsWith('隐私号即将失效')};
      }).sort((a, b) => Number(b.urgent) - Number(a.urgent));
      ranked.forEach(({button}, index) => {
        if (button.parentElement.children[index] !== button) button.parentElement.insertBefore(button, button.parentElement.children[index]);
      });
      if (current) {
        const enqueue = shell.querySelector('[data-masked-predictive="enqueue"]');
        if (enqueue && !predictiveEligibility(current)) enqueue.disabled = true;
        const banner = shell.querySelector('[data-privacy-banner]');
        const reminder = privacyReminder(current, time, latest);
        const deadline = current.privacy?.expiresAtRaw || current.privacy?.expiresAt;
        banner.textContent = reminder.startsWith('隐私号即将失效')
          ? reminder + '，截止 ' + dateTime(deadline) + '，请优先外呼。' : reminder;
        const guidance = shell.querySelector('[data-expiry-guidance]');
        const nextGuidance = expiryGuidance(current);
        if (guidance.textContent !== nextGuidance) guidance.textContent = nextGuidance;
        guidance.hidden = !nextGuidance;
        const expired = data.privacyStatus(current) === 'expired' && !current.followupComplete;
        if (expired) {
          page.querySelectorAll('[data-nt-outbound-action="dial"], [data-nt-outbound-action="open-dial-modal"], [data-nt-outbound-action="submit-dial"]')
            .forEach(button => { button.disabled = true; });
          const dialStatus = page.querySelector('[data-masked-dial-status]');
          if (dialStatus) {
            dialStatus.classList.add('is-expired');
            dialStatus.textContent = '当前任务的隐私号已失效，无法拨打。';
          }
          const status = shell.querySelector('[aria-label="隐私号外呼"] .sd-tag');
          status.textContent = '已失效';
          status.className = 'sd-tag sd-tag-danger';
          const assistantStatus = shell.querySelector('[data-privacy-assistant-status]');
          if (assistantStatus) assistantStatus.textContent = status.textContent;
        }
      }
      const boundary = pending.reduce((next, row) => {
        const planned = monitoring.timestamp(row.manualFollowup?.nextVisitAt);
        const expiry = monitoring.timestamp(row.privacy?.expiresAtRaw || row.privacy?.expiresAt);
        return Math.min(next, planned > time ? planned : Infinity, expiry > time ? expiry : Infinity);
      }, Infinity);
      const delay = Math.min(30_000, boundary - time);
      privacyTimer = setTimeout(() => updatePrivacy(delay < boundary - time), delay);
    };
    updatePrivacy();
    const updateAssistant = () => {
      const slot = page.querySelector('.nt-masked-assistant-slot');
      slot.hidden = assistantCollapsed;
      slot.innerHTML = renderAssistant(current);
      slot.closest('.nt-workspace').classList.toggle('assistant-collapsed', assistantCollapsed);
      page.querySelector('[data-nt-top-menu-action="toggle-assistant"]').textContent =
        assistantCollapsed ? '展开辅助信息' : '收起辅助信息';
    };
    const redrawToolbar = () => {
      const options = {masked: true, assistantCollapsed, dialPhone: dialPhone()};
      const template = document.createElement('template');
      template.innerHTML = outboundToolbar.render(options);
      page.querySelector('.nt-outbound-wrap').replaceWith(template.content.querySelector('.nt-outbound-wrap'));
      page.querySelector('.nt-outbound-modal-mask')?.remove();
      page.querySelector('.nt-page-shell').insertAdjacentHTML('beforeend', outboundToolbar.dialogs(dialPhone()));
      page.querySelector('.nt-outbound-modal-mask button')?.focus();
    };
    const scopeSelector = page.querySelector('[data-task-scope-select]');
    scopeSelector.addEventListener('change', () => switchScope(scopeSelector.value));
    page.onclick = event => {
      const predictive = event.target.closest('[data-masked-predictive]');
      if (predictive && !local) {
        const {maskedPredictive, call} = predictive.dataset;
        const message = advancePredictive(maskedPredictive, call, current);
        const panel = shell.querySelector('[data-predictive-queue]');
        panel.innerHTML = renderPredictiveQueue(current);
        shell.querySelector('[data-predictive-status]').textContent = message;
        const next = panel.querySelector(`[data-call="${Number(call)}"]`) || panel.querySelector('[data-masked-predictive]:enabled');
        next?.focus({preventScroll: true});
        return;
      }
      const storeTrigger = event.target.closest('[data-masked-store-picker]');
      if (storeTrigger) {
        const form = storeTrigger.form;
        const field = form.elements.storeId;
        intentCatalog.pickStore(field.value, storeTrigger, store => {
          if (!form.isConnected) return;
          field.value = store?.code || '';
          const value = storeTrigger.querySelector('.nt-select-value');
          value.textContent = store?.name || '请选择意向专营店';
          value.classList.toggle('placeholder', !store);
          delete form.dataset.submissionId;
        });
        return;
      }
      const outboundAction = event.target.closest('[data-nt-outbound-action], [data-nt-top-action]');
      if (outboundAction) {
        outboundToolbar.handle(page, outboundAction.dataset.ntOutboundAction || outboundAction.dataset.ntTopAction,
          redrawToolbar, dialPhone());
        return;
      }
      const toggle = event.target.closest('[data-nt-top-menu-action], [data-masked-assistant-close]');
      if (toggle) {
        const showRecords = toggle.dataset.ntTopMenuAction === 'open-records';
        if (showRecords) assistantTab = 'records';
        assistantCollapsed = showRecords ? false : toggle.hasAttribute('data-masked-assistant-close') || !assistantCollapsed;
        updateAssistant();
        const focusTarget = assistantCollapsed ? '[data-nt-top-menu-action="toggle-assistant"]' : '[data-masked-assistant-tab][aria-selected="true"]';
        page.querySelector(focusTarget)?.focus();
        return;
      }
      const tab = event.target.closest('[data-masked-assistant-tab]');
      if (tab) {
        assistantTab = tab.dataset.maskedAssistantTab;
        assistantKeyword = '';
        updateAssistant();
        page.querySelector('[data-masked-assistant-tab][aria-selected="true"]')?.focus();
        return;
      }
      const phase = event.target.closest('[data-nt-mask-phase]');
      if (phase) {
        const nextQueue = phase.dataset.ntMaskPhase === 'complete' ? 'completed' : completeView ? 'new' : activeQueue;
        if (nextQueue === activeQueue) return;
        activeQueue = nextQueue;
        selected = assistantKeyword = '';
        render(page, tabs, switchScope, '[data-nt-mask-phase][aria-pressed="true"]');
        return;
      }
      const queue = event.target.closest('[data-nt-masked-queue]');
      if (queue) {
        activeQueue = queue.dataset.ntMaskedQueue;
        assistantKeyword = '';
        selected = '';
        render(page, tabs, switchScope, '[data-nt-masked-queue][aria-pressed="true"]');
        return;
      }
      const task = event.target.closest('[data-nt-masked-task]');
      if (task) {
        selected = task.dataset.ntMaskedTask;
        assistantKeyword = '';
        render(page, tabs, switchScope, '[aria-pressed="true"][data-nt-masked-task]');
        return;
      }
    };
    page.onkeydown = event => {
      if (event.key !== 'Escape') return;
      const control = page.querySelector('.nt-outbound-modal-mask [data-nt-outbound-action]');
      if (control) outboundToolbar.handle(page, control.dataset.ntOutboundAction, redrawToolbar, dialPhone());
    };
    page.onsubmit = event => {
      if (!event.target.matches('.nt-masked-assistant-search')) return;
      event.preventDefault();
      assistantKeyword = event.target.elements.query.value.trim();
      assistantTab = 'details';
      updateAssistant();
      page.querySelector('.nt-masked-assistant-search input')?.focus();
    };
    page.querySelector('.nt-masked-search').onsubmit = event => {
      event.preventDefault();
      keyword = event.currentTarget.elements.keyword.value.trim();
      success = '';
      if (local) load(page, tabs, switchScope, '[name="keyword"]');
      else render(page, tabs, switchScope, '[name="keyword"]');
    };
    const demo = page.querySelector('.nt-masked-demo');
    demo.addEventListener('toggle', () => { if (demo.isConnected) demoOpen = demo.open; });
    demo.querySelector('form').onsubmit = event => {
      event.preventDefault();
      const nextAccount = event.currentTarget.elements.seat.value;
      if (loading || !Object.hasOwn(data.agents, nextAccount) || nextAccount === account) return;
      demoOpen = true;
      account = nextAccount;
      selected = keyword = error = assistantKeyword = '';
      success = '已切换至 ' + data.agents[account] + '（' + account + '）。';
      activeQueue = 'new';
      token = undefined;
      rows = [];
      loaded = false;
      if (local) load(page, tabs, switchScope, '.nt-masked-demo summary');
      else render(page, tabs, switchScope, '.nt-masked-demo summary');
    };
    const form = page.querySelector('.nt-masked-submit');
    if (form) {
      const {contactStatus, result, phone, nextVisitAt, doNotContact} = form.elements;
      const phoneError = form.querySelector('#ntMaskedMobileError');
      const nextVisitError = form.querySelector('#ntMaskedNextVisitError');
      const expiry = monitoring.timestamp(current.privacy?.expiresAtRaw || current.privacy?.expiresAt);
      const validateNextVisit = () => {
        const planned = monitoring.timestamp(nextVisitAt.value + '+08:00');
        const invalid = !nextVisitAt.disabled && Number.isFinite(expiry) && planned >= expiry;
        if (invalid) nextVisitAt.setAttribute('aria-invalid', 'true');
        else nextVisitAt.removeAttribute('aria-invalid');
        nextVisitError.hidden = !invalid;
        nextVisitError.textContent = invalid ? '该号码届时已失效，请改选隐私号截止时间前的回访时间。' : '';
        return !invalid;
      };
      const validatePhone = (showIncomplete = false) => {
        const value = phone.value;
        const invalid = !phone.disabled && (value ? !mobileNumber.test(value) : showIncomplete);
        const incomplete = /^1(?:[3-9][0-9]*)?$/.test(value) && value.length < 11;
        const show = invalid && (showIncomplete || !incomplete);
        phone.setCustomValidity(invalid ? mobileError : '');
        if (show) phone.setAttribute('aria-invalid', 'true');
        else phone.removeAttribute('aria-invalid');
        phoneError.hidden = !show;
        phoneError.textContent = show ? mobileError : '';
      };
      phone.addEventListener('input', () => validatePhone());
      phone.addEventListener('blur', () => validatePhone(Boolean(phone.value)));
      phone.addEventListener('invalid', () => validatePhone(true));
      nextVisitAt.addEventListener('input', validateNextVisit);
      const sync = () => {
        const candidate = result.querySelector('[value="candidate"]');
        candidate.disabled = !canDial(current) || contactStatus.value !== 'connected';
        if (candidate.disabled && result.value === 'candidate') result.value = '';
        Object.entries({phone, nextVisitAt}).forEach(([key, input]) => {
          const visible = result.value === (key === 'phone' ? 'candidate' : 'callback');
          input.closest('[data-masked-field]').hidden = !visible;
          input.disabled = !visible;
          input.required = visible;
        });
        validatePhone();
        validateNextVisit();
        const returning = result.value === 'return_no_phone';
        const canMarkRestriction = returning && contactStatus.value === 'rejected';
        doNotContact.disabled = !canMarkRestriction;
        doNotContact.closest('[data-masked-return-restriction]').hidden = !canMarkRestriction;
        if (!canMarkRestriction) doNotContact.checked = false;
        form.elements.note.required = returning;
        form.querySelector('[data-nt-masked-return-note]').hidden = !returning;
        form.querySelector('[type=submit]').textContent = returning ? '确认退回临时池'
          : result.value === 'candidate' ? '提交核验' : '回访提交';
      };
      form.onchange = sync;
      form.oninput = () => { delete form.dataset.submissionId; };
      form.onsubmit = event => {
        event.preventDefault();
        if (!validateNextVisit()) {
          nextVisitAt.focus();
          return;
        }
        submit(page, tabs, switchScope, form, current);
      };
      sync();
    }
    if (demoFocus) page.querySelector('.nt-masked-center').scrollTop = centerScroll || 0;
    if (focus) page.querySelector(focus)?.focus({preventScroll: !demoFocus});
    watchVerification(page, tabs, switchScope, current);
  }

  function watchVerification(page, tabs, switchScope, current) {
    clearTimeout(verificationTimer);
    const verification = current?.followupVerification;
    if (!local || loading || !token || current?.followupComplete || !verification || verification.status === 'failed') return;
    const panel = page.querySelector('.nt-masked-workspace');
    const status = verificationLabel(verification);
    const version = requestVersion;
    verificationTimer = setTimeout(async () => {
      if (!panel.isConnected || version !== requestVersion) return;
      try {
        const result = await data.request('tasks', undefined, token);
        if (!panel.isConnected || version !== requestVersion) return;
        rows = result.items.map(data.read);
        const updated = rows.find(row => row.id === current.id);
        if (updated?.followupComplete) success = '已取得临时池的核验通过结果，任务已计入已完成。';
        if (!updated || updated.followupComplete || verificationLabel(updated.followupVerification) !== status) {
          render(page, tabs, switchScope);
          return;
        }
      } catch {
        // Keep the last result and check again while this task is open.
      }
      if (panel.isConnected && version === requestVersion) watchVerification(page, tabs, switchScope, current);
    }, 2500);
  }

  async function load(page, tabs, switchScope, focus) {
    const version = ++requestVersion;
    const seat = account;
    loading = true;
    error = '';
    render(page, tabs, switchScope, focus);
    try {
      const session = token || (await data.request('session', {account: seat})).token;
      const result = await data.request('tasks', undefined, session);
      if (version !== requestVersion) return;
      token = session;
      if (monitoring.validSettings(result.monitorSettings)) remoteMonitorSettings = result.monitorSettings;
      rows = result.items.map(data.read);
      loaded = true;
    } catch {
      if (version !== requestVersion) return;
      error = '暂时无法读取掩码任务，请重新查询。';
    }
    if (version !== requestVersion) return;
    loading = false;
    if (page.querySelector('.nt-masked-workspace')) render(page, tabs, switchScope, focus);
  }

  async function submit(page, tabs, switchScope, form, row) {
    const button = form.querySelector('button[type=submit]');
    const feedback = form.querySelector('[data-nt-masked-submit-status]');
    if (button.disabled) return;
    const {phone, carSeriesId, storeId, doNotContact, ...visit} = Object.fromEntries(new FormData(form));
    if (doNotContact) visit.doNotContact = true;
    const originalIntent = currentIntent(row);
    const selectedIntent = {carSeriesId: carSeriesId || null, storeId: storeId || null};
    const updates = Object.entries(selectedIntent).filter(([key, value]) => value !== originalIntent[key]);
    if (updates.length) visit.intent = Object.fromEntries(updates);
    const savedIntent = {...row.manualFollowup?.intent, ...visit.intent};
    visit.nextVisitAt ||= '';
    const submittingNumber = visit.result === 'candidate';
    const returning = visit.result === 'return_no_phone';
    if (returning && !visit.note.trim()) { feedback.textContent = '请填写跟进经过或客户未提供手机号的原因。'; return; }
    if (submittingNumber && !mobileNumber.test(phone || '')) { feedback.textContent = mobileError; return; }
    // An unchanged retry may retrieve a receipt for a submission accepted before expiry.
    if (submittingNumber && !canDial(row) && !(local && form.dataset.submissionId)) {
      feedback.textContent = '隐私号当前不可拨。';
      return;
    }
    if (!local && visit.result === 'callback' && visit.nextVisitAt <= dateTime(Date.now()).replace(' ', 'T')) {
      feedback.textContent = '下次回访时间须晚于当前时间。';
      return;
    }
    if (!local && /(?<!\d)1\d{10}(?!\d)/.test(visit.note)) {
      feedback.textContent = '请仅在手机号字段提交完整手机号。';
      return;
    }
    const prefix = 'tasks/' + encodeURIComponent(row.id) + '/';
    const previousRecords = row.manualFollowupHistory || (row.manualFollowup ? [row.manualFollowup] : []);
    const predictiveCall = !local && predictiveCalls.findLast(call => call.taskId === row.id && call.seat === account);
    if (predictiveCall && predictiveActive(predictiveCall)) {
      feedback.textContent = '请先处理该任务的预测外呼，再提交回访。';
      return;
    }
    if (predictiveCall && awaitingPredictiveVisit(predictiveCall)) {
      const allowed = predictiveVisitContacts(predictiveCall);
      if (!allowed.includes(visit.contactStatus)) {
        feedback.textContent = `请按本次预测话单选择${allowed.map(status => `「${contacts[status]}」`).join('或')}，再提交回访。`;
        return;
      }
    }
    button.disabled = true;
    const grid = form.querySelector('.nt-form-grid');
    grid.inert = true;
    try {
      let message = '已保存本次回访。';
      if (submittingNumber) {
        if (local) {
          form.dataset.submissionId ||= crypto.randomUUID();
          row.followupVerification = await data.request(prefix + 'candidates',
            {submissionId: form.dataset.submissionId, phone, visitNote: visit.note, ...(visit.intent ? {intent: visit.intent} : {})}, token);
          row.followupComplete = row.followupVerification.status === 'passed';
          message = row.followupComplete ? '已取得临时池的核验通过结果，任务已计入已完成。' :
            '已提交临时池核验，收到核验通过结果后计入已完成。';
        } else {
          row.followupVerification = {maskedPhone: phone.slice(0,3) + '****' + phone.slice(-4),
            status: 'passed'};
          row.followupComplete = true;
          message = '演示核验通过，任务已计入已完成。';
        }
        row.manualFollowup = {...visit, ...(Object.keys(savedIntent).length ? {intent: savedIntent} : {}),
          visitedAt: row.followupVerification.submittedAt || new Date().toISOString(),
          submittedBy: account, submittedMaskedPhone: row.followupVerification.maskedPhone};
      } else {
        row.manualFollowup = local ? await data.request(prefix + 'followup', visit, token) : {
          ...visit, ...(Object.keys(savedIntent).length ? {intent: savedIntent} : {}), nextVisitAt: visit.nextVisitAt ? visit.nextVisitAt + '+08:00' : null, visitedAt: new Date().toISOString(), submittedBy: account
        };
        if (visit.result === 'callback') message = '已安排下次回访。';
        if (returning) {
          row.noPhoneReturn = local ? row.manualFollowup.noPhoneReturn : {status:'accepted', doNotContact: Boolean(visit.doNotContact)};
          if (row.noPhoneReturn?.status !== 'accepted') throw new Error('暂未收到临时池确认，请重试。');
          row.followupComplete = true;
          message = local ? '临时池已接收，任务已退出待跟进。' : '演示退回临时池成功，任务已退出待跟进。';
        }
      }
      if (predictiveCall && awaitingPredictiveVisit(predictiveCall)) {
        row.manualFollowup.predictiveRecordId = predictiveCall.recordId;
        predictiveCall.linked = true;
      }
      row.manualFollowupHistory = [row.manualFollowup, ...previousRecords].slice(0, 30);
      if (form.isConnected) {
        success = message;
        if (!row.followupComplete) activeQueue = queueFor(row);
        render(page, tabs, switchScope, '[data-nt-masked-queue][aria-pressed="true"]');
      }
    } catch (err) {
      let failure = err.message || '提交失败，请重试。';
      if (local && err instanceof TypeError) {
        if (returning) failure = '暂未收到临时池退回确认，请保留原回访内容后重试。';
        if (submittingNumber) failure = '暂未收到临时池核验提交确认，请保留原内容后重试。';
      }
      feedback.textContent = failure;
      button.disabled = false;
      grid.inert = false;
    }
  }

  window.maskedSeatWorkbench = {
    count: () => local && !loaded ? null : pendingRows().length,
    show: (page, tabs, switchScope, toolbar, catalog) => {
      outboundToolbar = toolbar;
      intentCatalog = catalog;
      if (local) return load(page, tabs, switchScope, '[data-task-scope-select]');
      return render(page, tabs, switchScope, '[data-task-scope-select]');
    }
  };
})();
