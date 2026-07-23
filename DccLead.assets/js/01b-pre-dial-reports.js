const preDialerTasks = [
  { id: 'PD-20260622-001', manualTaskCode: 'RG-20260622-018', leadId: 'HQ-20260622-018', customer: '陈先生', mobile: '138****1298', series: 'N6', syncDate: '2026-06-22', syncTime: '09:08', syncStatus: '已同步', systemStatus: '已同步', status: '处理中', lastCall: '2026-06-22 11:05', callResult: '线路未呼', lastResult: '线路未呼，待回传', systemExceptionReason: '无异常', updatedAt: '2026-06-23 11:05', overdue: true, agentId: 'AG-001' },
  { id: 'PD-20260622-002', manualTaskCode: 'RG-20260622-024', leadId: 'HQ-20260622-024', customer: '林女士', mobile: '139****4821', series: '轩逸', syncDate: '2026-06-22', syncTime: '09:16', syncStatus: '已同步', systemStatus: '处理完成', status: '已完成', lastCall: '2026-06-22 14:12', callResult: '用户接通', lastResult: '已建联，预约到店', systemExceptionReason: '无异常', updatedAt: '2026-06-22 14:15', overdue: false, nevDispatched: true, nevDispatchedAt: '2026-06-22 14:18', agentId: 'AG-002' },
  { id: 'PD-20260622-003', manualTaskCode: 'RG-20260622-031', leadId: 'HQ-20260622-031', customer: '周先生', mobile: '136****2675', series: '天籁', syncDate: '2026-06-22', syncTime: '10:03', syncStatus: '已同步', systemStatus: '处理完成', status: '已完成', lastCall: '', callResult: '', lastResult: '', systemExceptionReason: '中止外呼任务', updatedAt: '2026-06-22 15:40', overdue: false, agentId: 'AG-003' },
  { id: 'PD-20260621-004', manualTaskCode: 'RG-20260621-095', leadId: 'HQ-20260621-095', customer: '王女士', mobile: '137****8096', series: '逍客', syncDate: '2026-06-21', syncTime: '11:25', syncStatus: '同步失败', systemStatus: '处理完成', status: '已完成', lastCall: '2026-06-21 14:30', callResult: '线路拒呼', lastResult: '线路拒呼', systemExceptionReason: '手机号码黑名单', updatedAt: '2026-06-21 17:10', overdue: false },
  { id: 'PD-20260621-005', manualTaskCode: 'RG-20260621-106', leadId: 'HQ-20260621-106', customer: '赵先生', mobile: '135****3074', series: 'N6', syncDate: '2026-06-21', syncTime: '13:42', syncStatus: '处理完成', systemStatus: '处理完成', status: '已完成', lastCall: '2026-06-22 09:34', callResult: '无人接听', lastResult: '三次未接听，结束处理', systemExceptionReason: '手机号码黑名单', updatedAt: '2026-06-22 09:35', overdue: false, agentId: 'AG-001' },
  { id: 'PD-20260620-006', manualTaskCode: 'RG-20260620-213', leadId: 'HQ-20260620-213', customer: '刘女士', mobile: '186****1852', series: '奇骏', syncDate: '2026-06-20', syncTime: '08:18', syncStatus: '待同步', systemStatus: '待同步', status: '', lastCall: '', callResult: '', lastResult: '', systemExceptionReason: '', updatedAt: '2026-06-22 08:48', overdue: false },
];

const preDialerCallRecords = [
  { taskId: 'PD-20260622-001', callId: 'CALL-0622-1001', attempt: 1, callTime: '2026-06-22 09:36', duration: '0秒', result: '无人接听', handleStatus: '处理中', returnedAt: '2026-06-22 09:37', connected: false },
  { taskId: 'PD-20260622-001', callId: 'CALL-0622-1007', attempt: 2, callTime: '2026-06-22 10:26', duration: '0秒', result: '无人接听', handleStatus: '处理中', returnedAt: '2026-06-22 10:27', connected: false },
  { taskId: 'PD-20260622-001', callId: 'CALL-0622-1011', attempt: 3, callTime: '2026-06-22 11:05', duration: '0秒', result: '线路未呼', handleStatus: '处理中', returnedAt: '2026-06-22 11:06', connected: false },
  { taskId: 'PD-20260622-002', callId: 'CALL-0622-1014', attempt: 1, callTime: '2026-06-22 09:48', duration: '38秒', result: '用户接通', handleStatus: '已完成', returnedAt: '2026-06-22 09:49', connected: true },
  { taskId: 'PD-20260622-002', callId: 'CALL-0622-1058', attempt: 2, callTime: '2026-06-22 14:12', duration: '56秒', result: '用户接通', handleStatus: '已完成', returnedAt: '2026-06-22 14:15', connected: true },
  { taskId: 'PD-20260621-005', callId: 'CALL-0621-0934', attempt: 1, callTime: '2026-06-21 14:10', duration: '0秒', result: '无人接听', handleStatus: '处理中', returnedAt: '2026-06-21 14:11', connected: false },
  { taskId: 'PD-20260621-005', callId: 'CALL-0622-0981', attempt: 2, callTime: '2026-06-22 09:02', duration: '0秒', result: '无人接听', handleStatus: '处理中', returnedAt: '2026-06-22 09:03', connected: false },
  { taskId: 'PD-20260621-005', callId: 'CALL-0622-0994', attempt: 3, callTime: '2026-06-22 09:34', duration: '0秒', result: '无人接听', handleStatus: '已完成', returnedAt: '2026-06-22 09:35', connected: false },
  { taskId: 'PD-20260621-004', callId: 'CALL-0621-0845', attempt: 1, callTime: '2026-06-21 14:30', duration: '0秒', result: '线路拒呼', handleStatus: '处理中', returnedAt: '', connected: false }
];

let preDialerReportFilters = { startDate: '2026-06-20T00:00', endDate: '2026-06-22T23:59', firstCallStart: '', firstCallEnd: '', status: 'all', systemStatus: 'all', exceptionReason: 'all', callResult: 'all', keyword: '', attentionFocus: '' };
let preDialerReportMoreFiltersExpanded = false;
let preDialerListActiveTab = 'overview';
let preDialerTaskCurrentPage = 1;
let preDialerTaskPageSize = 10;
let preDialerBatchCurrentPage = 1;
let preDialerBatchPageSize = 10;

function getFilteredPreDialerTasks() {
  const { startDate, endDate, firstCallStart, firstCallEnd, status, systemStatus, exceptionReason, callResult, keyword, attentionFocus } = preDialerReportFilters;
  const query = keyword.trim().toLowerCase();
  return preDialerTasks.filter(task => {
    const taskCalls = getTaskCallRecords(task.id);
    const matchesAttention = !attentionFocus
      || (attentionFocus === 'sync-failed' && task.syncStatus === '同步失败')
      || (attentionFocus === 'timeout-pending' && taskCalls.some(call => !call.returnedAt && task.overdue))
      || (attentionFocus === 'recording-missing' && taskCalls.some(call => call.returnedAt && call.recordingAvailable === false));
    const filterStart = startDate.slice(0, 10);
    const filterEnd = endDate.slice(0, 10);
    const firstCallTime = getFirstTaskCallRecord(task.id)?.callTime || '';
    const firstCallStartTime = String(firstCallStart || '').replace('T', ' ');
    const firstCallEndTime = String(firstCallEnd || '').replace('T', ' ');
    const matchesFirstCallTime = (!firstCallStartTime || (firstCallTime && firstCallTime >= firstCallStartTime))
      && (!firstCallEndTime || (firstCallTime && firstCallTime <= firstCallEndTime));
    return task.syncDate >= filterStart && task.syncDate <= filterEnd && matchesFirstCallTime && (status === 'all' || task.status === status) && (systemStatus === 'all' || task.systemStatus === systemStatus) && (exceptionReason === 'all' || task.systemExceptionReason === exceptionReason) && (callResult === 'all' || getLatestTaskCallRecord(task.id)?.result === callResult) && matchesAttention && (!query || [task.id, task.leadId, task.customer, task.mobile].join(' ').toLowerCase().includes(query));
  });
}

function getTaskCallRecords(taskId) {
  return preDialerCallRecords.filter(record => record.taskId === taskId);
}

function getLatestTaskCallRecord(taskId) {
  return [...getTaskCallRecords(taskId)].sort((a, b) => a.callTime.localeCompare(b.callTime)).at(-1);
}

function getFirstTaskCallRecord(taskId) {
  return [...getTaskCallRecords(taskId)].sort((a, b) => a.callTime.localeCompare(b.callTime))[0];
}

function getPreDialerMetrics(tasks, calls) {
  const syncFailedTasks = tasks.filter(task => task.syncStatus === '同步失败');
  const pushedTasks = tasks.filter(task => task.systemStatus !== '待同步' && task.syncStatus !== '同步失败');
  const processingTasks = tasks.filter(task => task.status === '处理中');
  const handledTasks = tasks.filter(task => task.status === '已完成');
  const returnedCalls = calls.filter(call => call.returnedAt);
  const pendingCalls = calls.filter(call => !call.returnedAt);
  const timeoutPendingCalls = pendingCalls.filter(call => tasks.find(task => task.id === call.taskId)?.overdue);
  const recordingMissingCalls = returnedCalls.filter(call => call.recordingAvailable === false);
  const connectedCalls = calls.filter(call => call.connected);
  const connectedTaskCount = new Set(connectedCalls.map(call => call.taskId)).size;
  const effectiveCalls = connectedCalls.filter(call => Number.parseInt(call.duration, 10) >= 30);
  const lineRejectedCalls = calls.filter(call => call.result === '线路拒呼');
  const lineUncalledCalls = calls.filter(call => call.result === '线路未呼');
  const invalidReasons = ['中止外呼任务', '手机号码黑名单'];
  const effectiveOutboundTasks = pushedTasks.filter(task => {
    const taskCalls = calls.filter(call => call.taskId === task.id);
    const latestCall = getLatestTaskCallRecord(task.id);
    const isFinishedLineFailure = task.status === '已完成' && ['线路拒呼', '线路未呼'].includes(latestCall?.result);
    const hasPendingCall = taskCalls.some(call => !call.returnedAt);
    return !isFinishedLineFailure && !hasPendingCall && !invalidReasons.includes(task.systemExceptionReason);
  });
  const assignedAgentIds = new Set(pushedTasks.map(task => task.agentId).filter(Boolean));
  const answeredAgentIds = new Set(pushedTasks.filter(task => calls.some(call => call.taskId === task.id && call.connected)).map(task => task.agentId).filter(Boolean));
  const seatAnsweredLeadTasks = pushedTasks.filter(task => calls.some(call => call.taskId === task.id && call.connected));
  const assignedAgentsTotal = assignedAgentIds.size || pushedTasks.length;
  const assignedAgentsAnswered = answeredAgentIds.size || seatAnsweredLeadTasks.length;
  const firstCalls = calls.filter(call => call.attempt === 1);
  const firstCallConnected = firstCalls.filter(call => call.connected);
  const nonFirstCalls = calls.filter(call => call.attempt > 1);
  const nonFirstCallConnected = nonFirstCalls.filter(call => call.connected);
  const totalDurationSeconds = connectedCalls.reduce((sum, call) => sum + (Number.parseInt(call.duration, 10) || 0), 0);
  const dailyAvgLoad = assignedAgentsTotal ? (seatAnsweredLeadTasks.length / assignedAgentsTotal).toFixed(1) : '0.0';
  const nevDispatchedTasks = tasks.filter(task => task.nevDispatched);
  const nevDispatchedSeatAnsweredTasks = nevDispatchedTasks.filter(task => getTaskCallRecords(task.id).some(call => call.connected));
  const nevDispatchedNonSeatAnsweredTasks = nevDispatchedTasks.filter(task => !getTaskCallRecords(task.id).some(call => call.connected));
  return {
    totalTasks: tasks.length,
    pushedTasks: pushedTasks.length,
    syncFailedTasks: syncFailedTasks.length,
    processingTasks: processingTasks.length,
    handledTasks: handledTasks.length,
    returnedCalls: returnedCalls.length,
    pendingCalls: pendingCalls.length,
    timeoutPendingCalls: timeoutPendingCalls.length,
    recordingMissingCalls: recordingMissingCalls.length,
    connectedCalls: connectedTaskCount,
    connectedRate: effectiveOutboundTasks.length ? `${(connectedTaskCount / effectiveOutboundTasks.length * 100).toFixed(1)}%` : '0.0%',
    effectiveCalls: effectiveCalls.length,
    effectiveCallRate: connectedTaskCount ? `${(effectiveCalls.length / connectedTaskCount * 100).toFixed(1)}%` : '0.0%',
    effectiveOutboundCalls: effectiveOutboundTasks.length,
    lineRejectedCalls: lineRejectedCalls.length,
    lineUncalledCalls: lineUncalledCalls.length,
    assignedAgentsTotal: assignedAgentsTotal,
    assignedAgentsAnswered: assignedAgentsAnswered,
    firstCallTotal: firstCalls.length,
    firstCallConnected: firstCallConnected.length,
    firstCallRate: firstCalls.length ? `${(firstCallConnected.length / firstCalls.length * 100).toFixed(1)}%` : '0.0%',
    nonFirstCallTotal: nonFirstCalls.length,
    nonFirstCallConnected: nonFirstCallConnected.length,
    nonFirstCallRate: nonFirstCalls.length ? `${(nonFirstCallConnected.length / nonFirstCalls.length * 100).toFixed(1)}%` : '0.0%',
    totalDurationSeconds: totalDurationSeconds,
    avgDurationPerAgent: connectedCalls.length ? `${Math.round(totalDurationSeconds / connectedCalls.length)}秒` : '0秒',
    dailyAvgLoad: dailyAvgLoad,
    nevDispatchedTasks: nevDispatchedTasks.length,
    nevDispatchedSeatAnsweredTasks: nevDispatchedSeatAnsweredTasks.length,
    nevDispatchedNonSeatAnsweredTasks: nevDispatchedNonSeatAnsweredTasks.length
  };
}

