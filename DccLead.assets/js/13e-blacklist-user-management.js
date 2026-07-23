// ===== Blacklist User Management =====

let blacklistUsers = [
  {
    id: 1,
    phone: '13812345678',
    customerName: '张建国',
    reason: '频繁投诉打扰，请求停止联系',
    source: '人工手动移入',
    ruleName: '—',
    durationType: 'perm',
    validityDays: null,
    expireAt: null,
    addedAt: '2026-07-18 09:30',
    operator: '张敏（黑名单审核员）',
    status: '生效中',
    remark: '客户通过客服热线强烈要求停拨外呼'
  },
  {
    id: 2,
    phone: '13987654321',
    customerName: '李美华',
    reason: '已下订保客，抗拒外呼',
    source: '策略自动拉黑',
    ruleName: '客观理由拒绝归因 (BLP-001)',
    durationType: 'temp',
    validityDays: 60,
    expireAt: '2026-09-18 10:15',
    addedAt: '2026-07-20 10:15',
    operator: '系统自动',
    status: '生效中',
    remark: '自动识别外呼回传标签“已到店已下订”'
  },
  {
    id: 3,
    phone: '13700112233',
    customerName: '王浩',
    reason: '态度抗拒，多次挂断拒接',
    source: '审核通过移入',
    ruleName: '态度拒绝归因 (BLP-002)',
    durationType: 'temp',
    validityDays: 30,
    expireAt: '2026-08-19 14:20',
    addedAt: '2026-07-20 14:20',
    operator: '李强（DCC主管）',
    status: '生效中',
    remark: '审核通过录音“辱骂挂断”工单'
  },
  {
    id: 4,
    phone: '15966778899',
    customerName: '赵强',
    reason: '号码空号异常',
    source: '策略自动拉黑',
    ruleName: '号码异常综合归因 (BLP-003)',
    durationType: 'perm',
    validityDays: null,
    expireAt: null,
    addedAt: '2026-07-15 16:45',
    operator: '系统自动',
    status: '生效中',
    remark: '运营商话单返回空号状态'
  },
  {
    id: 5,
    phone: '18633445566',
    customerName: '陈晨',
    reason: '冷静期临时拉黑',
    source: '人工手动移入',
    ruleName: '—',
    durationType: 'temp',
    validityDays: 30,
    expireAt: '2026-06-30 00:00',
    addedAt: '2026-05-31 10:00',
    operator: '张敏（黑名单审核员）',
    status: '已解封',
    remark: '到期已自动解封恢复培育'
  }
];

let blacklistUserNextId = 6;
let blacklistUserCurrentPage = 1;
let blacklistUserPageSize = 10;

function updateBlacklistUserSummary() {
  const total = blacklistUsers.length;
  const perm = blacklistUsers.filter(u => u.durationType === 'perm').length;
  const temp = blacklistUsers.filter(u => u.durationType === 'temp').length;
  const todayStr = '2026-07-20';
  const today = blacklistUsers.filter(u => u.addedAt && u.addedAt.startsWith(todayStr)).length;

  const totalEl = document.getElementById('blacklistUserSummaryTotal');
  const permEl = document.getElementById('blacklistUserSummaryPerm');
  const tempEl = document.getElementById('blacklistUserSummaryTemp');
  const todayEl = document.getElementById('blacklistUserSummaryToday');

  if (totalEl) totalEl.textContent = total.toLocaleString();
  if (permEl) permEl.textContent = perm.toLocaleString();
  if (tempEl) tempEl.textContent = temp.toLocaleString();
  if (todayEl) todayEl.textContent = today.toLocaleString();
}

