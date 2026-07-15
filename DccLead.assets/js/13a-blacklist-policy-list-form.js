// ===== Render Table =====
function updateSummary() {
  const total = policies.length;
  const enabled = policies.filter(p => p.status === '启用').length;
  const hits = policies.reduce((sum, p) => sum + (p.hitCount || 0), 0);
  const reviewRecords = policies
    .filter(policy => policy.manualReview)
    .flatMap(policy => hitRecords[policy.id] || []);
  const pendingReview = reviewRecords.filter(record => (record.reviewStatus || '待审核') === '待审核').length;
  const reviewed = reviewRecords.filter(record => ['已通过', '已驳回'].includes(record.reviewStatus)).length;
  document.getElementById('summaryTotal').textContent = total.toLocaleString();
  document.getElementById('summaryEnabled').textContent = enabled.toLocaleString();
  document.getElementById('summaryPendingReview').textContent = pendingReview.toLocaleString();
  document.getElementById('summaryReviewed').textContent = reviewed.toLocaleString();
  document.getElementById('summaryHits').textContent = hits.toLocaleString();
}

function getFilteredPolicies() {
  const callType = document.getElementById('callTypeFilter').value;
  const durationType = document.getElementById('durationFilter').value;
  const status = document.getElementById('statusFilter').value;
  return policies.filter(p => {
    if (callType && p.callType !== callType) return false;
    if (durationType) {
      if (durationType === '永久' && p.durationType !== 'perm') return false;
      if (durationType === '有效期' && p.durationType !== 'temp') return false;
    }
    if (status && p.status !== status) return false;
    return true;
  });
}

