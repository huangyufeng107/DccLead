// ===== Lead Assignment Config =====
const leadAllocationPolicies = [
  {
    id: 'AP-001',
    name: '华南城市分配策略',
    byCity: '是',
    cityAllocations: [
      { city: '广州', allocationMode: 'ratio', allocations: [{ channel: 'AI外呼', percent: 40 }, { channel: '人工外呼', percent: 60 }] },
      { city: '深圳', allocationMode: 'single', allocations: [{ channel: '人工外呼', percent: 100 }] }
    ],
    fallbackCityAllocation: { city: '兜底城市', allocationMode: 'single', allocations: [{ channel: 'AI外呼', percent: 100 }] },
    action: '广州：AI外呼40%，人工外呼60%；深圳：全部分配给人工外呼；兜底城市：全部分配给AI外呼',
    status: '启用',
    updatedAt: '2026-06-12 10:20'
  },
  {
    id: 'AP-002',
    name: 'AI优先承接策略',
    byCity: '否',
    allocationMode: 'single',
    allocations: [{ channel: 'AI外呼', percent: 100 }],
    action: '全部分配给AI外呼',
    status: '启用',
    updatedAt: '2026-06-11 16:35'
  },
  {
    id: 'AP-003',
    name: 'AI人工混合策略',
    byCity: '否',
    allocationMode: 'ratio',
    allocations: [{ channel: 'AI外呼', percent: 70 }, { channel: '人工外呼', percent: 30 }],
    action: 'AI外呼70%，人工外呼30%',
    status: '停用',
    updatedAt: '2026-06-05 09:48'
  }
];
let allocationPolicyCurrentPage = 1;
let allocationPolicyPageSize = 10;

