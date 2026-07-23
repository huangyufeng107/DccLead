// ===== System Settings — 系统设置 / 基础设置 =====

// ---- Operation Log mock data ----
const OPERATION_LOG_DATA = [
  { time: '2026-07-15 10:42:18', user: '管理员', role: '总部超级管理员', module: '培育策略', action: '修改', target: '黑名单策略', detail: '修改规则「一知-冷线索」权重：3 → 2', ip: '192.168.1.101', result: '成功' },
  { time: '2026-07-15 10:18:03', user: '管理员', role: '总部超级管理员', module: '培育策略', action: '新增', target: 'AI外呼配置 / 通话状态配置', detail: '新增规则「NEV新线索-高意向」', ip: '192.168.1.101', result: '成功' },
  { time: '2026-07-15 09:55:47', user: '管理员', role: '总部超级管理员', module: '线索管理', action: '导出', target: '留资线索', detail: '导出线索列表，共 1,280 条', ip: '192.168.1.101', result: '成功' },
  { time: '2026-07-15 09:30:12', user: '区域运营A', role: '区域管理员', module: '培育策略', action: '启用', target: '人工外呼配置 / 未接通激活配置', detail: '启用规则「总部冷线索激活-60天」', ip: '10.0.0.55', result: '成功' },
  { time: '2026-07-15 08:59:34', user: '区域运营A', role: '区域管理员', module: '系统设置', action: '修改', target: '帐号安全', detail: '修改登录超时时长：30分钟 → 60分钟', ip: '10.0.0.55', result: '成功' },
  { time: '2026-07-14 17:44:20', user: '管理员', role: '总部超级管理员', module: '培育策略', action: '停用', target: '外呼重推配置', detail: '停用规则「重推-冷线索三次以上」', ip: '192.168.1.101', result: '成功' },
  { time: '2026-07-14 16:22:05', user: '渠道专员B', role: '渠道管理员', module: '培育策略', action: '查看', target: '优秀配置管理 / 渠道编码', detail: '查看渠道编码配置列表', ip: '172.16.0.33', result: '成功' },
  { time: '2026-07-14 15:07:59', user: '管理员', role: '总部超级管理员', module: '系统运维', action: '配置', target: '预警管理 / 预警规则', detail: '配置话单回传超时阈值：24 小时', ip: '192.168.1.101', result: '成功' },
  { time: '2026-07-14 14:38:11', user: '管理员', role: '总部超级管理员', module: '培育策略', action: '删除', target: '黑名单策略', detail: '删除已过期规则「2024-保客黑名单」', ip: '192.168.1.101', result: '成功' },
  { time: '2026-07-14 13:55:23', user: '区域运营A', role: '区域管理员', module: '线索管理', action: '查看', target: '培育线索', detail: '查看培育线索快照详情', ip: '10.0.0.55', result: '成功' },
  { time: '2026-07-14 11:21:44', user: '管理员', role: '总部超级管理员', module: '培育策略', action: '修改', target: '人工外呼配置 / 跟进次数配置', detail: '修改规则「高意向多次跟进」触发条件', ip: '192.168.1.101', result: '成功' },
  { time: '2026-07-14 10:48:02', user: '渠道专员B', role: '渠道管理员', module: '培育策略', action: '查看', target: '优秀配置管理 / SmartCode', detail: '查看 SmartCode 配置列表', ip: '172.16.0.33', result: '成功' },
  { time: '2026-07-14 09:15:30', user: '管理员', role: '总部超级管理员', module: '系统设置', action: '登录', target: '系统', detail: '管理员登录系统', ip: '192.168.1.101', result: '成功' },
  { time: '2026-07-13 18:02:17', user: '区域运营A', role: '区域管理员', module: '系统设置', action: '登录', target: '系统', detail: '区域运营A 登录系统', ip: '10.0.0.55', result: '成功' },
  { time: '2026-07-13 16:30:05', user: '管理员', role: '总部超级管理员', module: '培育策略', action: '新增', target: '人工外呼配置 / 回访工单配置', detail: '新增规则「回访-战败复活-30天」', ip: '192.168.1.101', result: '成功' },
  { time: '2026-07-13 15:12:48', user: '渠道专员B', role: '渠道管理员', module: '培育策略', action: '查看', target: 'AI外呼配置 / 线索下发配置', detail: '查看线索下发配置列表', ip: '172.16.0.33', result: '成功' },
  { time: '2026-07-13 13:40:33', user: '管理员', role: '总部超级管理员', module: '培育策略', action: '修改', target: 'AI外呼配置 / 外呼重推配置', detail: '修改重推间隔：48h → 72h', ip: '192.168.1.101', result: '成功' },
  { time: '2026-07-13 10:27:19', user: '管理员', role: '总部超级管理员', module: '系统设置', action: '修改', target: '个人资料', detail: '修改手机号绑定（尾号 ****8821）', ip: '192.168.1.101', result: '成功' },
  { time: '2026-07-12 17:55:41', user: '区域运营A', role: '区域管理员', module: '线索管理', action: '导出', target: '留资未满', detail: '导出留资未满线索，共 342 条', ip: '10.0.0.55', result: '成功' },
  { time: '2026-07-12 14:18:27', user: '管理员', role: '总部超级管理员', module: '培育策略', action: '修改', target: '优秀配置管理 / 大项目名', detail: '修改「保客培育-2026Q3」项目配置', ip: '192.168.1.101', result: '成功' },
];

