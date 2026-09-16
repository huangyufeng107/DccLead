// ===== Shared UI Utilities =====
function getTagPickerInputs(panelId) {
  const panel = document.getElementById(panelId);
  return panel ? [...panel.querySelectorAll('.tag-option input')] : [];
}

function getVisibleTagPickerInputs(panelId) {
  const panel = document.getElementById(panelId);
  if (!panel) return [];
  return [...panel.querySelectorAll('.tag-option')]
    .filter(option => option.style.display !== 'none')
    .map(option => option.querySelector('input'))
    .filter(Boolean);
}

function toggleExclusivePanel(panelId, panelSelector = '.tag-picker-panel') {
  document.querySelectorAll(panelSelector).forEach(panel => {
    if (panel.id !== panelId) panel.classList.remove('show');
  });
  document.getElementById(panelId)?.classList.toggle('show');
}

function updatePickerSummaryFromInputs({ inputs, triggerId, countId, placeholder, maxLabels = 3, total }) {
  const inputList = [...inputs];
  const trigger = document.getElementById(triggerId);
  if (!trigger) return [];
  const selected = inputList.filter(input => input.checked).map(input => input.value);
  inputList.forEach(input => input.closest('.tag-option')?.classList.toggle('selected', input.checked));
  const visibleLabels = selected.slice(0, maxLabels);
  const summary = selected.length
    ? visibleLabels.join('、') + (selected.length > maxLabels ? ` 等${selected.length}项` : '')
    : placeholder;
  // 选择器可选用独立摘要节点，避免长文本直接撑高按钮本身。
  const summaryNode = trigger.querySelector('[data-picker-summary]');
  if (summaryNode) summaryNode.textContent = summary;
  else trigger.textContent = summary;
  trigger.classList.toggle('placeholder', selected.length === 0);
  const count = document.getElementById(countId);
  if (count) count.textContent = `已选 ${selected.length} / ${total ?? inputList.length}`;
  return selected;
}

function updateMultiSelectPickerSummary({ panelId, triggerId, countId, placeholder, maxLabels = 3 }) {
  return updatePickerSummaryFromInputs({
    inputs: getTagPickerInputs(panelId),
    triggerId,
    countId,
    placeholder,
    maxLabels
  });
}

function setPickerInputsChecked(inputs, checked, updateSummary) {
  inputs.forEach(input => {
    input.checked = checked;
  });
  updateSummary();
}

function togglePickerOption(input, updateSummary) {
  input.closest('.tag-option')?.classList.toggle('selected', input.checked);
  updateSummary();
}

// Keep dropdown selections and manual multi-value inputs in sync when switching entry modes.
function syncPickerManualInput({ mode, pickerSelector, manualInputId, onSync }) {
  const inputs = [...document.querySelectorAll(pickerSelector)];
  const manualInput = document.getElementById(manualInputId);
  if (!manualInput) return;
  if (mode === 'manual') {
    manualInput.value = [...new Set(inputs.filter(input => input.checked).map(input => input.value))].join('\n');
  } else {
    const values = new Set((manualInput.value || '').split(/[\n,;，；\s]+/).map(value => value.trim()).filter(Boolean));
    inputs.forEach(input => {
      input.checked = values.has(input.value);
      input.closest('.tag-option')?.classList.toggle('selected', input.checked);
    });
  }
  if (typeof onSync === 'function') onSync();
}

function filterTagPickerOptions(panelId, keyword) {
  const panel = document.getElementById(panelId);
  if (!panel) return;
  const normalized = String(keyword || '').trim().toLowerCase();
  const options = [...panel.querySelectorAll('.tag-option')];
  let visibleCount = 0;
  options.forEach(option => {
    const text = option.textContent.trim().toLowerCase();
    const visible = !normalized || text.includes(normalized);
    option.style.display = visible ? '' : 'none';
    if (visible) visibleCount += 1;
  });
  const empty = panel.querySelector('.tag-picker-empty');
  if (empty) empty.style.display = visibleCount ? 'none' : 'block';
}

function updateSelectedValues(values, value, checked) {
  return checked
    ? [...new Set([...values, value])]
    : values.filter(item => item !== value);
}

function renderAccountMultiPicker({
  selectedAccounts = [],
  users = [],
  formatLabel,
  hiddenId,
  triggerId,
  countId,
  listId,
  placeholder,
  onchange
}) {
  const selectedUsers = users.filter(user => selectedAccounts.includes(user.account));
  const labels = selectedUsers.map(formatLabel);
  const hidden = document.getElementById(hiddenId);
  const trigger = document.getElementById(triggerId);
  const count = document.getElementById(countId);
  const list = document.getElementById(listId);
  if (hidden) hidden.value = labels.join('、');
  if (trigger) {
    trigger.textContent = labels.length
      ? labels.slice(0, 2).join('、') + (labels.length > 2 ? ` 等${labels.length}人` : '')
      : placeholder;
    trigger.classList.toggle('placeholder', labels.length === 0);
  }
  if (count) count.textContent = `已选 ${labels.length} / ${users.length}`;
  if (list) list.innerHTML = users.map(user => {
    const handler = onchange(user);
    return `
      <label class="account-option">
        <input type="checkbox" value="${user.account}" ${selectedAccounts.includes(user.account) ? 'checked' : ''} onchange="${handler}" />
        <span>
          <div class="account-option-name">${user.name} · ${user.role}</div>
          <div class="account-option-meta">${user.account}｜${user.department}</div>
        </span>
      </label>
    `;
  }).join('');
  return labels;
}

