// ===== 任务排班模块 - 坐席管理/短信模板/分配规则/排班管理 =====

// 模拟数据
const seatData = [
  { id: 1, account: '1005641', e3sPlusAccount: 'E3S_1005641', name: '张伟', phone: '138****1234', status: '在岗', skillLevel: '高级', score: 95, team: '电销一组', createTime: '2026-01-15' },
  { id: 2, account: '1005642', e3sPlusAccount: 'E3S_1005642', name: '李娜', phone: '139****5678', status: '在岗', skillLevel: '中级', score: 88, team: '电销一组', createTime: '2026-02-20' },
  { id: 3, account: '1005643', e3sPlusAccount: '', name: '王强', phone: '137****9012', status: '休息', skillLevel: '高级', score: 92, team: '电销二组', createTime: '2026-01-10' },
  { id: 4, account: '1005644', e3sPlusAccount: 'E3S_1005644', name: '刘芳', phone: '136****3456', status: '在岗', skillLevel: '初级', score: 76, team: '电销二组', createTime: '2026-03-01' },
  { id: 5, account: '1005645', e3sPlusAccount: '', name: '陈明', phone: '135****7890', status: '离岗', skillLevel: '中级', score: 82, team: '电销一组', createTime: '2026-02-05' },
  { id: 6, account: '1005646', e3sPlusAccount: 'E3S_1005646', name: '赵丽', phone: '134****2345', status: '在岗', skillLevel: '高级', score: 96, team: '电销三组', createTime: '2026-01-20' },
  { id: 7, account: '1005647', e3sPlusAccount: 'E3S_1005647', name: '孙鹏', phone: '133****6789', status: '在岗', skillLevel: '中级', score: 85, team: '电销三组', createTime: '2026-02-15' },
  { id: 8, account: '1005648', e3sPlusAccount: 'E3S_1005648', name: '周婷', phone: '132****0123', status: '在岗', skillLevel: '初级', score: 78, team: '电销二组', createTime: '2026-03-10' }
];

const smsTemplateData = [
  { id: 1, name: '到店提醒模板', content: '尊敬的客户，您预约的试驾时间为{time}，地址：{address}，期待您的光临！', type: '提醒短信', status: '启用', createTime: '2026-01-10' },
  { id: 2, name: '跟进回访模板', content: '您好{name}，我是您的专属顾问{agent}，请问您对车型还有什么疑问吗？', type: '回访短信', status: '启用', createTime: '2026-01-15' },
  { id: 3, name: '活动邀约模板', content: '尊敬的客户，{date}我们将举办{event}活动，诚邀您参加，回复1报名。', type: '营销短信', status: '启用', createTime: '2026-02-01' },
  { id: 4, name: '生日祝福模板', content: '尊敬的{name}先生/女士，在您生日来临之际，祝您生日快乐！到店可领取精美礼品一份。', type: '关怀短信', status: '停用', createTime: '2026-02-20' }
];

// 短信模板列表状态：数据量增长后仍保持筛选与分页可控。
var smsTemplatePageState = {
  currentPage: 1,
  pageSize: 10,
  filteredData: smsTemplateData.slice()
};

const allocationRuleData = [
  { id: 1, name: '按能力分配', desc: '高难度线索优先分配给高级坐席', priority: 1, status: '启用', condition: '线索评分>=80分', target: '高级坐席', weight: 60 },
  { id: 2, name: '轮询分配', desc: '新线索平均分配给在岗坐席', priority: 2, status: '启用', condition: '新线索', target: '所有在岗坐席', weight: 100 },
  { id: 3, name: '老客户回归', desc: '历史跟进过的客户优先分配给原坐席', priority: 3, status: '启用', condition: '30天内有跟进记录', target: '原跟进坐席', weight: 80 },
  { id: 4, name: '区域分配', desc: '按客户所在区域分配给对应团队', priority: 4, status: '停用', condition: '客户区域匹配', target: '对应区域团队', weight: 70 }
];

function generateScheduleData(year, month) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const shifts = ['早班', '中班', '晚班', '休息'];
  const schedule = {};
  seatData.forEach(seat => {
    schedule[seat.account] = {};
    for (let d = 1; d <= daysInMonth; d++) {
      if (seat.status === '离岗') {
        schedule[seat.account][d] = '休息';
      } else {
        const rand = Math.random();
        schedule[seat.account][d] = rand < 0.6 ? shifts[Math.floor(Math.random() * 3)] : '休息';
      }
    }
  });
  return schedule;
}

let currentScheduleYear = 2026;
let currentScheduleMonth = 9;
let currentScheduleData = generateScheduleData(currentScheduleYear, currentScheduleMonth);
let shiftTypes = [
  { name: '早班', time: '09:00-18:00', color: '#1890ff' },
  { name: '中班', time: '12:00-21:00', color: '#52c41a' },
  { name: '晚班', time: '14:00-23:00', color: '#722ed1' }
];

function setSchedulingNavVisible(visible) {
  document.querySelector('.scheduling-nav')?.classList.toggle('show', visible);
}

function showSchedulingPage(defaultTab) {
  defaultTab = defaultTab || 'seat-management';
  hideLeadPages();
  setStrategyConfigTabsVisible(false);
  setManualAiConfigTabsVisible(false);
  setExcellentConfigManageTabsVisible(false);
  document.querySelector('nav[aria-label="培育策略三级菜单"]')?.classList.add('hidden');
  document.querySelector('.leads-nav')?.classList.remove('show');
  document.querySelector('.reports-nav')?.classList.remove('show');
  document.querySelector('.ops-nav')?.classList.remove('show');
  document.querySelector('.settings-nav')?.classList.remove('show');
  setSchedulingNavVisible(true);
  document.querySelectorAll('.scheduling-nav .strategy-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === defaultTab);
  });
  setSidebarActiveByName('任务排班');
  setPolicyContentVisible(false);
  document.getElementById('designStage')?.classList.remove('show');
  switchSchedulingTab(defaultTab);
}

function switchSchedulingTab(tab) {
  // 同步三级菜单状态，避免内容已经切换但仍高亮上一个菜单。
  document.querySelectorAll('.scheduling-nav .strategy-nav-item').forEach(function(item) {
    item.classList.toggle('active', item.dataset.tab === tab);
  });
  document.querySelectorAll('#seatManagementPage,#smsTemplatePage,#allocationRulesPage,#scheduleManagementPage').forEach(p => p.classList.remove('show'));
  const labels = {
    'seat-management': '坐席管理',
    'sms-template': '短信模板',
    'allocation-rules': '分配规则',
    'schedule-management': '排班管理'
  };
  setPageName('任务排班 / ' + (labels[tab] || '坐席管理'));
  if (tab === 'seat-management') {
    document.getElementById('seatManagementPage').classList.add('show');
    renderSeatManagementPage();
  } else if (tab === 'sms-template') {
    document.getElementById('smsTemplatePage').classList.add('show');
    renderSmsTemplatePage();
  } else if (tab === 'allocation-rules') {
    document.getElementById('allocationRulesPage').classList.add('show');
    renderAllocationRulesPage();
  } else if (tab === 'schedule-management') {
    document.getElementById('scheduleManagementPage').classList.add('show');
    renderScheduleManagementPage();
  }
}

function renderSeatManagementPage() {
  var page = document.getElementById('seatManagementPage');
  page.innerHTML = '<div class="page-hero"><div><div class="page-title">坐席管理</div><div class="page-desc">管理电销坐席账号信息、技能等级、在岗状态，支持新增、编辑、启用/停用坐席账号。</div></div><div class="summary-strip"><div class="summary-card"><div class="summary-label">坐席总数</div><div class="summary-value">' + seatData.length + '</div></div><div class="summary-card"><div class="summary-label">在岗人数</div><div class="summary-value" style="color:#52c41a">' + seatData.filter(function(s){return s.status==='在岗'}).length + '</div></div><div class="summary-card"><div class="summary-label">休息人数</div><div class="summary-value" style="color:#faad14">' + seatData.filter(function(s){return s.status==='休息'}).length + '</div></div><div class="summary-card"><div class="summary-label">离岗人数</div><div class="summary-value" style="color:#ff4d4f">' + seatData.filter(function(s){return s.status==='离岗'}).length + '</div></div><div class="summary-card"><div class="summary-label">平均评分</div><div class="summary-value" style="color:#1890ff">' + Math.round(seatData.reduce(function(a,b){return a+b.score},0)/seatData.length) + '</div></div></div></div>' +
    '<div class="filter-row"><span class="filter-label">关键字：</span><input class="lead-input" style="width:140px" id="seatKeywordFilter" placeholder="账号/姓名" oninput="filterSeatTable()" /><span class="filter-label" style="margin-left:8px">状态：</span><select class="filter-select" id="seatStatusFilter" onchange="filterSeatTable()"><option value="">全部</option><option value="在岗">在岗</option><option value="休息">休息</option><option value="离岗">离岗</option></select><span class="filter-label" style="margin-left:8px">技能等级：</span><select class="filter-select" id="seatSkillFilter" onchange="filterSeatTable()"><option value="">全部</option><option value="高级">高级</option><option value="中级">中级</option><option value="初级">初级</option></select><span class="filter-label" style="margin-left:8px">所属团队：</span><select class="filter-select" id="seatTeamFilter" onchange="filterSeatTable()"><option value="">全部</option><option value="电销一组">电销一组</option><option value="电销二组">电销二组</option><option value="电销三组">电销三组</option></select><button class="btn-secondary" type="button" onclick="resetSeatFilter()">重置</button></div>' +
    '<div class="card"><div class="section-header"><div class="section-title">坐席列表</div><div><button class="btn-secondary" style="margin-right:8px" onclick="showToast(\'已导出坐席数据\', true)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>导出</button><button class="btn-add" onclick="openSeatModal()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px;vertical-align:middle"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>新增坐席</button></div></div><div class="policy-table-wrap"><table class="data-table policy-table"><thead><tr><th class="col-num">#</th><th>坐席账号</th><th>姓名</th><th>手机号</th><th>所属团队</th><th>技能等级</th><th>业绩评分</th><th>状态</th><th>入职时间</th><th>操作</th></tr></thead><tbody id="seatTableBody"></tbody></table></div></div>' +
    '<div class="modal-overlay" id="seatModal"><div class="modal-card" style="width:520px"><div class="modal-header"><div class="modal-title" id="seatModalTitle">新增坐席</div><button class="modal-close" onclick="closeSeatModal()">×</button></div><div class="modal-body"><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px"><div class="form-group"><label class="form-label">坐席账号 <span style="color:#ff4d4f">*</span></label><input class="form-input" id="seatFormAccount" placeholder="请输入坐席账号" /></div><div class="form-group"><label class="form-label">姓名 <span style="color:#ff4d4f">*</span></label><input class="form-input" id="seatFormName" placeholder="请输入姓名" /></div><div class="form-group"><label class="form-label">手机号</label><input class="form-input" id="seatFormPhone" placeholder="请输入手机号" /></div><div class="form-group"><label class="form-label">所属团队 <span style="color:#ff4d4f">*</span></label><select class="form-select" id="seatFormTeam"><option value="电销一组">电销一组</option><option value="电销二组">电销二组</option><option value="电销三组">电销三组</option></select></div><div class="form-group"><label class="form-label">技能等级</label><select class="form-select" id="seatFormSkill"><option value="初级">初级</option><option value="中级">中级</option><option value="高级">高级</option></select></div><div class="form-group"><label class="form-label">初始状态</label><select class="form-select" id="seatFormStatus"><option value="在岗">在岗</option><option value="休息">休息</option><option value="离岗">离岗</option></select></div></div></div><div class="modal-footer"><button class="btn-secondary" onclick="closeSeatModal()">取消</button><button class="btn-primary" onclick="saveSeat()">确定</button></div></div></div>';
  renderSeatTable(seatData);
}

function renderSeatTable(data) {
  var tbody = document.getElementById('seatTableBody');
  if (!tbody) return;
  tbody.innerHTML = data.map(function(seat, i) {
    var scoreColor = seat.score >= 90 ? '#52c41a' : seat.score >= 80 ? '#1890ff' : '#faad14';
    var statusTag = seat.status === '在岗' ? 'tag-success' : seat.status === '休息' ? 'tag-warning' : 'tag-danger';
    var skillTag = seat.skillLevel === '高级' ? 'tag-success' : seat.skillLevel === '中级' ? 'tag-processing' : 'tag-default';
    return '<tr><td class="col-num">' + (i+1) + '</td><td><strong>' + seat.account + '</strong></td><td>' + seat.name + '</td><td>' + seat.phone + '</td><td>' + seat.team + '</td><td><span class="tag ' + skillTag + '">' + seat.skillLevel + '</span></td><td><div style="display:flex;align-items:center;gap:8px"><div style="flex:1;height:6px;background:#f0f0f0;border-radius:3px;overflow:hidden"><div style="width:' + seat.score + '%;height:100%;background:' + scoreColor + ';border-radius:3px"></div></div><span style="font-weight:600;color:' + scoreColor + '">' + seat.score + '</span></div></td><td><span class="tag ' + statusTag + '">' + seat.status + '</span></td><td style="color:#8c8c8c">' + seat.createTime + '</td><td><a href="javascript:void(0)" class="action-link" onclick="editSeat(' + seat.id + ')">编辑</a><a href="javascript:void(0)" class="action-link" style="color:' + (seat.status === '在岗' ? '#ff4d4f' : '#52c41a') + '" onclick="toggleSeatStatus(' + seat.id + ')">' + (seat.status === '在岗' ? '停用' : '启用') + '</a><a href="javascript:void(0)" class="action-link" style="color:#ff4d4f" onclick="deleteSeat(' + seat.id + ')">删除</a></td></tr>';
  }).join('');
}

function filterSeatTable() {
  var keyword = (document.getElementById('seatKeywordFilter')?.value || '').toLowerCase();
  var status = document.getElementById('seatStatusFilter')?.value || '';
  var skill = document.getElementById('seatSkillFilter')?.value || '';
  var team = document.getElementById('seatTeamFilter')?.value || '';
  var filtered = seatData.filter(function(s) {
    return (!keyword || s.account.includes(keyword) || s.name.toLowerCase().includes(keyword)) &&
      (!status || s.status === status) && (!skill || s.skillLevel === skill) && (!team || s.team === team);
  });
  renderSeatTable(filtered);
}

function resetSeatFilter() {
  document.getElementById('seatKeywordFilter').value = '';
  document.getElementById('seatStatusFilter').value = '';
  document.getElementById('seatSkillFilter').value = '';
  document.getElementById('seatTeamFilter').value = '';
  renderSeatTable(seatData);
}