let opLogCurrentPage = 1;
const OP_LOG_PAGE_SIZE = 10;
let opLogFiltered = [...OPERATION_LOG_DATA];

// ---- Routing: show system settings page ----
function showSystemSettingsPage(subPage = 'profile') {
  // Hide all other page elements
  setStrategyConfigTabsVisible(false);
  setManualAiConfigTabsVisible(false);
  setExcellentConfigManageTabsVisible(false);
  document.querySelector('nav[aria-label="培育策略三级菜单"]').classList.add('hidden');
  document.querySelector('.leads-nav').classList.remove('show');
  document.querySelector('.reports-nav').classList.remove('show');
  document.querySelector('.ops-nav').classList.remove('show');
  hideLeadPages();
  setPolicyContentVisible(false);
  document.getElementById('designStage').classList.remove('show');

  // Hide the main .content wrapper so it doesn't create a blank gap
  const contentEl = document.querySelector('.main > .content');
  if (contentEl) contentEl.style.display = 'none';

  // Show settings nav
  document.querySelector('.settings-nav').classList.add('show');
  setSidebarActiveByName('基础设置');

  // Show the settings page container
  document.getElementById('systemSettingsPage').style.display = '';

  // Switch subpage
  switchSettingsSubPage(subPage);
}

function switchSettingsSubPage(sub) {
  // Update nav active state
  document.querySelectorAll('.settings-nav .strategy-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.sub === sub);
  });

  const subLabels = { profile: '个人资料', security: '帐号安全', dictionary: '数据字典管理', oplog: '操作日志' };
  setPageName(`系统设置 / 基础设置 / ${subLabels[sub] || '个人资料'}`);

  // Show/hide sub-page panels
  document.getElementById('settingsProfilePanel').style.display  = sub === 'profile'  ? '' : 'none';
  document.getElementById('settingsSecurityPanel').style.display = sub === 'security' ? '' : 'none';
  document.getElementById('settingsDictionaryPanel').style.display = sub === 'dictionary' ? '' : 'none';
  document.getElementById('settingsOplogPanel').style.display    = sub === 'oplog'    ? '' : 'none';

  if (sub === 'dictionary' && typeof renderDictionaryManager === 'function') renderDictionaryManager();
  if (sub === 'oplog') renderOperationLog();
}

// ---- Render: Operation Log ----
function renderOperationLog() {
  applyOpLogFilter();
}

function applyOpLogFilter() {
  const kw  = (document.getElementById('oplogKeyword')?.value || '').trim().toLowerCase();
  const mod = document.getElementById('oplogModuleFilter')?.value || '';
  const act = document.getElementById('oplogActionFilter')?.value || '';
  const usr = (document.getElementById('oplogUserFilter')?.value || '').trim().toLowerCase();

  opLogFiltered = OPERATION_LOG_DATA.filter(row => {
    if (mod && row.module !== mod) return false;
    if (act && row.action !== act) return false;
    if (usr && !row.user.toLowerCase().includes(usr)) return false;
    if (kw) {
      const haystack = [row.time, row.user, row.module, row.action, row.target, row.detail, row.ip, row.result].join(' ').toLowerCase();
      if (!haystack.includes(kw)) return false;
    }
    return true;
  });

  opLogCurrentPage = 1;
  renderOpLogTable();
}

function renderOpLogTable() {
  const tbody = document.getElementById('oplogTbody');
  const total = opLogFiltered.length;
  const start = (opLogCurrentPage - 1) * OP_LOG_PAGE_SIZE;
  const slice = opLogFiltered.slice(start, start + OP_LOG_PAGE_SIZE);

  if (!tbody) return;

  if (slice.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;color:#94a3b8;padding:32px 0;">暂无操作日志</td></tr>`;
  } else {
    tbody.innerHTML = slice.map(row => `
      <tr>
        <td>${row.time}</td>
        <td><span class="oplog-user">${row.user}</span><br><span class="oplog-role">${row.role}</span></td>
        <td>${row.module}</td>
        <td><span class="oplog-action-badge action-${actionClass(row.action)}">${row.action}</span></td>
        <td>${row.target}</td>
        <td class="oplog-detail">${row.detail}</td>
        <td>${row.ip}</td>
        <td><span class="oplog-result ${row.result === '成功' ? 'result-ok' : 'result-fail'}">${row.result}</span></td>
      </tr>
    `).join('');
  }

  renderOpLogPagination(total);
}

