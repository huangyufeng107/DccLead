// ===== Transcript (Chat Bubble) =====
function openTranscriptByCallId(callId, shouldScroll = true) {
  const records = hitRecords[viewingId] || [];
  const recordIndex = records.findIndex(record => record.callId === callId);
  if (recordIndex === -1) return;
  if (activeAudioCallId && activeAudioCallId !== callId) {
    stopRecordAudio();
  }
  activeTranscriptCallId = callId;
  openTranscript(viewingId, recordIndex, shouldScroll);
  renderHitRecordTable();
}

function openTranscript(policyId, recordIndex, shouldScroll = true) {
  const records = hitRecords[policyId] || [];
  const record = records[recordIndex];
  if (!record || !record.transcript) {
    showToast('暂无录音文本数据', false);
    return;
  }

  const t = record.transcript;
  document.getElementById('transcriptTitle').textContent = '录音文本 · ' + record.phone;

  // Meta info bar
  document.getElementById('transcriptMeta').innerHTML =
    `<span>通话时长：${t.duration || '—'}</span>` +
    `<span>外呼类型：${t.callType || '—'}</span>` +
    `<span>通话ID：${record.callId}</span>`;

  // Render chat bubbles
  let html = '<div class="chat-time-divider">00:00 开始通话</div>';

  t.messages.forEach((msg, idx) => {
    const isAgent = msg.role === 'agent';
    const avatarText = isAgent ? '销' : '客';
    const senderName = isAgent ? '电销顾问' : '客户';
    const tagHtml = msg.tag
      ? `<span class="chat-sender-tag ${msg.tag}">${
          msg.tag === 'intent' ? '意向确认' :
          msg.tag === 'action' ? '关键动作' :
          msg.tag === 'complaint' ? '投诉风险' : msg.tag
        }</span>`
      : '';

    html += `
      <div class="chat-msg ${isAgent ? 'agent' : 'customer'}">
        <div class="chat-avatar">${avatarText}</div>
        <div class="chat-bubble-wrap">
          <div class="chat-sender">${senderName} ${tagHtml}</div>
          <div class="chat-bubble">${msg.text}</div>
        </div>
      </div>
    `;
  });

  // Tags bar
  if (t.tags && t.tags.length > 0) {
    html += `<div class="chat-tags-bar">${t.tags.map(tag =>
      `<span class="tag-chip">${tag}</span>`
    ).join('')}</div>`;
  }

  html += `<div class="chat-end-divider">通话结束 · 时长 ${t.duration || '—'}</div>`;

  document.getElementById('transcriptBody').innerHTML = html;
  document.getElementById('transcriptPanel').classList.add('show');
  if (shouldScroll) {
    document.getElementById('transcriptPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function closeTranscript() {
  const panel = document.getElementById('transcriptPanel');
  if (panel) panel.classList.remove('show');
  activeTranscriptCallId = '';
  const body = document.getElementById('hitRecordTableBody');
  if (body) {
    document.querySelectorAll('.hit-record-row').forEach(row => row.classList.remove('active'));
    document.querySelectorAll('.record-text-hint').forEach(hint => { hint.textContent = '点击本行查看对话'; });
  }
}

function editFromView() {
  const policyId = viewingId;
  closeViewModal();
  if (policyId) openModal('edit', policyId);
}

// ===== Delete =====
function deletePolicy(id) {
  if (!confirm('确认删除该黑名单策略？已拦截的记录不受影响。')) return;
  policies = policies.filter(p => p.id !== id);
  showToast('策略已删除', true);
  renderTable();
}

// ===== Toast =====
function showToast(msg, success = true) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast' + (success ? ' success' : '') + ' show';
  setTimeout(() => { t.classList.remove('show'); }, 2500);
}

function loginToPlatform(event) {
  event.preventDefault();
  document.body.classList.remove('login-active');
  showHomePage();
  showToast('登录成功', true);
}

const policyRuleNoteTimers = {};
const policyRuleNoteIntervals = {};

function schedulePolicyRuleNoteAutoHide(noteId) {
  const note = document.getElementById(noteId);
  if (!note) return;
  let remainSeconds = 10;
  let countdown = note.querySelector('.policy-note-countdown');
  if (!countdown) {
    countdown = document.createElement('span');
    countdown.className = 'policy-note-countdown';
    note.appendChild(countdown);
  }
  note.style.display = 'flex';
  countdown.textContent = `${remainSeconds}秒后自动收起`;
  if (policyRuleNoteTimers[noteId]) clearTimeout(policyRuleNoteTimers[noteId]);
  if (policyRuleNoteIntervals[noteId]) clearInterval(policyRuleNoteIntervals[noteId]);
  policyRuleNoteIntervals[noteId] = setInterval(() => {
    remainSeconds -= 1;
    countdown.textContent = `${Math.max(remainSeconds, 0)}秒后自动收起`;
    if (remainSeconds <= 0) clearInterval(policyRuleNoteIntervals[noteId]);
  }, 1000);
  policyRuleNoteTimers[noteId] = setTimeout(() => {
    const currentNote = document.getElementById(noteId);
    if (currentNote) currentNote.style.display = 'none';
  }, 10000);
}
