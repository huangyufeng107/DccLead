function renderTaskInitializationCard(task, isOpen = false) {
  return `
    <details class="task-init-card" ${isOpen ? 'open' : ''}>
      <summary class="task-init-header">
        <div class="task-init-title">培育任务编码：${task.taskCode}</div>
        <div class="task-init-meta">任务状态：${task.systemStatus} · 创建时间：${task.createdAt} · 每条任务独立保留初始化快照</div>
      </summary>
      ${renderTaskAssignmentSummary(task.assignmentSnapshot, task)}
      ${renderTaskSnapshotTabs(task)}
    </details>
  `;
}

function renderTaskSnapshotTabs(task) {
  const taskKey = escapeAttr(task.taskCode);
  const leadGroup = task.groups.find(group => group.title === '初始化线索快照');
  const deliveryGroup = task.groups.find(group => group.title === '初始化投放快照');
  const tabs = [
    { key: 'lead', label: '线索快照', html: leadGroup ? renderDetailSection(leadGroup) : renderEmptySnapshot('暂无线索快照') },
    { key: 'delivery', label: '投放快照', html: deliveryGroup ? renderDetailSection(deliveryGroup) : renderEmptySnapshot('暂无投放快照') },
    { key: 'assignment', label: '分配快照', html: renderTaskAssignmentSnapshotPanel(task.assignmentSnapshot) },
    { key: 'workorder', label: '回访工单', html: renderTaskWorkorderSnapshotPanel(task.workorderSnapshot), active: true }
  ];
  return `
    <div class="task-snapshot-shell" data-task-snapshot="${taskKey}">
      <div class="task-snapshot-tabs">
        ${tabs.map(tab => `
          <button class="task-snapshot-tab ${tab.active ? 'active' : ''}" type="button" data-tab="${tab.key}" onclick="switchTaskSnapshotTab(this)">
            ${tab.label}
          </button>
        `).join('')}
      </div>
      ${tabs.map(tab => `
        <div class="task-snapshot-panel ${tab.active ? 'active' : ''}" data-panel="${tab.key}">
          ${tab.html}
        </div>
      `).join('')}
    </div>
  `;
}

function renderEmptySnapshot(text) {
  return `<div class="empty-state">${text}</div>`;
}

