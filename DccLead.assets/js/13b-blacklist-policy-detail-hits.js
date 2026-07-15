// ===== View Modal =====
function openViewModal(id) {
  viewingId = id;
  hitRecordPage = 1;
  hitRecordKeyword = '';
  hitRecordPageSize = 10;
  activeTranscriptCallId = '';
  selectedHitRecordIds = [];
  stopRecordAudio();
  const p = policies.find(x => x.id === id);
  if (!p) return;

  const policyReviewRecords = p.manualReview ? (hitRecords[p.id] || []) : [];
  const policyPendingReview = policyReviewRecords.filter(record => (record.reviewStatus || '待审核') === '待审核').length;
  const policyReviewed = policyReviewRecords.filter(record => ['已通过', '已驳回'].includes(record.reviewStatus)).length;
  document.querySelector('nav[aria-label="培育策略三级菜单"]').classList.remove('hidden');
  document.querySelector('.leads-nav').classList.remove('show');
  setSidebarActiveByName('培育策略');
  setPageName('培育策略 / 黑名单策略 / 策略详情');
  setPolicyContentVisible(false);
  hideLeadPages();
  document.getElementById('designStage').classList.remove('show');
  document.querySelectorAll('nav[aria-label="培育策略三级菜单"] .strategy-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === 'blacklist-policy');
  });
  document.getElementById('policyDetailPage').classList.add('show');
  document.querySelector('#policyDetailPage .detail-page-title').textContent = '查看策略详情';
  document.getElementById('policyDetailSubtitle').textContent = `培育策略 / 黑名单策略 / ${p.name}`;
  const toolbar = document.querySelector('#policyDetailPage .lead-toolbar-right');
  if (toolbar) {
    toolbar.innerHTML = `
      <button class="btn-secondary" type="button" onclick="backToPolicyList()">返回列表</button>
      <button class="btn-add" type="button" onclick="editFromView()">编辑策略</button>
    `;
  }
  document.getElementById('policyDetailSummary').style.display = '';
  document.getElementById('policyDetailSummary').innerHTML = renderPolicyDetailSummary(p, policyPendingReview, policyReviewed);
  document.getElementById('policyDetailPageBody').innerHTML = renderPolicyDetailPageContent(p);
  renderHitRecordTable();
  const firstRecord = getFilteredHitRecords()[0];
  if (firstRecord) openTranscriptByCallId(firstRecord.callId, false);
}

