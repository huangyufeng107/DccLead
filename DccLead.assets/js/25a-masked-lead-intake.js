(() => {
  const agents = { 'A001': '张伟', 'A002': '李娜' };
  const statuses = {
    accepted: ['已接单', 'success'],
    replayed: ['重推已核对', 'info'],
    recovered: ['回执已核对', 'info'],
    invalid: ['校验失败', 'danger'],
    failed: ['建单失败', 'danger'],
    pending: ['回执待核对', 'info']
  };

  const monitoring = window.maskedMonitoring;
  const monitorFields = {
    firstWarning: {
      title: '首跟提醒', unit: '分钟',
      purpose: '提醒坐席尽快做第一次跟进。达到设定时间还没有首跟记录，预警清单就显示「待首跟提醒」。',
      example: '默认 30 分钟。9:00 上班时接到一条可拨线索，9:30 还没有首跟记录就提醒。',
      note: '从派单和隐私号可拨两者较晚的时间开始，只累计在班时间。未首跟转派后，新坐席重新计时。'
    },
    firstOverdue: {
      title: '首跟超时', unit: '分钟',
      purpose: '让主管看到长时间还没有做第一次跟进的线索，方便优先催办。达到设定时间，预警清单显示「首跟超时」。',
      example: '默认 120 分钟（2 小时）。9:00 开始计时，11:00 还没有首跟记录就标为超时。',
      note: '和首跟提醒从同一时间起算。首跟超时时间须大于首跟提醒时间。'
    },
    idle: {
      title: '长时间未跟进', unit: '分钟',
      purpose: '找出已有跟进记录、还在待处理且没有约下次回访的线索。从最近一次跟进起，达到设定时间仍没有新记录，就显示「长时间未跟进」。',
      example: '默认 1440 分钟（24 小时）。周一 10:00 跟进后没约下次，周二 10:00 仍无新记录就预警。',
      note: '已约回访的线索按约定时间判断，到点还没有本次回访记录就标为「回访逾期」。'
    },
    expiry: {
      title: '隐私号临期', unit: '提前分钟',
      purpose: '让主管提前看到即将失去外拨机会的任务。剩余时间进入设定范围后，预警清单显示「即将失效」。',
      example: '默认提前 1440 分钟（24 小时）。周五 15:00 失效，周四 15:00 就进入预警清单。',
      note: '按实际失效时间倒推，休息时段也继续倒计时。'
    },
    urgentExpiry: {
      title: '隐私号加急', unit: '提前分钟',
      purpose: '提示主管和坐席优先处理快到期的线索。触发后，主管预警加急，坐席列表和任务跟进区显示红色提示。',
      example: '默认提前 120 分钟（2 小时）。隐私号 15:00 失效，13:00 起显示加急。',
      note: '客户没接且任务仍在待跟进时继续提醒，到期后显示「隐私号已失效」并禁用外拨。加急时间须短于临期时间。'
    }
  };
  const { headquarters, date: demoDate, phone: demoPhone, smartcode: demoSmartcode } = window.maskedLeadDemo;
  const phone = row => row.local ? row.maskedPhone : demoPhone(row);
  const smartcode = row => row.local ? row.smartcode : demoSmartcode(row);
  const localTime = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'medium'
  });
  const escape = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
  const tag = ([label, tone]) => `<span class="sd-tag sd-tag-${tone}">${label}</span>`;
  const action = (label, style, name, id) => `<button class="action-btn ${style}" type="button" data-${name}="${id}">${label}</button>`;
  const displayOwner = owner => owner ? `${agents[owner]}（${owner}）` : '未分配';
  const eventsFor = record => {
    if (record.local) return record.events;
    const events = [[record.time, '收到临时池派单', record.dispatch]];
    if (!record.task) return [...events, [record.time, statuses[record.status][0], record.reason]];
    events.push([record.time, '建单成功', record.task]);
    if (record.status === 'recovered') {
      events.push(['09:14:31', '发出接单回执', '临时池随后发起接单结果核对。'],
        ['09:15:18', '返回核对结果', '返回原总部任务编号 ' + record.task]);
    } else {
      events.push([record.time, '返回接单结果', record.task]);
    }
    if (record.status === 'replayed') events.push(['09:12:20', '收到重复派送', '沿用原总部任务编号 ' + record.task]);
    if (record.privacy) {
      events.push([record.time, '自动申请隐私号', '按原推送 ID ' + record.original + ' 申请']);
      if (record.privacy.status !== 'processing') {
        events.push([record.time, '取号结果', privacyLabels[record.privacy.status]]);
      }
      events.sort(([timeA], [timeB]) => timeA.localeCompare(timeB));
    }
    if (record.owner) events.push([record.assignedAt?.slice(11) || '09:07:20', '主管人工派单', displayOwner(record.owner)]);
    return events;
  };

  const scopes = { new: '新任务分配', old: '旧任务分配', overdue: '逾期任务分配', todo: '待跟进', stats: '任务统计', errors: '接单异常' };
  const receivedAt = row => row.local ? row.receivedAt : demoDate + ' ' + row.time;
  const routingLabels = {
    ai: 'AI跟进', manual: '人工待分配', unmatched: '未命中 · 待人工分配',
    conflict: '规则冲突 · 待主管处理', review: '分配条件待核对'
  };
  const routingLabel = row => {
    if (!row.task || row.status === 'pending') return '';
    if (row.owner) return '人工跟进';
    if (row.routing?.state === 'ai' && !row.followupComplete) {
      const privacy = privacyStatus(row);
      if (!privacy || privacy === 'processing') return 'AI跟进 · 等待取号';
      if (privacy !== 'available') return 'AI跟进 · 暂不可拨';
    }
    return routingLabels[row.routing?.state] || '待人工分配';
  };
  const taskColumns = [
    ['任务编码', row => row.task], ['线索编码', row => row.original],
    ['上次跟进坐席账号', row => row.previousAgent], ['上次跟进坐席名称', row => agents[row.previousAgent]],
    ['客户姓名', row => row.name], ['性别', row => row.gender], ['联系电话', phone],
    ['意向车系', row => row.intentSeriesName],
    ['线索类型', row => row.type], ['线索来源', row => row.entry],
    ['SMARTCODE', smartcode], ['渠道编码', row => row.channel],
    ['初始意向级别', row => row.intent], ['留资时间', row => row.captureTime],
    ['任务接收时间', receivedAt], ['坐席账号', row => row.owner],
    ['分配规则', row => row.owner && '人工分配'], ['意向专营店', row => row.intentionStore]
  ];
  const intakeColumns = [
    ['入池关联标识', row => row.association], ['临时池派单任务标识', row => row.dispatch],
    ['油电类型', row => row.power], ['车系 ID', row => row.series],
    ['原报文有效意向门店 ID', row => row.intentionStore], ['送池门店 ID', row => row.store], ['接单结果', row => statuses[row.status][0]]
  ];
  const privacyLabels = {
    processing: '取号中', available: '可拨', failed: '取号失败', timeout: '超时待核对',
    not_received: '已确认未取号', expired: '已失效'
  };
  const privacyStatus = row => row.privacy?.status === 'available'
    && monitoring.timestamp(row.privacy.expiresAtRaw || row.privacy.expiresAt) <= Date.now() ? 'expired' : row.privacy?.status;
  const privacyColumns = [
    ['隐私号', row => row.privacy?.number], ['隐私号失效截止时间', row => row.privacy?.expiresAt],
    ['隐私号状态', row => privacyLabels[privacyStatus(row)] || '待取号']
  ];
  const columns = [...taskColumns.slice(0, 2), ['跟进方式', routingLabel], ...taskColumns.slice(2), ...intakeColumns, ...privacyColumns];
  const byColumn = Object.fromEntries(columns);
  const displayField = (row, label, value) => value ||
    (label === '坐席账号' && row.task && row.routing?.state !== 'ai' ? '未分配' : '—');
  const quickFilters = [
    ['客户姓名', byColumn['客户姓名'], 'text'], ['联系电话', phone, 'text'], ['意向车系']
  ];
  const advancedFilters = [
    ['线索来源'], ['渠道编码'], ['初始意向级别'], ['坐席账号'], ['跟进方式'],
    ['分配规则'], ['是否有上次坐席跟进', row => row.previousAgent ? '是' : '否'],
    ['留资时间', byColumn['留资时间'], 'date'],
    ['意向专营店'], ['油电类型'], ['任务接收时间', receivedAt, 'date'],
    ['入池关联标识', byColumn['入池关联标识'], 'text']
  ];
  const filtersList = [...quickFilters, ...advancedFilters];
  const todoColumns = ['任务编码', '线索编码', '客户姓名', '联系电话', '意向车系', '坐席账号',
    '隐私号状态', '隐私号失效截止时间'];
  const privacyTones = { available: 'success', processing: 'info', timeout: 'warning', failed: 'danger', expired: 'danger' };
  const optionDefaults = { 坐席账号: Object.keys(agents), 初始意向级别: ['H', 'A', 'B', 'C'], 分配规则: ['人工分配'] };

  function readIntake(snapshot) {
    const {lead, taskId, dccTaskId, receiptStatus, receiptReason, events, owner, assignedAt, followupComplete, noPhoneReturn, followupVerification, manualFollowup, manualFollowupHistory, firstFollowupAt, privacy, routing} = snapshot;
    const accepted = receiptStatus === 'accepted';
    const recovered = events.some(event => event.kind === 'acceptance_checked' && event.status === 'accepted');
    const replayed = events.some(event => event.kind === 'duplicate_intake');
    const status = accepted ? (recovered ? 'recovered' : replayed ? 'replayed' : 'accepted')
      : receiptStatus === 'pending_confirmation' ? 'pending' : 'failed';
    const titles = {
      dispatch_sent: '收到临时池派单', dcc_task_created: '建单成功', acceptance_returned: '接单回执',
      acceptance_checked: '核对接单结果', duplicate_intake: '收到重复推送',
      privacy_requested: '自动申请隐私号', privacy_result: '取号结果', privacy_checked: '核对取号结果', dcc_no_phone_returned: '未取得手机号，已退回临时池', dcc_task_transferred: '主管转派'
    };
    const log = events.map(event => [
      localTime.format(new Date(event.at)), titles[event.kind],
      event.receiverTaskId || event.reason || (event.kind === 'privacy_requested'
        ? `第 ${event.attempt} 次请求 · 原推送 ID ${event.originalPushId}`
        : event.kind === 'duplicate_intake' ? '沿用原接单记录' : taskId)
    ]);
    const firstDispatch = events.find(event => event.kind === 'dispatch_sent');
    const privacyReady = events.find(event => ['privacy_result', 'privacy_checked'].includes(event.kind) &&
      (event.status === 'available' || event.reason === '取得隐私号并绑定原总部 DCC 任务。'));
    return {
      id: taskId, local: true, task: dccTaskId, original: lead.originalPushId,
      association: lead.associationId, dispatch: taskId, status, reason: receiptReason,
      entry: lead.entry, channel: lead.rChannel, power: lead.powerType, series: lead.carSeriesId,
      intentionStore: lead.originalIntentionStoreId, store: lead.storeId, maskedPhone: lead.maskedPhone,
      owner, routing, assignedAtRaw: assignedAt, assignedAt: assignedAt ? localTime.format(new Date(assignedAt)) : '', followupComplete, noPhoneReturn, followupVerification, manualFollowup, manualFollowupHistory, firstFollowupAt,
      privacy: privacy ? {...privacy, availableAt: privacyReady?.at, expiresAtRaw: privacy.expiresAt,
        expiresAt: privacy.expiresAt ? localTime.format(new Date(privacy.expiresAt)) : ''} : null,
      smartcode: lead.smartcode, receivedAt: firstDispatch ? localTime.format(new Date(firstDispatch.at)) : '—', events: log
    };
  }

  async function requestMaskedWorkspace(action, body, token) {
    const response = await fetch('/dcc/workspace/' + action, {
      method: body ? 'POST' : 'GET',
      headers: {...(token ? {Authorization: 'Bearer ' + token} : {}), ...(body ? {'Content-Type': 'application/json'} : {})},
      body: body ? JSON.stringify(body) : undefined
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || '操作失败，请重新查询。');
    return result;
  }

  const pendingFollowup = row => Boolean(row.task && row.owner && row.status !== 'pending'
    && row.routing?.state !== 'ai' && !row.followupComplete);
  window.dccMaskedWorklist = {
    agents,
    phone,
    smartcode,
    privacyStatus,
    privacyLabels,
    privacyTones,
    pendingFollowup,
    request: requestMaskedWorkspace,
    read: readIntake,
    demoRows: account => headquarters.filter(row => row.owner === account)
  };

  window.renderMaskedLeadIntake = root => {
    const params = new URLSearchParams(location.search);
    const poolTask = params.get('poolTask');
    const localWorkspace = params.get('dccMode') === 'local' && !poolTask;
    const routingRules = localWorkspace || poolTask ? [] : compileMaskedIntakeRules();
    const records = localWorkspace || poolTask ? [] : headquarters;
    if (!localWorkspace && !poolTask) {
      records.filter(row => row.task && !row.owner).forEach(row => {
        row.routing = evaluateMaskedIntakeRules(routingRules, {
          ...row, smartcode: smartcode(row), dealer: row.intentionStore || '无意向门店'
        }, receivedAt(row));
      });
    }
    let localToken;
    let remoteMonitorSettings;
    const monitorLimits = () => remoteMonitorSettings || monitoring.settings();
    let fetchVersion = 0;
    let saving = false;
    let statisticsTimer;
    let lastStatisticsRead = localWorkspace ? null : Date.now();
    let statisticsStatus = '';
    const today = () => localWorkspace ? localTime.format(new Date()).slice(0, 10) : demoDate;
    let scope = 'new';
    const criteria = { tasks: new FormData(), todo: new FormData(), errors: new FormData() };
    let page = 1;
    let size = 10;
    let targets = [];
    let sort = '任务接收时间';
    let direction = 'desc';
    const hiddenColumns = new Set();
    const selected = new Set();
    const counts = {};
    const get = selector => root.querySelector(selector);
    const renderFilter = ([label, value = byColumn[label], type]) => {
      if (type === 'text') return `<label class="search-field"><span class="masked-filter-label">${label}</span>
        <input class="lead-input" name="${label}" aria-label="${label}" placeholder="请输入${label}"></label>`;
      if (type === 'date') return `<fieldset class="masked-filter-range"><legend class="masked-filter-label">${label}</legend>
        <div class="date-range"><input class="lead-input" type="date" name="${label}开始" aria-label="${label}开始">
        <span class="date-range-sep">至</span><input class="lead-input" type="date" name="${label}结束" aria-label="${label}结束"></div></fieldset>`;
      const options = optionDefaults[label] || [...new Set(records.map(value).filter(Boolean))];
      return `<label class="search-field"><span class="masked-filter-label">${label}</span>
        <select class="lead-select" name="${label}" aria-label="${label}" data-filter-options="${label}">
          <option value="">${label === '意向车系' ? '全部车系' : '全部'}</option>
          ${options.map(option => `<option>${escape(option)}</option>`).join('')}</select></label>`;
    };
    const ownerOptions = Object.entries(agents).map(([account, name]) => `<option value="${account}">${name}（${account}）</option>`).join('');
    root.innerHTML = `
      <main class="masked-intake" aria-label="抖音掩码留资">
        <nav class="strategy-config-tabs show" aria-label="任务分配分类">
          ${Object.entries(scopes).filter(([key]) => !poolTask || !['todo', 'stats'].includes(key)).map(([key,label]) => `<button class="strategy-config-tab" type="button" data-scope="${key}">${label}</button>`).join('')}
        </nav>
        <form class="filter-row masked-intake-filters"><div class="lead-search-panel">
          <div class="lead-search-title">筛选查询</div>
          <div class="lead-search-grid compact">
          <div class="search-field"><label for="masked-task">任务编码</label><input id="masked-task" class="lead-input" name="task" placeholder="请输入任务编码" autocomplete="off"></div>
          <div class="search-field"><label for="masked-original">线索编码</label><input id="masked-original" class="lead-input" name="original" placeholder="请输入线索编码" autocomplete="off"></div>
          ${quickFilters.map(renderFilter).join('')}
            <div class="lead-search-actions">
              <button class="btn-add" type="submit">查询</button><button class="btn-secondary" type="reset">重置</button>
            </div>
          </div>
          <details class="lead-search-more"><summary>更多筛选</summary><div class="lead-search-grid masked-intake-more">
            ${advancedFilters.map(renderFilter).join('')}
          </div></details>
        </div></form>
        <form class="filter-row masked-todo-filters" hidden><div class="lead-search-panel">
          <div class="lead-search-title">筛选查询</div>
          <div class="lead-search-grid masked-todo-grid">
            <label class="search-field"><span class="masked-filter-label">任务编码</span><input class="lead-input" name="task" placeholder="请输入任务编码"></label>
            <label class="search-field"><span class="masked-filter-label">线索编码</span><input class="lead-input" name="original" placeholder="请输入线索编码"></label>
            <label class="search-field"><span class="masked-filter-label">坐席账号</span><select class="lead-select" name="owner"><option value="">全部坐席</option>${ownerOptions}</select></label>
            <label class="search-field"><span class="masked-filter-label">隐私号状态</span><select class="lead-select" name="privacy">
              <option value="">全部状态</option><option value="waiting">待取号</option>
              ${Object.entries(privacyLabels).map(([value,label])=>`<option value="${value}">${label}</option>`).join('')}
            </select></label>
            <div class="lead-search-actions"><button class="btn-add" type="submit">查询</button><button class="btn-secondary" type="reset">重置</button></div>
          </div>
        </div></form>
        <form class="filter-row masked-error-filters" hidden><div class="lead-search-panel">
          <div class="lead-search-title">筛选查询</div>
          <div class="lead-search-grid masked-error-grid">
            <div class="search-field"><label for="masked-error-id">线索标识</label>
              <input class="lead-input" id="masked-error-id" name="identifier" placeholder="原推送 ID、入池关联标识或派单标识" autocomplete="off"></div>
            <div class="search-field"><label for="masked-error-status">异常类型</label>
              <select class="lead-select" id="masked-error-status" name="status">
                <option value="">全部</option>
                <option value="invalid">${statuses.invalid[0]}</option>
                <option value="failed">${statuses.failed[0]}</option>
              </select></div>
            <fieldset><legend>接收日期</legend><div class="sd-date-range">
              <input class="lead-input" name="start" type="date" aria-label="接收开始日期">至
              <input class="lead-input" name="end" type="date" aria-label="接收结束日期">
            </div></fieldset>
            <div class="lead-search-actions">
              <button class="btn-add" type="submit">查询</button><button class="btn-secondary" type="reset">重置</button>
            </div>
          </div>
        </div></form>
        <section class="card masked-intake-results" aria-label="接单查询结果">
        <div class="lead-toolbar" id="masked-actions">
          <div class="lead-toolbar-left"><div class="section-title" id="masked-list-title">抖音掩码留资列表</div>
          <span role="status" id="masked-feedback"></span></div>
          <div class="lead-toolbar-right">
          <button class="btn-add" type="button" data-all>全部分配</button>
          <button class="btn-secondary" type="button" data-selected>执行分配</button>
          <button class="btn-secondary" type="button" data-export>导出数据</button>
          <select class="lead-select" id="masked-sort" aria-label="排序字段">
            ${['任务接收时间','任务编码','线索编码'].map(label => `<option value="${label}">${label}</option>`).join('')}</select>
          <select class="lead-select" id="masked-direction" aria-label="排序方向">
            <option value="desc">降序</option><option value="asc">升序</option></select>
          <div class="field-picker">
            <button class="btn-secondary" type="button" data-fields aria-expanded="false" aria-controls="masked-fields">字段显示</button>
            <div class="field-picker-panel" id="masked-fields">
              <div class="field-picker-grid">${columns.map(([label]) => `<label class="field-check">
                <input type="checkbox" checked data-column="${label}" aria-label="显示${label}">${label}</label>`).join('')}</div>
            </div>
          </div>
          <label class="masked-intake-role" for="masked-role">演示视角
            <select class="lead-select" id="masked-role">
              <option value="supervisor">主管</option>
              ${Object.entries(agents).map(([account,name]) => `<option value="${account}">坐席 · ${name}（${account}）</option>`).join('')}
            </select>
          </label>
        </div></div>
          <div class="lead-table-wrap" tabindex="0" role="region" aria-label="抖音掩码留资记录">
            <table class="lead-table masked-intake-table"><thead></thead><tbody></tbody></table>
          </div>
          <footer class="sd-pagination prototype-pagination">
            <div class="sd-pagination-info prototype-pagination-summary" role="status" id="masked-count"></div>
            <div class="sd-pagination-btns prototype-pagination-controls">
              <select class="sd-page-size prototype-pagination-select" aria-label="每页条数" id="masked-size">${[5,10,20,50].map(n => `<option value="${n}"${n === size ? ' selected' : ''}>每页 ${n} 条</option>`).join('')}</select>
              <button class="sd-page-btn prototype-pagination-arrow" type="button" aria-label="上一页" data-page="-1"><span aria-hidden="true">‹</span></button>
              <select class="prototype-pagination-select" aria-label="选择页码" id="masked-page"></select>
              <button class="sd-page-btn prototype-pagination-arrow" type="button" aria-label="下一页" data-page="1"><span aria-hidden="true">›</span></button>
            </div>
          </footer>
        </section>
        <section class="card masked-intake-results" id="masked-statistics" aria-label="抖音掩码留资任务统计" hidden>
          <div class="lead-toolbar"><div class="section-title">抖音掩码留资任务统计</div><div id="masked-statistics-controls"><button type="button" class="btn-secondary" data-monitor-settings>总部预警配置</button></div></div>
          <div id="masked-statistics-summary" class="masked-statistics-summary" aria-live="polite"></div>
          <p class="masked-monitor-rule">首跟按演示班次 09:00–18:00 累计。回访到约定时间即逾期，隐私号临期按实际截止时间倒推。</p>
          <form id="masked-monitor-settings" class="masked-monitor-settings" aria-label="总部预警配置" hidden>
            <p>保存后，未完成任务按最新阈值判断。${localWorkspace ? '主管和坐席共用本地联调配置。' : '配置保存在此原型浏览器中。'}</p>
            <div class="masked-monitor-setting-fields">
              ${Object.entries(monitorFields).map(([key, field]) => `<div class="masked-monitor-setting">
                <div class="masked-monitor-setting-label">
                  <label for="masked-monitor-${key}">${field.title}</label>
                  <button type="button" class="masked-monitor-help-button" data-monitor-help="${key}" aria-label="查看${field.title}说明" aria-haspopup="dialog">?</button>
                </div>
                <div class="masked-monitor-setting-value">
                  <input id="masked-monitor-${key}" name="${key}" aria-label="${field.title}（${field.unit}）" type="number" min="1" max="525600" required>
                  <span aria-hidden="true">${field.unit === '分钟' ? '分钟' : '分钟前'}</span>
                </div>
              </div>`).join('')}
            </div>
            <div class="masked-monitor-setting-actions">
              <button type="submit" class="btn-primary">保存配置</button>
              <button type="button" class="btn-secondary" data-monitor-settings>收起</button>
            </div>
          </form>
          <p id="masked-monitor-settings-status" class="masked-monitor-footnote" role="status" hidden></p>
          <section class="masked-monitor-section" aria-labelledby="masked-alert-title">
            <div class="masked-monitor-heading">
              <div><h3 id="masked-alert-title">预警清单</h3><span id="masked-monitor-updated" role="status"></span></div>
              <div class="masked-monitor-filters">
                <label><span id="masked-monitor-seat-label">坐席</span><select id="masked-monitor-seat" class="lead-select" aria-labelledby="masked-monitor-seat-label"><option value="">全部坐席</option>
                  ${Object.entries(agents).map(([account, name]) => `<option value="${account}">${name}（${account}）</option>`).join('')}
                </select></label>
                <label>预警类型<select id="masked-monitor-type" class="lead-select"><option value="">全部预警</option>
                  ${Object.entries(monitoring.types).map(([key, title]) => `<option value="${key}">${title}</option>`).join('')}
                </select></label>
              </div>
            </div>
            <div class="lead-table-wrap"><table class="lead-table" id="masked-monitor-alerts">
              <thead><tr><th>任务编码 / 客户</th><th>负责坐席</th><th>预警原因</th><th>最近跟进</th><th>隐私号截止时间</th><th>操作</th></tr></thead>
              <tbody></tbody>
            </table></div>
            <p class="masked-monitor-footnote" id="masked-alert-count" role="status"></p>
          </section>
          <section class="masked-monitor-section" aria-labelledby="masked-efficiency-title">
            <div class="masked-monitor-heading"><div><h3 id="masked-efficiency-title">坐席效率</h3>
              <span>首跟从派单与隐私号可拨两者较晚的时间起算。首跟指标统计今日可跟进任务。</span></div></div>
            <div class="lead-table-wrap"><table class="lead-table" id="masked-efficiency-table">
              <thead><tr><th>坐席账号</th><th>今日已分配量</th><th>待跟进量</th><th>待首跟</th><th>预警任务</th>
                <th id="masked-first-rate">首跟及时率</th><th>首跟耗时中位数</th><th>已完成量</th><th>操作</th></tr></thead><tbody></tbody>
            </table></div>
            <p class="masked-monitor-footnote">首跟率样本包含已记录首跟或已达到首跟提醒时间的任务。完成量包含合格结果回传成功与临时池确认接收的未取得手机号任务。</p>
          </section>
        </section>
      </main>
      <section class="masked-intake-detail" aria-labelledby="masked-detail-title" hidden>
        <div class="detail-page-header">
          <div><h1 class="detail-page-title" id="masked-detail-title" tabindex="-1">接单详情</h1>
            <div class="detail-page-subtitle" id="masked-detail-subtitle"></div></div>
          <div class="detail-page-actions"><a class="btn-secondary" data-handoff-link>查看接口交接</a>
            <button type="button" class="btn-secondary" data-return-list>返回列表</button></div>
        </div>
        <div class="lead-summary-grid"></div>
        <div class="lead-detail-content"></div>
      </section>
      <dialog class="masked-monitor-help-dialog" id="masked-monitor-help" aria-labelledby="masked-monitor-help-title">
        <header class="masked-monitor-help-header">
          <h2 id="masked-monitor-help-title"></h2>
          <button type="submit" form="masked-monitor-help-close" class="masked-monitor-help-close" aria-label="关闭说明">×</button>
        </header>
        <div class="masked-monitor-help-copy">
          <p data-help-purpose></p>
          <div class="masked-monitor-help-example"><strong>举个例子</strong><p data-help-example></p></div>
          <p class="masked-monitor-help-note" data-help-note></p>
        </div>
        <form id="masked-monitor-help-close" method="dialog" class="masked-monitor-help-actions"><button class="btn-primary" type="submit" autofocus>知道了</button></form>
      </dialog>
      <dialog class="masked-intake-assign" aria-labelledby="masked-assign-title">
        <form method="dialog">
          <header class="sd-modal-header"><h2 class="sd-modal-title" id="masked-assign-title">坐席排班</h2><button class="sd-btn" type="button" data-cancel>关闭</button></header>
          <div class="sd-modal-body">
            <div class="sd-modal-filter"><label>坐席账号<input class="sd-form-input" name="account" placeholder="请输入坐席账号或姓名"></label>
              <button class="sd-btn" type="button" data-agent-reset>重置</button><button class="sd-btn sd-btn-primary" type="button" data-agent-search>查询</button>
              <span class="sd-modal-count" id="masked-target-count"></span></div>
            <div class="sd-modal-table-wrap"><table class="sd-data-table">
              <thead><tr><th>序号</th><th>坐席账号</th><th>今日已分配量</th><th>待跟进量</th><th>分配数量</th></tr></thead>
              <tbody></tbody></table></div>
            <p role="status" id="masked-assign-feedback"></p>
          </div>
          <div class="sd-modal-footer">
            <span class="sd-modal-assigned-count" id="masked-assigned-count"></span>
            <button class="sd-btn" type="button" data-cancel>取消</button>
            <button class="sd-btn sd-btn-info" type="button" data-average>平均分配</button>
            <button class="sd-btn sd-btn-primary" type="submit">确定</button>
          </div>
        </form>
      </dialog>`;

    const forms = { tasks: get('.masked-intake-filters'), todo: get('.masked-todo-filters'), errors: get('.masked-error-filters') };
    const checklistRole = get('.masked-intake-role');
    const toolbar = get('.lead-toolbar-right');
    const role = get('#masked-role');
    const detail = get('.masked-intake-detail');
    const list = get('.masked-intake');
    const scrollArea = root.closest('.content');
    let listScroll = 0;
    let detailTrigger;
    const assign = get('.masked-intake-assign');
    const accountInput = assign.querySelector('[name=account]');
    const isSupervisor = () => role.value === 'supervisor';
    const canSee = row => isSupervisor() || role.value === row.owner;
    const eligible = row => !poolTask && isSupervisor() && row.task && row.status !== 'pending' && !row.owner && row.routing?.state !== 'ai';
    const matches = row => {
      if (!canSee(row)) return false;
      if (scope === 'errors' && row.task) return false;
      if (scope === 'todo' && !pendingFollowup(row)) return false;
      if (!['errors', 'todo'].includes(scope) && (!row.task || (row.bucket || 'new') !== scope)) return false;
      if (scope === 'errors') {
        const fields = criteria.errors;
        const identifier = (fields.get('identifier') || '').trim().toLowerCase();
        const status = fields.get('status');
        const start = fields.get('start');
        const end = fields.get('end');
        const date = receivedAt(row).slice(0, 10);
        return (!identifier || [row.original, row.association, row.dispatch].some(id => id.toLowerCase().includes(identifier))) &&
          (!status || row.status === status) && (!start || date >= start) && (!end || date <= end);
      }
      const fields = scope === 'todo' ? criteria.todo : criteria.tasks;
      for (const [key, value] of [['task', row.task], ['original', row.original]]) {
        if (!(value || '').toLowerCase().includes((fields.get(key) || '').trim().toLowerCase())) return false;
      }
      if (scope === 'todo') {
        const owner = fields.get('owner');
        const privacy = fields.get('privacy');
        return (!owner || owner === row.owner) && (!privacy || privacy === (privacyStatus(row) || 'waiting'));
      }
      return filtersList.every(([label, value = byColumn[label], type]) => {
        const actual = value(row) || '';
        if (type === 'date') {
          const start = fields.get(label + '开始');
          const end = fields.get(label + '结束');
          const date = actual.slice(0, 10);
          return (!start && !end) || (date && (!start || date >= start) && (!end || date <= end));
        }
        const wanted = (fields.get(label) || '').trim();
        return !wanted || (type === 'text' ? actual.toLowerCase().includes(wanted.toLowerCase()) : actual === wanted);
      });
    };
    const currentRows = () => records.filter(matches).sort((left,right) => {
      const read = byColumn[sort];
      const compare = (read(left) || '').localeCompare(read(right) || '');
      return direction === 'asc' ? compare : -compare;
    });
    const tableColumns = () => scope === 'errors'
      ? ['线索编码','线索来源','油电类型','渠道编码','任务接收时间','接单结果'].map(label => [label, byColumn[label]]).concat([['失败原因', row => row.reason]])
      : scope === 'todo' ? todoColumns.map(label => [label, byColumn[label]]) : columns;

    function seatStats(account) {
      const owned = records.filter(row => row.owner === account);
      return {
        assignedToday: owned.filter(row => row.assignedAt?.slice(0, 10) === today()).length,
        pending: owned.filter(pendingFollowup).length,
        completed: owned.filter(row => row.followupComplete).length
      };
    }

    const monitorSettings = get('#masked-monitor-settings');
    const monitorSettingsStatus = get('#masked-monitor-settings-status');
    const monitorSeat = get('#masked-monitor-seat');
    const monitorType = get('#masked-monitor-type');
    const formatTime = value => Number.isFinite(value) ? localTime.format(new Date(value)) : '—';
    const monitorTask = (row, now) => monitoring.task(row, now, privacyStatus(row), monitorLimits());

    function renderStatistics() {
      const now = Date.now();
      const visible = records.filter(row => row.task && canSee(row));
      const manual = visible.filter(row => row.owner && row.status !== 'pending' && row.routing?.state !== 'ai');
      const limits = monitorLimits();
      const measured = manual.map(row => monitoring.task(row, now, privacyStatus(row), limits));
      get('#masked-first-rate').textContent = limits.firstWarning + ' 分钟内首跟率';
      const pending = visible.filter(pendingFollowup).length;
      const summary = [
        ['待跟进', pending, 'pending'],
        ['可拨', visible.filter(row => pendingFollowup(row) && privacyStatus(row) === 'available').length, 'available'],
        ['已完成', visible.filter(row => row.followupComplete).length, 'completed']
      ];
      if (isSupervisor()) summary.unshift(['待分配', visible.filter(eligible).length, 'unassigned']);
      get('#masked-statistics-summary').innerHTML = summary.map(([label, count, tone]) =>
        `<div class="masked-metric" data-tone="${tone}"><span>${label}</span><strong>${count}</strong><span>条</span>${tone === 'completed' && visible.some(row => row.noPhoneReturn)
          ? `<small class="masked-metric-note">其中退回临时池 ${visible.filter(row => row.noPhoneReturn).length} 条</small>` : ''}</div>`
      ).join('');
      monitorSeat.closest('label').hidden = !isSupervisor();
      get('#masked-statistics-controls [data-monitor-settings]').hidden = !isSupervisor();
      if (!isSupervisor()) {
        monitorSettings.hidden = true;
        monitorSettingsStatus.hidden = true;
      }
      get('#masked-monitor-updated').textContent = statisticsStatus ||
        (lastStatisticsRead ? `最近更新 ${formatTime(lastStatisticsRead)} · 每 30 秒更新` : '正在读取本地任务');
      const riskTasks = measured.concat(isSupervisor() ? visible.filter(row =>
        !row.owner && row.status !== 'pending' && row.routing?.state !== 'ai'
      ).map(row => monitorTask(row, now)) : []);
      renderAlerts(riskTasks, now);

      get('#masked-efficiency-table tbody').innerHTML = Object.entries(agents)
        .filter(([account]) => isSupervisor() || account === role.value)
        .map(([account, name]) => {
          const stats = seatStats(account);
          const performance = monitoring.efficiency(measured.filter(item => item.row.owner === account),
            now, value => localTime.format(new Date(value)).slice(0, 10), limits);
          const assignedToday = measured.filter(item => item.row.owner === account &&
            item.row.assignedAt?.slice(0, 10) === localTime.format(new Date(now)).slice(0, 10)).length;
          return `<tr><td>${account} · ${name}</td><td>${assignedToday}</td><td>${stats.pending}</td><td>${performance.awaiting}</td>
            <td>${performance.alerts ? action(String(performance.alerts), 'view', 'seat-alerts', account) : '0'}</td>
            <td>${performance.rate == null ? '—' : `${performance.rate}% <small>（${performance.sample} 条）</small>`}</td>
            <td>${monitoring.duration(performance.median)}</td><td>${stats.completed}</td>
            <td>${stats.pending ? action('查看待跟进', 'view', 'seat-todo', account) : '—'}</td></tr>`;
        }).join('');
    }

    function renderAlerts(tasks, now) {
      const alerts = tasks.filter(item => !isSupervisor() || !monitorSeat.value || item.row.owner === monitorSeat.value)
        .map(item => ({...item, alerts: item.alerts.filter(alert => !monitorType.value || alert.type === monitorType.value)
          .sort((a, b) => a.priority - b.priority || (a.at ?? Infinity) - (b.at ?? Infinity))}))
        .filter(item => item.alerts.length)
        .sort((a, b) => a.alerts[0].priority - b.alerts[0].priority ||
          (a.alerts[0].at ?? Infinity) - (b.alerts[0].at ?? Infinity));
      const activeTask = document.activeElement?.dataset.maskedMonitorDetail;
      get('#masked-monitor-alerts tbody').innerHTML = alerts.length ? alerts.map(item => `
        <tr><td><strong>${escape(item.row.task)}</strong>${item.row.name ? `<small>${escape(item.row.name)}</small>` : ''}</td>
          <td>${escape(displayOwner(item.row.owner))}</td>
          <td><div class="masked-monitor-tags">${item.alerts.map(alert => {
            const description = alert.type === 'expiry' ? `剩余 ${monitoring.duration(alert.at - now)}`
              : ['first', 'waiting'].includes(alert.type) ? `已等待 ${monitoring.duration(item.waiting)}`
              : ['callback', 'idle'].includes(alert.type) ? `逾时 ${monitoring.duration(now - alert.at)}`
              : alert.type === 'blocked' ? privacyLabels[item.state] : '';
            return `<div>${tag([monitoring.types[alert.type], alert.priority <= 1 ? 'danger' : 'warning'])}
              ${description ? `<small>${escape(description)}</small>` : ''}</div>`;
          }).join('')}</div></td>
          <td>${formatTime(item.last)}</td><td>${formatTime(item.expiry)}</td>
          <td>${action('查看任务', 'view', 'masked-monitor-detail', escape(item.row.id))}</td></tr>`).join('')
        : '<tr><td colspan="6" class="sd-table-empty">当前范围暂无预警任务</td></tr>';
      get('#masked-alert-count').textContent = `共 ${alerts.length} 条预警任务`;
      if (activeTask) [...get('#masked-monitor-alerts').querySelectorAll('[data-masked-monitor-detail]')]
        .find(button => button.dataset.maskedMonitorDetail === activeTask)?.focus({preventScroll: true});
    }

    function scheduleStatisticsRead() {
      clearTimeout(statisticsTimer);
      if (scope !== 'stats' || list.hidden || !detail.hidden) return;
      statisticsTimer = setTimeout(async () => {
        if (!list.isConnected || list.hidden || scope !== 'stats') return;
        if (localWorkspace) await refreshDccWorklist(false, true);
        else {
          lastStatisticsRead = Date.now();
          renderStatistics();
        }
        scheduleStatisticsRead();
      }, 30_000);
    }

    function render() {
      const statistics = scope === 'stats';
      forms.tasks.hidden = ['errors', 'todo', 'stats'].includes(scope);
      forms.todo.hidden = scope !== 'todo';
      const ownerOptions = forms.todo.elements.owner.options;
      for (const option of ownerOptions) option.hidden = Boolean(option.value) && !isSupervisor() && option.value !== role.value;
      const roleHost = statistics ? get('#masked-statistics-controls') : toolbar;
      if (checklistRole.parentElement !== roleHost) roleHost.append(checklistRole);
      if (!poolTask) checklistRole.hidden = false;
      forms.errors.hidden = scope !== 'errors';
      get('[aria-label="接单查询结果"]').hidden = statistics;
      get('#masked-statistics').hidden = !statistics;
      if (statistics) renderStatistics();
      scheduleStatisticsRead();
      const rows = currentRows();
      const headings = tableColumns().filter(([label]) => ['errors', 'todo'].includes(scope) || !hiddenColumns.has(label));
      const selectable = !poolTask && isSupervisor() && !['errors', 'todo', 'stats'].includes(scope);
      const canAssign = rows.filter(eligible);
      const totalPages = Math.max(1, Math.ceil(rows.length / size));
      page = Math.min(page, totalPages);
      const offset = (page - 1) * size;
      for (const tab of root.querySelectorAll('[data-scope]')) {
        tab.hidden = !isSupervisor() && tab.dataset.scope === 'errors';
        tab.classList.toggle('active', tab.dataset.scope === scope);
        tab.setAttribute('aria-pressed', String(tab.dataset.scope === scope));
      }
      get('[data-all]').hidden = !selectable;
      get('[data-selected]').hidden = !selectable;
      get('[data-all]').disabled = !canAssign.length;
      get('[data-selected]').disabled = !selected.size;
      get('[data-selected]').textContent = selected.size ? `执行分配 (${selected.size})` : '执行分配';
      get('[data-export]').hidden = !isSupervisor();
      get('[data-export]').disabled = !rows.length;
      get('[data-fields]').closest('.field-picker').hidden = ['errors', 'todo'].includes(scope);
      get('#masked-sort option[value="任务编码"]')?.toggleAttribute('disabled', scope === 'errors');
      get('#masked-list-title').textContent = poolTask ? '总部 DCC 接单联调记录' : scope === 'errors' ? '接单异常列表' : scope === 'todo' ? '抖音掩码留资待跟进' : '抖音掩码留资列表';
      const selection = selectable ? `<th><input type="checkbox" aria-label="全选可分配任务" data-select-all ${canAssign.length ? '' : 'disabled'} ${canAssign.length && canAssign.every(row => selected.has(row.id)) ? 'checked' : ''}></th>` : '';
      get('.masked-intake-table').classList.toggle('masked-todo-table', scope === 'todo');
      get('.masked-intake-table thead').innerHTML = `<tr>${selection}<th>序号</th>${headings.map(([label]) => {
        const active = sort === label;
        return `<th scope="col"${active ? ` aria-sort="${direction === 'asc' ? 'ascending' : 'descending'}"` : ''}>
          ${label}${active ? ` <span class="masked-sort-mark" aria-hidden="true">${direction === 'asc' ? '↑' : '↓'}</span>` : ''}</th>`;
      }).join('')}<th scope="col">操作</th></tr>`;
      get('.masked-intake-table tbody').innerHTML = rows.length ? rows.slice(offset, offset + size).map((row, index) => {
        const checkbox = selectable ? `<td><input type="checkbox" aria-label="选择 ${row.task}" data-select-row="${row.id}" ${eligible(row) ? '' : 'disabled'} ${selected.has(row.id) ? 'checked' : ''}></td>` : '';
        const values = headings.map(([label, read]) => {
          const value = read(row);
          if (label === '跟进方式' && value) return `<td>${tag([value, row.routing?.state === 'ai' ? 'info' : row.routing?.state === 'conflict' || row.routing?.state === 'review' ? 'warning' : 'success'])}</td>`;
          if (label === '接单结果') return `<td>${tag(statuses[row.status])}</td>`;
          if (scope === 'todo' && label === '隐私号状态') return `<td>${tag([value, privacyTones[privacyStatus(row)] || 'info'])}</td>`;
          if (scope === 'todo' && label === '坐席账号') return `<td>${escape(displayOwner(row.owner))}</td>`;
          const text = displayField(row, label, value);
          const mono = ['任务编码', '线索编码', '联系电话', 'SMARTCODE'].includes(label) ? ' class="is-mono"' : '';
          return `<td${mono}>${escape(text)}</td>`;
        }).join('');
        return `<tr class="${selected.has(row.id) ? 'is-selected' : ''}">${checkbox}<td>${offset + index + 1}</td>${values}
          <td><div class="action-btns">${action('详情', 'view', 'masked-detail', row.id)}${eligible(row) ? action('分配', 'edit', 'masked-assign', row.id) : ''}</div></td></tr>`;
      }).join('') : `<tr><td colspan="${headings.length + (selectable ? 3 : 2)}" class="sd-table-empty">暂无数据</td></tr>`;
      get('#masked-count').textContent = `共 ${rows.length} 条记录，当前第 ${page} / ${totalPages} 页`;
      get('#masked-page').innerHTML = Array.from({length: totalPages}, (_, index) => `<option value="${index + 1}">第 ${index + 1} 页</option>`).join('');
      get('#masked-page').value = String(page);
      get('[data-page="-1"]').disabled = page === 1;
      get('[data-page="1"]').disabled = page === totalPages;
    }

    function showDetail(row, trigger, refresh = false) {
      const fromMonitor = (refresh ? detailTrigger : trigger)?.dataset.maskedMonitorDetail;
      const fields = [
        ['任务编码', escape(row.task || '未建单')], ['线索编码', escape(row.original)],
        ['联系电话', escape(phone(row))], ['接单结果', tag(statuses[row.status])],
        ['任务归属', row.task ? escape(row.routing?.state === 'ai' ? row.routing.target : displayOwner(row.owner)) : '—'], ['任务接收时间', receivedAt(row)]
      ];
      const buildSection = (title, entries, actions = '') => `<section class="detail-section">
        <div class="detail-section-title">${title}</div><div class="detail-section-body">
          ${entries.map(([label,value]) => `<div class="lead-detail-item"><div class="lead-detail-label">${label}</div>
            <div class="lead-detail-value">${escape(displayField(row, label, value))}</div></div>`).join('')}
        </div>${actions}</section>`;
      const privacy = row.privacy;
      const privacyActions = row.task && privacy && (privacy.reason || privacyStatus(row) === 'expired' || (localWorkspace && isSupervisor() && (privacy.canRetry || privacy.canReconcile))) ? `<div class="masked-privacy-actions">
        ${localWorkspace && isSupervisor() && privacy?.canReconcile ? action('核对取号结果', 'edit', 'privacy-reconcile', row.id) : ''}
        ${localWorkspace && isSupervisor() && privacy?.canRetry ? action('安全重试取号', 'edit', 'privacy-retry', row.id) : ''}
        <span id="masked-privacy-feedback" role="status">${escape(privacyStatus(row) === 'expired'
          ? '已到失效截止时间，禁止拨打该隐私号。' : privacy?.reason || '')}</span>
      </div>` : '';
      get('#masked-detail-subtitle').textContent = '培育任务 / 抖音掩码留资 / ' + (row.task || row.original);
      const handoffQuery = row.local ? { mode: 'local', keyword: row.dispatch } : { keyword: row.original };
      get('[data-handoff-link]').href = 'DNDC线索中心_抖音接口交接查询.html?' + new URLSearchParams(handoffQuery);
      detail.querySelector('.lead-summary-grid').innerHTML = fields.map(([label,value]) => `
        <div class="lead-summary-item"><div class="lead-summary-label">${label}</div>
        <div class="lead-summary-value">${value}</div></div>`).join('');
      detail.querySelector('.lead-detail-content').innerHTML = `
        <div class="detail-tabs" aria-label="接单详情分类">
          <button class="detail-tab active" type="button" data-detail-panel="info" aria-controls="masked-detail-info" aria-pressed="true">线索与任务信息</button>
          <button class="detail-tab" type="button" data-detail-panel="logs" aria-controls="masked-detail-logs" aria-pressed="false">接单日志</button>
        </div>
        <div class="detail-tab-panel active" id="masked-detail-info">
          ${buildSection('接单信息', [[row.task ? '接单说明' : '失败原因', row.reason || '已返回总部任务编号。'],
            ...intakeColumns.map(([label,read]) => [label, read(row)])])}
          ${row.task && row.status !== 'pending' ? buildSection('接单后分配', [
            ['跟进方式', routingLabel(row)],
            ['匹配策略', row.routing?.rules.map(rule => `${rule.dimension} · ${rule.name}（${rule.id}）`).join('；')],
            ['外呼类型', row.routing?.target],
            ['分配比例配置', [...new Set(row.routing?.rules.map(rule => rule.policyId).filter(Boolean))].join('、')],
            ['策略版本', row.routing?.version ?? (row.routing ? '原型演示' : '')],
            ['分配判断时间', row.routing?.decidedAt && localTime.format(new Date(row.routing.decidedAt))]
          ]) : ''}
          ${row.task ? buildSection('隐私号信息', privacyColumns.map(([label,read]) => [label, read(row)]), privacyActions) : ''}
          ${row.noPhoneReturn ? buildSection('任务结案', [['结果', '未取得手机号，已退回临时池'],
            ['临时池接收时间', formatTime(monitoring.timestamp(row.noPhoneReturn.returnedAt))], ['回访描述', row.manualFollowup?.note]]) : ''}
          ${fromMonitor ? buildSection('任务跟进', [
            ['分配时间', row.assignedAt], ['首跟计时起点', formatTime(monitorTask(row, Date.now()).start)],
            ['最近跟进时间', formatTime(monitorTask(row, Date.now()).last)],
            ['下次回访时间', row.manualFollowup?.nextVisitAt && localTime.format(new Date(row.manualFollowup.nextVisitAt))],
            ['最近回访描述', row.manualFollowup?.note]
          ]) : ''}
          ${buildSection('线索与任务信息', taskColumns.map(([label,read]) => [label, read(row)]))}
        </div>
        <div class="detail-tab-panel" id="masked-detail-logs">
          <div class="log-table-card"><table class="log-table"><thead><tr><th>时间</th><th>节点</th><th>说明</th></tr></thead>
          <tbody>${eventsFor(row).map(([time,title,description]) =>
            `<tr><td>${escape(row.local ? time : demoDate + ' ' + time)}</td><td>${title}</td><td>${escape(description)}</td></tr>`).join('')}</tbody></table></div>
        </div>`;
      if (!refresh) {
        listScroll = scrollArea.scrollTop;
        detailTrigger = trigger;
      }
      list.hidden = true;
      clearTimeout(statisticsTimer);
      detail.hidden = false;
      setPageName('NEV培育 / 培育任务 / 抖音掩码留资 / 接单详情');
      if (!refresh) {
        scrollArea.scrollTop = 0;
        get('#masked-detail-title').focus({preventScroll: true});
      }
    }

    function showList() {
      detail.hidden = true;
      list.hidden = false;
      setPageName('NEV培育 / 培育任务');
      scrollArea.scrollTop = listScroll;
      detailTrigger?.focus({preventScroll: true});
      if (scope === 'stats') scheduleStatisticsRead();
    }

    function updateCounts() {
      const count = Object.values(counts).reduce((sum, value) => sum + value, 0);
      get('#masked-assigned-count').textContent = `已分配：${count} / ${targets.length} 条`;
      get('#masked-assign-feedback').textContent = count > targets.length ? '分配数量超过待分配任务数。' : '';
      assign.querySelector('[type=submit]').disabled = saving || count !== targets.length;
    }

    function renderAgents(query = '') {
      const rows = Object.entries(agents).filter(([id,name]) => id.toLowerCase().includes(query.toLowerCase()) || name.includes(query));
      assign.querySelector('tbody').innerHTML = rows.length ? rows.map(([id,name], index) => {
        const stats = seatStats(id);
        return `<tr><td>${index + 1}</td><td>${id} · ${name}</td>
          <td>${stats.assignedToday}</td><td>${stats.pending}</td>
          <td><input type="number" class="sd-form-input sd-assign-count" min="0" max="${targets.length}" step="1" value="${counts[id]}" data-seat="${id}" aria-label="${name}分配数量"></td></tr>`;
      }).join('')
        : '<tr><td colspan="5" class="sd-table-empty">暂无数据</td></tr>';
      updateCounts();
    }

    function openAssign(rows) {
      targets = rows.filter(eligible);
      if (!targets.length) return;
      for (const id of Object.keys(agents)) counts[id] = 0;
      accountInput.value = '';
      get('#masked-target-count').textContent = `待分配：${targets.length} 条`;
      renderAgents();
      assign.showModal();
    }

    function exportRows() {
      const headings = tableColumns().filter(([label]) => ['errors', 'todo'].includes(scope) || !hiddenColumns.has(label));
      const cells = [headings.map(([label]) => label), ...currentRows().map(row => headings.map(([, read]) => read(row) || ''))];
      const csv = cells.map(line => line.map(value => '"' + value.replaceAll('"', '""') + '"').join(',')).join('\r\n');
      const url = URL.createObjectURL(new Blob(['\uFEFF', csv], {type: 'text/csv;charset=utf-8'}));
      const link = document.createElement('a');
      link.href = url;
      link.download = '抖音掩码留资-' + scopes[scope] + '-演示.csv';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function restart() {
      selected.clear();
      page = 1;
      get('#masked-feedback').textContent = '';
      render();
    }
    for (const [kind, form] of Object.entries(forms)) {
      form.addEventListener('submit', event => {
        event.preventDefault();
        criteria[kind] = new FormData(form);
        restart();
        if (poolTask) refreshDccIntake();
        else if (localWorkspace) refreshDccWorklist();
      });
      form.addEventListener('reset', () => { criteria[kind] = new FormData(); restart(); });
    }
    role.addEventListener('change', () => {
      monitorSeat.value = '';
      if (scope === 'errors' && !isSupervisor()) scope = 'new';
      for (const kind of ['tasks', 'todo']) forms[kind].reset();
      if (localWorkspace) refreshDccWorklist(true);
    });
    monitorSettings.addEventListener('submit', async event => {
      event.preventDefault();
      if (!isSupervisor()) return;
      const values = Object.fromEntries([...new FormData(monitorSettings)].map(([key, value]) => [key, Number(value)]));
      monitorSettingsStatus.hidden = false;
      if (!monitoring.validSettings(values)) {
        monitorSettingsStatus.textContent = '首跟超时须晚于首跟提醒，隐私号加急须比临期更接近截止时间。';
        return;
      }
      const submit = monitorSettings.querySelector('button[type="submit"]');
      submit.disabled = true;
      try {
        if (localWorkspace) {
          if (!localToken) throw new Error('本地工作台正在连接，请稍后保存。');
          const result = await workspaceRequest('monitor-settings', values);
          remoteMonitorSettings = result.monitorSettings;
        } else if (!monitoring.saveSettings(values)) {
          throw new Error('此浏览器暂时无法保存配置。');
        }
      } catch (error) {
        monitorSettingsStatus.textContent = error.message;
        return;
      } finally {
        submit.disabled = false;
      }
      monitorSettingsStatus.textContent = '已保存，未完成任务已按最新阈值更新。';
      monitorSettings.hidden = true;
      renderStatistics();
      get('#masked-statistics-controls [data-monitor-settings]').focus();
    });
    monitorSeat.addEventListener('change', renderStatistics);
    monitorType.addEventListener('change', renderStatistics);
    root.addEventListener('change', event => {
      const input = event.target;
      if (input.hasAttribute('data-select-all')) {
        selected.clear();
        if (input.checked) currentRows().filter(eligible).forEach(row => selected.add(row.id));
        render();
      }
      if (input.dataset.selectRow) {
        if (input.checked) selected.add(input.dataset.selectRow);
        else selected.delete(input.dataset.selectRow);
        render();
      }
      if (input.dataset.column) {
        if (input.checked) hiddenColumns.delete(input.dataset.column);
        else hiddenColumns.add(input.dataset.column);
        render();
      }
      if (input.id === 'masked-sort') { sort = input.value; restart(); }
      if (input.id === 'masked-direction') { direction = input.value; restart(); }
      if (input.id === 'masked-page') { page = Number(input.value); render(); }
      if (input.id === 'masked-size') { size = Number(input.value); restart(); }
    });
    root.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || !get('#masked-fields').classList.contains('show')) return;
      get('#masked-fields').classList.remove('show');
      get('[data-fields]').setAttribute('aria-expanded', 'false');
      get('[data-fields]').focus();
    });
    assign.addEventListener('input', event => {
      const input = event.target;
      if (!input.dataset.seat) return;
      counts[input.dataset.seat] = input.validity.valid ? Number(input.value) : 0;
      updateCounts();
    });

    root.addEventListener('click', event => {
      const button = event.target.closest('button');
      if (!event.target.closest('.field-picker')) {
        get('#masked-fields').classList.remove('show');
        get('[data-fields]').setAttribute('aria-expanded', 'false');
      }
      if (!button) return;
      const help = monitorFields[button.dataset.monitorHelp];
      if (help) {
        const dialog = get('#masked-monitor-help');
        get('#masked-monitor-help-title').textContent = help.title;
        dialog.querySelector('[data-help-purpose]').textContent = help.purpose;
        dialog.querySelector('[data-help-example]').textContent = help.example;
        dialog.querySelector('[data-help-note]').textContent = help.note;
        dialog.showModal();
        return;
      }
      if (button.hasAttribute('data-monitor-settings') && isSupervisor()) {
        monitorSettings.hidden = !monitorSettings.hidden;
        monitorSettingsStatus.hidden = true;
        if (!monitorSettings.hidden) {
          for (const [key, value] of Object.entries(monitorLimits())) monitorSettings.elements[key].value = value;
          monitorSettings.elements.firstWarning.focus();
        } else get('#masked-statistics-controls [data-monitor-settings]').focus();
        return;
      }
      const {scope:next, page:step, maskedDetail, maskedAssign} = button.dataset;
      if (next) {
        scope = next;
        if (scope === 'errors' && sort === '任务编码') { sort = '任务接收时间'; get('#masked-sort').value = sort; }
        restart();
        if (scope === 'stats' && localWorkspace) refreshDccWorklist(false, true);
      }
      const alertSeat = button.dataset.seatAlerts;
      if (alertSeat && (isSupervisor() || alertSeat === role.value)) {
        monitorSeat.value = alertSeat;
        monitorType.value = '';
        renderStatistics();
        (isSupervisor() ? monitorSeat : monitorType).focus();
      }
      const assignedSeat = button.dataset.seatTodo;
      if (assignedSeat && (isSupervisor() || assignedSeat === role.value)) {
        forms.todo.reset();
        forms.todo.elements.owner.value = assignedSeat;
        criteria.todo = new FormData(forms.todo);
        scope = 'todo';
        restart();
        get('[data-scope="todo"]').focus();
      }
      if (step) { page += Number(step); render(); }
      if (button.hasAttribute('data-fields')) {
        const open = get('#masked-fields').classList.toggle('show');
        button.setAttribute('aria-expanded', String(open));
      }
      const detailId = maskedDetail || button.dataset.maskedMonitorDetail;
      if (detailId) {
        const row = records.find(row => row.id === detailId);
        if (row && canSee(row)) showDetail(row, button);
      }
      for (const [kind, id] of [['reconcile', button.dataset.privacyReconcile], ['retry', button.dataset.privacyRetry]]) {
        if (id) {
          updatePrivacy(kind, id, button);
          return;
        }
      }
      if (button.dataset.detailPanel) {
        for (const tab of detail.querySelectorAll('[data-detail-panel]')) {
          const active = tab === button;
          tab.setAttribute('aria-pressed', String(active));
          tab.classList.toggle('active', active);
          detail.querySelector('#' + tab.getAttribute('aria-controls')).classList.toggle('active', active);
        }
      }
      if (maskedAssign) openAssign(records.filter(row => row.id === maskedAssign));
      if (button.hasAttribute('data-all')) openAssign(currentRows());
      if (button.hasAttribute('data-selected')) openAssign(currentRows().filter(row => selected.has(row.id)));
      if (button.hasAttribute('data-return-list')) showList();
      if (button.hasAttribute('data-cancel')) assign.close();
      if (button.hasAttribute('data-agent-reset')) { accountInput.value = ''; renderAgents(); }
      if (button.hasAttribute('data-agent-search')) renderAgents(accountInput.value.trim());
      if (button.hasAttribute('data-average')) {
        const ids = Object.keys(agents);
        ids.forEach((id, index) => { counts[id] = Math.floor(targets.length / ids.length) + Number(index < targets.length % ids.length); });
        renderAgents(accountInput.value.trim());
      }
      if (button.hasAttribute('data-export') && isSupervisor()) exportRows();
    });
    assign.querySelector('form').addEventListener('submit', async event => {
      event.preventDefault();
      if (saving || !targets.length || targets.some(row => !eligible(row)) || Object.values(counts).reduce((a, b) => a + b, 0) !== targets.length) return;
      let index = 0;
      const assignments = [];
      for (const [owner, count] of Object.entries(counts)) {
        for (const row of targets.slice(index, index + count)) assignments.push({taskId: row.id, owner});
        index += count;
      }
      if (localWorkspace) {
        saving = true;
        updateCounts();
        try {
          await workspaceRequest('assign', {assignments});
        } catch (error) {
          get('#masked-assign-feedback').textContent = error.message;
          return;
        } finally {
          saving = false;
          assign.querySelector('[type=submit]').disabled = false;
        }
      } else {
        for (const {taskId, owner} of assignments) {
          const row = targets.find(target => target.id === taskId);
          row.owner = owner;
          row.assignedAt = demoDate + ' 09:20:00';
        }
      }
      assign.close();
      selected.clear();
      if (localWorkspace) await refreshDccWorklist();
      else render();
      get('#masked-feedback').textContent = `已分配 ${assignments.length} 条任务。`;
    });
    const workspaceRequest = (action, body) => requestMaskedWorkspace(action, body, localToken);

    async function updatePrivacy(kind, id, button) {
      if (!localWorkspace || !isSupervisor()) return;
      const section = button.closest('.masked-privacy-actions');
      if (section.querySelector('button:disabled')) return;
      const buttons = [...section.querySelectorAll('button')];
      buttons.forEach(item => { item.disabled = true; });
      const feedback = get('#masked-privacy-feedback');
        feedback.textContent = '正在处理取号请求…';
      try {
        const snapshot = await workspaceRequest('privacy/' + encodeURIComponent(id) + '/' + kind, {});
        const row = readIntake(snapshot);
        const existing = records.find(record => record.id === id);
        if (existing) Object.assign(existing, row);
        render();
        const trigger = get('[data-masked-detail="' + id + '"]') || detailTrigger;
        if (feedback.isConnected && !detail.hidden) {
          showDetail(row, trigger, true);
          detailTrigger = trigger;
          const nextFeedback = get('#masked-privacy-feedback');
          if (!nextFeedback.textContent.trim()) nextFeedback.textContent = '号码状态已更新。';
          (detail.querySelector('[data-privacy-retry], [data-privacy-reconcile]') || get('#masked-detail-title')).focus({preventScroll: true});
        }
      } catch (error) {
        feedback.textContent = error.message || '读取号码状态失败。';
      } finally {
        buttons.forEach(item => { item.disabled = false; });
      }
    }

    async function refreshDccWorklist(switching = false, statisticsOnly = false) {
      const version = ++fetchVersion;
      if (switching) {
        lastStatisticsRead = null;
        statisticsStatus = '';
        records.length = 0;
        localToken = undefined;
        restart();
      }
      const feedback = get('#masked-feedback');
      if (!statisticsOnly) feedback.textContent = '正在读取本地工作台…';
      try {
        if (!localToken) {
          const {token} = await workspaceRequest('session', {account: role.value});
          if (version !== fetchVersion) return;
          localToken = token;
        }
        const {items, monitorSettings: latestLimits} = await workspaceRequest('tasks');
        if (version !== fetchVersion || !list.isConnected || (statisticsOnly && (scope !== 'stats' || list.hidden))) return;
        if (monitoring.validSettings(latestLimits)) remoteMonitorSettings = latestLimits;
        records.splice(0, records.length, ...items.map(readIntake));
        lastStatisticsRead = Date.now();
        statisticsStatus = '';
        if (statisticsOnly && scope === 'stats' && !list.hidden) {
          renderStatistics();
          return;
        }
        for (const field of filtersList) {
          const [label, value = byColumn[label], type] = field;
          if (type || optionDefaults[label]) continue;
          const select = forms.tasks.elements.namedItem(label);
          const saved = select.value;
          select.options.length = 1;
          for (const option of new Set(records.map(value).filter(Boolean))) select.add(new Option(option));
          select.value = [...select.options].some(option => option.value === saved) ? saved : '';
          if (saved && !select.value) criteria.tasks.delete(label);
        }
        restart();
        feedback.textContent = '本地联调 · ' + (isSupervisor() ? '主管' : displayOwner(role.value));
      } catch {
        if (version === fetchVersion) {
          statisticsStatus = '暂时无法更新 · ' + (lastStatisticsRead ? `最近成功 ${formatTime(lastStatisticsRead)}` : '等待下次自动更新');
          get('#masked-monitor-updated').textContent = statisticsStatus;
          if (!statisticsOnly) feedback.textContent = '无法读取本地工作台，请重新查询。';
        }
      }
    }

    async function refreshDccIntake() {
      const feedback = get('#masked-feedback');
      feedback.textContent = '正在读取本地接单记录…';
      try {
        const response = await fetch('/dcc/intake/' + encodeURIComponent(poolTask));
        if (!response.ok) throw new Error('读取接单记录失败');
        const row = readIntake(await response.json());
        records.splice(0, records.length, row);
        scope = row.task ? 'new' : 'errors';
        restart();
        feedback.textContent = '本地模拟接单数据';
      } catch {
        feedback.textContent = '无法读取这笔本地接单记录，请核对派单标识后重新查询。';
      }
    }

    const linkedLead = params.get('maskedLead');
    const linkedRow = records.find(row => row.original === linkedLead);
    if (linkedRow) {
      scope = linkedRow.task ? linkedRow.bucket || 'new' : 'errors';
      const kind = linkedRow.task ? 'tasks' : 'errors';
      forms[kind].elements.namedItem(linkedRow.task ? 'original' : 'identifier').value = linkedRow.original;
      criteria[kind] = new FormData(forms[kind]);
    }
    render();
    if (poolTask) refreshDccIntake();
    if (localWorkspace) refreshDccWorklist();
  };
})();
