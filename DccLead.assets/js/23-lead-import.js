// ===== 线索导入页面 (100% 完整对齐版) =====

/**
 * 列表字段：
 * 序号 | 文件名称 | 导入结果 | 下发结果 | 总行数 | 创建账号 | 创建时间 | 操作
 *
 * 筛选查询字段：
 * 文件名称 (件名称) | 导入结果 (请选择) | 下发结果 (请选择) | 创建时间
 */

let leadImportFilter = {
  fileName: '',
  importResult: '',
  dispatchResult: '',
  startDate: '',
  endDate: ''
};

let leadImportPagination = {
  currentPage: 1,
  pageSize: 10
};

// 预置导入历史与下发业务模拟数据
let leadImportList = [
  {
    id: 1,
    fileName: '2026年9月全国车展留资线索_第03批.xlsx',
    importResult: '全部成功',
    dispatchResult: '全部下发',
    totalRows: 1250,
    successRows: 1250,
    failRows: 0,
    dispatchedRows: 1250,
    creatorAccount: 'admin_hq (总部管理员)',
    createTime: '2026-09-16 14:20:15',
    dispatchTarget: '下发到NEV线索中台',
    fileSize: '1.8 MB',
    failLogs: []
  },
  {
    id: 2,
    fileName: 'NEV秋季新媒体矩阵推广线索_0915.xlsx',
    importResult: '部分成功',
    dispatchResult: '部分下发',
    totalRows: 860,
    successRows: 825,
    failRows: 35,
    dispatchedRows: 780,
    creatorAccount: 'dcc_supervisor (李主管)',
    createTime: '2026-09-15 11:32:48',
    dispatchTarget: '下发到总部培育客服',
    fileSize: '1.2 MB',
    failLogs: [
      { rowNo: 12, phone: '138****0129', name: '王*宇', error: '手机号已在培育线索池中存在（重复线索）' },
      { rowNo: 47, phone: '159****8831', name: '赵*刚', error: '意向专营店编码在系统中不存在或已停用' },
      { rowNo: 108, phone: '186****9922', name: '李*琴', error: '手机号格式不合法（位数校验失败）' }
    ],
    dispatchFailLogs: [
      { rowNo: 214, phone: '139****3678', name: '周*敏', error: '目标系统校验未通过：门店服务范围不匹配' }
    ]
  },
  {
    id: 3,
    fileName: '懂车帝留资补录导入表_0914.csv',
    importResult: '全部成功',
    dispatchResult: '全部下发',
    totalRows: 430,
    successRows: 430,
    failRows: 0,
    dispatchedRows: 430,
    creatorAccount: 'marketing_op01 (运营小张)',
    createTime: '2026-09-14 16:45:10',
    dispatchTarget: '下发到NEV线索中台',
    fileSize: '520 KB',
    failLogs: []
  },
  {
    id: 4,
    fileName: '总部呼叫中心未接通二次导入_0913.xlsx',
    importResult: '部分成功',
    dispatchResult: '全部下发',
    totalRows: 620,
    successRows: 598,
    failRows: 22,
    dispatchedRows: 598,
    creatorAccount: 'admin_hq (总部管理员)',
    createTime: '2026-09-13 10:15:33',
    dispatchTarget: '下发到总部培育客服',
    fileSize: '950 KB',
    failLogs: [
      { rowNo: 23, phone: '135****4412', name: '张*华', error: '客户在黑名单拦截库中（拒访用户）' },
      { rowNo: 89, phone: '177****5566', name: '刘*洋', error: '意向车系映射未匹配到有效车型' }
    ]
  },
  {
    id: 5,
    fileName: '8月老车主置换专场导入数据.xlsx',
    importResult: '导入失败',
    dispatchResult: '未下发',
    totalRows: 310,
    successRows: 0,
    failRows: 310,
    dispatchedRows: 0,
    creatorAccount: 'crm_sync_user (系统同步)',
    createTime: '2026-09-12 17:08:22',
    dispatchTarget: '暂不下发',
    fileSize: '410 KB',
    failLogs: [
      { rowNo: '全部', phone: '—', name: '—', error: 'Excel模板表头关键必填字段不匹配，缺少【意向专营店】与【线索R渠道】' }
    ]
  },
  {
    id: 6,
    fileName: '易车网高潜线索导入批次_0911.xlsx',
    importResult: '全部成功',
    dispatchResult: '下发失败',
    totalRows: 540,
    successRows: 540,
    failRows: 0,
    dispatchedRows: 0,
    creatorAccount: 'dcc_supervisor (李主管)',
    createTime: '2026-09-11 09:28:40',
    dispatchTarget: '下发到NEV线索中台',
    fileSize: '780 KB',
    failLogs: [],
    dispatchFailLogs: [
      { rowNo: 18, phone: '137****2186', name: '何*晨', error: '目标系统服务暂不可用，未完成下发' },
      { rowNo: 56, phone: '186****7601', name: '宋*妍', error: '目标系统请求超时，未完成下发' }
    ]
  },
  {
    id: 7,
    fileName: '官网预约试驾线索导入_0910.xlsx',
    importResult: '全部成功',
    dispatchResult: '全部下发',
    totalRows: 780,
    successRows: 780,
    failRows: 0,
    dispatchedRows: 780,
    creatorAccount: 'admin_hq (总部管理员)',
    createTime: '2026-09-10 15:50:12',
    dispatchTarget: '下发到NEV线索中台',
    fileSize: '1.1 MB',
    failLogs: []
  },
  {
    id: 8,
    fileName: '短视频直播间留资汇总_0909.csv',
    importResult: '部分成功',
    dispatchResult: '部分下发',
    totalRows: 390,
    successRows: 368,
    failRows: 22,
    dispatchedRows: 340,
    creatorAccount: 'marketing_op02 (运营小刘)',
    createTime: '2026-09-09 13:12:05',
    dispatchTarget: '下发到总部培育客服',
    fileSize: '460 KB',
    failLogs: [
      { rowNo: 5, phone: '131****7788', name: '钱*明', error: '手机号码空缺' },
      { rowNo: 72, phone: '188****3321', name: '周*生', error: '重复导入（30天内相同留资手机）' }
    ],
    dispatchFailLogs: [
      { rowNo: 156, phone: '136****4932', name: '吴*迪', error: '目标系统返回门店编码失效，未完成下发' }
    ]
  },
  {
    id: 9,
    fileName: '区域巡展专项留资导入_0908.xlsx',
    importResult: '全部成功',
    dispatchResult: '全部下发',
    totalRows: 510,
    successRows: 510,
    failRows: 0,
    dispatchedRows: 510,
    creatorAccount: 'dcc_supervisor (李主管)',
    createTime: '2026-09-08 14:05:18',
    dispatchTarget: '下发到NEV线索中台',
    fileSize: '680 KB',
    failLogs: []
  },
  {
    id: 10,
    fileName: '异业合作潜客线索导入_0905.xlsx',
    importResult: '全部成功',
    dispatchResult: '未下发',
    totalRows: 260,
    successRows: 260,
    failRows: 0,
    dispatchedRows: 0,
    creatorAccount: 'admin_hq (总部管理员)',
    createTime: '2026-09-05 16:30:20',
    dispatchTarget: '暂不下发',
    fileSize: '340 KB',
    failLogs: []
  }
];

// 导入弹窗暂存状态
let leadImportModalState = {
  step: 1,
  fileName: '',
  fileSize: '',
  fileData: [],
  importType: 'new',
  dispatchAction: 'nev',
  validCount: 0,
  failCount: 0,
  dupCount: 0
};

