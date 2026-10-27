/* 版本日志的行内入口仅定位当前原型页面，不代表历史版本快照。 */
(() => {
  const page = new URLSearchParams(location.search).get('prototypePage');
  if (!page) return;
  const strategy = (name) => switchStrategyNav(document.querySelector(`.strategy-nav-item[data-page="${name}"]`));
  const manual = (tab) => { strategy('manual-ai-config'); switchManualAiConfigTab(tab); };
  const ai = (tab) => { strategy('strategy-config'); switchStrategyConfigTab(tab); };
  const open = {
    workbench: () => strategy('ai-strategy-workbench'),
    'workbench-review': () => { strategy('ai-strategy-workbench'); aiStrategyState.tab = 'drafts'; renderAiStrategyWorkbench(); },
    'workbench-versions': () => { strategy('ai-strategy-workbench'); aiStrategyState.tab = 'versions'; renderAiStrategyWorkbench(); },
    assignment: () => strategy('lead-assignment'),
    seats: () => showSchedulingPage('seat-management'),
    'sms-templates': () => showSchedulingPage('sms-template'),
    scheduling: () => showSchedulingPage('schedule-management'),
    alicti: () => manual('alicti-predict-precall-config'),
    'manual-config': () => manual('frequent-intent-policy'),
    'tianwang-manual': () => manual('tianwang-manual-dispatch'),
    'tianwang-ai': () => ai('tianwang-ai-dispatch'),
    whitelist: () => { showBlacklistPolicyPage(); switchBlacklistTab('dealer-whitelist-list'); },
    tasks: () => showNurtureTaskPage(),
    'test-drive': () => showTestDriveSchedulingPage(),
    'test-drive-report': () => showReportsPage('AI试驾排程效能看板'),
    'nurture-report': () => showReportsPage('总部培育报表'),
    workorders: () => showReportsPage('人工坐席工单'),
    'employee-report': () => showReportsPage('坐席业绩看板'),
    leads: () => showLeadsPage('培育线索')
  };
  if (!Object.hasOwn(open, page)) return;
  const navigate = () => {
    try { document.body.classList.remove('login-active'); open[page](); }
    catch (error) { console.warn('版本日志原型入口定位失败', page, error); }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', navigate, {once:true});
  else navigate();
})();
