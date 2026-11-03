(function () {
  'use strict';

  const baseRender = window.renderOpsRecordingListPage;
  if (typeof baseRender !== 'function') return;
  const datasets = { all: window.opsRecordingMockData, ai: window.opsAiRecordingMockData, manual: window.opsManualRecordingMockData };
  const prefixes = { all: 'recFilter', ai: 'recAiFilter', manual: 'recManualFilter' };
  const dateIds = {
    all: ['recStartDate', 'recEndDate'],
    ai: ['recAiStartDate', 'recAiEndDate', 'recAiSyncStartDate', 'recAiSyncEndDate', 'recAiCreateStartDate', 'recAiCreateEndDate'],
    manual: ['recManualStartDate', 'recManualEndDate', 'recManualCreateStartDate', 'recManualCreateEndDate']
  };
  const fields = {
    all: { TaskCode: 'taskCode', LeadCode: 'leadId', Phone: 'phone', CustName: 'customerName', CallType: 'callType', Seat: 'seatAccount', CallStatus: 'statusName', Series: 'intentSeries', QcStatus: 'qcStatus', HangupSide: 'hangupSide' },
    ai: { LeadCode: 'hqNurtureLeadCode', ClueId: 'hqClueId', VisitCode: 'hqAiVisitCode', Phone: 'phone', CallId: 'callId', CallType: 'callType', CallStatus: 'callStatus', CallTag: 'callTag', Wechat: 'wechat', Creator: 'creator' },
    manual: { TaskCode: 'taskCode', ClueId: 'hqClueId', Phone: 'phone', Seat: 'seatAccount' }
  };
  const state = Object.fromEntries(Object.keys(datasets).map(key => [key, { draft: null, applied: null, page: 1, pageSize: 10, sort: '', direction: 'desc', hidden: new Set(), expanded: false }]));
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const tab = () => ['all', 'ai', 'manual'].includes(opsRecordingActiveTab) ? opsRecordingActiveTab : 'all';
  const notice = (message, success) => { if (typeof showToast === 'function') showToast(message, success); };
  const duration = row => Number(row.durationSec ?? row.duration ?? 0);
  const date = value => String(value || '').slice(0, 10);
  const prefix = key => prefixes[key];

  function collect(key) {
    const result = {};
    document.querySelectorAll(`#opsRecordingListPage [id^="${prefix(key)}"]`).forEach(input => {
      if ('value' in input) result[input.id.slice(prefix(key).length)] = input.value.trim();
    });
    for (const id of dateIds[key]) {
      const input = document.getElementById(id);
      if (input) result[id] = input.value;
    }
    return result;
  }
  function restore(key) {
    if (!state[key].draft) return;
    for (const [name, value] of Object.entries(state[key].draft)) {
      const input = document.getElementById(name.startsWith('rec') ? name : prefix(key) + name);
      if (input && 'value' in input) input.value = value;
    }
  }
  function inRange(value, from, to) {
    const day = date(value);
    return (!from || day >= from) && (!to || day <= to);
  }
  function durationMatches(seconds, range) {
    if (!range) return true;
    if (range === '0-15') return seconds < 15;
    if (range === '15-60') return seconds >= 15 && seconds < 60;
    if (range === '60-180') return seconds >= 60 && seconds < 180;
    if (range === '180+') return seconds >= 180;
    return true;
  }
  function matches(key, row, filters) {
    if (!filters) return true;
    for (const [name, prop] of Object.entries(fields[key])) {
      const wanted = filters[name];
      if (wanted && !String(row[prop] ?? '').toLowerCase().includes(wanted.toLowerCase())) return false;
    }
    if (!durationMatches(duration(row), filters.Duration)) return false;
    if (key === 'all') {
      if (filters.QcStatus === '未转写' && row.transcript?.length) return false;
      return inRange(row.callTime, filters.recStartDate, filters.recEndDate);
    }
    if (key === 'manual') return inRange(row.recordTime, filters.recManualStartDate, filters.recManualEndDate)
      && inRange(row.createTime, filters.recManualCreateStartDate, filters.recManualCreateEndDate);
    return inRange(row.callStartTime, filters.recAiStartDate, filters.recAiEndDate)
      && inRange(row.syncTime, filters.recAiSyncStartDate, filters.recAiSyncEndDate)
      && inRange(row.createTime, filters.recAiCreateStartDate, filters.recAiCreateEndDate);
  }
  function filtered(key) {
    const s = state[key];
    const result = datasets[key].filter(row => matches(key, row, s.applied));
    const sortName = s.sort || (key === 'manual' ? '录音时间' : '呼叫开始时间');
    const prop = sortName === '通话时长' ? null : sortName === '创建时间' ? 'createTime' : key === 'manual' ? 'recordTime' : key === 'ai' ? 'callStartTime' : 'callTime';
    result.sort((a, b) => (prop ? String(a[prop] || '').localeCompare(String(b[prop] || '')) : duration(a) - duration(b)) * (s.direction === 'asc' ? 1 : -1));
    return result;
  }
  function pager(key, count) {
    const s = state[key], pages = Math.max(1, Math.ceil(count / s.pageSize));
    s.page = Math.min(s.page, pages);
    const arrow = (direction, disabled) => `<button type="button" class="prototype-pagination-arrow" aria-label="${direction === 'left' ? '上一页' : '下一页'}" ${disabled ? 'disabled' : ''} onclick="opsRecordingSetPage(${s.page + (direction === 'left' ? -1 : 1)})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="${direction === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'}"/></svg></button>`;
    return `<div class="prototype-pagination recording-pagination"><span class="prototype-pagination-summary">共 ${count} 条记录，当前第 ${s.page} / ${pages} 页</span><div class="prototype-pagination-controls">
      <select class="prototype-pagination-select" aria-label="每页显示条数" onchange="opsRecordingSetPageSize(this.value)">${[5, 10, 20, 50].map(n => `<option value="${n}" ${n === s.pageSize ? 'selected' : ''}>每页 ${n} 条</option>`).join('')}</select>
      ${arrow('left', s.page === 1)}<select class="prototype-pagination-select" aria-label="选择页码" onchange="opsRecordingSetPage(this.value)">${Array.from({ length: pages }, (_, i) => `<option value="${i + 1}" ${s.page === i + 1 ? 'selected' : ''}>第 ${i + 1} 页</option>`).join('')}</select>${arrow('right', s.page === pages)}
    </div></div>`;
  }
  function updateSummary(key, data) {
    const box = document.querySelector('#opsRecordingListPage .mw-report-summary');
    if (!box) return;
    const withText = data.filter(row => row.transcript?.length).length;
    const avg = data.length ? Math.round(data.reduce((sum, row) => sum + duration(row), 0) / data.length) : 0;
    const stats = key === 'manual'
      ? [['当前筛选录音', data.length, '条'], ['平均通话时长', `${Math.floor(avg / 60)}分${String(avg % 60).padStart(2, '0')}秒`, ''], ['已有转写', withText, '条'], ['未转写', data.length - withText, '条'], ['涉及坐席', new Set(data.map(row => row.seatAccount)).size, '人']]
      : [['当前筛选录音', data.length, '条'], ['已接通', data.filter(row => (row.callStatus || row.statusName) === '已接通').length, '条'], ['平均通话时长', `${Math.floor(avg / 60)}分${String(avg % 60).padStart(2, '0')}秒`, ''], ['已有转写', withText, '条'], ['未转写', data.length - withText, '条']];
    box.innerHTML = stats.map(([label, value, unit]) => `<div class="recording-stat"><span>${label}</span><strong>${esc(value)}<small>${unit}</small></strong><em>当前筛选范围</em></div>`).join('');
  }
  function update() {
    const key = tab(), s = state[key], root = document.getElementById('opsRecordingListPage');
    if (!root) return;
    const list = filtered(key), table = root.querySelector('.mw-report-table-scroll table');
    if (!table) return;
    s.page = Math.min(s.page, Math.max(1, Math.ceil(list.length / s.pageSize)));
    const visible = new Set(list.slice((s.page - 1) * s.pageSize, s.page * s.pageSize).map(row => row.id));
    const body = table.tBodies[0], trs = new Map(Array.from(body.rows).filter(tr => tr.dataset.recordingId).map(tr => [Number(tr.dataset.recordingId), tr]));
    body.querySelector('.recording-empty')?.remove();
    for (const row of list) { const tr = trs.get(row.id); if (tr) body.appendChild(tr); }
    for (const tr of trs.values()) tr.hidden = !visible.has(Number(tr.dataset.recordingId));
    if (!visible.size) { const tr = document.createElement('tr'); tr.className = 'recording-empty'; const td = document.createElement('td'); td.colSpan = table.tHead.rows[0].cells.length; td.textContent = '没有符合条件的录音，请调整筛选条件'; tr.appendChild(td); body.appendChild(tr); }
    const pagination = root.querySelector('.pagination, .recording-pagination');
    if (pagination) pagination.outerHTML = pager(key, list.length);
    const title = root.querySelector('.mw-report-table-toolbar h4');
    if (title) title.textContent = `${key === 'manual' ? '人工客服录音列表' : key === 'ai' ? 'AI外呼录音列表' : '录音列表'}（共 ${list.length} 条记录）`;
    updateSummary(key, list);
    applyColumns(table, s.hidden);
  }
  function applyColumns(table, hidden) {
    for (const tr of table.rows) Array.from(tr.cells).forEach((cell, i) => { cell.style.display = hidden.has(i) ? 'none' : ''; });
  }
  function bindActions(key, root) {
    const rows = datasets[key];
    root.querySelectorAll('.mw-report-table-scroll tbody tr').forEach(tr => {
      const id = Number(tr.cells[0]?.textContent.trim());
      const row = rows.find(item => item.id === id);
      if (!row) return;
      tr.dataset.recordingId = id;
      const buttons = Array.from(tr.cells[tr.cells.length - 1].querySelectorAll('button'));
      const code = row.recId || row.callId || row.taskCode;
      const play = buttons.find(button => button.textContent.includes('试听'));
      const transcript = buttons.find(button => button.textContent.includes('文本'));
      const download = buttons.find(button => button.textContent.includes('下载'));
      if (play) play.onclick = () => window.openOpsAudioPlayerModal(row.phone, row.durationText || `${duration(row)}秒`, code, row.customerName);
      if (transcript) transcript.onclick = () => window.openOpsAudioTranscriptModal(code);
      if (download) {
        download.onclick = () => window.opsRecordingDownloadAudio(key, id);
        if (!row.audioUrl) { download.classList.add('recording-audio-unavailable-button'); download.title = '当前示例记录未附音频文件'; }
      }
    });
  }
  function standardizeFilter(root) {
    const card = root.querySelector('.mw-report-filter-card');
    const box = card?.querySelector('#recAdvancedFilterBox');
    const grid = box?.firstElementChild;
    const actions = box?.nextElementSibling;
    const toolbar = root.querySelector('.mw-report-table-toolbar > div');
    if (!card || !grid || !actions || !toolbar) return;

    const heading = card.firstElementChild;
    const title = heading?.querySelector('span');
    if (title) title.textContent = '筛选查询';
    heading?.querySelectorAll('span:not(:first-child)').forEach(node => node.remove());
    const toggle = heading?.querySelector('button');
    if (toggle) {
      toggle.className = 'recording-filter-toggle';
      toggle.removeAttribute('style');
      toggle.innerHTML = '更多筛选 <span id="recAdvancedFilterText"></span>';
      toggle.setAttribute('aria-controls', 'recAdvancedFilterBox');
    }

    grid.className = 'recording-filter-grid';
    grid.removeAttribute('style');
    const layout = document.createElement('div');
    layout.className = 'recording-filter-layout';
    card.insertBefore(layout, box);
    layout.appendChild(box);
    const queryActions = document.createElement('div');
    queryActions.className = 'recording-filter-actions';
    Array.from(actions.querySelectorAll('button')).forEach(button => {
      const label = button.textContent.trim();
      if (label === '查询') queryActions.insertBefore(button, queryActions.firstChild);
      else if (label === '重置') queryActions.appendChild(button);
      else toolbar.insertBefore(button, toolbar.firstChild);
    });
    layout.appendChild(queryActions);
    actions.remove();
    if (toggle) {
      const bottom = document.createElement('div');
      bottom.className = 'recording-filter-bottom';
      bottom.appendChild(toggle);
      card.appendChild(bottom);
    }
    heading?.classList.add('recording-filter-heading');
    box.removeAttribute('style');
  }
  function syncFilterExpansion(root, expanded) {
    const box = root.querySelector('#recAdvancedFilterBox');
    const label = root.querySelector('#recAdvancedFilterText');
    const toggle = root.querySelector('.recording-filter-toggle');
    if (box) box.firstElementChild?.classList.toggle('is-expanded', expanded);
    if (label) label.textContent = expanded ? '收起' : '展开';
    if (toggle) toggle.setAttribute('aria-expanded', String(expanded));
  }
  function enhance() {
    const key = tab(), s = state[key], root = document.getElementById('opsRecordingListPage');
    if (!root) return;
    standardizeFilter(root);
    restore(key);
    if (!s.draft) s.draft = collect(key);
    if (!s.applied) s.applied = { ...s.draft };
    syncFilterExpansion(root, s.expanded);
    const filterButtons = Array.from(root.querySelectorAll('.mw-report-filter-card button, .mw-report-table-toolbar button'));
    for (const button of filterButtons) {
      const label = button.textContent.trim();
      if (label === '刷新') button.onclick = () => { s.draft = collect(key); window.renderOpsRecordingListPage(); notice('录音列表已刷新', true); };
      if (label === '批量导出录音') { button.onclick = () => window.opsRecordingExportAudio(); button.title = '当前示例记录未附音频文件'; button.classList.add('recording-audio-unavailable-button'); }
      if (['重置', '查询', '批量导出录音', '刷新'].includes(label)) button.classList.add(label === '查询' ? 'recording-primary' : 'recording-secondary');
    }
    const toolbar = root.querySelector('.mw-report-table-toolbar');
    const toolbarButtons = Array.from(toolbar?.querySelectorAll('button') || []);
    const csvButton = toolbarButtons.find(button => button.textContent.includes('导出表格清单'));
    if (csvButton) csvButton.onclick = () => window.opsRecordingExportCsv();
    const fieldButton = toolbarButtons.find(button => button.textContent.includes('字段显示'));
    if (fieldButton) fieldButton.onclick = () => window.opsRecordingToggleFields(fieldButton);
    const selects = toolbar?.querySelectorAll('select') || [];
    if (selects[0]) { selects[0].value = s.sort || selects[0].options[0].value; selects[0].onchange = () => { s.sort = selects[0].value; update(); }; }
    if (selects[1]) { selects[1].value = s.direction === 'asc' ? '升序' : '降序'; selects[1].onchange = () => { s.direction = selects[1].value === '升序' ? 'asc' : 'desc'; update(); }; }
    bindActions(key, root);
    update();
  }
  window.renderOpsRecordingListPage = function () { baseRender(); enhance(); };
  window.opsRecordingApplyFilter = function () {
    const key = tab(), s = state[key], values = collect(key);
    const pairs = key === 'all' ? [['recStartDate', 'recEndDate']] : key === 'ai' ? [['recAiStartDate', 'recAiEndDate'], ['recAiSyncStartDate', 'recAiSyncEndDate'], ['recAiCreateStartDate', 'recAiCreateEndDate']] : [['recManualStartDate', 'recManualEndDate'], ['recManualCreateStartDate', 'recManualCreateEndDate']];
    if (pairs.some(([from, to]) => values[from] && values[to] && values[from] > values[to])) { notice('开始日期不能晚于结束日期', false); return; }
    s.draft = values; s.applied = { ...values }; s.page = 1; update(); notice('录音筛选结果已更新', true);
  };
  window.applyOpsRecordingFilter = window.opsRecordingApplyFilter;
  window.applyOpsAiRecordingFilter = window.opsRecordingApplyFilter;
  window.applyOpsManualRecordingFilter = window.opsRecordingApplyFilter;
  window.opsRecordingResetFilter = function () { const s = state[tab()]; s.draft = null; s.applied = null; s.page = 1; window.renderOpsRecordingListPage(); notice('筛选条件已重置', true); };
  window.resetOpsRecordingFilter = window.opsRecordingResetFilter;
  window.resetOpsAiRecordingFilter = window.opsRecordingResetFilter;
  window.resetOpsManualRecordingFilter = window.opsRecordingResetFilter;
  window.toggleOpsRecordingAdvancedFilter = function () { const s = state[tab()]; s.expanded = !s.expanded; const root = document.getElementById('opsRecordingListPage'); if (root) syncFilterExpansion(root, s.expanded); };
  window.opsRecordingSetPage = function (page) { state[tab()].page = Math.max(1, Number(page) || 1); update(); };
  window.opsRecordingSetPageSize = function (size) { state[tab()].pageSize = Number(size) || 10; state[tab()].page = 1; update(); };
  window.opsRecordingToggleFields = function (anchor) {
    const existing = document.querySelector('.recording-fields-popover');
    if (existing) { existing.remove(); return; }
    const key = tab(), table = document.querySelector('#opsRecordingListPage .mw-report-table-scroll table');
    if (!table) return;
    const panel = document.createElement('div'); panel.className = 'recording-fields-popover';
    panel.innerHTML = `<strong>字段显示</strong><p>选择要显示的表格列</p>${Array.from(table.tHead.rows[0].cells).map((cell, i) => i === 0 || i === table.tHead.rows[0].cells.length - 1 ? '' : `<label><input type="checkbox" value="${i}" ${state[key].hidden.has(i) ? '' : 'checked'}> ${esc(cell.textContent.trim())}</label>`).join('')}`;
    panel.addEventListener('change', event => { const i = Number(event.target.value); event.target.checked ? state[key].hidden.delete(i) : state[key].hidden.add(i); applyColumns(table, state[key].hidden); });
    anchor.parentElement.appendChild(panel);
  };
  window.opsRecordingExportCsv = function () {
    const key = tab(), list = filtered(key);
    if (!list.length) { notice('当前没有可导出的录音记录', false); return; }
    const columns = key === 'manual' ? [['hqClueId', '总部线索ID'], ['phone', '电话号码'], ['seatAccount', '坐席账号'], ['taskCode', '任务编码'], ['recordTime', '录音时间'], ['durationText', '通话时长'], ['createTime', '创建时间']]
      : key === 'ai' ? [['hqClueId', '总部线索ID'], ['hqNurtureLeadCode', '总部培育线索编码'], ['callId', '通话ID'], ['phone', '电话号码'], ['callType', '外呼类型'], ['callStatus', '通话状态'], ['callStartTime', '通话时间'], ['durationSec', '通话时长(秒)'], ['createTime', '创建时间']]
      : [['recId', '录音流水号'], ['taskCode', '任务编码'], ['leadId', '培育线索编码'], ['customerName', '客户姓名'], ['phone', '客户电话'], ['callType', '外呼类型'], ['callTime', '呼叫开始时间'], ['durationText', '通话时长'], ['statusName', '通话结果']];
    const cell = value => `"${String(value == null ? '' : value).replace(/"/g, '""')}"`;
    const csv = [columns.map(([, label]) => cell(label)), ...list.map(row => columns.map(([prop]) => cell(row[prop])))].map(line => line.join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = `${key === 'manual' ? '人工客服' : key === 'ai' ? 'AI外呼' : '全部'}录音清单_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    notice(`已导出 ${list.length} 条录音记录清单`, true);
  };
  window.opsRecordingExportAudio = function () { notice('当前原型未附音频素材，无法打包录音；可导出表格清单', false); };
  window.opsRecordingDownloadAudio = function (key, id) {
    const row = datasets[key].find(item => item.id === id);
    if (!row) return;
    if (!row.audioUrl) { notice('当前示例记录没有音频文件，无法下载录音', false); return; }
    const a = document.createElement('a'); a.href = row.audioUrl; a.download = `${row.recId || row.callId || row.taskCode}.wav`; document.body.appendChild(a); a.click(); a.remove();
  };
  window.openOpsAudioPlayerModal = function (phone, durationText, code, customerName) {
    let modal = document.getElementById('opsAudioModal');
    if (!modal) { modal = document.createElement('div'); modal.id = 'opsAudioModal'; modal.className = 'modal-backdrop'; document.body.appendChild(modal); }
    const record = Object.values(datasets).flat().find(row => [row.recId, row.callId, row.taskCode].includes(code));
    modal.innerHTML = `<div class="recording-player-dialog" role="dialog" aria-modal="true" aria-label="录音试听"><header><strong>录音试听</strong><button type="button" aria-label="关闭" onclick="document.getElementById('opsAudioModal').classList.remove('show')">×</button></header><div class="recording-player-body"><p><b>${esc(customerName)}</b> · ${esc(phone)} · ${esc(durationText)}</p><p>录音编号：${esc(code)}</p>${record?.audioUrl ? `<audio controls preload="none" src="${esc(record.audioUrl)}"></audio>` : '<div class="recording-audio-unavailable">当前原型未附音频素材，无法播放录音。可查看该通话的文本转写。</div>'}</div><footer><button type="button" class="recording-secondary" onclick="document.getElementById('opsAudioModal').classList.remove('show')">关闭</button><button type="button" class="recording-primary" onclick="document.getElementById('opsAudioModal').classList.remove('show'); openOpsAudioTranscriptModal('${esc(code)}')">查看文本转写</button></footer></div>`;
    modal.classList.add('show');
    modal.onclick = event => { if (event.target === modal) modal.classList.remove('show'); };
  };
  window.openOpsAudioTranscriptModal = function (code) {
    const record = datasets[tab()].find(row => [row.recId, row.callId, row.taskCode].includes(code))
      || Object.values(datasets).flat().find(row => [row.recId, row.callId, row.taskCode].includes(code));
    if (!record) { notice('找不到对应的通话记录', false); return; }
    let modal = document.getElementById('opsTranscriptModal');
    if (!modal) { modal = document.createElement('div'); modal.id = 'opsTranscriptModal'; document.body.appendChild(modal); }
    modal.removeAttribute('style');
    modal.className = 'recording-transcript-backdrop';
    const lines = record.transcript || [];
    modal.innerHTML = `<div class="recording-transcript-dialog" role="dialog" aria-modal="true" aria-label="通话文本转写"><header><strong>通话文本转写 · ${esc(code)}</strong><button type="button" aria-label="关闭" onclick="closeOpsAudioTranscriptModal()">×</button></header><div class="recording-transcript-meta"><span>客户：${esc(record.customerName || '—')}</span><span>电话：${esc(record.phone || '—')}</span><span>通话时长：${esc(record.durationText || `${duration(record)}秒`)}</span></div><div class="recording-transcript-body">${lines.length ? lines.map(line => `<div class="recording-transcript-line ${line.speaker.includes('客户') ? 'customer' : ''}"><small>${esc(line.time)} · ${esc(line.speaker)}</small><p>${esc(line.text)}</p></div>`).join('') : '<p>这条通话暂无转写文本。</p>'}</div><footer><button type="button" class="recording-secondary" onclick="opsRecordingCopyTranscript('${esc(code)}')" ${lines.length ? '' : 'disabled'}>复制全文</button><button type="button" class="recording-secondary" onclick="closeOpsAudioTranscriptModal()">关闭</button></footer></div>`;
    modal.classList.add('show');
    modal.onclick = event => { if (event.target === modal) window.closeOpsAudioTranscriptModal(); };
  };
  window.closeOpsAudioTranscriptModal = function () { document.getElementById('opsTranscriptModal')?.classList.remove('show'); };
  window.opsRecordingCopyTranscript = async function (code) {
    const record = datasets[tab()].find(row => [row.recId, row.callId, row.taskCode].includes(code))
      || Object.values(datasets).flat().find(row => [row.recId, row.callId, row.taskCode].includes(code));
    const text = (record?.transcript || []).map(line => `${line.time} ${line.speaker}：${line.text}`).join('\n');
    if (!text) { notice('这条通话暂无转写文本', false); return; }
    try { await navigator.clipboard.writeText(text); notice('转写文本已复制', true); } catch (_) { notice('复制失败，请检查浏览器剪贴板权限', false); }
  };
  document.addEventListener('keydown', event => { if (event.key === 'Escape') { document.getElementById('opsAudioModal')?.classList.remove('show'); window.closeOpsAudioTranscriptModal(); } });
  if (document.getElementById('opsRecordingListPage')?.classList.contains('show')) window.renderOpsRecordingListPage();
})();