function ensureLeadImportPageStyles() {
  if (document.getElementById('lead-import-page-runtime-styles')) return;
  const style = document.createElement('style');
  style.id = 'lead-import-page-runtime-styles';
  style.textContent = `
    #leadImportPage .lead-import-filter-card{margin-bottom:16px;padding:16px 20px}
    #leadImportPage .lead-import-filter-title{margin-bottom:14px;color:#1e293b;font-size:15px;font-weight:700}
    #leadImportPage .lead-import-filter-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr)) minmax(320px,1.25fr) auto;gap:16px 20px;align-items:end}
    #leadImportPage .lead-import-filter-grid label{display:flex;flex-direction:column;color:#475569;font-size:13px;font-weight:500}
    #leadImportPage .lead-import-filter-grid .form-input{width:100%;height:34px;margin-top:6px;box-sizing:border-box;font-size:13px}
    #leadImportPage .lead-import-date-range{display:flex;align-items:center;gap:6px}#leadImportPage .lead-import-date-range .form-input{flex:1;min-width:0}
    #leadImportPage .lead-import-filter-actions{display:flex;align-items:flex-end;gap:8px;margin:0}#leadImportPage .lead-import-filter-actions button{min-width:66px;height:34px}
    #leadImportPage .lead-import-list-card{padding:0;overflow:hidden}#leadImportPage .lead-import-list-header{min-height:64px;margin:0;padding:0 20px;border-bottom:1px solid #e8eef7}
    #leadImportPage .lead-import-list-header>div:first-child{display:flex;align-items:baseline;gap:10px}#leadImportPage .lead-import-record-count{color:#94a3b8;font-size:12px}
    #leadImportPage .lead-import-header-actions{display:flex;gap:8px}#leadImportPage .lead-import-list-card .pagination{margin:0!important;padding:12px 20px!important;background:#fff}
    #leadImportPage .lead-import-file-cell{max-width:360px}#leadImportPage .lead-import-file-name{display:flex;align-items:center;gap:7px;min-width:0;color:#1e293b;font-size:13px;font-weight:500}#leadImportPage .lead-import-file-name span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}#leadImportPage .lead-import-file-meta{margin-top:4px;color:#94a3b8;font-size:12px}
    #leadImportPage .lead-import-status{display:inline-flex;align-items:center;height:22px;padding:0 7px;border-radius:3px;font-size:12px;font-weight:500;white-space:nowrap}#leadImportPage .lead-import-status.success{background:#edf8f0;color:#287a44}#leadImportPage .lead-import-status.warning{background:#fff7e8;color:#a16207}#leadImportPage .lead-import-status.danger{background:#fff1f0;color:#c2413d}#leadImportPage .lead-import-status.neutral{background:#f1f5f9;color:#64748b}
    #leadImportPage .lead-import-row-count{color:#1e293b;font-weight:500;text-align:right}#leadImportPage .lead-import-operation-cell{text-align:left;padding-left:22px;white-space:nowrap}#leadImportPage .lead-import-row-actions{display:inline-flex;align-items:center;gap:12px}
    #leadImportPage .lead-import-inline-action{height:28px;padding:0;border:0!important;background:transparent!important;color:#2563eb;font-size:13px;font-weight:500;cursor:pointer}#leadImportPage .lead-import-inline-action:hover{color:#1d4ed8;text-decoration:underline;text-underline-offset:3px}#leadImportPage .lead-import-inline-action.view{color:#0f766e}#leadImportPage .lead-import-inline-action.view:hover{color:#0f766e}#leadImportPage .lead-import-inline-action.danger{min-width:54px;padding:0 10px;border-radius:6px;background:#ff4d4f!important;color:#fff}#leadImportPage .lead-import-inline-action.danger:hover{background:#d9363e!important;color:#fff;text-decoration:none}
    #leadImportPage .lead-import-empty-action{margin-top:12px;height:30px;padding:0 12px;border:1px solid #93c5fd;border-radius:4px;background:#eff6ff;color:#2563eb;font-size:12px;cursor:pointer}
    @media(max-width:1240px){#leadImportPage .lead-import-filter-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#leadImportPage .lead-import-filter-actions{grid-column:1/-1;justify-content:flex-end}}@media(max-width:760px){#leadImportPage .lead-import-filter-grid{grid-template-columns:1fr}#leadImportPage .lead-import-list-header{align-items:flex-start;flex-direction:column;gap:10px;padding:14px 16px}}
  `;
  document.head.appendChild(style);
}

/**
 * 页面主渲染函数
 */