function renderTable() {
  updateSummary();
  const filtered = getFilteredPolicies();
  const body = document.getElementById('tableBody');
  const totalPages = Math.max(1, Math.ceil(filtered.length / policyPageSize));
  currentPage = Math.min(currentPage, totalPages);
  document.getElementById('paginationInfo').textContent = `共 ${filtered.length} 条记录，当前第 ${currentPage} / ${totalPages} 页`;
  const policyPageSelect = document.getElementById('policyPageSelect');
  if (policyPageSelect) {
    policyPageSelect.innerHTML = Array.from({ length: totalPages }, (_, idx) => `<option value="${idx + 1}">第 ${idx + 1} 页</option>`).join('');
    policyPageSelect.value = String(currentPage);
  }
  const policyPageSizeSelect = document.getElementById('policyPageSize');
  if (policyPageSizeSelect) policyPageSizeSelect.value = String(policyPageSize);

  if (filtered.length === 0) {
    body.innerHTML = `<tr><td colspan="10"><div class="empty-state"><div class="empty-state-icon">📋</div>暂无策略数据，点击"新增策略"开始配置</div></td></tr>`;
    return;
  }

  const start = (currentPage - 1) * policyPageSize;
  const page = filtered.slice(start, start + policyPageSize);

  body.innerHTML = page.map((p, idx) => {
    const pendingReviewCount = getPendingReviewCount(p.id);
    const pendingBadge = pendingReviewCount > 0 ? renderPendingReviewBadge(pendingReviewCount) : '';
    const callTypeHtml = `<span class="policy-plain-text">${p.callType}</span>`;
    const tagHtml = renderPolicyTableTagsText(p);
    const durationHtml = `<span class="policy-plain-text">${p.durationType === 'perm' ? '永久' : `${p.validityNum}${p.validityUnit}`}</span>`;
    const reviewHtml = `<span class="policy-plain-text">${p.manualReview ? '人工审核' : '自动入黑'}</span>`;
    const statusHtml = p.status === '启用'
      ? `<span class="col-status-on">● 启用</span>`
      : `<span class="col-status-off">● 停用</span>`;
    return `
      <tr>
        <td class="col-num">${start + idx + 1}</td>
        <td class="col-field">${p.name}${pendingBadge}<div class="policy-row-desc">${p.desc || '—'}</div></td>
        <td><span class="policy-plain-text">P${p.priority || 10}</span></td>
        <td>${callTypeHtml}</td>
        <td>${tagHtml}</td>
        <td>${durationHtml}</td>
        <td>${reviewHtml}</td>
        <td><span class="policy-plain-text">${p.hitCount.toLocaleString()}</span></td>
        <td>${statusHtml}</td>
        <td>
          <div class="action-btns">
            <button class="action-btn view" type="button" onclick="openViewModal(${p.id})">查看</button>
            <button class="action-btn edit" type="button" onclick="openModal('edit', ${p.id})">编辑</button>
            <button class="action-btn delete" type="button" onclick="deletePolicy(${p.id})">删除</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterTable() {
  currentPage = 1;
  renderTable();
}

function resetPolicyFilters() {
  ['callTypeFilter', 'durationFilter', 'statusFilter'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  currentPage = 1;
  renderTable();
}

function changePage(dir) {
  const filtered = getFilteredPolicies();
  const totalPages = Math.max(1, Math.ceil(filtered.length / policyPageSize));
  currentPage = Math.max(1, Math.min(totalPages, currentPage + dir));
  renderTable();
}

function changePolicyPageSize(value) {
  policyPageSize = Number(value) || 10;
  currentPage = 1;
  renderTable();
}

function selectPolicyPage(value) {
  currentPage = Number(value) || 1;
  renderTable();
}

function getPendingReviewCount(policyId) {
  const policy = policies.find(p => p.id === policyId);
  if (!policy?.manualReview) return 0;
  return (hitRecords[policyId] || []).filter(record => (record.reviewStatus || '待审核') === '待审核').length;
}

function renderPendingReviewBadge(count) {
  return `
    <span class="review-alert" title="存在待人工审核的命中数据">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
      待审 ${count}
    </span>
  `;
}

function renderPolicyTableTagsText(policy) {
  if (!policy.tags || policy.tags.length === 0) return '<span class="policy-subtle-text">—</span>';
  const conditionText = policy.tagCondition === 'and' ? '且' : '或';
  return `<span class="policy-plain-text">${conditionText}：${policy.tags.join('、')}</span>`;
}

// ===== Duration Toggle =====
function switchDuration(type) {
  currentDuration = type;
  document.getElementById('tab-perm').classList.toggle('active', type === 'perm');
  document.getElementById('tab-temp').classList.toggle('active', type === 'temp');
  const vs = document.getElementById('validitySection');
  const hint = document.getElementById('durationHint');
  if (type === 'perm') {
    vs.classList.remove('show');
    hint.textContent = '电话号码一旦命中将被永久加入黑名单，不会自动解除';
  } else {
    vs.classList.add('show');
    hint.textContent = '超过设定期限后，该号码将自动从黑名单中移除';
  }
}

// ===== Call Type Toggle (single-select) =====
function toggleCallType(el) {
  if (el.classList.contains('disabled')) return;
  // Radio: unselect all siblings, then select clicked
  document.querySelectorAll('.call-type-item').forEach(item => {
    item.classList.remove('selected');
  });
  if (el.querySelector('input').checked) {
    el.classList.add('selected');
  }
  updateTagSection();
}

// ===== Tag Section =====
function getSelectedCallType() {
  const cb = document.querySelector('input[name="callType"]:checked');
  return cb ? cb.value : null;
}

function updateTagSection() {
  const selectedType = getSelectedCallType();
  const section = document.getElementById('tagSection');
  const container = document.getElementById('tagGroups');

  if (!selectedType) {
    container.innerHTML = '';
    section.classList.remove('show');
    updateTagPickerSummary();
    return;
  }

  renderTagGroups([selectedType], container);
  section.classList.add('show');
  updateTagPickerSummary();
}

function renderTagGroups(types, container) {
  container.innerHTML = types.map(type => {
    const tags = tagMap[type] || [];
    return `
      <div class="tag-group">
        <div class="tag-picker">
          <button class="tag-picker-trigger placeholder" id="policyTagPickerTrigger" type="button" onclick="togglePolicyTagPicker()">请选择外呼标签</button>
          <div class="tag-picker-panel" id="policyTagPickerPanel">
            <div class="tag-picker-toolbar">
              <span id="policyTagPickerCount">已选 0 / ${tags.length}</span>
              <div class="tag-picker-actions">
                <button class="tag-picker-action" type="button" onclick="selectAllPolicyTags()">全选</button>
                <button class="tag-picker-action" type="button" onclick="clearPolicyTags()">清空</button>
              </div>
            </div>
            <div class="tag-picker-search">
              <input id="policyTagSearchInput" type="search" placeholder="搜索外呼标签" oninput="filterTagPickerOptions('policyTagPickerPanel', this.value)" />
            </div>
            <div class="tag-picker-list">
              ${tags.map(tag => `
                <label class="tag-option">
                  <input type="checkbox" value="${tag}" data-calltype="${type}" onchange="toggleTagOption(this.closest('.tag-option'))" /> ${tag}
                </label>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleTagOption(el) {
  if (!el) return;
  el.classList.toggle('selected', el.querySelector('input').checked);
  updateTagPickerSummary();
}

function togglePolicyTagPicker() {
  document.getElementById('policyTagPickerPanel')?.classList.toggle('show');
}

function updateTagPickerSummary() {
  updatePickerSummaryFromInputs({
    inputs: document.querySelectorAll('.tag-option input'),
    triggerId: 'policyTagPickerTrigger',
    countId: 'policyTagPickerCount',
    placeholder: '请选择外呼标签'
  });
}

function selectAllPolicyTags() {
  setPickerInputsChecked(getVisibleTagPickerInputs('policyTagPickerPanel'), true, updateTagPickerSummary);
}

function clearPolicyTags() {
  setPickerInputsChecked(document.querySelectorAll('.tag-option input'), false, updateTagPickerSummary);
}

// ===== Condition Toggle =====
function switchCondition(type) {
  currentCondition = type;
  document.getElementById('condAnd').classList.toggle('active', type === 'and');
  document.getElementById('condOr').classList.toggle('active', type === 'or');
  document.getElementById('conditionDesc').textContent =
    type === 'and' ? '命中所有已选标签才触发策略' : '命中任意一个已选标签即触发策略';
}

// ===== Modal =====
let policyFormTemplateHtml = '';

function getPolicyFormTemplateHtml() {
  if (!policyFormTemplateHtml) {
    policyFormTemplateHtml = document.querySelector('#editModal .modal-body')?.innerHTML || '';
  }
  const legacyBody = document.querySelector('#editModal .modal-body');
  if (legacyBody) legacyBody.innerHTML = '';
  return policyFormTemplateHtml;
}

function openModal(mode, id) {
  editingId = (mode === 'edit') ? id : null;
  openPolicyFormPage(mode, id);
  document.getElementById('modalTitle').textContent = mode === 'edit' ? '编辑黑名单策略' : '新增黑名单策略';

  // Reset form
  document.getElementById('formName').value = '';
  document.getElementById('formDesc').value = '';
  document.getElementById('formPriority').value = 10;
  document.getElementById('formStatus').checked = true;
  document.getElementById('formManualReview').checked = false;
  setPolicyNotificationForm(getDefaultPolicyNotificationConfig());
  syncPolicyNotificationVisibility();
  initBlacklistCallTypePicker('', false);
  switchDuration('perm');
  switchCondition('and');
  document.getElementById('tagSection').classList.remove('show');
  document.getElementById('tagGroups').innerHTML = '';

  if (mode === 'edit' && id) {
    const p = policies.find(x => x.id === id);
    if (p) {
      document.getElementById('formName').value = p.name;
      document.getElementById('formDesc').value = p.desc || '';
      document.getElementById('formPriority').value = p.priority || 255;
      document.getElementById('formStatus').checked = p.status === '启用';
      document.getElementById('formManualReview').checked = !!p.manualReview;
      setPolicyNotificationForm(getPolicyNotificationConfig(p));
      syncPolicyNotificationVisibility();
      initBlacklistCallTypePicker(p.callType, true);
      // Build tag section and restore selections
      updateTagSection();
      if (p.tags && p.tags.length > 0) {
        setTimeout(() => {
          document.querySelectorAll('.tag-option input').forEach(cb => {
            if (p.tags.includes(cb.value)) {
              cb.checked = true;
              cb.closest('.tag-option').classList.add('selected');
            }
          });
          updateTagPickerSummary();
        }, 0);
      }
      switchCondition(p.tagCondition || 'and');
      switchDuration(p.durationType);
      if (p.durationType === 'temp') {
        document.getElementById('validityNum').value = p.validityNum;
        document.getElementById('validityUnit').value = p.validityUnit;
      }
    }
  }

  syncPolicyNotificationVisibility();
}

function openPolicyFormPage(mode = 'add', id = null) {
  stopRecordAudio();
  viewingId = null;
  hideLeadPages();
  setPolicyContentVisible(false);
  document.getElementById('designStage').classList.remove('show');
  document.querySelector('nav[aria-label="培育策略三级菜单"]').classList.remove('hidden');
  document.querySelector('.leads-nav').classList.remove('show');
  document.querySelectorAll('nav[aria-label="培育策略三级菜单"] .strategy-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === 'blacklist-policy');
  });
  const policy = id ? policies.find(item => item.id === id) : null;
  const title = mode === 'edit' ? '编辑黑名单策略' : '新增黑名单策略';
  const subtitle = mode === 'edit' && policy
    ? `培育策略 / 黑名单策略 / ${policy.name} / 编辑策略`
    : '培育策略 / 黑名单策略 / 新增策略';
  setSidebarActiveByName('培育策略');
  setPageName(`培育策略 / 黑名单策略 / ${mode === 'edit' ? '编辑策略' : '新增策略'}`);
  const detailPage = document.getElementById('policyDetailPage');
  detailPage.classList.add('show');
  detailPage.querySelector('.detail-page-title').textContent = title;
  document.getElementById('policyDetailSubtitle').textContent = subtitle;
  const toolbar = detailPage.querySelector('.lead-toolbar-right');
  if (toolbar) {
    toolbar.innerHTML = `
      <button class="btn-secondary" type="button" onclick="backToPolicyList()">取消</button>
      <button class="btn-add" type="button" onclick="savePolicy()">保存</button>
    `;
  }
  const summary = document.getElementById('policyDetailSummary');
  if (summary) {
    summary.innerHTML = '';
    summary.style.display = 'none';
  }
  const formTemplate = getPolicyFormTemplateHtml();
  document.getElementById('policyDetailPageBody').innerHTML = `<div class="policy-form-page-card policy-rule-modal"><div class="modal-body">${formTemplate}</div></div>`;
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('show');
  if (id === 'leadDispatchRuleModal') {
    setSharedRuleModalVisual('config');
  }
}

function setSharedRuleModalVisual(variant = 'config') {
  const modal = document.querySelector('#leadDispatchRuleModal .modal');
  if (!modal) return;
  if (variant === 'policy') {
    modal.className = 'modal config-modal lead-dispatch-rule-modal policy-rule-modal cold-lead-policy-modal';
  } else {
    modal.className = 'modal config-modal lead-dispatch-rule-modal';
  }
}

function closeViewModal() {
  stopRecordAudio();
  backToPolicyList();
}

function getDefaultPolicyNotificationConfig() {
  return {
    enabled: false,
    reviewUsers: '张敏（黑名单审核员）、李强（DCC主管）',
    messageUsers: '张敏（黑名单审核员）、陈晨（线索运营）',
    mailUsers: 'blacklist-review@dcc.example.com',
    mailCcUsers: 'dcc-manager@dcc.example.com, operation-owner@dcc.example.com',
    frequency: '实时通知',
    timeoutReminder: '2小时未处理提醒审核人员'
  };
}

function getPolicyNotificationConfig(policy) {
  return { ...getDefaultPolicyNotificationConfig(), ...(policy.notificationConfig || {}) };
}

function formatReviewUserLabel(user) {
  return `${user.name}（${user.role}）`;
}

function getReviewUserAccountsFromText(value) {
  const parts = String(value || '').split(/[、,，]/).map(item => item.trim()).filter(Boolean);
  return reviewUserOptions
    .filter(user => parts.some(part => (
      part === user.account ||
      part === user.name ||
      part === user.role ||
      part === formatReviewUserLabel(user) ||
      part.includes(user.account) ||
      part.includes(user.name)
    )))
    .map(user => user.account);
}

function getAccountPickerConfig(type) {
  const configs = {
    review: {
      hiddenId: 'formReviewUsers',
      triggerId: 'formReviewUserTrigger',
      panelId: 'formReviewUserPanel',
      listId: 'formReviewUserList',
      countId: 'formReviewUserCount',
      placeholder: '请选择审核账号人员',
      getSelected: () => selectedReviewUserAccounts,
      setSelected: accounts => { selectedReviewUserAccounts = accounts; },
      toggleFn: 'toggleReviewUserSelection'
    },
    message: {
      hiddenId: 'formMessageUsers',
      triggerId: 'formMessageUserTrigger',
      panelId: 'formMessageUserPanel',
      listId: 'formMessageUserList',
      countId: 'formMessageUserCount',
      placeholder: '请选择站内通知账号人员',
      getSelected: () => selectedMessageUserAccounts,
      setSelected: accounts => { selectedMessageUserAccounts = accounts; },
      toggleFn: 'toggleMessageUserSelection'
    }
  };
  return configs[type];
}

function renderAccountPicker(type) {
  const config = getAccountPickerConfig(type);
  if (!config) return;
  const selectedAccounts = config.getSelected();
  renderAccountMultiPicker({
    selectedAccounts,
    users: reviewUserOptions,
    formatLabel: formatReviewUserLabel,
    hiddenId: config.hiddenId,
    triggerId: config.triggerId,
    countId: config.countId,
    listId: config.listId,
    placeholder: config.placeholder,
    onchange: () => `${config.toggleFn}(this)`
  });
}

function toggleAccountPicker(type) {
  const config = getAccountPickerConfig(type);
  if (!config) return;
  const trigger = document.getElementById(config.triggerId);
  if (trigger?.classList.contains('is-disabled')) return;
  document.querySelectorAll('.account-picker-panel').forEach(panel => {
    if (panel.id !== config.panelId) panel.classList.remove('show');
  });
  document.getElementById(config.panelId)?.classList.toggle('show');
  renderAccountPicker(type);
}

function toggleAccountSelection(type, input) {
  const config = getAccountPickerConfig(type);
  if (!config) return;
  config.setSelected(updateSelectedValues(config.getSelected(), input.value, input.checked));
  renderAccountPicker(type);
}

function selectAllAccountUsers(type) {
  const config = getAccountPickerConfig(type);
  if (!config) return;
  config.setSelected(reviewUserOptions.map(user => user.account));
  renderAccountPicker(type);
}

function clearAccountUsers(type) {
  const config = getAccountPickerConfig(type);
  if (!config) return;
  config.setSelected([]);
  renderAccountPicker(type);
}

function renderReviewUserPicker() {
  renderAccountPicker('review');
}

function toggleReviewUserPicker() {
  toggleAccountPicker('review');
}

function toggleReviewUserSelection(input) {
  toggleAccountSelection('review', input);
}

function selectAllReviewUsers() {
  selectAllAccountUsers('review');
}

function clearReviewUsers() {
  clearAccountUsers('review');
}

function renderMessageUserPicker() {
  renderAccountPicker('message');
}

function toggleMessageUserPicker() {
  toggleAccountPicker('message');
}

function toggleMessageUserSelection(input) {
  toggleAccountSelection('message', input);
}

function selectAllMessageUsers() {
  selectAllAccountUsers('message');
}

function clearMessageUsers() {
  clearAccountUsers('message');
}

function setPolicyNotificationForm(config) {
  document.getElementById('formNotifyEnabled').checked = !!config.enabled;
  selectedReviewUserAccounts = getReviewUserAccountsFromText(config.reviewUsers);
  renderReviewUserPicker();
  if (!selectedReviewUserAccounts.length && config.reviewUsers) {
    document.getElementById('formReviewUsers').value = config.reviewUsers || '';
    const trigger = document.getElementById('formReviewUserTrigger');
    if (trigger) {
      trigger.textContent = config.reviewUsers;
      trigger.classList.remove('placeholder');
    }
  }
  selectedMessageUserAccounts = getReviewUserAccountsFromText(config.messageUsers);
  renderMessageUserPicker();
  if (!selectedMessageUserAccounts.length && config.messageUsers) {
    document.getElementById('formMessageUsers').value = config.messageUsers || '';
    const trigger = document.getElementById('formMessageUserTrigger');
    if (trigger) {
      trigger.textContent = config.messageUsers;
      trigger.classList.remove('placeholder');
    }
  }
  document.getElementById('formMailUsers').value = config.mailUsers || '';
  document.getElementById('formMailCcUsers').value = config.mailCcUsers || '';
  document.getElementById('formNotifyFrequency').value = config.frequency || '实时通知';
  document.getElementById('formTimeoutReminder').value = config.timeoutReminder || '2小时未处理提醒审核人员';
}

function syncPolicyNotificationVisibility() {
  const manualReview = document.getElementById('formManualReview')?.checked;
  const notifyEnabled = document.getElementById('formNotifyEnabled')?.checked;
  const notificationSection = document.getElementById('policyNotificationSection');
  const notificationFields = document.getElementById('policyNotificationFields');
  const notificationInputs = [
    'formNotifyEnabled',
    'formReviewUsers',
    'formMessageUsers',
    'formMailUsers',
    'formMailCcUsers',
    'formNotifyFrequency',
    'formTimeoutReminder'
  ];
  if (!notificationSection || !notificationFields) return;

  notificationSection.classList.toggle('show', !!manualReview);
  notificationFields.classList.toggle('show', !!manualReview && !!notifyEnabled);
  notificationFields.classList.toggle('is-disabled', !manualReview || !notifyEnabled);
  document.getElementById('formReviewUserTrigger')?.classList.toggle('is-disabled', !manualReview || !notifyEnabled);
  document.getElementById('formMessageUserTrigger')?.classList.toggle('is-disabled', !manualReview || !notifyEnabled);
  if (!manualReview || !notifyEnabled) {
    document.getElementById('formReviewUserPanel')?.classList.remove('show');
    document.getElementById('formMessageUserPanel')?.classList.remove('show');
  }
  notificationInputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = id === 'formNotifyEnabled' ? !manualReview : (!manualReview || !notifyEnabled);
  });
}

function collectPolicyNotificationConfig() {
  const manualReview = document.getElementById('formManualReview').checked;
  const notifyEnabled = manualReview && document.getElementById('formNotifyEnabled').checked;
  return {
    enabled: notifyEnabled,
    reviewUsers: document.getElementById('formReviewUsers').value.trim(),
    messageUsers: document.getElementById('formMessageUsers').value.trim(),
    mailUsers: document.getElementById('formMailUsers').value.trim(),
    mailCcUsers: document.getElementById('formMailCcUsers').value.trim(),
    frequency: document.getElementById('formNotifyFrequency').value,
    timeoutReminder: document.getElementById('formTimeoutReminder').value
  };
}

function parseEmailList(value) {
  return String(value || '').split(/[,，;；\n]/).map(item => item.trim()).filter(Boolean);
}

function getInvalidEmails(value) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return parseEmailList(value).filter(email => !emailPattern.test(email));
}

function savePolicy() {
  const name = document.getElementById('formName').value.trim();
  if (!name) { showToast('请填写策略名称', false); return; }

  const callTypeEl = document.querySelector('input[name="callType"]:checked');
  const callType = callTypeEl ? callTypeEl.value : null;
  if (!callType) { showToast('请选择一种外呼类型', false); return; }

  // Collect tags
  const tags = [];
  document.querySelectorAll('.tag-option input:checked').forEach(cb => {
    if (!tags.includes(cb.value)) tags.push(cb.value);
  });
  if (tags.length === 0) { showToast('请至少选择一个外呼标签', false); return; }

  const tagCondition = currentCondition;
  const durationType = currentDuration;
  let validityNum = null, validityUnit = null;
  if (durationType === 'temp') {
    validityNum = parseInt(document.getElementById('validityNum').value) || 30;
    validityUnit = document.getElementById('validityUnit').value;
  }

  const status = document.getElementById('formStatus').checked ? '启用' : '停用';
  const manualReview = document.getElementById('formManualReview').checked;
  const priority = Math.min(255, Math.max(1, parseInt(document.getElementById('formPriority').value, 10) || 255));
  const desc = document.getElementById('formDesc').value.trim();
  const notificationConfig = collectPolicyNotificationConfig();
  if (manualReview && notificationConfig.enabled && !notificationConfig.reviewUsers) {
    showToast('请填写审核人员', false);
    return;
  }
  if (manualReview && notificationConfig.enabled) {
    const invalidMailUsers = getInvalidEmails(notificationConfig.mailUsers);
    const invalidMailCcUsers = getInvalidEmails(notificationConfig.mailCcUsers);
    if (invalidMailUsers.length) {
      showToast(`邮件通知邮箱格式不正确：${invalidMailUsers[0]}`, false);
      return;
    }
    if (invalidMailCcUsers.length) {
      showToast(`邮件抄送邮箱格式不正确：${invalidMailCcUsers[0]}`, false);
      return;
    }
  }

  if (editingId) {
    const idx = policies.findIndex(p => p.id === editingId);
    if (idx > -1) {
      policies[idx] = { ...policies[idx], name, desc, priority, callType, tags, tagCondition, durationType, validityNum, validityUnit, status, manualReview, notificationConfig };
    }
    showToast('策略已更新', true);
  } else {
    policies.push({ id: nextId++, name, desc, priority, callType, tags, tagCondition, durationType, validityNum, validityUnit, status, manualReview, notificationConfig, hitCount: 0 });
    showToast('策略已创建', true);
  }

  backToPolicyList();
}