const leadAssignmentDimensions = [
  {
    key: 'series',
    name: '意向车系',
    ruleLabel: '车系线索分配规则',
    owner: '车型运营',
    source: '基础车系字典',
    desc: '按意向车系识别线索应进入的培育路径',
    fields: '意向车系、是否按比例、分配比例配置、外呼类型、排序序号',
    rules: [
      { id: 'CAR-001', name: 'N6车系优先培育', keyValue: 'N6', seriesValues: ['N6'], callTypes: ['AI外呼'], condition: '意向车系=N6', allocationMode: 'single', allocations: [{ channel: 'AI外呼', percent: 100 }], action: '全部分配给AI外呼', ratio: '不按比例', sort: 1, status: '启用', updatedAt: '2026-06-10 10:18' },
      { id: 'CAR-002', name: '轩逸车系人工承接', keyValue: '轩逸', seriesValues: ['轩逸'], callTypes: ['人工外呼'], condition: '意向车系=轩逸', allocationMode: 'single', allocations: [{ channel: '人工外呼', percent: 100 }], action: '全部分配给人工外呼', ratio: '不按比例', sort: 2, status: '启用', updatedAt: '2026-06-09 16:40' },
      { id: 'CAR-003', name: '默认车系暂不分配', keyValue: '其他车系', seriesValues: ['其他车系'], callTypes: ['AI外呼'], condition: '意向车系=其他车系', allocationMode: 'single', allocations: [{ channel: 'AI外呼', percent: 100 }], action: '全部分配给AI外呼', ratio: '不按比例', sort: 9, status: '停用', updatedAt: '2026-06-01 09:12' },
      { id: 'CAR-004', name: 'N6车系华南比例分配', keyValue: 'N6', seriesValues: ['N6'], useAllocationPolicy: '是', allocationPolicyId: 'AP-001', callTypes: ['AI外呼', '人工外呼'], condition: '意向车系=N6 / 分配比例配置=华南城市分配策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：华南城市分配策略', ratio: '比例配置', sort: 3, status: '启用', updatedAt: '2026-06-14 09:36' }
    ]
  },
  {
    key: 'sc',
    name: 'SmartCode',
    ruleLabel: 'SmartCode线索分配规则',
    owner: 'SC运营',
    source: 'SmartCode、基础车系字典',
    desc: '按 SmartCode 和意向车系识别线索应进入的培育路径',
    fields: 'SmartCode、意向车系、是否按比例、分配比例配置、推送时间、排序序号',
    rules: [
      { id: 'SC-001', name: '广州N6-SC定向培育', keyValue: 'SC-N6-0891', scValues: ['SC-N6-0891'], scSeriesValues: ['N6'], useAllocationPolicy: '是', allocationPolicyId: 'AP-001', callTypes: ['AI外呼', '人工外呼'], condition: 'SmartCode=SC-N6-0891 / 意向车系=N6 / 分配比例配置=华南城市分配策略', allocationMode: 'policy', allocations: [], pushTime: { days: ['周一', '周二', '周三', '周四', '周五'], slots: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '18:00' }] }, action: '接入比例配置：华南城市分配策略', ratio: '比例配置', sort: 1, status: '启用', updatedAt: '2026-06-10 11:05' },
      { id: 'SC-002', name: '重点SC智能承接', keyValue: 'SC-GZ-2026', scValues: ['SC-GZ-2026'], scSeriesValues: ['N6', '轩逸'], useAllocationPolicy: '是', allocationPolicyId: 'AP-002', callTypes: ['AI外呼'], condition: 'SmartCode=SC-GZ-2026 / 意向车系=N6、轩逸 / 分配比例配置=AI优先承接策略', allocationMode: 'policy', allocations: [], pushTime: { days: [], slots: [] }, action: '接入比例配置：AI优先承接策略', ratio: '比例配置', sort: 2, status: '启用', updatedAt: '2026-06-08 14:22' },
      { id: 'SC-003', name: '过期SC暂不分配', keyValue: 'SC-OLD-001', scValues: ['SC-OLD-001'], scSeriesValues: [], useAllocationPolicy: '否', allocationPolicyId: '', callTypes: ['AI外呼'], condition: 'SmartCode=SC-OLD-001 / 未接入分配比例配置', allocationMode: 'single', allocations: [{ channel: 'AI外呼', percent: 100 }], pushTime: { days: [], slots: [] }, action: '未接入分配比例配置，全部分配给AI外呼', ratio: '不接入比例配置', sort: 8, status: '停用', updatedAt: '2026-05-28 18:01' }
    ]
  },
  {
    key: 'project',
    name: '大项目名',
    ruleLabel: '大项目名线索分配规则',
    owner: '项目运营',
    source: '大项目名、基础车系字典',
    desc: '按大项目名和意向车系识别线索应进入的培育路径',
    fields: '大项目名、车系、是否按比例、分配比例配置、外呼类型、排序序号',
    rules: [
      { id: 'PROJ-001', name: '新能源专项项目', keyValue: '新能源专项', projectValues: ['新能源专项'], projectSeriesValues: ['N6'], useAllocationPolicy: '是', allocationPolicyId: 'AP-003', callTypes: ['AI外呼', '人工外呼'], condition: '大项目名=新能源专项 / 意向车系=N6 / 分配比例配置=AI人工混合策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：AI人工混合策略', ratio: '比例配置', sort: 1, status: '启用', updatedAt: '2026-06-06 12:33' },
      { id: 'PROJ-002', name: '置换活动项目', keyValue: '置换活动', projectValues: ['置换活动'], projectSeriesValues: ['轩逸'], callTypes: ['人工外呼'], condition: '大项目名=置换活动 / 意向车系=轩逸', allocationMode: 'single', allocations: [{ channel: '人工外呼', percent: 100 }], action: '全部分配给人工外呼', ratio: '不按比例', sort: 3, status: '启用', updatedAt: '2026-06-03 09:30' },
      { id: 'PROJ-003', name: '华南新能源项目分配', keyValue: '新能源专项', projectValues: ['新能源专项'], projectSeriesValues: ['N6', '天籁'], useAllocationPolicy: '是', allocationPolicyId: 'AP-001', callTypes: ['AI外呼', '人工外呼'], condition: '大项目名=新能源专项 / 意向车系=N6、天籁 / 分配比例配置=华南城市分配策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：华南城市分配策略', ratio: '比例配置', sort: 2, status: '启用', updatedAt: '2026-06-12 15:48' }
    ]
  },
  {
    key: 'channel',
    name: '渠道编码',
    ruleLabel: '渠道编码线索分配规则',
    owner: '渠道运营',
    source: 'samrtcode系统-R渠道、基础车系字典',
    desc: '按渠道编码和意向车系识别线索应进入的培育路径',
    fields: '渠道编码、车系、是否按比例、分配比例配置、外呼类型、排序序号',
    rules: [
      { id: 'CH-001', name: 'R1渠道新线索AI外呼', keyValue: 'R1', channelValues: ['R1'], channelSeriesValues: ['N6'], callTypes: ['AI外呼'], condition: '渠道编码=R1 / 意向车系=N6', allocationMode: 'single', allocations: [{ channel: 'AI外呼', percent: 100 }], action: '全部分配给AI外呼', ratio: '不按比例', sort: 1, status: '启用', updatedAt: '2026-06-10 15:20' },
      { id: 'CH-002', name: 'R2渠道人工跟进', keyValue: 'R2', channelValues: ['R2'], channelSeriesValues: ['轩逸'], callTypes: ['人工外呼'], condition: '渠道编码=R2 / 意向车系=轩逸', allocationMode: 'single', allocations: [{ channel: '人工外呼', percent: 100 }], action: '全部分配给人工外呼', ratio: '不按比例', sort: 2, status: '启用', updatedAt: '2026-06-02 13:17' },
      { id: 'CH-003', name: '未知渠道暂缓', keyValue: '未知渠道', channelValues: ['未知渠道'], channelSeriesValues: [], callTypes: ['AI外呼'], condition: '渠道编码=未知渠道', allocationMode: 'single', allocations: [{ channel: 'AI外呼', percent: 100 }], action: '全部分配给AI外呼', ratio: '不按比例', sort: 9, status: '停用', updatedAt: '2026-05-30 08:42' },
      { id: 'CH-004', name: 'R1渠道华南比例分配', keyValue: 'R1', channelValues: ['R1'], channelSeriesValues: ['N6'], useAllocationPolicy: '是', allocationPolicyId: 'AP-001', callTypes: ['AI外呼', '人工外呼'], condition: '渠道编码=R1 / 意向车系=N6 / 分配比例配置=华南城市分配策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：华南城市分配策略', ratio: '比例配置', sort: 3, status: '启用', updatedAt: '2026-06-13 10:26' }
    ]
  },
  {
    key: 'lead-status',
    name: '线索状态',
    ruleLabel: '线索状态分配规则',
    owner: '线索运营',
    source: '线索系统状态字典',
    desc: '按线索状态和意向车系识别线索应进入的培育路径',
    fields: '线索状态、车系、是否按比例、分配比例配置、外呼类型、排序序号',
    rules: [
      { id: 'LS-001', name: '总部高意向进入AI', keyValue: '总部_高意向', leadStatusValues: ['总部_高意向'], leadStatusReasonValues: [], leadStatusSeriesValues: ['N6'], callTypes: ['AI外呼'], condition: '线索状态=总部_高意向 / 意向车系=N6', allocationMode: 'single', allocations: [{ channel: 'AI外呼', percent: 100 }], action: '全部分配给AI外呼', ratio: '不按比例', sort: 1, status: '启用', updatedAt: '2026-06-07 10:10' },
      { id: 'LS-002', name: '总部休眠未购人工跟进', keyValue: '总部_休眠未购', leadStatusValues: ['总部_休眠未购'], leadStatusReasonValues: [], leadStatusSeriesValues: ['轩逸'], callTypes: ['人工外呼'], condition: '线索状态=总部_休眠未购 / 意向车系=轩逸', allocationMode: 'single', allocations: [{ channel: '人工外呼', percent: 100 }], action: '全部分配给人工外呼', ratio: '不按比例', sort: 2, status: '启用', updatedAt: '2026-06-05 18:12' },
      { id: 'LS-003', name: '总部无效状态暂不分配', keyValue: '总部_无效', leadStatusValues: ['总部_无效'], leadStatusReasonValues: ['明确空号'], leadStatusSeriesValues: [], callTypes: ['AI外呼'], condition: '线索状态=总部_无效 / 异常原因=明确空号', allocationMode: 'single', allocations: [{ channel: 'AI外呼', percent: 100 }], action: '全部分配给AI外呼', ratio: '不按比例', sort: 8, status: '启用', updatedAt: '2026-06-01 16:55' },
      { id: 'LS-004', name: '总部高意向华南比例分配', keyValue: '总部_高意向', leadStatusValues: ['总部_高意向'], leadStatusReasonValues: [], leadStatusSeriesValues: ['N6'], useAllocationPolicy: '是', allocationPolicyId: 'AP-001', callTypes: ['AI外呼', '人工外呼'], condition: '线索状态=总部_高意向 / 意向车系=N6 / 分配比例配置=华南城市分配策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：华南城市分配策略', ratio: '比例配置', sort: 3, status: '启用', updatedAt: '2026-06-14 11:18' }
    ]
  },
  {
    key: 'dealer',
    name: '意向门店',
    ruleLabel: '意向门店线索分配规则',
    owner: '门店运营',
    source: '营销平台经销商基础数据、基础车系字典',
    desc: '按意向门店和意向车系和线索状态识别线索应进入的培育路径',
    fields: '意向门店、车系、线索状态、是否按比例、分配比例配置、外呼类型、排序序号',
    rules: [
      { id: 'DLR-001', name: '有意向门店优先人工', keyValue: '广州白云日产', dealerValues: ['广州白云日产'], dealerSeriesValues: ['N6'], dealerLeadStatusValues: ['总部_高意向'], callTypes: ['人工外呼'], condition: '意向门店=广州白云日产 / 意向车系=N6 / 线索状态=总部_高意向', allocationMode: 'single', allocations: [{ channel: '人工外呼', percent: 100 }], action: '全部分配给人工外呼', ratio: '不按比例', sort: 1, status: '启用', updatedAt: '2026-06-10 09:08' },
      { id: 'DLR-002', name: '门店覆盖区AI跟进', keyValue: '深圳南山日产', dealerValues: ['深圳南山日产'], dealerSeriesValues: ['轩逸'], dealerLeadStatusValues: ['总部_休眠未购'], callTypes: ['AI外呼'], condition: '意向门店=深圳南山日产 / 意向车系=轩逸 / 线索状态=总部_休眠未购', allocationMode: 'single', allocations: [{ channel: 'AI外呼', percent: 100 }], action: '全部分配给AI外呼', ratio: '不按比例', sort: 2, status: '启用', updatedAt: '2026-06-04 11:48' },
      { id: 'DLR-003', name: '门店缺失暂不分配', keyValue: '无意向门店', dealerValues: ['无意向门店'], dealerSeriesValues: [], dealerLeadStatusValues: [], callTypes: ['AI外呼'], condition: '意向门店=无意向门店', allocationMode: 'single', allocations: [{ channel: 'AI外呼', percent: 100 }], action: '全部分配给AI外呼', ratio: '不按比例', sort: 9, status: '停用', updatedAt: '2026-05-29 10:31' },
      { id: 'DLR-004', name: '广州门店华南比例分配', keyValue: '广州白云日产', dealerValues: ['广州白云日产'], dealerSeriesValues: ['N6'], dealerLeadStatusValues: ['总部_高意向'], useAllocationPolicy: '是', allocationPolicyId: 'AP-001', callTypes: ['AI外呼', '人工外呼'], condition: '意向门店=广州白云日产 / 意向车系=N6 / 线索状态=总部_高意向 / 分配比例配置=华南城市分配策略', allocationMode: 'policy', allocations: [], action: '接入比例配置：华南城市分配策略', ratio: '比例配置', sort: 3, status: '停用', updatedAt: '2026-06-11 17:18' }
    ]
  }
];
let activeLeadAssignmentDimension = 'series';
let highlightedLeadAssignmentRuleId = '';
let leadAssignmentCurrentPage = 1;
let leadAssignmentPageSize = 10;

