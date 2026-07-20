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
  trigger.textContent = selected.length
    ? visibleLabels.join('、') + (selected.length > maxLabels ? ` 等${selected.length}项` : '')
    : placeholder;
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
