// Lead distribution reuses the existing dispatch engine and state.
function initBatchDispatchAiPage() {
  window.mountLeadDistribution?.('2');
}
function initBatchDispatchManualPage() {
  window.mountLeadDistribution?.('1');
}
function openLeadDistribution(key = '1') {
  showLeadsPage('线索分发审核');
  switchLeadDispatchAuditTab(key === '2' ? 'lead-dispatch-audit-ai-batch' : 'lead-dispatch-audit-manual-batch');
}
window.openLeadDistribution = openLeadDistribution;