function renderLeadAssignmentConfigPage() {
  const page = document.getElementById('leadAssignmentConfigPage');
  if (!page) return;
  const totalRules = leadAssignmentDimensions.reduce((sum, item) => sum + item.rules.length, 0);
  const enabledRules = leadAssignmentDimensions.reduce((sum, item) => sum + item.rules.filter(rule => rule.status === '启用').length, 0);
  const aiRules = leadAssignmentDimensions.reduce((sum, item) => sum + item.rules.filter(rule => rule.action.includes('AI')).length, 0);
  const manualRules = leadAssignmentDimensions.reduce((sum, item) => sum + item.rules.filter(rule => rule.action.includes('人工')).length, 0);
  page.innerHTML = `
    <div class="page-hero">
      <div>
        <div class="page-title">线索分配规则</div>
        <div class="page-desc">用于统一管理线索接收后的线索分配规则，按意向车系、SmartCode、大项目名、线索状态、渠道编码和意向门店等条件判断线索分配给 AI 跟进、人工跟进或暂不分配。</div>
      </div>
      <div class="summary-strip">
        <div class="summary-card"><div class="summary-label">配置维度</div><div class="summary-value">${leadAssignmentDimensions.length}</div></div>
        <div class="summary-card"><div class="summary-label">规则总数</div><div class="summary-value">${totalRules}</div></div>
        <div class="summary-card"><div class="summary-label">启用规则</div><div class="summary-value">${enabledRules}</div></div>
        <div class="summary-card"><div class="summary-label">AI跟进</div><div class="summary-value">${aiRules}</div></div>
        <div class="summary-card"><div class="summary-label">人工跟进</div><div class="summary-value">${manualRules}</div></div>
      </div>
    </div>
    <div class="assignment-dimension-tabs" aria-label="线索分配规则维度">
      ${leadAssignmentDimensions.map(item => `
        <button class="assignment-dimension-tab ${item.key === activeLeadAssignmentDimension ? 'active' : ''}" type="button" onclick="switchLeadAssignmentDimension('${item.key}')">${item.name}</button>
      `).join('')}
    </div>
    <div id="leadAssignmentDimensionPanel"></div>
  `;
  renderLeadAssignmentDimensionPanel();
}

function switchLeadAssignmentDimension(key) {
  activeLeadAssignmentDimension = key;
  leadAssignmentCurrentPage = 1;
  document.querySelectorAll('.assignment-dimension-tab').forEach(item => {
    item.classList.toggle('active', item.textContent.trim() === getLeadAssignmentDimension().name);
  });
  renderLeadAssignmentDimensionPanel();
}

function getLeadAssignmentDimension() {
  return leadAssignmentDimensions.find(item => item.key === activeLeadAssignmentDimension) || leadAssignmentDimensions[0];
}

function isCompactAssignmentDimension(dimension = getLeadAssignmentDimension()) {
  return ['series', 'sc', 'project', 'channel', 'lead-status', 'dealer'].includes(dimension.key);
}

function hasRelatedSeriesCondition(dimension = getLeadAssignmentDimension()) {
  return ['sc', 'project', 'channel', 'lead-status', 'dealer'].includes(dimension.key);
}

function renderLeadAssignmentDimensionPanel() {
  const panel = document.getElementById('leadAssignmentDimensionPanel');
  if (!panel) return;
  const dimension = getLeadAssignmentDimension();
  panel.innerHTML = `
    <div class="assignment-dimension-meta">
      <div class="assignment-meta-item">
        <div class="assignment-meta-label">配置维度</div>
        <div class="assignment-meta-value">${dimension.name}</div>
      </div>
      <div class="assignment-meta-item">
        <div class="assignment-meta-label">用途说明</div>
        <div class="assignment-meta-value">${dimension.desc}</div>
      </div>
      <div class="assignment-meta-item">
        <div class="assignment-meta-label">数据来源</div>
        <div class="assignment-meta-value">${dimension.source}</div>
      </div>
      <div class="assignment-meta-item">
        <div class="assignment-meta-label">维护角色</div>
        <div class="assignment-meta-value">${dimension.owner}</div>
      </div>
    </div>
    <div class="filter-row">
      <span class="filter-label">关键字：</span>
      <input class="lead-input" id="leadAssignmentKeyword" placeholder="请输入内容" oninput="filterLeadAssignmentDimensionTable()" />
      <span class="filter-label">状态：</span>
      <select class="filter-select" id="leadAssignmentStatusFilter" onchange="filterLeadAssignmentDimensionTable()">
        <option value="">全部</option>
        <option value="启用">启用</option>
        <option value="停用">停用</option>
      </select>
      <button class="btn-secondary" type="button" onclick="resetLeadAssignmentFilters()">重置</button>
    </div>
    <div class="policy-rule-note" id="leadAssignmentRuleNote">
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2 1 21h22L12 2zm1 16h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
      <div>用于统一管理线索接收后的线索分配规则，按意向车系、SmartCode、大项目名、线索状态、渠道编码和意向门店等条件判断线索分配给 AI 跟进、人工跟进或暂不分配。</div>
    </div>
    <div class="card">
      <div class="section-header">
        <div>
          <div class="section-title">${getLeadAssignmentRuleLabel(dimension)}列表</div>
        </div>
        <div class="action-btns">
          <button class="btn-secondary" type="button" onclick="openLeadAssignmentImportWizard()">导入数据</button>
          <button class="btn-secondary" type="button" onclick="exportLeadAssignmentRules('${dimension.key}')">导出数据</button>
          <button class="btn-add" type="button" onclick="openLeadAssignmentRuleModal('add')">新增规则</button>
        </div>
      </div>
      <table class="data-table assignment-rule-table">
        <thead>
          <tr>
            ${isCompactAssignmentDimension(dimension) ? '<th style="width:70px">#</th>' : '<th style="width:90px">排序</th>'}
            <th>策略名称</th>
            <th>配置内容</th>
            <th>外呼类型</th>
            <th>匹配条件</th>
            <th>分配动作</th>
            ${isCompactAssignmentDimension(dimension) ? '' : '<th style="width:120px">比例/评级</th>'}
            <th style="width:80px">状态</th>
            <th style="width:190px">操作</th>
          </tr>
        </thead>
        <tbody id="leadAssignmentDimensionTableBody"></tbody>
      </table>
      <div class="pagination">
        <span id="leadAssignmentPageInfo">共 0 条记录，当前第 1 / 1 页</span>
        <div class="pagination-btns">
          <select class="hit-page-size" id="leadAssignmentPageSize" onchange="changeLeadAssignmentPageSize(this.value)">
            <option value="5">每页 5 条</option>
            <option value="10">每页 10 条</option>
            <option value="20">每页 20 条</option>
            <option value="50">每页 50 条</option>
          </select>
          <button class="page-btn" type="button" id="leadAssignmentPrevPage" onclick="changeLeadAssignmentPage(-1)" aria-label="上一页"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <select class="hit-page-size" id="leadAssignmentPageSelect" onchange="selectLeadAssignmentPage(this.value)"></select>
          <button class="page-btn" type="button" id="leadAssignmentNextPage" onclick="changeLeadAssignmentPage(1)" aria-label="下一页"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
    </div>
  `;
  renderLeadAssignmentDimensionTable();
  schedulePolicyRuleNoteAutoHide('leadAssignmentRuleNote');
}