function renderPreDialerMetricCard(name, value, subtitle, category) {
  const alertMetrics = ['同步失败量', '话单超时未回传', '录音丢失量', '线路拒呼', '线路未呼'];
  const needsAlert = alertMetrics.includes(name) && Number(value) > 0;
  const catClass = category ? ` metric-${category}` : '';
  const alertClass = needsAlert ? ' metric-alert' : '';
  return `<button class="predial-overview-card predial-metric-card${catClass}${alertClass}" type="button" data-ui-action="pre-dialer-metric-info" data-metric="${name}"><div class="metric-label">${name}</div><div class="metric-value">${value}</div><div class="metric-sub">${subtitle}</div></button>`;
}

function getPreDialerBatchMetricColumns(group = 'all') {
  const flowColumns = [
    { label: '预外呼任务总量', value: metrics => metrics.totalTasks },
    { label: '已推送任务量', value: metrics => metrics.pushedTasks },
    { label: '同步失败量', value: metrics => metrics.syncFailedTasks },
    { label: '已分配坐席（总量）', value: metrics => metrics.assignedAgentsTotal },
    { label: '已分配坐席（通话状态 = 坐席接听）', value: metrics => metrics.assignedAgentsAnswered },
    { label: '线索下发量', value: metrics => metrics.nevDispatchedTasks },
    { label: '线索下发量（通话状态 = 坐席接听）', value: metrics => metrics.nevDispatchedSeatAnsweredTasks },
    { label: '线索下发量（通话状态 ≠ 坐席接听）', value: metrics => metrics.nevDispatchedNonSeatAnsweredTasks }
  ];
  const callColumns = [
    { label: '任务处理中', value: metrics => metrics.processingTasks },
    { label: '任务已处理', value: metrics => metrics.handledTasks },
    { label: '有效任务量', value: metrics => metrics.effectiveOutboundCalls },
    { label: '话单已回传', value: metrics => metrics.returnedCalls },
    { label: '话单待回传', value: metrics => metrics.pendingCalls },
    { label: '话单超时未回传', value: metrics => metrics.timeoutPendingCalls },
    { label: '录音丢失量', value: metrics => metrics.recordingMissingCalls },
    { label: '外呼接通量', value: metrics => metrics.connectedCalls },
    { label: '接通率', value: metrics => metrics.connectedRate },
    { label: '有效通话量', value: metrics => metrics.effectiveCalls },
    { label: '有效通话率', value: metrics => metrics.effectiveCallRate },
    { label: '首呼接通率', value: metrics => metrics.firstCallRate },
    { label: '2~N呼接通率', value: metrics => metrics.nonFirstCallRate },
    { label: '线路拒呼', value: metrics => metrics.lineRejectedCalls },
    { label: '线路未呼', value: metrics => metrics.lineUncalledCalls },
    { label: '呼叫接通时长', value: metrics => `${metrics.totalDurationSeconds}秒` },
    { label: '每通呼叫接通时长', value: metrics => metrics.avgDurationPerAgent },
    { label: '人均日承载量', value: metrics => metrics.dailyAvgLoad }
  ];
  if (group === 'call') return callColumns;
  if (group === 'all') return [...flowColumns, ...callColumns];
  return flowColumns;
}

function renderPreDialerBatchTable(pageDates, dates, tasks, calls) {
  const columns = getPreDialerBatchMetricColumns('all');
  const totalMetrics = getPreDialerMetrics(tasks, calls);
  const header = `<tr><th title="同步日期">同步日期</th>${columns.map(column => `<th title="${escapeAttr(column.label)}">${column.label}</th>`).join('')}</tr>`;
  const body = pageDates.length ? pageDates.map(date => {
    const dateTasks = tasks.filter(task => task.syncDate === date);
    const ids = new Set(dateTasks.map(task => task.id));
    const dateCalls = calls.filter(call => ids.has(call.taskId));
    const dateMetrics = getPreDialerMetrics(dateTasks, dateCalls);
    return `<tr><td title="${escapeAttr(date)}">${date}</td>${columns.map(column => { const value = column.value(dateMetrics); return `<td title="${escapeAttr(value)}">${value}</td>`; }).join('')}</tr>`;
  }).join('') : `<tr><td colspan="${columns.length + 1}"><div class="empty-state">暂无同步批次数据</div></td></tr>`;
  const foot = dates.length ? `<tfoot><tr class="batch-summary-row"><td class="batch-summary-label" title="统计">统计</td>${columns.map(column => { const value = column.value(totalMetrics); return `<td title="${escapeAttr(value)}">${value}</td>`; }).join('')}</tr></tfoot>` : '';
  return `<div class="lead-table-wrap predial-batch-table-wrap"><table class="lead-table predial-batch-table" style="width:${(columns.length + 1) * 128}px"><thead>${header}</thead><tbody>${body}</tbody>${foot}</table></div>`;
}

function getPreDialerExportRangeText() {
  const { startDate, endDate } = preDialerReportFilters;
  const fmt = (v) => v ? v.slice(0, 10) : '全部';
  return startDate || endDate ? `${fmt(startDate)}_${fmt(endDate)}` : new Date().toISOString().slice(0, 10);
}

function getPreDialerTaskExportRows(tasks) {
  return tasks.map(task => {
    const taskCalls = getTaskCallRecords(task.id);
    const firstCall = getFirstTaskCallRecord(task.id);
    const latestCall = getLatestTaskCallRecord(task.id);
    const returnedCalls = taskCalls.filter(call => call.returnedAt);
    const pendingCalls = taskCalls.filter(call => !call.returnedAt);
    const timeoutPendingCalls = pendingCalls.filter(() => task.overdue);
    const recordingMissingCalls = returnedCalls.filter(call => call.recordingAvailable === false);
    const taskStatus = task.status ? (task.overdue ? '处理中（超时）' : task.status) : '';
    const callDetail = taskCalls.map(call => `${call.callId || '-'}｜第${call.attempt}次｜${call.callTime || '-'}｜${call.duration || '-'}｜${call.result || '-'}｜${call.returnedAt || '待回传'}`).join('；');
    return [
      formatPreDialerDisplayDate(task.syncDate),
      task.syncTime || '',
      task.manualTaskCode || '',
      task.id,
      task.leadId,
      task.customer,
      task.mobile,
      task.series,
      task.syncStatus || '',
      task.systemStatus || '',
      formatPreDialerExceptionReason(task.systemExceptionReason, ''),
      taskStatus,
      taskCalls.length,
      latestCall?.result || '',
      latestCall?.callId || '',
      latestCall?.callTime || '',
      latestCall?.duration || '',
      returnedCalls.length,
      recordingMissingCalls.length,
      task.nevDispatched ? '是' : '否',
      task.nevDispatchedAt || '',
      firstCall?.callTime || '',
      firstCall?.returnedAt || '',
      task.updatedAt || '',
      callDetail
    ];
  });
}

function exportPreDialerTasks() {
  const tasks = getFilteredPreDialerTasks();
  if (!tasks.length) {
    showToast('当前筛选条件下暂无可导出的预外呼任务', false);
    return;
  }
  const columns = [
    '同步日期',
    '同步时间',
    '人工任务编码',
    '预外呼任务ID',
    '总部线索ID',
    '客户',
    '手机号',
    '意向车系',
    '同步状态',
    '任务系统状态',
    '任务异常原因',
    '预外呼任务状态',
    '外呼次数',
    '最新外呼结果',
    '最新话单ID',
    '最新外呼时间',
    '最新通话时长',
    '话单已回传数',
    '录音丢失量',
    '已下发线索',
    '线索下发时间',
    '首次外呼时间',
    '首次回传时间',
    '更新时间'
  ];
  const rows = getPreDialerTaskExportRows(tasks).map(row => row.slice(0, columns.length));
  const taskIds = new Set(tasks.map(task => task.id));
  const callRecords = preDialerCallRecords.filter(record => taskIds.has(record.taskId)).sort((a, b) => a.callTime.localeCompare(b.callTime));
  const callColumns = ['话单ID', '预外呼任务ID', '第几次外呼', '外呼时间', '通话时长', '外呼结果', '预外呼处理状态', '回传时间', '是否接通'];
  const callRows = callRecords.map(call => {
    const task = preDialerTasks.find(item => item.id === call.taskId);
    return [
      call.callId, call.taskId, `第 ${call.attempt} 次`, call.callTime, call.duration, call.result,
      call.handleStatus, call.returnedAt || '待回传', call.connected ? '是' : '否'
    ];
  });
  downloadExcelWorkbookFile(
    `明细列表_${getPreDialerExportRangeText()}.xls`,
    [
      { name: '预外呼任务明细', columns, rows },
      { name: '外呼话单明细', columns: callColumns, rows: callRows }
    ],
    `已导出 ${rows.length} 条任务 + ${callRecords.length} 条话单，外呼话单明细已写入独立 Sheet`
  );
}