function renderPolicyDetailPageContent(p) {
  const reviewDesc = p.manualReview
    ? '命中该策略后进入人工审核，审核通过后加入黑名单。'
    : '命中该策略后自动加入黑名单。';
  const durationText = p.durationType === 'perm' ? '永久' : `${p.validityNum}${p.validityUnit}`;
  const notificationConfig = getPolicyNotificationConfig(p);
  const notificationDetail = !p.manualReview ? '' : `
    <div class="strategy-detail-grid" style="margin-top:16px">
      <div class="view-field" style="grid-column:1/-1">
        <div class="view-field-label">审核与通知</div>
        <div class="view-field-value">${notificationConfig.enabled ? '已开启审核通知' : '未开启审核通知'}</div>
      </div>
      ${notificationConfig.enabled ? `
        <div class="view-field">
          <div class="view-field-label">审核人员</div>
          <div class="view-field-value">${notificationConfig.reviewUsers || '—'}</div>
        </div>
        <div class="view-field">
          <div class="view-field-label">站内通知人员</div>
          <div class="view-field-value">${notificationConfig.messageUsers || '—'}</div>
        </div>
        <div class="view-field">
          <div class="view-field-label">邮件通知邮箱</div>
          <div class="view-field-value">${notificationConfig.mailUsers || '—'}</div>
        </div>
        <div class="view-field">
          <div class="view-field-label">邮件抄送邮箱</div>
          <div class="view-field-value">${notificationConfig.mailCcUsers || '—'}</div>
        </div>
        <div class="view-field">
          <div class="view-field-label">通知频率</div>
          <div class="view-field-value">${notificationConfig.frequency || '—'}</div>
        </div>
        <div class="view-field">
          <div class="view-field-label">超时提醒</div>
          <div class="view-field-value">${notificationConfig.timeoutReminder || '—'}</div>
        </div>
      ` : ''}
    </div>
  `;
  return `
    <div class="strategy-detail-grid">
      <div class="view-field" style="grid-column:1/-1">
        <div class="view-field-label">策略说明</div>
        <div class="view-field-value">${p.desc || '—'}</div>
      </div>
      <div class="view-field">
        <div class="view-field-label">外呼类型</div>
        <div class="view-field-value">${p.callType}</div>
      </div>
      <div class="view-field">
        <div class="view-field-label">外呼标签</div>
        <div class="view-field-value">${renderPolicyTableTagsText(p)}</div>
      </div>
      <div class="view-field">
        <div class="view-field-label">黑名单期限</div>
        <div class="view-field-value">${durationText}</div>
      </div>
      <div class="view-field">
        <div class="view-field-label">命中处理说明</div>
        <div class="view-field-value">${reviewDesc}</div>
      </div>
    </div>
    ${notificationDetail}
    <div class="hit-record-section">
      <div class="hit-record-title">
        <span>命中「${p.name}」的线索记录</span>
        <span class="hit-record-count">点击记录行，下方同步展示录音对话</span>
      </div>
      <div class="hit-record-tools">
        <div class="hit-record-tool-left">
          <input class="hit-record-search" id="hitRecordSearch" type="search" placeholder="搜索电话号码或通话ID" oninput="searchHitRecords(this.value)" />
          <select class="hit-page-size" id="hitRecordPageSize" onchange="changeHitRecordPageSize(this.value)">
            <option value="10">每页 10 条</option>
            <option value="20">每页 20 条</option>
            <option value="50">每页 50 条</option>
          </select>
        </div>
        <div class="hit-record-tool-right" id="hitBatchTools"></div>
      </div>
      <div class="audio-player" id="recordAudioPlayer">
        <button class="audio-toggle" type="button" onclick="toggleRecordAudioPlayback(event)" aria-label="暂停或继续试听" id="recordAudioToggle">
          <svg id="recordAudioIcon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5h3v14H8V5zm5 0h3v14h-3V5z"/></svg>
        </button>
        <div class="audio-main">
          <div class="audio-title-row">
            <span class="audio-title" id="recordAudioTitle">当前录音</span>
            <span class="audio-time" id="recordAudioTime">00:00 / 00:00</span>
          </div>
          <div class="audio-progress" aria-label="录音播放进度">
            <div class="audio-progress-bar" id="recordAudioProgress"></div>
          </div>
        </div>
      </div>
      <div class="hit-record-table-wrap">
        <table class="hit-record-table">
          <thead>
            <tr>
              <th style="width:32px"><input type="checkbox" id="hitRecordSelectAll" onchange="toggleAllPendingHitRecords(this.checked)" /></th>
              <th style="width:96px">培育线索编码</th>
              <th style="width:96px">培育任务编码</th>
              <th style="width:96px">回访工单编码</th>
              <th style="width:88px">通话ID</th>
              <th style="width:76px">电话号码</th>
              <th style="width:132px">策略定义的外呼标签规则</th>
              <th style="width:64px">审核状态</th>
              <th style="width:64px">系统状态</th>
              <th style="width:86px">异常原因</th>
              <th style="width:54px">录音试听</th>
              <th style="width:62px">录音文本</th>
              <th style="width:76px">审核操作</th>
            </tr>
          </thead>
          <tbody id="hitRecordTableBody"></tbody>
        </table>
        <div class="hit-record-footer">
          <span id="hitRecordInfo">共 0 条记录</span>
          <div class="hit-record-pager">
            <button class="page-btn" type="button" onclick="changeHitRecordPage(-1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
            <div class="page-btn active" id="hitRecordPageBtn">1</div>
            <button class="page-btn" type="button" onclick="changeHitRecordPage(1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
          </div>
        </div>
      </div>
      <div class="transcript-panel" id="transcriptPanel">
        <div class="transcript-header">
          <div>
            <div class="transcript-title" id="transcriptTitle">录音文本</div>
            <div class="transcript-meta" id="transcriptMeta"></div>
          </div>
          <button class="transcript-close" type="button" onclick="closeTranscript()">收起对话</button>
        </div>
        <div class="transcript-body" id="transcriptBody"></div>
      </div>
    </div>
  `;
}

