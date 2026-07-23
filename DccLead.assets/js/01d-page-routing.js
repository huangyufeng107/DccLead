function setLeadNavActive(name) {
  document.querySelectorAll('.leads-nav .strategy-nav-item').forEach(item => {
    item.classList.toggle('active', item.textContent.trim() === name);
  });
}

function setSidebarActiveByName(name) {
  const sidebarItem = [...document.querySelectorAll('.sidebar .sidebar-item')].find(item => item.textContent.trim() === name);
  if (sidebarItem) setSidebarActive(sidebarItem);
}

function setStrategyConfigTabsVisible(visible) {
  document.getElementById('strategyConfigTabs')?.classList.toggle('show', visible);
}

function setBlacklistPolicyTabsVisible(visible) {
  document.getElementById('blacklistPolicyTabs')?.classList.toggle('show', visible);
}

function setManualAiConfigTabsVisible(visible) {
  document.getElementById('manualAiConfigTabs')?.classList.toggle('show', visible);
}

function setStrategyConfigTabActive(tab) {
  document.querySelectorAll('#strategyConfigTabs .strategy-config-tab').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tab);
  });
}

function setManualAiConfigTabActive(tab) {
  document.querySelectorAll('#manualAiConfigTabs .strategy-config-tab').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tab);
  });
}

function setExcellentConfigManageTabsVisible(visible) {
  document.getElementById('excellentConfigManageTabs')?.classList.toggle('show', visible);
  const hero = document.getElementById('excellentConfigManageHero');
  if (hero) {
    hero.style.setProperty('display', visible ? 'flex' : 'none', 'important');
  }
}

function setExcellentConfigManageTabActive(tab) {
  document.querySelectorAll('#excellentConfigManageTabs .strategy-config-tab').forEach(item => {
    item.classList.toggle('active', item.dataset.tab === tab);
  });
}

function switchExcellentConfigManageTab(tab) {
  const labels = {
    'excellent-project-config': '大项目名',
    'excellent-channel-config': '渠道编码',
    'excellent-sc-config': 'SmartCode'
  };
  const configuratorKey = strategyConfiguratorPageMap[tab];
  setStrategyConfigTabsVisible(false);
  setManualAiConfigTabsVisible(false);
  setExcellentConfigManageTabsVisible(true);
  setExcellentConfigManageTabActive(tab);
  setPageName(`培育策略 / 优秀配置管理 / ${labels[tab] || 'SmartCode'}`);
  document.getElementById('designStage').classList.remove('show');
  hideLeadPages();
  setPolicyContentVisible(false);
  if (configuratorKey) renderStrategyConfiguratorPage(configuratorKey);
}

function showPolicyPage() {
  showBlacklistPolicyPage();
}

function showBlacklistPolicyPage() {
  document.querySelector('nav[aria-label="培育策略三级菜单"]').classList.remove('hidden');
  document.querySelector('.leads-nav').classList.remove('show');
  document.querySelector('.reports-nav').classList.remove('show');
  document.querySelector('.ops-nav').classList.remove('show');
  document.querySelectorAll('nav[aria-label="培育策略三级菜单"] .strategy-nav-item').forEach(item => item.classList.remove('active'));
  document.querySelector('.strategy-nav-item[data-page="blacklist-policy"]')?.classList.add('active');
  setSidebarActiveByName('培育策略');
  setStrategyConfigTabsVisible(false);
  setManualAiConfigTabsVisible(false);
  setExcellentConfigManageTabsVisible(false);
  document.getElementById('designStage').classList.remove('show');
  hideLeadPages();
  switchBlacklistTab('blacklist-policy-rules');
}

