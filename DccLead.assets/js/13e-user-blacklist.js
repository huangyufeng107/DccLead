// ===== User Blacklist =====
let userBlacklistRows = [
  { id: 1, name: '陈晓敏', phone: '138****6621', reason: '明确拒绝营销联系', source: '人工添加', time: '2026-07-20 10:28', status: '生效中', operator: '管理员' },
  { id: 2, name: '张先生', phone: '186****3098', reason: '投诉工单确认', source: '投诉工单', time: '2026-07-20 09:46', status: '生效中', operator: '王小雨' },
  { id: 3, name: '李女士', phone: '159****1843', reason: '命中高频拒接策略', source: '策略命中', time: '2026-07-19 16:12', status: '生效中', operator: '系统自动' },
  { id: 4, name: '周建国', phone: '177****7056', reason: '用户申请解除', source: '人工添加', time: '2026-07-18 14:35', status: '已解除', operator: '管理员' }
];

function renderUserBlacklistTable() {
  const keyword = document.getElementById('userBlacklistKeyword')?.value.trim().toLowerCase() || '';
  const source = document.getElementById('userBlacklistSource')?.value || '';
  const status = document.getElementById('userBlacklistStatus')?.value || '';
  const rows = userBlacklistRows.filter(row => (!keyword || `${row.name}${row.phone}`.toLowerCase().includes(keyword)) && (!source || row.source === source) && (!status || row.status === status));
  const tbody = document.getElementById('userBlacklistTableBody');
  if (!tbody) return;
  tbody.innerHTML = rows.length ? rows.map((row, index) => `<tr><td>${index + 1}</td><td>${row.name}</td><td>${row.phone}</td><td>${row.reason}</td><td>${row.source}</td><td>${row.time}</td><td><span class="status-pill ${row.status === '生效中' ? 'enabled' : 'disabled'}">${row.status}</span></td><td>${row.operator}</td><td><button class="table-action" type="button" onclick="toggleUserBlacklist(${row.id})">${row.status === '生效中' ? '解除' : '恢复'}</button><button class="table-action danger" type="button" onclick="removeUserBlacklist(${row.id})">删除</button></td></tr>`).join('') : '<tr><td colspan="9" style="padding:32px;color:#94a3b8">暂无符合条件的用户黑名单记录</td></tr>';
  document.getElementById('userBlacklistTotal').textContent = userBlacklistRows.length;
  document.getElementById('userBlacklistActive').textContent = userBlacklistRows.filter(row => row.status === '生效中').length;
  document.getElementById('userBlacklistToday').textContent = userBlacklistRows.filter(row => row.time.startsWith('2026-07-20')).length;
  document.getElementById('userBlacklistPagination').textContent = `共 ${rows.length} 条记录`;
}
function toggleUserBlacklist(id) { const row = userBlacklistRows.find(item => item.id === id); if (!row) return; row.status = row.status === '生效中' ? '已解除' : '生效中'; row.operator = '管理员'; renderUserBlacklistTable(); showToast(row.status === '生效中' ? '已恢复黑名单' : '已解除黑名单', true); }
function removeUserBlacklist(id) { userBlacklistRows = userBlacklistRows.filter(row => row.id !== id); renderUserBlacklistTable(); showToast('记录已删除', true); }
