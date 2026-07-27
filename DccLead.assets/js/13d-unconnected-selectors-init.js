// ====== unconnected belong type selectors ======
let unconnectedSmartCodeInputModeState = 'picker';

function toggleUnconnectedChannelPicker() {
  toggleExclusivePanel('unconnectedChannelPanel');
}

function selectAllUnconnectedChannelOptions() {
  setPickerInputsChecked(getTagPickerInputs('unconnectedChannelPanel'), true, updateUnconnectedChannelSelectedCount);
}

function clearUnconnectedChannelOptions() {
  setPickerInputsChecked(getTagPickerInputs('unconnectedChannelPanel'), false, updateUnconnectedChannelSelectedCount);
}

function filterUnconnectedChannelOptions(val) {
  const query = String(val || '').toLowerCase().trim();
  let matches = 0;
  document.querySelectorAll('#unconnectedChannelList .tag-option').forEach(el => {
    const optVal = String(el.dataset.channelOption || '').toLowerCase();
    const show = !query || optVal.includes(query);
    el.style.display = show ? '' : 'none';
    if (show) matches++;
  });
  const empty = document.getElementById('unconnectedChannelSearchEmpty');
  if (empty) empty.style.display = matches ? 'none' : '';
}

function toggleUnconnectedChannelOption(input) {
  togglePickerOption(input, updateUnconnectedChannelSelectedCount);
}

function updateUnconnectedChannelSelectedCount() {
  updateMultiSelectPickerSummary({
    panelId: 'unconnectedChannelPanel',
    triggerId: 'unconnectedChannelTrigger',
    countId: 'unconnectedChannelSelectedCount',
    placeholder: '请选择渠道编码'
  });
}

function switchUnconnectedSmartCodeInputMode(mode) {
  unconnectedSmartCodeInputModeState = mode;
  const isManual = mode === 'manual';
  syncPickerManualInput({ mode, pickerSelector: 'input[name="unconnectedSmartCodeValue"]', manualInputId: 'unconnectedSmartCodeManualInput', onSync: updateUnconnectedSmartCodeSelectedCount });
  document.getElementById('unconnectedSmartCodePickerModeBtn')?.classList.toggle('active', !isManual);
  document.getElementById('unconnectedSmartCodeManualModeBtn')?.classList.toggle('active', isManual);
  const picker = document.getElementById('unconnectedSmartCodePickerInputPanel');
  const manual = document.getElementById('unconnectedSmartCodeManualInputPanel');
  if (picker) picker.style.display = isManual ? 'none' : '';
  if (manual) manual.style.display = isManual ? '' : 'none';
}

function toggleUnconnectedSmartCodePicker() {
  toggleExclusivePanel('unconnectedSmartCodePanel');
}

function selectAllUnconnectedSmartCodeOptions() {
  setPickerInputsChecked(getTagPickerInputs('unconnectedSmartCodePanel'), true, updateUnconnectedSmartCodeSelectedCount);
}

function clearUnconnectedSmartCodeOptions() {
  setPickerInputsChecked(getTagPickerInputs('unconnectedSmartCodePanel'), false, updateUnconnectedSmartCodeSelectedCount);
}

function filterUnconnectedSmartCodeOptions(val) {
  const query = String(val || '').toLowerCase().trim();
  let matches = 0;
  document.querySelectorAll('#unconnectedSmartCodeList .tag-option').forEach(el => {
    const optVal = String(el.dataset.scOption || '').toLowerCase();
    const show = !query || optVal.includes(query);
    el.style.display = show ? '' : 'none';
    if (show) matches++;
  });
  const empty = document.getElementById('unconnectedSmartCodeSearchEmpty');
  if (empty) empty.style.display = matches ? 'none' : '';
}

function toggleUnconnectedSmartCodeOption(input) {
  togglePickerOption(input, updateUnconnectedSmartCodeSelectedCount);
}

function updateUnconnectedSmartCodeSelectedCount() {
  updateMultiSelectPickerSummary({
    panelId: 'unconnectedSmartCodePanel',
    triggerId: 'unconnectedSmartCodeTrigger',
    countId: 'unconnectedSmartCodeSelectedCount',
    placeholder: '请选择SmartCode'
  });
}