var editingSeatId = null;
function openSeatModal() {
  editingSeatId = null;
  document.getElementById('seatModalTitle').textContent = '新增坐席';
  document.getElementById('seatFormAccount').value = '';
  document.getElementById('seatFormName').value = '';
  document.getElementById('seatFormPhone').value = '';
  document.getElementById('seatFormTeam').value = '电销一组';
  document.getElementById('seatFormSkill').value = '初级';
  document.getElementById('seatFormStatus').value = '在岗';
  document.getElementById('seatModal').classList.add('show');
}

function closeSeatModal() {
  document.getElementById('seatModal').classList.remove('show');
}

function editSeat(id) {
  var seat = seatData.find(function(s){return s.id===id});
  if (!seat) return;
  editingSeatId = id;
  document.getElementById('seatModalTitle').textContent = '编辑坐席';
  document.getElementById('seatFormAccount').value = seat.account;
  document.getElementById('seatFormName').value = seat.name;
  document.getElementById('seatFormPhone').value = seat.phone;
  document.getElementById('seatFormTeam').value = seat.team;
  document.getElementById('seatFormSkill').value = seat.skillLevel;
  document.getElementById('seatFormStatus').value = seat.status;
  document.getElementById('seatModal').classList.add('show');
}

function saveSeat() {
  var account = document.getElementById('seatFormAccount').value.trim();
  var name = document.getElementById('seatFormName').value.trim();
  if (!account || !name) { showToast('请填写必填项', false); return; }
  if (editingSeatId) {
    var seat = seatData.find(function(s){return s.id===editingSeatId});
    if (seat) {
      seat.account = account; seat.name = name;
      seat.phone = document.getElementById('seatFormPhone').value.trim();
      seat.team = document.getElementById('seatFormTeam').value;
      seat.skillLevel = document.getElementById('seatFormSkill').value;
      seat.status = document.getElementById('seatFormStatus').value;
    }
    showToast('坐席信息已更新', true);
  } else {
    var maxId = Math.max.apply(null, seatData.map(function(s){return s.id}));
    seatData.push({ id: maxId+1, account: account, name: name, phone: document.getElementById('seatFormPhone').value.trim() || '-',
      team: document.getElementById('seatFormTeam').value, skillLevel: document.getElementById('seatFormSkill').value,
      score: 75, status: document.getElementById('seatFormStatus').value, createTime: new Date().toISOString().split('T')[0]
    });
    showToast('坐席已添加', true);
  }
  closeSeatModal();
  renderSeatManagementPage();
}

function toggleSeatStatus(id) {
  var seat = seatData.find(function(s){return s.id===id});
  if (!seat) return;
  seat.status = seat.status === '在岗' ? '休息' : '在岗';
  showToast('坐席已' + (seat.status === '在岗' ? '启用' : '停用'), true);
  renderSeatTable(seatData);
}

function deleteSeat(id) {
  if (!confirm('确定要删除该坐席吗？')) return;
  var idx = seatData.findIndex(function(s){return s.id===id});
  if (idx > -1) { seatData.splice(idx, 1); showToast('坐席已删除', true); renderSeatManagementPage(); }
}

function renderSmsTemplatePage() {
  var page = document.getElementById('smsTemplatePage');
  ensureSmsTemplateInteractionStyles();
  page.innerHTML = '<div class="page-hero"><div><div class="page-title">短信模板</div><div class="page-desc">管理外呼跟进、到店提醒、活动邀约等短信模板，支持变量插入、预览和启用/停用。</div></div><div class="summary-strip"><div class="summary-card"><div class="summary-label">模板总数</div><div class="summary-value" id="smsTemplateTotal">' + smsTemplateData.length + '</div></div><div class="summary-card"><div class="summary-label">启用模板</div><div class="summary-value" id="smsTemplateEnabled" style="color:#52c41a">' + smsTemplateData.filter(function(t){return t.status==='启用'}).length + '</div></div><div class="summary-card"><div class="summary-label">停用模板</div><div class="summary-value" id="smsTemplateDisabled" style="color:#ff4d4f">' + smsTemplateData.filter(function(t){return t.status==='停用'}).length + '</div></div></div></div>' +
    '<div class="filter-row"><span class="filter-label">模板名称：</span><input class="lead-input" style="width:160px" id="smsKeywordFilter" placeholder="请输入模板名称" oninput="filterSmsTable()" /><span class="filter-label" style="margin-left:8px">模板类型：</span><select class="filter-select" id="smsTypeFilter" onchange="filterSmsTable()"><option value="">全部</option><option value="提醒短信">提醒短信</option><option value="回访短信">回访短信</option><option value="营销短信">营销短信</option><option value="关怀短信">关怀短信</option></select><span class="filter-label" style="margin-left:8px">状态：</span><select class="filter-select" id="smsStatusFilter" onchange="filterSmsTable()"><option value="">全部</option><option value="启用">启用</option><option value="停用">停用</option></select><button class="btn-secondary" type="button" onclick="resetSmsFilter()">重置</button></div>' +
    '<div class="card"><div class="section-header"><div class="section-title">短信模板列表</div><button class="btn-add" onclick="openSmsModal()"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:4px;vertical-align:middle"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>新增模板</button></div><div class="policy-table-wrap"><table class="data-table policy-table"><thead><tr><th class="col-num">#</th><th>模板名称</th><th>模板类型</th><th>模板内容</th><th>状态</th><th>创建时间</th><th class="sms-operation-header">操作</th></tr></thead><tbody id="smsTableBody"></tbody></table></div><div id="smsTemplatePagination"></div></div>' +
    '<div class="modal-overlay" id="smsModal"><div class="modal-card" style="width:600px"><div class="modal-header"><div class="modal-title" id="smsModalTitle">新增短信模板</div><button class="modal-close" onclick="closeSmsModal()">×</button></div><div class="modal-body"><div class="form-group"><label class="form-label">模板名称 <span style="color:#ff4d4f">*</span></label><input class="form-input" id="smsFormName" placeholder="请输入模板名称" /></div><div class="sms-template-meta-fields"><div class="form-group"><label class="form-label">模板类型 <span style="color:#ff4d4f">*</span></label><select class="form-select" id="smsFormType"><option value="提醒短信">提醒短信</option><option value="回访短信">回访短信</option><option value="营销短信">营销短信</option><option value="关怀短信">关怀短信</option></select></div><div class="form-group"><label class="form-label">状态</label><select class="form-select" id="smsFormStatus"><option value="启用">启用</option><option value="停用">停用</option></select></div></div><div class="form-group" style="margin-top:16px"><label class="form-label">模板内容 <span style="color:#ff4d4f">*</span></label><textarea class="form-textarea" id="smsFormContent" rows="4" placeholder="请输入短信内容，可插入下方指定变量"></textarea><div class="sms-variable-hint">仅支持：{name} 客户姓名；{time} 预约时间；{address} 门店地址；{agent} 跟进顾问；{date} 活动日期；{event} 活动名称。其他变量无法保存。</div></div></div><div class="modal-footer"><button class="btn-secondary" onclick="closeSmsModal()">取消</button><button class="btn-primary" onclick="saveSmsTemplate()">确定</button></div></div></div>' +
    '<div class="modal-overlay" id="smsPreviewModal"><div class="modal-card" style="width:420px"><div class="modal-header"><div class="modal-title">短信预览</div><button class="modal-close" onclick="document.getElementById(\'smsPreviewModal\').classList.remove(\'show\')">×</button></div><div class="modal-body"><div style="background:#f5f5f5;border-radius:12px;padding:20px"><div style="background:#fff;border-radius:8px;padding:12px 16px;box-shadow:0 2px 8px rgba(0,0,0,.08)"><div style="font-size:12px;color:#8c8c8c;margin-bottom:6px">10658000</div><div id="smsPreviewContent" style="font-size:14px;line-height:1.6;color:#333"></div></div></div></div><div class="modal-footer"><button class="btn-primary" onclick="document.getElementById(\'smsPreviewModal\').classList.remove(\'show\')">关闭</button></div></div></div>';
  renderSmsTable(smsTemplateData);
}

function ensureSmsTemplateInteractionStyles() {
  if (document.getElementById('sms-template-interaction-styles')) return;
  document.head.insertAdjacentHTML('beforeend', '<style id="sms-template-interaction-styles">#smsTemplatePage .sms-operation-header,#smsTemplatePage .sms-operation-cell{width:268px;min-width:268px;text-align:left;padding-left:22px!important;padding-right:18px!important}#smsTemplatePage .sms-template-actions{display:flex;align-items:center;justify-content:flex-start;gap:10px;min-height:32px;white-space:nowrap}#smsTemplatePage .sms-template-actions .action-btn{flex:0 0 auto}#smsTemplatePage .sms-template-pagination{border-top:1px solid #e8eef7}#smsTemplatePage .sms-template-pagination .filter-select{height:32px;min-width:104px;font-size:13px;background:#fff}</style>');
}

function escapeSmsHtml(value) {
  return String(value === null || value === undefined ? '' : value).replace(/[&<>"']/g, function(character) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
  });
}

function refreshSmsTemplateSummary() {
  var total = document.getElementById('smsTemplateTotal');
  var enabled = document.getElementById('smsTemplateEnabled');
  var disabled = document.getElementById('smsTemplateDisabled');
  if (total) total.textContent = smsTemplateData.length;
  if (enabled) enabled.textContent = smsTemplateData.filter(function(t){ return t.status === '启用'; }).length;
  if (disabled) disabled.textContent = smsTemplateData.filter(function(t){ return t.status === '停用'; }).length;
}

function renderSmsTable(data) {
  var tbody = document.getElementById('smsTableBody');
  if (!tbody) return;
  smsTemplatePageState.filteredData = data.slice();
  var total = smsTemplatePageState.filteredData.length;
  var totalPages = Math.max(1, Math.ceil(total / smsTemplatePageState.pageSize));
  smsTemplatePageState.currentPage = Math.min(Math.max(1, smsTemplatePageState.currentPage), totalPages);
  var start = (smsTemplatePageState.currentPage - 1) * smsTemplatePageState.pageSize;
  var pageData = smsTemplatePageState.filteredData.slice(start, start + smsTemplatePageState.pageSize);
  tbody.innerHTML = pageData.map(function(tpl, i) {
    var statusTag = tpl.status === '启用' ? 'col-status-on' : 'col-status-off';
    var statusAction = tpl.status === '启用' ? '停用' : '启用';
    var statusClass = tpl.status === '启用' ? 'disable' : 'enable';
    return '<tr><td class="col-num">' + (start + i + 1) + '</td><td><strong>' + escapeSmsHtml(tpl.name) + '</strong></td><td><span class="tag tag-processing">' + escapeSmsHtml(tpl.type) + '</span></td><td style="max-width:360px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#595959" title="' + escapeSmsHtml(tpl.content) + '">' + escapeSmsHtml(tpl.content) + '</td><td><span class="' + statusTag + '">● ' + escapeSmsHtml(tpl.status) + '</span></td><td style="color:#8c8c8c">' + escapeSmsHtml(tpl.createTime) + '</td><td class="sms-operation-cell"><div class="sms-template-actions"><button class="action-btn view" type="button" onclick="previewSms(' + tpl.id + ')">预览</button><button class="action-btn edit" type="button" onclick="editSms(' + tpl.id + ')">编辑</button><button class="action-btn ' + statusClass + '" type="button" onclick="toggleSmsStatus(' + tpl.id + ')">' + statusAction + '</button><button class="action-btn delete" type="button" onclick="deleteSms(' + tpl.id + ')">删除</button></div></td></tr>';
  }).join('') || '<tr><td colspan="7" class="empty-cell">暂无符合条件的短信模板</td></tr>';
  renderSmsTemplatePagination(total, totalPages);
}

function renderSmsTemplatePagination(total, totalPages) {
  var pagination = document.getElementById('smsTemplatePagination');
  if (!pagination) return;
  var page = smsTemplatePageState.currentPage;
  pagination.className = 'pagination sms-template-pagination';
  pagination.innerHTML = '<span>共 ' + total + ' 条记录，当前第 ' + page + ' / ' + totalPages + ' 页</span><div class="pagination-btns"><select class="filter-select" aria-label="每页条数" onchange="changeSmsTemplatePageSize(this.value)"><option value="10"' + (smsTemplatePageState.pageSize === 10 ? ' selected' : '') + '>每页 10 条</option><option value="20"' + (smsTemplatePageState.pageSize === 20 ? ' selected' : '') + '>每页 20 条</option><option value="50"' + (smsTemplatePageState.pageSize === 50 ? ' selected' : '') + '>每页 50 条</option></select><button class="page-btn" type="button" aria-label="上一页"' + (page === 1 ? ' disabled' : '') + ' onclick="goSmsTemplatePage(-1)">‹</button><button class="page-btn" type="button" style="min-width:76px" aria-label="当前页">第 ' + page + ' 页</button><button class="page-btn" type="button" aria-label="下一页"' + (page === totalPages ? ' disabled' : '') + ' onclick="goSmsTemplatePage(1)">›</button></div>';
}

function goSmsTemplatePage(step) {
  var totalPages = Math.max(1, Math.ceil(smsTemplatePageState.filteredData.length / smsTemplatePageState.pageSize));
  var nextPage = Math.min(Math.max(1, smsTemplatePageState.currentPage + step), totalPages);
  if (nextPage === smsTemplatePageState.currentPage) return;
  smsTemplatePageState.currentPage = nextPage;
  renderSmsTable(smsTemplatePageState.filteredData);
}

function changeSmsTemplatePageSize(value) {
  smsTemplatePageState.pageSize = Number(value) || 10;
  smsTemplatePageState.currentPage = 1;
  renderSmsTable(smsTemplatePageState.filteredData);
}

function filterSmsTable() {
  var keyword = (document.getElementById('smsKeywordFilter')?.value || '').toLowerCase();
  var type = document.getElementById('smsTypeFilter')?.value || '';
  var status = document.getElementById('smsStatusFilter')?.value || '';
  var filtered = smsTemplateData.filter(function(t) {
    return (!keyword || t.name.toLowerCase().includes(keyword)) && (!type || t.type === type) && (!status || t.status === status);
  });
  smsTemplatePageState.currentPage = 1;
  renderSmsTable(filtered);
}

function resetSmsFilter() {
  document.getElementById('smsKeywordFilter').value = '';
  document.getElementById('smsTypeFilter').value = '';
  document.getElementById('smsStatusFilter').value = '';
  smsTemplatePageState.currentPage = 1;
  renderSmsTable(smsTemplateData);
}