function exportPreDialerBatchSummary() {
  const tasks = getFilteredPreDialerTasks();
  const taskIds = new Set(tasks.map(task => task.id));
  const calls = preDialerCallRecords.filter(record => taskIds.has(record.taskId));
  const dates = [...new Set(tasks.map(task => task.syncDate))].sort().reverse();
  if (!dates.length) {
    showToast('当前筛选条件下暂无可导出的同步批次数据', false);
    return;
  }
  const columns = getPreDialerBatchMetricColumns('all');
  const rows = dates.map(date => {
    const dateTasks = tasks.filter(task => task.syncDate === date);
    const ids = new Set(dateTasks.map(task => task.id));
    const dateCalls = calls.filter(call => ids.has(call.taskId));
    const dateMetrics = getPreDialerMetrics(dateTasks, dateCalls);
    return [formatPreDialerDisplayDate(date), ...columns.map(column => column.value(dateMetrics))];
  });
  const totalMetrics = getPreDialerMetrics(tasks, calls);
  rows.push(['统计', ...columns.map(column => column.value(totalMetrics))]);
  const csvRows = [
    ['同步日期', ...columns.map(column => column.label)].map(csvEscape).join(','),
    ...rows.map(row => row.map(csvEscape).join(','))
  ];
  downloadCsvFile(`同步批次汇总_${getPreDialerExportRangeText()}.csv`, csvRows, `已导出 ${dates.length} 条同步批次汇总数据`);
}

function formatPreDialerDisplayDate(value) {
  if (!value) return '';
  const str = String(value);
  const sep = str.includes('T') ? 'T' : ' ';
  const [date, time] = str.split(sep);
  const [year, month, day] = date.split('-');
  const formatted = month && day ? `${year}/${Number(month)}/${Number(day)}` : date;
  return time ? `${formatted} ${time}` : formatted;
}

function formatPreDialerExceptionReason(value, emptyText = '—') {
  return (!value || value === '无异常') ? emptyText : value;
}

function openPreDialerTaskDetail(taskId) {
  const task = preDialerTasks.find(item => item.id === taskId);
  if (!task) return showToast('未找到该预外呼任务', false);
  const calls = getTaskCallRecords(taskId);
  const latestCall = getLatestTaskCallRecord(taskId);
  const body = document.getElementById('preDialerTaskModalBody');
  const title = document.getElementById('preDialerTaskModalTitle');
  if (!body || !title) return;
  title.textContent = `预外呼任务详情 · ${task.id}`;
  body.innerHTML = `
    <div class="detail-section" style="margin:0 0 16px">
      <div class="detail-section-title">任务信息</div>
      <div class="lead-detail-grid">
        <div class="lead-detail-item"><div class="lead-detail-label">人工任务编码</div><div class="lead-detail-value">${task.manualTaskCode || '—'}</div></div>
        <div class="lead-detail-item"><div class="lead-detail-label">总部线索ID</div><div class="lead-detail-value">${task.leadId}</div></div>
        <div class="lead-detail-item"><div class="lead-detail-label">客户</div><div class="lead-detail-value">${task.customer} ${task.mobile}</div></div>
        <div class="lead-detail-item"><div class="lead-detail-label">意向车系</div><div class="lead-detail-value">${task.series}</div></div>
        <div class="lead-detail-item"><div class="lead-detail-label">同步时间</div><div class="lead-detail-value">${task.syncDate} ${task.syncTime}</div></div>
        <div class="lead-detail-item"><div class="lead-detail-label">预外呼任务状态</div><div class="lead-detail-value"><span class="predial-task-status ${task.status === '已完成' ? 'complete' : task.overdue ? 'overdue' : ''}">${task.overdue ? '处理中（超时）' : task.status}</span></div></div>
        <div class="lead-detail-item"><div class="lead-detail-label">最新外呼结果</div><div class="lead-detail-value">${latestCall?.result || ''}</div></div>
        <div class="lead-detail-item"><div class="lead-detail-label">任务系统状态</div><div class="lead-detail-value">${task.systemStatus}</div></div>
        <div class="lead-detail-item"><div class="lead-detail-label">任务异常原因</div><div class="lead-detail-value">${formatPreDialerExceptionReason(task.systemExceptionReason)}</div></div>
        <div class="lead-detail-item"><div class="lead-detail-label">已下发线索</div><div class="lead-detail-value">${task.nevDispatched ? `是<div class="predial-call-result">更新时间：${task.nevDispatchedAt || ''}</div>` : '否'}</div></div>
      </div>
    </div>
    <div class="detail-section" style="margin:0">
      <div class="detail-section-title">外呼话单回传 <span class="table-count">${calls.length} 条</span></div>
      <div class="lead-table-wrap"><table class="lead-table"><thead><tr><th>话单ID</th><th>第几次外呼</th><th>外呼时间</th><th>通话时长</th><th>外呼结果</th><th>预外呼处理状态</th><th>回传时间</th></tr></thead><tbody>${calls.length ? calls.map(call => `<tr><td>${call.callId}</td><td>第 ${call.attempt} 次</td><td>${call.callTime}</td><td>${call.duration}</td><td>${call.result}</td><td><span class="predial-task-status ${call.handleStatus === '已完成' ? 'complete' : ''}">${call.handleStatus}</span></td><td>${call.returnedAt || '待回传'}</td></tr>`).join('') : '<tr><td colspan="7"><div class="empty-state">暂无外呼话单回传</div></td></tr>'}</tbody></table></div>
    </div>
  `;
  document.getElementById('preDialerTaskModal').classList.add('show');
  enhancePreDialerOverflowTitles(document.getElementById('preDialerTaskModal'));
}

