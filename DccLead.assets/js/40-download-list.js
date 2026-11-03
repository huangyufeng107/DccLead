(function () {
  'use strict';

  // ==================== 40 号：下载列表（生产 download/index.jsx，统计报表-下载列表） ====================
  // 生产源码对齐要点（p__NEV__Sale__NEV__download__index chunk）：
  //   外层 div padding 16 + ProTable（toolBarRender: false 无工具栏按钮）
  //   列（6 列全 align center）：序号(index,60,跨页累计 (current-1)*pageSize+i+1)
  //     / 文件类型(logType,可搜索,request 异步 queryDownloadTypeLists → logTypeName/logTypeCode)
  //     / 创建人(creator,hideInSearch) / 提交时间(createdDate,dateRange 搜索,disabledDate 未来日期)
  //     / 状态(logStatus,hideInSearch,valueEnum 0失败error/1成功success/2进行中processing)
  //     / 下载(option,150,link button disabled:logStatus!==1,文本 record.filename)
  //   请求映射：createdDate[0]→startCreatedDate 00:00:00、createdDate[1]→endCreatedDate 23:59:59
  //   全量数据 + 前端分页（接口返回全量 rows，total=rows.length）
  //   分页：原型统一展示总数、每页条数、页码选择与前后翻页。

  // ==================== 确定性伪随机（与 34-39 号同源算法） ====================
  function nldRnd(seed) {
    var h = 5381;
    for (var i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) % 100003;
    var x = Math.sin(h + 1) * 10000;
    return x - Math.floor(x);
  }
  function nldInt(seed, min, max) { return Math.floor(nldRnd(seed) * (max - min + 1)) + min; }
  function nldPick(seed, arr) { return arr[Math.floor(nldRnd(seed) * arr.length) % arr.length]; }
  function nldPad2(n) { return (n < 10 ? '0' : '') + n; }
  function nldEsc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // ==================== 公共字典 ====================
  // 状态（对齐生产 valueEnum：text + status）
  var NLD_STATUS = { 0: '失败', 1: '成功', 2: '进行中' };
  var NLD_STATUS_DOT = { 0: '#ff4d4f', 1: '#52c41a', 2: '#1677ff' }; // antd Badge error/success/processing
  // 文件类型（生产 queryDownloadTypeLists 异步字典，对齐统计报表各导出场景；截图确认前两项）
  var NLD_TYPES = [
    { code: 1, name: 'NEV预外呼明细列表' },
    { code: 2, name: 'AI外呼任务明细' },
    { code: 3, name: '总部培育报表' },
    { code: 4, name: '总部NEV日报' },
    { code: 5, name: 'AI渠道质量日报' },
    { code: 6, name: '坐席业绩看板' },
    { code: 7, name: 'AI试驾排程效能看板' },
    { code: 8, name: '录音列表' },
    { code: 9, name: '异常情况日报' },
    { code: 10, name: '异常情况明细清单' }
  ];
  var NLD_CREATORS = ['黄裕烽', '陈思远', '刘雨欣', '王建国', '林嘉怡', '赵明轩', '孙晓雯', '周子涵'];

  // 近 60 天日期池（2026-08-21 ~ 2026-10-19，避免 Date 漂移保证确定性）
  var NLD_DAYS = (function () {
    var arr = [];
    var d = new Date(2026, 7, 21);
    for (var i = 0; i < 60; i++) {
      arr.push(d.getFullYear() + '-' + nldPad2(d.getMonth() + 1) + '-' + nldPad2(d.getDate()));
      d.setDate(d.getDate() + 1);
    }
    return arr;
  })();

  // ==================== 数据生成（固定 56 条，>50 触发条数切换器，按提交时间倒序） ====================
  var NLD_ROW_COUNT = 56;
  var NLD_ROWS = (function () {
    var rows = [];
    for (var i = 0; i < NLD_ROW_COUNT; i++) {
      var seed = 'nld-' + i;
      // 时间倒序：i 越大时间越早（首行最新）
      var day = NLD_DAYS[NLD_ROW_COUNT - 1 - i];
      var hh = nldInt(seed + 'hh', 8, 21);
      var mi = nldPad2(nldInt(seed + 'mi', 0, 59));
      var ss = nldPad2(nldInt(seed + 'ss', 0, 59));
      var ymd = day.replace(/-/g, '').slice(2); // YYMMDD
      var type = nldPick(seed + 'tp', NLD_TYPES.slice(0, 8));
      var tr = nldRnd(seed + 'st');
      var logStatus = tr < 0.12 ? 0 : tr < 0.24 ? 2 : 1; // 12% 失败 12% 进行中 76% 成功
      // 文件名（对齐截图两种生产格式）
      var filename;
      if (type.code === 1) filename = '预外呼明细列表_' + ymd + nldPad2(hh) + mi + '.xlsx';
      else if (type.code === 2) filename = 'AI外呼任务明细列表_' + ymd + '_' + nldPad2(hh) + mi + ss + '.xlsx';
      else filename = type.name + '_' + ymd + '_' + nldPad2(hh) + mi + ss + '.xlsx';
      rows.push({
        id: i + 1,
        logType: type.code,
        logTypeName: type.name,
        creator: nldPick(seed + 'cr', NLD_CREATORS),
        createdDate: day + ' ' + nldPad2(hh) + ':' + mi + ':' + ss,
        logStatus: logStatus,
        filename: filename
      });
    }
    return rows;
  })();

  // ==================== 页面状态 ====================
  var nldState = {
    rows: NLD_ROWS.slice(),
    filters: { logType: '', logStatus: '', createdDate: ['', ''] },
    page: 1,
    pageSize: 20,
    toastTimer: 0
  };

  function nldDefaultFilters() {
    return { logType: '', logStatus: '', createdDate: ['', ''] };
  }

  // ==================== 过滤逻辑（对齐生产 request 参数映射） ====================
  function nldQueryRows() {
    var f = nldState.filters;
    return nldState.rows.filter(function (r) {
      if (f.logType !== '' && r.logType !== +f.logType) return false;
      if (f.logStatus !== '' && r.logStatus !== +f.logStatus) return false;
      var day = r.createdDate.slice(0, 10);
      if (f.createdDate[0] && day < f.createdDate[0]) return false;
      if (f.createdDate[1] && day > f.createdDate[1]) return false;
      return true;
    });
  }

  // ==================== 样式注入（对齐 39 号 ProTable 复刻体系，前缀 nld-） ====================
  var nldStylesInited = false;
  function nldEnsureStyles() {
    if (nldStylesInited) return;
    nldStylesInited = true;
    var css = [
      '.nld-page{padding:16px;}',
      '.nld-card{background:#fff;border-radius:8px;padding:0 0 16px;}',
      /* 搜索区（ProTable search） */
      '.nld-search{display:flex;flex-wrap:wrap;gap:10px 18px;padding:18px 24px 4px;background:#fff;border-radius:8px 8px 0 0;}',
      '.nld-fi{display:flex;align-items:center;gap:8px;}',
      '.nld-label{font-size:14px;color:rgba(0,0,0,0.88);white-space:nowrap;}',
      '.nld-select,.nld-date{height:32px;border:1px solid #d9d9d9;border-radius:6px;padding:0 10px;font-size:14px;color:rgba(0,0,0,0.88);background:#fff;outline:none;box-sizing:border-box;}',
      '.nld-select:focus,.nld-date:focus{border-color:#4096ff;box-shadow:0 0 0 2px rgba(5,145,255,0.1);}',
      '.nld-search-actions{margin-left:auto;display:flex;align-items:center;padding-bottom:14px;}',
      /* 按钮（生产顺序：重置在左、查询在右，对齐截图） */
      '.nld-btn{height:32px;padding:0 15px;border-radius:6px;border:1px solid #d9d9d9;background:#fff;color:rgba(0,0,0,0.88);font-size:14px;cursor:pointer;transition:.2s;white-space:nowrap;}',
      '.nld-btn:hover{border-color:#4096ff;color:#4096ff;}',
      '.nld-btn-primary{background:#1677ff;border-color:#1677ff;color:#fff;}',
      '.nld-btn-primary:hover{background:#4096ff;border-color:#4096ff;color:#fff;}',
      /* 表格（6 列全居中） */
      '.nld-table-wrap{overflow-x:auto;padding:0 24px;}',
      '.nld-table{width:100%;border-collapse:collapse;font-size:14px;}',
      '.nld-table th{background:#fafafa;color:rgba(0,0,0,0.88);font-weight:600;height:44px;padding:8px 12px;text-align:center;border-bottom:1px solid #f0f0f0;white-space:nowrap;}',
      '.nld-table td{padding:10px 12px;text-align:center;border-bottom:1px solid #f0f0f0;color:rgba(0,0,0,0.88);white-space:nowrap;}',
      '.nld-table tbody tr:hover td{background:#fafafa;}',
      '.nld-empty-row td{padding:32px 0;color:rgba(0,0,0,0.25);font-size:14px;text-align:center;border-bottom:none;}',
      /* 状态列（antd Badge：圆点 + 文本） */
      '.nld-badge{display:inline-flex;align-items:center;gap:8px;font-size:14px;color:rgba(0,0,0,0.88);}',
      '.nld-badge-dot{width:6px;height:6px;border-radius:50%;flex:none;}',
      /* 下载列（antd link button，禁用置灰） */
      '.nld-dl-btn{border:none;background:none;color:#1677ff;font-size:14px;cursor:pointer;padding:0 4px;height:24px;}',
      '.nld-dl-btn:hover{color:#4096ff;}',
      '.nld-dl-btn[disabled]{cursor:not-allowed;color:rgba(0,0,0,0.25);}',
      '.nld-dl-btn[disabled]:hover{color:rgba(0,0,0,0.25);}',
      /* 分页（对齐截图：左「第 X-Y 条/总共 Z 条」+ 右页码，单页无箭头） */
      '.nld-pager{display:flex;align-items:center;justify-content:flex-end;gap:8px;padding:16px 24px 0;font-size:14px;color:rgba(0,0,0,0.88);}',
      '.nld-total{margin-right:auto;color:rgba(0,0,0,0.65);}',
      '.nld-page-btn{min-width:32px;height:32px;border-radius:6px;border:1px solid #d9d9d9;background:#fff;cursor:pointer;font-size:14px;color:rgba(0,0,0,0.88);transition:.2s;padding:0 6px;}',
      '.nld-page-btn:hover:not([disabled]):not(.on){border-color:#4096ff;color:#4096ff;}',
      '.nld-page-btn.on{border-color:#1677ff;color:#1677ff;}',
      '.nld-page-btn[disabled]{cursor:not-allowed;color:rgba(0,0,0,0.25);background:#f5f5f5;}',
      '.nld-size-changer{height:32px;border:1px solid #d9d9d9;border-radius:6px;padding:0 8px;font-size:14px;color:rgba(0,0,0,0.88);background:#fff;outline:none;}',
      /* toast（沿用 34-39 号体系） */
      '.nld-toast{position:fixed;top:24px;left:50%;transform:translateX(-50%);z-index:2200;background:#fff;border-radius:6px;box-shadow:0 6px 16px rgba(0,0,0,0.08),0 3px 6px -4px rgba(0,0,0,0.12),0 9px 28px 8px rgba(0,0,0,0.05);padding:9px 16px;font-size:14px;color:rgba(0,0,0,0.88);animation:nldToastIn .2s ease-out;}',
      '@keyframes nldToastIn{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%)}}'
    ].join('\n');
    var style = document.createElement('style');
    style.id = 'nldStyle';
    style.textContent = css;
    document.head.appendChild(style);
  }

  // ==================== 筛选区 ====================
  function nldFilterBarHtml() {
    var f = nldState.filters;
    var today = new Date();
    var todayStr = today.getFullYear() + '-' + nldPad2(today.getMonth() + 1) + '-' + nldPad2(today.getDate());
    return '<section class="nld-search" aria-label="筛选查询"><div class="nld-search-title">筛选查询</div><div class="nld-search-grid">' +
      '<label class="nld-fi"><span class="nld-label">文件类型</span><select class="nld-select" id="nldFType">' +
      '<option value=""' + (f.logType === '' ? ' selected' : '') + '>全部类型</option>' +
      NLD_TYPES.map(function (t) {
        return '<option value="' + t.code + '"' + (f.logType !== '' && +f.logType === t.code ? ' selected' : '') + '>' + nldEsc(t.name) + '</option>';
      }).join('') +
      '</select></label>' +
      '<label class="nld-fi"><span class="nld-label">状态</span><select class="nld-select" id="nldFStatus"><option value=""' + (f.logStatus === '' ? ' selected' : '') + '>全部状态</option><option value="1"' + (f.logStatus === '1' ? ' selected' : '') + '>成功</option><option value="2"' + (f.logStatus === '2' ? ' selected' : '') + '>进行中</option><option value="0"' + (f.logStatus === '0' ? ' selected' : '') + '>失败</option></select></label>' +
      '<div class="nld-fi"><span class="nld-label">提交时间</span><div class="nld-date-range">' +
      '<input class="nld-date" id="nldDateS" type="date" aria-label="开始日期" max="' + todayStr + '" value="' + nldEsc(f.createdDate[0]) + '" />' +
      '<span>至</span>' +
      '<input class="nld-date" id="nldDateE" type="date" aria-label="结束日期" max="' + todayStr + '" value="' + nldEsc(f.createdDate[1]) + '" /></div></div>' +
      '<div class="nld-search-actions">' +
      '<button class="nld-btn nld-btn-primary" type="button" id="nldQueryBtn">查询</button>' +
      '<button class="nld-btn" type="button" id="nldResetBtn">重置</button>' +
      '</div></div></section>';
  }

  // ==================== 表格（6 列全居中，对齐生产 columns；无工具栏） ====================
  function nldTableHtml() {
    var rows = nldQueryRows();
    var total = rows.length;
    var totalPages = Math.max(1, Math.ceil(total / nldState.pageSize));
    if (nldState.page > totalPages) nldState.page = totalPages;
    var start = (nldState.page - 1) * nldState.pageSize;
    var pageRows = rows.slice(start, start + nldState.pageSize);
    var html = '<div class="nld-table-wrap"><table class="nld-table"><thead><tr>' +
      '<th style="width:60px">序号</th>' +
      '<th style="min-width:190px">文件类型</th>' +
      '<th style="min-width:110px">创建人</th>' +
      '<th style="min-width:170px">提交时间</th>' +
      '<th style="min-width:100px">状态</th>' +
      '<th style="width:280px">下载</th>' +
      '</tr></thead><tbody>';
    if (!pageRows.length) {
      html += '<tr class="nld-empty-row"><td colspan="6">暂无数据</td></tr>';
    } else {
      pageRows.forEach(function (r, idx) {
        var ok = r.logStatus === 1;
        var typeObj = NLD_TYPES.filter(function (t) { return t.code === r.logType; })[0];
        // 序号跨页累计（生产 render：(current-1)*pageSize+i+1）
        html += '<tr>' +
          '<td>' + (start + idx + 1) + '</td>' +
          '<td>' + nldEsc(typeObj ? typeObj.name : r.logTypeName) + '</td>' +
          '<td>' + nldEsc(r.creator) + '</td>' +
          '<td>' + nldEsc(r.createdDate) + '</td>' +
          '<td><span class="nld-badge nld-status-' + r.logStatus + '"><span class="nld-badge-dot" style="background:' + NLD_STATUS_DOT[r.logStatus] + '"></span>' + nldEsc(NLD_STATUS[r.logStatus]) + '</span></td>' +
          '<td>' + (ok ? '<button type="button" class="nld-dl-btn" data-dl="' + r.id + '" title="下载示例文件：' + nldEsc(r.filename) + '">下载示例</button><span class="nld-filename" title="' + nldEsc(r.filename) + '">' + nldEsc(r.filename) + '</span>' : '<span class="nld-unavailable">' + (r.logStatus === 2 ? '生成中，暂不可下载' : '生成失败，无可下载文件') + '</span>') + '</td>' +
          '</tr>';
      });
    }
    html += '</tbody></table></div>';
    html += '<div class="nld-pager prototype-pagination"><span class="nld-total prototype-pagination-summary">共 ' + total + ' 条记录，当前第 ' + nldState.page + ' / ' + totalPages + ' 页</span><div class="prototype-pagination-controls">' +
      '<select class="nld-size-changer prototype-pagination-select" id="nldPageSize" aria-label="每页显示条数">' +
      [5, 10, 20, 50, 100].map(function (n) { return '<option value="' + n + '"' + (nldState.pageSize === n ? ' selected' : '') + '>每页 ' + n + ' 条</option>'; }).join('') + '</select>' +
      '<button type="button" class="nld-page-btn prototype-pagination-arrow" id="nldPrevPage" aria-label="上一页" ' + (nldState.page <= 1 ? 'disabled' : '') + '><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg></button>' +
      '<select class="prototype-pagination-select" id="nldPageSelect" aria-label="选择页码">' +
      Array.from({ length: totalPages }, function (_, index) { var p = index + 1; return '<option value="' + p + '"' + (p === nldState.page ? ' selected' : '') + '>第 ' + p + ' 页</option>'; }).join('') + '</select>' +
      '<button type="button" class="nld-page-btn prototype-pagination-arrow" id="nldNextPage" aria-label="下一页" ' + (nldState.page >= totalPages ? 'disabled' : '') + '><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></button></div></div>';
    return html;
  }

  // ==================== 提示（沿用 34-39 号 toast 体系） ====================
  function nldToast(text) {
    var old = document.getElementById('nldToast');
    if (old) old.remove();
    clearTimeout(nldState.toastTimer);
    var el = document.createElement('div');
    el.className = 'nld-toast';
    el.id = 'nldToast';
    el.textContent = text;
    document.body.appendChild(el);
    nldState.toastTimer = setTimeout(function () { if (el.parentNode) el.remove(); }, 2200);
  }

  // ==================== 主页面渲染（外层 padding 16，无工具栏） ====================
  function nldRenderPage() {
    var page = document.getElementById('opsDownloadListPage');
    if (!page) return;
    nldEnsureStyles();
    var success = nldState.rows.filter(function (row) { return row.logStatus === 1; }).length;
    var processing = nldState.rows.filter(function (row) { return row.logStatus === 2; }).length;
    var failed = nldState.rows.length - success - processing;
    page.innerHTML = '<div class="nld-page"><div class="page-hero nld-hero"><div><div class="page-title">下载列表</div><div class="page-desc">查看统计报表的导出任务、生成状态和提交时间。此原型提供可下载的示例表格。</div></div><div class="summary-strip"><div class="summary-card"><div class="summary-label">任务总数</div><div class="summary-value">' + nldState.rows.length + '</div></div><div class="summary-card"><div class="summary-label">成功</div><div class="summary-value nld-metric-success">' + success + '</div></div><div class="summary-card"><div class="summary-label">进行中</div><div class="summary-value nld-metric-processing">' + processing + '</div></div><div class="summary-card"><div class="summary-label">失败</div><div class="summary-value nld-metric-failed">' + failed + '</div></div></div></div>' + nldFilterBarHtml() + '<div class="nld-card"><div class="nld-list-heading">下载记录 <span id="nldResultCount">共 ' + nldQueryRows().length + ' 条</span><span class="nld-list-note">仅“成功”记录可下载示例文件</span></div>' + nldTableHtml() + '</div></div>';
    nldBindEvents(page);
  }

  // ==================== 主页面事件（委托） ====================
  function nldBindEvents(page) {
    if (page._nldBound) return;
    page._nldBound = true;
    page.addEventListener('click', function (e) {
      if (e.target.closest('#nldQueryBtn')) {
        if (!nldCollectFilters()) return;
        nldState.page = 1;
        nldRenderPage();
        return;
      }
      if (e.target.closest('#nldResetBtn')) {
        nldState.filters = nldDefaultFilters();
        nldState.page = 1;
        nldRenderPage();
        return;
      }
      if (e.target.closest('#nldPrevPage') && nldState.page > 1) {
        nldState.page--;
        nldRenderPage();
        return;
      }
      var totalPages = Math.max(1, Math.ceil(nldQueryRows().length / nldState.pageSize));
      if (e.target.closest('#nldNextPage') && nldState.page < totalPages) {
        nldState.page++;
        nldRenderPage();
        return;
      }
      var pb = e.target.closest('.nld-page-btn[data-page]');
      if (pb) {
        nldState.page = +pb.getAttribute('data-page');
        nldRenderPage();
        return;
      }
      var dl = e.target.closest('[data-dl]');
      if (dl && !dl.disabled) {
        nldDownloadExample(+dl.getAttribute('data-dl'));
      }
    });
    page.addEventListener('change', function (e) {
      if (e.target.id === 'nldPageSize') {
        nldState.pageSize = +e.target.value;
        nldState.page = 1;
        nldRenderPage();
        return;
      }
      if (e.target.id === 'nldPageSelect') {
        nldState.page = Math.min(Math.max(1, +e.target.value || 1), Math.max(1, Math.ceil(nldQueryRows().length / nldState.pageSize)));
        nldRenderPage();
        return;
      }
    });
  }

  function nldCollectFilters() {
    var dates = [
      (document.getElementById('nldDateS') || {}).value || '',
      (document.getElementById('nldDateE') || {}).value || ''
    ];
    if (dates[0] && dates[1] && dates[0] > dates[1]) { nldToast('开始日期不能晚于结束日期'); return false; }
    var tp = document.getElementById('nldFType');
    if (tp) nldState.filters.logType = tp.value;
    var status = document.getElementById('nldFStatus');
    if (status) nldState.filters.logStatus = status.value;
    nldState.filters.createdDate = dates;
    return true;
  }

  function nldDownloadExample(id) {
    var row = nldState.rows.find(function (item) { return item.id === id && item.logStatus === 1; });
    if (!row) return;
    var html = '<html><head><meta charset="utf-8"></head><body><h2>原型示例文件</h2><p>此文件仅用于演示下载交互，不含真实业务报表数据。</p><table border="1"><tr><th>文件类型</th><th>创建人</th><th>提交时间</th><th>状态</th><th>原任务文件名</th></tr><tr><td>' + nldEsc(row.logTypeName) + '</td><td>' + nldEsc(row.creator) + '</td><td>' + nldEsc(row.createdDate) + '</td><td>成功</td><td>' + nldEsc(row.filename) + '</td></tr></table></body></html>';
    var url = URL.createObjectURL(new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8' }));
    var link = document.createElement('a');
    link.href = url;
    link.download = /_示例\.xls$/i.test(row.filename) ? row.filename : row.filename.replace(/\.(xlsx|xls)$/i, '') + '_示例.xls';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    nldToast('示例表格已下载');
  }

  window.addPrototypeDownloadTask = function (typeName, dateFrom, dateTo) {
    var now = new Date();
    var createdDate = now.getFullYear() + '-' + nldPad2(now.getMonth() + 1) + '-' + nldPad2(now.getDate()) + ' ' + nldPad2(now.getHours()) + ':' + nldPad2(now.getMinutes()) + ':' + nldPad2(now.getSeconds());
    var nextId = nldState.rows.reduce(function (max, row) { return Math.max(max, row.id); }, 0) + 1;
    var type = NLD_TYPES.find(function (item) { return item.name === typeName; });
    nldState.rows.unshift({ id: nextId, logType: type ? type.code : 5, logTypeName: typeName, creator: '管理员', createdDate: createdDate, logStatus: 1, filename: typeName + '_' + dateFrom + '_' + dateTo + '_示例.xls' });
    nldState.page = 1;
    var page = document.getElementById('opsDownloadListPage');
    if (page && page.classList.contains('show')) nldRenderPage();
  };

  // ==================== 挂载入口（后加载覆盖 26 号旧版，30/31、23/39 号先例） ====================
  window.renderOpsDownloadListPage = nldRenderPage;

  // ==================== 初始化 ====================
  function init() {
    var page = document.getElementById('opsDownloadListPage');
    if (page && page.classList.contains('show')) {
      nldRenderPage();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
