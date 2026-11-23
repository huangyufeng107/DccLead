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
    if (record.owner) events.push([record.assignedAt?.slice(11) || '09:07:20', '主管人工派单', displayOwner(record.owner)]);
    return events;
  };

  const scopes = { new: '新任务分配', old: '旧任务分配', overdue: '逾期任务分配', todo: '待跟进', stats: '任务统计', errors: '接单异常' };
  const receivedAt = row => row.local ? row.receivedAt : demoDate + ' ' + row.time;
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
  const privacyColumns = [
    ['隐私号', row => row.privacy?.number], ['隐私号失效截止时间', row => row.privacy?.expiresAt],
    ['隐私号状态', row => row.privacy?.status || '待取号']
  ];
  const columns = [...taskColumns, ...intakeColumns, ...privacyColumns];
  const byColumn = Object.fromEntries(columns);
  const displayField = (row, label, value) => value || (label === '坐席账号' && row.task ? '未分配' : '—');
  const filtersList = [
    ['联系电话', phone, 'text'], ['意向车系'], ['线索来源'], ['渠道编码'],
    ['初始意向级别'], ['留资时间', byColumn['留资时间'], 'date'], ['任务接收时间', receivedAt, 'date'],
    ['坐席账号'], ['分配规则'], ['是否有上次坐席跟进', row => row.previousAgent ? '是' : '否'],
    ['意向专营店'], ['油电类型'], ['入池关联标识', byColumn['入池关联标识'], 'text']
  ];
  const optionDefaults = { 坐席账号: Object.keys(agents), 初始意向级别: ['H', 'A', 'B', 'C'], 分配规则: ['人工分配'] };

  window.renderMaskedLeadIntake = root => {
    const params = new URLSearchParams(location.search);
    const poolTask = params.get('poolTask');
    const localWorkspace = params.get('dccMode') === 'local' && !poolTask;
    const records = localWorkspace || poolTask ? [] : headquarters;
    let localToken;
    let fetchVersion = 0;
    let saving = false;
    const today = () => localWorkspace ? localTime.format(new Date()).slice(0, 10) : demoDate;
    let scope = 'new';
    const criteria = { tasks: new FormData(), errors: new FormData() };
    let page = 1;
    let size = 10;
    let targets = [];
    let sort = '任务接收时间';
    let direction = 'desc';
    const hiddenColumns = new Set();
    const selected = new Set();
    const counts = {};
    const get = selector => root.querySelector(selector);
    root.innerHTML = `
      <main class="masked-intake" aria-label="抖音掩码留资">
        <nav class="strategy-config-tabs show" aria-label="任务分配分类">
          ${Object.entries(scopes).filter(([key]) => !poolTask || !['todo', 'stats'].includes(key)).map(([key,label]) => `<button class="strategy-config-tab" type="button" data-scope="${key}">${label}</button>`).join('')}
        </nav>
        <form class="filter-row masked-intake-filters"><div class="lead-search-panel">
          <div class="lead-search-title">筛选查询</div>
          <div class="lead-search-grid compact">
          <div class="search-field"><label for="masked-task">任务编码：</label><input id="masked-task" class="lead-input" name="task" placeholder="请输入" autocomplete="off" aria-label="任务编码"></div>
          <div class="search-field"><label for="masked-original">线索编码：</label><input id="masked-original" class="lead-input" name="original" placeholder="请输入" autocomplete="off" aria-label="线索编码"></div>
            <div class="lead-search-actions">
              <button class="btn-add" type="submit">查询</button><button class="btn-secondary" type="reset">重置</button>
              <button class="btn-secondary" type="button" data-refresh>刷新</button>
            </div>
          </div>
          <details class="lead-search-more"><summary>更多筛选</summary><div class="lead-search-grid masked-intake-more">
            ${filtersList.map(([label, value = byColumn[label], type]) => {
              if (type === 'text') return `<label class="search-field">${label}<input class="lead-input" name="${label}" placeholder="请输入"></label>`;
              if (type === 'date') return `<fieldset><legend>${label}</legend><div class="sd-date-range">
                <input class="lead-input" type="date" name="${label}开始" aria-label="${label}开始">至
                <input class="lead-input" type="date" name="${label}结束" aria-label="${label}结束"></div></fieldset>`;
              const options = optionDefaults[label] || [...new Set(records.map(value).filter(Boolean))];
              return `<label class="search-field">${label}<select class="lead-select" name="${label}" aria-label="${label}"><option value="">请选择</option>
                ${options.map(option => `<option>${escape(option)}</option>`).join('')}</select></label>`;
            }).join('')}
          </div></details>
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
              <button class="btn-secondary" type="button" data-refresh>刷新</button>
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
          <div class="lead-toolbar"><div class="section-title">抖音掩码留资任务统计</div></div>
          <div id="masked-statistics-summary" class="masked-statistics-summary" aria-live="polite"></div>
          <div class="lead-table-wrap"><table class="lead-table">
            <thead><tr><th>坐席账号</th><th>今日已分配量</th><th>待跟进量</th><th>已完成量</th></tr></thead>
            <tbody></tbody>
          </table></div>
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

    const forms = { tasks: get('.masked-intake-filters'), errors: get('.masked-error-filters') };
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
    const pendingFollowup = row => row.task && row.owner && !row.followupComplete;
    const eligible = row => !poolTask && isSupervisor() && row.task && row.status !== 'pending' && !row.owner;
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
      const fields = criteria.tasks;
      for (const [key, value] of [['task', row.task], ['original', row.original]]) {
        if (!(value || '').toLowerCase().includes((fields.get(key) || '').trim().toLowerCase())) return false;
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
      : columns;

    function seatStats(account) {
      const owned = records.filter(row => row.owner === account);
      return {
        assignedToday: owned.filter(row => row.assignedAt?.slice(0, 10) === today()).length,
        pending: owned.filter(pendingFollowup).length,
        completed: owned.filter(row => row.followupComplete).length
      };
    }

    function renderStatistics() {
      const visible = records.filter(row => row.task && canSee(row));
      const pending = visible.filter(pendingFollowup).length;
      const summary = [`待跟进 ${pending} 条`, `已完成 ${visible.filter(row => row.followupComplete).length} 条`];
      if (isSupervisor()) summary.unshift(`待分配 ${visible.filter(eligible).length} 条`);
      get('#masked-statistics-summary').textContent = summary.join('　');
      get('#masked-statistics tbody').innerHTML = Object.entries(agents)
        .filter(([account]) => isSupervisor() || account === role.value)
        .map(([account, name]) => {
          const stats = seatStats(account);
          return `<tr><td>${account} · ${name}</td><td>${stats.assignedToday}</td><td>${stats.pending}</td><td>${stats.completed}</td></tr>`;
        }).join('');
    }

    function render() {
      const statistics = scope === 'stats';
      forms.tasks.hidden = scope === 'errors' || statistics;
      forms.errors.hidden = scope !== 'errors';
      get('[aria-label="接单查询结果"]').hidden = statistics;
      get('#masked-statistics').hidden = !statistics;
      if (statistics) renderStatistics();
      const rows = currentRows();
      const headings = tableColumns().filter(([label]) => scope === 'errors' || !hiddenColumns.has(label));
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
      get('[data-fields]').closest('.field-picker').hidden = scope === 'errors';
      get('#masked-sort option[value="任务编码"]')?.toggleAttribute('disabled', scope === 'errors');
      get('#masked-list-title').textContent = poolTask ? '总部 DCC 接单联调记录' : scope === 'errors' ? '接单异常列表' : scope === 'todo' ? '抖音掩码留资待跟进' : '抖音掩码留资列表';
      const selection = selectable ? `<th><input type="checkbox" aria-label="全选可分配任务" data-select-all ${canAssign.length ? '' : 'disabled'} ${canAssign.length && canAssign.every(row => selected.has(row.id)) ? 'checked' : ''}></th>` : '';
      get('.masked-intake-table thead').innerHTML = `<tr>${selection}<th>序号</th>${headings.map(([label]) => {
        const active = sort === label;
        return `<th scope="col"${active ? ` aria-sort="${direction === 'asc' ? 'ascending' : 'descending'}"` : ''}>
          ${label}${active ? ` <span class="masked-sort-mark" aria-hidden="true">${direction === 'asc' ? '↑' : '↓'}</span>` : ''}</th>`;
      }).join('')}<th scope="col">操作</th></tr>`;
      get('.masked-intake-table tbody').innerHTML = rows.length ? rows.slice(offset, offset + size).map((row, index) => {
        const checkbox = selectable ? `<td><input type="checkbox" aria-label="选择 ${row.task}" data-select-row="${row.id}" ${eligible(row) ? '' : 'disabled'} ${selected.has(row.id) ? 'checked' : ''}></td>` : '';
        const values = headings.map(([label, read]) => {
          const value = read(row);
          if (label === '接单结果') return `<td>${tag(statuses[row.status])}</td>`;
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

    function showDetail(row, trigger) {
      const fields = [
        ['任务编码', escape(row.task || '未建单')], ['线索编码', escape(row.original)],
        ['联系电话', escape(phone(row))], ['接单结果', tag(statuses[row.status])],
        ['任务归属', row.task ? escape(displayOwner(row.owner)) : '—'], ['任务接收时间', receivedAt(row)]
      ];
      const buildSection = (title, entries) => `<section class="detail-section">
        <div class="detail-section-title">${title}</div><div class="detail-section-body">
          ${entries.map(([label,value]) => `<div class="lead-detail-item"><div class="lead-detail-label">${label}</div>
            <div class="lead-detail-value">${escape(displayField(row, label, value))}</div></div>`).join('')}
        </div></section>`;
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
          ${row.task ? buildSection('隐私号信息', privacyColumns.map(([label,read]) => [label, read(row)])) : ''}
          ${buildSection('线索与任务信息', taskColumns.map(([label,read]) => [label, read(row)]))}
        </div>
        <div class="detail-tab-panel" id="masked-detail-logs">
          <div class="log-table-card"><table class="log-table"><thead><tr><th>时间</th><th>节点</th><th>说明</th></tr></thead>
          <tbody>${eventsFor(row).map(([time,title,description]) =>
            `<tr><td>${escape(row.local ? time : demoDate + ' ' + time)}</td><td>${title}</td><td>${escape(description)}</td></tr>`).join('')}</tbody></table></div>
        </div>`;
      listScroll = scrollArea.scrollTop;
      detailTrigger = trigger;
      list.hidden = true;
      detail.hidden = false;
      setPageName('NEV培育 / 培育任务 / 抖音掩码留资 / 接单详情');
      scrollArea.scrollTop = 0;
      get('#masked-detail-title').focus({preventScroll: true});
    }

    function showList() {
      detail.hidden = true;
      list.hidden = false;
      setPageName('NEV培育 / 培育任务');
      scrollArea.scrollTop = listScroll;
      detailTrigger?.focus({preventScroll: true});
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
      const headings = tableColumns().filter(([label]) => scope === 'errors' || !hiddenColumns.has(label));
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
      });
      form.addEventListener('reset', () => { criteria[kind] = new FormData(); restart(); });
    }
    role.addEventListener('change', () => {
      scope = 'new';
      forms.tasks.reset();
      if (localWorkspace) refreshDccWorklist(true);
    });
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
      const {scope:next, page:step, maskedDetail, maskedAssign} = button.dataset;
      if (next) {
        scope = next;
        if (scope === 'errors' && sort === '任务编码') { sort = '任务接收时间'; get('#masked-sort').value = sort; }
        restart();
      }
      if (step) { page += Number(step); render(); }
      if (button.hasAttribute('data-fields')) {
        const open = get('#masked-fields').classList.toggle('show');
        button.setAttribute('aria-expanded', String(open));
      }
      if (button.hasAttribute('data-refresh')) {
        if (poolTask) refreshDccIntake();
        else if (localWorkspace) refreshDccWorklist();
        else restart();
      }
      if (maskedDetail) {
        const row = records.find(row => row.id === maskedDetail);
        if (row && canSee(row)) showDetail(row, button);
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
    function readIntake(snapshot) {
      const {lead, taskId, dccTaskId, receiptStatus, receiptReason, events, owner, assignedAt, followupComplete} = snapshot;
      const accepted = receiptStatus === 'accepted';
      const recovered = events.some(event => event.kind === 'acceptance_checked' && event.status === 'accepted');
      const replayed = events.some(event => event.kind === 'duplicate_intake');
      const status = accepted ? (recovered ? 'recovered' : replayed ? 'replayed' : 'accepted')
        : receiptStatus === 'pending_confirmation' ? 'pending' : 'failed';
      const titles = {
        dispatch_sent: '收到临时池派单', dcc_task_created: '建单成功', acceptance_returned: '接单回执',
        acceptance_checked: '核对接单结果', duplicate_intake: '收到重复推送'
      };
      const log = events.map(event => [
        localTime.format(new Date(event.at)), titles[event.kind],
        event.receiverTaskId || event.reason || (event.kind === 'duplicate_intake' ? '沿用原接单记录' : taskId)
      ]);
      const firstDispatch = events.find(event => event.kind === 'dispatch_sent');
      return {
        id: taskId, local: true, task: dccTaskId, original: lead.originalPushId,
        association: lead.associationId, dispatch: taskId, status, reason: receiptReason,
        entry: lead.entry, channel: lead.rChannel, power: lead.powerType, series: lead.carSeriesId,
        intentionStore: lead.originalIntentionStoreId, store: lead.storeId, maskedPhone: lead.maskedPhone,
        owner, assignedAt: assignedAt ? localTime.format(new Date(assignedAt)) : '', followupComplete,
        smartcode: lead.smartcode, receivedAt: firstDispatch ? localTime.format(new Date(firstDispatch.at)) : '—', events: log
      };
    }

    async function workspaceRequest(action, body) {
      const response = await fetch('/dcc/workspace/' + action, {
        method: body ? 'POST' : 'GET',
        headers: {...(localToken ? {Authorization: 'Bearer ' + localToken} : {}), ...(body ? {'Content-Type': 'application/json'} : {})},
        body: body ? JSON.stringify(body) : undefined
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || '操作失败，请刷新后重试。');
      return result;
    }

    async function refreshDccWorklist(switching = false) {
      const version = ++fetchVersion;
      if (switching) {
        records.length = 0;
        localToken = undefined;
        restart();
      }
      const feedback = get('#masked-feedback');
      feedback.textContent = '正在读取本地工作台…';
      try {
        if (!localToken) {
          const {token} = await workspaceRequest('session', {account: role.value});
          if (version !== fetchVersion) return;
          localToken = token;
        }
        const {items} = await workspaceRequest('tasks');
        if (version !== fetchVersion) return;
        records.splice(0, records.length, ...items.map(readIntake));
        restart();
        feedback.textContent = '本地联调 · ' + (isSupervisor() ? '主管' : displayOwner(role.value));
      } catch {
        if (version === fetchVersion) feedback.textContent = '无法读取本地工作台，请刷新重试。';
      }
    }

    async function refreshDccIntake() {
      const feedback = get('#masked-feedback');
      const refresh = forms[scope === 'errors' ? 'errors' : 'tasks'].querySelector('[data-refresh]');
      refresh.disabled = true;
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
        feedback.textContent = '无法读取这笔本地接单记录，请核对派单标识后刷新。';
      } finally {
        refresh.disabled = false;
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