var editingSmsId = null;
function openSmsModal() {
  editingSmsId = null;
  document.getElementById('smsModalTitle').textContent = '新增短信模板';
  document.getElementById('smsFormName').value = '';
  document.getElementById('smsFormType').value = '提醒短信';
  document.getElementById('smsFormStatus').value = '启用';
  document.getElementById('smsFormContent').value = '';
  document.getElementById('smsModal').classList.add('show');
}

function closeSmsModal() { document.getElementById('smsModal').classList.remove('show'); }

function editSms(id) {
  var tpl = smsTemplateData.find(function(t){return t.id===id});
  if (!tpl) return;
  editingSmsId = id;
  document.getElementById('smsModalTitle').textContent = '编辑短信模板';
  document.getElementById('smsFormName').value = tpl.name;
  document.getElementById('smsFormType').value = tpl.type;
  document.getElementById('smsFormStatus').value = tpl.status;
  document.getElementById('smsFormContent').value = tpl.content;
  document.getElementById('smsModal').classList.add('show');
}

function saveSmsTemplate() {
  var name = document.getElementById('smsFormName').value.trim();
  var content = document.getElementById('smsFormContent').value.trim();
  if (!name || !content) { showToast('请填写必填项', false); return; }
  var duplicate = smsTemplateData.some(function(t) {
    return t.id !== editingSmsId && t.name.trim().toLowerCase() === name.toLowerCase();
  });
  if (duplicate) { showToast('模板名称已存在，请修改后保存', false); return; }
  var allowedVariables = ['name', 'time', 'address', 'agent', 'date', 'event'];
  var invalidVariables = [];
  content.replace(/\{([^{}]+)\}/g, function(match, variable) {
    if (allowedVariables.indexOf(variable) === -1 && invalidVariables.indexOf(variable) === -1) invalidVariables.push(variable);
    return match;
  });
  if (invalidVariables.length) { showToast('存在不支持的变量：{' + invalidVariables.join('}、{') + '}', false); return; }
  if (editingSmsId) {
    var tpl = smsTemplateData.find(function(t){return t.id===editingSmsId});
    if (tpl) { tpl.name = name; tpl.type = document.getElementById('smsFormType').value; tpl.status = document.getElementById('smsFormStatus').value; tpl.content = content; }
    showToast('模板已更新', true);
  } else {
    var maxId = smsTemplateData.reduce(function(max, t){ return Math.max(max, t.id); }, 0);
    smsTemplateData.push({ id: maxId+1, name: name, type: document.getElementById('smsFormType').value, status: document.getElementById('smsFormStatus').value, content: content, createTime: new Date().toISOString().split('T')[0] });
    showToast('模板已添加', true);
  }
  closeSmsModal();
  renderSmsTemplatePage();
}

function previewSms(id) {
  var tpl = smsTemplateData.find(function(t){return t.id===id});
  if (!tpl) return;
  var preview = tpl.content.replace(/\{name\}/g, '张三').replace(/\{time\}/g, '2026-09-15 14:00').replace(/\{address\}/g, 'XX汽车4S店').replace(/\{agent\}/g, '李顾问').replace(/\{date\}/g, '9月20日').replace(/\{event\}/g, '新品试驾会');
  document.getElementById('smsPreviewContent').textContent = preview;
  document.getElementById('smsPreviewModal').classList.add('show');
}

function toggleSmsStatus(id) {
  var tpl = smsTemplateData.find(function(t){return t.id===id});
  if (!tpl) return;
  tpl.status = tpl.status === '启用' ? '停用' : '启用';
  showToast('模板已' + (tpl.status === '启用' ? '启用' : '停用'), true);
  refreshSmsTemplateSummary();
  filterSmsTable();
}

function deleteSms(id) {
  if (!confirm('确定要删除该模板吗？')) return;
  var idx = smsTemplateData.findIndex(function(t){return t.id===id});
  if (idx > -1) { smsTemplateData.splice(idx, 1); showToast('模板已删除', true); renderSmsTemplatePage(); }
}

// 现网分配规则配置数据模型 (1:1现网规范)
var currentAllocationConfig = {
  workTimeStart: '09:00',
  workTimeEnd: '20:55',
  baseRule: 'random', // 'load' | 'daily' | 'performance' | 'random'
  aiUnfulfilledTestDriveAssignmentMode: 'auto', // 'auto' | 'supervisor'；仅影响后续新建的 AI 外呼未履约试驾回访任务
  selectedChannels: ['R11'], // 用户当前选中的 R 渠道队列，按从上到下优先级排序
  availableChannels: ['R11', 'R10', 'R9', 'R8', 'R7', 'R6', 'R5', 'R4', 'R3', 'R2', 'R1']
};

function renderAllocationRulesPage() {
  var page = document.getElementById('allocationRulesPage');
  if (!page) return;

  var baseRules = [
    {
      id: 'load',
      title: '按当前负载优先分配',
      desc: '优先分派给当前待接待任务量最少的在岗坐席，保障团队即时负载动态均衡'
    },
    {
      id: 'daily',
      title: '按当日接待优先补齐分配',
      desc: '优先分派给当日累计接待量最少的坐席，逐步平衡团队成员间的日接待总量'
    },
    {
      id: 'performance',
      title: '按业绩排名优先分配',
      desc: '优先分派给当期综合业绩评分最高的优秀坐席，助力高价值线索高效跟进转化'
    },
    {
      id: 'random',
      title: '随机(按顺序轮流分配)',
      desc: '按在岗坐席账号顺序循环轮流分派，保障每位坐席获得均等的线索分配机会'
    }
  ];

  var radioHtml = baseRules.map(function(item) {
    var checked = currentAllocationConfig.baseRule === item.id ? 'checked' : '';
    return '<label class="alloc-radio-item" onclick="selectBaseAllocationRule(\'' + item.id + '\')">' +
      '<input type="radio" name="baseAllocRule" value="' + item.id + '" ' + checked + ' />' +
      '<div class="alloc-radio-text">' +
        '<div class="alloc-radio-title">' + item.title + '</div>' +
        '<div class="alloc-radio-desc">' + item.desc + '</div>' +
      '</div>' +
    '</label>';
  }).join('');

  page.innerHTML = 
    '<div class="page-hero">' +
      '<div>' +
        '<div class="page-title">分配规则</div>' +
        '<div class="page-desc">统一设定待跟进线索的自动分流机制与渠道优先级队列，在坐席配额内实现智能精准派单与团队负载均衡。</div>' +
      '</div>' +
    '</div>' +

    '<div class="card alloc-config-card">' +
      '<div class="alloc-rule-header-title">' +
        '系统基于在岗坐席当日「剩余可用接待量 > 0」的前提条件，按以下规则策略智能分派待联系线索：' +
      '</div>' +

      '<!-- 工作时间 -->' +
      '<div class="alloc-form-row">' +
        '<div class="alloc-form-label"><span class="required">*</span>工作时间：</div>' +
        '<div class="alloc-form-content">' +
          '<div class="alloc-time-picker-wrap" id="allocTimePickerWrap" onclick="toggleTimePickerPopover(event)">' +
            '<input type="text" class="alloc-time-input" id="allocWorkTimeStart" value="' + currentAllocationConfig.workTimeStart + '" placeholder="09:00" onclick="event.stopPropagation()" oninput="syncTimePickerFromInputs()" onblur="validateTimeFormat(this, \'09:00\')" />' +
            '<span class="alloc-time-sep">—</span>' +
            '<input type="text" class="alloc-time-input" id="allocWorkTimeEnd" value="' + currentAllocationConfig.workTimeEnd + '" placeholder="20:55" onclick="event.stopPropagation()" oninput="syncTimePickerFromInputs()" onblur="validateTimeFormat(this, \'20:55\')" />' +
            '<span class="alloc-time-icon" title="点击展开时间范围选择浮层">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bfbfbf" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
                '<circle cx="12" cy="12" r="10"></circle>' +
                '<polyline points="12 6 12 12 16 14"></polyline>' +
              '</svg>' +
            '</span>' +
            '<!-- 时间选择浮层 -->' +
            '<div class="alloc-time-popover" id="allocTimePopover" onclick="event.stopPropagation()">' +
              '<div class="alloc-time-preset-title">常用时间段预设</div>' +
              '<div class="alloc-time-presets">' +
                '<button type="button" class="alloc-time-preset-btn" onclick="applyTimePreset(\'09:00\', \'20:55\', event)">09:00 — 20:55 (现网推荐)</button>' +
                '<button type="button" class="alloc-time-preset-btn" onclick="applyTimePreset(\'09:00\', \'18:00\', event)">09:00 — 18:00 (常规白班)</button>' +
                '<button type="button" class="alloc-time-preset-btn" onclick="applyTimePreset(\'08:30\', \'21:30\', event)">08:30 — 21:30 (全勤轮班)</button>' +
              '</div>' +
              '<div class="alloc-time-cols-container">' +
                '<div class="alloc-time-col-block">' +
                  '<div class="alloc-time-col-label">开始时间</div>' +
                  '<div class="alloc-time-col-selects">' +
                    '<select id="allocStartHour" class="alloc-time-select" onchange="updateTimeFromSelectors()"></select>' +
                    '<span class="alloc-time-colon">:</span>' +
                    '<select id="allocStartMin" class="alloc-time-select" onchange="updateTimeFromSelectors()"></select>' +
                  '</div>' +
                '</div>' +
                '<div class="alloc-time-col-block">' +
                  '<div class="alloc-time-col-label">结束时间</div>' +
                  '<div class="alloc-time-col-selects">' +
                    '<select id="allocEndHour" class="alloc-time-select" onchange="updateTimeFromSelectors()"></select>' +
                    '<span class="alloc-time-colon">:</span>' +
                    '<select id="allocEndMin" class="alloc-time-select" onchange="updateTimeFromSelectors()"></select>' +
                  '</div>' +
                '</div>' +
              '</div>' +
              '<div class="alloc-time-popover-footer">' +
                '<div class="alloc-time-current-text" id="allocTimePreview">当前: ' + currentAllocationConfig.workTimeStart + ' — ' + currentAllocationConfig.workTimeEnd + '</div>' +
                '<div class="alloc-popover-actions">' +
                  '<button type="button" class="alloc-popover-btn alloc-popover-btn-cancel" onclick="closeTimePickerPopover(event)">取消</button>' +
                  '<button type="button" class="alloc-popover-btn alloc-popover-btn-confirm" onclick="confirmTimePicker(event)">确定</button>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
          '<div class="alloc-sub-hint">非工作时段流入的待跟进任务将自动转入【人工分配】待办池，由电销主管统一进行调度分配。</div>' +
        '</div>' +
      '</div>' +

      '<!-- 基础分配规则 -->' +
      '<div class="alloc-form-row">' +
        '<div class="alloc-form-label label-top-align"><span class="required">*</span>基础分配规则：</div>' +
        '<div class="alloc-form-content">' +
          '<div class="alloc-radio-group">' +
            radioHtml +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="alloc-config-divider" role="separator" aria-label="专项任务与渠道配置"><span>专项任务与渠道配置</span></div>' +

      '<!-- AI 未履约试驾回访任务分配 -->' +
      '<div class="alloc-form-row" style="margin-top:8px;">' +
        '<div class="alloc-form-label label-top-align"><span class="required">*</span>AI未履约试驾回访任务：</div>' +
        '<div class="alloc-form-content">' +
          '<div class="ai-testdrive-assignment-group" role="radiogroup" aria-label="AI未履约试驾回访任务分配方式">' +
            '<label class="ai-testdrive-assignment-option"><input type="radio" name="aiUnfulfilledTestDriveAssignmentMode" value="auto" ' + (currentAllocationConfig.aiUnfulfilledTestDriveAssignmentMode === 'auto' ? 'checked' : '') + ' /><span class="ai-testdrive-assignment-copy"><span class="ai-testdrive-assignment-title">按现有规则自动分配</span><span class="ai-testdrive-assignment-desc">沿用当前在岗坐席、剩余接待量及基础分配规则，任务直接进入对应坐席的试驾排程待办。</span></span></label>' +
            '<label class="ai-testdrive-assignment-option"><input type="radio" name="aiUnfulfilledTestDriveAssignmentMode" value="supervisor" ' + (currentAllocationConfig.aiUnfulfilledTestDriveAssignmentMode === 'supervisor' ? 'checked' : '') + ' /><span class="ai-testdrive-assignment-copy"><span class="ai-testdrive-assignment-title">主管分配</span><span class="ai-testdrive-assignment-desc">任务进入“试驾排程工单”的待主管分配视图，由主管勾选后批量指派给同一坐席。</span></span></label>' +
          '</div>' +
          '<div class="alloc-sub-hint">仅影响保存后新生成的 AI 外呼未履约试驾回访任务；已生成任务保留原分配结果。</div>' +
        '</div>' +
      '</div>' +

      '<!-- R渠道分配 -->' +
      '<div class="alloc-form-row" style="margin-top:20px;margin-bottom:28px;">' +
        '<div class="alloc-form-label label-top-align">R渠道分配：</div>' +
        '<div class="alloc-form-content">' +
          '<div class="alloc-r-channel-card">' +
            '<div class="alloc-r-channel-card-heading"><div class="alloc-r-channel-card-title">R 渠道优先级队列</div><div class="alloc-r-channel-card-desc">配置多个 R 渠道并排序；系统将按从上到下的顺序依次匹配任务。</div></div>' +
            '<div class="alloc-r-channel-card-body">' +
              '<div class="alloc-channel-dropdown-container">' +
              '<div class="alloc-channel-input-box" id="allocChannelBox" onclick="toggleAllocChannelDropdown(event)">' +
                '<div class="alloc-channel-tags-wrap" id="allocChannelTagsWrap"></div>' +
                '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex:0 0 auto;margin-left:6px;">' +
                  '<circle cx="11" cy="11" r="8"></circle>' +
                  '<line x1="21" y1="21" x2="16.65" y2="16.65"></line>' +
                '</svg>' +
              '</div>' +
              '<div class="alloc-channel-dropdown-menu" id="allocChannelMenu" onclick="event.stopPropagation()">' +
                '<div class="alloc-channel-menu-header">' +
                  '<input type="text" class="alloc-channel-search-input" id="allocChannelSearchInput" placeholder="搜索R渠道 (如 R10)..." oninput="filterAllocChannels(this.value)" />' +
                  '<div class="alloc-channel-quick-actions">' +
                    '<button type="button" class="alloc-channel-link-btn" onclick="clearAllocChannels(event)">清空</button>' +
                    '<button type="button" class="alloc-channel-link-btn" onclick="selectAllAllocChannels(event)">全选</button>' +
                  '</div>' +
                '</div>' +
                '<div class="alloc-channel-options-list" id="allocChannelOptionsList"></div>' +
              '</div>' +
              '</div>' +
              '<div class="alloc-r-channel-card-note">首位 R 渠道对应的任务优先分配；可在下拉列表中增删并调整顺序。</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<!-- 保存按钮 -->' +
      '<div class="alloc-form-row" style="margin-bottom:0">' +
        '<div class="alloc-form-label"></div>' +
        '<div class="alloc-form-content">' +
          '<button type="button" class="alloc-btn-save" onclick="saveAllocationConfig()">保 存</button>' +
        '</div>' +
      '</div>' +
    '</div>';

  initTimePickerSelectors();
  renderAllocChannelTags();
  renderAllocChannelOptions();
}