function getAllocationPolicyById(id) {
  return leadAllocationPolicies.find(item => item.id === id);
}

function getAllocationPolicyCallTypes(policy = {}) {
  const allocations = getAllocationPolicyScope(policy) !== 'none'
    ? [
        ...(policy.cityAllocations || []).flatMap(item => item.allocations || []),
        ...((policy.fallbackCityAllocation || {}).allocations || [])
      ]
    : (policy.allocations || []);
  return [...new Set(allocations.map(item => item.channel).filter(Boolean))];
}

function getAllocationPolicySummary(policy = {}) {
  const scope = getAllocationPolicyScope(policy);
  if (scope !== 'none') {
    const config = getAllocationAreaConfig(scope);
    return [
      ...(policy.cityAllocations || []).map(item => `${getCityAllocationAreaLabel(item)}：${renderCityAllocationSummary(item)}`),
      `${config.fallbackLabel}：${renderCityAllocationSummary(policy.fallbackCityAllocation || {})}`
    ].join('；');
  }
  return renderCityAllocationSummary(policy);
}

function getAllocationPolicyScope(policy = {}) {
  if (policy.allocationScope) return policy.allocationScope;
  return policy.byCity === '是' ? 'city' : 'none';
}

function getAllocationPolicyScopeLabel(scopeOrPolicy = {}) {
  const scope = typeof scopeOrPolicy === 'string' ? scopeOrPolicy : getAllocationPolicyScope(scopeOrPolicy);
  if (scope === 'city') return '关联城市';
  if (scope === 'province') return '关联省份';
  return '不按区域';
}

function getAllocationAreaConfig(scope = 'city') {
  const isProvince = scope === 'province';
  return {
    scope,
    valueLabel: isProvince ? '关联省份' : '关联城市',
    fallbackLabel: isProvince ? '兜底省份' : '兜底城市',
    addLabel: isProvince ? '添加省份' : '添加城市',
    hint: isProvince
      ? '关联省份时，先匹配省份；未命中省份时进入兜底省份。每个省份和兜底省份均按类型比例分配。'
      : '关联城市时，先匹配城市；未命中城市时进入兜底城市。每个城市和兜底城市均按类型比例分配。',
    options: isProvince ? assignmentProvinceOptions : assignmentCityOptions,
    defaultValue: isProvince ? assignmentProvinceOptions[0] : assignmentCityOptions[0],
    defaultRows: isProvince
      ? [{ city: '广东省', allocationMode: 'ratio', allocations: getDefaultAssignmentAllocationRows() }]
      : [{ city: '广州', allocationMode: 'ratio', allocations: getDefaultAssignmentAllocationRows() }]
  };
}

function renderAllocationPolicyTemplatePage() {
  const page = document.getElementById('leadAssignmentConfigPage');
  if (!page) return;
  page.innerHTML = `
    <div id="allocationPolicyTemplatePanel"></div>
  `;
  renderAllocationPolicyPanel('allocationPolicyTemplatePanel');
}

function getAllocationPolicyReferences(policyId) {
  return leadAssignmentDimensions.flatMap(dimension => (
    dimension.rules
      .filter(rule => rule.allocationPolicyId === policyId)
      .map(rule => ({
        dimension: dimension.name,
        dimensionKey: dimension.key,
        ruleLabel: dimension.ruleLabel,
        ruleId: rule.id,
        ruleName: rule.name,
        status: rule.status
      }))
  ));
}

function renderAllocationPolicyReferenceSummary(policyId) {
  const references = getAllocationPolicyReferences(policyId);
  if (!references.length) return '<span class="rule-muted">暂无引用</span>';
  return `<span class="rule-text-main">${references.length} 条规则引用</span>`;
}

function renderAllocationPolicyReferenceDetails(policyId) {
  const references = getAllocationPolicyReferences(policyId);
  if (!references.length) return '<div class="rule-detail-value policy-reference-message">当前没有线索分配规则引用此策略，可安全删除。</div>';
  return `
    <div class="rule-detail-value policy-reference-message">当前被以下 ${references.length} 条线索分配规则引用；如需删除，请先在对应线索分配规则中改为其他比例配置或不按比例分配。</div>
    <div class="policy-reference-list">
      ${references.map(item => `<div class="policy-reference-item"><div><strong>${escapeHtml(item.ruleName)}</strong><span>${escapeHtml(item.ruleLabel)}ID · <button class="policy-reference-link" type="button" onclick="openAllocationPolicyReferenceRule('${escapeAttr(item.dimensionKey)}', '${escapeAttr(item.ruleId)}')">${escapeHtml(item.ruleId)}</button></span></div><span class="policy-reference-status ${item.status === '启用' ? 'active' : ''}">${escapeHtml(item.status)}</span></div>`).join('')}
    </div>
  `;
}