function getFilteredBlacklistUsers() {
  const keyword = document.getElementById('blacklistUserKeywordFilter')?.value.trim().toLowerCase() || '';
  const source = document.getElementById('blacklistUserSourceFilter')?.value || '';
  const duration = document.getElementById('blacklistUserDurationFilter')?.value || '';
  const status = document.getElementById('blacklistUserStatusFilter')?.value || '';

  return blacklistUsers.filter(user => {
    if (keyword) {
      const text = [
        user.phone,
        user.customerName,
        user.reason,
        user.ruleName,
        user.operator,
        user.remark
      ].filter(Boolean).join(' ').toLowerCase();
      if (!text.includes(keyword)) return false;
    }
    if (source && user.source !== source) return false;
    if (duration) {
      if (duration === '永久' && user.durationType !== 'perm') return false;
      if (duration === '临时' && user.durationType !== 'temp') return false;
    }
    if (status && user.status !== status) return false;
    return true;
  });
}

function renderBlacklistUserListPage() {
  updateBlacklistUserSummary();
  const rows = getFilteredBlacklistUsers();
  const body = document.getElementById('blacklistUserTableBody');
  if (!body) return;

  const totalPages = Math.max(1, Math.ceil(rows.length / blacklistUserPageSize));
  blacklistUserCurrentPage = Math.min(blacklistUserCurrentPage, totalPages);
  const start = (blacklistUserCurrentPage - 1) * blacklistUserPageSize;
  const pageRows = rows.slice(start, start + blacklistUserPageSize);

  const info = document.getElementById('blacklistUserPageInfo');
  if (info) info.textContent = `共 ${rows.length} 条记录，当前第 ${blacklistUserCurrentPage} / ${totalPages} 页`;

  const pageSelect = document.getElementById('blacklistUserPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, idx) => `<option value="${idx + 1}">第 ${idx + 1} 页</option>`).join('');
    pageSelect.value = String(blacklistUserCurrentPage);
  }

  const pageSizeSelect = document.getElementById('blacklistUserPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(blacklistUserPageSize);

  if (!pageRows.length) {
    const emptyText = blacklistUsers.length === 0
      ? '<div class="empty-state-icon">📋</div>暂无黑名单用户，可点击“新增用户黑名单”添加'
      : '暂无匹配的用户黑名单';
    body.innerHTML = `<tr><td colspan="10"><div class="empty-state">${emptyText}</div></td></tr>`;
    return;
  }

  body.innerHTML = pageRows.map((user, index) => {
    const durationText = user.durationType === 'perm'
      ? '<span class="policy-plain-text">永久</span>'
      : `<div class="rule-text-stack"><span class="policy-plain-text">临时 (${user.validityDays}天)</span><div class="rule-muted">截至 ${user.expireAt ? user.expireAt.split(' ')[0] : '—'}</div></div>`;

    const statusHtml = user.status === '生效中'
      ? '<span class="col-status-on">● 生效中</span>'
      : user.status === '已解封'
        ? '<span class="col-status-off" style="color: #64748b;">● 已解封</span>'
        : '<span class="col-status-off">● 已过期</span>';

    const sourceTagClass = user.source === '策略自动拉黑' ? 'blue' : user.source === '审核通过移入' ? 'green' : 'orange';

    return `
      <tr>
        <td class="col-num">${start + index + 1}</td>
        <td>
          <div class="rule-text-stack">
            <div class="rule-text-main">${escapeHtml(user.customerName || '未知客户')}</div>
            <div class="rule-muted">${escapeHtml(user.phone)}</div>
          </div>
        </td>
        <td><span class="policy-plain-text">${escapeHtml(user.reason || '—')}</span></td>
        <td><span class="tag-chip ${sourceTagClass}">${escapeHtml(user.source)}</span></td>
        <td><span class="policy-plain-text">${escapeHtml(user.ruleName || '—')}</span></td>
        <td>${durationText}</td>
        <td><span class="policy-plain-text">${escapeHtml(user.addedAt || '—')}</span></td>
        <td><span class="policy-plain-text">${escapeHtml(user.operator || '—')}</span></td>
        <td>${statusHtml}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn view" type="button" onclick="openBlacklistUserDetailModal(${user.id})">查看</button>
            ${user.status === '生效中' ? `<button class="action-btn delete" type="button" onclick="removeBlacklistUser(${user.id})">解封移除</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterBlacklistUserTable() {
  blacklistUserCurrentPage = 1;
  renderBlacklistUserListPage();
}

function resetBlacklistUserFilters() {
  ['blacklistUserKeywordFilter', 'blacklistUserSourceFilter', 'blacklistUserDurationFilter', 'blacklistUserStatusFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  blacklistUserCurrentPage = 1;
  renderBlacklistUserListPage();
}

function changeBlacklistUserPageSize(val) {
  blacklistUserPageSize = Number(val) || 10;
  blacklistUserCurrentPage = 1;
  renderBlacklistUserListPage();
}

function changeBlacklistUserPage(direction) {
  const totalPages = Math.max(1, Math.ceil(getFilteredBlacklistUsers().length / blacklistUserPageSize));
  blacklistUserCurrentPage = Math.max(1, Math.min(totalPages, blacklistUserCurrentPage + direction));
  renderBlacklistUserListPage();
}

function selectBlacklistUserPage(val) {
  blacklistUserCurrentPage = Number(val) || 1;
  renderBlacklistUserListPage();
}

function openAddBlacklistUserModal() {
  document.getElementById('blacklistUserDetailModal')?.classList.remove('show');
  const modal = document.getElementById('addBlacklistUserModal');
  if (!modal) return;
  document.getElementById('addBlacklistUserForm')?.reset();
  const customGroup = document.getElementById('blacklistUserCustomReasonGroup');
  if (customGroup) customGroup.style.display = 'none';
  const hint = document.getElementById('blacklistUserDurationHint');
  if (hint) hint.textContent = '请选择封禁期限后，系统将说明生效范围与到期规则。';
  modal.classList.add('show');
}

function closeAddBlacklistUserModal() {
  document.getElementById('addBlacklistUserModal')?.classList.remove('show');
}

function handleBlacklistUserReasonChange(val) {
  const customGroup = document.getElementById('blacklistUserCustomReasonGroup');
  if (customGroup) {
    customGroup.style.display = val === '其它原因' ? 'block' : 'none';
  }
}

function handleBlacklistUserDurationChange(val) {
  const hint = document.getElementById('blacklistUserDurationHint');
  if (!hint) return;
  if (!val) {
    hint.textContent = '请选择封禁期限后，系统将说明生效范围与到期规则。';
    return;
  }
  if (val === 'perm') {
    hint.textContent = '电话号码一旦加入黑名单，系统将不再对其下发任何外呼任务（永久生效）。';
  } else {
    hint.textContent = `该号码加入黑名单后封禁 ${val} 天，到期后自动解封恢复正常培育外呼。`;
  }
}

function saveBlacklistUser(event) {
  event.preventDefault();
  const phone = document.getElementById('blacklistUserPhoneInput')?.value.trim();
  const name = document.getElementById('blacklistUserNameInput')?.value.trim() || '未知客户';
  const reasonSelect = document.getElementById('blacklistUserReasonSelect')?.value;
  const customReason = document.getElementById('blacklistUserCustomReasonInput')?.value.trim();
  const durationSelect = document.getElementById('blacklistUserDurationSelect')?.value;
  const remark = document.getElementById('blacklistUserRemarkInput')?.value.trim() || '';

  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    showToast('请输入正确的11位手机号码', false);
    return;
  }
  if (!reasonSelect) {
    showToast('请选择拉黑原因', false);
    return;
  }
  if (!durationSelect) {
    showToast('请选择封禁期限', false);
    return;
  }

  const finalReason = reasonSelect === '其它原因' ? (customReason || '其它原因') : reasonSelect;
  const isPerm = durationSelect === 'perm';
  const days = isPerm ? null : Number(durationSelect);

  let expireAt = null;
  if (!isPerm && days) {
    const date = new Date();
    date.setDate(date.getDate() + days);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    expireAt = `${yyyy}-${mm}-${dd} 23:59`;
  }

  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const addedAt = `${yyyy}-${mm}-${dd} ${hh}:${min}`;

  const newUser = {
    id: blacklistUserNextId++,
    phone,
    customerName: name,
    reason: finalReason,
    source: '人工手动移入',
    ruleName: '—',
    durationType: isPerm ? 'perm' : 'temp',
    validityDays: days,
    expireAt,
    addedAt,
    operator: '管理员',
    status: '生效中',
    remark
  };

  blacklistUsers.unshift(newUser);
  closeAddBlacklistUserModal();
  renderBlacklistUserListPage();
  showToast(`已成功添加用户黑名单: ${phone}`, true);
}

function removeBlacklistUser(id) {
  const user = blacklistUsers.find(u => u.id === id);
  if (!user) return;
  if (!confirm(`确认要将客户「${user.customerName} (${user.phone})」从黑名单中解封移除吗？`)) return;

  user.status = '已解封';
  renderBlacklistUserListPage();
  showToast(`已成功解封移除黑名单用户：${user.phone}`, true);
}

function openBlacklistUserDetailModal(id) {
  document.getElementById('addBlacklistUserModal')?.classList.remove('show');
  const user = blacklistUsers.find(u => u.id === id);
  if (!user) return;
  const modal = document.getElementById('blacklistUserDetailModal');
  const body = document.getElementById('blacklistUserDetailModalBody');
  if (!modal || !body) return;

  const durationStr = user.durationType === 'perm' ? '永久封禁' : `临时封禁 (${user.validityDays}天) 截至 ${user.expireAt || '—'}`;

  body.innerHTML = `
    <div class="rule-detail-body" style="grid-template-columns: repeat(2, 1fr); gap: 16px;">
      <div class="view-field"><div class="view-field-label">客户姓名</div><div class="view-field-value">${escapeHtml(user.customerName || '—')}</div></div>
      <div class="view-field"><div class="view-field-label">手机号码</div><div class="view-field-value" style="font-weight:700; color:#2563eb;">${escapeHtml(user.phone || '—')}</div></div>
      <div class="view-field"><div class="view-field-label">黑名单来源</div><div class="view-field-value">${escapeHtml(user.source || '—')}</div></div>
      <div class="view-field"><div class="view-field-label">关联规则</div><div class="view-field-value">${escapeHtml(user.ruleName || '—')}</div></div>
      <div class="view-field"><div class="view-field-label">拉黑原因</div><div class="view-field-value">${escapeHtml(user.reason || '—')}</div></div>
      <div class="view-field"><div class="view-field-label">封禁期限</div><div class="view-field-value">${durationStr}</div></div>
      <div class="view-field"><div class="view-field-label">加入时间</div><div class="view-field-value">${escapeHtml(user.addedAt || '—')}</div></div>
      <div class="view-field"><div class="view-field-label">操作人</div><div class="view-field-value">${escapeHtml(user.operator || '—')}</div></div>
      <div class="view-field" style="grid-column: span 2;"><div class="view-field-label">状态</div><div class="view-field-value">${user.status === '生效中' ? '<span class="col-status-on">● 生效中</span>' : user.status === '已解封' ? '<span class="col-status-off" style="color:#64748b;">● 已解封</span>' : '<span class="col-status-off">● 已过期</span>'}</div></div>
      <div class="view-field" style="grid-column: span 2;"><div class="view-field-label">备注说明</div><div class="view-field-value">${escapeHtml(user.remark || '暂无备注说明')}</div></div>
    </div>
  `;
  modal.classList.add('show');
}

function closeBlacklistUserDetailModal() {
  document.getElementById('blacklistUserDetailModal')?.classList.remove('show');
}

function exportBlacklistUsers() {
  showToast('正在导出用户黑名单列表数据...', true);
}
