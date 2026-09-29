(function () {
  const statusOptions = ['已接通', '客户未接听', '关机', '空号', '停机', '拒接', '接通秒挂', '待返回'];
  const callTypeOptions = ['新线索', '门店冷线索', '总部冷线索'];
  const actions = ['批量下发－无人接听下发', '批量下发－意向线索下发'];
  const state = {
    manual: { enabled: true, count: '5', contactStatus: '无人接听', action: actions[0] },
    ai: { enabled: true, callTypes: ['新线索'], statuses: [], action: actions[0] }
  };

  window.renderTianwangPaidDispatchConfig = function (type) {
    const isManual = type === 'manual';
    const page = document.getElementById(isManual ? 'tianwangManualDispatchConfigPage' : 'tianwangAiDispatchConfigPage');
    if (!page) return;
    const current = state[type];
    page.innerHTML = `
      <section class="tianwang-dispatch-page" aria-label="天网付费线索自动下发配置">
        <div class="page-hero tianwang-page-head">
          <div>
            <div class="page-title">天网付费自动下发</div>
            <div class="page-desc">${isManual ? '配置人工外呼模式下天网付费线索的自动下发策略与触发条件。仅对 SmartCode 命中“数据字典管理－天网 SmartCode”的线索生效。' : '配置AI外呼模式下天网付费线索的自动批量下发策略、外呼类型与通话状态触发规则。仅对 SmartCode 命中“数据字典管理－天网 SmartCode”的线索生效。'}</div>
          </div>
        </div>
        <article class="tianwang-card">
          <div class="tianwang-card-head"><strong>${isManual ? '人工外呼配置' : 'AI外呼自动批量下发'}</strong><label class="tianwang-switch"><input id="tianwangEnabled" type="checkbox" ${current.enabled ? 'checked' : ''}><span></span></label><b id="tianwangEnabledText">${current.enabled ? '已启用' : '已关闭'}</b></div>
          <p class="tianwang-intro">${isManual ? '人工回访记录保存后实时判断；仅统计人工回访任务记录，不读取 AI 外呼结果。' : 'AI 平台推送整轮外呼的最终结果后，结果保存完成即实时判断。'}</p>
          <div class="tianwang-form">${isManual ? renderManual(current) : renderAi(current)}</div>
          <footer class="tianwang-footer"><span>最后更新：管理员　2026-09-14 14:10</span><button id="tianwangSave" type="button" class="btn-primary">保存配置</button></footer>
        </article>
      </section>`;
    bindPage(type, page);
  };

  function renderLabel(label, required = true) { return `<div class="tianwang-label">${label}${required ? '<i>*</i>' : ''}</div>`; }
  function help(text) { return `<div class="tianwang-help">${text}</div>`; }
  function actionSelect(value, label) { return `<select id="tianwangAction" class="form-select" aria-label="${label}">${actions.map(item => `<option ${item === value ? 'selected' : ''}>${item}</option>`).join('')}</select>`; }
  function getContactStatusOptions() {
    if (typeof DICTIONARY_ITEMS !== 'undefined' && Array.isArray(DICTIONARY_ITEMS.CONTACT_STATUS)) {
      return DICTIONARY_ITEMS.CONTACT_STATUS
        .filter(item => item.status === '启用')
        .sort((a, b) => (a.order || 0) - (b.order || 0))
        .map(item => item.name);
    }
    return ['正常接通', '无人接听', '企微跟进', '客户拒绝', '忙音/秘书台', '空号', '停机', '关机'];
  }
  function renderManual(current) {
    return `${renderLabel('统计对象')}<div><input class="form-input" type="text" value="人工回访任务记录" aria-label="统计对象" readonly aria-readonly="true">${help('固定统计同一回访任务下的有效人工记录。')}</div>
      ${renderLabel('累计条件')}<div><div class="tianwang-inline"><input id="tianwangCount" class="form-input tianwang-count" type="number" min="1" max="99" step="1" required value="${current.count}" aria-label="累计次数"><span>次</span></div>${help('仅支持 1～99 的正整数。达到设定次数后，再判断最近一次记录是否满足末次条件。')}<div id="tianwangCountError" class="tianwang-error" role="alert"></div></div>
      ${renderLabel('接触状态')}<div><select id="tianwangManualContactStatus" class="form-select" aria-label="接触状态">${getContactStatusOptions().map(item => `<option ${item === current.contactStatus ? 'selected' : ''}>${item}</option>`).join('')}</select>${help('系统仅判断最近一次人工回访记录；选项与“接触状态”数据字典保持一致。')}</div>
      ${renderLabel('执行动作')}<div>${actionSelect(current.action, '人工执行动作')}${help('命中条件后，系统调用所选的既有批量下发流程；失败时任务保持原状态。')}</div>`;
  }
  function renderPickerText(values, noun) {
    if (!values.length) return `请选择${noun}`;
    return values.length === 1 ? values[0] : `已选择 ${values.length} 个${noun}`;
  }
  function renderAi(current) {
    return `${renderLabel('外呼类型')}<div class="tianwang-status-field"><button type="button" id="tianwangCallTypeTrigger" class="tianwang-status-trigger" aria-expanded="false"><span id="tianwangCallTypeText">${renderPickerText(current.callTypes, '外呼类型')}</span><span class="unconnected-select-arrow"></span></button><div id="tianwangCallTypeMenu" class="tianwang-status-menu" hidden><div class="tianwang-status-head"><b id="tianwangCallTypeCount">已选 ${current.callTypes.length} / ${callTypeOptions.length}</b><span><button type="button" id="tianwangCallTypeAll">全选</button><button type="button" id="tianwangCallTypeClear">清空</button></span></div><div class="tianwang-status-options">${callTypeOptions.map(item => `<label><input type="checkbox" value="${item}" ${current.callTypes.includes(item) ? 'checked' : ''}><span>${item}</span></label>`).join('')}</div></div>${help('仅对所选外呼类型的最终通话结果判断。')}<div id="tianwangCallTypeError" class="tianwang-error" role="alert"></div></div>
      ${renderLabel('判断记录', false)}<div><input class="form-input" type="text" value="整轮外呼最终结果" aria-label="判断记录" readonly aria-readonly="true">${help('固定规则：不累计次数，不读取重呼过程中的中间结果。')}</div>
      ${renderLabel('触发时机', false)}<div><input class="form-input" type="text" value="最终结果保存后立即触发" aria-label="触发时机" readonly aria-readonly="true">${help('固定规则：确保最终通话结果已经完成持久化。')}</div>
      ${renderLabel('通话状态')}<div class="tianwang-status-field"><button type="button" id="tianwangStatusTrigger" class="tianwang-status-trigger" aria-expanded="false"><span id="tianwangStatusText">${current.statuses.length ? `已选择 ${current.statuses.length} 个通话状态` : '请选择通话状态'}</span><span class="unconnected-select-arrow"></span></button><div id="tianwangStatusMenu" class="tianwang-status-menu" hidden><div class="tianwang-status-head"><b id="tianwangStatusCount">已选 ${current.statuses.length} / 8</b><span><button type="button" id="tianwangStatusAll">全选</button><button type="button" id="tianwangStatusClear">清空</button></span></div><div class="tianwang-status-options">${statusOptions.map(item => `<label><input type="checkbox" value="${item}" ${current.statuses.includes(item) ? 'checked' : ''}><span>${item}</span></label>`).join('')}</div></div>${help('最终通话状态命中任一已选状态时，执行自动下发。')}<div id="tianwangStatusError" class="tianwang-error" role="alert"></div></div>
      ${renderLabel('执行动作')}<div>${actionSelect(current.action, 'AI执行动作')}${help('命中条件后，系统调用所选的既有批量下发流程。')}</div>`;
  }

  function bindPage(type, page) {
    const current = state[type];
    const enabled = page.querySelector('#tianwangEnabled');
    const syncEditableState = () => {
      const editable = page.querySelectorAll('.tianwang-form input, .tianwang-form select, .tianwang-form button, #tianwangSave');
      editable.forEach(control => { control.disabled = !current.enabled; });
      page.querySelector('.tianwang-form').classList.toggle('is-disabled', !current.enabled);
      page.querySelectorAll('.tianwang-status-menu').forEach(menu => { if (!current.enabled) menu.hidden = true; });
      page.querySelectorAll('.tianwang-status-trigger').forEach(trigger => {
        if (!current.enabled) { trigger.classList.remove('open'); trigger.setAttribute('aria-expanded', 'false'); }
      });
    };
    enabled.addEventListener('change', () => { current.enabled = enabled.checked; page.querySelector('#tianwangEnabledText').textContent = current.enabled ? '已启用' : '已关闭'; syncEditableState(); });
    if (type === 'ai') { bindAiCallTypes(page, current); bindAiStatus(page, current); }
    if (type === 'manual') bindPositiveIntegerInput(page);
    syncEditableState();
    page.querySelector('#tianwangSave').addEventListener('click', () => {
      if (!current.enabled) return;
      const action = page.querySelector('#tianwangAction').value;
      if (type === 'manual') {
        const input = page.querySelector('#tianwangCount');
        const value = input.value.trim();
        const error = page.querySelector('#tianwangCountError');
        if (!/^[1-9]\d*$/.test(value) || Number(value) > 99) { error.textContent = '请输入 1～99 的正整数'; input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
        error.textContent = ''; input.removeAttribute('aria-invalid'); current.count = value;
        current.contactStatus = page.querySelector('#tianwangManualContactStatus').value;
      } else if (!current.callTypes.length) { page.querySelector('#tianwangCallTypeError').textContent = '请至少选择一个外呼类型'; return; }
      else if (!current.statuses.length) { page.querySelector('#tianwangStatusError').textContent = '请至少选择一个通话状态'; return; }
      current.action = action;
      if (typeof showToast === 'function') showToast(`${type === 'manual' ? '人工外呼' : 'AI 外呼'}配置已保存并生效`, true);
    });
  }

  function bindPositiveIntegerInput(page) {
    const input = page.querySelector('#tianwangCount');
    const error = page.querySelector('#tianwangCountError');
    const rejectInvalidValue = () => {
      const value = input.value.trim();
      if (value && (!/^[1-9]\d*$/.test(value) || Number(value) > 99)) {
        input.value = '';
        input.setAttribute('aria-invalid', 'true');
        error.textContent = '请输入 1～99 的正整数';
      } else {
        input.removeAttribute('aria-invalid');
        error.textContent = '';
      }
    };
    input.addEventListener('keydown', event => {
      if (['-', '+', '.', 'e', 'E'].includes(event.key)) event.preventDefault();
    });
    input.addEventListener('input', rejectInvalidValue);
    input.addEventListener('blur', rejectInvalidValue);
  }

  function bindAiCallTypes(page, current) {
    const trigger = page.querySelector('#tianwangCallTypeTrigger');
    const menu = page.querySelector('#tianwangCallTypeMenu');
    const checks = [...page.querySelectorAll('#tianwangCallTypeMenu input')];
    const update = () => {
      current.callTypes = checks.filter(item => item.checked).map(item => item.value);
      page.querySelector('#tianwangCallTypeCount').textContent = `已选 ${current.callTypes.length} / ${callTypeOptions.length}`;
      page.querySelector('#tianwangCallTypeText').textContent = renderPickerText(current.callTypes, '外呼类型');
      page.querySelector('#tianwangCallTypeError').textContent = '';
    };
    trigger.addEventListener('click', () => { menu.hidden = !menu.hidden; trigger.classList.toggle('open', !menu.hidden); trigger.setAttribute('aria-expanded', String(!menu.hidden)); });
    checks.forEach(item => item.addEventListener('change', update));
    page.querySelector('#tianwangCallTypeAll').addEventListener('click', () => { checks.forEach(item => { item.checked = true; }); update(); });
    page.querySelector('#tianwangCallTypeClear').addEventListener('click', () => { checks.forEach(item => { item.checked = false; }); update(); });
  }

  function bindAiStatus(page, current) {
    const trigger = page.querySelector('#tianwangStatusTrigger'); const menu = page.querySelector('#tianwangStatusMenu'); const checks = [...page.querySelectorAll('.tianwang-status-options input')];
    const update = () => { current.statuses = checks.filter(item => item.checked).map(item => item.value); page.querySelector('#tianwangStatusCount').textContent = `已选 ${current.statuses.length} / 8`; page.querySelector('#tianwangStatusText').textContent = current.statuses.length ? `已选择 ${current.statuses.length} 个通话状态` : '请选择通话状态'; page.querySelector('#tianwangStatusError').textContent = ''; };
    trigger.addEventListener('click', () => { menu.hidden = !menu.hidden; trigger.classList.toggle('open', !menu.hidden); trigger.setAttribute('aria-expanded', String(!menu.hidden)); });
    checks.forEach(item => item.addEventListener('change', update));
    page.querySelector('#tianwangStatusAll').addEventListener('click', () => { checks.forEach(item => { item.checked = true; }); update(); });
    page.querySelector('#tianwangStatusClear').addEventListener('click', () => { checks.forEach(item => { item.checked = false; }); update(); });
  }
})();