function openAllocationPolicyReferenceRule(dimensionKey, ruleId) {
  const dimension = leadAssignmentDimensions.find(item => item.key === dimensionKey);
  const rule = dimension?.rules.find(item => item.id === ruleId);
  if (!dimension || !rule) {
    showToast('未找到对应的线索分配规则', false);
    return;
  }
  activeLeadAssignmentDimension = dimensionKey;
  const orderedRules = [...dimension.rules].sort((a, b) => Number(a.sort || 99) - Number(b.sort || 99));
  const ruleIndex = orderedRules.findIndex(item => item.id === ruleId);
  leadAssignmentCurrentPage = Math.floor(Math.max(ruleIndex, 0) / leadAssignmentPageSize) + 1;
  highlightedLeadAssignmentRuleId = ruleId;
  closeModal('leadDispatchRuleModal');
  const assignmentNav = document.querySelector('.strategy-nav-item[data-page="lead-assignment"]');
  if (assignmentNav) switchStrategyNav(assignmentNav);
  document.querySelector(`[data-rule-id="${ruleId}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function renderAllocationPolicySummary() {
  const enabledCount = leadAllocationPolicies.filter(item => item.status === '启用').length;
  const areaCount = leadAllocationPolicies.filter(item => getAllocationPolicyScope(item) !== 'none').length;
  const callTypeCount = new Set(leadAllocationPolicies.flatMap(policy => getAllocationPolicyCallTypes(policy))).size;
  const referencedCount = leadAssignmentDimensions.reduce((sum, dimension) => {
    return sum + dimension.rules.filter(rule => rule.allocationPolicyId).length;
  }, 0);
  return `
    <div class="summary-strip">
      <div class="summary-card"><div class="summary-label">配置总数</div><div class="summary-value">${leadAllocationPolicies.length}</div></div>
      <div class="summary-card"><div class="summary-label">启用配置</div><div class="summary-value">${enabledCount}</div></div>
      <div class="summary-card"><div class="summary-label">区域配置</div><div class="summary-value">${areaCount}</div></div>
      <div class="summary-card"><div class="summary-label">外呼类型</div><div class="summary-value">${callTypeCount}</div></div>
      <div class="summary-card"><div class="summary-label">引用规则</div><div class="summary-value">${referencedCount}</div></div>
    </div>
  `;
}

function renderAllocationPolicyPanel(targetId = 'leadAssignmentDimensionPanel') {
  const panel = document.getElementById(targetId);
  if (!panel) return;
  panel.innerHTML = `
    <div class="page-hero allocation-policy-inline-hero">
      <div>
        <div class="page-title">分配比例配置</div>
        <div class="page-desc">用于统一维护按比例分配的公共配置，支持关联城市、关联省份、兜底区域、外呼类型比例和独立推送时间配置。启用后的配置可被多类线索分配规则复用，避免重复配置比例和推送时段，保证线索分配口径一致、可追踪。</div>
      </div>
      ${renderAllocationPolicySummary()}
    </div>
    <div class="filter-row">
      <span class="filter-label">外呼类型：</span>
      <select class="filter-select" id="allocationPolicyCallTypeFilter" onchange="filterAllocationPolicyTable()">
        <option value="">全部</option>
        ${[...new Set(leadAllocationPolicies.flatMap(policy => getAllocationPolicyCallTypes(policy)))].map(type => `<option value="${type}">${type}</option>`).join('')}
      </select>
      <span class="filter-label">关联区域：</span>
      <select class="filter-select" id="allocationPolicyCityFilter" onchange="filterAllocationPolicyTable()">
        <option value="">全部</option>
        <option value="none">不按区域</option>
        <option value="city">关联城市</option>
        <option value="province">关联省份</option>
      </select>
      <span class="filter-label">状态：</span>
      <select class="filter-select" id="allocationPolicyStatusFilter" onchange="filterAllocationPolicyTable()">
        <option value="">全部</option>
        <option value="启用">启用</option>
        <option value="停用">停用</option>
      </select>
      <button class="btn-secondary" type="button" onclick="resetAllocationPolicyFilters()">重置</button>
    </div>
    <div class="card">
      <div class="section-header">
        <div>
          <div class="section-title">分配比例配置列表</div>
        </div>
        <div class="action-btns">
          <button class="btn-add strategy-add-btn" type="button" onclick="openAllocationPolicyModal('add')">新增配置</button>
        </div>
      </div>
      <table class="data-table assignment-rule-table">
        <thead>
          <tr>
            <th style="width:70px">#</th>
            <th>配置名称</th>
            <th style="width:110px">关联区域</th>
            <th>线索分配规则</th>
            <th>外呼类型</th>
            <th style="min-width:200px">引用关系</th>
            <th style="width:80px">状态</th>
            <th style="width:190px">操作</th>
          </tr>
        </thead>
        <tbody id="allocationPolicyTableBody"></tbody>
      </table>
      <div class="pagination">
        <span id="allocationPolicyPageInfo">共 0 条记录，当前第 1 / 1 页</span>
        <div class="pagination-btns">
          <select class="hit-page-size" id="allocationPolicyPageSize" onchange="changeAllocationPolicyPageSize(this.value)">
            <option value="5">每页 5 条</option>
            <option value="10">每页 10 条</option>
            <option value="20">每页 20 条</option>
            <option value="50">每页 50 条</option>
          </select>
          <button class="page-btn" type="button" onclick="changeAllocationPolicyPage(-1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>
          <select class="hit-page-size" id="allocationPolicyPageSelect" onchange="selectAllocationPolicyPage(this.value)"></select>
          <button class="page-btn" type="button" onclick="changeAllocationPolicyPage(1)"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button>
        </div>
      </div>
    </div>
  `;
  renderAllocationPolicyTable();
}

function getFilteredAllocationPolicies() {
  const callType = document.getElementById('allocationPolicyCallTypeFilter')?.value || '';
  const byCity = document.getElementById('allocationPolicyCityFilter')?.value || '';
  const status = document.getElementById('allocationPolicyStatusFilter')?.value || '';
  return leadAllocationPolicies.filter(policy => {
    if (callType && !getAllocationPolicyCallTypes(policy).includes(callType)) return false;
    if (byCity && getAllocationPolicyScope(policy) !== byCity) return false;
    if (status && policy.status !== status) return false;
    return true;
  });
}

function renderAllocationPolicyTable() {
  const body = document.getElementById('allocationPolicyTableBody');
  if (!body) return;
  const rows = getFilteredAllocationPolicies();
  const totalPages = Math.max(1, Math.ceil(rows.length / allocationPolicyPageSize));
  if (allocationPolicyCurrentPage > totalPages) allocationPolicyCurrentPage = totalPages;
  const start = (allocationPolicyCurrentPage - 1) * allocationPolicyPageSize;
  const pageRows = rows.slice(start, start + allocationPolicyPageSize);
  const info = document.getElementById('allocationPolicyPageInfo');
  if (info) info.textContent = `共 ${rows.length} 条记录，当前第 ${allocationPolicyCurrentPage} / ${totalPages} 页`;
  const pageSelect = document.getElementById('allocationPolicyPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, index) => `<option value="${index + 1}">第 ${index + 1} 页</option>`).join('');
    pageSelect.value = String(allocationPolicyCurrentPage);
  }
  const pageSizeSelect = document.getElementById('allocationPolicyPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(allocationPolicyPageSize);
  body.innerHTML = pageRows.length ? pageRows.map((policy, index) => `
    <tr>
      <td class="row-index">${start + index + 1}</td>
      <td>
        <div class="rule-text-stack">
          <div class="rule-text-main">${policy.name}</div>
          <div class="rule-muted">配置ID：${policy.id}</div>
        </div>
      </td>
      <td>${getAllocationPolicyScopeLabel(policy)}</td>
      <td>${renderClampedCellText(getAllocationPolicySummary(policy))}</td>
      <td>${renderClampedCellText(getAllocationPolicyCallTypes(policy).join('、'))}</td>
      <td>${renderAllocationPolicyReferenceSummary(policy.id)}</td>
      <td>${policy.status === '启用' ? '<span class="col-status-on">● 启用</span>' : '<span class="col-status-off">● 停用</span>'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view" type="button" onclick="openAllocationPolicyModal('view', '${policy.id}')">查看</button>
          <button class="action-btn edit" type="button" onclick="openAllocationPolicyModal('edit', '${policy.id}')">编辑</button>
          <button class="action-btn delete" type="button" onclick="deleteAllocationPolicy('${policy.id}')">删除</button>
        </div>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="8"><div class="empty-state">暂无匹配的分配比例配置</div></td></tr>';
}

function filterAllocationPolicyTable() {
  allocationPolicyCurrentPage = 1;
  renderAllocationPolicyTable();
}

function resetAllocationPolicyFilters() {
  const callType = document.getElementById('allocationPolicyCallTypeFilter');
  const byCity = document.getElementById('allocationPolicyCityFilter');
  const status = document.getElementById('allocationPolicyStatusFilter');
  if (callType) callType.value = '';
  if (byCity) byCity.value = '';
  if (status) status.value = '';
  filterAllocationPolicyTable();
}

function changeAllocationPolicyPageSize(value) {
  allocationPolicyPageSize = Number(value) || 10;
  allocationPolicyCurrentPage = 1;
  renderAllocationPolicyTable();
}

function changeAllocationPolicyPage(dir) {
  const rows = getFilteredAllocationPolicies();
  const totalPages = Math.max(1, Math.ceil(rows.length / allocationPolicyPageSize));
  allocationPolicyCurrentPage = Math.min(Math.max(1, allocationPolicyCurrentPage + dir), totalPages);
  renderAllocationPolicyTable();
}

function selectAllocationPolicyPage(value) {
  allocationPolicyCurrentPage = Number(value) || 1;
  renderAllocationPolicyTable();
}

function getFilteredLeadAssignmentRules() {
  const dimension = getLeadAssignmentDimension();
  const keyword = document.getElementById('leadAssignmentKeyword')?.value.trim().toLowerCase() || '';
  const status = document.getElementById('leadAssignmentStatusFilter')?.value || '';
  return dimension.rules.filter(rule => {
    if (status && rule.status !== status) return false;
    if (!keyword) return true;
    return [rule.name, rule.id, rule.keyValue, rule.condition, rule.action, rule.ratio].some(value => String(value || '').toLowerCase().includes(keyword));
  }).sort((a, b) => Number(a.sort || 99) - Number(b.sort || 99));
}

function getLeadAssignmentRuleLabel(dimension) {
  return dimension.ruleLabel || `${dimension.name}策略`;
}

function renderLeadAssignmentDimensionTable() {
  const body = document.getElementById('leadAssignmentDimensionTableBody');
  if (!body) return;
  const rows = getFilteredLeadAssignmentRules();
  const dimension = getLeadAssignmentDimension();
  const totalPages = Math.max(1, Math.ceil(rows.length / leadAssignmentPageSize));
  leadAssignmentCurrentPage = Math.min(leadAssignmentCurrentPage, totalPages);
  const start = (leadAssignmentCurrentPage - 1) * leadAssignmentPageSize;
  const pageRows = rows.slice(start, start + leadAssignmentPageSize);
  const pageInfo = document.getElementById('leadAssignmentPageInfo');
  if (pageInfo) pageInfo.textContent = `共 ${rows.length} 条记录，当前第 ${leadAssignmentCurrentPage} / ${totalPages} 页`;
  const pageSizeSelect = document.getElementById('leadAssignmentPageSize');
  if (pageSizeSelect) pageSizeSelect.value = String(leadAssignmentPageSize);
  const pageSelect = document.getElementById('leadAssignmentPageSelect');
  if (pageSelect) {
    pageSelect.innerHTML = Array.from({ length: totalPages }, (_, index) => `<option value="${index + 1}">第 ${index + 1} 页</option>`).join('');
    pageSelect.value = String(leadAssignmentCurrentPage);
  }
  const prevButton = document.getElementById('leadAssignmentPrevPage');
  const nextButton = document.getElementById('leadAssignmentNextPage');
  if (prevButton) prevButton.disabled = leadAssignmentCurrentPage <= 1;
  if (nextButton) nextButton.disabled = leadAssignmentCurrentPage >= totalPages;
  body.innerHTML = pageRows.length ? pageRows.map((rule, index) => `
    <tr class="${rule.id === highlightedLeadAssignmentRuleId ? 'referenced-rule-highlight' : ''}" data-rule-id="${rule.id}">
      ${isCompactAssignmentDimension(dimension) ? `<td class="row-index">${start + index + 1}</td>` : `<td><strong>P${rule.sort}</strong></td>`}
      <td>
        <div class="rule-text-stack">
          <div class="rule-text-main">${rule.name}</div>
          <div class="rule-muted">规则ID：${rule.id}</div>
        </div>
      </td>
      <td>${isCompactAssignmentDimension(dimension) ? renderClampedCellText(getCompactAssignmentSelectedValues(rule, dimension).join('、')) : `<strong>${rule.keyValue}</strong>`}</td>
      <td>${isCompactAssignmentDimension(dimension) ? renderClampedCellText((rule.callTypes || []).join('、')) : renderRuleChipList(rule.callTypes, 'blue', 2)}</td>
      <td>${isCompactAssignmentDimension(dimension) ? renderCompactConditionCell(rule, dimension) : rule.condition}</td>
      <td>${isCompactAssignmentDimension(dimension) ? renderClampedCellText(rule.action) : `<strong>${rule.action}</strong>`}</td>
      ${isCompactAssignmentDimension(dimension) ? '' : `<td>${rule.ratio || '—'}</td>`}
      <td>${rule.status === '启用' ? '<span class="col-status-on">● 启用</span>' : '<span class="col-status-off">● 停用</span>'}</td>
      <td>
        <div class="action-btns">
          <button class="action-btn view" type="button" onclick="openLeadAssignmentRuleModal('view', '${rule.id}')">查看</button>
          <button class="action-btn edit" type="button" onclick="openLeadAssignmentRuleModal('edit', '${rule.id}')">编辑</button>
          <button class="action-btn delete" type="button" onclick="deleteLeadAssignmentRule('${rule.id}')">删除</button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="${isCompactAssignmentDimension(dimension) ? 8 : 9}"><div class="empty-state">暂无匹配的线索分配规则</div></td></tr>`;
}

function resetLeadAssignmentFilters() {
  const keyword = document.getElementById('leadAssignmentKeyword');
  const status = document.getElementById('leadAssignmentStatusFilter');
  if (keyword) keyword.value = '';
  if (status) status.value = '';
  leadAssignmentCurrentPage = 1;
  renderLeadAssignmentDimensionTable();
}

function filterLeadAssignmentDimensionTable() {
  leadAssignmentCurrentPage = 1;
  renderLeadAssignmentDimensionTable();
}

function changeLeadAssignmentPageSize(value) {
  leadAssignmentPageSize = Number(value) || 10;
  leadAssignmentCurrentPage = 1;
  renderLeadAssignmentDimensionTable();
}

function selectLeadAssignmentPage(value) {
  leadAssignmentCurrentPage = Number(value) || 1;
  renderLeadAssignmentDimensionTable();
}

function changeLeadAssignmentPage(direction) {
  const totalPages = Math.max(1, Math.ceil(getFilteredLeadAssignmentRules().length / leadAssignmentPageSize));
  leadAssignmentCurrentPage = Math.max(1, Math.min(totalPages, leadAssignmentCurrentPage + direction));
  renderLeadAssignmentDimensionTable();
}

function deleteLeadAssignmentRule(id) {
  const dimension = getLeadAssignmentDimension();
  const rule = dimension.rules.find(item => item.id === id);
  if (!rule) return;
  if (!confirm(`确认删除${getLeadAssignmentRuleLabel(dimension)}「${rule.name}」？`)) return;
  dimension.rules = dimension.rules.filter(item => item.id !== id);
  showToast(`${getLeadAssignmentRuleLabel(dimension)}已删除`, true);
  renderLeadAssignmentConfigPage();
}

let editingLeadAssignmentRuleId = null;
let editingAllocationPolicyId = null;

function renderAllocationPolicyDetail(policy) {
  if (!policy) return '<div class="empty-state">未找到分配比例配置</div>';
  return `
    <div class="rule-detail-layout">
      <div class="rule-detail-section">
        <div class="rule-detail-title">基础信息</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">配置名称</div><div class="rule-detail-value">${detailValue(policy.name)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">配置ID</div><div class="rule-detail-value">${detailValue(policy.id)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">状态</div><div class="rule-detail-value">${detailValue(policy.status)}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">更新时间</div><div class="rule-detail-value">${detailValue(policy.updatedAt)}</div></div>
        </div>
      </div>
      <div class="rule-detail-section">
        <div class="rule-detail-title">线索分配规则</div>
        <div class="rule-detail-body">
          <div class="rule-detail-field"><div class="rule-detail-label">关联区域</div><div class="rule-detail-value">${detailValue(getAllocationPolicyScopeLabel(policy))}</div></div>
          <div class="rule-detail-field wide"><div class="rule-detail-label">规则内容</div><div class="rule-detail-value">${detailValue(getAllocationPolicySummary(policy))}</div></div>
          <div class="rule-detail-field"><div class="rule-detail-label">外呼类型</div><div class="rule-detail-value">${detailValue(getAllocationPolicyCallTypes(policy).join('、'))}</div></div>
        </div>
      </div>
      <div class="rule-detail-section">
        <div class="rule-detail-title">引用关系</div>
        ${renderAllocationPolicyReferenceDetails(policy.id)}
      </div>
    </div>
  `;
}

function renderAllocationPolicyForm(policy = {}) {
  const allocationScope = getAllocationPolicyScope(policy);
  const allocations = getSeriesAllocation(policy);
  const defaultAllocations = allocations.length ? allocations : getDefaultAssignmentAllocationRows();
  return `
    <section class="dispatch-form-section">
      <div class="dispatch-section-title">基础信息</div>
      <div class="dispatch-form-grid">
        <div class="form-group">
          <div class="form-label">配置名称 <span class="required">*</span></div>
          <input class="form-input" id="allocationPolicyName" value="${escapeAttr(policy.name || '')}" placeholder="例：华南城市分配策略" />
        </div>
        <div class="form-group">
          <div class="form-label">状态</div>
          <select class="form-input" id="allocationPolicyStatus">
            ${['启用', '停用'].map(status => `<option value="${status}" ${policy.status === status ? 'selected' : ''}>${status}</option>`).join('')}
          </select>
          <div class="form-hint">只有启用状态的分配比例配置可被线索分配规则引用。</div>
        </div>
      </div>
    </section>

    <section class="dispatch-form-section">
      <div class="dispatch-section-title">分配动作</div>
    <div class="series-action-box">
      <div class="form-group">
        <div class="form-label">关联区域 <span class="required">*</span></div>
        <input type="hidden" id="allocationPolicyByCity" value="${allocationScope === 'none' ? '否' : '是'}" />
        <input type="hidden" id="allocationPolicyScope" value="${allocationScope}" />
        <select class="form-input" id="allocationPolicyScopeSelect" onchange="switchAllocationPolicyCityMode(this.value)">
          <option value="none" ${allocationScope === 'none' ? 'selected' : ''}>不按区域</option>
          <option value="city" ${allocationScope === 'city' ? 'selected' : ''}>关联城市</option>
          <option value="province" ${allocationScope === 'province' ? 'selected' : ''}>关联省份</option>
        </select>
        <div class="form-hint">可按全国统一比例分配，也可按城市或省份分别配置比例与兜底规则。</div>
      </div>
      <div id="allocationPolicyDefaultAllocationPanel" style="${allocationScope !== 'none' ? 'display:none' : ''}">
        <div class="form-group">
          <div class="form-label allocation-call-type-title">外呼类型 <span class="required">*</span></div>
          <div class="allocation-call-type-prompt">请在下方配置外呼类型及比例</div>
          <div class="assignment-allocation-panel" id="seriesAllocationRows">
            ${defaultAllocations.map(item => renderSeriesAllocationRow(item)).join('')}
          </div>
          <button class="series-add-channel-btn" type="button" onclick="addSeriesAllocationRow()">添加外呼类型</button>
          <div class="series-form-hint">分配比例配置默认按比例处理，各外呼类型比例合计必须为 100%。</div>
        </div>
      </div>
      <div class="form-group" id="allocationPolicyCityAllocationPanel" style="${allocationScope !== 'none' ? '' : 'display:none'}">
        <div class="form-label" id="allocationPolicyAreaPanelLabel">${getAllocationPolicyScopeLabel(allocationScope)}配置 <span class="required">*</span></div>
        <div id="allocationPolicyAreaAllocationContent">${renderSmartCodeCityAllocationPanel(policy, allocationScope)}</div>
      </div>
    </div>
    </section>
  `;
}

function openAllocationPolicyModal(mode, id = null) {
  const policy = id ? getAllocationPolicyById(id) : null;
  editingAllocationPolicyId = mode === 'edit' ? id : null;
  const titleMap = { add: '新增分配比例配置', edit: '编辑分配比例配置', view: '查看分配比例配置' };
  const page = document.getElementById('leadAssignmentConfigPage');
  if (!page) return;
  const subtitle = mode === 'add'
    ? '培育策略 / AI外呼配置 / 分配比例配置 / 新增配置'
    : `培育策略 / AI外呼配置 / 分配比例配置 / ${policy?.name || '配置详情'}`;
  page.innerHTML = `
    <div class="allocation-policy-detail-page">
      <div class="detail-page-header">
        <div>
          <div class="detail-page-title">${titleMap[mode] || '分配比例配置'}</div>
          <div class="detail-page-subtitle">${escapeHtml(subtitle)}</div>
        </div>
        <div class="lead-toolbar-right">
          ${mode === 'view'
            ? `<button class="btn-secondary" type="button" onclick="closeAllocationPolicyPage()">返回列表</button><button class="btn-add" type="button" onclick="openAllocationPolicyModal('edit', '${escapeAttr(policy?.id || '')}')">编辑配置</button>`
            : `<button class="btn-secondary" type="button" onclick="closeAllocationPolicyPage()">取消</button><button class="btn-add" type="button" onclick="saveAllocationPolicy()">保存</button>`}
        </div>
      </div>
      <div class="lead-detail-content">
        <div class="allocation-policy-form-card">
          ${mode === 'view'
            ? renderAllocationPolicyDetail(policy)
            : renderAllocationPolicyForm(policy || { status: '启用', byCity: '否', allocationMode: 'single', allocations: [{ channel: '', percent: 100 }] })}
        </div>
      </div>
    </div>
  `;
  refreshCityAllocationSelectionMutex();
}

function closeAllocationPolicyPage() {
  editingAllocationPolicyId = null;
  renderAllocationPolicyTemplatePage();
}

function switchAllocationPolicyCityMode(triggerOrValue, maybeValue) {
  const value = maybeValue || (triggerOrValue === '是' ? 'city' : triggerOrValue === '否' ? 'none' : triggerOrValue);
  if (maybeValue && triggerOrValue) {
    const group = triggerOrValue.closest('.allocation-city-toggle');
    group?.querySelectorAll('.duration-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.allocationCityMode === value);
    });
  }
  const hiddenInput = document.getElementById('allocationPolicyByCity');
  if (hiddenInput) hiddenInput.value = value === 'none' ? '否' : '是';
  const scopeInput = document.getElementById('allocationPolicyScope');
  if (scopeInput) scopeInput.value = value;
  const scopeSelect = document.getElementById('allocationPolicyScopeSelect');
  if (scopeSelect) scopeSelect.value = value;
  const cityPanel = document.getElementById('allocationPolicyCityAllocationPanel');
  const defaultPanel = document.getElementById('allocationPolicyDefaultAllocationPanel');
  if (cityPanel) cityPanel.style.display = value !== 'none' ? '' : 'none';
  if (defaultPanel) defaultPanel.style.display = value !== 'none' ? 'none' : '';
  const label = document.getElementById('allocationPolicyAreaPanelLabel');
  if (label && value !== 'none') label.innerHTML = `${getAllocationPolicyScopeLabel(value)}配置 <span class="required">*</span>`;
  const content = document.getElementById('allocationPolicyAreaAllocationContent');
  if (content && value !== 'none') content.innerHTML = renderSmartCodeCityAllocationPanel({}, value);
  refreshCityAllocationSelectionMutex();
}

function saveAllocationPolicy() {
  const name = document.getElementById('allocationPolicyName')?.value.trim() || '';
  const allocationScope = document.getElementById('allocationPolicyScope')?.value || (document.getElementById('allocationPolicyByCity')?.value === '是' ? 'city' : 'none');
  const byCity = allocationScope === 'none' ? '否' : '是';
  if (!name) { showToast('请填写配置名称', false); return; }
  let payload = {
    name,
    byCity,
    allocationScope,
    status: document.getElementById('allocationPolicyStatus')?.value || '启用',
    updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
  };
  if (allocationScope !== 'none') {
    const cityResult = collectSmartCodeCityAllocations(allocationScope);
    if (!cityResult.ok) { showToast(cityResult.message, false); return; }
    const config = getAllocationAreaConfig(allocationScope);
    payload = {
      ...payload,
      ...cityResult.value,
      allocationMode: 'policy-city',
      allocations: [],
      action: [
        ...cityResult.value.cityAllocations.map(item => `${getCityAllocationAreaLabel(item)}：${renderCityAllocationSummary(item)}`),
        `${config.fallbackLabel}：${renderCityAllocationSummary(cityResult.value.fallbackCityAllocation)}`
      ].join('；')
    };
  } else {
    const allocationResult = collectAllocationRowsFromPanel(document.getElementById('seriesAllocationRows'), name);
    if (!allocationResult.ok) { showToast(allocationResult.message, false); return; }
    const allocations = allocationResult.value;
    payload = {
      ...payload,
      allocationMode: 'ratio',
      allocations,
      allocationScope: 'none',
      cityAllocations: [],
      fallbackCityAllocation: null,
      action: renderCityAllocationSummary({ allocationMode: 'ratio', allocations })
    };
  }
  if (editingAllocationPolicyId) {
    const index = leadAllocationPolicies.findIndex(item => item.id === editingAllocationPolicyId);
    if (index > -1) leadAllocationPolicies[index] = { ...leadAllocationPolicies[index], ...payload };
    showToast('分配比例配置已更新', true);
  } else {
    const nextNo = leadAllocationPolicies.length + 1;
    leadAllocationPolicies.push({ id: `AP-${String(nextNo).padStart(3, '0')}`, ...payload });
    showToast('分配比例配置已创建', true);
  }
  closeAllocationPolicyPage();
}

function deleteAllocationPolicy(id) {
  const policy = getAllocationPolicyById(id);
  if (!policy) return;
  const references = getAllocationPolicyReferences(id);
  if (references.length) {
    showToast(`配置「${policy.name}」被 ${references.length} 条线索分配规则引用，请先解除关联后再删除`, false);
    return;
  }
  if (!confirm(`确认删除分配比例配置「${policy.name}」？`)) return;
  const index = leadAllocationPolicies.findIndex(item => item.id === id);
  if (index > -1) leadAllocationPolicies.splice(index, 1);
  showToast('分配比例配置已删除', true);
  renderAllocationPolicyTemplatePage();
}

function exportLeadAssignmentRules(dimensionKey) {
  const dimension = leadAssignmentDimensions.find(item => item.key === dimensionKey);
  if (!dimension) return;
  const rows = dimension.rules.map(rule => [
    rule.id || '',
    rule.name || '',
    rule.keyValue || '',
    rule.condition || '',
    rule.action || '',
    (rule.callTypes || []).join('、'),
    String(rule.sort || ''),
    rule.status || '',
    rule.updatedAt || ''
  ]);
  const sheets = [
    {
      name: `${dimension.name}分配规则`,
      columns: ['规则ID', '策略名称', '配置内容', '匹配条件', '分配动作', '外呼类型', '排序/权重', '状态', '更新时间'],
      rows: rows
    }
  ];
  downloadExcelWorkbookFile(
    `${dimension.name}线索分配规则导出_${new Date().toISOString().slice(0, 10)}.xls`,
    sheets,
    `已成功导出 ${dimension.rules.length} 条${dimension.name}分配规则`
  );
}

document.addEventListener('click', function(event) {
  if (event.target.closest('.area-multi-picker')) return;
  document.querySelectorAll('.area-multi-picker.open').forEach(item => item.classList.remove('open'));
});