function syncUnconnectedBelongTypeFields(row) {
  const belongType = document.getElementById('cfgForm_belongType')?.value || '';
  const subContainer = document.getElementById('unconnectedBelongTypeSubContainer');
  if (!subContainer) return;
  const readonly = strategyConfiguratorEditing.mode === 'view';
  const disabledAttr = readonly ? 'disabled' : '';
  const channelPickerAction = readonly ? '' : 'data-ui-action="unconnected-channel-toggle"';
  const smartCodePickerAction = readonly ? '' : 'data-ui-action="unconnected-smartcode-toggle"';

  if (belongType === '渠道编码') {
    subContainer.style.display = '';
    const selectedValues = row ? (row.belongValues || []) : [];
    subContainer.innerHTML = `
      <div class="form-label">渠道编码 <span class="required">*</span></div>
      <div class="tag-picker project-name-picker unconnected-belong-picker ${readonly ? 'readonly' : ''}">
        <button class="tag-picker-trigger placeholder" id="unconnectedChannelTrigger" type="button" ${channelPickerAction}><span class="tag-picker-trigger-text" data-picker-summary>请选择渠道编码</span></button>
        <div class="tag-picker-panel" id="unconnectedChannelPanel">
          <div class="tag-picker-toolbar">
            <span id="unconnectedChannelSelectedCount">已选 ${selectedValues.length} / ${assignmentChannelCodeOptions.length}</span>
            ${readonly ? '' : `
            <div class="tag-picker-actions">
              <button class="tag-picker-action" type="button" data-ui-action="unconnected-channel-select-all">全选</button>
              <button class="tag-picker-action" type="button" data-ui-action="unconnected-channel-clear">清空</button>
            </div>
            `}
          </div>
          ${readonly ? '' : `
          <div class="tag-picker-search">
            <input type="search" id="unconnectedChannelSearchInput" placeholder="搜索渠道编码" data-ui-action="unconnected-channel-search" />
          </div>
          `}
          <div class="tag-picker-list" id="unconnectedChannelList">
            ${assignmentChannelCodeOptions.map(item => `
              <label class="tag-option ${selectedValues.includes(item) ? 'selected' : ''}" data-channel-option="${escapeAttr(item)}">
                <input type="checkbox" name="unconnectedChannelValue" value="${item}" ${selectedValues.includes(item) ? 'checked' : ''} ${disabledAttr} data-ui-action="unconnected-channel-option" />
                ${item}
              </label>
            `).join('')}
          </div>
          <div class="tag-picker-empty" id="unconnectedChannelSearchEmpty" style="display:none">暂无匹配的渠道编码</div>
        </div>
      </div>
    `;
    updateUnconnectedChannelSelectedCount();
  } else if (belongType === 'SmartCode') {
    subContainer.style.display = '';
    const selectedValues = row ? (row.belongValues || []) : [];
    const inputMode = row ? (row.smartCodeInputMode || 'picker') : 'picker';
    const manualValue = selectedValues.join('\n');
    subContainer.innerHTML = `
      <div class="form-label">SmartCode <span class="required">*</span></div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px;">
        <div class="smart-code-input-mode" style="margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
          <div class="form-label" style="font-weight: normal; font-size: 13px; color: #64748b; margin-bottom: 0;">录入方式</div>
          <div class="series-mode-toggle" style="margin-top: 0; margin-bottom: 0;">
            <button class="duration-tab ${inputMode === 'picker' ? 'active' : ''} ${readonly ? 'disabled' : ''}" type="button" id="unconnectedSmartCodePickerModeBtn" ${readonly ? '' : 'data-ui-action="unconnected-smartcode-mode" data-mode="picker"'}>下拉勾选</button>
            <button class="duration-tab ${inputMode === 'manual' ? 'active' : ''} ${readonly ? 'disabled' : ''}" type="button" id="unconnectedSmartCodeManualModeBtn" ${readonly ? '' : 'data-ui-action="unconnected-smartcode-mode" data-mode="manual"'}>手动输入</button>
          </div>
        </div>
        
        <div id="unconnectedSmartCodePickerInputPanel" style="${inputMode === 'manual' ? 'display:none' : ''}">
          <div class="tag-picker project-name-picker unconnected-belong-picker ${readonly ? 'readonly' : ''}">
            <button class="tag-picker-trigger placeholder" id="unconnectedSmartCodeTrigger" type="button" ${smartCodePickerAction}><span class="tag-picker-trigger-text" data-picker-summary>请选择SmartCode</span></button>
            <div class="tag-picker-panel" id="unconnectedSmartCodePanel">
              <div class="tag-picker-toolbar">
                <span id="unconnectedSmartCodeSelectedCount">已选 ${selectedValues.length} / ${assignmentSmartCodeOptions.length}</span>
                ${readonly ? '' : `
                <div class="tag-picker-actions">
                  <button class="tag-picker-action" type="button" data-ui-action="unconnected-smartcode-select-all">全选</button>
                  <button class="tag-picker-action" type="button" data-ui-action="unconnected-smartcode-clear">清空</button>
                </div>
                `}
              </div>
              ${readonly ? '' : `
              <div class="tag-picker-search">
                <input type="search" id="unconnectedSmartCodeSearchInput" placeholder="搜索SmartCode" data-ui-action="unconnected-smartcode-search" />
              </div>
              `}
              <div class="tag-picker-list" id="unconnectedSmartCodeList">
                ${assignmentSmartCodeOptions.map(item => `
                  <label class="tag-option ${selectedValues.includes(item) ? 'selected' : ''}" data-sc-option="${escapeAttr(item)}">
                    <input type="checkbox" name="unconnectedSmartCodeValue" value="${item}" ${selectedValues.includes(item) ? 'checked' : ''} ${disabledAttr} data-ui-action="unconnected-smartcode-option" />
                    ${item}
                  </label>
                `).join('')}
              </div>
              <div class="tag-picker-empty" id="unconnectedSmartCodeSearchEmpty" style="display:none">暂无匹配的SmartCode</div>
            </div>
          </div>
        </div>
        <div id="unconnectedSmartCodeManualInputPanel" style="${inputMode === 'manual' ? '' : 'display:none'}">
          <textarea class="form-input assignment-manual-textarea" id="unconnectedSmartCodeManualInput" rows="4" style="margin-top: 0;" placeholder="可一次粘贴多个 SmartCode，支持换行、逗号、分号或空格分隔" ${disabledAttr}>${escapeHtml(manualValue)}</textarea>
          <div class="series-form-hint" style="margin-bottom: 0;">保存时会自动拆分并去重；不在下拉选项中的 SmartCode 也可直接录入。</div>
        </div>
      </div>
    `;
    updateUnconnectedSmartCodeSelectedCount();
    switchUnconnectedSmartCodeInputMode(inputMode);
  } else {
    subContainer.style.display = 'none';
    subContainer.innerHTML = '';
  }
}