function renderPolicyDetailSummary(policy, pendingReview, reviewed) {
  const items = [
    { label: '策略名称', value: detailValue(policy.name) },
    { label: '状态', value: policy.status === '启用' ? '<span style="color:#52c41a">● 启用</span>' : '<span style="color:#8c8c8c">● 停用</span>' },
    { label: '权重', value: `<span class="priority-badge">P${policy.priority || 10}</span>` },
    { label: '审核机制', value: policy.manualReview ? '<span class="tag-chip orange">人工审核</span>' : '<span class="tag-chip gray">自动入黑</span>' },
    { label: '待审核', value: policy.manualReview ? pendingReview.toLocaleString() : '—' },
    { label: '已审核', value: policy.manualReview ? reviewed.toLocaleString() : '—' },
    { label: '累计拦截', value: policy.hitCount.toLocaleString() }
  ];
  return items.map(item => `
    <div class="lead-summary-item">
      <div class="lead-summary-label">${item.label}</div>
      <div class="lead-summary-value">${item.value}</div>
    </div>
  `).join('');
}

function backToPolicyList() {
  stopRecordAudio();
  viewingId = null;
  activeTranscriptCallId = '';
  selectedHitRecordIds = [];
  hitRecordKeyword = '';
  hideLeadPages();
  setPolicyContentVisible(true);
  document.getElementById('designStage').classList.remove('show');
  document.querySelector('nav[aria-label="培育策略三级菜单"]').classList.remove('hidden');
  document.querySelector('.leads-nav').classList.remove('show');
  document.querySelectorAll('nav[aria-label="培育策略三级菜单"] .strategy-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.page === 'blacklist-policy');
  });
  setSidebarActiveByName('培育策略');
  setPageName('培育策略 / 黑名单策略');
  renderTable();
}

function getFilteredHitRecords() {
  const records = hitRecords[viewingId] || [];
  const keyword = hitRecordKeyword.trim().toLowerCase();
  if (!keyword) return records;
  return records.filter(record =>
    record.phone.toLowerCase().includes(keyword) ||
    record.callId.toLowerCase().includes(keyword)
  );
}

function renderHitRecordTable() {
  const body = document.getElementById('hitRecordTableBody');
  if (!body) return;

  const records = getFilteredHitRecords();
  const totalPages = Math.max(1, Math.ceil(records.length / hitRecordPageSize));
  hitRecordPage = Math.min(hitRecordPage, totalPages);
  const start = (hitRecordPage - 1) * hitRecordPageSize;
  const pageRecords = records.slice(start, start + hitRecordPageSize);

  body.innerHTML = pageRecords.length
    ? pageRecords.map(record => `
      <tr class="hit-record-row ${record.callId === activeTranscriptCallId ? 'active' : ''}" onclick="openTranscriptByCallId('${record.callId}', false)">
        <td><input type="checkbox" ${isRecordPendingReview(record, viewingId) ? '' : 'disabled'} ${selectedHitRecordIds.includes(record.callId) ? 'checked' : ''} onclick="event.stopPropagation()" onchange="toggleHitRecordSelection(this)" value="${record.callId}" /></td>
        <td><span class="cell-text">${record.leadCode}</span></td>
        <td><span class="cell-text">${record.taskCode}</span></td>
        <td><span class="cell-text">${record.aiCode}</span></td>
        <td><span class="cell-text" title="${record.callId}">${record.callId}</span></td>
        <td><span class="cell-text">${record.phone}</span></td>
        <td>${renderPolicyTagRule(viewingId)}</td>
        <td>${renderReviewStatus(record, viewingId)}</td>
        <td>${renderSystemStatus(record, viewingId)}</td>
        <td>${renderHitExceptionReason(record, viewingId)}</td>
        <td><button class="listen-btn ${activeAudioCallId === record.callId && audioPlaying ? 'playing' : ''}" type="button" onclick="listenRecordAudio(event, '${record.callId}', this)">${activeAudioCallId === record.callId && audioPlaying ? '试听中' : record.audio}</button></td>
        <td>
          <div class="record-text-hint">${record.callId === activeTranscriptCallId ? '当前对话已展示' : '点击本行查看对话'}</div>
        </td>
        <td>${renderReviewActions(record, viewingId)}</td>
      </tr>
    `).join('')
    : `<tr><td colspan="13"><div class="empty-state" style="padding:28px 20px">暂无命中线索记录</div></td></tr>`;

  document.getElementById('hitRecordInfo').textContent = `共 ${records.length} 条记录，当前第 ${hitRecordPage} / ${totalPages} 页`;
  document.getElementById('hitRecordPageBtn').textContent = hitRecordPage;
  renderHitBatchTools(pageRecords);

  if (activeTranscriptCallId && !records.some(record => record.callId === activeTranscriptCallId)) {
    closeTranscript();
  }
}

