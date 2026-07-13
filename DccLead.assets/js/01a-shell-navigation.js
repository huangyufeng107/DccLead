// ===== Topbar Interactions =====
function toggleTopbarPopover(id) {
  document.querySelectorAll('.topbar-popover').forEach(popover => {
    if (popover.id !== id) popover.classList.remove('show');
  });
  document.getElementById(id).classList.toggle('show');
}

document.addEventListener('click', (event) => {
  if (!event.target.closest('.topbar-action-wrap')) {
    document.querySelectorAll('.topbar-popover').forEach(popover => popover.classList.remove('show'));
  }
  if (!event.target.closest('.field-picker')) {
    document.getElementById('leadFieldPicker')?.classList.remove('show');
    document.getElementById('resourceFieldPicker')?.classList.remove('show');
  }
  if (!event.target.closest('.dealer-filter')) {
    document.getElementById('dealerPickerPanel')?.classList.remove('show');
    document.getElementById('resourceDealerPickerPanel')?.classList.remove('show');
  }
  if (!event.target.closest('.account-picker')) {
    document.getElementById('formReviewUserPanel')?.classList.remove('show');
    document.getElementById('formMessageUserPanel')?.classList.remove('show');
  }
  if (!event.target.closest('.tag-picker')) {
    document.querySelectorAll('.tag-picker-panel').forEach(panel => panel.classList.remove('show'));
  }
  if (!event.target.closest('.allocation-channel-picker')) {
    document.querySelectorAll('.allocation-channel-picker.open').forEach(picker => picker.classList.remove('open'));
  }
});

// ===== Sidebar Navigation =====
function setSidebarActive(el) {
  document.querySelectorAll('.sidebar .sidebar-item').forEach(item => item.classList.remove('active'));
  el.classList.add('active');
}

function setReportsNavActive(name) {
  document.querySelectorAll('.reports-nav .strategy-nav-item').forEach(item => {
    item.classList.toggle('active', item.textContent.trim() === name);
  });
}

function showReportsPage(defaultName) {
  setStrategyConfigTabsVisible(false);
  setManualAiConfigTabsVisible(false);
  document.querySelector('nav[aria-label="培育策略三级菜单"]').classList.add('hidden');
  document.querySelector('.leads-nav').classList.remove('show');
  document.querySelector('.reports-nav').classList.add('show');
  document.querySelector('.ops-nav').classList.remove('show');
  if (defaultName) setReportsNavActive(defaultName);
  setSidebarActiveByName('统计报表');
  hideLeadPages();
  setPolicyContentVisible(false);
  setPageName(`统计报表`);
  document.getElementById('designStage').classList.add('show');
  document.getElementById('designStageDesc').textContent = '统计报表正在产品设计阶段，后续将补充完整的页面内容。';
}

function showSystemMonitorPage(defaultName = '预外呼监控') {
  setStrategyConfigTabsVisible(false);
  setManualAiConfigTabsVisible(false);
  document.querySelector('nav[aria-label="培育策略三级菜单"]').classList.add('hidden');
  document.querySelector('.leads-nav').classList.remove('show');
  document.querySelector('.reports-nav').classList.remove('show');
  document.querySelector('.ops-nav').classList.add('show');
  setOpsNavActive(defaultName);
  setSidebarActiveByName('系统监控');
  hideLeadPages();
  setPolicyContentVisible(false);
  document.getElementById('designStage').classList.remove('show');
  setPageName(`系统运维 / 系统监控 / ${defaultName}`);
  if (defaultName === '预外呼监控') {
    document.getElementById('preCallReportPage').classList.add('show');
    renderPreCallReportPage();
  } else if (defaultName === '其他监控') {
    document.getElementById('designStage').classList.add('show');
    document.getElementById('designStageDesc').textContent = '其他监控正在产品设计阶段，后续将补充完整的页面内容。';
  }
}

function setOpsNavActive(name) {
  document.querySelectorAll('.ops-nav .strategy-nav-item').forEach(item => {
    item.classList.toggle('active', item.textContent.trim() === name);
  });
}

function switchOpsNav(el) {
  showSystemMonitorPage(el.textContent.trim());
}

function setPageName(name) {
  document.querySelector('.topbar-left .page-name').textContent = name;
}

function setPolicyContentVisible(visible) {
  document.querySelectorAll('.policy-content').forEach(section => {
    section.style.display = visible ? '' : 'none';
  });
}

function hideLeadPages() {
  ['nurtureLeadPage', 'resourceLeadPage', 'resourceUnfilledPage', 'worryFreePage', 'leadDetailPage', 'worryFreeBatchDetailPage', 'policyDetailPage', 'leadAssignmentConfigPage', 'callStatusPolicyPage', 'aiRedialPolicyPage', 'leadDispatchConfigPage', 'smsDispatchPolicyPage', 'coldLeadDefinitionPage', 'outboundLabelMappingPage', 'followCountConfigPage', 'manualUnconnectedConfigPage', 'manualUnconvertedConfigPage', 'precallTaskConfigPage', 'excellentProjectConfigPage', 'excellentChannelConfigPage', 'excellentScConfigPage', 'preCallReportPage'].forEach(id => {
    document.getElementById(id)?.classList.remove('show');
  });
}

function renderPreCallReportPage() {
  const page = document.getElementById('preCallReportPage');
  if (!page) return;
  renderPreDialerReportPage(page);
}
