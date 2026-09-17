// ===== 试驾排程（一级菜单） =====
(function () {
  const records = [
    { id: 'TD-001', lead: 'PYXS202605280001', task: 'PYRW202605280128', callback: 'HF202605280032', booking: 'YYTJ202609080023', schedule: '', customer: '陆先生 / 138****6721', series: 'N6', dealer: '广州东风日产天河店', date: '2026-09-08', time: '14:00-15:00', dcc: '工单已生成', nev: '推送超时', queue: '异常重试', updated: '10:21:35', transcript: '陆先生确认到广州东风日产天河店试驾 N6，预约 14:00-15:00。' },
    { id: 'TD-002', lead: 'PYXS202605270093', task: 'PYRW202605270128', callback: 'HF202605270032', booking: 'YYTJ202609080024', schedule: '', customer: '陈女士 / 186****4309', series: '轩逸', dealer: '深圳东风日产南山店', date: '2026-09-08', time: '10:00-11:00', dcc: '工单已生成', nev: '待重试', queue: '待处理', updated: '10:19:02', transcript: '陈女士确认门店、日期及时段；DCC 工单接口调用成功，等待 NEV 中台回执。' },
    { id: 'TD-003', lead: 'PYXS202605260045', task: 'PYRW202605260128', callback: 'HF202605260032', booking: 'YYTJ202609080025', schedule: 'NEVSP202609080301', customer: '王先生 / 159****2840', series: '逍客', dealer: '杭州东风日产滨江店', date: '2026-09-08', time: '15:00-16:00', dcc: '工单已生成', nev: '已推送', queue: '今日已处理', updated: '10:16:48', transcript: '王先生已确认逍客试驾信息；DCC 工单生成成功，NEV 中台已成功创建试驾排程。' },
    { id: 'TD-004', lead: 'PYXS202605250118', task: 'PYRW202605250128', callback: 'HF202605250032', booking: 'YYTJ202609070126', schedule: 'NEVSP202609070784', customer: '李女士 / 137****9088', series: '奇骏', dealer: '上海东风日产浦东店', date: '2026-09-07', time: '11:00-12:00', dcc: '工单已生成', nev: '已推送', queue: '今日已处理', updated: '09:15:23', transcript: '李女士已确认奇骏试驾信息；NEV 中台已成功创建试驾排程。' },
    { id: 'TD-005', lead: 'PYXS202605240076', task: 'PYRW202605240128', callback: 'HF202605240032', booking: 'YYTJ202609080027', schedule: '', customer: '赵先生 / 135****2190', series: '天籁', dealer: '成都东风日产高新店', date: '2026-09-08', time: '16:00-17:00', dcc: '工单已生成', nev: '推送失败', queue: '异常重试', updated: '10:12:11', transcript: 'NEV 中台未返回成功回执，请核对数据后重试推送。' }
  ];

  let activeTab = '待处理';
  let keyword = '';
  let status = '';
  let currentPage = 1;
  let pageSize = 5;

  const queueMap = { '待处理': ['待处理'], '推送异常': ['异常重试'], '今日已处理': ['今日已处理'] };
  const escapeHtml = (value, emptyValue = '—') => String(value === null || value === undefined || value === '' ? emptyValue : value).replace(/[&<>"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[char]));
  const statusTag = (text) => {
    const cls = text === '已推送' || text === '工单已生成' ? 'success' : text === '待重试' || text === '推送超时' ? 'warning' : 'danger';
    return `<span class="td-status ${cls}">${escapeHtml(text)}</span>`;
  };
  const getRows = () => records.filter((row) => {
    const inQueue = queueMap[activeTab].includes(row.queue);
    const allText = [row.booking, row.task, row.callback, row.lead, row.customer, row.dealer].join(' ');
    const keywordMatch = !keyword || allText.toLowerCase().includes(keyword.toLowerCase());
    const statusMatch = !status || row.nev === status;
    return inQueue && keywordMatch && statusMatch;
  });

  window.renderAiTestDriveSchedulePage = function () {
    const page = document.getElementById('aiTestDriveSchedulePage');
    if (!page) return;
    const counters = {
      '待处理': records.filter((row) => row.queue === '待处理').length,
      '推送异常': records.filter((row) => row.queue === '异常重试').length,
      '今日已处理': records.filter((row) => row.queue === '今日已处理').length
    };
    const rows = getRows();
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
    currentPage = Math.min(currentPage, totalPages);
    const pageRows = rows.slice((currentPage - 1) * pageSize, currentPage * pageSize);
    page.innerHTML = `
      <div class="page-hero ai-schedule-hero">
        <div>
          <div class="page-title">试驾排程线索</div>
          <div class="page-desc">按预约来源查看试驾预约记录；AI 外呼来源支持追溯 DCC、NEV 回执与异常推送。</div>
        </div>
      </div>
      <div class="ai-schedule-tabs">
        ${['待处理', '推送异常', '今日已处理'].map((tab) => `<button type="button" class="ai-schedule-tab ${activeTab === tab ? 'active' : ''}" onclick="switchAiTestDriveTab('${tab}')">${tab}<span>${counters[tab]}</span></button>`).join('')}
      </div>
      <div class="filter-row">
        <div class="lead-search-panel ai-schedule-filter">
          <div class="lead-search-title">筛选查询</div>
          <div class="lead-search-grid compact ai-schedule-filter-grid">
            <div class="search-field ai-schedule-keyword"><label>编码/客户/专营店</label><input class="lead-input" value="${escapeHtml(keyword, '')}" oninput="setAiTestDriveKeyword(this.value)" placeholder="请输入编码、客户姓名或专营店" /></div>
            <div class="search-field"><label>NEV推送状态</label><select class="lead-select" onchange="setAiTestDriveStatus(this.value)"><option value="">全部</option><option value="待重试" ${status === '待重试' ? 'selected' : ''}>待重试</option><option value="推送超时" ${status === '推送超时' ? 'selected' : ''}>推送超时</option><option value="推送失败" ${status === '推送失败' ? 'selected' : ''}>推送失败</option><option value="已推送" ${status === '已推送' ? 'selected' : ''}>已推送</option></select></div>
            <div class="lead-search-actions"><button class="btn-add" type="button" onclick="renderAiTestDriveSchedulePage()">查询</button><button class="btn-secondary" type="button" onclick="resetAiTestDriveFilters()">重置</button></div>
          </div>
        </div>
      </div>
      <div class="card ai-schedule-card">
        <div class="lead-toolbar"><div class="lead-toolbar-left"><div class="section-title">AI试驾预约线索列表</div><span class="ai-schedule-count">共 ${rows.length} 条</span></div><div class="lead-toolbar-right"><span class="ai-schedule-tip">仅“推送异常”支持坐席重试</span></div></div>
        <div class="lead-table-wrap ai-schedule-table-wrap"><table class="lead-table ai-schedule-table"><thead><tr><th>预约试驾编码</th><th>培育任务编码</th><th>回访工单编码</th><th>培育线索编码</th><th>客户信息</th><th>试驾信息</th><th>DCC处理结果</th><th>试驾排程编码</th><th>NEV推送状态</th><th>操作</th></tr></thead><tbody>
          ${pageRows.length ? pageRows.map((row) => `<tr><td class="td-code">${escapeHtml(row.booking)}</td><td class="td-code">${escapeHtml(row.task)}</td><td class="td-code">${escapeHtml(row.callback)}</td><td class="td-code">${escapeHtml(row.lead)}</td><td>${escapeHtml(row.customer)}</td><td><div>${escapeHtml(row.series)} · ${escapeHtml(row.date)}</div><span class="td-muted">${escapeHtml(row.time)} / ${escapeHtml(row.dealer)}</span></td><td>${statusTag(row.dcc)}</td><td class="td-code">${escapeHtml(row.schedule)}</td><td>${statusTag(row.nev)}</td><td class="td-actions"><button type="button" class="table-link" onclick="showAiTestDriveScheduleDetail('${row.id}')">详情</button>${row.queue === '异常重试' ? `<button type="button" class="table-link primary" onclick="retryAiTestDrivePush('${row.id}')">重试推送</button>` : ''}</td></tr>`).join('') : '<tr><td colspan="10" class="table-empty">暂无符合条件的 AI试驾预约线索</td></tr>'}
        </tbody></table></div>
        <div class="pagination"><span>共 ${rows.length} 条记录，当前第 ${currentPage} / ${totalPages} 页</span><div class="pagination-btns"><select class="hit-page-size" onchange="changeAiTestDrivePageSize(this.value)"><option value="5" ${pageSize === 5 ? 'selected' : ''}>每页 5 条</option><option value="10" ${pageSize === 10 ? 'selected' : ''}>每页 10 条</option><option value="20" ${pageSize === 20 ? 'selected' : ''}>每页 20 条</option><option value="50" ${pageSize === 50 ? 'selected' : ''}>每页 50 条</option></select><button class="page-btn" type="button" onclick="changeAiTestDrivePage(-1)" ${currentPage === 1 ? 'disabled' : ''}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button><select class="hit-page-size" onchange="selectAiTestDrivePage(this.value)">${Array.from({ length: totalPages }, (_, index) => `<option value="${index + 1}" ${index + 1 === currentPage ? 'selected' : ''}>第 ${index + 1} 页</option>`).join('')}</select><button class="page-btn" type="button" onclick="changeAiTestDrivePage(1)" ${currentPage === totalPages ? 'disabled' : ''}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button></div></div>
      </div>`;
  };

  window.switchAiTestDriveTab = function (tab) { activeTab = tab; status = ''; currentPage = 1; window.renderAiTestDriveSchedulePage(); };
  window.setAiTestDriveKeyword = function (value) { keyword = value; currentPage = 1; window.renderAiTestDriveSchedulePage(); };
  window.setAiTestDriveStatus = function (value) { status = value; currentPage = 1; window.renderAiTestDriveSchedulePage(); };
  window.resetAiTestDriveFilters = function () { keyword = ''; status = ''; currentPage = 1; window.renderAiTestDriveSchedulePage(); };
  window.changeAiTestDrivePageSize = function (value) { pageSize = Number(value); currentPage = 1; window.renderAiTestDriveSchedulePage(); };
  window.changeAiTestDrivePage = function (direction) { const totalPages = Math.max(1, Math.ceil(getRows().length / pageSize)); currentPage = Math.max(1, Math.min(totalPages, currentPage + direction)); window.renderAiTestDriveSchedulePage(); };
  window.selectAiTestDrivePage = function (value) { currentPage = Number(value); window.renderAiTestDriveSchedulePage(); };
  window.retryAiTestDrivePush = function (id) {
    const row = records.find((item) => item.id === id);
    if (!row) return;
    row.nev = '已推送'; row.dcc = '工单已生成'; row.booking = row.booking || `YYTJ${row.callback.slice(-11)}`; row.queue = '今日已处理'; row.schedule = row.schedule || `NEVSP${row.booking.slice(-11)}`; row.updated = '10:32:18';
    showToast('NEV 线索中台重试推送成功，已收到试驾排程编码。', true);
    activeTab = '今日已处理'; window.renderAiTestDriveSchedulePage();
  };
  window.findAiTestDriveScheduleByTrace = function ({ leadCode, taskCode, callbackWorkorderCode }) {
    return records.find((row) => row.lead === leadCode && row.task === taskCode && row.callback === callbackWorkorderCode) || null;
  };
  window.openAiTestDriveScheduleFromWorkorder = function (id) {
    const row = records.find((item) => item.id === id);
    if (!row) return;
    document.querySelector('.leads-nav')?.classList.remove('show');
    document.querySelector('.reports-nav')?.classList.remove('show');
    document.querySelector('.ops-nav')?.classList.remove('show');
    setSidebarActiveByName('试驾排程');
    window.showAiTestDriveScheduleDetail(id);
  };
  window.showAiTestDriveScheduleDetail = function (id) {
    const row = records.find((item) => item.id === id); if (!row) return;
    hideLeadPages();
    setPageName('NEV培育 / 试驾排程 / AI外呼预约线索 / 预约详情');
    const page = document.getElementById('aiTestDriveScheduleDetailPage');
    page.classList.add('show');
    page.innerHTML = `<div class="detail-page-header"><div><div class="detail-page-title">AI外呼预约线索详情</div><div class="detail-page-subtitle">NEV培育 / 试驾排程 / AI外呼预约线索 / 预约详情</div></div><button class="btn-secondary" type="button" onclick="returnAiTestDriveScheduleList()">返回列表</button></div>
      <div class="ai-schedule-detail-grid">
        <section class="card ai-schedule-detail-card"><div class="section-title">编码追溯</div><div class="ai-trace-list"><div><span>培育线索编码</span><strong>${escapeHtml(row.lead)}</strong></div><div><span>培育任务编码</span><strong>${escapeHtml(row.task)}</strong></div><div><span>回访工单编码</span><strong>${escapeHtml(row.callback)}</strong></div><div><span>预约试驾编码</span><strong>${escapeHtml(row.booking)}</strong></div><div><span>试驾排程编码</span><strong>${escapeHtml(row.schedule)}</strong></div></div></section>
        <section class="card ai-schedule-detail-card"><div class="section-title">AI确认的试驾信息</div><div class="ai-detail-kv"><div><span>客户</span><b>${escapeHtml(row.customer)}</b></div><div><span>意向车系</span><b>${escapeHtml(row.series)}</b></div><div><span>试驾专营店</span><b>${escapeHtml(row.dealer)}</b></div><div><span>日期 / 时段</span><b>${escapeHtml(row.date)} ${escapeHtml(row.time)}</b></div></div><div class="ai-transcript"><span>AI外呼摘要</span><p>${escapeHtml(row.transcript)}</p></div></section>
        <section class="card ai-schedule-detail-card"><div class="section-title">DCC 与 NEV 处理状态</div><div class="ai-detail-kv"><div><span>DCC处理结果</span>${statusTag(row.dcc)}</div><div><span>NEV推送状态</span>${statusTag(row.nev)}</div><div><span>最近处理时间</span><b>${escapeHtml(row.updated)}</b></div><div><span>后续处理方</span><b>NEV线索中台</b></div></div><div class="ai-state-note">工单已生成仅代表 DCC 工单生成接口调用成功，不代表目标时段资源已锁定，也不表示门店已确认具体试驾安排。</div>${row.queue === '异常重试' ? `<button class="btn-add ai-detail-retry" type="button" onclick="retryAiTestDrivePush('${row.id}')">重试推送 NEV</button>` : ''}</section>
      </div>`;
  };
  window.returnAiTestDriveScheduleList = function () { showTestDriveSchedulingPage(); };
})();