function listenRecordAudio(event, callId, button) {
  if (event) event.stopPropagation();
  const record = (hitRecords[viewingId] || []).find(item => item.callId === callId);
  if (!record) return;

  if (activeAudioCallId === callId && audioPlaying) {
    pauseRecordAudio();
    return;
  }

  const isSameAudio = activeAudioCallId === callId;
  activeAudioCallId = callId;
  audioPlaying = true;
  audioProgressSeconds = isSameAudio && audioProgressSeconds > 0 ? audioProgressSeconds : 0;
  audioDurationSeconds = parseDurationToSeconds(record.transcript?.duration || '02:00');
  updateRecordAudioPlayer(record);
  startRecordAudioTimer();
  renderHitRecordTable();
  showToast(`正在试听录音：${callId}`, true);
}

function toggleRecordAudioPlayback(event) {
  if (event) event.stopPropagation();
  if (!activeAudioCallId) return;
  const record = (hitRecords[viewingId] || []).find(item => item.callId === activeAudioCallId);
  if (!record) return;
  if (audioPlaying) {
    pauseRecordAudio();
  } else {
    audioPlaying = true;
    updateRecordAudioPlayer(record);
    startRecordAudioTimer();
    renderHitRecordTable();
  }
}

function pauseRecordAudio() {
  audioPlaying = false;
  window.clearInterval(audioTimer);
  audioTimer = null;
  const record = (hitRecords[viewingId] || []).find(item => item.callId === activeAudioCallId);
  if (record) updateRecordAudioPlayer(record);
  renderHitRecordTable();
}

function stopRecordAudio() {
  window.clearInterval(audioTimer);
  audioTimer = null;
  activeAudioCallId = '';
  audioPlaying = false;
  audioProgressSeconds = 0;
  audioDurationSeconds = 0;
  const player = document.getElementById('recordAudioPlayer');
  if (player) player.classList.remove('show');
}

function startRecordAudioTimer() {
  window.clearInterval(audioTimer);
  audioTimer = window.setInterval(() => {
    if (!audioPlaying) return;
    audioProgressSeconds += 1;
    if (audioProgressSeconds >= audioDurationSeconds) {
      audioProgressSeconds = audioDurationSeconds;
      pauseRecordAudio();
    }
    const record = (hitRecords[viewingId] || []).find(item => item.callId === activeAudioCallId);
    if (record) updateRecordAudioPlayer(record);
  }, 1000);
}

function updateRecordAudioPlayer(record) {
  const player = document.getElementById('recordAudioPlayer');
  if (!player) return;
  player.classList.add('show');
  document.getElementById('recordAudioTitle').textContent = `${audioPlaying ? '正在试听' : '已暂停'} · ${record.phone} · ${record.callId}`;
  document.getElementById('recordAudioTime').textContent = `${formatAudioTime(audioProgressSeconds)} / ${formatAudioTime(audioDurationSeconds)}`;
  document.getElementById('recordAudioProgress').style.width = `${audioDurationSeconds ? Math.min(100, (audioProgressSeconds / audioDurationSeconds) * 100) : 0}%`;
  document.getElementById('recordAudioIcon').innerHTML = audioPlaying
    ? '<path d="M8 5h3v14H8V5zm5 0h3v14h-3V5z"/>'
    : '<path d="M8 5v14l11-7L8 5z"/>';
}

