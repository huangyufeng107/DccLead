  // Login
  function doLogin() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('mainApp').classList.add('active');
    showToast('登录成功，欢迎回来！', 'success');
  }

  function resetDkAccountFilters() {
    ['dkAccountId', 'dkAccountName', 'dkAccountShortName', 'dkAccountType', 'dkAccountStatusFilter'].forEach(function(id) {
      var field = document.getElementById(id);
      if (field) field.value = '';
    });
    filterDkAccountList();
  }

  function filterDkAccountList() {
    var idKeyword = document.getElementById('dkAccountId').value.toLowerCase().trim();
    var nameKeyword = document.getElementById('dkAccountName').value.toLowerCase().trim();
    var shortNameKeyword = document.getElementById('dkAccountShortName').value.toLowerCase().trim();
    var typeFilter = document.getElementById('dkAccountType').value;
    var statusFilter = document.getElementById('dkAccountStatusFilter').value;
    var rows = document.querySelectorAll('#page-dk-account tbody tr');
    var visibleCount = 0;

    rows.forEach(function(row) {
      var cells = row.querySelectorAll('td');
      var id = cells[1] ? cells[1].textContent.toLowerCase() : '';
      var name = cells[2] ? cells[2].textContent.toLowerCase() : '';
      var shortName = cells[3] ? cells[3].textContent.toLowerCase() : '';
      var type = cells[4] ? cells[4].textContent.trim() : '';
      var status = row.getAttribute('data-status') || '';
      var matched = (idKeyword === '' || id.indexOf(idKeyword) > -1) &&
        (nameKeyword === '' || name.indexOf(nameKeyword) > -1) &&
        (shortNameKeyword === '' || shortName.indexOf(shortNameKeyword) > -1) &&
        (typeFilter === '' || type === typeFilter) &&
        (statusFilter === '' || status === statusFilter);

      row.style.display = matched ? '' : 'none';
      if (matched) visibleCount++;
    });

    var totalText = '共 ' + visibleCount + ' 个帐号';
    var tableMeta = document.querySelector('#page-dk-account .account-table-meta');
    var paginationInfo = document.querySelector('#page-dk-account .pagination-info');
    if (tableMeta) tableMeta.textContent = totalText;
    if (paginationInfo) paginationInfo.textContent = '共 ' + visibleCount + ' 条';
  }

  // Navigation
  function navigateTo(page) {
    var requestedPage = page;
    if (page === 'scmapping') page = 'smartcode';
    var targetPage = document.getElementById('page-' + page);
    if (!targetPage) {
      console.warn('Page not found:', page);
      showToast('页面不存在：' + page, 'error');
      return;
    }
    // Leave the schedule drawer before switching to another workspace page.
    var scheduleModal = document.getElementById('scheduleModal');
    if (scheduleModal && scheduleModal.classList.contains('active')) {
      closeModal('scheduleModal');
    }
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    // Show target page
    targetPage.classList.add('active');
    document.body.classList.remove('dcc-focus');
    // Update breadcrumb
    const names = {
      'dashboard': '首页',
      'brand': '品牌管理',
      'vehicle': '车系管理',
      'city': '城市管理',
      'region': '品牌区域',
      'store': '门店管理',
      'supplier': '开发者管理',
      'leads': '线索管理',
      'custom-fields': '自定义字段',
      'account': '帐号管理',
      'permission': '权限管理',
      'role': '角色管理',
      'lead-intercept': '拦截规则',
      'schedule': '排期管理',
      'dk-report': '排期管理 / 查看报表',
      'dk-leaddetail': '排期管理 / 线索明细',
      'dk-account': '报表权限',
      'smartcode': 'SmartCode管理',
      'scmapping': 'SmartCode管理 / SmartCode映射',
      'dcc-intent': '培育引擎 / 意向评级配置',
      'dcc-taskgen': '培育引擎 / 线索任务生成',
      'dcc-airoute': '培育引擎 / AI路由分配',
      'dcc-region': '培育引擎 / 地域分配比例',
      'dcc-aioutbound': '培育引擎 / AI外呼路由',
      'dcc-recultivate': '培育引擎 / 二次培育策略',
      'dcc-sla': '培育引擎 / 首呼SLA管理',
      'dcc-humanassign': '培育引擎 / 人工外呼分配',
      'dcc-agent': '培育引擎 / 坐席排班容量',
      'dcc-humanroute': '培育引擎 / 人工客服路由',
      'dcc-review': '培育引擎 / 跟进结果审核',
      'dcc-sea': '培育引擎 / 公海池打捞',
      'dcc-sms': '培育引擎 / 短信企微协同',
      'dcc-storeassign': '培育引擎 / 门店一发三',
      'dcc-qc': '培育引擎 / 看板与质检'
    };
    document.getElementById('currentPageName').textContent = names[page] || page;
    // Update sidebar active state
    document.querySelectorAll('.sidebar-item').forEach(item => item.classList.remove('active'));
    const sidebarPage = {
      'dk-report': 'schedule',
      'dk-leaddetail': 'schedule',
      'scmapping': 'smartcode',
      'lock-rules': 'lock-audit'
    }[requestedPage] || page;
    const isDccPage = sidebarPage.indexOf('dcc-') === 0;
    document.body.classList.toggle('dcc-page', isDccPage);
    document.querySelectorAll('.sidebar-item').forEach(item => {
      if (item.getAttribute('onclick') && item.getAttribute('onclick').includes("'" + sidebarPage + "'")) {
        item.classList.add('active');
      }
    });
    syncDccWorkspaceNav(isDccPage ? sidebarPage : '');
    // 城市管理页面：初始化城市树
    if (page === 'city') {
      initCityTree();
    }
    // 品牌区域页面：初始化区域树
    if (page === 'region') {
      initRegionTree();
    }
    // 开发者管理页面：渲染开发者列表
    if (page === 'supplier') {
      filterSupplierList();
    }
    // 自定义字段页面：默认显示「线索接收字段」TAB
    if (page === 'custom-fields') {
      switchCustomFieldTab('receive');
    }
    // 拦截规则页面：渲染规则列表
    if (page === 'lead-intercept') {
      initInterceptPage();
    }
    // 线索列表页面：初始化列设置
    if (page === 'leads') {
      initColumnSettings();
    }
    // 排期管理页面：初始化排期表格
    if (page === 'schedule') {
      renderScheduleTable();
    }
    // SmartCode管理页面：默认显示维护页签，兼容映射入口
    if (page === 'smartcode') {
      switchSmartCodeTab(requestedPage === 'scmapping' ? 'mapping' : 'maintain');
    }
    // 查看报表页面：初始化报表
    if (page === 'dk-report') {
      initReportPage();
    }
    // 锁单排查页面：渲染锁单列表
    if (page === 'lock-audit' && typeof lockRenderTable === 'function') {
      lockRenderTable();
    }
    // 排查规则配置页面：渲染规则配置
    if (page === 'lock-rules' && typeof lockRenderRules === 'function') {
      lockRenderRules();
    }
  }

  function toggleDccGroup(button) {
    var expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
  }

  const dccPageGroups = {
    'dcc-intent': 'entry', 'dcc-taskgen': 'entry',
    'dcc-airoute': 'ai', 'dcc-region': 'ai', 'dcc-aioutbound': 'ai', 'dcc-recultivate': 'ai',
    'dcc-sla': 'human', 'dcc-humanassign': 'human', 'dcc-agent': 'human', 'dcc-humanroute': 'human', 'dcc-review': 'human',
    'dcc-sea': 'revive', 'dcc-sms': 'revive', 'dcc-storeassign': 'revive',
    'dcc-qc': 'quality'
  };

  const dccGroupDefaults = {
    entry: 'dcc-taskgen', ai: 'dcc-airoute', human: 'dcc-sla', revive: 'dcc-sea', quality: 'dcc-qc'
  };

  function syncDccWorkspaceNav(page) {
    var nav = document.getElementById('dccWorkspaceNav');
    if (!nav) return;
    if (!page) {
      document.querySelectorAll('.dcc-nav-group').forEach(function(button) {
        button.classList.remove('active');
      });
      return;
    }
    var group = dccPageGroups[page] || 'entry';
    nav.dataset.activeGroup = group;
    nav.querySelectorAll('.dcc-group-tabs button').forEach(function(button) {
      button.classList.toggle('active', button.dataset.dccGroup === group);
    });
    document.querySelectorAll('.dcc-nav-group').forEach(function(button) {
      button.classList.toggle('active', button.dataset.dccGroup === group);
    });
    nav.querySelectorAll('.dcc-feature-tabs button').forEach(function(button) {
      button.classList.toggle('active', button.dataset.dccPage === page);
    });
  }

  function selectDccGroup(group) {
    navigateTo(dccGroupDefaults[group] || 'dcc-taskgen');
  }


  function navigateToLeadStatus(status) {
    navigateTo('leads');
    var pageLeads = document.getElementById('page-leads');
    if (!pageLeads) return;
    var statusSelect = pageLeads.querySelector('.filter-item .filter-select');
    if (statusSelect) statusSelect.value = status || '';
    filterClueList();
    document.querySelectorAll('#page-leads .tabs .tab-btn').forEach(function(btn) {
      btn.classList.remove('active');
    });
    var targetTab = null;
    document.querySelectorAll('#page-leads .tabs .tab-btn').forEach(function(btn) {
      var action = btn.getAttribute('onclick') || '';
      if (action.indexOf("'" + status + "'") > -1) targetTab = btn;
    });
    if (targetTab) targetTab.classList.add('active');
    showToast(status === '5' ? '已筛选：仅接收线索' : '已进入线索列表', 'info');
  }

  function navigateToLeadInterceptTab(tab) {
    navigateTo('lead-intercept');
    setTimeout(function() {
      switchInterceptTab(tab || 'rules');
    }, 0);
  }

  function toggleLeadDetailFilters() {
    var panel = document.getElementById('leadDetailFilterMore');
    var btn = document.getElementById('leadDetailFilterToggle');
    if (!panel || !btn) return;
    var collapsed = panel.classList.toggle('is-collapsed');
    btn.innerHTML = collapsed ? '更多筛选 <span>⌄</span>' : '更多筛选&nbsp;&nbsp;<span>收起 ⌃</span>';
  }

  function getLeadDetailAccountRows() {
    var picker = document.getElementById('leadDetailAccountPicker');
    var selected = document.getElementById('leadDetailAccountId');
    var keyword = picker ? picker.value.toLowerCase().trim() : '';
    if (selected && selected.value && keyword.indexOf(selected.value.toLowerCase()) === 0) {
      keyword = '';
    }
    return (typeof dkAccountOptions !== 'undefined' ? dkAccountOptions : []).filter(function(account) {
      if (account.status === '0') return false;
      var haystack = [account.id, account.name, account.shortName, account.group, account.type].join(' ').toLowerCase();
      return !keyword || haystack.indexOf(keyword) > -1;
    });
  }

  function renderLeadDetailAccountDropdown() {
    var dropdown = document.getElementById('leadDetailAccountDropdown');
    if (!dropdown) return;
    var rows = getLeadDetailAccountRows();
    if (!rows.length) {
      dropdown.innerHTML = '<div style="padding: 14px; text-align: center; color: var(--gray-400); font-size: 13px;">未找到匹配帐号</div>';
      dropdown.style.display = 'block';
      return;
    }
    dropdown.innerHTML = rows.map(function(account) {
      return '<button type="button" class="lead-account-option" onclick="selectLeadDetailAccount(\'' + escapeJS(account.id) + '\')">' +
        '<span class="lead-account-option-main">' + escapeHTML(account.id + '｜' + account.name) + '</span>' +
        '<span class="lead-account-option-meta">简称：' + escapeHTML(account.shortName || '-') + '｜' + escapeHTML(account.group || account.type || '-') + '</span>' +
      '</button>';
    }).join('');
    dropdown.style.display = 'block';
  }

  function handleLeadDetailAccountSearch() {
    var selected = document.getElementById('leadDetailAccountId');
    if (selected) selected.value = '';
    renderLeadDetailAccountDropdown();
  }

  function hideLeadDetailAccountDropdown() {
    setTimeout(function() {
      var dropdown = document.getElementById('leadDetailAccountDropdown');
      if (dropdown) dropdown.style.display = 'none';
    }, 160);
  }

  function selectLeadDetailAccount(accountId) {
    var account = (typeof dkAccountOptions !== 'undefined' ? dkAccountOptions : []).find(function(item) {
      return item.id === accountId;
    });
    if (!account) return;
    var selected = document.getElementById('leadDetailAccountId');
    var picker = document.getElementById('leadDetailAccountPicker');
    var dropdown = document.getElementById('leadDetailAccountDropdown');
    if (selected) selected.value = account.id;
    if (picker) picker.value = account.id + '｜' + account.name;
    if (dropdown) dropdown.style.display = 'none';
  }

  // 跳转到车系管理并自动筛选品牌
  function jumpToSeries(brandId, brandName) {
    // 先跳转到车系管理页面
    navigateTo('vehicle');
    // 设置品牌筛选条件
    var brandSelect = document.getElementById('seriesSearchBrand');
    if (brandSelect) {
      brandSelect.value = brandId;
    }
    // 执行筛选
    filterSeriesList();
    // 显示提示
    showToast('已筛选：' + brandName + ' 品牌的车系', 'info');
  }

  // 车系图片上传处理
  function handleSeriesImageUpload(input) {
    if (input.files && input.files[0]) {
      var reader = new FileReader();
      reader.onload = function(e) {
        var preview = document.getElementById('seriesImagePreview');
        var img = document.getElementById('seriesImageImg');
        img.src = e.target.result;
        preview.style.display = 'block';
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  // 移除车系图片
  function removeSeriesImage() {
    var preview = document.getElementById('seriesImagePreview');
    var img = document.getElementById('seriesImageImg');
    img.src = '';
    preview.style.display = 'none';
    // 清空文件输入
    var fileInput = document.querySelector('#vehicleModal input[type="file"]');
    if (fileInput) fileInput.value = '';
  }

  