function renderLeadImportPage() {
  ensureLeadImportPageStyles();
  const page = document.getElementById('leadImportPage');
  if (!page) return;

  const totalBatches = leadImportList.length;
  const totalRowsCount = leadImportList.reduce((sum, item) => sum + item.totalRows, 0);
  const totalSuccessCount = leadImportList.reduce((sum, item) => sum + item.successRows, 0);
  const totalDispatchedCount = leadImportList.reduce((sum, item) => sum + item.dispatchedRows, 0);
  const successRate = totalRowsCount > 0 ? Math.round((totalSuccessCount / totalRowsCount) * 100) : 0;

  page.innerHTML = `
    <!-- 头部摘要信息条 -->
    <div class="page-hero">
      <div>
        <div class="page-title">线索导入</div>
        <div class="page-desc">支持批量导入外部销售线索并同步跟踪导入与下发结果，提供多格式解析校验、自动去重及多系统分流下发能力。</div>
      </div>
      <div class="summary-strip">
        <div class="summary-card">
          <div class="summary-label">导入批次总数</div>
          <div class="summary-value" style="color:#1890ff">${totalBatches}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">累计导入总行数</div>
          <div class="summary-value">${totalRowsCount.toLocaleString()}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">导入校验成功率</div>
          <div class="summary-value" style="color:#52c41a">${successRate}%</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">累计下发成功数</div>
          <div class="summary-value" style="color:#722ed1">${totalDispatchedCount.toLocaleString()}</div>
        </div>
      </div>
    </div>

    <!-- 筛选查询：沿用站内列表页的紧凑筛选层级 -->
    <section class="card lead-import-filter-card">
      <div class="lead-import-filter-title">筛选查询</div>
      <div class="lead-import-filter-grid">
        
        <!-- 筛选 1: 文件名称 (件名称) -->
        <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
          文件名称
          <input class="form-input" id="leadImportFilterFileName" value="${typeof escapeHtml === 'function' ? escapeHtml(leadImportFilter.fileName) : leadImportFilter.fileName}" placeholder="请输入文件名称" />
        </label>

        <!-- 筛选 2: 导入结果 -->
        <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
          导入结果
          <select class="form-input" id="leadImportFilterImportResult">
            <option value="" ${leadImportFilter.importResult === '' ? 'selected' : ''}>请选择</option>
            <option value="全部成功" ${leadImportFilter.importResult === '全部成功' ? 'selected' : ''}>全部成功</option>
            <option value="部分成功" ${leadImportFilter.importResult === '部分成功' ? 'selected' : ''}>部分成功</option>
            <option value="导入失败" ${leadImportFilter.importResult === '导入失败' ? 'selected' : ''}>导入失败</option>
          </select>
        </label>

        <!-- 筛选 3: 下发结果 -->
        <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
          下发结果
          <select class="form-input" id="leadImportFilterDispatchResult">
            <option value="" ${leadImportFilter.dispatchResult === '' ? 'selected' : ''}>请选择</option>
            <option value="全部下发" ${leadImportFilter.dispatchResult === '全部下发' ? 'selected' : ''}>全部下发</option>
            <option value="部分下发" ${leadImportFilter.dispatchResult === '部分下发' ? 'selected' : ''}>部分下发</option>
            <option value="未下发" ${leadImportFilter.dispatchResult === '未下发' ? 'selected' : ''}>未下发</option>
            <option value="下发失败" ${leadImportFilter.dispatchResult === '下发失败' ? 'selected' : ''}>下发失败</option>
          </select>
        </label>

        <!-- 筛选 4: 创建时间 -->
        <label style="display:flex; flex-direction:column; font-size:12px; color:#334155; font-weight:500;">
          创建时间
          <div class="lead-import-date-range">
            <input type="date" class="form-input" id="leadImportFilterStartDate" value="${leadImportFilter.startDate}" />
            <span style="color:#8c8c8c; font-size:12px;">至</span>
            <input type="date" class="form-input" id="leadImportFilterEndDate" value="${leadImportFilter.endDate}" />
          </div>
        </label>
        <div class="lead-import-filter-actions">
          <button class="btn-primary" type="button" onclick="searchLeadImportList()">查询</button>
          <button class="btn-secondary" type="button" onclick="resetLeadImportFilter()">重置</button>
        </div>
      </div>
    </section>

    <!-- 数据表格卡片 -->
    <section class="card lead-import-list-card">
      <div class="section-header lead-import-list-header">
        <div><div class="section-title">线索导入列表</div><span id="leadImportRecordCount" class="lead-import-record-count">共 ${getFilteredLeadImportList().length} 条记录</span></div>
        <div class="action-btns lead-import-header-actions">
          <button class="btn-secondary" type="button" onclick="downloadLeadTemplate()" style="display:inline-flex; align-items:center; gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            导入模板
          </button>
          <button class="btn-primary" type="button" onclick="openLeadImportModal()" style="display:inline-flex; align-items:center; gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            导入数据
          </button>
        </div>
      </div>

      <!-- 表格内容 (100% 对齐用户指定的 8 个列表字段) -->
      <div class="lead-table-wrap" style="overflow-x:auto;">
        <table class="data-table" style="min-width:1050px; width:100%;">
          <thead>
            <tr>
              <th style="width:60px; text-align:center;">序号</th>
              <th style="min-width:240px;">文件名称</th>
              <th style="width:110px; text-align:center;">导入结果</th>
              <th style="width:110px; text-align:center;">下发结果</th>
              <th style="width:90px; text-align:right;">总行数</th>
              <th style="width:170px;">创建账号</th>
              <th style="width:160px;">创建时间</th>
              <th style="width:260px; text-align:left; padding-left:22px;">操作</th>
            </tr>
          </thead>
          <tbody id="leadImportTableBody">
            ${renderLeadImportTableRows()}
          </tbody>
        </table>
      </div>

      <!-- 分页区域 -->
      <div id="leadImportPaginationWrap" style="margin-top:0;">
        ${renderLeadImportPagination()}
      </div>
    </section>

    <!-- 弹窗挂载容器 -->
    <div id="leadImportModalContainer"></div>
  `;
}

/**
 * 获取根据筛选条件过滤后的数据列表
 */
function getFilteredLeadImportList() {
  return leadImportList.filter(item => {
    if (leadImportFilter.fileName && !item.fileName.toLowerCase().includes(leadImportFilter.fileName.toLowerCase().trim())) {
      return false;
    }
    if (leadImportFilter.importResult && item.importResult !== leadImportFilter.importResult) {
      return false;
    }
    if (leadImportFilter.dispatchResult && item.dispatchResult !== leadImportFilter.dispatchResult) {
      return false;
    }
    if (leadImportFilter.startDate) {
      const itemDate = item.createTime.split(' ')[0];
      if (itemDate < leadImportFilter.startDate) return false;
    }
    if (leadImportFilter.endDate) {
      const itemDate = item.createTime.split(' ')[0];
      if (itemDate > leadImportFilter.endDate) return false;
    }
    return true;
  });
}

function getLeadImportExceptionLogs(item) {
  const importLogs = Array.isArray(item.failLogs)
    ? item.failLogs.map(log => ({ ...log, stage: '导入校验' }))
    : [];
  const dispatchLogs = Array.isArray(item.dispatchFailLogs)
    ? item.dispatchFailLogs.map(log => ({ ...log, stage: '线索下发' }))
    : [];
  return [...importLogs, ...dispatchLogs];
}

