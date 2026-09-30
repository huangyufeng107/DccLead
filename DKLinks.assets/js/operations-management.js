// ========== 权限管理 ==========
  var _currentRoleId = null;

  function openRoleModal(id) {
    _currentRoleId = id;
    var modal = document.getElementById('roleModal');
    var title = document.getElementById('roleModalTitle');
    var nameInput = document.getElementById('roleName');
    var codeInput = document.getElementById('roleCode');
    var descInput = document.getElementById('roleDesc');
    var statusSelect = document.getElementById('roleStatus');
    var confirmBtn = modal.querySelector('.btn-primary');

    if (id) {
      title.textContent = '编辑角色';
      nameInput.value = '品牌运营';
      codeInput.value = 'brand_operator';
      descInput.value = '管理特定品牌下的基础数据和线索';
      statusSelect.value = '1';
      confirmBtn.textContent = '保存修改';
    } else {
      title.textContent = '新增角色';
      nameInput.value = '';
      codeInput.value = '';
      descInput.value = '';
      statusSelect.value = '1';
      confirmBtn.textContent = '确认创建';
    }

    modal.classList.add('active');
  }

  function saveRole() {
    var name = document.getElementById('roleName').value.trim();
    var code = document.getElementById('roleCode').value.trim();

    if (!name) {
      showToast('请输入角色名称', 'error');
      return;
    }
    if (!code) {
      showToast('请输入角色编码', 'error');
      return;
    }
    if (!/^[a-z_][a-z0-9_]*$/.test(code)) {
      showToast('角色编码格式错误，请使用小写英文+下划线', 'error');
      return;
    }

    closeModal('roleModal');
    showToast(_currentRoleId ? '角色修改成功' : '角色创建成功', 'success');
  }

  // ========== 报表权限 ==========
  var _currentAccountId = null;

  function openAccountModal(btn, id) {
    _currentAccountId = id || null;
    var modal = document.getElementById('accountModal');
    var title = document.getElementById('accountModalTitle');
    var codeInput = document.getElementById('accountCode');
    var nameInput = document.getElementById('accountName');
    var phoneInput = document.getElementById('accountPhone');
    var roleSelect = document.getElementById('accountRole');
    var supplierSelect = document.getElementById('accountSupplier');
    var pwdInput = document.getElementById('accountPwd');
    var pwdLabel = document.getElementById('accountPwdLabel');
    var statusSelect = document.getElementById('accountStatus');
    var confirmBtn = modal.querySelector('.modal-footer .btn-primary');

    // 动态填充开发者管理下拉（仅启用状态的开发者）
    supplierSelect.innerHTML = '<option value="">请选择开发者（可选）</option>';
    _supplierData.forEach(function(s) {
      if (s.statusVal === 1) {
        var opt = document.createElement('option');
        opt.value = s.id;
        opt.textContent = s.name;
        supplierSelect.appendChild(opt);
      }
    });

    if (id) {
      title.textContent = '编辑帐号';
      codeInput.value = id;
      codeInput.readOnly = true;
      nameInput.value = '王磊';
      phoneInput.value = '139****6600';
      roleSelect.value = 'brand_operator';
      // 从行中读取当前关联的开发者
      if (btn) {
        var row = btn.closest('tr');
        var supplierCell = row.querySelector('td:nth-child(5)');
        var supplierName = supplierCell ? supplierCell.textContent.trim() : '';
        var matched = _supplierData.find(function(s) { return s.name === supplierName; });
        supplierSelect.value = matched ? matched.id : '';
      }
      pwdInput.value = '';
      pwdInput.placeholder = '留空则不修改密码';
      pwdLabel.innerHTML = '登录密码 <span class="form-hint" style="color: var(--gray-400);">(留空不修改)</span>';
      statusSelect.value = '1';
      confirmBtn.textContent = '保存修改';
    } else {
      title.textContent = '新增帐号';
      codeInput.value = '';
      codeInput.readOnly = false;
      nameInput.value = '';
      phoneInput.value = '';
      roleSelect.value = '';
      supplierSelect.value = '';
      pwdInput.value = '';
      pwdInput.placeholder = '请输入登录密码';
      pwdLabel.innerHTML = '登录密码 <span class="required">*</span>';
      statusSelect.value = '1';
      confirmBtn.textContent = '确认创建';
    }

    modal.classList.add('active');
  }

  function saveAccount() {
    var code = document.getElementById('accountCode').value.trim();
    var name = document.getElementById('accountName').value.trim();
    var phone = document.getElementById('accountPhone').value.trim();
    var role = document.getElementById('accountRole').value;

    if (!code) {
      showToast('请输入帐号', 'error');
      return;
    }
    if (!name) {
      showToast('请输入姓名', 'error');
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(phone.replace(/\*/g, ''))) {
      showToast('请输入正确的手机号', 'error');
      return;
    }
    if (!role) {
      showToast('请选择角色', 'error');
      return;
    }
    if (!_currentAccountId) {
      var pwd = document.getElementById('accountPwd').value;
      if (!pwd || pwd.length < 6) {
        showToast('密码长度不能少于6位', 'error');
        return;
      }
    }

    closeModal('accountModal');
    showToast(_currentAccountId ? '帐号修改成功' : '帐号创建成功', 'success');
  }

  function filterAccountList() {
    var searchInput = document.getElementById('accountSearch');
    var roleFilter = document.getElementById('accountRoleFilter');
    var statusFilter = document.getElementById('accountStatusFilter');
    var tbody = document.getElementById('account-tbody');
    if (!tbody) return;

    var keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var roleVal = roleFilter ? roleFilter.value : '';
    var statusVal = statusFilter ? statusFilter.value : '';

    var rows = tbody.querySelectorAll('tr');
    var visibleCount = 0;

    rows.forEach(function(row) {
      var code = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
      var name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
      var phone = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
      var role = row.querySelector('td:nth-child(4)').textContent;
      var statusBadge = row.querySelector('td:nth-child(7) .status-badge');
      var status = statusBadge.classList.contains('status-active') ? '1' : '0';

      var matchKeyword = !keyword || code.includes(keyword) || name.includes(keyword) || phone.includes(keyword);
      var matchRole = !roleVal || (roleVal === 'super_admin' && role.includes('超级')) ||
                      (roleVal === 'brand_operator' && role.includes('品牌')) ||
                      (roleVal === 'supplier_admin' && (role.includes('供应') || role.includes('开发者'))) ||
                      (roleVal === 'dealer_agent' && role.includes('经销'));
      var matchStatus = !statusVal || status === statusVal;

      var show = matchKeyword && matchRole && matchStatus;
      row.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    var infoEl = document.querySelector('#page-account .pagination-info');
    if (infoEl) infoEl.textContent = '共 ' + visibleCount + ' 条数据';
  }

  function resetAccountFilter() {
    var searchInput = document.getElementById('accountSearch');
    var roleFilter = document.getElementById('accountRoleFilter');
    var statusFilter = document.getElementById('accountStatusFilter');
    if (searchInput) searchInput.value = '';
    if (roleFilter) roleFilter.value = '';
    if (statusFilter) statusFilter.value = '';
    filterAccountList();
  }

  function toggleAccountStatus(btn, accountId) {
    var row = btn.closest('tr');
    var statusCell = row.querySelector('td:nth-child(8)');
    var badge = statusCell.querySelector('.status-badge');
    var isActive = badge.classList.contains('status-active');

    if (isActive) {
      badge.className = 'status-badge status-danger';
      badge.innerHTML = '停用';
      btn.textContent = '启用';
      btn.style.color = 'var(--success)';
      showToast('帐号已停用', 'success');
    } else {
      badge.className = 'status-badge status-active';
      badge.innerHTML = '启用';
      btn.textContent = '停用';
      btn.style.color = 'var(--danger)';
      showToast('帐号已启用', 'success');
    }
  }

  // 帐号搜索回车事件
  document.addEventListener('DOMContentLoaded', function() {
    var searchInput = document.getElementById('accountSearch');
    if (searchInput) {
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          filterAccountList();
        }
      });
    }
  });


  // ========== 排期管理-新增编辑 ==========
  var scheduleBrandTabs = [
    { name: '理想汽车', code: 'LIXIANG', ready: false },
    { name: '问界', code: 'AITO', ready: false },
    { name: '小鹏汽车', code: 'XIAOPENG', ready: false },
    { name: '东风日产', code: 'DONGFENG_NISSAN', ready: true }
  ];
  var scheduleActiveBrand = '东风日产';

  var scheduleData = [
    { id:'01', name:'高德地图', startTime:'2015-10-02T10:01', endTime:'2015-10-10T10:01', totalBudget:50000, status:1, baseSeries:[{id:'1',name:'理想L9',code:'LIXIANG_L9',brandId:'1',brandName:'理想汽车'},{id:'2',name:'理想L8',code:'LIXIANG_L8',brandId:'1',brandName:'理想汽车'}], suppliers:[{accountId:'2233',accountName:'高德地图',accountShort:'高德',budget:25000,smartcode:'112233',settlement:'CPL',costPrice:200,salePrice:300,deliveryCost:null,deliverySale:null,storeIds:['LX001','LX002']},{accountId:'4455',accountName:'懂车帝',accountShort:'懂车帝',budget:25000,smartcode:'445566',settlement:'CPS',costPrice:null,salePrice:null,deliveryCost:5000,deliverySale:8000,storeIds:['LX003','LX004']}], storeIds:[] },
    { id:'02', name:'懂车帝', startTime:'2026-01-01T00:00', endTime:'2026-01-31T23:59', totalBudget:120000, status:1, baseSeries:[{id:'3',name:'问界M9',code:'WENJIE_M9',brandId:'2',brandName:'问界'}], suppliers:[], storeIds:[] },
    { id:'03', name:'汽车之家', startTime:'2026-03-01T00:00', endTime:'2026-03-31T23:59', totalBudget:80000, status:0, baseSeries:[{id:'4',name:'小鹏G9',code:'XIAOPENG_G9',brandId:'3',brandName:'小鹏汽车'}], suppliers:[], storeIds:[] },
    { id:'04', name:'东风日产-高德地图NX8传播排期', startTime:'2026-06-01T00:00', endTime:'2026-06-30T23:59', totalBudget:160000, status:1, baseSeries:[{id:'13',name:'轩逸',code:'DFN_SYLPHY',brandId:'5',brandName:'东风日产'},{id:'14',name:'天籁',code:'DFN_ALTIMA',brandId:'5',brandName:'东风日产'},{id:'16',name:'新楼兰',code:'DFN_MURANO',brandId:'5',brandName:'东风日产'}], suppliers:[{accountId:'admin1',accountName:'某供应商A',accountShort:'供应A',budget:90000,smartcode:'DFN_NX8_GD_001',settlement:'CPL',costPrice:180,salePrice:280,deliveryCost:null,deliverySale:null,storeIds:['DFN_GZ_PY_001','DFN_SH_PD_003']},{accountId:'admin2',accountName:'某供应商B',accountShort:'供应B',budget:70000,smartcode:'DFN_NX8_DCD_002',settlement:'CPS',costPrice:null,salePrice:null,deliveryCost:5000,deliverySale:8000,storeIds:['DFN_SZ_NS_002']}], storeIds:[] }
  ];
  var currentEditingScheduleId = null;
  var currentScheduleMode = 'add';
  var scheduleSupplierRowCounter = 0;
  var scheduleActiveSupplierIdx = null;
  var scheduleSelectedSeries = [];
  var scheduleSelectedBrandIds = [];


  function closeSchedulePage() {
    closeModal('scheduleModal');
    document.getElementById('currentPageName').textContent = '排期管理';
    renderScheduleTable();
  }

  function getScheduleBrandNames(schedule) {
    var map = {};
    (schedule.baseSeries || []).forEach(function(series) {
      if (series.brandName) map[series.brandName] = true;
    });
    return Object.keys(map);
  }

  function getScheduleBrandCount(brandName) {
    return scheduleData.filter(function(s) {
      if (!brandName) return true;
      return getScheduleBrandNames(s).indexOf(brandName) !== -1;
    }).length;
  }

  function renderScheduleBrandTabs() {
    var container = document.getElementById('scheduleBrandTabs');
    if (!container) return;
    var designBadge = '<span style="background: var(--gray-200); color: var(--gray-500); padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-left: 4px;">设计中</span>';
    var html = "<button class=\"tab-btn\" style=\"color: var(--gray-400);\" onclick=\"showScheduleDesignStage()\">全部品牌 " + designBadge + "</button>";
    scheduleBrandTabs.forEach(function(brand) {
      var active = scheduleActiveBrand === brand.name ? 'active' : '';
      if (brand.ready) {
        html += "<button class=\"tab-btn " + active + "\" onclick=\"switchScheduleBrandTab('" + escapeJS(brand.name) + "')\">" + escapeHTML(brand.name) + " <span style=\"background: var(--gray-200); padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-left: 4px;\">" + getScheduleBrandCount(brand.name) + "</span></button>";
      } else {
        html += "<button class=\"tab-btn\" style=\"color: var(--gray-400);\" onclick=\"showScheduleDesignStage()\">" + escapeHTML(brand.name) + " " + designBadge + "</button>";
      }
    });
    container.innerHTML = html;
  }

  function showScheduleDesignStage() {
    showToast('产品设计阶段', 'info');
  }

  function switchScheduleBrandTab(brandName) {
    scheduleActiveBrand = brandName || '';
    renderScheduleTable();
  }

  function setSchedulePageMode(mode) {
    currentScheduleMode = mode || 'add';
    var modal = document.getElementById('scheduleModal');
    var isView = currentScheduleMode === 'view';
    if (modal) modal.classList.toggle('schedule-view-mode', isView);
    var saveBtn = document.getElementById('scheduleSaveBtn');
    var editBtn = document.getElementById('scheduleEditBtn');
    if (saveBtn) saveBtn.style.display = isView ? 'none' : '';
    if (editBtn) editBtn.style.display = isView ? '' : 'none';
    document.querySelectorAll('#scheduleModal input, #scheduleModal select, #scheduleModal textarea').forEach(function(el) {
      if (el.type === 'hidden') return;
      el.disabled = isView;
    });
    document.querySelectorAll('#scheduleModal .schedule-inline-series-picker button, #scheduleModal .schedule-inline-series-picker input').forEach(function(el) {
      el.disabled = isView;
    });
    var addSupplierBtn = document.getElementById('scheduleAddSupplierBtn');
    if (addSupplierBtn) addSupplierBtn.disabled = isView;
  }

  function openScheduleModal(mode, scheduleId) {
    mode = mode || 'add';
    navigateTo('schedule');
    var modal = document.getElementById('scheduleModal');
    var title = document.getElementById('scheduleModalTitle');
    scheduleSupplierRowCounter = 0;
    scheduleActiveSupplierIdx = null;
    scheduleSelectedSeries = [];
    currentEditingScheduleId = scheduleId || null;
    currentScheduleMode = mode;
    var tabsEl = document.getElementById('scheduleSupplierTabs');
    var panelsEl = document.getElementById('scheduleSupplierTbody');
    if (tabsEl) tabsEl.innerHTML = '';
    if (panelsEl) panelsEl.innerHTML = '';

    if (mode === 'add') {
      title.textContent = '新增排期';
      document.getElementById('currentPageName').textContent = '排期管理 / 新增排期';
      document.getElementById('schedulePageSubtitle').textContent = '排期管理 / 新增排期';
      document.getElementById('scheduleIdDisplay').textContent = '系统自动生成';
      document.getElementById('scheduleName').value = '';
      document.getElementById('scheduleStartTime').value = '';
      document.getElementById('scheduleEndTime').value = '';
      document.getElementById('scheduleTotalBudget').value = '';
      document.getElementById('scheduleStatus').value = '1';
      renderScheduleSeriesTags([]);
      initScheduleInlineSeriesPicker();
      updateScheduleSupplierTabsEmptyState();
      bindScheduleSummaryInputs();
      updateScheduleDrawerSummary();
    } else if ((mode === 'edit' || mode === 'view') && scheduleId) {
      title.textContent = mode === 'view' ? '查看排期' : '编辑排期';
      document.getElementById('currentPageName').textContent = '排期管理 / ' + (mode === 'view' ? '查看排期' : '编辑排期');
      document.getElementById('schedulePageSubtitle').textContent = '排期管理 / ' + (mode === 'view' ? '查看排期' : '编辑排期');
      var data = scheduleData.find(function(s) { return s.id === scheduleId; });
      if (data) {
        document.getElementById('scheduleIdDisplay').textContent = data.id;
        document.getElementById('scheduleName').value = data.name || '';
        document.getElementById('scheduleStartTime').value = data.startTime || '';
        document.getElementById('scheduleEndTime').value = data.endTime || '';
        document.getElementById('scheduleTotalBudget').value = data.totalBudget || '';
        document.getElementById('scheduleStatus').value = String(data.status);
        scheduleSelectedSeries = (data.baseSeries || []).slice();
        renderScheduleSeriesTags(scheduleSelectedSeries);
        initScheduleInlineSeriesPicker();
        (data.suppliers || []).forEach(function(sup, i) {
          var supplierData = Object.assign({}, sup);
          if ((!supplierData.storeIds || supplierData.storeIds.length === 0) && i === 0 && data.storeIds && data.storeIds.length) {
            supplierData.storeIds = data.storeIds.slice();
          }
          addScheduleSupplierRow(supplierData);
        });
        var firstSupplierPanel = document.querySelector('#scheduleSupplierTbody .schedule-supplier-row');
        if (firstSupplierPanel) switchScheduleSupplierTab(firstSupplierPanel.id.replace('supplierRow', ''));
        updateScheduleSupplierTabsEmptyState();
        bindScheduleSummaryInputs();
        updateScheduleDrawerSummary();
      }
    }
    modal.classList.add('active');
    setSchedulePageMode(mode);
  }


  function initScheduleInlineSeriesPicker() {
    scheduleSelectedBrandIds = Array.from(new Set(normalizeScheduleSeries(scheduleSelectedSeries).map(function(s) { return String(s.brandId || ''); }).filter(Boolean)));
    renderScheduleInlineBrandList();
    renderScheduleInlineSeriesList();
  }

  function renderScheduleInlineBrandList() {
    var container = document.getElementById('scheduleInlineBrandList');
    if (!container) return;
    container.innerHTML = Object.keys(carSeriesData || {}).map(function(brandId) {
      var checked = scheduleSelectedBrandIds.indexOf(String(brandId)) >= 0;
      var seriesCount = (carSeriesData[brandId] || []).length;
      return '<label class="schedule-inline-brand-item">' +
        '<input type="checkbox" ' + (checked ? 'checked' : '') + ' onchange="toggleScheduleInlineBrand(\'' + brandId + '\', this.checked)">' +
        '<span><span style="font-weight:800;color:#1f2937;">' + getCarBrandName(brandId) + '</span><div style="font-size:12px;color:#94a3b8;margin-top:2px;">' + seriesCount + ' 个车系</div></span>' +
      '</label>';
    }).join('');
  }

  function toggleScheduleInlineBrand(brandId, checked) {
    brandId = String(brandId);
    if (checked && scheduleSelectedBrandIds.indexOf(brandId) === -1) {
      scheduleSelectedBrandIds.push(brandId);
    }
    if (!checked) {
      scheduleSelectedBrandIds = scheduleSelectedBrandIds.filter(function(id) { return id !== brandId; });
      scheduleSelectedSeries = scheduleSelectedSeries.filter(function(s) { return String(s.brandId) !== brandId; });
      renderScheduleSeriesTags(scheduleSelectedSeries);
    }
    renderScheduleInlineBrandList();
    renderScheduleInlineSeriesList();
  }

  function getScheduleInlineVisibleSeries() {
    var searchEl = document.getElementById('scheduleInlineSeriesSearch');
    var keyword = searchEl ? searchEl.value.trim().toLowerCase() : '';
    if (scheduleSelectedBrandIds.length === 0) return [];
    return getAllManagedCarSeries().filter(function(series) {
      if (scheduleSelectedBrandIds.indexOf(String(series.brandId)) === -1) return false;
      if (keyword && series.name.toLowerCase().indexOf(keyword) === -1 && series.code.toLowerCase().indexOf(keyword) === -1) return false;
      return true;
    });
  }

  function renderScheduleInlineSeriesList() {
    var listEl = document.getElementById('scheduleInlineSeriesList');
    var countEl = document.getElementById('scheduleInlineSeriesCount');
    if (!listEl) return;
    var seriesList = getScheduleInlineVisibleSeries();
    if (countEl) countEl.textContent = '已选 ' + scheduleSelectedSeries.length + ' / 当前 ' + seriesList.length;
    if (scheduleSelectedBrandIds.length === 0) {
      listEl.innerHTML = '<div style="padding:28px;text-align:center;color:#94a3b8;font-size:13px;">请先勾选左侧品牌</div>';
      return;
    }
    if (seriesList.length === 0) {
      listEl.innerHTML = '<div style="padding:28px;text-align:center;color:#94a3b8;font-size:13px;">暂无匹配车系</div>';
      return;
    }
    listEl.innerHTML = seriesList.map(function(series) {
      var checked = scheduleSelectedSeries.some(function(s) { return String(s.id) === String(series.id); });
      return '<label class="schedule-inline-series-item">' +
        '<input type="checkbox" ' + (checked ? 'checked' : '') + ' onchange="toggleScheduleInlineSeries(\'' + series.id + '\', this.checked)">' +
        '<span style="flex:1;"><span style="font-weight:800;color:#1f2937;">' + (checked ? '✓ ' : '') + series.name + '</span><div style="font-size:12px;color:#94a3b8;margin-top:2px;">' + series.brandName + ' · ' + series.code + '</div></span>' +
      '</label>';
    }).join('');
  }

  function toggleScheduleInlineSeries(seriesId, checked) {
    var series = getAllManagedCarSeries().find(function(s) { return String(s.id) === String(seriesId); });
    if (!series) return;
    var exists = scheduleSelectedSeries.some(function(s) { return String(s.id) === String(seriesId); });
    if (checked && !exists) scheduleSelectedSeries.push(series);
    if (!checked && exists) scheduleSelectedSeries = scheduleSelectedSeries.filter(function(s) { return String(s.id) !== String(seriesId); });
    renderScheduleSeriesTags(scheduleSelectedSeries);
    renderScheduleInlineSeriesList();
  }

  function selectAllScheduleInlineSeries() {
    getScheduleInlineVisibleSeries().forEach(function(series) {
      if (!scheduleSelectedSeries.some(function(s) { return String(s.id) === String(series.id); })) {
        scheduleSelectedSeries.push(series);
      }
    });
    renderScheduleSeriesTags(scheduleSelectedSeries);
    renderScheduleInlineSeriesList();
  }

  function clearScheduleInlineSeries() {
    scheduleSelectedSeries = [];
    renderScheduleSeriesTags(scheduleSelectedSeries);
    renderScheduleInlineBrandList();
    renderScheduleInlineSeriesList();
  }

  var scheduleSeriesPickerBrandIds = [];
  var scheduleSeriesPickerDraft = [];

  function getCarBrandName(brandId) {
    var brandMap = { '1': '理想汽车', '2': '问界', '3': '小鹏汽车', '4': '蔚来' };
    return brandMap[String(brandId)] || ('品牌' + brandId);
  }

  function getAllManagedCarSeries() {
    var result = [];
    for (var brandId in carSeriesData) {
      (carSeriesData[brandId] || []).forEach(function(series) {
        result.push({
          id: series.id,
          name: series.name,
          code: series.code,
          brandId: String(brandId),
          brandName: getCarBrandName(brandId)
        });
      });
    }
    return result;
  }

  function normalizeScheduleSeries(seriesList) {
    return (seriesList || []).map(function(s) {
      if (s.id && s.brandId) return Object.assign({}, s);
      var matched = getAllManagedCarSeries().find(function(item) {
        return item.code === s.code || item.name === s.name;
      });
      if (matched) return Object.assign({}, matched);
      return { id: s.id || s.code || s.name, name: s.name || '', code: s.code || '', brandId: s.brandId || '', brandName: s.brandName || '' };
    });
  }

  function renderScheduleSeriesTags(seriesList) {
    scheduleSelectedSeries = normalizeScheduleSeries(seriesList || []);
    var container = document.getElementById('scheduleBaseSeriesTags');
    var placeholder = document.getElementById('scheduleSeriesPlaceholder');
    container.querySelectorAll('.schedule-store-tag').forEach(function(t) { t.remove(); });
    if (scheduleSelectedSeries.length === 0) {
      placeholder.style.display = '';
    } else {
      placeholder.style.display = 'none';
      scheduleSelectedSeries.forEach(function(s) {
        var tag = document.createElement('span');
        tag.className = 'schedule-store-tag';
        var label = (s.brandName ? s.brandName + ' - ' : '') + s.name + (s.code ? ' (' + s.code + ')' : '');
        tag.innerHTML = label + ' <span class="remove" onclick="event.stopPropagation();removeScheduleSeries(\'' + s.id + '\')">×</span>';
        container.insertBefore(tag, placeholder);
      });
    }
    renderScheduleInlineSeriesList();
    updateScheduleDrawerSummary();
  }

  function removeScheduleSeries(seriesId) {
    if (currentScheduleMode === 'view') return;
    scheduleSelectedSeries = scheduleSelectedSeries.filter(function(s) { return String(s.id) !== String(seriesId); });
    renderScheduleSeriesTags(scheduleSelectedSeries);
  }

  function openScheduleSeriesPicker() {
    scheduleSeriesPickerDraft = normalizeScheduleSeries(scheduleSelectedSeries).slice();
    scheduleSeriesPickerBrandIds = Array.from(new Set(scheduleSeriesPickerDraft.map(function(s) { return String(s.brandId || ''); }).filter(Boolean)));
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(15,23,42,.52);z-index:10001;display:flex;align-items:center;justify-content:center;padding:24px;';
    overlay.id = 'seriesPickerOverlay';
    overlay.innerHTML =
      '<div class="schedule-series-picker-panel">' +
        '<div style="padding:16px 18px;border-bottom:1px solid #e8eef7;display:flex;justify-content:space-between;align-items:center;background:#fff;">' +
          '<div><div style="font-weight:800;color:#111827;font-size:16px;">选择关联车系</div><div style="font-size:12px;color:#64748b;margin-top:4px;">先选择品牌，再勾选对应车系，可多选</div></div>' +
          '<span style="cursor:pointer;font-size:22px;color:#64748b;" onclick="document.getElementById(\'seriesPickerOverlay\').remove()">×</span>' +
        '</div>' +
        '<div class="schedule-series-picker-body">' +
          '<div class="schedule-series-picker-side"><div style="padding:12px;font-size:12px;color:#64748b;font-weight:800;">品牌（多选）</div><div id="scheduleSeriesBrandList"></div></div>' +
          '<div class="schedule-series-picker-main">' +
            '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px;border-bottom:1px solid #e8eef7;background:#fff;">' +
              '<input class="form-input" id="scheduleSeriesSearch" placeholder="搜索车系名称或编码" oninput="renderScheduleSeriesPickerSeries()" style="max-width:320px;">' +
              '<div style="display:flex;gap:8px;align-items:center;">' +
                '<span id="scheduleSeriesPickerCount" style="font-size:12px;color:#64748b;"></span>' +
                '<button type="button" class="btn btn-secondary btn-sm" onclick="selectAllScheduleVisibleSeries()">全选当前</button>' +
                '<button type="button" class="btn btn-secondary btn-sm" onclick="clearScheduleSeriesPickerDraft()">清空已选</button>' +
              '</div>' +
            '</div>' +
            '<div id="scheduleSeriesPickerList" class="schedule-picker-series-list"></div>' +
            '<div id="scheduleSeriesPickerSelected" class="schedule-picker-selected-tags"></div>' +
          '</div>' +
        '</div>' +
        '<div style="padding:14px 18px;border-top:1px solid #e8eef7;display:flex;justify-content:flex-end;gap:10px;background:#fff;">' +
          '<button type="button" class="btn btn-secondary" onclick="document.getElementById(\'seriesPickerOverlay\').remove()">取消</button>' +
          '<button type="button" class="btn btn-primary" onclick="confirmScheduleSeriesPicker()">确认选择</button>' +
        '</div>' +
      '</div>';
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };
    document.body.appendChild(overlay);
    renderScheduleSeriesPickerBrands();
    renderScheduleSeriesPickerSeries();
  }

  function renderScheduleSeriesPickerBrands() {
    var container = document.getElementById('scheduleSeriesBrandList');
    if (!container) return;
    var html = Object.keys(carSeriesData || {}).map(function(brandId) {
      var checked = scheduleSeriesPickerBrandIds.indexOf(String(brandId)) >= 0;
      var seriesCount = (carSeriesData[brandId] || []).length;
      return '<label class="schedule-picker-brand">' +
        '<input type="checkbox" ' + (checked ? 'checked' : '') + ' onchange="toggleScheduleSeriesBrand(\'' + brandId + '\', this.checked)">' +
        '<span><span style="font-weight:800;color:#1f2937;">' + getCarBrandName(brandId) + '</span><div class="schedule-picker-meta">' + seriesCount + ' 个车系</div></span>' +
      '</label>';
    }).join('');
    container.innerHTML = html;
  }

  function toggleScheduleSeriesBrand(brandId, checked) {
    brandId = String(brandId);
    if (checked && scheduleSeriesPickerBrandIds.indexOf(brandId) === -1) {
      scheduleSeriesPickerBrandIds.push(brandId);
    }
    if (!checked) {
      scheduleSeriesPickerBrandIds = scheduleSeriesPickerBrandIds.filter(function(id) { return id !== brandId; });
      scheduleSeriesPickerDraft = scheduleSeriesPickerDraft.filter(function(s) { return String(s.brandId) !== brandId; });
    }
    renderScheduleSeriesPickerSeries();
  }

  function getScheduleVisiblePickerSeries() {
    var keywordEl = document.getElementById('scheduleSeriesSearch');
    var keyword = keywordEl ? keywordEl.value.trim().toLowerCase() : '';
    if (scheduleSeriesPickerBrandIds.length === 0) return [];
    return getAllManagedCarSeries().filter(function(series) {
      if (scheduleSeriesPickerBrandIds.indexOf(String(series.brandId)) === -1) return false;
      if (keyword && series.name.toLowerCase().indexOf(keyword) === -1 && series.code.toLowerCase().indexOf(keyword) === -1) return false;
      return true;
    });
  }

  function renderScheduleSeriesPickerSeries() {
    var listEl = document.getElementById('scheduleSeriesPickerList');
    var countEl = document.getElementById('scheduleSeriesPickerCount');
    var selectedEl = document.getElementById('scheduleSeriesPickerSelected');
    if (!listEl) return;
    var seriesList = getScheduleVisiblePickerSeries();
    if (countEl) countEl.textContent = '已选 ' + scheduleSeriesPickerDraft.length + ' / 当前 ' + seriesList.length;
    if (scheduleSeriesPickerBrandIds.length === 0) {
      listEl.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;font-size:13px;">请先选择品牌</div>';
    } else if (seriesList.length === 0) {
      listEl.innerHTML = '<div style="padding:40px;text-align:center;color:#94a3b8;font-size:13px;">暂无匹配车系</div>';
    } else {
      listEl.innerHTML = seriesList.map(function(series) {
        var checked = scheduleSeriesPickerDraft.some(function(s) { return String(s.id) === String(series.id); });
        return '<label class="schedule-picker-series">' +
          '<input type="checkbox" ' + (checked ? 'checked' : '') + ' onchange="toggleSchedulePickerSeries(\'' + series.id + '\', this.checked)">' +
          '<span style="flex:1;"><span style="font-weight:800;color:#1f2937;">' + (checked ? '✓ ' : '') + series.name + '</span><div class="schedule-picker-meta">' + series.brandName + ' · ' + series.code + '</div></span>' +
        '</label>';
      }).join('');
    }
    if (selectedEl) {
      selectedEl.innerHTML = scheduleSeriesPickerDraft.length ? scheduleSeriesPickerDraft.map(function(s) {
        return '<span class="schedule-store-tag">' + s.name + ' <span class="remove" onclick="toggleSchedulePickerSeries(\'' + s.id + '\', false)">×</span></span>';
      }).join('') : '<span style="color:#94a3b8;font-size:12px;">暂未选择车系</span>';
    }
  }

  function toggleSchedulePickerSeries(seriesId, checked) {
    var series = getAllManagedCarSeries().find(function(s) { return String(s.id) === String(seriesId); });
    if (!series) return;
    var exists = scheduleSeriesPickerDraft.some(function(s) { return String(s.id) === String(seriesId); });
    if (checked && !exists) scheduleSeriesPickerDraft.push(series);
    if (!checked && exists) scheduleSeriesPickerDraft = scheduleSeriesPickerDraft.filter(function(s) { return String(s.id) !== String(seriesId); });
    renderScheduleSeriesPickerSeries();
  }

  function selectAllScheduleVisibleSeries() {
    getScheduleVisiblePickerSeries().forEach(function(series) {
      if (!scheduleSeriesPickerDraft.some(function(s) { return String(s.id) === String(series.id); })) {
        scheduleSeriesPickerDraft.push(series);
      }
    });
    renderScheduleSeriesPickerSeries();
  }

  function clearScheduleSeriesPickerDraft() {
    scheduleSeriesPickerDraft = [];
    renderScheduleSeriesPickerSeries();
  }

  function confirmScheduleSeriesPicker() {
    scheduleSelectedSeries = scheduleSeriesPickerDraft.slice();
    renderScheduleSeriesTags(scheduleSelectedSeries);
    var overlay = document.getElementById('seriesPickerOverlay');
    if (overlay) overlay.remove();
  }

  function bindScheduleSummaryInputs() {
    ['scheduleName', 'scheduleStartTime', 'scheduleEndTime', 'scheduleTotalBudget'].forEach(function(id) {
      var el = document.getElementById(id);
      if (el && !el.dataset.summaryBound) {
        el.addEventListener('input', updateScheduleDrawerSummary);
        el.addEventListener('change', updateScheduleDrawerSummary);
        el.dataset.summaryBound = 'true';
      }
    });
  }

  function updateScheduleDrawerSummary() {
    var name = document.getElementById('scheduleName')?.value.trim() || '';
    var startTime = document.getElementById('scheduleStartTime')?.value || '';
    var endTime = document.getElementById('scheduleEndTime')?.value || '';
    var totalBudget = parseFloat(document.getElementById('scheduleTotalBudget')?.value) || 0;
    var supplierRows = document.querySelectorAll('#scheduleSupplierTbody .schedule-supplier-row');
    var allocated = 0;
    var storeCount = 0;
    supplierRows.forEach(function(row) {
      var idx = row.id.replace('supplierRow', '');
      allocated += parseFloat(document.getElementById('supBudget' + idx)?.value) || 0;
      storeCount += getScheduleSupplierStoreIds(idx).length;
    });
    var timeText = startTime && endTime ? startTime.replace('T', ' ') + ' ~ ' + endTime.replace('T', ' ') : '未选择';
    var nameEl = document.getElementById('scheduleSummaryName');
    var timeEl = document.getElementById('scheduleSummaryTime');
    var budgetEl = document.getElementById('scheduleSummaryBudget');
    var allocatedEl = document.getElementById('scheduleSummaryAllocated');
    var scaleEl = document.getElementById('scheduleSummaryScale');
    var footerEl = document.getElementById('scheduleFooterSummary');
    var confirmSeriesEl = document.getElementById('scheduleConfirmSeries');
    var confirmSuppliersEl = document.getElementById('scheduleConfirmSuppliers');
    var confirmStoresEl = document.getElementById('scheduleConfirmStores');
    var confirmBudgetEl = document.getElementById('scheduleConfirmBudget');
    if (nameEl) nameEl.textContent = name || '未填写';
    if (timeEl) timeEl.textContent = timeText;
    if (budgetEl) budgetEl.textContent = '¥' + totalBudget.toLocaleString();
    if (allocatedEl) allocatedEl.textContent = '¥' + allocated.toLocaleString();
    if (scaleEl) scaleEl.textContent = scheduleSelectedSeries.length + ' 车系 · ' + supplierRows.length + ' 供应商';
    if (footerEl) footerEl.textContent = scheduleSelectedSeries.length + ' 车系 · ' + supplierRows.length + ' 供应商 · ' + storeCount + ' 家专营店 · 已分配 ¥' + allocated.toLocaleString() + ' / ¥' + totalBudget.toLocaleString();
    if (confirmSeriesEl) confirmSeriesEl.textContent = scheduleSelectedSeries.length;
    if (confirmSuppliersEl) confirmSuppliersEl.textContent = supplierRows.length;
    if (confirmStoresEl) confirmStoresEl.textContent = storeCount;
    if (confirmBudgetEl) confirmBudgetEl.textContent = '¥' + allocated.toLocaleString() + ' / ¥' + totalBudget.toLocaleString();
  }

  function initScheduleFlowSteps() {
    var steps = document.querySelectorAll('#scheduleModal .schedule-flow-step');
    steps.forEach(function(item, index) { item.classList.toggle('active', index === 0); });
    steps.forEach(function(step) {
      if (step.dataset.bound) return;
      step.addEventListener('click', function() {
        document.querySelectorAll('#scheduleModal .schedule-flow-step').forEach(function(item) { item.classList.remove('active'); });
        step.classList.add('active');
      });
      step.dataset.bound = 'true';
    });
  }

  function getScheduleSupplierAccountOptions() {
    var options = (typeof dkAccountOptions !== 'undefined' ? dkAccountOptions : []).filter(function(account) {
      return normalizeDkAccountType(account.type) === '供应商' && account.status !== '0';
    });
    return options;
  }

  function getScheduleSupplierAccountPickerLabel(prefill) {
    if (!prefill || !prefill.accountId) return '';
    var matched = getScheduleSupplierAccountOptions().find(function(account) {
      return account.id === prefill.accountId;
    });
    var accountName = matched ? matched.name : (prefill.accountName || '');
    return prefill.accountId + (accountName ? '｜' + accountName : '');
  }

  function getScheduleSupplierAccountDropdownRows(idx) {
    var searchInput = document.getElementById('supAccountPicker' + idx);
    var idInput = document.getElementById('supAccountId' + idx);
    var keyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
    if (idInput && idInput.value && keyword.indexOf(idInput.value.toLowerCase()) === 0) {
      keyword = '';
    }
    return getScheduleSupplierAccountOptions().filter(function(account) {
      var haystack = [account.id, account.name, account.shortName, account.group].join(' ').toLowerCase();
      return !keyword || haystack.indexOf(keyword) > -1;
    });
  }

  function renderScheduleSupplierAccountDropdown(idx) {
    var dropdown = document.getElementById('supAccountDropdown' + idx);
    if (!dropdown) return;
    var rows = getScheduleSupplierAccountDropdownRows(idx);
    if (!rows.length) {
      dropdown.innerHTML = '<div style="padding:12px;text-align:center;color:var(--gray-400);font-size:13px;">未找到匹配帐号</div>';
      dropdown.style.display = 'block';
      return;
    }
    dropdown.innerHTML = rows.map(function(account) {
      return '<button type="button" onclick="selectScheduleSupplierAccount(' + idx + ', \'' + escapeJS(account.id) + '\')" style="width:100%;display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border:0;border-bottom:1px solid var(--gray-100);background:#fff;text-align:left;cursor:pointer;">' +
        '<span style="display:block;flex:1;min-width:0;">' +
          '<span style="display:block;font-weight:700;color:var(--gray-900);font-size:13px;">' + escapeHTML(account.id + '｜' + account.name) + '</span>' +
          '<span style="display:block;margin-top:3px;color:var(--gray-500);font-size:12px;">简称：' + escapeHTML(account.shortName || '-') + '｜' + escapeHTML(account.group || '帐号管理') + '</span>' +
        '</span>' +
      '</button>';
    }).join('');
    dropdown.style.display = 'block';
  }

  function handleScheduleSupplierAccountSearch(idx) {
    var idInput = document.getElementById('supAccountId' + idx);
    var nameInput = document.getElementById('supAccountName' + idx);
    var shortInput = document.getElementById('supAccountShort' + idx);
    if (idInput) idInput.value = '';
    if (nameInput) nameInput.value = '';
    if (shortInput) shortInput.value = '';
    renderScheduleSupplierAccountDropdown(idx);
    updateScheduleSupplierCardSummary(idx);
  }

  function hideScheduleSupplierAccountDropdown(idx) {
    setTimeout(function() {
      var dropdown = document.getElementById('supAccountDropdown' + idx);
      if (dropdown) dropdown.style.display = 'none';
    }, 160);
  }

  function selectScheduleSupplierAccount(idx, accountId) {
    var account = getScheduleSupplierAccountOptions().find(function(item) { return item.id === accountId; });
    if (!account) return;
    var idInput = document.getElementById('supAccountId' + idx);
    var pickerInput = document.getElementById('supAccountPicker' + idx);
    var nameInput = document.getElementById('supAccountName' + idx);
    var shortInput = document.getElementById('supAccountShort' + idx);
    var dropdown = document.getElementById('supAccountDropdown' + idx);
    if (idInput) idInput.value = account.id;
    if (pickerInput) pickerInput.value = account.id + '｜' + account.name;
    if (nameInput) nameInput.value = account.name || '';
    if (shortInput) shortInput.value = account.shortName || '';
    if (dropdown) dropdown.style.display = 'none';
    updateScheduleSupplierCardSummary(idx);
  }

  function addScheduleSupplierRow(prefill) {
    scheduleSupplierRowCounter++;
    var idx = scheduleSupplierRowCounter;
    var tbody = document.getElementById('scheduleSupplierTbody');
    var tabs = document.getElementById('scheduleSupplierTabs');
    var tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'schedule-supplier-tab';
    tab.id = 'supplierTab' + idx;
    tab.onclick = function() { switchScheduleSupplierTab(idx); };
    tab.innerHTML =
      '<div class="schedule-supplier-tab-name" id="supTabName' + idx + '">' + ((prefill && prefill.accountName) ? prefill.accountName : '供应商 ' + idx) + '</div>' +
      '<div class="schedule-supplier-tab-meta" id="supTabMeta' + idx + '">待配置</div>';
    if (tabs) tabs.appendChild(tab);

    var panel = document.createElement('div');
    panel.className = 'schedule-supplier-panel schedule-supplier-row';
    panel.id = 'supplierRow' + idx;
    panel.innerHTML =
      '<div class="schedule-panel-section">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px;">' +
          '<div><div class="schedule-panel-section-title" style="margin-bottom:4px;">账号与预算</div><div style="font-size:12px;color:var(--gray-500);">每个供应商独立维护预算、SMARTCODE 与关联专营店</div></div>' +
          '<button class="btn btn-danger btn-sm" onclick="removeScheduleSupplierRow(' + idx + ')">删除供应商</button>' +
        '</div>' +
        '<div class="schedule-supplier-form-grid">' +
          '<div class="form-group" style="position:relative;"><label class="form-label">帐号ID <span class="required">*</span></label><input type="hidden" id="supAccountId' + idx + '" value="' + (prefill ? escapeHTML(prefill.accountId || '') : '') + '"><input type="text" class="form-input" id="supAccountPicker' + idx + '" value="' + escapeHTML(getScheduleSupplierAccountPickerLabel(prefill)) + '" placeholder="搜索帐号ID / 名称" autocomplete="off" onfocus="renderScheduleSupplierAccountDropdown(' + idx + ')" oninput="handleScheduleSupplierAccountSearch(' + idx + ')" onblur="hideScheduleSupplierAccountDropdown(' + idx + ')"><div id="supAccountDropdown' + idx + '" style="display:none;position:absolute;z-index:20;left:0;right:0;top:64px;background:#fff;border:1px solid var(--gray-200);border-radius:8px;box-shadow:0 12px 32px rgba(15,23,42,0.14);max-height:220px;overflow-y:auto;"></div></div>' +
          '<div class="form-group"><label class="form-label">帐号全称</label><input type="text" class="form-input" id="supAccountName' + idx + '" value="' + (prefill ? prefill.accountName || '' : '') + '" placeholder="自动填充" readonly style="background:var(--gray-100);" oninput="updateScheduleSupplierCardSummary(' + idx + ')"></div>' +
          '<div class="form-group"><label class="form-label">帐号简称</label><input type="text" class="form-input" id="supAccountShort' + idx + '" value="' + (prefill ? prefill.accountShort || '' : '') + '" placeholder="自动填充" readonly style="background:var(--gray-100);"></div>' +
          '<div class="form-group"><label class="form-label">分配预算 <span class="required">*</span></label><input type="number" class="form-input" id="supBudget' + idx + '" value="' + (prefill ? prefill.budget || '' : '') + '" placeholder="预算" oninput="updateScheduleSupplierCardSummary(' + idx + ')"></div>' +
          '<div class="form-group"><label class="form-label">SMARTCODE <span class="required">*</span></label><select class="form-select" id="supSmartcode' + idx + '" onchange="updateScheduleSupplierCardSummary(' + idx + ')"><option value="">请选择SMARTCODE</option></select></div>' +
          '<div class="form-group"><label class="form-label">结算方式 <span class="required">*</span></label><select class="form-select" id="supSettlement' + idx + '" onchange="onScheduleSettlementChange(' + idx + ');updateScheduleSupplierCardSummary(' + idx + ')"><option value="CPL" ' + (prefill && prefill.settlement === 'CPL' ? 'selected' : '') + '>CPL</option><option value="CPS" ' + (prefill && prefill.settlement === 'CPS' ? 'selected' : '') + '>CPS</option></select></div>' +
        '</div>' +
      '</div>' +
      '<div class="schedule-panel-section">' +
        '<div class="schedule-panel-section-title">结算价格</div>' +
        '<div class="schedule-supplier-price-grid" id="supCplPriceGroup' + idx + '"><div class="form-group"><label class="form-label">商机成本价 <span class="required">*</span></label><input type="number" class="form-input" id="supCostPrice' + idx + '" value="' + (prefill && prefill.costPrice ? prefill.costPrice : '') + '" placeholder="商机成本" step="0.01"></div><div class="form-group"><label class="form-label">商机销售价 <span class="required">*</span></label><input type="number" class="form-input" id="supSalePrice' + idx + '" value="' + (prefill && prefill.salePrice ? prefill.salePrice : '') + '" placeholder="商机售价" step="0.01"></div></div>' +
        '<div class="schedule-supplier-price-grid" id="supCpsPriceGroup' + idx + '"><div class="form-group"><label class="form-label">交车成本价 <span class="required">*</span></label><input type="number" class="form-input" id="supDeliveryCost' + idx + '" value="' + (prefill && prefill.deliveryCost ? prefill.deliveryCost : '') + '" placeholder="交车成本" step="0.01"></div><div class="form-group"><label class="form-label">交车销售价 <span class="required">*</span></label><input type="number" class="form-input" id="supDeliverySale' + idx + '" value="' + (prefill && prefill.deliverySale ? prefill.deliverySale : '') + '" placeholder="交车售价" step="0.01"></div></div>' +
      '</div>' +
      '<div class="schedule-panel-section"><input type="hidden" id="supStoreIds' + idx + '" value="' + ((prefill && prefill.storeIds) ? prefill.storeIds.join(',') : '') + '">' +
        '<label class="form-label" style="display:block;margin-bottom:10px;">关联专营店 <span id="supStoreSummary' + idx + '" class="store-picker-count" style="float:right;"></span><span style="display:none;" id="supStoreCount' + idx + '">' + ((prefill && prefill.storeIds) ? prefill.storeIds.length : 0) + '</span></label>' +
        '<div class="store-picker-panel">' +
          '<div class="store-picker-selected"><div id="supSelectedStores' + idx + '" class="store-picker-selected-tags"></div><div id="supSelectedStoresEmpty' + idx + '" class="store-picker-empty">暂未选择专营店</div></div>' +
          '<div class="store-picker-body">' +
            '<div class="store-picker-filters">' +
              '<input type="text" class="form-input" id="supStoreSearch' + idx + '" placeholder="搜索专营店编码或名称" oninput="renderScheduleSupplierStoreList(' + idx + ')">' +
              '<select class="form-select" id="supStoreProvince' + idx + '" onchange="onScheduleSupplierStoreProvinceChange(' + idx + ')"><option value="">选择省份</option></select>' +
              '<select class="form-select" id="supStoreCity' + idx + '" onchange="renderScheduleSupplierStoreList(' + idx + ')"><option value="">选择城市</option></select>' +
            '</div>' +
            '<div class="store-picker-list">' +
              '<div class="store-picker-list-head"><label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="supStoreSelectAll' + idx + '" onchange="toggleScheduleSupplierStoreSelectAll(' + idx + ')"><span>全选</span></label><span id="supStoreFilteredCount' + idx + '" class="store-picker-count">当前 0 家专营店</span></div>' +
              '<div class="store-picker-items" id="supStoreList' + idx + '"></div>' +
            '</div>' +
            '<div class="store-picker-actions"><button type="button" class="btn btn-secondary btn-sm" onclick="clearScheduleSupplierSelectedStores(' + idx + ')">清空已选</button></div>' +
          '</div>' +
        '</div>' +
        '<p class="form-hint">提示：专营店列表会根据所选“所属品牌”自动过滤，支持按编码或名称搜索和全选</p>' +
      '</div>';
    tbody.appendChild(panel);
    initScheduleSupplierStorePicker(idx);
    onScheduleSettlementChange(idx);
    populateScheduleSmartCodeDropdown(idx, prefill ? prefill.smartcode || '' : '');
    updateScheduleSupplierCardSummary(idx);
    switchScheduleSupplierTab(idx);
    updateScheduleSupplierTabsEmptyState();
    updateScheduleDrawerSummary();
  }

  function removeScheduleSupplierRow(idx) {
    var rows = document.querySelectorAll('#scheduleSupplierTbody .schedule-supplier-row');
    if (rows.length <= 1) {
      showToast('至少保留一条供应商信息', 'warning');
      return;
    }
    if (!confirm('确定删除该供应商配置吗？')) return;
    var row = document.getElementById('supplierRow' + idx);
    var tab = document.getElementById('supplierTab' + idx);
    if (row) row.remove();
    if (tab) tab.remove();
    if (String(scheduleActiveSupplierIdx) === String(idx)) {
      scheduleActiveSupplierIdx = null;
      var firstRow = document.querySelector('#scheduleSupplierTbody .schedule-supplier-row');
      if (firstRow) switchScheduleSupplierTab(firstRow.id.replace('supplierRow', ''));
    }
    reindexScheduleSupplierRows();
    updateScheduleSupplierTabsEmptyState();
    updateScheduleDrawerSummary();
  }

  function reindexScheduleSupplierRows() {
    var rows = document.querySelectorAll('#scheduleSupplierTbody .schedule-supplier-row');
    rows.forEach(function(row, i) {
      row.dataset.order = i + 1;
    });
  }

  function toggleScheduleSupplierCard(idx) {
    switchScheduleSupplierTab(idx);
  }

  function switchScheduleSupplierTab(idx) {
    document.querySelectorAll('#scheduleSupplierTabs .schedule-supplier-tab').forEach(function(tab) {
      tab.classList.remove('active');
    });
    document.querySelectorAll('#scheduleSupplierTbody .schedule-supplier-panel').forEach(function(panel) {
      panel.classList.remove('active');
    });
    var tab = document.getElementById('supplierTab' + idx);
    var panel = document.getElementById('supplierRow' + idx);
    if (tab) tab.classList.add('active');
    if (panel) panel.classList.add('active');
    scheduleActiveSupplierIdx = idx;
  }

  function updateScheduleSupplierTabsEmptyState() {
    var hasRows = document.querySelectorAll('#scheduleSupplierTbody .schedule-supplier-row').length > 0;
    var emptyEl = document.getElementById('scheduleSupplierEmpty');
    var tabsEl = document.getElementById('scheduleSupplierTabs');
    if (emptyEl) emptyEl.style.display = hasRows ? 'none' : '';
    if (tabsEl) tabsEl.style.display = hasRows ? 'flex' : 'none';
  }

  function getSmartCodeMaintainList() {
    // 从 SmartCode维护 表格中读取所有 SmartCode 值
    var codes = [];
    var rows = document.querySelectorAll('#smartcodeMaintainTbody tr');
    rows.forEach(function(row) {
      var cells = row.querySelectorAll('td');
      if (cells.length >= 2) {
        var code = (cells[1].textContent || '').trim();
        if (code) codes.push(code);
      }
    });
    return codes;
  }

  function populateScheduleSmartCodeDropdown(idx, selectedValue) {
    var sel = document.getElementById('supSmartcode' + idx);
    if (!sel) return;
    var currentVal = selectedValue !== undefined ? selectedValue : sel.value;
    var codes = getSmartCodeMaintainList();
    sel.innerHTML = '<option value="">请选择SMARTCODE</option>';
    codes.forEach(function(code) {
      var opt = document.createElement('option');
      opt.value = code;
      opt.textContent = code;
      if (code === currentVal) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  function updateScheduleSupplierCardSummary(idx) {
    var accountId = document.getElementById('supAccountId' + idx)?.value.trim() || '';
    var accountName = document.getElementById('supAccountName' + idx)?.value.trim() || '';
    var budget = parseFloat(document.getElementById('supBudget' + idx)?.value) || 0;
    var smartcode = document.getElementById('supSmartcode' + idx)?.value.trim() || '';
    var settlement = document.getElementById('supSettlement' + idx)?.value || 'CPL';
    var storeCount = getScheduleSupplierStoreIds(idx).length;
    var titleEl = document.getElementById('supTabName' + idx);
    var metaEl = document.getElementById('supTabMeta' + idx);
    if (titleEl) titleEl.textContent = accountName || (accountId ? '帐号 ' + accountId : '供应商 ' + idx);
    if (metaEl) {
      var meta = [];
      meta.push('¥' + budget.toLocaleString());
      meta.push(settlement);
      meta.push(storeCount + '家店');
      if (smartcode) meta.push(smartcode);
      metaEl.textContent = meta.join(' · ');
    }
    updateScheduleDrawerSummary();
  }

  function onScheduleSettlementChange(idx) {
    var method = document.getElementById('supSettlement' + idx).value;
    var costEl = document.getElementById('supCostPrice' + idx);
    var saleEl = document.getElementById('supSalePrice' + idx);
    var dCostEl = document.getElementById('supDeliveryCost' + idx);
    var dSaleEl = document.getElementById('supDeliverySale' + idx);
    var cplGroup = document.getElementById('supCplPriceGroup' + idx);
    var cpsGroup = document.getElementById('supCpsPriceGroup' + idx);
    if (method === 'CPL') {
      if (cplGroup) cplGroup.style.display = 'grid';
      if (cpsGroup) cpsGroup.style.display = 'grid';
      if (costEl) { costEl.style.opacity = ''; costEl.required = true; }
      if (saleEl) { saleEl.style.opacity = ''; saleEl.required = true; }
      if (dCostEl) { dCostEl.style.opacity = ''; dCostEl.required = false; }
      if (dSaleEl) { dSaleEl.style.opacity = ''; dSaleEl.required = false; }
    } else {
      if (cplGroup) cplGroup.style.display = 'grid';
      if (cpsGroup) cpsGroup.style.display = 'grid';
      if (costEl) { costEl.style.opacity = ''; costEl.required = false; }
      if (saleEl) { saleEl.style.opacity = ''; saleEl.required = false; }
      if (dCostEl) { dCostEl.style.opacity = ''; dCostEl.required = true; }
      if (dSaleEl) { dSaleEl.style.opacity = ''; dSaleEl.required = true; }
    }
  }

  function getAllScheduleStores() {
    var allStores = [];
    for (var brand in vehicleStoreData) {
      vehicleStoreData[brand].forEach(function(s) { allStores.push(s); });
    }
    return allStores;
  }

  function getScheduleSupplierStoreIds(idx) {
    var input = document.getElementById('supStoreIds' + idx);
    if (!input || !input.value) return [];
    return input.value.split(',').filter(Boolean);
  }

  function setScheduleSupplierStoreIds(idx, ids) {
    var input = document.getElementById('supStoreIds' + idx);
    if (input) input.value = (ids || []).join(',');
    updateScheduleSupplierStoreTags(idx);
    updateScheduleDrawerSummary();
  }

  function toggleScheduleSupplierStorePanel(idx) {
    var row = document.getElementById('supplierStoreRow' + idx);
    if (!row) return;
    row.style.display = row.style.display === 'none' ? '' : 'none';
    if (row.style.display !== 'none') renderScheduleSupplierStoreList(idx);
  }

  function initScheduleSupplierStorePicker(idx) {
    var provinceSelect = document.getElementById('supStoreProvince' + idx);
    if (!provinceSelect) return;
    provinceSelect.innerHTML = '<option value="">选择省份</option>';
    var provinces = Object.keys(cityTreeData).sort();
    provinces.forEach(function(p) {
      var opt = document.createElement('option'); opt.value = p; opt.textContent = p; provinceSelect.appendChild(opt);
    });
    document.getElementById('supStoreCity' + idx).innerHTML = '<option value="">选择城市</option>';
    document.getElementById('supStoreSearch' + idx).value = '';
    renderScheduleSupplierStoreList(idx);
    updateScheduleSupplierStoreTags(idx);
  }

  function onScheduleSupplierStoreProvinceChange(idx) {
    var province = document.getElementById('supStoreProvince' + idx).value;
    var citySelect = document.getElementById('supStoreCity' + idx);
    citySelect.innerHTML = '<option value="">选择城市</option>';
    if (province && cityTreeData[province] && cityTreeData[province].cities) {
      Object.keys(cityTreeData[province].cities).sort().forEach(function(c) {
        var opt = document.createElement('option'); opt.value = c; opt.textContent = c; citySelect.appendChild(opt);
      });
    }
    renderScheduleSupplierStoreList(idx);
  }

  function getFilteredScheduleSupplierStores(idx) {
    var province = document.getElementById('supStoreProvince' + idx).value;
    var city = document.getElementById('supStoreCity' + idx).value;
    var keyword = document.getElementById('supStoreSearch' + idx).value.toLowerCase().trim();
    return getAllScheduleStores().filter(function(s) {
      if (province && s.province !== province) return false;
      if (city && s.city !== city) return false;
      if (keyword && !s.name.toLowerCase().includes(keyword) && !s.id.toLowerCase().includes(keyword)) return false;
      return true;
    });
  }

  function renderScheduleSupplierStoreList(idx) {
    var container = document.getElementById('supStoreList' + idx);
    var countEl = document.getElementById('supStoreFilteredCount' + idx);
    var selectAllEl = document.getElementById('supStoreSelectAll' + idx);
    if (!container) return;
    var stores = getFilteredScheduleSupplierStores(idx);
    var selectedIds = getScheduleSupplierStoreIds(idx);
    if (countEl) countEl.textContent = '当前 ' + stores.length + ' 家专营店';
    if (selectAllEl) {
      var selectedInFiltered = stores.filter(function(s) { return selectedIds.indexOf(s.id) >= 0; }).length;
      selectAllEl.checked = stores.length > 0 && selectedInFiltered === stores.length;
      selectAllEl.indeterminate = selectedInFiltered > 0 && selectedInFiltered < stores.length;
      selectAllEl.disabled = stores.length === 0;
    }
    if (stores.length === 0) {
      container.innerHTML = '<div class="store-picker-empty-row">未找到匹配专营店</div>';
      return;
    }
    container.innerHTML = stores.map(function(s) {
      var checked = selectedIds.indexOf(s.id) >= 0;
      return '<div class="store-picker-item' + (checked ? ' selected' : '') + '" onclick="toggleScheduleSupplierStore(' + idx + ',\'' + s.id + '\')">' +
        '<input type="checkbox" ' + (checked ? 'checked' : '') + ' style="pointer-events:none;">' +
        '<div class="store-picker-item-main"><div class="store-picker-item-name">' + escapeHTML(s.name) + '</div>' +
        '<div class="store-picker-item-meta">' + escapeHTML(s.id + '｜' + s.province + ' ' + s.city + ' ' + (s.district || '')) + '</div></div></div>';
    }).join('');
  }

  function toggleScheduleSupplierStoreSelectAll(idx) {
    if (currentScheduleMode === 'view') return;
    var selectAllEl = document.getElementById('supStoreSelectAll' + idx);
    var stores = getFilteredScheduleSupplierStores(idx);
    var selectedIds = getScheduleSupplierStoreIds(idx);
    var filteredIds = stores.map(function(s) { return s.id; });
    if (selectAllEl && selectAllEl.checked) {
      filteredIds.forEach(function(id) {
        if (selectedIds.indexOf(id) === -1) selectedIds.push(id);
      });
    } else {
      selectedIds = selectedIds.filter(function(id) { return filteredIds.indexOf(id) === -1; });
    }
    setScheduleSupplierStoreIds(idx, selectedIds);
    renderScheduleSupplierStoreList(idx);
  }

  function clearScheduleSupplierSelectedStores(idx) {
    if (currentScheduleMode === 'view') return;
    setScheduleSupplierStoreIds(idx, []);
    renderScheduleSupplierStoreList(idx);
    showToast('已清空所有已选专营店', 'info');
  }

  function toggleScheduleSupplierStore(idx, storeId) {
    if (currentScheduleMode === 'view') return;
    var selectedIds = getScheduleSupplierStoreIds(idx);
    var selectedIdx = selectedIds.indexOf(storeId);
    if (selectedIdx >= 0) { selectedIds.splice(selectedIdx, 1); }
    else { selectedIds.push(storeId); }
    setScheduleSupplierStoreIds(idx, selectedIds);
    renderScheduleSupplierStoreList(idx);
  }

  function updateScheduleSupplierStoreTags(idx) {
    var container = document.getElementById('supSelectedStores' + idx);
    var emptyEl = document.getElementById('supSelectedStoresEmpty' + idx);
    var countEl = document.getElementById('supStoreCount' + idx);
    var summaryEl = document.getElementById('supStoreSummary' + idx);
    if (!container) return;
    var allStores = getAllScheduleStores();
    var selectedIds = getScheduleSupplierStoreIds(idx);
    if (countEl) countEl.textContent = selectedIds.length;
    if (summaryEl) summaryEl.textContent = '已选 ' + selectedIds.length + ' / ' + getFilteredScheduleSupplierStores(idx).length;
    if (emptyEl) emptyEl.style.display = selectedIds.length ? 'none' : '';
    container.innerHTML = selectedIds.map(function(id) {
      var s = allStores.find(function(st) { return st.id === id; });
      return '<span class="store-picker-tag">' + escapeHTML(s ? s.name : id) + '<span class="remove" onclick="event.stopPropagation();toggleScheduleSupplierStore(' + idx + ',\'' + id + '\')">×</span></span>';
    }).join('');
    updateScheduleSupplierCardSummary(idx);
    updateScheduleDrawerSummary();
  }

  function saveSchedule() {
    var name = document.getElementById('scheduleName').value.trim();
    var startTime = document.getElementById('scheduleStartTime').value;
    var endTime = document.getElementById('scheduleEndTime').value;
    var totalBudget = parseFloat(document.getElementById('scheduleTotalBudget').value) || 0;
    var status = parseInt(document.getElementById('scheduleStatus').value);
    if (!name) { showToast('请填写排期名称', 'error'); return; }
    if (!startTime || !endTime) { showToast('请选择排期时间', 'error'); return; }
    if (!totalBudget) { showToast('请填写总预算', 'error'); return; }
    if (scheduleSelectedSeries.length === 0) { showToast('请选择至少一个关联车系', 'error'); return; }
    var supplierRows = document.querySelectorAll('#scheduleSupplierTbody .schedule-supplier-row');
    if (supplierRows.length === 0) { showToast('请至少添加一条供应商信息', 'error'); return; }

    var suppliers = [];
    var accountSet = {};
    var smartcodeSet = {};
    var hasSupplierError = false;
    supplierRows.forEach(function(row) {
      var idx = row.id.replace('supplierRow', '');
      var settlement = document.getElementById('supSettlement' + idx).value;
      var accountId = document.getElementById('supAccountId' + idx).value.trim();
      var smartcode = document.getElementById('supSmartcode' + idx).value.trim();
      var budget = parseFloat(document.getElementById('supBudget' + idx).value) || 0;
      var costPrice = parseFloat(document.getElementById('supCostPrice' + idx).value) || null;
      var salePrice = parseFloat(document.getElementById('supSalePrice' + idx).value) || null;
      var deliveryCost = parseFloat(document.getElementById('supDeliveryCost' + idx).value) || null;
      var deliverySale = parseFloat(document.getElementById('supDeliverySale' + idx).value) || null;
      var storeIds = getScheduleSupplierStoreIds(idx);
      if (!accountId || !smartcode || !budget) { hasSupplierError = true; return; }
      if (accountSet[accountId]) { showToast('同一排期内帐号ID不可重复：' + accountId, 'error'); hasSupplierError = true; return; }
      if (smartcodeSet[smartcode]) { showToast('同一排期内SMARTCODE不可重复：' + smartcode, 'error'); hasSupplierError = true; return; }
      if (settlement === 'CPL' && (!costPrice || !salePrice)) { showToast('CPL结算需填写商机成本价和商机销售价', 'error'); hasSupplierError = true; return; }
      if (settlement === 'CPS' && (!deliveryCost || !deliverySale)) { showToast('CPS结算需填写交车成本价和交车销售价', 'error'); hasSupplierError = true; return; }
      accountSet[accountId] = true;
      smartcodeSet[smartcode] = true;
      suppliers.push({
        accountId: accountId,
        accountName: document.getElementById('supAccountName' + idx).value,
        accountShort: document.getElementById('supAccountShort' + idx).value,
        budget: budget,
        smartcode: smartcode,
        settlement: settlement,
        costPrice: settlement === 'CPL' ? costPrice : null,
        salePrice: settlement === 'CPL' ? salePrice : null,
        deliveryCost: settlement === 'CPS' ? deliveryCost : null,
        deliverySale: settlement === 'CPS' ? deliverySale : null,
        storeIds: storeIds
      });
    });
    if (hasSupplierError) return;

    var scheduleObj = {
      id: currentEditingScheduleId || String(Date.now()).slice(-4),
      name: name, startTime: startTime, endTime: endTime,
      totalBudget: totalBudget, status: status,
      baseSeries: scheduleSelectedSeries.slice(),
      suppliers: suppliers, storeIds: []
    };

    if (currentEditingScheduleId) {
      var existingIdx = scheduleData.findIndex(function(s) { return s.id === currentEditingScheduleId; });
      if (existingIdx >= 0) { scheduleData[existingIdx] = scheduleObj; }
    } else { scheduleData.push(scheduleObj); }

    closeSchedulePage();
    showToast(currentEditingScheduleId ? '排期保存成功' : '排期创建成功', 'success');
  }

  function renderScheduleTable() {
    var tbody = document.getElementById('scheduleTableTbody');
    var info = document.getElementById('schedulePaginationInfo');
    if (!tbody) return;
    renderScheduleBrandTabs();
    var nameInput = document.getElementById('scheduleSearchName');
    var statusSelect = document.getElementById('scheduleStatusFilter');
    var nameKeyword = nameInput ? nameInput.value.toLowerCase().trim() : '';
    var statusFilter = statusSelect ? statusSelect.value : '';
    var filteredData = scheduleData.filter(function(s) {
      var nameMatch = !nameKeyword || s.name.toLowerCase().indexOf(nameKeyword) > -1;
      var statusMatch = statusFilter === '' || String(s.status) === statusFilter;
      var brandNames = getScheduleBrandNames(s);
      var brandMatch = !scheduleActiveBrand || brandNames.indexOf(scheduleActiveBrand) !== -1;
      return nameMatch && statusMatch && brandMatch;
    });

    if (scheduleData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--gray-400);">📭 暂无排期数据，请点击「新增数据」创建排期</td></tr>';
      if (info) info.textContent = '共 0 条';
      return;
    }
    if (filteredData.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--gray-400);">暂无匹配的排期数据</td></tr>';
      if (info) info.textContent = '共 0 条';
      return;
    }
    tbody.innerHTML = filteredData.map(function(s) {
      var timeStr = s.startTime.replace('T', ' ') + ' ～ ' + s.endTime.replace('T', ' ');
      var statusHtml = s.status === 1 ? '<span class="status-badge status-active">启用</span>' : '<span class="status-badge status-inactive">禁用</span>';
      var brandText = getScheduleBrandNames(s).join('、') || '-';
      return '<tr><td>' + (filteredData.indexOf(s) + 1) + '</td><td>' + escapeHTML(brandText) + '</td><td><strong>' + escapeHTML(s.name) + '</strong></td><td>' + timeStr + '</td><td>¥' + s.totalBudget.toLocaleString() + '</td><td>' + statusHtml + '</td>' +
      '<td><button class="btn btn-secondary btn-sm" onclick="openScheduleModal(\'view\',\'' + s.id + '\')">查看</button> <button class="btn btn-secondary btn-sm" onclick="openScheduleModal(\'edit\',\'' + s.id + '\')">编辑</button> <button class="btn btn-secondary btn-sm" onclick="navigateTo(\'dk-report\')">查看报表</button> <button class="btn btn-secondary btn-sm" onclick="navigateTo(\'dk-leaddetail\')">线索明细</button></td></tr>';
    }).join('');
    if (info) info.textContent = '共 ' + filteredData.length + ' 条';
  }

  function filterScheduleList() {
    renderScheduleTable();
  }

  function clearScheduleFilter() {
    var nameInput = document.getElementById('scheduleSearchName');
    var statusSelect = document.getElementById('scheduleStatusFilter');
    if (nameInput) nameInput.value = '';
    if (statusSelect) statusSelect.value = '';
    scheduleActiveBrand = '东风日产';
    renderScheduleTable();
  }

  // ========== 排期管理-查看报表 ==========
  var reportRawData = [
    { id:'r1', parent:'', level:0, expanded:true, name:'总部-2026年6月线索工厂NX8传播排期', accountName:'尊泽', accountShort:'尊泽', area:'-', subArea:'-', store:'-', allocatedBudget:17000, budgetConsumed:3440, remainingBudget:13560, progress:'20.24%', leadCost:80, leadSale:115, deliveryCost:0, deliverySale:0, profit:1505, originalLeads:43, duplicateLeads:0, emptyLeads:0, dedupedLeads:43, validLeads:40, arrivals:0, deliveries:0, lockedOrders:0, validLockedOrders:0, retentionRate:'100%', validRate:'93.02%', arrivalRate:'0%', conversionRate:'0%' },
    { id:'r2', parent:'r1', level:1, expanded:true, name:'-', accountName:'-', accountShort:'-', area:'华南区', subArea:'-', store:'-', allocatedBudget:'-', budgetConsumed:480, remainingBudget:'-', progress:'-', leadCost:80, leadSale:115, deliveryCost:0, deliverySale:0, profit:210, originalLeads:6, duplicateLeads:0, emptyLeads:0, dedupedLeads:6, validLeads:6, arrivals:0, deliveries:0, lockedOrders:0, validLockedOrders:0, retentionRate:'100%', validRate:'100%', arrivalRate:'0%', conversionRate:'0%' },
    { id:'r3', parent:'r2', level:2, expanded:true, name:'-', accountName:'-', accountShort:'-', area:'-', subArea:'海粤区', store:'-', allocatedBudget:'-', budgetConsumed:80, remainingBudget:'-', progress:'-', leadCost:80, leadSale:115, deliveryCost:0, deliverySale:0, profit:35, originalLeads:1, duplicateLeads:0, emptyLeads:0, dedupedLeads:1, validLeads:1, arrivals:0, deliveries:0, lockedOrders:0, validLockedOrders:0, retentionRate:'100%', validRate:'100%', arrivalRate:'0%', conversionRate:'0%' },
    { id:'r4', parent:'r3', level:3, expanded:false, name:'-', accountName:'-', accountShort:'-', area:'-', subArea:'-', store:'海口东风南方海鹏', allocatedBudget:'-', budgetConsumed:80, remainingBudget:'-', progress:'-', leadCost:80, leadSale:115, deliveryCost:0, deliverySale:0, profit:35, originalLeads:1, duplicateLeads:0, emptyLeads:0, dedupedLeads:1, validLeads:1, arrivals:0, deliveries:0, lockedOrders:0, validLockedOrders:0, retentionRate:'100%', validRate:'100%', arrivalRate:'0%', conversionRate:'0%' },
    { id:'r5', parent:'r1', level:2, expanded:false, name:'-', accountName:'-', accountShort:'-', area:'-', subArea:'深圳区', store:'-', allocatedBudget:'-', budgetConsumed:80, remainingBudget:'-', progress:'-', leadCost:80, leadSale:115, deliveryCost:0, deliverySale:0, profit:35, originalLeads:1, duplicateLeads:0, emptyLeads:0, dedupedLeads:1, validLeads:1, arrivals:0, deliveries:0, lockedOrders:0, validLockedOrders:0, retentionRate:'100%', validRate:'100%', arrivalRate:'0%', conversionRate:'0%' },
    { id:'r6', parent:'r1', level:2, expanded:false, name:'-', accountName:'-', accountShort:'-', area:'-', subArea:'广州区', store:'-', allocatedBudget:'-', budgetConsumed:160, remainingBudget:'-', progress:'-', leadCost:80, leadSale:115, deliveryCost:0, deliverySale:0, profit:70, originalLeads:2, duplicateLeads:0, emptyLeads:0, dedupedLeads:2, validLeads:2, arrivals:0, deliveries:0, lockedOrders:0, validLockedOrders:0, retentionRate:'100%', validRate:'100%', arrivalRate:'0%', conversionRate:'0%' },
    { id:'r7', parent:'r1', level:1, expanded:false, name:'-', accountName:'-', accountShort:'-', area:'华北区', subArea:'-', store:'-', allocatedBudget:'-', budgetConsumed:160, remainingBudget:'-', progress:'-', leadCost:80, leadSale:115, deliveryCost:0, deliverySale:0, profit:70, originalLeads:2, duplicateLeads:0, emptyLeads:0, dedupedLeads:2, validLeads:2, arrivals:0, deliveries:0, lockedOrders:0, validLockedOrders:0, retentionRate:'100%', validRate:'100%', arrivalRate:'0%', conversionRate:'0%' },
    { id:'r8', parent:'r1', level:1, expanded:false, name:'-', accountName:'-', accountShort:'-', area:'华中二区', subArea:'-', store:'-', allocatedBudget:'-', budgetConsumed:480, remainingBudget:'-', progress:'-', leadCost:80, leadSale:115, deliveryCost:0, deliverySale:0, profit:210, originalLeads:6, duplicateLeads:0, emptyLeads:0, dedupedLeads:6, validLeads:5, arrivals:0, deliveries:0, lockedOrders:0, validLockedOrders:0, retentionRate:'100%', validRate:'83.33%', arrivalRate:'0%', conversionRate:'0%' },
    { id:'r9', parent:'r1', level:1, expanded:false, name:'-', accountName:'-', accountShort:'-', area:'华东一区', subArea:'-', store:'-', allocatedBudget:'-', budgetConsumed:160, remainingBudget:'-', progress:'-', leadCost:80, leadSale:115, deliveryCost:0, deliverySale:0, profit:70, originalLeads:2, duplicateLeads:0, emptyLeads:0, dedupedLeads:2, validLeads:2, arrivals:0, deliveries:0, lockedOrders:0, validLockedOrders:0, retentionRate:'100%', validRate:'100%', arrivalRate:'0%', conversionRate:'0%' },
    { id:'r10', parent:'r1', level:1, expanded:false, name:'-', accountName:'-', accountShort:'-', area:'西南区', subArea:'-', store:'-', allocatedBudget:'-', budgetConsumed:560, remainingBudget:'-', progress:'-', leadCost:80, leadSale:115, deliveryCost:0, deliverySale:0, profit:245, originalLeads:7, duplicateLeads:0, emptyLeads:0, dedupedLeads:7, validLeads:7, arrivals:0, deliveries:0, lockedOrders:0, validLockedOrders:0, retentionRate:'100%', validRate:'100%', arrivalRate:'0%', conversionRate:'0%' }
  ];

  // ========== 报表日期选择器 (Flatpickr) ==========
  // ========== 报表日期范围 (datetime-local) ==========

  function dateToLocalStr(d) {
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    var h = String(d.getHours()).padStart(2, '0');
    var min = String(d.getMinutes()).padStart(2, '0');
    return y + '-' + m + '-' + day + 'T' + h + ':' + min;
  }

  function reportQuickPick(range) {
    var now = new Date(), from = new Date(), to = new Date();
    switch (range) {
      case 'today':    from.setHours(0,0,0,0); to.setHours(23,59,0,0); break;
      case 'yesterday': from.setDate(from.getDate()-1); from.setHours(0,0,0,0); to.setDate(to.getDate()-1); to.setHours(23,59,0,0); break;
      case '7d':       from.setDate(from.getDate()-6); from.setHours(0,0,0,0); to.setHours(23,59,0,0); break;
      case '30d':      from.setDate(from.getDate()-29); from.setHours(0,0,0,0); to.setHours(23,59,0,0); break;
      case 'month':    from = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0); to = new Date(now.getFullYear(), now.getMonth()+1, 0, 23, 59, 0); break;
    }
    document.getElementById('reportDateFrom').value = dateToLocalStr(from);
    document.getElementById('reportDateTo').value = dateToLocalStr(to);
    updateReportPresetActive();
  }

  function updateReportPresetActive() {
    document.querySelectorAll('.report-preset-btn').forEach(function(b) { b.classList.remove('active'); });
  }

  function getReportDateFrom() {
    return document.getElementById('reportDateFrom').value;
  }

  function getReportDateTo() {
    return document.getElementById('reportDateTo').value;
  }

  function initReportPage() {
    if (!document.getElementById('reportDateFrom').value) document.getElementById('reportDateFrom').value = '2026-06-01T00:00';
    if (!document.getElementById('reportDateTo').value) document.getElementById('reportDateTo').value = '2026-06-15T00:00';
    renderReportTable(reportRawData);
  }

  function reportValue(value) {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'number') return value.toLocaleString();
    return value;
  }

  function reportHasChildren(row) {
    return reportRawData.some(function(item) { return item.parent === row.id; });
  }

  function reportAncestorsVisible(row) {
    var parentId = row.parent;
    while (parentId) {
      var parent = reportRawData.find(function(item) { return item.id === parentId; });
      if (!parent || !parent.expanded) return false;
      parentId = parent.parent;
    }
    return true;
  }

  function renderReportTable(data) {
    var tbody = document.getElementById('reportDataTbody');
    if (!tbody) return;
    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="14" style="text-align:center;padding:40px;color:var(--gray-400);">暂无数据</td></tr>';
      document.getElementById('reportPaginationInfo').textContent = '共 0 条';
      return;
    }
    tbody.innerHTML = data.map(function(r) {
      var hasChildren = reportHasChildren(r);
      var hiddenClass = reportAncestorsVisible(r) ? '' : ' schedule-report-row-hidden';
      var toggle = hasChildren ? '<button class="schedule-report-toggle" onclick="toggleReportRow(\'' + r.id + '\')">' + (r.expanded ? '−' : '+') + '</button>' : '<span style="width:16px;display:inline-block;"></span>';
      var rowClass = 'schedule-report-row-child schedule-report-level-' + r.level + hiddenClass;
      var detailOpen = !!r.detailOpen;
      var mainRow = '<tr class="' + rowClass + '" data-report-id="' + r.id + '" data-report-parent="' + r.parent + '">' +
        '<td><div class="schedule-report-name-cell">' + toggle + '<span>' + reportValue(r.name) + '</span></div></td>' +
        '<td>' + reportValue(r.accountShort) + '</td>' +
        '<td>' + reportValue(r.area) + '</td>' +
        '<td>' + reportValue(r.subArea) + '</td>' +
        '<td>' + reportValue(r.store) + '</td>' +
        '<td>' + reportValue(r.allocatedBudget) + '</td>' +
        '<td>' + reportValue(r.budgetConsumed) + '</td>' +
        '<td>' + reportValue(r.progress) + '</td>' +
        '<td>' + reportValue(r.validLeads) + '</td>' +
        '<td>' + reportValue(r.arrivals) + '</td>' +
        '<td>' + reportValue(r.deliveries) + '</td>' +
        '<td>' + reportValue(r.validRate) + '</td>' +
        '<td>' + reportValue(r.conversionRate) + '</td>' +
        '<td><button class="btn btn-secondary btn-sm" onclick="toggleReportDetail(\'' + r.id + '\')">' + (detailOpen ? '收起' : '详情') + '</button></td>' +
      '</tr>';
      if (!detailOpen) return mainRow;
      return mainRow + renderReportDetailRow(r, hiddenClass);
    }).join('');
    document.getElementById('reportPaginationInfo').textContent = '第 1-' + data.length + ' 条/总共 ' + data.length + ' 条';
  }

  function renderReportDetailRow(r, hiddenClass) {
    function item(label, value) {
      return '<div class="schedule-report-detail-item"><span>' + label + '</span><span class="schedule-report-detail-value">' + reportValue(value) + '</span></div>';
    }
    return '<tr class="schedule-report-detail-row' + hiddenClass + '">' +
      '<td colspan="14"><div class="schedule-report-detail">' +
        '<div class="schedule-report-detail-group"><div class="schedule-report-detail-title">预算与价格</div><div class="schedule-report-detail-grid">' +
          item('账号全称', r.accountName) +
          item('剩余预算', r.remainingBudget) +
          item('商机成本价', r.leadCost) +
          item('商机销售价', r.leadSale) +
          item('交车成本价', r.deliveryCost) +
          item('交车销售价', r.deliverySale) +
          item('利润', r.profit) +
        '</div></div>' +
        '<div class="schedule-report-detail-group"><div class="schedule-report-detail-title">线索质量</div><div class="schedule-report-detail-grid">' +
          item('原始线索量', r.originalLeads) +
          item('重复线索量', r.duplicateLeads) +
          item('空号线索量', r.emptyLeads) +
          item('去重后线索量', r.dedupedLeads) +
          item('有效线索量', r.validLeads) +
          item('线索留存率', r.retentionRate) +
        '</div></div>' +
        '<div class="schedule-report-detail-group"><div class="schedule-report-detail-title">锁单与转化</div><div class="schedule-report-detail-grid">' +
          item('到店量', r.arrivals) +
          item('交车量', r.deliveries) +
          item('已锁单量', r.lockedOrders) +
          item('有效锁单量', r.validLockedOrders) +
          item('到店率', r.arrivalRate) +
          item('线索转化率', r.conversionRate) +
        '</div></div>' +
      '</div></td></tr>';
  }

  function toggleReportDetail(id) {
    var row = reportRawData.find(function(item) { return item.id === id; });
    if (!row) return;
    row.detailOpen = !row.detailOpen;
    renderReportTable(reportRawData);
  }

  function toggleReportRow(id) {
    var row = reportRawData.find(function(item) { return item.id === id; });
    if (!row) return;
    row.expanded = !row.expanded;
    renderReportTable(reportRawData);
  }

  function loadReportData() {
    var dateFrom = getReportDateFrom();
    var dateTo = getReportDateTo();
    if (!dateFrom || !dateTo) { showToast('请选择完整的创建时间范围', 'warning'); return; }
    renderReportTable(reportRawData);
    showToast('查询成功', 'success');
  }

  function resetReportFilter() {
    document.getElementById('reportDateFrom').value = '2026-06-01T00:00';
    document.getElementById('reportDateTo').value = '2026-06-15T00:00';
    updateReportPresetActive();
    reportRawData.forEach(function(row) { row.expanded = row.level < 2; });
    renderReportTable(reportRawData);
  }

  function exportReportData() { showToast('报表数据导出中，请稍候…', 'info'); }

  // ========== 开发者管理 ==========
  var _receiveInterfaceMap = {
    openapi: 'OpenAPI 推送',
    form: '表单落地页',
    excel: 'Excel 批量导入',
    webhook: 'Webhook 回调'
  };

  var supplierInterfaceBrands = ['理想', '问界', '小鹏', '比亚迪', '东风日产'];
  var supplierInterfaceTypes = [
    {key: 'lead_receive', name: '线索接收接口', hint: '接收全局字段 + 对应品牌独立字段'},
    {key: 'brand_query', name: '查询品牌基础数据', hint: '查询对应品牌的品牌基础数据'},
    {key: 'series_query', name: '查询车系基础数据', hint: '查询对应品牌的车系基础数据'},
    {key: 'city_query', name: '查询城市基础数据', hint: '查询对应品牌的城市基础数据'},
    {key: 'region_query', name: '查询区域基础数据', hint: '查询对应品牌的区域基础数据'},
    {key: 'store_query', name: '查询门店基础数据', hint: '查询对应品牌的门店基础数据'}
  ];

  var _supplierData = [
    {id:1, name:'懂车帝', shortName:'懂车', code:'DONGCHE', type:'供应商', typeVal:3, contactName:'张三', contactPhone:'13800138001', brands:'理想、问界、小鹏', brandList:['理想','问界','小鹏'], receiveInterfaces:['openapi','form'], interfacePermissions:{lead_receive:['理想','问界','小鹏'], brand_query:['理想','问界'], series_query:['理想','问界'], city_query:['理想'], region_query:['理想'], store_query:['理想','问界']}, apiKey:'dk_abc123...', todayPush:856, status:'启用', statusVal:1},
    {id:2, name:'汽车之家', shortName:'汽家', code:'AUTOHOME', type:'供应商', typeVal:3, contactName:'王五', contactPhone:'13800138003', brands:'理想、问界', brandList:['理想','问界'], receiveInterfaces:['openapi','webhook'], interfacePermissions:{lead_receive:['理想','问界'], brand_query:['理想','问界'], series_query:['理想','问界'], city_query:['问界'], region_query:['问界'], store_query:['理想','问界']}, apiKey:'ah_xyz789...', todayPush:423, status:'启用', statusVal:1},
    {id:3, name:'易车', shortName:'易车', code:'YICHE', type:'供应商', typeVal:3, contactName:'李四', contactPhone:'13800138002', brands:'小鹏', brandList:['小鹏'], receiveInterfaces:['excel'], interfacePermissions:{lead_receive:['小鹏'], brand_query:['小鹏'], series_query:['小鹏'], city_query:['小鹏'], region_query:[], store_query:['小鹏']}, apiKey:'yc_def456...', todayPush:189, status:'启用', statusVal:1}
  ];

  function formatReceiveInterfaces(values) {
    if (!values || values.length === 0) return '-';
    return values.map(function(v) { return _receiveInterfaceMap[v] || v; }).join('、');
  }

  function getSupplierBrands(supplier) {
    if (supplier && supplier.brandList) return supplier.brandList;
    if (supplier && supplier.brands) return supplier.brands.split('、').filter(Boolean);
    return [];
  }

  function getDefaultInterfacePermissionsFromLegacy(supplier) {
    var brands = getSupplierBrands(supplier);
    var permissions = {};
    supplierInterfaceTypes.forEach(function(type) {
      permissions[type.key] = [];
    });
    if (!supplier) return permissions;
    if (supplier.interfacePermissions) {
      return normalizeInterfacePermissions(supplier.interfacePermissions, brands);
    }
    if (supplier.receiveInterfaces && supplier.receiveInterfaces.length) {
      permissions.lead_receive = brands.slice();
    }
    return permissions;
  }

  function normalizeInterfacePermissions(permissions, authorizedBrands) {
    var allowed = {};
    (authorizedBrands || []).forEach(function(brand) { allowed[brand] = true; });
    var normalized = {};
    supplierInterfaceTypes.forEach(function(type) {
      var values = permissions && permissions[type.key] ? permissions[type.key] : [];
      normalized[type.key] = values.filter(function(brand) { return !!allowed[brand]; });
    });
    return normalized;
  }

  function formatSupplierInterfacePermissionsHtml(permissions) {
    var lines = [];
    supplierInterfaceTypes.forEach(function(type) {
      var brands = permissions && permissions[type.key] ? permissions[type.key] : [];
      if (brands.length) {
        lines.push('<div style="font-weight:400;">' + escapeHTML(type.name) + '：' + escapeHTML(brands.join('、')) + '</div>');
      }
    });
    return lines.length ? lines.join('') : '-';
  }

  function escapeJS(value) {
    return String(value || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  function renderSupplierTable(data) {
    var tbody = document.getElementById('supplierTableBody');
    if (!tbody) return;
    var rows = data || _supplierData;
    var html = '';
    rows.forEach(function(s) {
      var interfacePermissions = getDefaultInterfacePermissionsFromLegacy(s);
      var statusBadge = s.statusVal === 1
        ? '<span class="status-badge status-active">启用</span>'
        : '<span class="status-badge status-inactive">停用</span>';
      var typeBadge = '<span class="status-badge status-primary">' + (s.type || '-') + '</span>';
      html += '<tr>' +
        '<td>' + s.id + '</td>' +
        '<td><strong>' + escapeHTML(s.name || '') + '</strong></td>' +
        '<td><code>' + escapeHTML(s.shortName || '') + '</code></td>' +
        '<td><code>' + escapeHTML(s.code || '') + '</code></td>' +
        '<td>' + typeBadge + '</td>' +
        '<td>' + escapeHTML(s.brands || '-') + '</td>' +
        '<td style="font-size:13px; line-height:1.7;">' + formatSupplierInterfacePermissionsHtml(interfacePermissions) + '</td>' +
        '<td><code style="max-width: 100px; overflow: hidden; text-overflow: ellipsis; display: block;">' + escapeHTML(s.apiKey || '-') + '</code></td>' +
        '<td>' + (s.todayPush || 0) + '</td>' +
        '<td>' + statusBadge + '</td>' +
        '<td>' +
          '<button class="btn btn-secondary btn-sm" onclick="openSupplierViewModal(' + s.id + ')">查看</button> ' +
          '<button class="btn btn-secondary btn-sm" onclick="openSupplierModal(' + s.id + ')">编辑</button> ' +
          '<button class="' + (s.statusVal === 1 ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm') + '" onclick="toggleSupplierStatusById(' + s.id + ')">' + (s.statusVal === 1 ? '停用' : '启用') + '</button> ' +
          '<button class="btn btn-secondary btn-sm" onclick="resetApiKey(' + s.id + ', \'' + escapeJS(s.name || '') + '\')">🔑 重置Key</button>' +
        '</td>' +
      '</tr>';
    });
    tbody.innerHTML = html;
    var paginationInfo = document.querySelector('#page-supplier .pagination-info');
    if (paginationInfo) paginationInfo.textContent = '共 ' + rows.length + ' 条数据';
  }

  // 重置供应商筛选
  function resetSupplierFilter() {
    var searchInput = document.querySelector('#page-supplier .search-input');
    var typeSelect = document.querySelector('#page-supplier .filter-select');
    if (searchInput) searchInput.value = '';
    if (typeSelect) typeSelect.value = '';
    filterSupplierList();
  }

  // 供应商列表过滤
  function filterSupplierList() {
    var searchInput = document.querySelector('#page-supplier .search-input');
    var typeSelect = document.querySelector('#page-supplier .filter-select');
    var searchKeyword = searchInput ? searchInput.value.toLowerCase().trim() : '';
    var typeFilter = typeSelect ? typeSelect.value : '';
    var filtered = _supplierData.filter(function(s) {
      var name = (s.name || '').toLowerCase();
      var code = (s.code || '').toLowerCase();
      var searchMatch = !searchKeyword || name.indexOf(searchKeyword) > -1 || code.indexOf(searchKeyword) > -1;
      var typeMatch = !typeFilter || String(s.typeVal) === typeFilter;
      return searchMatch && typeMatch;
    });
    renderSupplierTable(filtered);
  }

  function toggleSupplierStatusById(id) {
    var supplier = _supplierData.find(function(s) { return s.id === id; });
    if (!supplier) return;
    if (supplier.statusVal === 1) {
      showConfirmDialog('停用账号后，该账号 API 调用立即返回 401。是否确认？', function() {
        supplier.statusVal = 0;
        supplier.status = '停用';
        filterSupplierList();
        showToast('开发者已停用', 'warning');
      });
    } else {
      supplier.statusVal = 1;
      supplier.status = '启用';
      filterSupplierList();
      showToast('开发者已启用', 'success');
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('supplierTableBody')) {
      renderSupplierTable();
    }
  });

  var _currentEditingSupplierId = null;

  function generateSupplierCode() {
    var now = new Date();
    var y = String(now.getFullYear()).slice(-2);
    var m = String(now.getMonth() + 1).padStart(2, '0');
    var d = String(now.getDate()).padStart(2, '0');
    var seq = (_supplierData.length > 0 ? Math.max.apply(null, _supplierData.map(function(s) { return s.id; })) + 1 : 1);
    return 'DEV' + y + m + d + String(seq).padStart(3, '0');
  }

  function setCheckedValues(containerId, values) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var set = {};
    (values || []).forEach(function(v) { set[v] = true; });
    container.querySelectorAll('input[type="checkbox"]').forEach(function(input) {
      input.checked = !!set[input.value];
    });
  }

  function getCheckedValues(containerId) {
    var container = document.getElementById(containerId);
    if (!container) return [];
    var values = [];
    container.querySelectorAll('input[type="checkbox"]:checked').forEach(function(input) {
      values.push(input.value);
    });
    return values;
  }

  function renderSupplierInterfaceMatrix(selectedPermissions) {
    var container = document.getElementById('supplierInterfaceMatrix');
    if (!container) return;
    var authorizedBrands = getCheckedValues('supplierBrandCheckboxes');
    var permissions = normalizeInterfacePermissions(selectedPermissions || {}, authorizedBrands);
    var html = '<div style="display: grid; grid-template-columns: 180px repeat(' + supplierInterfaceBrands.length + ', minmax(82px, 1fr)); min-width: 680px;">';
    html += '<div style="padding: 10px 12px; background: var(--gray-50); border-bottom: 1px solid var(--gray-200); font-weight: 600; color: var(--gray-700);">接口能力</div>';
    supplierInterfaceBrands.forEach(function(brand) {
      var isAuthorized = authorizedBrands.indexOf(brand) !== -1;
      html += '<div style="padding: 10px 8px; background: var(--gray-50); border-bottom: 1px solid var(--gray-200); text-align: center; font-weight: 600; color: ' + (isAuthorized ? 'var(--gray-700)' : 'var(--gray-400)') + ';">' + escapeHTML(brand) + '</div>';
    });
    supplierInterfaceTypes.forEach(function(type) {
      html += '<div style="padding: 10px 12px; border-top: 1px solid var(--gray-100);">';
      html += '<div style="font-weight: 600; color: var(--gray-900);">' + escapeHTML(type.name) + '</div>';
      html += '<div style="font-size: 12px; color: var(--gray-500); margin-top: 3px;">' + escapeHTML(type.hint) + '</div>';
      html += '</div>';
      supplierInterfaceBrands.forEach(function(brand) {
        var isAuthorized = authorizedBrands.indexOf(brand) !== -1;
        var checked = permissions[type.key] && permissions[type.key].indexOf(brand) !== -1;
        html += '<label style="display: flex; align-items: center; justify-content: center; padding: 10px 8px; border-top: 1px solid var(--gray-100); cursor: ' + (isAuthorized ? 'pointer' : 'not-allowed') + '; background: ' + (isAuthorized ? '#fff' : 'var(--gray-50)') + ';">';
        html += '<input type="checkbox" class="supplier-interface-brand" data-interface="' + escapeHTML(type.key) + '" value="' + escapeHTML(brand) + '"' + (checked ? ' checked' : '') + (isAuthorized ? '' : ' disabled') + '>';
        html += '</label>';
      });
    });
    html += '</div>';
    container.innerHTML = '<div style="overflow-x: auto;">' + html + '</div>';
  }

  function getSupplierInterfacePermissions() {
    var container = document.getElementById('supplierInterfaceMatrix');
    var permissions = {};
    supplierInterfaceTypes.forEach(function(type) {
      permissions[type.key] = [];
    });
    if (!container) return permissions;
    container.querySelectorAll('input.supplier-interface-brand:checked').forEach(function(input) {
      var key = input.getAttribute('data-interface');
      if (!permissions[key]) permissions[key] = [];
      permissions[key].push(input.value);
    });
    return permissions;
  }

  function syncSupplierInterfaceBrandAvailability() {
    renderSupplierInterfaceMatrix(getSupplierInterfacePermissions());
  }

  // 开发者查看弹窗
  function openSupplierViewModal(id) {
    var supplier = _supplierData.find(function(s) { return s.id === id; });
    if (!supplier) {
      showToast('未找到该开发者', 'error');
      return;
    }
    document.getElementById('viewSupplierName').textContent = supplier.name || '-';
    document.getElementById('viewSupplierCode').textContent = supplier.code || '-';
    document.getElementById('viewSupplierShortName').textContent = supplier.shortName || '-';
    document.getElementById('viewSupplierType').textContent = supplier.type || '-';
    document.getElementById('viewSupplierStatus').innerHTML = supplier.statusVal === 1 ? '<span class="status-badge status-active">启用</span>' : '<span class="status-badge status-inactive">停用</span>';
    document.getElementById('viewSupplierContactName').textContent = supplier.contactName || '-';
    document.getElementById('viewSupplierContactPhone').textContent = supplier.contactPhone || '-';
    document.getElementById('viewSupplierBrands').textContent = supplier.brands || '-';
    document.getElementById('viewSupplierReceiveInterfaces').innerHTML = formatSupplierInterfacePermissionsHtml(getDefaultInterfacePermissionsFromLegacy(supplier));
    document.getElementById('viewSupplierApiKey').textContent = supplier.apiKey || '-';
    document.getElementById('viewSupplierTodayPush').textContent = supplier.todayPush !== undefined ? supplier.todayPush + ' 条' : '-';
    openModal('supplierViewModal');
  }

  function openSupplierModal(id) {
    _currentEditingSupplierId = id || null;
    var modal = document.getElementById('supplierModal');
    if (id) {
      // 编辑模式
      document.getElementById('supplierModalTitle').textContent = '编辑开发者';
      var supplier = _supplierData.find(function(s) { return s.id === id; });
      if (supplier) {
        document.getElementById('supplierName').value = supplier.name || '';
        document.getElementById('supplierCode').value = supplier.code || '';
        document.getElementById('supplierCode').readOnly = true;
        document.getElementById('supplierCodeHint').textContent = '系统生成的帐号编码，创建后不可修改。';
        document.getElementById('supplierShortName').value = supplier.shortName || '';
        document.getElementById('supplierType').value = String(supplier.typeVal || '');
        document.getElementById('supplierStatus').value = String(supplier.statusVal || 1);
        document.getElementById('supplierContactName').value = supplier.contactName || '';
        document.getElementById('supplierContactPhone').value = supplier.contactPhone || '';
        setCheckedValues('supplierBrandCheckboxes', supplier.brandList || (supplier.brands ? supplier.brands.split('、') : []));
        renderSupplierInterfaceMatrix(getDefaultInterfacePermissionsFromLegacy(supplier));
      }
    } else {
      // 新增模式
      document.getElementById('supplierModalTitle').textContent = '新增开发者';
      document.getElementById('supplierName').value = '';
      document.getElementById('supplierCode').value = '保存后自动生成';
      document.getElementById('supplierCode').readOnly = true;
      document.getElementById('supplierCodeHint').textContent = '保存后由系统自动生成，创建后不可修改。';
      document.getElementById('supplierShortName').value = '';
      document.getElementById('supplierType').value = '';
      document.getElementById('supplierStatus').value = '1';
      document.getElementById('supplierContactName').value = '';
      document.getElementById('supplierContactPhone').value = '';
      setCheckedValues('supplierBrandCheckboxes', []);
      renderSupplierInterfaceMatrix({});
    }
    openModal('supplierModal');
  }

  function handleSupplierSubmit() {
    var name = document.getElementById('supplierName').value.trim();
    var code = _currentEditingSupplierId ? document.getElementById('supplierCode').value.trim() : generateSupplierCode();
    var shortName = document.getElementById('supplierShortName').value.trim();
    var type = document.getElementById('supplierType').value;
    var status = document.getElementById('supplierStatus').value;
    var contactName = document.getElementById('supplierContactName').value.trim();
    var contactPhone = document.getElementById('supplierContactPhone').value.trim();
    var brandList = getCheckedValues('supplierBrandCheckboxes');
    var interfacePermissions = normalizeInterfacePermissions(getSupplierInterfacePermissions(), brandList);
    var hasInterfacePermission = supplierInterfaceTypes.some(function(type) {
      return interfacePermissions[type.key] && interfacePermissions[type.key].length > 0;
    });
    
    // 基础校验
    if (!name) {
      showToast('请输入账号名称', 'error');
      return;
    }
    if (!shortName) {
      showToast('请输入帐号简称', 'error');
      return;
    }
    if (!type) {
      showToast('请选择开发者类型', 'error');
      return;
    }
    if (brandList.length === 0) {
      showToast('请选择至少一个授权品牌', 'error');
      return;
    }
    if (!hasInterfacePermission) {
      showToast('请至少在接口清单中选择一个支持品牌', 'error');
      return;
    }
    
    // 手机号格式校验（如果填写了）
    if (contactPhone && !/^1[3-9]\d{9}$/.test(contactPhone)) {
      showToast('请输入正确的手机号', 'error');
      return;
    }
    
    if (_currentEditingSupplierId) {
      // 更新
      var supplier = _supplierData.find(function(s) { return s.id === _currentEditingSupplierId; });
      if (supplier) {
        supplier.name = name;
        supplier.code = code;
        supplier.shortName = shortName;
        supplier.typeVal = parseInt(type);
        supplier.statusVal = parseInt(status);
        supplier.contactName = contactName;
        supplier.contactPhone = contactPhone;
        supplier.type = type === '1' ? '平台方' : type === '2' ? '媒体方' : '供应商';
        supplier.status = status === '1' ? '启用' : '停用';
        supplier.brandList = brandList;
        supplier.brands = brandList.length ? brandList.join('、') : '';
        supplier.interfacePermissions = interfacePermissions;
        supplier.receiveInterfaces = interfacePermissions.lead_receive && interfacePermissions.lead_receive.length ? ['openapi'] : [];
      }
    } else {
      // 新增
      var newId = _supplierData.length > 0 ? Math.max.apply(null, _supplierData.map(function(s) { return s.id; })) + 1 : 1;
      _supplierData.push({
        id: newId,
        name: name,
        code: code,
        shortName: shortName,
        typeVal: parseInt(type),
        type: type === '1' ? '平台方' : type === '2' ? '媒体方' : '供应商',
        statusVal: parseInt(status),
        status: status === '1' ? '启用' : '停用',
        contactName: contactName,
        contactPhone: contactPhone,
        brandList: brandList,
        brands: brandList.length ? brandList.join('、') : '',
        interfacePermissions: interfacePermissions,
        receiveInterfaces: interfacePermissions.lead_receive && interfacePermissions.lead_receive.length ? ['openapi'] : [],
        apiKey: code ? code.toLowerCase() + '_new_key...' : '',
        todayPush: 0
      });
    }
    
    var isEdit = !!_currentEditingSupplierId;
    closeModal('supplierModal');
    _currentEditingSupplierId = null;
    filterSupplierList();
    showToast(isEdit ? '更新成功' : '保存成功', 'success');
  }

  // 启用/停用切换
  function toggleStatus(btn, row) {
    var badge = row.querySelector('.status-badge.status-active, .status-badge.status-inactive');
    var currentStatus = badge.classList.contains('status-active') ? 'active' : 'inactive';
    if (currentStatus === 'active') {
      // 停用前显示警告
      showConfirmDialog('门店停用后，该门店停止接收新线索分配。已分配到该门店的进行中线索保持现状，不做强制流转。是否确认？', function() {
        badge.className = 'status-badge status-inactive';
        badge.innerHTML = '停用';
        btn.className = 'btn btn-primary btn-sm';
        btn.textContent = '启用';
        showToast('已停用', 'warning');
      });
    } else {
      // 启用，直接执行
      badge.className = 'status-badge status-active';
      badge.innerHTML = '启用';
      btn.className = 'btn btn-secondary btn-sm';
      btn.textContent = '停用';
      showToast('已启用', 'success');
    }
  }

  