function selectBaseAllocationRule(ruleId) {
  currentAllocationConfig.baseRule = ruleId;
  var radios = document.querySelectorAll('input[name="baseAllocRule"]');
  radios.forEach(function(r) {
    r.checked = (r.value === ruleId);
  });
}

// ==================== 时间选择浮层交互 ====================
function initTimePickerSelectors() {
  var sHour = document.getElementById('allocStartHour');
  var sMin = document.getElementById('allocStartMin');
  var eHour = document.getElementById('allocEndHour');
  var eMin = document.getElementById('allocEndMin');
  if (!sHour || !sMin || !eHour || !eMin) return;

  var hoursHtml = '';
  for (var h = 0; h < 24; h++) {
    var val = (h < 10 ? '0' : '') + h;
    hoursHtml += '<option value="' + val + '">' + val + ' 时</option>';
  }
  var minsHtml = '';
  for (var m = 0; m < 60; m += 5) {
    var valM = (m < 10 ? '0' : '') + m;
    minsHtml += '<option value="' + valM + '">' + valM + ' 分</option>';
  }
  minsHtml += '<option value="59">59 分</option>';

  sHour.innerHTML = hoursHtml;
  eHour.innerHTML = hoursHtml;
  sMin.innerHTML = minsHtml;
  eMin.innerHTML = minsHtml;

  syncTimeSelectorsFromInputs();
}

function syncTimeSelectorsFromInputs() {
  var sVal = document.getElementById('allocWorkTimeStart')?.value || currentAllocationConfig.workTimeStart || '09:00';
  var eVal = document.getElementById('allocWorkTimeEnd')?.value || currentAllocationConfig.workTimeEnd || '20:55';
  
  var sParts = sVal.split(':');
  var eParts = eVal.split(':');
  
  var sHour = document.getElementById('allocStartHour');
  var sMin = document.getElementById('allocStartMin');
  var eHour = document.getElementById('allocEndHour');
  var eMin = document.getElementById('allocEndMin');

  if (sHour && sParts[0]) sHour.value = sParts[0].padStart(2, '0');
  if (sMin && sParts[1]) {
    var sMinuteStr = sParts[1].padStart(2, '0');
    if (!Array.from(sMin.options).some(function(o){ return o.value === sMinuteStr; })) {
      sMin.insertAdjacentHTML('beforeend', '<option value="' + sMinuteStr + '">' + sMinuteStr + ' 分</option>');
    }
    sMin.value = sMinuteStr;
  }
  if (eHour && eParts[0]) eHour.value = eParts[0].padStart(2, '0');
  if (eMin && eParts[1]) {
    var eMinuteStr = eParts[1].padStart(2, '0');
    if (!Array.from(eMin.options).some(function(o){ return o.value === eMinuteStr; })) {
      eMin.insertAdjacentHTML('beforeend', '<option value="' + eMinuteStr + '">' + eMinuteStr + ' 分</option>');
    }
    eMin.value = eMinuteStr;
  }

  updateTimePreviewText();
}

function syncTimePickerFromInputs() {
  syncTimeSelectorsFromInputs();
}

function updateTimePreviewText() {
  var sHour = document.getElementById('allocStartHour')?.value || '09';
  var sMin = document.getElementById('allocStartMin')?.value || '00';
  var eHour = document.getElementById('allocEndHour')?.value || '20';
  var eMin = document.getElementById('allocEndMin')?.value || '55';
  var preview = document.getElementById('allocTimePreview');
  if (preview) {
    preview.textContent = '当前: ' + sHour + ':' + sMin + ' — ' + eHour + ':' + eMin;
  }
}

function updateTimeFromSelectors() {
  var sHour = document.getElementById('allocStartHour')?.value || '09';
  var sMin = document.getElementById('allocStartMin')?.value || '00';
  var eHour = document.getElementById('allocEndHour')?.value || '20';
  var eMin = document.getElementById('allocEndMin')?.value || '55';

  var sInp = document.getElementById('allocWorkTimeStart');
  var eInp = document.getElementById('allocWorkTimeEnd');
  if (sInp) sInp.value = sHour + ':' + sMin;
  if (eInp) eInp.value = eHour + ':' + eMin;

  updateTimePreviewText();
}

function toggleTimePickerPopover(e) {
  if (e) e.stopPropagation();
  var channelMenu = document.getElementById('allocChannelMenu');
  var channelBox = document.getElementById('allocChannelBox');
  if (channelMenu) channelMenu.classList.remove('show');
  if (channelBox) channelBox.classList.remove('active');

  var popover = document.getElementById('allocTimePopover');
  if (!popover) return;
  var isOpen = popover.classList.contains('show');
  if (isOpen) {
    popover.classList.remove('show');
  } else {
    syncTimeSelectorsFromInputs();
    popover.classList.add('show');
  }
}

function closeTimePickerPopover(e) {
  if (e) e.stopPropagation();
  var popover = document.getElementById('allocTimePopover');
  if (popover) popover.classList.remove('show');
}

function applyTimePreset(start, end, e) {
  if (e) e.stopPropagation();
  var sInp = document.getElementById('allocWorkTimeStart');
  var eInp = document.getElementById('allocWorkTimeEnd');
  if (sInp) sInp.value = start;
  if (eInp) eInp.value = end;
  currentAllocationConfig.workTimeStart = start;
  currentAllocationConfig.workTimeEnd = end;
  syncTimeSelectorsFromInputs();
}

function confirmTimePicker(e) {
  if (e) e.stopPropagation();
  updateTimeFromSelectors();
  var sInp = document.getElementById('allocWorkTimeStart');
  var eInp = document.getElementById('allocWorkTimeEnd');
  if (sInp) currentAllocationConfig.workTimeStart = sInp.value;
  if (eInp) currentAllocationConfig.workTimeEnd = eInp.value;
  closeTimePickerPopover();
  showToast('工作时间已设定为 ' + currentAllocationConfig.workTimeStart + ' — ' + currentAllocationConfig.workTimeEnd, true);
}

function validateTimeFormat(input, fallback) {
  if (!input) return;
  var val = (input.value || '').trim();
  var match = val.match(/^([01]?[0-9]|2[0-3]):([0-5]?[0-9])$/);
  if (!match) {
    input.value = fallback;
  } else {
    var h = match[1].padStart(2, '0');
    var m = match[2].padStart(2, '0');
    input.value = h + ':' + m;
  }
  syncTimeSelectorsFromInputs();
}

// ==================== R渠道多选与优先级交互 ====================
function renderAllocChannelTags() {
  var wrap = document.getElementById('allocChannelTagsWrap');
  if (!wrap) return;

  var channels = currentAllocationConfig.selectedChannels || [];
  if (channels.length === 0) {
    wrap.innerHTML = '<span class="alloc-channel-placeholder">请选择R渠道</span>';
    return;
  }

  wrap.innerHTML = channels.map(function(ch, idx) {
    return '<span class="alloc-channel-chip">' +
      '<span class="alloc-channel-chip-index">' + (idx + 1) + '</span>' +
      ch +
      '<span class="alloc-channel-chip-del" onclick="removeAllocChannelTag(\'' + ch + '\', event)" title="移除此优先级渠道">×</span>' +
    '</span>';
  }).join('');
}

function renderAllocChannelOptions(query) {
  var list = document.getElementById('allocChannelOptionsList');
  if (!list) return;

  var q = (query || '').trim().toUpperCase();
  var available = currentAllocationConfig.availableChannels || [];
  var selected = currentAllocationConfig.selectedChannels || [];

  var filtered = available.filter(function(ch) {
    return !q || ch.toUpperCase().indexOf(q) > -1;
  });

  if (filtered.length === 0) {
    list.innerHTML = '<div style="padding:10px 14px;color:#94a3b8;font-size:12px;text-align:center">未找到匹配渠道</div>';
    return;
  }

  list.innerHTML = filtered.map(function(ch) {
    var selIdx = selected.indexOf(ch);
    var isSel = selIdx > -1;
    return '<div class="alloc-channel-option ' + (isSel ? 'selected' : '') + '" onclick="toggleAllocChannel(\'' + ch + '\', event)">' +
      '<div class="alloc-channel-opt-left">' +
        '<span class="alloc-channel-checkbox">' + (isSel ? '✓' : '') + '</span>' +
        '<span>' + ch + '</span>' +
      '</div>' +
      (isSel ? '<span class="alloc-channel-rank-badge">优先级 ' + (selIdx + 1) + '</span>' : '') +
    '</div>';
  }).join('');
}

function toggleAllocChannel(channel, e) {
  if (e) e.stopPropagation();
  var selected = currentAllocationConfig.selectedChannels || [];
  var idx = selected.indexOf(channel);
  if (idx > -1) {
    selected.splice(idx, 1);
  } else {
    selected.push(channel);
  }
  currentAllocationConfig.selectedChannels = selected;
  renderAllocChannelTags();
  var q = document.getElementById('allocChannelSearchInput')?.value || '';
  renderAllocChannelOptions(q);
}

function removeAllocChannelTag(channel, e) {
  if (e) e.stopPropagation();
  var selected = currentAllocationConfig.selectedChannels || [];
  var idx = selected.indexOf(channel);
  if (idx > -1) {
    selected.splice(idx, 1);
    currentAllocationConfig.selectedChannels = selected;
    renderAllocChannelTags();
    var q = document.getElementById('allocChannelSearchInput')?.value || '';
    renderAllocChannelOptions(q);
  }
}

function clearAllocChannels(e) {
  if (e) e.stopPropagation();
  currentAllocationConfig.selectedChannels = [];
  renderAllocChannelTags();
  var q = document.getElementById('allocChannelSearchInput')?.value || '';
  renderAllocChannelOptions(q);
}

function selectAllAllocChannels(e) {
  if (e) e.stopPropagation();
  currentAllocationConfig.selectedChannels = currentAllocationConfig.availableChannels.slice();
  renderAllocChannelTags();
  var q = document.getElementById('allocChannelSearchInput')?.value || '';
  renderAllocChannelOptions(q);
}

function filterAllocChannels(val) {
  renderAllocChannelOptions(val);
}

function toggleAllocChannelDropdown(e) {
  if (e) e.stopPropagation();
  closeTimePickerPopover();

  var menu = document.getElementById('allocChannelMenu');
  var box = document.getElementById('allocChannelBox');
  if (!menu || !box) return;
  var isOpen = menu.classList.contains('show');
  if (isOpen) {
    menu.classList.remove('show');
    box.classList.remove('active');
  } else {
    menu.classList.add('show');
    box.classList.add('active');
    var sInp = document.getElementById('allocChannelSearchInput');
    if (sInp) {
      sInp.value = '';
      renderAllocChannelOptions('');
      setTimeout(function(){ sInp.focus(); }, 50);
    }
  }
}

function saveAllocationConfig() {
  var btn = document.querySelector('.alloc-btn-save');
  if (btn) {
    btn.classList.add('is-saving');
    btn.innerHTML = '<svg style="width:14px;height:14px;margin-right:6px;animation:spin 1s linear infinite;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path></svg>保 存 中...';
  }

  var startVal = document.getElementById('allocWorkTimeStart')?.value.trim() || '09:00';
  var endVal = document.getElementById('allocWorkTimeEnd')?.value.trim() || '20:55';
  currentAllocationConfig.workTimeStart = startVal;
  currentAllocationConfig.workTimeEnd = endVal;
  var checkedRadio = document.querySelector('input[name="baseAllocRule"]:checked');
  if (checkedRadio) {
    currentAllocationConfig.baseRule = checkedRadio.value;
  }
  var checkedAiUnfulfilledMode = document.querySelector('input[name="aiUnfulfilledTestDriveAssignmentMode"]:checked');
  if (checkedAiUnfulfilledMode) {
    currentAllocationConfig.aiUnfulfilledTestDriveAssignmentMode = checkedAiUnfulfilledMode.value;
  }

  setTimeout(function() {
    if (btn) {
      btn.classList.remove('is-saving');
      btn.innerHTML = '保 存';
    }
    showToast('保存成功，分配规则已更新', true);
  }, 350);
}

// 点击页面其他位置自动收起下拉框与浮层
document.addEventListener('click', function(e) {
  var channelContainer = document.querySelector('.alloc-channel-dropdown-container');
  if (channelContainer && !channelContainer.contains(e.target)) {
    var menu = document.getElementById('allocChannelMenu');
    var box = document.getElementById('allocChannelBox');
    if (menu) menu.classList.remove('show');
    if (box) box.classList.remove('active');
  }
  var timeWrap = document.getElementById('allocTimePickerWrap');
  if (timeWrap && !timeWrap.contains(e.target)) {
    var timePopover = document.getElementById('allocTimePopover');
    if (timePopover) timePopover.classList.remove('show');
  }
});