function renderPreDialerReportPage(page) {
  const tasks = getFilteredPreDialerTasks();
  const taskIds = new Set(tasks.map(task => task.id));
  const calls = preDialerCallRecords.filter(record => taskIds.has(record.taskId));
  const metrics = getPreDialerMetrics(tasks, calls);
  const rate = (value, base) => base ? `${(value / base * 100).toFixed(1)}%` : '0.0%';
  const dates = [...new Set(tasks.map(task => task.syncDate))].sort().reverse();
  page.innerHTML = `
    <div class="predial-report-shell worry-free-dashboard">
      <section class="page-hero">
        <div>
          <div class="page-title">预外呼监控</div>
          <div class="page-desc">追踪 DCC培育系统同步至预外呼系统的任务处理、每次外呼话单回传及建联结果。仅用于数据监控，不包含规则设置。</div>
        </div>
      </section>

      ${['task', 'batch'].includes(preDialerListActiveTab) ? `
      <section class="predial-filter-panel resource-unfilled-batch-query predial-detail-query">
        ${preDialerListActiveTab === 'batch' ? `
        <div class="resource-unfilled-batch-query-title">筛选查询</div>
        <div class="resource-unfilled-batch-query-grid predial-batch-query-grid">
          <label>同步日期<div class="resource-unfilled-batch-date-range"><input class="form-input" id="preDialerStartDate" type="date" value="${preDialerReportFilters.startDate.slice(0, 10)}"><span>至</span><input class="form-input" id="preDialerEndDate" type="date" value="${preDialerReportFilters.endDate.slice(0, 10)}"></div></label>
          <div class="resource-unfilled-batch-query-actions"><button class="btn-add" type="button" data-ui-action="pre-dialer-query">查询</button><button class="btn-secondary" type="button" data-ui-action="pre-dialer-reset">重置</button></div>
        </div>
        ` : `
        <div class="resource-unfilled-batch-query-title">筛选查询</div>
        <div class="resource-unfilled-batch-query-grid">
          <label>任务系统状态<select class="filter-select" id="preDialerSystemStatus"><option value="all">全部</option><option value="待同步" ${preDialerReportFilters.systemStatus === '待同步' ? 'selected' : ''}>待同步</option><option value="同步失败" ${preDialerReportFilters.systemStatus === '同步失败' ? 'selected' : ''}>同步失败</option><option value="已同步" ${preDialerReportFilters.systemStatus === '已同步' ? 'selected' : ''}>已同步</option><option value="处理完成" ${preDialerReportFilters.systemStatus === '处理完成' ? 'selected' : ''}>处理完成</option></select></label>
          <label>任务异常原因<select class="filter-select" id="preDialerExceptionReason"><option value="all">全部</option><option value="中止外呼任务" ${preDialerReportFilters.exceptionReason === '中止外呼任务' ? 'selected' : ''}>中止外呼任务</option><option value="手机号码黑名单" ${preDialerReportFilters.exceptionReason === '手机号码黑名单' ? 'selected' : ''}>手机号码黑名单</option><option value="店端跟进冲突" ${preDialerReportFilters.exceptionReason === '店端跟进冲突' ? 'selected' : ''}>店端跟进冲突</option></select></label>
          <label>预外呼任务状态<select class="filter-select" id="preDialerStatus"><option value="all">全部</option><option value="处理中" ${preDialerReportFilters.status === '处理中' ? 'selected' : ''}>处理中</option><option value="已完成" ${preDialerReportFilters.status === '已完成' ? 'selected' : ''}>已完成</option></select></label>
          <label>最新外呼结果<select class="filter-select" id="preDialerCallResult"><option value="all">全部</option><option value="空号" ${preDialerReportFilters.callResult === '空号' ? 'selected' : ''}>空号</option><option value="停机" ${preDialerReportFilters.callResult === '停机' ? 'selected' : ''}>停机</option><option value="忙音" ${preDialerReportFilters.callResult === '忙音' ? 'selected' : ''}>忙音</option><option value="不在服务区" ${preDialerReportFilters.callResult === '不在服务区' ? 'selected' : ''}>不在服务区</option><option value="无人接听" ${preDialerReportFilters.callResult === '无人接听' ? 'selected' : ''}>无人接听</option><option value="关机" ${preDialerReportFilters.callResult === '关机' ? 'selected' : ''}>关机</option><option value="用户接通" ${preDialerReportFilters.callResult === '用户接通' ? 'selected' : ''}>用户接通</option><option value="线路拒呼" ${preDialerReportFilters.callResult === '线路拒呼' ? 'selected' : ''}>线路拒呼</option><option value="线路未呼" ${preDialerReportFilters.callResult === '线路未呼' ? 'selected' : ''}>线路未呼</option></select></label>
          <div class="resource-unfilled-batch-query-actions"><button class="btn-add" type="button" data-ui-action="pre-dialer-query">查询</button><button class="btn-secondary" type="button" data-ui-action="pre-dialer-reset">重置</button></div>
        </div>
        <button class="resource-unfilled-batch-more-trigger" type="button" data-ui-action="pre-dialer-toggle-more">更多筛选 <span>${preDialerReportMoreFiltersExpanded ? '收起' : '展开'}</span></button>
        <div class="resource-unfilled-batch-query-more" id="preDialerReportMoreFilters" style="display:${preDialerReportMoreFiltersExpanded ? 'grid' : 'none'}">
          <label>同步日期<div class="resource-unfilled-batch-date-range"><input class="form-input" id="preDialerStartDate" type="datetime-local" value="${preDialerReportFilters.startDate}"><span>至</span><input class="form-input" id="preDialerEndDate" type="datetime-local" value="${preDialerReportFilters.endDate}"></div></label>
          <label>首次外呼时间<div class="resource-unfilled-batch-date-range"><input class="form-input" id="preDialerFirstCallStart" type="datetime-local" value="${preDialerReportFilters.firstCallStart}"><span>至</span><input class="form-input" id="preDialerFirstCallEnd" type="datetime-local" value="${preDialerReportFilters.firstCallEnd}"></div></label>
        </div>
        ${preDialerReportFilters.attentionFocus ? `<div class="predial-attention-filter">正在查看：${({ 'sync-failed': '同步失败任务', 'timeout-pending': '超时未回传任务', 'recording-missing': '录音丢失任务' })[preDialerReportFilters.attentionFocus] || '异常任务'}<button type="button" data-ui-action="pre-dialer-clear-focus">清除定位</button></div>` : ''}
        `}
      </section>
      ` : ''}

      <nav class="precall-tab-bar" aria-label="预外呼监控内容">
        <button class="precall-tab ${preDialerListActiveTab === 'overview' ? 'active' : ''}" type="button" data-ui-action="pre-dialer-tab" data-tab="overview">数据概览</button>
        <button class="precall-tab ${preDialerListActiveTab === 'task' ? 'active' : ''}" type="button" data-ui-action="pre-dialer-tab" data-tab="task">明细列表</button>
        <button class="precall-tab ${preDialerListActiveTab === 'batch' ? 'active' : ''}" type="button" data-ui-action="pre-dialer-tab" data-tab="batch">同步批次汇总</button>
        <button class="precall-tab ${preDialerListActiveTab === 'alert' ? 'active' : ''}" type="button" data-ui-action="pre-dialer-tab" data-tab="alert">预警管理</button>
        <button class="precall-tab ${preDialerListActiveTab === 'automation' ? 'active' : ''}" type="button" data-ui-action="pre-dialer-tab" data-tab="automation">自动化运维与响应</button>
      </nav>

      <div class="predial-content-slot">
      ${preDialerListActiveTab === 'overview' ? `
      <section class="card">
        <div class="lead-toolbar"><div class="lead-toolbar-left"><div class="section-title">数据概览</div><span class="table-count">追踪 DCC培育系统同步至预外呼系统的预外呼核心指标</span></div></div>
        <div class="predial-overview-groups">
          <section class="predial-overview-group">
            <div class="predial-overview-group-title">任务流转与坐席分配<span>关注任务同步和后续线索承接</span></div>
            <div class="predial-overview-grid">
              ${renderPreDialerMetricCard('预外呼任务总量', metrics.totalTasks, '需推送至预外呼', 'flow')}
              ${renderPreDialerMetricCard('已推送任务量', metrics.pushedTasks, `推送率 <strong>${rate(metrics.pushedTasks, metrics.totalTasks)}</strong>`, 'flow')}
              ${renderPreDialerMetricCard('同步失败量', metrics.syncFailedTasks, '任务同步异常', 'flow')}
              ${renderPreDialerMetricCard('已分配坐席（总量）', metrics.assignedAgentsTotal, '去重坐席人数', 'flow')}
              ${renderPreDialerMetricCard('已分配坐席（通话状态 = 坐席接听）', metrics.assignedAgentsAnswered, '接听坐席去重', 'flow')}
              ${renderPreDialerMetricCard('线索下发量', metrics.nevDispatchedTasks, '已下发至 NEV线索中台', 'flow')}
              ${renderPreDialerMetricCard('线索下发量（通话状态 = 坐席接听）', metrics.nevDispatchedSeatAnsweredTasks, '坐席接听后下发', 'flow')}
              ${renderPreDialerMetricCard('线索下发量（通话状态 ≠ 坐席接听）', metrics.nevDispatchedNonSeatAnsweredTasks, '非坐席接听后下发', 'flow')}
            </div>
          </section>
          <section class="predial-overview-group">
            <div class="predial-overview-group-title">外呼与回传监控<span>关注预外呼处理进度、话单回传及通话质量</span></div>
            <div class="predial-overview-grid">
              ${renderPreDialerMetricCard('任务处理中', metrics.processingTasks, `占比 ${rate(metrics.processingTasks, metrics.pushedTasks)}`, 'quality')}
              ${renderPreDialerMetricCard('任务已处理', metrics.handledTasks, `处理率 <strong>${rate(metrics.handledTasks, metrics.pushedTasks)}</strong>`, 'quality')}
              ${renderPreDialerMetricCard('有效任务量', metrics.effectiveOutboundCalls, '剔除无效与待回传任务', 'quality')}
              ${renderPreDialerMetricCard('话单已回传', metrics.returnedCalls, '不按任务去重', 'quality')}
              ${renderPreDialerMetricCard('话单待回传', metrics.pendingCalls, '按任务去重', 'quality')}
              ${renderPreDialerMetricCard('话单超时未回传', metrics.timeoutPendingCalls, '超 24 小时未回传', 'risk')}
              ${renderPreDialerMetricCard('录音丢失量', metrics.recordingMissingCalls, '已回传话单无录音', 'risk')}
              ${renderPreDialerMetricCard('外呼接通量', metrics.connectedCalls, `接通率 <strong>${rate(metrics.connectedCalls, metrics.effectiveOutboundCalls)}</strong>`, 'quality')}
              ${renderPreDialerMetricCard('有效通话量', metrics.effectiveCalls, `有效通话率 <strong>${rate(metrics.effectiveCalls, metrics.connectedCalls)}</strong>`, 'quality')}
              ${renderPreDialerMetricCard('首呼接通率', metrics.firstCallRate, `首次接通 ${metrics.firstCallConnected} / ${metrics.firstCallTotal}`, 'quality')}
              ${renderPreDialerMetricCard('2~N呼接通率', metrics.nonFirstCallRate, `非首次接通 ${metrics.nonFirstCallConnected} / ${metrics.nonFirstCallTotal}`, 'quality')}
              ${renderPreDialerMetricCard('呼叫接通时长', `${metrics.totalDurationSeconds}秒`, '接通通话总时长', 'quality')}
              ${renderPreDialerMetricCard('每通呼叫接通时长', metrics.avgDurationPerAgent, '呼叫接通时长 ÷ 外呼接通量', 'quality')}
              ${renderPreDialerMetricCard('线路拒呼', metrics.lineRejectedCalls, '按话单统计', 'risk')}
              ${renderPreDialerMetricCard('线路未呼', metrics.lineUncalledCalls, '按话单统计', 'risk')}
            </div>
          </section>
        </div>
      </section>
      ` : preDialerListActiveTab === 'task' ? (() => { const taskTotalPages = Math.max(1, Math.ceil(tasks.length / preDialerTaskPageSize)); const taskClampedPage = Math.min(preDialerTaskCurrentPage, taskTotalPages); const taskStart = (taskClampedPage - 1) * preDialerTaskPageSize; const pageTasks = tasks.slice(taskStart, taskStart + preDialerTaskPageSize); return `
      <section class="card">
        <div class="lead-toolbar"><div class="lead-toolbar-left"><div class="section-title">明细列表</div></div><div class="lead-toolbar-right"><button class="btn-secondary" type="button" data-ui-action="pre-dialer-export-tasks">导出数据</button></div></div>
        <div class="lead-table-wrap"><table class="lead-table"><thead><tr><th>同步日期</th><th>人工任务编码</th><th>预外呼任务ID</th><th>总部线索ID</th><th>客户</th><th>意向车系</th><th>任务系统状态</th><th>任务异常原因</th><th>外呼次数</th><th>预外呼任务状态</th><th>最新外呼结果</th><th>首次外呼时间</th><th>首次回传时间</th><th>更新时间</th><th>已下发线索</th><th>操作</th></tr></thead><tbody>${pageTasks.length ? pageTasks.map(task => { const taskCalls = getTaskCallRecords(task.id); const attempts = taskCalls.length; const firstCall = getFirstTaskCallRecord(task.id); const attemptText = attempts ? `${attempts}${attempts > 1 ? ' <span class="precall-status-badge warn">多次</span>' : ''}` : ''; const taskStatus = task.status ? `<span class="predial-task-status ${task.status === '已完成' ? 'complete' : task.overdue ? 'overdue' : ''}">${task.overdue ? '处理中（超时）' : task.status}</span>` : ''; const latestResult = getLatestTaskCallRecord(task.id)?.result || ''; return `<tr><td>${formatPreDialerDisplayDate(task.syncDate)}</td><td>${task.manualTaskCode || '—'}</td><td>${task.id}</td><td>${task.leadId}</td><td>${task.customer}<div class="predial-call-result">${task.mobile}</div></td><td>${task.series}</td><td>${task.systemStatus}</td><td>${formatPreDialerExceptionReason(task.systemExceptionReason)}</td><td>${attemptText}</td><td>${taskStatus}</td><td>${latestResult}</td><td>${firstCall?.callTime || '—'}</td><td>${firstCall?.returnedAt || '—'}</td><td>${formatPreDialerDisplayDate(task.updatedAt)}</td><td>${task.nevDispatched ? '是' : '否'}</td><td><button class="action-btn view" type="button" onclick="openPreDialerTaskDetail('${task.id}')">查看</button></td></tr>`; }).join('') : '<tr><td colspan="16"><div class="empty-state">当前筛选条件下暂无预外呼任务</div></td></tr>'}</tbody></table></div>
        <div class="pagination">
          <span id="preDialerTaskPageInfo">共 ${tasks.length} 条记录，当前第 ${taskClampedPage} / ${taskTotalPages} 页</span>
          <div class="pagination-btns">
            <select class="hit-page-size" id="preDialerTaskPageSizeSelect" data-ui-action="pre-dialer-task-page-size">
              <option value="5" ${preDialerTaskPageSize === 5 ? 'selected' : ''}>每页 5 条</option>
              <option value="10" ${preDialerTaskPageSize === 10 ? 'selected' : ''}>每页 10 条</option>
              <option value="20" ${preDialerTaskPageSize === 20 ? 'selected' : ''}>每页 20 条</option>
              <option value="50" ${preDialerTaskPageSize === 50 ? 'selected' : ''}>每页 50 条</option>
            </select>
            <button class="page-btn" type="button" data-ui-action="pre-dialer-task-page" data-direction="-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <select class="hit-page-size" id="preDialerTaskPageSelect" data-ui-action="pre-dialer-task-page-select">${Array.from({ length: taskTotalPages }, (_, idx) => `<option value="${idx + 1}" ${idx + 1 === taskClampedPage ? 'selected' : ''}>第 ${idx + 1} 页</option>`).join('')}</select>
            <button class="page-btn" type="button" data-ui-action="pre-dialer-task-page" data-direction="1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
          </div>
        </div>
      </section>
      `; })() : preDialerListActiveTab === 'batch' ? (() => { const batchTotalPages = Math.max(1, Math.ceil(dates.length / preDialerBatchPageSize)); const batchClampedPage = Math.min(preDialerBatchCurrentPage, batchTotalPages); const batchStart = (batchClampedPage - 1) * preDialerBatchPageSize; const pageDates = dates.slice(batchStart, batchStart + preDialerBatchPageSize); return `
      <section class="card">
        <div class="lead-toolbar"><div class="lead-toolbar-left"><div class="section-title">同步批次汇总</div><span class="table-count">按同步日期统计，与概览指标口径一致</span></div><div class="lead-toolbar-right"><button class="btn-secondary" type="button" data-ui-action="pre-dialer-export-batches">导出数据</button></div></div>
        ${renderPreDialerBatchTable(pageDates, dates, tasks, calls)}
        <div class="pagination">
          <span>共 ${dates.length} 条记录，当前第 ${batchClampedPage} / ${batchTotalPages} 页</span>
          <div class="pagination-btns">
            <select class="hit-page-size" data-ui-action="pre-dialer-batch-page-size">
              <option value="5" ${preDialerBatchPageSize === 5 ? 'selected' : ''}>每页 5 条</option>
              <option value="10" ${preDialerBatchPageSize === 10 ? 'selected' : ''}>每页 10 条</option>
              <option value="20" ${preDialerBatchPageSize === 20 ? 'selected' : ''}>每页 20 条</option>
              <option value="50" ${preDialerBatchPageSize === 50 ? 'selected' : ''}>每页 50 条</option>
            </select>
            <button class="page-btn" type="button" data-ui-action="pre-dialer-batch-page" data-direction="-1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <select class="hit-page-size" data-ui-action="pre-dialer-batch-page-select">${Array.from({ length: batchTotalPages }, (_, idx) => `<option value="${idx + 1}" ${idx + 1 === batchClampedPage ? 'selected' : ''}>第 ${idx + 1} 页</option>`).join('')}</select>
            <button class="page-btn" type="button" data-ui-action="pre-dialer-batch-page" data-direction="1"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
          </div>
        </div>
      </section>
      `; })() : renderPreDialerOperationsTab(preDialerListActiveTab)}
      </div>
    </div>
  `;
  page.querySelectorAll('.predial-filter-panel').forEach(mountFilterQueryPanel);
  enhancePreDialerOverflowTitles(page);
}

