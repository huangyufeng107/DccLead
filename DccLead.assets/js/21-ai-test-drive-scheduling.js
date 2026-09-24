// ===== 试驾排程（一级菜单） =====
(function () {
  const records = [
    { id: 'TD-001', channel: 'AI外呼排程', resultTag: '下发线索', lead: 'PYXS202605280001', task: 'PYRW202605280128', callback: 'HF202605280032', booking: '', schedule: '', customer: '陆先生 / 138****6721', customerName: '陆先生', phone: '138****6721', series: 'N6', dealer: '广州东风日产天河店', date: '2026-09-08', time: '14:00-15:00', dcc: '工单已生成', nev: '推送超时', queue: '异常重试', updated: '10:21:35', transcript: 'AI智能外呼联系陆先生，确认到广州东风日产天河店试驾 N6，预约 14:00-15:00。' },
    { id: 'TD-002', channel: 'AI外呼排程', resultTag: '下发线索', lead: 'PYXS202605270093', task: 'PYRW202605270128', callback: 'HF202605270032', booking: '', schedule: '', customer: '陈女士 / 186****4309', customerName: '陈女士', phone: '186****4309', series: '轩逸', dealer: '深圳东风日产南山店', date: '2026-09-08', time: '10:00-11:00', dcc: '工单已生成', nev: '待重试', queue: '待处理', updated: '10:19:02', transcript: 'AI智能外呼与陈女士确认门店、日期及时段；外呼综合判定下发线索，等待 NEV 中台合并回执。' },
    { id: 'TD-003', channel: 'AI外呼排程', resultTag: '下发线索', lead: 'PYXS202605260045', task: 'PYRW202605260128', callback: 'HF202605260032', booking: 'YYTJ202609080025', schedule: 'NEVSP202609080301', customer: '王先生 / 159****2840', customerName: '王先生', phone: '159****2840', series: '逍客', dealer: '杭州东风日产滨江店', date: '2026-09-08', time: '15:00-16:00', dcc: '工单已生成', nev: '已推送', queue: '今日已处理', updated: '10:16:48', transcript: 'AI智能外呼已确认王先生逍客试驾信息；外呼综合判定下发线索，NEV 中台已成功创建试驾排程。' },
    { id: 'TD-004', channel: '人工坐席建单', resultTag: '试驾排程下发', lead: 'PYXS202605250118', task: 'PYRW202605250128', callback: 'HF202605250032', booking: 'YYTJ202609070126', schedule: 'NEVSP2026070784', customer: '李女士 / 137****9088', customerName: '李女士', phone: '137****9088', series: '奇骏', dealer: '上海东风日产浦东店', date: '2026-09-07', time: '11:00-12:00', dcc: '工单已生成', nev: '已推送', queue: '今日已处理', updated: '09:15:23', agent: 'seat_sh_03 (张婷)', transcript: '人工坐席张婷通过电话沟通确认客户周三试驾奇骏，已人工提交排程申请并成功推送到中台。' },
    { id: 'TD-005', channel: '人工坐席建单', resultTag: '试驾排程下发', lead: 'PYXS202605240076', task: 'PYRW202605240128', callback: 'HF202605240032', booking: '', schedule: '', customer: '赵先生 / 135****2190', customerName: '赵先生', phone: '135****2190', series: '天籁', dealer: '成都东风日产高新店', date: '2026-09-08', time: '16:00-17:00', dcc: '工单已生成', nev: '推送失败', queue: '异常重试', updated: '10:12:11', agent: 'seat_sz_05 (黄晓)', transcript: '人工坐席黄晓回访录入赵先生天籁试驾排程，门店车源占用导致接口返回 ERR_VEHICLE_CONFLICT，需排查后重试。' },
    { id: 'TD-006', channel: '人工坐席建单', resultTag: '试驾排程下发', lead: 'PYXS202605280068', task: 'PYRW202605280145', callback: 'HF202605280068', booking: '', schedule: '', customer: '周女士 / 137****7766', customerName: '周女士', phone: '137****7766', series: '探陆', dealer: '北京东风日产朝阳店', date: '2026-09-22', time: '14:00-15:00', dcc: '工单已生成', nev: '待重试', queue: '待处理', updated: '10:25:10', agent: 'seat_bj_02 (周浩)', transcript: '人工坐席周浩与周女士电话确认周末到朝阳店试驾探陆四驱版，DCC已建单，等待中台异步队列下发。' },
    { id: 'TD-007', channel: 'AI外呼排程', resultTag: '不下发', lead: 'PYXS202605280099', task: 'PYRW202605280166', callback: 'HF202605280099', booking: '—', schedule: '—', customer: '钱先生 / 136****5521', customerName: '钱先生', phone: '136****5521', series: '轩逸', dealer: '深圳东风日产南山店', date: '2026-09-23', time: '10:00-11:00', dcc: '未建单 (不下发归档)', nev: '已同步 (不下发店端)', queue: '今日已处理', updated: '10:28:44', transcript: 'AI外呼通话中客户曾初步表达试驾意向，但通话末尾明确告知近期出差取消安排；AI外呼结果标签判定为“不下发”，DCC裁决不生成试驾工单，直接结案归档并向NEV中台同步外呼结果。' },
    { id: 'TD-008', channel: 'AI外呼排程', resultTag: '下发至人工客服', lead: 'PYXS202605280105', task: 'PYRW202605280170', callback: 'HF202605280105', booking: '—', schedule: '—', customer: '孙女士 / 139****8832', customerName: '孙女士', phone: '139****8832', series: '奇骏', dealer: '广州东风日产天河店', date: '2026-09-24', time: '15:00-16:00', dcc: '转人工 (待办线索)', nev: '已同步 (转人工客服)', queue: '今日已处理', updated: '10:30:12', transcript: 'AI外呼通话中客户咨询置换补贴及多配置对比，虽已预选时段，但AI综合判定需资深顾问深聊，打上“下发至人工客服”标签；DCC裁决不生成试驾工单，附带意向记录转派总部坐席工作台生成跟进任务。' }
  ];

  let activeTab = '待处理';
  let callbackCode = '';
  let customerName = '';
  let dealer = '';
  let status = '';
  let channel = '';
  let currentPage = 1;
  let pageSize = 5;

  const queueMap = { '待处理': ['待处理'], '推送异常': ['异常重试'], '今日已处理': ['今日已处理'] };
  const escapeHtml = (value, emptyValue = '—') => String(value === null || value === undefined || value === '' ? emptyValue : value).replace(/[&<>"]/g, (char) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[char]));
  const statusTag = (text) => {
    let cls = 'info';
    if (text === '已推送' || text === '工单已生成') cls = 'success';
    else if (text === '待重试' || text === '推送超时') cls = 'warning';
    else if (text === '推送失败') cls = 'danger';
    else if (text.includes('不下发')) cls = 'muted';
    else if (text.includes('转人工')) cls = 'orange';
    return `<span class="td-status ${cls}">${escapeHtml(text)}</span>`;
  };
  const getRows = () => records.filter((row) => {
    const inQueue = queueMap[activeTab].includes(row.queue);
    const callbackMatch = !callbackCode || (row.callback && row.callback.toLowerCase().includes(callbackCode.toLowerCase()));
    const customerMatch = !customerName || (row.customer && row.customer.toLowerCase().includes(customerName.toLowerCase())) || (row.customerName && row.customerName.toLowerCase().includes(customerName.toLowerCase())) || (row.phone && row.phone.includes(customerName));
    const dealerMatch = !dealer || (row.dealer && row.dealer.toLowerCase().includes(dealer.toLowerCase()));
    const statusMatch = !status || row.nev === status;
    const channelMatch = !channel || row.channel === channel;
    return inQueue && callbackMatch && customerMatch && dealerMatch && statusMatch && channelMatch;
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
          <div class="page-title">中台推送监控</div>
          <div class="page-desc">按预约来源查看试驾预约记录，重点追溯 DCC 处理结果、NEV 中台交互回执与异常推送重试。</div>
        </div>
      </div>
      <div class="ai-schedule-tabs">
        ${['待处理', '推送异常', '今日已处理'].map((tab) => `<button type="button" class="ai-schedule-tab ${activeTab === tab ? 'active' : ''}" onclick="switchAiTestDriveTab('${tab}')">${tab}<span>${counters[tab]}</span></button>`).join('')}
      </div>
      <div class="filter-row">
        <div class="lead-search-panel ai-schedule-filter">
          <div class="lead-search-title">筛选查询</div>
          <div class="lead-search-grid compact ai-schedule-filter-grid">
            <div class="search-field"><label>回访工单编码</label><input class="lead-input" id="aiTestDriveFilterCallback" value="${escapeHtml(callbackCode, '')}" onkeydown="if(event.key==='Enter')applyAiTestDriveFilters()" placeholder="请输入回访工单编码" /></div>
            <div class="search-field"><label>客户姓名</label><input class="lead-input" id="aiTestDriveFilterCustomer" value="${escapeHtml(customerName, '')}" onkeydown="if(event.key==='Enter')applyAiTestDriveFilters()" placeholder="请输入客户姓名" /></div>
            <div class="search-field"><label>试驾专营店</label><input class="lead-input" id="aiTestDriveFilterDealer" value="${escapeHtml(dealer, '')}" onkeydown="if(event.key==='Enter')applyAiTestDriveFilters()" placeholder="请输入专营店名称" /></div>
            <div class="search-field"><label>预约来源</label><select class="lead-select" id="aiTestDriveFilterChannel" onchange="applyAiTestDriveFilters()"><option value="">全部来源</option><option value="AI外呼排程" ${channel === 'AI外呼排程' ? 'selected' : ''}>AI外呼排程</option><option value="人工坐席建单" ${channel === '人工坐席建单' ? 'selected' : ''}>人工坐席建单</option></select></div>
            <div class="search-field"><label>NEV推送状态</label><select class="lead-select" id="aiTestDriveFilterStatus" onchange="applyAiTestDriveFilters()"><option value="">全部状态</option><option value="待重试" ${status === '待重试' ? 'selected' : ''}>待重试</option><option value="推送超时" ${status === '推送超时' ? 'selected' : ''}>推送超时</option><option value="推送失败" ${status === '推送失败' ? 'selected' : ''}>推送失败</option><option value="已推送" ${status === '已推送' ? 'selected' : ''}>已推送</option></select></div>
            <div class="lead-search-actions"><button class="btn-add" type="button" onclick="applyAiTestDriveFilters()">查询</button><button class="btn-secondary" type="button" onclick="resetAiTestDriveFilters()">重置</button></div>
          </div>
        </div>
      </div>
      <div class="card ai-schedule-card">
        <div class="lead-toolbar"><div class="lead-toolbar-left"><div class="section-title">中台推送监控明细列表</div><span class="ai-schedule-count">共 ${rows.length} 条</span></div><div class="lead-toolbar-right" style="display:flex; align-items:center; gap:10px;"><button class="btn-outline-blue" type="button" onclick="openAiTestDriveJourneyDocModal()" style="display:inline-flex; align-items:center; gap:6px; height:34px; padding:0 13px; font-size:12px; font-weight:600; color:#1d4ed8; border:1px solid #93c5fd; background:#eff6ff; border-radius:6px; cursor:pointer;"><span style="font-size:14px;">📋</span> 试驾排程场景旅程说明 (研发对照)</button><span class="ai-schedule-tip">仅“推送异常”支持坐席重试</span></div></div>
        <div class="lead-table-wrap ai-schedule-table-wrap"><table class="lead-table ai-schedule-table"><thead><tr><th>预约单号</th><th>预约来源</th><th>培育任务编码</th><th>回访工单编码</th><th>培育线索编码</th><th>客户信息</th><th>试驾信息</th><th>DCC处理结果</th><th>试驾排程编码</th><th>NEV推送状态</th><th>操作</th></tr></thead><tbody>
          ${pageRows.length ? pageRows.map((row) => {
            const channelTag = (row.channel === 'AI外呼排程')
              ? `<span class="tag-chip" style="font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:2px;">🤖 AI外呼</span>`
              : `<span class="tag-chip green" style="font-size:11px; font-weight:700; display:inline-flex; align-items:center; gap:2px;">👤 人工建单</span>`;
            const custName = row.customerName || (row.customer ? row.customer.split('/')[0].trim() : '—');
            const custPhone = row.phone || (row.customer && row.customer.split('/')[1] ? row.customer.split('/')[1].trim() : '—');
            return `<tr><td class="td-code">${escapeHtml(row.booking)}</td><td>${channelTag}</td><td class="td-code">${escapeHtml(row.task)}</td><td class="td-code">${escapeHtml(row.callback)}</td><td class="td-code">${escapeHtml(row.lead)}</td><td><span style="color:#0f172a;">${escapeHtml(custName)}</span><small>${escapeHtml(custPhone)}</small></td><td><div>${escapeHtml(row.series)} · ${escapeHtml(row.date)}</div><span class="td-muted">${escapeHtml(row.time)} / ${escapeHtml(row.dealer)}</span></td><td>${statusTag(row.dcc)}</td><td class="td-code">${escapeHtml(row.schedule)}</td><td>${statusTag(row.nev)}</td><td class="td-actions"><button type="button" class="table-link table-link-success" onclick="showAiTestDriveScheduleDetail('${row.id}')">查看</button>${row.queue === '异常重试' ? `<button type="button" class="table-link primary" onclick="retryAiTestDrivePush('${row.id}')">重试推送</button>` : ''}</td></tr>`;
          }).join('') : '<tr><td colspan="11" class="table-empty">暂无符合条件的中台推送预约记录</td></tr>'}
        </tbody></table></div>
        <div class="pagination"><span>共 ${rows.length} 条记录，当前第 ${currentPage} / ${totalPages} 页</span><div class="pagination-btns"><select class="hit-page-size" onchange="changeAiTestDrivePageSize(this.value)"><option value="5" ${pageSize === 5 ? 'selected' : ''}>每页 5 条</option><option value="10" ${pageSize === 10 ? 'selected' : ''}>每页 10 条</option><option value="20" ${pageSize === 20 ? 'selected' : ''}>每页 20 条</option><option value="50" ${pageSize === 50 ? 'selected' : ''}>每页 50 条</option></select><button class="page-btn" type="button" onclick="changeAiTestDrivePage(-1)" ${currentPage === 1 ? 'disabled' : ''}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button><select class="hit-page-size" onchange="selectAiTestDrivePage(this.value)">${Array.from({ length: totalPages }, (_, index) => `<option value="${index + 1}" ${index + 1 === currentPage ? 'selected' : ''}>第 ${index + 1} 页</option>`).join('')}</select><button class="page-btn" type="button" onclick="changeAiTestDrivePage(1)" ${currentPage === totalPages ? 'disabled' : ''}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button></div></div>
      </div>`;
  };

  window.switchAiTestDriveTab = function (tab) { activeTab = tab; status = ''; currentPage = 1; window.renderAiTestDriveSchedulePage(); };
  window.applyAiTestDriveFilters = function () {
    const callbackEl = document.getElementById('aiTestDriveFilterCallback');
    const customerEl = document.getElementById('aiTestDriveFilterCustomer');
    const dealerEl = document.getElementById('aiTestDriveFilterDealer');
    const channelEl = document.getElementById('aiTestDriveFilterChannel');
    const statusEl = document.getElementById('aiTestDriveFilterStatus');
    if (callbackEl) callbackCode = callbackEl.value.trim();
    if (customerEl) customerName = customerEl.value.trim();
    if (dealerEl) dealer = dealerEl.value.trim();
    if (channelEl) channel = channelEl.value;
    if (statusEl) status = statusEl.value;
    currentPage = 1;
    window.renderAiTestDriveSchedulePage();
  };
  window.setAiTestDriveKeyword = function (value) { customerName = value; currentPage = 1; window.renderAiTestDriveSchedulePage(); };
  window.setAiTestDriveChannel = function (value) { channel = value; currentPage = 1; window.renderAiTestDriveSchedulePage(); };
  window.setAiTestDriveStatus = function (value) { status = value; currentPage = 1; window.renderAiTestDriveSchedulePage(); };
  window.resetAiTestDriveFilters = function () { callbackCode = ''; customerName = ''; dealer = ''; channel = ''; status = ''; currentPage = 1; window.renderAiTestDriveSchedulePage(); };
  window.changeAiTestDrivePageSize = function (value) { pageSize = Number(value); currentPage = 1; window.renderAiTestDriveSchedulePage(); };
  window.changeAiTestDrivePage = function (direction) { const totalPages = Math.max(1, Math.ceil(getRows().length / pageSize)); currentPage = Math.max(1, Math.min(totalPages, currentPage + direction)); window.renderAiTestDriveSchedulePage(); };
  window.selectAiTestDrivePage = function (value) { currentPage = Number(value); window.renderAiTestDriveSchedulePage(); };
  window.retryAiTestDrivePush = function (id) {
    const row = records.find((item) => item.id === id);
    if (!row) return;
    const defaultBookingMap = {
      'TD-001': 'YYTJ202609080023',
      'TD-002': 'YYTJ202609080024',
      'TD-005': 'YYTJ202609080027',
      'TD-006': 'YYTJ202609080028'
    };
    const defaultScheduleMap = {
      'TD-001': 'NEVSP202609080023',
      'TD-002': 'NEVSP202609080024',
      'TD-005': 'NEVSP202609080027',
      'TD-006': 'NEVSP202609080028'
    };
    row.nev = '已推送'; 
    row.dcc = '工单已生成'; 
    row.queue = '今日已处理'; 
    row.booking = defaultBookingMap[row.id] || (row.booking || `YYTJ${row.callback.slice(-11)}`);
    row.schedule = defaultScheduleMap[row.id] || (row.schedule || `NEVSP${row.booking.slice(-11)}`); 
    row.updated = '10:32:18';
    showToast('NEV 线索中台重试推送成功，已收到试驾排程编码。', true);
    activeTab = '今日已处理'; 
    window.renderAiTestDriveSchedulePage();
  };
  window.findAiTestDriveScheduleByTrace = function ({ leadCode, taskCode, callbackWorkorderCode }) {
    return records.find((row) => (!leadCode || row.lead === leadCode) && (!callbackWorkorderCode || row.callback === callbackWorkorderCode)) || null;
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
    setPageName('NEV培育 / 试驾排程 / 中台推送监控 / 预约详情');
    const page = document.getElementById('aiTestDriveScheduleDetailPage');
    page.classList.add('show');
    page.innerHTML = `<div class="detail-page-header"><div><div class="detail-page-title">中台推送预约线索详情</div><div class="detail-page-subtitle">NEV培育 / 试驾排程 / 中台推送监控 / 预约详情</div></div><button class="btn-secondary" type="button" onclick="returnAiTestDriveScheduleList()">返回列表</button></div>
      <div class="ai-schedule-detail-grid">
        <section class="card ai-schedule-detail-card"><div class="section-title">编码追溯与来源</div><div class="ai-trace-list"><div><span>预约来源渠道</span><strong style="color:${row.channel === 'AI外呼排程' ? '#2563eb' : '#059669'}; font-size:13px;">${row.channel === 'AI外呼排程' ? '🤖 AI外呼排程' : '👤 人工坐席建单'}</strong></div>${row.resultTag ? `<div><span>外呼结果标签</span><span class="tag-chip ${row.resultTag === '下发线索' || row.resultTag === '试驾排程下发' ? 'green' : row.resultTag.includes('人工') ? 'orange' : ''}" style="font-size:11px; font-weight:700;">${escapeHtml(row.resultTag)}</span></div>` : ''}${row.agent ? `<div><span>建单坐席账号</span><b>${escapeHtml(row.agent)}</b></div>` : ''}<div><span>培育线索编码</span><strong>${escapeHtml(row.lead)}</strong></div><div><span>培育任务编码</span><strong>${escapeHtml(row.task)}</strong></div><div><span>回访工单编码</span><strong>${escapeHtml(row.callback)}</strong></div><div><span>预约单号</span><strong>${escapeHtml(row.booking)}</strong></div><div><span>试驾排程编码</span><strong>${escapeHtml(row.schedule)}</strong></div></div></section>
        <section class="card ai-schedule-detail-card"><div class="section-title">确认的试驾信息</div><div class="ai-detail-kv"><div><span>客户信息</span><b>${escapeHtml(row.customerName || (row.customer ? row.customer.split('/')[0].trim() : '—'))} <span style="font-size:12px; font-weight:400; color:#64748b; font-family:monospace; margin-left:4px;">(${escapeHtml(row.phone || (row.customer && row.customer.split('/')[1] ? row.customer.split('/')[1].trim() : '—'))})</span></b></div><div><span>意向车系</span><b>${escapeHtml(row.series)}</b></div><div><span>试驾专营店</span><b>${escapeHtml(row.dealer)}</b></div><div><span>预约日期/时段</span><b>${escapeHtml(row.date)} ${escapeHtml(row.time)}</b></div></div><div class="ai-transcript"><span>${row.channel === 'AI外呼排程' ? 'AI外呼录音摘要' : '坐席建单沟通纪要'}</span><p>${escapeHtml(row.transcript)}</p></div></section>
        <section class="card ai-schedule-detail-card"><div class="section-title">DCC 与 NEV 处理状态</div><div class="ai-detail-kv"><div><span>DCC处理结果</span>${statusTag(row.dcc)}</div><div><span>NEV推送状态</span>${statusTag(row.nev)}</div><div><span>最近处理时间</span><b>${escapeHtml(row.updated)}</b></div><div><span>后续处理方</span><b>NEV线索中台</b></div></div><div class="ai-state-note">数据传输遵循方案B：AI挂机随路交付完整数据包，DCC培育系统自主即时裁决；若标签判定为不下发或转人工，DCC直接生成跟进线索或结案归档，不生成试驾工单。</div>${row.nev === '待重试' || row.nev === '推送超时' || row.nev === '推送失败' ? `<button class="btn-add ai-detail-retry" type="button" onclick="retryAiTestDrivePush('${row.id}')">重试推送 NEV</button>` : ''}</section>
      </div>`;
  };
  window.openAiTestDriveJourneyDocModal = function () {
    let modal = document.getElementById('aiTestDriveJourneyDocModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'aiTestDriveJourneyDocModal';
      modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; z-index:9999; background:rgba(15,23,42,0.65); display:flex; justify-content:center; align-items:center; backdrop-filter:blur(3px);';
      modal.innerHTML = `
        <div style="background:#fff; width:94%; max-width:1300px; height:88vh; border-radius:12px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25); display:flex; flex-direction:column; overflow:hidden;">
          <header style="padding:16px 24px; background:#1e293b; color:#fff; display:flex; justify-content:space-between; align-items:center; border-bottom:3px solid #2563eb;">
            <div>
              <h3 style="margin:0; font-size:16px; font-weight:700; display:flex; align-items:center; gap:8px;">
                <span>📋 试驾排程全生命周期场景旅程开发说明</span>
                <span style="font-size:11px; padding:2px 8px; border-radius:999px; background:#2563eb; color:#fff;">v2.0 终审版</span>
              </h3>
              <p style="margin:4px 0 0; font-size:12px; color:#94a3b8;">双轨并行、直线向下、阶段一至阶段五严格时序流转与异常流失挽回机制（供产品设计与研发1:1对照执行）</p>
            </div>
            <div style="display:flex; gap:10px; align-items:center;">
              <button type="button" style="color:#93c5fd; border:1px solid #3b82f6; background:rgba(37,99,235,0.25); padding:6px 14px; font-size:12px; font-weight:600; border-radius:4px; cursor:pointer;" onclick="window.open('DccLead.assets/docs/DccLead_试驾排程场景旅程开发说明.html', '_blank')">在新窗口打开完整手册 ↗</button>
              <button type="button" style="background:none; border:none; color:#94a3b8; font-size:22px; cursor:pointer; line-height:1;" onclick="closeAiTestDriveJourneyDocModal()">✕</button>
            </div>
          </header>
          <div style="flex:1; overflow:hidden; background:#f8fafc;">
            <iframe src="DccLead.assets/docs/DccLead_试驾排程场景旅程开发说明.html" style="width:100%; height:100%; border:none;"></iframe>
          </div>
          <footer style="padding:12px 24px; background:#f8fafc; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; align-items:center;">
            <button type="button" style="height:32px; padding:0 20px; background:#2563eb; border:1px solid #2563eb; color:#fff; border-radius:4px; font-size:13px; font-weight:500; cursor:pointer;" onclick="closeAiTestDriveJourneyDocModal()">完成查阅，返回列表</button>
          </footer>
        </div>
      `;
      modal.onclick = function (e) {
        if (e.target === modal) closeAiTestDriveJourneyDocModal();
      };
      document.body.appendChild(modal);
    } else {
      modal.style.display = 'flex';
    }
  };

  window.closeAiTestDriveJourneyDocModal = function () {
    const modal = document.getElementById('aiTestDriveJourneyDocModal');
    if (modal) modal.style.display = 'none';
  };

  window.returnAiTestDriveScheduleList = function () { showTestDriveSchedulingPage(); };
})();