function switchBlacklistTab(tab = 'blacklist-policy-rules') {
  document.getElementById('addBlacklistUserModal')?.classList.remove('show');
  document.getElementById('blacklistUserDetailModal')?.classList.remove('show');
  setBlacklistPolicyTabsVisible(true);
  document.querySelectorAll('#blacklistPolicyTabs .strategy-config-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  
  const rulesPageElements = document.querySelectorAll('.policy-content');
  const userListPage = document.getElementById('blacklistUserListPage');
  
  if (tab === 'blacklist-policy-rules') {
    setPageName('培育策略 / 黑名单配置 / 黑名单策略');
    if (userListPage) userListPage.classList.remove('show');
    rulesPageElements.forEach(el => el.style.display = '');
    schedulePolicyRuleNoteAutoHide('blacklistPolicyRuleNote');
  } else if (tab === 'blacklist-user-list') {
    setPageName('培育策略 / 黑名单配置 / 用户黑名单');
    rulesPageElements.forEach(el => el.style.display = 'none');
    if (userListPage) userListPage.classList.add('show');
    if (typeof renderBlacklistUserListPage === 'function') renderBlacklistUserListPage();
  }
}

function switchStrategyConfigTab(tab) {
  const labels = {
    policy: '黑名单策略',
    'call-status-policy': '通话状态配置',
    'ai-redial-policy': '外呼重推配置',
    'lead-dispatch': '线索下发配置',
    'sms-dispatch': '短信下发配置',
    'cold-lead-definition': '门店冷线索配置',
    'allocation-policy': '分配比例配置',
    'outbound-label-mapping': '外呼标签映射'
  };
  setStrategyConfigTabsVisible(true);
  setManualAiConfigTabsVisible(false);
  setExcellentConfigManageTabsVisible(false);
  setStrategyConfigTabActive(tab);
  setPageName(`培育策略 / AI外呼配置 / ${labels[tab] || '黑名单策略'}`);
  document.getElementById('designStage').classList.remove('show');
  hideLeadPages();
  setPolicyContentVisible(tab === 'policy');
  if (tab === 'policy') {
    schedulePolicyRuleNoteAutoHide('blacklistPolicyRuleNote');
  }
  if (tab === 'call-status-policy') {
    document.getElementById('callStatusPolicyPage').classList.add('show');
    renderCallStatusPolicyPage();
  } else if (tab === 'ai-redial-policy') {
    document.getElementById('aiRedialPolicyPage').classList.add('show');
    renderAiRedialPolicyPage();
  } else if (tab === 'lead-dispatch') {
    document.getElementById('leadDispatchConfigPage').classList.add('show');
    renderLeadDispatchConfigPage();
    schedulePolicyRuleNoteAutoHide('leadDispatchRuleNote');
  } else if (tab === 'sms-dispatch') {
    document.getElementById('smsDispatchPolicyPage').classList.add('show');
    renderSmsDispatchPolicyPage();
    schedulePolicyRuleNoteAutoHide('smsDispatchRuleNote');
  } else if (tab === 'cold-lead-definition') {
    document.getElementById('coldLeadDefinitionPage').classList.add('show');
    renderColdLeadDefinitionPage();
  } else if (tab === 'allocation-policy') {
    document.getElementById('leadAssignmentConfigPage').classList.add('show');
    renderAllocationPolicyTemplatePage();
  } else if (tab === 'outbound-label-mapping') {
    document.getElementById('outboundLabelMappingPage').classList.add('show');
    renderOutboundLabelMappingPage();
  }
}

function switchManualAiConfigTab(tab) {
  const labels = {
    'manual-unconnected-config': '未接通激活配置',
    'manual-unconverted-config': '总部冷线索配置',
    'follow-count-config': '跟进次数配置',
    'precall-task-config': '推送预外呼配置',
    'return-visit-order-config': '回访工单配置',
    'amap-map-config': '高德地图配置'
  };
  const configuratorKey = strategyConfiguratorPageMap[tab];
  setStrategyConfigTabsVisible(false);
  setManualAiConfigTabsVisible(true);
  setExcellentConfigManageTabsVisible(false);
  setManualAiConfigTabActive(tab);
  setPageName(`培育策略 / 人工外呼配置 / ${labels[tab] || '未接通激活配置'}`);
  document.getElementById('designStage').classList.remove('show');
  hideLeadPages();
  setPolicyContentVisible(false);
  if (configuratorKey) renderStrategyConfiguratorPage(configuratorKey);
}

function showDesignStage(name) {
  setStrategyConfigTabsVisible(false);
  setManualAiConfigTabsVisible(false);
  setExcellentConfigManageTabsVisible(false);
  document.querySelector('nav[aria-label="培育策略三级菜单"]').classList.add('hidden');
  document.querySelector('.leads-nav').classList.remove('show');
  document.querySelector('.reports-nav').classList.remove('show');
  document.querySelector('.ops-nav').classList.remove('show');
  hideLeadPages();
  setPageName(name);
  setPolicyContentVisible(false);
  const designStage = document.getElementById('designStage');
  designStage.classList.add('show');
  document.getElementById('designStageDesc').textContent = `${name}正在产品设计阶段，后续将补充完整的页面内容。`;
}

function showHomePage() {
  showDesignStage('首页');
  setSidebarActiveByName('首页');
}

document.querySelectorAll('.sidebar .sidebar-item').forEach(item => {
  item.addEventListener('click', () => {
    const name = item.textContent.trim();
    setSidebarActive(item);
    if (name === '培育策略') {
      showPolicyPage();
    } else if (name === '线索管理') {
      showLeadsPage();
    } else if (name === '统计报表') {
      showReportsPage();
    } else if (name === '系统监控') {
      showSystemMonitorPage();
    } else if (name === '基础设置') {
      showSystemSettingsPage('profile');
    } else if (name === '首页') {
      showHomePage();
    } else {
      showDesignStage(name);
    }
  });
});

function showLeadsPage(defaultName = '留资线索') {
  setStrategyConfigTabsVisible(false);
  setManualAiConfigTabsVisible(false);
  setExcellentConfigManageTabsVisible(false);
  document.querySelector('nav[aria-label="培育策略三级菜单"]').classList.add('hidden');
  document.querySelector('.leads-nav').classList.add('show');
  document.querySelector('.reports-nav').classList.remove('show');
  document.querySelector('.ops-nav').classList.remove('show');
  setLeadNavActive(defaultName);
  setPageName(`线索管理 / ${defaultName}`);
  setPolicyContentVisible(false);
  const designStage = document.getElementById('designStage');
  const leadPage = document.getElementById('nurtureLeadPage');
  const resourcePage = document.getElementById('resourceLeadPage');
  const unfilledPage = document.getElementById('resourceUnfilledPage');
  const worryFreePage = document.getElementById('worryFreePage');
  hideLeadPages();
  if (defaultName === '留资线索') {
    designStage.classList.remove('show');
    resourcePage.classList.add('show');
    initResourceLeadPage();
  } else if (defaultName === '培育线索') {
    designStage.classList.remove('show');
    leadPage.classList.add('show');
    initNurtureLeadPage();
  } else if (defaultName === '留资未满') {
    designStage.classList.remove('show');
    unfilledPage.classList.add('show');
    initResourceUnfilledPage();
  } else if (defaultName === '三无忧') {
    designStage.classList.remove('show');
    worryFreePage.classList.add('show');
    renderWorryFreeBatchTable();
  } else {
    designStage.classList.add('show');
    document.getElementById('designStageDesc').textContent = `${defaultName}正在产品设计阶段，后续将补充完整的页面内容。`;
  }
}

function switchLeadsNav(el) {
  document.querySelectorAll('.leads-nav .strategy-nav-item').forEach(item => item.classList.remove('active'));
  el.classList.add('active');
  showLeadsPage(el.textContent.trim());
}