function renderLeadUpstreamSyncLogTable(logs) {
  if (!logs.length) return renderEmptySnapshot('暂无接收日志');
  return `
    <div class="log-table-card">
    <table class="log-table">
      <thead>
        <tr>
          <th>接收时间</th>
          <th>总部线索ID</th>
          <th>入库处理结果</th>
          <th>是否转化培育任务</th>
          <th>培育任务编码</th>
          <th>说明原因</th>
          <th>操作</th>
        </tr>
      </thead>
      <tbody>
        ${logs.map(log => `
          <tr>
            <td>${detailValue(log.syncTime)}</td>
            <td>${detailValue(log.headquarterLeadId)}</td>
            <td>${detailValue(log.processResult)}</td>
            <td>${formatYesNoTag(log.converted)}</td>
            <td>${detailValue(log.taskCode)}</td>
            <td class="reason-cell">${detailValue(log.reason)}</td>
            <td class="payload-cell">${renderWorkorderPayload(log.payload, `${log.syncTime} 上游接收报文数据`, '查看接收报文')}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    </div>
  `;
}

function renderTaskAssignmentSummary(snapshot, task) {
  if (!snapshot) return '';
  const latestRuleResult = getLatestTaskRuleResult(task);
  const latestHitRule = snapshot.rules?.find(rule => rule.status === '最终命中') || snapshot.rules?.find(rule => rule.matched);
  const latestHitName = latestHitRule?.node || [snapshot.matchedConfigurator, snapshot.matchedDimension].filter(Boolean).join(' · ');
  const items = [
    { label: '任务状态', value: formatSystemStatusTag(snapshot.systemStatus) },
    { label: '命中配置器', value: detailValue(latestHitName) },
    { label: '培育沟通方式', value: detailValue(snapshot.communicationMethod) },
    { label: 'AI外呼类型', value: detailValue(snapshot.aiCallType) }
  ];
  if (snapshot.systemStatus === '已处理') {
    items.push(
      { label: '任务-线索状态', value: detailValue(latestRuleResult.leadStatus) },
      { label: '任务-异常原因', value: detailValue(latestRuleResult.abnormalReason) },
      { label: '任务-意向级别', value: detailValue(latestRuleResult.intentLevel) }
    );
  }
  return `
    <div class="task-assignment-summary">
      ${items.map(item => `
        <div class="task-assignment-item">
          <div class="task-assignment-label">${item.label}</div>
          <div class="task-assignment-value">${item.value}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function getLatestTaskRuleResult(task) {
  const latestOrder = getLatestTaskWorkorder(task);
  const snapshot = latestOrder?.postCallSnapshot;
  const hitRules = (snapshot?.rules || []).filter(rule =>
    ['通话状态配置', '线索下发配置'].includes(rule.name) && rule.status === '符合条件'
  );
  const latestHitRule = hitRules[hitRules.length - 1];
  const nextItems = latestHitRule?.next || [];
  return {
    leadStatus: extractRuleNextValue(nextItems, '线索状态更新') || snapshot?.redialPolicy?.leadStatus || '—',
    abnormalReason: extractRuleNextValue(nextItems, '异常原因更新') || snapshot?.redialPolicy?.abnormalReason || '—',
    intentLevel: extractRuleNextValue(nextItems, '意向级别更新') || snapshot?.redialPolicy?.intentLevel || '—'
  };
}

function getLatestTaskWorkorder(task) {
  const workorders = task?.workorderSnapshot?.workorders || [];
  if (!workorders.length) return null;
  return [...workorders].sort((a, b) => {
    const timeA = getWorkorderDisplayTime(a);
    const timeB = getWorkorderDisplayTime(b);
    const timeCompare = String(timeB || '').localeCompare(String(timeA || ''), 'zh-CN', { numeric: true });
    if (timeCompare !== 0) return timeCompare;
    return (Number(b.contactRound) || 0) - (Number(a.contactRound) || 0);
  })[0];
}

function extractRuleNextValue(nextItems, key) {
  const item = (nextItems || []).find(text => String(text).startsWith(`${key} =`));
  return item ? String(item).split('=').slice(1).join('=').trim() : '';
}

function renderTaskAssignmentSnapshotPanel(snapshot) {
  if (!snapshot?.rules?.length) return renderEmptySnapshot('暂无分配快照');
  const hitRule = snapshot.rules.find(rule => rule.status === '最终命中') || snapshot.rules.find(rule => rule.matched) || snapshot.rules[0];
  return `
    <div class="assignment-panel">
      ${renderAssignmentContext(snapshot)}
      ${renderAssignmentHitPanel(hitRule)}
      <div class="assignment-rule-list">
        ${snapshot.rules.map(rule => renderAssignmentRule(rule, hitRule?.node)).join('')}
      </div>
    </div>
  `;
}

function renderAssignmentContext(snapshot) {
  const items = [
    { label: '智能体线索状态', value: detailValue(snapshot.agentLeadStatus) },
    { label: '智能体异常原因', value: detailValue(snapshot.agentLeadReason) }
  ];
  return `
    <div class="assignment-context">
      <div class="assignment-context-title">分配上下文</div>
      ${items.map(item => `
        <div class="assignment-context-item">
          <div class="assignment-context-label">${item.label}</div>
          <div class="assignment-context-value">${item.value}</div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderAssignmentHitPanel(rule) {
  if (!rule) return '';
  const nextEntries = Object.entries(rule.next || {}).filter(([, value]) => value !== undefined && value !== null && value !== '');
  return `
    <div class="assignment-hit-panel">
      <div>
        <div class="assignment-hit-title">最终命中：${rule.node}</div>
        <div class="assignment-hit-desc">${(rule.conditions || []).join('；') || '无配置条件'}</div>
      </div>
      <div class="assignment-hit-next">
        ${nextEntries.map(([key, value]) => `<div class="assignment-kv"><strong>${key}：</strong>${value}</div>`).join('') || '<div class="assignment-kv">无下个节点</div>'}
      </div>
    </div>
  `;
}

function renderAssignmentRule(rule, hitNode) {
  const matchedLabel = rule.status || (rule.matched ? '最终命中' : '未命中');
  const matchedClass = rule.status === '最终命中' ? 'green' : (rule.status === '未执行' ? 'gray' : 'orange');
  const isHit = rule.node === hitNode;
  const conditionCount = (rule.conditions || []).length;
  const isSkipped = matchedLabel === '未执行';
  const brief = isSkipped
    ? '命中后停止判断'
    : (isHit ? `已命中，${conditionCount} 个判断条件` : `已校验，${conditionCount} 个判断条件未命中`);
  const title = isSkipped ? '该配置器未执行，未产生条件判断结果' : ((rule.conditions || []).join('；') || '无配置条件');
  return `
    <div class="assignment-rule-card compact" title="${title}">
      <div class="assignment-rule-head">
        <div class="assignment-rule-title">${rule.node}</div>
        <div class="assignment-rule-brief">${brief}</div>
        <span class="tag-chip ${matchedClass}">${matchedLabel}</span>
      </div>
    </div>
  `;
}

function renderTaskWorkorderSnapshotPanel(snapshot) {
  const workorders = snapshot?.workorders || [];
  if (!workorders.length) return renderEmptySnapshot('暂无回访工单快照');
  return `
    <div class="workorder-panel">
      ${renderWorkorderOverview(workorders)}
      <div class="workorder-flow">
        <div class="workorder-steps">
          ${workorders.map((order, index) => {
            const showRedialFlag = order.postCallSnapshot?.redialHit;
            return `
            <button class="workorder-step ${index === 0 ? 'active' : ''}" type="button" data-workorder-step="${index}" onclick="switchWorkorderStep(this)">
              <div class="workorder-step-title">
                <span>第${order.contactRound}次建联</span>
                <span class="workorder-step-flags">
                  ${showRedialFlag ? '<span class="tag-chip orange">命中重推</span>' : ''}
                </span>
              </div>
              <div class="workorder-step-meta">${order.communicationMethod}${order.outboundType && order.outboundType !== '—' ? ` · ${order.outboundType}` : ''}</div>
              <div class="workorder-step-meta">${order.actualSyncTime && order.actualSyncTime !== '—' ? order.actualSyncTime : order.expectedPushTime || '—'}</div>
            </button>
          `}).join('')}
        </div>
        <div class="workorder-step-panels">
          ${workorders.map((order, index) => `
            <div class="workorder-step-panel ${index === 0 ? 'active' : ''}" data-workorder-panel="${index}">
              ${renderWorkorderPanelCard(order)}
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderWorkorderOverview(workorders) {
  const latest = [...workorders].reverse().find(order => order.syncStatus === '待同步') || workorders[workorders.length - 1] || workorders[0];
  const conclusion = getWorkorderConclusion(latest);
  return `
    <div class="workorder-overview">
      <div class="workorder-overview-title">当前任务结果总览</div>
      <div class="workorder-conclusion">
        <div>
          <div class="workorder-conclusion-label">当前状态</div>
          <div class="workorder-conclusion-value">${conclusion}</div>
        </div>
      </div>
    </div>
  `;
}

function getWorkorderConclusion(order) {
  if (!order) return '暂无回访工单';
  const displayTime = getWorkorderDisplayTime(order);
  if (order.syncStatus === '待同步') {
    return `第${order.contactRound}次建联待同步，预计 ${displayTime} 推送 ${order.communicationMethod}`;
  }
  if (order.communicationMethod === '人工客服跟进') {
    return `第${order.contactRound}次建联进入人工客服跟进`;
  }
  if (order.postCallSnapshot?.redialHit) {
    return `第${order.contactRound}次建联命中重推规则，后续工单已按策略生成`;
  }
  return `第${order.contactRound}次建联已完成，通话状态为${order.callStatus || '—'}`;
}

function getWorkorderDisplayTime(order) {
  return order?.actualSyncTime && order.actualSyncTime !== '—' ? order.actualSyncTime : (order?.expectedPushTime || '—');
}

function renderWorkorderPanelCard(order) {
  const isManualFollow = order.communicationMethod === '人工客服跟进';
  const metaCode = isManualFollow ? order.outboundSystemCode : order.callId;
  const displayTime = getWorkorderDisplayTime(order);
  const sections = getWorkorderFieldSections(order);
  const primarySections = sections.filter(section => section.title !== '技术追溯');
  const traceSections = sections.filter(section => section.title === '技术追溯');
  return `
    <div class="workorder-panel-card">
      <div class="workorder-panel-head">
        <div>
          <div class="workorder-panel-title">${order.callbackWorkorderCode} · ${order.communicationMethod}${order.outboundType && order.outboundType !== '—' ? ` · ${order.outboundType}` : ''}</div>
          <div class="workorder-panel-meta">${displayTime} · ${metaCode}</div>
        </div>
        <div class="workorder-status">
          ${renderSyncStatusTag(order.syncStatus)}
        </div>
      </div>
      ${primarySections.map(renderWorkorderSection).join('')}
      ${renderPostCallOverview(order.postCallSnapshot)}
      ${renderPostCallSnapshot(order.postCallSnapshot)}
      ${traceSections.map(renderWorkorderSection).join('')}
    </div>
  `;
}

function renderWorkorderSection(section) {
  if (!section.fields.length) return '';
  return `
    <section class="workorder-section">
      <div class="workorder-section-title">${section.title}</div>
      <div class="workorder-detail-grid">
        ${section.fields.map(field => `
          <div class="workorder-field ${field.wide ? 'wide' : ''}">
            <div class="workorder-field-label">${field.label}</div>
            <div class="workorder-field-value">${field.value}</div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function getWorkorderFieldSections(order) {
  const isManualFollow = order.communicationMethod === '人工客服跟进';
  const hasCallResult = !isManualFollow && order.syncStatus !== '待同步';
  const workorderLeadResult = getWorkorderLeadResult(order);
  const baseTitle = isManualFollow ? '人工跟进工单' : (order.syncStatus === '待同步' ? '预生成工单' : '工单基础');
  const baseFields = [
    { label: '回访工单编码', value: detailValue(order.callbackWorkorderCode) },
    { label: '是否AI重推任务', value: formatYesNoText(order.isAiRedialTask) },
    { label: '中止回访工单', value: formatYesNoText(order.stopTask) },
    { label: '回访工单异常原因', value: detailValue(order.taskAbnormalReason) },
    { label: '培育沟通方式', value: detailValue(order.communicationMethod) },
    { label: '外呼类型', value: detailValue(order.outboundType) },
    { label: '预计推送外呼系统时间', value: detailValue(order.expectedPushTime) },
    { label: '同步外呼系统状态', value: renderSyncStatusText(order.syncStatus) },
    { label: '实际同步外呼系统时间', value: detailValue(order.actualSyncTime) },
    { label: isManualFollow ? '人工外呼系统编码' : '外呼系统编码', value: detailValue(order.outboundSystemCode) }
  ];
  const callResultFields = [
    { label: '通话ID', value: detailValue(order.callId) },
    { label: '外呼话单同步时间', value: detailValue(order.callBillSyncTime) },
    { label: '通话状态', value: detailValue(order.callStatus) },
    { label: '是否有意愿添加企微', value: formatYesNoText(order.willingAddWecom) },
    { label: '企微号', value: detailValue(order.wecomId) },
    { label: '客户意向级别', value: detailValue(order.customerIntentLevel) },
    { label: '工单-线索状态', value: detailValue(workorderLeadResult.leadStatus) },
    { label: '工单-异常原因', value: detailValue(workorderLeadResult.abnormalReason) },
    { label: '工单-意向级别', value: detailValue(workorderLeadResult.intentLevel) },
    { label: '工单-SmartCode', value: detailValue(workorderLeadResult.smartCode) },
    { label: '外呼标签', value: renderInlineText(order.outboundTags) },
    { label: '录音试听', value: renderWorkorderAudioControl(order), wide: true },
    { label: '录音文本', value: renderWorkorderRecordingText(order.recordingText, order.recordingDialogue), wide: true }
  ];
  const traceFields = [
    { label: `话单返回报文数据${renderCallBillReceivedBadge()}`, value: renderWorkorderPayload(order.outboundResponsePayload, '话单返回报文数据'), wide: true },
    order.postCallSnapshot?.vendorSyncPayload
      ? { label: `同步厂商线索数据${renderDispatchExecutedBadge()}`, value: renderWorkorderPayload(order.postCallSnapshot.vendorSyncPayload, '同步厂商线索数据'), wide: true }
      : null
  ].filter(Boolean);
  return [
    { title: baseTitle, fields: baseFields },
    { title: '建联结果', fields: hasCallResult ? callResultFields : [] },
    { title: '技术追溯', fields: isManualFollow ? [] : traceFields }
  ];
}

function getWorkorderLeadResult(order) {
  const snapshot = order?.postCallSnapshot || {};
  const redialPolicy = snapshot.redialPolicy || {};
  const taskLeadSnapshot = snapshot.taskLeadSnapshot || {};
  return {
    leadStatus: order?.workorderLeadStatus || taskLeadSnapshot.leadStatus || redialPolicy.leadStatus || '—',
    abnormalReason: order?.workorderAbnormalReason || taskLeadSnapshot.abnormalReason || redialPolicy.abnormalReason || '—',
    intentLevel: order?.workorderIntentLevel || taskLeadSnapshot.intentLevel || redialPolicy.intentLevel || order?.customerIntentLevel || '—',
    smartCode: order?.smartCode || taskLeadSnapshot.smartCode || snapshot.smartCode || '—'
  };
}

function renderPostCallOverview(snapshot) {
  if (!snapshot) return '';
  const isManualFollow = snapshot.communicationMethod === '人工客服跟进';
  if (isManualFollow) return '';
  const statusSnapshotText = [
    `外呼类型 = ${detailValue(snapshot.aiCallType)}`,
    `线索状态 = ${detailValue(snapshot.redialPolicy?.leadStatus)}`,
    `异常原因 = ${detailValue(snapshot.redialPolicy?.abnormalReason)}`,
    `意向级别 = ${detailValue(snapshot.redialPolicy?.intentLevel)}`,
    `通话状态 = ${detailValue(snapshot.callStatus)}`,
    `外呼标签 = ${detailValue(snapshot.outboundTagsText)}`
  ].join(' / ');
  const summaryItems = [
    { label: '最终处理', value: detailValue(snapshot.finalAction) },
    { label: '重推进度', value: detailValue(snapshot.redialText) },
    { label: '下次重推时间', value: snapshot.nextRedialAt || '' },
    { label: '状态快照', value: statusSnapshotText }
  ];
  return `
    <section class="post-call-overview">
      <div class="post-call-overview-title">建联后处理</div>
      <div class="post-call-overview-body">
        ${snapshot.redialHit ? `
          <div class="post-call-redial-alert">
            <div>
              <div class="post-call-redial-title">命中重推规则，将创建下一次建联</div>
              <div class="post-call-redial-desc">${snapshot.redialNotice}</div>
            </div>
            ${snapshot.redialStatusLabel ? `<span class="tag-chip ${snapshot.redialStatusClass || 'orange'}">${snapshot.redialStatusLabel}</span>` : ''}
          </div>
        ` : ''}
        <div class="post-call-summary">
          ${summaryItems.map(item => `
            <div class="post-call-summary-item">
              <div class="post-call-label">${item.label}</div>
              <div class="post-call-value">${item.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
  `;
}

function renderPostCallSnapshot(snapshot) {
  if (!snapshot) return '';
  if (snapshot.communicationMethod === '人工客服跟进') return '';
  return `
    <details class="post-call-snapshot">
      <summary>处理规则链路</summary>
      <div class="post-call-body">
        <div class="post-call-rules">
          ${(snapshot.rules || []).map(renderPostCallRule).join('')}
        </div>
      </div>
    </details>
  `;
}

function renderPostCallRule(rule) {
  const cls = rule.status === '符合条件' ? 'green' : (rule.status === '未执行' ? 'gray' : 'orange');
  const conditionsText = (rule.conditions || []).join('、') || '—';
  const nextText = (rule.next || []).join('、') || '—';
  return `
    <div class="post-call-rule">
      <div class="post-call-rule-head">
        <div class="post-call-rule-name">${rule.name}</div>
        <span class="tag-chip ${cls}">${rule.status}</span>
      </div>
      <div class="post-call-rule-body">
        <div>
          <div class="post-call-rule-subtitle">判断条件</div>
          <div class="post-call-textline">${conditionsText}</div>
        </div>
        <div>
          <div class="post-call-rule-subtitle">下个节点</div>
          <div class="post-call-textline">${nextText}</div>
        </div>
      </div>
    </div>
  `;
}

function renderWorkorderAudioControl(order) {
  if (!order.recordingUrl || order.recordingUrl === '—') return '—';
  const callId = escapeAttr(order.callId || order.callbackWorkorderCode);
  const phone = escapeAttr(order.phone || '当前客户');
  const duration = getWorkorderAudioDuration(order);
  return `
    <div class="workorder-audio-control">
      <button class="listen-btn" type="button" data-call-id="${callId}" onclick="toggleWorkorderAudio(this)">试听</button>
      <div class="workorder-audio-player" data-player-for="${callId}" data-phone="${phone}" data-duration="${escapeAttr(duration)}">
        <button class="workorder-audio-toggle" type="button" onclick="toggleWorkorderAudioPause(event, this)" aria-label="暂停或继续试听">Ⅱ</button>
        <div class="workorder-audio-main">
          <div class="workorder-audio-title-row">
            <span class="workorder-audio-title">正在试听 · ${phone} · ${callId}</span>
            <span class="workorder-audio-time">00:05 / ${escapeHtml(duration)}</span>
          </div>
          <div class="workorder-audio-bar" aria-label="录音播放进度"><div class="workorder-audio-progress"></div></div>
        </div>
      </div>
    </div>
  `;
}

function getWorkorderAudioDuration(order) {
  const allHitRecords = Object.values(hitRecords || {}).flat();
  const matchedRecord = allHitRecords.find(record => record.callId === order.callId);
  return matchedRecord?.transcript?.duration || '04:38';
}

function renderWorkorderRecordingText(text, dialogue) {
  if ((!text || text === '—') && (!dialogue || !dialogue.length)) return '—';
  const previewText = text || dialogue.map(item => item.text).join(' ');
  const escapedText = escapeHtml(previewText);
  return `
    <div class="workorder-dialogue-preview">${escapedText}</div>
    <div class="workorder-dialogue">
      <div class="chat-time-divider">00:00 开始通话</div>
      ${(dialogue && dialogue.length ? dialogue : [{ role: 'agent', speaker: '电销顾问', text: previewText }]).map(renderWorkorderDialogueMessage).join('')}
      <div class="chat-end-divider">通话结束</div>
    </div>
    <button class="workorder-link-btn" type="button" onclick="toggleWorkorderText(this)">展开对话</button>
  `;
}

function renderWorkorderDialogueMessage(message) {
  const role = message.role === 'customer' ? 'customer' : 'agent';
  const avatar = role === 'customer' ? '客' : '销';
  const sender = message.speaker || (role === 'customer' ? '客户' : '电销顾问');
  return `
    <div class="chat-msg ${role}">
      <div class="chat-avatar">${avatar}</div>
      <div class="chat-bubble-wrap">
        <div class="chat-sender">${sender}</div>
        <div class="chat-bubble">${escapeHtml(message.text || '')}</div>
      </div>
    </div>
  `;
}

function renderWorkorderPayload(payload, title = '报文详情', buttonText = '查看报文') {
  if (!payload || payload === '—') return '—';
  return `
    <button class="workorder-link-btn" type="button" data-title="${escapeAttr(title)}" data-payload="${escapeAttr(encodeURIComponent(payload))}" onclick="openPayloadModal(this)">${buttonText}</button>
  `;
}

function toggleWorkorderAudio(button) {
  const control = button.closest('.workorder-audio-control');
  if (!control) return;
  const player = control.querySelector('.workorder-audio-player');
  const isShowing = player?.classList.contains('show');
  document.querySelectorAll('.workorder-audio-player.show').forEach(item => {
    item.classList.remove('show');
    item.classList.remove('paused');
    const toggle = item.querySelector('.workorder-audio-toggle');
    const title = item.querySelector('.workorder-audio-title');
    if (toggle) toggle.textContent = 'Ⅱ';
    if (title) title.textContent = `正在试听 · ${item.dataset.phone || '当前客户'} · ${item.dataset.playerFor || '当前工单'}`;
  });
  document.querySelectorAll('.workorder-audio-control .listen-btn').forEach(item => {
    item.classList.remove('playing');
    item.textContent = '试听';
    item.style.display = '';
  });
  if (!player || isShowing) return;
  player.classList.add('show');
  button.classList.add('playing');
  button.textContent = '试听中';
  button.style.display = 'none';
  showToast(`正在试听录音：${button.dataset.callId || '当前工单'}`, true);
}

function toggleWorkorderAudioPause(event, button) {
  event.stopPropagation();
  const player = button.closest('.workorder-audio-player');
  if (!player) return;
  const paused = player.classList.toggle('paused');
  const title = player.querySelector('.workorder-audio-title');
  button.textContent = paused ? '▶' : 'Ⅱ';
  if (title) {
    title.textContent = `${paused ? '已暂停' : '正在试听'} · ${player.dataset.phone || '当前客户'} · ${player.dataset.playerFor || '当前工单'}`;
  }
}

function toggleWorkorderText(button) {
  const field = button.closest('.workorder-field-value');
  if (!field) return;
  const dialogue = field.querySelector('.workorder-dialogue');
  const preview = field.querySelector('.workorder-dialogue-preview');
  const isShowing = dialogue?.classList.contains('show');
  if (!dialogue || !preview) return;
  dialogue.classList.toggle('show', !isShowing);
  preview.style.display = isShowing ? 'block' : 'none';
  button.textContent = isShowing ? '展开对话' : '收起对话';
}

function openPayloadModal(button) {
  const title = button.dataset.title || '报文详情';
  const encodedPayload = button.dataset.payload || '';
  let payload = '';
  try {
    payload = decodeURIComponent(encodedPayload);
  } catch (error) {
    payload = encodedPayload;
  }
  document.getElementById('payloadModalTitle').textContent = title;
  document.getElementById('payloadModalBody').textContent = payload || '暂无报文数据';
  document.getElementById('payloadModal').classList.add('show');
}

function switchTaskSnapshotTab(button) {
  const shell = button.closest('.task-snapshot-shell');
  if (!shell) return;
  const key = button.dataset.tab;
  shell.querySelectorAll('.task-snapshot-tab').forEach(tab => {
    tab.classList.toggle('active', tab === button);
  });
  shell.querySelectorAll('.task-snapshot-panel').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.panel === key);
  });
}

function switchWorkorderStep(button) {
  const flow = button.closest('.workorder-flow');
  if (!flow) return;
  const key = button.dataset.workorderStep;
  flow.querySelectorAll('.workorder-step').forEach(step => {
    step.classList.toggle('active', step === button);
  });
  flow.querySelectorAll('.workorder-step-panel').forEach(panel => {
    panel.classList.toggle('active', panel.dataset.workorderPanel === key);
  });
}

function renderSyncStatusTag(status) {
  const normalized = status || '待同步';
  const cls = normalized.includes('成功') || normalized.includes('已同步') ? 'green' : (normalized.includes('失败') ? 'red' : 'orange');
  return `<span class="tag-chip ${cls}">${normalized}</span>`;
}

function renderSyncStatusText(status) {
  return status || '待同步';
}

function renderDispatchExecutedBadge() {
  return '<span class="trace-status-badge">已执行同步 · NEV线索中台</span>';
}

function renderCallBillReceivedBadge() {
  return '<span class="trace-status-badge blue">已收到话单结果</span>';
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sortTasksByCreatedAtDesc(tasks) {
  return [...tasks].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || ''), 'zh-CN', { numeric: true }));
}

function renderTaskOverview(tasks) {
  const latestTask = sortTasksByCreatedAtDesc(tasks)[0];
  const processingCount = tasks.filter(task => task.systemStatus === '处理中').length;
  const processedCount = tasks.filter(task => task.systemStatus === '已处理').length;
  const items = [
    { label: '任务总数', value: tasks.length },
    { label: '最近跟进时间', value: latestTask?.createdAt || '—' },
    { label: '处理中任务', value: processingCount },
    { label: '已处理任务', value: processedCount }
  ];
  return `
    <div class="task-overview">
      ${items.map(item => `
        <div class="task-overview-item">
          <div class="task-overview-label">${item.label}</div>
          <div class="task-overview-value">${item.value}</div>
        </div>
      `).join('')}
    </div>
  `;
}