// ===== Init =====
renderTable();
schedulePolicyRuleNoteAutoHide('blacklistPolicyRuleNote');
registerUiAction('blacklist-policy-filter', filterTable);
registerUiAction('blacklist-policy-reset', resetPolicyFilters);
registerUiAction('unconnected-channel-toggle', toggleUnconnectedChannelPicker);
registerUiAction('unconnected-channel-select-all', selectAllUnconnectedChannelOptions);
registerUiAction('unconnected-channel-clear', clearUnconnectedChannelOptions);
registerUiAction('unconnected-channel-search', target => filterUnconnectedChannelOptions(target.value));
registerUiAction('unconnected-channel-option', toggleUnconnectedChannelOption);
registerUiAction('unconnected-smartcode-toggle', toggleUnconnectedSmartCodePicker);
registerUiAction('unconnected-smartcode-mode', target => switchUnconnectedSmartCodeInputMode(target.dataset.mode));
registerUiAction('unconnected-smartcode-select-all', selectAllUnconnectedSmartCodeOptions);
registerUiAction('unconnected-smartcode-clear', clearUnconnectedSmartCodeOptions);
registerUiAction('unconnected-smartcode-search', target => filterUnconnectedSmartCodeOptions(target.value));
registerUiAction('unconnected-smartcode-option', toggleUnconnectedSmartCodeOption);