function escapeLeadImportCsvCell(value) {
  const text = String(value ?? '');
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadLeadImportCsv(fileName, headers, rows) {
  const csvRows = [headers, ...rows].map(row => row.map(escapeLeadImportCsvCell).join(','));
  const blob = new Blob(['\ufeff' + csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

function getLeadImportDownloadBaseName(fileName) {
  return String(fileName || '线索导入批次')
    .replace(/\.[^.]+$/, '')
    .replace(/[\\/:*?"<>|]/g, '_');
}

/**
 * 渲染表格行内容
 */
function renderLeadImportTableRows() {
  const filtered = getFilteredLeadImportList();
  if (filtered.length === 0) {
    return `
      <tr>
        <td colspan="8" style="text-align:center; padding:48px 0; color:#8c8c8c;">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d9d9d9" stroke-width="1.5" style="margin-bottom:8px;"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <div>暂无符合条件的导入记录</div>
          <button class="lead-import-empty-action" type="button" onclick="openLeadImportModal()">导入数据</button>
        </td>
      </tr>
    `;
  }

  const start = (leadImportPagination.currentPage - 1) * leadImportPagination.pageSize;
  const pageRows = filtered.slice(start, start + leadImportPagination.pageSize);

  return pageRows.map((item, index) => {
    const rowNo = start + index + 1;

    // 导入结果徽标
    let importTagHtml = '';
    if (item.importResult === '全部成功') {
      importTagHtml = '<span class="lead-import-status success">全部成功</span>';
    } else if (item.importResult === '部分成功') {
      importTagHtml = '<span class="lead-import-status warning">部分成功</span>';
    } else {
      importTagHtml = '<span class="lead-import-status danger">导入失败</span>';
    }

    // 下发结果徽标
    let dispatchTagHtml = '';
    if (item.dispatchResult === '全部下发') {
      dispatchTagHtml = '<span class="lead-import-status success">全部下发</span>';
    } else if (item.dispatchResult === '部分下发') {
      dispatchTagHtml = '<span class="lead-import-status warning">部分下发</span>';
    } else if (item.dispatchResult === '下发失败') {
      dispatchTagHtml = '<span class="lead-import-status danger">下发失败</span>';
    } else {
      dispatchTagHtml = '<span class="lead-import-status neutral">未下发</span>';
    }

    // 页面宽度充足，按记录状态直接平铺可用操作，避免再进入二级菜单。
    const inlineActions = [];
    const exceptionLogs = getLeadImportExceptionLogs(item);
    inlineActions.push(`<button type="button" class="lead-import-inline-action view" onclick="showLeadImportDetail(${item.id})">查看</button>`);

    inlineActions.push(`<button type="button" class="lead-import-inline-action" onclick="downloadImportFile(${item.id})">下载源文件</button>`);

    if (exceptionLogs.length > 0) {
      inlineActions.push(`<button type="button" class="lead-import-inline-action" onclick="downloadImportFailLog(${item.id})">下载异常明细</button>`);
    }

    inlineActions.push(`<button type="button" class="lead-import-inline-action danger" onclick="deleteLeadImportRecord(${item.id})">删除</button>`);

    const safeFileName = typeof escapeHtml === 'function' ? escapeHtml(item.fileName) : item.fileName;
    const safeCreator = typeof escapeHtml === 'function' ? escapeHtml(item.creatorAccount) : item.creatorAccount;
    const safeTarget = typeof escapeHtml === 'function' ? escapeHtml(item.dispatchTarget || 'NEV线索中台') : (item.dispatchTarget || 'NEV线索中台');

    return `
      <tr>
        <td style="text-align:center; color:#8c8c8c;">${rowNo}</td>
        <td class="lead-import-file-cell">
          <div class="lead-import-file-name" title="${safeFileName}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1890ff" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>${safeFileName}</span>
          </div>
          <div class="lead-import-file-meta">${item.fileSize || '850 KB'} · ${safeTarget}</div>
        </td>
        <td style="text-align:center;">${importTagHtml}</td>
        <td style="text-align:center;">${dispatchTagHtml}</td>
        <td class="lead-import-row-count">${item.totalRows.toLocaleString()}</td>
        <td>
          <div style="color:#262626; font-size:13px;">${safeCreator}</div>
        </td>
        <td style="color:#595959; font-size:12px;">${item.createTime}</td>
        <td class="lead-import-operation-cell">
          <div class="lead-import-row-actions">
            ${inlineActions.join('')}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * 渲染分页控件
 */
function renderLeadImportPagination() {
  const filtered = getFilteredLeadImportList();
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / leadImportPagination.pageSize));
  const currentPage = Math.min(leadImportPagination.currentPage, totalPages);

  let pageOptions = '';
  for (let p = 1; p <= totalPages; p++) {
    pageOptions += `<option value="${p}" ${p === currentPage ? 'selected' : ''}>第 ${p} 页</option>`;
  }

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  return `
    <div class="pagination" style="display:flex; justify-content:space-between; align-items:center; padding:12px 0;">
      <span style="font-size:13px; color:#64748b;">共 ${total} 条记录，当前第 ${currentPage} / ${totalPages} 页</span>
      <div class="pagination-btns" style="display:flex; align-items:center; gap:8px;">
        <select class="hit-page-size" onchange="changeLeadImportPageSize(this.value)">
          <option value="5" ${leadImportPagination.pageSize === 5 ? 'selected' : ''}>每页 5 条</option>
          <option value="10" ${leadImportPagination.pageSize === 10 ? 'selected' : ''}>每页 10 条</option>
          <option value="20" ${leadImportPagination.pageSize === 20 ? 'selected' : ''}>每页 20 条</option>
          <option value="50" ${leadImportPagination.pageSize === 50 ? 'selected' : ''}>每页 50 条</option>
        </select>
        <button class="page-btn ${isPrevDisabled ? 'disabled' : ''}" type="button" ${isPrevDisabled ? 'disabled' : ''} onclick="changeLeadImportPage(-1)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <select class="hit-page-size" onchange="jumpLeadImportPage(this.value)">
          ${pageOptions}
        </select>
        <button class="page-btn ${isNextDisabled ? 'disabled' : ''}" type="button" ${isNextDisabled ? 'disabled' : ''} onclick="changeLeadImportPage(1)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  `;
}

/**
 * 筛选查询执行
 */
function searchLeadImportList() {
  const fileNameEl = document.getElementById('leadImportFilterFileName');
  const importResultEl = document.getElementById('leadImportFilterImportResult');
  const dispatchResultEl = document.getElementById('leadImportFilterDispatchResult');
  const startDateEl = document.getElementById('leadImportFilterStartDate');
  const endDateEl = document.getElementById('leadImportFilterEndDate');

  leadImportFilter.fileName = fileNameEl ? fileNameEl.value.trim() : '';
  leadImportFilter.importResult = importResultEl ? importResultEl.value : '';
  leadImportFilter.dispatchResult = dispatchResultEl ? dispatchResultEl.value : '';
  leadImportFilter.startDate = startDateEl ? startDateEl.value : '';
  leadImportFilter.endDate = endDateEl ? endDateEl.value : '';

  leadImportPagination.currentPage = 1;

  refreshLeadImportTableAndPagination();
  showToast('查询成功，已刷新线索导入列表', true);
}

/**
 * 筛选重置
 */
function resetLeadImportFilter() {
  leadImportFilter = {
    fileName: '',
    importResult: '',
    dispatchResult: '',
    startDate: '',
    endDate: ''
  };
  leadImportPagination.currentPage = 1;

  const fileNameEl = document.getElementById('leadImportFilterFileName');
  const importResultEl = document.getElementById('leadImportFilterImportResult');
  const dispatchResultEl = document.getElementById('leadImportFilterDispatchResult');
  const startDateEl = document.getElementById('leadImportFilterStartDate');
  const endDateEl = document.getElementById('leadImportFilterEndDate');

  if (fileNameEl) fileNameEl.value = '';
  if (importResultEl) importResultEl.value = '';
  if (dispatchResultEl) dispatchResultEl.value = '';
  if (startDateEl) startDateEl.value = '';
  if (endDateEl) endDateEl.value = '';

  refreshLeadImportTableAndPagination();
  showToast('已重置筛选条件', true);
}

/**
 * 刷新表格行与分页容器
 */
function refreshLeadImportTableAndPagination() {
  const tbody = document.getElementById('leadImportTableBody');
  if (tbody) tbody.innerHTML = renderLeadImportTableRows();

  const pWrap = document.getElementById('leadImportPaginationWrap');
  if (pWrap) pWrap.innerHTML = renderLeadImportPagination();

  const recordCount = document.getElementById('leadImportRecordCount');
  if (recordCount) recordCount.textContent = `共 ${getFilteredLeadImportList().length} 条记录`;
}

/**
 * 切换翻页
 */
function changeLeadImportPage(delta) {
  const filtered = getFilteredLeadImportList();
  const totalPages = Math.max(1, Math.ceil(filtered.length / leadImportPagination.pageSize));
  const newPage = leadImportPagination.currentPage + delta;
  if (newPage >= 1 && newPage <= totalPages) {
    leadImportPagination.currentPage = newPage;
    refreshLeadImportTableAndPagination();
  }
}

/**
 * 指定页跳转
 */
function jumpLeadImportPage(page) {
  leadImportPagination.currentPage = parseInt(page, 10) || 1;
  refreshLeadImportTableAndPagination();
}

/**
 * 每页条数变更
 */
function changeLeadImportPageSize(size) {
  leadImportPagination.pageSize = parseInt(size, 10) || 10;
  leadImportPagination.currentPage = 1;
  refreshLeadImportTableAndPagination();
}

/**
 * 下载标准导入模板
 */
function downloadLeadTemplate() {
  downloadLeadImportCsv('线索数据导入模板.csv',
    ['客户姓名', '手机号', '意向车系', 'R渠道编码'],
    [['张三', '13800138000', 'N6', 'R1']]
  );
  showToast('导入模板已下载', true);
}

/**
 * 下载源文件：原型中生成该批次的可下载源文件清单；正式环境应由文件服务返回原始对象。
 */
function downloadImportFile(id) {
  const item = leadImportList.find(h => h.id === id);
  if (!item) return;
  const baseName = getLeadImportDownloadBaseName(item.fileName);
  downloadLeadImportCsv(`${baseName}_源文件清单.csv`,
    ['原文件名称', '文件大小', '导入目标', '导入总行数', '导入成功行数', '导入失败行数', '下发成功行数', '创建账号', '创建时间'],
    [[item.fileName, item.fileSize || '—', item.dispatchTarget || '—', item.totalRows, item.successRows, item.failRows, item.dispatchedRows, item.creatorAccount, item.createTime]]
  );
  showToast(`已下载源文件清单：${item.fileName}`, true);
}

/**
 * 下载异常明细：统一导出导入校验与线索下发两个阶段的异常，不提供在线修订或重提。
 */
function downloadImportFailLog(id) {
  const item = leadImportList.find(h => h.id === id);
  if (!item) return;
  const exceptionLogs = getLeadImportExceptionLogs(item);
  if (!exceptionLogs.length) {
    showToast('该批次不存在可下载的异常明细', false);
    return;
  }
  const baseName = getLeadImportDownloadBaseName(item.fileName);
  downloadLeadImportCsv(`${baseName}_异常明细.csv`,
    ['异常阶段', '原始行号', '客户姓名', '联系电话', '失败原因'],
    exceptionLogs.map(log => [log.stage, log.rowNo, log.name, log.phone, log.error])
  );
  showToast(`已下载 ${exceptionLogs.length} 条异常明细`, true);
}

/**
 * 删除导入记录
 */
function deleteLeadImportRecord(id) {
  const item = leadImportList.find(h => h.id === id);
  if (!item) return;

  if (confirm(`确定删除导入记录【${item.fileName}】吗？删除后不可恢复。`)) {
    leadImportList = leadImportList.filter(h => h.id !== id);
    refreshLeadImportTableAndPagination();
    showToast('导入记录已删除', true);
  }
}

/**
 * 查看详情弹窗
 */
function showLeadImportDetail(id) {
  const item = leadImportList.find(h => h.id === id);
  if (!item) return;

  const container = document.getElementById('leadImportModalContainer');
  if (!container) return;

  const safeFileName = typeof escapeHtml === 'function' ? escapeHtml(item.fileName) : item.fileName;
  const safeCreator = typeof escapeHtml === 'function' ? escapeHtml(item.creatorAccount) : item.creatorAccount;
  const safeTarget = typeof escapeHtml === 'function' ? escapeHtml(item.dispatchTarget || 'NEV线索中台') : (item.dispatchTarget || 'NEV线索中台');

  const failRowsHtml = item.failLogs && item.failLogs.length > 0 ? `
    <div style="margin-top:20px;">
      <div style="font-weight:600; font-size:14px; margin-bottom:8px; color:#ff4d4f; display:flex; align-items:center; gap:6px;">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        异常校验日志明细 (${item.failLogs.length} 条)
      </div>
      <div style="max-height:220px; overflow-y:auto; border:1px solid #f0f0f0; border-radius:6px;">
        <table class="data-table" style="margin:0; width:100%;">
          <thead>
            <tr style="background:#fafafa;">
              <th style="width:70px;">行号</th>
              <th style="width:120px;">手机号</th>
              <th style="width:100px;">姓名</th>
              <th>异常原因</th>
            </tr>
          </thead>
          <tbody>
            ${item.failLogs.map(l => {
              const safePhone = typeof escapeHtml === 'function' ? escapeHtml(l.phone) : l.phone;
              const safeName = typeof escapeHtml === 'function' ? escapeHtml(l.name) : l.name;
              const safeError = typeof escapeHtml === 'function' ? escapeHtml(l.error) : l.error;
              return `
                <tr>
                  <td style="color:#8c8c8c;">${l.rowNo}</td>
                  <td style="font-family:monospace;">${safePhone}</td>
                  <td>${safeName}</td>
                  <td style="color:#ff4d4f;">${safeError}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>
  ` : `
    <div style="margin-top:20px; padding:16px; background:#f6ffed; border:1px solid #b7eb8f; border-radius:6px; color:#52c41a; font-size:13px; display:flex; align-items:center; gap:8px;">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
      本批次文件所有线索均校验通过，无异常阻断记录。
    </div>
  `;

  container.innerHTML = `
    <div style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:1000; display:flex; align-items:center; justify-content:center;">
      <div style="background:#fff; width:720px; max-width:90vw; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,0.2); overflow:hidden; display:flex; flex-direction:column; max-height:88vh;">
        <div style="padding:16px 24px; border-bottom:1px solid #f0f0f0; display:flex; justify-content:space-between; align-items:center; background:#fafafa;">
          <div style="font-size:16px; font-weight:600; color:#262626;">导入批次详情</div>
          <button type="button" onclick="closeLeadImportModal()" style="border:none; background:none; font-size:20px; cursor:pointer; color:#8c8c8c;">&times;</button>
        </div>

        <div style="padding:24px; overflow-y:auto; flex:1;">
          <!-- 统计概览卡片 -->
          <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-bottom:20px;">
            <div style="background:#f8fafc; padding:12px; border-radius:6px; text-align:center;">
              <div style="font-size:12px; color:#64748b;">总解析行数</div>
              <div style="font-size:20px; font-weight:700; color:#1e293b; margin-top:4px;">${item.totalRows}</div>
            </div>
            <div style="background:#f0fdf4; padding:12px; border-radius:6px; text-align:center;">
              <div style="font-size:12px; color:#16a34a;">导入成功</div>
              <div style="font-size:20px; font-weight:700; color:#16a34a; margin-top:4px;">${item.successRows}</div>
            </div>
            <div style="background:#fef2f2; padding:12px; border-radius:6px; text-align:center;">
              <div style="font-size:12px; color:#dc2626;">导入校验失败</div>
              <div style="font-size:20px; font-weight:700; color:#dc2626; margin-top:4px;">${item.failRows}</div>
            </div>
            <div style="background:#f5f3ff; padding:12px; border-radius:6px; text-align:center;">
              <div style="font-size:12px; color:#7c3aed;">成功下发数</div>
              <div style="font-size:20px; font-weight:700; color:#7c3aed; margin-top:4px;">${item.dispatchedRows}</div>
            </div>
          </div>

          <!-- 属性列表 -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px 24px; font-size:13px; background:#fafafa; padding:16px; border-radius:8px;">
            <div><span style="color:#8c8c8c;">文件名称：</span><strong style="color:#262626;">${safeFileName}</strong></div>
            <div><span style="color:#8c8c8c;">文件大小：</span><span>${item.fileSize || '850 KB'}</span></div>
            <div><span style="color:#8c8c8c;">创建账号：</span><span>${safeCreator}</span></div>
            <div><span style="color:#8c8c8c;">创建时间：</span><span>${item.createTime}</span></div>
            <div><span style="color:#8c8c8c;">导入结果：</span><span style="font-weight:600; color:${item.importResult === '全部成功' ? '#52c41a' : item.importResult === '部分成功' ? '#faad14' : '#ff4d4f'};">${item.importResult}</span></div>
            <div><span style="color:#8c8c8c;">下发结果：</span><span style="font-weight:600; color:${item.dispatchResult === '全部下发' ? '#52c41a' : item.dispatchResult === '部分下发' ? '#1890ff' : '#8c8c8c'};">${item.dispatchResult}</span></div>
            <div><span style="color:#8c8c8c;">下发目标：</span><span>${safeTarget}</span></div>
          </div>

          ${failRowsHtml}
        </div>

        <div style="padding:12px 24px; border-top:1px solid #f0f0f0; display:flex; justify-content:flex-end; gap:8px; background:#fff;">
          ${item.failRows > 0 ? `<button class="btn-secondary" type="button" onclick="downloadImportFailLog(${item.id})">下载错误日志</button>` : ''}
          <button class="btn-primary" type="button" onclick="closeLeadImportModal()">关闭</button>
        </div>
      </div>
    </div>
  `;
}

/**
 * 打开导入线索弹窗
 */
function openLeadImportModal() {
  leadImportModalState = {
    step: 1,
    fileName: '',
    fileSize: '',
    fileData: [],
    importType: 'new',
    dispatchAction: 'nev',
    validCount: 0,
    failCount: 0,
    dupCount: 0,
    result: null
  };

  renderLeadImportModalContent();
}

/**
 * 关闭弹窗
 */
function closeLeadImportModal() {
  const container = document.getElementById('leadImportModalContainer');
  if (container) container.innerHTML = '';
}

/**
 * 渲染导入线索多步骤弹窗
 */
function renderLeadImportModalLegacyContent() {
  const container = document.getElementById('leadImportModalContainer');
  if (!container) return;

  const step = leadImportModalState.step;

  let bodyHtml = '';
  let footerHtml = '';

  if (step === 1) {
    const safeModalFileName = typeof escapeHtml === 'function' ? escapeHtml(leadImportModalState.fileName) : leadImportModalState.fileName;
    bodyHtml = `
      <div style="padding:20px 0;">
        <div style="margin-bottom:18px;">
          <div style="font-size:13px; font-weight:600; color:#262626; margin-bottom:8px;">1. 选择导入模式</div>
          <div style="display:flex; gap:12px;">
            <label style="display:flex; align-items:center; gap:8px; padding:10px 16px; border:2px solid ${leadImportModalState.importType === 'new' ? '#1890ff' : '#e8e8e8'}; border-radius:6px; flex:1; cursor:pointer; background:${leadImportModalState.importType === 'new' ? '#e6f7ff' : '#fff'};">
              <input type="radio" name="modalImportType" value="new" ${leadImportModalState.importType === 'new' ? 'checked' : ''} onchange="leadImportModalState.importType='new';renderLeadImportModalContent();" style="accent-color:#1890ff;" />
              <div>
                <div style="font-weight:600; font-size:13px; color:#262626;">新增线索导入</div>
                <div style="font-size:12px; color:#8c8c8c;">新线索批量灌入，校验排重</div>
              </div>
            </label>
            <label style="display:flex; align-items:center; gap:8px; padding:10px 16px; border:2px solid ${leadImportModalState.importType === 'update' ? '#1890ff' : '#e8e8e8'}; border-radius:6px; flex:1; cursor:pointer; background:${leadImportModalState.importType === 'update' ? '#e6f7ff' : '#fff'};">
              <input type="radio" name="modalImportType" value="update" ${leadImportModalState.importType === 'update' ? 'checked' : ''} onchange="leadImportModalState.importType='update';renderLeadImportModalContent();" style="accent-color:#1890ff;" />
              <div>
                <div style="font-weight:600; font-size:13px; color:#262626;">增量更新导入</div>
                <div style="font-size:12px; color:#8c8c8c;">依据手机号更新意向车系与状态</div>
              </div>
            </label>
          </div>
        </div>

        <div style="margin-bottom:18px;">
          <div style="font-size:13px; font-weight:600; color:#262626; margin-bottom:8px;">2. 上传线索文件</div>
          <div style="border:2px dashed #d9d9d9; border-radius:8px; padding:36px 20px; text-align:center; background:#fafafa; cursor:pointer; transition:all .2s;" onclick="document.getElementById('modalLeadFileInput').click()">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1890ff" stroke-width="1.5" style="margin-bottom:8px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <div style="font-weight:600; color:#262626; font-size:14px; margin-bottom:4px;">点击或拖拽文件到此区域上传</div>
            <div style="color:#8c8c8c; font-size:12px;">支持 .xlsx、.xls、.csv 格式文件，单文件不超过 10MB</div>
            ${leadImportModalState.fileName ? `
              <div style="margin-top:12px; display:inline-flex; align-items:center; gap:6px; padding:6px 14px; background:#e6f7ff; color:#1890ff; border-radius:4px; font-size:13px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                已选择：<strong>${safeModalFileName}</strong> (${leadImportModalState.fileSize})
              </div>
            ` : ''}
          </div>
          <input type="file" id="modalLeadFileInput" accept=".xlsx,.xls,.csv" style="display:none;" onchange="handleModalLeadFileSelect(event)" />
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:12px 16px; font-size:12px; color:#64748b; line-height:1.6;">
          <strong>提示：</strong>请严格按照系统标准表头模板填写（必填项：客户姓名、手机号、意向车系、R渠道编码）。<a href="javascript:void(0)" onclick="downloadLeadTemplate()" style="color:#1890ff; margin-left:4px;">点此下载标准Excel模板</a>
        </div>
      </div>
    `;

    footerHtml = `
      <button class="btn-secondary" type="button" onclick="closeLeadImportModal()">取消</button>
      <button class="btn-primary" type="button" ${leadImportModalState.fileName ? '' : 'disabled'} onclick="goLeadImportModalStep2()">下一步：数据校验</button>
    `;
  } else if (step === 2) {
    bodyHtml = `
      <div style="padding:16px 0;">
        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; margin-bottom:16px;">
          <div style="background:#f0f7ff; padding:12px; border-radius:6px; text-align:center;">
            <div style="font-size:12px; color:#1890ff;">解析总行数</div>
            <div style="font-size:22px; font-weight:700; color:#1890ff; margin-top:2px;">${leadImportModalState.fileData.length}</div>
          </div>
          <div style="background:#f6ffed; padding:12px; border-radius:6px; text-align:center;">
            <div style="font-size:12px; color:#52c41a;">校验通过</div>
            <div style="font-size:22px; font-weight:700; color:#52c41a; margin-top:2px;">${leadImportModalState.validCount}</div>
          </div>
          <div style="background:#fffbe6; padding:12px; border-radius:6px; text-align:center;">
            <div style="font-size:12px; color:#faad14;">重复数据</div>
            <div style="font-size:22px; font-weight:700; color:#faad14; margin-top:2px;">${leadImportModalState.dupCount}</div>
          </div>
          <div style="background:#fff1f0; padding:12px; border-radius:6px; text-align:center;">
            <div style="font-size:12px; color:#ff4d4f;">校验失败</div>
            <div style="font-size:22px; font-weight:700; color:#ff4d4f; margin-top:2px;">${leadImportModalState.failCount}</div>
          </div>
        </div>

        <div style="font-size:13px; font-weight:600; margin-bottom:8px; color:#262626;">数据预览（前 6 行数据）</div>
        <div style="max-height:220px; overflow-y:auto; border:1px solid #f0f0f0; border-radius:6px;">
          <table class="data-table" style="margin:0; width:100%;">
            <thead>
              <tr style="background:#fafafa;">
                <th style="width:50px;">行号</th>
                <th>姓名</th>
                <th>手机号码</th>
                <th>意向车系</th>
                <th>R渠道</th>
                <th style="width:140px;">校验结果</th>
              </tr>
            </thead>
            <tbody>
              ${leadImportModalState.fileData.slice(0, 6).map(r => {
                const safeName = typeof escapeHtml === 'function' ? escapeHtml(r.name) : r.name;
                const safePhone = typeof escapeHtml === 'function' ? escapeHtml(r.phone) : r.phone;
                const safeSeries = typeof escapeHtml === 'function' ? escapeHtml(r.series) : r.series;
                const safeChannel = typeof escapeHtml === 'function' ? escapeHtml(r.channel) : r.channel;
                const safeError = typeof escapeHtml === 'function' ? escapeHtml(r.error) : r.error;
                return `
                  <tr style="${r.valid ? '' : 'background:#fff1f0;'}">
                    <td style="color:#8c8c8c;">${r.rowNo}</td>
                    <td>${safeName}</td>
                    <td style="font-family:monospace;">${safePhone}</td>
                    <td>${safeSeries}</td>
                    <td>${safeChannel}</td>
                    <td>
                      ${r.valid ? '<span style="color:#52c41a;">✔ 校验通过</span>' : `<span style="color:#ff4d4f; font-size:12px;">${safeError}</span>`}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div style="margin-top:16px;">
          <div style="font-size:13px; font-weight:600; color:#262626; margin-bottom:8px;">3. 导入后下发动作设置</div>
          <div style="display:flex; gap:12px;">
            <label style="display:flex; align-items:center; gap:6px; font-size:13px; cursor:pointer;">
              <input type="radio" name="modalDispatchAction" value="nev" ${leadImportModalState.dispatchAction === 'nev' ? 'checked' : ''} onchange="leadImportModalState.dispatchAction='nev'" style="accent-color:#1890ff;" />
              直接下发至 NEV 线索中台
            </label>
            <label style="display:flex; align-items:center; gap:6px; font-size:13px; cursor:pointer;">
              <input type="radio" name="modalDispatchAction" value="manual" ${leadImportModalState.dispatchAction === 'manual' ? 'checked' : ''} onchange="leadImportModalState.dispatchAction='manual'" style="accent-color:#1890ff;" />
              下发至 总部培育客服
            </label>
            <label style="display:flex; align-items:center; gap:6px; font-size:13px; cursor:pointer;">
              <input type="radio" name="modalDispatchAction" value="none" ${leadImportModalState.dispatchAction === 'none' ? 'checked' : ''} onchange="leadImportModalState.dispatchAction='none'" style="accent-color:#1890ff;" />
              仅导入暂不下发
            </label>
          </div>
        </div>
      </div>
    `;

    footerHtml = `
      <button class="btn-secondary" type="button" onclick="leadImportModalState.step=1;renderLeadImportModalContent();">上一步</button>
      <button class="btn-primary" type="button" onclick="confirmLeadImportExecute()">确认导入并执行</button>
    `;
  }

  container.innerHTML = `
    <div style="position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.5); z-index:1000; display:flex; align-items:center; justify-content:center;">
      <div style="background:#fff; width:680px; max-width:92vw; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,0.2); overflow:hidden; display:flex; flex-direction:column; max-height:88vh;">
        <div style="padding:16px 24px; border-bottom:1px solid #f0f0f0; display:flex; justify-content:space-between; align-items:center; background:#fafafa;">
          <div style="font-size:16px; font-weight:600; color:#262626;">线索批量导入</div>
          <button type="button" onclick="closeLeadImportModal()" style="border:none; background:none; font-size:20px; cursor:pointer; color:#8c8c8c;">&times;</button>
        </div>
        <div style="padding:16px 24px; overflow-y:auto; flex:1;">
          ${bodyHtml}
        </div>
        <div style="padding:12px 24px; border-top:1px solid #f0f0f0; display:flex; justify-content:flex-end; gap:8px; background:#fff;">
          ${footerHtml}
        </div>
      </div>
    </div>
  `;
}

function renderLeadImportModalSteps() {
  const steps = [['Step1', '上传文件'], ['Step2', '数据预览'], ['Step3', '导入完成']];
  return `<div class="assignment-import-steps">${steps.map((item, index) => {
    const stepNo = index + 1;
    const state = stepNo === leadImportModalState.step ? 'active' : stepNo < leadImportModalState.step ? 'done' : '';
    return `<div class="assignment-import-step ${state}"><div class="assignment-import-step-index">${item[0]}</div><div class="assignment-import-step-title">${item[1]}</div></div>`;
  }).join('')}</div>`;
}

function renderLeadImportModalUpload() {
  const selectedFile = leadImportModalState.fileName
    ? `已选择：${typeof escapeHtml === 'function' ? escapeHtml(leadImportModalState.fileName) : leadImportModalState.fileName}（${leadImportModalState.fileSize}）`
    : '';
  return `
    <div class="assignment-import-panel">
      <div class="assignment-import-tip">Step1 操作说明：下载模板了解格式要求 → 按模板填写 → 上传Excel文件。系统会按客户手机号进行唯一性校验；重复或校验失败的数据不会导入、不会下发。</div>
      <div class="action-btns"><button class="btn-secondary" type="button" onclick="downloadLeadTemplate()">导入模板</button></div>
      <label class="assignment-import-upload">
        <input id="modalLeadFileInput" type="file" accept=".xlsx,.xls,.csv" onchange="handleModalLeadFileSelect(event)" />
        <div><strong>上传Excel文件</strong><span>支持 .xlsx、.xls、.csv 文件，单文件不超过 10MB</span></div>
      </label>
      <div class="assignment-import-file">${selectedFile}</div>
    </div>
  `;
}

function renderLeadImportModalPreview() {
  const invalidCount = leadImportModalState.failCount + leadImportModalState.dupCount;
  const rows = leadImportModalState.fileData.slice(0, 6);
  return `
    <div class="assignment-import-panel">
      <div class="assignment-import-summary">
        <div class="assignment-import-stat"><div class="assignment-import-stat-label">解析总数</div><div class="assignment-import-stat-value">${leadImportModalState.fileData.length}</div></div>
        <div class="assignment-import-stat"><div class="assignment-import-stat-label">校验通过</div><div class="assignment-import-stat-value">${leadImportModalState.validCount}</div></div>
        <div class="assignment-import-stat"><div class="assignment-import-stat-label">异常或重复</div><div class="assignment-import-stat-value">${invalidCount}</div></div>
      </div>
      <div class="assignment-import-preview">
        <table class="data-table"><thead><tr><th style="width:64px">行号</th><th>姓名</th><th>手机号码</th><th>意向车系</th><th>R渠道</th><th style="width:180px">校验结果</th></tr></thead>
          <tbody>${rows.map(row => {
            const safe = value => typeof escapeHtml === 'function' ? escapeHtml(value) : value;
            return `<tr><td>${row.rowNo}</td><td>${safe(row.name)}</td><td>${safe(row.phone)}</td><td>${safe(row.series)}</td><td>${safe(row.channel)}</td><td>${row.valid ? '<span class="assignment-import-pass">通过</span>' : `<div class="assignment-import-error">${safe(row.error)}</div>`}</td></tr>`;
          }).join('')}</tbody>
        </table>
      </div>
      <div class="assignment-import-tip">下发设置：<label style="margin-left:10px"><input type="radio" name="modalDispatchAction" value="nev" ${leadImportModalState.dispatchAction === 'nev' ? 'checked' : ''} onchange="leadImportModalState.dispatchAction='nev'" /> 下发至 NEV 线索中台</label><label style="margin-left:14px"><input type="radio" name="modalDispatchAction" value="manual" ${leadImportModalState.dispatchAction === 'manual' ? 'checked' : ''} onchange="leadImportModalState.dispatchAction='manual'" /> 下发至总部培育客服</label><label style="margin-left:14px"><input type="radio" name="modalDispatchAction" value="none" ${leadImportModalState.dispatchAction === 'none' ? 'checked' : ''} onchange="leadImportModalState.dispatchAction='none'" /> 暂不下发</label></div>
    </div>
  `;
}

function renderLeadImportModalComplete() {
  const result = leadImportModalState.result || { total: 0, success: 0, failed: 0, target: '—' };
  return `<div class="assignment-import-complete"><div class="assignment-import-complete-title">导入完成</div><div class="assignment-import-complete-desc">成功 ${result.success} 条，异常或重复 ${result.failed} 条；成功数据已${result.target === '暂不下发' ? '导入并暂存' : '导入并完成下发'}。</div><div class="assignment-import-summary"><div class="assignment-import-stat"><div class="assignment-import-stat-label">解析总数</div><div class="assignment-import-stat-value">${result.total}</div></div><div class="assignment-import-stat"><div class="assignment-import-stat-label">成功导入</div><div class="assignment-import-stat-value">${result.success}</div></div><div class="assignment-import-stat"><div class="assignment-import-stat-label">异常或重复</div><div class="assignment-import-stat-value">${result.failed}</div></div></div></div>`;
}

function renderLeadImportModalContent() {
  const container = document.getElementById('leadImportModalContainer');
  if (!container) return;
  const step = leadImportModalState.step;
  const body = step === 1 ? renderLeadImportModalUpload() : step === 2 ? renderLeadImportModalPreview() : renderLeadImportModalComplete();
  const footer = step === 1
    ? `<button class="btn-cancel" type="button" onclick="closeLeadImportModal()">取消</button><button class="btn-save" type="button" ${leadImportModalState.fileName ? '' : 'disabled'} onclick="goLeadImportModalStep2()">下一步</button>`
    : step === 2
      ? `<button class="btn-cancel" type="button" onclick="leadImportModalState.step=1;renderLeadImportModalContent()">上一步</button><button class="btn-save" type="button" ${leadImportModalState.validCount ? '' : 'disabled'} onclick="confirmLeadImportExecute()">确认导入</button>`
      : `<button class="btn-save" type="button" onclick="finishLeadImportModal()">完成</button>`;
  container.innerHTML = `<div style="position:fixed;inset:0;background:rgba(15,23,42,.48);z-index:1000;display:flex;align-items:center;justify-content:center;"><div class="modal assignment-import-modal" style="max-height:88vh;display:flex;flex-direction:column;"><div class="modal-header"><div class="modal-title">导入数据</div><button class="modal-close" type="button" onclick="closeLeadImportModal()">×</button></div><div class="modal-body" style="overflow:auto;flex:1;">${renderLeadImportModalSteps()}${body}</div><div class="modal-footer">${footer}</div></div></div>`;
}

function finishLeadImportModal() {
  closeLeadImportModal();
  renderLeadImportPage();
}

/**
 * 文件选择事件
 */
function handleModalLeadFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  leadImportModalState.fileName = file.name;
  leadImportModalState.fileSize = (file.size / 1024 < 1024) ? (file.size / 1024).toFixed(1) + ' KB' : (file.size / (1024 * 1024)).toFixed(1) + ' MB';

  // 模拟解析 20~50 行数据
  const mockNames = ['周建华', '陈思颖', '张伟', '王晓峰', '李芳', '赵云', '杨帆', '刘欣', '黄宇', '孙磊'];
  const mockSeries = ['2026款探陆', 'N6', 'N7', 'NX8', '轩逸 超混电驱'];
  const mockChannels = ['R1-官网预约', 'R2-垂媒引流', 'R3-车展留资', 'R6-总部新媒体'];

  const rowCount = 28 + Math.floor(Math.random() * 20);
  const rows = [];
  let validCount = 0;
  let failCount = 0;
  let dupCount = 0;

  for (let i = 1; i <= rowCount; i++) {
    const isFail = Math.random() < 0.08;
    const isDup = !isFail && Math.random() < 0.05;

    let phone = '13' + Math.floor(100000000 + Math.random() * 900000000);
    let error = '';

    if (isFail) {
      if (Math.random() < 0.5) {
        phone = '120000';
        error = '手机号格式不正确';
      } else {
        error = '意向专营店未配置';
      }
      failCount++;
    } else if (isDup) {
      error = '手机号重复（已跳过）';
      dupCount++;
    } else {
      validCount++;
    }

    rows.push({
      rowNo: i,
      name: mockNames[Math.floor(Math.random() * mockNames.length)],
      phone: phone,
      series: mockSeries[Math.floor(Math.random() * mockSeries.length)],
      channel: mockChannels[Math.floor(Math.random() * mockChannels.length)],
      valid: !isFail && !isDup,
      isDup: isDup,
      error: error
    });
  }

  leadImportModalState.fileData = rows;
  leadImportModalState.validCount = validCount;
  leadImportModalState.failCount = failCount;
  leadImportModalState.dupCount = dupCount;

  renderLeadImportModalContent();
  showToast('文件已选中并完成初步校验', true);
}

/**
 * 步骤跳转
 */
function goLeadImportModalStep2() {
  leadImportModalState.step = 2;
  renderLeadImportModalContent();
}

/**
 * 确认导入执行
 */
function confirmLeadImportExecute() {
  const now = new Date();
  const timeStr = now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0') + ' ' +
    String(now.getHours()).padStart(2, '0') + ':' +
    String(now.getMinutes()).padStart(2, '0') + ':' +
    String(now.getSeconds()).padStart(2, '0');

  const total = leadImportModalState.fileData.length;
  const success = leadImportModalState.validCount;
  const fail = leadImportModalState.failCount + leadImportModalState.dupCount;

  const importResult = fail === 0 ? '全部成功' : success > 0 ? '部分成功' : '导入失败';

  let dispatchTargetStr = '下发到NEV线索中台';
  let dispatchResult = '全部下发';
  if (leadImportModalState.dispatchAction === 'manual') {
    dispatchTargetStr = '下发到总部培育客服';
    dispatchResult = '全部下发';
  } else if (leadImportModalState.dispatchAction === 'none') {
    dispatchTargetStr = '暂不下发';
    dispatchResult = '未下发';
  }

  const newRecord = {
    id: Date.now(),
    fileName: leadImportModalState.fileName || '批量线索导入表.xlsx',
    importResult: importResult,
    dispatchResult: dispatchResult,
    totalRows: total,
    successRows: success,
    failRows: fail,
    dispatchedRows: dispatchResult === '全部下发' ? success : 0,
    creatorAccount: 'admin_hq (总部管理员)',
    createTime: timeStr,
    dispatchTarget: dispatchTargetStr,
    fileSize: leadImportModalState.fileSize || '750 KB',
    failLogs: leadImportModalState.fileData.filter(r => !r.valid).map(r => ({
      rowNo: r.rowNo,
      phone: r.phone,
      name: r.name,
      error: r.error
    }))
  };

  leadImportList.unshift(newRecord);
  leadImportModalState.result = {
    total,
    success,
    failed: fail,
    target: dispatchTargetStr
  };
  leadImportModalState.step = 3;
  renderLeadImportModalContent();
  showToast(`导入完成：成功 ${success} 条，异常或重复 ${fail} 条`, true);
}

// 保持历史兼容别名
var showImportDetail = showLeadImportDetail;
var deleteImportHistory = deleteLeadImportRecord;
