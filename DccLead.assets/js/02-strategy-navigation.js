// ===== Strategy Navigation =====
function switchStrategyNav(el) {
  document.querySelector('.leads-nav').classList.remove('show');
  document.querySelector('.reports-nav').classList.remove('show');
  document.querySelector('.ops-nav').classList.remove('show');
  document.querySelectorAll('nav[aria-label="培育策略三级菜单"] .strategy-nav-item').forEach(item => item.classList.remove('active'));
  el.classList.add('active');

  const page = el.dataset.page;
  const isBlacklistPolicy = page === 'blacklist-policy';
  const isStrategyConfig = page === 'strategy-config';
  const isLeadAssignment = page === 'lead-assignment';
  const isAiRedialPolicy = page === 'ai-redial-policy';
  const isManualAiConfig = page === 'manual-ai-config';
  const isExcellentConfigManage = page === 'excellent-config-manage';
  const configuratorKey = strategyConfiguratorPageMap[page];
  const currentName = el.textContent.trim();
  setSidebarActiveByName('培育策略');

  const designStage = document.getElementById('designStage');
  hideLeadPages();
  setPolicyContentVisible(false);
  setStrategyConfigTabsVisible(isStrategyConfig);
  setManualAiConfigTabsVisible(isManualAiConfig);
  setExcellentConfigManageTabsVisible(isExcellentConfigManage);

  if (isBlacklistPolicy) {
    setPageName('培育策略 / 黑名单策略');
    designStage.classList.remove('show');
    setPolicyContentVisible(true);
    schedulePolicyRuleNoteAutoHide('blacklistPolicyRuleNote');
  } else if (isStrategyConfig) {
    designStage.classList.remove('show');
    switchStrategyConfigTab('call-status-policy');
  } else if (isManualAiConfig) {
    designStage.classList.remove('show');
    switchManualAiConfigTab('manual-unconnected-config');
  } else if (isExcellentConfigManage) {
    designStage.classList.remove('show');
    switchExcellentConfigManageTab('excellent-sc-config');
  } else if (isLeadAssignment) {
    setPageName(`培育策略 / ${currentName}`);
    designStage.classList.remove('show');
    document.getElementById('leadAssignmentConfigPage').classList.add('show');
    renderLeadAssignmentConfigPage();
  } else if (isAiRedialPolicy) {
    setPageName(`培育策略 / ${currentName}`);
    designStage.classList.remove('show');
    document.getElementById('aiRedialPolicyPage').classList.add('show');
    renderAiRedialPolicyPage();
  } else if (configuratorKey) {
    setPageName(`培育策略 / ${currentName}`);
    designStage.classList.remove('show');
    renderStrategyConfiguratorPage(configuratorKey);
  } else {
    setPageName(`培育策略 / ${currentName}`);
    designStage.classList.add('show');
    document.getElementById('designStageDesc').textContent = `${currentName}正在产品设计阶段，后续将补充完整的配置内容。`;
  }
}