// ===== Shared notice / filter components =====
const policyRuleNoteTimers = {};
const policyRuleNoteIntervals = {};
const uiActionHandlers = new Map();
const uiActionCallbacks = new Map();

function renderPolicyRuleNote(noteId, content, { className = '', style = '' } = {}) {
  return `
    <div class="policy-rule-note${className ? ` ${className}` : ''}" id="${noteId}"${style ? ` style="${style}"` : ''}>
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 1 21h22L12 2zm1 16h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
      <div>${content}</div>
    </div>`;
}

function schedulePolicyRuleNoteAutoHide(noteId, durationSeconds = 10) {
  const note = document.getElementById(noteId);
  if (!note) return;
  const duration = Math.max(1, Number(durationSeconds) || 10);
  let remainSeconds = duration;
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
  }, duration * 1000);
}

function mountFilterQueryPanel(panelOrId) {
  const panel = typeof panelOrId === 'string' ? document.getElementById(panelOrId) : panelOrId;
  if (!panel) return null;
  panel.classList.add('unified-filter-query');
  return panel;
}

function registerUiAction(action, handler) {
  if (!action || typeof handler !== 'function') return;
  uiActionHandlers.set(action, handler);
}

// Shared, declarative close action for static modal controls. Individual
// modals can keep specialized close functions where they have extra cleanup.
registerUiAction('modal-close', target => {
  const modalId = target.dataset.modalId;
  // 静态关闭按钮只负责关闭目标窗口，不依赖后加载页面脚本中的
  // closeModal 全局函数，避免脚本加载顺序变化时出现“closeModal is not defined”。
  document.getElementById(modalId)?.classList.remove('show');
});

// Declarative callback bridge for dynamic prototype markup. Modules must register
// every callback explicitly; this avoids inline event attributes and does not
// permit arbitrary global function execution.
function registerUiActionCallback(name, handler) {
  if (!name || typeof handler !== 'function') return;
  uiActionCallbacks.set(name, handler);
}

function renderUiActionCallback(name, args = []) {
  const escapedName = String(name).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  const escapedArgs = JSON.stringify(args).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return `data-ui-action="callback" data-ui-callback="${escapedName}" data-ui-args="${escapedArgs}"`;
}

function resolveUiActionCallbackArg(value, target) {
  if (value === '$self') return target;
  if (value === '$value') return target.value;
  if (value === '$checked') return target.checked;
  if (typeof value === 'string' && value.startsWith('$data:')) return target.dataset[value.slice(6)];
  return value;
}

function dispatchUiAction(event) {
  const target = event.target.closest('[data-ui-action]');
  if (!target) return;
  if (target.dataset.uiAction === 'callback') {
    const callback = uiActionCallbacks.get(target.dataset.uiCallback);
    if (!callback) return;
    let args = [];
    try {
      args = JSON.parse(target.dataset.uiArgs || '[]');
    } catch (_) {
      return;
    }
    callback(...args.map(value => resolveUiActionCallbackArg(value, target)), event);
    return;
  }
  const handler = uiActionHandlers.get(target.dataset.uiAction);
  if (!handler) return;
  handler(target, event);
}

['click', 'change', 'input'].forEach(eventName => {
  document.addEventListener(eventName, dispatchUiAction);
});

// Static detail-page return controls. Keep the callbacks explicit so that no
// arbitrary global function name can be invoked from declarative markup.
registerUiActionCallback('return-policy-list', () => backToPolicyList());
registerUiActionCallback('return-nurture-list', () => backToLeadList());
registerUiActionCallback('return-worry-free-list', () => backToWorryFreeList());
registerUiActionCallback('return-resource-unfilled-list', () => backToResourceUnfilledBatchList());
registerUiActionCallback('close-crowd-smartcode-modal', () => closeCrowdSmartCodeModal());
registerUiActionCallback('close-crowd-smartcode-view-modal', () => closeViewCrowdSmartCodesModal());
registerUiActionCallback('close-logout-confirm', () => closeLogoutConfirm());
registerUiActionCallback('close-blacklist-user-add-modal', () => closeAddBlacklistUserModal());
registerUiActionCallback('close-blacklist-user-detail-modal', () => closeBlacklistUserDetailModal());
registerUiActionCallback('worry-free-metric-info', (metric, trigger) => showWorryFreeMetricInfo(metric, trigger));