function enhancePreDialerOverflowTitles(scope) {
  if (!scope) return;
  scope.querySelectorAll('.lead-table th, .lead-table td').forEach(cell => {
    const text = cell.innerText.replace(/\s+/g, ' ').trim();
    if (text) cell.setAttribute('title', text);
  });
  scope.querySelectorAll('.lead-table .predial-call-result').forEach(item => {
    const text = item.innerText.replace(/\s+/g, ' ').trim();
    if (text) item.setAttribute('title', text);
  });
}

function switchPreDialerListTab(tab) {
  preDialerListActiveTab = tab;
  preDialerTaskCurrentPage = 1;
  preDialerBatchCurrentPage = 1;
  renderPreCallReportPage();
}

let preDialerAlerts = [
  { id: 'ALT-20260622-001', level: 'P1', type: '话单回传超时', target: 'PD-20260622-003', triggerAt: '2026-06-22 16:05', status: '待确认', owner: '系统运维', action: '已发起话单补拉' },
  { id: 'ALT-20260622-002', level: 'P2', type: '同步失败', target: 'PD-20260621-004', triggerAt: '2026-06-22 15:42', status: '处理中', owner: 'DCC运营', action: '已自动重试 2 次' }
];

let preDialerAutomationJobs = [
  { id: 'AUTO-001', name: '同步失败自动重试', trigger: '系统状态 = 同步失败', action: '指数退避重试，最多 3 次', status: '运行中', success: '24 / 26', lastRun: '2026-06-22 15:45' },
  { id: 'AUTO-002', name: '话单超时自动补拉', trigger: '回传超过 24 小时', action: '调用预外呼话单补拉接口', status: '运行中', success: '18 / 18', lastRun: '2026-06-22 16:05' },
  { id: 'AUTO-003', name: '录音缺失自动补偿', trigger: '已回传且录音为空', action: '重新获取录音地址', status: '已暂停', success: '9 / 10', lastRun: '2026-06-21 18:20' }
];

const preDialerAutomationLogs = [
  ['2026-06-22 16:05', 'AUTO-002', '话单超时自动补拉', 'PD-20260622-003', '补拉请求已发起', '成功'],
  ['2026-06-22 15:45', 'AUTO-001', '同步失败自动重试', 'PD-20260621-004', '第 2 次重试提交', '处理中'],
  ['2026-06-22 09:36', 'AUTO-001', '同步失败自动重试', 'PD-20260621-005', '状态一致性校验', '成功']
];

function renderPreDialerOperationsTab(tab) {
  return tab === 'alert' ? renderPreDialerAlertPhase2() : renderPreDialerAutomationPhase2();
}
function renderPreDialerAlertPhase2() {
  const openCount = preDialerAlerts.filter(item => item.status !== '已关闭').length;
  return `<div class="summary-strip"><div class="summary-card"><div class="summary-label">当前待处置预警</div><div class="summary-value">${openCount}</div></div><div class="summary-card"><div class="summary-label">P1 紧急预警</div><div class="summary-value">${preDialerAlerts.filter(item => item.level === 'P1' && item.status !== '已关闭').length}</div></div><div class="summary-card"><div class="summary-label">通知升级中</div><div class="summary-value">1</div></div></div><section class="card"><div class="lead-toolbar"><div class="lead-toolbar-left"><div class="section-title">预警事件中心</div><span class="table-count">已关联自动处置和责任人</span></div></div><div class="lead-table-wrap"><table class="lead-table"><thead><tr><th>预警编号</th><th>等级</th><th>预警类型</th><th>关联任务</th><th>自动处置</th><th>责任人</th><th>状态</th><th>操作</th></tr></thead><tbody>${preDialerAlerts.map(item => `<tr><td>${item.id}</td><td><span class="precall-alert-level ${item.level === 'P2' ? 'p2' : ''}">${item.level}</span></td><td>${item.type}</td><td>${item.target}</td><td>${item.action}</td><td>${item.owner}</td><td><span class="predial-task-status ${item.status === '已关闭' ? 'complete' : item.status === '待确认' ? 'overdue' : ''}">${item.status}</span></td><td>${item.status === '待确认' ? `<button class="action-btn view" type="button" onclick="confirmPreDialerAlert('${item.id}')">确认</button>` : ''} ${item.status !== '已关闭' ? `<button class="action-btn view" type="button" onclick="closePreDialerAlert('${item.id}')">关闭</button>` : ''}</td></tr>`).join('')}</tbody></table></div></section><section class="card"><div class="lead-toolbar"><div class="lead-toolbar-left"><div class="section-title">预警规则与通知升级</div><span class="table-count">阈值、合并、抑制与升级</span></div><div class="lead-toolbar-right"><button class="btn-secondary" type="button" onclick="showToast('预警规则配置原型已预留', true)">规则配置</button></div></div><div class="lead-table-wrap"><table class="lead-table"><thead><tr><th>规则名称</th><th>触发条件</th><th>等级</th><th>通知对象</th><th>未确认升级</th><th>重复告警策略</th><th>状态</th></tr></thead><tbody><tr><td>话单回传超时</td><td>回传超过 24 小时</td><td>P1</td><td>系统运维、DCC运营</td><td>5 分钟升级至运维主管</td><td>同任务 30 分钟合并</td><td>启用</td></tr><tr><td>同步失败率异常</td><td>15 分钟失败率 ≥ 5%</td><td>P2</td><td>DCC运营</td><td>30 分钟升级至业务负责人</td><td>同接口 15 分钟合并</td><td>启用</td></tr><tr><td>录音缺失</td><td>已回传且录音为空</td><td>P2</td><td>系统运维</td><td>60 分钟创建人工工单</td><td>按批次合并</td><td>启用</td></tr></tbody></table></div></section>`;
}

function renderPreDialerAutomationPhase2() {
  return `<div class="summary-strip"><div class="summary-card"><div class="summary-label">运行中自动化</div><div class="summary-value">${preDialerAutomationJobs.filter(item => item.status === '运行中').length}</div></div><div class="summary-card"><div class="summary-label">今日自动处置</div><div class="summary-value">42</div></div><div class="summary-card"><div class="summary-label">自动修复成功率</div><div class="summary-value">96.2%</div></div></div><section class="card"><div class="lead-toolbar"><div class="lead-toolbar-left"><div class="section-title">自动化编排与响应</div><span class="table-count">自动补偿、限次重试与人工接管</span></div></div><div class="lead-table-wrap"><table class="lead-table"><thead><tr><th>任务ID</th><th>自动化任务</th><th>触发条件</th><th>自动响应</th><th>状态</th><th>最近执行</th><th>操作</th></tr></thead><tbody>${preDialerAutomationJobs.map(item => `<tr><td>${item.id}</td><td>${item.name}</td><td>${item.trigger}</td><td>${item.action}</td><td><span class="predial-task-status ${item.status === '运行中' ? 'complete' : ''}">${item.status}</span></td><td>${item.lastRun}</td><td><button class="action-btn view" type="button" onclick="runPreDialerAutomation('${item.id}')">立即执行</button> <button class="action-btn view" type="button" onclick="togglePreDialerAutomation('${item.id}')">${item.status === '运行中' ? '暂停' : '启用'}</button></td></tr>`).join('')}</tbody></table></div></section><section class="card"><div class="lead-toolbar"><div class="lead-toolbar-left"><div class="section-title">数据对账与自动修复</div><span class="table-count">预外呼任务、同步状态、话单与录音一致性核对</span></div><div class="lead-toolbar-right"><button class="btn-add" type="button" onclick="runPreDialerReconciliation()">立即对账</button></div></div><div class="lead-table-wrap"><table class="lead-table"><thead><tr><th>对账批次</th><th>对账范围</th><th>预外呼任务总量</th><th>已推送任务量</th><th>同步失败量</th><th>话单已回传</th><th>录音丢失量</th><th>差异数</th><th>自动修复</th><th>状态</th></tr></thead><tbody><tr><td>REC-20260622-001</td><td>2026/6/22</td><td>3</td><td>3</td><td>1</td><td>4</td><td>0</td><td>1</td><td>已补拉 1 条话单</td><td>已完成</td></tr><tr><td>REC-20260621-001</td><td>2026/6/21</td><td>2</td><td>2</td><td>1</td><td>3</td><td>0</td><td>0</td><td>无需修复</td><td>已完成</td></tr></tbody></table></div></section><div class="precall-analysis-grid"><section class="precall-report-panel"><div class="precall-report-panel-title">SLA 趋势</div><div class="precall-funnel-row"><span class="precall-funnel-label">同步成功率</span><span class="precall-funnel-track"><span class="precall-funnel-value" style="width:98%"></span></span><span class="precall-funnel-count">98.0%</span></div><div class="precall-funnel-row"><span class="precall-funnel-label">回传及时率</span><span class="precall-funnel-track"><span class="precall-funnel-value" style="width:96%"></span></span><span class="precall-funnel-count">96.0%</span></div><div class="precall-funnel-row"><span class="precall-funnel-label">自动修复成功率</span><span class="precall-funnel-track"><span class="precall-funnel-value" style="width:96%"></span></span><span class="precall-funnel-count">96.2%</span></div></section><section class="precall-report-panel"><div class="precall-report-panel-title">责任处理分析</div><div class="precall-funnel-row"><span class="precall-funnel-label">系统运维</span><span class="precall-funnel-track"><span class="precall-funnel-value" style="width:90%"></span></span><span class="precall-funnel-count">平均 8 分钟</span></div><div class="precall-funnel-row"><span class="precall-funnel-label">DCC运营</span><span class="precall-funnel-track"><span class="precall-funnel-value" style="width:82%"></span></span><span class="precall-funnel-count">平均 15 分钟</span></div></section></div>`;
}

let preDialerAlertRecipientAccounts = {
  call: ['U10077', 'U10008'],
  sync: ['U10008', 'U10032'],
  recording: ['U10077']
};

function getPreDialerAlertRecipientConfig(type) {
  const configs = {
    call: { hidden: 'alertRuleCallReceivers', trigger: 'alertRuleCallReceiverTrigger', panel: 'alertRuleCallReceiverPanel', list: 'alertRuleCallReceiverList', count: 'alertRuleCallReceiverCount', placeholder: '请选择通知账号人员' },
    sync: { hidden: 'alertRuleSyncReceivers', trigger: 'alertRuleSyncReceiverTrigger', panel: 'alertRuleSyncReceiverPanel', list: 'alertRuleSyncReceiverList', count: 'alertRuleSyncReceiverCount', placeholder: '请选择通知账号人员' },
    recording: { hidden: 'alertRuleRecordingReceivers', trigger: 'alertRuleRecordingReceiverTrigger', panel: 'alertRuleRecordingReceiverPanel', list: 'alertRuleRecordingReceiverList', count: 'alertRuleRecordingReceiverCount', placeholder: '请选择通知账号人员' }
  };
  return configs[type] || configs.call;
}

function renderPreDialerAlertRecipientPicker(type) {
  const config = getPreDialerAlertRecipientConfig(type);
  const selected = preDialerAlertRecipientAccounts[type] || [];
  renderAccountMultiPicker({
    selectedAccounts: selected,
    users: reviewUserOptions,
    formatLabel: formatReviewUserLabel,
    hiddenId: config.hidden,
    triggerId: config.trigger,
    countId: config.count,
    listId: config.list,
    placeholder: config.placeholder,
    onchange: () => `togglePreDialerAlertRecipientSelection('${type}', this)`
  });
}

function togglePreDialerAlertRecipientPicker(type) {
  const config = getPreDialerAlertRecipientConfig(type);
  document.querySelectorAll('#preDialerAlertRuleModal .account-picker-panel').forEach(panel => {
    if (panel.id !== config.panel) panel.classList.remove('show');
  });
  document.getElementById(config.panel)?.classList.toggle('show');
  renderPreDialerAlertRecipientPicker(type);
}

