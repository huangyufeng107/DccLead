// ========== 自定义字段管理 ==========
  var _customFieldData = [
    // ===== 客户信息 =====
    { id: 1, name: '客户姓名', key: 'customer_name', type: 1, typeName: '文本', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: true, enumValues: [], defaultValue: '', placeholder: '请输入客户姓名', description: '客户姓名', sort: 1, status: 1 },
    { id: 2, name: '手机号', key: 'customer_phone', type: 8, typeName: '手机号', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: true, enumValues: [], defaultValue: '', placeholder: '请输入手机号', description: '手机号', sort: 2, status: 1 },
    { id: 3, name: '性别', key: 'customer_gender', type: 4, typeName: '单选', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: false, enumValues: ['0=未知','1=男','2=女'], defaultValue: '', placeholder: '请选择性别', description: '性别：0=未知 1=男 2=女', sort: 3, status: 1 },
    { id: 4, name: '所在省市区', key: 'province_city_district', type: 7, typeName: '长文本', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: false, enumValues: [], defaultValue: '', placeholder: '请输入省市区', description: '客户所在省市区', sort: 4, status: 1 },

    // ===== 意向信息 =====
    { id: 5, name: '意向品牌', key: 'brand_id', type: 1, typeName: '文本', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: false, enumValues: [], defaultValue: '', placeholder: '请输入意向品牌', description: '意向品牌', sort: 5, status: 1 },
    { id: 6, name: '意向车系', key: 'series_id', type: 1, typeName: '文本', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: false, enumValues: [], defaultValue: '', placeholder: '请输入意向车系', description: '意向车系', sort: 6, status: 1 },
    { id: 7, name: '对比车型', key: 'compare_series_id', type: 5, typeName: '多选', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: false, enumValues: [], defaultValue: '', placeholder: '请选择对比车型', description: '对比车型（客户同时关注的其他车系，非必填）', sort: 7, status: 1 },
    { id: 8, name: '意向门店', key: 'store_id', type: 4, typeName: '单选', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: true, enumValues: [], defaultValue: '', placeholder: '请选择门店', description: '意向门店', sort: 8, status: 1 },

    // ===== 流转信息 =====
    { id: 9, name: '线索等级', key: 'lead_level', type: 4, typeName: '单选', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: false, enumValues: ['A','B','C','D'], defaultValue: '', placeholder: '请选择线索等级', description: '线索等级：A/B/C/D（A为最高意向）', sort: 9, status: 1 },

    // ===== 渠道来源 =====
    { id: 10, name: '来源线索ID', key: 'source_lead_id', type: 1, typeName: '文本', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: true, enumValues: [], defaultValue: '', placeholder: '来源线索ID', description: '来源线索ID（供应商侧唯一标识，用于去重）', sort: 10, status: 1 },
    { id: 11, name: '来源渠道标识', key: 'source_channel', type: 1, typeName: '文本', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: false, enumValues: [], defaultValue: '', placeholder: '如：dongchedi_form', description: '来源渠道标识（如：dongchedi_form）', sort: 11, status: 1 },
    { id: 12, name: 'API Key', key: 'api_key', type: 1, typeName: '文本', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: true, enumValues: [], defaultValue: '', placeholder: '请输入 API Key', description: '来源渠道的 API Key（VARCHAR(64)，用于 OpenAPI 推送签名校验时记录本次调用使用的Key）', sort: 12, status: 1 },

    // ===== 购车偏好 =====
    { id: 13, name: '预算范围', key: 'budget_min_max', type: 2, typeName: '数字', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: false, enumValues: [], defaultValue: '', placeholder: '万元，精确2位小数', description: '预算范围（万元，精确2位小数）', sort: 13, status: 1 },
    { id: 14, name: '购车时间', key: 'purchase_timeline', type: 4, typeName: '单选', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: false, enumValues: ['1=一月内','2=二至三月','3=三月以上'], defaultValue: '', placeholder: '请选择购车时间', description: '购车时间：1=一月内 2=二至三月 3=三月以上', sort: 14, status: 1 },
    { id: 15, name: '购车用途', key: 'purchase_purpose', type: 4, typeName: '单选', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: false, enumValues: ['家用','商务','网约车等'], defaultValue: '', placeholder: '请选择购车用途', description: '购车用途（如：家用/商务/网约车等）', sort: 15, status: 1 },
    { id: 16, name: '颜色偏好', key: 'color_preference', type: 4, typeName: '单选', scope: 'global', scopeName: '全局', brandCode: '', brandName: '', supplierCode: '', supplierName: '', required: false, enumValues: ['黑色','白色','蓝色等'], defaultValue: '', placeholder: '请选择颜色偏好', description: '颜色偏好（如：黑色/白色/蓝色等）', sort: 16, status: 1 },

    // ===== 品牌专属公共接收字段 =====
    { id: 17, name: '试驾意向', key: 'test_drive_intent', type: 4, typeName: '单选', scope: 'brand', scopeName: '品牌字段', brandCode: 'LIXIANG', brandName: '理想', supplierCode: '', supplierName: '', required: false, enumValues: ['有意试驾','暂无计划','已试驾'], defaultValue: '', placeholder: '请选择试驾意向', description: '理想品牌公共线索接收字段', sort: 17, status: 1 },
    { id: 18, name: '置换需求', key: 'trade_in_need', type: 4, typeName: '单选', scope: 'brand', scopeName: '品牌字段', brandCode: 'LIXIANG', brandName: '理想', supplierCode: '', supplierName: '', required: false, enumValues: ['有旧车需置换','无置换需求'], defaultValue: '', placeholder: '请选择置换需求', description: '理想品牌公共线索接收字段', sort: 18, status: 1 },
    { id: 19, name: '到店意向', key: 'store_visit_intent', type: 4, typeName: '单选', scope: 'brand', scopeName: '品牌字段', brandCode: 'WENJIE', brandName: '问界', supplierCode: '', supplierName: '', required: true, enumValues: ['本周可到店','本月可到店','暂无计划'], defaultValue: '', placeholder: '请选择到店意向', description: '问界品牌公共线索接收字段', sort: 19, status: 1 },
    { id: 20, name: '关注配置', key: 'concerned_features', type: 5, typeName: '多选', scope: 'brand', scopeName: '品牌字段', brandCode: 'XIAOPENG', brandName: '小鹏', supplierCode: '', supplierName: '', required: false, enumValues: ['天窗','真皮座椅','智能驾驶','音响系统','座椅加热'], defaultValue: '', placeholder: '请选择关注的配置', description: '小鹏品牌公共线索接收字段', sort: 20, status: 1 },

    // ===== 东风日产品牌专属字段 =====
    { id: 21, name: '金融方案意向', key: 'finance_plan_intent', type: 4, typeName: '单选', scope: 'brand', scopeName: '品牌字段', brandCode: 'DONGFENG_NISSAN', brandName: '东风日产', supplierCode: '', supplierName: '', required: false, enumValues: ['0首付','低息分期','全款'], defaultValue: '', placeholder: '请选择金融方案意向', description: '东风日产品牌线索接收字段', sort: 21, status: 1 },
    { id: 22, name: '旧车评估需求', key: 'used_car_appraisal', type: 4, typeName: '单选', scope: 'brand', scopeName: '品牌字段', brandCode: 'DONGFENG_NISSAN', brandName: '东风日产', supplierCode: '', supplierName: '', required: false, enumValues: ['需要评估','暂不需要','已有报价'], defaultValue: '', placeholder: '请选择旧车评估需求', description: '东风日产品牌线索接收字段', sort: 22, status: 1 },
    { id: 23, name: '意向排量', key: 'displacement_pref', type: 4, typeName: '单选', scope: 'brand', scopeName: '品牌字段', brandCode: 'DONGFENG_NISSAN', brandName: '东风日产', supplierCode: '', supplierName: '', required: false, enumValues: ['1.6L','2.0L','2.0T','2.5L'], defaultValue: '', placeholder: '请选择意向排量', description: '东风日产品牌线索接收字段', sort: 23, status: 1 }
  ];

  var _currentEditingFieldId = null;
  var _fieldTypeEnumValues = [];
  var _fieldTypeMap = { 1:'文本', 2:'数字', 3:'日期', 4:'单选', 5:'多选', 6:'图片', 7:'长文本', 8:'手机号' };
  var _fieldScopeMap = { global:'公共字段', brand:'品牌字段' };

  // 切换自定义字段TAB（线索接收 / 线索下发）
  function switchCustomFieldTab(tab) {
    var tabsContainer = document.getElementById('customFieldTabs');
    if (tabsContainer) {
      tabsContainer.querySelectorAll('.tab-btn').forEach(function(btn) { btn.classList.remove('active'); });
    }
    // 激活对应tab按钮
    document.querySelectorAll('#customFieldTabs .tab-btn').forEach(function(btn) {
      var onclick = btn.getAttribute('onclick') || '';
      if (onclick.indexOf("'" + tab + "'") > -1) btn.classList.add('active');
    });

    // 切换面板
    var receivePanel = document.getElementById('customFieldPanel-receive');
    var dispatchPanel = document.getElementById('customFieldPanel-dispatch');
    if (tab === 'receive') {
      if (receivePanel) receivePanel.style.display = '';
      if (dispatchPanel) dispatchPanel.style.display = 'none';
      renderFieldTable();
      renderFieldPreview();
    } else if (tab === 'dispatch') {
      if (receivePanel) receivePanel.style.display = 'none';
      if (dispatchPanel) dispatchPanel.style.display = '';
      renderDispatchEndpointCard();
      renderDispatchFieldTable();
    }
  }

  // ========== 线索下发接口与字段映射 ==========
  var _currentEditingDispatchId = null;
  var _editingEnumValueMap = {};
  var _dispatchMappingTypeMap = { 1: '直接映射', 2: '固定值', 3: '枚举值映射' };
  var _brandNameMap = { 'LIXIANG': '理想', 'WENJIE': '问界', 'XIAOPENG': '小鹏', 'BYD': '比亚迪', 'DONGFENG_NISSAN': '东风日产' };

  // 品牌下发接口通道配置数据
  var _brandEndpointConfigs = {
    'DONGFENG_NISSAN': {
      status: 1, // 1: 启用, 0: 停用
      env: 'prod',
      url: 'https://crm-gateway.dongfeng-nissan.com/openapi/v2/leads/collect',
      method: 'POST',
      contentType: 'application/json',
      authType: 'hmac',
      hmacAppKey: 'DFN_NISSAN_PROD_8801',
      hmacAppSecret: 'dfn_sec_8849b2910fa34e',
      timeout: 5000,
      retryTimes: 3,
      retryInterval: '1m, 5m, 15m (指数退避)',
      successCondition: 'code == 0 || success == true',
      returnLeadIdPath: 'data.external_lead_id',
      todayPush: 186,
      successRate: '99.5%',
      avgLatency: '118ms'
    },
    'LIXIANG': {
      status: 1,
      env: 'prod',
      url: 'https://api.lixiang.com/gateway/lead/v1/sync',
      method: 'POST',
      contentType: 'application/json',
      authType: 'oauth2',
      oauthTokenUrl: 'https://auth.lixiang.com/oauth2/token',
      oauthClientId: 'lx_dklinks_client',
      oauthClientSecret: 'lx_sec_991823719',
      timeout: 3000,
      retryTimes: 3,
      retryInterval: '1m, 5m, 15m (指数退避)',
      successCondition: 'status == 200',
      returnLeadIdPath: 'data.lead_id',
      todayPush: 320,
      successRate: '99.8%',
      avgLatency: '96ms'
    },
    'WENJIE': {
      status: 1,
      env: 'prod',
      url: 'https://open-crm.seres.cn/api/leads/push',
      method: 'POST',
      contentType: 'application/json',
      authType: 'apikey',
      apiKeyHeader: 'X-Api-Key',
      apiKeyValue: 'seres_ito_sec_9918204a',
      timeout: 5000,
      retryTimes: 3,
      retryInterval: '1m, 5m, 15m (指数退避)',
      successCondition: 'code == 200',
      returnLeadIdPath: 'data.clueId',
      todayPush: 95,
      successRate: '100%',
      avgLatency: '135ms'
    },
    'XIAOPENG': {
      status: 1,
      env: 'prod',
      url: 'https://openapi.xiaopeng.com/crm/leads/import',
      method: 'POST',
      contentType: 'application/json',
      authType: 'apikey',
      apiKeyHeader: 'Authorization',
      apiKeyValue: 'Bearer xp_token_live_7720bc',
      timeout: 3000,
      retryTimes: 3,
      retryInterval: '1m, 5m, 15m (指数退避)',
      successCondition: 'code == 0',
      returnLeadIdPath: 'result.lead_code',
      todayPush: 78,
      successRate: '98.7%',
      avgLatency: '142ms'
    },
    'BYD': {
      status: 0,
      env: 'test',
      url: 'https://test-openapi.byd.com/crm/lead/receive',
      method: 'POST',
      contentType: 'application/json',
      authType: 'hmac',
      hmacAppKey: 'BYD_TEST_APP_009',
      hmacAppSecret: 'byd_sec_test_9921',
      timeout: 5000,
      retryTimes: 3,
      retryInterval: '1m, 5m, 15m (指数退避)',
      successCondition: 'errcode == 0',
      returnLeadIdPath: 'data.oppor_id',
      todayPush: 0,
      successRate: '-',
      avgLatency: '-'
    }
  };

  // Mock: 下发字段映射数据
  var _dispatchFieldMappings = [
    { id: 1, brandCode: 'LIXIANG', sourceKey: 'customer_name', sourceName: '客户姓名', targetName: 'name', mappingType: 1, required: true, fixedValue: '', sort: 1, status: 1, remark: '' },
    { id: 2, brandCode: 'LIXIANG', sourceKey: 'customer_phone', sourceName: '手机号', targetName: 'phone', mappingType: 1, required: true, fixedValue: '', sort: 2, status: 1, remark: '' },
    { id: 3, brandCode: 'LIXIANG', sourceKey: 'store_id', sourceName: '意向门店', targetName: 'dealer_code', mappingType: 1, required: true, fixedValue: '', sort: 3, status: 1, remark: '' },
    { id: 4, brandCode: 'LIXIANG', sourceKey: 'brand_id', sourceName: '意向品牌', targetName: 'brand', mappingType: 2, required: false, fixedValue: '理想', sort: 4, status: 1, remark: '固定为理想品牌' },
    { id: 5, brandCode: 'LIXIANG', sourceKey: 'lead_level', sourceName: '意向等级', targetName: 'lead_level', mappingType: 3, required: false, fixedValue: '', enumValueMap: {"A":"H","B":"A","C":"B","D":"C"}, sort: 5, status: 1, remark: '理想等级映射: A→H, B→A, C→B, D→C' },
    { id: 6, brandCode: 'LIXIANG', sourceKey: 'customer_gender', sourceName: '性别', targetName: 'gender', mappingType: 3, required: false, fixedValue: '', enumValueMap: {"0":"U","1":"M","2":"F"}, sort: 6, status: 1, remark: '0=未知→U, 1=男→M, 2=女→F' },
    { id: 7, brandCode: 'WENJIE', sourceKey: 'customer_name', sourceName: '客户姓名', targetName: 'customer_name', mappingType: 1, required: true, fixedValue: '', sort: 1, status: 1, remark: '' },
    { id: 8, brandCode: 'WENJIE', sourceKey: 'customer_phone', sourceName: '手机号', targetName: 'customer_phone', mappingType: 1, required: true, fixedValue: '', sort: 2, status: 1, remark: '' },
    { id: 9, brandCode: 'WENJIE', sourceKey: 'store_id', sourceName: '意向门店', targetName: 'store_code', mappingType: 1, required: true, fixedValue: '', sort: 3, status: 1, remark: '' },
    { id: 10, brandCode: 'XIAOPENG', sourceKey: 'customer_name', sourceName: '客户姓名', targetName: 'user_name', mappingType: 1, required: true, fixedValue: '', sort: 1, status: 1, remark: '' },
    { id: 11, brandCode: 'XIAOPENG', sourceKey: 'customer_phone', sourceName: '手机号', targetName: 'user_phone', mappingType: 1, required: true, fixedValue: '', sort: 2, status: 1, remark: '' },
    // ===== 东风日产下发字段映射 =====
    { id: 12, brandCode: 'DONGFENG_NISSAN', sourceKey: 'customer_name', sourceName: '客户姓名', targetName: 'cust_name', mappingType: 1, required: true, fixedValue: '', sort: 1, status: 1, remark: '客户真实姓名' },
    { id: 13, brandCode: 'DONGFENG_NISSAN', sourceKey: 'customer_phone', sourceName: '手机号', targetName: 'mobile', mappingType: 1, required: true, fixedValue: '', sort: 2, status: 1, remark: '客户有效手机号' },
    { id: 14, brandCode: 'DONGFENG_NISSAN', sourceKey: 'store_id', sourceName: '意向门店', targetName: 'dealer_code', mappingType: 1, required: true, fixedValue: '', sort: 3, status: 1, remark: '东风日产专营店编码' },
    { id: 15, brandCode: 'DONGFENG_NISSAN', sourceKey: 'brand_id', sourceName: '意向品牌', targetName: 'brand_name', mappingType: 2, required: false, fixedValue: '东风日产', sort: 4, status: 1, remark: '固定传东风日产' },
    { id: 16, brandCode: 'DONGFENG_NISSAN', sourceKey: 'series_id', sourceName: '意向车系', targetName: 'car_model_code', mappingType: 1, required: false, fixedValue: '', sort: 5, status: 1, remark: '日产车系识别码' },
    { id: 17, brandCode: 'DONGFENG_NISSAN', sourceKey: 'lead_level', sourceName: '意向等级', targetName: 'clue_level', mappingType: 3, required: false, fixedValue: '', enumValueMap: {"A":"H","B":"A","C":"B","D":"C"}, sort: 6, status: 1, remark: '日产等级映射: A→H, B→A, C→B, D→C' },
    { id: 18, brandCode: 'DONGFENG_NISSAN', sourceKey: 'finance_plan_intent', sourceName: '金融方案意向', targetName: 'finance_need', mappingType: 1, required: false, fixedValue: '', sort: 7, status: 1, remark: '购车金融意向' },
    { id: 19, brandCode: 'DONGFENG_NISSAN', sourceKey: 'used_car_appraisal', sourceName: '旧车评估需求', targetName: 'trade_in_flag', mappingType: 1, required: false, fixedValue: '', sort: 8, status: 1, remark: '二手车置换需求' }
  ];

  // 品牌变更
  function onDispatchBrandChange() {
    var code = document.getElementById('dispatchBrandFilter').value;
    var addBtn = document.getElementById('dispatchAddBtn');
    var descEl = document.getElementById('dispatchBrandDesc');
    if (!code) {
      if (addBtn) addBtn.disabled = true;
      if (descEl) descEl.textContent = '';
      var endpointCard = document.getElementById('dispatchEndpointCard');
      if (endpointCard) endpointCard.style.display = 'none';
      var tbody = document.getElementById('dispatchFieldTableBody');
      if (tbody) { tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 48px 0; color: var(--gray-400);"><div style="font-size: 14px; margin-bottom: 4px;">请先选择目标品牌</div><div style="font-size: 12px;">选择品牌后查看和配置该品牌的下发字段映射关系</div></td></tr>'; }
      return;
    }
    if (addBtn) addBtn.disabled = false;
    if (descEl) descEl.textContent = '当前配置品牌「'+ (_brandNameMap[code] || code) +'」的下发接口与字段映射';
    renderDispatchEndpointCard();
    renderDispatchFieldTable();
  }

  // 渲染下发字段映射表格
  function renderDispatchFieldTable() {
    var tbody = document.getElementById('dispatchFieldTableBody');
    if (!tbody) return;
    var code = document.getElementById('dispatchBrandFilter').value;
    if (!code) return;

    var mappings = _dispatchFieldMappings.filter(function(m) { return m.brandCode === code; });
    mappings.sort(function(a, b) { return a.sort - b.sort; });

    if (mappings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 48px 0; color: var(--gray-400);"><div style="font-size: 14px; margin-bottom: 4px;">暂无下发字段映射</div><div style="font-size: 12px;">点击「新增映射」配置该品牌的下发字段</div></td></tr>';
      return;
    }

    var html = '';
    mappings.forEach(function(m) {
      var mappingBadgeClass = m.mappingType === 1 ? 'status-active' : m.mappingType === 3 ? 'status-primary' : 'status-warning';
      var mappingTypeText = _dispatchMappingTypeMap[m.mappingType] || '未知';
      if (m.mappingType === 2) mappingTypeText = '固定值: ' + (m.fixedValue || '-');
      if (m.mappingType === 3 && m.enumValueMap) {
        var pairs = [];
        for (var k in m.enumValueMap) { pairs.push(k + '→' + m.enumValueMap[k]); }
        mappingTypeText = '枚举映射: ' + pairs.join(', ');
      }
      var statusBadgeClass = m.status === 1 ? 'status-active' : 'status-danger';
      var statusText = m.status === 1 ? '启用' : '停用';
      var requiredText = m.required ? '<span style="color: var(--danger); font-weight: 600;">必填</span>' : '选填';

      html += '<tr>';
      html += '<td>' + m.sort + '</td>';
      html += '<td><strong>' + escapeHTML(m.sourceName) + '</strong></td>';
      html += '<td><code style="font-size: 12px;">' + escapeHTML(m.sourceKey) + '</code></td>';
      html += '<td><code style="font-size: 12px;">' + escapeHTML(m.targetName) + '</code></td>';
      html += '<td><span class="status-badge ' + mappingBadgeClass + '">' + escapeHTML(mappingTypeText) + '</span></td>';
      html += '<td>' + requiredText + '</td>';
      html += '<td><span class="status-badge ' + statusBadgeClass + '" style="cursor: pointer;" onclick="toggleDispatchMappingStatus(' + m.id + ')" title="点击切换">' + statusText + '</span></td>';
      html += '<td>';
      html += '<button class="btn btn-secondary btn-sm" onclick="openDispatchFieldModal(' + m.id + ')" style="margin-right: 4px;">编辑</button>';
      html += '<button class="btn btn-danger btn-sm" onclick="deleteDispatchMapping(' + m.id + ')">删除</button>';
      html += '</td>';
      html += '</tr>';
    });
    tbody.innerHTML = html;
  }

  // 打开下发字段映射弹窗
  function openDispatchFieldModal(id) {
    var code = document.getElementById('dispatchBrandFilter').value;
    if (!code && !id) { showToast('请先选择目标品牌', 'warning'); return; }

    _currentEditingDispatchId = id || null;

    // 填充源字段下拉（从 _customFieldData）
    var sourceSel = document.getElementById('dispatchSourceField');
    sourceSel.innerHTML = '<option value="">请选择来源字段</option>';
    _customFieldData.forEach(function(f) {
      var opt = document.createElement('option');
      opt.value = f.key;
      opt.textContent = f.name + ' (' + f.key + ')';
      sourceSel.appendChild(opt);
    });

    if (id) {
      var mapping = _dispatchFieldMappings.find(function(m) { return m.id === id; });
      if (!mapping) { showToast('未找到该映射', 'error'); return; }
      document.getElementById('dispatchFieldModalTitle').textContent = '编辑下发字段映射';
      document.getElementById('dispatchBrandFilter').value = mapping.brandCode || code;
      document.getElementById('dispatchSourceField').value = mapping.sourceKey || '';
      document.getElementById('dispatchTargetName').value = mapping.targetName || '';
      document.getElementById('dispatchMappingType').value = String(mapping.mappingType || 1);
      document.getElementById('dispatchRequired').checked = !!mapping.required;
      document.getElementById('dispatchFixedValue').value = mapping.fixedValue || '';
      document.getElementById('dispatchSort').value = mapping.sort || 1;
      document.getElementById('dispatchRemark').value = mapping.remark || '';
      // 暂存枚举值映射供 onDispatchSourceFieldChange 使用
      _editingEnumValueMap = mapping.enumValueMap || {};
    } else {
      document.getElementById('dispatchFieldModalTitle').textContent = '新增下发字段映射';
      document.getElementById('dispatchSourceField').value = '';
      document.getElementById('dispatchTargetName').value = '';
      document.getElementById('dispatchMappingType').value = '1';
      document.getElementById('dispatchRequired').checked = false;
      document.getElementById('dispatchFixedValue').value = '';
      document.getElementById('dispatchSort').value = _dispatchFieldMappings.filter(function(m) { return m.brandCode === code; }).length + 1;
      document.getElementById('dispatchRemark').value = '';
      _editingEnumValueMap = {};
    }
    onDispatchMappingTypeChange();
    openModal('dispatchFieldModal');
  }

  // 关闭下发字段映射弹窗
  function closeDispatchFieldModal() {
    closeModal('dispatchFieldModal');
    _currentEditingDispatchId = null;
  }

  // 映射方式变化
  function onDispatchMappingTypeChange() {
    var type = document.getElementById('dispatchMappingType').value;
    document.getElementById('dispatchFixedValueGroup').style.display = type === '2' ? '' : 'none';
    // 枚举值映射区域
    var enumGroup = document.getElementById('dispatchEnumMapGroup');
    if (type === '3') {
      enumGroup.style.display = '';
      onDispatchSourceFieldChange(); // 加载当前源字段的枚举值
    } else {
      enumGroup.style.display = 'none';
    }
  }

  // 解析枚举值列表（兼容 'A','B' 和 '1=男','2=女' 两种格式）
  function parseEnumValues(enumArr) {
    if (!enumArr || !enumArr.length) return [];
    return enumArr.map(function(v) {
      var idx = v.indexOf('=');
      if (idx > -1) {
        return { label: v.substring(idx + 1), value: v.substring(0, idx) };
      }
      return { label: v, value: v };
    });
  }

  // 源字段变化时重新渲染枚举值映射行
  function onDispatchSourceFieldChange() {
    var type = document.getElementById('dispatchMappingType').value;
    if (type !== '3') return; // 仅枚举值映射模式处理

    var sourceKey = document.getElementById('dispatchSourceField').value;
    var tbody = document.getElementById('dispatchEnumMapBody');
    if (!sourceKey) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 24px; color: var(--gray-400); font-size: 13px;">请先选择含枚举值的源字段</td></tr>';
      return;
    }

    var sourceField = _customFieldData.find(function(f) { return f.key === sourceKey; });
    if (!sourceField || !sourceField.enumValues || !sourceField.enumValues.length) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; padding: 24px; color: var(--gray-400); font-size: 13px;">该源字段没有枚举值，请选择单选/多选类型字段</td></tr>';
      return;
    }

    var enumItems = parseEnumValues(sourceField.enumValues);

    // 编辑模式：读取已有的枚举值映射
    var existingMap = {};
    if (_currentEditingDispatchId) {
      var existing = _dispatchFieldMappings.find(function(m) { return m.id === _currentEditingDispatchId; });
      if (existing && existing.enumValueMap) existingMap = existing.enumValueMap;
    }

    var html = '';
    enumItems.forEach(function(item, idx) {
      var targetVal = existingMap[item.value] || '';
      html += '<tr>';
      html += '<td><code style="font-size: 13px;">' + escapeHTML(item.value) + '</code> <span style="color: var(--gray-500); font-size: 12px;">(' + escapeHTML(item.label) + ')</span></td>';
      html += '<td style="text-align: center; color: var(--gray-400);">→</td>';
      html += '<td><input type="text" class="form-input" data-enum-source="' + escapeHTML(item.value) + '" value="' + escapeHTML(targetVal) + '" placeholder="留空则原样下发" style="font-size: 13px; padding: 6px 10px;"></td>';
      html += '</tr>';
    });
    tbody.innerHTML = html;
  }

  // 提交下发字段映射
  function handleDispatchFieldSubmit() {
    var code = document.getElementById('dispatchBrandFilter').value;
    var sourceKey = document.getElementById('dispatchSourceField').value.trim();
    var targetName = document.getElementById('dispatchTargetName').value.trim();
    var mappingType = parseInt(document.getElementById('dispatchMappingType').value);
    var required = document.getElementById('dispatchRequired').checked;
    var fixedValue = document.getElementById('dispatchFixedValue').value.trim();
    var sort = parseInt(document.getElementById('dispatchSort').value) || 1;
    var remark = document.getElementById('dispatchRemark').value.trim();

    if (!code) { showToast('请输入目标品牌', 'error'); return; }
    if (!sourceKey) { showToast('请选择源字段', 'error'); return; }
    if (!targetName) { showToast('请输入目标字段名', 'error'); return; }
    if (mappingType === 2 && !fixedValue) { showToast('请输入固定值', 'error'); return; }

    // 收集枚举值映射
    var enumValueMap = {};
    if (mappingType === 3) {
      var enumInputs = document.querySelectorAll('#dispatchEnumMapBody input[data-enum-source]');
      enumInputs.forEach(function(input) {
        var sourceVal = input.getAttribute('data-enum-source');
        var targetVal = input.value.trim();
        if (targetVal) enumValueMap[sourceVal] = targetVal;
      });
    }

    // 获取源字段信息
    var sourceField = _customFieldData.find(function(f) { return f.key === sourceKey; });
    var sourceName = sourceField ? sourceField.name : sourceKey;

    if (_currentEditingDispatchId) {
      var mapping = _dispatchFieldMappings.find(function(m) { return m.id === _currentEditingDispatchId; });
      if (!mapping) { showToast('未找到该映射', 'error'); return; }
      mapping.brandCode = code;
      mapping.sourceKey = sourceKey;
      mapping.sourceName = sourceName;
      mapping.targetName = targetName;
      mapping.mappingType = mappingType;
      mapping.required = required;
      mapping.fixedValue = fixedValue;
      mapping.enumValueMap = enumValueMap;
      mapping.sort = sort;
      mapping.remark = remark;
      showToast('映射已更新', 'success');
    } else {
      // 检查是否已存在相同 sourceKey 的映射
      var exists = _dispatchFieldMappings.find(function(m) { return m.brandCode === code && m.sourceKey === sourceKey; });
      if (exists) { showToast('该品牌下已存在相同源字段的映射', 'warning'); return; }

      var newId = _dispatchFieldMappings.length > 0 ? Math.max.apply(null, _dispatchFieldMappings.map(function(m) { return m.id; })) + 1 : 1;
      _dispatchFieldMappings.push({
        id: newId, brandCode: code, sourceKey: sourceKey, sourceName: sourceName,
        targetName: targetName, mappingType: mappingType, required: required,
        fixedValue: fixedValue, enumValueMap: enumValueMap, sort: sort, status: 1, remark: remark
      });
      showToast('映射已添加', 'success');
    }

    closeDispatchFieldModal();
    renderDispatchFieldTable();
  }

  // 删除下发字段映射
  function deleteDispatchMapping(id) {
    id = Number(id);
    var idx = -1;
    for (var i = 0; i < _dispatchFieldMappings.length; i++) {
      if (_dispatchFieldMappings[i].id === id) { idx = i; break; }
    }
    if (idx === -1) return;
    var mapping = _dispatchFieldMappings[idx];
    if (!confirm('确定要删除字段「' + mapping.sourceName + '」吗？删除后不可恢复，已推送的线索数据中该字段值将保留。')) return;
    _dispatchFieldMappings.splice(idx, 1);
    showToast('映射已删除', 'success');
    renderDispatchFieldTable();
  }

  // 切换映射状态
  function toggleDispatchMappingStatus(id) {
    var mapping = _dispatchFieldMappings.find(function(m) { return m.id === id; });
    if (!mapping) return;
    mapping.status = mapping.status === 1 ? 0 : 1;
    renderDispatchFieldTable();
    showToast('映射已' + (mapping.status === 1 ? '启用' : '停用'), 'success');
  }

  // ========== 品牌下发接口通道配置与联调 ==========

  // 渲染下发接口配置卡片
  function renderDispatchEndpointCard() {
    var card = document.getElementById('dispatchEndpointCard');
    if (!card) return;
    var code = document.getElementById('dispatchBrandFilter').value;
    var btnNissan = document.getElementById('btnNissanTechSpec');
    if (!code) {
      card.style.display = 'none';
      if (btnNissan) btnNissan.style.display = 'none';
      return;
    }

    var config = _brandEndpointConfigs[code];
    if (!config) {
      config = {
        status: 0,
        env: 'prod',
        url: '',
        method: 'POST',
        contentType: 'application/json',
        authType: 'none',
        timeout: 5000,
        retryTimes: 3,
        retryInterval: '1m, 5m, 15m (指数退避)',
        successCondition: 'code == 0 || success == true',
        returnLeadIdPath: 'data.external_lead_id',
        todayPush: 0,
        successRate: '-',
        avgLatency: '-'
      };
      _brandEndpointConfigs[code] = config;
    }

    card.style.display = '';

    // 仅在目标品牌为东风日产时展示【研发对照技术方案】按钮
    var isNissan = (code === 'DONGFENG_NISSAN');
    if (btnNissan) {
      btnNissan.style.display = isNissan ? 'inline-flex' : 'none';
    }

    // 环境徽标
    var envBadge = document.getElementById('dispatchEndpointEnvBadge');
    if (envBadge) {
      if (config.env === 'test') {
        envBadge.className = 'status-badge status-warning';
        envBadge.textContent = '测试沙箱';
      } else {
        envBadge.className = 'status-badge status-primary';
        envBadge.textContent = '生产环境';
      }
    }

    // 状态徽标
    var statusBadge = document.getElementById('dispatchEndpointStatusBadge');
    if (statusBadge) {
      if (config.status === 1) {
        statusBadge.className = 'status-badge status-active';
        statusBadge.textContent = '推送通道已启用';
      } else {
        statusBadge.className = 'status-badge status-danger';
        statusBadge.textContent = '推送通道已停用';
      }
    }

    // 请求方式与URL
    var methodEl = document.getElementById('dispatchEndpointMethod');
    if (methodEl) methodEl.textContent = config.method || 'POST';

    var urlEl = document.getElementById('dispatchEndpointUrl');
    if (urlEl) {
      urlEl.textContent = config.url || '暂未配置接口地址，点击右上方「配置接口通道」设置';
      urlEl.style.color = config.url ? 'var(--primary-container)' : 'var(--gray-400)';
    }

    // 鉴权描述
    var authEl = document.getElementById('dispatchEndpointAuth');
    if (authEl) {
      if (config.authType === 'hmac') {
        authEl.textContent = 'HMAC-SHA256 签名 (AppKey: ' + (config.hmacAppKey || '-') + ')';
      } else if (config.authType === 'apikey') {
        authEl.textContent = 'API Key (' + (config.apiKeyHeader || 'Header') + ')';
      } else if (config.authType === 'oauth2') {
        authEl.textContent = 'OAuth 2.0 (Client: ' + (config.oauthClientId || '-') + ')';
      } else {
        authEl.textContent = '无鉴权 (内网白名单直连)';
      }
    }

    // 重试策略
    var retryEl = document.getElementById('dispatchEndpointRetry');
    if (retryEl) {
      retryEl.textContent = '超时 ' + (config.timeout || 5000) + 'ms · 失败重试 ' + (config.retryTimes || 0) + ' 次 (' + (config.retryInterval || '指数退避') + ')';
    }

    // 响应判定与回填
    var cbEl = document.getElementById('dispatchEndpointCallback');
    if (cbEl) {
      cbEl.textContent = '判定: ' + (config.successCondition || '-') + ' | 回填: ' + (config.returnLeadIdPath || '-');
    }

    // 今日统计
    var pushEl = document.getElementById('dispatchEndpointTodayPush');
    if (pushEl) pushEl.textContent = config.todayPush !== undefined ? config.todayPush + ' 条' : '-';
    var rateEl = document.getElementById('dispatchEndpointSuccessRate');
    if (rateEl) rateEl.textContent = config.successRate || '-';
    var latEl = document.getElementById('dispatchEndpointAvgLatency');
    if (latEl) latEl.textContent = config.avgLatency || '-';
  }

  // 打开下发接口配置弹窗
  function openDispatchEndpointModal() {
    var code = document.getElementById('dispatchBrandFilter').value;
    if (!code) { showToast('请先选择目标品牌', 'warning'); return; }

    var config = _brandEndpointConfigs[code] || {};
    var brandName = _brandNameMap[code] || code;

    document.getElementById('endpointModalBrandName').textContent = brandName;
    document.getElementById('endpointModalBrandCode').textContent = code;
    document.getElementById('endpointModalStatus').checked = config.status !== 0;
    document.getElementById('endpointModalEnv').value = config.env || 'prod';
    
    var methodVal = (config.method || 'POST') + '|' + (config.contentType || 'application/json');
    document.getElementById('endpointModalMethod').value = methodVal;
    document.getElementById('endpointModalUrl').value = config.url || '';
    document.getElementById('endpointModalAuthType').value = config.authType || 'hmac';
    
    document.getElementById('endpointHmacAppKey').value = config.hmacAppKey || '';
    document.getElementById('endpointHmacAppSecret').value = config.hmacAppSecret || '';
    document.getElementById('endpointApiKeyHeader').value = config.apiKeyHeader || 'Authorization';
    document.getElementById('endpointApiKeyValue').value = config.apiKeyValue || '';
    document.getElementById('endpointOAuthTokenUrl').value = config.oauthTokenUrl || '';
    document.getElementById('endpointOAuthClientId').value = config.oauthClientId || '';
    document.getElementById('endpointOAuthClientSecret').value = config.oauthClientSecret || '';
    
    document.getElementById('endpointModalTimeout').value = config.timeout || 5000;
    document.getElementById('endpointModalRetry').value = String(config.retryTimes !== undefined ? config.retryTimes : 3);
    document.getElementById('endpointModalSuccessCond').value = config.successCondition || 'code == 0 || success == true';
    document.getElementById('endpointModalReturnPath').value = config.returnLeadIdPath || 'data.external_lead_id';

    onEndpointAuthTypeChange();
    openModal('dispatchEndpointModal');
  }

  // 鉴权协议切换
  function onEndpointAuthTypeChange() {
    var type = document.getElementById('endpointModalAuthType').value;
    document.getElementById('endpointAuthHmacGroup').style.display = type === 'hmac' ? 'grid' : 'none';
    document.getElementById('endpointAuthApiKeyGroup').style.display = type === 'apikey' ? 'grid' : 'none';
    document.getElementById('endpointAuthOAuthGroup').style.display = type === 'oauth2' ? 'block' : 'none';
  }

  // 保存接口配置
  function saveDispatchEndpointConfig() {
    var code = document.getElementById('dispatchBrandFilter').value;
    if (!code) return;

    var url = document.getElementById('endpointModalUrl').value.trim();
    if (!url) {
      showToast('请输入接收接口地址 (URL)', 'error');
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      showToast('接口地址必须以 http:// 或 https:// 开头', 'error');
      return;
    }

    var methodParts = document.getElementById('endpointModalMethod').value.split('|');
    var method = methodParts[0] || 'POST';
    var contentType = methodParts[1] || 'application/json';

    var authType = document.getElementById('endpointModalAuthType').value;
    var config = _brandEndpointConfigs[code] || {};

    config.status = document.getElementById('endpointModalStatus').checked ? 1 : 0;
    config.env = document.getElementById('endpointModalEnv').value;
    config.url = url;
    config.method = method;
    config.contentType = contentType;
    config.authType = authType;

    if (authType === 'hmac') {
      config.hmacAppKey = document.getElementById('endpointHmacAppKey').value.trim();
      config.hmacAppSecret = document.getElementById('endpointHmacAppSecret').value.trim();
    } else if (authType === 'apikey') {
      config.apiKeyHeader = document.getElementById('endpointApiKeyHeader').value.trim();
      config.apiKeyValue = document.getElementById('endpointApiKeyValue').value.trim();
    } else if (authType === 'oauth2') {
      config.oauthTokenUrl = document.getElementById('endpointOAuthTokenUrl').value.trim();
      config.oauthClientId = document.getElementById('endpointOAuthClientId').value.trim();
      config.oauthClientSecret = document.getElementById('endpointOAuthClientSecret').value.trim();
    }

    config.timeout = parseInt(document.getElementById('endpointModalTimeout').value) || 5000;
    config.retryTimes = parseInt(document.getElementById('endpointModalRetry').value) || 0;
    config.successCondition = document.getElementById('endpointModalSuccessCond').value.trim();
    config.returnLeadIdPath = document.getElementById('endpointModalReturnPath').value.trim();

    _brandEndpointConfigs[code] = config;
    closeModal('dispatchEndpointModal');
    renderDispatchEndpointCard();
    showToast('下发接口配置保存成功', 'success');
  }

  // 打开联调测试弹窗
  function openDispatchTestModal() {
    var code = document.getElementById('dispatchBrandFilter').value;
    if (!code) { showToast('请先选择目标品牌', 'warning'); return; }

    var config = _brandEndpointConfigs[code] || {};
    var brandName = _brandNameMap[code] || code;

    document.getElementById('dispatchTestModalTitle').textContent = '发送联调测试数据（' + brandName + '）';
    document.getElementById('testModalTargetMethod').textContent = config.method || 'POST';
    document.getElementById('testModalTargetUrl').textContent = config.url || 'https://crm-gateway.dongfeng-nissan.com/openapi/v2/leads/collect';
    
    var authLabel = '无鉴权';
    if (config.authType === 'hmac') authLabel = 'HMAC-SHA256 (' + (config.hmacAppKey || 'Key') + ')';
    else if (config.authType === 'apikey') authLabel = 'API Key';
    else if (config.authType === 'oauth2') authLabel = 'OAuth 2.0';
    document.getElementById('testModalAuthTag').textContent = authLabel;

    // 动态组装当前品牌的模拟请求报文
    var activeMappings = _dispatchFieldMappings.filter(function(m) { return m.brandCode === code && m.status === 1; });
    var mockData = {};
    if (activeMappings.length > 0) {
      activeMappings.forEach(function(m) {
        var key = m.targetName;
        if (m.mappingType === 2) {
          mockData[key] = m.fixedValue || '固定值';
        } else if (m.sourceKey === 'customer_name') {
          mockData[key] = '张先生';
        } else if (m.sourceKey === 'customer_phone') {
          mockData[key] = '13800138000';
        } else if (m.sourceKey === 'store_id') {
          mockData[key] = 'DFN_GZ_PY_001';
        } else if (m.sourceKey === 'series_id') {
          mockData[key] = 'DFN_SYLPHY_2026';
        } else if (m.sourceKey === 'lead_level') {
          mockData[key] = m.enumValueMap ? (m.enumValueMap['A'] || 'H') : 'H';
        } else if (m.sourceKey === 'finance_plan_intent') {
          mockData[key] = '低息分期';
        } else if (m.sourceKey === 'used_car_appraisal') {
          mockData[key] = '需要评估';
        } else {
          mockData[key] = 'test_val';
        }
      });
    } else {
      mockData = {
        cust_name: "张先生",
        mobile: "13800138000",
        dealer_code: "DFN_GZ_001",
        brand_name: brandName,
        car_model_code: "DFN_SYLPHY"
      };
    }

    var fullPayload = {
      timestamp: Math.floor(Date.now() / 1000),
      nonce: "r7a92k",
      sign: "8f7c9e01ab88de3456c8209fae113401",
      data: mockData
    };

    document.getElementById('testModalPayload').textContent = JSON.stringify(fullPayload, null, 2);
    document.getElementById('testModalResultGroup').style.display = 'none';
    document.getElementById('testModalSendBtn').disabled = false;
    document.getElementById('testModalSendBtn').innerHTML = '<span>🚀</span> 立即发送测试请求';

    openModal('dispatchTestModal');
  }

  // 执行联调测试请求模拟
  function runDispatchTest() {
    var btn = document.getElementById('testModalSendBtn');
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> 发送中...';

    var code = document.getElementById('dispatchBrandFilter').value || 'DONGFENG_NISSAN';

    setTimeout(function() {
      btn.disabled = false;
      btn.innerHTML = '<span>🚀</span> 重新发送测试请求';

      var mockExtId = (code ? code.substring(0, 3) : 'LEAD') + '_EXT_' + Math.floor(100000 + Math.random() * 900000);
      var mockResponse = {
        code: 0,
        msg: "success",
        timestamp: Math.floor(Date.now() / 1000),
        data: {
          external_lead_id: mockExtId,
          receive_time: "2026-09-30 10:48:32",
          dealer_sync_status: "SUCCESS",
          status: "ACCEPTED"
        }
      };

      document.getElementById('testModalResultGroup').style.display = 'block';
      document.getElementById('testModalResultStatus').className = 'status-badge status-active';
      document.getElementById('testModalResultStatus').textContent = '200 OK (下发成功)';
      document.getElementById('testModalResultLatency').textContent = '耗时 ' + Math.floor(90 + Math.random() * 40) + 'ms';
      document.getElementById('testModalExtLeadId').textContent = mockExtId;
      document.getElementById('testModalResponse').textContent = JSON.stringify(mockResponse, null, 2);

      showToast('联调测试请求成功，已成功回填外部线索ID', 'success');
    }, 400);
  }

  // 打开试点供应商直连与线索中心协同开发技术方案弹窗 (研发对照)
  function openDispatchTechSpecModal() {
    if (typeof openModal === 'function') {
      openModal('dispatchTechSpecModal');
    } else {
      var modal = document.getElementById('dispatchTechSpecModal');
      if (modal) modal.classList.add('active');
    }
  }

  // 关闭试点供应商技术方案弹窗
  function closeDispatchTechSpecModal() {
    if (typeof closeModal === 'function') {
      closeModal('dispatchTechSpecModal');
    } else {
      var modal = document.getElementById('dispatchTechSpecModal');
      if (modal) modal.classList.remove('active');
    }
  }

  window.openDispatchTechSpecModal = openDispatchTechSpecModal;
  window.closeDispatchTechSpecModal = closeDispatchTechSpecModal;

  // 渲染字段列表
  function renderFieldTable(data) {
    var tbody = document.getElementById('customFieldTableBody');
    if (!tbody) return;
    if (!data) data = _customFieldData;

    var html = '';
    data.forEach(function(f) {
      var badgeClass = 'status-primary';
      var scopeDisplay = f.scopeName;
      if (f.scope === 'brand') scopeDisplay += '(' + f.brandName + ')';
      var requiredDisplay = f.requiredMode === 'conditional'
        ? '<span style="color: var(--warning, #d97706);" title="' + getConditionSummary(f) + '">条件必填</span>'
        : (f.required
          ? '<span style="color: var(--danger);">必填</span>'
          : '<span style="color: var(--gray-400);">选填</span>');
      var statusDisplay = f.status === 1
        ? '<span class="status-badge status-active">启用</span>'
        : '<span class="status-badge status-inactive">停用</span>';
      var toggleBtnText = f.status === 1 ? '停用' : '启用';
      var toggleBtnClass = f.status === 1 ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm';

      html += '<tr>' +
        '<td>' + f.sort + '</td>' +
        '<td><strong>' + f.name + '</strong></td>' +
        '<td><code>' + f.key + '</code></td>' +
        '<td><span class="status-badge ' + badgeClass + '">' + f.typeName + '</span></td>' +
        '<td>' + scopeDisplay + '</td>' +
        '<td>' + requiredDisplay + '</td>' +
        '<td>' + statusDisplay + '</td>' +
        '<td>' +
          '<button class="btn btn-secondary btn-sm" onclick="openFieldModal(' + f.id + ')">编辑</button> ' +
          '<button class="' + toggleBtnClass + '" onclick="toggleFieldStatus(' + f.id + ')">' + toggleBtnText + '</button> ' +
          '<button class="btn btn-danger btn-sm" onclick="deleteField(' + f.id + ',\'' + f.name + '\')">删除</button>' +
        '</td>' +
      '</tr>';
    });

    tbody.innerHTML = html;
  }

  function getConditionSummary(field) {
    if (!field.condition) return '按条件必填';
    var source = _customFieldData.find(function(f) { return f.id === field.condition.sourceId; });
    var opMap = { filled: '已填写', equals: '等于', not_equals: '不等于', contains: '包含' };
    return '当“' + (source ? source.name : '触发字段') + '”' + (opMap[field.condition.operator] || '') + (field.condition.value ? '“' + field.condition.value + '”' : '') + '时必填';
  }

  function populateBrandSelect(selectId, selectedVal) {
    var sel = document.getElementById(selectId);
    if (!sel) return;
    var firstText = selectId === 'previewBrandFilter' ? '全部品牌' : '请选择品牌';
    sel.innerHTML = '<option value="">' + firstText + '</option>';
    Object.keys(_brandNameMap).forEach(function(code) {
      var opt = document.createElement('option');
      opt.value = code;
      opt.textContent = _brandNameMap[code];
      if (selectedVal && selectedVal === code) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  // 根据预览面板筛选条件获取表格数据（含所有状态的字段）
  function getTableFilteredFields() {
    var scopeFilter = document.getElementById('previewScopeFilter') ? document.getElementById('previewScopeFilter').value : '';
    var previewFilter = document.getElementById('previewBrandFilter');
    var brandFilter = previewFilter ? previewFilter.value : '';

    var filtered = _customFieldData.slice();

    if (scopeFilter === 'global') {
      filtered = filtered.filter(function(f) { return f.scope === 'global'; });
    } else if (scopeFilter === 'brand') {
      filtered = filtered.filter(function(f) {
        return f.scope === 'brand' && (!brandFilter || f.brandCode === brandFilter);
      });
    }

    return filtered;
  }

  // 作用域筛选联动：选「品牌字段」时显示品牌下拉，同时更新左边表格和下方预览
  function onPreviewScopeChange() {
    var scope = document.getElementById('previewScopeFilter').value;
    var brandGroup = document.getElementById('previewBrandGroup');
    if (brandGroup) {
      brandGroup.style.display = scope === 'brand' ? '' : 'none';
    }
    populateBrandSelect('previewBrandFilter');
    // 切换作用域时重置品牌选择
    var brandSel = document.getElementById('previewBrandFilter');
    if (brandSel && scope !== 'brand') brandSel.value = '';
    // 联动更新左边表格和下方预览
    renderFieldTable(getTableFilteredFields());
    renderFieldPreview();
  }

  // 预览面板品牌下拉变化时，联动更新左边表格和下方预览
  function onPreviewBrandChange() {
    renderFieldTable(getTableFilteredFields());
    renderFieldPreview();
  }

  // 渲染线索表单预览
  function renderFieldPreview() {
    var container = document.getElementById('fieldPreviewContent');
    if (!container) return;

    // 初始化品牌下拉选项
    var previewFilter = document.getElementById('previewBrandFilter');
    if (previewFilter && previewFilter.options.length <= 1) populateBrandSelect('previewBrandFilter');

    var scopeFilter = document.getElementById('previewScopeFilter') ? document.getElementById('previewScopeFilter').value : '';
    var brandFilter = previewFilter ? previewFilter.value : '';

    var activeFields = _customFieldData.filter(function(f) { return f.status === 1; })
      .sort(function(a, b) { return a.sort - b.sort; });

    // 按作用域筛选
    if (scopeFilter === 'global') {
      activeFields = activeFields.filter(function(f) { return f.scope === 'global'; });
    } else if (scopeFilter === 'brand') {
      // 品牌视角：仅显示该品牌专属字段
      activeFields = activeFields.filter(function(f) {
        return f.scope === 'brand' && (!brandFilter || f.brandCode === brandFilter);
      });
    }

    if (activeFields.length === 0) {
      container.innerHTML = '<div class="field-preview-empty">暂无匹配的字段</div>';
      return;
    }

    // 描述文案
    var desc = '';
    if (scopeFilter === 'global') {
      desc = '公共字段（所有品牌共用）';
    } else if (scopeFilter === 'brand') {
      if (brandFilter && previewFilter) {
        desc = '品牌「' + previewFilter.options[previewFilter.selectedIndex].text + '」单独配置的公共线索接收字段';
      } else {
        desc = '品牌单独配置的公共线索接收字段（请选择具体品牌）';
      }
    } else {
      desc = '所有启用的自定义字段';
    }

    var html = '<div style="font-size: 12px; color: var(--gray-500); margin-bottom: 16px;">' + desc + '</div>';
    activeFields.forEach(function(f) {
      var scopeTag = '';
      if (f.scope === 'global') scopeTag = '<span style="font-size:10px; background:#dbeafe; color:#1e40af; padding:1px 6px; border-radius:4px; margin-left:4px;">公共</span>';
      else if (f.scope === 'brand') scopeTag = '<span style="font-size:10px; background:#fef3c7; color:#92400e; padding:1px 6px; border-radius:4px; margin-left:4px;">' + f.brandName + '</span>';
      var requiredMark = f.required ? ' <span style="color: var(--danger);">*</span>' : '';
      html += '<div class="field-preview-item">';
      html += '<div class="field-preview-label">' + f.name + requiredMark + scopeTag + '</div>';

      if (f.type === 1 || f.type === 7 || f.type === 8) {
        html += '<div class="field-preview-input">' + (f.placeholder || '请输入') + '</div>';
      } else if (f.type === 2) {
        html += '<div class="field-preview-input" style="text-align: right;">0</div>';
      } else if (f.type === 3) {
        html += '<div class="field-preview-input">YYYY-MM-DD</div>';
      } else if (f.type === 4) {
        html += '<div class="field-preview-input">' + (f.placeholder || '请选择') + ' ▾</div>';
      } else if (f.type === 5) {
        html += '<div class="field-preview-input">' + (f.placeholder || '请选择') + ' ▾ (多选)</div>';
      } else if (f.type === 6) {
        html += '<div class="field-preview-input" style="text-align: center; padding: 20px; color: var(--gray-400);">📷 点击上传图片</div>';
      }
      html += '</div>';
    });

    container.innerHTML = html;
  }

  // 筛选字段列表
  function filterFieldList() {
    var typeFilter = document.getElementById('fieldTypeFilter').value;

    var filtered = _customFieldData.filter(function(f) {
      var typeMatch = !typeFilter || f.type === parseInt(typeFilter);
      return typeMatch;
    });

    renderFieldTable(filtered);
  }

  // 打开字段弹窗（新增/编辑）
  function openFieldModal(id) {
    _currentEditingFieldId = id || null;
    _fieldTypeEnumValues = [];

    if (id) {
      var field = _customFieldData.find(function(f) { return f.id === id; });
      if (!field) { showToast('未找到该字段', 'error'); return; }
      document.getElementById('fieldModalTitle').textContent = '编辑字段';
      document.getElementById('fieldName').value = field.name || '';
      document.getElementById('fieldKey').value = field.key || '';
      document.getElementById('fieldKey').readOnly = true;
      document.getElementById('fieldType').value = String(field.type || '');
      document.getElementById('fieldScope').value = field.scope || 'global';
      document.getElementById('fieldRequiredMode').value = field.requiredMode || (field.required ? 'always' : 'optional');
      document.getElementById('fieldDefaultValue').value = field.defaultValue || '';
      document.getElementById('fieldPlaceholder').value = field.placeholder || '';
      document.getElementById('fieldDescription').value = field.description || '';
      _fieldTypeEnumValues = field.enumValues ? field.enumValues.slice() : [];
    } else {
      document.getElementById('fieldModalTitle').textContent = '新增字段';
      document.getElementById('fieldName').value = '';
      document.getElementById('fieldKey').value = '';
      document.getElementById('fieldKey').readOnly = false;
      document.getElementById('fieldType').value = '';
      document.getElementById('fieldScope').value = 'global';
      document.getElementById('fieldRequiredMode').value = 'optional';
      document.getElementById('fieldDefaultValue').value = '';
      document.getElementById('fieldPlaceholder').value = '';
      document.getElementById('fieldDescription').value = '';
      _fieldTypeEnumValues = [];
    }

    onFieldTypeChange();
    onFieldScopeChange();
    onFieldRequiredModeChange();
    populateConditionSource(id);
    if (id && field.requiredMode === 'conditional' && field.condition) {
      document.getElementById('fieldConditionSource').value = String(field.condition.sourceId || '');
      onFieldConditionSourceChange();
      document.getElementById('fieldConditionOperator').value = field.condition.operator || 'filled';
      onFieldConditionOperatorChange();
      document.getElementById('fieldConditionValue').value = field.condition.value || '';
    }
    // 编辑模式下回显品牌选中值
    if (id && field.scope === 'brand') populateBrandSelect('fieldBrand', field.brandCode);
    renderEnumTags();
    openModal('fieldModal');
  }

  function onFieldRequiredModeChange() {
    var mode = document.getElementById('fieldRequiredMode').value;
    document.getElementById('fieldConditionGroup').style.display = mode === 'conditional' ? '' : 'none';
    if (mode === 'conditional') populateConditionSource(_currentEditingFieldId);
  }

  function populateConditionSource(currentId) {
    var select = document.getElementById('fieldConditionSource');
    if (!select) return;
    var html = '<option value="">选择触发字段</option>';
    _customFieldData.filter(function(f) { return f.id !== currentId && f.status !== 0; }).forEach(function(f) {
      html += '<option value="' + f.id + '">' + f.name + '</option>';
    });
    select.innerHTML = html;
  }

  function onFieldConditionSourceChange() {
    var sourceId = parseInt(document.getElementById('fieldConditionSource').value);
    var source = _customFieldData.find(function(f) { return f.id === sourceId; });
    var value = document.getElementById('fieldConditionValue');
    if (source && (source.type === 4 || source.type === 5)) {
      value.innerHTML = '<option value="">选择值</option>' + (source.enumValues || []).map(function(v) { return '<option value="' + v + '">' + v + '</option>'; }).join('');
    } else value.innerHTML = '<option value="">输入或选择值</option>';
    onFieldConditionOperatorChange();
  }

  function onFieldConditionOperatorChange() {
    var op = document.getElementById('fieldConditionOperator').value;
    document.getElementById('fieldConditionValue').style.display = op === 'filled' ? 'none' : '';
  }

  // 关闭字段弹窗
  function closeFieldModal() {
    closeModal('fieldModal');
    _currentEditingFieldId = null;
    _fieldTypeEnumValues = [];
  }

  // 字段名称输入时自动生成 Key
  function onFieldNameInput() {
    if (_currentEditingFieldId) return;
    var name = document.getElementById('fieldName').value;
    // 简单转换：去除特殊字符，空格转下划线
    var key = name.toLowerCase()
      .replace(/[^\u4e00-\u9fa5a-z0-9\s_]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_');
    document.getElementById('fieldKey').value = key;
  }

  // 字段类型变化时控制枚举值显示
  function onFieldTypeChange() {
    var type = document.getElementById('fieldType').value;
    var enumGroup = document.getElementById('fieldEnumGroup');
    var defaultInput = document.getElementById('fieldDefaultValue');
    enumGroup.style.display = (type === '4' || type === '5') ? '' : 'none';
    if (type === '3') defaultInput.placeholder = '如：2025-01-01';
    else if (type === '2') defaultInput.placeholder = '如：100';
    else if (type === '8') defaultInput.placeholder = '如：13800138000';
    else defaultInput.placeholder = '可选';
  }

  // 作用域变化时控制品牌选择器
  function onFieldScopeChange() {
    var scope = document.getElementById('fieldScope').value;
    var brandGroup = document.getElementById('fieldBrandGroup');
    if (brandGroup) brandGroup.style.display = scope === 'brand' ? '' : 'none';
    if (scope === 'brand') populateBrandSelect('fieldBrand', document.getElementById('fieldBrand').value);
  }

  // 枚举值 Tag 输入
  function handleEnumInputKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var input = document.getElementById('fieldEnumInput');
      var val = input.value.trim();
      if (val && _fieldTypeEnumValues.indexOf(val) === -1) {
        _fieldTypeEnumValues.push(val);
        renderEnumTags();
      }
      input.value = '';
    }
  }

  function removeEnumTag(index) {
    _fieldTypeEnumValues.splice(index, 1);
    renderEnumTags();
  }

  function renderEnumTags() {
    var container = document.getElementById('fieldEnumContainer');
    var input = document.getElementById('fieldEnumInput');
    container.querySelectorAll('.tag-item').forEach(function(t) { t.remove(); });
    _fieldTypeEnumValues.forEach(function(val, idx) {
      var tag = document.createElement('span');
      tag.className = 'tag-item';
      tag.innerHTML = val + ' <span class="tag-remove" onclick="removeEnumTag(' + idx + ')">×</span>';
      container.insertBefore(tag, input);
    });
  }

  // 字段表单提交
  function handleFieldSubmit() {
    var name = document.getElementById('fieldName').value.trim();
    var key = document.getElementById('fieldKey').value.trim();
    var type = document.getElementById('fieldType').value;
    var scope = document.getElementById('fieldScope').value;
    var requiredMode = document.getElementById('fieldRequiredMode').value;
    var required = requiredMode === 'always';
    var condition = null;
    if (requiredMode === 'conditional') {
      var sourceId = parseInt(document.getElementById('fieldConditionSource').value);
      if (!sourceId) { showToast('请选择触发字段', 'error'); return; }
      var op = document.getElementById('fieldConditionOperator').value;
      var conditionValue = document.getElementById('fieldConditionValue').value.trim();
      if (op !== 'filled' && !conditionValue) { showToast('请设置条件值', 'error'); return; }
      condition = { sourceId: sourceId, operator: op, value: conditionValue };
    }
    var defaultValue = document.getElementById('fieldDefaultValue').value.trim();
    var placeholder = document.getElementById('fieldPlaceholder').value.trim();
    var description = document.getElementById('fieldDescription').value.trim();

    // 校验
    if (!name) { showToast('请输入字段名称', 'error'); return; }
    if (!key) { showToast('请输入字段Key', 'error'); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(key)) { showToast('字段Key需为英文格式，仅含英文字母/数字/下划线', 'error'); return; }
    if (!type) { showToast('请选择字段类型', 'error'); return; }
    if ((type === '4' || type === '5') && _fieldTypeEnumValues.length === 0) {
      showToast('单选/多选类型需至少添加一个枚举值', 'error'); return;
    }
    if (scope === 'brand' && !document.getElementById('fieldBrand').value) {
      showToast('请选择关联品牌', 'error'); return;
    }
    if (!_currentEditingFieldId) {
      var existing = _customFieldData.find(function(f) { return f.key === key; });
      if (existing) { showToast('字段Key已存在，请更换', 'error'); return; }
    }

    var brandCode = scope === 'brand' ? document.getElementById('fieldBrand').value : '';
    var brandName = scope === 'brand' ? document.getElementById('fieldBrand').options[document.getElementById('fieldBrand').selectedIndex].text : '';
    var supplierCode = '';
    var supplierName = '';

    if (_currentEditingFieldId) {
      var field = _customFieldData.find(function(f) { return f.id === _currentEditingFieldId; });
      if (field) {
        field.name = name;
        field.type = parseInt(type);
        field.typeName = _fieldTypeMap[parseInt(type)];
        field.scope = scope;
        field.scopeName = _fieldScopeMap[scope];
        field.brandCode = brandCode;
        field.brandName = brandName;
        field.supplierCode = supplierCode;
        field.supplierName = supplierName;
        field.required = required;
        field.requiredMode = requiredMode;
        field.condition = condition;
        field.enumValues = (type === '4' || type === '5') ? _fieldTypeEnumValues.slice() : [];
        field.defaultValue = defaultValue;
        field.placeholder = placeholder;
        field.description = description;
      }
      showToast('字段更新成功', 'success');
    } else {
      var newId = _customFieldData.length > 0
        ? Math.max.apply(null, _customFieldData.map(function(f) { return f.id; })) + 1
        : 1;
      var newSort = _customFieldData.length > 0
        ? Math.max.apply(null, _customFieldData.map(function(f) { return f.sort; })) + 1
        : 1;
      _customFieldData.push({
        id: newId, name: name, key: key,
        type: parseInt(type), typeName: _fieldTypeMap[parseInt(type)],
        scope: scope, scopeName: _fieldScopeMap[scope],
        brandCode: brandCode, brandName: brandName,
        supplierCode: supplierCode, supplierName: supplierName,
        required: required,
        requiredMode: requiredMode,
        condition: condition,
        enumValues: (type === '4' || type === '5') ? _fieldTypeEnumValues.slice() : [],
        defaultValue: defaultValue, placeholder: placeholder, description: description,
        sort: newSort, status: 1
      });
      showToast('字段创建成功', 'success');
    }

    closeFieldModal();
    renderFieldTable();
    renderFieldPreview();
  }

  // 字段启用/停用（带确认弹窗）
  function toggleFieldStatus(id) {
    var field = _customFieldData.find(function(f) { return f.id === id; });
    if (!field) return;
    var action = field.status === 1 ? '停用' : '启用';
    showConfirmDialog('确定要' + action + '字段「' + field.name + '」吗？', function() {
      field.status = field.status === 1 ? 0 : 1;
      renderFieldTable();
      renderFieldPreview();
      showToast('已' + action + '字段「' + field.name + '」', field.status === 1 ? 'success' : 'warning');
    });
  }

  // 删除字段（带确认弹窗）
  function deleteField(id, name) {
    showConfirmDialog('确定要删除字段「' + name + '」吗？删除后不可恢复，已推送的线索数据中该字段值将保留。', function() {
      _customFieldData = _customFieldData.filter(function(f) { return f.id !== id; });
      renderFieldTable();
      renderFieldPreview();
      showToast('已删除字段「' + name + '」', 'success');
    });
  }

  // 品牌停用/启用
  function toggleBrandStatus(btn, id, name, series, stores) {
    var row = btn.closest('tr');
    var badge = row.querySelector('.status-badge.status-active, .status-badge.status-inactive');
    var currentStatus = badge.classList.contains('status-active') ? 'active' : 'inactive';
    
    if (currentStatus === 'active') {
      // 停用操作，显示确认弹窗
      var msg = '该品牌下共有 ' + series + ' 个车系、' + stores + ' 家门店，停用将同步停用，是否确认？';
      showConfirmDialog(msg, function() {
        badge.className = 'status-badge status-inactive';
        badge.innerHTML = '停用';
        btn.className = 'btn btn-primary btn-sm';
        btn.textContent = '启用';
        btn.setAttribute('onclick', 'toggleBrandStatus(this, ' + id + ',\'' + name + '\',' + series + ',' + stores + ')');
        showToast('品牌「' + name + '」已停用', 'warning');
      });
    } else {
      // 启用操作，直接执行
      badge.className = 'status-badge status-active';
      badge.innerHTML = '启用';
      btn.className = 'btn btn-secondary btn-sm';
      btn.textContent = '停用';
      btn.setAttribute('onclick', 'toggleBrandStatus(this, ' + id + ',\'' + name + '\',' + series + ',' + stores + ')');
      showToast('品牌「' + name + '」已启用', 'success');
    }
  }

  // 打开车系详情弹窗
  function openVehicleDetailModal(id, name) {
    // 根据ID填充不同数据
    var detailData = {
      1: { name: '理想L9', subtitle: '增程旗舰SUV', brand: '理想汽车', energy: '增程(EREV)', code: 'LIXIANG_L9', price: '40.98~45.98', sort: '1', status: 'active', createTime: '2026-04-15 10:30:00', intro: '理想L9是理想汽车旗下全尺寸六座SUV，搭载1.5T四缸增程器+前后双电机组成的增程电动系统。采用家庭智能座舱设计语言，车内配备三块15.7英寸大屏，搭载全栈自研的AD Max智能驾驶系统，CLTC综合续航里程达1315km。', stores: 256, remark: '该车系为品牌旗舰车型，销量表现良好，建议重点推广。' },
      2: { name: '理想L8', subtitle: '家庭六座SUV', brand: '理想汽车', energy: '增程(EREV)', code: 'LIXIANG_L8', price: '33.98~39.98', sort: '2', status: 'active', createTime: '2026-04-16 14:20:00', intro: '理想L8定位于中大型六座SUV，为家庭用户打造。延续L9的设计语言与科技配置，在空间与价格之间取得最佳平衡。', stores: 198, remark: '' },
      3: { name: '问界M9', subtitle: '豪华全尺寸SUV', brand: '问界', energy: '纯电(BEV)', code: 'WENJIE_M9', price: '46.98~56.98', sort: '1', status: 'active', createTime: '2026-03-20 09:00:00', intro: '问界M9是华为深度赋能的豪华SUV，搭载华为鸿蒙智能座舱和华为ADS 2.0高阶智能驾驶系统。采用全新设计语言，提供纯电和增程两种动力形式。', stores: 145, remark: '华为赋能车型，智能化为核心卖点。' },
      4: { name: '小鹏G9', subtitle: '超快充全智能SUV', brand: '小鹏汽车', energy: '纯电(BEV)', code: 'XIAOPENG_G9', price: '26.99~35.99', sort: '3', status: 'active', createTime: '2026-02-28 16:45:00', intro: '小鹏G9是小鹏汽车旗下中大型SUV，搭载行业领先的全场景智能辅助驾驶XNGP，支持800V超快充技术，充电5分钟可续航200km。', stores: 88, remark: '' },
      13: { name: '轩逸', subtitle: '家用舒适轿车', brand: '东风日产', energy: '燃油', code: 'DFN_SYLPHY', price: '10.86~17.49', sort: '1', status: 'active', createTime: '2026-05-12 09:20:00', intro: '轩逸定位家用紧凑型轿车，突出舒适空间、低使用成本和稳定口碑，适合作为东风日产线索接收的主销车系样例。', stores: 132, remark: '东风日产高频线索车系，建议重点维护字段映射。' },
      14: { name: '天籁', subtitle: '舒适中高级轿车', brand: '东风日产', energy: '燃油', code: 'DFN_ALTIMA', price: '17.98~23.98', sort: '2', status: 'active', createTime: '2026-05-12 09:25:00', intro: '天籁定位中高级轿车，强调舒适驾乘、静谧性和家庭商务兼顾场景，可用于中高意向线索配置。', stores: 118, remark: '' },
      15: { name: '逍客', subtitle: '城市紧凑型SUV', brand: '东风日产', energy: '燃油', code: 'DFN_QASHQAI', price: '12.59~17.49', sort: '3', status: 'active', createTime: '2026-05-12 09:30:00', intro: '逍客定位城市紧凑型SUV，兼顾通勤、家庭出行和通过性，是东风日产SUV线索接收的常用车系。', stores: 96, remark: '' },
      16: { name: '新楼兰', subtitle: '大五座旗舰SUV', brand: '东风日产', energy: '燃油', code: 'DFN_MURANO', price: '23.88~37.58', sort: '4', status: 'active', createTime: '2026-05-12 09:35:00', intro: '新楼兰定位大五座SUV，适合承接高预算、家庭改善型购车线索，用于演示高价值线索接收字段。', stores: 74, remark: '用于线索明细与SmartCode样例中的东风日产车系。' }
    };
    
    var data = detailData[id] || detailData[1];
    
    // 更新弹窗标题
    document.getElementById('vehicleDetailTitle').textContent = '车系详情 - ' + data.name;
    
    // 更新基本信息
    document.getElementById('vehicleDetailName').textContent = data.name;
    document.getElementById('vehicleDetailSubtitle').textContent = data.subtitle;
    document.getElementById('vehicleDetailBrand').textContent = data.brand;
    document.getElementById('vehicleDetailEnergy').textContent = data.energy;
    document.getElementById('vehicleDetailCode').textContent = data.code;
    document.getElementById('vehicleDetailPrice').textContent = data.price + ' 万';
    document.getElementById('vehicleDetailSort').textContent = data.sort;
    document.getElementById('vehicleDetailCreateTime').textContent = data.createTime;
    document.getElementById('vehicleDetailIntro').textContent = data.intro;
    document.getElementById('vehicleDetailStoreCount').textContent = '(共 ' + data.stores + ' 家)';
    
    // 更新状态样式
    var statusEl = document.getElementById('vehicleDetailStatus');
    if (data.status === 'active') {
      statusEl.className = 'status-badge status-active';
      statusEl.style.background = 'var(--success-light)';
      statusEl.style.color = 'var(--success)';
      statusEl.innerHTML = '启用';
    } else {
      statusEl.className = 'status-badge status-inactive';
      statusEl.style.background = 'var(--gray-100)';
      statusEl.style.color = 'var(--gray-400)';
      statusEl.innerHTML = '○ 停用';
    }
    
    // 更新备注
    var remarkSection = document.getElementById('vehicleDetailRemarkSection');
    var remarkEl = document.getElementById('vehicleDetailRemark');
    if (data.remark) {
      remarkSection.style.display = 'block';
      remarkEl.textContent = data.remark;
    } else {
      remarkSection.style.display = 'none';
    }
    
    // 打开弹窗
    openModal('vehicleDetailModal');
  }

  // 车系停用确认
  // 车系停用/启用
  function toggleSeriesStatus(btn, id, name, stores) {
    var row = btn.closest('tr');
    var badge = row.querySelector('.status-badge.status-active, .status-badge.status-inactive');
    var currentStatus = badge.classList.contains('status-active') ? 'active' : 'inactive';
    
    if (currentStatus === 'active') {
      // 停用操作，显示确认弹窗
      var msg = '该车系下共有 ' + stores + ' 家门店，停用将同步停用，是否确认？';
      showConfirmDialog(msg, function() {
        badge.className = 'status-badge status-inactive';
        badge.innerHTML = '停用';
        btn.className = 'btn btn-primary btn-sm';
        btn.textContent = '启用';
        btn.setAttribute('onclick', 'toggleSeriesStatus(this, ' + id + ',\'' + name + '\',' + stores + ')');
        showToast('车系「' + name + '」已停用', 'warning');
      });
    } else {
      // 启用操作，直接执行
      badge.className = 'status-badge status-active';
      badge.innerHTML = '启用';
      btn.className = 'btn btn-secondary btn-sm';
      btn.textContent = '停用';
      btn.setAttribute('onclick', 'toggleSeriesStatus(this, ' + id + ',\'' + name + '\',' + stores + ')');
      showToast('车系「' + name + '」已启用', 'success');
    }
  }

  // 车系删除确认
  var seriesDeleteId = null;

  function deleteSeries(id, name, stores) {
    seriesDeleteId = id;
    document.getElementById('seriesDeleteName').textContent = name;

    var storesInfo = document.getElementById('seriesDeleteStoresInfo');
    var warningBox = document.getElementById('seriesDeleteWarning');

    if (stores > 0) {
      warningBox.style.display = 'block';
      storesInfo.innerHTML = '• 该车系下共有 <strong style="color: var(--primary);">' + stores + ' 家门店</strong>';
    } else {
      warningBox.style.display = 'none';
    }

    document.getElementById('seriesDeleteConfirmBtn').onclick = function() {
      executeSeriesDelete(id, name, stores);
    };
    openModal('seriesDeleteModal');
  }

  function closeSeriesDeleteModal() {
    seriesDeleteId = null;
    closeModal('seriesDeleteModal');
  }

  function executeSeriesDelete(id, name, stores) {
    closeSeriesDeleteModal();
    showToast('已删除车系「' + name + '」', 'success');
  }

  // 开发者启用/停用切换
  function toggleSupplierStatus(btn, row) {
    var badge = row.querySelector('.status-badge.status-active, .status-badge.status-inactive');
    var currentText = badge.textContent;

    if (currentText.includes('启用')) {
      // 停用前显示警告
      showConfirmDialog('停用账号后，该账号 API 调用立即返回 401。是否确认？', function() {
        badge.className = 'status-badge status-inactive';
        badge.innerHTML = '停用';
        btn.className = 'btn btn-primary btn-sm';
        btn.textContent = '启用';
        showToast('开发者已停用', 'warning');
      });
    } else {
      // 启用，直接执行
      badge.className = 'status-badge status-active';
      badge.innerHTML = '启用';
      btn.className = 'btn btn-secondary btn-sm';
      btn.textContent = '停用';
      showToast('开发者已启用', 'success');
    }
  }

  // 车系列表搜索过滤
  function filterSeriesList() {
    var nameKeyword = document.getElementById('seriesSearchName').value.toLowerCase().trim();
    var brandFilter = document.getElementById('seriesSearchBrand').value;
    var energyFilter = document.getElementById('seriesSearchEnergy').value;
    var statusFilter = document.getElementById('seriesSearchStatus').value;
    var rows = document.querySelectorAll('#page-vehicle tbody tr');
    var visibleCount = 0;
    
    rows.forEach(function(row) {
      var nameCell = row.querySelector('td:nth-child(3)');  // 车系名称
      var brandCell = row.querySelector('td:nth-child(4)');  // 所属品牌
      var energyCell = row.querySelector('td:nth-child(5)');  // 能源类型
      var statusCell = row.querySelector('td:nth-child(9) .status-badge');  // 状态
      if (!nameCell) return;
      
      var name = nameCell.textContent.toLowerCase();
      var brand = brandCell ? brandCell.textContent.trim() : '';
      var isActive = statusCell && statusCell.classList.contains('status-active');
      
      // 能源类型匹配
      var energyText = energyCell ? energyCell.textContent.trim() : '';
      var energyTypeMap = {
        '1': ['纯电(BEV)', '纯电（BEV）'],
        '2': ['燃油'],
        '3': ['插混(PHEV)', '插混（PHEV）'],
        '4': ['增程(EREV)', '增程（EREV）'],
        '5': ['混动(HEV)', '混动（HEV）']
      };
      var energyMatch = energyFilter === '' || (energyTypeMap[energyFilter] && energyTypeMap[energyFilter].some(function(e) { return energyText.indexOf(e) > -1; }));
      
      // 品牌匹配
      var brandMatch = brandFilter === '' || 
        (brandFilter === '1' && brand.indexOf('理想') > -1) ||
        (brandFilter === '2' && brand.indexOf('问界') > -1) ||
        (brandFilter === '3' && brand.indexOf('小鹏') > -1) ||
        (brandFilter === '5' && brand.indexOf('东风日产') > -1);
      
      // 名称匹配
      var nameMatch = nameKeyword === '' || name.indexOf(nameKeyword) > -1;
      
      // 状态匹配
      var statusMatch = statusFilter === '' || (statusFilter === '1' && isActive) || (statusFilter === '0' && !isActive);
      
      if (nameMatch && brandMatch && energyMatch && statusMatch) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });
    
    // 更新分页信息
    var paginationInfo = document.querySelector('#page-vehicle .pagination-info');
    if (paginationInfo) {
      paginationInfo.textContent = '共 ' + visibleCount + ' 条数据';
    }
  }

  // 清空车系搜索条件
  function clearSeriesFilter() {
    document.getElementById('seriesSearchName').value = '';
    document.getElementById('seriesSearchBrand').value = '';
    document.getElementById('seriesSearchEnergy').value = '';
    document.getElementById('seriesSearchStatus').value = '';
    filterSeriesList();
  }

  // 门店列表搜索过滤
  function filterStoreList() {
    var nameKeyword = document.getElementById('storeSearchName').value.toLowerCase().trim();
    var brandFilter = document.getElementById('storeSearchBrand').value;
    var cityFilter = document.getElementById('storeSearchCity').value;
    var typeFilter = document.getElementById('storeSearchType').value;
    var rows = document.querySelectorAll('#page-store tbody tr');
    var visibleCount = 0;
    
    rows.forEach(function(row) {
      var nameCell = row.querySelector('td:nth-child(2)');  // 经销商名称
      var brandCell = row.querySelector('td:nth-child(4)');  // 所属品牌
      var cityCell = row.querySelector('td:nth-child(5)');  // 所属城市
      var typeCell = row.querySelector('td:nth-child(6)');  // 门店类型
      var statusCell = row.querySelector('td:nth-child(8) .status-badge');  // 状态
      if (!nameCell) return;
      
      var name = nameCell.textContent.toLowerCase();
      var brand = brandCell ? brandCell.textContent.trim() : '';
      var city = cityCell ? cityCell.textContent.trim() : '';
      var type = typeCell ? typeCell.textContent.trim() : '';
      var isActive = statusCell && statusCell.classList.contains('status-active');
      
      // 名称/编码匹配（搜索框同时匹配名称和编码）
      var nameMatch = nameKeyword === '' || name.indexOf(nameKeyword) > -1;
      
      // 品牌匹配
      var brandMatch = brandFilter === '' ||
        (brandFilter === '1' && brand.indexOf('理想') > -1) ||
        (brandFilter === '2' && brand.indexOf('问界') > -1) ||
        (brandFilter === '3' && brand.indexOf('小鹏') > -1) ||
        (brandFilter === '5' && brand.indexOf('东风日产') > -1);
      
      // 城市匹配
      var cityMatch = cityFilter === '' || city.indexOf(cityFilter) > -1;
      
      // 门店类型匹配
      var typeMatch = typeFilter === '' || 
        (typeFilter === '1' && type.indexOf('一网店') > -1) ||
        (typeFilter === '2' && type.indexOf('二网店') > -1);
      
      if (nameMatch && brandMatch && cityMatch && typeMatch) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });
    
    // 更新分页信息
    var paginationInfo = document.querySelector('#page-store .pagination-info');
    if (paginationInfo) {
      paginationInfo.textContent = '共 ' + visibleCount + ' 条数据';
    }
  }

  // 清空门店搜索条件
  function clearStoreFilter() {
    document.getElementById('storeSearchName').value = '';
    document.getElementById('storeSearchBrand').value = '';
    document.getElementById('storeSearchCity').value = '';
    document.getElementById('storeSearchType').value = '';
    filterStoreList();
  }

  // 品牌列表搜索过滤
  function filterBrandList() {
    var nameKeyword = document.getElementById('brandSearchName').value.toLowerCase().trim();
    var codeKeyword = document.getElementById('brandSearchCode').value.toLowerCase().trim();
    var statusFilter = document.querySelector('#page-brand .filter-select').value;
    var rows = document.querySelectorAll('#page-brand tbody tr');
    var visibleCount = 0;
    
    rows.forEach(function(row) {
      var nameCell = row.querySelector('td:nth-child(2)');
      var codeCell = row.querySelector('td:nth-child(3) code');
      var statusCell = row.querySelector('td:nth-child(7) .status-badge');
      if (!nameCell) return;
      
      var name = nameCell.textContent.toLowerCase();
      var code = codeCell ? codeCell.textContent.toLowerCase() : '';
      var isActive = statusCell && statusCell.classList.contains('status-active');
      
      var nameMatch = nameKeyword === '' || name.indexOf(nameKeyword) > -1;
      var codeMatch = codeKeyword === '' || code.indexOf(codeKeyword) > -1;
      var statusMatch = statusFilter === '' || (statusFilter === '1' && isActive) || (statusFilter === '0' && !isActive);
      
      if (nameMatch && codeMatch && statusMatch) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });
    
    // 更新分页信息
    var paginationInfo = document.querySelector('#page-brand .pagination-info');
    if (paginationInfo) {
      paginationInfo.textContent = '共 ' + visibleCount + ' 条数据';
    }
  }

  // 清空品牌搜索条件
  function clearBrandFilter() {
    document.getElementById('brandSearchName').value = '';
    document.getElementById('brandSearchCode').value = '';
    document.querySelector('#page-brand .filter-select').value = '';
    filterBrandList();
  }

  // 品牌删除校验
  var brandDeleteId = null;
  
  function deleteBrand(id, name, series, stores, leads) {
    brandDeleteId = id;
    
    // 显示品牌名称
    document.getElementById('brandDeleteName').textContent = name;
    
    // 显示关联信息
    var seriesInfo = document.getElementById('brandDeleteSeriesInfo');
    var storesInfo = document.getElementById('brandDeleteStoresInfo');
    
    if (series > 0 || stores > 0) {
      // 显示关联数据警告
      document.getElementById('brandDeleteWarning').style.display = 'block';
      seriesInfo.innerHTML = series > 0 ? '• 该品牌下共有 <strong style="color: var(--primary);">' + series + ' 个车系</strong>' : '';
      storesInfo.innerHTML = stores > 0 ? '• 该品牌下共有 <strong style="color: var(--primary);">' + stores + ' 家门店</strong>' : '';
    } else {
      // 无关联数据时隐藏警告区域
      document.getElementById('brandDeleteWarning').style.display = 'none';
    }
    
    // 设置确认按钮点击事件
    document.getElementById('brandDeleteConfirmBtn').onclick = function() {
      executeBrandDelete(id, name);
    };
    
    // 打开确认弹窗
    openModal('brandDeleteModal');
  }
  
  function closeBrandDeleteModal() {
    brandDeleteId = null;
    closeModal('brandDeleteModal');
  }
  
  function executeBrandDelete(id, name) {
    closeBrandDeleteModal();
    showToast('已删除品牌「' + name + '」', 'success');
  }

  // 分页切换
  function goToPage(page, container) {
    // 找到分页控件的父容器
    var controls = container || event.target.closest('.pagination-controls');
    if (!controls) return;
    
    // 移除所有 active 状态
    controls.querySelectorAll('.pagination-btn').forEach(function(btn) {
      btn.classList.remove('active');
    });
    
    // 设置当前页为 active
    event.target.classList.add('active');
    showToast('正在加载第 ' + page + ' 页...', 'info');
  }

  // 重置 Key 确认弹窗
  var _resetKeyConfirmOverlay = null;
  var _resetKeyTargetId = null;
  var _resetKeyTargetName = null;
  function resetApiKey(id, name) {
    _resetKeyTargetId = id;
    _resetKeyTargetName = name;
    var html = '<div style="background:#fff;border-radius:16px;padding:28px;max-width:400px;width:90%;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,sans-serif;text-align:center;">' +
      '<div style="width:56px;height:56px;background:#fef3c7;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:28px;margin:0 auto 20px;">⚠️</div>' +
      '<div style="font-size:16px;font-weight:600;color:#1f2937;margin-bottom:12px;">确认重置 API Key</div>' +
      '<div style="font-size:14px;color:#6b7280;margin-bottom:24px;">确定要重置「' + name + '」的 API Key 吗？<br>重置后旧 Key 立即失效，请同步更新对接方配置。</div>' +
      '<div style="display:flex;gap:12px;">' +
        '<button onclick="document.body.removeChild(document.getElementById(\'_resetKeyConfirmOverlay\'));_resetKeyConfirmOverlay=null" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:14px;color:#374151;">取消</button>' +
        '<button onclick="document.body.removeChild(document.getElementById(\'_resetKeyConfirmOverlay\'));_resetKeyConfirmOverlay=null;doResetApiKey(' + id + ',\'' + name + '\')" style="flex:1;padding:10px;border:none;border-radius:8px;background:#dc2626;color:#fff;cursor:pointer;font-size:14px;">确认重置</button>' +
      '</div>' +
    '</div>';

    _resetKeyConfirmOverlay = document.createElement('div');
    _resetKeyConfirmOverlay.id = '_resetKeyConfirmOverlay';
    _resetKeyConfirmOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:9999;display:flex;align-items:center;justify-content:center;';
    _resetKeyConfirmOverlay.innerHTML = html;
    document.body.appendChild(_resetKeyConfirmOverlay);
  }

  // 执行重置 Key
  function doResetApiKey(id, name) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    var newKey = 'dk_';
    for (var i = 0; i < 24; i++) newKey += chars.charAt(Math.floor(Math.random() * chars.length));
    var newSecret = '';
    for (var j = 0; j < 32; j++) newSecret += chars.charAt(Math.floor(Math.random() * chars.length));

    var html = '<div style="background:#fff;border-radius:16px;padding:32px;max-width:480px;width:90%;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,sans-serif;">' +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:24px;">' +
        '<div style="width:40px;height:40px;background:#dbeafe;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;">🔑</div>' +
        '<div><div style="font-size:18px;font-weight:600;color:#1f2937;">API Key 重置成功</div><div style="font-size:13px;color:#6b7280;">请及时同步给「' + name + '」对接方</div></div>' +
      '</div>' +
      '<div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:16px;">' +
        '<div style="font-size:12px;color:#6b7280;margin-bottom:4px;">API Key</div>' +
        '<div style="font-family:monospace;font-size:13px;color:#1f2937;word-break:break-all;" id="_newApiKeyDisplay">' + newKey + '</div>' +
      '</div>' +
      '<div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;">' +
        '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">' +
          '<span style="font-size:12px;color:#6b7280;">API Secret</span>' +
          '<span id="_secretToggleBtn" style="font-size:12px;color:#2563eb;cursor:pointer;">点击显示</span>' +
        '</div>' +
        '<div style="font-family:monospace;font-size:13px;color:#1f2937;word-break:break-all;" id="_newSecretDisplay" data-secret="' + newSecret + '">••••••••••••</div>' +
      '</div>' +
      '<div style="background:#fef3c7;border-radius:8px;padding:12px;font-size:13px;color:#92400e;margin-bottom:24px;">⚠️ 请妥善保管，Secret 仅显示一次</div>' +
      '<div style="display:flex;gap:12px;">' +
        '<button id="_copyKeyBtn" style="flex:1;padding:10px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;cursor:pointer;font-size:14px;">复制 Key</button>' +
        '<button id="_closeKeyBtn" style="flex:1;padding:10px;border:none;border-radius:8px;background:#2563eb;color:#fff;cursor:pointer;font-size:14px;">我已知晓</button>' +
      '</div>' +
    '</div>';

    var overlay = document.createElement('div');
    overlay.id = '_resetKeyOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:9999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);

    // 绑定"点击显示"事件
    var toggleBtn = overlay.querySelector('#_secretToggleBtn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function() {
        var displayEl = overlay.querySelector('#_newSecretDisplay');
        if (!displayEl) return;
        var secret = displayEl.getAttribute('data-secret');
        if (displayEl.textContent === '••••••••••••') {
          displayEl.textContent = secret;
          toggleBtn.textContent = '点击隐藏';
        } else {
          displayEl.textContent = '••••••••••••';
          toggleBtn.textContent = '点击显示';
        }
      });
    }

    // 绑定"复制 Key"事件
    var copyBtn = overlay.querySelector('#_copyKeyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', function() {
        var keyEl = overlay.querySelector('#_newApiKeyDisplay');
        if (keyEl) {
          navigator.clipboard.writeText(keyEl.textContent);
          copyBtn.textContent = '已复制';
          setTimeout(function() { copyBtn.textContent = '复制 Key'; }, 2000);
        }
      });
    }

    // 绑定"我已知晓"事件
    var closeBtn = overlay.querySelector('#_closeKeyBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() {
        document.body.removeChild(overlay);
      });
    }
  }

  // 线索重新下发
  function reDispatchLead(leadCode) {
    // 显示确认弹窗
    var confirmHtml = '<div style="background:#fff;border-radius:16px;padding:24px;max-width:400px;width:90%;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,PingFang SC,Hiragino Sans GB,Microsoft YaHei,sans-serif;">' +
      '<div style="font-size:16px;font-weight:600;color:#1f2937;margin-bottom:12px;">确认重新下发</div>' +
      '<div style="font-size:14px;color:#6b7280;margin-bottom:20px;">确定要重新下发线索 <strong style="color:#1f2937;">' + leadCode + '</strong> 吗？</div>' +
      '<div style="display:flex;gap:12px;justify-content:flex-end;">' +
        '<button id="_reDispatchCancel" style="padding:8px 20px;border:1px solid #e5e7eb;border-radius:8px;background:#fff;color:#374151;cursor:pointer;font-size:14px;">取消</button>' +
        '<button id="_reDispatchConfirm" style="padding:8px 20px;border:none;border-radius:8px;background:#2563eb;color:#fff;cursor:pointer;font-size:14px;">确认下发</button>' +
      '</div>' +
    '</div>';

    var overlay = document.createElement('div');
    overlay.id = '_reDispatchOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.4);z-index:9999;display:flex;align-items:center;justify-content:center;';
    overlay.innerHTML = confirmHtml;
    document.body.appendChild(overlay);

    document.getElementById('_reDispatchCancel').addEventListener('click', function() {
      document.body.removeChild(overlay);
    });
    document.getElementById('_reDispatchConfirm').addEventListener('click', function() {
      document.body.removeChild(overlay);
      // 模拟重新下发成功
      showToast('线索 ' + leadCode + ' 重新下发成功', 'success');
      // 实际项目中此处调用API
    });
  }

  var leadDetailExamples = {
    normal: {
      code: 'LD2026051400001', customerName: '李明', phone: '138****8888', gender: '男', area: '广东省 深圳市 南山区',
      apiKey: '懂车帝', sourceId: 'DCC_20260514_001', levelHtml: '<span class="level-badge level-a">A级</span>',
      receiveTime: '2026-05-14 09:30:15', brand: '理想汽车', vehicle: '理想L9', budget: '30-50万', buyTime: '一个月内',
      statusHtml: '<span class="status-badge status-pending">待下发</span>', store: '深圳理想南山店',
      receiveResult: '已接收', dispatchDecision: '待下发', blacklistCheck: '未命中', interceptCheck: '未命中',
      note: '线索符合接收与下发条件，进入正常下发流程。',
      checkLog: '黑名单与拦截规则校验通过，等待下发。', decisionLog: '线索进入下发队列。'
    },
    processing: {
      code: 'LD2026051400002', customerName: '王芳', phone: '139****9999', gender: '女', area: '广东省 深圳市 福田区',
      apiKey: '汽车之家', sourceId: 'ATH_20260514_002', levelHtml: '<span class="level-badge level-b">B级</span>',
      receiveTime: '2026-05-14 09:15:10', brand: '问界', vehicle: '问界M9', budget: '40-60万', buyTime: '三个月内',
      statusHtml: '<span class="status-badge status-primary">处理中</span>', store: '深圳问界福田店',
      receiveResult: '已接收', dispatchDecision: '下发中', blacklistCheck: '未命中', interceptCheck: '未命中',
      note: '线索符合接收与下发条件，正在执行厂商系统下发。',
      checkLog: '黑名单与拦截规则校验通过，准备下发。', decisionLog: '已调用下游厂商系统接口，等待响应。'
    },
    dispatched: {
      code: 'LD2026051400003', customerName: '张伟', phone: '137****7777', gender: '男', area: '广东省 广州市 天河区',
      apiKey: '易车', sourceId: 'YC_20260514_003', levelHtml: '<span class="level-badge level-a">A级</span>',
      receiveTime: '2026-05-14 08:45:20', brand: '小鹏汽车', vehicle: '小鹏G9', budget: '25-40万', buyTime: '一个月内',
      statusHtml: '<span class="status-badge status-pending">已下发</span>', store: '广州小鹏天河店',
      receiveResult: '已接收', dispatchDecision: '已下发', blacklistCheck: '未命中', interceptCheck: '未命中',
      note: '线索已通过校验并成功下发至下游厂商系统。',
      checkLog: '黑名单与拦截规则校验通过。', decisionLog: '下游厂商系统接收成功。'
    },
    failed: {
      code: 'LD2026051300128', customerName: '刘强', phone: '135****5555', gender: '男', area: '广东省 深圳市 南山区',
      apiKey: '懂车帝', sourceId: 'DCC_20260513_128', levelHtml: '<span class="level-badge level-c">C级</span>',
      receiveTime: '2026-05-13 16:20:03', brand: '理想汽车', vehicle: '理想L8', budget: '30-45万', buyTime: '半年内',
      statusHtml: '<span class="status-badge status-danger">下发失败</span>', store: '深圳理想南山店',
      receiveResult: '已接收', dispatchDecision: '下发失败', blacklistCheck: '未命中', interceptCheck: '未命中',
      note: '线索通过接收校验，但调用下游厂商系统失败，可重新下发。',
      checkLog: '黑名单与拦截规则校验通过。', decisionLog: '调用下游厂商系统失败，等待人工重新下发。'
    },
    blacklist: {
      code: 'LD2026051400004', customerName: '陈敏', phone: '136****0000', gender: '女', area: '上海市 上海市 浦东新区',
      apiKey: '懂车帝', sourceId: 'DCC_20260514_004', levelHtml: '<span class="level-badge level-b">B级</span>',
      receiveTime: '2026-05-14 10:12:08', brand: '东风日产', vehicle: '天籁', budget: '15-25万', buyTime: '三个月内',
      statusHtml: '<span class="status-badge status-danger">仅接收</span>', store: '上海东风日产浦东店',
      receiveResult: '已接收', dispatchDecision: '<span style="color: var(--danger); font-weight: 600;">不下发</span>',
      blacklistCheck: '<span style="color: var(--danger); font-weight: 600;">命中手机号黑名单</span>', interceptCheck: '未继续执行',
      note: '系统保留该线索接收记录，但因命中黑名单，不下发给下游厂商系统。',
      checkLog: '黑名单校验命中：手机号黑名单。', decisionLog: '系统判定为仅接收，不触发下游厂商系统下发。'
    },
    intercept: {
      code: 'LD2026051400005', customerName: '赵强', phone: '188****2222', gender: '男', area: '广东省 深圳市 南山区',
      apiKey: '汽车之家', sourceId: 'ATH_20260514_005', levelHtml: '<span class="level-badge level-a">A级</span>',
      receiveTime: '2026-05-14 10:18:31', brand: '理想汽车', vehicle: '理想L9', budget: '30-50万', buyTime: '一个月内',
      statusHtml: '<span class="status-badge status-warning">仅接收</span>', store: '深圳理想南山店',
      receiveResult: '已接收', dispatchDecision: '<span style="color: var(--warning); font-weight: 600;">不下发</span>',
      blacklistCheck: '未命中', interceptCheck: '<span style="color: var(--warning); font-weight: 600;">命中跨渠道去重规则</span>',
      note: '系统保留该线索接收记录，但因命中拦截规则，不下发给下游厂商系统。',
      checkLog: '拦截规则校验命中：手机号 + 品牌在 7 天内已有有效线索。', decisionLog: '系统判定为仅接收，不触发下游厂商系统下发。'
    }
  };

  function setTextById(id, value) {
    var el = document.getElementById(id);
    if (el) el.textContent = value == null ? '' : value;
  }

  function setHtmlById(id, value) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = value == null ? '' : value;
  }

  function openLeadDetail(type) {
    var data = leadDetailExamples[type] || leadDetailExamples.normal;
    setTextById('leadDetailTitle', '线索详情 - ' + data.code);
    setTextById('leadDetailCustomerName', data.customerName);
    setTextById('leadDetailPhone', data.phone);
    setTextById('leadDetailGender', data.gender);
    setTextById('leadDetailArea', data.area);
    setTextById('leadDetailApiKey', data.apiKey);
    setTextById('leadDetailSourceId', data.sourceId);
    setHtmlById('leadDetailLevel', data.levelHtml);
    setTextById('leadDetailReceiveTime', data.receiveTime);
    setTextById('leadDetailBrand', data.brand);
    setTextById('leadDetailVehicle', data.vehicle);
    setTextById('leadDetailBudget', data.budget);
    setTextById('leadDetailBuyTime', data.buyTime);
    setHtmlById('leadDetailStatus', data.statusHtml);
    setTextById('leadDetailStore', data.store);
    setTextById('leadReceiveResult', data.receiveResult);
    setHtmlById('leadDispatchDecision', data.dispatchDecision);
    setHtmlById('leadBlacklistCheck', data.blacklistCheck);
    setHtmlById('leadInterceptCheck', data.interceptCheck);
    setTextById('leadReceiveCheckNote', data.note);
    setTextById('leadLogCheckTime', data.receiveTime.replace(/:\d\d$/, ':16'));
    setTextById('leadLogDecisionTime', data.receiveTime.replace(/:\d\d$/, ':18'));
    setTextById('leadLogCheckContent', data.checkLog);
    setTextById('leadLogDecisionContent', data.decisionLog);
    switchLeadTab('basic');
    renderLeadExtendedInfo();
    openModal('leadDetailModal');
  }

  // 线索详情弹窗 Tab 切换
  function switchLeadTab(tab) {
    var tabs = document.querySelectorAll('#leadDetailTabs .tab-btn');
    tabs.forEach(function(t) { t.classList.remove('active'); });
    var activeBtn = document.querySelector('#leadDetailTabs .tab-btn[data-tab="' + tab + '"]');
    if (activeBtn) activeBtn.classList.add('active');

    var panels = document.querySelectorAll('.lead-tab-panel');
    panels.forEach(function(p) { p.style.display = 'none'; });
    var activePanel = document.getElementById('leadTab-' + tab);
    if (activePanel) activePanel.style.display = 'block';

    if (tab === 'extended') {
      renderLeadExtendedInfo();
    }
  }

  function renderLeadExtendedInfo() {
    // 从基本信息面板中获取当前线索的意向品牌
    var brandName = '';
    var brandItems = document.querySelectorAll('#leadTab-basic .detail-item');
    brandItems.forEach(function(item) {
      var label = item.querySelector('.detail-label');
      var value = item.querySelector('.detail-value');
      if (label && value && label.textContent.trim() === '意向品牌') {
        brandName = value.textContent.trim();
      }
    });

    var titleEl = document.getElementById('extendedInfoBrandTitle');
    var fieldsEl = document.getElementById('extendedInfoFields');

    // 意向品牌 → brandName 映射（如 "理想汽车" → "理想", "小鹏汽车" → "小鹏"）
    var brandShortName = brandName.replace('汽车', '').trim();

    // 从 _customFieldData 中筛选该品牌的 brand 范围字段
    var brandFields = _customFieldData.filter(function(f) {
      return f.scope === 'brand' && f.status === 1 &&
        (f.brandName === brandShortName || f.brandName === brandName);
    });

    if (!brandFields.length) {
      titleEl.textContent = brandName ? '品牌独立接收字段 - ' + brandName + '（暂无配置）' : '品牌独立接收字段';
      fieldsEl.innerHTML = '<div class="detail-item" style="grid-column: 1 / -1; text-align: center; padding: 24px; color: var(--gray-400);">暂无该品牌可接收的独立字段</div>';
      return;
    }

    titleEl.textContent = '品牌独立接收字段 - ' + brandName;

    var leadBrandFieldValues = {
      LIXIANG: {
        test_drive_intent: '有意试驾',
        trade_in_need: '有旧车需置换'
      },
      WENJIE: {
        store_visit_intent: '本周可到店'
      },
      XIAOPENG: {
        concerned_features: '智能驾驶、音响系统'
      }
    };

    fieldsEl.innerHTML = brandFields.map(function(f) {
      var brandValueMap = leadBrandFieldValues[f.brandCode] || {};
      var displayValue = brandValueMap[f.key] || f.defaultValue || '未传';
      return '<div class="detail-item">' +
        '<div class="detail-label">' + escapeHTML(f.name) + '</div>' +
        '<div class="detail-value">' + escapeHTML(displayValue) + '</div>' +
      '</div>';
    }).join('');
  }

  