function renderScheduleManagementPage() {
  var page = document.getElementById('scheduleManagementPage');
  var daysInMonth = new Date(currentScheduleYear, currentScheduleMonth, 0).getDate();
  var today = new Date();
  var isCurrentMonth = today.getFullYear() === currentScheduleYear && today.getMonth() + 1 === currentScheduleMonth;
  var dayHeaders = '';
  for (var d = 1; d <= daysInMonth; d++) {
    var isToday = isCurrentMonth && d === today.getDate();
    dayHeaders += '<th style="min-width:52px;text-align:center;padding:8px 4px;font-weight:600;font-size:13px;' + (isToday ? 'background:#e6f7ff;color:#1890ff' : '') + '">' + d + (isToday ? '<div style="font-size:10px">今</div>' : '') + '</th>';
  }
  var seatOptions = seatData.filter(function(s){return s.status !== '离岗'}).map(function(s){return '<option value="' + s.account + '">' + s.account + ' ' + s.name + '</option>'}).join('');
  var shiftLegend = shiftTypes.map(function(s){return '<span style="display:inline-flex;align-items:center;gap:6px;font-size:13px"><span style="width:20px;height:20px;border-radius:4px;background:' + s.color + ';display:inline-block"></span>' + s.name + '(' + s.time + ')</span>'}).join('');
  page.innerHTML = '<div class="page-hero"><div><div class="page-title">排班管理</div><div class="page-desc">管理坐席月度排班表，支持按月份查看、点击日期单元格排班、班次管理和Excel导入导出。</div></div><div class="summary-strip"><div class="summary-card"><div class="summary-label">值班月份</div><div class="summary-value" style="font-size:18px">' + currentScheduleYear + '年' + currentScheduleMonth + '月</div></div><div class="summary-card"><div class="summary-label">应排班天数</div><div class="summary-value">' + daysInMonth + '</div></div><div class="summary-card"><div class="summary-label">早班</div><div class="summary-value" style="color:#1890ff">09:00-18:00</div></div><div class="summary-card"><div class="summary-label">中班</div><div class="summary-value" style="color:#52c41a">12:00-21:00</div></div><div class="summary-card"><div class="summary-label">晚班</div><div class="summary-value" style="color:#722ed1">14:00-23:00</div></div></div></div>' +
    '<div class="filter-row" style="align-items:center"><span class="filter-label">值班月份：</span><input type="month" class="lead-input" style="width:150px" id="scheduleMonthPicker" value="' + currentScheduleYear + '-' + String(currentScheduleMonth).padStart(2,'0') + '" onchange="changeScheduleMonth(this.value)" /><span class="filter-label" style="margin-left:8px">坐席账号：</span><select class="filter-select" id="scheduleSeatFilter" onchange="renderScheduleTable()"><option value="">全部坐席</option>' + seatOptions + '</select><button class="btn-secondary" type="button" style="margin-left:8px" onclick="resetScheduleFilters()">重置</button><div style="flex:1"></div>' +
    '<button class="btn-secondary" style="margin-right:8px" onclick="showToast(\'班次管理弹窗演示\', true)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>班次管理</button>' +
    '<button class="btn-secondary" style="margin-right:8px" onclick="showToast(\'排班模板已导入\', true)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>导入排班</button>' +
    '<button class="btn-secondary" onclick="showToast(\'排班表已导出\', true)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right:4px;vertical-align:middle"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>导出排班</button></div>' +
    '<div style="margin-bottom:12px;display:flex;gap:16px;align-items:center;padding:12px 16px;background:#fafafa;border-radius:8px;flex-wrap:wrap"><span style="font-size:13px;color:#595959">图例：</span>' + shiftLegend + '<span style="display:inline-flex;align-items:center;gap:6px;font-size:13px"><span style="width:20px;height:20px;border-radius:4px;background:#f5f5f5;border:1px solid #d9d9d9;display:inline-block"></span>休息</span><div style="flex:1"></div><span style="font-size:12px;color:#8c8c8c">提示：点击日期单元格可快速切换班次</span></div>' +
    '<div class="card" style="overflow:auto"><table class="data-table" style="min-width:1200px"><thead><tr style="background:#fafafa"><th style="width:50px;text-align:center">序号</th><th style="min-width:100px">坐席账号</th><th style="min-width:100px">姓名</th><th style="min-width:80px;text-align:center">业绩评分</th><th style="min-width:90px;text-align:center">值班月份</th>' + dayHeaders + '</tr></thead><tbody id="scheduleTableBody"></tbody></table></div></div>';
  renderScheduleTable();
}

function renderScheduleTable() {
  var tbody = document.getElementById('scheduleTableBody');
  if (!tbody) return;
  var daysInMonth = new Date(currentScheduleYear, currentScheduleMonth, 0).getDate();
  var seatFilter = document.getElementById('scheduleSeatFilter')?.value || '';
  var seats = seatFilter ? seatData.filter(function(s){return s.account === seatFilter}) : seatData.filter(function(s){return s.status !== '离岗'});
  var today = new Date();
  var isCurrentMonth = today.getFullYear() === currentScheduleYear && today.getMonth() + 1 === currentScheduleMonth;
  tbody.innerHTML = seats.map(function(seat, i) {
    var dayCells = '';
    for (var d = 1; d <= daysInMonth; d++) {
      var shift = (currentScheduleData[seat.account] && currentScheduleData[seat.account][d]) || '休息';
      var isToday = isCurrentMonth && d === today.getDate();
      var shiftInfo = shiftTypes.find(function(s){return s.name === shift});
      var bgColor = shiftInfo ? shiftInfo.color : '#f5f5f5';
      var textColor = shiftInfo ? '#fff' : '#8c8c8c';
      dayCells += '<td style="padding:4px;text-align:center;cursor:pointer' + (isToday ? ';box-shadow:inset 0 0 0 2px #1890ff' : '') + '" onclick="toggleScheduleDay(\'' + seat.account + '\',' + d + ')" title="' + seat.name + ' ' + d + '日 ' + shift + '"><div style="width:44px;height:36px;border-radius:6px;background:' + bgColor + ';color:' + textColor + ';display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;transition:all .2s;margin:0 auto" onmouseover="this.style.transform=\'scale(1.08)\';this.style.boxShadow=\'0 4px 12px rgba(0,0,0,.15)\'" onmouseout="this.style.transform=\'\';this.style.boxShadow=\'\'">' + (shift === '休息' ? '休' : shift.substring(0,1)) + '</div></td>';
    }
    var scoreColor = seat.score >= 90 ? '#52c41a' : seat.score >= 80 ? '#1890ff' : '#faad14';
    return '<tr><td style="text-align:center;color:#8c8c8c">' + (i+1) + '</td><td><strong>' + seat.account + '</strong></td><td>' + seat.name + '</td><td style="text-align:center"><span style="font-weight:600;color:' + scoreColor + '">' + seat.score + '</span></td><td style="text-align:center;color:#8c8c8c;font-size:13px">' + currentScheduleMonth + '月</td>' + dayCells + '</tr>';
  }).join('');
}

function changeScheduleMonth(value) {
  if (!value) return;
  var parts = value.split('-').map(Number);
  currentScheduleYear = parts[0];
  currentScheduleMonth = parts[1];
  currentScheduleData = generateScheduleData(currentScheduleYear, currentScheduleMonth);
  renderScheduleManagementPage();
  showToast('已切换到' + currentScheduleYear + '年' + currentScheduleMonth + '月', true);
}

function resetScheduleFilters() {
  currentScheduleYear = 2026;
  currentScheduleMonth = 9;
  currentScheduleData = generateScheduleData(currentScheduleYear, currentScheduleMonth);
  renderScheduleManagementPage();
  showToast('已重置为 2026 年 9 月及全部坐席', true);
}

function toggleScheduleDay(account, day) {
  var current = (currentScheduleData[account] && currentScheduleData[account][day]) || '休息';
  var allOptions = shiftTypes.map(function(s){return s.name}).concat(['休息']);
  var currentIdx = allOptions.indexOf(current);
  var nextIdx = (currentIdx + 1) % allOptions.length;
  if (!currentScheduleData[account]) currentScheduleData[account] = {};
  currentScheduleData[account][day] = allOptions[nextIdx];
  renderScheduleTable();
}

registerUiActionCallback('scheduling-tab-switch', function(tab) {
  switchSchedulingTab(tab);
});