function togglePreDialerAlertRecipientSelection(type, input) {
  const selected = preDialerAlertRecipientAccounts[type] || [];
  preDialerAlertRecipientAccounts[type] = updateSelectedValues(selected, input.value, input.checked);
  renderPreDialerAlertRecipientPicker(type);
}

function selectAllPreDialerAlertRecipients(type) {
  preDialerAlertRecipientAccounts[type] = reviewUserOptions.map(user => user.account);
  renderPreDialerAlertRecipientPicker(type);
}

function clearPreDialerAlertRecipients(type) {
  preDialerAlertRecipientAccounts[type] = [];
  renderPreDialerAlertRecipientPicker(type);
}

function openPreDialerAlertRuleConfig() {
  document.getElementById('preDialerAlertRuleModal')?.classList.add('show');
  renderPreDialerAlertRecipientPicker('call');
  renderPreDialerAlertRecipientPicker('sync');
  renderPreDialerAlertRecipientPicker('recording');
}

function savePreDialerAlertRuleConfig() {
  const timeout = document.getElementById('alertRuleCallTimeout')?.value;
  const rate = document.getElementById('alertRuleSyncRate')?.value;
  if (!timeout || !rate) {
    showToast('请完整填写预警阈值后再保存', false);
    return;
  }
  closeModal('preDialerAlertRuleModal');
  showToast('预警规则配置已保存并生效', true);
}

// 兼容已渲染的第二期原型按钮：点击“规则配置”直接打开配置面板。
document.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (button?.textContent.trim() === '规则配置') {
    openPreDialerAlertRuleConfig();
  }
});

function runPreDialerReconciliation() { showToast('对账任务已启动，完成后将自动生成差异与修复记录', true); }

function confirmPreDialerAlert(id) { const item = preDialerAlerts.find(alert => alert.id === id); if (!item) return; item.status = '处理中'; item.owner = 'DCC运营'; renderPreCallReportPage(); showToast('预警已确认并分派处理', true); }
function closePreDialerAlert(id) { const item = preDialerAlerts.find(alert => alert.id === id); if (!item) return; item.status = '已关闭'; renderPreCallReportPage(); showToast('预警已关闭，处置记录已留存', true); }
function runPreDialerAutomation(id) { const item = preDialerAutomationJobs.find(job => job.id === id); if (!item) return; item.lastRun = '刚刚'; renderPreCallReportPage(); showToast(`${item.name}已手动执行`, true); }
function togglePreDialerAutomation(id) { const item = preDialerAutomationJobs.find(job => job.id === id); if (!item) return; item.status = item.status === '运行中' ? '已暂停' : '运行中'; renderPreCallReportPage(); showToast(`${item.name}${item.status === '运行中' ? '已启用' : '已暂停'}`, true); }

function changePreDialerTaskPageSize(value) {
  preDialerTaskPageSize = Number(value) || 10;
  preDialerTaskCurrentPage = 1;
  renderPreCallReportPage();
}

function selectPreDialerTaskPage(value) {
  preDialerTaskCurrentPage = Number(value) || 1;
  renderPreCallReportPage();
}

function changePreDialerTaskPage(dir) {
  const filteredTasks = getFilteredPreDialerTasks();
  const totalPages = Math.max(1, Math.ceil(filteredTasks.length / preDialerTaskPageSize));
  preDialerTaskCurrentPage = Math.max(1, Math.min(totalPages, preDialerTaskCurrentPage + dir));
  renderPreCallReportPage();
}

function changePreDialerBatchPageSize(value) {
  preDialerBatchPageSize = Number(value) || 10;
  preDialerBatchCurrentPage = 1;
  renderPreCallReportPage();
}

function selectPreDialerBatchPage(value) {
  preDialerBatchCurrentPage = Number(value) || 1;
  renderPreCallReportPage();
}

function changePreDialerBatchPage(dir) {
  const filteredTasks = getFilteredPreDialerTasks();
  const dates = [...new Set(filteredTasks.map(task => task.syncDate))].sort().reverse();
  const totalPages = Math.max(1, Math.ceil(dates.length / preDialerBatchPageSize));
  preDialerBatchCurrentPage = Math.max(1, Math.min(totalPages, preDialerBatchCurrentPage + dir));
  renderPreCallReportPage();
}