function parseDurationToSeconds(duration) {
  const parts = String(duration || '00:00').split(':').map(num => parseInt(num, 10) || 0);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return (parts[0] || 0) * 60 + (parts[1] || 0);
}

function formatAudioTime(seconds) {
  const safeSeconds = Math.max(0, Math.floor(seconds || 0));
  const mins = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const secs = String(safeSeconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function renderPolicyTagRule(policyId) {
  const policy = policies.find(p => p.id === policyId);
  if (!policy) return '<span style="color:#bfbfbf">—</span>';
  return renderPolicyTableTagsText(policy);
}

function renderReviewStatus(record, policyId) {
  const policy = policies.find(p => p.id === policyId);
  if (!policy?.manualReview) return '<span style="color:#94a3b8">—</span>';
  const status = record.reviewStatus || '待审核';
  if (status === '已通过') return '<span class="tag-chip green">审核通过</span>';
  if (status === '已驳回') return '<span class="tag-chip gray">已驳回</span>';
  return '<span class="tag-chip orange">待审核</span>';
}

function getHitRecordSystemStatus(record, policyId) {
  if (record.systemStatus) return record.systemStatus;
  const policy = policies.find(p => p.id === policyId);
  const reviewStatus = record.reviewStatus || '待审核';
  if (policy?.manualReview && reviewStatus === '待审核') return '待处理';
  return '已处理';
}

function renderSystemStatus(record, policyId) {
  const status = getHitRecordSystemStatus(record, policyId);
  const color = status === '待处理' ? '#d97706' : '#16a34a';
  return `<span class="policy-plain-text" style="color:${color}">${status}</span>`;
}

function getHitExceptionReason(record, policyId) {
  if (record.exceptionReason) return record.exceptionReason;
  const policy = policies.find(p => p.id === policyId);
  const reviewStatus = record.reviewStatus || '待审核';
  if (policy?.manualReview && reviewStatus === '待审核') return '—';
  if (!policy?.manualReview || reviewStatus === '已通过') return '冲突任务';
  return '—';
}

function renderHitExceptionReason(record, policyId) {
  const reason = getHitExceptionReason(record, policyId);
  return `<span class="policy-plain-text">${reason}</span>`;
}

function isRecordPendingReview(record, policyId) {
  const policy = policies.find(p => p.id === policyId);
  return !!policy?.manualReview && (record.reviewStatus || '待审核') === '待审核';
}

function renderReviewActions(record, policyId) {
  const policy = policies.find(p => p.id === policyId);
  if (!policy?.manualReview) return '<span style="color:#94a3b8">—</span>';
  if ((record.reviewStatus || '待审核') !== '待审核') return '<span style="color:#94a3b8">已处理</span>';
  return `
    <div class="review-actions">
      <button class="review-btn approve" type="button" onclick="event.stopPropagation(); reviewHitRecord('${record.callId}', '已通过')">通过</button>
      <button class="review-btn reject" type="button" onclick="event.stopPropagation(); reviewHitRecord('${record.callId}', '已驳回')">驳回</button>
    </div>
  `;
}

function renderHitBatchTools(pageRecords) {
  const tools = document.getElementById('hitBatchTools');
  if (!tools) return;
  const policy = policies.find(p => p.id === viewingId);
  if (!policy?.manualReview) {
    const selectAll = document.getElementById('hitRecordSelectAll');
    if (selectAll) {
      selectAll.disabled = true;
      selectAll.checked = false;
    }
    selectedHitRecordIds = [];
    tools.innerHTML = '';
    return;
  }
  const pendingPageRecords = pageRecords.filter(record => isRecordPendingReview(record, viewingId));
  const checkedPendingCount = pendingPageRecords.filter(record => selectedHitRecordIds.includes(record.callId)).length;
  const selectAll = document.getElementById('hitRecordSelectAll');
  if (selectAll) {
    selectAll.disabled = pendingPageRecords.length === 0;
    selectAll.checked = pendingPageRecords.length > 0 && checkedPendingCount === pendingPageRecords.length;
  }
  tools.innerHTML = `
    <span class="batch-hint">已选 ${selectedHitRecordIds.length} 条待审核</span>
    <button class="review-btn approve" type="button" ${selectedHitRecordIds.length ? '' : 'disabled'} onclick="batchReviewHitRecords('已通过')">批量通过</button>
    <button class="review-btn reject" type="button" ${selectedHitRecordIds.length ? '' : 'disabled'} onclick="batchReviewHitRecords('已驳回')">批量驳回</button>
  `;
}

function toggleHitRecordSelection(input) {
  if (input.checked) {
    selectedHitRecordIds = [...new Set([...selectedHitRecordIds, input.value])];
  } else {
    selectedHitRecordIds = selectedHitRecordIds.filter(id => id !== input.value);
  }
  renderHitRecordTable();
}

function toggleAllPendingHitRecords(checked) {
  const records = getFilteredHitRecords();
  const start = (hitRecordPage - 1) * hitRecordPageSize;
  const pageRecords = records.slice(start, start + hitRecordPageSize);
  const pendingIds = pageRecords.filter(record => isRecordPendingReview(record, viewingId)).map(record => record.callId);
  selectedHitRecordIds = checked
    ? [...new Set([...selectedHitRecordIds, ...pendingIds])]
    : selectedHitRecordIds.filter(id => !pendingIds.includes(id));
  renderHitRecordTable();
}

function batchReviewHitRecords(status) {
  const records = hitRecords[viewingId] || [];
  let changed = 0;
  records.forEach(record => {
    if (selectedHitRecordIds.includes(record.callId) && isRecordPendingReview(record, viewingId)) {
      record.reviewStatus = status;
      record.systemStatus = '已处理';
      record.exceptionReason = status === '已通过' ? '冲突任务' : '—';
      changed += 1;
    }
  });
  selectedHitRecordIds = [];
  showToast(status === '已通过' ? `已批量通过 ${changed} 条，号码将加入黑名单` : `已批量驳回 ${changed} 条`, true);
  renderTable();
  openViewModal(viewingId);
}

function reviewHitRecord(callId, status) {
  const records = hitRecords[viewingId] || [];
  const record = records.find(item => item.callId === callId);
  if (!record) return;
  record.reviewStatus = status;
  record.systemStatus = '已处理';
  record.exceptionReason = status === '已通过' ? '冲突任务' : '—';
  showToast(status === '已通过' ? '已审核通过，号码将加入黑名单' : '已驳回，该号码不会加入黑名单', true);
  renderTable();
  openViewModal(viewingId);
}

function searchHitRecords(value) {
  hitRecordKeyword = value;
  hitRecordPage = 1;
  selectedHitRecordIds = [];
  const firstRecord = getFilteredHitRecords()[0];
  if (firstRecord) {
    openTranscriptByCallId(firstRecord.callId, false);
  } else {
    activeTranscriptCallId = '';
    renderHitRecordTable();
  }
}

function changeHitRecordPageSize(value) {
  hitRecordPageSize = Number(value);
  hitRecordPage = 1;
  selectedHitRecordIds = [];
  const firstRecord = getFilteredHitRecords()[0];
  if (firstRecord) {
    openTranscriptByCallId(firstRecord.callId, false);
  } else {
    activeTranscriptCallId = '';
    renderHitRecordTable();
  }
}

function changeHitRecordPage(dir) {
  selectedHitRecordIds = [];
  const records = getFilteredHitRecords();
  const totalPages = Math.max(1, Math.ceil(records.length / hitRecordPageSize));
  hitRecordPage = Math.max(1, Math.min(totalPages, hitRecordPage + dir));
  const start = (hitRecordPage - 1) * hitRecordPageSize;
  const firstRecord = records.slice(start, start + hitRecordPageSize)[0];
  if (firstRecord) {
    openTranscriptByCallId(firstRecord.callId, false);
  } else {
    renderHitRecordTable();
  }
}