// 坐席维护字段以运营确认的“编辑坐席”表单为准。
(function () {
  const renderSeatManagementPageBase = renderSeatManagementPage;

  function seatModalMarkup() {
    return '<div class="modal-card" style="width:680px"><div class="modal-header"><div class="modal-title" id="seatModalTitle">新增坐席</div><button class="modal-close" onclick="closeSeatModal()">×</button></div><div class="modal-body"><div style="display:grid;grid-template-columns:1fr 1fr;gap:16px 20px"><div class="form-group"><label class="form-label">坐席账号</label><input class="form-input" id="seatFormAccount" placeholder="请输入坐席账号" /></div><div class="form-group"><label class="form-label">坐席名称</label><input class="form-input" id="seatFormName" placeholder="请输入坐席名称" /></div><div class="form-group"><label class="form-label"><span style="color:#ff4d4f">*</span> 技能值</label><select class="form-select" id="seatFormSkillValue"><option value="">请选择技能值</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option></select><div class="form-hint">数值越大，技能值越大</div></div><div class="form-group"><label class="form-label"><span style="color:#ff4d4f">*</span> 业绩评分</label><input class="form-input" id="seatFormScore" type="number" min="1" max="100" step="1" placeholder="输入值，正整数" /><div class="form-hint">正整数，1-100分。</div></div><div class="form-group"><label class="form-label"><span style="color:#ff4d4f">*</span> 当日任务最大接收量</label><input class="form-input" id="seatFormDailyMax" type="number" min="1" step="1" placeholder="输入值，正整数" /><div class="form-hint">包含当天新增任务量＋继续跟进任务量</div></div><div class="form-group"><label class="form-label"><span style="color:#ff4d4f">*</span> 当日新任务最小接收量</label><input class="form-input" id="seatFormDailyMin" type="number" min="1" step="1" placeholder="输入值，正整数" /><div class="form-hint">坐席保底接待新增任务量</div></div><div class="form-group"><label class="form-label">企微员工号</label><input class="form-input" id="seatFormWechatId" placeholder="请输入企微员工号" /></div><div class="form-group"><label class="form-label"><span style="color:#ff4d4f">*</span> 所属团队</label><select class="form-select" id="seatFormTeam"><option value="">请选择所属团队</option><option value="电销一组">电销一组</option><option value="电销二组">电销二组</option><option value="电销三组">电销三组</option></select></div><div class="form-group" style="grid-column:1 / -1"><label class="form-label"><span style="color:#ff4d4f">*</span> 状态</label><select class="form-select" id="seatFormStatus"><option value="在岗">在岗</option><option value="休息">休息</option><option value="离岗">离岗</option></select></div></div></div><div class="modal-footer"><button class="btn-secondary" onclick="closeSeatModal()">取消</button><button class="btn-primary" onclick="saveSeat()">保存</button></div></div>';
  }

  function setSeatForm(seat) {
    document.getElementById('seatFormAccount').value = seat?.account || '';
    document.getElementById('seatFormName').value = seat?.name || '';
    document.getElementById('seatFormSkillValue').value = seat?.skillValue || (seat?.skillLevel === '高级' ? '5' : seat?.skillLevel === '中级' ? '3' : seat?.skillLevel === '初级' ? '1' : '');
    document.getElementById('seatFormScore').value = seat?.score || '';
    document.getElementById('seatFormDailyMax').value = seat?.dailyMax || '';
    document.getElementById('seatFormDailyMin').value = seat?.dailyMin || '';
    document.getElementById('seatFormWechatId').value = seat ? (seat.wechatEmployeeId || ('WX' + seat.account)) : '';
    document.getElementById('seatFormTeam').value = seat?.team || '';
    document.getElementById('seatFormStatus').value = (seat?.status === '离岗' || seat?.status === '停用') ? '离岗' : '在岗';
  }

  function setSeatFormMode(isEditing) {
    const modal = document.getElementById('seatModal');
    if (!modal) return;
    modal.dataset.mode = isEditing ? 'edit' : 'create';
    ['seatFormAccount', 'seatFormName', 'seatFormWechatId'].forEach(function (id) {
      const field = document.getElementById(id);
      if (!field) return;
      field.readOnly = isEditing;
      field.classList.toggle('is-autofill-readonly', isEditing);
      const group = field.closest('.form-group');
      let hint = group.querySelector('.seat-autofill-hint');
      if (isEditing && !hint) {
        hint = document.createElement('div');
        hint.className = 'form-hint form-autofill-hint seat-autofill-hint';
        hint.textContent = '由坐席基础资料自动回填，暂不支持修改。';
        group.appendChild(hint);
      }
      if (!isEditing) hint?.remove();
    });
    const skill = document.getElementById('seatFormSkillValue');
    if (skill && skill.options.length < 11) {
      for (let value = 6; value <= 10; value += 1) skill.insertAdjacentHTML('beforeend', '<option value="' + value + '">' + value + '</option>');
    }
    if (skill) skill.closest('.form-group').querySelector('.form-hint').textContent = '技能值范围为 1–10，数值越高代表可承接的业务复杂度越高。';
    const score = document.getElementById('seatFormScore');
    const dailyMax = document.getElementById('seatFormDailyMax');
    const dailyMin = document.getElementById('seatFormDailyMin');
    [score, dailyMax, dailyMin].forEach(function (field) {
      if (!field) return;
      field.type = 'text';
      field.inputMode = 'numeric';
      field.removeAttribute('max');
      field.oninput = function () { this.value = this.value.replace(/\D/g, ''); };
    });
    if (score) score.closest('.form-group').querySelector('.form-hint').textContent = '仅支持正整数；未填写时默认按 100 分计算。';
    if (dailyMax) dailyMax.closest('.form-group').querySelector('.form-hint').textContent = '当天可接收的任务总量，包含新增任务及继续跟进任务。';
    if (dailyMin) dailyMin.closest('.form-group').querySelector('.form-hint').textContent = '当天需保障接收的新增任务下限。';
    const team = document.getElementById('seatFormTeam');
    if (team) team.closest('.form-group').querySelector('.form-label').innerHTML = '<span style="color:#ff4d4f">*</span> 所属团队';
  }

  renderSeatManagementPage = function () {
    renderSeatManagementPageBase();
    const overlay = document.getElementById('seatModal');
    if (overlay) {
      overlay.innerHTML = seatModalMarkup();
      overlay.querySelector('.modal-card')?.classList.replace('modal-card', 'modal');
      overlay.querySelector('.modal')?.classList.add('seat-form-modal');
    }
    if (!document.getElementById('seat-form-modal-css')) document.head.insertAdjacentHTML('beforeend', '<style id="seat-form-modal-css">#seatModal .seat-form-modal{width:min(680px,calc(100vw - 48px));max-height:86vh;display:flex;flex-direction:column;overflow:hidden;border-radius:12px;background:#fff}#seatModal .seat-form-modal .modal-body{flex:1;overflow-y:auto;padding:22px 28px}#seatModal .seat-form-modal .modal-body>div{grid-template-columns:1fr!important;gap:14px!important}#seatModal .seat-form-modal .form-group{margin:0}#seatModal .seat-form-modal .modal-footer{flex:0 0 auto;padding:14px 28px;background:#fff}#seatModal .seat-form-modal .form-hint{line-height:1.5}#seatModal .seat-form-modal .form-input,#seatModal .seat-form-modal .form-select{width:100%!important;box-sizing:border-box!important;height:38px!important;padding:0 12px!important;border:1px solid #d9d9d9!important;border-radius:6px!important;font-size:13px!important;color:#1e293b!important;background-color:#fff!important;outline:none!important}#seatModal .seat-form-modal .form-input.is-autofill-readonly,#seatModal .seat-form-modal .form-select.is-autofill-readonly{background-color:#f6f8fb!important;border-color:#dce4ef!important;color:#64748b!important}</style>');
    document.getElementById('seatFormEnabled')?.addEventListener('change', function () { setEnabled(this.checked); });
  };

  var candidatePool = [
    { account: '1005649', name: '张伟' },
    { account: '1005650', name: '李娜' },
    { account: '1005651', name: '王强' },
    { account: '1005652', name: '陈杰' },
    { account: '1005653', name: '刘洋' },
    { account: '1005654', name: '黄勇' },
    { account: '1005655', name: '周明' }
  ];
  var selectedNewCandidateAccounts = [];

  window.closeNewSeatModal = function () {
    const modal = document.getElementById('newSeatModal');
    if (modal) modal.remove();
  };

  window.toggleAllLeftCandidates = function (mainCheckbox) {
    const checkboxes = document.querySelectorAll('.transfer-left-cb');
    checkboxes.forEach(function (cb) { cb.checked = mainCheckbox.checked; });
  };

  window.transferLeftToRight = function () {
    const checked = document.querySelectorAll('.transfer-left-cb:checked');
    if (!checked.length) return;
    checked.forEach(function (cb) {
      const acc = cb.value;
      if (!selectedNewCandidateAccounts.includes(acc)) {
        selectedNewCandidateAccounts.push(acc);
      }
    });
    window.renderTransferPanels();
  };

  window.removeFromRightPanel = function (acc) {
    selectedNewCandidateAccounts = selectedNewCandidateAccounts.filter(function (a) { return a !== acc; });
    window.renderTransferPanels();
  };

  window.renderTransferPanels = function () {
    const leftSearch = (document.getElementById('transferLeftSearch')?.value || '').trim().toLowerCase();
    const rightSearch = (document.getElementById('transferRightSearch')?.value || '').trim().toLowerCase();

    const available = candidatePool.filter(function (c) {
      const matchAcc = !selectedNewCandidateAccounts.includes(c.account);
      const matchText = !leftSearch || (c.account + ' ' + c.name).toLowerCase().includes(leftSearch);
      return matchAcc && matchText;
    });

    const selectedList = candidatePool.filter(function (c) {
      const isSel = selectedNewCandidateAccounts.includes(c.account);
      const matchText = !rightSearch || (c.account + ' ' + c.name).toLowerCase().includes(rightSearch);
      return isSel && matchText;
    });

    const leftContainer = document.getElementById('transferLeftList');
    const rightContainer = document.getElementById('transferRightList');
    const leftCountEl = document.getElementById('transferLeftCount');
    const rightCountEl = document.getElementById('transferRightCount');

    if (leftCountEl) leftCountEl.textContent = available.length;
    if (rightCountEl) rightCountEl.textContent = selectedNewCandidateAccounts.length;

    if (leftContainer) {
      if (!available.length) {
        leftContainer.innerHTML = '<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#cbd5e1;font-size:12px"><svg style="width:36px;height:36px;margin-bottom:6px;color:#cbd5e1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-4l-2 3h-4l-2-3H4"/></svg><div>暂无数据</div></div>';
      } else {
        leftContainer.innerHTML = available.map(function (c) {
          return '<label style="display:flex;align-items:center;gap:10px;padding:8px 14px;cursor:pointer;font-size:13px;color:#334155;transition:background .15s" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'transparent\'"><input type="checkbox" class="transfer-left-cb" value="' + c.account + '"> <span>' + c.account + ' (' + c.name + ')</span></label>';
        }).join('');
      }
    }

    if (rightContainer) {
      if (!selectedList.length) {
        rightContainer.innerHTML = '<div style="height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#cbd5e1;font-size:12px"><svg style="width:36px;height:36px;margin-bottom:6px;color:#cbd5e1" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 13V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7m16 0v5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-5m16 0h-4l-2 3h-4l-2-3H4"/></svg><div>暂无数据</div></div>';
      } else {
        rightContainer.innerHTML = selectedList.map(function (c) {
          return '<div style="display:flex;align-items:center;justify-content:space-between;padding:8px 14px;font-size:13px;color:#334155;transition:background .15s" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'transparent\'"><span>' + c.account + ' (' + c.name + ')</span><button type="button" onclick="removeFromRightPanel(\'' + c.account + '\')" style="border:none;background:none;color:#94a3b8;cursor:pointer;font-size:16px">×</button></div>';
        }).join('');
      }
    }
  };

  openSeatModal = function () {
    selectedNewCandidateAccounts = [];
    closeNewSeatModal();
    document.body.insertAdjacentHTML('beforeend',
      '<div class="modal-overlay show" id="newSeatModal">' +
        '<div class="modal new-seat-modal" style="width:min(680px,calc(100vw - 40px));padding:24px 32px;border-radius:12px;background:#fff;max-height:90vh;display:flex;flex-direction:column">' +
          '<div class="modal-header" style="border-bottom:none;padding:0 0 16px 0;display:flex;align-items:center;justify-content:space-between">' +
            '<div class="modal-title" style="font-size:18px;font-weight:700;color:#1e293b">新增坐席</div>' +
            '<button class="modal-close" onclick="closeNewSeatModal()" style="font-size:20px;color:#94a3b8;border:none;background:none;cursor:pointer">×</button>' +
          '</div>' +
          '<div class="modal-body" style="flex:1;overflow-y:auto;padding:0 0 20px 0">' +
            '<div style="display:flex;align-items:center;font-size:15px;font-weight:700;color:#1e293b;margin-bottom:14px"><span style="display:inline-block;width:3px;height:14px;background:#1677ff;border-radius:2px;margin-right:8px"></span>1. 添加坐席账号</div>' +
            '<div class="transfer-box-wrap" style="display:flex;align-items:center;gap:12px;margin-bottom:24px">' +
              '<div class="transfer-panel" style="flex:1;min-width:0;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;background:#fff">' +
                '<div class="transfer-panel-header" style="padding:10px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;font-size:13px;color:#334155">' +
                  '<label style="display:flex;align-items:center;gap:6px;cursor:pointer;margin:0"><input type="checkbox" id="transferLeftSelectAll" onchange="toggleAllLeftCandidates(this)"> <span><span id="transferLeftCount">0</span> 项</span></label>' +
                  '<span style="font-weight:600">可选坐席账号</span>' +
                '</div>' +
                '<div style="padding:8px 12px;border-bottom:1px solid #f1f5f9">' +
                  '<input type="text" id="transferLeftSearch" class="form-input" placeholder="请输入搜索内容" oninput="renderTransferPanels()" style="width:100%;height:32px;padding:0 12px;font-size:12px;border-radius:6px;border:1px solid #cbd5e1;box-sizing:border-box">' +
                '</div>' +
                '<div id="transferLeftList" style="height:200px;overflow-y:auto;padding:4px 0"></div>' +
              '</div>' +
              '<button type="button" class="transfer-arrow-btn" onclick="transferLeftToRight()" style="width:36px;height:36px;border-radius:6px;border:1px solid #cbd5e1;background:#f8fafc;color:#64748b;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center">></button>' +
              '<div class="transfer-panel" style="flex:1;min-width:0;border:1px solid #cbd5e1;border-radius:8px;overflow:hidden;background:#fff">' +
                '<div class="transfer-panel-header" style="padding:10px 14px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between;font-size:13px;color:#334155">' +
                  '<span style="font-size:13px;color:#334155"><span id="transferRightCount">0</span> 项</span>' +
                  '<span style="font-weight:600">已选坐席账号</span>' +
                '</div>' +
                '<div style="padding:8px 12px;border-bottom:1px solid #f1f5f9">' +
                  '<input type="text" id="transferRightSearch" class="form-input" placeholder="请输入搜索内容" oninput="renderTransferPanels()" style="width:100%;height:32px;padding:0 12px;font-size:12px;border-radius:6px;border:1px solid #cbd5e1;box-sizing:border-box">' +
                '</div>' +
                '<div id="transferRightList" style="height:200px;overflow-y:auto;padding:4px 0"></div>' +
              '</div>' +
            '</div>' +
            '<div style="display:flex;align-items:center;font-size:15px;font-weight:700;color:#1e293b;margin-bottom:18px"><span style="display:inline-block;width:3px;height:14px;background:#1677ff;border-radius:2px;margin-right:8px"></span>2. 初始化账号配置</div>' +
            '<div class="seat-batch-form">' +
              '<div class="seat-batch-form-row"><label class="seat-batch-form-label"><span class="seat-batch-required">*</span>技能值：</label><div class="seat-batch-form-content"><select class="form-select" id="newSeatSkill" style="width:100%;height:36px"><option value="">请选择技能值</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option></select><div class="seat-batch-hint">数值越大，技能值越大</div></div></div>' +
              '<div class="seat-batch-form-row"><label class="seat-batch-form-label"><span class="seat-batch-required">*</span>业绩评分：</label><div class="seat-batch-form-content"><input class="form-input" id="newSeatScore" inputmode="numeric" placeholder="输入值，正整数" oninput="this.value=this.value.replace(/\\D/g,\'\')" style="width:100%;height:36px"><div class="seat-batch-hint">说明：正整数（1-100）。</div></div></div>' +
              '<div class="seat-batch-form-row"><label class="seat-batch-form-label"><span class="seat-batch-required">*</span>当日任务最大接收量：</label><div class="seat-batch-form-content"><input class="form-input" id="newSeatDailyMax" inputmode="numeric" placeholder="输入值，正整数" oninput="this.value=this.value.replace(/\\D/g,\'\')" style="width:100%;height:36px"><div class="seat-batch-hint">说明：包含当天新增任务量+继续跟进任务量</div></div></div>' +
              '<div class="seat-batch-form-row"><label class="seat-batch-form-label"><span class="seat-batch-required">*</span>当日新任务最小接收量：</label><div class="seat-batch-form-content"><input class="form-input" id="newSeatDailyMin" inputmode="numeric" placeholder="输入值，正整数" oninput="this.value=this.value.replace(/\\D/g,\'\')" style="width:100%;height:36px"><div class="seat-batch-hint">说明：坐席保底接待新增任务量</div></div></div>' +
              '<div class="seat-batch-form-row"><label class="seat-batch-form-label"><span class="seat-batch-required">*</span>所属团队：</label><div class="seat-batch-form-content"><select class="form-select" id="newSeatTeam" style="width:100%;height:36px"><option value="">请选择所属团队</option><option value="电销一组">电销一组</option><option value="电销二组">电销二组</option><option value="电销三组">电销三组</option></select></div></div>' +
              '<div class="seat-batch-form-row"><label class="seat-batch-form-label"><span class="seat-batch-required">*</span>状态：</label><div class="seat-batch-form-content"><select class="form-select" id="newSeatStatus" style="width:100%;height:36px"><option value="在岗">在岗</option><option value="休息">休息</option><option value="离岗">离岗</option></select></div></div>' +
            '</div>' +
          '</div>' +
          '<div class="modal-footer" style="border-top:none;padding:16px 0 0 0;display:flex;justify-content:flex-end;gap:12px">' +
            '<button class="btn-secondary" onclick="closeNewSeatModal()" style="min-width:72px;height:36px;border-radius:6px">取消</button>' +
            '<button class="btn-primary" onclick="saveNewSeats()" style="min-width:72px;height:36px;border-radius:6px;background:#2563eb;color:#fff;border:none">保存</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
    renderTransferPanels();
  };

  window.saveNewSeats = function () {
    if (!selectedNewCandidateAccounts.length) {
      showToast('请在“添加坐席账号”中选择至少一个坐席账号', false);
      return;
    }
    const team = document.getElementById('newSeatTeam').value;
    const dailyMax = Number(document.getElementById('newSeatDailyMax').value);
    const dailyMin = Number(document.getElementById('newSeatDailyMin').value);
    const scoreVal = document.getElementById('newSeatScore').value;
    const score = Number(scoreVal);
    const skillValue = document.getElementById('newSeatSkill').value;
    const status = document.getElementById('newSeatStatus').value || '在岗';

    if (!skillValue || scoreVal === '' || !team || !Number.isInteger(dailyMax) || dailyMax < 1 || !Number.isInteger(dailyMin) || dailyMin < 1 || !Number.isInteger(score) || score < 1 || score > 100) {
      showToast('请完整填写必填项；业绩评分须为1-100正整数，任务接收量须为正整数', false);
      return;
    }
    if (dailyMin > dailyMax) {
      showToast('当日新任务最小接收量不能大于最大接收量', false);
      return;
    }

    let createdCount = 0;
    selectedNewCandidateAccounts.forEach(function (acc) {
      const cand = candidatePool.find(function (c) { return c.account === acc; });
      const name = cand ? cand.name : '坐席' + acc;
      const maxId = Math.max.apply(null, seatData.map(function (item) { return item.id; }));
      const skillLevel = skillValue >= 4 ? '高级' : skillValue >= 2 ? '中级' : '初级';
      seatData.push({
        id: maxId + 1,
        account: acc,
        name: name,
        team: team,
        skillValue: skillValue,
        skillLevel: skillLevel,
        score: score,
        dailyMax: dailyMax,
        dailyMin: dailyMin,
        wechatEmployeeId: 'WX' + acc,
        e3sPlusAccount: 'E3S_' + acc,
        status: status,
        phone: '-',
        createTime: new Date().toISOString().split('T')[0]
      });
      createdCount++;
    });

    showToast('已成功新建 ' + createdCount + ' 位坐席', true);
    closeNewSeatModal();
    window.renderSeatTable(seatData);
  };

  editSeat = function (id) {
    const seat = seatData.find(function (item) { return item.id === id; });
    if (!seat) return;
    editingSeatId = id;
    document.getElementById('seatModalTitle').textContent = '编辑坐席';
    setSeatForm(seat);
    setSeatFormMode(true);
    document.getElementById('seatModal').classList.add('show');
  };

  saveSeat = function () {
    const account = document.getElementById('seatFormAccount').value.trim();
    const name = document.getElementById('seatFormName').value.trim();
    const team = document.getElementById('seatFormTeam').value;
    const dailyMax = Number(document.getElementById('seatFormDailyMax').value);
    const dailyMin = Number(document.getElementById('seatFormDailyMin').value);
    const scoreValue = document.getElementById('seatFormScore').value;
    const score = scoreValue === '' ? 100 : Number(scoreValue);
    if (!account || !name || !team || !Number.isInteger(dailyMax) || dailyMax < 1 || !Number.isInteger(dailyMin) || dailyMin < 1) {
      showToast('请完整填写必填项；任务接收量须为正整数', false); return;
    }
    if (dailyMin > dailyMax) { showToast('当日新任务最小接收量不能大于最大接收量', false); return; }
    if (!Number.isInteger(score) || score < 1) { showToast('业绩评分须为正整数', false); return; }
    const skillValue = document.getElementById('seatFormSkillValue').value;
    const skillLevel = skillValue >= 4 ? '高级' : skillValue >= 2 ? '中级' : '初级';
    const fields = { account: account, name: name, team: team, skillValue: skillValue, skillLevel: skillLevel, score: score, dailyMax: dailyMax, dailyMin: dailyMin, wechatEmployeeId: document.getElementById('seatFormWechatId').value.trim(), status: document.getElementById('seatFormStatus').value };
    if (editingSeatId) {
      const seat = seatData.find(function (item) { return item.id === editingSeatId; });
      if (seat) Object.assign(seat, fields);
      showToast('坐席信息已更新', true);
    } else {
      const maxId = Math.max.apply(null, seatData.map(function (item) { return item.id; }));
      seatData.push(Object.assign({ id: maxId + 1, phone: '-', createTime: new Date().toISOString().split('T')[0] }, fields));
      showToast('坐席已添加', true);
    }
    closeSeatModal();
    renderSeatManagementPage();
  };
})();

// 坐席管理列表：查询维度与可维护字段保持一致，避免展示无关信息。
(function () {
  let selectedSeatIds = new Set();

  function skillValueOf(seat) {
    if (seat.skillValue !== undefined && seat.skillValue !== '') return Number(seat.skillValue);
    return seat.skillLevel === '高级' ? 5 : seat.skillLevel === '中级' ? 3 : 1;
  }

  function skillLevelOf(value) {
    return Number(value) >= 4 ? '高级' : Number(value) >= 2 ? '中级' : '初级';
  }

  function statusTag(seat) {
    const isActive = seat.status === '在岗' || seat.status === '启用';
    const statusText = isActive ? '启用' : (seat.status === '休息' ? '休息' : '停用');
    const cls = isActive ? 'col-status-on' : 'col-status-off';
    return '<span class="' + cls + '">● ' + statusText + '</span>';
  }

  window.renderSeatTable = function (data) {
    const tbody = document.getElementById('seatTableBody');
    if (!tbody) return;
    tbody.innerHTML = data.map(function (seat, index) {
      const scoreColor = seat.score >= 90 ? '#22a06b' : seat.score >= 80 ? '#1677ff' : '#d97706';
      const skillValue = skillValueOf(seat);
      const e3s = seat.e3sPlusAccount ? seat.e3sPlusAccount : '<span style="color:#94a3b8">未映射</span>';
      const wechat = seat.wechatEmployeeId || ('WX' + seat.account);
      const checked = selectedSeatIds.has(seat.id) ? ' checked' : '';
      const isActive = seat.status === '在岗' || seat.status === '启用';
      const toggleText = isActive ? '停用' : '启用';
      const toggleClass = isActive ? 'disable' : 'enable';
      return '<tr><td class="col-num"><input type="checkbox" aria-label="选择' + seat.name + '" value="' + seat.id + '"' + checked + ' onchange="toggleSeatSelection(this)"></td><td><strong>' + seat.name + '</strong><span class="seat-identity-sub">坐席账号：' + seat.account + '</span></td><td>' + e3s + '</td><td>' + wechat + '</td><td>' + seat.team + '</td><td><span class="seat-skill-value">' + skillValue + '</span><span class="seat-identity-sub">' + skillLevelOf(skillValue) + '</span></td><td>' + (seat.dailyMax || '—') + ' / ' + (seat.dailyMin || '—') + '<span class="seat-identity-sub">最大 / 新任务最小</span></td><td><span style="font-weight:700;color:' + scoreColor + '">' + seat.score + '</span></td><td>' + statusTag(seat) + '</td><td><div class="action-btns"><button class="action-btn edit" type="button" onclick="editSeat(' + seat.id + ')">编辑</button><button class="action-btn toggle-btn ' + toggleClass + '" type="button" onclick="toggleSeatStatus(' + seat.id + ')">' + toggleText + '</button><button class="action-btn delete" type="button" onclick="deleteSeat(' + seat.id + ')">删除</button></div></td></tr>';
    }).join('');
    const selectAll = document.getElementById('seatSelectAll');
    if (selectAll) selectAll.checked = data.length > 0 && data.every(function (seat) { return selectedSeatIds.has(seat.id); });
    const count = document.getElementById('seatSelectedCount');
    if (count) count.textContent = selectedSeatIds.size ? '已选 ' + selectedSeatIds.size + ' 人' : '';
  };

  window.filterSeatTable = function () {
    const keyword = (document.getElementById('seatKeywordFilter')?.value || '').trim().toLowerCase();
    const status = document.getElementById('seatStatusFilter')?.value || '';
    const skillValue = document.getElementById('seatSkillFilter')?.value || '';
    const team = document.getElementById('seatTeamFilter')?.value || '';
    const filtered = seatData.filter(function (seat) {
      const identity = [seat.account, seat.name, seat.e3sPlusAccount || '', seat.wechatEmployeeId || ('WX' + seat.account)].join(' ').toLowerCase();
      return (!keyword || identity.includes(keyword)) && (!status || seat.status === status) && (!skillValue || String(skillValueOf(seat)) === skillValue) && (!team || seat.team === team);
    });
    window.renderSeatTable(filtered);
  };

  window.resetSeatFilter = function () {
    ['seatKeywordFilter', 'seatStatusFilter', 'seatSkillFilter', 'seatTeamFilter'].forEach(function (id) {
      const field = document.getElementById(id);
      if (field) field.value = '';
    });
    selectedSeatIds = new Set();
    window.renderSeatTable(seatData);
  };

  window.toggleSeatSelection = function (checkbox) {
    const id = Number(checkbox.value);
    if (checkbox.checked) selectedSeatIds.add(id); else selectedSeatIds.delete(id);
    window.filterSeatTable();
  };

  window.toggleAllSeatSelection = function (checkbox) {
    const visible = Array.from(document.querySelectorAll('#seatTableBody input[type="checkbox"]'));
    visible.forEach(function (input) {
      const id = Number(input.value);
      if (checkbox.checked) selectedSeatIds.add(id); else selectedSeatIds.delete(id);
    });
    window.filterSeatTable();
  };

  window.openSeatBatchEditModal = function () {
    if (!selectedSeatIds.size) { showToast('请先勾选需要批量修改的坐席', false); return; }
    document.getElementById('seatBatchModal')?.remove();
    const skillOptions = Array.from({ length: 10 }, function (_, i) { return '<option value="' + (i + 1) + '">' + (i + 1) + '</option>'; }).join('');
    document.body.insertAdjacentHTML('beforeend', '<div class="modal-overlay show" id="seatBatchModal"><div class="modal seat-batch-modal" style="width:min(580px,calc(100vw - 40px));padding:24px 32px"><div class="modal-header" style="border-bottom:none;padding:0 0 16px 0"><div class="modal-title" style="font-size:18px;font-weight:700;color:#1e293b">批量修改坐席</div><button class="modal-close" onclick="closeSeatBatchEditModal()" style="font-size:20px;color:#94a3b8">×</button></div><div class="modal-body" style="padding:10px 0 20px 0"><div class="seat-batch-form"><div class="seat-batch-form-row"><label class="seat-batch-form-label"><span class="seat-batch-required">*</span>技能值：</label><div class="seat-batch-form-content"><select class="form-select" id="seatBatchSkill" style="width:100%;height:36px"><option value="">请选择技能值</option>' + skillOptions + '</select><div class="seat-batch-hint">数值越大，技能值越大</div></div></div><div class="seat-batch-form-row"><label class="seat-batch-form-label"><span class="seat-batch-required">*</span>业绩评分：</label><div class="seat-batch-form-content"><input class="form-input" id="seatBatchScore" inputmode="numeric" placeholder="输入值，正整数" oninput="this.value=this.value.replace(/\\D/g,\'\')" style="width:100%;height:36px"><div class="seat-batch-hint">说明：正整数（1-100）。</div></div></div><div class="seat-batch-form-row"><label class="seat-batch-form-label"><span class="seat-batch-required">*</span>当日任务最大接收量：</label><div class="seat-batch-form-content"><input class="form-input" id="seatBatchDailyMax" inputmode="numeric" placeholder="输入值，正整数" oninput="this.value=this.value.replace(/\\D/g,\'\')" style="width:100%;height:36px"><div class="seat-batch-hint">说明：包含当天新增任务量+继续跟进任务量</div></div></div><div class="seat-batch-form-row"><label class="seat-batch-form-label"><span class="seat-batch-required">*</span>当日新任务最小接收量：</label><div class="seat-batch-form-content"><input class="form-input" id="seatBatchDailyMin" inputmode="numeric" placeholder="输入值，正整数" oninput="this.value=this.value.replace(/\\D/g,\'\')" style="width:100%;height:36px"><div class="seat-batch-hint">说明：坐席保底接待新增任务量</div></div></div><div class="seat-batch-form-row"><label class="seat-batch-form-label"><span class="seat-batch-required">*</span>所属团队：</label><div class="seat-batch-form-content"><select class="form-select" id="seatBatchTeam" style="width:100%;height:36px"><option value="">请选择所属团队</option><option>电销一组</option><option>电销二组</option><option>电销三组</option></select></div></div><div class="seat-batch-form-row"><label class="seat-batch-form-label"><span class="seat-batch-required">*</span>状态：</label><div class="seat-batch-form-content"><select class="form-select" id="seatBatchStatus" style="width:100%;height:36px"><option value="">请选择状态</option><option value="在岗">在岗</option><option value="休息">休息</option><option value="离岗">离岗</option></select></div></div></div></div><div class="modal-footer" style="border-top:none;padding:16px 0 0 0;display:flex;justify-content:flex-end;gap:12px"><button class="btn-secondary" onclick="closeSeatBatchEditModal()" style="min-width:72px;height:36px;border-radius:6px">取消</button><button class="btn-primary" onclick="saveSeatBatchEdit()" style="min-width:72px;height:36px;border-radius:6px;background:#2563eb;color:#fff;border:none">保存</button></div></div></div>');
  };

  window.closeSeatBatchEditModal = function () { document.getElementById('seatBatchModal')?.remove(); };

  window.saveSeatBatchEdit = function () {
    const team = document.getElementById('seatBatchTeam').value;
    const skillValue = document.getElementById('seatBatchSkill').value;
    const score = document.getElementById('seatBatchScore')?.value;
    const maxValue = document.getElementById('seatBatchDailyMax').value;
    const minValue = document.getElementById('seatBatchDailyMin').value;
    const status = document.getElementById('seatBatchStatus')?.value || '';

    if (score && (!/^[1-9]\d*$/.test(score) || Number(score) > 100)) { showToast('业绩评分请输入1-100的正整数', false); return; }
    if ((maxValue && !/^[1-9]\d*$/.test(maxValue)) || (minValue && !/^[1-9]\d*$/.test(minValue))) { showToast('任务接收量仅支持正整数', false); return; }
    for (const seat of seatData.filter(function (item) { return selectedSeatIds.has(item.id); })) {
      const nextMax = maxValue ? Number(maxValue) : seat.dailyMax;
      const nextMin = minValue ? Number(minValue) : seat.dailyMin;
      if (nextMax && nextMin && nextMin > nextMax) { showToast('新任务最小接收量不能大于最大接收量', false); return; }
    }
    seatData.forEach(function (seat) {
      if (!selectedSeatIds.has(seat.id)) return;
      if (team) seat.team = team;
      if (skillValue) { seat.skillValue = skillValue; seat.skillLevel = skillLevelOf(skillValue); }
      if (score) seat.score = Number(score);
      if (maxValue) seat.dailyMax = Number(maxValue);
      if (minValue) seat.dailyMin = Number(minValue);
      if (status) seat.status = status;
    });
    closeSeatBatchEditModal();
    showToast('已批量更新 ' + selectedSeatIds.size + ' 名坐席', true);
    window.filterSeatTable();
  };

  window.openE3sPlusMappingModal = function () {
    document.getElementById('e3sPlusMappingDrawerOverlay')?.remove();

    window.renderE3sMappingRows = function (filteredSeats) {
      const tbody = document.getElementById('e3sMappingTableBody');
      if (!tbody) return;
      if (!filteredSeats || !filteredSeats.length) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:32px;color:#94a3b8">暂无匹配的坐席数据</td></tr>';
        return;
      }
      tbody.innerHTML = filteredSeats.map(function (seat, index) {
        return '<tr>' +
          '<td style="text-align:center;color:#64748b;font-size:13px;padding:10px 12px">' + (index + 1) + '</td>' +
          '<td style="padding:10px 12px"><strong style="color:#1e293b;font-size:13px">' + seat.account + '</strong></td>' +
          '<td style="color:#334155;font-size:13px;padding:10px 12px">' + seat.name + '</td>' +
          '<td style="padding:8px 12px"><input class="form-input" data-e3s-seat="' + seat.id + '" value="' + (seat.e3sPlusAccount || '') + '" placeholder="请输入" oninput="const s=seatData.find(function(item){return item.id===' + seat.id + ';});if(s)s.e3sPlusAccount=this.value.trim()" style="width:100%;height:34px;padding:0 12px;border:1px solid #cbd5e1;border-radius:6px;box-sizing:border-box;font-size:13px"></td>' +
          '</tr>';
      }).join('');
    };

    window.filterE3sMappingTable = function () {
      const selectedAcc = document.getElementById('e3sSearchAccount')?.value || '';
      if (!selectedAcc) {
        window.renderE3sMappingRows(seatData);
      } else {
        const filtered = seatData.filter(function (s) { return s.account === selectedAcc || s.name === selectedAcc; });
        window.renderE3sMappingRows(filtered);
      }
    };

    window.resetE3sMappingFilter = function () {
      const sel = document.getElementById('e3sSearchAccount');
      if (sel) sel.value = '';
      window.renderE3sMappingRows(seatData);
    };

    const accountOptions = seatData.map(function (s) {
      return '<option value="' + s.account + '">' + s.account + ' (' + s.name + ')</option>';
    }).join('');

    if (!document.getElementById('e3s-mapping-table-css')) {
      document.head.insertAdjacentHTML('beforeend',
        '<style id="e3s-mapping-table-css">' +
          '#e3sPlusMappingDrawer .e3s-mapping-table{table-layout:fixed!important;width:100%!important;border-collapse:collapse}' +
          '#e3sPlusMappingDrawer .e3s-mapping-table th,#e3sPlusMappingDrawer .e3s-mapping-table td{box-sizing:border-box!important}' +
          '#e3sPlusMappingDrawer .e3s-mapping-table th:nth-child(1),#e3sPlusMappingDrawer .e3s-mapping-table td:nth-child(1){width:65px!important;text-align:center!important}' +
          '#e3sPlusMappingDrawer .e3s-mapping-table th:nth-child(2),#e3sPlusMappingDrawer .e3s-mapping-table td:nth-child(2){width:140px!important;text-align:left!important}' +
          '#e3sPlusMappingDrawer .e3s-mapping-table th:nth-child(3),#e3sPlusMappingDrawer .e3s-mapping-table td:nth-child(3){width:130px!important;text-align:left!important}' +
          '#e3sPlusMappingDrawer .e3s-mapping-table th:nth-child(4),#e3sPlusMappingDrawer .e3s-mapping-table td:nth-child(4){width:auto!important;text-align:left!important}' +
        '</style>'
      );
    }

    document.body.insertAdjacentHTML('beforeend',
      '<div id="e3sPlusMappingDrawerOverlay" onclick="if(event.target===this)closeE3sPlusMappingModal()">' +
        '<div id="e3sPlusMappingDrawer">' +
          '<div style="padding:20px 24px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;justify-content:space-between">' +
            '<div>' +
              '<div style="font-size:18px;font-weight:700;color:#1e293b">e3sPlus 帐号映射</div>' +
              '<div style="font-size:12px;color:#64748b;margin-top:4px">维护坐席与 e3sPlus 帐号的对应关系，保存后用于相关数据匹配。</div>' +
            '</div>' +
            '<button type="button" onclick="closeE3sPlusMappingModal()" style="font-size:22px;color:#94a3b8;border:none;background:none;cursor:pointer;padding:0 4px;line-height:1">×</button>' +
          '</div>' +
          '<div style="flex:1;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;flex-wrap:wrap;gap:12px">' +
              '<div style="display:flex;align-items:center;gap:8px">' +
                '<span style="font-size:14px;color:#334155;font-weight:500;white-space:nowrap">帐号名称：</span>' +
                '<select class="form-select" id="e3sSearchAccount" style="width:200px;height:36px;border-radius:6px;border:1px solid #cbd5e1;padding:0 10px;font-size:13px;color:#334155">' +
                  '<option value="">请选择</option>' + accountOptions +
                '</select>' +
              '</div>' +
              '<div style="display:flex;align-items:center;gap:10px">' +
                '<button class="btn-secondary" type="button" onclick="resetE3sMappingFilter()" style="height:34px;padding:0 18px;border-radius:6px;font-size:13px;border:1px solid #cbd5e1;background:#fff;color:#475569;cursor:pointer">重 置</button>' +
                '<button class="btn-primary" type="button" onclick="filterE3sMappingTable()" style="height:34px;padding:0 18px;border-radius:6px;font-size:13px;background:#2563eb;color:#fff;border:none;cursor:pointer">查 询</button>' +
              '</div>' +
            '</div>' +
            '<div class="policy-table-wrap" style="flex:1;min-height:0;overflow-y:auto;border:1px solid #e2e8f0;border-radius:8px">' +
              '<table class="data-table e3s-mapping-table" style="table-layout:fixed;width:100%;margin:0">' +
                '<thead>' +
                  '<tr>' +
                    '<th style="width:65px;text-align:center;background:#f8fafc;padding:10px 12px;font-weight:600;color:#475569">序号</th>' +
                    '<th style="width:140px;background:#f8fafc;padding:10px 12px;font-weight:600;color:#475569">坐席账号</th>' +
                    '<th style="width:130px;background:#f8fafc;padding:10px 12px;font-weight:600;color:#475569">坐席名称</th>' +
                    '<th style="background:#f8fafc;padding:10px 12px;font-weight:600;color:#475569">e3sPlus帐号</th>' +
                  '</tr>' +
                '</thead>' +
                '<tbody id="e3sMappingTableBody"></tbody>' +
              '</table>' +
            '</div>' +
          '</div>' +
          '<div style="padding:16px 24px;border-top:1px solid #e2e8f0;display:flex;justify-content:flex-end;gap:12px;background:#fff">' +
            '<button class="btn-secondary" onclick="closeE3sPlusMappingModal()" style="min-width:76px;height:36px;border-radius:6px;border:1px solid #cbd5e1;background:#fff;color:#475569;font-size:13px;cursor:pointer">取消</button>' +
            '<button class="btn-primary" onclick="saveE3sPlusMapping()" style="min-width:76px;height:36px;border-radius:6px;background:#2563eb;color:#fff;border:none;font-size:13px;cursor:pointer">确定</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );

    const overlay = document.getElementById('e3sPlusMappingDrawerOverlay');
    requestAnimationFrame(function () {
      overlay?.classList.add('show');
    });

    window.renderE3sMappingRows(seatData);
  };

  window.closeE3sPlusMappingModal = function () {
    const overlay = document.getElementById('e3sPlusMappingDrawerOverlay');
    if (overlay) {
      overlay.classList.remove('show');
      setTimeout(function () { overlay.remove(); }, 300);
    }
  };

  window.saveE3sPlusMapping = function () {
    document.querySelectorAll('#e3sPlusMappingDrawerOverlay [data-e3s-seat]').forEach(function (input) {
      const seat = seatData.find(function (item) { return item.id === Number(input.dataset.e3sSeat); });
      if (seat) seat.e3sPlusAccount = input.value.trim();
    });
    closeE3sPlusMappingModal();
    showToast('e3sPlus 帐号映射已保存', true);
    window.filterSeatTable();
  };

  const renderSeatManagementPageWithForm = renderSeatManagementPage;
  renderSeatManagementPage = window.renderSeatManagementPage = function () {
    renderSeatManagementPageWithForm();
    const page = document.getElementById('seatManagementPage');
    const filter = page?.querySelector('.filter-row');
    if (filter) filter.outerHTML = '<div class="filter-row policy-content unified-filter-query" id="seatFilterQuery">' +
      '<span class="filter-label">关键字：</span><input class="lead-input" style="width:240px;margin-right:12px;" id="seatKeywordFilter" placeholder="坐席账号/姓名/企微/e3sPlus 帐号" oninput="filterSeatTable()">' +
      '<span class="filter-label">状态：</span><select class="filter-select" id="seatStatusFilter" onchange="filterSeatTable()"><option value="">全部</option><option value="在岗">在岗</option><option value="休息">休息</option><option value="离岗">离岗</option></select>' +
      '<span class="filter-label">技能值：</span><select class="filter-select" id="seatSkillFilter" onchange="filterSeatTable()"><option value="">全部</option>' + Array.from({ length: 10 }, function (_, i) { return '<option value="' + (i + 1) + '">' + (i + 1) + '</option>'; }).join('') + '</select>' +
      '<span class="filter-label">所属团队：</span><select class="filter-select" id="seatTeamFilter" onchange="filterSeatTable()"><option value="">全部</option><option value="电销一组">电销一组</option><option value="电销二组">电销二组</option><option value="电销三组">电销三组</option></select>' +
      '<button class="btn-secondary" type="button" onclick="resetSeatFilter()">重置</button>' +
      '</div>';
    const card = page?.querySelector('.policy-table-wrap')?.closest('.card');
    if (card) card.innerHTML = '<div class="section-header"><div><div class="section-title">坐席列表 <span id="seatSelectedCount" class="seat-selected-count"></span></div><div class="seat-list-desc">展示坐席身份、映射、团队、技能、任务容量与状态，可按上方条件查询核对。</div></div><div class="seat-toolbar"><button class="btn-secondary" type="button" onclick="openSeatBatchEditModal()">批量修改</button><button class="btn-secondary" type="button" onclick="openE3sPlusMappingModal()">e3sPlus 帐号映射</button><button class="btn-add" type="button" onclick="openSeatModal()">＋ 新增坐席</button></div></div><div class="policy-table-wrap"><table class="data-table policy-table seat-data-table"><thead><tr><th class="col-num"><input id="seatSelectAll" type="checkbox" aria-label="全选" onchange="toggleAllSeatSelection(this)"></th><th>坐席</th><th>e3sPlus 帐号</th><th>企微员工号</th><th>所属团队</th><th>技能值</th><th>任务接收量</th><th>业绩评分</th><th>状态</th><th>操作</th></tr></thead><tbody id="seatTableBody"></tbody></table></div>';
    if (!document.getElementById('seat-list-refine-css')) document.head.insertAdjacentHTML('beforeend', '<style id="seat-list-refine-css">#seatManagementPage .seat-data-table{table-layout:fixed;width:100%}#seatManagementPage .seat-data-table th,#seatManagementPage .seat-data-table td{padding:12px 10px;vertical-align:middle;box-sizing:border-box}#seatManagementPage .seat-data-table th:nth-child(1),#seatManagementPage .seat-data-table td:nth-child(1){width:44px;text-align:center}#seatManagementPage .seat-data-table th:nth-child(2),#seatManagementPage .seat-data-table td:nth-child(2){width:135px}#seatManagementPage .seat-data-table th:nth-child(3),#seatManagementPage .seat-data-table td:nth-child(3){width:135px}#seatManagementPage .seat-data-table th:nth-child(4),#seatManagementPage .seat-data-table td:nth-child(4){width:125px}#seatManagementPage .seat-data-table th:nth-child(5),#seatManagementPage .seat-data-table td:nth-child(5){width:100px}#seatManagementPage .seat-data-table th:nth-child(6),#seatManagementPage .seat-data-table td:nth-child(6){width:80px}#seatManagementPage .seat-data-table th:nth-child(7),#seatManagementPage .seat-data-table td:nth-child(7){width:135px}#seatManagementPage .seat-data-table th:nth-child(8),#seatManagementPage .seat-data-table td:nth-child(8){width:80px}#seatManagementPage .seat-data-table th:nth-child(9),#seatManagementPage .seat-data-table td:nth-child(9){width:80px}#seatManagementPage .seat-data-table th:nth-child(10),#seatManagementPage .seat-data-table td:nth-child(10){width:165px;padding-right:16px}#seatManagementPage .seat-data-table .action-btns{display:flex;align-items:center;justify-content:flex-start;gap:12px}#seatManagementPage .seat-data-table .action-btn.edit,#seatManagementPage .seat-data-table .action-btn.toggle-btn{color:#2563eb;background:transparent;border:none;padding:0;font-size:13px;font-weight:500;cursor:pointer;line-height:1;height:auto}#seatManagementPage .seat-data-table .action-btn.edit:hover,#seatManagementPage .seat-data-table .action-btn.toggle-btn:hover{color:#1d4ed8;background:transparent}#seatManagementPage .seat-data-table .action-btn.delete{color:#fff;background:#ff4d4f;border:none;border-radius:4px;padding:4px 10px;font-size:12px;font-weight:400;cursor:pointer;line-height:1;flex-shrink:0;height:26px;display:inline-flex;align-items:center;justify-content:center}#seatManagementPage .seat-data-table .action-btn.delete:hover{background:#ff7875}#seatManagementPage .seat-toolbar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-end}#seatManagementPage .seat-list-desc{margin-top:5px;color:#8291a8;font-size:12px}#seatManagementPage .seat-identity-sub{display:block;margin-top:3px;color:#8a99ad;font-size:12px;font-weight:400;white-space:nowrap}#seatManagementPage .seat-skill-value{display:block;color:#1e293b;font-size:16px;font-weight:700}#seatManagementPage .seat-selected-count{margin-left:8px;color:#2563eb;font-size:12px;font-weight:600}#seatBatchModal .seat-batch-form-row,#newSeatModal .seat-batch-form-row{display:flex;align-items:flex-start;margin-bottom:18px}#seatBatchModal .seat-batch-form-label,#newSeatModal .seat-batch-form-label{width:180px;text-align:right;padding-right:12px;font-size:14px;font-weight:600;color:#334155;line-height:36px;box-sizing:border-box}#seatBatchModal .seat-batch-form-content,#newSeatModal .seat-batch-form-content{flex:1;min-width:0}#seatBatchModal .seat-batch-hint,#newSeatModal .seat-batch-hint{margin-top:4px;font-size:12px;color:#94a3b8;line-height:1.4}#seatBatchModal .seat-batch-required,#newSeatModal .seat-batch-required{color:#ef4444;margin-right:3px;font-weight:700}#seatBatchModal .switch,#newSeatModal .switch{position:relative;display:inline-block;width:44px;height:24px;cursor:pointer;margin-top:6px}#seatBatchModal .switch input,#newSeatModal .switch input{opacity:0;width:0;height:0}#seatBatchModal .switch .slider,#newSeatModal .switch .slider{position:absolute;top:0;left:0;right:0;bottom:0;background-color:#cbd5e1;transition:.3s;border-radius:24px}#seatBatchModal .switch input:checked+.slider,#newSeatModal .switch input:checked+.slider{background-color:#2563eb}#seatBatchModal .switch .slider:before,#newSeatModal .switch .slider:before{position:absolute;content:"";height:18px;width:18px;left:3px;bottom:3px;background-color:#fff;transition:.3s;border-radius:50%}#seatBatchModal .switch input:checked+.slider:before,#newSeatModal .switch input:checked+.slider:before{transform:translateX(20px)}.e3splus-modal{width:min(720px,calc(100vw - 40px))}#e3sPlusMappingDrawerOverlay{position:fixed;inset:0;background:rgba(15,23,42,0.4);z-index:1050;opacity:0;transition:opacity .3s ease;display:flex;justify-content:flex-end}#e3sPlusMappingDrawerOverlay.show{opacity:1}#e3sPlusMappingDrawer{width:min(760px,92vw);height:100%;background:#fff;box-shadow:-6px 0 24px rgba(15,23,42,.15);display:flex;flex-direction:column;transform:translateX(100%);transition:transform .3s cubic-bezier(.16,1,.3,1);box-sizing:border-box}#e3sPlusMappingDrawerOverlay.show #e3sPlusMappingDrawer{transform:translateX(0)}@media(max-width:640px){#seatManagementPage .seat-toolbar{justify-content:flex-start}}</style>');
    window.renderSeatTable(seatData);
  };
})();