function showPreDialerMetricInfo(metric, element) {
  const ev = window.event;
  if (ev) {
    ev.stopPropagation();
    if (ev.preventDefault) ev.preventDefault();
  }
  const descriptions = {
    '预外呼任务总量': '截止至今 DCC培育系统分配至人工客服，且分配至预外呼系统的任务总数。',
    '已推送任务量': 'DCC培育系统已向预外呼系统发起推送的任务数，不含仍处于待同步/同步失败状态的任务。推送率 = 已推送任务量 ÷ 预外呼任务总量 × 100%',
    '同步失败量': 'DCC培育系统向预外呼系统同步失败的去重任务数，需要结合任务异常原因进行重试或人工处理。',
    '任务处理中': '预外呼系统仍在处理中，尚未回传最终处理结果的去重任务数。占比 = 任务处理中 ÷ 推送任务量 × 100%',
    '任务已处理': '预外呼系统已完成处理，已接收到最终处理结果的去重任务数。处理率 = 任务已处理 ÷ 推送任务量 × 100%',
    '话单已回传': '预外呼系统已将外呼结果成功回传至 DCC培育系统的话单数量，按话单统计，不按任务去重。',
    '话单待回传': '预外呼系统未回传首次话单结果的任务数量，按任务去重。',
    '话单超时未回传': '已超过 24 小时且尚未收到预外呼系统未回传首次话单结果的任务数量，按任务去重，需要核查接口或补偿任务。',
    '录音丢失量': '已回传话单中未获取到有效录音文件或录音地址的话单数量，按话单统计，不按任务去重。',
    '外呼接通量': '话单结果标识为成功建联的外呼次数，去重任务数。接通率 = 外呼接通量 ÷ 有效任务量 × 100%',
    '接通率': '接通率 = 外呼接通量 ÷ 有效任务量 × 100%',
    '有效任务量': '有效任务量 = 推送任务量 -（线路拒呼且外呼已完成任务 + 线路未呼且外呼已完成任务 + 存在待回传话单的任务 + 任务中止 + 用户黑名单）',
    '有效通话量': '成功建联且通话时长不少于 30 秒的外呼次数。有效通话率 = 有效通话量 ÷ 外呼接通量 × 100%',
    '有效通话率': '有效通话率 = 有效通话量 ÷ 外呼接通量 × 100%',
    '线路拒呼': '外呼结果为线路拒呼的话单数量，表示预外呼系统因线路侧限制拒绝发起本次外呼，按话单统计，不按任务去重。',
    '线路未呼': '外呼结果为线路未呼的话单数量，表示预外呼系统已接收任务但线路侧未实际发起呼叫，按话单统计，不按任务去重。',
    '已分配坐席（总量）': '统计周期内已承接预外呼任务的去重坐席人数，待同步/同步失败任务不计入。',
    '已分配坐席（通话状态 = 坐席接听）': '统计周期内存在坐席接听话单的去重坐席人数。',
    '线索下发量（通话状态 = 坐席接听）': '已下发至 NEV线索中台，出现坐席接听记录的去重任务数，用于识别接听场景下的下发量。',
    '线索下发量（通话状态 ≠ 坐席接听）': '已下发至 NEV线索中台，但未出现坐席接听记录的去重任务数，用于识别非接听场景下的下发量。',
    '首呼接通率': '话单结果标识为成功建联的外呼次数，且回传首次话单结果的外呼数据。首呼接通率 = 首次呼叫接通 ÷ 有效任务量 × 100%',
    '2~N呼接通率': '话单结果标识为成功建联的外呼次数，且回传非首次话单结果的外呼数据。2~N呼接通率 = 非首次呼叫接通 ÷ 有效任务量 × 100%',
    '呼叫接通时长': '话单结果标识为成功建联的通话总时长，同一任务多次接通会分别计入',
    '每通呼叫接通时长': '每通呼叫接通时长 = 呼叫接通时长 ÷ 外呼接通量',
    '人均日承载量': '人均日承载量 = 坐席接听线索数 ÷ 去重坐席人数',
    '同步成功率': 'DCC 成功被预外呼系统接收的任务数 ÷ DCC 发起同步的任务数。用于监控两系统接口接入是否稳定。',
    '首呼及时率': '在同步后 30 分钟内完成首次外呼的任务数 ÷ 已同步任务数。用于衡量预外呼系统的响应效率。',
    '任务完成率': '处理状态为“已完成”的任务数 ÷ 已同步任务数。处理中、超时任务不计入完成。',
    '建联成功率': '至少存在一次成功建联话单的去重任务数 ÷ 已同步任务数。同一任务多次建联仅计 1 个任务。',
    '预约到店率': '结果为“预约到店”的任务数 ÷ 建联成功任务数。用于衡量建联后的商机转化质量。',
    '话单回传完整率': '已回传话单数 ÷ 已发起外呼话单总数。按每次外呼计算，不按任务去重。',
    '同步任务': '统计周期内由 DCC 成功同步至预外呼系统的去重任务数。',
    '已完成任务': '预外呼系统已完成处理并回传最终状态的去重任务数。',
    '平均外呼次数': '已发起外呼话单总数 ÷ 已同步任务数，用于观察任务重试频次。',
    '多次外呼任务': '存在 2 次及以上外呼话单的去重任务数，需要结合建联结果评估重试价值与骚扰风险。',
    '建联成功任务': '至少有一条话单标识为成功建联的去重任务数。',
    '有效通话次数': '建联成功且通话时长不少于 30 秒的外呼话单数。',
    '处理超时任务': '同步至预外呼系统后超过 SLA 时限仍处于“处理中”的任务数。',
    '超时处理中任务': '同步至预外呼系统后超过 SLA 时限仍处于“处理中”的任务数。',
    '未接听话单': '结果为“客户未接听”的外呼话单数，用于评估时段和号码触达质量。',
    '待回传话单': '已发起但尚未收到预外呼系统回传结果的外呼话单数。'
  };
  const prefix = metric;
  const popover = document.getElementById('metricInfoPopover');
  const trigger = element || window.event?.target?.closest?.('.predial-metric-card') || document.activeElement?.closest('.predial-metric-card');
  if (!popover || !trigger) return;
  document.querySelectorAll('#preCallReportPage .predial-metric-card').forEach(card => card.classList.remove('metric-info-active'));
  trigger.classList.add('metric-info-active');
  const action = `<button class="metric-info-popover-action" type="button" data-ui-action="pre-dialer-open-metric-rule" data-metric="${metric}">点击查看指标规则 →</button>`;
  popover.innerHTML = `<div class="metric-info-popover-head"><div class="metric-info-popover-title">${prefix} · 指标说明</div><button class="metric-info-popover-close" type="button" aria-label="关闭指标说明" data-ui-action="pre-dialer-close-metric-info">×</button></div><div class="metric-info-popover-body">${descriptions[metric] || '已下发至 NEV线索中台'}</div>${action}`;
  popover.classList.add('show');
  const rect = trigger.getBoundingClientRect();
  const width = Math.min(360, window.innerWidth - 32);
  const left = Math.max(16, Math.min(rect.left, window.innerWidth - width - 16));
  let top = rect.bottom + 10;
  if (top + popover.offsetHeight > window.innerHeight - 16) top = Math.max(16, rect.top - popover.offsetHeight - 10);
  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

function closePreDialerMetricInfo() {
  document.getElementById('metricInfoPopover')?.classList.remove('show');
  document.querySelectorAll('#preCallReportPage .predial-metric-card').forEach(card => card.classList.remove('metric-info-active'));
  document.querySelectorAll('.worry-free-metric-button').forEach(card => card.classList.remove('metric-info-active'));
}

function showWorryFreeMetricInfo(metric, element) {
  const ev = window.event;
  if (ev) {
    ev.stopPropagation();
    if (ev.preventDefault) ev.preventDefault();
  }
  const descriptions = {
    '累计总量': '当前统计周期内，三无忧流程的累计线索总量。',
    '去重过滤': '候选线索中因已建联，命中黑名单或同手机号重复等规则被过滤的线索数量。',
    '短信成功率': '短信发送成功量 ÷ 实际发起短信量，发送失败的短信将按重试规则继续处理。',
    'DCC培育任务': '完成三无忧筛选与触达后，已成功生成并进入DCC培育流程的任务数量。',
    '同步失败量': '三无忧任务同步至DCC培育流程时发生异常的数量，系统将按重试策略自动补偿，持续失败需人工核查',
    '滚存待推送': '因每日限制而未在本批次推送的线索数量，将按规则顺延至后续批次。',
  };
  const popover = document.getElementById('metricInfoPopover');
  const trigger = element || window.event?.target?.closest?.('.worry-free-metric-button') || document.activeElement?.closest('.worry-free-metric-button');
  if (!popover || !trigger) return;
  closePreDialerMetricInfo();
  trigger.classList.add('metric-info-active');
  const action = `<button class="metric-info-popover-action" type="button" data-ui-action="pre-dialer-open-metric-rule" data-metric="${metric}">点击查看指标规则 →</button>`;
  popover.innerHTML = `<div class="metric-info-popover-head"><div class="metric-info-popover-title">${metric} · 指标说明</div><button class="metric-info-popover-close" type="button" aria-label="关闭指标说明" data-ui-action="pre-dialer-close-metric-info">×</button></div><div class="metric-info-popover-body">${descriptions[metric] || '用于监控三无忧批次处理表现，请结合批次记录和明细数据综合判断。'}</div>${action}`;
  popover.classList.add('show');
  const rect = trigger.getBoundingClientRect();
  const width = Math.min(360, window.innerWidth - 32);
  const left = Math.max(16, Math.min(rect.left, window.innerWidth - width - 16));
  let top = rect.bottom + 10;
  if (top + popover.offsetHeight > window.innerHeight - 16) top = Math.max(16, rect.top - popover.offsetHeight - 10);
  popover.style.left = `${left}px`;
  popover.style.top = `${top}px`;
}

document.addEventListener('click', event => {
  const popover = document.getElementById('metricInfoPopover');
  if (!popover?.classList.contains('show')) return;
  if (popover.contains(event.target) || event.target.closest('.predial-metric-card') || event.target.closest('.worry-free-metric-button')) return;
  closePreDialerMetricInfo();
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape') closePreDialerMetricInfo();
});

function queryPreDialerReport() {
  const startInput = document.getElementById('preDialerStartDate');
  const endInput = document.getElementById('preDialerEndDate');
  const startDate = startInput.type === 'date' ? `${startInput.value}T00:00` : startInput.value;
  const endDate = endInput.type === 'date' ? `${endInput.value}T23:59` : endInput.value;
  const getFilterValue = (id, fallback = '') => document.getElementById(id)?.value ?? fallback;
  const firstCallStart = getFilterValue('preDialerFirstCallStart');
  const firstCallEnd = getFilterValue('preDialerFirstCallEnd');
  if (!startDate || !endDate || startDate > endDate) return showToast('请设置有效的同步日期范围', false);
  if (firstCallStart && firstCallEnd && firstCallStart > firstCallEnd) return showToast('请设置有效的首次外呼时间范围', false);
  preDialerReportFilters = { startDate, endDate, firstCallStart, firstCallEnd, status: getFilterValue('preDialerStatus', 'all'), systemStatus: getFilterValue('preDialerSystemStatus', 'all'), exceptionReason: getFilterValue('preDialerExceptionReason', 'all'), callResult: getFilterValue('preDialerCallResult', 'all'), keyword: '', attentionFocus: '' };
  preDialerTaskCurrentPage = 1;
  preDialerBatchCurrentPage = 1;
  renderPreCallReportPage();
}

function resetPreDialerReportFilters() {
  preDialerReportFilters = { startDate: '2026-06-20T00:00', endDate: '2026-06-22T23:59', firstCallStart: '', firstCallEnd: '', status: 'all', systemStatus: 'all', exceptionReason: 'all', callResult: 'all', keyword: '', attentionFocus: '' };
  preDialerReportMoreFiltersExpanded = false;
  preDialerTaskCurrentPage = 1;
  preDialerBatchCurrentPage = 1;
  renderPreCallReportPage();
}

function togglePreDialerReportMoreFilters() {
  preDialerReportMoreFiltersExpanded = !preDialerReportMoreFiltersExpanded;
  const moreFilters = document.getElementById('preDialerReportMoreFilters');
  const trigger = document.querySelector('#preCallReportPage .resource-unfilled-batch-more-trigger');
  if (moreFilters) moreFilters.style.display = preDialerReportMoreFiltersExpanded ? 'grid' : 'none';
  if (trigger) trigger.innerHTML = `更多筛选 <span>${preDialerReportMoreFiltersExpanded ? '收起' : '展开'}</span>`;
}

registerUiAction('pre-dialer-query', queryPreDialerReport);
registerUiAction('pre-dialer-reset', resetPreDialerReportFilters);
registerUiAction('pre-dialer-toggle-more', togglePreDialerReportMoreFilters);
registerUiAction('pre-dialer-tab', target => switchPreDialerListTab(target.dataset.tab));
registerUiAction('pre-dialer-metric-info', target => showPreDialerMetricInfo(target.dataset.metric, target));
registerUiAction('pre-dialer-close-metric-info', closePreDialerMetricInfo);
registerUiAction('pre-dialer-open-metric-rule', target => openMetricRuleModal(target.dataset.metric));
registerUiAction('pre-dialer-clear-focus', () => {
  preDialerReportFilters.attentionFocus = '';
  preDialerTaskCurrentPage = 1;
  renderPreCallReportPage();
});
registerUiAction('pre-dialer-export-tasks', exportPreDialerTasks);
registerUiAction('pre-dialer-export-batches', exportPreDialerBatchSummary);
registerUiAction('pre-dialer-task-page-size', target => changePreDialerTaskPageSize(target.value));
registerUiAction('pre-dialer-task-page-select', target => selectPreDialerTaskPage(target.value));
registerUiAction('pre-dialer-task-page', target => changePreDialerTaskPage(Number(target.dataset.direction)));
registerUiAction('pre-dialer-batch-page-size', target => changePreDialerBatchPageSize(target.value));
registerUiAction('pre-dialer-batch-page-select', target => selectPreDialerBatchPage(target.value));
registerUiAction('pre-dialer-batch-page', target => changePreDialerBatchPage(Number(target.dataset.direction)));

function openMetricRuleModal(metric) {
  closePreDialerMetricInfo();
  const modal = document.getElementById('metricRuleModal');
  const title = document.getElementById('metricRuleModalTitle');
  const body = document.getElementById('metricRuleModalBody');
  if (!modal || !title || !body) return;

  title.innerText = `${metric} · 指标口径与规则`;

  const rules = {
    '累计总量': {
      desc: '当前统计周期内，三无忧流程的累计线索总量。',
      formula: '三无忧流程的累计线索总量',
      sla: '数据接收接口响应时间 ≤ 200ms。',
      selfHealing: `若因系统故障导致计算中断，后台自动任务每 30 分钟进行漏斗回溯补偿，确保线索无遗漏。限制在允许的推送数据时间段（<strong style="color:#2563eb">${document.getElementById('worryFreeCallTime')?.value || '09:30 - 18:00'}</strong>）且避开禁止推送时间段（<strong style="color:#2563eb">${document.getElementById('worryFreeQuietTime')?.value || '12:00 - 14:00 / 15:00 - 15:30'}</strong>）下发。`
    },
    '去重过滤': {
      desc: '在候选线索中，因命中已建联、黑名单或同一手机号限定时间内仅推送一次等去重规则被排除的线索数量。',
      formula: `AI去重窗口 <strong style="color:#2563eb">T-${document.getElementById('worryFreeAiDedupeWindow')?.value || '30'}</strong> + 人工去重窗口 <strong style="color:#2563eb">T-${document.getElementById('worryFreeManualDedupeWindow')?.value || '30'}</strong> + 同号推送窗口 <strong style="color:#2563eb">T-${document.getElementById('worryFreeSinglePhonePushWindow')?.value || '30'}</strong> + NEV线索重复跟进 + 黑名单用户 + 已超容量 + 批次处理超频`,
      sla: '去重处理时延 ≤ 1.5 秒，保证判定实时性。',
      selfHealing: '黑名单及去重库每小时自动进行一次增量同步与缓存刷新，避免旧数据拦截新线索。'
    },
    '短信成功率': {
      desc: '实际发送成功的短信数量占发起短信总量的百分比。发送失败的短信将按重试规则继续处理。',
      formula: `使用短信模板（<strong style="color:#2563eb">${document.getElementById('worryFreeSmsTemplate')?.value || '冷线索-三无忧'}</strong>）发送成功量 ÷ 实际发起短信量 × 100%`,
      sla: 'SLA 要求 ≥ 95.0%（运营商通道正常情况下）。',
      selfHealing: '对于发送状态为“提交失败”或“超时未达”的短信，系统将在 15 分钟后自动切换至备用短信通道发起重试，单次推送最多重试 3 次。'
    },
    'DCC培育任务': {
      desc: '线索通过三无忧触达、初筛且满足下发标准后，在 DCC 培育系统中成功生成的线索培育任务总量。',
      formula: `根据分层标签映射规则按权重推送培育任务。当前分层映射包含：<div style="background: #ffffff; padding: 8px 12px; margin-top: 6px; border: 1px solid #e2e8f0; border-radius: 6px; font-family: sans-serif; font-size: 12px; color: #475569; line-height: 1.6;">${typeof getWorryFreeLayerRuleText === 'function' ? getWorryFreeLayerRuleText().split('；').join('<br>') : '无'}</div>`,
      sla: '线索满足下发条件后，DCC 任务实时生成时延 ≤ 2 秒。',
      selfHealing: '若任务队列出现消费积压，系统自动调配高优先级并发通道，并在 10 分钟内完成积压任务的强制消费和分发。'
    },
    '同步失败量': {
      desc: '三无忧任务在向 DCC 培育流程同步或向预外呼系统推送时，因网络抖动、接口异常等原因导致同步失败的任务数量。',
      formula: '同步接口返回失败或超时的任务数量',
      sla: '系统按重试策略自动补偿；持续失败的数据需进入异常监控并支持人工核查。',
      selfHealing: '系统按重试策略自动补偿；持续失败的数据需进入异常监控并支持人工核查。'
    },
    '同步失败': {
      desc: '三无忧任务在向 DCC 培育流程同步或向预外呼系统推送时，因网络抖动、接口异常等原因导致同步失败的任务数量。',
      formula: '同步接口返回失败或超时的任务数量',
      sla: '系统按重试策略自动补偿；持续失败的数据需进入异常监控并支持人工核查。',
      selfHealing: '系统按重试策略自动补偿；持续失败的数据需进入异常监控并支持人工核查。'
    },
    '滚存待推送': {
      desc: '因每日限制而未在本批次推送的线索数量，将按规则顺延至后续批次。',
      formula: `累计总量 - 今日实际推送成功量 - 去重过滤量 - 异常过滤量（配置每日上限为：<strong style="color:#2563eb">${document.getElementById('worryFreeDailyLimit')?.value || '10,000'} 条</strong>）`,
      sla: '在允许的推送数据时间段内自动激活。',
      selfHealing: '每日 24:00 滚存池自动进行结构化清理和排序更新，高优先级线索将在次日推送时间段开始时优先下发。'
    },
    '预外呼任务总量': {
      desc: '统计周期内由 DCC 培育系统分配并尝试推送到预外呼系统的人工/AI 外呼任务总数。',
      formula: '已成功发起同步并被预外呼接收的任务数 + 队列中等待同步的任务数',
      sla: '任务同步接口响应时间 ≤ 200ms。',
      selfHealing: '系统每 15 分钟执行一次队列完整性对账，若发现培育系统与预外呼系统任务总量对账差异，自动生成数据对账批次事件并拉取差异。'
    },
    '已推送任务量': {
      desc: '培育系统已成功通过接口将数据下发给预外呼系统，且预外呼系统正常接收的任务数量。',
      formula: '推送接口成功接收任务量（不含待同步/同步失败状态的本地缓存任务）',
      sla: '首呼及时率目标：数据同步后 30 分钟内，预外呼系统完成首次呼叫比例 ≥ 90%。',
      selfHealing: '针对已推送但预外呼系统 24 小时未呼叫的任务，对账自愈模块自动向预外呼系统发起批量撤销并重推请求。'
    },
    '已分配坐席（总量）': {
      desc: '当前统计周期内，已实际分配预外呼任务并处于就绪/通话状态的去重客服坐席人员总数。',
      formula: '去重坐席工号总数。',
      sla: '坐席分配响应时延 ≤ 1 分钟（从任务进入预外呼系统起算）。',
      selfHealing: '若监控到有任务在队列中等待，但已分配坐席数为 0 且持续超过 10 分钟，系统自动向坐席管理组发送离线及通道异常提醒。'
    },
    '已分配坐席（通话状态 = 坐席接听）': {
      desc: '统计周期内，通话结果记录中包含坐席成功接通记录的去重客服坐席人数。',
      formula: '去重坐席接通工号数。',
      sla: '平均坐席应答率（接起率）目标 ≥ 85%。',
      selfHealing: '坐席接听异常超 3 次（如响铃不接、拒接），系统将该坐席标记为“忙碌/异常”并暂停分发，自动引导后续呼叫分配至备用坐席组。'
    },
    '线索下发量': {
      desc: '预外呼处理完成（建联成功或符合特定规则）后，成功下发并写入到 NEV 线索中台的去重任务总量。',
      formula: '成功推送至 NEV 线索中台的去重客户线索数。',
      sla: '流转同步时延 ≤ 3 秒。',
      selfHealing: '若 NEV 接口异常导致下发失败，数据进入补偿通道，5 分钟内自动触发断点续传。'
    },
    '线索下发量（通话状态 = 坐席接听）': {
      desc: '已成功下发至 NEV 线索中台，且通话详情包含客服坐席与客户双方成功通话的线索数量。',
      formula: '通话类型为人工坐席且接通结果为成功的下发去重任务数。',
      sla: '高意向商机录入及时率目标 ≥ 98%。',
      selfHealing: '对于通话录音缺失的线索，每日 18:00 对账程序将自动触发录音补拉与重关联逻辑。'
    },
    '线索下发量（通话状态 ≠ 坐席接听）': {
      desc: '已成功下发至 NEV 线索中台，但通话结果并非客服坐席接通（例如 AI 机器人建联、短信辅助建联等）的线索数量。',
      formula: '非坐席接听通话类型的下发去重任务数。',
      sla: '用于人机协作策略流转比例的偏离度监控，警戒值 ≤ 20%。',
      selfHealing: '若 AI 直接建联下发占比突增至 40% 以上，自动触发策略审核告警，防止低质量商机冲击店端客服。'
    },
    '任务处理中': {
      desc: '已推送至预外呼系统，当前处于外呼尝试阶段、尚未返回最终接通/失败归档状态的任务数。',
      formula: '已推送任务总量 - 任务已处理总量。',
      sla: '单个任务的外呼最大生命周期为 48 小时。',
      selfHealing: '若任务处于“处理中”状态超过 48 小时，系统每天凌晨 02:00 自动进行超时强行归档，状态标为“处理完毕（超时）”。'
    },
    '任务已处理': {
      desc: '预外呼系统已完成对该任务的全部外呼拨打尝试，并向培育系统回传了最终的外呼处理状态（已建联/多次未接/空号等）。',
      formula: '已成功返回最终通话结果或超时强行归档的任务数。',
      sla: '任务处理率目标：周期内推送任务在 24 小时内处理率 ≥ 95%。',
      selfHealing: '超时未处理任务自动升级转入运维工单系统。'
    },
    '有效任务量': {
      desc: '已推送任务量中，排除线路异常、拒呼、直接中止或黑名单等不可抗力过滤，能进入实际外呼拨打队列的健康线索总量。',
      formula: '已推送任务量 - 线路拒呼 - 线路未呼 - 用户黑名单 - 任务中止',
      sla: '有效任务率目标 ≥ 96.0%。',
      selfHealing: '当有效任务量占比较低（≤ 90%）时，自动触发线路配置审计，优化外呼主叫路由。'
    },
    '话单已回传': {
      desc: '预外呼系统在拨打尝试结束后，返回给培育系统的外呼通话详细话单总量（不进行任务去重，多次拨打产生多张话单）。',
      formula: '已接收话单流水记录总条数。',
      sla: '通话挂断后 5 分钟内话单接口回传及时率 ≥ 99.0%。',
      selfHealing: '超时话单自动进入“补拉重试队列”，每 15 分钟发起一次同步轮询以补充缺失话单。'
    },
    '话单待回传': {
      desc: '当前已发起外呼且在合理拨打窗口内，系统正在等待预外呼接口回传首次外呼记录的任务数（按任务去重）。',
      formula: '处于外呼中且挂断时间不足 24 小时的待接收话单数量。',
      sla: '正常等待队列，无特殊警示等级。',
      selfHealing: '超过 24 小时未回传的话单自动变更为“超时未回传”，并触发 P1 级系统告警。'
    },
    '话单超时未回传': {
      desc: '已分配外呼 but 超过 24 小时仍未接收到预外呼系统返回任何话单记录的任务数（按任务去重）。',
      formula: '等待时间 ≥ 24 小时且话单为空的去重任务总量。',
      sla: 'SLA 关键性监控点，警示等级 P1，超时 5 分钟未处置将自动升级。',
      selfHealing: '系统内置对账任务，每小时自动调用预外呼系统的“话单补拉接口”进行同步拉取。'
    },
    '录音丢失量': {
      desc: '已成功回传外呼话单，但在对应的通话详情里没有获取到有效的录音 MP3 播放链接或文件的数量（按话单统计）。',
      formula: '已回传话单中，录音 URL 字段为空且挂断时长 ≥ 1 小时的话单数。',
      sla: '录音丢失率应控制在 ≤ 0.5% 以内，警示等级 P2。',
      selfHealing: '每日 18:00 自动执行录音大对账，通过高可靠的独立接口重新获取云端录音文件地址，失败则连续重试。'
    },
    '外呼接通量': {
      desc: '拨打记录中，最终实现客户成功接通的去重任务总量（含人工接通与 AI 成功交互）。',
      formula: '最终外呼结果为“用户接通”或“坐席接听”的去重任务数。',
      sla: '接通率（接通量 ÷ 有效任务量）目标为 ≥ 55.0%。',
      selfHealing: '若单日接通率突降，分析模块自动解析未接听原因并推荐拨打时段。'
    },
    '有效通话量': {
      desc: '在外呼接通的任务中，客户与坐席（或 AI 机器人）成功开展的持续通话时长不低于 30 秒的去重通话量。',
      formula: '通话接通时长 ≥ 30 秒的去重外呼接通量。',
      sla: '有效通话率（有效通话量 ÷ 外呼接通量）目标为 ≥ 80.0%。',
      selfHealing: '针对通话时长极短的“秒挂”或“被动断联”，系统自动标记客户意向并建议在 48 小时后自动启动二次追呼。'
    },
    '首呼接通率': {
      desc: '在分配任务后，发起的第一次外呼即成功接通的任务量占比。',
      formula: '首次呼叫接通任务量 ÷ 首呼任务总量 × 100%',
      sla: '首呼接通率指标可直观反映首选外呼时段的触达质量。',
      selfHealing: '首呼失败线索将自动计算最佳追呼时间，并延迟放入追呼池。'
    },
    '2~N呼接通率': {
      desc: '在首次呼叫失败的前提下，后续进行的第 2 至第 N 次拨打尝试中成功接通的任务量占比。',
      formula: '非首次呼叫接通任务量 ÷ 非首次呼叫任务总量 × 100%',
      sla: '严格限制最大追呼频次为 3 次，超过自动拦截。',
      selfHealing: '若 3 次外呼皆未接通，系统自动触发退池机制，将其转为“短信辅助建联”策略。'
    },
    '呼叫接通时长': {
      desc: '统计周期内，所有成功接通的外呼通话累计时长的总和。',
      formula: '话单中通话时长字段的累计求和。',
      sla: '线路使用度核心考核指标。',
      selfHealing: '若总通话时长异常增加导致线路带宽占用率超过 90%，系统将自动预警并临时分流至备用供应商中继线。'
    },
    '每通呼叫接通时长': {
      desc: '平均每通接通电话客户维持通话的时间长度，用于衡量沟通质量。',
      formula: '呼叫接通时长 ÷ 外呼接通量。',
      sla: '坐席有效沟通时长目标 ≥ 45 秒。',
      selfHealing: '话务质检模块自动抽检时长低于 10 秒及高于 10 分钟的通话录音并生成质检任务。'
    },
    '线路拒呼': {
      desc: '预外呼系统在呼叫时因并发超限、主叫被标记拒接或运营商拦截导致呼叫被直接退回的话单量（按话单统计）。',
      formula: '外呼结果编码返回线路拒呼的代码统计总量。',
      sla: '线路拒呼率应严格控制在 ≤ 1% 以内，警示等级 P2。',
      selfHealing: '拒呼比例一旦超限，系统策略中心自动禁用当前受限制主叫号段，并无缝切入新备用路由以保障触达效率。'
    },
    '线路未呼': {
      desc: '预外呼已接单但因超时或系统崩溃未实际呼叫的数量。',
      formula: '预外呼未真正触发主叫拨号的失效流水条数。',
      sla: '线路未呼率应控制在 ≤ 1.5% 以内，警示等级 P2。',
      selfHealing: '一旦检测到线路未呼情况，自动退回培育系统重新入栈，等待下一时段批量补呼。'
    }
  };

  const rule = rules[metric] || {
    desc: '系统监控指标，衡量人工与外呼系统交互情况。',
    formula: '统计结果总额求和',
    sla: '数据接口对接及时率要求 100%。',
    selfHealing: '接口提供自动对账重试与缓存补偿。'
  };

  body.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 20px;">
      <div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; border-radius: 4px;">
        <div style="font-weight: 600; color: #1e293b; font-size: 14px; margin-bottom: 6px;">指标核心定义</div>
        <div style="color: #475569; font-size: 13px; line-height: 1.6;">${rule.desc}</div>
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 14px;">
        <div>
          <div style="font-weight: 600; color: #1e293b; font-size: 13px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.5"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            计算逻辑 / 口径公式
          </div>
          <div style="background: #f1f5f9; padding: 10px 14px; border-radius: 6px; font-family: monospace; font-size: 12px; color: #0f172a; line-height: 1.5; word-break: break-all;">${rule.formula}</div>
        </div>

        <div>
          <div style="font-weight: 600; color: #1e293b; font-size: 13px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            SLA 监控规则与阈值
          </div>
          <div style="color: #475569; font-size: 13px; line-height: 1.5; padding-left: 20px;">${rule.sla}</div>
        </div>

      </div>
    </div>
  `;

  modal.classList.add('show');
}
