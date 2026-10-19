// ==================== 拦截规则 ====================

  // 数据存储
  var interceptRules = [
    {
      id: 1, rule_name: '懂车帝×汽车之家跨渠道去重', brand_id: '', brand_name: '全品牌通用',
      source_condition_enabled: true, rule_scope: 1, source_lead_ids: ['dongchedi', 'autohome'],
      dedup_key: 2, time_window_type: 2, time_window_value: 7,
      intercept_action: 1, priority: 10, status: 1, remark: '行业标准配置，7天内跨渠道手机号+品牌去重'
    },
    {
      id: 2, rule_name: '懂车帝单渠道7天去重', brand_id: '', brand_name: '全品牌通用',
      source_condition_enabled: true, rule_scope: 2, source_lead_ids: ['dongchedi'],
      dedup_key: 2, time_window_type: 2, time_window_value: 7,
      intercept_action: 2, priority: 50, status: 1, remark: '追加标记模式，避免误拦'
    },
    {
      id: 3, rule_name: '汽车之家单渠道30天去重', brand_id: '', brand_name: '全品牌通用',
      source_condition_enabled: true, rule_scope: 2, source_lead_ids: ['autohome'],
      dedup_key: 1, time_window_type: 2, time_window_value: 30,
      intercept_action: 1, priority: 60, status: 1, remark: '仅手机号维度去重'
    },
    {
      id: 4, rule_name: '易车全渠道永久去重', brand_id: '4', brand_name: '理想汽车',
      source_condition_enabled: true, rule_scope: 1, source_lead_ids: ['yiche'],
      dedup_key: 2, time_window_type: 3, time_window_value: 0,
      intercept_action: 1, priority: 20, status: 1, remark: '高价值线索永久去重'
    },
    {
      id: 5, rule_name: '懂车帝48小时内去重', brand_id: '', brand_name: '全品牌通用',
      source_condition_enabled: true, rule_scope: 2, source_lead_ids: ['dongchedi'],
      dedup_key: 4, time_window_type: 1, time_window_value: 48,
      intercept_action: 2, priority: 80, status: 0, remark: '大促期间短窗口精准去重（暂时停用）'
    }
  ];

  var interceptLogs = [
    { id: 1, rule_id: 1, rule_name: '懂车帝×汽车之家跨渠道去重', source_lead_id: 'autohome', phone_masked: '138****1234', intercept_action: 1, existing_lead_id: 1024, intercept_at: '2026-05-21 10:23:15' },
    { id: 2, rule_id: 1, rule_name: '懂车帝×汽车之家跨渠道去重', source_lead_id: 'dongchedi', phone_masked: '139****5678', intercept_action: 1, existing_lead_id: 1031, intercept_at: '2026-05-21 09:47:22' },
    { id: 3, rule_id: 2, rule_name: '懂车帝单渠道7天去重', source_lead_id: 'dongchedi', phone_masked: '137****9012', intercept_action: 2, existing_lead_id: 1056, intercept_at: '2026-05-21 08:12:09' },
    { id: 4, rule_id: 4, rule_name: '易车全渠道永久去重', source_lead_id: 'yiche', phone_masked: '135****3456', intercept_action: 1, existing_lead_id: 998, intercept_at: '2026-05-20 18:55:30' },
    { id: 5, rule_id: 2, rule_name: '懂车帝单渠道7天去重', source_lead_id: 'dongchedi', phone_masked: '186****7890', intercept_action: 2, existing_lead_id: 1078, intercept_at: '2026-05-20 16:34:17' },
    { id: 6, rule_id: 3, rule_name: '汽车之家单渠道30天去重', source_lead_id: 'autohome', phone_masked: '158****2345', intercept_action: 1, existing_lead_id: 1015, intercept_at: '2026-05-20 14:21:45' },
    { id: 7, rule_id: 1, rule_name: '懂车帝×汽车之家跨渠道去重', source_lead_id: 'autohome', phone_masked: '188****6789', intercept_action: 1, existing_lead_id: 1089, intercept_at: '2026-05-20 11:08:33' },
    { id: 8, rule_id: 4, rule_name: '易车全渠道永久去重', source_lead_id: 'yiche', phone_masked: '159****0123', intercept_action: 1, existing_lead_id: 1050, intercept_at: '2026-05-19 17:45:12' }
  ];

  var nextInterceptRuleId = 6;
  var currentInterceptTab = 'rules';
  var editingInterceptRuleId = null;

  // 渠道列表
  var sourceLeadOptions = [
    { value: 'dongchedi', label: '懂车帝' },
    { value: 'autohome', label: '汽车之家' },
    { value: 'yiche', label: '易车' },
    { value: 'bitauto', label: '易车网' },
    { value: 'xcar', label: '爱卡汽车' },
    { value: 'dcd', label: '懂车帝CPC' },
    { value: 'custom_400', label: '400电话' },
    { value: 'custom_web', label: '官网留资' },
    { value: 'custom_wechat', label: '微信小程序' },
    { value: 'custom_expo', label: '车展扫码' }
  ];

  // scope labels
  var scopeLabels = { 1: '跨来源拦截', 2: '单来源去重' };
  var dedupLabels = { 1: '仅手机号', 2: '手机号+品牌', 3: '手机号+车系', 4: '手机号+品牌+车系' };
  var actionLabels = { 1: '拒绝入库', 2: '追加标记' };
  var timeTypeLabels = { 1: '小时', 2: '天', 3: '永久' };

  // scope CSS classes
  var scopeClasses = { 1: 'scope-cross', 2: 'scope-single' };
  var dedupClasses = { 1: 'dedup-phone', 2: 'dedup-brand', 3: 'dedup-series', 4: 'dedup-all' };
  var actionClasses = { 1: 'action-reject', 2: 'action-mark' };
  var statusClasses = { 1: 'status-active', 0: 'status-disabled' };
  var statusLabels = { 1: '启用', 0: '停用' };

  function initInterceptPage() {
    switchInterceptTab('rules');
  }

  function switchInterceptTab(tab) {
    currentInterceptTab = tab;
    var tabs = document.querySelectorAll('#page-lead-intercept .intercept-tab');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    var tabIndex = tab === 'rules' ? 1 : (tab === 'logs' ? 2 : 3);
    var activeTab = document.querySelector('#page-lead-intercept .intercept-tab:nth-child(' + tabIndex + ')');
    if (activeTab) activeTab.classList.add('active');

    document.getElementById('intercept-rules-panel').style.display = tab === 'rules' ? '' : 'none';
    document.getElementById('intercept-logs-panel').style.display = tab === 'logs' ? '' : 'none';
    document.getElementById('intercept-blacklist-panel').style.display = tab === 'blacklist' ? '' : 'none';

    if (tab === 'rules') {
      filterInterceptRules();
    } else if (tab === 'logs') {
      refreshInterceptStats();
      filterInterceptLogs();
    } else if (tab === 'blacklist') {
      refreshBlacklistStats();
      filterBlacklist();
    }
  }

  function filterInterceptRules() {
    var scopeFilterEl = document.getElementById('intercept-scope-filter');
    var statusFilterEl = document.getElementById('intercept-status-filter');
    var scopeFilter = scopeFilterEl ? scopeFilterEl.value : '';
    var statusFilter = statusFilterEl ? statusFilterEl.value : '';

    var filtered = interceptRules.filter(function(r) {
      if (scopeFilter && (r.source_condition_enabled === false || String(r.rule_scope) !== scopeFilter)) return false;
      if (statusFilter !== '' && String(r.status) !== statusFilter) return false;
      return true;
    });

    renderInterceptRulesTable(filtered);
  }

  function clearInterceptRuleFilter() {
    var scopeFilterEl = document.getElementById('intercept-scope-filter');
    var statusFilterEl = document.getElementById('intercept-status-filter');
    if (scopeFilterEl) scopeFilterEl.value = '';
    if (statusFilterEl) statusFilterEl.value = '';
    filterInterceptRules();
  }

  function renderInterceptRulesTable(rules) {
    var tbody = document.getElementById('intercept-rules-tbody');
    if (!tbody) return;

    var html = '';
    rules.forEach(function(rule) {
      var sourceConditionEnabled = rule.source_condition_enabled !== false;
      var scopeBadge = sourceConditionEnabled
        ? '<span class="intercept-rule-text">' + (scopeLabels[rule.rule_scope] || '') + '</span>'
        : '<span class="intercept-rule-text">未启用</span>';
      var dedupBadge = '<span class="intercept-rule-text">' + (dedupLabels[rule.dedup_key] || '') + '</span>';
      var actionBadge = '<span class="intercept-badge ' + (actionClasses[rule.intercept_action] || '') + '">' + (actionLabels[rule.intercept_action] || '') + '</span>';
      var statusBadge = '<span class="intercept-badge ' + (statusClasses[rule.status] || '') + '">' + (statusLabels[rule.status] || '') + '</span>';

      var sourceDisplay = '';
      if (!sourceConditionEnabled) {
        sourceDisplay = '<span style="color:var(--gray-500);">不限来源渠道</span>';
      } else if (rule.source_lead_ids && rule.source_lead_ids.length > 0) {
        if (rule.source_lead_ids[0] === '*') {
          sourceDisplay = '<span style="color:var(--purple); font-weight:500;">全渠道</span>';
        } else {
          var labels = rule.source_lead_ids.map(function(sid) {
            var opt = sourceLeadOptions.find(function(o) { return o.value === sid; });
            return opt ? opt.label : sid;
          });
          sourceDisplay = labels.join(', ');
        }
      }

      var timeWindowDisplay = '';
      if (rule.time_window_type === 3) {
        timeWindowDisplay = '永久';
      } else {
        timeWindowDisplay = rule.time_window_value + ' ' + (timeTypeLabels[rule.time_window_type] || '');
      }

      html += '<tr>';
      html += '<td><span class="intercept-rule-text">' + escapeHTML(rule.rule_name) + '</span></td>';
      html += '<td>' + scopeBadge + '</td>';
      html += '<td>' + dedupBadge + '</td>';
      html += '<td style="font-size:13px;">' + sourceDisplay + '</td>';
      html += '<td>' + timeWindowDisplay + '</td>';
      html += '<td>' + actionBadge + '</td>';
      html += '<td style="text-align:center;">' + rule.priority + '</td>';
      html += '<td>' + statusBadge + '</td>';
      html += '<td>';
      html += '<button class="btn btn-sm btn-secondary" onclick="editInterceptRule(' + rule.id + ')" style="margin-right:6px;" title="编辑">编辑</button>';
      html += '<button class="btn btn-sm btn-secondary" onclick="toggleInterceptRule(' + rule.id + ')" style="margin-right:6px;" title="' + (rule.status === 1 ? '停用' : '启用') + '">' + (rule.status === 1 ? '停用' : '启用') + '</button>';
      html += '<button class="btn btn-sm btn-danger" onclick="deleteInterceptRule(' + rule.id + ')" title="删除">删除</button>';
      html += '</td>';
      html += '</tr>';
    });

    tbody.innerHTML = html;
    document.getElementById('intercept-pagination-info').textContent = '共 ' + rules.length + ' 条规则';
  }

  function openInterceptRuleModal(ruleId) {
    editingInterceptRuleId = ruleId || null;
    var modal = document.getElementById('interceptRuleModal');
    var title = document.getElementById('interceptRuleModalTitle');
    var saveBtn = document.getElementById('interceptRuleSaveBtn');

    // Populate brand dropdown
    var brandSelect = document.getElementById('interceptRuleBrand');
    var brandOpts = '<option value="">全品牌通用</option>';
    Object.keys(brandRegionData).sort().forEach(function(name) {
      brandOpts += '<option value="' + name + '">' + name + '</option>';
    });
    brandSelect.innerHTML = brandOpts;

    // Populate channel checkboxes
    renderInterceptSourceCheckboxes([]);

    // Reset form
    document.getElementById('interceptRuleName').value = '';
    document.getElementById('interceptRuleBrand').value = '';
    document.getElementById('interceptSourceConditionEnabled').checked = false;
    document.getElementById('interceptRuleScope').value = '1';
    document.getElementById('interceptDedupKey').value = '2';
    document.getElementById('interceptTimeWindowType').value = '2';
    document.getElementById('interceptTimeWindowValue').value = '7';
    document.getElementById('interceptTimeWindowUnit').textContent = '天';
    document.getElementById('interceptAction').value = '1';
    document.getElementById('interceptPriority').value = '255';
    document.getElementById('interceptRemark').value = '';

    if (ruleId) {
      var rule = interceptRules.find(function(r) { return r.id === ruleId; });
      if (rule) {
        title.textContent = '编辑拦截规则';
        saveBtn.textContent = '更新规则';
        document.getElementById('interceptRuleName').value = rule.rule_name;
        document.getElementById('interceptRuleBrand').value = rule.brand_id || '';
        document.getElementById('interceptSourceConditionEnabled').checked = rule.source_condition_enabled !== false;
        document.getElementById('interceptRuleScope').value = String(rule.rule_scope);
        document.getElementById('interceptDedupKey').value = String(rule.dedup_key);
        document.getElementById('interceptTimeWindowType').value = String(rule.time_window_type);
        document.getElementById('interceptTimeWindowValue').value = rule.time_window_value || '';
        document.getElementById('interceptAction').value = String(rule.intercept_action);
        document.getElementById('interceptPriority').value = rule.priority;
        document.getElementById('interceptRemark').value = rule.remark || '';

        if (rule.time_window_type === 3) {
          document.getElementById('interceptTimeWindowValue').disabled = true;
          document.getElementById('interceptTimeWindowValue').value = '';
          document.getElementById('interceptTimeWindowUnit').textContent = '';
        } else {
          document.getElementById('interceptTimeWindowValue').disabled = false;
          document.getElementById('interceptTimeWindowUnit').textContent = timeTypeLabels[rule.time_window_type] || '';
        }

        renderInterceptSourceCheckboxes(rule.source_lead_ids || []);
        onInterceptSourceConditionToggle();
      }
    } else {
      title.textContent = '新增拦截规则';
      saveBtn.textContent = '保存规则';
      onInterceptScopeChange();
      onInterceptSourceConditionToggle();
    }

    modal.classList.add('active');
  }

  function renderInterceptSourceCheckboxes(selectedIds, scope) {
    var container = document.getElementById('interceptSourceCheckboxes');
    if (!container) return;
    scope = scope || parseInt(document.getElementById('interceptRuleScope').value) || 1;
    var enabled = isInterceptSourceConditionEnabled();

    var html = '';
    var isSingle = scope === 2;
    sourceLeadOptions.forEach(function(opt) {
      var checked = selectedIds.indexOf(opt.value) >= 0 ? ' checked' : '';
      var inputType = isSingle ? 'radio' : 'checkbox';
      var nameAttr = isSingle ? ' name="interceptSource"' : '';
      html += '<label style="display:inline-flex;align-items:center;gap:4px;font-size:13px;cursor:' + (enabled ? 'pointer' : 'not-allowed') + ';padding:4px 8px;border:1px solid var(--gray-200);border-radius:6px;' + (checked && enabled ? 'background:var(--primary-light);border-color:var(--primary);' : '') + (enabled ? '' : 'opacity:.55;background:var(--gray-50);') + '">';
      html += '<input type="' + inputType + '"' + nameAttr + ' value="' + opt.value + '"' + checked + (enabled ? '' : ' disabled') + ' style="accent-color:var(--primary);">';
      html += opt.label;
      html += '</label>';
    });
    container.innerHTML = html;
  }

  function isInterceptSourceConditionEnabled() {
    var toggle = document.getElementById('interceptSourceConditionEnabled');
    return !toggle || toggle.checked;
  }

  function onInterceptSourceConditionToggle() {
    var enabled = isInterceptSourceConditionEnabled();
    var fields = document.getElementById('interceptSourceConditionFields');
    var scopeSelect = document.getElementById('interceptRuleScope');
    var hint = document.getElementById('interceptSourceHint');
    if (fields) fields.style.opacity = enabled ? '1' : '.55';
    if (scopeSelect) scopeSelect.disabled = !enabled;
    if (hint && !enabled) {
      hint.textContent = '未启用：规则命中时不判断规则作用域与来源渠道组合条件';
    } else {
      onInterceptScopeChange();
      return;
    }
    renderInterceptSourceCheckboxes(getSelectedSourceLeadIds());
  }

  function onInterceptScopeChange() {
    var scope = parseInt(document.getElementById('interceptRuleScope').value);
    var hint = document.getElementById('interceptSourceHint');
    if (!isInterceptSourceConditionEnabled()) {
      if (hint) hint.textContent = '未启用：规则命中时不判断规则作用域与来源渠道组合条件';
      renderInterceptSourceCheckboxes(getSelectedSourceLeadIds(), scope);
      return;
    }
    if (scope === 1) {
      hint.textContent = '跨来源拦截：勾选多个渠道做交集去重（至少选2个）';
    } else {
      hint.textContent = '单来源内去重：选择单个渠道即可';
    }
    // Re-render source inputs with correct type (checkbox/radio), preserving current selection
    var currentIds = getSelectedSourceLeadIds();
    renderInterceptSourceCheckboxes(currentIds, scope);
  }

  function onTimeWindowChange() {
    var type = parseInt(document.getElementById('interceptTimeWindowType').value);
    var valueInput = document.getElementById('interceptTimeWindowValue');
    var unitSpan = document.getElementById('interceptTimeWindowUnit');

    if (type === 3) {
      valueInput.disabled = true;
      valueInput.value = '';
      unitSpan.textContent = '';
    } else {
      valueInput.disabled = false;
      unitSpan.textContent = timeTypeLabels[type] || '';
    }
  }

  function getSelectedSourceLeadIds() {
    var container = document.getElementById('interceptSourceCheckboxes');
    // Try checked checkboxes first; if none, try checked radio
    var selected = container.querySelectorAll('input[type="checkbox"]:checked');
    if (selected.length === 0) {
      selected = container.querySelectorAll('input[type="radio"]:checked');
    }
    var ids = [];
    selected.forEach(function(cb) { ids.push(cb.value); });
    return ids;
  }

  function saveInterceptRule() {
    var name = document.getElementById('interceptRuleName').value.trim();
    var brandId = document.getElementById('interceptRuleBrand').value;
    var sourceConditionEnabled = isInterceptSourceConditionEnabled();
    var scope = parseInt(document.getElementById('interceptRuleScope').value);
    var sourceIds = sourceConditionEnabled ? getSelectedSourceLeadIds() : [];
    var dedupKey = parseInt(document.getElementById('interceptDedupKey').value);
    var timeType = parseInt(document.getElementById('interceptTimeWindowType').value);
    var timeValue = timeType === 3 ? 0 : parseInt(document.getElementById('interceptTimeWindowValue').value) || 0;
    var action = parseInt(document.getElementById('interceptAction').value);
    var priority = parseInt(document.getElementById('interceptPriority').value) || 255;
    var remark = document.getElementById('interceptRemark').value.trim();

    // Validation
    if (!name) { showToast('请输入规则名称', 'warning'); return; }
    if (sourceConditionEnabled && sourceIds.length === 0) { showToast('请选择至少一个来源渠道', 'warning'); return; }
    if (sourceConditionEnabled && scope === 1 && sourceIds.length < 2) { showToast('跨来源拦截至少需要选择2个渠道', 'warning'); return; }
    if (sourceConditionEnabled && scope === 2 && sourceIds.length > 1) { showToast('单来源内去重只能选择1个渠道', 'warning'); return; }
    if (timeType !== 3 && !timeValue) { showToast('请输入时间窗口数值', 'warning'); return; }

    var brandName = '';
    if (brandId) {
      if (brandRegionData[brandId]) brandName = brandId;
    } else {
      brandName = '全品牌通用';
    }

    if (editingInterceptRuleId) {
      var rule = interceptRules.find(function(r) { return r.id === editingInterceptRuleId; });
      if (rule) {
        rule.rule_name = name;
        rule.brand_id = brandId;
        rule.brand_name = brandName;
        rule.source_condition_enabled = sourceConditionEnabled;
        rule.rule_scope = scope;
        rule.source_lead_ids = sourceIds;
        rule.dedup_key = dedupKey;
        rule.time_window_type = timeType;
        rule.time_window_value = timeValue;
        rule.intercept_action = action;
        rule.priority = priority;
        rule.remark = remark;
      }
      showToast('规则已更新', 'success');
    } else {
      interceptRules.push({
        id: nextInterceptRuleId++, rule_name: name, brand_id: brandId, brand_name: brandName,
        source_condition_enabled: sourceConditionEnabled, rule_scope: scope, source_lead_ids: sourceIds,
        dedup_key: dedupKey, time_window_type: timeType, time_window_value: timeValue,
        intercept_action: action, priority: priority, status: 1, remark: remark
      });
      showToast('规则已添加', 'success');
    }

    editingInterceptRuleId = null;
    closeInterceptRuleModal();
    filterInterceptRules();
  }

  function editInterceptRule(id) {
    openInterceptRuleModal(id);
  }

  function toggleInterceptRule(id) {
    var rule = interceptRules.find(function(r) { return r.id === id; });
    if (rule) {
      rule.status = rule.status === 1 ? 0 : 1;
      var action = rule.status === 1 ? '启用' : '停用';
      showToast('规则 ' + rule.rule_name + ' ' + action, 'info');
      filterInterceptRules();
    }
  }

  var interceptDeleteId = null;

  function deleteInterceptRule(id) {
    var rule = interceptRules.find(function(r) { return r.id === id; });
    if (!rule) return;
    interceptDeleteId = id;
    document.getElementById('interceptDeleteName').textContent = rule.rule_name;
    document.getElementById('interceptDeleteConfirmBtn').onclick = function() {
      executeInterceptDelete();
    };
    openModal('interceptDeleteModal');
  }

  function closeInterceptDeleteModal() {
    interceptDeleteId = null;
    closeModal('interceptDeleteModal');
  }

  function executeInterceptDelete() {
    var id = interceptDeleteId;
    closeInterceptDeleteModal();
    interceptRules = interceptRules.filter(function(r) { return r.id !== id; });
    showToast('规则已删除', 'success');
    filterInterceptRules();
  }

  function closeInterceptRuleModal() {
    document.getElementById('interceptRuleModal').classList.remove('active');
    editingInterceptRuleId = null;
  }

  function exportInterceptRules() {
    var timestamp = new Date().toLocaleDateString('zh-CN').replace(/\//g, '-');
    var fileName = '拦截规则_' + timestamp + '.xlsx';

    doAsyncExport({
      title: '正在导出拦截规则...',
      description: '正在整理拦截规则数据',
      fileName: fileName,
      steps: [
        { percent: 20, status: '正在收集规则数据...', delay: 400 },
        { percent: 50, status: '正在整理配置信息...', delay: 500 },
        { percent: 80, status: '正在生成文件...', delay: 300 },
        { percent: 95, status: '即将完成...', delay: 200 }
      ],
      download: function() {
        var exportData = [['规则名称', '关联品牌', '作用域', '去重维度', '渠道范围', '时间窗口', '拦截动作', '优先级', '状态', '备注']];
        interceptRules.forEach(function(r) {
          var sourceConditionEnabled = r.source_condition_enabled !== false;
          exportData.push([
            r.rule_name, r.brand_name, sourceConditionEnabled ? scopeLabels[r.rule_scope] : '未启用', dedupLabels[r.dedup_key],
            sourceConditionEnabled ? (r.source_lead_ids || []).join(', ') : '不限来源渠道',
            r.time_window_type === 3 ? '永久' : r.time_window_value + ' ' + (timeTypeLabels[r.time_window_type] || ''),
            actionLabels[r.intercept_action], r.priority,
            statusLabels[r.status], r.remark || ''
          ]);
        });
        var ws = XLSX.utils.aoa_to_sheet(exportData);
        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '拦截规则');
        ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 16 }, { wch: 25 }, { wch: 14 }, { wch: 12 }, { wch: 8 }, { wch: 8 }, { wch: 30 }];
        XLSX.writeFile(wb, fileName);
        showToast('导出成功，共 ' + (exportData.length - 1) + ' 条规则', 'success');
      }
    });
  }

  // Intercept Logs
  function refreshInterceptStats() {
    var today = new Date().toLocaleDateString('zh-CN');
    var todayLogs = interceptLogs.filter(function(log) {
      return log.intercept_at.indexOf(today.replace(/\//g, '-')) >= 0;
    });

    var totalRejects = interceptLogs.filter(function(l) { return l.intercept_action === 1; }).length;
    var totalMarks = interceptLogs.filter(function(l) { return l.intercept_action === 2; }).length;
    var rate = interceptRules.length > 0 ? Math.round((interceptLogs.length / (interceptLogs.length + 20)) * 100) : 0; // Mock rate

    document.getElementById('stat-today-intercepts').textContent = todayLogs.length;
    document.getElementById('stat-total-rejects').textContent = totalRejects;
    document.getElementById('stat-total-marks').textContent = totalMarks;
    document.getElementById('stat-intercept-rate').textContent = rate + '%';

    // Populate rule filter dropdown for logs
    var ruleFilter = document.getElementById('intercept-log-rule-filter');
    if (ruleFilter) {
      var currentVal = ruleFilter.value;
      var opts = '<option value="">全部规则</option>';
      interceptRules.forEach(function(r) {
        opts += '<option value="' + r.id + '">' + escapeHTML(r.rule_name) + '</option>';
      });
      ruleFilter.innerHTML = opts;
      ruleFilter.value = currentVal;
    }
  }

  function filterInterceptLogs() {
    var ruleFilter = document.getElementById('intercept-log-rule-filter');
    var actionFilter = document.getElementById('intercept-log-action-filter');
    var ruleVal = ruleFilter ? ruleFilter.value : '';
    var actionVal = actionFilter ? actionFilter.value : '';

    var filtered = interceptLogs.filter(function(log) {
      if (ruleVal && String(log.rule_id) !== ruleVal) return false;
      if (actionVal && String(log.intercept_action) !== actionVal) return false;
      return true;
    });

    renderInterceptLogsTable(filtered);
  }

  function renderInterceptLogsTable(logs) {
    var tbody = document.getElementById('intercept-logs-tbody');
    var empty = document.getElementById('intercept-logs-empty');
    if (!tbody) return;

    if (logs.length === 0) {
      tbody.innerHTML = '';
      if (empty) empty.style.display = '';
      document.getElementById('intercept-logs-pagination-info').textContent = '共 0 条记录';
      return;
    }

    if (empty) empty.style.display = 'none';

    var html = '';
    logs.forEach(function(log) {
      var actionBadge = '<span class="intercept-badge ' + (actionClasses[log.intercept_action] || '') + '">' + (actionLabels[log.intercept_action] || '') + '</span>';
      html += '<tr>';
      html += '<td style="font-size:13px;">' + log.intercept_at + '</td>';
      html += '<td style="font-size:13px;">' + escapeHTML(log.rule_name) + '</td>';
      html += '<td style="font-size:13px;">' + sourceLabel(log.source_lead_id) + '</td>';
      html += '<td style="font-size:13px;">' + escapeHTML(log.phone_masked) + '</td>';
      html += '<td>' + actionBadge + '</td>';
      html += '<td style="text-align:center;">#' + log.existing_lead_id + '</td>';
      html += '</tr>';
    });

    tbody.innerHTML = html;
    document.getElementById('intercept-logs-pagination-info').textContent = '共 ' + logs.length + ' 条记录';
  }

  function sourceLabel(sourceId) {
    var opt = sourceLeadOptions.find(function(o) { return o.value === sourceId; });
    return opt ? opt.label : sourceId;
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ==================== 手机号码黑名单管理 ====================

  var phoneBlacklist = [
    { id: 1, phone: '139****5678', rawPhone: '13912345678', type: 1, source: '', remark: '外呼多次无人接听，疑似无效号码', addMethod: 'outbound', createdAt: '2026-05-20 14:30:00', expireAt: '', status: 1 },
    { id: 2, phone: '156****7890', rawPhone: '15622227890', type: 1, source: 'dongchedi', remark: '明确表示不购车', addMethod: 'manual', createdAt: '2026-05-18 10:15:00', expireAt: '', status: 1 },
    { id: 3, phone: '137****3456', rawPhone: '13755553456', type: 4, source: '', remark: '投诉电话骚扰，升级全业务黑名单', addMethod: 'outbound', createdAt: '2026-05-15 09:00:00', expireAt: '', status: 1 },
    { id: 4, phone: '158****9012', rawPhone: '15833339012', type: 2, source: 'autohome', remark: '广告敏感，拒绝所有营销', addMethod: 'api', createdAt: '2026-05-12 16:45:00', expireAt: '', status: 1 },
    { id: 5, phone: '186****2345', rawPhone: '18677772345', type: 1, source: 'yiche', remark: '空号，多次拨打无效', addMethod: 'outbound', createdAt: '2026-05-10 11:20:00', expireAt: '', status: 1 },
    { id: 6, phone: '135****6789', rawPhone: '13588886789', type: 3, source: 'dongchedi', remark: '用户主动投诉骚扰电话', addMethod: 'manual', createdAt: '2026-05-08 08:10:00', expireAt: '', status: 1 },
    { id: 7, phone: '188****0123', rawPhone: '18866660123', type: 1, source: 'autohome', remark: '号码已停机', addMethod: 'outbound', createdAt: '2026-05-05 15:30:00', expireAt: '2026-08-05', status: 1 },
    { id: 8, phone: '159****4567', rawPhone: '15944444567', type: 2, source: '', remark: '明确表示不购车且拒绝电话', addMethod: 'outbound', createdAt: '2026-05-01 13:00:00', expireAt: '', status: 0 },
    { id: 9, phone: '133****8901', rawPhone: '13322228901', type: 1, source: 'yiche', remark: '同行测试电话', addMethod: 'manual', createdAt: '2026-04-28 10:00:00', expireAt: '', status: 1 }
  ];

  var blacklistTypeLabels = { 1: '外呼黑名单', 2: '营销黑名单', 3: '投诉黑名单', 4: '全业务黑名单' };
  var blacklistTypeClasses = { 1: 'action-reject', 2: 'action-mark', 3: 'action-reject', 4: 'scope-cross' };
  var blacklistMethodLabels = { manual: '人工添加', outbound: '外呼系统同步', api: 'API导入' };
  var nextBlacklistId = 10;
  var editingBlacklistId = null;

  function refreshBlacklistStats() {
    var total = phoneBlacklist.length;
    var active = phoneBlacklist.filter(function(b) { return b.status === 1; }).length;
    var outbound = phoneBlacklist.filter(function(b) { return b.type === 1; }).length;
    var marketing = phoneBlacklist.filter(function(b) { return b.type === 2; }).length;
    document.getElementById('stat-bl-total').textContent = total;
    document.getElementById('stat-bl-active').textContent = active;
    document.getElementById('stat-bl-outbound').textContent = outbound;
    document.getElementById('stat-bl-marketing').textContent = marketing;
  }

  function filterBlacklist() {
    var typeFilter = document.getElementById('blacklist-type-filter');
    var statusFilter = document.getElementById('blacklist-status-filter');
    var sourceFilter = document.getElementById('blacklist-source-filter');
    var typeVal = typeFilter ? typeFilter.value : '';
    var statusVal = statusFilter ? statusFilter.value : '';
    var sourceVal = sourceFilter ? sourceFilter.value : '';

    var filtered = phoneBlacklist.filter(function(b) {
      if (typeVal && String(b.type) !== typeVal) return false;
      if (statusVal !== '' && String(b.status) !== statusVal) return false;
      if (sourceVal && b.addMethod !== sourceVal) return false;
      return true;
    });

    renderBlacklistTable(filtered);
  }

  function clearBlacklistFilter() {
    var typeFilter = document.getElementById('blacklist-type-filter');
    var statusFilter = document.getElementById('blacklist-status-filter');
    var sourceFilter = document.getElementById('blacklist-source-filter');
    if (typeFilter) typeFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    if (sourceFilter) sourceFilter.value = '';
    filterBlacklist();
  }

  function renderBlacklistTable(list) {
    var tbody = document.getElementById('blacklist-tbody');
    if (!tbody) return;

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;padding:48px 20px;color:var(--gray-400);">暂无黑名单数据</td></tr>';
      document.getElementById('blacklist-pagination-info').textContent = '共 0 条记录';
      return;
    }

    var html = '';
    list.forEach(function(b) {
      var typeBadge = '<span class="intercept-badge ' + (blacklistTypeClasses[b.type] || '') + '">' + (blacklistTypeLabels[b.type] || '') + '</span>';
      var statusBadge = '<span class="intercept-badge ' + (b.status === 1 ? 'status-active' : 'status-disabled') + '">' + (b.status === 1 ? '拦截中' : '已停用') + '</span>';
      var methodBadge = '<span class="blacklist-plain-text">' + (blacklistMethodLabels[b.addMethod] || b.addMethod) + '</span>';
      var sourceLabel = b.source ? sourceName(b.source) : '全渠道';
      var expireDisplay = b.expireAt ? b.expireAt : '永久有效';

      html += '<tr>';
      html += '<td><code style="font-size: 13px;">' + escapeHTML(b.phone) + '</code></td>';
      html += '<td>' + typeBadge + '</td>';
      html += '<td><span class="blacklist-plain-text">' + sourceLabel + '</span></td>';
      html += '<td><span class="blacklist-plain-text" style="display:block;max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="' + escapeHTML(b.remark) + '">' + escapeHTML(b.remark) + '</span></td>';
      html += '<td>' + methodBadge + '</td>';
      html += '<td><span class="blacklist-plain-text">' + b.createdAt + '</span></td>';
      html += '<td><span class="blacklist-plain-text">' + expireDisplay + '</span></td>';
      html += '<td>' + statusBadge + '</td>';
      html += '<td>';
      html += '<button class="btn btn-sm btn-secondary" onclick="editBlacklist(' + b.id + ')" style="margin-right:6px;" title="编辑">编辑</button>';
      html += '<button class="btn btn-sm btn-secondary" onclick="toggleBlacklistStatus(' + b.id + ')" style="margin-right:6px;" title="' + (b.status === 1 ? '停用' : '启用') + '">' + (b.status === 1 ? '停用' : '启用') + '</button>';
      html += '<button class="btn btn-sm btn-danger" onclick="confirmDeleteBlacklist(' + b.id + ')" title="移出黑名单">移出</button>';
      html += '</td>';
      html += '</tr>';
    });

    tbody.innerHTML = html;
    document.getElementById('blacklist-pagination-info').textContent = '共 ' + list.length + ' 条记录';
  }

  function sourceName(sourceId) {
    var opt = sourceLeadOptions.find(function(o) { return o.value === sourceId; });
    return opt ? opt.label : sourceId;
  }

  // 弹窗：填充来源渠道下拉
  function populateBlacklistSourceOptions() {
    var sel = document.getElementById('blacklistSource');
    if (!sel) return;
    var opts = '<option value="">全渠道</option>';
    sourceLeadOptions.forEach(function(o) {
      opts += '<option value="' + o.value + '">' + o.label + '</option>';
    });
    sel.innerHTML = opts;
  }

  // 新增/编辑黑名单弹窗
  function openBlacklistModal(blId) {
    editingBlacklistId = blId || null;
    var modal = document.getElementById('blacklistModal');
    var title = document.getElementById('blacklistModalTitle');

    populateBlacklistSourceOptions();

    document.getElementById('blacklistPhone').value = '';
    document.getElementById('blacklistType').value = '1';
    document.getElementById('blacklistSource').value = '';
    document.getElementById('blacklistRemark').value = '';
    document.getElementById('blacklistExpireDate').value = '';

    if (blId) {
      var bl = phoneBlacklist.find(function(b) { return b.id === blId; });
      if (bl) {
        title.textContent = '编辑黑名单';
        document.getElementById('blacklistSaveBtn').textContent = '更新';
        document.getElementById('blacklistPhone').value = bl.rawPhone;
        document.getElementById('blacklistType').value = String(bl.type);
        document.getElementById('blacklistSource').value = bl.source || '';
        document.getElementById('blacklistRemark').value = bl.remark || '';
        document.getElementById('blacklistExpireDate').value = bl.expireAt || '';
      }
    } else {
      title.textContent = '新增黑名单';
      document.getElementById('blacklistSaveBtn').textContent = '保存';
    }

    syncBlacklistPermaButton();
    modal.classList.add('active');
  }

  function setBlacklistPermaValid() {
    document.getElementById('blacklistExpireDate').value = '';
    syncBlacklistPermaButton();
  }

  function syncBlacklistPermaButton() {
    var btn = document.getElementById('blacklistPermaBtn');
    var dateVal = document.getElementById('blacklistExpireDate').value;
    if (!dateVal) {
      btn.className = 'btn btn-sm btn-primary';
      btn.innerHTML = '✓ 永久有效';
    } else {
      btn.className = 'btn btn-sm btn-secondary';
      btn.innerHTML = '永久有效';
    }
  }

  function closeBlacklistModal() {
    document.getElementById('blacklistModal').classList.remove('active');
    editingBlacklistId = null;
  }

  function editBlacklist(id) {
    openBlacklistModal(id);
  }

  // 手机号脱敏
  function maskPhone(raw) {
    if (!raw || raw.length !== 11) return raw;
    return raw.substring(0, 3) + '****' + raw.substring(7);
  }

  // 手机号校验
  function isValidPhone(phone) {
    return phone && /^1[3-9]\d{9}$/.test(phone);
  }

  // 保存黑名单
  function handleBlacklistSubmit() {
    var rawPhone = document.getElementById('blacklistPhone').value.trim();
    var type = parseInt(document.getElementById('blacklistType').value);
    var source = document.getElementById('blacklistSource').value;
    var remark = document.getElementById('blacklistRemark').value.trim();
    var expireAt = document.getElementById('blacklistExpireDate').value;

    if (!rawPhone) { showToast('请输入手机号', 'error'); return; }
    if (!isValidPhone(rawPhone)) { showToast('手机号格式不正确，请输入11位有效号码', 'error'); return; }

    // 检查重复（排除当前编辑的）
    var dup = phoneBlacklist.find(function(b) {
      return b.rawPhone === rawPhone && b.id !== editingBlacklistId;
    });
    if (dup) { showToast('该手机号已在黑名单中', 'error'); return; }

    if (!remark) { showToast('请填写备注信息', 'error'); return; }

    if (editingBlacklistId) {
      var bl = phoneBlacklist.find(function(b) { return b.id === editingBlacklistId; });
      if (bl) {
        bl.phone = maskPhone(rawPhone);
        bl.rawPhone = rawPhone;
        bl.type = type;
        bl.source = source;
        bl.remark = remark;
        bl.expireAt = expireAt;
      }
      showToast('黑名单更新成功', 'success');
    } else {
      phoneBlacklist.unshift({
        id: nextBlacklistId++,
        phone: maskPhone(rawPhone),
        rawPhone: rawPhone,
        type: type,
        source: source,
        remark: remark,
        addMethod: 'manual',
        createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
        expireAt: expireAt,
        status: 1
      });
      showToast('已添加到黑名单，该号码将被拦截', 'success');
    }

    closeBlacklistModal();
    refreshBlacklistStats();
    filterBlacklist();
  }

  // 启用/停用
  function toggleBlacklistStatus(id) {
    var bl = phoneBlacklist.find(function(b) { return b.id === id; });
    if (!bl) return;
    bl.status = bl.status === 1 ? 0 : 1;
    showToast(bl.status === 1 ? '已启用拦截' : '已暂停拦截', 'success');
    refreshBlacklistStats();
    filterBlacklist();
  }

  // 删除确认弹窗
  function confirmDeleteBlacklist(id) {
    var bl = phoneBlacklist.find(function(b) { return b.id === id; });
    if (!bl) return;
    document.getElementById('blacklistDeletePhone').textContent = bl.phone;
    var confirmBtn = document.getElementById('blacklistDeleteConfirmBtn');
    confirmBtn.onclick = function() {
      phoneBlacklist = phoneBlacklist.filter(function(b) { return b.id !== id; });
      closeModal('blacklistDeleteModal');
      showToast('已移出黑名单，该号码不再拦截', 'success');
      refreshBlacklistStats();
      filterBlacklist();
    };
    openModal('blacklistDeleteModal');
  }



  // 导出
  // ---- Blacklist Import Wizard ----
  var _blImportCurrentStep = 1;
  var _blImportMockData = [
    { phone: '138****0001', type: '外呼黑名单', source: '手动', remark: '客户要求' },
    { phone: '139****0002', type: '营销黑名单', source: '系统导入', remark: '' },
    { phone: '136****0003', type: '投诉黑名单', source: '手动', remark: '多次投诉' },
    { phone: '135****0004', type: '全业务黑名单', source: '系统导入', remark: '' },
    { phone: '137****0005', type: '外呼黑名单', source: '手动', remark: '备注说明' },
  ];

  function openBlacklistImportModal() {
    resetBlImportModal();
    openModal('blacklistImportModal');
  }

  function closeBlacklistImportModal() {
    closeModal('blacklistImportModal');
  }

  function resetBlImportModal() {
    _blImportCurrentStep = 1;
    goBlImportStep(1);
    resetBlImportFile();
  }

  function resetBlImportFile() {
    document.getElementById('blImportFile').value = '';
    document.getElementById('blSelectedFileInfo').style.display = 'none';
    document.getElementById('blImportDropZone').style.display = '';
    document.getElementById('blImportNextBtn').disabled = true;
  }

  function handleBlImportFile(input) {
    if (!input.files || !input.files[0]) return;
    var file = input.files[0];
    document.getElementById('blSelectedFileName').textContent = file.name;
    document.getElementById('blSelectedFileSize').textContent = (file.size / 1024).toFixed(1) + ' KB';
    document.getElementById('blSelectedFileInfo').style.display = '';
    document.getElementById('blImportDropZone').style.display = 'none';
    document.getElementById('blImportNextBtn').disabled = false;
  }

  function goBlImportStep(step) {
    _blImportCurrentStep = step;
    for (var i = 1; i <= 3; i++) {
      document.getElementById('blImportStepContent' + i).style.display = (i === step) ? '' : 'none';
      var stepEl = document.getElementById('blImportStep' + i);
      stepEl.className = 'import-step' + (i < step ? ' completed' : (i === step ? ' active' : ''));
    }
    document.getElementById('blImportLine1').style.background = step > 1 ? 'var(--primary)' : 'var(--gray-200)';
    document.getElementById('blImportLine2').style.background = step > 2 ? 'var(--primary)' : 'var(--gray-200)';

    var footer = document.getElementById('blImportModalFooter');
    var nextBtn = document.getElementById('blImportNextBtn');
    if (step === 1) {
      footer.style.display = '';
      nextBtn.textContent = '下一步';
      nextBtn.disabled = !(document.getElementById('blSelectedFileInfo').style.display !== 'none');
    } else if (step === 2) {
      footer.style.display = '';
      nextBtn.textContent = '确认导入';
      nextBtn.disabled = false;
      renderBlImportPreview();
    } else {
      footer.style.display = 'none';
    }
  }

  function goBlImportNextStep() {
    if (_blImportCurrentStep === 1) {
      goBlImportStep(2);
    } else if (_blImportCurrentStep === 2) {
      // 执行导入
      var count = _blImportMockData.length;
      document.getElementById('blImportCompleteInfo').textContent = '成功导入 ' + count + ' 条黑名单记录，重复手机号已自动跳过。';
      goBlImportStep(3);
      refreshBlacklistStats();
      filterBlacklist();
    }
  }

  function renderBlImportPreview() {
    var tbody = document.getElementById('blImportTableBody');
    var count = _blImportMockData.length;
    document.getElementById('blImportDataCount').textContent = count;
    tbody.innerHTML = _blImportMockData.map(function(row, idx) {
      return '<tr style="border-bottom: 1px solid var(--gray-100);">' +
        '<td style="padding: 9px 12px;">' + row.phone + '</td>' +
        '<td style="padding: 9px 12px;">' + row.type + '</td>' +
        '<td style="padding: 9px 12px;">' + row.source + '</td>' +
        '<td style="padding: 9px 12px; color: var(--gray-500);">' + (row.remark || '-') + '</td>' +
        '</tr>';
    }).join('');
  }
  // ---- End Blacklist Import Wizard ----

  function exportBlacklist() {
    var csv = '\uFEFF手机号,黑名单类型,来源渠道,备注,加入方式,加入时间,失效时间,状态\n';
    phoneBlacklist.forEach(function(b) {
      csv += [
        b.phone,
        blacklistTypeLabels[b.type] || '',
        b.source || '全渠道',
        (b.remark || '').replace(/,/g, '，'),
        blacklistMethodLabels[b.addMethod] || b.addMethod,
        b.createdAt,
        b.expireAt || '永久',
        b.status === 1 ? '拦截中' : '已停用'
      ].join(',') + '\n';
    });

    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = '手机号黑名单_' + new Date().toISOString().substring(0, 10) + '.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('导出成功', 'success');
  }

  // ---- D客连: SmartCode 管理顶部页签 ----
  function switchSmartCodeTab(tab) {
    document.querySelectorAll('#smartcodeTabs .tab-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });
    var maintainPane = document.getElementById('smartcodeMaintainPane');
    var mappingPane = document.getElementById('smartcodeMappingPane');
    if (maintainPane) maintainPane.classList.toggle('active', tab === 'maintain');
    if (mappingPane) mappingPane.classList.toggle('active', tab === 'mapping');
    var breadcrumb = document.getElementById('currentPageName');
    if (breadcrumb) breadcrumb.textContent = 'SmartCode管理 / ' + (tab === 'mapping' ? 'SmartCode映射' : 'SmartCode维护');
  }

  function filterSmartCodeMaintainTable() {
    var codeKeyword = (document.getElementById('smartcodeMaintainSearchCode')?.value || '').trim().toLowerCase();
    var rows = document.querySelectorAll('#smartcodeMaintainTbody tr');
    var visibleCount = 0;
    rows.forEach(function(row) {
      var cells = row.querySelectorAll('td');
      var code = cells[1] ? cells[1].textContent.toLowerCase() : '';
      var matched = !codeKeyword || code.indexOf(codeKeyword) > -1;
      row.style.display = matched ? '' : 'none';
      if (matched) visibleCount++;
    });
    var paginationInfo = document.querySelector('#smartcodeMaintainPane .pagination-info');
    if (paginationInfo) paginationInfo.textContent = '共 ' + visibleCount + ' 条';
  }

  function resetSmartCodeMaintainFilter() {
    var codeEl = document.getElementById('smartcodeMaintainSearchCode');
    if (codeEl) codeEl.value = '';
    filterSmartCodeMaintainTable();
  }

  function openSmartCodeMaintainModal(mode, data) {
    var isEdit = mode === 'edit';
    var title = document.getElementById('smartCodeMaintainModalTitle');
    var codeInput = document.getElementById('smartCodeMaintainCodeInput');
    var remarkInput = document.getElementById('smartCodeMaintainRemarkInput');
    if (title) title.textContent = isEdit ? '编辑SmartCode' : '新增SmartCode';
    if (codeInput) codeInput.value = data && data.code ? data.code : '';
    if (remarkInput) remarkInput.value = data && data.remark ? data.remark : '';
    openModal('smartCodeMaintainModal');
  }

  // ---- D客连: SmartCode 映射列表搜索过滤 ----
  function filterScMappingTable() {
    var codeKeyword = (document.getElementById('scmappingSearchCode')?.value || '').trim().toLowerCase();
    var seriesKeyword = (document.getElementById('scmappingSearchSeries')?.value || '').trim().toLowerCase();
    var tbody = document.getElementById('scMappingListTbody');
    if (!tbody) return;
    var rows = tbody.querySelectorAll('tr');
    var visibleCount = 0;
    rows.forEach(function(row, i) {
      var cells = row.querySelectorAll('td');
      var scCode = cells[1] ? cells[1].textContent.toLowerCase() : '';
      var scSeries = cells[2] ? cells[2].textContent.toLowerCase() : '';
      var match = true;
      if (codeKeyword && scCode.indexOf(codeKeyword) === -1) match = false;
      if (seriesKeyword && scSeries.indexOf(seriesKeyword) === -1) match = false;
      row.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });
    // 更新序号
    var seq = 1;
    rows.forEach(function(row) {
      if (row.style.display !== 'none') {
        var firstCell = row.querySelector('td');
        if (firstCell) firstCell.textContent = seq++;
      }
    });
    // 更新分页信息
    var paginationInfo = document.querySelector('#smartcodeMappingPane .pagination-info');
    if (paginationInfo) paginationInfo.textContent = '共 ' + visibleCount + ' 条';
  }

  function resetScMappingFilter() {
    var codeEl = document.getElementById('scmappingSearchCode');
    var seriesEl = document.getElementById('scmappingSearchSeries');
    if (codeEl) codeEl.value = '';
    if (seriesEl) seriesEl.value = '';
    var tbody = document.getElementById('scMappingListTbody');
    if (!tbody) return;
    tbody.querySelectorAll('tr').forEach(function(row, i) {
      row.style.display = '';
      var firstCell = row.querySelector('td');
      if (firstCell) firstCell.textContent = i + 1;
    });
    var paginationInfo = document.querySelector('#smartcodeMappingPane .pagination-info');
    if (paginationInfo) paginationInfo.textContent = '共 ' + tbody.querySelectorAll('tr').length + ' 条';
  }

  // ---- D客连: SmartCode 映射弹窗 ----
  function openScMappingModal(isEdit) {
    // 重置行号计数器
    _scRowIdx = 2;
    // 重置车系选择数据
    scMappingSeriesData = {};
    scMappingPickerBrandIds = [];
    scMappingPickerDraft = [];
    scMappingPickerCurrentRow = null;
    document.getElementById('scMappingModalTitle').textContent = isEdit ? '编辑映射' : '新增映射';
    openModal('scMappingModal');
  }

  function removeScMappingRow(btn) {
    var tbody = document.querySelector('#scMappingTable tbody');
    if (!tbody) return;
    var rows = tbody.querySelectorAll('tr');
    if (rows.length <= 1) {
      showToast('至少保留一条SC映射信息', 'warning');
      return;
    }
    if (!confirm('确定删除该SC映射信息吗？')) return;
    btn.closest('tr').remove();
    tbody.querySelectorAll('tr').forEach(function(row, i) {
      var firstCell = row.querySelector('td');
      if (firstCell) firstCell.textContent = i + 1;
    });
  }

  // ---- D客连: SC映射信息子表添加行 ----
  var _scRowIdx = 2;
  function addScMappingRow() {
    _scRowIdx++;
    var tbody = document.querySelector('#scMappingTable tbody');
    var tr = document.createElement('tr');
    tr.innerHTML = '<td>' + _scRowIdx + '</td>' +
      '<td><div class="scmapping-series-trigger" onclick="toggleScMappingRowExpand(' + (_scRowIdx - 1) + ')" data-row="' + (_scRowIdx - 1) + '"><span class="trigger-placeholder">请选择关联车系</span></div></td>' +
      '<td><select class="form-select" style="font-size:12px;padding:6px 8px"><option value="">请选择排期</option><option>2233: 十月份促销推广</option><option>4455: 十一月份推广</option></select></td>' +
      '<td><select class="form-select" style="font-size:12px;padding:6px 8px"><option value="">请选择SmartCode</option><option>112233</option><option>445566</option></select></td>' +
      '<td><input type="number" class="form-input" placeholder="0" style="width:70px;font-size:12px;padding:6px 8px"></td>' +
      '<td><button class="btn btn-danger btn-sm" onclick="removeScMappingRow(this)">删除</button></td>';
    tbody.appendChild(tr);
    showToast('已添加一行', 'success');
  }

  // ========== SC Mapping 关联车系选择窗口（单选） ==========
  var scMappingSeriesData = {}; // { rowIndex: {id, name, code, brandId, brandName} }
  var scMappingPickerBrandIds = [];
  var scMappingPickerDraft = null;
  var scMappingPickerCurrentRow = null;

  function toggleScMappingRowExpand(rowIndex) {
    scMappingPickerCurrentRow = rowIndex;
    scMappingPickerDraft = scMappingSeriesData[rowIndex] || null;
    scMappingPickerBrandIds = scMappingPickerDraft ? [String(scMappingPickerDraft.brandId)] : Object.keys(carSeriesData || {});
    openModal('scMappingSeriesPickerModal');
    renderScMappingBrands();
    renderScMappingPickerSeries();
  }

  function closeScMappingPopover() {
    closeModal('scMappingSeriesPickerModal');
    scMappingPickerCurrentRow = null;
  }

  function _smEl(id) { return document.getElementById(id); }

  function renderScMappingBrands() {
    var container = _smEl('scMappingBrandList');
    if (!container) return;
    container.innerHTML = Object.keys(carSeriesData || {}).map(function(brandId) {
      var checked = scMappingPickerBrandIds.indexOf(brandId) >= 0;
      return '<label class="schedule-picker-brand">' +
        '<input type="checkbox" ' + (checked ? 'checked' : '') + ' onchange="toggleScMappingBrand(\'' + brandId + '\', this.checked)">' +
        '<span><span style="font-weight:800;color:#1f2937;">' + getCarBrandName(brandId) + '</span><div class="schedule-picker-meta">' + (carSeriesData[brandId] || []).length + ' 个车系</div></span>' +
      '</label>';
    }).join('');
  }

  function toggleScMappingBrand(brandId, checked) {
    brandId = String(brandId);
    if (checked && scMappingPickerBrandIds.indexOf(brandId) === -1) scMappingPickerBrandIds.push(brandId);
    if (!checked) scMappingPickerBrandIds = scMappingPickerBrandIds.filter(function(id) { return id !== brandId; });
    renderScMappingPickerSeries();
  }

  function getScMappingVisiblePickerSeries() {
    var keywordEl = _smEl('scMappingSeriesSearch');
    var keyword = keywordEl ? keywordEl.value.trim().toLowerCase() : '';
    return getAllManagedCarSeries().filter(function(series) {
      return scMappingPickerBrandIds.indexOf(String(series.brandId)) >= 0 &&
        (!keyword || series.name.toLowerCase().indexOf(keyword) >= 0 || series.code.toLowerCase().indexOf(keyword) >= 0);
    });
  }

  function renderScMappingPickerSeries() {
    var listEl = _smEl('scMappingPickerList');
    var countEl = _smEl('scMappingPickerCount');
    if (!listEl) return;
    var seriesList = getScMappingVisiblePickerSeries();
    if (countEl) countEl.textContent = '当前 ' + seriesList.length + ' 个车系 · 仅可选择 1 个';
    listEl.innerHTML = seriesList.length ? seriesList.map(function(series) {
      var checked = scMappingPickerDraft && String(scMappingPickerDraft.id) === String(series.id);
      return '<label class="schedule-picker-series">' +
        '<input type="radio" name="scMappingSeriesChoice" ' + (checked ? 'checked' : '') + ' onchange="selectScMappingPickerSeries(\'' + series.id + '\')">' +
        '<span style="flex:1;"><span style="font-weight:800;color:#1f2937;">' + series.name + '</span><div class="schedule-picker-meta">' + series.brandName + ' · ' + series.code + '</div></span>' +
      '</label>';
    }).join('') : '<div style="padding:40px;text-align:center;color:#94a3b8;font-size:13px;">暂无匹配车系</div>';
  }

  function selectScMappingPickerSeries(seriesId) {
    var series = getAllManagedCarSeries().find(function(s) { return String(s.id) === String(seriesId); });
    if (!series) return;
    scMappingPickerDraft = {id:series.id, name:series.name, code:series.code, brandId:series.brandId, brandName:series.brandName};
    renderScMappingPickerSeries();
  }

  function confirmScMappingSeriesPicker() {
    if (!scMappingPickerDraft) { showToast('请选择一个关联车系', 'warning'); return; }
    scMappingSeriesData[scMappingPickerCurrentRow] = scMappingPickerDraft;
    updateScMappingSeriesTrigger(scMappingPickerCurrentRow);
    closeScMappingPopover();
  }

  function updateScMappingSeriesTrigger(rowIdx) {
    var trigger = document.querySelector('#scMappingTable .scmapping-series-trigger[data-row="' + rowIdx + '"]');
    var selected = scMappingSeriesData[rowIdx];
    if (!trigger) return;
    trigger.innerHTML = selected ? '<span class="scmapping-tag">' + selected.code + ' - ' + selected.name + '</span>' : '<span class="trigger-placeholder">请选择关联车系</span>';
  }


  function enhanceOperationButtons() {
    document.querySelectorAll('table tbody tr td:last-child button.btn').forEach(function(btn) {
      var text = (btn.textContent || '').replace(/\s+/g, '').trim();
      btn.classList.remove('table-action-view', 'table-action-edit', 'table-action-delete', 'table-action-toggle');
      if (text === '查看' || text === '查看报表' || text === '线索明细') {
        btn.classList.add('table-action-btn', 'table-action-view');
      } else if (text === '编辑') {
        btn.classList.add('table-action-btn', 'table-action-edit');
      } else if (text === '删除' || text === '移出' || text === '确认删除') {
        btn.classList.add('table-action-btn', 'table-action-delete');
      } else if (text === '停用' || text === '启用') {
        btn.classList.add('table-action-btn', 'table-action-toggle');
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function() {
    enhanceOperationButtons();
    var actionObserver = new MutationObserver(function() {
      enhanceOperationButtons();
    });
    actionObserver.observe(document.body, { childList: true, subtree: true });
  });

  // ========== SmartCode 维护批量导入功能 ==========
  var scMaintainImportCurrentStep = 1;
  var scMaintainImportData = [];

  function closeSCMaintainImportModal() {
    closeModal('importSCMaintainModal');
    setTimeout(resetSCMaintainImportModal, 300);
  }

  function resetSCMaintainImportModal() {
    scMaintainImportCurrentStep = 1;
    scMaintainImportData = [];

    // Reset step indicators
    document.getElementById('scImportStep1').className = 'import-step active';
    document.getElementById('scImportStep2').className = 'import-step';
    document.getElementById('scImportStep3').className = 'import-step';
    document.getElementById('scImportLine1').style.background = 'var(--gray-200)';
    document.getElementById('scImportLine2').style.background = 'var(--gray-200)';

    // Reset content visibility
    document.getElementById('scImportStepContent1').style.display = 'block';
    document.getElementById('scImportStepContent2').style.display = 'none';
    document.getElementById('scImportStepContent3').style.display = 'none';

    // Reset buttons
    document.getElementById('scImportNextBtn').textContent = '下一步';
    document.getElementById('scImportNextBtn').disabled = true;
    document.getElementById('scImportModalFooter').style.display = 'flex';

    // Reset file selection
    resetSCMaintainImportFile();
  }

  function resetSCMaintainImportFile() {
    document.getElementById('scMaintainImportFile').value = '';
    document.getElementById('scSelectedFileInfo').style.display = 'none';
    document.getElementById('scImportNextBtn').disabled = true;
  }

  function handleSCMaintainImportFile(input) {
    if (input.files && input.files[0]) {
      var file = input.files[0];
      var fileName = file.name;
      var fileSize = '';

      if (file.size > 1024 * 1024) {
        fileSize = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
      } else if (file.size > 1024) {
        fileSize = (file.size / 1024).toFixed(2) + ' KB';
      } else {
        fileSize = file.size + ' B';
      }

      document.getElementById('scSelectedFileName').textContent = fileName;
      document.getElementById('scSelectedFileSize').textContent = '文件大小: ' + fileSize;
      document.getElementById('scSelectedFileInfo').style.display = 'block';
      document.getElementById('scImportNextBtn').disabled = false;

      // Simulate parsing - in real scenario would use a library like SheetJS
      simulateSCMaintainImportData();
    }
  }

  function simulateSCMaintainImportData() {
    // Simulated import data for demo
    scMaintainImportData = [
      { row: 1, code: '778899', remark: '十二月份促销推广使用', error: null },
      { row: 2, code: '990011', remark: '一月份新品推广', error: null },
      { row: 3, code: '223344', remark: '二月份春季活动', error: null },
      { row: 4, code: '556677', remark: '', error: 'SmartCode 不能为空' },
      { row: 5, code: '889900', remark: '夏季促销专用', error: null },
    ];
  }

  function downloadSCMaintainTemplate() {
    // Create CSV template content
    var csvContent = '﻿'; // BOM for UTF-8
    csvContent += 'SmartCode,备注说明\n';
    csvContent += '778899,十二月份促销推广使用\n';
    csvContent += '990011,一月份新品推广\n';
    csvContent += '223344,二月份春季活动\n';

    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var link = document.createElement('a');
    var url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'SmartCode导入模板.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('模板下载成功', 'success');
  }

  function goSCImportNextStep() {
    if (scMaintainImportCurrentStep === 1) {
      // Go to step 2: Preview
      scMaintainImportCurrentStep = 2;
      updateSCImportStepUI();
      renderSCImportPreview();
    } else if (scMaintainImportCurrentStep === 2) {
      // Go to step 3: Complete
      scMaintainImportCurrentStep = 3;
      updateSCImportStepUI();
      document.getElementById('scImportCompleteInfo').textContent = '成功导入 ' + scMaintainImportData.length + ' 条SmartCode数据';
    }
  }

  function updateSCImportStepUI() {
    var step1 = document.getElementById('scImportStep1');
    var step2 = document.getElementById('scImportStep2');
    var step3 = document.getElementById('scImportStep3');
    var line1 = document.getElementById('scImportLine1');
    var line2 = document.getElementById('scImportLine2');

    if (scMaintainImportCurrentStep === 1) {
      step1.className = 'import-step active';
      step2.className = 'import-step';
      step3.className = 'import-step';
    } else if (scMaintainImportCurrentStep === 2) {
      step1.className = 'import-step completed';
      step1.querySelector('.step-num').textContent = '✓';
      step2.className = 'import-step active';
      line1.style.background = 'var(--success)';

      document.getElementById('scImportStepContent1').style.display = 'none';
      document.getElementById('scImportStepContent2').style.display = 'block';
      document.getElementById('scImportNextBtn').textContent = '确认导入';
      document.getElementById('scImportNextBtn').disabled = false;
    } else if (scMaintainImportCurrentStep === 3) {
      step1.className = 'import-step completed';
      step1.querySelector('.step-num').textContent = '✓';
      step2.className = 'import-step completed';
      step2.querySelector('.step-num').textContent = '✓';
      step3.className = 'import-step active';
      line1.style.background = 'var(--success)';
      line2.style.background = 'var(--success)';

      document.getElementById('scImportStepContent2').style.display = 'none';
      document.getElementById('scImportStepContent3').style.display = 'block';
      document.getElementById('scImportModalFooter').style.display = 'none';

      showToast('导入成功', 'success');
    }
  }

  function renderSCImportPreview() {
    var tbody = document.getElementById('scImportPreviewBody');
    tbody.innerHTML = '';

    document.getElementById('scImportDataCount').textContent = scMaintainImportData.length;

    scMaintainImportData.forEach(function(item) {
      var tr = document.createElement('tr');
      tr.style.background = item.error ? 'var(--danger-light)' : '';
      tr.innerHTML = '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);">' + item.row + '</td>' +
        '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);"><code>' + item.code + '</code></td>' +
        '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100);">' + (item.remark || '<span style="color:var(--gray-400)">-</span>') + '</td>' +
        '<td style="padding: 8px 12px; border-bottom: 1px solid var(--gray-100); color: ' + (item.error ? 'var(--danger)' : 'var(--success)') + ';">' + (item.error || '✓ 校验通过') + '</td>';
      tbody.appendChild(tr);
    });
  }