function actionClass(action) {
  const map = { '新增': 'add', '修改': 'edit', '删除': 'del', '启用': 'enable', '停用': 'disable', '导出': 'export', '查看': 'view', '登录': 'login', '配置': 'config' };
  return map[action] || 'view';
}

function renderOpLogPagination(total) {
  const el = document.getElementById('oplogPagination');
  if (!el) return;
  const totalPages = Math.ceil(total / OP_LOG_PAGE_SIZE) || 1;
  el.innerHTML = `
    <span class="oplog-page-info">共 <strong>${total}</strong> 条记录，第 ${opLogCurrentPage} / ${totalPages} 页</span>
    <div class="oplog-page-btns">
      <button class="oplog-page-btn" type="button" data-ui-action="settings-oplog-go-page" data-page="1" ${opLogCurrentPage === 1 ? 'disabled' : ''}>«</button>
      <button class="oplog-page-btn" type="button" data-ui-action="settings-oplog-go-page" data-page="${opLogCurrentPage - 1}" ${opLogCurrentPage === 1 ? 'disabled' : ''}>‹</button>
      <button class="oplog-page-btn" type="button" data-ui-action="settings-oplog-go-page" data-page="${opLogCurrentPage + 1}" ${opLogCurrentPage >= totalPages ? 'disabled' : ''}>›</button>
      <button class="oplog-page-btn" type="button" data-ui-action="settings-oplog-go-page" data-page="${totalPages}" ${opLogCurrentPage >= totalPages ? 'disabled' : ''}>»</button>
    </div>
  `;
}

function opLogGoPage(page) {
  const totalPages = Math.ceil(opLogFiltered.length / OP_LOG_PAGE_SIZE) || 1;
  opLogCurrentPage = Math.max(1, Math.min(page, totalPages));
  renderOpLogTable();
}

function handleOpLogPageAction(target) {
  opLogGoPage(Number(target.dataset.page));
}

function resetOpLogFilter() {
  document.getElementById('oplogKeyword').value = '';
  document.getElementById('oplogModuleFilter').value = '';
  document.getElementById('oplogActionFilter').value = '';
  document.getElementById('oplogUserFilter').value = '';
  applyOpLogFilter();
}

// ---- Account Security helpers ----
function savePasswordChange() {
  const oldPwd  = document.getElementById('secOldPassword')?.value || '';
  const newPwd  = document.getElementById('secNewPassword')?.value || '';
  const confPwd = document.getElementById('secConfirmPassword')?.value || '';
  if (!oldPwd) { showToast('请输入当前密码', false); return; }
  if (newPwd.length < 8) { showToast('新密码不能少于 8 位', false); return; }
  if (newPwd !== confPwd) { showToast('两次输入的新密码不一致', false); return; }
  // Simulate success
  document.getElementById('secOldPassword').value = '';
  document.getElementById('secNewPassword').value = '';
  document.getElementById('secConfirmPassword').value = '';
  showToast('密码修改成功，下次登录时将使用新密码', true);
}

function saveSecurityConfig() {
  showToast('帐号安全配置已保存', true);
}

// ---- Profile save helper ----
function saveProfileInfo() {
  showToast('个人资料已保存', true);
}

// ---- Logout ----
function showLogoutConfirm() {
  // Close the user popover first
  document.querySelectorAll('.topbar-popover').forEach(p => p.classList.remove('show'));
  document.getElementById('logoutConfirmModal').classList.add('show');
}

function closeLogoutConfirm() {
  document.getElementById('logoutConfirmModal').classList.remove('show');
}

function confirmLogout() {
  closeLogoutConfirm();
  // Simulate logout: show a full-screen overlay then redirect to "login" (reload for prototype)
  document.getElementById('logoutLoadingOverlay').classList.add('show');
  setTimeout(() => {
    document.getElementById('logoutLoadingOverlay').classList.remove('show');
    document.body.classList.add('login-active');
    showToast('已安全退出，感谢使用 DCC培育平台', true);
  }, 1800);
}

// 系统设置中的无参数保存与重置操作统一由页面事件代理触发。
registerUiAction('settings-save-profile', saveProfileInfo);
registerUiAction('settings-save-password', savePasswordChange);
registerUiAction('settings-save-security', saveSecurityConfig);
registerUiAction('settings-oplog-reset', resetOpLogFilter);
registerUiAction('settings-oplog-go-page', handleOpLogPageAction);
