(function () {
  'use strict';

  const baseRender = window.renderOpsBatchDispatchPage;
  if (typeof baseRender !== 'function') return;
  const baseOpenManualDetail = window.openOpsBatchManualDetailModal;
  const baseOpenAiDetail = window.openOpsBatchAiDetailModal;
  const state = {
    '1': { draft: null, applied: null, page: 1, pageSize: 5, sort: '', direction: 'desc', hidden: new Set(), expanded: false },
    '2': { draft: null, applied: null, page: 1, pageSize: 5, sort: '', direction: 'desc', hidden: new Set(), expanded: false }
  };
  const logs = [];
  let dispatchContext = null;
  const fieldMap = {
    TaskCode: 'taskCode', LeadCode: 'leadCode', CustName: 'customerName', Phone: 'phone',
    IntentSeries: 'intentSeries', LatestSeries: 'latestSeries', Store: 'store', LeadStatus: 'latestLeadStatus',
    FirstStatus: 'firstLeadStatus', InitialStatus: 'initialLeadStatus', Level: 'latestLevel',
    ChannelR: 'channelR', ScMedia: 'scMediaName', ScProject: 'scProjectName', ScPlatform: 'scLandingPlatform',
    SmartCode: 'smartCode', VisitResult: 'latestVisitResult', ContactStatus: 'latestContactStatus',
    AbnormalReason: 'abnormalReason', BatchStatus: 'latestBatchStatus', AgentAccount: 'agentAccount',
    UnconnectedScene: 'unconnectedScene', SystemStatus: 'batchSystemStatus', PushStatus: 'pushPreCallStatus',
    InitialSource: 'initialLeadSource', FollowStatus: 'followStatus', FollowCount: 'followCount',
    CallType: 'callType', AiTagStatus: 'aiCallTag'
  };
  const esc = value => String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  const tab = () => opsBatchActiveTab === '2' ? '2' : '1';
  const rows = key => key === '2' ? opsBatchAiMockData : opsBatchManualMockData;
  const selection = key => key === '2' ? opsBatchAiSelectedKeys : opsBatchSelectedKeys;
  const setSelection = (key, keys) => { if (key === '2') opsBatchAiSelectedKeys = keys; else opsBatchSelectedKeys = keys; };
  const prefix = key => key === '2' ? 'opsBatchAiFilter' : 'opsBatchFilter';
  const canDispatch = row => row && row.latestBatchStatus === '待下发';
  const notice = (message, success) => { if (typeof showToast === 'function') showToast(message, success); };

  function collect(key) {
    const values = {};
    document.querySelectorAll(`#opsBatchDispatchPage [id^="${prefix(key)}"]`).forEach(el => {
      if ('value' in el) values[el.id.slice(prefix(key).length)] = el.value.trim();
    });
    return values;
  }
  function restore(key) {
    const draft = state[key].draft;
    if (!draft) return;
    Object.entries(draft).forEach(([suffix, value]) => {
      const input = document.getElementById(prefix(key) + suffix);
      if (input && 'value' in input) input.value = value;
    });
  }
  function matches(row, filters) {
    if (!filters) return true;
    if (filters.ReceiveStart && String(row.receiveTime || '').slice(0, 10) < filters.ReceiveStart) return false;
    if (filters.ReceiveEnd && String(row.receiveTime || '').slice(0, 10) > filters.ReceiveEnd) return false;
    for (const [suffix, value] of Object.entries(filters)) {
      if (!value || suffix === 'ReceiveStart' || suffix === 'ReceiveEnd') continue;
      // 演示门店均为有效且有容量的门店，两个过滤开关不改变这批样例结果。
      if (suffix === 'FilterInvalidStore' || suffix === 'FilterFullStore') continue;
      if (suffix === 'CallStatus') {
        const tag = String(row.aiCallTag || '');
        const connected = !tag.startsWith('未接通-');
        if (value === '已接通' ? !connected : !tag.includes(value)) return false;
        continue;
      }
      if (suffix === 'AbnormalReasonNot') {
        if (String(row.abnormalReason || '').includes(value)) return false;
        continue;
      }
      const prop = fieldMap[suffix];
      if (!prop) continue;
      const actual = String(row[prop] == null ? '' : row[prop]).toLowerCase();
      const wanted = String(value).toLowerCase();
      if (suffix === 'Level' ? !actual.startsWith(wanted.replace('级', '')) : !actual.includes(wanted)) return false;
    }
    return true;
  }
  function filteredRows(key) {
    const s = state[key];
    const list = rows(key).filter(row => matches(row, s.applied));
    const sortField = s.sort === '最新批量下发时间' ? 'latestBatchTime' : s.sort === '最新跟进时间' ? 'latestFollowTime' : key === '2' ? 'receiveTime' : 'assignTime';
    if (s.sort) list.sort((a, b) => String(a[sortField] || '').localeCompare(String(b[sortField] || ''), 'zh-CN') * (s.direction === 'asc' ? 1 : -1));
    return list;
  }
  function pager(key, count) {
    const s = state[key];
    const pages = Math.max(1, Math.ceil(count / s.pageSize));
    s.page = Math.min(s.page, pages);
    return `<div class="prototype-pagination batch-pagination">
      <span class="prototype-pagination-summary">共 ${count} 条记录，当前第 ${s.page} / ${pages} 页</span>
      <div class="prototype-pagination-controls">
        <select class="prototype-pagination-select" aria-label="每页显示条数" onchange="opsBatchSetPageSize(this.value)">${[5, 10, 20, 50].map(n => `<option value="${n}"${s.pageSize === n ? ' selected' : ''}>每页 ${n} 条</option>`).join('')}</select>
        <button type="button" class="prototype-pagination-arrow" aria-label="上一页" ${s.page <= 1 ? 'disabled' : ''} onclick="opsBatchSetPage(${s.page - 1})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
        <select class="prototype-pagination-select" aria-label="选择页码" onchange="opsBatchSetPage(this.value)">${Array.from({ length: pages }, (_, i) => `<option value="${i + 1}"${s.page === i + 1 ? ' selected' : ''}>第 ${i + 1} 页</option>`).join('')}</select>
        <button type="button" class="prototype-pagination-arrow" aria-label="下一页" ${s.page >= pages ? 'disabled' : ''} onclick="opsBatchSetPage(${s.page + 1})"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
      </div></div>`;
  }
  function currentRows(key) {
    const all = filteredRows(key), s = state[key];
    const start = (s.page - 1) * s.pageSize;
    return all.slice(start, start + s.pageSize);
  }
  function updatePage() {
    const key = tab(), s = state[key], container = document.getElementById('opsBatchDispatchPage');
    if (!container) return;
    const all = filteredRows(key);
    s.page = Math.min(s.page, Math.max(1, Math.ceil(all.length / s.pageSize)));
    const visible = currentRows(key);
    const table = container.querySelector('.mw-report-table-scroll table');
    if (!table) return;
    const body = table.tBodies[0];
    const trById = new Map(Array.from(body.querySelectorAll('tr')).filter(tr => tr.querySelector('input[type="checkbox"]')).map(tr => [Number(tr.querySelector('input[type="checkbox"]').value), tr]));
    const visibleIds = new Set(visible.map(row => row.index));
    for (const row of all) { const tr = trById.get(row.index); if (tr) body.appendChild(tr); }
    for (const row of rows(key)) {
      const tr = trById.get(row.index); if (!tr) continue;
      tr.hidden = !visibleIds.has(row.index);
      const checkbox = tr.querySelector('input[type="checkbox"]');
      checkbox.disabled = !canDispatch(row);
      checkbox.title = checkbox.disabled ? '仅待下发线索可选' : '';
      checkbox.checked = selection(key).includes(row.index);
      tr.classList.toggle('batch-selected', checkbox.checked);
      const action = tr.querySelector('td:last-child button:first-child');
      if (action) { action.disabled = !canDispatch(row); action.title = action.disabled ? '当前状态不可再次下发' : ''; }
    }
    body.querySelector('.batch-empty')?.remove();
    if (!visible.length) {
      const tr = document.createElement('tr'); tr.className = 'batch-empty';
      const td = document.createElement('td'); td.colSpan = table.tHead.rows[0].cells.length;
      td.textContent = '没有符合条件的线索，请调整筛选条件'; tr.appendChild(td); body.appendChild(tr);
    }
    const pagination = container.querySelector('.pagination, .batch-pagination');
    if (pagination) pagination.outerHTML = pager(key, all.length);
    const master = document.getElementById(key === '2' ? 'opsBatchAiMasterCheckbox' : 'opsBatchMasterCheckbox');
    const eligibleVisible = visible.filter(canDispatch);
    if (master) {
      master.disabled = !eligibleVisible.length;
      master.checked = eligibleVisible.length > 0 && eligibleVisible.every(row => selection(key).includes(row.index));
      master.indeterminate = eligibleVisible.some(row => selection(key).includes(row.index)) && !master.checked;
      master.title = '仅选择当前页待下发线索';
    }
    const counter = document.getElementById(key === '2' ? 'opsBatchAiSelectedCounter' : 'opsBatchSelectedCounter');
    if (counter) counter.innerHTML = `已选 <strong>${selection(key).length}</strong> 条 · 当前筛选 ${all.length} 条`;
    const primary = Array.from(container.querySelectorAll('.mw-report-table-toolbar button')).find(button => button.textContent.includes('批量下发至专营店'));
    if (primary) { primary.disabled = selection(key).length === 0; primary.title = primary.disabled ? '请先勾选待下发线索' : ''; primary.classList.add('batch-primary'); }
    applyColumns(key, table);
  }
  function applyColumns(key, table) {
    const hidden = state[key].hidden;
    for (const tr of table.rows) Array.from(tr.cells).forEach((cell, index) => { cell.style.display = hidden.has(index) ? 'none' : ''; });
  }
  function standardizeFilter(container, key) {
    const card = container.querySelector('.mw-report-filter-card');
    const basic = card?.firstElementChild;
    const advanced = card?.querySelector(key === '2' ? '#opsBatchAiAdvancedFilterBox' : '#opsBatchAdvancedFilterBox');
    const actionBar = advanced?.nextElementSibling;
    const toolbar = container.querySelector('.mw-report-table-toolbar > div:last-child');
    if (!card || !basic || !advanced || !actionBar || !toolbar) return;

    const title = document.createElement('div');
    title.className = 'batch-filter-title';
    title.textContent = '筛选查询';
    card.insertBefore(title, basic);
    basic.className = 'batch-filter-grid';
    basic.removeAttribute('style');
    Array.from(advanced.children).forEach(field => basic.appendChild(field));
    advanced.remove();

    const layout = document.createElement('div');
    layout.className = 'batch-filter-layout';
    card.insertBefore(layout, basic);
    layout.appendChild(basic);
    const queryActions = document.createElement('div');
    queryActions.className = 'batch-filter-actions';
    Array.from(actionBar.querySelectorAll('button')).forEach(button => {
      const label = button.textContent.trim();
      if (label === '查询') queryActions.insertBefore(button, queryActions.firstChild);
      else if (label === '重置') queryActions.appendChild(button);
      else if (label === '批量导出数据' || label === '刷新') toolbar.insertBefore(button, toolbar.firstChild);
    });
    layout.appendChild(queryActions);
    const toggle = actionBar.querySelector(key === '2' ? '#opsBatchAiToggleAdvancedBtn' : '#opsBatchToggleAdvancedBtn');
    if (toggle) {
      toggle.className = 'batch-filter-toggle';
      toggle.removeAttribute('style');
      toggle.innerHTML = `更多筛选 <span id="${key === '2' ? 'opsBatchAiAdvancedFilterText' : 'opsBatchAdvancedFilterText'}"></span>`;
      toggle.setAttribute('aria-controls', 'batchFilterGrid');
      const bottom = document.createElement('div');
      bottom.className = 'batch-filter-bottom';
      bottom.appendChild(toggle);
      card.appendChild(bottom);
    }
    basic.id = 'batchFilterGrid';
    actionBar.remove();
  }
  function syncFilterExpansion(container, key) {
    const expanded = state[key].expanded;
    container.querySelector('.batch-filter-grid')?.classList.toggle('is-expanded', expanded);
    const toggle = container.querySelector('.batch-filter-toggle');
    const label = toggle?.querySelector('span');
    if (label) label.textContent = expanded ? '收起' : '展开';
    if (toggle) toggle.setAttribute('aria-expanded', String(expanded));
  }
  function enhance() {
    const key = tab(), s = state[key], container = document.getElementById('opsBatchDispatchPage');
    if (!container) return;
    const navigation = container.querySelector('.mw-sub-tabs');
    if (navigation) {
      navigation.classList.add('strategy-config-tabs', 'show');
      navigation.removeAttribute('style');
      navigation.setAttribute('aria-label', '批量下发类型');
      navigation.querySelectorAll('.btn-sub-tab').forEach(button => {
        button.classList.add('strategy-config-tab');
        button.removeAttribute('style');
        if (button.classList.contains('active')) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      });
    }
    container.querySelector('.mw-report-summary')?.remove();
    standardizeFilter(container, key);
    syncFilterExpansion(container, key);
    if (s.draft) restore(key);
    else s.draft = collect(key);
    if (!s.applied) s.applied = { ...s.draft };
    if (!container.dataset.batchBound) {
      container.addEventListener('input', event => {
        const current = tab(), id = event.target.id;
        if (id.startsWith(prefix(current)) && 'value' in event.target) state[current].draft[id.slice(prefix(current).length)] = event.target.value;
      });
      container.addEventListener('change', event => {
        const current = tab(), id = event.target.id;
        if (id.startsWith(prefix(current)) && 'value' in event.target) state[current].draft[id.slice(prefix(current).length)] = event.target.value;
      });
      container.dataset.batchBound = '1';
    }
    const filterButtons = Array.from(container.querySelectorAll('.mw-report-filter-card button, .mw-report-table-toolbar button'));
    for (const button of filterButtons) {
      if (button.textContent.trim() === '批量导出数据') button.onclick = () => opsBatchCreateExport();
      if (button.textContent.trim() === '刷新') button.onclick = () => { s.draft = collect(key); window.renderOpsBatchDispatchPage(); notice('列表已刷新', true); };
      if (['查询', '重置', '批量导出数据', '刷新'].includes(button.textContent.trim())) button.classList.add(button.textContent.trim() === '查询' ? 'batch-primary' : 'batch-secondary');
    }
    const toolbar = container.querySelector('.mw-report-table-toolbar');
    const selects = toolbar?.querySelectorAll('select') || [];
    if (selects[0]) { selects[0].value = s.sort || selects[0].options[0].value; selects[0].onchange = () => { s.sort = selects[0].value; updatePage(); }; }
    if (selects[1]) { selects[1].value = s.direction === 'asc' ? '升序' : '降序'; selects[1].onchange = () => { s.direction = selects[1].value === '升序' ? 'asc' : 'desc'; updatePage(); }; }
    const fieldButton = Array.from(toolbar?.querySelectorAll('button') || []).find(button => button.textContent.includes('字段显示'));
    if (fieldButton) fieldButton.onclick = () => opsBatchToggleFields(fieldButton);
    updatePage();
  }

  window.renderOpsBatchDispatchPage = function () { baseRender(); enhance(); };
  window.toggleOpsBatchAdvancedFilter = function () { const key = '1'; state[key].expanded = !state[key].expanded; const container = document.getElementById('opsBatchDispatchPage'); if (container) syncFilterExpansion(container, key); };
  window.toggleOpsBatchAiAdvancedFilter = function () { const key = '2'; state[key].expanded = !state[key].expanded; const container = document.getElementById('opsBatchDispatchPage'); if (container) syncFilterExpansion(container, key); };
  window.applyOpsBatchFilter = function () {
    const key = tab(), s = state[key]; s.draft = collect(key);
    if (s.draft.ReceiveStart && s.draft.ReceiveEnd && s.draft.ReceiveStart > s.draft.ReceiveEnd) { notice('接收时间开始日期不能晚于结束日期', false); return; }
    s.applied = { ...s.draft }; s.page = 1; setSelection(key, []); updatePage(); notice('筛选结果已更新', true);
  };
  window.applyOpsBatchAiFilter = window.applyOpsBatchFilter;
  window.resetOpsBatchFilter = function () { const key = tab(), s = state[key]; s.draft = null; s.applied = null; s.page = 1; setSelection(key, []); window.renderOpsBatchDispatchPage(); notice('筛选条件已重置', true); };
  window.resetOpsBatchAiFilter = window.resetOpsBatchFilter;
  window.opsBatchSetPageSize = function (size) { const s = state[tab()]; s.pageSize = Number(size) || 5; s.page = 1; updatePage(); };
  window.opsBatchSetPage = function (page) { state[tab()].page = Math.max(1, Number(page) || 1); updatePage(); };
  window.toggleAllOpsBatch = function (master) { const key = tab(), ids = currentRows(key).filter(canDispatch).map(row => row.index); const selected = new Set(selection(key)); ids.forEach(id => master.checked ? selected.add(id) : selected.delete(id)); setSelection(key, [...selected]); updatePage(); };
  window.toggleAllOpsBatchAi = window.toggleAllOpsBatch;
  window.toggleOpsBatchRow = function (id) { const key = tab(), row = rows(key).find(item => item.index === id); if (!canDispatch(row)) return; const selected = new Set(selection(key)); selected.has(id) ? selected.delete(id) : selected.add(id); setSelection(key, [...selected]); updatePage(); };
  window.toggleOpsBatchAiRow = window.toggleOpsBatchRow;
  window.opsBatchCreateExport = function () {
    const key = tab(), all = filteredRows(key);
    if (!all.length) { notice('当前没有可导出的线索', false); return; }
    if (typeof window.addPrototypeDownloadTask !== 'function') { notice('下载列表尚未就绪，请刷新页面', false); return; }
    const type = key === '2' ? 'AI外呼批量下发线索清单' : '人工客服批量下发线索清单';
    window.addPrototypeDownloadTask(type, '当前筛选', `${all.length}条`);
    notice(`已创建 ${all.length} 条线索的示例导出任务，请到下载列表查看`, true);
  };
  window.opsBatchToggleFields = function (anchor) {
    const existing = document.querySelector('.batch-fields-popover');
    if (existing) { existing.remove(); return; }
    const table = document.querySelector('#opsBatchDispatchPage .mw-report-table-scroll table');
    if (!table) return;
    const panel = document.createElement('div'); panel.className = 'batch-fields-popover';
    panel.innerHTML = `<strong>字段显示</strong><p>勾选要显示的表格列</p>${Array.from(table.tHead.rows[0].cells).map((cell, i) => i < 4 || i === table.tHead.rows[0].cells.length - 1 ? '' : `<label><input type="checkbox" value="${i}" ${state[tab()].hidden.has(i) ? '' : 'checked'}> ${esc(cell.textContent.trim())}</label>`).join('')}`;
    panel.addEventListener('change', event => { const i = Number(event.target.value); event.target.checked ? state[tab()].hidden.delete(i) : state[tab()].hidden.add(i); applyColumns(tab(), table); });
    anchor.parentElement.appendChild(panel);
    panel.style.right = '0';
  };

  function prepareDetail(id, key) {
    const modal = document.getElementById(key === '2' ? 'opsBatchAiDetailModal' : 'opsBatchDetailModal');
    if (!modal) return;
    modal.classList.add('batch-detail-modal', 'show');
    modal.querySelector(':scope > div')?.classList.add('batch-detail-panel');
    const row = rows(key).find(item => item.index === id);
    const action = modal.querySelector('.batch-detail-panel > div:last-child button:last-child');
    if (action) {
      action.disabled = !canDispatch(row);
      action.title = action.disabled ? '仅待下发线索可手动下发' : '';
    }
    modal.onclick = event => { if (event.target === modal) modal.classList.remove('show'); };
  }
  window.openOpsBatchManualDetailModal = function (id) {
    if (typeof baseOpenManualDetail !== 'function') return;
    baseOpenManualDetail(id);
    prepareDetail(id, '1');
  };
  window.openOpsBatchAiDetailModal = function (id) {
    if (typeof baseOpenAiDetail !== 'function') return;
    baseOpenAiDetail(id);
    prepareDetail(id, '2');
  };
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    ['opsBatchDetailModal', 'opsBatchAiDetailModal', 'opsBatchDispatchModal', 'opsBatchLogModal'].forEach(id => document.getElementById(id)?.classList.remove('show'));
  });

  window.openOpsBatchDispatchModal = function (taskCode) {
    const key = tab();
    const selected = taskCode ? rows(key).filter(row => row.taskCode === taskCode) : rows(key).filter(row => selection(key).includes(row.index));
    const eligible = selected.filter(canDispatch);
    if (!eligible.length) { notice(taskCode ? '该线索当前不可再次下发' : '请先选择待下发线索', false); return; }
    dispatchContext = { key, ids: eligible.map(row => row.index) };
    let modal = document.getElementById('opsBatchDispatchModal');
    if (!modal) { modal = document.createElement('div'); modal.id = 'opsBatchDispatchModal'; modal.className = 'modal-backdrop'; document.body.appendChild(modal); }
    const stores = [...new Set(eligible.map(row => row.store))];
    modal.innerHTML = `<div class="batch-dialog" role="dialog" aria-modal="true" aria-label="确认批量下发">
      <div class="batch-dialog-header"><strong>确认下发至专营店</strong><button type="button" aria-label="关闭" onclick="document.getElementById('opsBatchDispatchModal').classList.remove('show')">×</button></div>
      <div class="batch-dialog-body"><div class="batch-dispatch-count">本次将下发 <strong>${eligible.length}</strong> 条待下发线索${selected.length > eligible.length ? `，已排除 ${selected.length - eligible.length} 条不可下发线索` : ''}。</div>
        <label>目标专营店<select id="opsBatchDispatchStore" class="form-input"><option value="">按线索原意向专营店分组</option>${stores.map(store => `<option value="${esc(store)}">${esc(store)}</option>`).join('')}</select></label>
        <label>单次最大下发笔数<input id="opsBatchDispatchLimit" class="form-input" type="number" min="1" max="500" value="50"></label>
        <p>提交后生成下发批次；已下发线索不能再次下发。原型仅模拟结果，不会向专营店发送数据。</p>
        <label>备注说明<textarea id="opsBatchDispatchNote" class="form-input" rows="3" placeholder="选填，供操作日志追溯"></textarea></label>
      </div><div class="batch-dialog-footer"><button type="button" class="batch-secondary" onclick="document.getElementById('opsBatchDispatchModal').classList.remove('show')">取消</button><button type="button" class="batch-primary" onclick="opsBatchConfirmDispatch()">确认提交下发</button></div></div>`;
    modal.classList.add('show');
  };
  window.opsBatchConfirmDispatch = function () {
    if (!dispatchContext) return;
    const { key, ids } = dispatchContext;
    const items = rows(key).filter(row => ids.includes(row.index) && canDispatch(row));
    if (!items.length) { notice('所选线索状态已变化，请重新选择', false); return; }
    const limit = Number(document.getElementById('opsBatchDispatchLimit')?.value);
    if (!Number.isInteger(limit) || limit < 1 || limit > 500) { notice('单次最大下发笔数须为 1–500 的整数', false); return; }
    if (items.length > limit) { notice(`本次选择 ${items.length} 条，超过单次上限 ${limit} 条`, false); return; }
    const targetStore = document.getElementById('opsBatchDispatchStore')?.value || '';
    const now = new Date();
    const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
    const batchId = `BD${Date.now()}`;
    const note = document.getElementById('opsBatchDispatchNote')?.value.trim() || '';
    items.forEach(row => { row.latestBatchStatus = '下发中'; row.batchSystemStatus = '任务已提交'; row.latestBatchTime = time; row.dispatchStore = targetStore || row.store; });
    logs.unshift({ batchId, time, key, count: items.length, store: targetStore || [...new Set(items.map(row => row.store))].join('、'), status: '处理中', note });
    setSelection(key, selection(key).filter(id => !ids.includes(id)));
    document.getElementById('opsBatchDispatchModal')?.classList.remove('show');
    dispatchContext = null;
    window.renderOpsBatchDispatchPage();
    notice(`原型演示：下发批次 ${batchId} 已提交，可在下发日志查看`, true);
    setTimeout(() => {
      items.forEach(row => { if (row.latestBatchStatus === '下发中') { row.latestBatchStatus = '已下发'; row.batchSystemStatus = '已同步完成'; row.latestLeadStatus = '已下发'; } });
      const log = logs.find(entry => entry.batchId === batchId); if (log) log.status = '成功';
      if (document.getElementById('opsBatchDispatchPage')?.classList.contains('show') && tab() === key) window.renderOpsBatchDispatchPage();
      if (document.getElementById('opsBatchLogModal')?.classList.contains('show')) window.openOpsBatchLogModal();
    }, 900);
  };
  window.openOpsBatchLogModal = function () {
    let modal = document.getElementById('opsBatchLogModal');
    if (!modal) { modal = document.createElement('div'); modal.id = 'opsBatchLogModal'; modal.className = 'modal-backdrop'; document.body.appendChild(modal); }
    const history = [
      { batchId: 'BD202609161420', time: '2026-09-16 14:20:00', key: '1', count: 12, store: '广州天河专营店', status: '成功', note: '历史演示记录' },
      { batchId: 'BD202609161105', time: '2026-09-16 11:05:00', key: '2', count: 45, store: '上海浦东专营店', status: '成功', note: '历史演示记录' }
    ];
    modal.innerHTML = `<div class="batch-dialog batch-log-dialog" role="dialog" aria-modal="true" aria-label="批量下发操作日志">
      <div class="batch-dialog-header"><strong>批量下发操作日志</strong><button type="button" aria-label="关闭" onclick="document.getElementById('opsBatchLogModal').classList.remove('show')">×</button></div>
      <div class="batch-dialog-body"><div class="batch-log-wrap"><table><thead><tr><th>批次号</th><th>操作时间</th><th>来源</th><th>笔数</th><th>目标专营店</th><th>状态</th></tr></thead><tbody>${[...logs, ...history].map(log => `<tr title="${esc(log.note)}"><td>${esc(log.batchId)}</td><td>${esc(log.time)}</td><td>${log.key === '2' ? 'AI外呼' : '人工客服'}</td><td>${log.count}</td><td>${esc(log.store)}</td><td>${esc(log.status)}</td></tr>`).join('')}</tbody></table></div></div>
      <div class="batch-dialog-footer"><button type="button" class="batch-secondary" onclick="document.getElementById('opsBatchLogModal').classList.remove('show')">关闭</button></div></div>`;
    modal.classList.add('show');
  };

  if (document.getElementById('opsBatchDispatchPage')?.classList.contains('show')) window.renderOpsBatchDispatchPage();
})();
